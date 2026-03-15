export type {
  WorkableJob,
  WorkableLocation,
  WorkableRawJob,
  WorkableRawLocation,
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
  WorkableRawJob,
  WorkableJob,
  WorkableLocation,
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

const DEFAULT_SLUG_API_URL = "https://job-slugs.wd40.workers.dev/slugs/workable";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const DEFAULT_TIMEOUT_MS = 30_000;

async function fetchWithRetry(
  url: string,
  options?: { retries?: number; baseDelay?: number; timeoutMs?: number; method?: string; body?: string; headers?: Record<string, string> }
): Promise<Response> {
  const retries = options?.retries ?? MAX_RETRIES;
  const baseDelay = options?.baseDelay ?? BASE_DELAY_MS;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const fetchOpts: RequestInit = { signal: AbortSignal.timeout(timeoutMs) };
      if (options?.method) fetchOpts.method = options.method;
      if (options?.body) fetchOpts.body = options.body;
      if (options?.headers) fetchOpts.headers = options.headers;
      (fetchOpts as Record<string, unknown>).dispatcher = getProxyDispatcher();
      const res = await fetch(url, fetchOpts);
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

const WORKABLE_API = "https://apply.workable.com/api/v3/accounts";

const INVALID_SLUGS = new Set([
  "j", "api", "static", "favicon.ico", "robots.txt",
  "sitemap.xml", "sitemap", "css", "js", "images", "assets",
]);

function isValidSlug(slug: string): boolean {
  if (INVALID_SLUGS.has(slug)) return false;
  if (slug.includes(".")) return false;
  if (slug.length < 2 || slug.length > 80) return false;
  return true;
}

/**
 * Map a raw Workable v3 job to our clean interface.
 */
function mapJob(
  raw: WorkableRawJob,
  slug: string,
): WorkableJob {
  const locations: WorkableLocation[] = (raw.locations ?? [])
    .filter((l) => !l.hidden)
    .map((l) => ({
      country: l.country,
      countryCode: l.countryCode,
      city: l.city,
      region: l.region,
    }));

  const loc = raw.location ?? {};

  const job: WorkableJob = {
    shortcode: raw.shortcode,
    title: raw.title,
    department: (raw.department ?? []).join(", "),
    employmentType: raw.type ?? "",
    isRemote: raw.remote ?? false,
    country: loc.country ?? "",
    city: loc.city ?? "",
    state: loc.region ?? "",
    locations,
    experience: "",
    industry: "",
    publishedAt: raw.published ?? "",
    createdAt: raw.published ?? "",
    jobUrl: `https://apply.workable.com/${encodeURIComponent(slug)}/j/${raw.shortcode}/`,
    applyUrl: `https://apply.workable.com/${encodeURIComponent(slug)}/j/${raw.shortcode}/apply/`,
  };

  return job;
}

/**
 * Discover all company slugs (board tokens) from the slug API.
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

/** v3 API response */
interface V3Response {
  total: number;
  results: WorkableRawJob[];
  nextPage?: string | null;
}

/**
 * Scrape a single company's job board via Workable v3 API.
 *
 * @param slug - The Workable job board slug
 * @param _options - Scrape options
 * @returns CompanyJobs or null if not found / no listed jobs
 */
export async function scrapeCompany(
  slug: string,
  _options?: ScrapeCompanyOptions
): Promise<CompanyJobs | null> {
  const url = `${WORKABLE_API}/${encodeURIComponent(slug)}/jobs`;
  const allJobs: WorkableJob[] = [];
  let token = "";

  try {
    while (true) {
      const body = JSON.stringify({ query: "", token });
      const res = await fetchWithRetry(url, {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 404) return null;
      if (!res.ok) return null;

      const text = await res.text();
      if (text === "Not Found") return null;

      const data = JSON.parse(text) as V3Response;

      if (data.total === 0 && allJobs.length === 0) return null;

      for (const raw of data.results ?? []) {
        allJobs.push(mapJob(raw, slug));
      }

      if (!data.nextPage) break;
      token = data.nextPage;
    }

    if (allJobs.length === 0) return null;

    return {
      company: slug,
      slug,
      jobCount: allJobs.length,
      jobs: allJobs,
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
