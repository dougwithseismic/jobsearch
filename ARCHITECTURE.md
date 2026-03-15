# Architecture & CI/CD Reference

## System Architecture

```
                             ┌─────────────────────────────────────────────────────┐
                             │                   DISCOVERY                         │
                             │                                                     │
                             │  SearXNG (Docker)                                   │
                             │       │                                             │
                             │       ▼                                             │
                             │  discover.ts ──► {platform}-slugs.txt              │
                             │       │                                             │
                             │       ▼                                             │
                             │  upload-slugs.ts ──► KV Worker (job-slugs)         │
                             └───────────────────────────┬─────────────────────────┘
                                                         │
                                                         │ GET /slugs/:platform
                                                         ▼
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      SCRAPING                                              │
│                                                                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Ashby   │ │Greenhouse│ │  Lever   │ │ Workable │ │Recruitee │ │  Smart   │           │
│  │  Jobs    │ │  Jobs    │ │  Jobs    │ │  Jobs    │ │  Jobs    │ │Recruiters│           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       │             │            │             │             │            │                  │
│  ┌────┴─────┐ ┌─────┴────┐ ┌────┴─────┐                                                   │
│  │ BreezyHR │ │ Personio │ │ HN Jobs  │  (9 scrapers total)                               │
│  │  Jobs    │ │  Jobs    │ │          │                                                    │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘                                                   │
│       └─────────────┼────────────┘                                                         │
│                     │ Raw ATS JSON                                                         │
│                     ▼                                                                      │
│          ┌──────────────────────┐                                                          │
│          │  scraper-factory.ts  │  Adapter pattern: getAdapter(source)                     │
│          └──────────┬───────────┘                                                          │
│                     │                                                                      │
│                     ▼                                                                      │
│          ┌──────────────────────┐                                                          │
│          │   normalizers/*.ts   │  Per-ATS → UnifiedJob transform                          │
│          │  (helpers.ts shared) │                                                          │
│          └──────────┬───────────┘                                                          │
│                     │ UnifiedJob[]                                                         │
│                     ▼                                                                      │
│          ┌──────────────────────┐                                                          │
│          │     job-ingest       │  cli.ts: --source, --all, --export-sql                   │
│          │  SQLite local + SQL  │  dedup.ts: cross-source deduplication                    │
│          └──────────┬───────────┘                                                          │
└─────────────────────┼──────────────────────────────────────────────────────────────────────┘
                      │ SQL dump files
                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    STORAGE (Cloudflare)                                     │
│                                                                                             │
│  ┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐                 │
│  │    D1 (job-board)  │    │  KV (STATS_KV)     │    │ KV (SLUGS)        │                 │
│  │  SQLite over HTTP  │    │  Cached stats/meta  │    │ Company slug lists │                 │
│  │  FTS5 search index │    │                    │    │ per ATS platform   │                 │
│  └────────┬───────────┘    └────────┬───────────┘    └────────────────────┘                 │
│           │                         │                                                       │
│           ▼                         ▼                                                       │
│  ┌─────────────────────────────────────────────┐                                           │
│  │     Board App (Hono Worker)                 │                                           │
│  │  /api/jobs    — paginated job listings      │                                           │
│  │  /api/search  — FTS5 full-text search       │                                           │
│  │  /api/stats   — aggregate counts            │                                           │
│  │  /api/cache   — cache purge endpoint        │                                           │
│  │  SPA frontend (ASSETS binding)              │                                           │
│  └─────────────────────────────────────────────┘                                           │
│                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              ON-DEMAND SEARCH (deadlyaccuratejobs)                          │
│                                                                                             │
│  CLI: deadlyaccuratejobs "Stripe" --remote --keyword engineer                              │
│       │                                                                                     │
│       ├─1─► KV Worker: resolve company → platform slugs                                    │
│       ├─2─► ATS scrapers: fetch live jobs for resolved slugs                               │
│       ├─3─► Normalizers: raw → UnifiedJob                                                  │
│       └─4─► Filters: remote, keyword, seniority → formatted output                        │
│                                                                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Monorepo Structure

```
jobsearch/
├── apps/
│   ├── board/              Cloudflare Worker + SPA — the public job board (Hono, D1, KV)
│   ├── web/                Next.js 16 — company swipe tool, CV page, dossier viewer
│   ├── freelance/          Freelance-focused app
│   └── docs/               Docs app (Turborepo default)
│
├── packages/
│   ├── job-ingest/         Orchestrator: CLI, scraper-factory, normalizers, SQL export
│   │   ├── src/
│   │   │   ├── cli.ts              CLI entrypoint (--source, --all, --export-sql, --stats)
│   │   │   ├── ingest.ts           SQLite init + upsert logic
│   │   │   ├── dedup.ts            Cross-source deduplication
│   │   │   ├── scraper-factory.ts  Adapter pattern: getAdapter(source) → ScraperAdapter
│   │   │   ├── unified-schema.ts   47-field UnifiedJob type definition
│   │   │   ├── types.ts            Lighter DB-facing UnifiedJob + Source type
│   │   │   ├── region.ts           Country/region classification
│   │   │   └── normalizers/        Per-ATS transform functions (9 files + helpers.ts)
│   │   ├── worker/                 KV slug API Worker (GET/PUT /slugs/:platform)
│   │   ├── discover.ts             SearXNG-based slug discovery
│   │   └── upload-slugs.ts         Push discovered slugs to KV Worker
│   │
│   ├── deadlyaccuratejobs/ On-demand job search CLI — resolve → scrape → filter → display
│   │   ├── src/            Resolver, filters, formatters
│   │   ├── bin/cli.ts      CLI entrypoint
│   │   └── actor/          Apify actor wrapper
│   │
│   ├── ashby-jobs/         Ashby ATS scraper (API-based, slug-driven)
│   ├── greenhouse-jobs/    Greenhouse ATS scraper
│   ├── lever-jobs/         Lever ATS scraper
│   ├── workable-jobs/      Workable ATS scraper
│   ├── recruitee-jobs/     Recruitee ATS scraper
│   ├── smartrecruiters-jobs/ SmartRecruiters ATS scraper
│   ├── breezyhr-jobs/      BreezyHR ATS scraper
│   ├── personio-jobs/      Personio ATS scraper
│   ├── hn-jobs/            Hacker News "Who is Hiring" scraper (no slugs)
│   │
│   ├── ashby-jobs-tui/     Terminal UI for Ashby jobs (standalone)
│   ├── awesome-jobs-scraper/ Scraper for awesome-jobs lists
│   │
│   ├── ui/                 Shared React component library
│   ├── eslint-config/      Shared ESLint configuration
│   └── typescript-config/  Shared TSConfig base files
│
├── journey/                Outreach pipeline outputs
│   ├── dossiers/           Per-company intelligence reports (51 completed)
│   ├── strategies/         Per-company outreach strategies
│   ├── outreach/           Ready-to-send outreach messages
│   ├── LOG.md              Chronological journey log
│   ├── TIER_LIST.md        Company tiers (T1: 6, T2: 15, T3: 28)
│   └── PITCH.md            Interview positioning & rebuttals
│
├── .claude/skills/         Claude Code automation skills
│   ├── company-research/
│   ├── company-deep-dive/
│   ├── outreach-strategy/
│   ├── craft-outreach/
│   └── journey-log/
│
├── .github/workflows/
│   ├── ingest.yml          Scheduled 4x/day bulk ingest → D1
│   ├── deploy.yml          Board app deploy on push to main
│   └── deadlyaccuratejobs.yml  CI: tests, smoke tests, slug discovery
│
├── CLAUDE.md               Project instructions for Claude Code
├── ARCHITECTURE.md         This file
├── decisions.json          Company swipe decisions (50 yes / 14 maybe / 80 no)
└── package.json            Root — Turborepo + pnpm workspaces
```

## Data Flow

### Batch pipeline (4x daily via GitHub Actions)

```
1. KV Worker                    Slug lists per platform (e.g. greenhouse: 2,400 slugs)
       │
