export type {
  RecruiteeJob,
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
  RecruiteeJob,
  CompanyJobs,
  DiscoverOptions,
  ScrapeAllOptions,
  ScrapeCompanyOptions,
  SearchQuery,
} from "./types.js";
import { searchResults } from "./filters.js";

const RECRUITEE_API = "https://{slug}.recruitee.com/api/offers";
const CC_INDEX = "https://index.commoncrawl.org";

const DEFAULT_CRAWLS = [
  "CC-MAIN-2025-08",
  "CC-MAIN-2024-51",
  "CC-MAIN-2024-42",
];

const DEFAULT_KNOWN_SLUGS = [
  "teamtailor", "bynder", "peakon", "miro", "factorial",
  "personio", "vinted", "docplanner", "sennder", "messagebird",
];

/** Subdomains that are not company job boards */
const EXCLUDED_SUBDOMAINS = new Set([
  "www", "api", "app", "help", "docs", "blog", "status",
  "careers", "admin", "support", "mail", "cdn", "assets",
  "staging", "dev", "test", "demo", "sandbox", "preview",
  "login", "auth", "sso", "dashboard", "console", "portal",
  "static", "media", "images", "img", "files", "download",
  "shop", "store", "billing", "payments", "webhooks",
  "analytics", "tracking", "events", "notifications",
  "feedback", "survey", "forms", "widget", "embed",
  "integrations", "marketplace", "partners", "affiliate",
  "community", "forum", "kb", "knowledge", "faq",
  "security", "compliance", "legal", "privacy", "terms",
]);

/**
 * Strip HTML tags and decode common entities.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Map employment type codes to human-readable strings.
 */
function mapEmploymentType(code: string | null | undefined): string {
  if (!code) return "";
  const map: Record<string, string> = {
    full_time: "FullTime",
    part_time: "PartTime",
    freelance: "Freelance",
    internship: "Internship",
    contract: "Contract",
    temporary: "Temporary",
  };
  return map[code] ?? code;
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
  const url = `${CC_INDEX}/${crawlId}-index?url=*.recruitee.com/*&output=json&limit=5000`;

  onProgress?.(`Querying index ${crawlIds.indexOf(crawlId) + 1}/${crawlIds.length}...`);

  try {
    const res = await fetch(url);
    if (!res.ok) {
      onProgress?.(`Index ${crawlIds.indexOf(crawlId) + 1}: HTTP ${res.status}`);
      return slugs;
    }
    const text = await res.text();
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // CC JSON index returns one JSON object per line
      let urlStr: string | undefined;
      try {
        const obj = JSON.parse(trimmed) as { url?: string };
        urlStr = obj.url;
      } catch {
        // Try matching raw URL
        const rawMatch = trimmed.match(/https?:\/\/([^.]+)\.recruitee\.com/);
        if (rawMatch?.[1]) {
          const subdomain = rawMatch[1].toLowerCase();
          if (!EXCLUDED_SUBDOMAINS.has(subdomain)) {
            slugs.add(subdomain);
          }
        }
        continue;
      }

      if (urlStr) {
        const match = urlStr.match(/https?:\/\/([^.]+)\.recruitee\.com/);
        if (match?.[1]) {
          const subdomain = match[1].toLowerCase();
          if (!EXCLUDED_SUBDOMAINS.has(subdomain)) {
            slugs.add(subdomain);
          }
        }
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

/** Raw offer object from the Recruitee API */
interface RawOffer {
  id?: number;
  title?: string;
  slug?: string;
  position?: string;
  department?: string;
  location?: string;
  country?: string;
  city?: string;
  state?: string;
  remote?: boolean | string;
  description?: string;
  requirements?: string;
  careers_url?: string;
  created_at?: string;
  published_at?: string;
  tags?: string[];
  min_hours?: number | null;
  max_hours?: number | null;
  employment_type_code?: string | null;
}

/**
 * Scrape a single company's job board.
 *
 * @param slug - The Recruitee company subdomain
 * @param options - Scrape options
 * @returns CompanyJobs or null if not found / no listed jobs
 */
export async function scrapeCompany(
  slug: string,
  options?: ScrapeCompanyOptions
): Promise<CompanyJobs | null> {
  const url = RECRUITEE_API.replace("{slug}", encodeURIComponent(slug));
  const includeDescriptions = options?.includeDescriptions ?? false;

  try {
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) return null;

    const data = await res.json() as { offers?: RawOffer[] };
    const rawOffers = data.offers ?? [];

    if (rawOffers.length === 0) return null;

    const jobs: RecruiteeJob[] = rawOffers.map((o: RawOffer) => {
      const job: RecruiteeJob = {
        id: o.id ?? 0,
        title: o.title ?? "",
        slug: o.slug ?? "",
        department: o.department ?? "",
        location: o.location ?? "",
        country: o.country ?? "",
        city: o.city ?? "",
        state: o.state ?? "",
        remote: o.remote === true || o.remote === "true",
        description: includeDescriptions ? (o.description ?? "") : "",
        requirements: includeDescriptions ? (o.requirements ?? "") : "",
        careersUrl: o.careers_url ?? "",
        publishedAt: o.published_at ?? o.created_at ?? "",
        createdAt: o.created_at ?? "",
        tags: o.tags ?? [],
        employmentType: mapEmploymentType(o.employment_type_code),
        minHours: o.min_hours ?? null,
        maxHours: o.max_hours ?? null,
      };

      if (includeDescriptions) {
        job.descriptionPlain = stripHtml(o.description ?? "");
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
