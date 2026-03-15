#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  discoverSlugs,
  scrapeAll,
  scrapeCompany,
  searchJobs,
  toJSON,
  toCSV,
  toTable,
} from "../src/index.js";
import type { JobFilter, CompanyJobs } from "../src/types.js";

const VERSION = "1.0.0";
const NAME = "workable-jobs";

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

    if (arg === "--" ) {
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

function flag(flags: Record<string, string | boolean>, key: string): string | undefined {
  const val = flags[key];
  return typeof val === "string" ? val : undefined;
}

function hasFlag(flags: Record<string, string | boolean>, key: string): boolean {
  return key in flags;
}

// --- Banner ---

function banner() {
  console.log(`\n  ${NAME} v${VERSION}`);
  console.log(`  Workable job board scraper\n`);
}

// --- Help ---

function printHelp() {
  banner();
  console.log(`USAGE:
  ${NAME} <command> [options]

COMMANDS:
  discover              Discover company slugs from slug API
  scrape                Full run: discover slugs + scrape all companies
  search <query>        Search previously scraped job data

SCRAPE OPTIONS:
  --slugs <file>        Scrape from a slug file (one per line)
  --company <slug>      Scrape a single company

FILTER OPTIONS:
  --remote              Only remote jobs
  --location <regex>    Filter by location pattern
  --department <regex>  Filter by department pattern
  --keyword <regex>     Filter by title/description keyword

OUTPUT OPTIONS:
  --output, -o <dir>    Output directory (default: ./workable-data)
  --format <fmt>        Output format: json, csv, table (default: json)
  --descriptions        Include full job descriptions
  --limit <n>           Limit number of results

GENERAL:
  --concurrency, -c <n> Concurrent requests (default: 10)
  --quiet, -q           Suppress progress output
  --help, -h            Show this help
  --version, -v         Show version

EXAMPLES:
  ${NAME} discover
  ${NAME} scrape --company 1000heads --format table
  ${NAME} scrape --slugs slugs.txt --remote --location "europe"
  ${NAME} search "senior engineer" --remote --format table
`);
}

// --- Main logic ---

async function runDiscover(parsed: ParsedArgs): Promise<void> {
  const quiet = hasFlag(parsed.flags, "quiet");
  const outputDir = resolve(flag(parsed.flags, "output") ?? "./workable-data");

  if (!quiet) banner();

  const slugs = await discoverSlugs({
    onProgress: quiet ? undefined : (msg) => console.log(`  ${msg}`),
  });

  mkdirSync(outputDir, { recursive: true });
  const outPath = join(outputDir, "slugs.txt");
  writeFileSync(outPath, slugs.join("\n"));

  if (!quiet) {
    console.log(`\nDiscovered ${slugs.length} company slugs`);
    console.log(`Saved to ${outPath}`);
  }
}

async function runScrape(parsed: ParsedArgs): Promise<void> {
  const quiet = hasFlag(parsed.flags, "quiet");
  const outputDir = resolve(flag(parsed.flags, "output") ?? "./workable-data");
  const format = flag(parsed.flags, "format") ?? "json";
  const concurrency = parseInt(flag(parsed.flags, "concurrency") ?? "10", 10);
  const singleCompany = flag(parsed.flags, "company");
  const slugFile = flag(parsed.flags, "slugs");

  if (!quiet) banner();

  // Build filters
  const filter = buildFilter(parsed.flags);

  let results: CompanyJobs[];

  if (singleCompany) {
    // Single company mode
    if (!quiet) console.log(`Scraping ${singleCompany}...`);
    const result = await scrapeCompany(singleCompany);
    results = result ? [result] : [];
  } else {
    // Multi-company mode
    let slugs: string[];

    if (slugFile) {
      const content = readFileSync(resolve(slugFile), "utf-8");
      slugs = content.split("\n").map((s) => s.trim()).filter(Boolean);
      if (!quiet) console.log(`Loaded ${slugs.length} slugs from ${slugFile}`);
    } else {
      slugs = await discoverSlugs({
        onProgress: quiet ? undefined : (msg) => console.log(`  ${msg}`),
      });

      mkdirSync(outputDir, { recursive: true });
      writeFileSync(join(outputDir, "slugs.txt"), slugs.join("\n"));
    }

    if (!quiet) {
      console.log(`\nScraping ${slugs.length} companies (concurrency: ${concurrency})...`);
    }

    results = await scrapeAll(slugs, {
      concurrency,
      includeDescriptions,
      onProgress: quiet
        ? undefined
        : (done, total, found) => {
            console.log(`  Progress: ${done}/${total} checked, ${found} with jobs`);
          },
    });
  }

  // Apply filters
  if (filter) {
    results = searchJobs(results, { filters: filter });
  }

  // Apply limit
  const limitStr = flag(parsed.flags, "limit");
  if (limitStr) {
    const limit = parseInt(limitStr, 10);
    results = searchJobs(results, { limit });
  }

  // Output
  outputResults(results, format, outputDir, quiet);
}

async function runSearch(parsed: ParsedArgs): Promise<void> {
  const quiet = hasFlag(parsed.flags, "quiet");
  const outputDir = resolve(flag(parsed.flags, "output") ?? "./workable-data");
  const format = flag(parsed.flags, "format") ?? "table";
  const query = parsed.positional.join(" ");

  if (!quiet) banner();

  // Load previously scraped data
  const dataPath = join(outputDir, "all-jobs.json");
  if (!existsSync(dataPath)) {
    console.error(`No scraped data found at ${dataPath}`);
    console.error(`Run '${NAME} scrape' first to collect job data.`);
    process.exit(1);
  }

  const raw = readFileSync(dataPath, "utf-8");
  let results: CompanyJobs[] = JSON.parse(raw) as CompanyJobs[];

  // Build filters
  const filter = buildFilter(parsed.flags);
  const limitStr = flag(parsed.flags, "limit");
  const limit = limitStr ? parseInt(limitStr, 10) : undefined;

  results = searchJobs(results, {
    text: query || undefined,
    filters: filter ?? undefined,
    limit,
  });

  outputResults(results, format, outputDir, quiet);
}

function buildFilter(flags: Record<string, string | boolean>): JobFilter | null {
  const remote = hasFlag(flags, "remote");
  const locationStr = flag(flags, "location");
  const departmentStr = flag(flags, "department");
  const keywordStr = flag(flags, "keyword");

  if (!remote && !locationStr && !departmentStr && !keywordStr) return null;

  const filter: JobFilter = {};
  if (remote) filter.remote = true;
  if (locationStr) filter.location = new RegExp(locationStr, "i");
  if (departmentStr) filter.department = new RegExp(departmentStr, "i");
  if (keywordStr) filter.keyword = new RegExp(keywordStr, "i");

  return filter;
}

function outputResults(
  results: CompanyJobs[],
  format: string,
  outputDir: string,
  quiet: boolean
): void {
  const totalJobs = results.reduce((s, r) => s + r.jobCount, 0);

  if (format === "table") {
    console.log(toTable(results));
    return;
  }

  mkdirSync(outputDir, { recursive: true });

  if (format === "csv") {
    const outPath = join(outputDir, "all-jobs.csv");
    writeFileSync(outPath, toCSV(results));
    if (!quiet) console.log(`\n${totalJobs} jobs across ${results.length} companies`);
    if (!quiet) console.log(`CSV saved to ${outPath}`);
  } else {
    // JSON (default)
    const outPath = join(outputDir, "all-jobs.json");
    writeFileSync(outPath, toJSON(results));

    // Also write summary
    const summary = {
      scrapedAt: new Date().toISOString(),
      totalCompanies: results.length,
      totalJobs,
      companies: results.map((r) => ({
        company: r.company,
        slug: r.slug,
        jobCount: r.jobCount,
      })),
    };
    writeFileSync(
      join(outputDir, "summary.json"),
      JSON.stringify(summary, null, 2)
    );

    if (!quiet) {
      console.log(`\n${totalJobs} jobs across ${results.length} companies`);
      console.log(`JSON saved to ${outPath}`);
      console.log(`Summary saved to ${join(outputDir, "summary.json")}`);
    }
  }
}

// --- Entry point ---

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv);

  if (hasFlag(parsed.flags, "version")) {
    console.log(VERSION);
    return;
  }

  if (hasFlag(parsed.flags, "help") || !parsed.command) {
    printHelp();
    return;
  }

  switch (parsed.command) {
    case "discover":
      await runDiscover(parsed);
      break;
    case "scrape":
      await runScrape(parsed);
      break;
    case "search":
      await runSearch(parsed);
      break;
    default:
      console.error(`Unknown command: ${parsed.command}`);
      console.error(`Run '${NAME} --help' for usage.`);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
