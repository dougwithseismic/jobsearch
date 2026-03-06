import React from 'react';
import { Box, Text } from 'ink';
import type { Screen } from '../../state/types.js';
import { useAppState } from '../../state/store.js';

const TABS: { screen: Screen; label: string }[] = [
  { screen: 'dashboard', label: 'Dashboard' },
  { screen: 'browse', label: 'Browse' },
  { screen: 'search', label: 'Search' },
  { screen: 'scrape', label: 'Scrape' },
];

export function Header() {
  const { screen } = useAppState();

  return (
    <Box flexDirection="column">
      <Box>
        <Text bold color="cyan">ashby-jobs</Text>
        <Text color="gray"> tui</Text>
      </Box>
      <Box gap={1} marginTop={1}>
        {TABS.map((tab) => (
          <Box key={tab.screen}>
            {tab.screen === screen ? (
              <Text bold inverse>{` ${tab.label} `}</Text>
            ) : (
              <Text color="gray">{` ${tab.label} `}</Text>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
