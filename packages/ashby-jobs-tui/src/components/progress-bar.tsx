import React from 'react';
import { Text, Box } from 'ink';
import { percentage } from '../utils/format.js';

interface ProgressBarProps {
  done: number;
  total: number;
  width?: number;
  label?: string;
}

export function ProgressBar({ done, total, width = 30, label }: ProgressBarProps) {
  const ratio = total > 0 ? Math.min(done / total, 1) : 0;
  const filled = Math.round(ratio * width);
  const empty = width - filled;

  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(empty);

  return (
    <Box>
      {label && <Text>{label} </Text>}
      <Text color="green">[{bar}]</Text>
      <Text> {done}/{total} ({percentage(done, total)})</Text>
    </Box>
  );
}
