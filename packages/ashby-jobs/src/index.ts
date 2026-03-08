export type {
  AshbyJob,
  AshbyAddress,
  SecondaryLocation,
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
  AshbyJob,
  CompanyJobs,
  DiscoverOptions,
  ScrapeAllOptions,
  ScrapeCompanyOptions,
  SearchQuery,
} from "./types.js";
import { searchResults } from "./filters.js";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const DEFAULT_TIMEOUT_MS = 30_000;
const CC_TIMEOUT_MS = 120_000;

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
      const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
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

const ASHBY_API = "https://api.ashbyhq.com/posting-api/job-board";
const CC_INDEX = "https://index.commoncrawl.org";

const FALLBACK_CRAWLS = [
  "CC-MAIN-2026-08",
  "CC-MAIN-2026-04",
  "CC-MAIN-2025-51",
];

const CC_COLLINFO_URL = "https://index.commoncrawl.org/collinfo.json";

async function getLatestCrawlIds(count = 3): Promise<string[]> {
  try {
    const res = await fetchWithRetry(CC_COLLINFO_URL, { timeoutMs: 10_000, retries: 1 });
    if (!res.ok) return FALLBACK_CRAWLS;
    const data = await res.json() as { id: string }[];
    const ids = data.slice(0, count).map((d) => d.id);
    return ids.length > 0 ? ids : FALLBACK_CRAWLS;
  } catch {
    return FALLBACK_CRAWLS;
  }
}

const DEFAULT_KNOWN_SLUGS = [
  "openai", "Notion", "ramp", "deel", "linear", "cursor", "snowflake",
  "vanta", "posthog", "replit", "supabase", "zapier", "harvey", "stytch",
  "1password", "deliveroo", "trainline", "cohere", "anthropic", "vercel",
  "mercury", "reddit", "retool", "airtable", "brex", "superhuman",
];

/**
 * Discover slugs from a single web index.
 */
async function discoverSlugsFromIndex(
  crawlId: string,
  indexNum: number,
  totalIndexes: number,
  onProgress?: (message: string) => void
): Promise<Set<string>> {
  const slugs = new Set<string>();
  const url = `${CC_INDEX}/${crawlId}-index?url=jobs.ashbyhq.com/*&output=text&fl=url&limit=100000`;

  onProgress?.(`Querying index ${indexNum}/${totalIndexes}...`);

  try {
    const res = await fetchWithRetry(url, { timeoutMs: CC_TIMEOUT_MS });
    if (!res.ok) {
      onProgress?.(`Index ${indexNum}: HTTP ${res.status}`);
      return slugs;
    }
    const text = await res.text();
    for (const line of text.split("\n")) {
      const match = line.match(/https:\/\/jobs\.ashbyhq\.com\/([^/?#]+)/);
      if (match?.[1]) {
        slugs.add(decodeURIComponent(match[1]));
      }
    }
    onProgress?.(`Index ${indexNum}: found ${slugs.size} slugs`);
  } catch (e) {
    onProgress?.(`Index ${indexNum}: error - ${e}`);
  }

  return slugs;
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
  const knownSlugs = options?.knownSlugs ?? DEFAULT_KNOWN_SLUGS;
  const onProgress = options?.onProgress;

  let crawlIds = options?.crawlIds;
  if (!crawlIds) {
    onProgress?.("Fetching latest crawl indexes...");
    crawlIds = await getLatestCrawlIds(3);
    onProgress?.(`Using indexes: ${crawlIds.join(", ")}`);
  }

  onProgress?.(`Discovering company slugs (${crawlIds.length} indexes in parallel)...`);

  const results = await Promise.all(
    crawlIds.map((crawl, i) => discoverSlugsFromIndex(crawl, i + 1, crawlIds!.length, onProgress))
  );

  const allSlugs = new Set<string>();
  for (const slugs of results) {
    for (const s of slugs) allSlugs.add(s);
  }

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
 * @param slug - The Ashby job board slug
 * @param options - Scrape options
 * @returns CompanyJobs or null if not found / no listed jobs
 */
export async function scrapeCompany(
  slug: string,
  options?: ScrapeCompanyOptions
): Promise<CompanyJobs | null> {
  const url = `${ASHBY_API}/${encodeURIComponent(slug)}?includeCompensation=true`;
  const includeDescriptions = options?.includeDescriptions ?? false;

  try {
    const res = await fetchWithRetry(url);
    if (res.status === 404) return null;
    if (!res.ok) return null;

    const data: { jobs?: AshbyJob[] } = await res.json() as { jobs?: AshbyJob[] };
    const rawJobs = (data.jobs ?? []).filter(
      (j: AshbyJob) => j.isListed
    );

    if (rawJobs.length === 0) return null;

    const jobs: AshbyJob[] = rawJobs.map((j: AshbyJob) => {
      const job: AshbyJob = {
        id: j.id,
        title: j.title,
        department: j.department,
        team: j.team,
        employmentType: j.employmentType,
        location: j.location,
        secondaryLocations: j.secondaryLocations ?? [],
        isRemote: j.isRemote,
        workplaceType: j.workplaceType,
        publishedAt: j.publishedAt,
        isListed: j.isListed,
        jobUrl: j.jobUrl,
        applyUrl: j.applyUrl,
        compensationTierSummary: j.compensationTierSummary,
        address: j.address,
      };

      if (includeDescriptions) {
        job.descriptionPlain = j.descriptionPlain;
        job.descriptionHtml = j.descriptionHtml;
      }

      return job;
    });

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
  const includeDescriptions = options?.includeDescriptions ?? false;

  const results: CompanyJobs[] = [];
  let done = 0;
  let found = 0;
  const queue = [...slugs];

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const slug = queue.shift();
      if (!slug) break;

      const result = await scrapeCompany(slug, { includeDescriptions });
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
