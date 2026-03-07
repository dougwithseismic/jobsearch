# awesome-jobs-scraper

Unified job scraper that aggregates all 7 ATS packages into a single, consistent output format. One actor, one schema, every job board.

## Package: `packages/job-schema`

Zero-dependency types + mapper package. Every scraper maps into `UnifiedJob`.

### UnifiedJob interface

```typescript
interface UnifiedJob {
  source: "ashby" | "greenhouse" | "lever" | "smartrecruiters" | "workable" | "recruitee" | "hn";
  sourceId: string;
  company: string;
  companySlug: string;
  title: string;
  department: string | null;
  employmentType: string | null;
  location: string;
  country: string | null;
  city: string | null;
  isRemote: boolean;
  jobUrl: string;
  applyUrl: string | null;
  description: string | null;
  descriptionHtml: string | null;
  publishedAt: string; // ISO 8601
  salary: string | null;
  technologies: string[] | null;
  tags: Record<string, string>;
}
```

### Tasks

- [ ] Create `packages/job-schema/` with tsconfig, package.json (`job-schema`, no deps)
- [ ] `src/types.ts` — `UnifiedJob` interface + source literal type
- [ ] `src/mappers/ashby.ts` — `fromAshby(job, company, slug): UnifiedJob`
  - `descriptionPlain` / `descriptionHtml` both available
  - `compensationTierSummary` → `salary`
  - `secondaryLocations` → ignore, use primary `location`
