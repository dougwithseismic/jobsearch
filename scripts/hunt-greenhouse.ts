/**
 * hunt-greenhouse.ts
 *
 * Discovers ALL Greenhouse-powered companies, scrapes their job boards,
 * filters for roles matching Doug Silkstone's profile, and saves to CSV.
 *
 * Usage: npx tsx scripts/hunt-greenhouse.ts
 */

import {
  discoverSlugs,
  scrapeAll,
  filterResults,
  flattenJobs,
} from "../packages/greenhouse-jobs/src/index.js";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = resolve(__dirname, "results");
const OUTPUT_FILE = resolve(RESULTS_DIR, "greenhouse-jobs.csv");

// Extended seed list: known Greenhouse companies (Europe-relevant or remote-friendly)
// These ensure coverage when Common Crawl indexes are unavailable
const EXTRA_KNOWN_SLUGS = [
  // From previous successful discovery runs
  "affirm", "alpaca", "alphasense", "anaplan", "appsmith", "arangodb",
  "astronomer", "auth0", "ava", "axonius", "babbel", "backmarket",
  "bakkenbaeck", "bending", "betterment", "bigpanda", "bitpanda",
  "blacklane", "blockdaemon", "bolt", "braze", "buildkite", "camunda",
  "canva", "capco", "celonis", "chainalysis", "checkout", "circle",
  "clickhouse", "close", "cockroachlabs", "contentful", "contentstack",
  "contrast", "coreweave", "couchbase", "cribl", "cresta", "crossbeam",
  "crowdstrike", "customerio", "cuvva", "dailymotion", "dbtlabsinc",
  "deel", "deliveroo", "deribit", "discourse", "docplanner", "doctolib",
  "doitintl", "doppler", "drift", "elastic", "embark", "emma",
  "etsy", "everbridge", "factorial", "faire", "fasthosts", "featurespace",
  "figma", "fivetran", "fleetsmith", "flywire", "forto", "foxglove",
  "framer", "freshworks", "front", "fullstory", "getaround", "getsafe",
  "getsentry", "gitkraken", "goat", "gocardless", "gorillas", "grafana",
  "grammarly", "greenhouse", "hashicorp", "heap", "heyday",
  "highlight", "honeycomb", "hotjar", "hubspot", "humaninterest",
  "hyperscience", "improbable", "incident", "influxdata", "intercom",
  "invisible", "iodigital", "izettle", "jimdo", "jobandtalent",
  "justeat", "kandji", "kayak", "keen", "klarna", "koinly",
  "konnektive", "kustomer", "launchdarkly", "leetify", "lightdash",
  "linear", "liveeo", "localytics", "loom", "lumos", "malt",
  "maptiler", "materialize", "maze", "medable", "melio", "meltwater",
  "messagebird", "metabase", "mixpanel", "modern", "mongodb", "monta",
  "moonpay", "mural", "n26", "netlify", "newstore", "nextdoor",
  "niantic", "notion", "nubank", "onfido", "openai", "opensea",
  "outreach", "paddle", "pagerduty", "pento", "personio", "pexip",
  "phorest", "pitch", "planet", "plausible", "podium", "postman",
  "preply", "prisma", "procore", "productboard", "pulumi",
  "qonto", "ramp", "recharge", "recurly", "reddit", "redpanda",
  "remote", "replit", "revolut", "rippling", "runway",
  "safetywing", "scaleway", "scout24", "segment", "sendbird",
  "sentry", "sequence", "shopify", "sift", "simplebet", "sketch",
  "smartrecruiters", "snyk", "socure", "sourcegraph", "spaceapps",
  "split", "spotify", "staffbase", "starburstdata", "storyblok",
  "strapi", "sumup", "superside", "supertokens", "swissborg",
  "talon", "teamwork", "tempo", "testgorilla", "thinkific",
  "thoughtspot", "ticketswap", "timescale", "toggl", "toptal",
  "torchbox", "tractable", "tractive", "treasuredata", "tricentis",
  "truework", "trustpilot", "typeform", "uipath", "unbabel",
  "usercentrics", "vanta", "vercel", "vinted", "vistaprint",
  "voicemod", "vonage", "wefox", "weights", "whatnot", "wise",
  "wolt", "wonderkind", "xata", "yotpo", "zego", "zendesk",
  "zoopla", "zyte",
  // Big tech / well-known
  "airbnb", "stripe", "twitch", "cloudflare", "datadog", "figma",
  "gitlab", "hashicorp", "hubspot", "lyft", "netflix", "pinterest",
  "plaid", "robinhood", "shopify", "slack", "snapchat", "spotify",
  "square", "uber", "doordash", "coinbase", "databricks", "gusto",
  "airtable", "wealthsimple", "dropbox",
];

// --- Filter criteria ---

