/**
 * Hunt for jobs on Workable that match Doug Silkstone's profile.
 *
 * 1. Discover all company slugs via Common Crawl indexes + expanded known list
 * 2. Scrape all discovered companies (concurrency 10)
 * 3. Filter for matching roles (title, location/remote, recency)
 * 4. Save to CSV
 */

import { discoverSlugs, scrapeAll, flattenJobs } from "../packages/workable-jobs/src/index.js";
import type { CompanyJobs, WorkableJob } from "../packages/workable-jobs/src/types.js";
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Expanded known slugs ---
// Compiled from web search results, Workable job board, and industry knowledge.
// Common Crawl indexes are often down (503), so this list ensures broad coverage.
const EXTRA_SLUGS = [
  // From search results - companies with engineering roles
  "cliniko", "passionio", "growthbook", "velotio", "regen-network",
  "formassembly", "sparkmeter", "discogs-1", "novata", "covergo",
  "jobgether", "n8n", "leadfeeder", "boclips", "slashdata",
  "plentific", "synergysports", "cos", "autofleet", "cajoo",
  "cognito-education", "isofttek-solutions-inc", "spaceinch",
  "trinetix", "workearly-1",
  // Founding/staff/principal roles
  "cynch-ai", "alongsidefinance", "portabl", "clusterinc", "feeldco",
  "xcelirate", "unacademy", "coldquanta", "fuku", "bindplane",
  // Head of eng / CTO / VP
  "iv-ai", "elevation-capital-3", "unreal-gigs", "commify",
  "clear-score", "kody", "om1", "hacera",
  // Lead/product/growth engineers
  "enjins", "fuseenergy", "leadtech", "paired", "rebionics",
  "berry-street", "leads-io", "head-hunter-1", "smartfinancial",
  // Music/games/creative
  "bandlabtechnologies", "twine", "pulsegames", "fever-pr",
  "jackbox-games", "gram-games", "peaksware",
  // European tech companies known to use Workable
  "winthrop-technologies", "telementum", "rand-europe", "vesuvius",
  "victus-networks", "next-job-abroad", "rand-labs",
  "europe-careers", "snuggs", "digital-wave-finance-ag", "d-ploy",
  "cloudlinux", "secheron-hasler-group",
  // Well-known European/remote tech companies on Workable
  "posthog", "deel", "miro-jobs", "semrush", "sennder", "personio",
  "taxfix", "contentful", "adjust", "n26", "messagebird", "trivago",
  "delivery-hero", "sumup", "wire", "babbel", "omio", "ecosia",
  "foodspring", "helpling", "jimdo", "komoot",
  // Additional well-known companies using Workable
  "workable", "toggl", "malt", "factorial-hr", "travelperk",
  "monzo", "revolut", "wise-1", "getir", "gorillas",
  "tier-mobility", "flink", "wolt", "bolt-eu", "cabify",
  "glovo", "just-eat-takeaway", "zego", "pleo", "leapsome",
  "remote-com", "oyster-hr", "lattice", "rippling", "gusto",
  "ashby-1", "lever-co", "bamboohr", "hibob", "personio",
  "recruitee", "teamtailor", "fountain", "hirebridge",
  // B2C / creative / interesting companies
  "canva", "figma", "notion", "airtable", "linear",
  "vercel", "supabase", "planetscale", "neon", "turso",
  "railway", "render", "fly-io", "deno", "bun",
  "astro-build", "svelte", "remix-run", "redwoodjs",
  // Gaming
  "supercell", "king", "rovio", "seriously", "small-giant-games",
  "metacore", "futureplay", "traplight", "playdemic",
  "naughty-dog", "insomniac", "bungie",
  // Music tech
  "splice", "landr", "output", "izotope", "ableton",
  "native-instruments", "soundcloud", "deezer", "audiomack",
  // Travel
  "skyscanner", "booking-com", "hostelworld", "kiwi-com",
  "kayak", "momondo", "lastminute-com", "getyourguide",
  "musement", "klook", "viator", "civitatis",
  // European scale-ups
  "mistral-ai", "hugging-face", "dataiku", "algolia",
  "strapi", "doctolib", "alan", "qonto", "pennylane",
  "scaleway", "ovh", "clever-cloud", "platform-sh",
  "contentstack", "storyblok", "hygraph", "sanity-io",
  "ghost-foundation", "keystonejs", "payload-cms",
  // More European tech
  "klarna", "izettle", "trustly", "tink", "adyen",
  "mollie", "stripe", "checkout-com", "gocardless",
  "transfergo", "azimo", "remitly", "currencycloud",
  // Developer tools
  "sentry", "datadog", "grafana", "elastic",
  "gitlab", "sourcegraph", "snyk", "sonarqube",
  "circleci", "buildkite", "semaphore", "codefresh",
  // Prague / Czech companies
  "kiwi-com", "productboard", "mews", "apiary",
  "pure-storage", "socialbakers", "satismeter",
  "avocode", "kentico", "jetbrains",
  // Additional from theirstack/web results
  "papaya-global", "velocity-global", "omnipresent",
  "safeguard-global", "globalization-partners",
  "airwallex", "brex", "ramp", "mercury",
  // Creative tools
  "pitch", "mural", "miro", "whimsical",
  "excalidraw", "loom", "mmhmm", "around",
  "gather", "spatial", "roam-research",
  // More B2C / consumer
  "headspace", "calm", "noom", "peloton",
  "strava", "alltrails", "komoot",
  "duolingo", "babbel", "busuu", "preply",
  "italki", "cambly", "verbling",
];

