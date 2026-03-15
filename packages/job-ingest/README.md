# @jobsearch/job-ingest - Unified Ingest Pipeline

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-23-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers%20%2B%20KV-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)

The central pipeline that scrapes 9 ATS platforms, normalizes every job into a unified schema, deduplicates across sources, and loads into SQLite/D1.

```bash
pnpm --filter=@jobsearch/job-ingest ingest
# [ashby] Starting...
# [ashby] Found 412 slugs
# [ashby] Scraping jobs...
# [ashby] Normalizing 1,847 jobs...
# [ashby] Done: 1,847 jobs ingested
# ...
# === Ingest Complete ===
# Total: 12,493 jobs | Duration: 84.2s
```

## How it works

```
                        ┌──────────────────────────────────┐
                        │         CLI (src/cli.ts)         │
                        │  --all  --source  --dedup  etc.  │
                        └──────────────┬───────────────────┘
                                       │
                        ┌──────────────▼───────────────────┐
                        │     Scraper Factory               │
                        │     (src/scraper-factory.ts)      │
                        │                                   │
                        │  getAdapter("greenhouse")         │
                        │    → discoverSlugs()              │
                        │    → scrapeAll(slugs)             │
                        │    → normalize(rawJobs)           │
                        └──────────────┬───────────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              │                        │                        │
    ┌─────────▼─────────┐   ┌─────────▼─────────┐   ┌─────────▼─────────┐
    │  Normalizer:       │   │  Normalizer:       │   │  Normalizer:       │
    │  greenhouse.ts     │   │  lever.ts          │   │  ... (9 total)     │
    │                    │   │                    │   │                    │
    │  Raw ATS JSON →    │   │  Raw ATS JSON →    │   │  Raw ATS JSON →    │
    │  UnifiedJob[]      │   │  UnifiedJob[]      │   │  UnifiedJob[]      │
    └─────────┬──────────┘   └─────────┬──────────┘   └─────────┬──────────┘
              │                        │                        │
              └────────────────────────┼────────────────────────┘
                                       │
                        ┌──────────────▼───────────────────┐
                        │     SQLite (node:sqlite)          │
                        │     UPSERT + staleness tracking   │
                        │     FTS5 full-text search (D1)    │
                        └──────────────┬───────────────────┘
                                       │
                        ┌──────────────▼───────────────────┐
                        │     Export → D1                    │
                        │     --export-sql dump.sql          │
                        │     INSERT OR REPLACE batches      │
                        └──────────────────────────────────┘
```

## Supported platforms

| ATS | Adapter | Slug Source | Content Flag |
|-----|---------|-------------|--------------|
| Greenhouse | slug-based | KV / `discoverSlugs()` | `includeContent` |
| Lever | slug-based | KV / `discoverSlugs()` | `includeDescriptions` |
| Ashby | slug-based | KV / `discoverSlugs()` | `includeDescriptions` |
| Workable | slug-based | KV / `discoverSlugs()` | `includeDescriptions` |
| SmartRecruiters | slug-based | KV / `discoverSlugs()` | `includeDescriptions` |
| BreezyHR | slug-based | KV / `discoverSlugs()` | none |
| Personio | slug-based | KV / `discoverSlugs()` | `includeContent` |
| Recruitee | slug-based | KV / `discoverSlugs()` | `includeDescriptions` |
| Hacker News | custom (no slugs) | HN API | n/a |

## CLI usage

```bash
# Ingest all 9 sources
tsx src/cli.ts --all

# Single source
tsx src/cli.ts --source greenhouse

# Custom database path
tsx src/cli.ts --all --db ./jobs.sqlite

# Quiet mode (no progress output)
tsx src/cli.ts --all --quiet

# Database stats
tsx src/cli.ts --stats

# Export to SQL (for loading into D1)
tsx src/cli.ts --export-sql dump.sql
tsx src/cli.ts --export-sql dump.sql --source greenhouse

# Run cross-source deduplication
tsx src/cli.ts --dedup

# Dedup after ingest
tsx src/cli.ts --all --dedup

# Prune stale jobs (>14 days unseen)
tsx src/cli.ts --prune-stale

# Combined
tsx src/cli.ts --all --dedup --prune-stale --quiet
```

### CLI flags

| Flag | Description | Default |
|------|-------------|---------|
| `--all` | Ingest from all 9 sources | |
| `--source <name>` | Ingest from a single source | |
| `--db <path>` | Path to SQLite database | `apps/board/.wrangler/.../db.sqlite` |
| `--quiet` / `-q` | Suppress progress output | `false` |
| `--stats` | Show job counts by source | |
| `--export-sql <path>` | Export DB as `INSERT OR REPLACE` SQL | |
| `--dedup` | Run cross-source deduplication | |
| `--prune-stale` | Delete stale jobs older than 14 days | |
| `--help` / `-h` | Show help | |

