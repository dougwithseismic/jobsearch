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
 * Raw Personio job shape (from personio-jobs scraper).
 * Jobs arrive with `_company`, `_slug`, `_scrapedAt` attached by the ingest orchestrator.
 */
interface RawPersonioJob {
  id: number;
  name: string;
  department: string;
  office: string;
  recruitingCategory: string;
  employmentType: string;
  seniority: string;
  schedule: string;
  yearsOfExperience: string;
  keywords: string;
  occupation: string;
  occupationCategory: string;
  createdAt: string;
  jobDescriptions?: Array<{
    name: string;
    value: string;
  }>;
  // Attached by orchestrator
  _company?: string;
  _slug?: string;
  _scrapedAt?: string;
}

export function normalize(rawJobs: RawPersonioJob[]): UnifiedJob[] {
  return rawJobs.map((raw) => {
    const sourceId = String(raw.id ?? "");
    const companyName = raw._company ?? "";
    const companySlug = raw._slug ?? slugify(companyName);
    const locationText = raw.office ?? "";
    const isRemote = /remote/i.test(locationText);
    const employmentRaw = raw.employmentType ?? "";

    // Build description from job description sections
    const descriptionParts = (raw.jobDescriptions ?? [])
      .map((d) => d.value)
      .filter(Boolean);
    const descriptionHtml = descriptionParts.length > 0 ? descriptionParts.join("\n") : null;
    const descriptionPlain = stripHtml(descriptionParts.join(" "));

    // Tags from keywords and schedule
    const tags: string[] = [];
    if (raw.keywords) {
      tags.push(...raw.keywords.split(",").map((k) => k.trim()).filter(Boolean));
    }
    if (raw.schedule) tags.push(raw.schedule);

    // Personio job URLs follow the pattern: https://{slug}.jobs.personio.de/job/{id}
    const jobUrl = `https://${companySlug}.jobs.personio.de/job/${raw.id}`;

    return {
      id: generateId("personio", sourceId),
      sourceId,
      title: raw.name ?? "",
      description: descriptionPlain,
      descriptionSnippet: snippet(descriptionPlain),
      descriptionHtml,
      department: raw.department ?? "",
      team: "",
      category: raw.recruitingCategory ?? "",
      location: buildLocation({ text: locationText }),
      secondaryLocations: [],
      workplaceType: normalizeWorkplaceType(undefined, isRemote, locationText),
      employmentType: normalizeEmploymentType(employmentRaw),
      employmentTypeRaw: employmentRaw,
      seniorityLevel: inferSeniority(raw.name ?? "", raw.seniority),
      salary: parseSalary(""),
      jobUrl,
      applyUrl: jobUrl,
      company: {
        name: companyName,
        slug: companySlug,
        ats: "personio",
        logoUrl: null,
        careersUrl: `https://${companySlug}.jobs.personio.de`,
      },
      tags,
      publishedAt: raw.createdAt ?? "",
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
  });
}
