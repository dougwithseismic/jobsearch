import React from 'react';
import { Box, Text } from 'ink';

interface EmptyStateProps {
  message: string;
  hint?: string;
}

export function EmptyState({ message, hint }: EmptyStateProps) {
  return (
    <Box flexDirection="column" alignItems="center" paddingY={2}>
      <Text color="yellow">{message}</Text>
      {hint && (
        <Text color="gray" dimColor>
          {hint}
        </Text>
      )}
    </Box>
  );
}
