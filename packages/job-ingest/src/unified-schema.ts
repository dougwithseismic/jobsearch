/**
 * Unified Job Schema — the single output format for all 9 ATS scrapers.
 *
 * Every job from Greenhouse, Lever, Ashby, Workable, SmartRecruiters,
 * BreezyHR, Personio, Recruitee, and HN produces this exact shape.
 */

// ── Enums ──────────────────────────────────────────────────

export type AtsSource =
  | "greenhouse" | "lever" | "ashby" | "workable"
  | "smartrecruiters" | "breezyhr" | "personio" | "recruitee" | "teamtailor" | "pinpoint" | "dover" | "jazzhr" | "jobvite" | "bamboohr" | "hn";

export type WorkplaceType = "remote" | "hybrid" | "onsite" | "unknown";

export type EmploymentType =
  | "full-time" | "part-time" | "contract" | "freelance"
  | "internship" | "temporary" | "volunteer" | "other";

export type SeniorityLevel =
  | "intern" | "junior" | "mid" | "senior" | "staff" | "principal"
  | "lead" | "manager" | "director" | "vp" | "c-level" | "other";

export type Region =
  | "europe" | "north-america" | "south-america" | "asia-pacific"
  | "middle-east" | "africa" | "remote-global" | "other";

export type SalaryPeriod = "yearly" | "monthly" | "weekly" | "daily" | "hourly";

// ── Sub-objects ────────────────────────────────────────────

export interface JobLocation {
  /** Free-text location as displayed on the ATS */
  text: string;
  city: string | null;
  state: string | null;
  /** ISO 3166-1 alpha-2 country code */
  country: string | null;
  region: Region;
  lat: number | null;
  lng: number | null;
}

export interface JobSalary {
  /** Raw salary string exactly as scraped */
  text: string;
  min: number | null;
  max: number | null;
  /** ISO 4217 currency code */
  currency: string | null;
  period: SalaryPeriod | null;
}

export interface JobCompany {
  name: string;
  slug: string;
  ats: AtsSource;
  logoUrl: string | null;
  careersUrl: string | null;
}

// ── The unified job record ─────────────────────────────────

export interface UnifiedJob {
  // Identity
  id: string;
  sourceId: string;

  // Core
  title: string;
  description: string;
  descriptionSnippet: string;
  descriptionHtml: string | null;

  // Organization
  department: string;
  team: string;
  category: string;

  // Location
  location: JobLocation;
  secondaryLocations: JobLocation[];
  workplaceType: WorkplaceType;

  // Employment
  employmentType: EmploymentType;
  employmentTypeRaw: string;
  seniorityLevel: SeniorityLevel;

  // Compensation
  salary: JobSalary;

  // URLs
  jobUrl: string;
  applyUrl: string;

  // Company
  company: JobCompany;

  // Meta
  tags: string[];
  publishedAt: string;
  scrapedAt: string;
  lastSeenAt: string;

  // Raw ATS data (only in "both" output mode)
  raw?: Record<string, unknown>;
}

// ── Company wrapper ────────────────────────────────────────

export interface UnifiedCompanyJobs {
  company: JobCompany;
  jobCount: number;
  jobs: UnifiedJob[];
  scrapedAt: string;
}

// ── Output mode for actors ─────────────────────────────────

export type OutputFormat = "unified" | "raw" | "both";
