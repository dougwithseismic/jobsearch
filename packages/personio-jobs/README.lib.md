# personio-jobs

**Scrape every job on Personio. Hundreds of European companies. One command.**

[![npm version](https://img.shields.io/npm/v/personio-jobs.svg)](https://www.npmjs.com/package/personio-jobs)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node >= 18](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success)](https://www.npmjs.com/package/personio-jobs)
[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/personio-jobs-scraper)

---

Personio is the dominant ATS/HR platform in Europe, powering careers pages for **N26, Celonis, Sennder, Taxfix, Contentful, Gorillas**, and hundreds more. Their job boards live at `{company}.jobs.personio.de` -- but there's no central index.

`personio-jobs` fixes that. It discovers every company using Personio via Common Crawl, fetches their public XML job feed, and gives you a structured feed of every open role. JSON, CSV, or filtered search.

## Install

```bash
# Global CLI
npm install -g personio-jobs

# Or run directly
npx personio-jobs scrape

# Or with pnpm
pnpm add -g personio-jobs
```

## Quick Start

```bash
# Scrape everything -- discover companies, fetch all jobs, output JSON
personio-jobs scrape

# Scrape a single company
personio-jobs scrape --company n26 --format table

# Find engineering jobs in Berlin
personio-jobs search --location "berlin" --department "engineering"

# Senior remote jobs
personio-jobs search --location "remote" --seniority "senior" --format table
```

## CLI Reference

```
USAGE:
  personio-jobs <command> [options]

COMMANDS:
  discover              Discover company slugs from Common Crawl
  scrape                Full run: discover slugs + scrape all companies
  search <query>        Search previously scraped job data

SCRAPE OPTIONS:
  --slugs <file>        Scrape from a slug file (one per line)
  --company <slug>      Scrape a single company

FILTER OPTIONS:
  --location <regex>    Filter by office/location pattern
  --department <regex>  Filter by department pattern
  --office <regex>      Filter by office pattern
  --keyword <regex>     Filter by name/content keyword
  --seniority <regex>   Filter by seniority level
  --employment <regex>  Filter by employment type

OUTPUT OPTIONS:
  --output, -o <dir>    Output directory (default: ./personio-data)
  --format <fmt>        Output format: json, csv, table (default: json)
  --content             Include full HTML job descriptions
  --limit <n>           Limit number of results

GENERAL:
  --concurrency, -c <n> Concurrent requests (default: 5)
  --language, -l <lang> Language parameter (default: en)
  --quiet, -q           Suppress progress output
  --help, -h            Show this help
  --version, -v         Show version
```

## API Reference

### `parseXml(xml: string): PersonioJob[]`

Parse a Personio XML feed into structured job objects. Uses lightweight regex-based extraction -- no heavy XML parser dependency.

```ts
import { parseXml } from 'personio-jobs';

const xml = await fetch('https://n26.jobs.personio.de/xml?language=en').then(r => r.text());
const jobs = parseXml(xml);
```

### `discoverSlugs(options?): Promise<string[]>`

Discover company subdomains from Common Crawl web indexes.

```ts
import { discoverSlugs } from 'personio-jobs';

const slugs = await discoverSlugs({
  onProgress: (msg) => console.log(msg),
});
// ['celonis', 'contentful', 'gorillas', 'n26', ...]
```

### `scrapeCompany(slug, options?): Promise<CompanyJobs | null>`

Scrape a single company's job board. Handles 429 rate limiting with exponential backoff.

```ts
import { scrapeCompany } from 'personio-jobs';

const result = await scrapeCompany('n26');
if (result) {
  console.log(`${result.company}: ${result.jobCount} jobs`);
  for (const job of result.jobs) {
    console.log(`  ${job.name} - ${job.office} (${job.seniority})`);
  }
}
```

Options:
- `includeContent?: boolean` -- Include full HTML job descriptions (default: false)
- `language?: string` -- Language parameter (default: "en")

### `scrapeAll(slugs, options?): Promise<CompanyJobs[]>`

Scrape multiple companies concurrently with built-in rate limiting.

```ts
import { scrapeAll } from 'personio-jobs';

const results = await scrapeAll(['n26', 'celonis', 'gorillas'], {
  concurrency: 3,
  includeContent: false,
  language: 'en',
  onProgress: (done, total, found) => {
    console.log(`${done}/${total} checked, ${found} with jobs`);
  },
});
```

### `searchJobs(results, query): CompanyJobs[]`

Filter and search across scraped results.

```ts
import { searchJobs } from 'personio-jobs';

const filtered = searchJobs(results, {
  text: 'engineer',
  filters: {
    location: /berlin|remote/i,
    department: /engineering/i,
    seniority: /senior/i,
  },
  limit: 50,
});
```

### Output Formatters

```ts
import { toJSON, toCSV, toTable, flattenJobs } from 'personio-jobs';

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
interface PersonioJob {
  id: number;
  name: string;
  department: string;
  office: string;
  recruitingCategory: string;
  employmentType: string;
  seniority: string;
  schedule: string;
  yearsOfExperience: string;
  keywords: string;
  occupation: string;
  occupationCategory: string;
  createdAt: string;
  jobDescriptions: PersonioJobDescription[];  // HTML, only with includeContent
}

interface PersonioJobDescription {
  name: string;
  value: string;
}

interface CompanyJobs {
  company: string;
  slug: string;
  jobCount: number;
  jobs: PersonioJob[];
  scrapedAt: string;
}

interface JobFilter {
  location?: RegExp;
  department?: RegExp;
  office?: RegExp;
  keyword?: RegExp;
  seniority?: RegExp;
  employmentType?: RegExp;
}
```

## How Discovery Works

1. Query Common Crawl indexes for `*.jobs.personio.de/*` URLs
2. Extract unique subdomains from the URLs
3. Validate against known patterns (filter noise like `www`, `api`, `static`)
4. Merge with a curated list of known companies
5. Return sorted, deduplicated array

## Rate Limiting

Personio aggressively rate-limits requests. This library handles it with:
- Low default concurrency (5 vs 10 for Greenhouse)
- 200ms delay between requests within each worker
- Exponential backoff on 429 responses (2s base, up to 3 retries)

## License

MIT
