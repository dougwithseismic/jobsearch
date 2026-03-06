import type { CompanyJobs } from 'ashby-jobs';

export type Screen = 'dashboard' | 'browse' | 'search' | 'scrape';
export type BrowseView = 'companies' | 'jobs' | 'detail';

export interface ScrapeProgress {
  phase: string;
  done: number;
  total: number;
  found: number;
}

export interface AppState {
  screen: Screen;
  showHelp: boolean;

  data: CompanyJobs[] | null;
  dataPath: string;
  lastScrapedAt: string | null;

  browseView: BrowseView;
  selectedCompanyIndex: number;
  selectedJobIndex: number;

  searchText: string;
  searchFilters: {
    remote: boolean;
    location: string;
    department: string;
  };
  searchResults: CompanyJobs[];

  scrapeStatus: 'idle' | 'discovering' | 'scraping' | 'done' | 'error';
  scrapeProgress: ScrapeProgress;
  scrapeError: string | null;
}

export type Action =
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'TOGGLE_HELP' }
  | { type: 'SET_DATA'; data: CompanyJobs[]; scrapedAt: string | null }
  | { type: 'BROWSE_SELECT_COMPANY'; index: number }
  | { type: 'BROWSE_SELECT_JOB'; index: number }
  | { type: 'BROWSE_BACK' }
  | { type: 'BROWSE_ENTER' }
  | { type: 'SEARCH_SET_TEXT'; text: string }
  | { type: 'SEARCH_TOGGLE_REMOTE' }
  | { type: 'SEARCH_SET_LOCATION'; location: string }
  | { type: 'SEARCH_SET_DEPARTMENT'; department: string }
  | { type: 'SEARCH_UPDATE_RESULTS'; results: CompanyJobs[] }
  | { type: 'SCRAPE_START' }
  | { type: 'SCRAPE_PROGRESS'; progress: Partial<ScrapeProgress> }
  | { type: 'SCRAPE_DONE'; data: CompanyJobs[] }
  | { type: 'SCRAPE_ERROR'; error: string };
