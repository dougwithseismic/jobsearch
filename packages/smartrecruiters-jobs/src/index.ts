export type {
  SmartRecruitersJob,
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
  SmartRecruitersJob,
  CompanyJobs,
  DiscoverOptions,
  ScrapeAllOptions,
  ScrapeCompanyOptions,
  SearchQuery,
} from "./types.js";
import { searchResults } from "./filters.js";

const SR_API = "https://api.smartrecruiters.com/v1/companies";
const CC_INDEX = "https://index.commoncrawl.org";
const PAGE_LIMIT = 100;

const DEFAULT_CRAWLS = [
  "CC-MAIN-2025-08",
  "CC-MAIN-2024-51",
  "CC-MAIN-2024-42",
];

const DEFAULT_KNOWN_SLUGS = [
  "Visa", "BOSCH", "Lidl", "Bayer", "Sanofi", "Ubisoft",
  "DHL", "Siemens", "adidas-group", "JohnsonAndJohnson",
  "ABB", "Nestle", "Publicis", "Spotify", "Danone",
  "SmartRecruiters1", "Intel", "Workday", "CrowdStrike",
  "TCL", "Avery-Dennison",
];

/** SmartRecruiters posting API response shape */
interface PostingsResponse {
  totalFound: number;
  limit: number;
  offset: number;
  content: SmartRecruitersJob[];
}

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

  // Query both URL patterns in parallel
  const urls = [
    `${CC_INDEX}/${crawlId}-index?url=careers.smartrecruiters.com/*&output=text&fl=url&limit=100000`,
    `${CC_INDEX}/${crawlId}-index?url=jobs.smartrecruiters.com/*&output=text&fl=url&limit=100000`,
  ];

  onProgress?.(`Querying index ${indexNum}/${totalIndexes}...`);

  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return new Set<string>();
        const text = await res.text();
        const found = new Set<string>();
        for (const line of text.split("\n")) {
          // Match careers.smartrecruiters.com/{slug} or jobs.smartrecruiters.com/{slug}
          const match = line.match(
            /https?:\/\/(?:careers|jobs)\.smartrecruiters\.com\/([^/?#]+)/
          );
          if (match?.[1]) {
            found.add(decodeURIComponent(match[1]));
          }
        }
        return found;
      } catch {
        return new Set<string>();
      }
    })
  );

  for (const set of results) {
    for (const s of set) slugs.add(s);
  }

  onProgress?.(`Index ${indexNum}: found ${slugs.size} slugs`);
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
    crawlIds.map((crawl, i) =>
      discoverSlugsFromIndex(crawl, i + 1, crawlIds.length, onProgress)
    )
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
 * Scrape a single company's job board with pagination.
 *
 * @param slug - The SmartRecruiters company identifier
 * @param options - Scrape options
 * @returns CompanyJobs or null if not found / no listed jobs
 */
export async function scrapeCompany(
  slug: string,
  options?: ScrapeCompanyOptions
): Promise<CompanyJobs | null> {
  const includeDescriptions = options?.includeDescriptions ?? false;
  const allJobs: SmartRecruitersJob[] = [];
  let offset = 0;
  let hasMore = true;

  try {
    while (hasMore) {
      const url = `${SR_API}/${encodeURIComponent(slug)}/postings?limit=${PAGE_LIMIT}&offset=${offset}`;
      const res = await fetch(url);

      if (res.status === 404) return null;
      if (!res.ok) return null;

      const data = (await res.json()) as PostingsResponse;
      const postings = data.content ?? [];

      if (postings.length === 0) break;

      for (const posting of postings) {
        const job: SmartRecruitersJob = {
          id: posting.id,
          uuid: posting.uuid ?? posting.id,
          name: posting.name,
          refNumber: posting.refNumber ?? "",
          company: posting.company ?? { name: slug, identifier: slug },
          location: posting.location ?? { city: "", region: "", country: "", remote: false },
          department: posting.department ?? { label: "" },
          typeOfEmployment: posting.typeOfEmployment ?? { label: "" },
          experienceLevel: posting.experienceLevel ?? { label: "" },
          industry: posting.industry ?? { label: "" },
          function: posting.function ?? { label: "" },
          releasedDate: posting.releasedDate ?? "",
          creator: posting.creator ?? { name: "" },
          ref: posting.ref ?? "",
        };

        if (includeDescriptions) {
          // Fetch full posting detail for description fields
          try {
            const detailUrl = `${SR_API}/${encodeURIComponent(slug)}/postings/${posting.id}`;
            const detailRes = await fetch(detailUrl);
            if (detailRes.ok) {
              const detail = (await detailRes.json()) as {
                jobAd?: {
                  sections?: {
                    jobDescription?: { text?: string };
                    qualifications?: { text?: string };
                    additionalInformation?: { text?: string };
                  };
                };
              };
              job.descriptionHtml = detail.jobAd?.sections?.jobDescription?.text;
              job.qualificationsHtml = detail.jobAd?.sections?.qualifications?.text;
              job.additionalInfoHtml = detail.jobAd?.sections?.additionalInformation?.text;
            }
          } catch {
            // Silently skip description fetch failures
          }
        }

        allJobs.push(job);
      }

      offset += postings.length;
      hasMore = postings.length === PAGE_LIMIT;
    }

    if (allJobs.length === 0) return null;

    const companyName = allJobs[0]?.company?.name ?? slug;

    return {
      company: companyName,
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
