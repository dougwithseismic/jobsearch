#!/usr/bin/env tsx
/**
 * deadlyaccuratejobs CLI
 *
 * Usage:
 *   deadlyaccuratejobs "Stripe"                      # All jobs for Stripe
 *   deadlyaccuratejobs "Stripe" --remote              # Remote only
 *   deadlyaccuratejobs "Stripe" --location europe     # Location filter
 *   deadlyaccuratejobs "Stripe" --keyword engineer    # Keyword filter
 *   deadlyaccuratejobs "Stripe" --since 2d            # New jobs in last 2 days
 *   deadlyaccuratejobs resolve "Stripe"               # Just show which ATS(es)
 *   deadlyaccuratejobs stats                          # Platform stats
 */

import { getJobs, resolveCompany, getStats } from "../src/index.js";
import type { SearchOptions, UnifiedJob } from "../src/types.js";

const args = process.argv.slice(2);

function usage(): void {
  console.log(`
  deadlyaccuratejobs — one-stop shop for jobs across all ATS platforms

  Usage:
    deadlyaccuratejobs <company>           Search for all jobs at a company
    deadlyaccuratejobs resolve <company>   Show which ATS platform(s) a company uses
    deadlyaccuratejobs stats               Show platform slug counts

  Options:
    --remote                  Remote jobs only
    --location <pattern>      Filter by location (regex)
    --keyword <pattern>       Filter by keyword in title/description (regex)
    --department <pattern>    Filter by department (regex)
    --seniority <levels>      Filter by seniority (comma-separated: senior,staff,lead)
    --since <duration>        Only jobs since (e.g. 2d, 1w, 2025-03-10)
    --limit <n>               Max results
    --format <fmt>            Output format: table (default), json, csv
    --api-url <url>           Slug API URL (default: https://job-slugs.wd40.workers.dev)
  `);
}

function parseArgs() {
  const flags: Record<string, string | boolean> = {};
  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  return { flags, positional };
}

/** Extract display-friendly fields from the rich UnifiedJob */
function flattenForDisplay(job: UnifiedJob) {
  const loc = typeof job.location === "string" ? job.location : job.location?.text ?? "";
  const ats = typeof job.company === "string" ? "" : job.company?.ats ?? "";
  const workplace = job.workplaceType ?? "";
  const seniority = job.seniorityLevel ?? "";

  return {
    title: job.title,
    department: job.department || "-",
    location: loc || "-",
    workplace,
    seniority,
    ats,
    applyUrl: job.applyUrl,
  };
}

function formatTable(jobs: UnifiedJob[]): string {
  if (jobs.length === 0) return "  No jobs found.";

  const rows = jobs.map(flattenForDisplay);
  const cols = ["title", "location", "workplace", "seniority", "department", "ats"] as const;
  const widths: Record<string, number> = {};

  for (const col of cols) {
    widths[col] = col.length;
    for (const row of rows) {
      const val = String(row[col] ?? "").slice(0, 50);
      widths[col] = Math.max(widths[col]!, val.length);
    }
  }

  const header = cols.map((c) => c.padEnd(widths[c]!)).join("  ");
  const sep = cols.map((c) => "-".repeat(widths[c]!)).join("  ");
  const lines = rows.map((row) =>
    cols.map((c) => String(row[c] ?? "").slice(0, 50).padEnd(widths[c]!)).join("  "),
  );

  return [header, sep, ...lines].join("\n");
}

async function main() {
  const { flags, positional } = parseArgs();

  if (positional.length === 0) {
    usage();
    process.exit(1);
  }

  const command = positional[0]!;
  const apiUrl = flags["api-url"] as string | undefined;

  // --- stats command ---
  if (command === "stats") {
    console.log("\n  Fetching platform stats...\n");
    const stats = await getStats({ apiUrl });
    console.log("  Platform          Slugs");
    console.log("  ─────────────────────────");
    for (const p of stats.platforms) {
      console.log(`  ${p.source.padEnd(18)} ${p.slugCount.toLocaleString()}`);
    }
    console.log(`  ─────────────────────────`);
    console.log(`  Total             ${stats.totalSlugs.toLocaleString()}\n`);
    return;
  }

  // --- resolve command ---
  if (command === "resolve") {
    const company = positional.slice(1).join(" ");
    if (!company) {
      console.error("  Error: provide a company name. e.g. deadlyaccuratejobs resolve Stripe");
      process.exit(1);
    }
    console.log(`\n  Resolving "${company}"...\n`);
    const matches = await resolveCompany(company, { apiUrl });
    if (matches.length === 0) {
      console.log(`  No ATS match found for "${company}".`);
      console.log("  The company may not use a supported ATS, or their slug differs from their name.\n");
      return;
    }
    console.log(`  Found ${matches.length} match(es):\n`);
    for (const m of matches) {
      console.log(`  ${m.ats.padEnd(18)} slug: ${m.slug.padEnd(30)} (${m.confidence})`);
    }
    console.log();
    return;
  }

  // --- search (default) ---
  const company = positional.join(" ");
  const options: SearchOptions = {};

  if (flags.remote) options.remote = true;
  if (flags.location) options.location = String(flags.location);
  if (flags.keyword) options.keyword = String(flags.keyword);
  if (flags.department) options.department = String(flags.department);
  if (flags.seniority) options.seniority = String(flags.seniority).split(",");
  if (flags.since) options.since = String(flags.since);
  if (flags.limit) options.limit = parseInt(String(flags.limit));

  const format = (flags.format as string) ?? "table";

  console.log(`\n  deadlyaccuratejobs: searching for "${company}"...\n`);

  const result = await getJobs(company, { ...options, apiUrl });

  if (result.matches.length === 0) {
    console.log(`  No ATS match found for "${company}".`);
    console.log("  Try 'deadlyaccuratejobs resolve <name>' to debug.\n");
    return;
  }

  console.log(`  Resolved on: ${result.matches.map((m) => `${m.ats} (${m.slug})`).join(", ")}`);
  console.log(`  Total jobs: ${result.totalJobs} | After filters: ${result.jobs.length} | Time: ${(result.duration / 1000).toFixed(1)}s\n`);

  if (result.jobs.length === 0) {
    console.log("  No jobs match your filters.\n");
    return;
  }

  if (format === "json") {
    console.log(JSON.stringify(result.jobs, null, 2));
  } else if (format === "csv") {
    const header = "title,department,location,workplace,seniority,ats,applyUrl";
    const rows = result.jobs.map((j) => {
      const flat = flattenForDisplay(j);
      return `"${flat.title}","${flat.department}","${flat.location}","${flat.workplace}","${flat.seniority}","${flat.ats}","${flat.applyUrl}"`;
    });
    console.log([header, ...rows].join("\n"));
  } else {
    console.log(formatTable(result.jobs));
  }

  console.log();
}

main().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