2. ATS Scraper                  GET https://boards-api.greenhouse.io/v1/boards/{slug}/jobs
       │                        Returns raw JSON per company (titles, locations, IDs)
       │
3. scraper-factory.ts           getAdapter("greenhouse") → ScraperAdapter
       │                        adapter.scrapeAll(slugs) → RawCompanyJobs[]
       │
4. normalizers/greenhouse.ts    normalize(rawJobs) → UnifiedJob[]
       │                        Maps greenhouse-specific fields to unified schema
       │
5. job-ingest cli.ts            INSERT OR REPLACE INTO jobs (...) VALUES (...)
       │                        Writes to local SQLite, then --export-sql → .sql file
       │
6. GitHub Actions               Upload .sql as artifact, download in push-to-d1 job
       │
7. wrangler d1 execute          Pushes SQL to Cloudflare D1 (remote SQLite)
       │
8. Board Worker (Hono)          /api/jobs?page=1&source=greenhouse&remote=true
       │                        /api/search?q=senior+engineer+react
       │                        Queries D1 with FTS5 for full-text search
       │
9. Board SPA                    Frontend renders job cards, filters, search
```

### On-demand pipeline (deadlyaccuratejobs CLI)

```
1. User runs: deadlyaccuratejobs "Stripe" --remote --keyword engineer
       │