## Unified schema

Every job from every ATS produces this shape (`UnifiedJob` from `src/unified-schema.ts`):

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | `{source}_{sourceId}` (e.g. `greenhouse_7546284`) |
| `sourceId` | `string` | Original ATS job ID |
| `title` | `string` | Job title |
| `description` | `string` | Plain-text description (HTML stripped) |
| `descriptionSnippet` | `string` | First 300 chars |
| `descriptionHtml` | `string \| null` | Raw HTML if available |
| `department` | `string` | Department name |
| `team` | `string` | Team name |
| `category` | `string` | Job category |
| `location` | `JobLocation` | Structured location (see below) |
| `secondaryLocations` | `JobLocation[]` | Additional locations |
| `workplaceType` | `enum` | `remote` / `hybrid` / `onsite` / `unknown` |
| `employmentType` | `enum` | `full-time` / `part-time` / `contract` / `internship` / ... |
| `seniorityLevel` | `enum` | `intern` through `c-level` |
| `salary` | `JobSalary` | Parsed salary (min, max, currency, period) |
| `jobUrl` | `string` | Job listing URL |
| `applyUrl` | `string` | Direct application URL |
| `company` | `JobCompany` | Company name, slug, ATS, logo, careers URL |
| `tags` | `string[]` | Auto-extracted tags |
| `publishedAt` | `ISO string` | Publication date |
| `scrapedAt` | `ISO string` | When scraped |
| `lastSeenAt` | `ISO string` | Last time seen in a scrape run |

### JobLocation

| Field | Type | Example |
|-------|------|---------|
| `text` | `string` | `San Francisco, CA` |
| `city` | `string \| null` | `San Francisco` |
| `state` | `string \| null` | `CA` |
| `country` | `string \| null` | `US` (ISO 3166-1 alpha-2) |
| `region` | `enum` | `europe` / `north-america` / `asia-pacific` / `remote-global` / ... |
| `lat` / `lng` | `number \| null` | Coordinates if available |

### JobSalary

| Field | Type | Example |
|-------|------|---------|
| `text` | `string` | `$150,000 - $200,000` |
| `min` / `max` | `number \| null` | `150000` / `200000` |
| `currency` | `string \| null` | `USD` (ISO 4217) |
| `period` | `enum \| null` | `yearly` / `monthly` / `hourly` / ... |

## Database schema

SQLite table with WAL mode, upsert on `(source, source_id)`:

```sql
CREATE TABLE jobs (
  id                TEXT PRIMARY KEY,
  source            TEXT NOT NULL,
  source_id         TEXT NOT NULL,
  company           TEXT NOT NULL,
  company_slug      TEXT NOT NULL,
  title             TEXT NOT NULL,
  department        TEXT DEFAULT '',
  location          TEXT DEFAULT '',
  country           TEXT DEFAULT '',
  region            TEXT DEFAULT 'other',
  is_remote         INTEGER NOT NULL DEFAULT 0,
  employment_type   TEXT DEFAULT '',
  salary            TEXT DEFAULT '',
  apply_url         TEXT NOT NULL,
  job_url           TEXT DEFAULT '',
  published_at      TEXT DEFAULT '',
  scraped_at        TEXT NOT NULL,
  tags              TEXT DEFAULT '',
  description_snippet TEXT DEFAULT '',
  last_seen_at      TEXT DEFAULT '',
  is_stale          INTEGER NOT NULL DEFAULT 0,
  is_duplicate_of   TEXT DEFAULT ''
);
```

**Indexes:** `(source, source_id)` unique, plus `region`, `is_remote`, `published_at`, `company_slug`, `source`.

**FTS5:** Full-text search on `title`, `company`, `department`, `location`, `tags`, `description_snippet`. Available on D1, gracefully skipped on `node:sqlite` (falls back to LIKE).

## Dedup + staleness logic

### Cross-source deduplication

Same job posted on multiple ATS platforms gets deduplicated by `slugify(company) + slugify(title) + slugify(location)`. When duplicates are found:

1. Score each by completeness (salary +2, description +1, location +1)
2. Break ties by most recent `scraped_at`
3. The "inferior" copy gets `is_duplicate_of` set to the keeper's ID
4. Only marks across different sources (same-source dupes are separate listings)

### Staleness tracking

- After each source ingest, jobs not seen for 48 hours are marked `is_stale = 1`
- Jobs update back to `is_stale = 0` on upsert (re-seen = not stale)
- `--prune-stale` deletes jobs stale for 14+ days

