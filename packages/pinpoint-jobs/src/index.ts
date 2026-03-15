export type {
  PinpointJob,
  PinpointLocation,
  CompanyJobs,
  FlatJob,
  DiscoverOptions,
  ScrapeAllOptions,
  ScrapeCompanyOptions,
  JobFilter,
  SearchQuery,
} from "./types.js";

export { filterResults, filterCompanyJobs, searchResults } from "./filters.js";
export { toJSON, toCSV, toTable, flattenJobs } from "./output.js";

import type {
  PinpointJob,
  PinpointLocation,
  CompanyJobs,
  DiscoverOptions,
  ScrapeAllOptions,
  ScrapeCompanyOptions,
  SearchQuery,
} from "./types.js";
import { searchResults } from "./filters.js";
import { ProxyAgent } from "undici";

let _proxyDispatcher: ProxyAgent | undefined;
function getProxyDispatcher(): ProxyAgent | undefined {
  if (_proxyDispatcher) return _proxyDispatcher;
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy;
  if (proxyUrl) {
    _proxyDispatcher = new ProxyAgent(proxyUrl);
  }
  return _proxyDispatcher;
}

const DEFAULT_SLUG_API_URL = "https://job-slugs.wd40.workers.dev/slugs/pinpoint";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Fetch with exponential backoff retry and per-request timeout.
 * Retries on 429, 5xx, timeouts, and network errors.
 * Does NOT retry 404 or 4xx (client errors).
 */
async function fetchWithRetry(
  url: string,
  options?: { retries?: number; baseDelay?: number; timeoutMs?: number }
): Promise<Response> {
  const retries = options?.retries ?? MAX_RETRIES;
  const baseDelay = options?.baseDelay ?? BASE_DELAY_MS;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), dispatcher: getProxyDispatcher() } as RequestInit);
      // Don't retry client errors (except 429)
      if (res.ok || (res.status >= 400 && res.status < 500 && res.status !== 429)) {
        return res;
      }
      // Retryable: 429 or 5xx
      if (attempt < retries) {
        const delay = res.status === 429
          ? baseDelay * Math.pow(2, attempt) * 2 // longer backoff for rate limits
          : baseDelay * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay + Math.random() * 500));
        continue;
      }
      return res; // exhausted retries, return last response
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < retries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay + Math.random() * 500));
        continue;
      }
    }
  }
  throw lastError ?? new Error(`fetchWithRetry failed for ${url}`);
}


/** Raw Pinpoint API job response */
interface RawPinpointJob {
  id: string;
  title: string;
  description: string;
  benefits?: string;
  benefits_header?: string;
  compensation: string | null;
  compensation_minimum: number | null;
  compensation_maximum: number | null;
  compensation_currency: string | null;
  compensation_frequency: string | null;
  compensation_visible: boolean;
  deadline_at: string | null;
  employment_type: string;
  employment_type_text: string;
  key_responsibilities?: string;
  key_responsibilities_header?: string;
  reporting_to: string | null;
  skills_knowledge_expertise?: string;
  skills_knowledge_expertise_header?: string;
  url: string;
  path: string;
  workplace_type: string;
  workplace_type_text: string;
  job: {
    id: string;
    requisition_id: string | null;
    department: {
      id: string;
      name: string;
    } | null;
    division: unknown;
    structure_custom_group_one: unknown;
  };
  location: {
    id: string;
    city: string;
    name: string;
    postal_code: string;
    province: string;
  };
}

/**
 * Parse a raw Pinpoint API job into our clean interface.
 */
function parseJob(raw: RawPinpointJob, includeContent: boolean): PinpointJob {
  const location: PinpointLocation = {
    id: raw.location?.id ?? "",
    city: raw.location?.city ?? "",
    name: raw.location?.name ?? "",
    postalCode: raw.location?.postal_code ?? "",
    province: raw.location?.province ?? "",
  };

  const job: PinpointJob = {
    id: raw.id,
    title: raw.title,
    description: "",
    location,
    department: raw.job?.department?.name ?? "",
    workplaceType: raw.workplace_type ?? "",
    workplaceTypeText: raw.workplace_type_text ?? "",
    employmentType: raw.employment_type ?? "",
    employmentTypeText: raw.employment_type_text ?? "",
    url: raw.url,
    path: raw.path,
    compensationVisible: raw.compensation_visible ?? false,
    compensationMin: raw.compensation_minimum ?? null,
    compensationMax: raw.compensation_maximum ?? null,
    compensationCurrency: raw.compensation_currency ?? null,
    compensationFrequency: raw.compensation_frequency ?? null,
    deadlineAt: raw.deadline_at ?? null,
    reportingTo: raw.reporting_to ?? null,
    requisitionId: raw.job?.requisition_id ?? null,
  };

  if (includeContent) {
    // Combine all HTML sections into content
    const sections: string[] = [];
    if (raw.description) sections.push(raw.description);
    if (raw.key_responsibilities) sections.push(raw.key_responsibilities);
    if (raw.skills_knowledge_expertise) sections.push(raw.skills_knowledge_expertise);
    if (raw.benefits) sections.push(raw.benefits);
    job.content = sections.join("\n");
    job.description = raw.description ?? "";
  }

  return job;
}

