/**
 * hunt-lever.ts
 *
 * Full discovery + scrape of Lever job boards, filtered for roles
 * matching Doug Silkstone's profile (senior/lead full-stack, product eng,
 * growth eng, etc.) in Europe or Remote, posted in the last 30 days.
 *
 * Usage: npx tsx scripts/hunt-lever.ts
 */

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  discoverSlugs,
  scrapeAll,
  type CompanyJobs,
  type LeverJob,
} from "../packages/lever-jobs/src/index.js";

// ── Filters ──────────────────────────────────────────────────────────

const TITLE_RE =
  /founding|head.of.eng|lead.*eng|lead.*full|full.?stack|product.eng|growth.eng|staff.eng|principal|senior.*software|senior.*full|cto|vp.eng|eng.*lead|tech.lead|senior.*product/i;

const LOCATION_RE =
  /remote|europe|emea|anywhere|global|uk|london|england|ireland|dublin|france|paris|germany|berlin|netherlands|amsterdam|spain|barcelona|portugal|lisbon|prague|czech|sweden|stockholm|denmark|copenhagen|austria|vienna|poland|warsaw|italy|milan|switzerland|zurich|finland|helsinki|norway|oslo|belgium|brussels/i;

// 30 days ago from today (2026-03-07): 2026-02-05
const CUTOFF_MS = 1770249600000;

// ── CSV helpers ──────────────────────────────────────────────────────

function csvQuote(s: string): string {
  if (!s) return '""';
  return `"${s.replace(/"/g, '""')}"`;
}

interface MatchedRow {
  company: string;
  slug: string;
  title: string;
  department: string;
  team: string;
  location: string;
  workplaceType: string;
  commitment: string;
  createdAt: number;
  hostedUrl: string;
  applyUrl: string;
}

function rowToCSV(r: MatchedRow): string {
  return [
    csvQuote(r.company),
    csvQuote(r.slug),
    csvQuote(r.title),
    csvQuote(r.department),
    csvQuote(r.team),
    csvQuote(r.location),
    r.workplaceType,
    r.commitment,
    new Date(r.createdAt).toISOString().split("T")[0] ?? "",
    r.hostedUrl,
    r.applyUrl,
  ].join(",");
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Lever Jobs Hunt ===\n");

  // 1. Discover slugs
  console.log("Step 1: Discovering company slugs...");
  const slugs = await discoverSlugs({
    onProgress: (msg) => console.log(`  ${msg}`),
  });
  console.log(`\nDiscovered ${slugs.length} companies.\n`);

  // 2. Scrape all
  console.log("Step 2: Scraping all job boards (concurrency 10)...");
  const results: CompanyJobs[] = await scrapeAll(slugs, {
    concurrency: 10,
    onProgress: (done, total, found) => {
      console.log(
        `  Progress: ${done}/${total} scraped, ${found} with active jobs`
      );
    },
  });

  const totalJobs = results.reduce((sum, c) => sum + c.jobCount, 0);
  console.log(
    `\nScraped ${results.length} active boards, ${totalJobs} total jobs.\n`
  );

  // 3. Filter
  console.log("Step 3: Filtering for matching roles...");
  const matched: MatchedRow[] = [];

  for (const company of results) {
    for (const job of company.jobs) {
      // Must be posted in last 30 days
      if (job.createdAt < CUTOFF_MS) continue;

      // Must match title
      if (!TITLE_RE.test(job.title)) continue;

      // Must match location OR be remote
      const locationMatch = LOCATION_RE.test(job.location);
      const remoteType = job.workplaceType
        .toLowerCase()
        .includes("remote");

      if (!locationMatch && !remoteType) continue;

      matched.push({
        company: company.company,
        slug: company.slug,
        title: job.title,
        department: job.department,
        team: job.team,
        location: job.location,
        workplaceType: job.workplaceType,
        commitment: job.commitment,
        createdAt: job.createdAt,
        hostedUrl: job.hostedUrl,
        applyUrl: job.applyUrl,
      });
    }
  }

  console.log(`Found ${matched.length} matching jobs.\n`);

  // 4. Write CSV
  const headers =
    "company,slug,title,department,team,location,workplaceType,commitment,createdAt,hostedUrl,applyUrl";
  const csvRows = [headers, ...matched.map(rowToCSV)];
  const csv = csvRows.join("\n");

  const outPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "results",
    "lever-jobs.csv"
  );
  writeFileSync(outPath, csv, "utf-8");

  // 5. Summary
  console.log("=== Summary ===");
  console.log(`  Companies discovered: ${slugs.length}`);
  console.log(`  Companies with active jobs: ${results.length}`);
  console.log(`  Total jobs scraped: ${totalJobs}`);
  console.log(`  Matching jobs: ${matched.length}`);
  console.log(`  Output: ${outPath}`);

  if (matched.length > 0) {
    console.log("\n=== Top Matches ===");
    for (const m of matched.slice(0, 20)) {
      console.log(
        `  ${m.company} — ${m.title} (${m.location}, ${m.workplaceType})`
      );
    }
    if (matched.length > 20) {
      console.log(`  ... and ${matched.length - 20} more`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
