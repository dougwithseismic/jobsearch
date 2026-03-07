export type {
  LeverJob,
  LeverCategories,
  LeverList,
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
  LeverJob,
  CompanyJobs,
  DiscoverOptions,
  ScrapeAllOptions,
  ScrapeCompanyOptions,
  SearchQuery,
} from "./types.js";
import { searchResults } from "./filters.js";

const LEVER_API = "https://api.lever.co/v0/postings";
const CC_INDEX = "https://index.commoncrawl.org";

const DEFAULT_CRAWLS = [
  "CC-MAIN-2025-08",
  "CC-MAIN-2024-51",
  "CC-MAIN-2024-42",
];

const DEFAULT_KNOWN_SLUGS = [
  "netflix", "spotify", "shopify", "twitch", "cloudflare", "databricks",
  "figma", "stripe", "atlassian", "github", "datadog", "hashicorp",
  "elastic", "coinbase", "plaid", "discord", "instacart", "lyft",
  "pinterest", "snap", "doordash", "robinhood", "affirm", "chime",
  "grammarly", "canva",
];

/** Raw Lever API response posting shape */
interface LeverApiPosting {
  id: string;
  text: string;
  categories: {
    team?: string;
    department?: string;
    location?: string;
    commitment?: string;
    allLocations?: string[];
  };
  description?: string;
  descriptionPlain?: string;
  lists?: { text: string; content: string }[];
  additional?: string;
  hostedUrl?: string;
  applyUrl?: string;
  createdAt: number;
  workplaceType?: string;
}

/**
 * Map a raw Lever API posting to our clean LeverJob interface.
 */
export function mapPosting(
  raw: LeverApiPosting,
  includeDescriptions: boolean
): LeverJob {
  const job: LeverJob = {
    id: raw.id,
    title: raw.text,
    team: raw.categories?.team ?? "",
    department: raw.categories?.department ?? "",
    location: raw.categories?.location ?? "",
    commitment: raw.categories?.commitment ?? "",
    allLocations: raw.categories?.allLocations ?? [],
    workplaceType: raw.workplaceType ?? "unspecified",
    description: "",
    descriptionPlain: "",
    lists: [],
    additional: "",
    hostedUrl: raw.hostedUrl ?? "",
    applyUrl: raw.applyUrl ?? "",
    createdAt: raw.createdAt,
  };

  if (includeDescriptions) {
    job.description = raw.description ?? "";
    job.descriptionPlain = raw.descriptionPlain ?? "";
    job.lists = raw.lists ?? [];
    job.additional = raw.additional ?? "";
  }

  return job;
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
  const url = `${CC_INDEX}/${crawlId}-index?url=jobs.lever.co/*&output=text&fl=url&limit=100000`;

  onProgress?.(`Querying index ${crawlIds.indexOf(crawlId) + 1}/${crawlIds.length}...`);

  try {
    const res = await fetch(url);
    if (!res.ok) {
      onProgress?.(`Index ${crawlIds.indexOf(crawlId) + 1}: HTTP ${res.status}`);
      return slugs;
    }
    const text = await res.text();
    for (const line of text.split("\n")) {
      const match = line.match(/https?:\/\/jobs\.lever\.co\/([^/?#]+)/);
      if (match?.[1]) {
        slugs.add(decodeURIComponent(match[1]));
      }
    }
    onProgress?.(`Index ${crawlIds.indexOf(crawlId) + 1}: found ${slugs.size} slugs`);
  } catch (e) {
    onProgress?.(`Index ${crawlIds.indexOf(crawlId) + 1}: error - ${e}`);
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
 * Scrape a single company's job board.
 *
 * @param slug - The Lever job board slug
 * @param options - Scrape options
 * @returns CompanyJobs or null if not found / no listed jobs
 */
export async function scrapeCompany(
  slug: string,
  options?: ScrapeCompanyOptions
): Promise<CompanyJobs | null> {
  const url = `${LEVER_API}/${encodeURIComponent(slug)}?mode=json`;
  const includeDescriptions = options?.includeDescriptions ?? false;

  try {
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) return null;

    const data: LeverApiPosting[] = await res.json() as LeverApiPosting[];

    if (!Array.isArray(data) || data.length === 0) return null;

    const jobs: LeverJob[] = data.map((raw) =>
      mapPosting(raw, includeDescriptions)
    );

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