## Scraper factory (adapter pattern)

Every ATS scraper exposes the same interface via `ScraperAdapter`:

```typescript
interface ScraperAdapter {
  source: Source;
  discoverSlugs(opts?: { quiet?: boolean }): Promise<string[]>;
  scrapeAll(slugs: string[], opts?: { concurrency?: number }): Promise<RawCompanyJobs[]>;
  normalize(rawJobs: Record<string, unknown>[]): UnifiedJob[];
}
```

The factory (`getAdapter(source)`) dynamically imports the right scraper package and normalizer module, handling per-ATS quirks like content flag names (`includeDescriptions` vs `includeContent` vs none) and the HN adapter's completely different interface (no slugs, flat job list).

## Normalizer pattern

Each normalizer lives at `src/normalizers/{source}.ts` and exports a single `normalize()` function. Shared helpers handle the repetitive parts.

### Adding a new ATS

1. Create the scraper package (e.g. `packages/newats-jobs/`) exporting `discoverSlugs()` and `scrapeAll()`
2. Add normalizer at `src/normalizers/newats.ts`:

```typescript
import type { UnifiedJob } from "../unified-schema.js";
import { slugify, generateId, snippet, stripHtml } from "../utils.js";
import { parseSalary, inferSeniority, normalizeEmploymentType, normalizeWorkplaceType, buildLocation } from "./helpers.js";

interface RawNewatsJob {
  // ... ATS-specific fields
  _company?: string;
  _slug?: string;
}

export function normalize(rawJobs: RawNewatsJob[]): UnifiedJob[] {
  return rawJobs.map((raw) => ({
    id: generateId("newats", String(raw.id)),
    sourceId: String(raw.id),
    title: raw.title ?? "",
    description: stripHtml(raw.description ?? ""),
    descriptionSnippet: snippet(raw.description ?? ""),
    // ... map all UnifiedJob fields
    location: buildLocation({ text: raw.location ?? "" }),
    salary: parseSalary(raw.salaryText ?? ""),
    seniorityLevel: inferSeniority(raw.title ?? ""),
    // etc.
  }));
}
```

3. Add `"newats"` to the `Source` union in `src/types.ts`
4. Add content flag mapping in `src/scraper-factory.ts` (`CONTENT_FLAGS`)
5. Add to `SOURCES` array in `src/ingest.ts`

### Shared helpers (`src/normalizers/helpers.ts`)

| Helper | What it does |
|--------|-------------|
| `parseSalary(text)` | Extracts min/max, currency (26 currencies), period from free-text salary strings |
| `inferSeniority(title, rawLevel?)` | Maps title keywords or ATS seniority fields to `intern` through `c-level` |
| `normalizeEmploymentType(raw)` | Maps 20+ ATS-specific strings to 8 standard types |
| `normalizeWorkplaceType(raw, isRemote, location)` | Resolves remote/hybrid/onsite from multiple signals |
| `buildLocation(opts)` | Builds structured `JobLocation` with country inference and region classification |

### Region classification (`src/region.ts`)

Maps 70+ country codes and 60+ city names to 5 regions: `europe`, `north-america`, `asia`, `remote`, `other`. Used by both the flat DB schema and the rich `JobLocation.region` field.

## SearXNG discovery tool

Discovers company slugs across all 8 ATS platforms using a self-hosted SearXNG instance.

```bash
# Start SearXNG
docker run -d --name searxng -p 8888:8080 searxng/searxng

# Discover all platforms
npx tsx packages/job-ingest/discover.ts

# Single platform
npx tsx packages/job-ingest/discover.ts --platform greenhouse

# Custom settings
npx tsx packages/job-ingest/discover.ts --max-queries 10 --pages 3 --searxng-url http://localhost:8888
```

Runs 30 search strategies per platform (site searches for careers, hiring, cities, roles, etc.), extracts slugs from URLs with regex patterns, deduplicates against existing slugs, and saves to `discovered/{platform}-slugs.txt`.

| Flag | Description | Default |
|------|-------------|---------|
| `--platform <name>` | Target platform (or `all`) | `all` |
| `--max-queries <n>` | Max search strategies to run | `30` |
| `--pages <n>` | Pages per query | `5` |
| `--searxng-url <url>` | SearXNG base URL | `http://localhost:8888` |

## KV Worker (slug storage API)

Cloudflare Worker + KV that stores and serves company slugs for all platforms. Deployed at `https://job-slugs.wd40.workers.dev`.

```
GET  /slugs              → JSON summary of all platforms + counts
GET  /slugs/:platform    → newline-delimited slug list
GET  /slugs/:platform?json → JSON array of slugs
PUT  /slugs/:platform    → upload slugs (requires AUTH_TOKEN)
```

