import { describe, it, expect } from "vitest";
import { toJSON, toCSV, toTable } from "../index.js";
import { makeJob, allJobs, remoteEuJob } from "./fixtures.js";

describe("toJSON", () => {
  it("produces valid JSON (pretty)", () => {
    const json = toJSON(allJobs);
    const parsed = JSON.parse(json);
    expect(parsed).toHaveLength(allJobs.length);
    expect(parsed[0].company).toBe(remoteEuJob.company);
    // Pretty print has newlines
    expect(json).toContain("\n");
  });

  it("produces compact JSON when pretty=false", () => {
    const json = toJSON(allJobs, false);
    expect(json).not.toContain("\n");
    const parsed = JSON.parse(json);
    expect(parsed).toHaveLength(allJobs.length);
  });

  it("handles empty results", () => {
    const json = toJSON([]);
    expect(JSON.parse(json)).toEqual([]);
  });
});

describe("toCSV", () => {
  it("produces valid CSV with correct headers", () => {
    const csv = toCSV(allJobs);
    const lines = csv.split("\n");
    expect(lines[0]).toBe(
      "company,title,location,remote,salary,technologies,url,applyUrl,postedAt,threadMonth,commentUrl,description"
    );
    // 1 header + N data rows
    expect(lines).toHaveLength(allJobs.length + 1);
  });

  it("handles commas in values by quoting", () => {
    const jobs = [
      makeJob({
        company: "Acme, Inc.",
        title: "Engineer, Senior",
        location: "San Francisco, CA",
      }),
    ];
    const csv = toCSV(jobs);
    const lines = csv.split("\n");
    expect(lines[1]).toContain('"Acme, Inc."');
    expect(lines[1]).toContain('"Engineer, Senior"');
  });

  it("escapes double quotes in values", () => {
    const jobs = [
      makeJob({
        company: 'The "Best" Company',
      }),
    ];
    const csv = toCSV(jobs);
    expect(csv).toContain('"The ""Best"" Company"');
  });

  it("handles empty results", () => {
    const csv = toCSV([]);
    const lines = csv.split("\n");
    // Only header
    expect(lines).toHaveLength(1);
  });

  it("formats postedAt as date only", () => {
    const jobs = [makeJob({ postedAt: "2026-03-01T12:30:00.000Z" })];
    const csv = toCSV(jobs);
    expect(csv).toContain("2026-03-01");
    expect(csv).not.toContain("T12:30");
  });
});

describe("toTable", () => {
  it("produces formatted table with columns", () => {
    const table = toTable(allJobs);
    expect(table).toContain("Company");
    expect(table).toContain("Title");
    expect(table).toContain("Location");
    expect(table).toContain("Remote");
    expect(table).toContain("Salary");
    expect(table).toContain("Thread");
    // Should have separator line
    expect(table).toContain("------");
    // Should have summary
    expect(table).toContain(`${allJobs.length} jobs total`);
  });

  it('returns "No results found." for empty results', () => {
    expect(toTable([])).toBe("No results found.");
  });

  it("truncates long values with ellipsis", () => {
    const jobs = [
      makeJob({
        title: "This Is An Extremely Long Job Title That Should Be Truncated By The Table Formatter",
      }),
    ];
    const table = toTable(jobs);
    expect(table).toContain("\u2026");
  });

  it("shows Yes/No for remote column", () => {
    const jobs = [
      makeJob({ isRemote: true }),
      makeJob({ hnId: 2, isRemote: false }),
    ];
    const table = toTable(jobs);
    expect(table).toContain("Yes");
    expect(table).toContain("No");
  });
});
