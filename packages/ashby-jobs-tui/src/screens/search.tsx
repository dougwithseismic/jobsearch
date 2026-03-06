import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { searchJobs } from 'ashby-jobs';
import type { JobFilter } from 'ashby-jobs';
import { useAppState, useDispatch } from '../state/store.js';
import { SearchInput } from '../components/search-input.js';
import { FilterBar } from '../components/filter-bar.js';
import { truncate, formatNumber } from '../utils/format.js';
import { useTerminalSize } from '../hooks/use-terminal-size.js';

type FocusedField = 'keyword' | 'location' | 'department';
const FIELDS: FocusedField[] = ['keyword', 'location', 'department'];
const MAX_VISIBLE_RESULTS = 20;

export function SearchScreen() {
  const state = useAppState();
  const dispatch = useDispatch();
  const { columns } = useTerminalSize();
  const { data, searchText, searchFilters, searchResults } = state;

  const [focusedField, setFocusedField] = useState<FocusedField>('keyword');

  // Tab to cycle focus, r to toggle remote
  useInput((input, key) => {
    if (key.tab) {
      setFocusedField((prev) => {
        const idx = FIELDS.indexOf(prev);
        return FIELDS[(idx + 1) % FIELDS.length]!;
      });
      return;
    }

    // Only handle 'r' when not in keyword field (to avoid intercepting typing)
    if (input === 'r' && focusedField !== 'keyword') {
      dispatch({ type: 'SEARCH_TOGGLE_REMOTE' });
    }
  });

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!data) return;

      const filter: JobFilter = {};
      if (searchFilters.remote) filter.remote = true;
      if (searchFilters.location) filter.location = new RegExp(searchFilters.location, 'i');
      if (searchFilters.department) filter.department = new RegExp(searchFilters.department, 'i');

      const results = searchJobs(data, {
        text: searchText || undefined,
        filters: Object.keys(filter).length > 0 ? filter : undefined,
      });
      dispatch({ type: 'SEARCH_UPDATE_RESULTS', results });
    }, 200);
    return () => clearTimeout(timeout);
  }, [searchText, searchFilters, data, dispatch]);

  // Total job count
  const totalJobs = useMemo(() => {
    if (!data) return 0;
    return data.reduce((sum, c) => sum + c.jobCount, 0);
  }, [data]);

  const resultJobCount = useMemo(() => {
    return searchResults.reduce((sum, c) => sum + c.jobCount, 0);
  }, [searchResults]);

  // Column widths
  const companyW = Math.min(24, Math.floor(columns * 0.25));
  const locW = Math.min(20, Math.floor(columns * 0.2));
  const titleW = Math.max(20, columns - companyW - locW - 12);

  if (!data) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="yellow">No data loaded. Run a scrape first (press Tab to switch to Scrape).</Text>
      </Box>
    );
  }

  // Flatten results for display
  const rows: Array<{ company: string; title: string; location: string; remote: boolean }> = [];
  for (const c of searchResults) {
    for (const j of c.jobs) {
      rows.push({ company: c.company, title: j.title, location: j.location, remote: j.isRemote });
      if (rows.length >= MAX_VISIBLE_RESULTS) break;
    }
    if (rows.length >= MAX_VISIBLE_RESULTS) break;
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">Search Jobs</Text>
      <Box height={1} />

      <SearchInput
        label="Keyword"
        value={searchText}
        onChange={(v) => dispatch({ type: 'SEARCH_SET_TEXT', text: v })}
        focus={focusedField === 'keyword'}
        placeholder="senior engineer, frontend..."
      />
      <SearchInput
        label="Location"
        value={searchFilters.location}
        onChange={(v) => dispatch({ type: 'SEARCH_SET_LOCATION', location: v })}
        focus={focusedField === 'location'}
        placeholder="europe|uk|remote"
      />
      <SearchInput
        label="Department"
        value={searchFilters.department}
        onChange={(v) => dispatch({ type: 'SEARCH_SET_DEPARTMENT', department: v })}
        focus={focusedField === 'department'}
        placeholder="engineering|product"
      />

      <Box>
        <Text dimColor>[r] Remote: </Text>
        <Text color={searchFilters.remote ? 'green' : 'gray'} bold>
          {searchFilters.remote ? 'ON' : 'OFF'}
        </Text>
        <Text dimColor>  (Tab to switch fields)</Text>
      </Box>

      <Box height={1} />

      <FilterBar
        remote={searchFilters.remote}
        location={searchFilters.location}
        department={searchFilters.department}
        resultCount={resultJobCount}
        totalCount={totalJobs}
      />

      <Box height={1} />

      {/* Header row */}
      <Box>
        <Box width={companyW}><Text bold underline>Company</Text></Box>
        <Box width={titleW}><Text bold underline>Title</Text></Box>
        <Box width={locW}><Text bold underline>Location</Text></Box>
      </Box>

      {/* Result rows */}
      {rows.length === 0 ? (
        <Text dimColor>No matching jobs found.</Text>
      ) : (
        rows.map((row, i) => (
          <Box key={i}>
            <Box width={companyW}>
              <Text color="cyan">{truncate(row.company, companyW - 1)}</Text>
            </Box>
            <Box width={titleW}>
              <Text>{truncate(row.title, titleW - 1)}</Text>
            </Box>
            <Box width={locW}>
              <Text dimColor>
                {truncate(row.location, locW - 1)}
                {row.remote ? ' *' : ''}
              </Text>
            </Box>
          </Box>
        ))
      )}

      {rows.length >= MAX_VISIBLE_RESULTS && (
        <Text dimColor>
          ... and {formatNumber(resultJobCount - MAX_VISIBLE_RESULTS)} more jobs across{' '}
          {formatNumber(searchResults.length)} companies
        </Text>
      )}
    </Box>
  );
}
