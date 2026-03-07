/**
 * SmartRecruiters Job Hunt Script
 *
 * Discovers all companies using SmartRecruiters, scrapes their job boards,
 * and filters for roles matching Doug Silkstone's profile.
 */

import { discoverSlugs, scrapeAll, flattenJobs } from "../packages/smartrecruiters-jobs/src/index.js";
import type { CompanyJobs, FlatJob } from "../packages/smartrecruiters-jobs/src/types.js";
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, "results/smartrecruiters-jobs.csv");

// --- Filters ---

const TITLE_RE =
  /founding|head.of.eng|lead.*eng|lead.*full|full.?stack|product.eng|growth.eng|staff.eng|principal|senior.*software|senior.*full|\bcto\b|vp.eng|eng.*lead|tech.lead|senior.*product/i;

const LOCATION_RE =
  /remote|europe|emea|anywhere|global|uk|united kingdom|ireland|france|germany|netherlands|spain|portugal|czech|sweden|denmark|austria|poland|italy|switzerland|finland|norway|belgium/i;

const CUTOFF_DATE = new Date("2026-02-05");

function matchesTitle(name: string): boolean {
  return TITLE_RE.test(name);
}

function matchesLocation(job: {
  location: { city: string; region: string; country: string; remote: boolean };
}): boolean {
  if (job.location.remote) return true;
  const loc = `${job.location.city} ${job.location.region} ${job.location.country}`;
  return LOCATION_RE.test(loc);
}

function matchesDate(releasedDate: string): boolean {
  if (!releasedDate) return false;
  return new Date(releasedDate) >= CUTOFF_DATE;
}

// --- CSV helpers ---

function csvQuote(s: string): string {
  if (!s) return '""';
  return `"${s.replace(/"/g, '""')}"`;
}

function buildJobUrl(companyIdentifier: string, jobId: string): string {
  return `https://jobs.smartrecruiters.com/${encodeURIComponent(companyIdentifier)}/${jobId}`;
}

// --- Main ---

async function main() {
  console.log("=== SmartRecruiters Job Hunt ===\n");

  // Step 1: Discover slugs
  console.log("Step 1: Discovering company slugs...");
  const slugs = await discoverSlugs({
    onProgress: (msg) => console.log(`  ${msg}`),
  });
  console.log(`\nDiscovered ${slugs.length} company slugs.\n`);

  // Step 2: Scrape all companies
  console.log("Step 2: Scraping job boards (concurrency: 10)...");
  const allResults: CompanyJobs[] = await scrapeAll(slugs, {
    concurrency: 10,
    onProgress: (done, total, found) => {
      console.log(`  Progress: ${done}/${total} scraped, ${found} with jobs`);
    },
  });

  const totalJobs = allResults.reduce((sum, r) => sum + r.jobCount, 0);
  console.log(
    `\nScraped ${allResults.length} companies with ${totalJobs} total jobs.\n`
  );

  // Step 3: Filter jobs
  console.log("Step 3: Filtering for matching roles...");
  const matchingRows: Array<FlatJob & { companyIdentifier: string }> = [];

  for (const company of allResults) {
    for (const job of company.jobs) {
      if (!matchesTitle(job.name)) continue;
      if (!matchesLocation(job)) continue;
      if (!matchesDate(job.releasedDate)) continue;

      matchingRows.push({
        company: company.company,
        slug: company.slug,
        id: job.id,
        title: job.name,
        department: job.department?.label ?? "",
        employmentType: job.typeOfEmployment?.label ?? "",
        experienceLevel: job.experienceLevel?.label ?? "",
        city: job.location?.city ?? "",
        region: job.location?.region ?? "",
        country: job.location?.country ?? "",
        isRemote: job.location?.remote ?? false,
        releasedDate: job.releasedDate,
        jobUrl: buildJobUrl(job.company?.identifier ?? company.slug, job.id),
        refNumber: job.refNumber ?? "",
        companyIdentifier: job.company?.identifier ?? company.slug,
      });
    }
  }

  console.log(`Found ${matchingRows.length} matching jobs.\n`);

  // Step 4: Write CSV
  const headers = [
    "company",
    "slug",
    "title",
    "department",
    "city",
    "region",
    "country",
    "isRemote",
    "employmentType",
    "releasedDate",
    "jobUrl",
  ];

  const csvLines = [headers.join(",")];
  for (const row of matchingRows) {
    csvLines.push(
      [
        csvQuote(row.company),
        csvQuote(row.slug),
        csvQuote(row.title),
        csvQuote(row.department),
        csvQuote(row.city),
        csvQuote(row.region),
        csvQuote(row.country),
        String(row.isRemote),
        csvQuote(row.employmentType),
        row.releasedDate?.split("T")[0] ?? "",
        row.jobUrl,
      ].join(",")
    );
  }

  writeFileSync(OUTPUT_PATH, csvLines.join("\n"), "utf-8");
  console.log(`CSV saved to: ${OUTPUT_PATH}`);

  // Summary
  console.log("\n=== Summary ===");
  console.log(`Total companies discovered: ${slugs.length}`);
  console.log(`Companies with active jobs: ${allResults.length}`);
  console.log(`Total jobs scraped: ${totalJobs}`);
  console.log(`Matching jobs (title + location + date): ${matchingRows.length}`);

  // Print top matches
  if (matchingRows.length > 0) {
    console.log("\n--- Top Matches ---");
    for (const row of matchingRows.slice(0, 30)) {
      const remote = row.isRemote ? " [REMOTE]" : "";
      const location = [row.city, row.country].filter(Boolean).join(", ");
      console.log(
        `  ${row.company} | ${row.title} | ${location}${remote} | ${row.releasedDate?.split("T")[0] ?? ""}`
      );
    }
    if (matchingRows.length > 30) {
      console.log(`  ... and ${matchingRows.length - 30} more (see CSV)`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
