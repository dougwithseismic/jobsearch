# Job Board App (apps/board) + Data Pipeline (packages/job-ingest)

**Date:** 2026-03-09
**Status:** Planning

---

## Goal

Build a public job board that aggregates engineering jobs from all 9 existing ATS scrapers into a fast, searchable, dense-information interface. Deployed as a single Cloudflare Workers + Pages deployment with D1 for storage and FTS5 for search.

### Success Criteria

- [ ] All 9 scrapers (ashby, greenhouse, lever, workable, recruitee, smartrecruiters, breezyhr, personio, hn-jobs) feed into a unified D1 database
- [ ] Full-text search returns results in <100ms on D1 free tier
- [ ] Job list page loads in <1s with paginated display of 1000+ jobs
- [ ] All filters (remote, region, role type, date range) work via URL params and are shareable
- [ ] Single `wrangler deploy` deploys the full app (Hono API + React SPA)

---

## What's Already Done

### ATS Scrapers (9 packages) -- Complete
- packages/ashby-jobs -- Scrapes jobs.ashbyhq.com API, exports `CompanyJobs[]` with `AshbyJob` type. Fields: id, title, department, team, employmentType, location, isRemote, workplaceType, publishedAt, jobUrl, applyUrl, compensationTierSummary, descriptionPlain
- packages/greenhouse-jobs -- Scrapes Greenhouse boards API. Fields: id (number), title, departments[], offices[], location, updatedAt, absoluteUrl, content (HTML)
- packages/lever-jobs -- Scrapes Lever postings API. Fields: id, title, team, department, location, commitment, workplaceType, hostedUrl, applyUrl, createdAt (unix ms), descriptionPlain
- packages/workable-jobs -- Scrapes Workable widget API. Fields: shortcode, title, department, employmentType, isRemote, country, city, state, publishedAt, jobUrl, applyUrl
- packages/recruitee-jobs -- Scrapes Recruitee API. Similar CompanyJobs pattern.
- packages/smartrecruiters-jobs -- Scrapes SmartRecruiters API. Fields: id, name, department.label, typeOfEmployment.label, location.{city,region,country,remote}, releasedDate, ref
- packages/breezyhr-jobs -- Scrapes BreezyHR boards.
- packages/personio-jobs -- Scrapes Personio job boards.
- packages/hn-jobs -- Parses HN "Who is Hiring?" threads. Fields: company, title, location, isRemote, salary, technologies, url, applyUrl, postedAt, commentUrl. Different structure (no CompanyJobs wrapper).

All scrapers share a common pattern:
- `discoverSlugs(options)` -- finds company slugs via CommonCrawl indexes
- `scrapeAll(slugs, options)` -- concurrent scraping with retry/backoff
- `scrapeCompany(slug, options)` -- single company scrape
- Returns `CompanyJobs[]` with source-specific job types
- Each has `flattenJobs()`, `toJSON()`, `toCSV()` output helpers
- Exception: hn-jobs returns `HNJob[]` directly (no CompanyJobs wrapper)

### Monorepo Infrastructure -- Complete
- Turborepo + pnpm workspaces (`apps/*`, `packages/*`)
- TypeScript strict mode via `packages/typescript-config/base.json` (ES2022, NodeNext)
- Shared eslint config at `packages/eslint-config`
- Root scripts: `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm check-types`
- turbo.json configured for build, lint, check-types, dev tasks

---

## What We're Building Now

### Phase 1: Data Pipeline -- packages/job-ingest

**Priority: HIGH** -- Nothing works without normalized data in D1.

#### 1.1 Unified Job Schema (Drizzle + D1)

