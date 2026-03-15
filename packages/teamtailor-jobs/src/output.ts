import type { CompanyJobs, FlatJob } from "./types.js";

/**
 * Flatten CompanyJobs[] into individual job rows.
 */
export function flattenJobs(results: CompanyJobs[]): FlatJob[] {
  const rows: FlatJob[] = [];
  for (const company of results) {
    for (const job of company.jobs) {
      const locationText = job.locations
        .map((l) => [l.city, l.country].filter(Boolean).join(", "))
        .join("; ");
      rows.push({
        company: company.company,
        slug: company.slug,
        title: job.title,
        department: job.department ?? "",
        role: job.role ?? "",
        location: locationText,
        remoteStatus: job.remoteStatus ?? "",
        pubDate: job.pubDate,
        link: job.link,
        guid: job.guid,
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
    "department",
    "role",
    "location",
    "remoteStatus",
    "pubDate",
    "link",
  ];

  const rows: string[] = [headers.join(",")];

  for (const company of results) {
    for (const job of company.jobs) {
      const locationText = job.locations
        .map((l) => [l.city, l.country].filter(Boolean).join(", "))
        .join("; ");
      rows.push(
        [
          csvQuote(company.company),
          csvQuote(job.title),
          csvQuote(job.department ?? ""),
          csvQuote(job.role ?? ""),
          csvQuote(locationText),
          job.remoteStatus ?? "",
          job.pubDate?.split("T")[0] ?? "",
          job.link,
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
    { key: "role", label: "Role", maxW: 16 },
    { key: "location", label: "Location", maxW: 22 },
    { key: "remoteStatus", label: "Remote", maxW: 8 },
    { key: "pubDate", label: "Published", maxW: 10 },
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
        if (c.key === "pubDate") val = val.split("T")[0] ?? val;
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
