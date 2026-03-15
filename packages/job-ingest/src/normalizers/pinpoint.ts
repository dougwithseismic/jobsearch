import type { UnifiedJob } from "../unified-schema.js";
import { slugify, generateId, snippet, stripHtml } from "../utils.js";
import {
  parseSalary,
  inferSeniority,
  normalizeEmploymentType,
  normalizeWorkplaceType,
  buildLocation,
} from "./helpers.js";

interface RawPinpointJob {
  id?: string;
  title?: string;
  description?: string;
  content?: string;
  location?: {
    id?: string;
    city?: string;
    name?: string;
    postalCode?: string;
    province?: string;
  };
  department?: string;
  workplaceType?: string;
  workplaceTypeText?: string;
  employmentType?: string;
  employmentTypeText?: string;
  url?: string;
  path?: string;
  compensationVisible?: boolean;
  compensationMin?: number | null;
  compensationMax?: number | null;
  compensationCurrency?: string | null;
  compensationFrequency?: string | null;
  deadlineAt?: string | null;
  reportingTo?: string | null;
  requisitionId?: string | null;
  _company?: string;
  _slug?: string;
  _scrapedAt?: string;
}

export function normalize(rawJobs: RawPinpointJob[]): UnifiedJob[] {
  return rawJobs.map((raw) => {
    const sourceId = String(raw.id ?? "");
    const companyName = raw._company ?? "";
    const companySlug = raw._slug ?? slugify(companyName);
    const locationName = raw.location?.name ?? "";
    const locationCity = raw.location?.city ?? "";
    const locationProvince = raw.location?.province ?? "";
    const locationText = [locationCity, locationProvince, locationName].filter(Boolean).join(", ");
    const isRemote = /remote/i.test(raw.workplaceTypeText ?? "") || /remote/i.test(locationText);
    const department = raw.department ?? "";

    // Build description from content or description field
    const descriptionHtml = raw.content ?? raw.description ?? "";
    const descriptionPlain = descriptionHtml ? stripHtml(descriptionHtml) : "";

    // Build salary text from structured compensation fields
    let salaryText = "";
    if (raw.compensationVisible && raw.compensationMin != null) {
      const parts: string[] = [];
      if (raw.compensationCurrency) parts.push(raw.compensationCurrency);
      if (raw.compensationMin != null && raw.compensationMax != null) {
        parts.push(`${raw.compensationMin} - ${raw.compensationMax}`);
      } else if (raw.compensationMin != null) {
        parts.push(String(raw.compensationMin));
      }
      if (raw.compensationFrequency) parts.push(raw.compensationFrequency);
      salaryText = parts.join(" ");
    }

    const salary = parseSalary(salaryText);
    // Override with structured data if available
    if (raw.compensationVisible && raw.compensationMin != null) {
      salary.min = raw.compensationMin ?? null;
      salary.max = raw.compensationMax ?? null;
      salary.currency = raw.compensationCurrency ?? null;
      if (raw.compensationFrequency) {
        const freqMap: Record<string, "yearly" | "monthly" | "weekly" | "daily" | "hourly"> = {
          yearly: "yearly", year: "yearly", annual: "yearly", annually: "yearly",
          monthly: "monthly", month: "monthly",
          weekly: "weekly", week: "weekly",
          daily: "daily", day: "daily",
          hourly: "hourly", hour: "hourly",
        };
        salary.period = freqMap[raw.compensationFrequency.toLowerCase()] ?? null;
      }
    }

    return {
      id: generateId("pinpoint", sourceId),
      sourceId,
      title: raw.title ?? "",
      description: descriptionPlain,
      descriptionSnippet: snippet(descriptionPlain),
      descriptionHtml: descriptionHtml || null,
      department,
      team: "",
      category: "",
      location: buildLocation({
        text: locationText,
        city: locationCity || null,
        state: locationProvince || null,
        country: locationName || null,
      }),
      secondaryLocations: [],
      workplaceType: normalizeWorkplaceType(raw.workplaceTypeText, isRemote, locationText),
      employmentType: normalizeEmploymentType(raw.employmentTypeText ?? raw.employmentType ?? ""),
      employmentTypeRaw: raw.employmentTypeText ?? raw.employmentType ?? "",
      seniorityLevel: inferSeniority(raw.title ?? ""),
      salary,
      jobUrl: raw.url ?? "",
      applyUrl: raw.url ? `${raw.url}#apply` : "",
      company: {
        name: companyName,
        slug: companySlug,
        ats: "pinpoint",
        logoUrl: null,
        careersUrl: `https://${companySlug}.pinpointhq.com`,
      },
      tags: extractTags(raw),
      publishedAt: "",
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
  });
}

function extractTags(raw: RawPinpointJob): string[] {
  const tags: string[] = [];
  if (raw.department && !tags.includes(raw.department)) tags.push(raw.department);
  if (raw.workplaceTypeText && !tags.includes(raw.workplaceTypeText)) tags.push(raw.workplaceTypeText);
  if (raw.employmentTypeText && !tags.includes(raw.employmentTypeText)) tags.push(raw.employmentTypeText);
  return tags;
}
