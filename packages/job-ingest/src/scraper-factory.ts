import type { UnifiedJob, Source } from "./types.js";

/**
 * Standardized raw output from any ATS scraper.
 */
export interface RawCompanyJobs {
  company: string;
  slug: string;
  jobs: Record<string, unknown>[];
}

/**
 * Unified scraper adapter interface.
 * Each adapter wraps a specific ATS scraper's quirks behind a common interface.
 */
export interface ScraperAdapter {
  source: Source;
  discoverSlugs(opts?: { quiet?: boolean }): Promise<string[]>;
  scrapeAll(slugs: string[], opts?: { concurrency?: number }): Promise<RawCompanyJobs[]>;
  normalize(rawJobs: Record<string, unknown>[]): UnifiedJob[];
}

/**
 * Build an adapter for a slug-based ATS scraper (ashby, lever, workable, recruitee, smartrecruiters, breezyhr).
 * These all export discoverSlugs() and scrapeAll() with the same shape, differing only
 * in whether they call the content flag `includeDescriptions` or `includeContent`.
 */
function makeSlugAdapter(
  source: Source,
  contentFlag: "includeDescriptions" | "includeContent" | "none",
): ScraperAdapter {
  return {
    source,
    async discoverSlugs(opts) {
      const scraper = await import(`../../${source}-jobs/src/index.js`);
      return scraper.discoverSlugs({ quiet: true }) as Promise<string[]>;
    },
    async scrapeAll(slugs, opts) {
      const scraper = await import(`../../${source}-jobs/src/index.js`);
      const scrapeOpts: Record<string, unknown> = {
        concurrency: opts?.concurrency ?? 10,
      };
      if (contentFlag !== "none") {
        scrapeOpts[contentFlag] = false;
      }
      const companies: Array<{ company?: string; slug: string; jobs?: unknown[] }> =
        (await scraper.scrapeAll(slugs, scrapeOpts)) ?? [];

      return companies.map((c) => ({
        company: c.company || c.slug,
        slug: c.slug,
        jobs: (c.jobs ?? []) as Record<string, unknown>[],
      }));
    },
    normalize: null as unknown as ScraperAdapter["normalize"], // set below
  };
}

/**
 * Build the HN adapter, which has a completely different interface (no slugs).
 */
function makeHnAdapter(): ScraperAdapter {
  return {
    source: "hn",
    async discoverSlugs() {
      // HN has no slug discovery — return empty array
      return [];
    },
    async scrapeAll(_slugs, opts) {
      const { scrapeJobs } = await import("../../hn-jobs/src/index.js");
      const result = await scrapeJobs({ months: 1 });
      const jobs = (result || []) as unknown as Record<string, unknown>[];
      // HN returns flat jobs, wrap them as a single "company"
      return [{ company: "hn", slug: "hn", jobs }];
    },
    normalize: null as unknown as ScraperAdapter["normalize"],
  };
}

// Map source to its content flag name
const CONTENT_FLAGS: Record<Source, "includeDescriptions" | "includeContent" | "none" | "hn"> = {
  ashby: "includeDescriptions",
  lever: "includeDescriptions",
  workable: "includeDescriptions",
  recruitee: "includeDescriptions",
  smartrecruiters: "includeDescriptions",
  breezyhr: "none",
  greenhouse: "includeContent",
  personio: "includeContent",
  hn: "hn",
};

/**
 * Get a unified scraper adapter for any source.
 * Caches the normalizer import so it's only loaded once per call.
 */
export async function getAdapter(source: Source): Promise<ScraperAdapter> {
  const normalizerModule = await import(`./normalizers/${source}.js`);
  const normalize = normalizerModule.normalize as ScraperAdapter["normalize"];

  if (source === "hn") {
    const adapter = makeHnAdapter();
    adapter.normalize = normalize;
    return adapter;
  }

  const flag = CONTENT_FLAGS[source];
  const adapter = makeSlugAdapter(source, flag as "includeDescriptions" | "includeContent" | "none");
  adapter.normalize = normalize;
  return adapter;
}

/**
 * Flatten RawCompanyJobs into raw job records with _company/_slug attached.
 * This is what the normalizers expect for slug-based scrapers.
 */
export function flattenCompanyJobs(companies: RawCompanyJobs[]): Record<string, unknown>[] {
  const rawJobs: Record<string, unknown>[] = [];
  for (const company of companies) {
    for (const job of company.jobs) {
      rawJobs.push({
        ...job,
        _company: company.company,
        _slug: company.slug,
      });
    }
  }
  return rawJobs;
}
