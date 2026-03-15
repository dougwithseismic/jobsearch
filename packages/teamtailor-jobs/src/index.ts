export type {
  TeamtailorJob,
  TeamtailorLocation,
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
  TeamtailorJob,
  TeamtailorLocation,
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

const DEFAULT_SLUG_API_URL = "https://job-slugs.wd40.workers.dev/slugs/teamtailor";
const PER_PAGE = 200;

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

// --- RSS XML parsing with regex ---

/**
 * Extract text content from an XML tag using regex.
 * Returns empty string if tag not found.
 */
function xmlTag(xml: string, tag: string): string {
  // Try CDATA first, then plain content
  const cdataRe = new RegExp(`<${tag}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, "i");
  const cdataMatch = xml.match(cdataRe);
  if (cdataMatch) return cdataMatch[1]!.trim();

  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = xml.match(re);
  return match ? match[1]!.trim() : "";
}

/**
 * Extract all occurrences of an XML tag.
 */
function xmlTagAll(xml: string, tag: string): string[] {
  const results: string[] = [];
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "gi");
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) {
    results.push(match[1]!.trim());
  }
  return results;
}

/**
 * Parse a single RSS <item> into a TeamtailorJob.
 */
function parseItem(itemXml: string, includeContent: boolean): TeamtailorJob {
  const title = xmlTag(itemXml, "title");
  const link = xmlTag(itemXml, "link");
  const guid = xmlTag(itemXml, "guid");
  const pubDate = xmlTag(itemXml, "pubDate");
  const remoteStatus = xmlTag(itemXml, "remoteStatus") || xmlTag(itemXml, "tt:remoteStatus") || undefined;
  const department = xmlTag(itemXml, "tt:department") || xmlTag(itemXml, "department") || undefined;
  const role = xmlTag(itemXml, "tt:role") || xmlTag(itemXml, "role") || undefined;

  // Parse description (HTML content)
  const description = includeContent ? xmlTag(itemXml, "description") : "";

  // Parse locations: <tt:locations> contains <tt:location> elements
  const locationsBlock = xmlTag(itemXml, "tt:locations") || itemXml;
  const locationXmls = xmlTagAll(locationsBlock, "tt:location");

  const locations: TeamtailorLocation[] = locationXmls.map((locXml) => ({
    name: xmlTag(locXml, "tt:name") || xmlTag(locXml, "name") || undefined,
    city: xmlTag(locXml, "tt:city") || xmlTag(locXml, "city") || undefined,
    country: xmlTag(locXml, "tt:country") || xmlTag(locXml, "country") || undefined,
  }));

  return {
    title,
    description,
    pubDate,
    link,
    guid,
    remoteStatus,
    locations,
    department,
    role,
  };
}

/**
 * Parse RSS XML into an array of TeamtailorJob.
 */
export function parseRss(xml: string, includeContent: boolean): TeamtailorJob[] {
  const items: TeamtailorJob[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRe.exec(xml)) !== null) {
    items.push(parseItem(match[1]!, includeContent));
  }
  return items;
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
 * Scrape a single company's Teamtailor RSS job feed.
 *
 * Paginates through all pages of the RSS feed by incrementing offset.
 *
 * @param slug - The Teamtailor company slug
 * @param options - Scrape options
 * @returns CompanyJobs or null if not found / no listed jobs
 */
export async function scrapeCompany(
  slug: string,
  options?: ScrapeCompanyOptions
): Promise<CompanyJobs | null> {
  const includeContent = options?.includeContent ?? false;
  const limit = options?.limit ?? Infinity;

  const allJobs: TeamtailorJob[] = [];
  let offset = 0;

  try {
    while (true) {
      const url = `https://${encodeURIComponent(slug)}.teamtailor.com/jobs.rss?per_page=${PER_PAGE}&offset=${offset}`;
      const res = await fetchWithRetry(url);

      if (res.status === 404) return null;
      if (!res.ok) return null;

      const xml = await res.text();
      const jobs = parseRss(xml, includeContent);

      if (jobs.length === 0) break;

      allJobs.push(...jobs);

      // Stop if we have enough or this was the last page
      if (allJobs.length >= limit || jobs.length < PER_PAGE) break;

      offset += PER_PAGE;
    }
  } catch {
    // If we got some jobs before failing, return what we have
    if (allJobs.length === 0) return null;
  }

  if (allJobs.length === 0) return null;

  const jobs = limit < Infinity ? allJobs.slice(0, limit) : allJobs;

  return {
    company: slug,
    slug,
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

// Re-export parseRss and parseItem for testing
export { parseItem as _parseItem };
