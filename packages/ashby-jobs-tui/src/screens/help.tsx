import React from 'react';
import { Box, Text } from 'ink';

const SHORTCUTS: [string, string][] = [
  ['Tab / Shift+Tab', 'Switch screens'],
  ['Up / Down', 'Navigate lists'],
  ['Enter', 'Select / expand'],
  ['Esc', 'Go back'],
  ['/', 'Focus search'],
  ['r', 'Toggle remote filter'],
  ['o', 'Open apply URL in browser'],
  ['c', 'Copy apply URL to clipboard'],
  ['s', 'Start scrape'],
  ['?', 'Toggle this help'],
  ['q', 'Quit'],
];

export function HelpScreen() {
  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={2} paddingY={1}>
      <Text bold color="cyan">Keyboard Shortcuts</Text>
      <Box flexDirection="column" marginTop={1}>
        {SHORTCUTS.map(([key, desc]) => (
          <Box key={key} gap={2}>
            <Box width={20}>
              <Text bold>{key}</Text>
            </Box>
            <Text>{desc}</Text>
          </Box>
        ))}
      </Box>
      <Box marginTop={1}>
        <Text color="gray">Press ? to close</Text>
      </Box>
    </Box>
  );
}
