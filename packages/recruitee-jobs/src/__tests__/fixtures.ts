import type { RecruiteeJob, CompanyJobs } from '../types.js';

export function makeJob(overrides?: Partial<RecruiteeJob>): RecruiteeJob {
  return {
    id: 1001,
    title: 'Senior Software Engineer',
    slug: 'senior-software-engineer',
    department: 'Engineering',
    location: 'Remote - Europe',
    country: 'Germany',
    city: 'Berlin',
    state: 'Berlin',
    remote: true,
    description: '<p>We are looking for a Senior Software Engineer.</p>',
    requirements: '<p>5+ years experience</p>',
    careersUrl: 'https://testco.recruitee.com/o/senior-software-engineer',
    publishedAt: '2026-03-01T00:00:00.000Z',
    createdAt: '2026-02-28T00:00:00.000Z',
    tags: ['engineering', 'remote'],
    employmentType: 'FullTime',
    minHours: null,
    maxHours: null,
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
        department: 'Engineering',
        remote: true,
        location: 'Remote - Europe',
      }),
      makeJob({
        id: 1002,
        title: 'Product Manager',
        department: 'Product',
        remote: false,
        location: 'San Francisco, CA',
        country: 'United States',
        city: 'San Francisco',
        state: 'California',
      }),
    ],
    scrapedAt: '2026-03-01T00:00:00.000Z',
    ...overrides,
  };
}
