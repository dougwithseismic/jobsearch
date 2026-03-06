import React, { type ReactNode } from 'react';
import { Box } from 'ink';

export function ScreenContainer({ children }: { children: ReactNode }) {
  return (
    <Box flexDirection="column" flexGrow={1} marginTop={1} marginBottom={1}>
      {children}
    </Box>
  );
}
