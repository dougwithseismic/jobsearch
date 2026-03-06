import React, { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react';
import type { AppState, Action, Screen } from './types.js';

const SCREENS: Screen[] = ['dashboard', 'browse', 'search', 'scrape'];

function getInitialState(dataPath: string): AppState {
  return {
    screen: 'dashboard',
    showHelp: false,
    data: null,
    dataPath,
    lastScrapedAt: null,
    browseView: 'companies',
    selectedCompanyIndex: 0,
    selectedJobIndex: 0,
    searchText: '',
    searchFilters: { remote: false, location: '', department: '' },
    searchResults: [],
    scrapeStatus: 'idle',
    scrapeProgress: { phase: '', done: 0, total: 0, found: 0 },
    scrapeError: null,
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };
    case 'TOGGLE_HELP':
      return { ...state, showHelp: !state.showHelp };
    case 'SET_DATA':
      return { ...state, data: action.data, lastScrapedAt: action.scrapedAt };
    case 'BROWSE_SELECT_COMPANY':
      return { ...state, selectedCompanyIndex: action.index, selectedJobIndex: 0 };
    case 'BROWSE_SELECT_JOB':
      return { ...state, selectedJobIndex: action.index };
    case 'BROWSE_BACK':
      if (state.browseView === 'detail') return { ...state, browseView: 'jobs' };
      if (state.browseView === 'jobs') return { ...state, browseView: 'companies', selectedJobIndex: 0 };
      return state;
    case 'BROWSE_ENTER':
      if (state.browseView === 'companies') return { ...state, browseView: 'jobs', selectedJobIndex: 0 };
      if (state.browseView === 'jobs') return { ...state, browseView: 'detail' };
      return state;
    case 'SEARCH_SET_TEXT':
      return { ...state, searchText: action.text };
    case 'SEARCH_TOGGLE_REMOTE':
      return { ...state, searchFilters: { ...state.searchFilters, remote: !state.searchFilters.remote } };
    case 'SEARCH_SET_LOCATION':
      return { ...state, searchFilters: { ...state.searchFilters, location: action.location } };
    case 'SEARCH_SET_DEPARTMENT':
      return { ...state, searchFilters: { ...state.searchFilters, department: action.department } };
    case 'SEARCH_UPDATE_RESULTS':
      return { ...state, searchResults: action.results };
    case 'SCRAPE_START':
      return { ...state, scrapeStatus: 'discovering', scrapeError: null, scrapeProgress: { phase: 'Discovering...', done: 0, total: 0, found: 0 } };
    case 'SCRAPE_PROGRESS':
      return { ...state, scrapeStatus: 'scraping', scrapeProgress: { ...state.scrapeProgress, ...action.progress } };
    case 'SCRAPE_DONE':
      return { ...state, scrapeStatus: 'done', data: action.data, lastScrapedAt: new Date().toISOString() };
    case 'SCRAPE_ERROR':
      return { ...state, scrapeStatus: 'error', scrapeError: action.error };
    default:
      return state;
  }
}

// Create contexts
const StateContext = createContext<AppState>(null!);
const DispatchContext = createContext<Dispatch<Action>>(null!);

export function useAppState() { return useContext(StateContext); }
export function useDispatch() { return useContext(DispatchContext); }

// Export for testing
export { reducer, getInitialState };

export function StoreProvider({ dataPath, children }: { dataPath: string; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, dataPath, getInitialState);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}
