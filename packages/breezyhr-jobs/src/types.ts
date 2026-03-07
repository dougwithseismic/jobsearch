/** A single job posting from BreezyHR */
export interface BreezyJob {
  id: string;
  friendlyId: string;
  name: string;
  url: string;
  publishedDate: string;
  type: { id: string; name: string };
  location: BreezyLocation;
  department: string;
  salary: string;
  company: BreezyCompanyInfo;
  locations: BreezyLocationEntry[];
}

export interface BreezyLocation {
  country: { name: string; id: string } | null;
  state: { id: string; name: string } | null;
  city: string;
  primary: boolean;
  isRemote: boolean;
  name: string;
}

export interface BreezyLocationEntry {
  country: { name: string; id: string } | null;
  countryCode: string;
  city: string;
  region: string;
  hidden: boolean;
}

export interface BreezyCompanyInfo {
  name: string;
  logoUrl: string | null;
  friendlyId: string;
  isMultipleLocationsEnabled: boolean;
}

/** All jobs for a single company */
export interface CompanyJobs {
  company: string;
  slug: string;
  jobCount: number;
  jobs: BreezyJob[];
  scrapedAt: string;
}

/** Flattened job row for CSV/table output */
export interface FlatJob {
  company: string;
  slug: string;
  id: string;
  name: string;
  department: string;
  location: string;
  isRemote: boolean;
  salary: string;
  type: string;
  publishedDate: string;
  url: string;
}

/** Options for slug discovery */
export interface DiscoverOptions {
  /** Web index IDs to query. Defaults to recent indexes. */
  crawlIds?: string[];
  /** Additional known slugs to include */
  knownSlugs?: string[];
  /** Progress callback */
  onProgress?: (message: string) => void;
}

/** Options for scraping all companies */
export interface ScrapeAllOptions {
  /** Max concurrent requests. Default: 10 */
  concurrency?: number;
  /** Progress callback called periodically */
  onProgress?: (done: number, total: number, found: number) => void;
}

/** Options for scraping a single company */
export interface ScrapeCompanyOptions {
  // Reserved for future options (e.g. timeout)
}

/** Filter criteria for searching jobs */
export interface JobFilter {
  /** Regex pattern for location */
  location?: RegExp;
  /** Regex pattern for department */
  department?: RegExp;
  /** Regex pattern for job name/title */
  keyword?: RegExp;
  /** Regex pattern for salary */
  salary?: RegExp;
  /** Filter remote-only jobs */
  remoteOnly?: boolean;
}

/** Search query combining text and filters */
export interface SearchQuery {
  /** Free text search across name, company, department */
  text?: string;
  /** Structured filters */
  filters?: JobFilter;
  /** Max results to return */
  limit?: number;
}
