#!/usr/bin/env node
/**
 * Test all 9 normalizers with real scraped data.
 */
import { scrapeCompany as scrapeGreenhouse } from "../greenhouse-jobs/src/index.js";
import { scrapeCompany as scrapeAshby } from "../ashby-jobs/src/index.js";
import { scrapeCompany as scrapeLever } from "../lever-jobs/src/index.js";
import { scrapeCompany as scrapeWorkable } from "../workable-jobs/src/index.js";
import { scrapeCompany as scrapeSR } from "../smartrecruiters-jobs/src/index.js";
import { scrapeCompany as scrapeBreezy } from "../breezyhr-jobs/src/index.js";
import { scrapeCompany as scrapePersonio } from "../personio-jobs/src/index.js";
import { scrapeCompany as scrapeRecruitee } from "../recruitee-jobs/src/index.js";
import { scrapeJobs as scrapeHN } from "../hn-jobs/src/index.js";

import { normalize as nGreenhouse } from "./src/normalizers/greenhouse.js";
import { normalize as nAshby } from "./src/normalizers/ashby.js";
import { normalize as nLever } from "./src/normalizers/lever.js";
import { normalize as nWorkable } from "./src/normalizers/workable.js";
import { normalize as nSR } from "./src/normalizers/smartrecruiters.js";
import { normalize as nBreezy } from "./src/normalizers/breezyhr.js";
import { normalize as nPersonio } from "./src/normalizers/personio.js";
import { normalize as nRecruitee } from "./src/normalizers/recruitee.js";
import { normalize as nHN } from "./src/normalizers/hn.js";
import type { UnifiedJob } from "./src/unified-schema.js";

const REQUIRED_FIELDS: (keyof UnifiedJob)[] = [
  "id", "sourceId", "title", "description", "descriptionSnippet",
  "department", "team", "category",
  "location", "secondaryLocations", "workplaceType",
  "employmentType", "employmentTypeRaw", "seniorityLevel",
  "salary", "jobUrl", "applyUrl", "company", "tags",
  "publishedAt", "scrapedAt", "lastSeenAt",
];

function validate(job: UnifiedJob, platform: string): string[] {
  const errors: string[] = [];
  for (const field of REQUIRED_FIELDS) {
    if (job[field] === undefined) errors.push(`missing ${field}`);
  }
  if (typeof job.company !== "object") errors.push("company not an object");
  if (typeof job.location !== "object") errors.push("location not an object");
  if (typeof job.salary !== "object") errors.push("salary not an object");
  if (!Array.isArray(job.tags)) errors.push("tags not an array");
  if (!Array.isArray(job.secondaryLocations)) errors.push("secondaryLocations not an array");
  if (!job.company?.ats) errors.push("company.ats missing");
  if (job.company?.ats !== platform) errors.push(`company.ats=${job.company?.ats}, expected ${platform}`);
  if (job.location?.region === undefined) errors.push("location.region missing");
  return errors;
}

async function testATS(
  name: string,
  slug: string,
  scraper: (s: string, opts?: any) => Promise<any>,
  normalizer: (jobs: any[]) => UnifiedJob[],
  opts?: any,
) {
  try {
    const result = await scraper(slug, opts);
    if (!result || result.jobs?.length === 0) {
      console.log(`  ${name.padEnd(16)} ❌ No data for "${slug}"`);
      return;
    }
    const rawJobs = result.jobs.map((j: any) => ({
      ...j,
      _company: result.company,
      _slug: result.slug,
      _scrapedAt: result.scrapedAt,
    }));
    const unified = normalizer(rawJobs);
    const errors = validate(unified[0]!, name.toLowerCase().replace(/\s/g, ""));
    if (errors.length > 0) {
      console.log(`  ${name.padEnd(16)} ❌ ${unified.length} jobs — ERRORS: ${errors.join(", ")}`);
    } else {
      const j = unified[0]!;
      const salaryStr = j.salary.min ? `${j.salary.currency ?? "?"}${j.salary.min}-${j.salary.max}` : "—";
      console.log(`  ${name.padEnd(16)} ✅ ${String(unified.length).padStart(4)} jobs | ${j.workplaceType.padEnd(7)} | ${j.employmentType.padEnd(10)} | ${j.seniorityLevel.padEnd(9)} | salary: ${salaryStr}`);
    }
  } catch (e: any) {
    console.log(`  ${name.padEnd(16)} ❌ Error: ${e.message?.slice(0, 60)}`);
  }
}

async function testHN() {
  try {
    const jobs = await scrapeHN({ months: 1, concurrency: 10 });
    if (jobs.length === 0) {
      console.log(`  HN Jobs          ❌ No data`);
      return;
    }
    const unified = nHN(jobs as any);
    const errors = validate(unified[0]!, "hn");
    if (errors.length > 0) {
      console.log(`  HN Jobs          ❌ ${unified.length} jobs — ERRORS: ${errors.join(", ")}`);
    } else {
      const j = unified[0]!;
      const salaryStr = j.salary.min ? `${j.salary.currency ?? "?"}${j.salary.min}-${j.salary.max}` : "—";
      console.log(`  HN Jobs          ✅ ${String(unified.length).padStart(4)} jobs | ${j.workplaceType.padEnd(7)} | ${j.employmentType.padEnd(10)} | ${j.seniorityLevel.padEnd(9)} | salary: ${salaryStr}`);
    }
  } catch (e: any) {
    console.log(`  HN Jobs          ❌ Error: ${e.message?.slice(0, 60)}`);
  }
}

async function main() {
  console.log("Testing all 9 normalizers with live data...\n");

  await testATS("Greenhouse", "stripe", scrapeGreenhouse, nGreenhouse, { includeContent: true });
  await testATS("Ashby", "linear", scrapeAshby, nAshby, { includeDescriptions: true });
  await testATS("Lever", "spotify", scrapeLever, nLever, { includeDescriptions: true });
  await testATS("Workable", "1000heads", scrapeWorkable, nWorkable);
  await testATS("SmartRecruiters", "Visa", scrapeSR, nSR);
  await testATS("BreezyHR", "breezy", scrapeBreezy, nBreezy);
  await testATS("Personio", "personio", scrapePersonio, nPersonio, { includeContent: true });
  await testATS("Recruitee", "personio", scrapeRecruitee, nRecruitee);
  await testHN();

  console.log("\nDone.");
}

main().catch(console.error);
