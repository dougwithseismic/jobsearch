/**
 * Discover all Recruitee-powered companies, scrape their jobs,
 * and filter for roles matching Doug Silkstone's profile.
 *
 * Uses multiple discovery methods:
 * 1. Common Crawl indexes (via recruitee-jobs package)
 * 2. HackerTarget DNS lookup (fallback)
 * 3. RapidDNS subdomain search (fallback)
 * 4. Large curated slug list from web research
 *
 * Usage: pnpm tsx scripts/hunt-recruitee.ts
 */

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  discoverSlugs,
  scrapeAll,
  type CompanyJobs,
  type RecruiteeJob,
} from "../packages/recruitee-jobs/src/index.js";

// ── Curated slug list from web research + DNS discovery ──────────────
// Gathered from: web search results, rapiddns.io, hackertarget.com,
// Google search results, and known European tech companies on Recruitee.

const CURATED_SLUGS = [
  // From web searches - companies with active engineering roles
  "epilot", "entyre", "arch", "holepunch", "spoke", "careermentors",
  "emergentsoftware", "tiugotech", "tether", "kayrros1",
  // From rapiddns.io discovery
  "accedia", "agaseurope", "apexmicrotechnology", "archello", "arqamfc",
  "arto", "bsgcontact", "bwgfoods", "caseking", "centreon", "coingaming",
  "cskfood", "currenceholdingbv", "divante", "divbrands", "doccheckgroup",
  "electricantlabbv", "funktional", "gettechtalent", "greatminds",
  "gremcogmbh", "hudsonsbay", "immomiogmbh", "lenskartcareers", "moblee",
  "monizze", "naosmarketing", "rahnema", "roamlercareers", "saphe",
  "sef5networkingaps", "sezane", "speedinvestgmbh", "tylko",
  "unitedwardrobe", "werkenbijdepizzabakkers", "werkenbijzig", "zinsland",
  // From first web search results
  "chgcareers", "what", "iliabeauty", "peddler", "careerswcc",
  "lucidgames", "spro", "careerbluerocktms", "dps",
  // From hackertarget discovery (first batch)
  "10xcrew", "11bitstudios", "128collective", "12build",
  "174powerglobal", "21buttons", "24sessions2", "2bdigital", "2cnnct",
  "3sidedcube", "3vc", "4cee", "4geeks", "4players", "5ca",
  "7graus", "8advisory", "8westconsulting",
  // Known European tech companies on Recruitee
  "teamtailor", "bynder", "peakon", "miro", "factorial",
  "personio", "vinted", "docplanner", "sennder", "messagebird",
  // Additional known European companies using Recruitee
  "babbel", "contentful", "deliveryhero", "evbox", "framer",
  "gocardless", "grover", "holidu", "infarm", "jimdo",
  "kontist", "lilium", "mambu", "n26", "omio",
  "pitch", "raisin", "scalable", "tiermobi", "tourlane",
  "typeform", "vivid", "wolt", "yelster", "zenloop",
  // More European tech/gaming companies
  "azerion", "bohemiainteractive", "cdprojektred", "egosoft",
  "futuregames", "gameforge", "innogames", "klang", "kolibri",
  "playdigious", "realitylab", "sharkmob", "stunlock", "supercell",
  "thunderful", "ubisoft", "wargaming", "wooga",
  // Creative/music/travel tech
  "ableton", "artlist", "bandcamp", "beatport", "boomplay",
  "deezer", "distrokid", "epidemic", "landr", "musixmatch",
  "native-instruments", "output", "soundcloud", "splice",
  "getaway", "getyourguide", "kiwi", "lastminute", "momondo",
  "travelcircus", "traveloka", "trivago", "viator", "wanderlog",
  // Broader European tech
  "adyen", "booking", "bolt", "bunq", "contentking",
  "deepl", "elastic", "flixbus", "gorillas", "helloprint",
  "instabox", "just-eat", "karmalife", "lightspeed", "mollie",
  "onefit", "ottonova", "pleo", "qonto", "revenue",
  "sendcloud", "siteimprove", "staffbase", "studocu", "talend",
  "trustpilot", "unbabel", "veed", "wayflyer", "xerini",
  // Additional well-known Recruitee customers
  "bettyblocks", "circlecollection", "nuuvem", "transavia",
  "conscious-hotel", "teamleader", "dckgroup", "myjewellery",
  "duravermeer", "bas", "cordaan", "transperfect", "boggimilano",
  "apside", "sparireland",
  // More tech companies found via web research
  "brainly", "canva", "chargebee", "datadog", "doodle",
  "flywire", "freshworks", "gitlab", "gorgias", "hubspot",
  "intercom", "jotform", "kenjo", "leanix", "messagebird",
  "notion", "onoff", "packhelp", "qvest", "remote",
  "savana", "sentry", "talentsoft", "upvest", "vimeo",
  "wrike", "xentral", "yousign", "zapier", "zoovu",
  // Czech/Prague-area companies
  "socialbakers", "productboard", "satismeter", "apify",
  "keboola", "pipedrive", "rossum", "smartlook",
  // Expanded EU tech
  "algolia", "amplitude", "aircall", "backbase", "beekeeper",
  "braze", "checkout", "commercetools", "crowdstrike", "dataiku",
  "doctolib", "egym", "finleap", "forto", "getresponse",
  "happycar", "idealo", "jobandtalent", "komoot", "ledger",
  "meero", "nexthink", "ovhcloud", "paysafe", "quantcast",
  "remerge", "spryker", "talend", "uberall", "voi",
  "wefox", "xeneta", "yokoy", "zenjob",
  // Additional from DNS enumeration patterns
  "adevinta", "avalabs", "bitpanda", "celonis", "deposits",
  "emarsys", "fyber", "groupm", "hometogo", "inpost",
  "jobs", "kry", "lendable", "marley-spoon", "novum",
  "omniconvert", "podium", "quandoo", "recurly", "shpock",
  "taxfix", "usercentrics", "vay", "wunderflats", "xometry",
];

