import type { UnifiedJob } from "../unified-schema.js";
import { slugify, generateId, snippet, stripHtml } from "../utils.js";
import {
  parseSalary,
  inferSeniority,
  normalizeEmploymentType,
  normalizeWorkplaceType,
  buildLocation,
} from "./helpers.js";

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
    const companyName = raw._company ?? "";
    const companySlug = raw._slug ?? slugify(companyName);
    const isRemote = raw.isRemote ?? raw.telecommuting ?? false;
    const descriptionPlain = stripHtml(raw.descriptionHtml ?? "");
    const employmentRaw = raw.employmentType ?? "";

    // Primary location from top-level fields
    const primaryLocation = buildLocation({
      city: raw.city ?? null,
      state: raw.state ?? null,
      country: raw.country ?? null,
      countryCode: raw.locations?.[0]?.countryCode ?? null,
    });

    // Secondary locations from the locations array (skip the first if it matches primary)
    const secondaryLocations = (raw.locations ?? []).slice(1).map((loc) =>
      buildLocation({
        city: loc.city ?? null,
        state: loc.region ?? null,
        country: loc.country ?? null,
        countryCode: loc.countryCode ?? null,
      }),
    );

    // Tags from experience/industry
    const tags: string[] = [];
    if (raw.experience) tags.push(raw.experience);
    if (raw.industry) tags.push(raw.industry);

    return {
      id: generateId("workable", sourceId),
      sourceId,
      title: raw.title ?? "",
      description: descriptionPlain,
      descriptionSnippet: snippet(descriptionPlain),
      descriptionHtml: raw.descriptionHtml ?? null,
      department: raw.department ?? "",
      team: "",
      category: raw.industry ?? "",
      location: primaryLocation,
      secondaryLocations,
      workplaceType: normalizeWorkplaceType(undefined, isRemote, [raw.city, raw.state, raw.country].filter(Boolean).join(", ")),
      employmentType: normalizeEmploymentType(employmentRaw),
      employmentTypeRaw: employmentRaw,
      seniorityLevel: inferSeniority(raw.title ?? "", raw.experience),
      salary: parseSalary(""),
      jobUrl: raw.jobUrl ?? "",
      applyUrl: raw.applyUrl ?? "",
      company: {
        name: companyName,
        slug: companySlug,
        ats: "workable",
        logoUrl: null,
        careersUrl: null,
      },
      tags,
      publishedAt: raw.publishedAt ?? raw.createdAt ?? "",
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
  });
}