const INVALID_SLUGS = new Set([
  "embed", "api", "v1", "inclusion", "internal",
  "favicon.ico", "robots.txt", "sitemap.xml",
]);

function isValidSlug(slug: string): boolean {
  if (INVALID_SLUGS.has(slug)) return false;
  if (slug.includes(".")) return false;
  if (slug.length < 2 || slug.length > 80) return false;
  return true;
}

/**
 * Discover all company slugs from the slug API.
 *
 * Fetches a newline-delimited list of slugs from the Cloudflare Worker endpoint,
 * merges in any additional knownSlugs, and returns a sorted unique array.
 *
 * @param options - Discovery options
 * @returns Sorted array of unique company slugs
 */
export async function discoverSlugs(
  options?: DiscoverOptions
): Promise<string[]> {
  const knownSlugs = options?.knownSlugs ?? [];
  const onProgress = options?.onProgress;
  const slugApiUrl =
    options?.slugApiUrl ??
    process.env.SLUG_API_URL ??
    DEFAULT_SLUG_API_URL;

  onProgress?.(`Fetching slugs from ${slugApiUrl}...`);

  const apiSlugs: string[] = [];
  try {
    const res = await fetchWithRetry(slugApiUrl, { timeoutMs: DEFAULT_TIMEOUT_MS, retries: 2 });
    if (res.ok) {
      const text = await res.text();
      for (const line of text.split("\n")) {
        const slug = line.trim().toLowerCase();
        if (slug && isValidSlug(slug)) {
          apiSlugs.push(slug);
        }
      }
      onProgress?.(`Fetched ${apiSlugs.length} slugs from API`);
    } else {
      onProgress?.(`Slug API returned HTTP ${res.status}, falling back to knownSlugs only`);
    }
  } catch (e) {
    onProgress?.(`Slug API unreachable (${e}), falling back to knownSlugs only`);
  }

  const allSlugs = new Set<string>(apiSlugs);
  for (const s of knownSlugs) allSlugs.add(s);

  const sorted = [...allSlugs].sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  onProgress?.(`Total unique slugs: ${sorted.length}`);
  return sorted;
}

/**
 * Scrape a single company's job board.
 *
 * @param slug - The Pinpoint company slug
 * @param options - Scrape options
 * @returns CompanyJobs or null if not found / no listed jobs
 */
export async function scrapeCompany(
  slug: string,
  options?: ScrapeCompanyOptions
): Promise<CompanyJobs | null> {
  const includeContent = options?.includeContent ?? false;
  const url = `https://${encodeURIComponent(slug)}.pinpointhq.com/postings.json`;

  try {
    const res = await fetchWithRetry(url);
    if (res.status === 404) return null;
    if (!res.ok) return null;

    const data = await res.json() as { data?: RawPinpointJob[] };
    const rawJobs = data.data ?? [];

    if (rawJobs.length === 0) return null;

    const jobs: PinpointJob[] = rawJobs.map((j) => parseJob(j, includeContent));

    return {
      company: slug,
      slug,
      jobCount: jobs.length,
      jobs,
      scrapedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Scrape multiple companies concurrently.
 *
 * @param slugs - Array of company slugs to scrape
 * @param options - Scrape options including concurrency
 * @returns Array of CompanyJobs sorted by job count descending
 */
export async function scrapeAll(
  slugs: string[],
  options?: ScrapeAllOptions
): Promise<CompanyJobs[]> {
  const concurrency = options?.concurrency ?? 10;
  const onProgress = options?.onProgress;
  const includeContent = options?.includeContent ?? false;

  const results: CompanyJobs[] = [];
  let done = 0;
  let found = 0;
  const queue = [...slugs];

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const slug = queue.shift();
      if (!slug) break;

      const result = await scrapeCompany(slug, { includeContent });
      done++;

      if (result) {
        results.push(result);
        found++;
      }

      if (done % 50 === 0 || done === slugs.length) {
        onProgress?.(done, slugs.length, found);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  return results.sort((a, b) => b.jobCount - a.jobCount);
}

/**
 * Search and filter across scraped results.
 *
 * @param results - Previously scraped CompanyJobs array
 * @param query - Search query with text, filters, and limit
 * @returns Filtered CompanyJobs array
 */
export function searchJobs(
  results: CompanyJobs[],
  query: SearchQuery
): CompanyJobs[] {
  return searchResults(results, query.text, query.filters, query.limit);
}

// Re-export parseJob for testing
export { parseJob as _parseJob };
