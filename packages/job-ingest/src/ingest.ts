import { DatabaseSync } from "node:sqlite";
import { writeFileSync } from "node:fs";
import type { UnifiedJob, IngestResult, Source } from "./types.js";
import { getAdapter, flattenCompanyJobs } from "./scraper-factory.js";

const SOURCES: Source[] = ["ashby", "greenhouse", "lever", "workable", "recruitee", "smartrecruiters", "breezyhr", "personio", "hn"];

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    source_id TEXT NOT NULL,
    company TEXT NOT NULL,
    company_slug TEXT NOT NULL,
    title TEXT NOT NULL,
    department TEXT DEFAULT '',
    location TEXT DEFAULT '',
    country TEXT DEFAULT '',
    region TEXT DEFAULT 'other',
    is_remote INTEGER NOT NULL DEFAULT 0,
    employment_type TEXT DEFAULT '',
    salary TEXT DEFAULT '',
    apply_url TEXT NOT NULL,
    job_url TEXT DEFAULT '',
    published_at TEXT DEFAULT '',
    scraped_at TEXT NOT NULL,
    tags TEXT DEFAULT '',
    description_snippet TEXT DEFAULT '',
    last_seen_at TEXT DEFAULT '',
    is_stale INTEGER NOT NULL DEFAULT 0,
    is_duplicate_of TEXT DEFAULT ''
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_source_sourceId ON jobs(source, source_id)`,
  `CREATE INDEX IF NOT EXISTS idx_region ON jobs(region)`,
  `CREATE INDEX IF NOT EXISTS idx_is_remote ON jobs(is_remote)`,
  `CREATE INDEX IF NOT EXISTS idx_published_at ON jobs(published_at)`,
  `CREATE INDEX IF NOT EXISTS idx_company_slug ON jobs(company_slug)`,
  `CREATE INDEX IF NOT EXISTS idx_source ON jobs(source)`,
];

// FTS5 is available on D1 but not in Node's built-in node:sqlite
// Try to create it, skip if not supported (search falls back to LIKE)
const FTS_STATEMENTS = [
  `CREATE VIRTUAL TABLE IF NOT EXISTS jobs_fts USING fts5(
    title, company, department, location, tags, description_snippet,
    content=jobs,
    content_rowid=rowid
  )`,
  `CREATE TRIGGER IF NOT EXISTS jobs_ai AFTER INSERT ON jobs BEGIN
    INSERT INTO jobs_fts(rowid, title, company, department, location, tags, description_snippet)
    VALUES (new.rowid, new.title, new.company, new.department, new.location, new.tags, new.description_snippet);
  END`,
  `CREATE TRIGGER IF NOT EXISTS jobs_ad AFTER DELETE ON jobs BEGIN
    INSERT INTO jobs_fts(jobs_fts, rowid, title, company, department, location, tags, description_snippet)
    VALUES ('delete', old.rowid, old.title, old.company, old.department, old.location, old.tags, old.description_snippet);
  END`,
  `CREATE TRIGGER IF NOT EXISTS jobs_au AFTER UPDATE ON jobs BEGIN
    INSERT INTO jobs_fts(jobs_fts, rowid, title, company, department, location, tags, description_snippet)
    VALUES ('delete', old.rowid, old.title, old.company, old.department, old.location, old.tags, old.description_snippet);
    INSERT INTO jobs_fts(rowid, title, company, department, location, tags, description_snippet)
    VALUES (new.rowid, new.title, new.company, new.department, new.location, new.tags, new.description_snippet);
  END`,
];

export function initDb(dbPath: string): DatabaseSync {
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");

  for (const stmt of SCHEMA_STATEMENTS) {
    db.exec(stmt);
  }

  // Migrate existing databases: add new columns if they don't exist
  const MIGRATIONS = [
    `ALTER TABLE jobs ADD COLUMN last_seen_at TEXT DEFAULT ''`,
    `ALTER TABLE jobs ADD COLUMN is_stale INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE jobs ADD COLUMN is_duplicate_of TEXT DEFAULT ''`,
  ];
  for (const stmt of MIGRATIONS) {
    try {
      db.exec(stmt);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes("duplicate column")) throw e;
    }
  }

  for (const stmt of FTS_STATEMENTS) {
    try {
      db.exec(stmt);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("no such module: fts5")) {
        // FTS5 not available in this SQLite build (e.g. node:sqlite)
        // Search will fall back to LIKE queries
        break;
      }
      if (!msg.includes("already exists")) throw e;
    }
  }

  return db;
}

export function upsertJobs(db: DatabaseSync, jobs: UnifiedJob[]): { inserted: number; updated: number } {
  const upsert = db.prepare(`
    INSERT INTO jobs (id, source, source_id, company, company_slug, title, department, location, country, region, is_remote, employment_type, salary, apply_url, job_url, published_at, scraped_at, tags, description_snippet, last_seen_at, is_stale)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    ON CONFLICT(source, source_id) DO UPDATE SET
      company = excluded.company,
      company_slug = excluded.company_slug,
      title = excluded.title,
      department = excluded.department,
      location = excluded.location,
      country = excluded.country,
      region = excluded.region,
      is_remote = excluded.is_remote,
      employment_type = excluded.employment_type,
      salary = excluded.salary,
      apply_url = excluded.apply_url,
      job_url = excluded.job_url,
      published_at = excluded.published_at,
      scraped_at = excluded.scraped_at,
      tags = excluded.tags,
      description_snippet = excluded.description_snippet,
      last_seen_at = excluded.last_seen_at,
      is_stale = 0
  `);

  let inserted = 0;
  const now = new Date().toISOString();

  for (const job of jobs) {
    const result = upsert.run(
      job.id,
      job.source,
      job.sourceId,
      job.company,
      job.companySlug,
      job.title,
      job.department,
      job.location,
      job.country,
      job.region,
      job.isRemote ? 1 : 0,
      job.employmentType,
      job.salary,
      job.applyUrl,
      job.jobUrl,
      job.publishedAt,
      job.scrapedAt,
      job.tags,
      job.descriptionSnippet,
      job.lastSeenAt || now,
    );
    if (result.changes > 0) {
      inserted++;
    }
  }

  return { inserted, updated: 0 };
}

export async function ingestSource(
  source: Source,
  options: { concurrency?: number; quiet?: boolean } = {}
): Promise<UnifiedJob[]> {
  const adapter = await getAdapter(source);

  if (!options.quiet) console.log(`  [${source}] Discovering companies...`);
  const slugs = await adapter.discoverSlugs({ quiet: !!(options.quiet) });
  if (!options.quiet) console.log(`  [${source}] Found ${slugs.length} slugs`);

  if (slugs.length === 0 && source !== "hn") return [];

  if (!options.quiet) console.log(`  [${source}] Scraping jobs...`);
  const companies = await adapter.scrapeAll(slugs, { concurrency: options.concurrency ?? 10 });
  const rawJobs = source === "hn" ? companies[0]?.jobs ?? [] : flattenCompanyJobs(companies);

  if (!options.quiet) console.log(`  [${source}] Normalizing ${rawJobs.length} jobs...`);
  return adapter.normalize(rawJobs as Record<string, unknown>[]);
}

/**
 * Mark jobs as stale if they haven't been seen for `thresholdHours` hours.
 * Called after each source ingest completes.
 */
export function markStaleJobs(db: DatabaseSync, source: Source, thresholdHours = 48): number {
  const cutoff = new Date(Date.now() - thresholdHours * 60 * 60 * 1000).toISOString();
  const result = db.prepare(
    `UPDATE jobs SET is_stale = 1
     WHERE source = ? AND last_seen_at != '' AND last_seen_at < ? AND is_stale = 0`
  ).run(source, cutoff);
  return Number(result.changes);
}

/**
 * Delete jobs that are stale and haven't been seen for `days` days.
 */
export function pruneStaleJobs(db: DatabaseSync, days = 14): number {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const result = db.prepare(
    `DELETE FROM jobs WHERE is_stale = 1 AND last_seen_at != '' AND last_seen_at < ?`
  ).run(cutoff);
  return Number(result.changes);
}

export async function ingestAll(
  dbPath: string,
  options: { sources?: Source[]; concurrency?: number; quiet?: boolean } = {}
): Promise<IngestResult> {
  const start = Date.now();
  const sources = options.sources ?? SOURCES;
  const db = initDb(dbPath);

  let totalJobs = 0;
  let totalInserted = 0;
  let totalErrors = 0;
  const bySource: Record<string, number> = {};

  for (const source of sources) {
    try {
      if (!options.quiet) console.log(`\n[${source}] Starting...`);
      const jobs = await ingestSource(source, options);

      if (jobs.length > 0) {
        const { inserted } = upsertJobs(db, jobs);
        totalJobs += jobs.length;
        totalInserted += inserted;
        bySource[source] = jobs.length;
        if (!options.quiet) console.log(`[${source}] Done: ${jobs.length} jobs ingested`);
      } else {
        bySource[source] = 0;
        if (!options.quiet) console.log(`[${source}] Done: No jobs found`);
      }

      // Mark jobs not seen in this run as potentially stale
      const staleCount = markStaleJobs(db, source);
      if (staleCount > 0 && !options.quiet) {
        console.log(`[${source}] Marked ${staleCount} jobs as stale`);
      }
    } catch (e: unknown) {
      totalErrors++;
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[${source}] Error: ${msg}`);
      bySource[source] = 0;
    }
  }

  db.close();

  return {
    total: totalJobs,
    inserted: totalInserted,
    updated: 0,
    errors: totalErrors,
    bySource,
    duration: Date.now() - start,
  };
}

