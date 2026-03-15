import type { UnifiedJob } from "../unified-schema.js";
import { slugify, generateId, snippet, stripHtml } from "../utils.js";
import {
  inferSeniority,
  normalizeEmploymentType,
  normalizeWorkplaceType,
  buildLocation,
} from "./helpers.js";

interface RawTeamtailorLocation {
  name?: string;
  address?: string;
  zip?: string;
  city?: string;
  country?: string;
}

interface RawTeamtailorJob {
  title?: string;
  description?: string;
  pubDate?: string;
  link?: string;
  guid?: string;
  locations?: RawTeamtailorLocation[];
  department?: string;
  role?: string;
  remoteStatus?: string;
  _company?: string;
  _slug?: string;
  _scrapedAt?: string;
}

export function normalize(rawJobs: RawTeamtailorJob[]): UnifiedJob[] {
  return rawJobs.map((raw) => {
    const sourceId = raw.guid ?? "";
    const companyName = raw._company ?? "";
    const companySlug = raw._slug ?? slugify(companyName);

    // Build primary location from first location entry
    const firstLoc = raw.locations?.[0];
    const locationText = firstLoc
      ? [firstLoc.city, firstLoc.country].filter(Boolean).join(", ")
      : "";

    const isRemote = raw.remoteStatus === "fully" || /remote/i.test(locationText);
    const department = raw.department ?? "";
    const descriptionPlain = raw.description ? stripHtml(raw.description) : "";

    // Build secondary locations (all locations beyond the first)
    const secondaryLocations = (raw.locations ?? []).slice(1).map((loc) => {
      const locText = [loc.city, loc.country].filter(Boolean).join(", ");
      return buildLocation({
        text: locText,
        city: loc.city ?? null,
        country: loc.country ?? null,
      });
    });

    // Determine workplace type from remoteStatus field
    let workplaceType: "remote" | "hybrid" | "onsite" | "unknown";
    if (raw.remoteStatus === "fully") {
      workplaceType = "remote";
    } else if (raw.remoteStatus === "hybrid") {
      workplaceType = "hybrid";
    } else {
      workplaceType = normalizeWorkplaceType(undefined, isRemote, locationText);
    }

    return {
      id: generateId("teamtailor", sourceId),
      sourceId,
      title: raw.title ?? "",
      description: descriptionPlain,
      descriptionSnippet: snippet(descriptionPlain),
      descriptionHtml: raw.description ?? null,
      department,
      team: "",
      category: raw.role ?? "",
      location: buildLocation({
        text: locationText,
        city: firstLoc?.city ?? null,
        country: firstLoc?.country ?? null,
      }),
      secondaryLocations,
      workplaceType,
      employmentType: normalizeEmploymentType(""),
      employmentTypeRaw: "",
      seniorityLevel: inferSeniority(raw.title ?? ""),
      salary: { text: "", min: null, max: null, currency: null, period: null },
      jobUrl: raw.link ?? "",
      applyUrl: raw.link ? `${raw.link}#apply` : "",
      company: {
        name: companyName,
        slug: companySlug,
        ats: "teamtailor",
        logoUrl: null,
        careersUrl: `https://${companySlug}.teamtailor.com`,
      },
      tags: extractTags(raw),
      publishedAt: raw.pubDate ?? "",
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
  });
}

function extractTags(raw: RawTeamtailorJob): string[] {
  const tags: string[] = [];
  if (raw.department && !tags.includes(raw.department)) tags.push(raw.department);
  if (raw.role && !tags.includes(raw.role)) tags.push(raw.role);
  for (const loc of raw.locations ?? []) {
    const city = loc.city;
    if (city && !tags.includes(city)) tags.push(city);
    const country = loc.country;
    if (country && !tags.includes(country)) tags.push(country);
  }
  if (raw.remoteStatus && raw.remoteStatus !== "none") {
    tags.push(`remote:${raw.remoteStatus}`);
  }
  return tags;
}
