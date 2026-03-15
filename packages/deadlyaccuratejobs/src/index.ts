/**
 * deadlyaccuratejobs — one-stop shop for job search across all ATS platforms.
 *
 * "Give me all jobs for Stripe" and it just works.
 */

export { getJobs, getJobsDirect } from "./orchestrator.js";
export { resolveCompany, buildIndex, getStats, clearCache } from "./resolver.js";
export { filterJobs } from "./filters.js";
export type {
  UnifiedJob,
  Source,
  SlugSource,
  CompanyMatch,
  SearchOptions,
  SearchResult,
  PlatformStats,
  Stats,
} from "./types.js";
export { SLUG_SOURCES } from "./types.js";
