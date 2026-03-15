#!/usr/bin/env node
/**
 * SearXNG-based company discovery for all ATS platforms.
 * Runs search queries like `site:boards.greenhouse.io` to find company slugs.
 * Saves discovered slugs to per-platform text files that scrapers can consume.
 *
 * Usage:
 *   npx tsx packages/job-ingest/discover.ts [--platform greenhouse] [--max-queries 10] [--searxng-url http://localhost:8888]
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const SEARXNG_URL = process.env.SEARXNG_URL || "http://localhost:8888";
const REQUEST_DELAY_MS = 1200;

interface PlatformConfig {
  domains: string[];
  pattern: RegExp;
  outputFile: string;
}

const PLATFORMS: Record<string, PlatformConfig> = {
  greenhouse: {
    domains: ["boards.greenhouse.io", "job-boards.greenhouse.io"],
    pattern: /https?:\/\/(?:job-boards|boards)\.greenhouse\.io\/([^/?#]+)/,
    outputFile: "greenhouse-slugs.txt",
  },
  lever: {
    domains: ["jobs.lever.co"],
    pattern: /https?:\/\/jobs\.lever\.co\/([^/?#]+)/,
    outputFile: "lever-slugs.txt",
  },
  ashby: {
    domains: ["jobs.ashbyhq.com"],
    pattern: /https?:\/\/jobs\.ashbyhq\.com\/([^/?#]+)/,
    outputFile: "ashby-slugs.txt",
  },
  workable: {
    domains: ["apply.workable.com"],
    pattern: /https?:\/\/apply\.workable\.com\/([^/?#]+)/,
    outputFile: "workable-slugs.txt",
  },
  smartrecruiters: {
    domains: ["careers.smartrecruiters.com", "jobs.smartrecruiters.com"],
    pattern: /https?:\/\/(?:careers|jobs)\.smartrecruiters\.com\/([^/?#]+)/,
    outputFile: "smartrecruiters-slugs.txt",
  },
  breezyhr: {
    domains: ["breezy.hr"],
    pattern: /https?:\/\/([^.]+)\.breezy\.hr/,
    outputFile: "breezyhr-slugs.txt",
  },
  personio: {
    domains: ["jobs.personio.de"],
    pattern: /https?:\/\/([^.]+)\.jobs\.personio\.de/,
    outputFile: "personio-slugs.txt",
  },
  recruitee: {
    domains: ["recruitee.com"],
    pattern: /https?:\/\/([^.]+)\.recruitee\.com/,
    outputFile: "recruitee-slugs.txt",
  },
};

// Slugs to always exclude (non-company paths)
const GLOBAL_BLOCKLIST = new Set([
  "www", "app", "api", "help", "support", "blog", "docs", "status",
  "mail", "cdn", "static", "embed", "v1", "internal", "favicon.ico",
  "robots.txt", "sitemap.xml", "sitemap", "css", "js", "images",
  "assets", "j", "general", "headquarters", "careers", "admin",
  "login", "auth", "sso", "dashboard", "console", "portal",
  "staging", "dev", "test", "demo", "sandbox", "preview",
]);

const SEARCH_STRATEGIES: ((domain: string) => string)[] = [
  (d) => `site:${d}`,
  (d) => `site:${d} careers`,
  (d) => `site:${d} jobs`,
  (d) => `site:${d} hiring`,
  (d) => `site:${d} software engineer`,
  (d) => `site:${d} product manager`,
  (d) => `site:${d} data scientist`,
  (d) => `site:${d} designer`,
  (d) => `site:${d} remote`,
  (d) => `site:${d} "Europe"`,
  (d) => `site:${d} "Berlin"`,
  (d) => `site:${d} "London"`,
  (d) => `site:${d} "New York"`,
  (d) => `site:${d} "San Francisco"`,
  (d) => `site:${d} "Amsterdam"`,
  (d) => `site:${d} "Paris"`,
  (d) => `site:${d} "Stockholm"`,
  (d) => `site:${d} "Prague"`,
  (d) => `site:${d} "Toronto"`,
  (d) => `site:${d} "Singapore"`,
  (d) => `site:${d} "Tokyo"`,
  (d) => `site:${d} "Sydney"`,
  (d) => `site:${d} startup`,
  (d) => `site:${d} "Y Combinator"`,
  (d) => `site:${d} series A OR series B`,
  (d) => `site:${d} engineering`,
  (d) => `site:${d} sales`,
  (d) => `site:${d} marketing`,
  (d) => `site:${d} fintech`,
  (d) => `site:${d} ai engineer`,
];

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

interface SearXNGResult {
  url: string;
  title?: string;
}

async function searchSearXNG(
  query: string,
  page = 1
): Promise<SearXNGResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    pageno: String(page),
    language: "en",
    safesearch: "0",
  });

  try {
    const res = await fetch(`${SEARXNG_URL}/search?${params}`, {
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      if (res.status === 429) {
        console.log(`    Rate limited, waiting 5s...`);
        await sleep(5000);
        return searchSearXNG(query, page);
      }
      return [];
    }
    const data = (await res.json()) as { results?: SearXNGResult[] };
    return data.results ?? [];
  } catch {
    return [];
  }
}

function extractSlugs(
  results: SearXNGResult[],
  config: PlatformConfig
): Set<string> {
  const slugs = new Set<string>();
  for (const r of results) {
    const url = r.url ?? "";
    if (!config.domains.some((d) => url.includes(d))) continue;
    const match = url.match(config.pattern);
    if (match?.[1]) {
      const slug = decodeURIComponent(match[1]).toLowerCase();
      if (!GLOBAL_BLOCKLIST.has(slug) && slug.length >= 2 && slug.length <= 80 && !slug.includes(".")) {
        slugs.add(slug);
      }
    }
  }
  return slugs;
}

function loadExistingSlugs(filePath: string): Set<string> {
  if (!existsSync(filePath)) return new Set();
  const content = readFileSync(filePath, "utf-8");
  return new Set(
    content.split("\n").map((s) => s.trim()).filter(Boolean)
  );
}

function saveSlugs(filePath: string, slugs: Set<string>): void {
  mkdirSync(dirname(filePath), { recursive: true });
  const sorted = [...slugs].sort((a, b) => a.localeCompare(b));
  writeFileSync(filePath, sorted.join("\n") + "\n");
}

async function discoverPlatform(
  name: string,
  config: PlatformConfig,
  maxQueries: number,
  pagesPerQuery: number
): Promise<void> {
  const outputPath = join(
    import.meta.dirname ?? ".",
    "discovered",
    config.outputFile
  );

  const existing = loadExistingSlugs(outputPath);
  const allSlugs = new Set(existing);
  const startCount = allSlugs.size;

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${name.toUpperCase()} — discovering via SearXNG`);
  console.log(`  Existing: ${startCount} slugs`);
  console.log(`${"=".repeat(60)}`);

  const strategies = SEARCH_STRATEGIES.slice(0, maxQueries);
  let queriesRun = 0;

  for (const strategy of strategies) {
    for (const domain of config.domains) {
      const query = strategy(domain);
      queriesRun++;
      process.stdout.write(`  [${queriesRun}] ${query}`);

      let queryNewCount = 0;

      for (let page = 1; page <= pagesPerQuery; page++) {
        const results = await searchSearXNG(query, page);
        if (results.length === 0) break;

        const pageSlugs = extractSlugs(results, config);
        let newInPage = 0;
        for (const s of pageSlugs) {
          if (!allSlugs.has(s)) {
            allSlugs.add(s);
            newInPage++;
            queryNewCount++;
          }
        }

        if (newInPage === 0 && page > 1) break;
        await sleep(REQUEST_DELAY_MS);
      }

      console.log(` → +${queryNewCount} (total: ${allSlugs.size})`);
      await sleep(REQUEST_DELAY_MS);
    }
  }

  saveSlugs(outputPath, allSlugs);
  const newCount = allSlugs.size - startCount;
  console.log(`  Done: ${allSlugs.size} total (+${newCount} new) → ${outputPath}`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const platformFlag = args.indexOf("--platform");
  const maxQueriesFlag = args.indexOf("--max-queries");
  const pagesFlag = args.indexOf("--pages");
  const urlFlag = args.indexOf("--searxng-url");

  const targetPlatform = platformFlag >= 0 ? args[platformFlag + 1] : "all";
  const maxQueries = maxQueriesFlag >= 0 ? parseInt(args[maxQueriesFlag + 1]!, 10) : 30;
  const pagesPerQuery = pagesFlag >= 0 ? parseInt(args[pagesFlag + 1]!, 10) : 5;
  if (urlFlag >= 0) {
    // override is handled via env or this flag
    process.env.SEARXNG_URL = args[urlFlag + 1];
  }

  // Test SearXNG connection
  console.log(`Testing SearXNG at ${SEARXNG_URL}...`);
  const testResults = await searchSearXNG("test");
  if (testResults.length === 0) {
    console.error("Failed to connect to SearXNG. Make sure it's running:");
    console.error("  docker run -d --name searxng -p 8888:8080 searxng/searxng");
    process.exit(1);
  }
  console.log(`Connected — ${testResults.length} test results.`);

  const platforms = targetPlatform === "all"
    ? Object.entries(PLATFORMS)
    : [[targetPlatform, PLATFORMS[targetPlatform]!] as [string, PlatformConfig]];

  for (const [name, config] of platforms) {
    if (!config) {
      console.error(`Unknown platform: ${name}`);
      continue;
    }
    await discoverPlatform(name, config, maxQueries, pagesPerQuery);
    await sleep(2000);
  }

  console.log("\nDiscovery complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
