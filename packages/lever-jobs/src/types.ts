/** Raw Lever API posting categories */
export interface LeverCategories {
  team?: string;
  department?: string;
  location?: string;
  commitment?: string;
  allLocations?: string[];
}

/** A structured content list from Lever (requirements, responsibilities, etc.) */
export interface LeverList {
  text: string;
  content: string;
}

/** A single job posting from Lever */
export interface LeverJob {
  id: string;
  title: string;
  team: string;
  department: string;
  location: string;
  commitment: string;
  allLocations: string[];
  workplaceType: string;
  description: string;
  descriptionPlain: string;
  lists: LeverList[];
  additional: string;
  hostedUrl: string;
  applyUrl: string;
  createdAt: number;
}

/** All jobs for a single company */
export interface CompanyJobs {
  company: string;
  slug: string;
  jobCount: number;
  jobs: LeverJob[];
  scrapedAt: string;
}

/** Flattened job row for CSV/table output */
export interface FlatJob {
  company: string;
  slug: string;
  id: string;
  title: string;
  department: string;
  team: string;
  commitment: string;
  location: string;
  workplaceType: string;
  createdAt: number;
  hostedUrl: string;
  applyUrl: string;
  descriptionPlain?: string;
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
  /** Include full job descriptions. Default: false */
  includeDescriptions?: boolean;
  /** Progress callback called periodically */
  onProgress?: (done: number, total: number, found: number) => void;
}

/** Options for scraping a single company */
export interface ScrapeCompanyOptions {
  /** Include full job descriptions. Default: false */
  includeDescriptions?: boolean;
}

/** Filter criteria for searching jobs */
export interface JobFilter {
  /** Regex pattern for location */
  location?: RegExp;
  /** Only remote jobs */
  remote?: boolean;
  /** Regex pattern for department */
  department?: RegExp;
  /** Regex pattern for title or description */
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
