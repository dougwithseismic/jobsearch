# lever-jobs

**Scrape every job on Lever. Auto-discover companies. One command.**

[![npm version](https://img.shields.io/npm/v/lever-jobs.svg)](https://www.npmjs.com/package/lever-jobs)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node >= 18](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success)](https://www.npmjs.com/package/lever-jobs)
[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/lever-jobs-scraper)

---

Lever is the ATS behind **Netflix, Spotify, Shopify, Cloudflare, Figma, Stripe**, and thousands of other companies. Their job boards live at `jobs.lever.co/{company}` — but there's no central index.

`lever-jobs` fixes that. It discovers every company using Lever via Common Crawl, hits Lever's public posting API, and gives you a structured feed of every open role. JSON, CSV, or filtered search.

## Install

```bash
# Global CLI
npm install -g lever-jobs

# Or run directly
npx lever-jobs scrape

# Or with pnpm
pnpm add -g lever-jobs
```

## Quick Start

```bash
# Scrape everything — discover companies, fetch all jobs, output JSON
lever-jobs scrape

# Find remote engineering jobs in Europe
lever-jobs search --remote --location "europe|germany|uk|france|czech" --department "engineering"

# Single company
lever-jobs scrape --company netflix
```

## CLI Reference

### Commands

| Command | Description |
|---------|-------------|
| `discover` | Find all company slugs via Common Crawl (no scraping) |
| `scrape` | Full pipeline: discover slugs, then fetch all jobs |
| `search` | Filter and search previously scraped data |

### Options

| Option | Alias | Default | Description |
|--------|-------|---------|-------------|
| `--output <path>` | `-o` | `./lever-data` | Output directory |
| `--format <type>` | | `json` | Output format: `json`, `csv`, or `table` |
| `--concurrency <n>` | `-c` | `10` | Max concurrent API requests |
| `--remote` | | `false` | Only include remote jobs |
| `--location <regex>` | | | Filter by location (regex pattern) |
| `--department <regex>` | | | Filter by department (regex pattern) |
| `--keyword <regex>` | | | Filter by title or description (regex pattern) |
| `--descriptions` | | `false` | Include full job descriptions (larger output) |
| `--company <slug>` | | | Scrape a single company by slug |
| `--limit <n>` | | | Max number of jobs to return |
| `--slugs <file>` | | | Scrape from a file of slugs (one per line) |
| `--quiet` | `-q` | | Suppress progress output |

## Library API

```typescript
import {
  discoverSlugs,
  scrapeCompany,
  scrapeAll,
  searchJobs,
  toJSON,
  toCSV,
  toTable,
  flattenJobs,
} from 'lever-jobs';
```

### `discoverSlugs(options?)`

Discover company slugs from Common Crawl indexes.

```typescript
const slugs = await discoverSlugs();
// ['affirm', 'canva', 'cloudflare', 'coinbase', ...]
```

### `scrapeCompany(slug, options?)`

Scrape a single company's job board.

```typescript
const result = await scrapeCompany('netflix');
// { company: 'netflix', slug: 'netflix', jobCount: 42, jobs: [...], scrapedAt: '...' }
```

### `scrapeAll(slugs, options?)`

Scrape multiple companies concurrently.

```typescript
const results = await scrapeAll(slugs, {
  concurrency: 10,
  includeDescriptions: false,
  onProgress: (done, total, found) => {
    console.log(`${done}/${total} checked, ${found} with jobs`);
  },
});
```

### `searchJobs(results, query)`

Search and filter across scraped results.

```typescript
const filtered = searchJobs(results, {
  text: 'senior engineer',
  filters: {
    remote: true,
    location: /europe/i,
    department: /engineering/i,
  },
  limit: 50,
});
```

### Output Formatters

```typescript
// JSON string
const json = toJSON(results);

// CSV string
const csv = toCSV(results);

// Formatted text table
const table = toTable(results);

// Flat array of job rows
const rows = flattenJobs(results);
```

## Types

```typescript
interface LeverJob {
  id: string;
  title: string;
  team: string;
  department: string;
  location: string;
  commitment: string;       // Full-time, Part-time, Contract, etc.
  allLocations: string[];
  workplaceType: string;     // unspecified, on-site, remote, hybrid
  description: string;       // HTML
  descriptionPlain: string;
  lists: LeverList[];        // Requirements, responsibilities, etc.
  additional: string;        // HTML
  hostedUrl: string;
  applyUrl: string;
  createdAt: number;         // Unix timestamp (ms)
}

interface CompanyJobs {
  company: string;
  slug: string;
  jobCount: number;
  jobs: LeverJob[];
  scrapedAt: string;
}
```

## How It Works

1. **Discovery** — Queries Common Crawl indexes for `jobs.lever.co/*` URLs, extracts unique company slugs
2. **Scraping** — Hits `api.lever.co/v0/postings/{slug}?mode=json` for each company (public API, no auth)
3. **Filtering** — Applies regex filters on location, department, keywords, and remote status
4. **Output** — Formats results as JSON, CSV, or aligned text tables

## License

MIT
