import type { LeverJob, CompanyJobs } from '../types.js';

export function makeJob(overrides?: Partial<LeverJob>): LeverJob {
  return {
    id: 'test-id-1',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    team: 'Backend',
    commitment: 'Full-time',
    location: 'Remote - Europe',
    allLocations: ['Remote - Europe'],
    workplaceType: 'remote',
    description: '<p>We are hiring</p>',
    descriptionPlain: 'We are hiring',
    lists: [],
    additional: '',
    hostedUrl: 'https://jobs.lever.co/testco/test-id-1',
    applyUrl: 'https://jobs.lever.co/testco/test-id-1/apply',
    createdAt: 1709251200000, // 2024-03-01
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
        id: '1',
        title: 'Senior Software Engineer',
        department: 'Engineering',
        location: 'Remote - Europe',
        workplaceType: 'remote',
      }),
      makeJob({
        id: '2',
        title: 'Product Manager',
        department: 'Product',
        location: 'San Francisco, CA',
        allLocations: ['San Francisco, CA'],
        workplaceType: 'on-site',
      }),
    ],
    scrapedAt: '2026-03-01T00:00:00.000Z',
    ...overrides,
  };
}

/** A raw Lever API response shape for testing mapPosting */
export function makeRawPosting(overrides?: Record<string, unknown>) {
  return {
    id: 'raw-id-1',
    text: 'Frontend Engineer',
    categories: {
      team: 'Frontend',
      department: 'Engineering',
      location: 'Berlin, Germany',
      commitment: 'Full-time',
      allLocations: ['Berlin, Germany', 'Remote'],
    },
    description: '<p>Build cool stuff</p>',
    descriptionPlain: 'Build cool stuff',
    lists: [{ text: 'Requirements', content: '<li>TypeScript</li>' }],
    additional: '<p>Benefits</p>',
    hostedUrl: 'https://jobs.lever.co/testco/raw-id-1',
    applyUrl: 'https://jobs.lever.co/testco/raw-id-1/apply',
    createdAt: 1709251200000,
    workplaceType: 'hybrid',
    ...overrides,
  };
}
