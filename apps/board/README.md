# @jobsearch/board - Job Board API & Frontend

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Hono](https://img.shields.io/badge/Hono-4.x-E36002?logo=hono&logoColor=white)](https://hono.dev/)
[![D1 SQLite](https://img.shields.io/badge/D1-SQLite-003B57?logo=sqlite&logoColor=white)](https://developers.cloudflare.com/d1/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team/)

Edge-deployed job board powered by Cloudflare Workers, D1 SQLite, and Hono. Serves a React SPA frontend and a JSON API for browsing, searching, and filtering jobs scraped from 8 ATS platforms.

```bash
curl "https://your-board.workers.dev/api/jobs?remote=true&region=europe&limit=25"
```

## Stack

| Layer | Tech |
|-------|------|
| Runtime | Cloudflare Workers |
| API framework | Hono 4.x + Zod validation |
| Database | Cloudflare D1 (SQLite) + Drizzle ORM |
| Full-text search | D1 FTS5 (`jobs_fts` virtual table) |
| Cache | Cloudflare Cache API (edge) + KV (stats) |
| Frontend | React 19, React Router 7, TanStack Table/Virtual, Tailwind 4 |
| Build | Vite 7 + @cloudflare/vite-plugin |
| Deployment | `wrangler deploy` |

## API Routes

All routes are prefixed with `/api` and pass through CORS, edge cache, and ETag middleware.

### `GET /api/jobs`

List jobs with filtering, sorting, and cursor or offset pagination.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | `1` | Page number (offset pagination) |
| `limit` | number | `50` | Results per page (max 100) |
| `region` | string | | Filter by region (`europe`, `north-america`, etc.) |
| `remote` | `true`/`false` | | Remote jobs only |
| `source` | string | | Filter by ATS source (`greenhouse`, `lever`, etc.) |
| `company` | string | | Filter by company slug |
| `since` | ISO date | | Jobs published after this date |
| `sort` | enum | `published_at` | Sort column: `published_at`, `company`, `title`, `location`, `source` |
| `order` | `asc`/`desc` | `desc` | Sort direction |
| `cursor` | string | | Opaque cursor for cursor-based pagination |
| `direction` | `next`/`prev` | `next` | Cursor direction |
| `includeStale` | `true`/`false` | `false` | Include stale/duplicate jobs |

```bash
# Latest remote jobs in Europe
curl "/api/jobs?remote=true&region=europe&limit=25"

# Cursor-based pagination
curl "/api/jobs?cursor=MjAyNi0wMy0xNFQxMjowMDowMFp8Z3JlZW5ob3VzZV83NTQ2Mjg0&direction=next"

# Jobs from a specific company
curl "/api/jobs?company=stripe&sort=title&order=asc"
```

### `GET /api/search`

Full-text search across job titles, companies, locations, departments, tags, and descriptions. Falls back to `listJobs` when no query is provided.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | | Search query (FTS5 MATCH syntax) |
| All `/api/jobs` params | | | Same filters apply |

```bash
# Search for senior engineering roles
curl "/api/search?q=senior+engineer&remote=true"

# Search with region filter
curl "/api/search?q=product+manager&region=europe"
```

### `GET /api/stats`

Aggregate statistics. Cached in KV for 15 minutes, falls back to D1 on miss.

```bash
curl "/api/stats"
```

Returns:

```json
{
  "totalJobs": 12847,
  "totalCompanies": 1203,
  "sources": {
    "greenhouse": 4521,
    "lever": 2103,
    "ashby": 1847,
    "workable": 1522,
    "smartrecruiters": 1211,
    "breezyhr": 743,
    "personio": 512,
    "recruitee": 388
  },
  "lastUpdated": "2026-03-15T06:00:00Z"
}
```

### `POST /api/cache/purge`

Purge edge cache and KV stats. Requires `CACHE_PURGE_SECRET` bearer token.

```bash
curl -X POST "/api/cache/purge" \
  -H "Authorization: Bearer YOUR_SECRET"
```

Purges: KV stats key, edge cache for `/api/stats`, `/api/jobs`, `/api/search`.

## Database Schema

Single `jobs` table in Cloudflare D1, managed with Drizzle ORM.

| Column | Type | Description |
|--------|------|-------------|
| `id` | text (PK) | Composite ID, e.g. `greenhouse_7546284` |
| `source` | text | ATS platform name |
| `source_id` | text | ID on the source platform |
| `company` | text | Company display name |
| `company_slug` | text | URL-safe company identifier |
| `title` | text | Job title |
| `department` | text | Department name |
| `location` | text | Location string |
| `country` | text | Country code |
| `region` | text | Region: `europe`, `north-america`, `asia`, `other` |
| `is_remote` | boolean | Whether the job is remote |
| `employment_type` | text | `full-time`, `contract`, etc. |
| `salary` | text | Salary range string |
| `apply_url` | text | Direct application link |
| `job_url` | text | Public job listing URL |
| `published_at` | text | ISO publish date |
| `scraped_at` | text | ISO scrape timestamp |
| `tags` | text | Comma-separated tags |
| `description_snippet` | text | Truncated description |
| `last_seen_at` | text | Last time the job was seen in a scrape |
| `is_stale` | boolean | Marked stale if not seen in recent scrapes |
| `is_duplicate_of` | text | ID of the canonical job if duplicate |

### Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_source_sourceId` | `source`, `source_id` | Unique constraint, upsert key |
| `idx_region` | `region` | Region filter |
| `idx_is_remote` | `is_remote` | Remote filter |
| `idx_published_at` | `published_at` | Sort by date |
| `idx_company_slug` | `company_slug` | Company filter |
| `idx_source` | `source` | Source filter |
| `idx_published_id` | `published_at`, `id` | Cursor pagination (composite) |

### Full-Text Search

A `jobs_fts` FTS5 virtual table enables fast text search across job content via D1's native SQLite FTS.

## Middleware

Three middleware layers run on all `/api/*` routes in order:

| Middleware | What it does |
|------------|--------------|
| **CORS** | Hono's built-in `cors()` — allows cross-origin requests |
| **Edge Cache** | Checks `caches.default` for cached responses. On HIT, returns immediately with `X-Cache: HIT`. On MISS, runs the handler, then stores the response in edge cache with path-specific TTLs. Falls through gracefully in local dev. |
| **ETag** | Generates a weak ETag (`W/"<sha256-prefix>"`) from the response body. Returns `304 Not Modified` if the client sends a matching `If-None-Match` header. |

### Cache TTLs

| Path | `Cache-Control` | `stale-while-revalidate` |
|------|-----------------|--------------------------|
| `/api/stats` | 600s (10 min) | 300s |
| `/api/jobs` | 300s (5 min) | 300s |
| `/api/search` | 120s (2 min) | 300s |
| Other `/api/*` | 60s | - |

Stats are also cached in **Cloudflare KV** (`STATS_KV`) with a 15-minute TTL for sub-millisecond global reads.

## Cron Jobs

Configured in `wrangler.toml` to run 4 times daily:

```
0 0 * * *    # Midnight UTC
0 6 * * *    # 06:00 UTC
0 12 * * *   # Noon UTC
0 18 * * *   # 18:00 UTC
```

These trigger the scheduled handler to run ingestion — scraping jobs from all 8 ATS platforms and upserting into D1.

## Local Development

```bash
# Install dependencies
pnpm install

# Apply migrations to local D1
pnpm --filter=@jobsearch/board db:migrate:local

# Start dev server (Vite + Cloudflare Workers local runtime)
pnpm --filter=@jobsearch/board dev
```

The dev server runs both the React frontend and the Workers API locally. Edge cache middleware falls through gracefully when `caches.default` is unavailable.

### Database Commands

```bash
# Generate a new migration from schema changes
pnpm --filter=@jobsearch/board db:generate

# Apply migrations locally
pnpm --filter=@jobsearch/board db:migrate:local

# Apply migrations to production D1
pnpm --filter=@jobsearch/board db:migrate:remote
```

## Deployment

```bash
# Deploy to Cloudflare Workers
pnpm --filter=@jobsearch/board deploy
```

This runs `wrangler deploy`, which builds the Vite frontend and deploys both the SPA assets and the Workers API.

### Placement

Smart placement is enabled (`[placement] mode = "smart"`) so Cloudflare automatically runs the Worker close to the D1 database for lower latency on DB-heavy requests.

## Environment & Bindings

| Binding | Type | Description |
|---------|------|-------------|
| `DB` | D1 Database | Main job board database (`job-board`) |
| `ASSETS` | Fetcher | SPA static assets (auto-configured) |
| `STATS_KV` | KV Namespace | Stats cache for sub-ms global reads |
| `CACHE_PURGE_SECRET` | Secret | Bearer token for `POST /api/cache/purge` |

### Setting Secrets

```bash
# Set the cache purge secret
wrangler secret put CACHE_PURGE_SECRET
```

## Architecture

```
apps/board/
├── src/
│   ├── worker.ts              # Hono app entrypoint (routes + middleware)
│   ├── routes/
│   │   ├── jobs.ts            # GET /api/jobs — list with filters + pagination
│   │   ├── search.ts          # GET /api/search — FTS5 full-text search
│   │   ├── stats.ts           # GET /api/stats — aggregate stats (KV-cached)
│   │   └── cache.ts           # POST /api/cache/purge — purge edge + KV cache
│   ├── middleware/
│   │   ├── cache.ts           # Edge Cache API middleware (CDN layer)
│   │   └── etag.ts            # ETag generation + 304 responses
│   ├── db/
│   │   ├── schema.ts          # Drizzle table definition
│   │   └── queries.ts         # listJobs, searchJobs, getStats
│   └── client/                # React SPA frontend
│       └── lib/
│           ├── api.ts         # API client
│           ├── board-sdk.ts   # Board SDK
│           ├── useBoardStore.ts # State management
│           ├── storage.ts     # Local storage helpers
│           └── utils.ts       # Utilities
├── wrangler.toml              # Workers config, D1, KV, crons
├── package.json
└── tsconfig.json
```

## Author

**Doug Silkstone** -- Lead Full Stack Engineer

[![GitHub](https://img.shields.io/badge/GitHub-dougwithseismic-181717?logo=github)](https://github.com/dougwithseismic)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-dougsilkstone-0A66C2?logo=linkedin)](https://linkedin.com/in/dougsilkstone)
