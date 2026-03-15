/** A single job posting from Personio */
export interface PersonioJob {
  id: number;
  name: string;
  department: string;
  office: string;
  recruitingCategory: string;
  employmentType: string;
  seniority: string;
  schedule: string;
  yearsOfExperience: string;
  keywords: string;
  occupation: string;
  occupationCategory: string;
  createdAt: string;
  jobDescriptions: PersonioJobDescription[];
}

export interface PersonioJobDescription {
  name: string;
  value: string;
}

/** All jobs for a single company */
export interface CompanyJobs {
  company: string;
  slug: string;
  jobCount: number;
  jobs: PersonioJob[];
  scrapedAt: string;
}

/** Flattened job row for CSV/table output */
export interface FlatJob {
  company: string;
  slug: string;
  id: number;
  name: string;
  department: string;
  office: string;
  recruitingCategory: string;
  employmentType: string;
  seniority: string;
  schedule: string;
  createdAt: string;
  jobUrl: string;
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
  /** Max concurrent requests. Default: 5 */
  concurrency?: number;
  /** Include full job descriptions (HTML content). Default: false */
  includeContent?: boolean;
  /** Language parameter. Default: "en" */
  language?: string;
  /** Progress callback called periodically */
  onProgress?: (done: number, total: number, found: number) => void;
}

/** Options for scraping a single company */
export interface ScrapeCompanyOptions {
  /** Include full job descriptions (HTML content). Default: false */
  includeContent?: boolean;
  /** Language parameter. Default: "en" */
  language?: string;
}

/** Filter criteria for searching jobs */
export interface JobFilter {
  /** Regex pattern for office/location */
  location?: RegExp;
  /** Regex pattern for department */
  department?: RegExp;
  /** Regex pattern for office */
  office?: RegExp;
  /** Regex pattern for name/title or content */
  keyword?: RegExp;
  /** Regex pattern for seniority */
  seniority?: RegExp;
  /** Regex pattern for employmentType */
  employmentType?: RegExp;
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
