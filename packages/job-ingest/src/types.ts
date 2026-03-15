export type Source = "ashby" | "greenhouse" | "lever" | "workable" | "recruitee" | "smartrecruiters" | "breezyhr" | "personio" | "teamtailor" | "pinpoint" | "dover" | "jazzhr" | "jobvite" | "bamboohr" | "hn";
export type Region = "europe" | "north-america" | "asia" | "remote" | "other";

export interface UnifiedJob {
  id: string;
  source: Source;
  sourceId: string;
  company: string;
  companySlug: string;
  title: string;
  department: string;
  location: string;
  country: string;
  region: Region;
  isRemote: boolean;
  employmentType: string;
  salary: string;
  applyUrl: string;
  jobUrl: string;
  publishedAt: string;
  scrapedAt: string;
  tags: string;
  descriptionSnippet: string;
  lastSeenAt: string;
}

export interface IngestResult {
  total: number;
  inserted: number;
  updated: number;
  errors: number;
  bySource: Record<string, number>;
  duration: number;
}
