import type { UnifiedJob } from "../types.js";
import { classifyRegion, inferCountry } from "../region.js";
import { slugify, generateId, snippet, stripHtml } from "../utils.js";

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
    const company = raw._company ?? "";
    const location = raw.office ?? "";
    const isRemote = /remote/i.test(location);
    const country = inferCountry(location);

    // Build description from job description sections
    const descriptionParts = (raw.jobDescriptions ?? [])
      .map((d) => d.value)
      .filter(Boolean);
    const description = stripHtml(descriptionParts.join(" "));

    // Build tags from available metadata
    const tags: string[] = [];
    if (raw.seniority) tags.push(raw.seniority);
    if (raw.recruitingCategory) tags.push(raw.recruitingCategory);
    if (raw.occupation) tags.push(raw.occupation);
    if (raw.keywords) {
      // keywords may be comma-separated
      tags.push(...raw.keywords.split(",").map((k) => k.trim()).filter(Boolean));
    }

    // Personio job URLs follow the pattern: https://{slug}.jobs.personio.de/job/{id}
    const slug = raw._slug ?? slugify(company);
    const jobUrl = `https://${slug}.jobs.personio.de/job/${raw.id}`;

    return {
      id: generateId("personio", sourceId),
      source: "personio" as const,
      sourceId,
      company,
      companySlug: slug,
      title: raw.name ?? "",
      department: raw.department ?? "",
      location,
      country,
      region: classifyRegion(location, country, isRemote),
      isRemote,
      employmentType: raw.employmentType ?? "",
      salary: "",
      applyUrl: jobUrl,
      jobUrl,
      publishedAt: raw.createdAt ?? "",
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      tags: tags.length > 0 ? JSON.stringify(tags) : "",
      descriptionSnippet: snippet(description),
      lastSeenAt: new Date().toISOString(),
    };
  });
}
