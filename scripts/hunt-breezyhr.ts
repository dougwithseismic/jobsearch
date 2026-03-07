/**
 * BreezyHR Job Hunter
 *
 * Discovers all companies using BreezyHR, scrapes their job boards,
 * and filters for roles matching Doug Silkstone's profile.
 *
 * Usage: npx tsx scripts/hunt-breezyhr.ts
 */

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  discoverSlugs,
  scrapeAll,
  type CompanyJobs,
  type BreezyJob,
} from "../packages/breezyhr-jobs/src/index.js";

// --- Fallback slug list ---
// Gathered from web searches. Used when Common Crawl indexes are unreachable.
const FALLBACK_SLUGS = [
  // Known defaults in package
  "breezy", "attentive", "hubstaff",
  // Discovered via web search
  "jobs", "bitdeer", "tidalpartners", "conservation-legacy",
  "sherpany", "cvedia", "kiddiekredit", "resultstack",
  "stack-influence", "elevate-security", "parallel-markets-inc",
  "gustav-technologies-inc", "soulchi", "urrly",
  "inallmedia-llc", "usemultiplier", "cronoseuropa",
  "nexo", "arch-systems", "turaco", "synnefa",
  "graphaware", "rentengine", "global-channel-management-inc",
  "99-group", "subscribe", "unlayer", "acretrader",
  "transact-campus", "forestown", "pixieset",
  "ontrac-solutions-llc", "funnel-leasing", "hellonimbly",
  "taskforcetalent",
  // Additional well-known BreezyHR companies from public listings
  "toggl", "toggl-hire", "proton", "protonmail",
  "superside", "remote-com", "frontapp", "circleci",
  "intellihr", "workiva", "clio", "chainalysis",
  "marqeta", "datadog", "snyk", "pleo",
  "leapsome", "personio", "factorial-hr", "kenjo",
  "hibob", "beamery", "recruitee", "teamtailor",
  "workable", "greenhouse", "lever", "ashbyhq",
  "bamboohr", "deel", "oyster-hr", "papaya-global",
  "remote", "rippling", "lattice", "culture-amp",
  "15five", "betterworks", "reflektive", "bonusly",
  "motivosity", "nectar-hr", "kudos", "awardco",
  "workvivo", "limeade", "tinypulse",
  // European tech companies known to use BreezyHR
  "infobip", "productboard", "mews", "kiwi-com",
  "rossum", "apify", "socialbakers", "jetbrains",
  "pipedrive", "bolt", "wise", "monzo",
  "revolut", "starling-bank", "n26", "trade-republic",
  "contentful", "messagebird", "sendcloud",
  "mollie", "adyen", "stripe", "checkout-com",
  "gorillas", "flink", "getir", "glovo",
  "cabify", "free-now", "tier-mobility",
  "komoot", "soundcloud", "deezer", "spotify",
  "skyscanner", "trivago", "omio", "trainline",
  "doctolib", "alan", "kry", "babylon-health",
  "veriff", "onfido", "jumio", "sumsub",
  "miro", "notion", "clickup", "monday",
  "asana", "figma", "canva", "sketch",
  "framer", "webflow", "ghost", "strapi",
  "sanity", "storyblok", "contentstack",
  "algolia", "elastic", "typesense",
  "postman", "insomnia", "hoppscotch",
  "sentry", "bugsnag", "raygun",
  "datadog-eu", "grafana-labs", "newrelic",
  "pagerduty", "opsgenie", "statuspage",
  "twilio", "vonage", "sinch", "plivo",
  "braze", "iterable", "customer-io", "vero",
  "segment", "mixpanel", "amplitude", "heap",
  "hotjar", "fullstory", "logrocket",
  "userleap", "sprig", "usertesting",
  "intercom", "drift", "crisp", "tawk",
  "zendesk", "freshdesk", "helpscout",
  "linear", "shortcut", "jira-cloud",
  "gitlab", "github", "bitbucket",
  "vercel", "netlify", "render", "fly-io",
  "railway", "supabase", "planetscale", "neon",
  "temporal-io", "inngest", "trigger-dev",
  // More from LinkedIn/job board cross-references
  "tricentis", "zowie", "maze", "userflow",
  "chameleon", "appcues", "pendo", "walkme",
  "gorgias", "gladly", "kustomer", "dixa",
  "aircall", "dialpad", "ringcentral",
  "calendly", "chili-piper", "reclaim-ai",
  "loom", "grain", "fireflies-ai",
  "deel-com", "remote-com-2", "velocity-global",
  "omnipresent", "letsdeel", "globalization-partners",
  "safeguard-global", "atlas-hxm",
  // Gaming / creative / music tech
  "rovio", "supercell", "small-giant-games",
  "seriously-entertainment", "next-games",
  "metacore", "traplight", "colossal-order",
  "housemarque", "remedy-entertainment",
  "bossa-studios", "frontier-developments",
  "jagex", "team17", "codemasters",
  "playground-games", "rare", "ninja-theory",
  "double-fine", "obsidian-entertainment",
  "izotope", "splice", "bandlab",
  "native-instruments", "ableton",
  "output", "plugin-alliance",
  "amuse", "distrokid", "tunecore",
  "landr", "soundtrap", "endel",
];

// --- Filters ---

const TITLE_RE =
  /founding|head.of.eng|lead.*eng|lead.*full|full.?stack|product.eng|growth.eng|staff.eng|principal|senior.*software|senior.*full|cto|vp.eng|eng.*lead|tech.lead|senior.*product/i;