- [ ] Create `packages/job-ingest/src/schema.ts` with Drizzle table definition for `jobs` table:
  ```
  jobs table:
    id            TEXT PRIMARY KEY (ulid or uuid)
    source        TEXT NOT NULL (ashby|greenhouse|lever|workable|recruitee|smartrecruiters|breezyhr|personio|hn)
    sourceId      TEXT NOT NULL (original ID from source)
    company       TEXT NOT NULL
    companySlug   TEXT NOT NULL (slugified company name)
    title         TEXT NOT NULL
    department    TEXT
    location      TEXT
    country       TEXT
    region        TEXT (europe|north-america|asia|remote|other)
    isRemote      INTEGER NOT NULL DEFAULT 0 (D1 uses integer for boolean)
    employmentType TEXT
    salary        TEXT
    applyUrl      TEXT NOT NULL
    jobUrl        TEXT NOT NULL
    publishedAt   TEXT (ISO 8601)
    scrapedAt     TEXT NOT NULL (ISO 8601)
    tags          TEXT (JSON array as string)
    descriptionSnippet TEXT (first 300 chars of description, plain text)
  ```
- [ ] Add unique constraint on `(source, sourceId)` to prevent duplicates on re-ingest
- [ ] Create FTS5 virtual table `jobs_fts` indexed on `(title, company, department, location, descriptionSnippet)`
- [ ] Add triggers to keep FTS5 in sync: INSERT, UPDATE, DELETE on `jobs` table
- [ ] Create indexes: `idx_jobs_region`, `idx_jobs_isRemote`, `idx_jobs_publishedAt`, `idx_jobs_companySlug`, `idx_jobs_source`

#### 1.2 Normalizers (one per source)

Each normalizer transforms source-specific types into the unified schema row. File per source in `packages/job-ingest/src/normalizers/`.

- [ ] `ashby.ts` -- Map `AshbyJob` fields. `source: "ashby"`, `sourceId: job.id`, extract country from `job.address?.postalAddress?.addressCountry`, `salary: job.compensationTierSummary`, `descriptionSnippet: job.descriptionPlain?.slice(0, 300)`
- [ ] `greenhouse.ts` -- Map `GreenhouseJob`. `sourceId: String(job.id)` (number to string), `department: job.departments.join(", ")`, `jobUrl: job.absoluteUrl`, `publishedAt: job.updatedAt`, strip HTML from `job.content` for descriptionSnippet
- [ ] `lever.ts` -- Map `LeverJob`. `sourceId: job.id`, `jobUrl: job.hostedUrl`, `publishedAt: new Date(job.createdAt).toISOString()` (createdAt is unix ms), `employmentType: job.commitment`
- [ ] `workable.ts` -- Map `WorkableJob`. `sourceId: job.shortcode`, `location: [job.city, job.state, job.country].filter(Boolean).join(", ")`, `country: job.country`
- [ ] `smartrecruiters.ts` -- Map `SmartRecruitersJob`. `sourceId: job.id`, `title: job.name`, `department: job.department.label`, `employmentType: job.typeOfEmployment.label`, `location: [job.location.city, job.location.region, job.location.country].filter(Boolean).join(", ")`, `country: job.location.country`, `isRemote: job.location.remote`, `publishedAt: job.releasedDate`, `jobUrl: job.ref`
- [ ] `recruitee.ts` -- Inspect `packages/recruitee-jobs/src/types.ts` for field mapping
- [ ] `breezyhr.ts` -- Inspect `packages/breezyhr-jobs/src/types.ts` for field mapping
- [ ] `personio.ts` -- Inspect `packages/personio-jobs/src/types.ts` for field mapping
- [ ] `hn.ts` -- Map `HNJob`. `sourceId: String(job.hnId)`, `jobUrl: job.commentUrl`, `applyUrl: job.applyUrl || job.url || job.commentUrl`, `salary: job.salary`, `tags: JSON.stringify(job.technologies)`, no CompanyJobs wrapper so normalizer accepts `HNJob[]` directly

#### 1.3 Region Mapper

