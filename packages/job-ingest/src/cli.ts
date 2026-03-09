#!/usr/bin/env tsx
import { ingestAll, initDb, exportUpsertSQL, pruneStaleJobs } from "./ingest.js";
import { deduplicateJobs } from "./dedup.js";
import type { Source } from "./types.js";
import { resolve } from "path";

const args = process.argv.slice(2);

const DB_PATH = process.env.DB_PATH || resolve(process.cwd(), "../../apps/board/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/db.sqlite");

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Usage: tsx src/cli.ts [options]

Options:
  --all                    Ingest from all 9 sources
  --source <name>          Ingest from a single source (ashby, greenhouse, lever, etc.)
  --db <path>              Path to SQLite database (default: apps/board local D1)
  --quiet                  Suppress progress output
  --stats                  Show database stats
  --export-sql <path>      Export DB as INSERT OR REPLACE SQL to file
  --dedup                  Run cross-source deduplication after ingest
  --prune-stale            Delete stale jobs older than 14 days
  --help                   Show this help
`);
  process.exit(0);
}

async function main() {
  const quiet = args.includes("--quiet") || args.includes("-q");
  const dbIdx = args.indexOf("--db");
  const dbPath = dbIdx >= 0 && args[dbIdx + 1] ? args[dbIdx + 1]! : DB_PATH;

  if (args.includes("--stats")) {
    const db = initDb(dbPath);
    const stats = db.prepare("SELECT source, count(*) as count FROM jobs GROUP BY source").all();
    const total = db.prepare("SELECT count(*) as count FROM jobs").get() as { count: number };
    const companies = db.prepare("SELECT count(distinct company_slug) as count FROM jobs").get() as { count: number };
    console.log(`Total jobs: ${total.count}`);
    console.log(`Total companies: ${companies.count}`);
    console.log("By source:");
    for (const row of stats as { source: string; count: number }[]) {
      console.log(`  ${row.source}: ${row.count}`);
    }
    db.close();
  }

  const exportSqlIdx = args.indexOf("--export-sql");
  if (exportSqlIdx >= 0) {
    const outputPath = args[exportSqlIdx + 1];
    if (!outputPath) {
      console.error("Error: --export-sql requires an output file path");
      process.exit(1);
    }
    const sourceIdx = args.indexOf("--source");
    const sourceFilter = sourceIdx >= 0 && args[sourceIdx + 1] ? args[sourceIdx + 1] : undefined;
    exportUpsertSQL(dbPath, outputPath, sourceFilter);
    return;
  }

  if (args.includes("--stats")) return;

  const sourceIdx = args.indexOf("--source");
  const sources = sourceIdx >= 0 && args[sourceIdx + 1] ? [args[sourceIdx + 1] as Source] : undefined;

  // Handle --prune-stale standalone
  if (args.includes("--prune-stale")) {
    const db = initDb(dbPath);
    const pruned = pruneStaleJobs(db);
    console.log(`Pruned ${pruned} stale jobs (older than 14 days)`);
    db.close();
    if (!args.includes("--all") && !sources) return;
  }

  // Handle --dedup standalone
  if (args.includes("--dedup") && !args.includes("--all") && !sources) {
    const db = initDb(dbPath);
    const { merged } = deduplicateJobs(db);
    console.log(`Deduplication complete: ${merged} duplicates marked`);
    db.close();
    return;
  }

  if (!sources && !args.includes("--all")) {
    console.error("Error: specify --all or --source <name>");
    process.exit(1);
  }

  console.log(`Ingesting ${sources ? sources.join(", ") : "all sources"}...`);
  console.log(`Database: ${dbPath}`);

  const result = await ingestAll(dbPath, { sources, quiet });

  console.log(`\n=== Ingest Complete ===`);
  console.log(`Total: ${result.total} jobs`);
  console.log(`Inserted/Updated: ${result.inserted}`);
  console.log(`Errors: ${result.errors}`);
  console.log(`Duration: ${(result.duration / 1000).toFixed(1)}s`);
  console.log("By source:");
  for (const [source, count] of Object.entries(result.bySource)) {
    console.log(`  ${source}: ${count}`);
  }

  // Run dedup after ingest if requested
  if (args.includes("--dedup")) {
    const db = initDb(dbPath);
    const { merged } = deduplicateJobs(db);
    console.log(`\nDeduplication: ${merged} duplicates marked`);
    db.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
