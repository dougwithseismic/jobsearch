import type { BreezyJob, CompanyJobs } from '../types.js';

export function makeJob(overrides?: Partial<BreezyJob>): BreezyJob {
  return {
    id: "abc123def456",
    friendlyId: "abc123def456-senior-software-engineer",
    name: "Senior Software Engineer",
    url: "https://testco.breezy.hr/p/abc123def456-senior-software-engineer",
    publishedDate: "2026-03-01T00:00:00.000Z",
    type: { id: "full-time", name: "Full Time" },
    location: {
      country: { name: "Germany", id: "DE" },
      state: null,
      city: "Berlin",
      primary: true,
      isRemote: false,
      name: "Berlin, Germany",
    },
    department: "Engineering",
    salary: "",
    company: {
      name: "TestCo",
      logoUrl: null,
      friendlyId: "testco",
      isMultipleLocationsEnabled: false,
    },
    locations: [
      {
        country: { name: "Germany", id: "DE" },
        countryCode: "DE",
        city: "Berlin",
        region: "Berlin",
        hidden: false,
      },
    ],
    ...overrides,
  };
}

export function makeCompanyJobs(overrides?: Partial<CompanyJobs>): CompanyJobs {
  return {
    company: "TestCo",
    slug: "testco",
    jobCount: 2,
    jobs: [
      makeJob({
        id: "abc123def456",
        name: "Senior Software Engineer",
        department: "Engineering",
        location: {
          country: { name: "Germany", id: "DE" },
          state: null,
          city: "Berlin",
          primary: true,
          isRemote: false,
          name: "Berlin, Germany",
        },
      }),
      makeJob({
        id: "xyz789ghi012",
        name: "Product Manager",
        department: "Product",
        location: {
          country: { name: "United States", id: "US" },
          state: { id: "CA", name: "California" },
          city: "San Francisco",
          primary: true,
          isRemote: false,
          name: "San Francisco, CA",
        },
      }),
    ],
    scrapedAt: "2026-03-01T00:00:00.000Z",
    ...overrides,
  };
}

/** Raw API response shape for mocking */
export function makeRawJob(overrides?: Record<string, unknown>) {
  return {
    id: "abc123def456",
    friendly_id: "abc123def456-senior-software-engineer",
    name: "Senior Software Engineer",
    url: "https://testco.breezy.hr/p/abc123def456-senior-software-engineer",
    published_date: "2026-03-01T00:00:00.000Z",
    type: { id: "full-time", name: "Full Time" },
    location: {
      country: { name: "Germany", id: "DE" },
      state: null,
      city: "Berlin",
      primary: true,
      is_remote: false,
      name: "Berlin, Germany",
    },
    department: "Engineering",
    salary: "$80,000 - $120,000 / yr",
    company: {
      name: "TestCo",
      logo_url: null,
      friendly_id: "testco",
      isMultipleLocationsEnabled: false,
    },
    locations: [
      {
        country: { name: "Germany", id: "DE" },
        countryCode: "DE",
        city: "Berlin",
        region: "Berlin",
        hidden: false,
      },
    ],
    ...overrides,
  };
}
