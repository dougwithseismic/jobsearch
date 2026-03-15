#!/usr/bin/env node
/**
 * End-to-end test: scrape real jobs from multiple ATS platforms,
 * normalize to UnifiedJob, show results side by side.
 */
import { scrapeCompany as scrapeGreenhouse } from "../greenhouse-jobs/src/index.js";
import { scrapeCompany as scrapeAshby } from "../ashby-jobs/src/index.js";
import { scrapeCompany as scrapeLever } from "../lever-jobs/src/index.js";
import { scrapeCompany as scrapeWorkable } from "../workable-jobs/src/index.js";
import { normalize as normalizeGreenhouse } from "./src/normalizers/greenhouse.js";
import { normalize as normalizeAshby } from "./src/normalizers/ashby.js";
import { normalize as normalizeLever } from "./src/normalizers/lever.js";
import { normalize as normalizeWorkable } from "./src/normalizers/workable.js";
import type { UnifiedJob } from "./src/unified-schema.js";

function compact(job: UnifiedJob) {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    workplaceType: job.workplaceType,
    employmentType: job.employmentType,
    seniorityLevel: job.seniorityLevel,
    salary: job.salary,
    tags: job.tags,
    jobUrl: job.jobUrl,
    publishedAt: job.publishedAt,
    descriptionSnippet: job.descriptionSnippet.slice(0, 100) + "...",
  };
}

async function testPlatform(
  name: string,
  slug: string,
  scraper: (s: string, opts?: any) => Promise<any>,
  normalizer: (jobs: any[]) => UnifiedJob[],
  opts?: any,
) {
  console.log(`\nScraping ${slug} (${name})...`);
  const result = await scraper(slug, opts);
  if (!result) { console.log("  No results"); return; }

  const rawJobs = result.jobs.map((j: any) => ({
    ...j,
    _company: result.company,
    _slug: result.slug,
    _scrapedAt: result.scrapedAt,
  }));
  const unified = normalizer(rawJobs);

  console.log(`\n=== ${name.toUpperCase()}: ${result.company} — ${unified.length} jobs ===`);

  // Show first job with interesting data
  const interesting = unified.find(j => j.salary.min !== null) ?? unified[0];
  if (interesting) {
    console.log(JSON.stringify(compact(interesting), null, 2));
  }
}

async function main() {
  await testPlatform("Greenhouse", "stripe", scrapeGreenhouse, normalizeGreenhouse, { includeContent: true });
  await testPlatform("Ashby", "linear", scrapeAshby, normalizeAshby, { includeDescriptions: true });
  await testPlatform("Lever", "spotify", scrapeLever, normalizeLever, { includeDescriptions: true });
  await testPlatform("Workable", "1000heads", scrapeWorkable, normalizeWorkable);

  console.log("\n\nAll 4 platforms produce identical UnifiedJob shape.");
}

main().catch(console.error);
