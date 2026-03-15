export type {
  JazzHRJob,
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
  JazzHRJob,
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

const WIDGET_BASE = "https://app.jazz.co/widgets/basic/create";
const DEFAULT_SLUG_API_URL = "https://job-slugs.wd40.workers.dev/slugs/jazzhr";

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

/** Parsed job entry from the widget HTML */
interface WidgetJob {
  id: string;
  title: string;
  location: string;
  department: string;
  applyUrl: string;
}

/**
 * Parse the JazzHR widget JavaScript/HTML response to extract job listings.
 * The widget contains embedded HTML with job blocks identified by
 * `id="resumator-job-{jobId}"` containing title, location, department, and apply URL.
 */
export function parseWidget(html: string, slug: string): WidgetJob[] {
  const jobs: WidgetJob[] = [];

  // Match each job block: id="resumator-job-{id}" ... until next job block or end
  const jobBlockRe = /id="resumator-job-(job_\w+)"[^>]*>.*?<\/div><\/div>/gs;
  const titleRe = /resumator-job-title[^"]*"[^>]*>([^<]+)<\/div>/;
  const locationRe = /resumator-job-location[^"]*"[^>]*>[^<]*<\/span>([^<]*)/;
  const departmentRe = /resumator-job-department[^"]*"[^>]*>[^<]*<\/span>([^<]*)/;
  const urlRe = /href="(https?:\/\/[^"]*applytojob\.com\/apply\/[^"?]+)/;

  let match;
  while ((match = jobBlockRe.exec(html)) !== null) {
    const block = match[0];
    const id = match[1]!;

    const titleMatch = titleRe.exec(block);
    const locationMatch = locationRe.exec(block);
    const departmentMatch = departmentRe.exec(block);
    const urlMatch = urlRe.exec(block);

    if (!titleMatch) continue;

    const applyUrl = urlMatch
      ? urlMatch[1]!
      : `https://${slug}.applytojob.com/apply/${id}`;

    jobs.push({
      id,
      title: titleMatch[1]!.trim(),
      location: locationMatch ? locationMatch[1]!.trim() : "",
      department: departmentMatch ? departmentMatch[1]!.trim() : "",
      applyUrl,
    });
  }

  return jobs;
}

/** JSON-LD JobPosting structure from detail pages */
interface JsonLdJobPosting {
  title?: string;
  description?: string;
  datePosted?: string;
  employmentType?: string;
  experienceRequirements?: string;
  uniqueJobCode?: string;
  url?: string;
  hiringOrganization?: {
    name?: string;
    sameAs?: string;
    logo?: string;
  };
  jobLocation?: {
    address?: {
      addressLocality?: string;
      addressRegion?: string;
    };
  };
  baseSalary?: {
    currency?: string;
    value?: {
      minValue?: number;
      maxValue?: number;
      unitText?: string;
    };
  };
}

/**
 * Fetch a detail page and extract JSON-LD JobPosting data.
 */
async function fetchJobDetail(url: string): Promise<JsonLdJobPosting | null> {
  try {
    const res = await fetchWithRetry(url, { timeoutMs: DEFAULT_TIMEOUT_MS, retries: 1 });
    if (!res.ok) return null;
    const html = await res.text();

    const jsonLdRe = /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/g;
    let match;
    while ((match = jsonLdRe.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]!);
        if (data["@type"] === "JobPosting") {
          return data as JsonLdJobPosting;
        }
      } catch {
        // skip malformed JSON-LD blocks
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Enrich a widget job with detail page data.
 */
function enrichJob(widget: WidgetJob, detail: JsonLdJobPosting): JazzHRJob {
  const salary = detail.baseSalary?.value
    ? {
        currency: detail.baseSalary.currency ?? "USD",
        min: detail.baseSalary.value.minValue ?? null,
        max: detail.baseSalary.value.maxValue ?? null,
        period: (detail.baseSalary.value.unitText ?? "YEAR").toLowerCase(),
      }
    : undefined;

  return {
    id: widget.id,
    title: detail.title ?? widget.title,
    location: widget.location,
    department: widget.department,
    applyUrl: detail.url ?? widget.applyUrl,
    descriptionHtml: detail.description ?? undefined,
    datePosted: detail.datePosted ?? undefined,
    employmentType: detail.employmentType ?? undefined,
    experienceLevel: detail.experienceRequirements ?? undefined,
    salary,
    company: detail.hiringOrganization
      ? {
          name: detail.hiringOrganization.name ?? "",
          url: detail.hiringOrganization.sameAs ?? "",
          logoUrl: detail.hiringOrganization.logo ?? null,
        }
      : undefined,
    city: detail.jobLocation?.address?.addressLocality ?? undefined,
    state: detail.jobLocation?.address?.addressRegion ?? undefined,
  };
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
 * Scrape a single company's JazzHR job board via the widget endpoint.
 *
 * @param slug - The JazzHR subdomain
 * @param options - Scrape options
 * @returns CompanyJobs or null if not found / no listed jobs
 */
export async function scrapeCompany(
  slug: string,
  options?: ScrapeCompanyOptions
): Promise<CompanyJobs | null> {
  const includeDescriptions = options?.includeDescriptions ?? false;
  const url = `${WIDGET_BASE}/${encodeURIComponent(slug)}`;

  try {
    const res = await fetchWithRetry(url);
    if (res.status === 404) return null;
    if (!res.ok) return null;

    const html = await res.text();
    const widgetJobs = parseWidget(html, slug);

    if (widgetJobs.length === 0) return null;

    let jobs: JazzHRJob[];

    if (includeDescriptions) {
      // Fetch detail pages for full descriptions + JSON-LD data
      jobs = await Promise.all(
        widgetJobs.map(async (wj) => {
          const detail = await fetchJobDetail(wj.applyUrl);
          if (detail) {
            return enrichJob(wj, detail);
          }
          // Fallback: return basic widget data
          return {
            id: wj.id,
            title: wj.title,
            location: wj.location,
            department: wj.department,
            applyUrl: wj.applyUrl,
          };
        })
      );
    } else {
      jobs = widgetJobs.map((wj) => ({
        id: wj.id,
        title: wj.title,
        location: wj.location,
        department: wj.department,
        applyUrl: wj.applyUrl,
      }));
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

// Re-export parseWidget for testing
export { parseWidget as _parseWidget };
