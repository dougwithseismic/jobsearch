/**
 * hunt-personio.ts
 *
 * Discover ALL companies using Personio, scrape their job feeds,
 * filter for roles matching Doug Silkstone's profile, and save to CSV.
 *
 * Usage: npx tsx scripts/hunt-personio.ts
 */

import {
  discoverSlugs,
  scrapeAll,
  flattenJobs,
} from "../packages/personio-jobs/src/index.js";
import type { FlatJob } from "../packages/personio-jobs/src/types.js";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const PROJECT_ROOT = "/Users/godzillaaa/Documents/WEB_PROJECTS/jobsearch";
const OUT_DIR = join(PROJECT_ROOT, "scripts", "results");
const OUT_FILE = join(OUT_DIR, "personio-jobs.csv");

// ── Fallback slug list (Common Crawl indexes are unreliable) ─────────
// Curated list of European tech companies known to use Personio
const KNOWN_SLUGS = [
  // Major European tech companies on Personio
  "n26", "celonis", "sennder", "taxfix", "contentful", "personio", "gorillas",
  "forto", "agicap", "aircall", "akeneo", "algolia", "alma", "amenitiz",
  "ankorstore", "back-market", "billbee", "bitmovin", "bitpanda", "blaize",
  "boxine", "brainly", "bunch", "carsome", "casavi", "circula", "clark",
  "coachhub", "cognigy", "comatch", "companisto", "contentstack", "corrily",
  "crossengage", "custify", "datadog", "deepl", "demodesk", "depict",
  "digitalservice", "docplanner", "doctolib", "ecosia", "egym",
  "enpal", "etribes", "everdrop", "expertlead", "eyeo", "factorialhr",
  "featurespace", "finleap", "finway", "fintune", "flaschenpost",
  "formo", "freenow", "frontnow", "getsafe", "gorillas-technologies",
  "grover", "habyt", "helloprint", "heycar", "holidu", "homeday", "honeypot",
  "idealo", "infarm", "insurely", "iubenda", "iungo", "jobandtalent",
  "joko", "juniqe", "keebo", "klarna", "kontist", "kornit-digital",
  "lana-labs", "lengoo", "lendis", "lilium", "linguee", "liqid",
  "local-brand-x", "lucid-motors", "luminovo", "mambu", "mapspeople",
  "merantix", "miles-mobility", "miro", "mistral-ai", "mobilityhouse",
  "mooncascade", "moss", "movinga", "my-hammer", "navvis",
  "neufund", "omio", "once-for-all", "onefootball", "openproject",
  "oura", "outfittery", "packmatic", "parcellab", "parloa",
  "passes", "penta", "peronio", "phaidra", "phase-one", "pitch",
  "plan-a", "planetly", "pliant", "postman", "priceloop",
  "prosiebensat1", "qonto", "raisin", "ratepay", "recup",
  "remote-com", "remerge", "revolut", "rideamigos", "riskmethods",
  "roadsurfer", "scayle", "scalable-capital", "scoutbee", "sennder-technologies",
  "sequoia", "shiftmove", "signavio", "simplesurance", "sirclo",
  "solaris", "solaris-digital-assets", "solarisbank", "sono-motors",
  "spacegoats", "sparkasse", "spread-group", "squarespace", "staffbase",
  "statista", "storyblok", "sumup", "sundose", "superside", "talabat",
  "tandem-bank", "taxdoo", "tes", "thinkproject", "tier",
  "tink", "tonies", "topi", "tradeling", "transporeon",
  "trickest", "tripactions", "truffls", "trustpilot", "uberall", "usercentrics",
  "vay-technology", "vehicle-one", "vertbaudet", "viator", "vivid-money",
  "volocopter", "voxbone", "wajve", "wefox", "westwing", "wonder",
  "workmotion", "worldline", "xentral", "yieldstreet", "zenjob", "zenloop",
  "zolar", "ztm",
  // Gaming / Creative
  "gameforge", "goodgame-studios", "innogames", "kolibri-games",
  "lotum", "mimimi-games", "piranha-bytes", "rockfish-games",
  "stillfront", "wooga", "yager",
  // Additional European tech
  "adjust", "adyen", "appsflyer", "asana", "atlassian", "automattic",
  "booking", "canva", "checkout-com", "circleci", "cloudflare",
  "confluent", "databricks", "deliveryhero", "discord", "elastic",
  "figma", "flixbus", "getaround", "gitlab", "grafana-labs",
  "grammarly", "hubspot", "intercom", "juro", "kisi", "klarna-bank",
  "leanix", "levity", "linear", "lokalise", "meilisearch",
  "messagebird", "meta", "moonfare", "notion", "pleo",
  "podimo", "product-board", "rapid", "remote", "robin-ai",
  "sap", "scout24", "segment", "shopify", "snyk",
  "spotify", "stripe", "swile", "talon-one", "teamviewer",
  "thoughtworks", "timescale", "toast", "tome", "twilio",
  "typeform", "uber", "unity", "vercel", "vinted",
  "wayflyer", "wolt", "zammad", "zapier", "zendesk",
  // Music / Creative tools
  "ableton", "native-instruments", "soundcloud", "splice",
  "epidemic-sound", "bandcamp", "output", "amuse",
  // Travel
  "getyourguide", "kiwi-com", "lastminute", "momondo",
  "skyscanner", "trivago", "travelcircus", "tourlane",
  // Czech/Prague focused
  "productboard", "mews", "socialbakers", "jetbrains",
  "satismeter", "apify", "blindspot-ai", "rossum",
  // More EU startups/scaleups
  "aiven", "babbel", "bolt", "bonify", "capmo",
  "carrot-fertility", "codat", "contentbird", "cosuno",
  "crafty", "cube-dev", "daftcode", "doinstruct",
  "dreamlines", "easypark", "emarsys", "enverus",
  "equinix", "everphone", "expleo", "fino",
  "foodora", "foxintelligence", "frog", "frontegg",
  "g2", "gardenize", "gini", "goparity",
  "grabyo", "graphcore", "gropyus", "grove",
  "hanno", "helpling", "heyflow", "highsnobiety",
  "hospitality-digital", "hostaway", "hqo", "huboo",
  "hunterco", "hygraph", "hypernode", "improbable",
  "injixo", "instaffo", "invoice-ninja", "iterable",
  "join", "joinrs", "jumia", "just-eat-takeaway",
  "kaltura", "kaufland-e-commerce", "kencko", "kenjo",
  "komoot", "kueski", "laka", "landbot",
  "launchmetrics", "leapsome", "lemon-markets", "licenserocks",
  "limehome", "lingoda", "liqid-investments", "lisk",
  "lucca", "lunchgate", "lyska", "made-com",
  "malt", "marley-spoon", "maze", "meero",
  "metacrew", "micoworks", "mindcurv", "mirakl",
  "mister-spex", "mollie", "mondoc", "money-fellows",
  "moneyou", "morressier", "moss-finance", "motork",
  "myposter", "nannybag", "netigate", "nfon",
  "ninetailed", "nuki", "octopus-energy", "odoo",
  "onlinedoctor", "opendoor", "otto", "oviva",
  "oyster-hr", "parkmobile", "payhawk", "payoneer",
  "penneo", "pennylane", "pirate-ship", "plana-earth",
  "prewave", "procurify", "proptech1", "prothena",
  "pull-bear", "quantilope", "ramp", "rapidmail",
  "rasa", "ratepay-gmbh", "rebuy", "redcare-pharmacy",
  "relex-solutions", "remberg", "researchgate", "retool",
  "reversing-labs", "roboyo", "rocket-internet", "roger",
  "sastrify", "savr", "seeburger", "sellics",
  "sennder-group", "shopware", "sightcall", "silvertours",
  "sixt", "skandia", "skyeng", "smallpdf",
  "smava", "smunch", "solactive", "solarwatt",
  "soptim", "spendesk", "spryker", "srgb",
  "stack-overflow", "statice", "stocard", "strapi",
  "synaos", "talentry", "tandem", "tapereal",
  "tarent", "taxjar", "teambay", "teamleader",
  "techstars", "testbirds", "thinkific", "ticketswap",
  "tidely", "tiendeo", "tillhub", "timify",
  "treatwell", "triverna", "trucky", "tryvium",
  "tutoring", "tyroler-cloud", "ubilabs", "unu-motors",
  "upvest", "urbantz", "userlane", "valsight",
  "vattenfall", "vertice", "vestiaire-collective", "vimcar",
  "vivaldi", "vizzuality", "voiio", "voxel",
  "wabtec", "wagestream", "wandera", "ware2go",
  "we-are-era", "webtrekk", "werkspot", "wikimedia",
  "wonderkind", "workpath", "wunderflats", "wunderdog",
  "xing", "yapily", "yousign", "zeitgold",
  "zeotap", "zeta", "zipjet", "zoovu",
];

