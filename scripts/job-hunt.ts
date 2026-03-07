#!/usr/bin/env tsx
/**
 * Cross-ATS job hunt script
 * Searches all 8 ATS scrapers for roles matching Doug's profile:
 * - Founding/Lead/Senior Full Stack / Product / Growth Engineer
 * - Europe or Remote
 * - Startups, early stage, creative/games/music/travel/B2C
 */

import { scrapeCompany as scrapeAshby } from "../packages/ashby-jobs/src/index.js";
import { scrapeCompany as scrapeGreenhouse } from "../packages/greenhouse-jobs/src/index.js";
import { scrapeCompany as scrapeLever } from "../packages/lever-jobs/src/index.js";
import { scrapeCompany as scrapeSmartRecruiters } from "../packages/smartrecruiters-jobs/src/index.js";
import { scrapeCompany as scrapeWorkable } from "../packages/workable-jobs/src/index.js";
import { scrapeCompany as scrapeRecruitee } from "../packages/recruitee-jobs/src/index.js";
import { scrapeCompany as scrapeBreezy } from "../packages/breezyhr-jobs/src/index.js";
import { scrapeCompany as scrapePersonio } from "../packages/personio-jobs/src/index.js";

// Keywords for title matching - generalist / leadership / product / growth roles
const TITLE_PATTERN = /founding|head.of.eng|lead.*eng|lead.*full|full.?stack|product.eng|growth.eng|staff.eng|principal|senior.*full|cto|vp.eng|eng.*lead|tech.*lead|senior.*software/i;

// Location pattern - Europe + Remote
const LOCATION_PATTERN = /remote|europe|germany|berlin|uk|london|france|paris|netherlands|amsterdam|spain|barcelona|prague|czech|austria|vienna|portugal|lisbon|sweden|stockholm|denmark|copenhagen|ireland|dublin|switzerland|zurich|poland|warsaw|italy|milan|norway|oslo|finland|helsinki|belgium|brussels/i;

// Companies to scrape per ATS - curated list of startups / creative / games / music / B2C
// These are companies known to use each ATS that might match Doug's interests

const TARGETS: Record<string, { scraper: (slug: string, opts?: any) => Promise<any>; slugs: string[] }> = {
  ashby: {
    scraper: (s) => scrapeAshby(s, { includeDescriptions: false }),
    slugs: [
      // Creative / Dev Tools / Music / Games / Travel / B2C startups on Ashby
      "linear", "notion", "ramp", "deel", "cursor", "vercel", "resend",
      "cal-com", "posthog", "dub", "raycast", "pitch", "liveblocks",
      "replit", "supabase", "clerk", "inngest", "axiom", "tinybird",
      "neon", "turso", "convex", "trigger-dev", "unkey", "highlight",
      "knock", "plane", "twenty", "documenso", "formbricks", "hoppscotch",
      "infisical", "langfuse", "latitude", "novu", "openbb", "papermark",
    ],
  },
  greenhouse: {
    scraper: (s) => scrapeGreenhouse(s, { includeContent: false }),
    slugs: [
      // Music / Games / Creative / Travel / B2C on Greenhouse
      "spotify", "soundcloud", "ableton", "splice", "bandcamp",
      "riotgames", "epicgames", "unity", "supercell", "mojang",
      "figma", "canva", "miro", "pitch", "framer",
      "airbnb", "booking", "tripadvisor", "skyscanner", "getaround",
      "duolingo", "headspace", "calm", "strava", "peloton",
      "notion", "airtable", "coda", "clickup", "linear",
      "photoroom", "deezer", "shazam",
    ],
  },
  lever: {
    scraper: (s) => scrapeLever(s, { includeDescriptions: false }),
    slugs: [
      // Startups on Lever
      "postman", "netlify", "sanity-io", "mux", "stream",
      "loom", "lattice", "gusto", "brex", "retool",
      "anduril", "faire", "webflow", "weights-and-biases",
      "grammarly", "zapier", "airtable", "dbt-labs",
    ],
  },
  smartrecruiters: {
    scraper: (s) => scrapeSmartRecruiters(s, { includeDescriptions: false }),
    slugs: [
      "Spotify", "Skyscanner", "DICE", "Ubisoft", "Gameloft",
      "Booking.com", "TripAdvisor", "SoundCloud",
    ],
  },
  workable: {
    scraper: (s) => scrapeWorkable(s, { includeDescriptions: false }),
    slugs: [
      "veed", "whereby", "toggl", "restream", "customer-io",
      "hotjar", "yousician", "taxfix", "pleo",
    ],
  },
  recruitee: {
    scraper: (s) => scrapeRecruitee(s, { includeDescriptions: false }),
    slugs: [
      "studytube", "sana-commerce", "effectory", "bynder",
      "lightspeedhq", "sendcloud", "mollie",
    ],
  },
  breezy: {
    scraper: (s) => scrapeBreezy(s),
    slugs: [
      "attentive", "hubstaff", "breezy",
    ],
  },
};

