export interface HNJob {
  /** HN comment ID */
  hnId: number;
  /** Raw HTML text from HN */
  rawHtml: string;
  /** Cleaned plain text */
  rawText: string;
  /** Parsed company name */
  company: string;
  /** Parsed job title(s) */
  title: string;
  /** Parsed location */
  location: string;
  /** Is remote mentioned */
  isRemote: boolean;
  /** Is onsite mentioned */
  isOnsite: boolean;
  /** Is hybrid mentioned */
  isHybrid: boolean;
  /** Salary range if mentioned */
  salary: string;
  /** URL if included in the post */
  url: string;
  /** Apply URL/email if different from url */
  applyUrl: string;
  /** Technologies mentioned */
  technologies: string[];
  /** Full description text */
  description: string;
  /** HN comment timestamp */
  postedAt: string;
  /** Which monthly thread this came from */
  threadMonth: string;
  /** HN thread URL */
  threadUrl: string;
  /** Direct link to comment */
  commentUrl: string;
}

export interface HNThread {
  id: number;
  title: string;
  month: string;
  postedAt: string;
  commentIds: number[];
  url: string;
}

export interface ScrapeOptions {
  /** Number of months to scrape (default: 2) */
  months?: number;
  /** Concurrent requests for fetching comments */
  concurrency?: number;
  /** Progress callback */
  onProgress?: (done: number, total: number) => void;
}

export interface HNJobFilter {
  /** Only include remote jobs */
  remote?: boolean;
  /** Match against job location (and description as fallback) */
  location?: RegExp;
  /** Match against company, title, and description */
  keyword?: RegExp;
  /** Match against technologies list and description */
  technology?: RegExp;
}

export interface FlatJob {
  company: string;
  title: string;
  location: string;
  isRemote: boolean;
  salary: string;
  technologies: string;
  url: string;
  applyUrl: string;
  description: string;
  postedAt: string;
  threadMonth: string;
  commentUrl: string;
}