- [ ] Create `packages/job-ingest/src/region.ts` with `classifyRegion(location: string, country: string, isRemote: boolean): Region`
- [ ] Region enum: `"europe" | "north-america" | "asia" | "remote" | "other"`
- [ ] Logic: if `isRemote` and no specific country, return `"remote"`. Otherwise map country to region using a lookup table (ISO country codes to region).
- [ ] Include mapping for common non-standard location strings: "Remote - US", "Berlin, Germany", "EU timezone", "EMEA", etc.
- [ ] Export a `COUNTRY_TO_REGION` map for the ~50 most common countries in tech job listings

#### 1.4 Ingest Orchestrator

- [ ] Create `packages/job-ingest/src/ingest.ts` -- main entry point
- [ ] Function `ingestAll(db: DrizzleD1Database): Promise<IngestResult>` that:
  1. Imports each scraper package (`ashby-jobs`, `greenhouse-jobs`, etc.)
  2. Runs `discoverSlugs()` then `scrapeAll()` for each source (can parallelize across sources)
  3. Passes raw results through the appropriate normalizer
  4. Upserts into D1 via Drizzle (ON CONFLICT(source, sourceId) DO UPDATE)
  5. Rebuilds FTS5 index (or relies on triggers)
  6. Returns stats: `{ total: number, inserted: number, updated: number, errors: number, bySource: Record<string, number> }`
- [ ] Add per-source error isolation -- one failing scraper should not abort the entire run
- [ ] Add logging/progress callbacks for visibility during long runs
- [ ] Estimated scrape time: 5-15 min for all 9 sources (rate limits, CommonCrawl queries)

#### 1.5 CLI Entry Point

- [ ] Create `packages/job-ingest/src/cli.ts` with commands:
  - `ingest --all` -- Run full pipeline (discover + scrape + normalize + upsert)
  - `ingest --source ashby` -- Run single source only
  - `ingest --dry-run` -- Show what would be ingested without writing to DB
  - `ingest --stats` -- Print current DB stats
- [ ] Use `tsx` for local execution: `pnpm tsx packages/job-ingest/src/cli.ts --all`
- [ ] Accept D1 database path/binding via env var for local dev (`--local` flag uses wrangler D1 local)

#### 1.6 Package Setup

- [ ] Create `packages/job-ingest/package.json` with:
  - `name: "@jobsearch/job-ingest"`
  - Dependencies: `drizzle-orm`, all 9 scraper packages as workspace deps
  - Scripts: `ingest`, `build`, `check-types`
- [ ] Create `packages/job-ingest/tsconfig.json` extending `@jobsearch/typescript-config/base.json`
- [ ] Ensure all 9 scraper packages export their types properly (check each `src/index.ts`)

---

### Phase 2: Board App -- apps/board

**Priority: HIGH** -- The user-facing product.

#### 2.1 Project Scaffolding

- [ ] Create `apps/board/package.json`:
  - `name: "@jobsearch/board"`
  - Dependencies: `hono`, `@hono/zod-validator`, `zod`, `drizzle-orm`, `react`, `react-dom`, `react-router`
  - DevDependencies: `vite`, `@vitejs/plugin-react`, `@cloudflare/vite-plugin`, `wrangler`, `drizzle-kit`, `tailwindcss`
  - Scripts: `dev`, `build`, `deploy`, `db:generate`, `db:migrate`
- [ ] Create `apps/board/tsconfig.json` -- extend base, add `"jsx": "react-jsx"`, `"module": "ESNext"`, `"moduleResolution": "bundler"` (Vite requires bundler resolution, not NodeNext)
- [ ] Create `apps/board/vite.config.ts`:
  ```ts
  import { defineConfig } from "vite";
  import react from "@vitejs/plugin-react";
  import { cloudflare } from "@cloudflare/vite-plugin";

  export default defineConfig({
    plugins: [
      react(),
      cloudflare(),
    ],
  });
  ```
