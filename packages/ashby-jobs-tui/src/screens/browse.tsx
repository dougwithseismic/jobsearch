import React from 'react';
import { useInput } from 'ink';
import { useAppState, useDispatch } from '../state/store.js';
import { useTerminalSize } from '../hooks/use-terminal-size.js';
import { CompanyList } from '../components/company-list.js';
import { JobList } from '../components/job-list.js';
import { JobDetail } from '../components/job-detail.js';
import { EmptyState } from '../components/empty-state.js';
import { openUrl } from '../utils/open-url.js';
import { copyToClipboard } from '../utils/clipboard.js';

export function BrowseScreen() {
  const state = useAppState();
  const dispatch = useDispatch();
  const { rows } = useTerminalSize();

  useInput((input, key) => {
    if (!state.data || state.data.length === 0) return;

    const { browseView } = state;

    // Navigate up/down
    if (key.upArrow || key.downArrow) {
      const delta = key.upArrow ? -1 : 1;

      if (browseView === 'companies') {
        const max = state.data.length - 1;
        const next = Math.max(0, Math.min(max, state.selectedCompanyIndex + delta));
        dispatch({ type: 'BROWSE_SELECT_COMPANY', index: next });
      } else if (browseView === 'jobs') {
        const company = state.data[state.selectedCompanyIndex];
        if (!company) return;
        const max = company.jobs.length - 1;
        const next = Math.max(0, Math.min(max, state.selectedJobIndex + delta));
        dispatch({ type: 'BROWSE_SELECT_JOB', index: next });
      }
      return;
    }

    // Enter drills down
    if (key.return) {
      dispatch({ type: 'BROWSE_ENTER' });
      return;
    }

    // Esc / backspace goes back
    if (key.escape || key.backspace || key.delete) {
      dispatch({ type: 'BROWSE_BACK' });
      return;
    }

    // Open URL in detail view
    if (input === 'o' && browseView === 'detail') {
      const company = state.data[state.selectedCompanyIndex];
      const job = company?.jobs[state.selectedJobIndex];
      if (job?.applyUrl) {
        void openUrl(job.applyUrl);
      }
      return;
    }

    // Copy URL in detail view
    if (input === 'c' && browseView === 'detail') {
      const company = state.data[state.selectedCompanyIndex];
      const job = company?.jobs[state.selectedJobIndex];
      if (job?.applyUrl) {
        void copyToClipboard(job.applyUrl);
      }
      return;
    }
  });

  if (!state.data || state.data.length === 0) {
    return <EmptyState message="No data loaded" hint="Go to Scrape tab to fetch jobs" />;
  }

  const maxHeight = rows - 8;

  switch (state.browseView) {
    case 'companies':
      return (
        <CompanyList
          companies={state.data}
          selectedIndex={state.selectedCompanyIndex}
          onSelect={(index) => dispatch({ type: 'BROWSE_SELECT_COMPANY', index })}
          onEnter={() => dispatch({ type: 'BROWSE_ENTER' })}
          maxHeight={maxHeight}
        />
      );
    case 'jobs': {
      const company = state.data[state.selectedCompanyIndex];
      if (!company) return <EmptyState message="Company not found" />;
      return (
        <JobList
          company={company}
          selectedIndex={state.selectedJobIndex}
          onSelect={(index) => dispatch({ type: 'BROWSE_SELECT_JOB', index })}
          onEnter={() => dispatch({ type: 'BROWSE_ENTER' })}
          maxHeight={maxHeight}
        />
      );
    }
    case 'detail': {
      const company = state.data[state.selectedCompanyIndex];
      const job = company?.jobs[state.selectedJobIndex];
      if (!company || !job) return <EmptyState message="Job not found" />;
      return <JobDetail job={job} companyName={company.company} />;
    }
  }
}
