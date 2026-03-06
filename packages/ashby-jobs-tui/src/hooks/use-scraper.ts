import { useCallback } from 'react';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { discoverSlugs, scrapeAll } from 'ashby-jobs';
import type { CompanyJobs } from 'ashby-jobs';
import { useDispatch, useAppState } from '../state/store.js';

export function useScraper() {
  const dispatch = useDispatch();
  const { dataPath } = useAppState();

  const runScrape = useCallback(async () => {
    dispatch({ type: 'SCRAPE_START' });

    try {
      const slugs = await discoverSlugs({
        onProgress: (msg: string) => {
          dispatch({ type: 'SCRAPE_PROGRESS', progress: { phase: msg } });
        },
      });

      dispatch({ type: 'SCRAPE_PROGRESS', progress: { phase: 'Scraping companies...', total: slugs.length, done: 0, found: 0 } });

      const results: CompanyJobs[] = await scrapeAll(slugs, {
        concurrency: 10,
        onProgress: (done: number, total: number, found: number) => {
          dispatch({ type: 'SCRAPE_PROGRESS', progress: { done, total, found } });
        },
      });

      mkdirSync(dataPath, { recursive: true });
      writeFileSync(join(dataPath, 'all-jobs.json'), JSON.stringify(results, null, 2));

      const summary = {
        scrapedAt: new Date().toISOString(),
        totalCompanies: results.length,
        totalJobs: results.reduce((s, r) => s + r.jobCount, 0),
      };
      writeFileSync(join(dataPath, 'summary.json'), JSON.stringify(summary, null, 2));

      dispatch({ type: 'SCRAPE_DONE', data: results });
    } catch (err) {
      dispatch({ type: 'SCRAPE_ERROR', error: String(err) });
    }
  }, [dispatch, dataPath]);

  return { runScrape };
}
