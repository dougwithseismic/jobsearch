/** Raw job from Workable widget API */
export interface WorkableRawJob {
  title: string;
  shortcode: string;
  code: string;
  employment_type: string;
  telecommuting: boolean;
  department: string;
  url: string;
  shortlink: string;
  application_url: string;
  published_on: string;
  created_at: string;
  country: string;
  city: string;
  state: string;
  education: string;
  experience: string;
  function: string;
  industry: string;
  locations: WorkableRawLocation[];
}

export interface WorkableRawLocation {
  country: string;
  countryCode: string;
  city: string;
  region: string;
  hidden: boolean;
}

/** A single job posting from Workable */
export interface WorkableJob {
  shortcode: string;
  title: string;
  department: string;
  employmentType: string;
  isRemote: boolean;
  country: string;
  city: string;
  state: string;
  locations: WorkableLocation[];
  experience: string;
  industry: string;
  publishedAt: string;
  createdAt: string;
  jobUrl: string;
  applyUrl: string;
  descriptionHtml?: string;
}

export interface WorkableLocation {
  country: string;
  countryCode: string;
  city: string;
  region: string;
}

/** All jobs for a single company */
export interface CompanyJobs {
  company: string;
  slug: string;
  jobCount: number;
  jobs: WorkableJob[];
  scrapedAt: string;
}

/** Flattened job row for CSV/table output */
export interface FlatJob {
  company: string;
  slug: string;
  shortcode: string;
  title: string;
  department: string;
  employmentType: string;
  isRemote: boolean;
  country: string;
  city: string;
  state: string;
  experience: string;
  industry: string;
  publishedAt: string;
  jobUrl: string;
  applyUrl: string;
  descriptionHtml?: string;
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
  /** Regex pattern for location (matches country, city, state, or locations) */
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