interface Match {
  ats: string;
  company: string;
  slug: string;
  title: string;
  location: string;
  department: string;
  isRemote: boolean;
  url: string;
  publishedAt: string;
}

async function scrapeATS(
  atsName: string,
  config: { scraper: (slug: string) => Promise<any>; slugs: string[] }
): Promise<Match[]> {
  const matches: Match[] = [];
  const errors: string[] = [];

  for (const slug of config.slugs) {
    try {
      const result = await config.scraper(slug);
      if (!result) continue;

      const jobs = result.jobs || [];
      for (const job of jobs) {
        const title = job.title || job.name || "";
        const location =
          job.location ||
          (job.location?.name) ||
          [job.city, job.state, job.country].filter(Boolean).join(", ") ||
          "";
        const dept = job.department || job.departments?.join(", ") || job.team || "";
        const isRemote = job.isRemote || job.remote || job.is_remote || job.location?.is_remote || false;
        const url = job.jobUrl || job.absoluteUrl || job.hostedUrl || job.careersUrl || job.url || "";
        const publishedAt = job.publishedAt || job.updatedAt || job.createdAt || job.published_date || job.releasedDate || "";

        // Match title pattern
        if (!TITLE_PATTERN.test(title)) continue;

        // Match location pattern OR remote
        const locationStr = typeof location === "string" ? location : location?.name || "";
        if (!isRemote && !LOCATION_PATTERN.test(locationStr) && !LOCATION_PATTERN.test(title)) continue;

        matches.push({
          ats: atsName,
          company: result.company || result.slug || slug,
          slug,
          title,
          location: locationStr,
          department: dept,
          isRemote,
          url,
          publishedAt: typeof publishedAt === "number" ? new Date(publishedAt).toISOString() : publishedAt,
        });
      }
    } catch (e: any) {
      errors.push(`${slug}: ${e.message?.slice(0, 60)}`);
    }
  }

  if (errors.length > 0) {
    console.error(`  [${atsName}] Errors: ${errors.length} (${errors.slice(0, 3).join("; ")})`);
  }

  return matches;
}

async function main() {
  console.log("🔍 Cross-ATS Job Hunt");
  console.log("Looking for: founding/lead/senior full-stack/product/growth engineer roles");
  console.log("Location: Europe or Remote");
  console.log("---\n");

  const allMatches: Match[] = [];

  for (const [atsName, config] of Object.entries(TARGETS)) {
    console.log(`Scraping ${atsName} (${config.slugs.length} companies)...`);
    const matches = await scrapeATS(atsName, config);
    console.log(`  → ${matches.length} matching roles found\n`);
    allMatches.push(...matches);
  }

  // Sort by publish date (newest first)
  allMatches.sort((a, b) => {
    const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return db - da;
  });

  // Output results
  console.log("=".repeat(120));
  console.log(`RESULTS: ${allMatches.length} matching roles across ${Object.keys(TARGETS).length} ATS platforms`);
  console.log("=".repeat(120));
  console.log("");

  // Group by company
  const byCompany = new Map<string, Match[]>();
  for (const m of allMatches) {
    const key = m.company;
    if (!byCompany.has(key)) byCompany.set(key, []);
    byCompany.get(key)!.push(m);
  }

  for (const [company, jobs] of byCompany) {
    console.log(`\n📍 ${company} (${jobs[0].ats}) — ${jobs.length} role(s)`);
    for (const j of jobs) {
      const remote = j.isRemote ? " 🌐" : "";
      const date = j.publishedAt ? j.publishedAt.split("T")[0] : "?";
      console.log(`   ${j.title}`);
      console.log(`   ${j.location}${remote} | ${j.department || "—"} | ${date}`);
      console.log(`   ${j.url}`);
      console.log("");
    }
  }

  // Save results as JSON
  const outPath = "scripts/job-hunt-results.json";
  const { writeFileSync } = await import("node:fs");
  writeFileSync(outPath, JSON.stringify(allMatches, null, 2));
  console.log(`\nResults saved to ${outPath}`);
}

main().catch(console.error);
