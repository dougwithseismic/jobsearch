/** A single job posting from Ashby */
export interface AshbyJob {
  id: string;
  title: string;
  department: string;
  team: string;
  employmentType: string;
  location: string;
  secondaryLocations: SecondaryLocation[];
  isRemote: boolean;
  workplaceType: string;
  publishedAt: string;
  isListed: boolean;
  jobUrl: string;
  applyUrl: string;
  descriptionPlain?: string;
  descriptionHtml?: string;
  compensationTierSummary?: string;
  address?: AshbyAddress;
}

export interface SecondaryLocation {
  location: string;
}

export interface AshbyAddress {
  postalAddress?: {
    addressLocality?: string;
    addressRegion?: string;
    addressCountry?: string;
  };
}

/** All jobs for a single company */
export interface CompanyJobs {
  company: string;
  slug: string;
  jobCount: number;
  jobs: AshbyJob[];
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
  employmentType: string;
  location: string;
  isRemote: boolean;
  workplaceType: string;
  publishedAt: string;
  jobUrl: string;
  applyUrl: string;
  compensationTierSummary?: string;
  descriptionPlain?: string;
}

/** Options for slug discovery */
export interface DiscoverOptions {
  /** Common Crawl index IDs to query. Defaults to recent crawls. */
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