2. Resolver hits KV Worker: GET /slugs/greenhouse, /slugs/lever, ...
       │  Searches all 8 slug lists for "stripe" (case-insensitive match)
       │  Returns: { greenhouse: ["stripe"], lever: ["stripe"] }
       │
3. Scrapes live from each matched ATS API (concurrency: 5)
       │
4. Normalizes to UnifiedJob[], applies filters (remote, keyword, seniority)
       │
5. Outputs formatted table or JSON to stdout
```

## Infrastructure

| Component | Service | Purpose |
|-----------|---------|---------|
| **D1 `job-board`** | Cloudflare D1 | Primary job store. SQLite over HTTP. FTS5 index for search. |
| **KV `SLUGS`** | Cloudflare KV | Company slug lists per ATS platform. ~10K slugs total. |
| **KV `STATS_KV`** | Cloudflare KV | Cached aggregate stats for board API. |
| **Board Worker** | Cloudflare Workers | Hono app serving API + SPA. Binds D1 + KV. Smart placement. |
| **KV Slug Worker** | Cloudflare Workers | `job-slugs.wd40.workers.dev`. REST API for slug CRUD. |
| **SearXNG** | Docker (self-hosted) | Meta-search engine for discovering ATS company slugs. |
| **GitHub Actions** | GitHub | CI/CD: scheduled ingest, deploy, tests, discovery. |
| **Apify** | Apify.com | Actor wrappers for individual scrapers (optional, for cloud runs). |

### Cloudflare Bindings (board Worker)

```toml
# wrangler.toml
name = "job-board"
main = "src/worker.ts"

[[d1_databases]]
binding = "DB"
database_name = "job-board"
database_id = "1e5cbd5f-7681-4836-83fb-67dfb3d21e11"

[[kv_namespaces]]
binding = "STATS_KV"
id = "c8268fd130e24ae2b31d5bf548cd093a"

[triggers]
crons = ["0 0 * * *", "0 6 * * *", "0 12 * * *", "0 18 * * *"]

[placement]
mode = "smart"    # Route to datacenter closest to D1
```

## CI/CD Pipelines

### 1. `ingest.yml` — Scheduled Bulk Ingest

**Triggers:** Cron (00:00, 06:00, 12:00, 18:00 UTC) + manual dispatch

```
                    ┌──────────────────────┐
                    │   workflow_dispatch   │
                    │   schedule (4x/day)  │
                    └──────────┬───────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
   ┌──────┴──────┐  ┌─────────┴────┐  ┌───────────┴──────┐
   │scrape:ashby │  │scrape:lever  │  │ ... (9 matrix)   │
   │  120min     │  │  120min      │  │  fail-fast:false  │
   └──────┬──────┘  └─────────┬────┘  └───────────┬──────┘
          │                   │                    │
          │           artifacts: .sql files        │
          └────────────────────┼────────────────────┘
                               │ needs: scrape
                               ▼
                    ┌──────────────────────┐
                    │     push-to-d1       │
                    │  Download all .sql   │
                    │  wrangler d1 execute │
                    │  Purge CDN cache     │
                    │  30min timeout       │
                    └──────────────────────┘
