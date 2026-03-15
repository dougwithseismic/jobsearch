import type { UnifiedJob } from "../unified-schema.js";
import { slugify, generateId, snippet, stripHtml } from "../utils.js";
import {
  parseSalary,
  inferSeniority,
  normalizeEmploymentType,
  normalizeWorkplaceType,
  buildLocation,
} from "./helpers.js";

interface RawBambooHRJob {
  id: string;
  jobOpeningName: string;
  departmentId?: string;
  departmentLabel?: string;
  employmentStatusLabel?: string;
  location?: {
    city?: string;
    state?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  atsLocation?: {
    country?: string | null;
    state?: string | null;
    city?: string | null;
  };
  isRemote?: boolean | null;
  locationType?: string;
  description?: string;
  jobOpeningShareUrl?: string;
  compensation?: string | null;
  datePosted?: string;
  minimumExperience?: string | null;
  _company?: string;
  _slug?: string;
  _scrapedAt?: string;
}

export function normalize(rawJobs: RawBambooHRJob[]): UnifiedJob[] {
  return rawJobs.map((raw) => {
    const sourceId = String(raw.id ?? "");
    const companyName = raw._company ?? "";
    const companySlug = raw._slug ?? slugify(companyName);

    const city = raw.location?.city ?? "";
    const state = raw.location?.state ?? "";
    const country = raw.location?.addressCountry ?? null;
    const locationText = [city, state, country].filter(Boolean).join(", ");
    const isRemote = raw.isRemote === true || /remote/i.test(locationText);

    const department = raw.departmentLabel ?? "";
    const descriptionPlain = raw.description ? stripHtml(raw.description) : "";
    const salaryRaw = raw.compensation ?? "";
    const employmentRaw = raw.employmentStatusLabel ?? "";

    const shareUrl = raw.jobOpeningShareUrl ?? `https://${companySlug}.bamboohr.com/careers/${sourceId}`;

    return {
      id: generateId("bamboohr", sourceId),
      sourceId,
      title: raw.jobOpeningName ?? "",
      description: descriptionPlain,
      descriptionSnippet: snippet(descriptionPlain),
      descriptionHtml: raw.description ?? null,
      department,
      team: "",
      category: "",
      location: buildLocation({
        text: locationText,
        city: city || null,
        state: state || null,
        country,
      }),
      secondaryLocations: [],
      workplaceType: normalizeWorkplaceType(undefined, isRemote, locationText),
      employmentType: normalizeEmploymentType(employmentRaw),
      employmentTypeRaw: employmentRaw,
      seniorityLevel: inferSeniority(raw.jobOpeningName ?? ""),
      salary: parseSalary(salaryRaw),
      jobUrl: shareUrl,
      applyUrl: shareUrl,
      company: {
        name: companyName,
        slug: companySlug,
        ats: "bamboohr",
        logoUrl: null,
        careersUrl: `https://${companySlug}.bamboohr.com/careers`,
      },
      tags: extractTags(raw),
      publishedAt: raw.datePosted ?? "",
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
  });
}

function extractTags(raw: RawBambooHRJob): string[] {
  const tags: string[] = [];
  if (raw.departmentLabel && !tags.includes(raw.departmentLabel)) {
    tags.push(raw.departmentLabel);
  }
  if (raw.employmentStatusLabel && !tags.includes(raw.employmentStatusLabel)) {
    tags.push(raw.employmentStatusLabel);
  }
  if (raw.isRemote) {
    tags.push("Remote");
  }
  return tags;
}
