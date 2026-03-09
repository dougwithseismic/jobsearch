import type { UnifiedJob } from "../types.js";
import { classifyRegion, inferCountry } from "../region.js";
import { slugify, generateId, snippet, stripHtml } from "../utils.js";

/**
 * Raw Workable job shape (from workable-jobs scraper).
 * Jobs arrive with `_company` and `_slug` attached by the ingest orchestrator.
 */
interface RawWorkableJob {
  shortcode: string;
  title: string;
  department?: string;
  employmentType?: string;
  isRemote?: boolean;
  telecommuting?: boolean;
  country?: string;
  city?: string;
  state?: string;
  locations?: Array<{
    country: string;
    countryCode: string;
    city: string;
    region: string;
  }>;
  experience?: string;
  industry?: string;
  publishedAt?: string;
  createdAt?: string;
  jobUrl?: string;
  applyUrl?: string;
  descriptionHtml?: string;
  // Attached by orchestrator
  _company?: string;
  _slug?: string;
  _scrapedAt?: string;
}

export function normalize(rawJobs: RawWorkableJob[]): UnifiedJob[] {
  return rawJobs.map((raw) => {
    const sourceId = raw.shortcode ?? "";
    const company = raw._company ?? "";

    // Build location string from city, state, country
    const parts = [raw.city, raw.state, raw.country].filter(Boolean);
    const location = parts.join(", ") || "";

    const isRemote = raw.isRemote ?? raw.telecommuting ?? false;
    const country =
      raw.locations?.[0]?.countryCode ?? inferCountry(raw.country ?? location);

    const description = stripHtml(raw.descriptionHtml ?? "");

    // Tags from experience/industry if present
    const tags = [raw.experience, raw.industry].filter(Boolean);

    return {
      id: generateId("workable", sourceId),
      source: "workable" as const,
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
      applyUrl: raw.applyUrl ?? "",
      jobUrl: raw.jobUrl ?? "",
      publishedAt: raw.publishedAt ?? raw.createdAt ?? "",
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      tags: tags.length > 0 ? JSON.stringify(tags) : "",
      descriptionSnippet: snippet(description),
      lastSeenAt: new Date().toISOString(),
    };
  });
}
