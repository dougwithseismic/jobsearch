/** A single job posting from Recruitee */
export interface RecruiteeJob {
  id: number;
  title: string;
  slug: string;
  department: string;
  location: string;
  country: string;
  city: string;
  state: string;
  remote: boolean;
  description: string;
  requirements: string;
  careersUrl: string;
  publishedAt: string;
  createdAt: string;
  tags: string[];
  employmentType: string;
  minHours: number | null;
  maxHours: number | null;
  descriptionPlain?: string;
}

/** All jobs for a single company */
export interface CompanyJobs {
  company: string;
  slug: string;
  jobCount: number;
  jobs: RecruiteeJob[];
  scrapedAt: string;
}

/** Flattened job row for CSV/table output */
export interface FlatJob {
  company: string;
  companySlug: string;
  id: number;
  title: string;
  department: string;
  location: string;
  country: string;
  city: string;
  state: string;
  remote: boolean;
  employmentType: string;
  publishedAt: string;
  careersUrl: string;
  tags: string;
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
  /** Regex pattern for employment type */
  employmentType?: RegExp;
  /** Regex pattern for country */
  country?: RegExp;
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
