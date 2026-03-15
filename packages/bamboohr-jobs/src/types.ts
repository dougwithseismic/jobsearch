/** A single job posting from BambooHR (list endpoint) */
export interface BambooHRJob {
  id: string;
  jobOpeningName: string;
  departmentId: string;
  departmentLabel: string;
  employmentStatusLabel: string;
  location: {
    city: string;
    state: string;
    postalCode?: string;
    addressCountry?: string;
  };
  atsLocation?: {
    country: string | null;
    state: string | null;
    province?: string | null;
    city: string | null;
  };
  isRemote: boolean | null;
  locationType: string;
  /** Only present when fetched via the detail endpoint */
  description?: string;
  /** Only present when fetched via the detail endpoint */
  jobOpeningShareUrl?: string;
  /** Only present when fetched via the detail endpoint */
  compensation?: string | null;
  /** Only present when fetched via the detail endpoint */
  datePosted?: string;
  /** Only present when fetched via the detail endpoint */
  minimumExperience?: string | null;
}

/** All jobs for a single company */
export interface CompanyJobs {
  company: string;
  slug: string;
  jobCount: number;
  jobs: BambooHRJob[];
  scrapedAt: string;
}

/** Flattened job row for CSV/table output */
export interface FlatJob {
  company: string;
  slug: string;
  id: string;
  title: string;
  department: string;
  location: string;
  employmentStatus: string;
  isRemote: boolean | null;
  jobUrl: string;
  description?: string;
}

/** Options for slug discovery */
export interface DiscoverOptions {
  /** URL to fetch slugs from. Defaults to SLUG_API_URL env var or the Cloudflare Worker endpoint. */
  slugApiUrl?: string;
  /** Additional known slugs to include */
  knownSlugs?: string[];
  /** Progress callback */
  onProgress?: (message: string) => void;
}

/** Options for scraping all companies */
export interface ScrapeAllOptions {
  /** Max concurrent requests. Default: 10 */
  concurrency?: number;
  /** Include full job descriptions (HTML content). Default: false */
  includeContent?: boolean;
  /** Progress callback called periodically */
  onProgress?: (done: number, total: number, found: number) => void;
}

/** Options for scraping a single company */
export interface ScrapeCompanyOptions {
  /** Include full job descriptions (HTML content) by fetching each detail page. Default: false */
  includeContent?: boolean;
}

/** Filter criteria for searching jobs */
export interface JobFilter {
  /** Regex pattern for location */
  location?: RegExp;
  /** Regex pattern for department */
  department?: RegExp;
  /** Regex pattern for title or content */
  keyword?: RegExp;
}

/** Search query combining text and filters */
export interface SearchQuery {
  /** Free text search across title, company, department */
  text?: string;
  /** Structured filters */
  filters?: JobFilter;
  /** Max results to return */
  limit?: number;
}