- [ ] Create `apps/board/wrangler.toml`:
  ```toml
  name = "job-board"
  compatibility_date = "2025-04-01"

  [[d1_databases]]
  binding = "DB"
  database_name = "job-board"
  database_id = "placeholder-create-via-wrangler"

  [assets]
  binding = "ASSETS"
  not_found_handling = "single-page-application"

  [triggers]
  crons = ["0 6 * * *"]  # Daily at 6 AM UTC
  ```
- [ ] Create `apps/board/drizzle.config.ts` pointing at `src/db/schema.ts` with D1 driver

#### 2.2 Database Layer

- [ ] Create `apps/board/src/db/schema.ts` -- import/re-export schema from `@jobsearch/job-ingest` OR duplicate the Drizzle schema here (simpler for deployment since Workers bundle needs it)
- [ ] Create `apps/board/src/db/queries.ts` with query helpers:
  - `listJobs(db, filters): Promise<{ jobs: Job[], total: number }>` -- paginated, filtered query
  - `searchJobs(db, query, filters): Promise<{ jobs: Job[], total: number }>` -- FTS5 search with filters
  - `getStats(db): Promise<Stats>` -- total jobs, companies, sources, last scrapedAt
  - `getJobsByCompany(db, companySlug): Promise<Job[]>` -- all jobs for a company
- [ ] FTS5 query format: `SELECT jobs.* FROM jobs_fts JOIN jobs ON jobs.rowid = jobs_fts.rowid WHERE jobs_fts MATCH ? ORDER BY rank`
- [ ] Filter composition: build WHERE clauses dynamically from filter params (region, isRemote, employmentType, publishedAt range)
- [ ] Pagination: LIMIT/OFFSET with total count via separate `SELECT COUNT(*)` (or window function)

#### 2.3 Hono API (Worker Entry Point)

- [ ] Create `apps/board/src/worker.ts` -- Hono app with D1 binding:
  ```ts
  import { Hono } from "hono";
  import { drizzle } from "drizzle-orm/d1";
  import jobsRoutes from "./routes/jobs";
  import searchRoutes from "./routes/search";
  import statsRoutes from "./routes/stats";

  type Bindings = { DB: D1Database; ASSETS: Fetcher };
  const app = new Hono<{ Bindings: Bindings }>();

  app.route("/api", jobsRoutes);
  app.route("/api", searchRoutes);
  app.route("/api", statsRoutes);

  export default app;
  ```
- [ ] Create `apps/board/src/routes/jobs.ts`:
  - `GET /api/jobs` -- query params: `page` (default 1), `limit` (default 50, max 100), `region`, `remote` (boolean), `type` (employmentType), `since` (ISO date), `source`, `company`
  - Response: `{ jobs: Job[], total: number, page: number, totalPages: number }`
  - Validate all params with Zod via `@hono/zod-validator`
- [ ] Create `apps/board/src/routes/search.ts`:
  - `GET /api/search?q=<query>` -- same filter params as /api/jobs plus `q` for FTS5
  - Response: same shape as /api/jobs
  - Empty `q` falls back to regular listing
- [ ] Create `apps/board/src/routes/stats.ts`:
  - `GET /api/stats`
  - Response: `{ totalJobs: number, totalCompanies: number, sources: Record<string, number>, lastUpdated: string }`
- [ ] Add CORS headers middleware for local dev
- [ ] Add cache headers: `Cache-Control: public, max-age=300` (5 min) for all GET routes
- [ ] Wire up `scheduled()` handler in worker.ts for cron trigger (calls ingest pipeline)

#### 2.4 Hono RPC Client

- [ ] Export Hono app type from `worker.ts` for RPC: `export type AppType = typeof app`
- [ ] Create `apps/board/src/client/lib/api.ts`:
  ```ts
  import { hc } from "hono/client";
  import type { AppType } from "../../worker";
  const client = hc<AppType>("/");
  export { client };
  ```
- [ ] This gives fully type-safe API calls in React components without manual fetch

