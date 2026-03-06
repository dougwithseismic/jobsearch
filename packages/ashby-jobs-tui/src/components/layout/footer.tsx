import React from 'react';
import { Box, Text } from 'ink';
import { useAppState } from '../../state/store.js';
import { timeAgo } from '../../utils/format.js';

export function Footer() {
  const { lastScrapedAt, data } = useAppState();

  return (
    <Box marginTop={1} justifyContent="space-between">
      <Text color="gray">
        Tab: switch screens | /: search | ?: help | q: quit
      </Text>
      <Box gap={2}>
        {data && <Text color="gray">{data.length} companies</Text>}
        {lastScrapedAt && <Text color="gray">Updated {timeAgo(lastScrapedAt)}</Text>}
      </Box>
    </Box>
  );
}
