import type { UnifiedJob } from "../types.js";
import { classifyRegion, inferCountry } from "../region.js";
import { slugify, generateId, snippet, stripHtml } from "../utils.js";

/**
 * Raw Ashby job shape (from ashby-jobs scraper).
 * Jobs arrive with `_company` and `_slug` attached by the ingest orchestrator.
 */
interface RawAshbyJob {
  id: string;
  title: string;
  department?: string;
  team?: string;
  employmentType?: string;
  location?: string;
  isRemote?: boolean;
  publishedAt?: string;
  jobUrl?: string;
  applyUrl?: string;
  compensationTierSummary?: string;
  descriptionPlain?: string;
  descriptionHtml?: string;
  address?: {
    postalAddress?: {
      addressLocality?: string;
      addressRegion?: string;
      addressCountry?: string;
    };
  };
  // Attached by orchestrator
  _company?: string;
  _slug?: string;
  _scrapedAt?: string;
}

export function normalize(rawJobs: RawAshbyJob[]): UnifiedJob[] {
  return rawJobs.map((raw) => {
    const sourceId = raw.id ?? "";
    const company = raw._company ?? "";
    const location = raw.location ?? "";
    const isRemote = raw.isRemote ?? /remote/i.test(location);

    const country =
      raw.address?.postalAddress?.addressCountry ?? inferCountry(location);

    const description = raw.descriptionPlain ?? stripHtml(raw.descriptionHtml ?? "");

    return {
      id: generateId("ashby", sourceId),
      source: "ashby" as const,
      sourceId,
      company,
      companySlug: raw._slug ?? slugify(company),
      title: raw.title ?? "",
      department: raw.department ?? raw.team ?? "",
      location,
      country,
      region: classifyRegion(location, country, isRemote),
      isRemote,
      employmentType: raw.employmentType ?? "",
      salary: raw.compensationTierSummary ?? "",
      applyUrl: raw.applyUrl ?? "",
      jobUrl: raw.jobUrl ?? "",
      publishedAt: raw.publishedAt ?? "",
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      tags: "",
      descriptionSnippet: snippet(description),
      lastSeenAt: new Date().toISOString(),
    };
  });
}
