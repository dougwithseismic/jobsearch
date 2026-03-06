import { describe, it, expect } from "vitest";
import { filterJobs, searchJobs } from "../filters.js";
import {
  makeJob,
  allJobs,
  remoteEuJob,
  usOnsiteJob,
  foundingEngineerJob,
  minimalJob,
  londonHybridJob,
} from "./fixtures.js";

describe("filterJobs", () => {
  it("filters by remote=true, keeping only remote jobs", () => {
    const result = filterJobs(allJobs, { remote: true });
    expect(result.every((j) => j.isRemote)).toBe(true);
    expect(result).toHaveLength(2); // remoteEuJob + foundingEngineerJob
    expect(result).toContain(remoteEuJob);
    expect(result).toContain(foundingEngineerJob);
  });

  it("filters by location regex", () => {
    const result = filterJobs(allJobs, { location: /London/i });
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(londonHybridJob);
  });

  it("matches location against description when location field is empty", () => {
    // minimalJob has empty location but description mentions nothing about London
    // Add a custom job that has location in description only
    const jobs = [
      makeJob({
        hnId: 99,
        location: "",
        description: "Based in Berlin, Germany. Remote-friendly.",
      }),
    ];
    const result = filterJobs(jobs, { location: /Berlin/i });
    expect(result).toHaveLength(1);
  });

  it("filters by keyword regex matching company or title", () => {
    const result = filterJobs(allJobs, { keyword: /Founding/i });
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(foundingEngineerJob);
  });

  it("filters by keyword matching description", () => {
    const result = filterJobs(allJobs, { keyword: /audio tools/i });
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(foundingEngineerJob);
  });

  it("filters by technology regex", () => {
    const result = filterJobs(allJobs, { technology: /graphql/i });
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(londonHybridJob);
  });

  it("filters by technology matching description text", () => {
    // minimalJob has python in technologies array already
    const result = filterJobs(allJobs, { technology: /python/i });
    expect(result).toContain(foundingEngineerJob);
    expect(result).toContain(minimalJob);
  });

  it("applies combined filters (remote + location)", () => {
    const result = filterJobs(allJobs, { remote: true, location: /EU/i });
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(remoteEuJob);
  });

  it("applies combined filters (remote + technology)", () => {
    const result = filterJobs(allJobs, { remote: true, technology: /openai/i });
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(foundingEngineerJob);
  });

  it("returns empty array when nothing matches", () => {
    const result = filterJobs(allJobs, { location: /Antarctica/i });
    expect(result).toHaveLength(0);
  });

  it("returns empty array for empty input", () => {
    const result = filterJobs([], { remote: true });
    expect(result).toHaveLength(0);
  });
});

describe("searchJobs", () => {
  it("returns all jobs when no filters or text provided", () => {
    const result = searchJobs(allJobs);
    expect(result).toHaveLength(allJobs.length);
  });

  it("searches by text matching job title", () => {
    const result = searchJobs(allJobs, "Frontend");
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(londonHybridJob);
  });

  it("searches by text matching company name", () => {
    const result = searchJobs(allJobs, "Wavelet");
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(foundingEngineerJob);
  });

  it("searches by text matching description content", () => {
    const result = searchJobs(allJobs, "data pipelines");
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(usOnsiteJob);
  });

  it("applies limit", () => {
    const result = searchJobs(allJobs, undefined, undefined, 2);
    expect(result).toHaveLength(2);
  });

  it("combines text and structured filters", () => {
    const result = searchJobs(allJobs, "Engineer", { remote: true });
    // remoteEuJob (Full Stack Engineer, remote) + foundingEngineerJob (Founding Engineer, remote)
    expect(result).toHaveLength(2);
    expect(result.every((j) => j.isRemote)).toBe(true);
  });

  it("escapes regex special chars in text search", () => {
    // Should not throw, just return no results
    const result = searchJobs(allJobs, "C++ (advanced)");
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns empty array when nothing matches", () => {
    const result = searchJobs(allJobs, "Nonexistent Company XYZ");
    expect(result).toHaveLength(0);
  });

  it("handles empty jobs array", () => {
    const result = searchJobs([], "anything");
    expect(result).toHaveLength(0);
  });
});