// --- Filters ---

const TITLE_RE =
  /founding|head.of.eng|lead.*eng|lead.*full|full.?stack|product.eng|growth.eng|staff.eng|principal|senior.*software|senior.*full|cto|vp.eng|eng.*lead|tech.lead|senior.*product/i;

const LOCATION_RE =
  /remote|europe|emea|anywhere|global|uk|united kingdom|ireland|france|germany|netherlands|spain|portugal|czech|sweden|denmark|austria|poland|italy|switzerland|finland|norway|belgium/i;

const CUTOFF = new Date("2026-02-05");

function matchesTitle(job: WorkableJob): boolean {
  return TITLE_RE.test(job.title);
}

function matchesLocation(job: WorkableJob): boolean {
  if (job.isRemote) return true;

  // Check top-level fields
  for (const field of [job.country, job.city, job.state]) {
    if (field && LOCATION_RE.test(field)) return true;
  }

  // Check locations array
  for (const loc of job.locations ?? []) {
    for (const field of [loc.country, loc.city, loc.region, loc.countryCode]) {
      if (field && LOCATION_RE.test(field)) return true;
    }
  }

  return false;
}

function matchesRecency(job: WorkableJob): boolean {
  if (!job.publishedAt) return false;
  const published = new Date(job.publishedAt);
  return published >= CUTOFF;
}

function csvQuote(s: string): string {
  if (!s) return '""';
  return `"${s.replace(/"/g, '""')}"`;
}

// --- Main ---

async function main() {
  console.log("=== Workable Job Hunt for Doug Silkstone ===\n");

  // Step 1: Discover slugs (Common Crawl + known slugs + extra slugs)
  console.log("[1/3] Discovering company slugs...");
  const slugs = await discoverSlugs({
    knownSlugs: EXTRA_SLUGS,
    onProgress: (msg) => console.log(`  ${msg}`),
  });
  console.log(`  => ${slugs.length} unique company slugs to check\n`);

  // Step 2: Scrape all companies
  console.log("[2/3] Scraping all companies (concurrency 10)...");
  const results = await scrapeAll(slugs, {
    concurrency: 10,
    onProgress: (done, total, found) => {
      console.log(`  Progress: ${done}/${total} scraped, ${found} with jobs`);
    },
  });

  const totalJobs = results.reduce((sum, c) => sum + c.jobCount, 0);
  console.log(
    `  => ${results.length} companies with active jobs, ${totalJobs} total jobs\n`
  );

  // Step 3: Filter
  console.log("[3/3] Filtering for matching roles...");
  const matchingCompanies: CompanyJobs[] = [];

  for (const company of results) {
    const matchingJobs = company.jobs.filter(
      (job) => matchesTitle(job) && matchesLocation(job) && matchesRecency(job)
    );
    if (matchingJobs.length > 0) {
      matchingCompanies.push({
        ...company,
        jobs: matchingJobs,
        jobCount: matchingJobs.length,
      });
    }
  }

  const flatJobs = flattenJobs(matchingCompanies);
  console.log(`  => ${flatJobs.length} matching jobs across ${matchingCompanies.length} companies\n`);

  // Step 4: Write CSV
  const headers = [
    "company",
    "slug",
    "title",
    "department",
    "country",
    "city",
    "isRemote",
    "employmentType",
    "publishedAt",
    "jobUrl",
    "applyUrl",
  ];

  const csvRows = [headers.join(",")];
  for (const job of flatJobs) {
    csvRows.push(
      [
        csvQuote(job.company),
        csvQuote(job.slug),
        csvQuote(job.title),
        csvQuote(job.department),
        csvQuote(job.country),
        csvQuote(job.city),
        String(job.isRemote),
        job.employmentType,
        job.publishedAt ?? "",
        job.jobUrl,
        job.applyUrl,
      ].join(",")
    );
  }

  const outPath = resolve(__dirname, "results", "workable-jobs.csv");
  writeFileSync(outPath, csvRows.join("\n"), "utf-8");
  console.log(`CSV saved to: ${outPath}`);

  // Also save full raw results as JSON for later analysis
  const jsonPath = resolve(__dirname, "results", "workable-all-jobs.json");
  writeFileSync(jsonPath, JSON.stringify(results, null, 2), "utf-8");
  console.log(`Full results JSON saved to: ${jsonPath}`);

  // Summary
  console.log("\n=== Summary ===");
  console.log(`Total companies discovered: ${slugs.length}`);
  console.log(`Companies with active jobs: ${results.length}`);
  console.log(`Total jobs scraped: ${totalJobs}`);
  console.log(`Matching jobs: ${flatJobs.length}`);
  console.log(`Matching companies: ${matchingCompanies.length}`);

  if (flatJobs.length > 0) {
    console.log("\nTop matches:");
    for (const job of flatJobs.slice(0, 30)) {
      const remote = job.isRemote ? " [Remote]" : "";
      console.log(
        `  ${job.company} — ${job.title} (${job.country || job.city || "N/A"})${remote}`
      );
    }
    if (flatJobs.length > 30) {
      console.log(`  ... and ${flatJobs.length - 30} more`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
