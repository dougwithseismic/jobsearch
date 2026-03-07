import type { CompanyJobs, FlatJob } from "./types.js";

/**
 * Flatten CompanyJobs[] into individual job rows.
 */
export function flattenJobs(results: CompanyJobs[]): FlatJob[] {
  const rows: FlatJob[] = [];
  for (const company of results) {
    for (const job of company.jobs) {
      rows.push({
        company: company.company,
        companySlug: company.slug,
        id: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        country: job.country,
        city: job.city,
        state: job.state,
        remote: job.remote,
        employmentType: job.employmentType,
        publishedAt: job.publishedAt,
        careersUrl: job.careersUrl,
        tags: job.tags.join(", "),
        descriptionPlain: job.descriptionPlain,
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
    "department",
    "location",
    "country",
    "city",
    "remote",
    "employmentType",
    "publishedAt",
    "careersUrl",
    "tags",
  ];

  const rows: string[] = [headers.join(",")];

  for (const company of results) {
    for (const job of company.jobs) {
      rows.push(
        [
          csvQuote(company.company),
          csvQuote(job.title),
          csvQuote(job.department),
          csvQuote(job.location),
          csvQuote(job.country),
          csvQuote(job.city),
          String(job.remote),
          job.employmentType,
          job.publishedAt?.split("T")[0] ?? "",
          job.careersUrl,
          csvQuote(job.tags.join(", ")),
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
    { key: "department", label: "Dept", maxW: 16 },
    { key: "location", label: "Location", maxW: 22 },
    { key: "remote", label: "Remote", maxW: 6 },
    { key: "publishedAt", label: "Posted", maxW: 10 },
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
        if (c.key === "publishedAt") val = val.split("T")[0] ?? val;
        if (c.key === "remote") val = row.remote ? "Yes" : "No";
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
