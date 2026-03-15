import type { UnifiedJob } from "../unified-schema.js";
import { slugify, generateId, snippet, stripHtml } from "../utils.js";
import {
  parseSalary,
  inferSeniority,
  normalizeEmploymentType,
  normalizeWorkplaceType,
  buildLocation,
} from "./helpers.js";

interface RawGreenhouseJob {
  id: number;
  title: string;
  location?: string;
  departments?: string[];
  offices?: string[];
  content?: string;
  updatedAt?: string;
  absoluteUrl?: string;
  internalJobId?: number;
  metadata?: Array<{
    id: number;
    name: string;
    value: string | string[] | null;
    valueType: string;
  }>;
  _company?: string;
  _slug?: string;
  _scrapedAt?: string;
}

export function normalize(rawJobs: RawGreenhouseJob[]): UnifiedJob[] {
  return rawJobs.map((raw) => {
    const sourceId = String(raw.id ?? "");
    const companyName = raw._company ?? "";
    const companySlug = raw._slug ?? slugify(companyName);
    const locationText = raw.location ?? "";
    const isRemote = /remote/i.test(locationText);
    const department = (raw.departments ?? []).join(", ");
    const descriptionPlain = raw.content ? stripHtml(raw.content) : "";

    const salaryRaw = extractMetadata(raw.metadata, "Salary")
      ?? extractMetadata(raw.metadata, "Compensation") ?? "";
    const employmentRaw = extractMetadata(raw.metadata, "Employment") ?? "";

    return {
      id: generateId("greenhouse", sourceId),
      sourceId,
      title: raw.title ?? "",
      description: descriptionPlain,
      descriptionSnippet: snippet(descriptionPlain),
      descriptionHtml: raw.content ?? null,
      department,
      team: "",
      category: "",
      location: buildLocation({ text: locationText }),
      secondaryLocations: [],
      workplaceType: normalizeWorkplaceType(undefined, isRemote, locationText),
      employmentType: normalizeEmploymentType(employmentRaw),
      employmentTypeRaw: employmentRaw,
      seniorityLevel: inferSeniority(raw.title ?? ""),
      salary: parseSalary(salaryRaw),
      jobUrl: raw.absoluteUrl ?? "",
      applyUrl: raw.absoluteUrl ? `${raw.absoluteUrl}#app` : "",
      company: {
        name: companyName,
        slug: companySlug,
        ats: "greenhouse",
        logoUrl: null,
        careersUrl: `https://boards.greenhouse.io/${companySlug}`,
      },
      tags: extractTags(raw),
      publishedAt: raw.updatedAt ?? "",
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
  });
}

function extractMetadata(
  metadata: RawGreenhouseJob["metadata"],
  namePrefix: string,
): string | undefined {
  if (!metadata) return undefined;
  const entry = metadata.find((m) =>
    m.name.toLowerCase().startsWith(namePrefix.toLowerCase()),
  );
  if (!entry || entry.value == null) return undefined;
  return Array.isArray(entry.value) ? entry.value.join(", ") : String(entry.value);
}

function extractTags(raw: RawGreenhouseJob): string[] {
  const tags: string[] = [];
  // Add offices as tags
  for (const office of raw.offices ?? []) {
    if (office && !tags.includes(office)) tags.push(office);
  }
  // Add departments as tags
  for (const dept of raw.departments ?? []) {
    if (dept && !tags.includes(dept)) tags.push(dept);
  }
  return tags;
}
