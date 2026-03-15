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
 * Raw Lever job shape (from lever-jobs scraper).
 * Jobs arrive with `_company` and `_slug` attached by the ingest orchestrator.
 */
interface RawLeverJob {
  id: string;
  title: string;
  team?: string;
  department?: string;
  location?: string;
  commitment?: string;
  allLocations?: string[];
  workplaceType?: string;
  description?: string;
  descriptionPlain?: string;
  lists?: Array<{ text: string; content: string }>;
  additional?: string;
  hostedUrl?: string;
  applyUrl?: string;
  createdAt?: number; // unix milliseconds
  // Attached by orchestrator
  _company?: string;
  _slug?: string;
  _scrapedAt?: string;
}

export function normalize(rawJobs: RawLeverJob[]): UnifiedJob[] {
  return rawJobs.map((raw) => {
    const sourceId = raw.id ?? "";
    const companyName = raw._company ?? "";
    const companySlug = raw._slug ?? slugify(companyName);
    const locationText = raw.location ?? (raw.allLocations ?? []).join(", ");
    const isRemote =
      /remote/i.test(raw.workplaceType ?? "") || /remote/i.test(locationText);

    const plainText =
      raw.descriptionPlain ?? stripHtml(raw.description ?? "");

    // Build full HTML description including lists sections
    const descriptionHtml = buildDescriptionHtml(raw);

    // Convert unix ms to ISO 8601
    const publishedAt =
      raw.createdAt && raw.createdAt > 0
        ? new Date(raw.createdAt).toISOString()
        : "";

    const commitmentRaw = raw.commitment ?? "";

    // Build secondary locations from allLocations (excluding primary)
    const secondaryLocations = (raw.allLocations ?? [])
      .filter((loc) => loc !== raw.location)
      .map((loc) => buildLocation({ text: loc }));

    return {
      id: generateId("lever", sourceId),
      sourceId,
      title: raw.title ?? "",
      description: plainText,
      descriptionSnippet: snippet(plainText),
      descriptionHtml,
      department: raw.department ?? "",
      team: raw.team ?? "",
      category: "",
      location: buildLocation({ text: locationText }),
      secondaryLocations,
      workplaceType: normalizeWorkplaceType(raw.workplaceType, isRemote, locationText),
      employmentType: normalizeEmploymentType(commitmentRaw),
      employmentTypeRaw: commitmentRaw,
      seniorityLevel: inferSeniority(raw.title ?? ""),
      salary: parseSalary(""),
      jobUrl: raw.hostedUrl ?? "",
      applyUrl: raw.applyUrl ?? "",
      company: {
        name: companyName,
        slug: companySlug,
        ats: "lever",
        logoUrl: null,
        careersUrl: `https://jobs.lever.co/${companySlug}`,
      },
      tags: extractTags(raw),
      publishedAt,
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
  });
}

function buildDescriptionHtml(raw: RawLeverJob): string | null {
  const parts: string[] = [];
  if (raw.description) parts.push(raw.description);
  if (raw.lists) {
    for (const list of raw.lists) {
      if (list.text) parts.push(`<h3>${list.text}</h3>`);
      if (list.content) parts.push(list.content);
    }
  }
  if (raw.additional) parts.push(raw.additional);
  return parts.length > 0 ? parts.join("\n") : null;
}

function extractTags(raw: RawLeverJob): string[] {
  const tags: string[] = [];
  if (raw.team && !tags.includes(raw.team)) tags.push(raw.team);
  if (raw.department && !tags.includes(raw.department)) tags.push(raw.department);
  if (raw.commitment && !tags.includes(raw.commitment)) tags.push(raw.commitment);
  return tags;
}
