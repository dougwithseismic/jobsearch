import { useEffect } from 'react';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { CompanyJobs } from 'ashby-jobs';
import { useAppState, useDispatch } from '../state/store.js';

export function useDataLoader() {
  const state = useAppState();
  const dispatch = useDispatch();

  useEffect(() => {
    const dataFile = join(state.dataPath, 'all-jobs.json');
    if (!existsSync(dataFile)) return;

    try {
      const raw = readFileSync(dataFile, 'utf-8');
      const data: CompanyJobs[] = JSON.parse(raw);
      const stat = statSync(dataFile);
      dispatch({ type: 'SET_DATA', data, scrapedAt: stat.mtime.toISOString() });
    } catch {
      // Data file exists but is corrupt - ignore
    }
  }, [state.dataPath]);
}
