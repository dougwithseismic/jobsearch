/** A location entry from Teamtailor RSS */
export interface TeamtailorLocation {
  name?: string;
  city?: string;
  country?: string;
}

/** A single job posting from Teamtailor RSS */
export interface TeamtailorJob {
  title: string;
  description: string;
  pubDate: string;
  link: string;
  guid: string;
  remoteStatus?: string;
  locations: TeamtailorLocation[];
  department?: string;
  role?: string;
}

/** All jobs for a single company */
export interface CompanyJobs {
  company: string;
  slug: string;
  jobCount: number;
  jobs: TeamtailorJob[];
  scrapedAt: string;
}

/** Flattened job row for CSV/table output */
export interface FlatJob {
  company: string;
  slug: string;
  title: string;
  department: string;
  role: string;
  location: string;
  remoteStatus: string;
  pubDate: string;
  link: string;
  guid: string;
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
  /** Include full job descriptions (HTML content). Default: false */
  includeContent?: boolean;
  /** Max jobs to fetch (for pagination limit). Default: all */
  limit?: number;
}

/** Filter criteria for searching jobs */
export interface JobFilter {
  /** Regex pattern for location */
  location?: RegExp;
  /** Regex pattern for department */
  department?: RegExp;
  /** Regex pattern for role */
  role?: RegExp;
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
