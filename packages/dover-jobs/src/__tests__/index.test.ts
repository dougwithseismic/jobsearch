import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  scrapeCompany,
  scrapeAll,
  searchJobs,
  _resolveSlug,
  _listJobs,
  _fetchJobDetail,
} from "../index.js";
import {
  makeJob,
  makeCompanyJobs,
  makeRawCareersPage,
  makeRawJobList,
  makeRawJobDetail,
} from "./fixtures.js";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe("resolveSlug", () => {
  it("resolves a slug to a careers page", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => makeRawCareersPage(),
    });

    const page = await _resolveSlug("testco");
    expect(page).not.toBeNull();
    expect(page!.id).toBe("aaaabbbb-cccc-dddd-eeee-ffffffffffff");
    expect(page!.name).toBe("TestCo");
    expect(page!.slug).toBe("testco");
  });

  it("returns null for 404", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const page = await _resolveSlug("nonexistent");
    expect(page).toBeNull();
  });

  it("returns null on network error", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const page = await _resolveSlug("testco");
    expect(page).toBeNull();
    mockFetch.mockReset();
  }, 30000);

  it("returns null when response has no id", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ name: "TestCo" }),
    });

    const page = await _resolveSlug("testco");
    expect(page).toBeNull();
  });

  it("calls the correct API URL", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => makeRawCareersPage(),
    });

    await _resolveSlug("my-company");
    expect(mockFetch.mock.calls[0][0]).toBe(
      "https://app.dover.com/api/v1/careers-page-slug/my-company"
    );
  });
});

describe("listJobs", () => {
  it("returns parsed jobs from the API", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => makeRawJobList(),
    });

    const jobs = await _listJobs("some-uuid");
    expect(jobs).toHaveLength(2);
    expect(jobs[0].id).toBe("job-uuid-1001");
    expect(jobs[0].title).toBe("Senior Software Engineer");
    expect(jobs[1].id).toBe("job-uuid-1002");
  });

  it("filters out unpublished and sample jobs", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () =>
        makeRawJobList([
          { id: "j1", title: "Published", locations: [], is_published: true, is_sample: false },
          { id: "j2", title: "Unpublished", locations: [], is_published: false, is_sample: false },
          { id: "j3", title: "Sample", locations: [], is_published: true, is_sample: true },
        ]),
    });

    const jobs = await _listJobs("some-uuid");
    expect(jobs).toHaveLength(1);
    expect(jobs[0].title).toBe("Published");
  });

  it("returns empty array on error", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const jobs = await _listJobs("some-uuid");
    expect(jobs).toEqual([]);
    mockFetch.mockReset();
  }, 30000);

  it("calls the correct API URL with limit", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => makeRawJobList([]),
    });

    await _listJobs("some-uuid", 50);
    expect(mockFetch.mock.calls[0][0]).toBe(
      "https://app.dover.com/api/v1/careers-page/some-uuid/jobs?limit=50"
    );
  });
});

describe("fetchJobDetail", () => {
  it("returns enriched job details", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => makeRawJobDetail(),
    });

    const detail = await _fetchJobDetail("job-uuid-1001");
    expect(detail).not.toBeNull();
    expect(detail!.description).toContain("Senior Software Engineer");
    expect(detail!.compensation).toBeDefined();
    expect(detail!.compensation!.lower_bound).toBe(120000);
    expect(detail!.visa_support).toBe(true);
    expect(detail!.created).toBe("2026-02-15T10:00:00.000Z");
  });

  it("returns null on error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const detail = await _fetchJobDetail("nonexistent");
    expect(detail).toBeNull();
  });

  it("calls the correct API URL", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => makeRawJobDetail(),
    });

    await _fetchJobDetail("job-uuid-1001");
    expect(mockFetch.mock.calls[0][0]).toBe(
      "https://app.dover.com/api/v1/inbound/application-portal-job/job-uuid-1001"
    );
  });
});

