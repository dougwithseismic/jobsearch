import type { UnifiedJob } from "../types.js";
import { classifyRegion, inferCountry } from "../region.js";
import { slugify, generateId, snippet, stripHtml } from "../utils.js";

/**
 * Raw Greenhouse job shape (from greenhouse-jobs scraper).
 * Jobs arrive with `_company` and `_slug` attached by the ingest orchestrator.
 */
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
  // Attached by orchestrator
  _company?: string;
  _slug?: string;
  _scrapedAt?: string;
}

export function normalize(rawJobs: RawGreenhouseJob[]): UnifiedJob[] {
  return rawJobs.map((raw) => {
    const sourceId = String(raw.id ?? "");
    const company = raw._company ?? "";
    const location = raw.location ?? "";
    const isRemote = /remote/i.test(location);

    const country = inferCountry(location);
    const department = (raw.departments ?? []).join(", ");
    const description = stripHtml(raw.content ?? "");

    return {
      id: generateId("greenhouse", sourceId),
      source: "greenhouse" as const,
      sourceId,
      company,
      companySlug: raw._slug ?? slugify(company),
      title: raw.title ?? "",
      department,
      location,
      country,
      region: classifyRegion(location, country, isRemote),
      isRemote,
      employmentType: extractMetadata(raw.metadata, "Employment") ?? "",
      salary: extractMetadata(raw.metadata, "Salary") ?? extractMetadata(raw.metadata, "Compensation") ?? "",
      applyUrl: raw.absoluteUrl ? `${raw.absoluteUrl}#app` : "",
      jobUrl: raw.absoluteUrl ?? "",
      publishedAt: raw.updatedAt ?? "",
      scrapedAt: raw._scrapedAt ?? new Date().toISOString(),
      tags: "",
      descriptionSnippet: snippet(description),
      lastSeenAt: new Date().toISOString(),
    };
  });
}

/** Extract a metadata value by name prefix (case-insensitive). */
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
