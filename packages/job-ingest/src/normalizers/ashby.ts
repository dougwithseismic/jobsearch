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
 * Raw Ashby job shape (from ashby-jobs scraper).
 * Jobs arrive with `_company` and `_slug` attached by the ingest orchestrator.
 */
interface RawAshbyJob {
  id: string;
  title: string;
  department?: string;
  team?: string;
  employmentType?: string;
  workplaceType?: string;
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
  secondaryLocations?: Array<{
    location?: string;
    address?: {
      postalAddress?: {
        addressLocality?: string;
        addressRegion?: string;
        addressCountry?: string;
      };
    };
  }>;
  // Attached by orchestrator
  _company?: string;
  _slug?: string;
  _scrapedAt?: string;
}

export function normalize(rawJobs: RawAshbyJob[]): UnifiedJob[] {
  return rawJobs.map((raw) => {
    const sourceId = raw.id ?? "";
    const companyName = raw._company ?? "";
    const companySlug = raw._slug ?? slugify(companyName);
    const locationText = raw.location ?? "";
    const employmentRaw = raw.employmentType ?? "";

    const postal = raw.address?.postalAddress;
    const description = raw.descriptionPlain ?? stripHtml(raw.descriptionHtml ?? "");

    const primaryLocation = buildLocation({
      text: locationText,
      city: postal?.addressLocality ?? null,
      state: postal?.addressRegion ?? null,
      country: postal?.addressCountry ?? null,
    });

    const secondaryLocations = (raw.secondaryLocations ?? []).map((loc) => {
      const p = loc.address?.postalAddress;
      return buildLocation({
        text: loc.location ?? "",
        city: p?.addressLocality ?? null,
        state: p?.addressRegion ?? null,
        country: p?.addressCountry ?? null,
      });
    });

    return {
      id: generateId("ashby", sourceId),
      sourceId,
      title: raw.title ?? "",
      description,
      descriptionSnippet: snippet(description),
      descriptionHtml: raw.descriptionHtml ?? null,
      department: raw.department ?? "",
      team: raw.team ?? "",
      category: "",
      location: primaryLocation,
      secondaryLocations,
      workplaceType: normalizeWorkplaceType(raw.workplaceType, raw.isRemote, locationText),
      employmentType: normalizeEmploymentType(employmentRaw),
      employmentTypeRaw: employmentRaw,
      seniorityLevel: inferSeniority(raw.title ?? ""),
      salary: parseSalary(raw.compensationTierSummary ?? ""),
      jobUrl: raw.jobUrl ?? "",
      applyUrl: raw.applyUrl ?? "",
      company: {
        name: companyName,
        slug: companySlug,
        ats: "ashby",
        logoUrl: null,
        careersUrl: null,
      },
      tags: extractTags(raw),
      publishedAt: raw.publishedAt ?? "",
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
  });
}

function extractTags(raw: RawAshbyJob): string[] {
  const tags: string[] = [];
  if (raw.department) tags.push(raw.department);
  if (raw.team && raw.team !== raw.department) tags.push(raw.team);
  if (raw.workplaceType) tags.push(raw.workplaceType);
  return tags;
}
