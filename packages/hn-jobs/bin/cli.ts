#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { scrapeJobs, toJSON, toCSV, toTable } from "../src/index.js";
import type { HNJob } from "../src/types.js";

const VERSION = "1.0.0";
const NAME = "hn-jobs";

// --- Arg parsing ---

interface ParsedArgs {
  command: string;
  positional: string[];
  flags: Record<string, string | boolean>;
}

function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2);
  const command = args[0] && !args[0].startsWith("-") ? args[0] : "";
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};

  let i = command ? 1 : 0;
  while (i < args.length) {
    const arg = args[i]!;

    if (arg === "--") {
      positional.push(...args.slice(i + 1));
      break;
    }

    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("-")) {
        flags[key] = next;
        i += 2;
      } else {
        flags[key] = true;
        i++;
      }
    } else if (arg.startsWith("-") && arg.length === 2) {
      const short = arg[1]!;
      const longMap: Record<string, string> = {
        o: "output",
        c: "concurrency",
        q: "quiet",
        h: "help",
        v: "version",
      };
      const key = longMap[short] ?? short;
      const next = args[i + 1];
      if (next && !next.startsWith("-")) {
        flags[key] = next;
        i += 2;
      } else {
        flags[key] = true;
        i++;
      }
    } else {
      positional.push(arg);
      i++;
    }
  }

  return { command, positional, flags };
}

function flag(
  flags: Record<string, string | boolean>,
  key: string
): string | undefined {
  const val = flags[key];
  return typeof val === "string" ? val : undefined;
}

function hasFlag(flags: Record<string, string | boolean>, key: string): boolean {
  return key in flags;
}

// --- Inline filter logic ---
// The filters module (../src/filters.js) may be created by another agent.
// Until then, these inline functions provide the same interface.

interface HNJobFilter {
  remote?: boolean;
  location?: RegExp;
  keyword?: RegExp;
  technology?: RegExp;
}

function filterJobs(jobs: HNJob[], filter: HNJobFilter): HNJob[] {
  return jobs.filter((job) => {
    if (filter.remote && !job.isRemote) return false;
    if (filter.location && !filter.location.test(job.location)) return false;
    if (
      filter.keyword &&
      !filter.keyword.test(job.title) &&
      !filter.keyword.test(job.description)
    )
      return false;
    if (
      filter.technology &&
      !job.technologies.some((t) => filter.technology!.test(t)) &&
      !filter.technology.test(job.description)
    )
      return false;
    return true;
  });
}

function searchJobs(
  jobs: HNJob[],
  text?: string,
  filter?: HNJobFilter,
  limit?: number
): HNJob[] {
  let results = jobs;

  if (text) {
    const lower = text.toLowerCase();
    results = results.filter(
      (j) =>
        j.company.toLowerCase().includes(lower) ||
        j.title.toLowerCase().includes(lower) ||
        j.description.toLowerCase().includes(lower) ||
        j.technologies.some((t) => t.toLowerCase().includes(lower))
    );
  }

  if (filter) {
    results = filterJobs(results, filter);
  }

  if (limit && limit > 0) {
    results = results.slice(0, limit);
  }

  return results;
}

// --- Banner ---

function banner() {
  console.log(`\n  ${NAME} v${VERSION}`);
  console.log(`  HN "Who is Hiring?" scraper\n`);
}

// --- Help ---

function printHelp() {
  banner();
  console.log(`USAGE:
  ${NAME} <command> [options]

COMMANDS:
  scrape                Scrape HN "Who is Hiring?" threads (default)
  search <query>        Search previously scraped job data

SCRAPE OPTIONS:
  --months <n>          Number of monthly threads to scrape (default: 2)

FILTER OPTIONS:
  --remote              Only remote jobs
  --location <regex>    Filter by location pattern
  --keyword <regex>     Filter by title/description keyword
  --technology <regex>  Filter by technology

OUTPUT OPTIONS:
  --output, -o <dir>    Output directory (default: ./hn-data)
  --format <fmt>        Output format: json, csv, table (default: json)
  --limit <n>           Limit number of results

GENERAL:
  --concurrency, -c <n> Concurrent requests (default: 10)
  --quiet, -q           Suppress progress output
  --help, -h            Show this help
  --version, -v         Show version

EXAMPLES:
  ${NAME} scrape
  ${NAME} scrape --months 3 --remote --format table
  ${NAME} scrape --location "europe|berlin|london" --keyword "senior|lead"
  ${NAME} search "founding engineer" --remote
`);
}

// --- Build filter from flags ---

function buildFilter(flags: Record<string, string | boolean>): HNJobFilter | null {
  const remote = hasFlag(flags, "remote");
  const locationStr = flag(flags, "location");
  const keywordStr = flag(flags, "keyword");
  const technologyStr = flag(flags, "technology");

  if (!remote && !locationStr && !keywordStr && !technologyStr) return null;

  const filter: HNJobFilter = {};
  if (remote) filter.remote = true;
  if (locationStr) filter.location = new RegExp(locationStr, "i");
  if (keywordStr) filter.keyword = new RegExp(keywordStr, "i");
  if (technologyStr) filter.technology = new RegExp(technologyStr, "i");

  return filter;
}

