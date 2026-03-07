import type { LeverJob, CompanyJobs, JobFilter } from "./types.js";

/**
 * Test if a single job matches a filter.
 */
function jobMatchesFilter(job: LeverJob, filter: JobFilter): boolean {
  if (filter.remote) {
    const isRemote =
      job.workplaceType === "remote" ||
      /remote/i.test(job.location) ||
      job.allLocations?.some((l) => /remote/i.test(l));
    if (!isRemote) return false;
  }

  if (filter.location) {
    const locationMatch =
      filter.location.test(job.location) ||
      job.allLocations?.some((l) => filter.location!.test(l));
    if (!locationMatch) return false;
  }

  if (filter.department) {
    const deptMatch =
      filter.department.test(job.department ?? "") ||
      filter.department.test(job.team ?? "");
    if (!deptMatch) return false;
  }

  if (filter.keyword) {
    const text = `${job.title} ${job.descriptionPlain ?? ""}`;
    if (!filter.keyword.test(text)) return false;
  }

  return true;
}

/**
 * Filter jobs within a single company result.
 * Returns null if no jobs match.
 */
export function filterCompanyJobs(
  company: CompanyJobs,
  filter: JobFilter
): CompanyJobs | null {
  const filtered = company.jobs.filter((j) => jobMatchesFilter(j, filter));
  if (filtered.length === 0) return null;

  return {
    ...company,
    jobs: filtered,
    jobCount: filtered.length,
  };
}

/**
 * Filter an array of company results. Removes companies with zero matching jobs.
 */
export function filterResults(
  results: CompanyJobs[],
  filter: JobFilter
): CompanyJobs[] {
  const out: CompanyJobs[] = [];

  for (const company of results) {
    const filtered = filterCompanyJobs(company, filter);
    if (filtered) out.push(filtered);
  }

  return out;
}

/**
 * Search across results with free text and optional structured filters.
 */
export function searchResults(
  results: CompanyJobs[],
  text?: string,
  filter?: JobFilter,
  limit?: number
): CompanyJobs[] {
  let filtered = results;

  // Apply structured filters first
  if (filter) {
    filtered = filterResults(filtered, filter);
  }

  // Apply free text search
  if (text) {
    const pattern = new RegExp(escapeRegex(text), "i");
    filtered = filterResults(filtered, { keyword: pattern });
  }

  // Apply limit (across total jobs)
  if (limit && limit > 0) {
    const out: CompanyJobs[] = [];
    let count = 0;
    for (const company of filtered) {
      if (count >= limit) break;
      const remaining = limit - count;
      if (company.jobs.length <= remaining) {
        out.push(company);
        count += company.jobs.length;
      } else {
        out.push({
          ...company,
          jobs: company.jobs.slice(0, remaining),
          jobCount: remaining,
        });
        count += remaining;
      }
    }
    return out;
  }

  return filtered;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
