import React from 'react';
import { Box, Text } from 'ink';

interface StatsCardProps {
  label: string;
  value: string | number;
  color?: string;
}

export function StatsCard({ label, value, color = 'white' }: StatsCardProps) {
  return (
    <Box borderStyle="single" flexDirection="column" paddingX={1} minWidth={18}>
      <Text color="gray">{label}</Text>
      <Text bold color={color}>
        {value}
      </Text>
    </Box>
  );
}
