/** A single job posting from Jobvite */
export interface JobviteJob {
  id: string;
  title: string;
  category: string;
  jobType: string;
  location: string;
  date: string;
  detailUrl: string;
  applyUrl: string;
  description?: string;
  department: string;
  remoteType: string;
}

/** All jobs for a single company */
export interface CompanyJobs {
  company: string;
  slug: string;
  companyId: string;
  jobCount: number;
  jobs: JobviteJob[];
  scrapedAt: string;
}

/** Flattened job row for CSV/table output */
export interface FlatJob {
  company: string;
  slug: string;
  id: string;
  title: string;
  category: string;
  department: string;
  jobType: string;
  location: string;
  date: string;
  detailUrl: string;
  applyUrl: string;
  remoteType: string;
  description?: string;
}

/** Options for scraping a single company */
export interface ScrapeCompanyOptions {
  /** Include full HTML job descriptions. Default: true */
  includeContent?: boolean;
  /** Max number of jobs to return */
  limit?: number;
}

/** Options for scraping multiple companies */
export interface ScrapeAllOptions {
  /** Max concurrent requests. Default: 5 */
  concurrency?: number;
  /** Include full job descriptions (HTML content). Default: true */
  includeContent?: boolean;
  /** Progress callback called periodically */
  onProgress?: (done: number, total: number, found: number) => void;
}

/** Filter criteria for searching jobs */
export interface JobFilter {
  /** Regex pattern for location */
  location?: RegExp;
  /** Regex pattern for department */
  department?: RegExp;
  /** Regex pattern for category */
  category?: RegExp;
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
