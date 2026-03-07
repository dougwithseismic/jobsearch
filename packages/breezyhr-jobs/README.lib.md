# breezyhr-jobs

**Scrape every job on Breezy HR. Hundreds of companies. One command.**

[![npm version](https://img.shields.io/npm/v/breezyhr-jobs.svg)](https://www.npmjs.com/package/breezyhr-jobs)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node >= 18](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success)](https://www.npmjs.com/package/breezyhr-jobs)
[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/breezyhr-jobs-scraper)

---

Breezy HR is the ATS behind **Hubstaff, Attentive**, and hundreds of other companies. Their job boards live at `{company}.breezy.hr` with a public JSON API at `{company}.breezy.hr/json`.

`breezyhr-jobs` discovers every company using BreezyHR via Common Crawl, hits each company's public JSON endpoint, and gives you a structured feed of every open role. JSON, CSV, or filtered search.

## Install

```bash
# Global CLI
npm install -g breezyhr-jobs

# Or run directly
npx breezyhr-jobs scrape

# Or with pnpm
pnpm add -g breezyhr-jobs
```

## Quick Start

```bash
# Scrape everything -- discover companies, fetch all jobs, output JSON
breezyhr-jobs scrape

# Scrape a single company
breezyhr-jobs scrape --company hubstaff --format table

# Find engineering jobs in Europe
breezyhr-jobs search --location "europe|germany|uk|france|czech" --department "engineering"

# Remote jobs with specific keywords
breezyhr-jobs search --location "remote" --keyword "senior|staff" --format table

# Only remote jobs
breezyhr-jobs scrape --remote --format table
```

## CLI Reference

```
USAGE:
  breezyhr-jobs <command> [options]

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
  --keyword <regex>     Filter by title/content keyword
  --salary <regex>      Filter by salary pattern
  --remote              Show only remote jobs

OUTPUT OPTIONS:
  --output, -o <dir>    Output directory (default: ./breezyhr-data)
  --format <fmt>        Output format: json, csv, table (default: json)
  --limit <n>           Limit number of results

GENERAL:
  --concurrency, -c <n> Concurrent requests (default: 10)
  --quiet, -q           Suppress progress output
  --help, -h            Show this help
  --version, -v         Show version
```

## API Reference

### `discoverSlugs(options?): Promise<string[]>`

Discover company subdomains from Common Crawl web indexes.

```ts
import { discoverSlugs } from 'breezyhr-jobs';

const slugs = await discoverSlugs({
  onProgress: (msg) => console.log(msg),
});
// ['attentive', 'breezy', 'hubstaff', ...]
```

### `scrapeCompany(slug, options?): Promise<CompanyJobs | null>`

Scrape a single company's job board.

```ts
import { scrapeCompany } from 'breezyhr-jobs';

const result = await scrapeCompany('hubstaff');
if (result) {
  console.log(`${result.company}: ${result.jobCount} jobs`);
  for (const job of result.jobs) {
    console.log(`  ${job.name} - ${job.location.name}`);
  }
}
```

Returns `null` for 404s, empty boards, and companies that redirect to custom career sites (non-JSON responses).

### `scrapeAll(slugs, options?): Promise<CompanyJobs[]>`

Scrape multiple companies concurrently.

```ts
import { scrapeAll } from 'breezyhr-jobs';

const results = await scrapeAll(['hubstaff', 'attentive', 'breezy'], {
  concurrency: 5,
  onProgress: (done, total, found) => {
    console.log(`${done}/${total} checked, ${found} with jobs`);
  },
});
```

### `searchJobs(results, query): CompanyJobs[]`

Filter and search across scraped results.

```ts
import { searchJobs } from 'breezyhr-jobs';

const filtered = searchJobs(results, {
  text: 'engineer',
  filters: {
    location: /europe|remote/i,
    department: /engineering/i,
    remoteOnly: true,
  },
  limit: 50,
});
```

### Output Formatters

```ts
import { toJSON, toCSV, toTable, flattenJobs } from 'breezyhr-jobs';

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
interface BreezyJob {
  id: string;
  friendlyId: string;
  name: string;
  url: string;
  publishedDate: string;
  type: { id: string; name: string };
  location: BreezyLocation;
  department: string;
  salary: string;
  company: BreezyCompanyInfo;
  locations: BreezyLocationEntry[];
}

interface BreezyLocation {
  country: { name: string; id: string } | null;
  state: { id: string; name: string } | null;
  city: string;
  primary: boolean;
  isRemote: boolean;
  name: string;
}

interface CompanyJobs {
  company: string;
  slug: string;
  jobCount: number;
  jobs: BreezyJob[];
  scrapedAt: string;
}

interface JobFilter {
  location?: RegExp;
  department?: RegExp;
  keyword?: RegExp;
  salary?: RegExp;
  remoteOnly?: boolean;
}
```

## How Discovery Works

1. Query Common Crawl indexes for `*.breezy.hr/*` URLs
2. Extract unique subdomains from the URL hosts
3. Validate against known slug patterns (filter noise like `www`, `app`, `api`)
4. Merge with a curated list of known companies
5. Return sorted, deduplicated array

## License

MIT
