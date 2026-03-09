import type { UnifiedJob } from "../types.js";
import { classifyRegion, inferCountry } from "../region.js";
import { slugify, generateId, snippet, stripHtml } from "../utils.js";

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
    const company = raw._company ?? raw.company?.name ?? "";
    const loc = raw.location ?? {};
    const locationParts = [loc.city, loc.region, loc.country].filter(Boolean);
    const location = locationParts.join(", ");
    const isRemote = loc.remote ?? /remote/i.test(location);
    const country = loc.country ? inferCountry(loc.country) : inferCountry(location);

    const descriptionParts = [
      raw.descriptionHtml ?? "",
      raw.qualificationsHtml ?? "",
      raw.additionalInfoHtml ?? "",
    ].filter(Boolean);
    const description = stripHtml(descriptionParts.join(" "));

    const tags: string[] = [];
    if (raw.experienceLevel?.label) tags.push(raw.experienceLevel.label);
    if (raw.industry?.label) tags.push(raw.industry.label);
    if (raw.function?.label) tags.push(raw.function.label);

    return {
      id: generateId("smartrecruiters", sourceId),
      source: "smartrecruiters" as const,
      sourceId,
      company,
      companySlug: raw._slug ?? slugify(company),
      title: raw.name ?? "",
      department: raw.department?.label ?? "",
      location,
      country,
      region: classifyRegion(location, country, isRemote),
      isRemote,
      employmentType: raw.typeOfEmployment?.label ?? "",
      salary: "",
      applyUrl: raw.ref ?? "",
      jobUrl: raw.ref ?? "",
      publishedAt: raw.releasedDate ?? "",
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      tags: tags.length > 0 ? JSON.stringify(tags) : "",
      descriptionSnippet: snippet(description),
      lastSeenAt: new Date().toISOString(),
    };
  });
}
