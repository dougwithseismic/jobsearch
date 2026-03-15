export type {
  DoverJob,
  DoverLocation,
  DoverCompensation,
  DoverCareersPage,
  CompanyJobs,
  FlatJob,
  ScrapeAllOptions,
  ScrapeCompanyOptions,
  JobFilter,
  SearchQuery,
} from "./types.js";

export { filterResults, filterCompanyJobs, searchResults } from "./filters.js";
export { toJSON, toCSV, toTable, flattenJobs } from "./output.js";

import type {
  DoverJob,
  DoverCareersPage,
  CompanyJobs,
  ScrapeAllOptions,
  ScrapeCompanyOptions,
  SearchQuery,
} from "./types.js";
import { searchResults } from "./filters.js";
import { ProxyAgent } from "undici";

let _proxyDispatcher: ProxyAgent | undefined;
function getProxyDispatcher(): ProxyAgent | undefined {
  if (_proxyDispatcher) return _proxyDispatcher;
  const proxyUrl =
    process.env.HTTPS_PROXY ||
    process.env.HTTP_PROXY ||
    process.env.https_proxy ||
    process.env.http_proxy;
  if (proxyUrl) {
    _proxyDispatcher = new ProxyAgent(proxyUrl);
  }
  return _proxyDispatcher;
}

const DOVER_API = "https://app.dover.com/api/v1";

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
      const res = await fetch(url, {
        signal: AbortSignal.timeout(timeoutMs),
        dispatcher: getProxyDispatcher(),
      } as RequestInit);
      // Don't retry client errors (except 429)
      if (res.ok || (res.status >= 400 && res.status < 500 && res.status !== 429)) {
        return res;
      }
      // Retryable: 429 or 5xx
      if (attempt < retries) {
        const delay =
          res.status === 429
            ? baseDelay * Math.pow(2, attempt) * 2
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

/**
 * Resolve a company slug to a careers page UUID.
 *
 * @param slug - The Dover careers page slug (e.g. "dover")
 * @returns DoverCareersPage or null if not found
 */
export async function resolveSlug(slug: string): Promise<DoverCareersPage | null> {
  const url = `${DOVER_API}/careers-page-slug/${encodeURIComponent(slug)}`;

  try {
    const res = await fetchWithRetry(url);
    if (!res.ok) return null;

    const data = (await res.json()) as { id?: string; name?: string; slug?: string };
    if (!data.id) return null;

    return {
      id: data.id,
      name: data.name ?? slug,
      slug: data.slug ?? slug,
    };
  } catch {
    return null;
  }
}

/** Raw job list response from Dover API */
interface RawJobListResponse {
  count?: number;
  results?: RawJobListItem[];
}

interface RawJobListItem {
  id: string;
  title: string;
  locations?: {
    location_type?: string;
    location_option?: {
      id?: string;
      display_name?: string;
      location_type?: string;
      city?: string;
      state?: string;
      country?: string;
    };
    name?: string;
  }[];
  is_published?: boolean;
  is_sample?: boolean;
}

/** Raw job detail response from Dover API */
interface RawJobDetail {
  id?: string;
  title?: string;
  user_provided_description?: string;
  compensation?: {
    upper_bound?: number | null;
    lower_bound?: number | null;
    currency?: string | null;
    equity_upper?: number | null;
    equity_lower?: number | null;
    salary_type?: string | null;
    employment_type?: string | null;
  } | null;
  visa_support?: boolean | null;
  created?: string | null;
}

/**
 * List jobs for a careers page by UUID.
 *
 * @param careersPageId - UUID from resolveSlug
 * @param limit - Max jobs to fetch. Default: 300
 * @returns Array of DoverJob (without details)
 */
export async function listJobs(
  careersPageId: string,
  limit = 300
): Promise<DoverJob[]> {
  const url = `${DOVER_API}/careers-page/${encodeURIComponent(careersPageId)}/jobs?limit=${limit}`;

  try {
    const res = await fetchWithRetry(url);
    if (!res.ok) return [];

    const data = (await res.json()) as RawJobListResponse;
    const results = data.results ?? [];

    return results
      .filter((j) => j.is_published !== false && j.is_sample !== true)
      .map((j) => ({
        id: j.id,
        title: j.title,
        locations: j.locations ?? [],
        is_published: j.is_published,
        is_sample: j.is_sample,
      }));
  } catch {
    return [];
  }
}

/**
 * Fetch full details for a single job.
 *
 * @param jobId - The Dover job ID (UUID)
 * @returns Enriched fields or null
 */
export async function fetchJobDetail(
  jobId: string
): Promise<{ description?: string; compensation?: DoverJob["compensation"]; visa_support?: boolean | null; created?: string | null } | null> {
  const url = `${DOVER_API}/inbound/application-portal-job/${encodeURIComponent(jobId)}`;

  try {
    const res = await fetchWithRetry(url);
    if (!res.ok) return null;

    const data = (await res.json()) as RawJobDetail;
    return {
      description: data.user_provided_description ?? undefined,
      compensation: data.compensation ?? null,
      visa_support: data.visa_support ?? null,
      created: data.created ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Scrape a single company's job board.
 *
 * Flow: slug -> resolveSlug (UUID) -> listJobs -> optionally fetchJobDetail for each
 *
 * @param slug - The Dover careers page slug
 * @param options - Scrape options
 * @returns CompanyJobs or null if not found / no listed jobs
 */
export async function scrapeCompany(
  slug: string,
  options?: ScrapeCompanyOptions
): Promise<CompanyJobs | null> {
  const includeDetails = options?.includeDetails ?? false;
  const limit = options?.limit ?? 300;

  // Step 1: Resolve slug to UUID
  const page = await resolveSlug(slug);
  if (!page) return null;

  // Step 2: List jobs
  const jobs = await listJobs(page.id, limit);
  if (jobs.length === 0) return null;

  // Step 3: Optionally enrich with details
  if (includeDetails) {
    for (const job of jobs) {
      const detail = await fetchJobDetail(job.id);
      if (detail) {
        job.description = detail.description;
        job.compensation = detail.compensation;
        job.visa_support = detail.visa_support;
        job.created = detail.created;
      }
    }
  }

  return {
    company: page.name,
    slug: page.slug,
    careersPageId: page.id,
    jobCount: jobs.length,
    jobs,
    scrapedAt: new Date().toISOString(),
  };
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
  const concurrency = options?.concurrency ?? 5;
  const onProgress = options?.onProgress;
  const includeDetails = options?.includeDetails ?? false;

  const results: CompanyJobs[] = [];
  let done = 0;
  let found = 0;
  const queue = [...slugs];

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const slug = queue.shift();
      if (!slug) break;

      const result = await scrapeCompany(slug, { includeDetails });
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

// Re-export internals for testing
export { resolveSlug as _resolveSlug, listJobs as _listJobs, fetchJobDetail as _fetchJobDetail };
