import type { UnifiedJob } from "../types.js";
import { classifyRegion, inferCountry } from "../region.js";
import { slugify, generateId, snippet } from "../utils.js";

/**
 * Raw BreezyHR job shape (from breezyhr-jobs scraper).
 * Jobs arrive with `_company`, `_slug`, `_scrapedAt` attached by the ingest orchestrator.
 */
interface RawBreezyJob {
  id: string;
  friendlyId: string;
  name: string;
  url: string;
  publishedDate: string;
  type: { id: string; name: string };
  location: {
    country: { name: string; id: string } | null;
    state: { id: string; name: string } | null;
    city: string;
    primary: boolean;
    isRemote: boolean;
    name: string;
  };
  department: string;
  salary: string;
  company: {
    name: string;
    logoUrl: string | null;
    friendlyId: string;
    isMultipleLocationsEnabled: boolean;
  };
  locations?: Array<{
    country: { name: string; id: string } | null;
    countryCode: string;
    city: string;
    region: string;
    hidden: boolean;
  }>;
  // Attached by orchestrator
  _company?: string;
  _slug?: string;
  _scrapedAt?: string;
}

export function normalize(rawJobs: RawBreezyJob[]): UnifiedJob[] {
  return rawJobs.map((raw) => {
    const sourceId = raw.id ?? "";
    const company = raw._company ?? raw.company?.name ?? "";
    const loc = raw.location ?? {};

    // Build location string from the location object
    const locationParts = [
      loc.city,
      loc.state?.name,
      loc.country?.name,
    ].filter(Boolean);
    const location = loc.name || locationParts.join(", ");

    const isRemote = loc.isRemote ?? /remote/i.test(location);

    // Try to get country code from locations array first, then infer from location name
    const firstLocation = raw.locations?.[0];
    const countryCode = firstLocation?.countryCode
      ? firstLocation.countryCode
      : inferCountry(loc.country?.name ?? location);

    return {
      id: generateId("breezyhr", sourceId),
      source: "breezyhr" as const,
      sourceId,
      company,
      companySlug: raw._slug ?? slugify(company),
      title: raw.name ?? "",
      department: raw.department ?? "",
      location,
      country: countryCode,
      region: classifyRegion(location, countryCode, isRemote),
      isRemote,
      employmentType: raw.type?.name ?? "",
      salary: raw.salary ?? "",
      applyUrl: raw.url ?? "",
      jobUrl: raw.url ?? "",
      publishedAt: raw.publishedDate ?? "",
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      tags: "",
      descriptionSnippet: "",
      lastSeenAt: new Date().toISOString(),
    };
  });
}
