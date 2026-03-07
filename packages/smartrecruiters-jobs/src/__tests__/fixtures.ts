import type { SmartRecruitersJob, CompanyJobs } from '../types.js';

export function makeJob(overrides?: Partial<SmartRecruitersJob>): SmartRecruitersJob {
  return {
    id: 'test-id-1',
    uuid: 'test-uuid-1',
    name: 'Senior Software Engineer',
    refNumber: 'REF-001',
    company: {
      name: 'TestCo',
      identifier: 'testco',
    },
    location: {
      city: 'Berlin',
      region: 'Berlin',
      country: 'Germany',
      remote: true,
    },
    department: {
      label: 'Engineering',
    },
    typeOfEmployment: {
      label: 'Full-time',
    },
    experienceLevel: {
      label: 'Mid-Senior level',
    },
    industry: {
      label: 'Technology',
    },
    function: {
      label: 'Engineering',
    },
    releasedDate: '2026-03-01T00:00:00.000Z',
    creator: {
      name: 'Jane Recruiter',
    },
    ref: 'https://jobs.smartrecruiters.com/testco/test-id-1',
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
        name: 'Senior Software Engineer',
        department: { label: 'Engineering' },
        location: { city: 'Berlin', region: 'Berlin', country: 'Germany', remote: true },
      }),
      makeJob({
        id: '2',
        name: 'Product Manager',
        department: { label: 'Product' },
        location: { city: 'San Francisco', region: 'California', country: 'United States', remote: false },
      }),
    ],
    scrapedAt: '2026-03-01T00:00:00.000Z',
    ...overrides,
  };
}
