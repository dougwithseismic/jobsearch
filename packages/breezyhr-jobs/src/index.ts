export type {
  BreezyJob,
  BreezyLocation,
  BreezyLocationEntry,
  BreezyCompanyInfo,
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
  BreezyJob,
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

const DEFAULT_SLUG_API_URL = "https://job-slugs.wd40.workers.dev/slugs/breezyhr";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const DEFAULT_TIMEOUT_MS = 30_000;

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
      if (res.ok || (res.status >= 400 && res.status < 500 && res.status !== 429)) {
        return res;
      }
      if (attempt < retries) {
        const delay = res.status === 429
          ? baseDelay * Math.pow(2, attempt) * 2
          : baseDelay * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay + Math.random() * 500));
        continue;
      }
      return res;
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


/** Raw BreezyHR API job response */
interface RawBreezyJob {
  id: string;
  friendly_id: string;
  name: string;
  url: string;
  published_date: string;
  type: { id: string; name: string };
  location: {
    country: { name: string; id: string } | null;
    state: { id: string; name: string } | null;
    city: string;
    primary: boolean;
    is_remote: boolean;
    name: string;
  };
  department: string;
  salary: string;
  company: {
    name: string;
    logo_url: string | null;
    friendly_id: string;
    isMultipleLocationsEnabled: boolean;
  };
  locations: {
    country: { name: string; id: string } | null;
    countryCode: string;
    city: string;
    region: string;
    hidden: boolean;
  }[];
}

/**
 * Parse a raw BreezyHR API job into our clean interface.
 */
function parseJob(raw: RawBreezyJob): BreezyJob {
  return {
    id: raw.id ?? "",
    friendlyId: raw.friendly_id ?? "",
    name: raw.name ?? "",
    url: raw.url ?? "",
    publishedDate: raw.published_date ?? "",
    type: raw.type ?? { id: "", name: "" },
    location: {
      country: raw.location?.country ?? null,
      state: raw.location?.state ?? null,
      city: raw.location?.city ?? "",
      primary: raw.location?.primary ?? true,
      isRemote: raw.location?.is_remote ?? false,
      name: raw.location?.name ?? "",
    },
    department: raw.department ?? "",
    salary: raw.salary ?? "",
    company: {
      name: raw.company?.name ?? "",
      logoUrl: raw.company?.logo_url ?? null,
      friendlyId: raw.company?.friendly_id ?? "",
      isMultipleLocationsEnabled: raw.company?.isMultipleLocationsEnabled ?? false,
    },
    locations: (raw.locations ?? []).map((loc) => ({
      country: loc.country ?? null,
      countryCode: loc.countryCode ?? "",
      city: loc.city ?? "",
      region: loc.region ?? "",
      hidden: loc.hidden ?? false,
    })),
  };
}

const INVALID_SLUGS = new Set([
  "www", "app", "api", "help", "support", "blog",
  "docs", "status", "mail", "cdn", "static",
]);

function isValidSlug(slug: string): boolean {
  if (INVALID_SLUGS.has(slug)) return false;
  if (slug.includes(".")) return false;
  if (slug.length < 2 || slug.length > 80) return false;
  return true;
}

/**
 * Discover all company slugs (subdomains) from the slug API.
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
 * @param slug - The BreezyHR company subdomain
 * @param _options - Scrape options (reserved for future use)
 * @returns CompanyJobs or null if not found / no listed jobs / non-JSON response
 */
export async function scrapeCompany(
  slug: string,
  _options?: ScrapeCompanyOptions
): Promise<CompanyJobs | null> {
  const url = `https://${encodeURIComponent(slug)}.breezy.hr/json`;

  try {
    const res = await fetchWithRetry(url);
    if (res.status === 404) return null;
    if (!res.ok) return null;

    // Some companies redirect to custom career sites returning HTML
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType && !contentType.includes("json")) {
      return null;
    }

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      // Response body is not valid JSON (e.g. HTML redirect)
      return null;
    }

    if (!Array.isArray(data)) return null;

    const rawJobs = data as RawBreezyJob[];
    if (rawJobs.length === 0) return null;

    const jobs: BreezyJob[] = rawJobs.map((j) => parseJob(j));

    // Use the company name from the first job if available
    const companyName = jobs[0]?.company?.name || slug;

    return {
      company: companyName,
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

  const results: CompanyJobs[] = [];
  let done = 0;
  let found = 0;
  const queue = [...slugs];

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const slug = queue.shift();
      if (!slug) break;

      const result = await scrapeCompany(slug);
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
