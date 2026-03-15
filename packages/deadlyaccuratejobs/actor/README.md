# deadlyaccuratejobs - One Search, Every ATS

[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/deadlyaccuratejobs)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-23-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Search for a company by name. Get back every open job. No need to know which ATS they use.

```bash
deadlyaccuratejobs Stripe
# Resolved on: greenhouse (stripe)
# Total jobs: 526 | After filters: 526 | Time: 0.6s
```

## Why this one?

| Feature | deadlyaccuratejobs | Individual ATS scrapers | Manual search |
|---------|-------------------|------------------------|---------------|
| Auto-resolves company to ATS | Yes | No - you pick the right one | No |
| Searches all 8 platforms at once | Yes | One at a time | No |
| Unified output schema | Yes | ATS-specific | Varies |
| Filters (remote, location, seniority) | Yes | Per-scraper | Limited |
| Discovers company slug automatically | Yes | You provide it | Manual |
| Time from "I want Stripe jobs" to results | ~1 second | Minutes of setup | Hours |

Other scrapers require you to know the company uses Greenhouse, that their slug is `stripe`, and then run the right scraper. This one just asks "who?"

## How it works

```
"Stripe" ──> Resolver ──> [greenhouse: stripe] ──> Scraper ──> Normalizer ──> Unified Jobs
                |                                      |              |
                |  Fetches 3,114 slugs from           |  Hits the    |  Maps ATS-specific
                |  Cloudflare KV across 8 platforms   |  ATS API     |  fields to one schema
                |  in parallel. Fuzzy matches name.   |              |
```

**Supported ATS platforms:** Greenhouse, Lever, Ashby, Workable, SmartRecruiters, BreezyHR, Personio, Recruitee

**Slug coverage:** 3,114 companies across all 8 platforms, auto-discovered via SearXNG and stored in Cloudflare KV.

## Quick start

### CLI

```bash
# Search for a company
npx tsx packages/deadlyaccuratejobs/bin/cli.ts Stripe

# Remote engineering jobs only
npx tsx packages/deadlyaccuratejobs/bin/cli.ts Stripe --remote --keyword engineer

# Senior/Staff roles in Europe
npx tsx packages/deadlyaccuratejobs/bin/cli.ts Notion --seniority senior,staff --location europe

# Just check which ATS a company uses
npx tsx packages/deadlyaccuratejobs/bin/cli.ts resolve Figma

# Platform stats
npx tsx packages/deadlyaccuratejobs/bin/cli.ts stats
```

### Library

```typescript
import { getJobs, resolveCompany, getStats } from "@jobsearch/deadlyaccuratejobs";

// The magic call
const result = await getJobs("Stripe", {
  remote: true,
  location: "europe",
  keyword: "engineer",
  seniority: ["senior", "staff"],
  since: "7d",
  limit: 50,
});

console.log(result.jobs);       // UnifiedJob[]
console.log(result.matches);    // [{ ats: "greenhouse", slug: "stripe", confidence: "exact" }]
console.log(result.totalJobs);  // 526

// Just resolve — no scraping
const matches = await resolveCompany("Notion");
// [{ ats: "ashby", slug: "notion", confidence: "exact" }]

// Platform stats
const stats = await getStats();
// { totalSlugs: 3114, platforms: [{ source: "greenhouse", slugCount: 581 }, ...] }
```

### Apify Actor

```json
{
  "mode": "search",
  "company": "Stripe",
  "remoteOnly": true,
  "keywordFilter": "engineer",
  "seniorityFilter": "senior,staff",
  "limit": 50
}
```

## Commands

| Command | Description | Example |
|---------|-------------|---------|
| `<company>` | Search all jobs at a company | `deadlyaccuratejobs Stripe` |
| `resolve <company>` | Show which ATS platform(s) match | `deadlyaccuratejobs resolve Figma` |
| `stats` | Show slug counts per platform | `deadlyaccuratejobs stats` |

## Filters

| Flag | Type | Description | Example |
|------|------|-------------|---------|
| `--remote` | boolean | Remote jobs only | `--remote` |
| `--location` | regex | Match location, country, or region | `--location "europe\|london"` |
| `--keyword` | regex | Match title, department, description, tags | `--keyword "engineer\|developer"` |
| `--department` | regex | Match department name | `--department "engineering"` |
| `--seniority` | list | Filter by seniority level | `--seniority senior,staff,lead` |
| `--since` | duration | Jobs published/scraped since | `--since 2d` or `--since 2026-03-10` |
| `--limit` | number | Max results | `--limit 25` |
| `--format` | string | Output format: table, json, csv | `--format json` |
| `--api-url` | string | Override slug API URL | `--api-url http://localhost:8787` |

Duration formats: `3h` (hours), `2d` (days), `1w` (weeks), `1m` (months), or ISO date string.

## Output schema (UnifiedJob)

