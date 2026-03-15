import type { BambooHRJob, CompanyJobs } from '../types.js';

export function makeJob(overrides?: Partial<BambooHRJob>): BambooHRJob {
  return {
    id: "15",
    jobOpeningName: "Senior Software Engineer",
    departmentId: "18264",
    departmentLabel: "Engineering",
    employmentStatusLabel: "Full-Time",
    location: {
      city: "Berlin",
      state: "Berlin",
    },
    isRemote: null,
    locationType: "0",
    ...overrides,
  };
}

export function makeCompanyJobs(overrides?: Partial<CompanyJobs>): CompanyJobs {
  return {
    company: "testco",
    slug: "testco",
    jobCount: 2,
    jobs: [
      makeJob({
        id: "15",
        jobOpeningName: "Senior Software Engineer",
        departmentLabel: "Engineering",
        location: { city: "Berlin", state: "Berlin" },
      }),
      makeJob({
        id: "16",
        jobOpeningName: "Product Manager",
        departmentLabel: "Product",
        location: { city: "San Francisco", state: "California" },
      }),
    ],
    scrapedAt: "2026-03-01T00:00:00.000Z",
    ...overrides,
  };
}

/** Raw list API response shape for mocking */
export function makeRawListResponse(overrides?: { result?: Record<string, unknown>[]; totalCount?: number }) {
  const result = overrides?.result ?? [
    {
      id: "15",
      jobOpeningName: "Senior Software Engineer",
      departmentId: "18264",
      departmentLabel: "Engineering",
      employmentStatusLabel: "Full-Time",
      location: { city: "Berlin", state: "Berlin" },
      atsLocation: { country: null, state: null, city: null },
      isRemote: null,
      locationType: "0",
    },
  ];
  return {
    meta: { totalCount: overrides?.totalCount ?? result.length },
    result,
  };
}

/** Raw detail API response shape for mocking */
export function makeRawDetailResponse(overrides?: Record<string, unknown>) {
  return {
    meta: {},
    result: {
      jobOpening: {
        id: "15",
        jobOpeningName: "Senior Software Engineer",
        jobOpeningShareUrl: "https://testco.bamboohr.com/careers/15",
        departmentId: "18264",
        departmentLabel: "Engineering",
        employmentStatusLabel: "Full-Time",
        location: {
          city: "Berlin",
          state: "Berlin",
          postalCode: "10115",
          addressCountry: "Germany",
        },
        atsLocation: { country: null, state: null, city: null },
        isRemote: null,
        locationType: "0",
        description: "<p>Job description here</p>",
        compensation: null,
        datePosted: "2026-03-01",
        minimumExperience: "5 years",
        ...overrides,
      },
    },
  };
}
