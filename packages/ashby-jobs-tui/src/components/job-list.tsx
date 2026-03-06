import React from 'react';
import { Box, Text } from 'ink';
import type { CompanyJobs } from 'ashby-jobs';
import { truncate, formatNumber } from '../utils/format.js';

interface JobListProps {
  company: CompanyJobs;
  selectedIndex: number;
  onSelect: (index: number) => void;
  onEnter: () => void;
  maxHeight: number;
}

export function JobList({ company, selectedIndex, maxHeight }: JobListProps) {
  const jobs = company.jobs;
  const total = jobs.length;
  const visibleCount = Math.max(1, maxHeight - 3); // header + company name + scroll indicator

  let start = Math.max(0, selectedIndex - Math.floor(visibleCount / 2));
  const end = Math.min(total, start + visibleCount);
  start = Math.max(0, end - visibleCount);

  const visible = jobs.slice(start, end);

  return (
    <Box flexDirection="column">
      <Box marginBottom={1} gap={1}>
        <Text bold color="cyan">{company.company}</Text>
        <Text color="gray">- {formatNumber(total)} job{total === 1 ? '' : 's'}</Text>
      </Box>

      {visible.map((job, i) => {
        const realIndex = start + i;
        const isSelected = realIndex === selectedIndex;
        const title = truncate(job.title, 35);
        const dept = truncate(job.department || '-', 15);
        const loc = truncate(job.location || '-', 20);
        const remote = job.isRemote ? '[R]' : '   ';

        return (
          <Box key={job.id}>
            <Text inverse={isSelected} bold={isSelected}>
              {isSelected ? '>' : ' '} {title.padEnd(37)}{dept.padEnd(17)}{loc.padEnd(22)}{remote}
            </Text>
          </Box>
        );
      })}

      <Box marginTop={1}>
        <Text color="gray">
          {start + 1}-{end} of {formatNumber(total)}
          {'  '}
          {'\u2191\u2193 navigate  Enter view  Esc back'}
        </Text>
      </Box>
    </Box>
  );
}
