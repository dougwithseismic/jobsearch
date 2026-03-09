#!/usr/bin/env node
/**
 * Seed local D1 database from ingest SQLite output.
 * Usage: node scripts/seed-local-d1.mjs [path-to-sqlite-db]
 */
import { readFileSync } from "fs";
import { execSync } from "child_process";
import { DatabaseSync } from "node:sqlite";

const dbPath = process.argv[2] || "/tmp/jobboard-test.db";
const db = new DatabaseSync(dbPath);
const rows = db.prepare("SELECT * FROM jobs").all();
db.close();

console.log(`Found ${rows.length} jobs in ${dbPath}`);

// Insert in batches of 50 via wrangler d1 execute
const BATCH = 50;
let inserted = 0;

for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const values = batch.map((r) => {
    const escape = (v) => (v == null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
    return `(${escape(r.id)}, ${escape(r.source)}, ${escape(r.source_id)}, ${escape(r.company)}, ${escape(r.company_slug)}, ${escape(r.title)}, ${escape(r.department)}, ${escape(r.location)}, ${escape(r.country)}, ${escape(r.region)}, ${r.is_remote}, ${escape(r.employment_type)}, ${escape(r.salary)}, ${escape(r.apply_url)}, ${escape(r.job_url)}, ${escape(r.published_at)}, ${escape(r.scraped_at)}, ${escape(r.tags)}, ${escape(r.description_snippet)})`;
  }).join(",\n");

  const sql = `INSERT OR REPLACE INTO jobs (id, source, source_id, company, company_slug, title, department, location, country, region, is_remote, employment_type, salary, apply_url, job_url, published_at, scraped_at, tags, description_snippet) VALUES ${values}`;

  try {
    execSync(`npx wrangler d1 execute job-board --local --command "${sql.replace(/"/g, '\\"')}"`, {
      cwd: process.cwd() + "/apps/board",
      stdio: "pipe",
    });
    inserted += batch.length;
    process.stdout.write(`\rInserted ${inserted}/${rows.length}`);
  } catch (e) {
    console.error(`\nBatch ${i}-${i + BATCH} failed:`, e.message?.slice(0, 200));
  }
}

console.log(`\nDone! ${inserted} jobs seeded into local D1.`);
