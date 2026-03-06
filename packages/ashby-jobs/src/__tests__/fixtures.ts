import type { AshbyJob, CompanyJobs } from '../types.js';

export function makeJob(overrides?: Partial<AshbyJob>): AshbyJob {
  return {
    id: 'test-id-1',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    team: 'Backend',
    employmentType: 'FullTime',
    location: 'Remote - Europe',
    secondaryLocations: [],
    isRemote: true,
    workplaceType: 'Remote',
    publishedAt: '2026-03-01T00:00:00.000Z',
    isListed: true,
    jobUrl: 'https://jobs.ashbyhq.com/test/test-id-1',
    applyUrl: 'https://jobs.ashbyhq.com/test/test-id-1/application',
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
        isRemote: true,
        location: 'Remote - Europe',
      }),
      makeJob({
        id: '2',
        title: 'Product Manager',
        department: 'Product',
        isRemote: false,
        location: 'San Francisco, CA',
      }),
    ],
    scrapedAt: '2026-03-01T00:00:00.000Z',
    ...overrides,
  };
}
