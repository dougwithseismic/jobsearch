export type {
  GreenhouseJob,
  GreenhouseMetadata,
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
  GreenhouseJob,
  GreenhouseMetadata,
  CompanyJobs,
  DiscoverOptions,
  ScrapeAllOptions,
  ScrapeCompanyOptions,
  SearchQuery,
} from "./types.js";
import { searchResults } from "./filters.js";

const GREENHOUSE_API = "https://boards-api.greenhouse.io/v1/boards";
const CC_INDEX = "https://index.commoncrawl.org";

const DEFAULT_CRAWLS = [
  "CC-MAIN-2025-08",
  "CC-MAIN-2024-51",
  "CC-MAIN-2024-42",
];

const DEFAULT_KNOWN_SLUGS = [
  "airbnb", "stripe", "twitch", "cloudflare", "datadog", "figma",
  "gitlab", "hashicorp", "hubspot", "lyft", "netflix", "pinterest",
  "plaid", "robinhood", "shopify", "slack", "snapchat", "spotify",
  "square", "uber", "doordash", "coinbase", "databricks", "gusto",
  "airtable", "wealthsimple",
];

/** Raw Greenhouse API job response */
interface RawGreenhouseJob {
  id: number;
  title: string;
  location: { name: string };
  departments: { id: number; name: string }[];
  offices: { id: number; name: string }[];
  content?: string;
  updated_at: string;
  absolute_url: string;
  internal_job_id: number;
  metadata: { id: number; name: string; value: string | string[] | null; value_type: string }[];
}

/**
 * Parse a raw Greenhouse API job into our clean interface.
 */
function parseJob(raw: RawGreenhouseJob, includeContent: boolean): GreenhouseJob {
  const job: GreenhouseJob = {
    id: raw.id,
    title: raw.title,
    location: raw.location?.name ?? "",
    departments: raw.departments?.map((d) => d.name) ?? [],
    offices: raw.offices?.map((o) => o.name) ?? [],
    updatedAt: raw.updated_at,
    absoluteUrl: raw.absolute_url,
    internalJobId: raw.internal_job_id,
    metadata: (raw.metadata ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      value: m.value,
      valueType: m.value_type,
    })),
  };

  if (includeContent && raw.content) {
    job.content = raw.content;
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
  const url = `${CC_INDEX}/${crawlId}-index?url=boards.greenhouse.io/*&output=text&fl=url&limit=100000`;

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
      const match = line.match(/https?:\/\/boards\.greenhouse\.io\/([^/?#]+)/);
      if (match?.[1]) {
        const slug = decodeURIComponent(match[1]).toLowerCase();
        // Skip common non-company paths
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
 * Discover all company slugs (board tokens) from web indexes.
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
 * @param slug - The Greenhouse board token
 * @param options - Scrape options
 * @returns CompanyJobs or null if not found / no listed jobs
 */
export async function scrapeCompany(
  slug: string,
  options?: ScrapeCompanyOptions
): Promise<CompanyJobs | null> {
  const includeContent = options?.includeContent ?? false;
  const contentParam = includeContent ? "?content=true" : "";
  const url = `${GREENHOUSE_API}/${encodeURIComponent(slug)}/jobs${contentParam}`;

  try {
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) return null;

    const data = await res.json() as { jobs?: RawGreenhouseJob[] };
    const rawJobs = data.jobs ?? [];

    if (rawJobs.length === 0) return null;

    const jobs: GreenhouseJob[] = rawJobs.map((j) => parseJob(j, includeContent));

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

// Re-export parseJob for testing
export { parseJob as _parseJob };