describe("scrapeCompany", () => {
  it("returns CompanyJobs for a valid slug", async () => {
    // resolveSlug
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => makeRawCareersPage(),
    });
    // listJobs
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => makeRawJobList(),
    });

    const result = await scrapeCompany("testco");
    expect(result).not.toBeNull();
    expect(result!.slug).toBe("testco");
    expect(result!.company).toBe("TestCo");
    expect(result!.jobs).toHaveLength(2);
    expect(result!.jobCount).toBe(2);
    expect(result!.careersPageId).toBe("aaaabbbb-cccc-dddd-eeee-ffffffffffff");
    expect(result!.scrapedAt).toBeDefined();
  });

  it("returns null when slug cannot be resolved", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const result = await scrapeCompany("nonexistent");
    expect(result).toBeNull();
  });

  it("returns null when no jobs exist", async () => {
    // resolveSlug
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => makeRawCareersPage(),
    });
    // listJobs - empty
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => makeRawJobList([]),
    });

    const result = await scrapeCompany("empty");
    expect(result).toBeNull();
  });

  it("enriches jobs with details when includeDetails is true", async () => {
    // resolveSlug
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => makeRawCareersPage(),
    });
    // listJobs - single job
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () =>
        makeRawJobList([
          {
            id: "job-uuid-1001",
            title: "Engineer",
            locations: [],
            is_published: true,
            is_sample: false,
          },
        ]),
    });
    // fetchJobDetail
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => makeRawJobDetail(),
    });

    const result = await scrapeCompany("testco", { includeDetails: true });
    expect(result).not.toBeNull();
    expect(result!.jobs[0].description).toContain("Senior Software Engineer");
    expect(result!.jobs[0].compensation).toBeDefined();
    expect(result!.jobs[0].visa_support).toBe(true);
  });

  it("does not fetch details by default", async () => {
    // resolveSlug
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => makeRawCareersPage(),
    });
    // listJobs
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => makeRawJobList(),
    });

    const result = await scrapeCompany("testco");
    expect(result).not.toBeNull();
    // Only 2 fetch calls: resolveSlug + listJobs
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result!.jobs[0].description).toBeUndefined();
  });
});

describe("scrapeAll", () => {
  it("returns sorted results by job count descending", async () => {
    // Company 1: resolve + list (1 job)
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => makeRawCareersPage({ slug: "small" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () =>
          makeRawJobList([
            { id: "j1", title: "Job 1", locations: [], is_published: true, is_sample: false },
          ]),
      })
      // Company 2: resolve + list (3 jobs)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => makeRawCareersPage({ slug: "large" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () =>
          makeRawJobList([
            { id: "j2", title: "Job 2", locations: [], is_published: true, is_sample: false },
            { id: "j3", title: "Job 3", locations: [], is_published: true, is_sample: false },
            { id: "j4", title: "Job 4", locations: [], is_published: true, is_sample: false },
          ]),
      });

    const result = await scrapeAll(["small", "large"], { concurrency: 1 });
    expect(result).toHaveLength(2);
    expect(result[0].jobCount).toBe(3);
    expect(result[1].jobCount).toBe(1);
  });

  it("skips companies that return null", async () => {
    // Company 1: resolve + list
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => makeRawCareersPage(),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => makeRawJobList(),
      })
      // Company 2: 404
      .mockResolvedValueOnce({ ok: false, status: 404 });

    const result = await scrapeAll(["exists", "missing"], { concurrency: 1 });
    expect(result).toHaveLength(1);
  });

  it("calls onProgress callback", async () => {
    // resolveSlug + listJobs
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => makeRawCareersPage(),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => makeRawJobList(),
      });

    const onProgress = vi.fn();
    await scrapeAll(["test"], { concurrency: 1, onProgress });
    expect(onProgress).toHaveBeenCalledWith(1, 1, 1);
  });

  it("handles empty slugs array", async () => {
    const result = await scrapeAll([]);
    expect(result).toEqual([]);
  });
});

describe("searchJobs", () => {
  it("filters by keyword", () => {
    const data = [
      makeCompanyJobs({
        company: "Acme",
        jobs: [
          makeJob({ id: "j1", title: "Frontend Engineer" }),
          makeJob({ id: "j2", title: "Product Manager" }),
        ],
        jobCount: 2,
      }),
    ];

    const result = searchJobs(data, {
      text: "Engineer",
      limit: 5,
    });

    expect(result).toHaveLength(1);
    expect(result[0].jobs).toHaveLength(1);
    expect(result[0].jobs[0].title).toBe("Frontend Engineer");
  });

  it("filters by location", () => {
    const data = [
      makeCompanyJobs({
        jobs: [
          makeJob({
            id: "j1",
            title: "Engineer",
            locations: [{ name: "Remote - Europe", location_type: "REMOTE" }],
          }),
          makeJob({
            id: "j2",
            title: "Engineer",
            locations: [{ name: "San Francisco", location_type: "IN_PERSON" }],
          }),
        ],
        jobCount: 2,
      }),
    ];

    const result = searchJobs(data, {
      filters: { location: /europe/i },
    });

    expect(result).toHaveLength(1);
    expect(result[0].jobs).toHaveLength(1);
    expect(result[0].jobs[0].locations[0].name).toBe("Remote - Europe");
  });

  it("applies limit across results", () => {
    const data = [
      makeCompanyJobs({
        jobs: [
          makeJob({ id: "j1", title: "Job 1" }),
          makeJob({ id: "j2", title: "Job 2" }),
          makeJob({ id: "j3", title: "Job 3" }),
        ],
        jobCount: 3,
      }),
    ];

    const result = searchJobs(data, { limit: 2 });
    expect(result[0].jobs).toHaveLength(2);
    expect(result[0].jobCount).toBe(2);
  });
});