/** Subdomains that are not company job boards */
const EXCLUDED_SUBDOMAINS = new Set([
  "www", "api", "app", "help", "docs", "blog", "status",
  "careers", "admin", "support", "mail", "cdn", "assets",
  "staging", "dev", "test", "demo", "sandbox", "preview",
  "login", "auth", "sso", "dashboard", "console", "portal",
  "static", "media", "images", "img", "files", "download",
  "shop", "store", "billing", "payments", "webhooks",
  "analytics", "tracking", "events", "notifications",
  "feedback", "survey", "forms", "widget", "embed",
  "integrations", "marketplace", "partners", "affiliate",
  "community", "forum", "kb", "knowledge", "faq",
  "security", "compliance", "legal", "privacy", "terms",
  "apidocs", "new-site", "secure-backup",
]);

// ── DNS-based slug discovery ─────────────────────────────────────────

async function discoverViaDNS(): Promise<Set<string>> {
  const slugs = new Set<string>();
  const subdomainRe = /([a-z0-9][a-z0-9-]+)\.recruitee\.com/gi;

  // HackerTarget
  try {
    console.log("  Trying HackerTarget DNS lookup...");
    const res = await fetch(
      "https://api.hackertarget.com/hostsearch/?q=recruitee.com"
    );
    if (res.ok) {
      const text = await res.text();
      if (!text.startsWith("error")) {
        for (const match of text.matchAll(subdomainRe)) {
          const slug = match[1]!.toLowerCase();
          if (!EXCLUDED_SUBDOMAINS.has(slug)) slugs.add(slug);
        }
        console.log(`  HackerTarget: found ${slugs.size} slugs`);
      }
    }
  } catch (e) {
    console.log(`  HackerTarget: failed - ${e}`);
  }

  // RapidDNS
  try {
    console.log("  Trying RapidDNS subdomain search...");
    const res = await fetch(
      "https://rapiddns.io/subdomain/recruitee.com?full=1"
    );
    if (res.ok) {
      const html = await res.text();
      const before = slugs.size;
      for (const match of html.matchAll(subdomainRe)) {
        const slug = match[1]!.toLowerCase();
        if (!EXCLUDED_SUBDOMAINS.has(slug)) slugs.add(slug);
      }
      console.log(`  RapidDNS: found ${slugs.size - before} new slugs`);
    }
  } catch (e) {
    console.log(`  RapidDNS: failed - ${e}`);
  }

  return slugs;
}

// ── Filters ──────────────────────────────────────────────────────────

const TITLE_RE =
  /founding.eng|head.of.eng|lead.*eng|lead.*full|full.?stack|product.eng|growth.eng|staff.eng|staff.*develop|principal.eng|principal.*develop|senior.*software|senior.*full.?stack|\bcto\b|vp.of.eng|\beng\w*\s+lead|tech.lead|senior.*product.eng|senior.*develop/i;

const LOCATION_RE =
  /remote|europe|emea|anywhere|global|uk|united kingdom|ireland|france|germany|netherlands|spain|portugal|czech|sweden|denmark|austria|poland|italy|switzerland|finland|norway|belgium/i;

const CUTOFF = new Date("2026-02-05T00:00:00Z");

function matchesTitle(job: RecruiteeJob): boolean {
  return TITLE_RE.test(job.title);
}

function matchesLocation(job: RecruiteeJob): boolean {
  if (job.remote) return true;
  const haystack = [job.location, job.country, job.city].join(" ");
  return LOCATION_RE.test(haystack);
}

