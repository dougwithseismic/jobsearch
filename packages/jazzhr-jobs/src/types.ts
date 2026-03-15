/** A single job posting from JazzHR */
export interface JazzHRJob {
  id: string;
  title: string;
  location: string;
  department: string;
  applyUrl: string;
  description?: string;
  descriptionHtml?: string;
  datePosted?: string;
  employmentType?: string;
  experienceLevel?: string;
  salary?: {
    currency: string;
    min: number | null;
    max: number | null;
    period: string;
  };
  company?: {
    name: string;
    url: string;
    logoUrl: string | null;
  };
  city?: string;
  state?: string;
}

/** All jobs for a single company */
export interface CompanyJobs {
  company: string;
  slug: string;
  jobCount: number;
  jobs: JazzHRJob[];
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
  applyUrl: string;
  datePosted?: string;
  employmentType?: string;
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
  /** Include full job descriptions (fetches detail pages). Default: false */
  includeDescriptions?: boolean;
  /** Progress callback called periodically */
  onProgress?: (done: number, total: number, found: number) => void;
}

/** Options for scraping a single company */
export interface ScrapeCompanyOptions {
  /** Include full job descriptions (fetches detail pages). Default: false */
  includeDescriptions?: boolean;
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
