/** A location entry from the Dover API */
export interface DoverLocation {
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

/** A single job posting from Dover */
export interface DoverJob {
  id: string;
  title: string;
  locations: DoverLocation[];
  is_published?: boolean;
  is_sample?: boolean;
  /** Enriched from detail endpoint */
  description?: string;
  compensation?: DoverCompensation | null;
  visa_support?: boolean | null;
  created?: string | null;
}

export interface DoverCompensation {
  upper_bound?: number | null;
  lower_bound?: number | null;
  currency?: string | null;
  equity_upper?: number | null;
  equity_lower?: number | null;
  salary_type?: string | null;
  employment_type?: string | null;
}

/** Careers page info resolved from a slug */
export interface DoverCareersPage {
  id: string;
  name: string;
  slug: string;
}

/** All jobs for a single company */
export interface CompanyJobs {
  company: string;
  slug: string;
  careersPageId: string;
  jobCount: number;
  jobs: DoverJob[];
  scrapedAt: string;
}

/** Flattened job row for CSV/table output */
export interface FlatJob {
  company: string;
  slug: string;
  id: string;
  title: string;
  location: string;
  locationType: string;
  created: string;
  jobUrl: string;
  description?: string;
}

/** Options for scraping all companies */
export interface ScrapeAllOptions {
  /** Max concurrent requests. Default: 5 */
  concurrency?: number;
  /** Include full job descriptions from detail endpoint. Default: false */
  includeDetails?: boolean;
  /** Progress callback called periodically */
  onProgress?: (done: number, total: number, found: number) => void;
}

/** Options for scraping a single company */
export interface ScrapeCompanyOptions {
  /** Include full job descriptions from detail endpoint. Default: false */
  includeDetails?: boolean;
  /** Max number of jobs to fetch. Default: 300 */
  limit?: number;
}

/** Filter criteria for searching jobs */
export interface JobFilter {
  /** Regex pattern for location */
  location?: RegExp;
  /** Regex pattern for title or description */
  keyword?: RegExp;
}

/** Search query combining text and filters */
export interface SearchQuery {
  /** Free text search across title, company */
  text?: string;
  /** Structured filters */
  filters?: JobFilter;
  /** Max results to return */
  limit?: number;
}
