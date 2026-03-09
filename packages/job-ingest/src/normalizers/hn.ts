import type { UnifiedJob } from "../types.js";
import { classifyRegion, inferCountry } from "../region.js";
import { slugify, generateId, snippet } from "../utils.js";

/**
 * Raw HN (Hacker News) job shape (from hn-jobs scraper).
 * HN jobs do NOT have `_company` / `_slug` from the orchestrator —
 * the company field comes directly from the parsed HN comment.
 */
interface RawHNJob {
  hnId: number;
  rawHtml?: string;
  rawText?: string;
  company: string;
  title: string;
  location: string;
  isRemote: boolean;
  isOnsite: boolean;
  isHybrid: boolean;
  salary: string;
  url: string;
  applyUrl: string;
  technologies: string[];
  description: string;
  postedAt: string;
  threadMonth: string;
  threadUrl: string;
  commentUrl: string;
}

/**
 * Detect if a string looks like a URL rather than a title/location.
 */
function looksLikeUrl(s: string): boolean {
  const trimmed = s.trim();
  return /^https?:\/\//i.test(trimmed) || /^[a-z0-9-]+\.(com|io|ai|dev|co|org|net|app)\/?$/i.test(trimmed);
}

/**
 * Detect if a string looks like a job title.
 */
function looksLikeTitle(s: string): boolean {
  return /engineer|developer|lead|manager|designer|architect|scientist|analyst|founder|head of|vp|director|cto|ceo|sre|devops|platform|product|staff|senior|junior|principal|intern/i.test(s);
}

/**
 * Fix swapped title/location fields.
 * If location looks like a title and title looks like a URL or location, swap them.
 */
function fixSwappedFields(title: string, location: string): { title: string; location: string } {
  if (looksLikeTitle(location) && (looksLikeUrl(title) || !looksLikeTitle(title))) {
    return { title: location, location: looksLikeUrl(title) ? "" : title };
  }
  return { title, location };
}

/**
 * Try to extract a title from the description if the parsed title is empty.
 */
function inferTitleFromDescription(description: string): string {
  // Look for common patterns in the first few lines
  const lines = description.split("\n").filter((l) => l.trim());
  for (const line of lines.slice(0, 5)) {
    if (looksLikeTitle(line) && line.length < 100) {
      return line.trim();
    }
  }
  return "";
}

export function normalize(rawJobs: RawHNJob[]): UnifiedJob[] {
  const seen = new Map<string, UnifiedJob>();

  for (const raw of rawJobs) {
    const sourceId = String(raw.hnId ?? "");
    if (!sourceId) continue;

    let company = (raw.company ?? "").trim();
    let title = (raw.title ?? "").trim();
    let location = (raw.location ?? "").trim();

    // Skip if company is empty or too short
    if (!company || company.length < 2) continue;

    // Skip entries where "company" is clearly a full sentence (bad parse)
    if (company.length > 80 && !company.includes("|")) continue;

    // Fix URL-as-title: if title is a URL, clear it
    if (looksLikeUrl(title)) {
      title = "";
    }

    // Fix swapped fields
    const fixed = fixSwappedFields(title, location);
    title = fixed.title;
    location = fixed.location;

    // If title is still empty, try to infer from description
    if (!title) {
      title = inferTitleFromDescription(raw.description ?? "");
    }

    // Skip jobs with no title — can't display them meaningfully
    if (!title) continue;

    // Clean up titles that are pitches/sentences rather than job titles
    if (/^we[\u2019']?(re| are)\s+(hiring|looking)/i.test(title)) {
      const roles = title.match(/(?:hiring|looking for)\s+(.+)/i);
      if (roles && roles[1]) {
        title = roles[1].replace(/[:.!]+$/, "").replace(/^across\s+/i, "").trim();
      }
    }

    // Strip trailing URLs from titles (e.g. "Staff Engineer - https://example.com/job/123")
    title = title.replace(/\s*[-–—]\s*https?:\/\/\S+$/i, "").trim();
    title = title.replace(/\s+https?:\/\/\S+$/i, "").trim();
    // Also strip "title: https://..." pattern
    title = title.replace(/:\s*https?:\/\/\S+$/i, "").trim();

    // Clean up location: remove work arrangement words (tracked separately)
    location = location
      .replace(/\b(remote|onsite|on-site|hybrid|in-office)\b/gi, "")
      .replace(/\(\s*\)/g, "")           // empty parens "()"
      .replace(/\(\s*,\s*/g, "(")        // "( , US" → "(US"
      .replace(/,\s*\)/g, ")")           // "US, )" → "US)"
      .replace(/\/\s*\(/g, "(")          // "/ (" → "("
      .replace(/,\s*\(/g, " (")         // ", (" → " ("
      .replace(/or\s*\(/g, "(")         // "or (" → "("
      .replace(/[,|/]\s*$/g, "")
      .replace(/^\s*[,|/]\s*/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    const isRemote = raw.isRemote ?? /remote/i.test(raw.location ?? "");
    const country = inferCountry(location || (raw.location ?? ""));

    // Build employment type from work arrangement flags
    const arrangements: string[] = [];
    if (raw.isRemote) arrangements.push("Remote");
    if (raw.isOnsite) arrangements.push("Onsite");
    if (raw.isHybrid) arrangements.push("Hybrid");
    const employmentType = arrangements.join(" / ");

    // Deduplicate: same company + title → keep the most recent one
    const dedupeKey = `${slugify(company)}|${slugify(title)}`;
    const existing = seen.get(dedupeKey);

    const job: UnifiedJob = {
      id: generateId("hn", sourceId),
      source: "hn" as const,
      sourceId,
      company,
      companySlug: slugify(company),
      title,
      department: "",
      location,
      country,
      region: classifyRegion(location || (raw.location ?? ""), country, isRemote),
      isRemote,
      employmentType,
      salary: raw.salary ?? "",
      applyUrl: raw.applyUrl || raw.url || raw.commentUrl || "",
      jobUrl: raw.commentUrl ?? "",
      publishedAt: raw.postedAt ?? "",
      scrapedAt: new Date().toISOString(),
      tags: JSON.stringify(raw.technologies ?? []),
      descriptionSnippet: snippet(raw.description ?? ""),
      lastSeenAt: new Date().toISOString(),
    };

    // Keep the newer post (higher hnId = more recent)
    if (!existing || raw.hnId > parseInt(existing.sourceId)) {
      seen.set(dedupeKey, job);
    }
  }

  return Array.from(seen.values());
}