#### 2.5 React SPA Shell

- [ ] Create `apps/board/src/client/main.tsx` -- React 19 entry, renders `<App />`
- [ ] Create `apps/board/src/client/App.tsx` -- react-router with routes:
  - `/` -- Home (job list + filters + search)
  - `/company/:slug` -- future, placeholder for now
- [ ] Create `apps/board/src/client/components/Layout.tsx`:
  - Full-width header: logo/title left, stats right (X jobs from Y companies)
  - Sticky filter bar below header
  - Main content area: max-w-[90rem] mx-auto with left/right borders
  - Footer: data sources, last updated timestamp
- [ ] Create `apps/board/index.html` -- Vite entry HTML:
  ```html
  <!DOCTYPE html>
  <html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Engineering Job Board</title>
    <meta name="description" content="Aggregated engineering jobs from 9 ATS platforms. Updated daily." />
    <link rel="preconnect" href="https://rsms.me/" />
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/client/main.tsx"></script>
  </body>
  </html>
  ```

#### 2.6 Styles + Design Tokens

- [ ] Create `apps/board/src/styles/globals.css`:
  ```css
  @import "tailwindcss";

  @theme {
    --color-bg: #16171d;
    --color-bg-elevated: #1e1f26;
    --color-border: #3B3440;
    --color-text-primary: #ffffff;
    --color-text-secondary: #867e8e;
    --color-accent: #b39aff;
    --color-accent-vivid: #6C3BFF;
    --color-accent-deep: #370a7f;
    --font-sans: "Inter", system-ui, sans-serif;
    --font-mono: "JetBrains Mono", "SF Mono", "Fira Code", ui-monospace, monospace;
  }

  body {
    background-color: var(--color-bg);
    color: var(--color-text-primary);
    font-family: var(--font-sans);
  }
  ```
- [ ] Note: Tailwind v4 uses `@theme` directive instead of `tailwind.config.ts`. No config file needed.
- [ ] Use `font-mono` for: company names, locations, dates, job counts, source badges
- [ ] Animated gradient border on hover: `background-size: 400% 400%; animation: gradient-shift 14s ease infinite;` with `@keyframes gradient-shift { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }`

#### 2.7 Core Components

- [ ] `JobRow.tsx` -- Single job row in the list:
  - Layout: `grid grid-cols-[2fr_3fr_1.5fr_auto_auto_auto] gap-0 divide-x divide-border`
  - Cells: Company (mono, truncate) | Title (bold) | Location (mono) | Remote badge (green pill if remote) | Posted date (mono, relative "2d ago") | Source badge (colored by source) | Apply link (external icon)
  - Hover: subtle bg change to bg-elevated, animated gradient left-border accent
  - Click row to expand? No -- keep it simple, link to apply directly
  - Rows separated by `divide-y divide-border`

- [ ] `SearchBar.tsx` -- Search input:
  - Full width input with magnifying glass icon
  - Debounced (300ms) -- updates URL param `q=`
  - Clear button (x) when query is non-empty
  - Monospace placeholder text: "Search jobs, companies, locations..."
  - Border glow on focus (accent color ring)

- [ ] `Filters.tsx` -- Filter controls (horizontal bar):
  - Remote toggle: pill button, active = accent-vivid bg
  - Region dropdown: Europe / North America / Asia / Remote / All
  - Role type dropdown: Full-time / Contract / Internship / All
  - Date range: Last 24h / Last 7d / Last 30d / All
  - Source filter: multi-select pills for each ATS source
  - All filters read from and write to URL search params (useSearchParams)
  - Active filter count badge on mobile collapse

- [ ] `Pagination.tsx` -- Page navigation:
  - Previous / Next buttons + page number display
  - "Page X of Y" with total job count
  - URL param: `page=N`
  - Keyboard: left/right arrow keys for page navigation