const TITLE_RE =
  /\bfounding\b|head.of.eng|lead.*eng|lead.*full|full.?stack|product.eng|growth.eng|staff.eng|\bprincipal\b|senior.*software|senior.*full|\bcto\b|vp.eng|eng.*lead|tech.lead|senior.*product/i;

const LOCATION_RE =
  /\bremote\b|\beurope\b|\bemea\b|\banywhere\b|\bglobal\b|\buk\b|\blondon\b|\bengland\b|\bireland\b|\bdublin\b|\bfrance\b|\bparis\b|\bgermany\b|\bberlin\b|\bnetherlands\b|\bamsterdam\b|\bspain\b|\bbarcelona\b|\bportugal\b|\blisbon\b|\bprague\b|\bczech\b|\bsweden\b|\bstockholm\b|\bdenmark\b|\bcopenhagen\b|\baustria\b|\bvienna\b|\bpoland\b|\bwarsaw\b|\bitaly\b|\bmilan\b|\bswitzerland\b|\bzurich\b|\bfinland\b|\bhelsinki\b|\bnorway\b|\boslo\b|\bbelgium\b|\bbrussels\b/i;

const CUTOFF_DATE = new Date("2026-02-05T00:00:00Z");

// --- Helpers ---

function csvQuote(s: string): string {
  if (!s) return '""';
  return `"${s.replace(/"/g, '""')}"`;
}

function buildCSV(
  rows: ReturnType<typeof flattenJobs>
): string {
  const headers = [
    "company",
    "slug",
    "title",
    "department",
    "location",
    "updatedAt",
    "absoluteUrl",
  ];
  const lines = [headers.join(",")];

  for (const row of rows) {
    lines.push(
      [
        csvQuote(row.company),
        csvQuote(row.slug),
        csvQuote(row.title),
        csvQuote(row.department),
        csvQuote(row.location),
        row.updatedAt?.split("T")[0] ?? "",
        row.absoluteUrl,
      ].join(",")
    );
  }

  return lines.join("\n");
}

// --- Main ---

async function main() {
  console.log("=== Greenhouse Job Hunt ===\n");

  // 1. Discover slugs
  console.log("[1/4] Discovering company slugs...");
  const slugs = await discoverSlugs({
    knownSlugs: EXTRA_KNOWN_SLUGS,
    onProgress: (msg) => console.log(`  ${msg}`),
  });
  console.log(`  -> ${slugs.length} companies discovered\n`);

  // 2. Scrape all
  console.log("[2/4] Scraping job boards (concurrency 10)...");
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
    `  -> ${allResults.length} companies with jobs, ${totalJobs} total jobs\n`
  );

  // 3. Filter: title + location
  console.log("[3/4] Filtering for matching roles...");

  // First filter by title (keyword matches title)
  const titleMatched = filterResults(allResults, { keyword: TITLE_RE });

  // Then filter by location
  const locationMatched = filterResults(titleMatched, { location: LOCATION_RE });

  // Then filter by date (updatedAt after cutoff)
  const dateFiltered = locationMatched
    .map((company) => {
      const recentJobs = company.jobs.filter((job) => {
        if (!job.updatedAt) return false;
        return new Date(job.updatedAt) >= CUTOFF_DATE;
      });
      if (recentJobs.length === 0) return null;
      return { ...company, jobs: recentJobs, jobCount: recentJobs.length };
    })
    .filter(Boolean) as typeof locationMatched;

  const matchingJobs = dateFiltered.reduce((s, r) => s + r.jobCount, 0);
  console.log(
    `  -> ${matchingJobs} matching jobs across ${dateFiltered.length} companies\n`
  );

  // 4. Save to CSV
  console.log("[4/4] Saving results...");
  mkdirSync(RESULTS_DIR, { recursive: true });

  const flat = flattenJobs(dateFiltered);
  const csv = buildCSV(flat);
  writeFileSync(OUTPUT_FILE, csv, "utf-8");
  console.log(`  -> Saved to ${OUTPUT_FILE}\n`);

  // Summary
  console.log("=== Summary ===");
  console.log(`  Companies discovered:  ${slugs.length}`);
  console.log(`  Companies with jobs:   ${allResults.length}`);
  console.log(`  Total jobs scraped:    ${totalJobs}`);
  console.log(`  Matching jobs:         ${matchingJobs}`);
  console.log(`  Companies with match:  ${dateFiltered.length}`);
  console.log(`  Output:                ${OUTPUT_FILE}`);

  // Top companies
  if (dateFiltered.length > 0) {
    console.log("\n=== Top Companies by Match Count ===");
    const sorted = [...dateFiltered].sort((a, b) => b.jobCount - a.jobCount);
    for (const c of sorted.slice(0, 20)) {
      console.log(`  ${c.company.padEnd(30)} ${c.jobCount} jobs`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
