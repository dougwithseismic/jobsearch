/**
 * Orchestrator: resolves a company, scrapes all matched ATS platforms in parallel,
 * normalizes to UnifiedJob, and applies filters.
 */

import type { CompanyMatch, SearchOptions, SearchResult, UnifiedJob, SlugSource } from "./types.js";
import { resolveCompany } from "./resolver.js";
import { getAdapter, flattenCompanyJobs } from "../../job-ingest/src/scraper-factory.js";
import { filterJobs } from "./filters.js";

/**
 * The magic function. Give it a company name, get back jobs.
 *
 * "deadlyaccuratejobs, give me all jobs for Stripe"
 */
export async function getJobs(
  companyName: string,
  options?: SearchOptions & { apiUrl?: string; concurrency?: number },
): Promise<SearchResult> {
  const start = Date.now();

  // Step 1: Resolve company → ATS matches
  const matches = await resolveCompany(companyName, { apiUrl: options?.apiUrl });

  if (matches.length === 0) {
    return {
      company: companyName,
      matches: [],
      jobs: [],
      totalJobs: 0,
      scrapedAt: new Date().toISOString(),
      duration: Date.now() - start,
    };
  }

  // Step 2: Group matches by ATS (a company might have the same slug on multiple platforms)
  const byAts = new Map<SlugSource, string[]>();
  for (const match of matches) {
    const existing = byAts.get(match.ats) ?? [];
    existing.push(match.slug);
    byAts.set(match.ats, existing);
  }

  // Step 3: Scrape all matched platforms in parallel
  const allJobs: UnifiedJob[] = [];

  const scrapeResults = await Promise.allSettled(
    [...byAts.entries()].map(async ([ats, slugs]) => {
      return scrapeFromAts(ats, slugs, options?.concurrency);
    }),
  );

  for (const result of scrapeResults) {
    if (result.status === "fulfilled" && result.value) {
      allJobs.push(...result.value);
    } else if (result.status === "rejected") {
      console.error(`  Scrape failed: ${result.reason}`);
    }
  }

  // Step 4: Apply filters
  const filtered = filterJobs(allJobs, options);

  return {
    company: companyName,
    matches,
    jobs: filtered,
    totalJobs: allJobs.length,
    scrapedAt: new Date().toISOString(),
    duration: Date.now() - start,
  };
}

/**
 * Scrape jobs from a specific ATS for given slugs, normalize to UnifiedJob.
 */
async function scrapeFromAts(
  ats: SlugSource,
  slugs: string[],
  concurrency?: number,
): Promise<UnifiedJob[]> {
  const adapter = await getAdapter(ats);
  const companies = await adapter.scrapeAll(slugs, { concurrency: concurrency ?? 5 });

  if (!companies || companies.length === 0) return [];

  const rawJobs = flattenCompanyJobs(companies);
  if (rawJobs.length === 0) return [];

  return adapter.normalize(rawJobs);
}

/**
 * Scrape a specific company on a specific ATS (when you already know the slug + platform).
 * Skips resolution entirely.
 */
export async function getJobsDirect(
  slug: string,
  ats: SlugSource,
  options?: SearchOptions,
): Promise<SearchResult> {
  const start = Date.now();
  const match: CompanyMatch = { company: slug, slug, ats, confidence: "exact" };

  const jobs = await scrapeFromAts(ats, [slug]);
  const filtered = filterJobs(jobs, options);

  return {
    company: slug,
    matches: [match],
    jobs: filtered,
    totalJobs: jobs.length,
    scrapedAt: new Date().toISOString(),
    duration: Date.now() - start,
  };
}