- [ ] `StatsBanner.tsx` -- Compact stats display for header:
  - "12,847 jobs from 3,241 companies across 9 sources"
  - Last updated: "Updated 2h ago"
  - All numbers in mono font

#### 2.8 Home Page

- [ ] Create `apps/board/src/client/pages/Home.tsx`:
  - Fetch jobs via Hono RPC client on mount and when filters/page/search change
  - URL is the source of truth: parse all state from `useSearchParams()`
  - Loading state: skeleton rows (8 rows of gray bars matching grid layout)
  - Empty state: "No jobs match your filters" with clear filters button
  - Error state: "Failed to load jobs. Retrying..." with auto-retry

#### 2.9 Data Fetching Pattern

- [ ] Custom hook `useJobs(params)`:
  - Reads URL search params
  - Calls `/api/jobs` or `/api/search` depending on whether `q` param exists
  - Returns `{ jobs, total, totalPages, isLoading, error }`
  - Implements stale-while-revalidate: show old data while new data loads
  - Abort controller: cancel in-flight requests when params change
- [ ] No external data fetching library (no TanStack Query) -- keep it simple with a custom hook + AbortController

---

### Phase 3: Infrastructure + Deployment

**Priority: MEDIUM** -- Needed for production but can test locally first.

#### 3.1 Cloudflare Setup

- [ ] Run `wrangler d1 create job-board` to create D1 database
- [ ] Update `wrangler.toml` with actual database_id
- [ ] Run `drizzle-kit generate` to create migration SQL
- [ ] Apply migration: `wrangler d1 execute job-board --file=drizzle/0001_initial.sql`
- [ ] Verify FTS5 support works on D1 (D1 is SQLite-based, FTS5 should be available)

#### 3.2 Local Development

- [ ] `pnpm --filter=board dev` starts Vite dev server with Cloudflare Workers runtime (miniflare)
- [ ] Local D1 via `--local` flag in wrangler -- stores in `.wrangler/state/`
- [ ] Seed script: `packages/job-ingest/src/seed.ts` -- run ingest against local D1 for dev data
- [ ] Add `board` app to turbo.json build outputs: `["dist/**"]` (Vite outputs to dist)

#### 3.3 Deployment

- [ ] Single command: `pnpm --filter=board run deploy` which runs `wrangler deploy`
- [ ] @cloudflare/vite-plugin handles bundling React SPA as static assets + Worker entry
- [ ] Cron trigger calls `scheduled()` handler in worker.ts daily at 06:00 UTC
- [ ] The scheduled handler needs to either:
  - Option A: Import scraper packages and run ingest inline (large bundle, may hit Worker CPU limits)
  - Option B: Trigger a separate Worker or Durable Object for long-running ingest
  - Option C: Use GitHub Actions for daily scrape, push to D1 via Wrangler CLI
  - **Recommendation: Option C** -- scrapers do heavy HTTP work (CommonCrawl, ATS APIs) that exceeds Worker CPU limits (50ms free, 30s paid). GitHub Actions runs the full ingest pipeline, pushes to D1 via `wrangler d1 execute`.

#### 3.4 GitHub Actions Workflow

- [ ] Create `.github/workflows/ingest.yml`:
  - Schedule: `cron: '0 6 * * *'` (daily 6 AM UTC)
  - Manual trigger: `workflow_dispatch` with optional `source` input
  - Steps: checkout, setup Node 22, pnpm install, build ingest package, run `tsx packages/job-ingest/src/cli.ts --all`, push to D1 via wrangler
  - Secrets needed: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `D1_DATABASE_ID`
  - Timeout: 30 minutes (scraping 9 sources takes time)

---

## Not In Scope

### Authentication / User Accounts
- No login, no signup, no saved searches, no job alerts
- **Why:** This is a public utility. Adding auth adds complexity without value for the core use case (browse + apply). Can add later if needed for saved searches.