Every job from every ATS produces this exact shape:

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `greenhouse_7546284` |
| `title` | string | `Senior Software Engineer` |
| `location.text` | string | `San Francisco, CA` |
| `location.country` | string | `US` |
| `location.region` | string | `north-america` |
| `workplaceType` | enum | `remote` / `hybrid` / `onsite` |
| `seniorityLevel` | enum | `senior` / `staff` / `lead` / ... |
| `department` | string | `Engineering` |
| `employmentType` | enum | `full-time` / `contract` / ... |
| `salary.text` | string | `$150,000 - $200,000` |
| `salary.min` / `max` | number | `150000` / `200000` |
| `company.name` | string | `Stripe` |
| `company.ats` | string | `greenhouse` |
| `applyUrl` | string | `https://boards.greenhouse.io/stripe/jobs/7546284#app` |
| `publishedAt` | ISO string | `2026-03-13T19:00:45Z` |
| `tags` | string[] | `["engineering", "san-francisco"]` |

Full schema: [`packages/job-ingest/src/unified-schema.ts`](../job-ingest/src/unified-schema.ts)

## Resolver strategy

The resolver maps company names to ATS slugs in three passes:

1. **Exact match** — Slugify input, look up across all 8 platform slug lists
2. **Variant match** — Try common suffixes: `-inc`, `-io`, `-co`, `-hq`, `-labs`, `-ai`, `-tech`, etc.
3. **Substring match** — If name is 3+ chars and no hits yet, check prefix matches

All 3,114 slugs are fetched from `https://job-slugs.wd40.workers.dev` in parallel and cached in memory for 5 minutes.

**Adding new companies:** Run SearXNG discovery → upload to KV → they become resolvable:
```bash
npx tsx packages/job-ingest/discover.ts --platform greenhouse
npx tsx packages/job-ingest/upload-slugs.ts --url https://job-slugs.wd40.workers.dev --token SECRET
```

## Apify Actor input schema

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `mode` | string | `search` | `search`, `resolve`, `stats`, or `direct` |
| `company` | string | | Company name (modes: search, resolve) |
| `slug` | string | | Direct slug (mode: direct) |
| `ats` | string | | Direct ATS platform (mode: direct) |
| `remoteOnly` | boolean | `false` | Remote jobs only |
| `locationFilter` | string | | Regex location filter |
| `keywordFilter` | string | | Regex keyword filter |
| `departmentFilter` | string | | Regex department filter |
| `seniorityFilter` | string | | Comma-separated seniority levels |
| `sinceFilter` | string | | Duration or ISO date |
| `limit` | number | | Max results |
| `slugApiUrl` | string | | Override slug KV API URL |

## Architecture

```
packages/deadlyaccuratejobs/
├── src/
│   ├── index.ts           # Public API exports
│   ├── types.ts           # TypeScript types (re-exports unified schema)
│   ├── resolver.ts        # Company → ATS resolution via KV slug index
│   ├── orchestrator.ts    # Parallel scrape + normalize + filter
│   ├── filters.ts         # Unified filtering on rich UnifiedJob schema
│   └── __tests__/         # 13 tests (unit + integration)
├── bin/
│   └── cli.ts             # CLI: search, resolve, stats
├── actor/
│   ├── src/main.ts        # Apify actor wrapper
│   ├── package.json
│   └── apify.json
├── package.json
└── tsconfig.json
```

**Dependencies:** Relies on the existing scraper packages (`greenhouse-jobs`, `lever-jobs`, etc.) and `@jobsearch/job-ingest` for normalizers. No new external dependencies.

## Infrastructure

| Component | Purpose | URL |
|-----------|---------|-----|
| Cloudflare KV Worker | Stores 3,114 company slugs | `https://job-slugs.wd40.workers.dev` |
| SearXNG (Docker) | Discovers new company slugs | `http://localhost:8888` |
| Individual ATS APIs | Source job data | `boards.greenhouse.io`, etc. |
| Cloudflare D1 | Persistent job storage | Via `apps/board` |

## Performance

| Company | ATS | Jobs | Resolution + Scrape Time |
|---------|-----|------|--------------------------|
| Stripe | greenhouse | 526 | 0.6s |
| Notion | ashby | 151 | 1.9s |
| Spotify | lever | 154 | 9.5s |
| Canva | smartrecruiters | 341 | 4.9s |
| Discord | greenhouse | 83 | 0.3s |
| Figma | greenhouse | 164 | 0.3s |

Resolution (fetching slug index) is ~100ms on first call, instant on subsequent calls due to 5-minute in-memory cache.

## Author

**Doug Silkstone** — Lead Full Stack Engineer

[![GitHub](https://img.shields.io/badge/GitHub-dougwithseismic-181717?logo=github)](https://github.com/dougwithseismic)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-dougsilkstone-0A66C2?logo=linkedin)](https://linkedin.com/in/dougsilkstone)
[![Apify](https://img.shields.io/badge/Apify-deadlyaccurate-00C853?logo=apify)](https://apify.com/deadlyaccurate)
