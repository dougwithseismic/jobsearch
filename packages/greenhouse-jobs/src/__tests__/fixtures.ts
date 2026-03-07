import type { GreenhouseJob, CompanyJobs } from '../types.js';

export function makeJob(overrides?: Partial<GreenhouseJob>): GreenhouseJob {
  return {
    id: 1001,
    title: 'Senior Software Engineer',
    location: 'Remote - Europe',
    departments: ['Engineering'],
    offices: ['Berlin'],
    updatedAt: '2026-03-01T00:00:00.000Z',
    absoluteUrl: 'https://boards.greenhouse.io/testco/jobs/1001',
    internalJobId: 5001,
    metadata: [],
    ...overrides,
  };
}

export function makeCompanyJobs(overrides?: Partial<CompanyJobs>): CompanyJobs {
  return {
    company: 'TestCo',
    slug: 'testco',
    jobCount: 2,
    jobs: [
      makeJob({
        id: 1001,
        title: 'Senior Software Engineer',
        departments: ['Engineering'],
        offices: ['Berlin'],
        location: 'Remote - Europe',
      }),
      makeJob({
        id: 1002,
        title: 'Product Manager',
        departments: ['Product'],
        offices: ['San Francisco'],
        location: 'San Francisco, CA',
      }),
    ],
    scrapedAt: '2026-03-01T00:00:00.000Z',
    ...overrides,
  };
}

/** Raw API response shape for mocking */
export function makeRawJob(overrides?: Record<string, unknown>) {
  return {
    id: 1001,
    title: 'Senior Software Engineer',
    location: { name: 'Remote - Europe' },
    departments: [{ id: 1, name: 'Engineering' }],
    offices: [{ id: 1, name: 'Berlin' }],
    content: '<p>Job description here</p>',
    updated_at: '2026-03-01T00:00:00.000Z',
    absolute_url: 'https://boards.greenhouse.io/testco/jobs/1001',
    internal_job_id: 5001,
    metadata: [
      { id: 1, name: 'Employment Type', value: 'Full-time', value_type: 'single_select' },
    ],
    ...overrides,
  };
}
