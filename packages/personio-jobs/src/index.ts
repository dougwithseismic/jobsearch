export type {
  PersonioJob,
  PersonioJobDescription,
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
  PersonioJob,
  PersonioJobDescription,
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

const PERSONIO_BASE = "https://{slug}.jobs.personio.de/xml";
const DEFAULT_SLUG_API_URL = "https://job-slugs.wd40.workers.dev/slugs/personio";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Extract text content from a simple XML tag.
 * Returns empty string if tag not found.
 */
function getTagContent(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`);
  const match = xml.match(regex);
  if (!match?.[1]) return "";

  // Handle CDATA sections
  const cdataMatch = match[1].match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  if (cdataMatch) return cdataMatch[1] ?? "";

  return match[1].trim();
}

/**
 * Parse job descriptions from a position XML block.
 */
function parseJobDescriptions(positionXml: string): PersonioJobDescription[] {
  const descriptions: PersonioJobDescription[] = [];
  const descRegex = /<jobDescription>([\s\S]*?)<\/jobDescription>/g;
  let match: RegExpExecArray | null;

  while ((match = descRegex.exec(positionXml)) !== null) {
    const block = match[1] ?? "";
    const name = getTagContent(block, "name");
    const value = getTagContent(block, "value");
    descriptions.push({ name, value });
  }

  return descriptions;
}

/**
 * Parse Personio XML feed into PersonioJob[].
 *
 * @param xml - Raw XML string from the Personio feed
 * @returns Array of parsed job objects
 */
export function parseXml(xml: string): PersonioJob[] {
  const jobs: PersonioJob[] = [];
  const positionRegex = /<position>([\s\S]*?)<\/position>/g;
  let match: RegExpExecArray | null;

  while ((match = positionRegex.exec(xml)) !== null) {
    const block = match[1] ?? "";

    const idStr = getTagContent(block, "id");
    const id = parseInt(idStr, 10);
    if (isNaN(id)) continue;

    const jobDescriptions = parseJobDescriptions(block);

    jobs.push({
      id,
      name: getTagContent(block, "name"),
      department: getTagContent(block, "department"),
      office: getTagContent(block, "office"),
      recruitingCategory: getTagContent(block, "recruitingCategory"),
      employmentType: getTagContent(block, "employmentType"),
      seniority: getTagContent(block, "seniority"),
      schedule: getTagContent(block, "schedule"),
      yearsOfExperience: getTagContent(block, "yearsOfExperience"),
      keywords: getTagContent(block, "keywords"),
      occupation: getTagContent(block, "occupation"),
      occupationCategory: getTagContent(block, "occupationCategory"),
      createdAt: getTagContent(block, "createdAt"),
      jobDescriptions,
    });
  }

  return jobs;
}

/**
 * Strip job descriptions from parsed jobs (when includeContent is false).
 */
function stripDescriptions(job: PersonioJob): PersonioJob {
  return { ...job, jobDescriptions: [] };
}

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

const INVALID_SLUGS = new Set([
  "www", "api", "static", "cdn", "assets",
  "favicon.ico", "robots.txt", "sitemap.xml",
]);

function isValidSlug(slug: string): boolean {
  if (INVALID_SLUGS.has(slug)) return false;
  if (slug.includes(".")) return false;
  if (slug.length < 2 || slug.length > 80) return false;
  return true;
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

/**
 * Scrape a single company's Personio job board.
 *
 * @param slug - The Personio company subdomain
 * @param options - Scrape options
 * @returns CompanyJobs or null if not found / no listed jobs
 */
export async function scrapeCompany(
  slug: string,
  options?: ScrapeCompanyOptions
): Promise<CompanyJobs | null> {
  const includeContent = options?.includeContent ?? false;
  const language = options?.language ?? "en";
  const url = PERSONIO_BASE.replace("{slug}", encodeURIComponent(slug)) +
    `?language=${encodeURIComponent(language)}`;

  try {
    const res = await fetchWithRetry(url);
    if (res.status === 404) return null;
    if (!res.ok) return null;

    const xml = await res.text();
    let jobs = parseXml(xml);

    if (jobs.length === 0) return null;

    if (!includeContent) {
      jobs = jobs.map(stripDescriptions);
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
 * Scrape multiple companies concurrently with rate limiting.
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
  const includeContent = options?.includeContent ?? false;
  const language = options?.language ?? "en";

  const results: CompanyJobs[] = [];
  let done = 0;
  let found = 0;
  const queue = [...slugs];

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const slug = queue.shift();
      if (!slug) break;

      const result = await scrapeCompany(slug, { includeContent, language });
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

// Re-export for testing
export { parseXml as _parseXml, getTagContent as _getTagContent, isValidSlug as _isValidSlug };
