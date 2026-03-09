import type { UnifiedJob } from "../types.js";
import { classifyRegion, inferCountry } from "../region.js";
import { slugify, generateId, snippet, stripHtml } from "../utils.js";

/**
 * Raw Recruitee job shape (from recruitee-jobs scraper).
 * Jobs arrive with `_company` and `_slug` attached by the ingest orchestrator.
 */
interface RawRecruiteeJob {
  id: number;
  title: string;
  slug?: string;
  department?: string;
  location?: string;
  country?: string;
  city?: string;
  state?: string;
  remote?: boolean;
  description?: string;
  requirements?: string;
  careersUrl?: string;
  publishedAt?: string;
  createdAt?: string;
  tags?: string[];
  employmentType?: string;
  minHours?: number | null;
  maxHours?: number | null;
  descriptionPlain?: string;
  // Attached by orchestrator
  _company?: string;
  _slug?: string;
  _scrapedAt?: string;
}

export function normalize(rawJobs: RawRecruiteeJob[]): UnifiedJob[] {
  return rawJobs.map((raw) => {
    const sourceId = String(raw.id ?? "");
    const company = raw._company ?? "";

    // Use the location field, or build from city/state/country
    const location =
      raw.location ||
      [raw.city, raw.state, raw.country].filter(Boolean).join(", ") ||
      "";

    const isRemote = raw.remote ?? /remote/i.test(location);
    const country = raw.country ?? inferCountry(location);

    const plainText =
      raw.descriptionPlain ?? stripHtml(raw.description ?? "");

    const tags = raw.tags ?? [];

    return {
      id: generateId("recruitee", sourceId),
      source: "recruitee" as const,
      sourceId,
      company,
      companySlug: raw._slug ?? slugify(company),
      title: raw.title ?? "",
      department: raw.department ?? "",
      location,
      country,
      region: classifyRegion(location, country, isRemote),
      isRemote,
      employmentType: raw.employmentType ?? "",
      salary: "",
      applyUrl: raw.careersUrl ?? "",
      jobUrl: raw.careersUrl ?? "",
      publishedAt: raw.publishedAt ?? raw.createdAt ?? "",
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      tags: tags.length > 0 ? JSON.stringify(tags) : "",
      descriptionSnippet: snippet(plainText),
      lastSeenAt: new Date().toISOString(),
    };
  });
}