// --- Output ---

function outputResults(
  jobs: HNJob[],
  format: string,
  outputDir: string,
  quiet: boolean
): void {
  if (format === "table") {
    console.log(toTable(jobs));
    return;
  }

  mkdirSync(outputDir, { recursive: true });

  if (format === "csv") {
    const outPath = join(outputDir, "hn-jobs.csv");
    writeFileSync(outPath, toCSV(jobs));
    if (!quiet) {
      console.log(`  ${jobs.length} jobs found`);
      console.log(`  CSV saved to ${outPath}`);
    }
  } else {
    // JSON (default)
    const outPath = join(outputDir, "hn-jobs.json");
    writeFileSync(outPath, toJSON(jobs));

    // Also write summary
    const companies = new Map<string, number>();
    for (const job of jobs) {
      companies.set(job.company, (companies.get(job.company) ?? 0) + 1);
    }

    const summary = {
      scrapedAt: new Date().toISOString(),
      totalJobs: jobs.length,
      uniqueCompanies: companies.size,
      remoteJobs: jobs.filter((j) => j.isRemote).length,
      topCompanies: [...companies.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([name, count]) => ({ company: name, jobs: count })),
    };
    writeFileSync(
      join(outputDir, "summary.json"),
      JSON.stringify(summary, null, 2)
    );

    if (!quiet) {
      console.log(`  ${jobs.length} jobs found`);
      console.log(`  JSON saved to ${outPath}`);
      console.log(`  Summary saved to ${join(outputDir, "summary.json")}`);
    }
  }
}

// --- Commands ---

async function runScrape(parsed: ParsedArgs): Promise<void> {
  const quiet = hasFlag(parsed.flags, "quiet");
  const outputDir = resolve(flag(parsed.flags, "output") ?? "./hn-data");
  const format = flag(parsed.flags, "format") ?? "json";
  const months = parseInt(flag(parsed.flags, "months") ?? "2", 10);
  const concurrency = parseInt(flag(parsed.flags, "concurrency") ?? "10", 10);

  if (!quiet) {
    banner();
    console.log(`  Scraping ${months} month(s) of "Who is Hiring?" threads...\n`);
  }

  const jobs = await scrapeJobs({
    months,
    concurrency,
    onProgress: quiet
      ? undefined
      : (done, total) => {
          if (done % 50 === 0 || done === total) {
            process.stdout.write(`\r  Progress: ${done}/${total} comments parsed`);
          }
          if (done === total) process.stdout.write("\n");
        },
  });

  if (!quiet) console.log("");

  // Apply filters
  const filter = buildFilter(parsed.flags);
  const limitStr = flag(parsed.flags, "limit");
  const limit = limitStr ? parseInt(limitStr, 10) : undefined;

  const results = searchJobs(jobs, undefined, filter ?? undefined, limit);

  if (!quiet && filter) {
    console.log(`  Filtered: ${jobs.length} -> ${results.length} jobs\n`);
  }

  outputResults(results, format, outputDir, quiet);
}

async function runSearch(parsed: ParsedArgs): Promise<void> {
  const quiet = hasFlag(parsed.flags, "quiet");
  const outputDir = resolve(flag(parsed.flags, "output") ?? "./hn-data");
  const format = flag(parsed.flags, "format") ?? "table";
  const query = parsed.positional.join(" ");

  if (!quiet) banner();

  // Load previously scraped data
  const dataPath = join(outputDir, "hn-jobs.json");
  if (!existsSync(dataPath)) {
    console.error(`  No scraped data found at ${dataPath}`);
    console.error(`  Run '${NAME} scrape' first to collect job data.`);
    process.exit(1);
  }

  const raw = readFileSync(dataPath, "utf-8");
  const jobs: HNJob[] = JSON.parse(raw) as HNJob[];

  if (!quiet) {
    console.log(`  Loaded ${jobs.length} jobs from ${dataPath}`);
    if (query) console.log(`  Searching for: "${query}"`);
    console.log("");
  }

  // Build filters
  const filter = buildFilter(parsed.flags);
  const limitStr = flag(parsed.flags, "limit");
  const limit = limitStr ? parseInt(limitStr, 10) : undefined;

  const results = searchJobs(jobs, query || undefined, filter ?? undefined, limit);

  outputResults(results, format, outputDir, quiet);
}

// --- Entry point ---

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv);

  if (hasFlag(parsed.flags, "version")) {
    console.log(VERSION);
    return;
  }

  if (hasFlag(parsed.flags, "help")) {
    printHelp();
    return;
  }

  // Default to scrape if no command given
  const command = parsed.command || "scrape";

  switch (command) {
    case "scrape":
      await runScrape(parsed);
      break;
    case "search":
      await runSearch(parsed);
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.error(`Run '${NAME} --help' for usage.`);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
