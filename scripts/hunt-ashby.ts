/**
 * hunt-ashby.ts
 *
 * Full discovery + scrape of Ashby job boards, filtered for roles
 * matching Doug Silkstone's profile (senior/lead full-stack, product eng,
 * growth eng, etc.) in Europe or Remote, posted in the last 30 days.
 *
 * Usage: npx tsx scripts/hunt-ashby.ts
 */

import {
  discoverSlugs,
  scrapeAll,
  filterResults,
  flattenJobs,
} from "../packages/ashby-jobs/src/index.js";
import type { CompanyJobs, FlatJob } from "../packages/ashby-jobs/src/types.js";
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RESULTS_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "results"
);

// --- Filter criteria ---

const TITLE_RE =
  /founding|head.of.eng|lead.*eng|lead.*full|full.?stack|product.eng|growth.eng|staff.eng|principal|senior.*software|senior.*full|cto|vp.eng|eng.*lead|tech.lead|senior.*product/i;

const LOCATION_RE =
  /remote|europe|emea|anywhere|global|uk|london|england|ireland|dublin|france|paris|germany|berlin|netherlands|amsterdam|spain|barcelona|portugal|lisbon|prague|czech|sweden|stockholm|denmark|copenhagen|austria|vienna|poland|warsaw|italy|milan|switzerland|zurich|finland|helsinki|norway|oslo|belgium|brussels/i;

// 30 days ago from today
const CUTOFF = new Date();
CUTOFF.setDate(CUTOFF.getDate() - 30);

// --- CSV helper ---

function csvQuote(s: string): string {
  if (!s) return '""';
  return `"${s.replace(/"/g, '""')}"`;
}

function jobsToCSV(jobs: FlatJob[]): string {
  const headers = [
    "company",
    "slug",
    "title",
    "department",
    "location",
    "isRemote",
    "publishedAt",
    "jobUrl",
    "applyUrl",
  ];

  const rows: string[] = [headers.join(",")];

  for (const job of jobs) {
    rows.push(
      [
        csvQuote(job.company),
        csvQuote(job.slug),
        csvQuote(job.title),
        csvQuote(job.department),
        csvQuote(job.location),
        String(job.isRemote),
        job.publishedAt?.split("T")[0] ?? "",
        job.jobUrl,
        job.applyUrl,
      ].join(",")
    );
  }

  return rows.join("\n");
}

// --- Main ---

async function main() {
  console.log("=== Ashby Job Hunt ===\n");

  // 1. Discover slugs
  console.log("Step 1: Discovering company slugs...");
  const slugs = await discoverSlugs({
    onProgress: (msg) => console.log(`  ${msg}`),
  });
  console.log(`\nDiscovered ${slugs.length} company slugs.\n`);

  // 2. Scrape all
  console.log("Step 2: Scraping all job boards (concurrency 10)...");
  const allResults = await scrapeAll(slugs, {
    concurrency: 10,
    onProgress: (done, total, found) => {
      console.log(
        `  Progress: ${done}/${total} scraped, ${found} with jobs`
      );
    },
  });

  const totalJobs = allResults.reduce((s, r) => s + r.jobCount, 0);
  console.log(
    `\nScraped ${allResults.length} companies with ${totalJobs} total jobs.\n`
  );

  // 3. Filter: title match
  console.log("Step 3: Filtering for matching roles...");

  const titleFiltered = filterResults(allResults, {
    keyword: TITLE_RE,
  });

  // 4. Filter: location/remote match
  // We do this manually since we need OR logic (location match OR isRemote)
  const matched: CompanyJobs[] = [];

  for (const company of titleFiltered) {
    const matchingJobs = company.jobs.filter((job) => {
      // Check location
      const locationMatch =
        LOCATION_RE.test(job.location) ||
        job.secondaryLocations?.some((l) => LOCATION_RE.test(l.location)) ||
        (job.address?.postalAddress?.addressCountry &&
          LOCATION_RE.test(job.address.postalAddress.addressCountry)) ||
        (job.address?.postalAddress?.addressRegion &&
          LOCATION_RE.test(job.address.postalAddress.addressRegion)) ||
        (job.address?.postalAddress?.addressLocality &&
          LOCATION_RE.test(job.address.postalAddress.addressLocality));

      // Check remote
      const remoteMatch = job.isRemote === true;

      // Must be location OR remote
      if (!locationMatch && !remoteMatch) return false;

      // Check recency
      if (job.publishedAt) {
        const posted = new Date(job.publishedAt);
        if (posted < CUTOFF) return false;
      }

      return true;
    });

    if (matchingJobs.length > 0) {
      matched.push({
        ...company,
        jobs: matchingJobs,
        jobCount: matchingJobs.length,
      });
    }
  }

  // 5. Flatten and save
  const flat = flattenJobs(matched);
  const csvPath = resolve(RESULTS_DIR, "ashby-jobs.csv");
  writeFileSync(csvPath, jobsToCSV(flat), "utf-8");

  // 6. Summary
  const matchingJobCount = flat.length;
  const matchingCompanies = matched.length;

  console.log("\n=== Summary ===");
  console.log(`Total companies discovered: ${slugs.length}`);
  console.log(
    `Total jobs found: ${totalJobs} (across ${allResults.length} companies)`
  );
  console.log(
    `Matching jobs after filter: ${matchingJobCount} (across ${matchingCompanies} companies)`
  );
  console.log(`\nResults saved to: ${csvPath}`);

  // Print top matches
  if (flat.length > 0) {
    console.log("\n--- Top 20 Matches ---");
    for (const job of flat.slice(0, 20)) {
      console.log(
        `  ${job.company} | ${job.title} | ${job.location} | Remote: ${job.isRemote} | ${job.publishedAt?.split("T")[0] ?? "?"}`
      );
    }
    if (flat.length > 20) {
      console.log(`  ... and ${flat.length - 20} more`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