- [ ] `src/mappers/greenhouse.ts` — `fromGreenhouse(job, company, slug): UnifiedJob`
  - `departments[]` → join with `, `
  - `content` is HTML → strip for `description`, keep for `descriptionHtml`
  - No remote field — set `isRemote: false` (don't guess from location text)
  - No `applyUrl` — set null
  - `updatedAt` → `publishedAt` (best available date)
- [ ] `src/mappers/lever.ts` — `fromLever(job, company, slug): UnifiedJob`
  - `createdAt` is epoch ms → `new Date(createdAt).toISOString()`
  - `commitment` → `employmentType`
  - `descriptionPlain` for text, build HTML from `description` + `lists`
  - `hostedUrl` → `jobUrl`
- [ ] `src/mappers/smartrecruiters.ts` — `fromSmartRecruiters(job): UnifiedJob`
  - Company comes from nested `job.company.name` / `.identifier`
  - Location: `job.location.city, job.location.region, job.location.country`
  - `job.location.remote` → `isRemote`
  - `name` → `title`
  - `typeOfEmployment.label` → `employmentType`
  - `department.label` → `department`
  - Build `jobUrl` from `ref`
- [ ] `src/mappers/workable.ts` — `fromWorkable(job, company, slug): UnifiedJob`
  - `isRemote` already exists
  - `city`, `country`, `state` → combine into `location` string
  - `descriptionHtml` available, strip for plain text
  - `shortcode` → `sourceId`
- [ ] `src/mappers/recruitee.ts` — `fromRecruitee(job, company, slug): UnifiedJob`
  - `remote` → `isRemote`
  - `description` + `requirements` → combine for full description (both are HTML)
  - `careersUrl` → `jobUrl`
  - `tags[]` → put in `tags` record
  - `companySlug` field name differs (`companySlug` not `slug` in FlatJob)
- [ ] `src/mappers/hn.ts` — `fromHN(job): UnifiedJob`
  - Only source with `salary` and `technologies`
  - `company` exists but no `companySlug` — slugify from company name
  - `commentUrl` → `jobUrl`
  - `description` is plain text, no HTML version
  - `threadMonth` → put in `tags`
- [ ] `src/index.ts` — re-export all types and mapper functions
- [ ] Tests for each mapper — feed real API response fixtures, assert UnifiedJob shape
- [ ] HTML-to-plain-text utility (shared by greenhouse, smartrecruiters, workable, recruitee mappers). Lightweight, no heavy deps — strip tags, decode entities, normalize whitespace.

---

## Package: `packages/awesome-jobs-scraper`

Apify actor + library that orchestrates all 7 scrapers and outputs unified results.

### Input schema

```json
{
  "sources": ["ashby", "greenhouse", "lever", "smartrecruiters", "workable", "recruitee", "hn"],
  "mode": "all | companies | search",
  "companies": { "ashby": ["linear", "notion"], "greenhouse": ["stripe"] },
  "remoteOnly": false,
  "locationFilter": "europe|germany|uk",
  "departmentFilter": "engineering|product",
  "keywordFilter": "senior|staff|lead",
  "concurrency": 10,
  "maxCompaniesPerSource": 100,
  "includeDescriptions": true,
  "months": 2
}
```

### Tasks

- [ ] Create `packages/awesome-jobs-scraper/` — package.json, tsconfig
- [ ] Depends on all 7 scraper packages + `job-schema` via `workspace:*`
- [ ] `src/orchestrator.ts` — runs selected sources in parallel, maps all results through `job-schema` mappers
  - Each source runs independently — if one fails, others continue
  - Progress reporting: per-source status + aggregate counts
  - Memory-aware: stream results to dataset, don't hold everything in memory
- [ ] `src/dedup.ts` — optional deduplication
  - Match on normalized `company` + `title` + `city`
  - Mark duplicates with `duplicate: true` rather than dropping them
  - Cross-source dupes are common (same company on Greenhouse + Lever)
- [ ] `src/filters.ts` — unified filtering layer
  - Apply filters AFTER mapping to UnifiedJob (consistent field names)
  - `remoteOnly`, `locationFilter`, `departmentFilter`, `keywordFilter` — same regex approach as individual packages
- [ ] `.actor/` directory — full Apify actor setup
  - `actor.json` — title: "Awesome Jobs Scraper - Every ATS, One Format"
  - `input_schema.json` — sources picker, mode, filters, per-source company lists
  - `output_schema.json` — UnifiedJob fields
  - `dataset_schema.json` — UnifiedJob
  - Dockerfile — two-stage build, workspace deps
- [ ] `actor/src/main.ts` — Apify entry point
  - Read input, select sources, run orchestrator
  - Push each UnifiedJob to default dataset via `Actor.pushData()`
  - Write SUMMARY to key-value store: total jobs per source, filters applied, dupes found, elapsed time
- [ ] CLI: `bin/cli.ts`
  - `awesome-jobs scrape --sources ashby,greenhouse --remote-only`
  - `awesome-jobs scrape --all` (all 7 sources)
  - Output as JSON, CSV, or table
- [ ] README.md (Apify-facing)
  - Positioning: "Why use 7 actors when you can use 1?"
  - Show the unified output format
  - Price comparison vs running each actor separately
  - Use cases: cross-ATS job boards, market research, unified job feeds
- [ ] README.lib.md — library/CLI docs
- [ ] Tests
  - Orchestrator: mock each scraper, verify unified output
  - Dedup: test cross-source matching
  - Filters: test against UnifiedJob fields
  - Integration: real API calls for 1-2 companies per source (tagged as slow/integration)

---

## Pricing strategy

Individual actors charge per result. This actor calls multiple sources, so pricing should reflect the value of aggregation:

- Option A: Charge per result same as cheapest individual actor (~$0.002/result). Volume play.
- Option B: Charge slightly more per result ($0.005) but emphasize the convenience + dedup + unified format.
- Option C: Flat monthly for power users, per-result for casual. Apify supports both.

Recommendation: **$0.003/result** — cheaper than running Greenhouse ($0.005) + Lever ($0.003) + Ashby ($0.005) separately, but more than any single source. The unified format and dedup justify the premium over the cheapest individual actor.

---

## Execution order

1. `job-schema` first (types + mappers, no external deps)
2. Add `job-schema` as dependency to each existing scraper package, add `.toUnified()` exports
3. `awesome-jobs-scraper` last (depends on everything)
4. Push to Apify, test with real data
5. Set pricing, publish to Store

---

## What this does NOT do

- No normalization of department names across sources (too lossy — "Engineering" vs "Product Engineering" should stay as-is)
- No employment type normalization beyond what the source gives
- No runtime validation (zod) — just TypeScript types and pure functions
- No `originalData` blob — use `tags` for source-specific extras, or use the individual package directly
- No browser/proxy — all sources are public APIs with lightweight HTTP