// ── Filters ──────────────────────────────────────────────────────────

const TITLE_RE =
  /founding|head.of.eng|lead.*eng|lead.*full|full.?stack|product.eng|growth.eng|staff.eng|principal|senior.*software|senior.*full|cto|vp.eng|eng.*lead|tech.lead|senior.*product/i;

const LOCATION_RE =
  /remote|europe|emea|anywhere|global|uk|united kingdom|ireland|france|germany|netherlands|spain|portugal|czech|sweden|denmark|austria|poland|italy|switzerland|finland|norway|belgium|berlin|london|paris|amsterdam|barcelona|lisbon|prague|vienna|warsaw|milan|zurich|stockholm|copenhagen|dublin|helsinki|oslo|brussels/i;

const CUTOFF_DATE = new Date("2026-02-05");

// ── CSV helpers ──────────────────────────────────────────────────────

function csvQuote(s: string): string {
  if (!s) return '""';
  return `"${s.replace(/"/g, '""')}"`;
}

function jobToCSVRow(job: FlatJob): string {
  return [
    csvQuote(job.company),
    csvQuote(job.slug),
    csvQuote(job.name),
    csvQuote(job.department),
    csvQuote(job.office),
    csvQuote(job.seniority),
    csvQuote(job.employmentType),
    csvQuote(job.schedule),
    job.createdAt?.split("T")[0] ?? "",
    job.jobUrl,
  ].join(",");
}

