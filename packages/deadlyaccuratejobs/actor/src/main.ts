/**
 * deadlyaccuratejobs Apify Actor
 *
 * Modes:
 *   - "search"   — Search for a company by name, scrape from all matching ATSes
 *   - "resolve"  — Just resolve company → ATS matches (no scraping)
 *   - "stats"    — Get platform slug counts
 */

import { Actor, log } from "apify";
import { getJobs, resolveCompany, getStats, getJobsDirect } from "@jobsearch/deadlyaccuratejobs";
import type { SlugSource } from "@jobsearch/deadlyaccuratejobs";

interface Input {
  mode: "search" | "resolve" | "stats" | "direct";
  /** Company name to search for (mode: search, resolve) */
  company?: string;
  /** Direct slug + ATS (mode: direct) */
  slug?: string;
  ats?: SlugSource;
  /** Filters (mode: search, direct) */
  remoteOnly?: boolean;
  locationFilter?: string;
  keywordFilter?: string;
  departmentFilter?: string;
  seniorityFilter?: string; // comma-separated
  sinceFilter?: string;
  limit?: number;
  /** Slug API URL override */
  slugApiUrl?: string;
}

await Actor.init();

const input = (await Actor.getInput<Input>()) ?? ({} as Input);
const mode = input.mode ?? "search";

try {
  if (mode === "stats") {
    log.info("Getting platform stats...");
    const stats = await getStats({ apiUrl: input.slugApiUrl });
    await Actor.pushData(stats);
    log.info(`Done. ${stats.totalSlugs} total slugs across ${stats.platforms.length} platforms.`);
  } else if (mode === "resolve") {
    if (!input.company) throw new Error("company is required for resolve mode");
    log.info(`Resolving "${input.company}"...`);
    const matches = await resolveCompany(input.company, { apiUrl: input.slugApiUrl });
    await Actor.pushData({ company: input.company, matches });
    log.info(`Found ${matches.length} match(es).`);
  } else if (mode === "direct") {
    if (!input.slug || !input.ats) throw new Error("slug and ats are required for direct mode");
    log.info(`Direct scrape: ${input.ats}/${input.slug}...`);
    const result = await getJobsDirect(input.slug, input.ats, {
      remote: input.remoteOnly,
      location: input.locationFilter,
      keyword: input.keywordFilter,
      department: input.departmentFilter,
      seniority: input.seniorityFilter?.split(","),
      since: input.sinceFilter,
      limit: input.limit,
    });
    await Actor.pushData(result.jobs);
    log.info(`Done. ${result.totalJobs} total, ${result.jobs.length} after filters. ${(result.duration / 1000).toFixed(1)}s`);
  } else {
    // search mode (default)
    if (!input.company) throw new Error("company is required for search mode");
    log.info(`Searching for "${input.company}"...`);
    const result = await getJobs(input.company, {
      remote: input.remoteOnly,
      location: input.locationFilter,
      keyword: input.keywordFilter,
      department: input.departmentFilter,
      seniority: input.seniorityFilter?.split(","),
      since: input.sinceFilter,
      limit: input.limit,
      apiUrl: input.slugApiUrl,
    });

    if (result.matches.length === 0) {
      log.warning(`No ATS match found for "${input.company}".`);
      await Actor.pushData({ company: input.company, matches: [], jobs: [] });
    } else {
      log.info(`Resolved on: ${result.matches.map((m) => `${m.ats}/${m.slug}`).join(", ")}`);
      log.info(`${result.totalJobs} total jobs, ${result.jobs.length} after filters.`);
      await Actor.pushData(result.jobs);
    }

    log.info(`Completed in ${(result.duration / 1000).toFixed(1)}s`);
  }
} catch (error) {
  log.error(`Failed: ${error instanceof Error ? error.message : String(error)}`);
  throw error;
}

await Actor.exit();
