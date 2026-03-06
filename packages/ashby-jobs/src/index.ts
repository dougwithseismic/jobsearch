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

const ASHBY_API = "https://api.ashbyhq.com/posting-api/job-board";
const CC_INDEX = "https://index.commoncrawl.org";

const DEFAULT_CRAWLS = [
  "CC-MAIN-2025-08",
  "CC-MAIN-2024-51",
  "CC-MAIN-2024-42",
];

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
  onProgress?: (message: string) => void
): Promise<Set<string>> {
  const slugs = new Set<string>();
  const url = `${CC_INDEX}/${crawlId}-index?url=jobs.ashbyhq.com/*&output=text&fl=url&limit=100000`;

  onProgress?.(`Querying index ${DEFAULT_CRAWLS.indexOf(crawlId) + 1}/${DEFAULT_CRAWLS.length}...`);

  try {
    const res = await fetch(url);
    if (!res.ok) {
      onProgress?.(`Index ${DEFAULT_CRAWLS.indexOf(crawlId) + 1}: HTTP ${res.status}`);
      return slugs;
    }
    const text = await res.text();
    for (const line of text.split("\n")) {
      const match = line.match(/https:\/\/jobs\.ashbyhq\.com\/([^/?#]+)/);
      if (match?.[1]) {
        slugs.add(decodeURIComponent(match[1]));
      }
    }
    onProgress?.(`Index ${DEFAULT_CRAWLS.indexOf(crawlId) + 1}: found ${slugs.size} slugs`);
  } catch (e) {
    onProgress?.(`Index ${DEFAULT_CRAWLS.indexOf(crawlId) + 1}: error - ${e}`);
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
  const crawlIds = options?.crawlIds ?? DEFAULT_CRAWLS;
  const knownSlugs = options?.knownSlugs ?? DEFAULT_KNOWN_SLUGS;
  const onProgress = options?.onProgress;

  onProgress?.(`Discovering company slugs (${crawlIds.length} indexes in parallel)...`);

  const results = await Promise.all(
    crawlIds.map((crawl) => discoverSlugsFromIndex(crawl, onProgress))
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
    const res = await fetch(url);
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