function matchesDate(job: RecruiteeJob): boolean {
  if (!job.publishedAt) return false;
  return new Date(job.publishedAt) >= CUTOFF;
}

function matchesAll(job: RecruiteeJob): boolean {
  return matchesTitle(job) && matchesLocation(job) && matchesDate(job);
}

// ── CSV helpers ──────────────────────────────────────────────────────

function csvQuote(s: string): string {
  if (!s) return '""';
  return `"${s.replace(/"/g, '""')}"`;
}

function jobToCSVRow(
  company: string,
  slug: string,
  job: RecruiteeJob
): string {
  return [
    csvQuote(company),
    csvQuote(slug),
    csvQuote(job.title),
    csvQuote(job.department),
    csvQuote(job.location),
    csvQuote(job.country),
    csvQuote(job.city),
    String(job.remote),
    job.employmentType,
    job.publishedAt?.split("T")[0] ?? "",
    job.careersUrl,
  ].join(",");
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Recruitee Job Hunter ===\n");

  // 1. Discover slugs from multiple sources
  console.log("Step 1: Discovering company slugs...\n");

  // 1a. Common Crawl (via package)
  console.log("  [Source 1/3] Common Crawl indexes...");
  let ccSlugs: string[] = [];
  try {
    ccSlugs = await discoverSlugs({
      onProgress: (msg) => console.log(`    ${msg}`),
    });
    console.log(`  Common Crawl: ${ccSlugs.length} slugs\n`);
  } catch (e) {
    console.log(`  Common Crawl: failed - ${e}\n`);
  }

  // 1b. DNS-based discovery
  console.log("  [Source 2/3] DNS-based discovery...");
  const dnsSlugs = await discoverViaDNS();
  console.log(`  DNS total: ${dnsSlugs.size} slugs\n`);

  // 1c. Curated list
  console.log(`  [Source 3/3] Curated slug list: ${CURATED_SLUGS.length} slugs\n`);

  // Merge all sources
  const allSlugs = new Set<string>();
  for (const s of ccSlugs) allSlugs.add(s);
  for (const s of dnsSlugs) allSlugs.add(s);
  for (const s of CURATED_SLUGS) allSlugs.add(s);

  const slugs = [...allSlugs].sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  console.log(`Total unique slugs from all sources: ${slugs.length}\n`);

  // 2. Scrape all
  console.log("Step 2: Scraping job boards (concurrency 10)...");
  const results = await scrapeAll(slugs, {
    concurrency: 10,
    onProgress: (done, total, found) => {
      console.log(
        `  Progress: ${done}/${total} scraped, ${found} with active jobs`
      );
    },
  });

  const totalJobs = results.reduce((sum, r) => sum + r.jobCount, 0);
  console.log(
    `\nScraped ${results.length} companies with ${totalJobs} total jobs.\n`
  );

  // 3. Filter
  console.log("Step 3: Filtering for matching roles...");
  const matchingRows: {
    company: string;
    slug: string;
    job: RecruiteeJob;
  }[] = [];

  for (const companyJobs of results) {
    for (const job of companyJobs.jobs) {
      if (matchesAll(job)) {
        matchingRows.push({
          company: companyJobs.company,
          slug: companyJobs.slug,
          job,
        });
      }
    }
  }

  console.log(`Found ${matchingRows.length} matching jobs.\n`);

  // 4. Write CSV
  const headers =
    "company,slug,title,department,location,country,city,remote,employmentType,publishedAt,careersUrl";
  const csvLines = [
    headers,
    ...matchingRows.map((r) => jobToCSVRow(r.company, r.slug, r.job)),
  ];
  const csv = csvLines.join("\n");

  const outPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "results",
    "recruitee-jobs.csv"
  );
  writeFileSync(outPath, csv, "utf-8");
  console.log(`CSV saved to ${outPath}`);

  // 5. Summary
  console.log("\n=== Summary ===");
  console.log(`Total companies discovered: ${slugs.length}`);
  console.log(`Companies with active jobs: ${results.length}`);
  console.log(`Total jobs scraped:         ${totalJobs}`);
  console.log(`Matching jobs:              ${matchingRows.length}`);

  if (matchingRows.length > 0) {
    console.log("\n=== Top Matches ===");
    for (const r of matchingRows.slice(0, 30)) {
      const loc = r.job.remote
        ? "Remote"
        : [r.job.city, r.job.country].filter(Boolean).join(", ") ||
          r.job.location;
      console.log(`  ${r.company} — ${r.job.title} (${loc})`);
    }
    if (matchingRows.length > 30) {
      console.log(`  ... and ${matchingRows.length - 30} more`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
