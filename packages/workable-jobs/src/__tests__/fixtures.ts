import type { WorkableJob, WorkableRawJob, CompanyJobs } from '../types.js';

export function makeJob(overrides?: Partial<WorkableJob>): WorkableJob {
  return {
    shortcode: 'TEST123',
    title: 'Senior Software Engineer',
    department: 'Engineering',
    employmentType: 'Full-time',
    isRemote: true,
    country: 'Germany',
    city: 'Berlin',
    state: 'Berlin',
    locations: [
      {
        country: 'Germany',
        countryCode: 'DE',
        city: 'Berlin',
        region: 'Berlin',
      },
    ],
    experience: 'Mid-Senior level',
    industry: 'Computer Software',
    publishedAt: '2026-03-01',
    createdAt: '2026-03-01',
    jobUrl: 'https://apply.workable.com/j/TEST123',
    applyUrl: 'https://apply.workable.com/j/TEST123/apply',
    ...overrides,
  };
}

export function makeRawJob(overrides?: Partial<WorkableRawJob>): WorkableRawJob {
  return {
    id: 12345,
    title: 'Senior Software Engineer',
    shortcode: 'TEST123',
    code: '',
    remote: true,
    location: {
      country: 'Germany',
      countryCode: 'DE',
      city: 'Berlin',
      region: 'Berlin',
    },
    locations: [
      {
        country: 'Germany',
        countryCode: 'DE',
        city: 'Berlin',
        region: 'Berlin',
        hidden: false,
      },
    ],
    state: 'published',
    isInternal: false,
    published: '2026-03-01',
    type: 'full',
    language: 'en',
    department: ['Engineering'],
    accountUid: 'test-uid',
    approvalStatus: 'approved',
    workplace: 'remote',
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
        shortcode: '1',
        title: 'Senior Software Engineer',
        department: 'Engineering',
        isRemote: true,
        country: 'Germany',
        city: 'Berlin',
        state: 'Berlin',
      }),
      makeJob({
        shortcode: '2',
        title: 'Product Manager',
        department: 'Product',
        isRemote: false,
        country: 'United States',
        city: 'San Francisco',
        state: 'California',
      }),
    ],
    scrapedAt: '2026-03-01T00:00:00.000Z',
    ...overrides,
  };
}