```

**Matrix:** `[ashby, greenhouse, lever, workable, recruitee, smartrecruiters, breezyhr, personio, hn]`

**Key details:**
- `fail-fast: false` — one ATS failing does not block others
- SQL artifacts have 1-day retention (consumed immediately by push-to-d1)
- Cache purge hits Cloudflare zone API after D1 push

### 2. `deploy.yml` — Board App Deployment

**Triggers:** Push to `main` touching `apps/board/**` or `packages/**`

```
   push to main (path-filtered)
          │
          ▼
   ┌──────────────┐
   │    deploy     │
   │  pnpm install │
   │  wrangler     │
   │  deploy       │
   └──────────────┘
```

Single job. Runs `wrangler deploy` from `apps/board/`.

### 3. `deadlyaccuratejobs.yml` — CI + Smoke + Discovery

**Triggers:**
- Push to `main` or PR touching `packages/deadlyaccuratejobs/**`, normalizers, scraper-factory, or unified-schema
- Manual dispatch with `company` input and `smoke_test` boolean

**Concurrency:** `cancel-in-progress: true` per branch — rapid pushes only run the latest.

```
   push/PR (path-filtered)  │  workflow_dispatch
          │                  │
   ┌──────┴──────┐    ┌─────┴──────────┐
   │             │    │                │
   ▼             ▼    ▼                ▼
┌──────┐  ┌─────────┐ ┌──────────┐  ┌──────────────┐
│ test │  │ resolve │ │ scrape   │  │ discover     │
│      │  │ smoke   │ │ smoke    │  │ slugs        │
│ 5min │  │ 3min    │ │ 10min   │  │ 60min        │
│always│  │ always  │ │ manual  │  │ manual       │
└──────┘  └─────────┘ │ only    │  │ 8x matrix    │
                      └─────────┘  └──────────────┘
```

| Job | Runs when | What it does |
|-----|-----------|-------------|
| `test` | Always | `vitest run` + `tsc --noEmit` |
| `resolve-smoke` | Always | Hits live KV API, resolves Stripe/Notion/Spotify, checks platform stats |
| `scrape-smoke` | Manual + `smoke_test: true` | End-to-end: resolve + scrape + filter + JSON artifact |
| `discover-slugs` | Manual only | SearXNG Docker per platform (8x matrix), uploads to KV |

## Unified Schema

The `UnifiedJob` in `packages/job-ingest/src/unified-schema.ts` is the lingua franca. Every ATS normalizer produces this shape. The board app's D1 table mirrors a flattened version from `packages/job-ingest/src/types.ts`.

### Full schema (unified-schema.ts)

| Group | Fields | Types |
|-------|--------|-------|
| **Identity** | `id`, `sourceId` | `string` |
| **Core** | `title`, `description`, `descriptionSnippet`, `descriptionHtml` | `string`, `string \| null` |
| **Organization** | `department`, `team`, `category` | `string` |
| **Location** | `location` (sub-object), `secondaryLocations`, `workplaceType` | `JobLocation`, `JobLocation[]`, `WorkplaceType` |
| **Employment** | `employmentType`, `employmentTypeRaw`, `seniorityLevel` | `EmploymentType`, `string`, `SeniorityLevel` |
| **Compensation** | `salary` (sub-object) | `JobSalary` |
| **URLs** | `jobUrl`, `applyUrl` | `string` |
| **Company** | `company` (sub-object) | `JobCompany` |
| **Meta** | `tags`, `publishedAt`, `scrapedAt`, `lastSeenAt` | `string[]`, `string`, `string`, `string` |
| **Debug** | `raw` | `Record<string, unknown> \| undefined` |

### Sub-objects

**JobLocation:**

| Field | Type | Notes |
|-------|------|-------|
| `text` | `string` | Free-text as displayed on ATS |
| `city` | `string \| null` | Parsed city |
| `state` | `string \| null` | Parsed state/region |
| `country` | `string \| null` | ISO 3166-1 alpha-2 |
| `region` | `Region` | `europe`, `north-america`, `asia-pacific`, `remote-global`, etc. |
| `lat`, `lng` | `number \| null` | Geocoded coordinates |

**JobSalary:**

| Field | Type | Notes |
|-------|------|-------|
| `text` | `string` | Raw salary string as scraped |
| `min`, `max` | `number \| null` | Parsed range |
| `currency` | `string \| null` | ISO 4217 |
| `period` | `SalaryPeriod \| null` | `yearly`, `monthly`, `hourly`, etc. |

**JobCompany:**

| Field | Type |
|-------|------|
| `name` | `string` |
| `slug` | `string` |
| `ats` | `AtsSource` |
| `logoUrl` | `string \| null` |
| `careersUrl` | `string \| null` |

### Enums

| Type | Values |
|------|--------|
| `AtsSource` | `greenhouse`, `lever`, `ashby`, `workable`, `smartrecruiters`, `breezyhr`, `personio`, `recruitee`, `hn` |
| `WorkplaceType` | `remote`, `hybrid`, `onsite`, `unknown` |
| `EmploymentType` | `full-time`, `part-time`, `contract`, `freelance`, `internship`, `temporary`, `volunteer`, `other` |
| `SeniorityLevel` | `intern`, `junior`, `mid`, `senior`, `staff`, `principal`, `lead`, `manager`, `director`, `vp`, `c-level`, `other` |
| `Region` | `europe`, `north-america`, `south-america`, `asia-pacific`, `middle-east`, `africa`, `remote-global`, `other` |

### DB-facing schema (types.ts — flattened for SQLite)

The D1 table uses a flattened version with 25 columns:

| Column | Type | Notes |
|--------|------|-------|
| `id` | `TEXT PRIMARY KEY` | `{source}:{sourceId}` |
| `source` | `TEXT` | ATS name |
| `sourceId` | `TEXT` | ATS-native job ID |
| `company` | `TEXT` | Company name |
| `companySlug` | `TEXT` | URL-safe company slug |
| `title` | `TEXT` | Job title |
| `department` | `TEXT` | |
| `location` | `TEXT` | Free-text location |
| `country` | `TEXT` | ISO alpha-2 |
| `region` | `TEXT` | Classified region |
| `isRemote` | `INTEGER` | Boolean (0/1) |
| `employmentType` | `TEXT` | |
| `salary` | `TEXT` | Raw salary string |
| `applyUrl` | `TEXT` | |
| `jobUrl` | `TEXT` | |
| `publishedAt` | `TEXT` | ISO 8601 |
| `scrapedAt` | `TEXT` | ISO 8601 |
| `tags` | `TEXT` | Comma-separated |
| `descriptionSnippet` | `TEXT` | First ~200 chars |
| `lastSeenAt` | `TEXT` | ISO 8601 |

## Adding a New ATS

### Checklist

1. **Create scraper package** at `packages/{ats}-jobs/` following the existing pattern:
   - `src/index.ts` — exports `discoverSlugs()` and `scrapeAll(slugs, opts)`
   - `src/types.ts` — raw ATS response types
   - `src/__tests__/` — unit tests with fixtures
   - `bin/cli.ts` — standalone CLI
   - `actor/` — Apify actor wrapper (optional)
   - `package.json` — add to workspace

2. **Add normalizer** at `packages/job-ingest/src/normalizers/{ats}.ts`:
   - Export `normalize(rawJobs: Record<string, unknown>[]): UnifiedJob[]`
   - Use shared helpers from `helpers.ts` (salary parsing, seniority inference, etc.)

3. **Register in scraper-factory.ts**:
   - Add to `CONTENT_FLAGS` map with the correct flag (`includeDescriptions`, `includeContent`, or `none`)
   - If the ATS has a non-standard interface (like HN), create a custom adapter function

4. **Add to Source type** in `packages/job-ingest/src/types.ts`

5. **Add to AtsSource type** in `packages/job-ingest/src/unified-schema.ts`

6. **Update CI matrix** in `.github/workflows/ingest.yml`:
   ```yaml
   matrix:
     source: [..., {ats}]
   ```

7. **Add to deadlyaccuratejobs** — update `SLUG_SOURCES` in `packages/deadlyaccuratejobs/src/types.ts`

8. **Add to discovery matrix** in `.github/workflows/deadlyaccuratejobs.yml`:
   ```yaml
   matrix:
     platform: [..., {ats}]
   ```

9. **Add to KV Worker** PLATFORMS array in `packages/job-ingest/worker/src/index.ts`

10. **Add workspace entry** in `pnpm-workspace.yaml`:
    ```yaml
    - "packages/{ats}-jobs/actor"
    ```

11. **Discover initial slugs**:
    ```bash
    docker run -d --name searxng -p 8888:8080 searxng/searxng
    SEARXNG_URL=http://localhost:8888 npx tsx packages/job-ingest/discover.ts --platform {ats}
    npx tsx packages/job-ingest/upload-slugs.ts
    ```

12. **Verify**:
    ```bash
    npx tsx packages/job-ingest/src/cli.ts --source {ats} --db /tmp/test.db --stats
    npx tsx packages/deadlyaccuratejobs/bin/cli.ts resolve SomeCompanyOnNewAts
    ```

## Secrets & Environment Variables

### GitHub Actions Secrets

| Secret | Used by | Purpose |
|--------|---------|---------|
| `CLOUDFLARE_API_TOKEN` | `ingest.yml`, `deploy.yml` | D1 writes, wrangler deploy, cache purge |
| `CLOUDFLARE_ACCOUNT_ID` | `ingest.yml`, `deploy.yml` | Cloudflare account identification |
| `CLOUDFLARE_ZONE_ID` | `ingest.yml` | Cache purge API (zone-scoped) |
| `SLUGS_AUTH_TOKEN` | `deadlyaccuratejobs.yml` | Authenticated PUT to KV slug Worker |

### Environment Variables (runtime)

| Variable | Where | Default | Purpose |
|----------|-------|---------|---------|
| `SEARXNG_URL` | Discovery scripts | `http://localhost:8888` | SearXNG instance URL |
| `SLUGS_API_URL` | deadlyaccuratejobs CI | `https://job-slugs.wd40.workers.dev` | KV slug Worker URL |
| `DB_PATH` | job-ingest CLI | `apps/board/.wrangler/state/v3/d1/...` | Local SQLite path |

### Cloudflare Worker Bindings

| Binding | Worker | Type | Purpose |
|---------|--------|------|---------|
| `DB` | board | D1 | Job database |
| `ASSETS` | board | Fetcher | SPA static assets |
| `STATS_KV` | board | KV | Cached stats |
| `CACHE_PURGE_SECRET` | board | Secret (optional) | Protect cache purge endpoint |
| `SLUGS` | slug worker | KV | Company slug lists |
| `AUTH_TOKEN` | slug worker | Secret (optional) | Protect PUT endpoint |

## Local Development

### Prerequisites

- Node >= 18
- pnpm 9+
- Docker (for SearXNG)

### Quick start

```bash
# Install everything
pnpm install

# Run the web app (swipe tool, CV page)
pnpm dev --filter=web           # http://localhost:3000

# Run the board Worker locally (needs D1 local state)
cd apps/board && npx wrangler dev    # http://localhost:8787

# Run the KV slug Worker locally
cd packages/job-ingest/worker && npx wrangler dev --port 8788
```

### Local ingest (populate D1 for board app)

```bash
# Ingest from a single source into local D1 SQLite
npx tsx packages/job-ingest/src/cli.ts --source greenhouse --quiet

# Ingest all 9 sources
npx tsx packages/job-ingest/src/cli.ts --all

# Check stats
npx tsx packages/job-ingest/src/cli.ts --stats

# Export SQL for manual D1 push
npx tsx packages/job-ingest/src/cli.ts --export-sql /tmp/greenhouse.sql --source greenhouse
```

### Local slug discovery (SearXNG)

```bash
# Start SearXNG
docker run -d --name searxng -p 8888:8080 searxng/searxng

# Discover slugs for one platform
SEARXNG_URL=http://localhost:8888 npx tsx packages/job-ingest/discover.ts --platform greenhouse

# Upload discovered slugs to local KV Worker
SLUGS_API_URL=http://localhost:8788 npx tsx packages/job-ingest/upload-slugs.ts
```

### deadlyaccuratejobs (on-demand search)

```bash
# Search for a company
npx tsx packages/deadlyaccuratejobs/bin/cli.ts Stripe --limit 10

# Search with filters
npx tsx packages/deadlyaccuratejobs/bin/cli.ts Stripe --remote --keyword engineer

# JSON output
npx tsx packages/deadlyaccuratejobs/bin/cli.ts Stripe --format json

# Use local KV Worker instead of production
npx tsx packages/deadlyaccuratejobs/bin/cli.ts Stripe --api-url http://localhost:8788
```

### Running tests

```bash
# All ATS scraper tests
pnpm --filter=@jobsearch/ashby-jobs test
pnpm --filter=@jobsearch/greenhouse-jobs test
# ... etc

# deadlyaccuratejobs tests
cd packages/deadlyaccuratejobs && npx vitest run

# Type checking (all packages)
pnpm check-types
```

## Key Design Decisions

### 1. File-based persistence over databases (web app)

The web app (`apps/web`) uses TypeScript files, JSON, and Markdown on disk rather than a database. `companies.ts` is a typed array of 147 companies. `decisions.json` tracks swipe state. Dossiers are Markdown files.

**Why:** Diffs cleanly in git. No database setup. Works offline. Easy for Claude Code skills to read/write. The data changes infrequently and is small enough that file I/O is fine.

### 2. D1 + FTS5 for the board app

The board app uses Cloudflare D1 (SQLite over HTTP) with FTS5 full-text search indexes.

**Why:** Zero cold start (smart placement). SQL is the natural query language for filtered job listings. FTS5 gives fast full-text search without Elasticsearch/Algolia. D1 is free-tier-friendly and colocated with the Worker.

**FTS5 fallback:** If D1 FTS5 is unavailable or the query is simple, the board API falls back to `LIKE` clauses. FTS5 is a performance optimization, not a hard dependency.

### 3. Adapter pattern (scraper-factory.ts)

All 9 ATS scrapers have different APIs and response shapes, but `getAdapter(source)` returns a uniform `ScraperAdapter` interface: `discoverSlugs()`, `scrapeAll()`, `normalize()`.

**Why:** The ingest CLI and deadlyaccuratejobs both need to work with all scrapers. The adapter pattern means adding a new ATS is a matter of implementing three functions, not touching every consumer. The `CONTENT_FLAGS` map handles the minor differences (some scrapers use `includeDescriptions`, others `includeContent`) without branching logic everywhere.

### 4. Slug-first discovery

Companies are identified by their ATS slug (e.g., `stripe` on Greenhouse = `boards-api.greenhouse.io/v1/boards/stripe/jobs`). Discovery uses SearXNG to find these slugs via search queries like `site:boards.greenhouse.io inurl:/jobs`.

**Why:** ATS APIs are slug-indexed. There is no master directory of "all companies using Greenhouse." SearXNG provides rate-limit-free meta-search across multiple engines. Discovered slugs are stored in KV for fast lookup without re-discovering.

### 5. SQL export + artifact passing

The ingest pipeline writes to local SQLite, exports as `.sql` files, uploads as GitHub Actions artifacts, then downloads and pushes to D1 in a separate job.

**Why:** Each scraper runs in a separate matrix job (parallel, isolated). D1 does not support concurrent writes from 9 jobs. The artifact pattern serializes the write — all 9 scrape jobs run in parallel, then a single `push-to-d1` job applies all SQL sequentially. This also means a scraper failure does not block D1 writes for other sources.

### 6. Separate unified schemas (rich vs. flat)

Two `UnifiedJob` types exist:
- `unified-schema.ts` — rich, nested (47 fields with sub-objects for location, salary, company)
- `types.ts` — flat, DB-friendly (25 columns, strings and booleans)

**Why:** The rich schema is what normalizers produce and what deadlyaccuratejobs uses for filtering. The flat schema is what gets inserted into D1. The normalizer pipeline works with the rich version; the SQL export step flattens it. Keeping both avoids forcing SQLite column constraints onto the normalizer logic.

### 7. Manual-only smoke tests

The `scrape-smoke` and `discover-slugs` jobs in `deadlyaccuratejobs.yml` are manual-trigger only. They are never scheduled or triggered by pushes.

**Why:** These hit external ATS APIs and SearXNG. Running them on every push would burn rate limits, slow down CI, and produce flaky failures. Unit tests and KV resolve-smoke tests run on every push (fast, deterministic). Full scrape tests are for intentional validation.

### 8. Concurrency control in CI

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

**Why:** Three rapid pushes to a branch would normally run three full CI pipelines. With `cancel-in-progress`, only the latest runs. Saves ~80% of wasted CI minutes during active development.

### 9. HN as a special case

HN Jobs has no slug discovery (no company ATS boards). It scrapes "Who is Hiring" threads and produces flat job records wrapped as a single pseudo-company.

**Why:** HN is a valuable signal for early-stage companies not yet on an ATS. The adapter pattern accommodates it: `discoverSlugs()` returns `[]`, `scrapeAll()` ignores the slugs parameter and fetches threads directly.
