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
 * Raw SmartRecruiters job shape (from smartrecruiters-jobs scraper).
 * Jobs arrive with `_company`, `_slug`, `_scrapedAt` attached by the ingest orchestrator.
 */
interface RawSmartRecruitersJob {
  id: string;
  uuid: string;
  name: string;
  refNumber: string;
  company: {
    name: string;
    identifier: string;
  };
  location: {
    city: string;
    region: string;
    country: string;
    remote: boolean;
  };
  department: {
    label: string;
  };
  typeOfEmployment: {
    label: string;
  };
  experienceLevel?: {
    label: string;
  };
  industry?: {
    label: string;
  };
  function?: {
    label: string;
  };
  releasedDate: string;
  ref: string;
  descriptionHtml?: string;
  qualificationsHtml?: string;
  additionalInfoHtml?: string;
  // Attached by orchestrator
  _company?: string;
  _slug?: string;
  _scrapedAt?: string;
}

export function normalize(rawJobs: RawSmartRecruitersJob[]): UnifiedJob[] {
  return rawJobs.map((raw) => {
    const sourceId = raw.id ?? "";
    const companyName = raw._company ?? raw.company?.name ?? "";
    const companySlug = raw._slug ?? slugify(companyName);
    const loc = raw.location ?? {};
    const isRemote = loc.remote ?? false;
    const employmentRaw = raw.typeOfEmployment?.label ?? "";

    const descriptionParts = [
      raw.descriptionHtml ?? "",
      raw.qualificationsHtml ?? "",
      raw.additionalInfoHtml ?? "",
    ].filter(Boolean);
    const descriptionHtml = descriptionParts.join("\n") || null;
    const descriptionPlain = stripHtml(descriptionParts.join(" "));

    // Tags from industry label
    const tags: string[] = [];
    if (raw.industry?.label) tags.push(raw.industry.label);

    return {
      id: generateId("smartrecruiters", sourceId),
      sourceId,
      title: raw.name ?? "",
      description: descriptionPlain,
      descriptionSnippet: snippet(descriptionPlain),
      descriptionHtml,
      department: raw.department?.label ?? "",
      team: "",
      category: raw.function?.label ?? "",
      location: buildLocation({
        city: loc.city ?? null,
        state: loc.region ?? null,
        country: loc.country ?? null,
      }),
      secondaryLocations: [],
      workplaceType: normalizeWorkplaceType(undefined, isRemote, [loc.city, loc.region, loc.country].filter(Boolean).join(", ")),
      employmentType: normalizeEmploymentType(employmentRaw),
      employmentTypeRaw: employmentRaw,
      seniorityLevel: inferSeniority(raw.name ?? "", raw.experienceLevel?.label),
      salary: parseSalary(""),
      jobUrl: raw.ref ?? "",
      applyUrl: raw.ref ?? "",
      company: {
        name: companyName,
        slug: companySlug,
        ats: "smartrecruiters",
        logoUrl: null,
        careersUrl: null,
      },
      tags,
      publishedAt: raw.releasedDate ?? "",
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
  });
}
