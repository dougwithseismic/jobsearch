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

const PERSONIO_BASE = "https://{slug}.jobs.personio.de/xml";
const CC_INDEX = "https://index.commoncrawl.org";

const DEFAULT_CRAWLS = [
  "CC-MAIN-2025-08",
  "CC-MAIN-2024-51",
  "CC-MAIN-2024-42",
];

const DEFAULT_KNOWN_SLUGS = [
  "n26", "celonis", "sennder", "taxfix", "contentful",
  "gorillas", "personio",
];

/** Default delay between requests in ms */
const REQUEST_DELAY_MS = 200;

/** Max retries on 429 */
const MAX_RETRIES = 3;

/** Base wait on 429 in ms */
const BACKOFF_BASE_MS = 2000;

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

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch with retry logic for 429 rate limiting.
 */
async function fetchWithRetry(
  url: string,
  retries = MAX_RETRIES
): Promise<Response | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);

      if (res.status === 429 && attempt < retries) {
        const waitMs = BACKOFF_BASE_MS * Math.pow(2, attempt);
        await sleep(waitMs);
        continue;
      }

      return res;
    } catch {
      if (attempt === retries) return null;
      await sleep(BACKOFF_BASE_MS);
    }
  }

  return null;
}

/**
 * Discover slugs from a single web index.
 */
async function discoverSlugsFromIndex(
  crawlId: string,
  crawlIds: string[],
  onProgress?: (message: string) => void
): Promise<Set<string>> {
  const slugs = new Set<string>();
  const url = `${CC_INDEX}/${crawlId}-index?url=*.jobs.personio.de/*&output=text&fl=url&limit=100000`;

  const indexNum = crawlIds.indexOf(crawlId) + 1;
  onProgress?.(`Querying index ${indexNum}/${crawlIds.length}...`);

  try {
    const res = await fetch(url);
    if (!res.ok) {
      onProgress?.(`Index ${indexNum}: HTTP ${res.status}`);
      return slugs;
    }
    const text = await res.text();
    for (const line of text.split("\n")) {
      const match = line.match(/https?:\/\/([^.]+)\.jobs\.personio\.de/);
      if (match?.[1]) {
        const slug = decodeURIComponent(match[1]).toLowerCase();
        if (!isValidSlug(slug)) continue;
        slugs.add(slug);
      }
    }
    onProgress?.(`Index ${indexNum}: found ${slugs.size} slugs`);
  } catch (e) {
    onProgress?.(`Index ${indexNum}: error - ${e}`);
  }

  return slugs;
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
 * Discover all company slugs from web indexes.
 *
 * @param options - Discovery options
 * @returns Sorted array of unique company slugs
 */
export async function discoverSlugs(
  options?: DiscoverOptions
): Promise<string[]> {
  const crawlIds = options?.crawlIds ?? DEFAULT_CRAWLS;
  const knownSlugs = options?.knownSlugs ?? DEFAULT_KNOWN_SLUGS;
  const onProgress = options?.onProgress;

  onProgress?.(`Discovering company slugs (${crawlIds.length} indexes in parallel)...`);

  const results = await Promise.all(
    crawlIds.map((crawl) => discoverSlugsFromIndex(crawl, crawlIds, onProgress))
  );

  const allSlugs = new Set<string>();
  for (const slugSet of results) {
    for (const s of slugSet) allSlugs.add(s);
  }

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
    if (!res) return null;
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

      // Rate limiting delay between requests
      if (queue.length > 0) {
        await sleep(REQUEST_DELAY_MS);
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
