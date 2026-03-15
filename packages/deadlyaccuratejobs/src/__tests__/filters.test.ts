import { describe, it, expect } from "vitest";
import { filterJobs } from "../filters.js";
import type { UnifiedJob } from "../../../../packages/job-ingest/src/unified-schema.js";

function makeJob(overrides: Partial<UnifiedJob> = {}): UnifiedJob {
  return {
    id: "test_1",
    sourceId: "1",
    title: "Software Engineer",
    description: "",
    descriptionSnippet: "Build stuff",
    descriptionHtml: null,
    department: "Engineering",
    team: "",
    category: "",
    location: { text: "London, UK", city: "London", state: null, country: "GB", region: "europe", lat: null, lng: null },
    secondaryLocations: [],
    workplaceType: "remote",
    employmentType: "full-time",
    employmentTypeRaw: "",
    seniorityLevel: "senior",
    salary: { text: "", min: null, max: null, currency: null, period: null },
    jobUrl: "https://example.com/job/1",
    applyUrl: "https://example.com/job/1/apply",
    company: { name: "TestCo", slug: "testco", ats: "greenhouse", logoUrl: null, careersUrl: null },
    tags: ["engineering"],
    publishedAt: "2026-03-10T00:00:00Z",
    scrapedAt: "2026-03-15T00:00:00Z",
    lastSeenAt: "2026-03-15T00:00:00Z",
    ...overrides,
  } as UnifiedJob;
}

describe("filterJobs", () => {
  const jobs = [
    makeJob({ id: "1", title: "Senior Backend Engineer", workplaceType: "remote", seniorityLevel: "senior", location: { text: "London", city: "London", state: null, country: "GB", region: "europe", lat: null, lng: null } }),
    makeJob({ id: "2", title: "Junior Frontend Dev", workplaceType: "onsite", seniorityLevel: "junior", location: { text: "NYC", city: "NYC", state: null, country: "US", region: "north-america", lat: null, lng: null } }),
    makeJob({ id: "3", title: "Staff Platform Engineer", workplaceType: "remote", seniorityLevel: "staff", department: "Platform", location: { text: "Berlin", city: "Berlin", state: null, country: "DE", region: "europe", lat: null, lng: null } }),
    makeJob({ id: "4", title: "Product Manager", workplaceType: "hybrid", seniorityLevel: "mid", department: "Product", location: { text: "Remote", city: null, state: null, country: null, region: "remote-global", lat: null, lng: null } }),
  ];

  it("returns all jobs with no options", () => {
    expect(filterJobs(jobs)).toHaveLength(4);
  });

  it("filters remote only", () => {
    const result = filterJobs(jobs, { remote: true });
    expect(result).toHaveLength(2);
    expect(result.every((j) => j.workplaceType === "remote")).toBe(true);
  });

  it("filters by location regex", () => {
    const result = filterJobs(jobs, { location: "europe" });
    expect(result).toHaveLength(2);
  });

  it("filters by keyword", () => {
    const result = filterJobs(jobs, { keyword: "backend" });
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("1");
  });

  it("filters by department", () => {
    const result = filterJobs(jobs, { department: "platform" });
    expect(result).toHaveLength(1);
  });

  it("filters by seniority", () => {
    const result = filterJobs(jobs, { seniority: ["senior", "staff"] });
    expect(result).toHaveLength(2);
  });

  it("applies limit", () => {
    const result = filterJobs(jobs, { limit: 2 });
    expect(result).toHaveLength(2);
  });

  it("combines filters", () => {
    const result = filterJobs(jobs, { remote: true, keyword: "engineer" });
    expect(result).toHaveLength(2);
  });
});