const CSV_HEADER =
  "company,slug,title,department,office,seniority,employmentType,schedule,createdAt,jobUrl";

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Personio Job Hunt ===\n");

  // Ensure output dir exists
  mkdirSync(OUT_DIR, { recursive: true });

  // 1. Discover slugs (Common Crawl + known list)
  console.log("[1/3] Discovering company slugs from Common Crawl indexes...");
  let slugs: string[];
  try {
    slugs = await discoverSlugs({
      knownSlugs: KNOWN_SLUGS,
      onProgress: (msg) => console.log(`  ${msg}`),
    });
  } catch (err) {
    console.log(`  Common Crawl failed, using known slugs only`);
    slugs = [...new Set(KNOWN_SLUGS)].sort();
  }
  console.log(`\n  Total companies to check: ${slugs.length}\n`);

  // 2. Scrape all
  console.log("[2/3] Scraping job feeds (concurrency=3, be patient)...");
  const startTime = Date.now();
  const results = await scrapeAll(slugs, {
    concurrency: 3,
    onProgress: (done, total, found) => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      console.log(
        `  Progress: ${done}/${total} scraped, ${found} with jobs (${elapsed}s)`
      );
    },
  });

  const totalJobs = results.reduce((sum, r) => sum + r.jobCount, 0);
  console.log(
    `\n  Scrape complete: ${results.length} companies with jobs, ${totalJobs} total jobs\n`
  );

  // 3. Flatten and filter
  console.log("[3/3] Filtering for matching roles...");
  const allJobs = flattenJobs(results);

  const matching = allJobs.filter((job) => {
    // Title match
    if (!TITLE_RE.test(job.name)) return false;

    // Location match
    if (!LOCATION_RE.test(job.office)) return false;

    // Date filter — only last 30 days
    if (job.createdAt) {
      const created = new Date(job.createdAt);
      if (created < CUTOFF_DATE) return false;
    }

    return true;
  });

  console.log(`  Matching jobs: ${matching.length}\n`);

  // 4. Save CSV (always save, even if 0 matches)
  const csv = [CSV_HEADER, ...matching.map(jobToCSVRow)].join("\n");
  writeFileSync(OUT_FILE, csv, "utf-8");
  console.log(`Saved ${matching.length} jobs to ${OUT_FILE}`);

  // Summary
  console.log("\n=== Summary ===");
  console.log(`  Companies discovered: ${slugs.length}`);
  console.log(`  Companies with jobs:  ${results.length}`);
  console.log(`  Total jobs scraped:   ${totalJobs}`);
  console.log(`  Matching jobs:        ${matching.length}`);

  if (matching.length > 0) {
    console.log("\n=== Top Matches ===");
    for (const job of matching.slice(0, 30)) {
      console.log(
        `  ${job.company.padEnd(25)} ${job.name.slice(0, 50).padEnd(52)} ${job.office.slice(0, 30)}`
      );
    }
    if (matching.length > 30) {
      console.log(`  ... and ${matching.length - 30} more`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
