# greenhouse-jobs

**Scrape every job on Greenhouse. Thousands of companies. One command.**

[![npm version](https://img.shields.io/npm/v/greenhouse-jobs.svg)](https://www.npmjs.com/package/greenhouse-jobs)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node >= 18](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success)](https://www.npmjs.com/package/greenhouse-jobs)
[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/greenhouse-jobs-scraper)

---

Greenhouse is the ATS behind **Airbnb, Stripe, Cloudflare, Figma, Spotify, Netflix, Pinterest**, and thousands of other companies. Their job boards live at `boards.greenhouse.io/{company}` -- but there's no central index.

`greenhouse-jobs` fixes that. It discovers every company using Greenhouse via Common Crawl, hits Greenhouse's public job board API, and gives you a structured feed of every open role. JSON, CSV, or filtered search.

## Install

```bash
# Global CLI
npm install -g greenhouse-jobs

# Or run directly
npx greenhouse-jobs scrape

# Or with pnpm
pnpm add -g greenhouse-jobs
```

## Quick Start

```bash
# Scrape everything -- discover companies, fetch all jobs, output JSON
greenhouse-jobs scrape

# Scrape a single company
greenhouse-jobs scrape --company stripe --format table

# Find engineering jobs in Europe
greenhouse-jobs search --location "europe|germany|uk|france|czech" --department "engineering"

# Remote jobs with specific keywords
greenhouse-jobs search --location "remote" --keyword "senior|staff" --format table
```

## CLI Reference

```
USAGE:
  greenhouse-jobs <command> [options]

COMMANDS:
  discover              Discover company slugs from Common Crawl
  scrape                Full run: discover slugs + scrape all companies
  search <query>        Search previously scraped job data

SCRAPE OPTIONS:
  --slugs <file>        Scrape from a slug file (one per line)
  --company <slug>      Scrape a single company

FILTER OPTIONS:
  --location <regex>    Filter by location pattern
  --department <regex>  Filter by department pattern
  --office <regex>      Filter by office pattern
  --keyword <regex>     Filter by title/content keyword

OUTPUT OPTIONS:
  --output, -o <dir>    Output directory (default: ./greenhouse-data)
  --format <fmt>        Output format: json, csv, table (default: json)
  --content             Include full HTML job descriptions
  --limit <n>           Limit number of results

GENERAL:
  --concurrency, -c <n> Concurrent requests (default: 10)
  --quiet, -q           Suppress progress output
  --help, -h            Show this help
  --version, -v         Show version
```

## API Reference

### `discoverSlugs(options?): Promise<string[]>`

Discover company board tokens from Common Crawl web indexes.

```ts
import { discoverSlugs } from 'greenhouse-jobs';

const slugs = await discoverSlugs({
  onProgress: (msg) => console.log(msg),
});
// ['airbnb', 'cloudflare', 'figma', 'stripe', ...]
```

### `scrapeCompany(slug, options?): Promise<CompanyJobs | null>`

Scrape a single company's job board.

```ts
import { scrapeCompany } from 'greenhouse-jobs';

const result = await scrapeCompany('stripe');
if (result) {
  console.log(`${result.company}: ${result.jobCount} jobs`);
  for (const job of result.jobs) {
    console.log(`  ${job.title} - ${job.location}`);
  }
}
```

Options:
- `includeContent?: boolean` -- Include full HTML job descriptions (default: false)

### `scrapeAll(slugs, options?): Promise<CompanyJobs[]>`

Scrape multiple companies concurrently.

```ts
import { scrapeAll } from 'greenhouse-jobs';

const results = await scrapeAll(['stripe', 'airbnb', 'figma'], {
  concurrency: 5,
  includeContent: false,
  onProgress: (done, total, found) => {
    console.log(`${done}/${total} checked, ${found} with jobs`);
  },
});
```

### `searchJobs(results, query): CompanyJobs[]`

Filter and search across scraped results.

```ts
import { searchJobs } from 'greenhouse-jobs';

const filtered = searchJobs(results, {
  text: 'engineer',
  filters: {
    location: /europe|remote/i,
    department: /engineering/i,
  },
  limit: 50,
});
```

### Output Formatters

```ts
import { toJSON, toCSV, toTable, flattenJobs } from 'greenhouse-jobs';

// JSON string (pretty or compact)
const json = toJSON(results);
const compact = toJSON(results, false);

// CSV string
const csv = toCSV(results);

// Aligned text table
const table = toTable(results);

// Flat array for custom processing
const rows = flattenJobs(results);
```

## Types

```ts
interface GreenhouseJob {
  id: number;
  title: string;
  location: string;
  departments: string[];
  offices: string[];
  content?: string;           // HTML, only with includeContent
  updatedAt: string;
  absoluteUrl: string;
  internalJobId: number;
  metadata: GreenhouseMetadata[];
}

interface CompanyJobs {
  company: string;
  slug: string;
  jobCount: number;
  jobs: GreenhouseJob[];
  scrapedAt: string;
}

interface JobFilter {
  location?: RegExp;
  department?: RegExp;
  office?: RegExp;
  keyword?: RegExp;
}
```

## How Discovery Works

1. Query Common Crawl indexes for `boards.greenhouse.io/*` URLs
2. Extract unique board tokens from the URL paths
3. Validate against known slug patterns (filter noise like `embed`, `api`)
4. Merge with a curated list of known companies
5. Return sorted, deduplicated array

## License

MIT
