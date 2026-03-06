#!/usr/bin/env npx tsx

/**
 * Ashby Job Board Scraper
 *
 * Discovers all companies using Ashby via Common Crawl index,
 * then hits their public posting API to get all jobs.
 *
 * Usage:
 *   npx tsx scripts/ashby-scraper.ts                    # Full run: discover + scrape
 *   npx tsx scripts/ashby-scraper.ts --slugs-only       # Just discover slugs
 *   npx tsx scripts/ashby-scraper.ts --from-file slugs.txt  # Scrape from existing slug list
 *   npx tsx scripts/ashby-scraper.ts --filter "europe|remote"  # Filter jobs by location regex
 */

import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const ASHBY_API = "https://api.ashbyhq.com/posting-api/job-board";
const CC_INDEX = "https://index.commoncrawl.org";
const CC_CRAWLS = ["CC-MAIN-2025-08", "CC-MAIN-2024-51", "CC-MAIN-2024-42"];
const CONCURRENCY = 10;
const OUTPUT_DIR = join(import.meta.dirname ?? ".", "..", "data", "ashby");
// Resolves to: <project-root>/data/ashby/

interface AshbyJob {
  id: string;
  title: string;
  department: string;
  team: string;
  employmentType: string;
  location: string;
  secondaryLocations: { location: string }[];
  isRemote: boolean;
  workplaceType: string;
  publishedAt: string;
  isListed: boolean;
  jobUrl: string;
  applyUrl: string;
  descriptionPlain?: string;
  descriptionHtml?: string;
  compensationTierSummary?: string;
  address?: {
    postalAddress?: {
      addressLocality?: string;
      addressRegion?: string;
      addressCountry?: string;
    };
  };
}

interface CompanyJobs {
  company: string;
  slug: string;
  jobCount: number;
  jobs: AshbyJob[];
  scrapedAt: string;
}

// --- Slug Discovery via Common Crawl ---

async function discoverSlugsFromCrawl(crawlId: string): Promise<Set<string>> {
  const slugs = new Set<string>();
  const url = `${CC_INDEX}/${crawlId}-index?url=jobs.ashbyhq.com/*&output=text&fl=url&limit=100000`;

  console.log(`  Querying ${crawlId}...`);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`  ${crawlId}: HTTP ${res.status}`);
      return slugs;
    }
    const text = await res.text();
    for (const line of text.split("\n")) {
      const match = line.match(
        /https:\/\/jobs\.ashbyhq\.com\/([^/?#]+)/
      );
      if (match) {
        slugs.add(decodeURIComponent(match[1]));
      }
    }
    console.log(`  ${crawlId}: found ${slugs.size} slugs`);
  } catch (e) {
    console.log(`  ${crawlId}: error - ${e}`);
  }
  return slugs;
}

async function discoverAllSlugs(): Promise<string[]> {
  console.log("Discovering company slugs from Common Crawl...");
  const allSlugs = new Set<string>();

  for (const crawl of CC_CRAWLS) {
    const slugs = await discoverSlugsFromCrawl(crawl);
    for (const s of slugs) allSlugs.add(s);
  }

  // Add known slugs from the registry that CC might miss
  const knownSlugs = [
    "openai", "Notion", "ramp", "deel", "linear", "cursor", "snowflake",
    "vanta", "posthog", "replit", "supabase", "zapier", "harvey", "stytch",
    "1password", "deliveroo", "trainline", "cohere", "anthropic", "vercel",
    "mercury", "reddit", "retool", "airtable", "brex", "superhuman",
  ];
  for (const s of knownSlugs) allSlugs.add(s);

  const sorted = [...allSlugs].sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
  console.log(`Total unique slugs: ${sorted.length}`);
  return sorted;
}

// --- Job Scraping ---

