import type { PinpointJob, CompanyJobs } from '../types.js';

export function makeJob(overrides?: Partial<PinpointJob>): PinpointJob {
  return {
    id: '447735',
    title: 'Senior Software Engineer',
    description: '',
    location: {
      id: '2548',
      city: 'Berlin',
      name: 'Germany',
      postalCode: '',
      province: 'Berlin',
    },
    department: 'Engineering',
    workplaceType: 'remote',
    workplaceTypeText: 'Fully remote',
    employmentType: 'full_time',
    employmentTypeText: 'Full Time',
    url: 'https://testco.pinpointhq.com/en/postings/447735',
    path: '/en/postings/447735',
    compensationVisible: false,
    compensationMin: null,
    compensationMax: null,
    compensationCurrency: null,
    compensationFrequency: null,
    deadlineAt: null,
    reportingTo: 'Head of Engineering',
    requisitionId: 'ENG-001',
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
        id: '447735',
        title: 'Senior Software Engineer',
        department: 'Engineering',
      }),
      makeJob({
        id: '447736',
        title: 'Product Manager',
        department: 'Product',
      }),
    ],
    scrapedAt: '2026-03-01T00:00:00.000Z',
    ...overrides,
  };
}

/** Raw API response shape for mocking */
export function makeRawJob(overrides?: Record<string, unknown>) {
  return {
    id: '447735',
    title: 'Senior Software Engineer',
    description: '<p>We are looking for a Senior Software Engineer.</p>',
    benefits: '<ul><li>Healthcare</li></ul>',
    benefits_header: 'Benefits',
    compensation: null,
    compensation_minimum: null,
    compensation_maximum: null,
    compensation_currency: null,
    compensation_frequency: null,
    compensation_visible: false,
    deadline_at: null,
    employment_type: 'full_time',
    employment_type_text: 'Full Time',
    key_responsibilities: '<ul><li>Build things</li></ul>',
    key_responsibilities_header: 'Responsibilities',
    reporting_to: 'Head of Engineering',
    skills_knowledge_expertise: '<ul><li>TypeScript</li></ul>',
    skills_knowledge_expertise_header: 'Requirements',
    url: 'https://testco.pinpointhq.com/en/postings/447735',
    path: '/en/postings/447735',
    workplace_type: 'remote',
    workplace_type_text: 'Fully remote',
    job: {
      id: '455877',
      requisition_id: 'ENG-001',
      department: {
        id: '192',
        name: 'Engineering',
      },
      division: null,
      structure_custom_group_one: null,
    },
    location: {
      id: '2548',
      city: 'Berlin',
      name: 'Germany',
      postal_code: '',
      province: 'Berlin',
    },
    ...overrides,
  };
}
