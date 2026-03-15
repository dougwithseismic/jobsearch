import type { DoverJob, DoverCareersPage, CompanyJobs } from "../types.js";

export function makeCareersPage(overrides?: Partial<DoverCareersPage>): DoverCareersPage {
  return {
    id: "aaaabbbb-cccc-dddd-eeee-ffffffffffff",
    name: "TestCo",
    slug: "testco",
    ...overrides,
  };
}

export function makeJob(overrides?: Partial<DoverJob>): DoverJob {
  return {
    id: "job-uuid-1001",
    title: "Senior Software Engineer",
    locations: [
      {
        location_type: "REMOTE",
        location_option: {
          id: "loc-1",
          display_name: "Remote - Europe",
          city: "Berlin",
          state: "",
          country: "Germany",
        },
        name: "Remote - Europe",
      },
    ],
    is_published: true,
    is_sample: false,
    ...overrides,
  };
}

export function makeCompanyJobs(overrides?: Partial<CompanyJobs>): CompanyJobs {
  return {
    company: "TestCo",
    slug: "testco",
    careersPageId: "aaaabbbb-cccc-dddd-eeee-ffffffffffff",
    jobCount: 2,
    jobs: [
      makeJob({
        id: "job-uuid-1001",
        title: "Senior Software Engineer",
      }),
      makeJob({
        id: "job-uuid-1002",
        title: "Product Manager",
        locations: [
          {
            location_type: "IN_PERSON",
            location_option: {
              id: "loc-2",
              display_name: "San Francisco, CA",
              city: "San Francisco",
              state: "CA",
              country: "US",
            },
            name: "San Francisco, CA",
          },
        ],
      }),
    ],
    scrapedAt: "2026-03-01T00:00:00.000Z",
    ...overrides,
  };
}

/** Raw careers-page-slug response for mocking */
export function makeRawCareersPage(overrides?: Record<string, unknown>) {
  return {
    id: "aaaabbbb-cccc-dddd-eeee-ffffffffffff",
    name: "TestCo",
    slug: "testco",
    ...overrides,
  };
}

/** Raw job list response for mocking */
export function makeRawJobList(jobs?: Record<string, unknown>[]) {
  return {
    count: jobs?.length ?? 2,
    results: jobs ?? [
      {
        id: "job-uuid-1001",
        title: "Senior Software Engineer",
        locations: [
          {
            location_type: "REMOTE",
            location_option: {
              id: "loc-1",
              display_name: "Remote - Europe",
              city: "Berlin",
              country: "Germany",
            },
            name: "Remote - Europe",
          },
        ],
        is_published: true,
        is_sample: false,
      },
      {
        id: "job-uuid-1002",
        title: "Product Manager",
        locations: [
          {
            location_type: "IN_PERSON",
            location_option: {
              id: "loc-2",
              display_name: "San Francisco, CA",
              city: "San Francisco",
              state: "CA",
              country: "US",
            },
            name: "San Francisco, CA",
          },
        ],
        is_published: true,
        is_sample: false,
      },
    ],
  };
}

/** Raw job detail response for mocking */
export function makeRawJobDetail(overrides?: Record<string, unknown>) {
  return {
    id: "job-uuid-1001",
    title: "Senior Software Engineer",
    user_provided_description: "<p>We are looking for a Senior Software Engineer.</p>",
    compensation: {
      lower_bound: 120000,
      upper_bound: 180000,
      currency: "USD",
      salary_type: "annual",
      employment_type: "full_time",
      equity_upper: null,
      equity_lower: null,
    },
    visa_support: true,
    created: "2026-02-15T10:00:00.000Z",
    ...overrides,
  };
}