async function scrapeCompany(slug: string): Promise<CompanyJobs | null> {
  const url = `${ASHBY_API}/${encodeURIComponent(slug)}?includeCompensation=true`;
  try {
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) {
      console.error(`  ${slug}: HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    const jobs: AshbyJob[] = (data.jobs ?? []).filter(
      (j: AshbyJob) => j.isListed
    );

    if (jobs.length === 0) return null;

    return {
      company: slug,
      slug,
      jobCount: jobs.length,
      jobs: jobs.map((j: AshbyJob) => ({
        id: j.id,
        title: j.title,
        department: j.department,
        team: j.team,
        employmentType: j.employmentType,
        location: j.location,
        secondaryLocations: j.secondaryLocations,
        isRemote: j.isRemote,
        workplaceType: j.workplaceType,
        publishedAt: j.publishedAt,
        isListed: j.isListed,
        jobUrl: j.jobUrl,
        applyUrl: j.applyUrl,
        compensationTierSummary: j.compensationTierSummary,
        address: j.address,
        // Skip HTML descriptions to keep output manageable
        descriptionPlain: j.descriptionPlain?.slice(0, 500),
      })),
      scrapedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.error(`  ${slug}: ${e}`);
    return null;
  }
}

async function scrapeAll(
  slugs: string[],
  filter?: RegExp
): Promise<CompanyJobs[]> {
  console.log(`\nScraping ${slugs.length} companies (concurrency: ${CONCURRENCY})...`);
  const results: CompanyJobs[] = [];
  let done = 0;
  let active = 0;
  let found = 0;

  const queue = [...slugs];

  async function worker() {
    while (queue.length > 0) {
      const slug = queue.shift()!;
      active++;
      const result = await scrapeCompany(slug);
      active--;
      done++;

      if (result) {
        if (filter) {
          result.jobs = result.jobs.filter(
            (j) =>
              filter.test(j.location) ||
              j.secondaryLocations?.some((l) => filter.test(l.location))
          );
          result.jobCount = result.jobs.length;
          if (result.jobs.length === 0) continue;
        }
        results.push(result);
        found++;
      }

      if (done % 50 === 0 || done === slugs.length) {
        console.log(
          `  Progress: ${done}/${slugs.length} checked, ${found} companies with jobs`
        );
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  return results.sort((a, b) => b.jobCount - a.jobCount);
}

// --- Output ---

function saveResults(results: CompanyJobs[], outputDir: string) {
  const { mkdirSync } = require("fs");
  mkdirSync(outputDir, { recursive: true });

  // Summary
  const totalJobs = results.reduce((sum, r) => sum + r.jobCount, 0);
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
  console.log(`\nSummary: ${results.length} companies, ${totalJobs} jobs`);
  console.log(`Saved to ${outputDir}/summary.json`);

  // Full data
  writeFileSync(
    join(outputDir, "all-jobs.json"),
    JSON.stringify(results, null, 2)
  );
  console.log(`Full data: ${outputDir}/all-jobs.json`);

  // CSV for quick browsing
  const csvRows = ["company,title,department,location,remote,type,publishedAt,jobUrl,compensation"];
  for (const company of results) {
    for (const job of company.jobs) {
      csvRows.push(
        [
          quote(company.company),
          quote(job.title),
          quote(job.department),
          quote(job.location),
          job.isRemote,
          job.employmentType,
          job.publishedAt?.split("T")[0] ?? "",
          job.jobUrl,
          quote(job.compensationTierSummary ?? ""),
        ].join(",")
      );
    }
  }
  writeFileSync(join(outputDir, "all-jobs.csv"), csvRows.join("\n"));
  console.log(`CSV: ${outputDir}/all-jobs.csv`);
}

function quote(s: string) {
  return `"${(s ?? "").replace(/"/g, '""')}"`;
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2);
  const slugsOnly = args.includes("--slugs-only");
  const fromFileIdx = args.indexOf("--from-file");
  const filterIdx = args.indexOf("--filter");
  const filter = filterIdx >= 0 ? new RegExp(args[filterIdx + 1], "i") : undefined;

  let slugs: string[];

  if (fromFileIdx >= 0) {
    const file = args[fromFileIdx + 1];
    slugs = readFileSync(file, "utf-8")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    console.log(`Loaded ${slugs.length} slugs from ${file}`);
  } else {
    slugs = await discoverAllSlugs();

    // Save discovered slugs
    const { mkdirSync } = require("fs");
    mkdirSync(OUTPUT_DIR, { recursive: true });
    writeFileSync(join(OUTPUT_DIR, "slugs.txt"), slugs.join("\n"));
    console.log(`Saved slug list to ${OUTPUT_DIR}/slugs.txt`);
  }

  if (slugsOnly) {
    console.log("\n--slugs-only: stopping after discovery.");
    return;
  }

  if (filter) {
    console.log(`Filtering jobs matching: ${filter}`);
  }

  const results = await scrapeAll(slugs, filter);
  saveResults(results, OUTPUT_DIR);

  // Top 20 by job count
  console.log("\nTop 20 companies by job count:");
  for (const r of results.slice(0, 20)) {
    console.log(`  ${r.company}: ${r.jobCount} jobs`);
  }
}

main().catch(console.error);
