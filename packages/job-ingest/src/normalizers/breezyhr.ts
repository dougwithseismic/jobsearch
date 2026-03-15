import type { UnifiedJob } from "../unified-schema.js";
import { slugify, generateId, snippet } from "../utils.js";
import {
  parseSalary,
  inferSeniority,
  normalizeEmploymentType,
  normalizeWorkplaceType,
  buildLocation,
} from "./helpers.js";

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
    const companyName = raw._company ?? raw.company?.name ?? "";
    const companySlug = raw._slug ?? slugify(companyName);
    const loc = raw.location ?? {};
    const isRemote = loc.isRemote ?? false;
    const employmentRaw = raw.type?.name ?? "";

    // Primary location from the location object
    const firstExtra = raw.locations?.[0];
    const primaryLocation = buildLocation({
      text: loc.name || undefined,
      city: loc.city ?? null,
      state: loc.state?.name ?? null,
      country: loc.country?.name ?? null,
      countryCode: firstExtra?.countryCode ?? null,
    });

    // Secondary locations from the locations array
    const secondaryLocations = (raw.locations ?? []).slice(1)
      .filter((l) => !l.hidden)
      .map((l) =>
        buildLocation({
          city: l.city ?? null,
          state: l.region ?? null,
          country: l.country?.name ?? null,
          countryCode: l.countryCode ?? null,
        }),
      );

    return {
      id: generateId("breezyhr", sourceId),
      sourceId,
      title: raw.name ?? "",
      description: "",
      descriptionSnippet: "",
      descriptionHtml: null,
      department: raw.department ?? "",
      team: "",
      category: "",
      location: primaryLocation,
      secondaryLocations,
      workplaceType: normalizeWorkplaceType(undefined, isRemote, loc.name ?? undefined),
      employmentType: normalizeEmploymentType(employmentRaw),
      employmentTypeRaw: employmentRaw,
      seniorityLevel: inferSeniority(raw.name ?? ""),
      salary: parseSalary(raw.salary ?? ""),
      jobUrl: raw.url ?? "",
      applyUrl: raw.url ?? "",
      company: {
        name: companyName,
        slug: companySlug,
        ats: "breezyhr",
        logoUrl: raw.company?.logoUrl ?? null,
        careersUrl: null,
      },
      tags: [],
      publishedAt: raw.publishedDate ?? "",
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
  });
}
