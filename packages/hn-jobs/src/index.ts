export type { HNJob, HNThread, ScrapeOptions, FlatJob, HNJobFilter } from "./types.js";
export { parseComment, htmlToText } from "./parser.js";
export { filterJobs, searchJobs } from "./filters.js";

import type { HNJob, HNThread, ScrapeOptions } from "./types.js";
import { parseComment } from "./parser.js";

const HN_API = "https://hacker-news.firebaseio.com/v0";
const WHOISHIRING_USER = "whoishiring";

interface HNItem {
  id: number;
  type: string;
  title?: string;
  text?: string;
  time?: number;
  kids?: number[];
  parent?: number;
  deleted?: boolean;
  dead?: boolean;
}

/**
 * Fetch a single HN item.
 */
async function fetchItem(id: number): Promise<HNItem | null> {
  try {
    const res = await fetch(`${HN_API}/item/${id}.json`);
    if (!res.ok) return null;
    return (await res.json()) as HNItem;
  } catch {
    return null;
  }
}

/**
 * Find the most recent "Who is Hiring" threads.
 */
export async function findThreads(months = 2): Promise<HNThread[]> {
  const res = await fetch(`${HN_API}/user/${WHOISHIRING_USER}.json`);
  if (!res.ok) throw new Error(`Failed to fetch whoishiring user: ${res.status}`);

  const user = (await res.json()) as { submitted: number[] };
  const threads: HNThread[] = [];

  // Check submissions in order (most recent first)
  for (const id of user.submitted) {
    if (threads.length >= months) break;

    const item = await fetchItem(id);
    if (!item || item.type !== "story") continue;
    if (!item.title?.includes("Who is hiring")) continue;

    // Parse month from title like "Ask HN: Who is hiring? (March 2026)"
    const monthMatch = item.title.match(/\(([^)]+)\)/);
    const month = monthMatch?.[1] ?? "Unknown";

    threads.push({
      id: item.id,
      title: item.title,
      month,
      postedAt: item.time ? new Date(item.time * 1000).toISOString() : "",
      commentIds: item.kids ?? [],
      url: `https://news.ycombinator.com/item?id=${item.id}`,
    });
  }

  return threads;
}

/**
 * Scrape all jobs from recent "Who is Hiring" threads.
 */
export async function scrapeJobs(options?: ScrapeOptions): Promise<HNJob[]> {
  const months = options?.months ?? 2;
  const concurrency = options?.concurrency ?? 10;
  const onProgress = options?.onProgress;

  const threads = await findThreads(months);
  const allJobs: HNJob[] = [];

  for (const thread of threads) {
    const commentIds = thread.commentIds;
    const jobs: HNJob[] = [];
    let done = 0;

    // Fetch comments concurrently
    const queue = [...commentIds];

    async function worker(): Promise<void> {
      while (queue.length > 0) {
        const id = queue.shift();
        if (!id) break;

        const item = await fetchItem(id);
        done++;

        if (item && item.text && !item.deleted && !item.dead) {
          const postedAt = item.time ? new Date(item.time * 1000).toISOString() : "";
          const job = parseComment(item.id, item.text, postedAt, thread.month, thread.id);
          if (job) jobs.push(job);
        }

        if (done % 50 === 0 || done === commentIds.length) {
          onProgress?.(done, commentIds.length);
        }
      }
    }

    const workers = Array.from({ length: concurrency }, () => worker());
    await Promise.all(workers);

    allJobs.push(...jobs);
  }

  return allJobs;
}

/**
 * Format jobs as JSON.
 */
export function toJSON(jobs: HNJob[], pretty = true): string {
  return JSON.stringify(jobs, null, pretty ? 2 : undefined);
}

/**
 * Format jobs as CSV.
 */
export function toCSV(jobs: HNJob[]): string {
  const headers = [
    "company", "title", "location", "remote", "salary",
    "technologies", "url", "applyUrl", "postedAt",
    "threadMonth", "commentUrl", "description",
  ];

  const rows: string[] = [headers.join(",")];

  for (const job of jobs) {
    rows.push([
      csvQuote(job.company),
      csvQuote(job.title),
      csvQuote(job.location),
      String(job.isRemote),
      csvQuote(job.salary),
      csvQuote(job.technologies.join("; ")),
      job.url,
      job.applyUrl,
      job.postedAt.split("T")[0] ?? "",
      csvQuote(job.threadMonth),
      job.commentUrl,
      csvQuote(job.description.replace(/\n/g, " ").slice(0, 3000)),
    ].join(","));
  }

  return rows.join("\n");
}

function csvQuote(s: string): string {
  if (!s) return '""';
  return '"' + s.replace(/"/g, '""') + '"';
}

/**
 * Format jobs as a text table.
 */
export function toTable(jobs: HNJob[]): string {
  if (jobs.length === 0) return "No results found.";

  const columns: { key: keyof HNJob; label: string; maxW: number }[] = [
    { key: "company", label: "Company", maxW: 24 },
    { key: "title", label: "Title", maxW: 32 },
    { key: "location", label: "Location", maxW: 22 },
    { key: "isRemote", label: "Remote", maxW: 6 },
    { key: "salary", label: "Salary", maxW: 20 },
    { key: "threadMonth", label: "Thread", maxW: 12 },
  ];

  const header = columns.map((c) => c.label.padEnd(c.maxW)).join("  ");
  const separator = columns.map((c) => "-".repeat(c.maxW)).join("  ");
  const lines = [header, separator];

  for (const job of jobs) {
    const line = columns
      .map((c) => {
        let val = String(job[c.key] ?? "");
        if (c.key === "isRemote") val = job.isRemote ? "Yes" : "No";
        if (val.length > c.maxW) val = val.slice(0, c.maxW - 1) + "\u2026";
        return val.padEnd(c.maxW);
      })
      .join("  ");
    lines.push(line);
  }

  lines.push("");
  lines.push(`${jobs.length} jobs total`);
  return lines.join("\n");
}
