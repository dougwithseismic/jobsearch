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
    const companyName = raw._company ?? "";
    const companySlug = raw._slug ?? slugify(companyName);
    const isRemote = raw.remote ?? /remote/i.test(raw.location ?? "");
    const employmentRaw = raw.employmentType ?? "";

    const descriptionHtml = raw.description ?? null;
    const descriptionPlain = raw.descriptionPlain ?? stripHtml(raw.description ?? "");

    return {
      id: generateId("recruitee", sourceId),
      sourceId,
      title: raw.title ?? "",
      description: descriptionPlain,
      descriptionSnippet: snippet(descriptionPlain),
      descriptionHtml,
      department: raw.department ?? "",
      team: "",
      category: "",
      location: buildLocation({
        text: raw.location ?? undefined,
        city: raw.city ?? null,
        state: raw.state ?? null,
        country: raw.country ?? null,
      }),
      secondaryLocations: [],
      workplaceType: normalizeWorkplaceType(undefined, isRemote, raw.location ?? undefined),
      employmentType: normalizeEmploymentType(employmentRaw),
      employmentTypeRaw: employmentRaw,
      seniorityLevel: inferSeniority(raw.title ?? ""),
      salary: parseSalary(""),
      jobUrl: raw.careersUrl ?? "",
      applyUrl: raw.careersUrl ?? "",
      company: {
        name: companyName,
        slug: companySlug,
        ats: "recruitee",
        logoUrl: null,
        careersUrl: null,
      },
      tags: raw.tags ?? [],
      publishedAt: raw.publishedAt ?? raw.createdAt ?? "",
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
  });
}
