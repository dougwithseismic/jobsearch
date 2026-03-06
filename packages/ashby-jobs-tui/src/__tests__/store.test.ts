import { describe, it, expect } from 'vitest';
import { reducer, getInitialState } from '../state/store.js';

function makeState(overrides = {}) {
  return { ...getInitialState('/tmp/test'), ...overrides };
}

describe('reducer', () => {
  it('SET_SCREEN changes active screen', () => {
    const state = makeState();
    const next = reducer(state, { type: 'SET_SCREEN', screen: 'browse' });
    expect(next.screen).toBe('browse');
  });

  it('SET_SCREEN to scrape', () => {
    const state = makeState();
    const next = reducer(state, { type: 'SET_SCREEN', screen: 'scrape' });
    expect(next.screen).toBe('scrape');
  });

  it('TOGGLE_HELP toggles showHelp', () => {
    const state = makeState({ showHelp: false });
    const next = reducer(state, { type: 'TOGGLE_HELP' });
    expect(next.showHelp).toBe(true);

    const next2 = reducer(next, { type: 'TOGGLE_HELP' });
    expect(next2.showHelp).toBe(false);
  });

  it('SET_DATA sets data and scrapedAt', () => {
    const state = makeState();
    const mockData = [{ company: 'Acme', slug: 'acme', jobCount: 3, jobs: [] }];
    const next = reducer(state, { type: 'SET_DATA', data: mockData as any, scrapedAt: '2026-01-01' });
    expect(next.data).toBe(mockData);
    expect(next.lastScrapedAt).toBe('2026-01-01');
  });

  it('SET_DATA with null scrapedAt', () => {
    const state = makeState();
    const next = reducer(state, { type: 'SET_DATA', data: [] as any, scrapedAt: null });
    expect(next.data).toEqual([]);
    expect(next.lastScrapedAt).toBeNull();
  });

  it('BROWSE_SELECT_COMPANY updates index and resets job index', () => {
    const state = makeState({ selectedCompanyIndex: 0, selectedJobIndex: 5 });
    const next = reducer(state, { type: 'BROWSE_SELECT_COMPANY', index: 3 });
    expect(next.selectedCompanyIndex).toBe(3);
    expect(next.selectedJobIndex).toBe(0);
  });

  it('BROWSE_ENTER transitions companies -> jobs', () => {
    const state = makeState({ browseView: 'companies' });
    const next = reducer(state, { type: 'BROWSE_ENTER' });
    expect(next.browseView).toBe('jobs');
    expect(next.selectedJobIndex).toBe(0);
  });

  it('BROWSE_ENTER transitions jobs -> detail', () => {
    const state = makeState({ browseView: 'jobs' });
    const next = reducer(state, { type: 'BROWSE_ENTER' });
    expect(next.browseView).toBe('detail');
  });

  it('BROWSE_ENTER does nothing from detail', () => {
    const state = makeState({ browseView: 'detail' });
    const next = reducer(state, { type: 'BROWSE_ENTER' });
    expect(next.browseView).toBe('detail');
  });

  it('BROWSE_BACK transitions detail -> jobs', () => {
    const state = makeState({ browseView: 'detail' });
    const next = reducer(state, { type: 'BROWSE_BACK' });
    expect(next.browseView).toBe('jobs');
  });

  it('BROWSE_BACK transitions jobs -> companies and resets job index', () => {
    const state = makeState({ browseView: 'jobs', selectedJobIndex: 5 });
    const next = reducer(state, { type: 'BROWSE_BACK' });
    expect(next.browseView).toBe('companies');
    expect(next.selectedJobIndex).toBe(0);
  });

  it('BROWSE_BACK does nothing from companies', () => {
    const state = makeState({ browseView: 'companies' });
    const next = reducer(state, { type: 'BROWSE_BACK' });
    expect(next.browseView).toBe('companies');
  });

  it('SEARCH_SET_TEXT updates searchText', () => {
    const state = makeState();
    const next = reducer(state, { type: 'SEARCH_SET_TEXT', text: 'engineer' });
    expect(next.searchText).toBe('engineer');
  });

  it('SEARCH_TOGGLE_REMOTE toggles remote filter', () => {
    const state = makeState();
    expect(state.searchFilters.remote).toBe(false);
    const next = reducer(state, { type: 'SEARCH_TOGGLE_REMOTE' });
    expect(next.searchFilters.remote).toBe(true);
    const next2 = reducer(next, { type: 'SEARCH_TOGGLE_REMOTE' });
    expect(next2.searchFilters.remote).toBe(false);
  });

  it('SEARCH_SET_LOCATION updates location filter', () => {
    const state = makeState();
    const next = reducer(state, { type: 'SEARCH_SET_LOCATION', location: 'Prague' });
    expect(next.searchFilters.location).toBe('Prague');
  });

  it('SEARCH_SET_DEPARTMENT updates department filter', () => {
    const state = makeState();
    const next = reducer(state, { type: 'SEARCH_SET_DEPARTMENT', department: 'Engineering' });
    expect(next.searchFilters.department).toBe('Engineering');
  });

  it('SCRAPE_START sets status to discovering', () => {
    const state = makeState();
    const next = reducer(state, { type: 'SCRAPE_START' });
    expect(next.scrapeStatus).toBe('discovering');
    expect(next.scrapeError).toBeNull();
    expect(next.scrapeProgress.phase).toBe('Discovering...');
  });

  it('SCRAPE_PROGRESS updates progress', () => {
    const state = makeState({ scrapeStatus: 'discovering' });
    const next = reducer(state, { type: 'SCRAPE_PROGRESS', progress: { phase: 'Scraping', done: 5, total: 10 } });
    expect(next.scrapeStatus).toBe('scraping');
    expect(next.scrapeProgress.phase).toBe('Scraping');
    expect(next.scrapeProgress.done).toBe(5);
    expect(next.scrapeProgress.total).toBe(10);
  });

  it('SCRAPE_PROGRESS merges partial progress', () => {
    const state = makeState({
      scrapeStatus: 'scraping',
      scrapeProgress: { phase: 'Scraping', done: 5, total: 10, found: 50 },
    });
    const next = reducer(state, { type: 'SCRAPE_PROGRESS', progress: { done: 7 } });
    expect(next.scrapeProgress.done).toBe(7);
    expect(next.scrapeProgress.total).toBe(10);
    expect(next.scrapeProgress.found).toBe(50);
  });

  it('SCRAPE_DONE sets data and status', () => {
    const state = makeState({ scrapeStatus: 'scraping' });
    const mockData = [{ company: 'Test', slug: 'test', jobCount: 1, jobs: [] }];
    const next = reducer(state, { type: 'SCRAPE_DONE', data: mockData as any });
    expect(next.scrapeStatus).toBe('done');
    expect(next.data).toBe(mockData);
    expect(next.lastScrapedAt).toBeTruthy();
  });

  it('SCRAPE_ERROR sets error', () => {
    const state = makeState({ scrapeStatus: 'scraping' });
    const next = reducer(state, { type: 'SCRAPE_ERROR', error: 'Network failed' });
    expect(next.scrapeStatus).toBe('error');
    expect(next.scrapeError).toBe('Network failed');
  });

  it('unknown action returns same state', () => {
    const state = makeState();
    const next = reducer(state, { type: 'UNKNOWN_ACTION' } as any);
    expect(next).toBe(state);
  });
});

describe('getInitialState', () => {
  it('returns correct initial state', () => {
    const state = getInitialState('/my/path');
    expect(state.screen).toBe('dashboard');
    expect(state.showHelp).toBe(false);
    expect(state.data).toBeNull();
    expect(state.dataPath).toBe('/my/path');
    expect(state.browseView).toBe('companies');
    expect(state.scrapeStatus).toBe('idle');
    expect(state.searchFilters.remote).toBe(false);
  });
});
