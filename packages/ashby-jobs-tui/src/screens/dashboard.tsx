import React from 'react';
import { Box, Text } from 'ink';
import { useAppState } from '../state/store.js';
import { StatsCard } from '../components/stats-card.js';
import { EmptyState } from '../components/empty-state.js';
import { formatNumber, percentage, timeAgo, truncate } from '../utils/format.js';
import type { CompanyJobs } from 'ashby-jobs';

const BAR_WIDTH = 20;
const TOP_N = 10;

function buildBar(value: number, max: number): string {
  const filled = max > 0 ? Math.round((value / max) * BAR_WIDTH) : 0;
  const empty = BAR_WIDTH - filled;
  return '\u2588'.repeat(filled) + '\u2591'.repeat(empty);
}

function TopCompanies({ data }: { data: CompanyJobs[] }) {
  const sorted = [...data].sort((a, b) => b.jobCount - a.jobCount).slice(0, TOP_N);
  const max = sorted[0]?.jobCount ?? 1;

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text bold underline>
        Top {TOP_N} Companies by Job Count
      </Text>
      {sorted.map((c) => (
        <Box key={c.slug}>
          <Text>{truncate(c.company, 16).padEnd(16)} </Text>
          <Text color="cyan">{buildBar(c.jobCount, max)}</Text>
          <Text> {formatNumber(c.jobCount)}</Text>
        </Box>
      ))}
    </Box>
  );
}

export function DashboardScreen() {
  const { data, lastScrapedAt } = useAppState();

  if (!data || data.length === 0) {
    return (
      <EmptyState
        message="No data loaded"
        hint="Press Tab to navigate to Scrape, then press 's' to start scraping"
      />
    );
  }

  const totalCompanies = data.length;
  const totalJobs = data.reduce((s, c) => s + c.jobCount, 0);
  const remoteJobs = data.reduce(
    (s, c) => s + c.jobs.filter((j) => j.isRemote).length,
    0,
  );
  const remotePct = percentage(remoteJobs, totalJobs);

  return (
    <Box flexDirection="column">
      <Box gap={1}>
        <StatsCard label="Companies" value={formatNumber(totalCompanies)} color="blue" />
        <StatsCard label="Total Jobs" value={formatNumber(totalJobs)} color="green" />
        <StatsCard label="Remote Jobs" value={formatNumber(remoteJobs)} color="magenta" />
        <StatsCard label="Remote %" value={remotePct} color="yellow" />
      </Box>

      <TopCompanies data={data} />

      {lastScrapedAt && (
        <Box marginTop={1}>
          <Text color="gray">Last scraped: {timeAgo(lastScrapedAt)}</Text>
        </Box>
      )}
    </Box>
  );
}