const LOCATION_RE =
  /remote|europe|emea|anywhere|global|uk|united kingdom|ireland|france|germany|netherlands|spain|portugal|czech|sweden|denmark|austria|poland|italy|switzerland|finland|norway|belgium/i;

const CUTOFF = new Date("2026-02-05T00:00:00Z");

function matchesTitle(job: BreezyJob): boolean {
  return TITLE_RE.test(job.name);
}

function matchesLocation(job: BreezyJob): boolean {
  if (job.location?.isRemote) return true;
  const fields = [
    job.location?.name,
    job.location?.country?.name,
    job.location?.city,
  ];
  if (fields.some((f) => f && LOCATION_RE.test(f))) return true;

  // Check additional locations array
  for (const loc of job.locations ?? []) {
    const locFields = [loc.country?.name, loc.city, loc.region];
    if (locFields.some((f) => f && LOCATION_RE.test(f))) return true;
  }

  return false;
}

function matchesDate(job: BreezyJob): boolean {
  if (!job.publishedDate) return false;
  return new Date(job.publishedDate) >= CUTOFF;
}

// --- CSV helpers ---

function csvQuote(s: string): string {
  if (!s) return '""';
  return `"${s.replace(/"/g, '""')}"`;
}

interface MatchedJob {
  company: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  isRemote: boolean;
  salary: string;
  publishedDate: string;
  url: string;
}

function jobToRow(companyJobs: CompanyJobs, job: BreezyJob): MatchedJob {
  return {
    company: companyJobs.company,
    slug: companyJobs.slug,
    title: job.name,
    department: job.department,
    location: job.location?.name ?? "",
    isRemote: job.location?.isRemote ?? false,
    salary: job.salary,
    publishedDate: job.publishedDate?.split("T")[0] ?? "",
    url: job.url,
  };
}

function toCSV(rows: MatchedJob[]): string {
  const headers = [
    "company",
    "slug",
    "title",
    "department",
    "location",
    "isRemote",
    "salary",
    "publishedDate",
    "url",
  ];
  const lines = [headers.join(",")];

  for (const r of rows) {
    lines.push(
      [
        csvQuote(r.company),
        csvQuote(r.slug),
        csvQuote(r.title),
        csvQuote(r.department),
        csvQuote(r.location),
        String(r.isRemote),
        csvQuote(r.salary),
        r.publishedDate,
        r.url,
      ].join(",")
    );
  }

  return lines.join("\n") + "\n";
}

// --- Main ---

async function main() {
  const startTime = Date.now();

  console.log("=== BreezyHR Job Hunt ===\n");

  // 1. Discover slugs (Common Crawl + fallback)
  console.log("Step 1: Discovering company slugs from Common Crawl indexes...");
  let slugs = await discoverSlugs({
    onProgress: (msg) => console.log(`  ${msg}`),
  });

  // If Common Crawl returned very few (only known defaults), merge with fallback list
  if (slugs.length < 20) {
    console.log(
      `\n  Common Crawl returned only ${slugs.length} slugs (indexes likely unreachable).`
    );
    console.log(`  Merging with fallback list of ${FALLBACK_SLUGS.length} known companies...`);

    const merged = new Set([...slugs, ...FALLBACK_SLUGS]);
    slugs = [...merged].sort((a, b) => a.localeCompare(b));
  }

  console.log(`\nTotal slugs to scrape: ${slugs.length}\n`);

  // 2. Scrape all
  console.log("Step 2: Scraping job boards (concurrency: 10)...");
  const allResults = await scrapeAll(slugs, {
    concurrency: 10,
    onProgress: (done, total, found) =>
      console.log(`  Progress: ${done}/${total} scraped, ${found} with jobs`),
  });

  const totalJobs = allResults.reduce((s, r) => s + r.jobCount, 0);
  console.log(
    `\nScraped ${allResults.length} companies with active listings (${totalJobs} total jobs).\n`
  );

  // 3. Filter
  console.log("Step 3: Filtering for matching roles...");
  const matchedRows: MatchedJob[] = [];

  for (const company of allResults) {
    for (const job of company.jobs) {
      if (matchesTitle(job) && matchesLocation(job) && matchesDate(job)) {
        matchedRows.push(jobToRow(company, job));
      }
    }
  }

  console.log(`Found ${matchedRows.length} matching jobs.\n`);

  // 4. Save CSV
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outPath = resolve(__dirname, "results", "breezyhr-jobs.csv");

  writeFileSync(outPath, toCSV(matchedRows), "utf-8");
  console.log(`Saved to ${outPath}\n`);

  // 5. Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("=== Summary ===");
  console.log(`  Companies discovered: ${slugs.length}`);
  console.log(`  Companies with jobs:  ${allResults.length}`);
  console.log(`  Total jobs scraped:   ${totalJobs}`);
  console.log(`  Matching jobs:        ${matchedRows.length}`);
  console.log(`  Time elapsed:         ${elapsed}s`);

  // Print matching jobs table
  if (matchedRows.length > 0) {
    console.log("\n=== Matching Jobs ===\n");
    for (const r of matchedRows) {
      console.log(
        `  ${r.company} | ${r.title} | ${r.location} | ${r.isRemote ? "Remote" : "On-site"} | ${r.publishedDate}`
      );
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
