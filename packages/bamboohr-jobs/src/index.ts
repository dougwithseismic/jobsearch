export type {
  BambooHRJob,
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
  BambooHRJob,
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

const BAMBOOHR_BASE = "https://{company}.bamboohr.com/careers";
const DEFAULT_SLUG_API_URL = "https://job-slugs.wd40.workers.dev/slugs/bamboohr";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Fetch with exponential backoff retry and per-request timeout.
 * Retries on 429, 5xx, timeouts, and network errors.
 * Does NOT retry 404, 302 or other 4xx (client errors).
 */
async function fetchWithRetry(
  url: string,
  options?: { retries?: number; baseDelay?: number; timeoutMs?: number; redirect?: RequestRedirect }
): Promise<Response> {
  const retries = options?.retries ?? MAX_RETRIES;
  const baseDelay = options?.baseDelay ?? BASE_DELAY_MS;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(timeoutMs),
        redirect: options?.redirect ?? "manual",
        dispatcher: getProxyDispatcher(),
      } as RequestInit);
      // Don't retry client errors (except 429)
      if (res.ok || (res.status >= 300 && res.status < 500 && res.status !== 429)) {
        return res;
      }
      // Retryable: 429 or 5xx
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

/** Raw BambooHR list API response */
interface RawListResponse {
  meta: { totalCount: number };
  result: RawBambooHRJob[];
}

/** Raw BambooHR detail API response */
interface RawDetailResponse {
  meta: Record<string, unknown>;
  result: {
    jobOpening: RawBambooHRJobDetail;
  };
}

interface RawBambooHRJob {
  id: string;
  jobOpeningName: string;
  departmentId: string;
  departmentLabel: string;
  employmentStatusLabel: string;
  location: {
    city: string;
    state: string;
  };
  atsLocation?: {
    country: string | null;
    state: string | null;
    province?: string | null;
    city: string | null;
  };
  isRemote: boolean | null;
  locationType: string;
}

interface RawBambooHRJobDetail extends RawBambooHRJob {
  jobOpeningShareUrl: string;
  description: string;
  compensation?: string | null;
  datePosted?: string;
  minimumExperience?: string | null;
  location: {
    city: string;
    state: string;
    postalCode?: string;
    addressCountry?: string;
  };
}

/**
 * Parse a raw BambooHR list job into our clean interface.
 */
function parseListJob(raw: RawBambooHRJob): BambooHRJob {
  return {
    id: raw.id,
    jobOpeningName: raw.jobOpeningName,
    departmentId: raw.departmentId,
    departmentLabel: raw.departmentLabel,
    employmentStatusLabel: raw.employmentStatusLabel,
    location: {
      city: raw.location?.city ?? "",
      state: raw.location?.state ?? "",
    },
    atsLocation: raw.atsLocation,
    isRemote: raw.isRemote,
    locationType: raw.locationType,
  };
}

/**
 * Parse a raw BambooHR detail response into our clean interface.
 */
function parseDetailJob(raw: RawBambooHRJobDetail): BambooHRJob {
  return {
    id: raw.id,
    jobOpeningName: raw.jobOpeningName,
    departmentId: raw.departmentId,
    departmentLabel: raw.departmentLabel,
    employmentStatusLabel: raw.employmentStatusLabel,
    location: {
      city: raw.location?.city ?? "",
      state: raw.location?.state ?? "",
      postalCode: raw.location?.postalCode,
      addressCountry: raw.location?.addressCountry,
    },
    atsLocation: raw.atsLocation,
    isRemote: raw.isRemote,
    locationType: raw.locationType,
    description: raw.description,
    jobOpeningShareUrl: raw.jobOpeningShareUrl,
    compensation: raw.compensation,
    datePosted: raw.datePosted,
    minimumExperience: raw.minimumExperience,
  };
}

const INVALID_SLUGS = new Set([
  "www", "api", "app", "login", "admin", "support",
  "favicon.ico", "robots.txt", "sitemap.xml",
]);

function isValidSlug(slug: string): boolean {
  if (INVALID_SLUGS.has(slug)) return false;
  if (slug.includes(".")) return false;
  if (slug.length < 2 || slug.length > 80) return false;
  return true;
}

/**
 * Build the careers list URL for a company.
 */
function listUrl(slug: string): string {
  return BAMBOOHR_BASE.replace("{company}", encodeURIComponent(slug)) + "/list";
}

/**
 * Build the careers detail URL for a specific job.
 */
function detailUrl(slug: string, jobId: string): string {
  return BAMBOOHR_BASE.replace("{company}", encodeURIComponent(slug)) + `/${encodeURIComponent(jobId)}/detail`;
}

/**
 * Discover all company slugs from the slug API.
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
    const res = await fetchWithRetry(slugApiUrl, { timeoutMs: DEFAULT_TIMEOUT_MS, retries: 2, redirect: "follow" });
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
 * Scrape a single company's BambooHR job board.
 *
 * @param slug - The BambooHR company subdomain
 * @param options - Scrape options
 * @returns CompanyJobs or null if not found / no listed jobs
 */
export async function scrapeCompany(
  slug: string,
  options?: ScrapeCompanyOptions
): Promise<CompanyJobs | null> {
  const includeContent = options?.includeContent ?? false;
  const url = listUrl(slug);

  try {
    const res = await fetchWithRetry(url);

    // 302 redirect means company doesn't exist or no careers page
    if (res.status === 302 || res.status === 301) return null;
    if (!res.ok) return null;

    const data = await res.json() as RawListResponse;
    const rawJobs = data.result ?? [];

    if (rawJobs.length === 0) return null;

    let jobs: BambooHRJob[];

    if (includeContent) {
      // Fetch detail for each job to get description
      jobs = await Promise.all(
        rawJobs.map(async (raw) => {
          try {
            const dUrl = detailUrl(slug, raw.id);
            const dRes = await fetchWithRetry(dUrl, { redirect: "manual" });
            if (dRes.ok) {
              const detail = await dRes.json() as RawDetailResponse;
              return parseDetailJob(detail.result.jobOpening);
            }
          } catch {
            // Fall back to list data on detail fetch failure
          }
          return parseListJob(raw);
        })
      );
    } else {
      jobs = rawJobs.map((j) => parseListJob(j));
    }

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
 */
export function searchJobs(
  results: CompanyJobs[],
  query: SearchQuery
): CompanyJobs[] {
  return searchResults(results, query.text, query.filters, query.limit);
}

// Re-export parseListJob and parseDetailJob for testing
export { parseListJob as _parseListJob, parseDetailJob as _parseDetailJob };
