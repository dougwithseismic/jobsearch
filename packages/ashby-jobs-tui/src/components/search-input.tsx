import React from 'react';
import { Text, Box } from 'ink';
import TextInput from 'ink-text-input';

interface SearchInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  focus?: boolean;
  placeholder?: string;
}

export function SearchInput({ label, value, onChange, focus = false, placeholder }: SearchInputProps) {
  return (
    <Box>
      <Text>{label}: </Text>
      <TextInput
        value={value}
        onChange={onChange}
        focus={focus}
        placeholder={placeholder}
      />
    </Box>
  );
}
