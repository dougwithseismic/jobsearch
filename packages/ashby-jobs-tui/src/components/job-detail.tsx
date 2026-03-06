import React from 'react';
import { Box, Text } from 'ink';
import type { AshbyJob } from 'ashby-jobs';
import { formatDate, truncate } from '../utils/format.js';

interface JobDetailProps {
  job: AshbyJob;
  companyName: string;
}

function Field({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null;
  return (
    <Box gap={1}>
      <Text color="gray">{label}:</Text>
      <Text>{value}</Text>
    </Box>
  );
}

export function JobDetail({ job, companyName }: JobDetailProps) {
  const remoteBadge = job.isRemote ? ' [Remote]' : '';

  return (
    <Box flexDirection="column">
      <Text color="cyan">{companyName}</Text>
      <Text bold>{job.title}</Text>

      <Box flexDirection="column" marginTop={1}>
        <Field label="Department" value={job.department || undefined} />
        <Field label="Team" value={job.team || undefined} />
        <Field label="Location" value={`${job.location}${remoteBadge}`} />
        <Field label="Workplace" value={job.workplaceType || undefined} />
        <Field label="Type" value={job.employmentType || undefined} />
        <Field label="Published" value={job.publishedAt ? formatDate(job.publishedAt) : undefined} />
        {job.compensationTierSummary && (
          <Field label="Compensation" value={job.compensationTierSummary} />
        )}
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Box gap={1}>
          <Text color="gray">Apply:</Text>
          <Text color="green" underline>{truncate(job.applyUrl, 80)}</Text>
        </Box>
        <Text color="gray" dimColor>Press 'o' to open, 'c' to copy</Text>
      </Box>

      {job.descriptionPlain && (
        <Box flexDirection="column" marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
          <Text color="gray" bold>Description</Text>
          <Text>{truncate(job.descriptionPlain, 500)}</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text color="gray">Esc back</Text>
      </Box>
    </Box>
  );
}
