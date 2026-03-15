import type { UnifiedJob as RichUnifiedJob, AtsSource, JobLocation, JobSalary, JobCompany } from "@jobsearch/job-ingest/src/unified-schema.js";
import type { Source } from "@jobsearch/job-ingest/src/types.js";

export type { Source, RichUnifiedJob as UnifiedJob, AtsSource, JobLocation, JobSalary, JobCompany };

export type SlugSource = Exclude<Source, "hn">;

export const SLUG_SOURCES: SlugSource[] = [
  "ashby",
  "greenhouse",
  "lever",
  "workable",
  "recruitee",
  "smartrecruiters",
  "breezyhr",
  "personio",
  "teamtailor",
  "pinpoint",
  "dover",
  "jazzhr",
  "jobvite",
  "bamboohr",
];

export interface CompanyMatch {
  company: string;
  slug: string;
  ats: SlugSource;
  confidence: "exact" | "fuzzy";
}

export interface SearchOptions {
  remote?: boolean;
  location?: string | RegExp;
  keyword?: string | RegExp;
  department?: string | RegExp;
  seniority?: string[];
  since?: string; // e.g. "2d", "1w", "2025-03-10"
  limit?: number;
}

export interface SearchResult {
  company: string;
  matches: CompanyMatch[];
  jobs: RichUnifiedJob[];
  totalJobs: number;
  scrapedAt: string;
  duration: number;
}

export interface PlatformStats {
  source: SlugSource;
  slugCount: number;
  updatedAt: string | null;
}

export interface Stats {
  platforms: PlatformStats[];
  totalSlugs: number;
}
