export type {
  JobviteJob,
  CompanyJobs,
  FlatJob,
  ScrapeAllOptions,
  ScrapeCompanyOptions,
  JobFilter,
  SearchQuery,
} from "./types.js";

export { filterResults, filterCompanyJobs, searchResults } from "./filters.js";
export { toJSON, toCSV, toTable, flattenJobs } from "./output.js";

import type {
  JobviteJob,
  CompanyJobs,
  ScrapeAllOptions,
  ScrapeCompanyOptions,
  SearchQuery,
} from "./types.js";
import { searchResults } from "./filters.js";

const JOBVITE_CAREERS_URL = "https://jobs.jobvite.com";
const JOBVITE_XML_URL = "https://app.jobvite.com/CompanyJobs/Xml.aspx";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1500;
const DEFAULT_TIMEOUT_MS = 30_000;
const REQUEST_DELAY_MS = 1500;

/**
 * Fetch with exponential backoff retry and per-request timeout.
 * Retries on 429, 1015 (Cloudflare), 5xx, timeouts, and network errors.
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
      const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
      // Don't retry client errors (except 429 and Cloudflare 1015)
      if (res.ok || (res.status >= 400 && res.status < 500 && res.status !== 429)) {
        return res;
      }
      // Retryable: 429, 1015, or 5xx
      if (attempt < retries) {
        const delay = (res.status === 429 || res.status === 1015)
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

/**
 * Extract the Jobvite companyId from the careers page HTML.
 * Looks for: getCompanyId() { return '{8-char-id}'; }
 */
export function extractCompanyId(html: string): string | null {
  // Pattern 1: getCompanyId() { return 'XXXXXXXX'; }
  const match1 = html.match(/getCompanyId\(\)\s*\{\s*return\s*['"]([a-zA-Z0-9]+)['"]/);
  if (match1?.[1]) return match1[1];

  // Pattern 2: companyId = 'XXXXXXXX'
  const match2 = html.match(/companyId\s*=\s*['"]([a-zA-Z0-9]+)['"]/);
  if (match2?.[1]) return match2[1];

  return null;
}

/**
 * Parse Jobvite XML feed into JobviteJob array.
 */
export function parseXmlFeed(xml: string): JobviteJob[] {
  const jobs: JobviteJob[] = [];

  // Match each <job> element
  const jobMatches = xml.match(/<job>([\s\S]*?)<\/job>/g);
  if (!jobMatches) return jobs;

  for (const jobXml of jobMatches) {
    const getTag = (tag: string): string => {
      // Handle CDATA sections
      const cdataMatch = jobXml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`));
      if (cdataMatch?.[1] !== undefined) return cdataMatch[1];

      const match = jobXml.match(new RegExp(`<${tag}>(.*?)<\\/${tag}>`, 's'));
      return match?.[1] ?? "";
    };

    jobs.push({
      id: getTag("id"),
      title: getTag("title"),
      category: getTag("category"),
      jobType: getTag("jobtype"),
      location: getTag("location"),
      date: getTag("date"),
      detailUrl: getTag("detail-url"),
      applyUrl: getTag("apply-url"),
      description: getTag("description") || undefined,
      department: getTag("department_x002F_division"),
      remoteType: getTag("remote_x0020_type"),
    });
  }

  return jobs;
}

/**
 * Resolve a company slug to its Jobvite companyId.
 * Fetches the careers page HTML and extracts the ID.
 */
export async function resolveCompanyId(slug: string): Promise<string | null> {
  const url = `${JOBVITE_CAREERS_URL}/${encodeURIComponent(slug)}`;

  try {
    const res = await fetchWithRetry(url);
    if (!res.ok) return null;
    const html = await res.text();
    return extractCompanyId(html);
  } catch {
    return null;
  }
}

/**
 * Scrape a single company's Jobvite job board.
 *
 * Two-step flow:
 * 1. Fetch careers page HTML, extract companyId
 * 2. Fetch XML feed with companyId, parse jobs
 *
 * @param slug - The Jobvite company slug (from careers URL)
 * @param options - Scrape options
 * @returns CompanyJobs or null if not found / no listed jobs
 */
export async function scrapeCompany(
  slug: string,
  options?: ScrapeCompanyOptions
): Promise<CompanyJobs | null> {
  const includeContent = options?.includeContent ?? true;
  const limit = options?.limit;

  // Step 1: Resolve companyId from careers page
  const companyId = await resolveCompanyId(slug);
  if (!companyId) return null;

  // Small delay between requests to avoid rate limiting
  await new Promise((r) => setTimeout(r, REQUEST_DELAY_MS));

  // Step 2: Fetch XML feed
  const xmlUrl = `${JOBVITE_XML_URL}?c=${encodeURIComponent(companyId)}`;

  try {
    const res = await fetchWithRetry(xmlUrl);
    if (!res.ok) return null;

    const xml = await res.text();
    let jobs = parseXmlFeed(xml);

    if (jobs.length === 0) return null;

    // Strip descriptions if not wanted
    if (!includeContent) {
      jobs = jobs.map((j) => {
        const { description: _, ...rest } = j;
        return { ...rest, description: undefined };
      });
    }

    // Apply limit
    if (limit && limit > 0) {
      jobs = jobs.slice(0, limit);
    }

    return {
      company: slug,
      slug,
      companyId,
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
 */
export async function scrapeAll(
  slugs: string[],
  options?: ScrapeAllOptions
): Promise<CompanyJobs[]> {
  const concurrency = options?.concurrency ?? 5;
  const onProgress = options?.onProgress;
  const includeContent = options?.includeContent ?? true;

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

      if (done % 10 === 0 || done === slugs.length) {
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
 */
export function searchJobs(
  results: CompanyJobs[],
  query: SearchQuery
): CompanyJobs[] {
  return searchResults(results, query.text, query.filters, query.limit);
}
