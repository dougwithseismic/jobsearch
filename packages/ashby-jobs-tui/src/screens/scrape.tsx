import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useAppState } from '../state/store.js';
import { useScraper } from '../hooks/use-scraper.js';
import { Spinner } from '../components/spinner.js';
import { ProgressBar } from '../components/progress-bar.js';
import { formatNumber } from '../utils/format.js';

export function ScrapeScreen() {
  const state = useAppState();
  const { runScrape } = useScraper();
  const { scrapeStatus, scrapeProgress, scrapeError, data } = state;

  useInput((input) => {
    if (input === 's' && (scrapeStatus === 'idle' || scrapeStatus === 'done' || scrapeStatus === 'error')) {
      runScrape();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">Scrape Ashby Job Boards</Text>
      <Box height={1} />

      {scrapeStatus === 'idle' && (
        <Box flexDirection="column">
          <Text>
            This will discover companies using Ashby via Common Crawl
            and scrape all their job postings.
          </Text>
          <Box height={1} />
          {data && (
            <Text dimColor>
              Current data: {formatNumber(data.length)} companies,{' '}
              {formatNumber(data.reduce((s, c) => s + c.jobCount, 0))} jobs
            </Text>
          )}
          <Box height={1} />
          <Text bold color="green">Press 's' to start scraping</Text>
        </Box>
      )}

      {scrapeStatus === 'discovering' && (
        <Box flexDirection="column">
          <Spinner label={scrapeProgress.phase || 'Discovering companies from Common Crawl...'} />
        </Box>
      )}

      {scrapeStatus === 'scraping' && (
        <Box flexDirection="column">
          <Text>{scrapeProgress.phase}</Text>
          <Box height={1} />
          <ProgressBar
            done={scrapeProgress.done}
            total={scrapeProgress.total}
            label="Scraping..."
          />
          <Box height={1} />
          <Box gap={2}>
            <Text>Checked: <Text bold>{formatNumber(scrapeProgress.done)}</Text></Text>
            <Text>Total: <Text bold>{formatNumber(scrapeProgress.total)}</Text></Text>
            <Text>With jobs: <Text bold color="green">{formatNumber(scrapeProgress.found)}</Text></Text>
          </Box>
        </Box>
      )}

      {scrapeStatus === 'done' && data && (
        <Box flexDirection="column">
          <Text bold color="green">Scrape complete!</Text>
          <Box height={1} />
          <Box flexDirection="column">
            <Text>Companies found: <Text bold>{formatNumber(data.length)}</Text></Text>
            <Text>Total jobs: <Text bold>{formatNumber(data.reduce((s, c) => s + c.jobCount, 0))}</Text></Text>
            <Text>Last scraped: <Text dimColor>{state.lastScrapedAt ?? 'unknown'}</Text></Text>
          </Box>
          <Box height={1} />
          <Text color="cyan">Press Tab to browse results, or 's' to scrape again</Text>
        </Box>
      )}

      {scrapeStatus === 'error' && (
        <Box flexDirection="column">
          <Text bold color="red">Scrape failed</Text>
          <Box height={1} />
          <Text color="red">{scrapeError}</Text>
          <Box height={1} />
          <Text>Press 's' to retry</Text>
        </Box>
      )}
    </Box>
  );
}