### Job Detail Pages
- No dedicated `/job/:id` page with full description rendering
- **Why:** Users click Apply to go to the source ATS. Rendering full descriptions means storing large HTML blobs and handling 9 different description formats. The snippet in the row is enough context.

### Company Pages (deferred to Phase 4)
- `/company/:slug` route exists as placeholder but no implementation
- **Why:** Nice-to-have for browsing all jobs from one company. Low priority vs. core search/filter.

### Email Alerts / Notifications
- No "email me new jobs matching X" feature
- **Why:** Requires email infrastructure (SES/Resend), user accounts, preference storage. Out of scope for v1.

### Analytics / Tracking
- No click tracking, no apply tracking, no analytics dashboard
- **Why:** Keep it clean. No dark patterns. Can add privacy-respecting analytics (Plausible/Fathom) later.

### Mobile App / PWA
- Responsive web only, no PWA manifest, no service worker
- **Why:** The web version works fine on mobile. PWA adds complexity for offline support of data that changes daily.

### Admin Dashboard
- No admin UI for managing scrapers, viewing ingest logs, or editing jobs
- **Why:** CLI + GitHub Actions logs are sufficient for a single operator. Admin UI is overengineering for v1.

---

## Implementation Plan

### Step 1: packages/job-ingest scaffolding (1-2 hours)
1. Create package directory and package.json
2. Install dependencies: `pnpm add drizzle-orm zod`
3. Set up tsconfig extending base
4. Create schema.ts with Drizzle table definition + FTS5 SQL
5. Create region.ts with country-to-region mapping

### Step 2: Normalizers (2-3 hours)
1. Read each scraper's types.ts to understand exact field shapes
2. Write normalizer for each of the 9 sources
3. Unit test each normalizer with fixture data from scraper test fixtures
4. Handle edge cases: missing fields, null values, date format variations

### Step 3: Ingest orchestrator + CLI (2-3 hours)
1. Write ingest.ts that imports all scrapers and normalizers
2. Implement upsert logic (ON CONFLICT DO UPDATE)
3. Add error isolation per source
4. Write CLI entry point with --all, --source, --dry-run flags
5. Test locally with wrangler D1 local

### Step 4: apps/board scaffolding (1-2 hours)
1. Create app directory structure
2. Set up package.json, tsconfig, vite.config.ts, wrangler.toml
3. Install all dependencies via pnpm add
4. Create index.html entry point
5. Verify `pnpm dev` starts the Vite + Workers dev server

### Step 5: Hono API routes (2-3 hours)
1. Create worker.ts with D1 binding
2. Implement /api/jobs with pagination + filters
3. Implement /api/search with FTS5 queries
4. Implement /api/stats
5. Set up Hono RPC type export
6. Test all routes with curl/httpie

### Step 6: React SPA + design (3-4 hours)
1. Set up globals.css with Tailwind v4 theme tokens
2. Build Layout component (header, filter bar, content, footer)
3. Build JobRow component with grid layout
4. Build SearchBar with debounced input
5. Build Filters with URL param sync
6. Build Pagination
7. Wire up Home page with useJobs hook

### Step 7: Seed data + local testing (1-2 hours)
1. Run ingest pipeline locally to populate D1
2. Test all filter combinations
3. Test search with various queries
4. Test pagination edge cases (first/last page, empty results)
5. Test URL param shareability (copy URL, paste in new tab)

### Step 8: Deploy + cron (1-2 hours)
1. Create D1 database via wrangler
2. Run migrations
3. Deploy with wrangler deploy
4. Set up GitHub Actions workflow for daily ingest
5. Verify cron runs and populates data

**Total estimated: 14-22 hours**

---

## Definition of Done

