import type { UnifiedJob } from "../types.js";
import { classifyRegion, inferCountry } from "../region.js";
import { slugify, generateId, snippet, stripHtml } from "../utils.js";

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
    const company = raw._company ?? "";
    const location = raw.location ?? (raw.allLocations ?? []).join(", ");
    const isRemote =
      /remote/i.test(raw.workplaceType ?? "") || /remote/i.test(location);

    const country = inferCountry(location);

    const plainText =
      raw.descriptionPlain ?? stripHtml(raw.description ?? "");

    // Convert unix ms to ISO 8601
    const publishedAt =
      raw.createdAt && raw.createdAt > 0
        ? new Date(raw.createdAt).toISOString()
        : "";

    return {
      id: generateId("lever", sourceId),
      source: "lever" as const,
      sourceId,
      company,
      companySlug: raw._slug ?? slugify(company),
      title: raw.title ?? "",
      department: raw.department ?? raw.team ?? "",
      location,
      country,
      region: classifyRegion(location, country, isRemote),
      isRemote,
      employmentType: raw.commitment ?? "",
      salary: "",
      applyUrl: raw.applyUrl ?? "",
      jobUrl: raw.hostedUrl ?? "",
      publishedAt,
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      tags: "",
      descriptionSnippet: snippet(plainText),
      lastSeenAt: new Date().toISOString(),
    };
  });
}
