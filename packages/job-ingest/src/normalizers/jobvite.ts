import type { UnifiedJob } from "../unified-schema.js";
import { slugify, generateId, snippet, stripHtml } from "../utils.js";
import {
  parseSalary,
  inferSeniority,
  normalizeEmploymentType,
  normalizeWorkplaceType,
  buildLocation,
} from "./helpers.js";

interface RawJobviteJob {
  id?: string;
  title?: string;
  requisitionId?: string;
  category?: string;
  jobType?: string;
  location?: string;
  date?: string;
  detailUrl?: string;
  applyUrl?: string;
  description?: string;
  department?: string;
  remoteType?: string;
  _company?: string;
  _slug?: string;
  _scrapedAt?: string;
}

export function normalize(rawJobs: RawJobviteJob[]): UnifiedJob[] {
  return rawJobs.map((raw) => {
    const sourceId = raw.id ?? "";
    const companyName = raw._company ?? "";
    const companySlug = raw._slug ?? slugify(companyName);
    const locationText = raw.location ?? "";
    const remoteType = raw.remoteType ?? "";
    const isRemote = /remote/i.test(remoteType) && !/no\s*remote/i.test(remoteType);
    const descriptionHtml = raw.description ?? null;
    const descriptionPlain = descriptionHtml ? stripHtml(descriptionHtml) : "";
    const department = raw.department ?? "";
    const category = raw.category ?? "";

    // Parse Jobvite date format "M/D/YYYY" to ISO
    const publishedAt = parseJobviteDate(raw.date ?? "");

    return {
      id: generateId("jobvite", sourceId),
      sourceId,
      title: raw.title ?? "",
      description: descriptionPlain,
      descriptionSnippet: snippet(descriptionPlain),
      descriptionHtml,
      department,
      team: "",
      category,
      location: buildLocation({ text: locationText }),
      secondaryLocations: [],
      workplaceType: normalizeWorkplaceType(remoteType, isRemote, locationText),
      employmentType: normalizeEmploymentType(raw.jobType ?? ""),
      employmentTypeRaw: raw.jobType ?? "",
      seniorityLevel: inferSeniority(raw.title ?? ""),
      salary: parseSalary(""), // Jobvite XML does not include salary info
      jobUrl: raw.detailUrl ?? "",
      applyUrl: raw.applyUrl ?? "",
      company: {
        name: companyName,
        slug: companySlug,
        ats: "jobvite",
        logoUrl: null,
        careersUrl: `https://jobs.jobvite.com/${companySlug}`,
      },
      tags: extractTags(raw),
      publishedAt,
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
  });
}

function parseJobviteDate(dateStr: string): string {
  if (!dateStr) return "";
  // Format: "M/D/YYYY"
  const parts = dateStr.split("/");
  if (parts.length !== 3) return dateStr;
  const [month, day, year] = parts;
  const m = month!.padStart(2, "0");
  const d = day!.padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function extractTags(raw: RawJobviteJob): string[] {
  const tags: string[] = [];
  if (raw.category && !tags.includes(raw.category)) tags.push(raw.category);
  if (raw.department && raw.department !== raw.category && !tags.includes(raw.department)) {
    tags.push(raw.department);
  }
  if (raw.jobType && !tags.includes(raw.jobType)) tags.push(raw.jobType);
  if (raw.remoteType && raw.remoteType !== "No Remote" && !tags.includes(raw.remoteType)) {
    tags.push(raw.remoteType);
  }
  return tags;
}