Source: `worker/src/index.ts`. CORS enabled. Cached responses (5min for index, 1hr for slug lists).

## Upload slugs tool

Pushes discovered slug files to the KV Worker API.

```bash
# Upload all discovered slugs
npx tsx packages/job-ingest/upload-slugs.ts --url https://job-slugs.wd40.workers.dev --token SECRET

# Or via env vars
SLUGS_API_URL=https://job-slugs.wd40.workers.dev SLUGS_AUTH_TOKEN=SECRET npx tsx packages/job-ingest/upload-slugs.ts
```

Reads all `*-slugs.txt` files from `discovered/` and PUTs them to the Worker.

## Architecture

```
packages/job-ingest/
├── src/
│   ├── cli.ts                # CLI entry point
│   ├── ingest.ts             # DB init, upsert, staleness, export
│   ├── scraper-factory.ts    # Adapter pattern for 9 scrapers
│   ├── unified-schema.ts     # Rich unified job schema (types)
│   ├── types.ts              # Flat DB types (Source, UnifiedJob, IngestResult)
│   ├── dedup.ts              # Cross-source deduplication
│   ├── region.ts             # Country/city → region classification
│   ├── utils.ts              # slugify, generateId, stripHtml, snippet
│   └── normalizers/
│       ├── helpers.ts        # Shared: salary, seniority, employment, location
│       ├── greenhouse.ts     # Greenhouse normalizer
│       ├── lever.ts          # Lever normalizer
│       ├── ashby.ts          # Ashby normalizer
│       ├── workable.ts       # Workable normalizer
│       ├── smartrecruiters.ts # SmartRecruiters normalizer
│       ├── breezyhr.ts       # BreezyHR normalizer
│       ├── personio.ts       # Personio normalizer
│       ├── recruitee.ts      # Recruitee normalizer
│       └── hn.ts             # Hacker News normalizer
├── discover.ts               # SearXNG slug discovery
├── upload-slugs.ts           # KV upload tool
├── discovered/               # Discovered slug files (per-platform .txt)
├── worker/
│   └── src/index.ts          # Cloudflare KV Worker
├── package.json
└── tsconfig.json
```

## Infrastructure

```
┌──────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   SearXNG    │────>│  discover.ts          │────>│  discovered/    │
│  (Docker)    │     │  Search 8 platforms   │     │  *.txt slugs    │
└──────────────┘     └──────────────────────┘     └────────┬────────┘
                                                           │
                                                  upload-slugs.ts
                                                           │
                                                  ┌────────▼────────┐
                                                  │  Cloudflare KV  │
                                                  │  Worker API     │
                                                  │  /slugs/:plat   │
                                                  └────────┬────────┘
                                                           │
              ┌────────────────────────────────────────────┘
              │  Scrapers read slugs from KV
              │
┌─────────────▼──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  9 ATS scraper packages    │────>│  job-ingest       │────>│  SQLite      │
│  greenhouse-jobs           │     │  normalize →      │     │  (WAL mode)  │
│  lever-jobs                │     │  upsert →         │     │              │
│  ashby-jobs                │     │  dedup →          │     │  --export-sql│
│  workable-jobs             │     │  staleness        │     │       │      │
│  smartrecruiters-jobs      │     └──────────────────┘     └───────┼──────┘
│  breezyhr-jobs             │                                      │
│  personio-jobs             │                              ┌───────▼──────┐
│  recruitee-jobs            │                              │  Cloudflare  │
│  hn-jobs                   │                              │  D1          │
└────────────────────────────┘                              └──────────────┘
```

| Component | Purpose | Location |
|-----------|---------|----------|
| Cloudflare KV Worker | Stores company slugs for all 8 slug-based platforms | `worker/src/index.ts` |
| SearXNG (Docker) | Discovers new company slugs via search | `discover.ts` |
| 9 ATS scraper packages | Source job data from each platform | `packages/*-jobs/` |
| SQLite (node:sqlite) | Local job storage with WAL + FTS5 | `apps/board/.wrangler/` |
| Cloudflare D1 | Production job storage | Via SQL export |

## Dependencies

- `drizzle-orm` / `zod` (runtime)
- `tsx` / `typescript` / `@types/node` (dev)
- `node:sqlite` (built-in, Node 23+)
- All 9 `*-jobs` scraper packages (dynamic import)

## Author

**Doug Silkstone** -- Lead Full Stack Engineer

[![GitHub](https://img.shields.io/badge/GitHub-dougwithseismic-181717?logo=github)](https://github.com/dougwithseismic)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-dougsilkstone-0A66C2?logo=linkedin)](https://linkedin.com/in/dougsilkstone)
