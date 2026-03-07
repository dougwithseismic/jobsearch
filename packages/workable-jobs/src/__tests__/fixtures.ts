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
    title: 'Senior Software Engineer',
    shortcode: 'TEST123',
    code: '',
    employment_type: 'Full-time',
    telecommuting: true,
    department: 'Engineering',
    url: 'https://apply.workable.com/j/TEST123',
    shortlink: 'https://apply.workable.com/j/TEST123',
    application_url: 'https://apply.workable.com/j/TEST123/apply',
    published_on: '2026-03-01',
    created_at: '2026-03-01',
    country: 'Germany',
    city: 'Berlin',
    state: 'Berlin',
    education: '',
    experience: 'Mid-Senior level',
    function: 'Engineering',
    industry: 'Computer Software',
    locations: [
      {
        country: 'Germany',
        countryCode: 'DE',
        city: 'Berlin',
        region: 'Berlin',
        hidden: false,
      },
    ],
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
