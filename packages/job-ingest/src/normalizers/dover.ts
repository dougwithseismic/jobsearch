import type { UnifiedJob } from "../unified-schema.js";
import { slugify, generateId, snippet, stripHtml } from "../utils.js";
import {
  parseSalary,
  inferSeniority,
  normalizeEmploymentType,
  normalizeWorkplaceType,
  buildLocation,
} from "./helpers.js";

interface RawDoverLocation {
  location_type?: string;
  location_option?: {
    id?: string;
    display_name?: string;
    location_type?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  name?: string;
}

interface RawDoverJob {
  id: string;
  title: string;
  locations?: RawDoverLocation[];
  is_published?: boolean;
  is_sample?: boolean;
  // Enriched fields from detail endpoint (optional)
  user_provided_description?: string;
  compensation?: {
    upper_bound?: number | null;
    lower_bound?: number | null;
    currency?: string | null;
    equity_upper?: number | null;
    equity_lower?: number | null;
    salary_type?: string | null;
    employment_type?: string | null;
  } | null;
  visa_support?: boolean | null;
  created?: string | null;
  // Attached by scraper
  _company?: string;
  _slug?: string;
  _clientId?: string;
  _logoUrl?: string | null;
  _domain?: string | null;
  _scrapedAt?: string;
}

export function normalize(rawJobs: RawDoverJob[]): UnifiedJob[] {
  return rawJobs.map((raw) => {
    const sourceId = raw.id ?? "";
    const companyName = raw._company ?? "";
    const companySlug = raw._slug ?? slugify(companyName);

    // Build location from first location entry
    const primaryLoc = raw.locations?.[0];
    const locCity = primaryLoc?.location_option?.city || null;
    const locState = primaryLoc?.location_option?.state || null;
    const locCountry = primaryLoc?.location_option?.country || null;
    const locText = buildLocationText(raw.locations);
    const isRemote = raw.locations?.some((l) => l.location_type === "REMOTE") ?? false;

    // Build secondary locations (all after the first)
    const secondaryLocations = (raw.locations ?? []).slice(1).map((loc) => {
      const text = loc.name || loc.location_option?.display_name || "";
      return buildLocation({
        text,
        city: loc.location_option?.city || null,
        state: loc.location_option?.state || null,
        country: loc.location_option?.country || null,
      });
    });

    // Description
    const descriptionHtml = raw.user_provided_description ?? null;
    const descriptionPlain = descriptionHtml ? stripHtml(descriptionHtml) : "";

    // Compensation
    const comp = raw.compensation;
    const salaryText = comp
      ? formatCompensation(comp.lower_bound, comp.upper_bound, comp.currency, comp.salary_type)
      : "";

    const salary = salaryText
      ? {
          text: salaryText,
          min: comp?.lower_bound ?? null,
          max: comp?.upper_bound ?? null,
          currency: comp?.currency ?? null,
          period: mapSalaryType(comp?.salary_type) ?? null,
        }
      : parseSalary("");

    // Employment type
    const employmentRaw = comp?.employment_type ?? "";

    // Workplace type
    const locTypeRaw = primaryLoc?.location_type?.toLowerCase();
    const workplaceRaw = locTypeRaw === "remote" ? "remote"
      : locTypeRaw === "in_person" ? "onsite"
      : locTypeRaw === "hybrid" ? "hybrid"
      : undefined;

    // Tags from location names
    const tags: string[] = [];
    for (const loc of raw.locations ?? []) {
      const name = loc.name || loc.location_option?.display_name;
      if (name && !tags.includes(name)) tags.push(name);
    }
    if (raw.visa_support) tags.push("visa-support");

    const careersUrl = companySlug
      ? `https://app.dover.com/apply/${companySlug}`
      : null;

    return {
      id: generateId("dover", sourceId),
      sourceId,
      title: raw.title ?? "",
      description: descriptionPlain,
      descriptionSnippet: snippet(descriptionPlain),
      descriptionHtml,
      department: "",
      team: "",
      category: "",
      location: buildLocation({
        text: locText,
        city: locCity,
        state: locState,
        country: locCountry,
      }),
      secondaryLocations,
      workplaceType: normalizeWorkplaceType(workplaceRaw, isRemote, locText),
      employmentType: normalizeEmploymentType(employmentRaw),
      employmentTypeRaw: employmentRaw,
      seniorityLevel: inferSeniority(raw.title ?? ""),
      salary,
      jobUrl: `https://app.dover.com/apply/${companySlug}/jobs/${sourceId}`,
      applyUrl: `https://app.dover.com/apply/${companySlug}/jobs/${sourceId}`,
      company: {
        name: companyName,
        slug: companySlug,
        ats: "dover",
        logoUrl: raw._logoUrl ?? null,
        careersUrl,
      },
      tags,
      publishedAt: raw.created ?? "",
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
  });
}

function buildLocationText(locations?: RawDoverLocation[]): string {
  if (!locations || locations.length === 0) return "";
  return locations
    .map((l) => l.name || l.location_option?.display_name || "")
    .filter(Boolean)
    .join("; ");
}

function formatCompensation(
  lower?: number | null,
  upper?: number | null,
  currency?: string | null,
  salaryType?: string | null,
): string {
  if (lower == null && upper == null) return "";
  const cur = currency ?? "USD";
  const parts: string[] = [];
  if (lower != null) parts.push(`${cur} ${lower.toLocaleString()}`);
  if (upper != null && upper !== lower) parts.push(`${cur} ${upper.toLocaleString()}`);
  const range = parts.join(" - ");
  if (salaryType) return `${range} (${salaryType})`;
  return range;
}

function mapSalaryType(salaryType?: string | null): "yearly" | "monthly" | "hourly" | null {
  if (!salaryType) return null;
  const lower = salaryType.toLowerCase();
  if (lower.includes("annual") || lower.includes("year")) return "yearly";
  if (lower.includes("month")) return "monthly";
  if (lower.includes("hour")) return "hourly";
  return "yearly"; // default for most job postings
}
