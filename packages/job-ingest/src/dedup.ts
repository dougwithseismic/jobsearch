import { DatabaseSync } from "node:sqlite";
import { slugify } from "./utils.js";

interface JobRow {
  id: string;
  source: string;
  company: string;
  title: string;
  location: string;
  salary: string;
  description_snippet: string;
  scraped_at: string;
  is_duplicate_of: string;
}

/**
 * Build a dedup key from company + title + location.
 */
function dedupKey(company: string, title: string, location: string): string {
  return `${slugify(company)}|${slugify(title)}|${slugify(location)}`;
}

/**
 * Score a job row for "completeness" — more non-empty fields = higher score.
 */
function completenessScore(row: JobRow): number {
  let score = 0;
  if (row.salary) score += 2;
  if (row.description_snippet) score += 1;
  if (row.location) score += 1;
  return score;
}

/**
 * Find and mark duplicate jobs across different sources.
 *
 * When duplicates are found (same slugify(company) + slugify(title) + slugify(location)),
 * the "inferior" duplicate gets its `is_duplicate_of` column set to the kept job's ID.
 *
 * Kept job is chosen by:
 *   1. More complete data (non-empty salary, description, etc.)
 *   2. More recent scraped_at
 *
 * Only considers jobs that are not already marked as duplicates.
 */
export function deduplicateJobs(db: DatabaseSync): { merged: number } {
  const rows = db
    .prepare(
      `SELECT id, source, company, title, location, salary, description_snippet, scraped_at, is_duplicate_of
       FROM jobs
       WHERE is_duplicate_of = ''`
    )
    .all() as unknown as JobRow[];

  // Group by dedup key
  const groups = new Map<string, JobRow[]>();
  for (const row of rows) {
    const key = dedupKey(row.company, row.title, row.location);
    const group = groups.get(key);
    if (group) {
      group.push(row);
    } else {
      groups.set(key, [row]);
    }
  }

  const markDup = db.prepare(`UPDATE jobs SET is_duplicate_of = ? WHERE id = ?`);
  let merged = 0;

  for (const [, group] of groups) {
    if (group.length < 2) continue;

    // Sort: best candidate first (highest completeness, then most recent scraped_at)
    group.sort((a, b) => {
      const scoreDiff = completenessScore(b) - completenessScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      return b.scraped_at.localeCompare(a.scraped_at);
    });

    const keeper = group[0]!;
    for (let i = 1; i < group.length; i++) {
      // Only mark as duplicate if they come from different sources
      if (group[i]!.source !== keeper.source) {
        markDup.run(keeper.id, group[i]!.id);
        merged++;
      }
    }
  }

  return { merged };
}
