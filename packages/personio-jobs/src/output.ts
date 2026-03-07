import type { CompanyJobs, FlatJob } from "./types.js";

/**
 * Build a job URL from company slug and job ID.
 */
function buildJobUrl(slug: string, jobId: number): string {
  return `https://${slug}.jobs.personio.de/job/${jobId}`;
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
        name: job.name,
        department: job.department,
        office: job.office,
        recruitingCategory: job.recruitingCategory,
        employmentType: job.employmentType,
        seniority: job.seniority,
        schedule: job.schedule,
        createdAt: job.createdAt,
        jobUrl: buildJobUrl(company.slug, job.id),
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
    "name",
    "department",
    "office",
    "employmentType",
    "seniority",
    "schedule",
    "createdAt",
    "jobUrl",
  ];

  const rows: string[] = [headers.join(",")];

  for (const company of results) {
    for (const job of company.jobs) {
      rows.push(
        [
          csvQuote(company.company),
          csvQuote(job.name),
          csvQuote(job.department),
          csvQuote(job.office),
          csvQuote(job.employmentType),
          csvQuote(job.seniority),
          csvQuote(job.schedule),
          job.createdAt?.split("T")[0] ?? "",
          buildJobUrl(company.slug, job.id),
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
    { key: "name", label: "Title", maxW: 30 },
    { key: "department", label: "Dept", maxW: 16 },
    { key: "office", label: "Office", maxW: 18 },
    { key: "seniority", label: "Seniority", maxW: 12 },
    { key: "createdAt", label: "Created", maxW: 10 },
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
        if (c.key === "createdAt") val = val.split("T")[0] ?? val;
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