const COLUMNS = [
  "id", "source", "source_id", "company", "company_slug", "title",
  "department", "location", "country", "region", "is_remote",
  "employment_type", "salary", "apply_url", "job_url",
  "published_at", "scraped_at", "tags", "description_snippet",
  "last_seen_at", "is_stale", "is_duplicate_of",
] as const;

function escapeSQL(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

export function exportUpsertSQL(dbPath: string, outputPath: string, source?: string): void {
  const db = new DatabaseSync(dbPath);
  const BATCH_SIZE = 50;

  const query = source
    ? `SELECT ${COLUMNS.join(", ")} FROM jobs WHERE source = ?`
    : `SELECT ${COLUMNS.join(", ")} FROM jobs`;

  const rows = source
    ? db.prepare(query).all(source) as Record<string, unknown>[]
    : db.prepare(query).all() as Record<string, unknown>[];

  db.close();

  const lines: string[] = [];

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const valueGroups = batch.map((row) => {
      const values = COLUMNS.map((col) => escapeSQL(row[col]));
      return `(${values.join(", ")})`;
    });

    lines.push(
      `INSERT OR REPLACE INTO jobs (${COLUMNS.join(", ")}) VALUES\n${valueGroups.join(",\n")};\n`
    );
  }

  writeFileSync(outputPath, lines.join("\n"), "utf-8");
  console.log(`Exported ${rows.length} rows to ${outputPath} (${lines.length} batch statements)`);
}
