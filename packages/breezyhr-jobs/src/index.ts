export type {
  BreezyJob,
  BreezyLocation,
  BreezyLocationEntry,
  BreezyCompanyInfo,
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
  BreezyJob,
  CompanyJobs,
  DiscoverOptions,
  ScrapeAllOptions,
  ScrapeCompanyOptions,
  SearchQuery,
} from "./types.js";
import { searchResults } from "./filters.js";

const CC_INDEX = "https://index.commoncrawl.org";

const DEFAULT_CRAWLS = [
  "CC-MAIN-2025-08",
  "CC-MAIN-2024-51",
  "CC-MAIN-2024-42",
];

const DEFAULT_KNOWN_SLUGS = [
  "breezy",
  "attentive",
  "hubstaff",
];

/** Raw BreezyHR API job response */
interface RawBreezyJob {
  id: string;
  friendly_id: string;
  name: string;
  url: string;
  published_date: string;
  type: { id: string; name: string };
  location: {
    country: { name: string; id: string } | null;
    state: { id: string; name: string } | null;
    city: string;
    primary: boolean;
    is_remote: boolean;
    name: string;
  };
  department: string;
  salary: string;
  company: {
    name: string;
    logo_url: string | null;
    friendly_id: string;
    isMultipleLocationsEnabled: boolean;
  };
  locations: {
    country: { name: string; id: string } | null;
    countryCode: string;
    city: string;
    region: string;
    hidden: boolean;
  }[];
}

/**
 * Parse a raw BreezyHR API job into our clean interface.
 */
function parseJob(raw: RawBreezyJob): BreezyJob {
  return {
    id: raw.id ?? "",
    friendlyId: raw.friendly_id ?? "",
    name: raw.name ?? "",
    url: raw.url ?? "",
    publishedDate: raw.published_date ?? "",
    type: raw.type ?? { id: "", name: "" },
    location: {
      country: raw.location?.country ?? null,
      state: raw.location?.state ?? null,
      city: raw.location?.city ?? "",
      primary: raw.location?.primary ?? true,
      isRemote: raw.location?.is_remote ?? false,
      name: raw.location?.name ?? "",
    },
    department: raw.department ?? "",
    salary: raw.salary ?? "",
    company: {
      name: raw.company?.name ?? "",
      logoUrl: raw.company?.logo_url ?? null,
      friendlyId: raw.company?.friendly_id ?? "",
      isMultipleLocationsEnabled: raw.company?.isMultipleLocationsEnabled ?? false,
    },
    locations: (raw.locations ?? []).map((loc) => ({
      country: loc.country ?? null,
      countryCode: loc.countryCode ?? "",
      city: loc.city ?? "",
      region: loc.region ?? "",
      hidden: loc.hidden ?? false,
    })),
  };
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
  const url = `${CC_INDEX}/${crawlId}-index?url=*.breezy.hr/*&output=text&fl=url&limit=100000`;

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
      const match = line.match(/https?:\/\/([^.]+)\.breezy\.hr/);
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
  "www", "app", "api", "help", "support", "blog",
  "docs", "status", "mail", "cdn", "static",
]);

function isValidSlug(slug: string): boolean {
  if (INVALID_SLUGS.has(slug)) return false;
  if (slug.includes(".")) return false;
  if (slug.length < 2 || slug.length > 80) return false;
  return true;
}

/**
 * Discover all company slugs (subdomains) from web indexes.
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
 * @param slug - The BreezyHR company subdomain
 * @param _options - Scrape options (reserved for future use)
 * @returns CompanyJobs or null if not found / no listed jobs / non-JSON response
 */
export async function scrapeCompany(
  slug: string,
  _options?: ScrapeCompanyOptions
): Promise<CompanyJobs | null> {
  const url = `https://${encodeURIComponent(slug)}.breezy.hr/json`;

  try {
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) return null;

    // Some companies redirect to custom career sites returning HTML
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType && !contentType.includes("json")) {
      return null;
    }

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      // Response body is not valid JSON (e.g. HTML redirect)
      return null;
    }

    if (!Array.isArray(data)) return null;

    const rawJobs = data as RawBreezyJob[];
    if (rawJobs.length === 0) return null;

    const jobs: BreezyJob[] = rawJobs.map((j) => parseJob(j));

    // Use the company name from the first job if available
    const companyName = jobs[0]?.company?.name || slug;

    return {
      company: companyName,
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

// Re-export parseJob for testing
export { parseJob as _parseJob };
