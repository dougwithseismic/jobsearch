import type { HNJob, HNJobFilter } from "./types.js";

/**
 * Test if a single job matches a filter.
 */
function jobMatchesFilter(job: HNJob, filter: HNJobFilter): boolean {
  if (filter.remote && !job.isRemote) {
    return false;
  }

  if (filter.location) {
    const locationMatch =
      filter.location.test(job.location) ||
      filter.location.test(job.description);
    if (!locationMatch) return false;
  }

  if (filter.keyword) {
    const text = `${job.company} ${job.title} ${job.description}`;
    if (!filter.keyword.test(text)) return false;
  }

  if (filter.technology) {
    const techList = job.technologies.join(" ");
    const text = `${techList} ${job.description}`;
    if (!filter.technology.test(text)) return false;
  }

  return true;
}

/**
 * Filter jobs by structured filter criteria.
 */
export function filterJobs(jobs: HNJob[], filter: HNJobFilter): HNJob[] {
  return jobs.filter((j) => jobMatchesFilter(j, filter));
}

/**
 * Search jobs with free text and optional structured filters.
 */
export function searchJobs(
  jobs: HNJob[],
  text?: string,
  filter?: HNJobFilter,
  limit?: number
): HNJob[] {
  let filtered = jobs;

  // Apply structured filters first
  if (filter) {
    filtered = filterJobs(filtered, filter);
  }

  // Apply free text search
  if (text) {
    const pattern = new RegExp(escapeRegex(text), "i");
    filtered = filterJobs(filtered, { keyword: pattern });
  }

  // Apply limit
  if (limit && limit > 0) {
    filtered = filtered.slice(0, limit);
  }

  return filtered;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
