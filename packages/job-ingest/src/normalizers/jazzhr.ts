import type { UnifiedJob } from "../unified-schema.js";
import { slugify, generateId, snippet, stripHtml } from "../utils.js";
import {
  parseSalary,
  inferSeniority,
  normalizeEmploymentType,
  normalizeWorkplaceType,
  buildLocation,
} from "./helpers.js";

interface RawJazzHRJob {
  id: string;
  title: string;
  location?: string;
  department?: string;
  applyUrl?: string;
  description?: string;
  descriptionHtml?: string;
  datePosted?: string;
  employmentType?: string;
  experienceLevel?: string;
  salary?: {
    currency: string;
    min: number | null;
    max: number | null;
    period: string;
  };
  company?: {
    name: string;
    url: string;
    logoUrl: string | null;
  };
  city?: string;
  state?: string;
  _company?: string;
  _slug?: string;
  _scrapedAt?: string;
}

export function normalize(rawJobs: RawJazzHRJob[]): UnifiedJob[] {
  return rawJobs.map((raw) => {
    const sourceId = String(raw.id ?? "");
    const companyName = raw._company ?? raw.company?.name ?? "";
    const companySlug = raw._slug ?? slugify(companyName);
    const locationText = raw.location ?? "";
    const isRemote = /remote/i.test(locationText);
    const department = raw.department ?? "";
    const descriptionPlain = raw.descriptionHtml
      ? stripHtml(raw.descriptionHtml)
      : raw.description ?? "";

    // Build salary from structured data or empty
    const salaryObj = raw.salary;
    const salaryText = salaryObj
      ? `${salaryObj.currency ?? ""} ${salaryObj.min ?? ""}–${salaryObj.max ?? ""} ${salaryObj.period ?? ""}`.trim()
      : "";

    const salary = salaryObj
      ? {
          text: salaryText,
          min: salaryObj.min,
          max: salaryObj.max,
          currency: salaryObj.currency ?? null,
          period: mapPeriod(salaryObj.period),
        }
      : parseSalary("");

    const applyUrl = raw.applyUrl ?? "";

    return {
      id: generateId("jazzhr", sourceId),
      sourceId,
      title: raw.title ?? "",
      description: descriptionPlain,
      descriptionSnippet: snippet(descriptionPlain),
      descriptionHtml: raw.descriptionHtml ?? null,
      department,
      team: "",
      category: "",
      location: buildLocation({
        text: locationText,
        city: raw.city ?? null,
        state: raw.state ?? null,
      }),
      secondaryLocations: [],
      workplaceType: normalizeWorkplaceType(undefined, isRemote, locationText),
      employmentType: normalizeEmploymentType(raw.employmentType ?? ""),
      employmentTypeRaw: raw.employmentType ?? "",
      seniorityLevel: inferSeniority(raw.title ?? "", raw.experienceLevel),
      salary,
      jobUrl: applyUrl,
      applyUrl,
      company: {
        name: companyName,
        slug: companySlug,
        ats: "jazzhr",
        logoUrl: raw.company?.logoUrl ?? null,
        careersUrl: `https://${companySlug}.applytojob.com/apply/jobs/`,
      },
      tags: department ? [department] : [],
      publishedAt: raw.datePosted ?? "",
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
  });
}

function mapPeriod(period: string | undefined): "yearly" | "monthly" | "weekly" | "daily" | "hourly" | null {
  if (!period) return null;
  const p = period.toLowerCase();
  if (p === "year" || p === "yearly" || p === "annual") return "yearly";
  if (p === "month" || p === "monthly") return "monthly";
  if (p === "week" || p === "weekly") return "weekly";
  if (p === "day" || p === "daily") return "daily";
  if (p === "hour" || p === "hourly") return "hourly";
  return "yearly"; // JazzHR default
}
