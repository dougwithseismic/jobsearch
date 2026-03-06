import React from 'react';
import { Box, Text } from 'ink';
import type { CompanyJobs } from 'ashby-jobs';
import { truncate, formatNumber } from '../utils/format.js';

interface CompanyListProps {
  companies: CompanyJobs[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onEnter: () => void;
  maxHeight: number;
}

export function CompanyList({ companies, selectedIndex, maxHeight }: CompanyListProps) {
  const total = companies.length;
  const visibleCount = Math.max(1, maxHeight - 2); // reserve space for header + scroll indicator

  // Calculate window around cursor
  let start = Math.max(0, selectedIndex - Math.floor(visibleCount / 2));
  const end = Math.min(total, start + visibleCount);
  // Adjust start if we hit the bottom
  start = Math.max(0, end - visibleCount);

  const visible = companies.slice(start, end);

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">Companies</Text>
        <Text color="gray"> - {formatNumber(total)} total</Text>
      </Box>

      {visible.map((company, i) => {
        const realIndex = start + i;
        const isSelected = realIndex === selectedIndex;
        const name = truncate(company.company, 50);
        const count = `${company.jobCount} job${company.jobCount === 1 ? '' : 's'}`;

        return (
          <Box key={company.slug}>
            <Text inverse={isSelected} bold={isSelected}>
              {isSelected ? '>' : ' '} {name.padEnd(52)}{count.padStart(10)}
            </Text>
          </Box>
        );
      })}

      <Box marginTop={1}>
        <Text color="gray">
          {start + 1}-{end} of {formatNumber(total)}
          {'  '}
          {'\u2191\u2193 navigate  Enter select  Esc back'}
        </Text>
      </Box>
    </Box>
  );
}
