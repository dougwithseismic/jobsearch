/**
 * Unified job filtering for deadlyaccuratejobs.
 * Works with the rich UnifiedJob schema (location/company/salary as objects).
 */

import type { UnifiedJob } from "../../job-ingest/src/unified-schema.js";
import type { SearchOptions } from "./types.js";

/**
 * Parse a "since" value into a Date.
 * Supports: "2d" (2 days), "1w" (1 week), "3h" (3 hours), or ISO date string.
 */
function parseSince(since: string): Date {
  const match = since.match(/^(\d+)([hdwm])$/);
  if (match) {
    const [, num, unit] = match;
    const ms: Record<string, number> = {
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      w: 7 * 24 * 60 * 60 * 1000,
      m: 30 * 24 * 60 * 60 * 1000,
    };
    return new Date(Date.now() - parseInt(num!) * ms[unit!]!);
  }
  return new Date(since);
}

function toRegex(pattern: string | RegExp): RegExp {
  if (pattern instanceof RegExp) return pattern;
  return new RegExp(pattern, "i");
}

/**
 * Get location text from a job (handles both object and string locations).
 */
function getLocationText(job: UnifiedJob): string {
  if (typeof job.location === "string") return job.location;
  return job.location?.text ?? "";
}

function getLocationCountry(job: UnifiedJob): string {
  if (typeof job.location === "string") return "";
  return job.location?.country ?? "";
}

function getLocationRegion(job: UnifiedJob): string {
  if (typeof job.location === "string") return "";
  return job.location?.region ?? "";
}

function getCompanyAts(job: UnifiedJob): string {
  if (typeof job.company === "string") return "";
  return job.company?.ats ?? "";
}

/**
 * Filter UnifiedJob[] based on SearchOptions.
 */
export function filterJobs(jobs: UnifiedJob[], options?: SearchOptions): UnifiedJob[] {
  if (!options) return jobs;

  let result = jobs;

  if (options.remote) {
    result = result.filter((j) => j.workplaceType === "remote");
  }

  if (options.location) {
    const re = toRegex(options.location);
    result = result.filter(
      (j) =>
        re.test(getLocationText(j)) ||
        re.test(getLocationCountry(j)) ||
        re.test(getLocationRegion(j)),
    );
  }

  if (options.keyword) {
    const re = toRegex(options.keyword);
    result = result.filter(
      (j) =>
        re.test(j.title) ||
        re.test(j.department) ||
        re.test(j.descriptionSnippet) ||
        re.test((Array.isArray(j.tags) ? j.tags : []).join(" ")),
    );
  }

  if (options.department) {
    const re = toRegex(options.department);
    result = result.filter((j) => re.test(j.department));
  }

  if (options.seniority && options.seniority.length > 0) {
    const levels = new Set(options.seniority.map((s) => s.toLowerCase()));
    result = result.filter((j) => {
      // Check seniorityLevel field first, then fall back to title
      if (j.seniorityLevel && levels.has(j.seniorityLevel)) return true;
      const title = j.title.toLowerCase();
      return [...levels].some((level) => title.includes(level));
    });
  }

  if (options.since) {
    const sinceDate = parseSince(options.since);
    const sinceISO = sinceDate.toISOString();
    result = result.filter((j) => {
      const date = j.publishedAt || j.scrapedAt;
      return date >= sinceISO;
    });
  }

  if (options.limit && options.limit > 0) {
    result = result.slice(0, options.limit);
  }

  return result;
}
