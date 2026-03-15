import type { CompanyJobs, FlatJob } from "./types.js";

/**
 * Build location text from a job's locations array.
 */
function locationText(job: { locations: { name?: string; location_option?: { display_name?: string } }[] }): string {
  return job.locations
    .map((l) => l.name || l.location_option?.display_name || "")
    .filter(Boolean)
    .join("; ");
}

/**
 * Build location type text from a job's first location.
 */
function locationType(job: { locations: { location_type?: string }[] }): string {
  return job.locations[0]?.location_type ?? "";
}

/**
 * Flatten CompanyJobs[] into individual job rows.
 */
export function flattenJobs(results: CompanyJobs[]): FlatJob[] {
  const rows: FlatJob[] = [];
  for (const company of results) {
    for (const job of company.jobs) {
      rows.push({
        company: company.company,
        slug: company.slug,
        id: job.id,
        title: job.title,
        location: locationText(job),
        locationType: locationType(job),
        created: job.created ?? "",
        jobUrl: `https://app.dover.com/apply/${company.slug}/jobs/${job.id}`,
        description: job.description,
      });
    }
  }
  return rows;
}

/**
 * Format results as JSON string.
 */
export function toJSON(results: CompanyJobs[], pretty = true): string {
  return JSON.stringify(results, null, pretty ? 2 : undefined);
}

/**
 * Format results as CSV string.
 */
export function toCSV(results: CompanyJobs[]): string {
  const headers = [
    "company",
    "title",
    "location",
    "locationType",
    "created",
    "jobUrl",
  ];

  const rows: string[] = [headers.join(",")];

  for (const company of results) {
    for (const job of company.jobs) {
      rows.push(
        [
          csvQuote(company.company),
          csvQuote(job.title),
          csvQuote(locationText(job)),
          csvQuote(locationType(job)),
          job.created?.split("T")[0] ?? "",
          `https://app.dover.com/apply/${company.slug}/jobs/${job.id}`,
        ].join(",")
      );
    }
  }

  return rows.join("\n");
}

function csvQuote(s: string): string {
  if (!s) return '""';
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * Format results as an aligned text table.
 */
export function toTable(results: CompanyJobs[], _maxWidth = 120): string {
  const rows = flattenJobs(results);

  if (rows.length === 0) {
    return "No results found.";
  }

  const columns: { key: keyof FlatJob; label: string; maxW: number }[] = [
    { key: "company", label: "Company", maxW: 22 },
    { key: "title", label: "Title", maxW: 30 },
    { key: "location", label: "Location", maxW: 28 },
    { key: "locationType", label: "Type", maxW: 10 },
    { key: "created", label: "Created", maxW: 10 },
  ];

  // Header
  const header = columns
    .map((c) => c.label.padEnd(c.maxW))
    .join("  ");
  const separator = columns
    .map((c) => "-".repeat(c.maxW))
    .join("  ");

  const lines = [header, separator];

  for (const row of rows) {
    const line = columns
      .map((c) => {
        let val = String(row[c.key] ?? "");
        if (c.key === "created") val = val.split("T")[0] ?? val;
        if (val.length > c.maxW) val = val.slice(0, c.maxW - 1) + "\u2026";
        return val.padEnd(c.maxW);
      })
      .join("  ");
    lines.push(line);
  }

  const totalJobs = results.reduce((s, r) => s + r.jobCount, 0);
  lines.push("");
  lines.push(
    `${totalJobs} jobs across ${results.length} companies`
  );

  return lines.join("\n");
}
