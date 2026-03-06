import React from 'react';
import { Text, Box } from 'ink';
import { formatNumber } from '../utils/format.js';

interface FilterBarProps {
  remote: boolean;
  location: string;
  department: string;
  resultCount: number;
  totalCount: number;
}

function Badge({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <Text color={active ? 'green' : 'gray'}>
      [{label}: {active ? value : 'OFF'}]
    </Text>
  );
}

export function FilterBar({ remote, location, department, resultCount, totalCount }: FilterBarProps) {
  return (
    <Box gap={1}>
      <Badge label="Remote" value="ON" active={remote} />
      <Badge label="Location" value={location || 'any'} active={!!location} />
      <Badge label="Dept" value={department || 'any'} active={!!department} />
      <Text dimColor> — </Text>
      <Text bold>{formatNumber(resultCount)}</Text>
      <Text dimColor> of {formatNumber(totalCount)} jobs</Text>
    </Box>
  );
}
