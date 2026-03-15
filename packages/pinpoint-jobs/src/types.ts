/** A single job posting from Pinpoint */
export interface PinpointJob {
  id: string;
  title: string;
  description: string;
  location: PinpointLocation;
  department: string;
  workplaceType: string;
  workplaceTypeText: string;
  employmentType: string;
  employmentTypeText: string;
  url: string;
  path: string;
  compensationVisible: boolean;
  compensationMin: number | null;
  compensationMax: number | null;
  compensationCurrency: string | null;
  compensationFrequency: string | null;
  deadlineAt: string | null;
  reportingTo: string | null;
  requisitionId: string | null;
  content?: string;
}

export interface PinpointLocation {
  id: string;
  city: string;
  name: string;
  postalCode: string;
  province: string;
}

/** All jobs for a single company */
export interface CompanyJobs {
  company: string;
  slug: string;
  jobCount: number;
  jobs: PinpointJob[];
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
  workplaceType: string;
  employmentType: string;
  url: string;
  content?: string;
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
  /** Include full job descriptions (HTML content). Default: false */
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