- [ ] `pnpm --filter=board dev` starts a working local dev server with D1
- [ ] All 9 scraper sources are normalized and ingested into D1 without errors
- [ ] FTS5 search returns relevant results for queries like "react remote europe"
- [ ] Filters (remote, region, date, type) correctly narrow results and persist in URL
- [ ] Page loads in <1s, search responds in <200ms on D1
- [ ] `wrangler deploy` deploys the full app in a single command
- [ ] GitHub Actions workflow runs daily and populates D1 with fresh data
- [ ] Responsive layout works on mobile (320px) through desktop (1920px+)
- [ ] TypeScript strict mode passes: `pnpm check-types` clean
- [ ] No runtime errors in console during normal usage

---

## Notes

### Tech Stack Choices

| Choice | Why |
|--------|-----|
| **Vite 7 + React 19** | Fast dev server, React 19 for use() and transitions. Vite over Next.js because we don't need SSR -- D1 handles data, SPA is fine for a job listing. |
| **Hono** | Lightweight, Workers-native, built-in RPC for type-safe client. Express-like DX without the baggage. |
| **Cloudflare D1** | Free tier is generous (5M reads/day). SQLite semantics mean FTS5 works. Single deployment with Workers + Pages. No separate database server to manage. |
| **Drizzle ORM** | Type-safe SQL without the magic of Prisma. D1 driver is first-class. Schema-as-code for migrations. |
| **FTS5 over LIKE queries** | FTS5 is orders of magnitude faster for text search on SQLite. Supports ranking, prefix matching, boolean operators. Built into D1's SQLite engine. |
| **Tailwind v4** | New CSS-first config via @theme directive. No config file. Faster builds. |
| **@cloudflare/vite-plugin** | Official plugin that lets Vite serve the Worker + SPA together. Single `wrangler deploy`. No separate build steps. |
| **URL params as state** | Every filter combination is a shareable URL. No client-side state to manage. Browser back/forward works. Bookmarkable searches. |
| **GitHub Actions for ingest** | Workers have CPU limits (50ms free tier). Scraping 9 ATS sources takes minutes. GitHub Actions gives 6 hours of compute for free. Push results to D1 via Wrangler CLI. |

### Design Principles

- **Dense over pretty** -- Pack information tight. Users scanning 100+ jobs want density, not whitespace. Think Bloomberg terminal, not Dribbble.
- **URL is truth** -- Every view state lives in the URL. No hidden client state. Share a link, get the exact same view.
- **No friction** -- No signup, no cookie banners, no popups. Land on page, see jobs, search, filter, apply.
- **Source attribution** -- Always show which ATS a job came from. Users learn to trust certain sources.

### Key Technical Risks

1. **FTS5 on D1** -- D1 is SQLite but Cloudflare's build may not include FTS5 extension. Mitigation: test early in Step 3. Fallback: use LIKE queries with indexes (slower but works).
2. **Worker bundle size** -- If importing all 9 scraper packages into the Worker for scheduled ingest, the bundle may exceed 10MB limit. Mitigation: Use GitHub Actions (Option C) for ingest, keep Worker lean.
3. **D1 write limits** -- Free tier: 100K writes/day. A full ingest of 9 sources could be 10K+ rows. Should be fine, but watch batch sizes. Use transactions for bulk inserts.
4. **Scraper API changes** -- ATS platforms change APIs without notice. Each normalizer should handle missing/changed fields gracefully with fallback defaults.

---

## Next Steps (Future Phases)

### Phase 4: Company Pages
- `/company/:slug` showing all jobs from one company
- Company metadata (logo, description, location, size) -- scrape from ATS or manually curate
- Link to company website

### Phase 5: Job Detail + Apply Tracking
- `/job/:id` page with full description rendering
- "Apply" click tracking (privacy-respecting, no PII)
- Analytics dashboard: most viewed jobs, most applied companies

### Phase 6: Alerts + Saved Searches
- Email alerts for new jobs matching saved filters
- Requires auth (magic link), Resend for email
- Weekly digest option

### Phase 7: API Access
- Public REST API with rate limiting for third-party integrations
- API key auth for heavy users
- OpenAPI spec auto-generated from Hono routes
