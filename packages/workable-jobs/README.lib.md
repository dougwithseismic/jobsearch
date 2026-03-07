# workable-jobs

**Scrape every job on Workable. All 1,700+ companies. One command.**

[![npm version](https://img.shields.io/npm/v/workable-jobs.svg)](https://www.npmjs.com/package/workable-jobs)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node >= 18](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success)](https://www.npmjs.com/package/workable-jobs)
[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/workable-jobs-scraper)

---

Workable is the ATS behind **1000heads, Typeform, Spotify, Semrush, Personio, N26, Trivago, Delivery Hero**, and 1,700+ other companies. Their job boards live at `apply.workable.com/{company}` -- but there's no central index.

`workable-jobs` fixes that. It discovers every company using Workable via Common Crawl, hits Workable's public widget API, and gives you a structured feed of every open role. JSON, CSV, or filtered search.

## Install

```bash
# Global CLI
npm install -g workable-jobs

# Or run directly
npx workable-jobs scrape

# Or with pnpm
pnpm add -g workable-jobs
```

## Quick Start

```bash
# Scrape everything -- discover companies, fetch all jobs, output JSON
workable-jobs scrape

# Find remote engineering jobs in Europe
workable-jobs search --remote --location "europe|germany|uk|france|czech" --department "engineering"

# Single company
workable-jobs scrape --company 1000heads
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
| `--output <path>` | `-o` | `./workable-data` | Output directory |
| `--format <type>` | | `json` | Output format: `json`, `csv`, or `table` |
| `--concurrency <n>` | `-c` | `10` | Max concurrent API requests |
| `--remote` | | `false` | Only include remote jobs |
| `--location <regex>` | | | Filter by location (regex pattern) |
| `--department <regex>` | | | Filter by department (regex pattern) |
| `--keyword <regex>` | | | Filter by title or description (regex pattern) |
| `--descriptions` | | `false` | Include full job descriptions |
| `--company <slug>` | | | Scrape a single company by slug |
| `--limit <n>` | | | Max number of jobs to return |
| `--quiet` | `-q` | `false` | Suppress progress output |

### Examples

```bash
# Discover slugs only
workable-jobs discover

# Scrape with higher concurrency, output CSV
workable-jobs scrape --concurrency 20 --format csv -o jobs.csv

# Remote jobs at specific companies
workable-jobs scrape --company 1000heads --remote

# All design jobs, limited to 50 results
workable-jobs search --department "design" --limit 50 --format table

# Europe-based jobs
workable-jobs search --location "berlin|london|paris|amsterdam|prague" --format csv -o europe-jobs.csv
```

## Programmatic API

```ts
import { discoverSlugs, scrapeAll, scrapeCompany, searchJobs } from 'workable-jobs'

// Discover all company slugs from Common Crawl
const slugs = await discoverSlugs({
  onProgress: (msg) => console.log(msg),
})
// => ['1000heads', 'typeform', 'spotify', ...]  (~1,700 slugs)

// Scrape all companies
const results = await scrapeAll(slugs, {
  concurrency: 15,
  includeDescriptions: false,
  onProgress: (done, total, found) => {
    console.log(`${done}/${total} companies -- ${found} with jobs`)
  },
})

// Scrape a single company
const jobs = await scrapeCompany('1000heads', {
  includeDescriptions: false,
})
// => { company: '1000heads', slug: '1000heads', jobCount: 36, jobs: [...] }

// Search and filter
const remoteEngineering = searchJobs(results, {
  text: 'senior engineer',
  filters: {
    remote: true,
    location: /europe|germany|uk/i,
    department: /engineering/i,
  },
  limit: 100,
})
```

### Types

```ts
import type {
  WorkableJob,
  WorkableLocation,
  CompanyJobs,
  FlatJob,
  DiscoverOptions,
  ScrapeAllOptions,
  ScrapeCompanyOptions,
  JobFilter,
  SearchQuery,
} from 'workable-jobs'
```

Key interfaces:

```ts
interface WorkableJob {
  shortcode: string
  title: string
  department: string
  employmentType: string
  isRemote: boolean
  country: string
  city: string
  state: string
  locations: WorkableLocation[]
  experience: string
  industry: string
  publishedAt: string
  createdAt: string
  jobUrl: string
  applyUrl: string
  descriptionHtml?: string
}

interface CompanyJobs {
  company: string
  slug: string
  jobCount: number
  jobs: WorkableJob[]
  scrapedAt: string
}
```

## How Discovery Works

There's no public list of companies using Workable. So how do you find all 1,700+ of them?

**Common Crawl.**

[Common Crawl](https://commoncrawl.org/) crawls the entire web and makes the data freely available. Their CDX API lets you query for URL patterns across all their crawls.

We query for every URL matching `apply.workable.com/*`:

```
https://index.commoncrawl.org/CC-MAIN-2025-08-index?url=apply.workable.com/*&output=json&limit=5000
```

This returns every Workable job board URL that Common Crawl has ever seen. We extract the slug from each URL, filter out non-company paths (`/j/`, `/api/`, `/static/`), and deduplicate. Total discovery takes about 30 seconds.

## Workable API Reference

This tool uses Workable's **public** widget API. No authentication required.

### Endpoint

```
GET https://apply.workable.com/api/v1/widget/accounts/{slug}
```

### Response

```json
{
  "name": "1000heads",
  "description": "<p>...</p>",
  "jobs": [
    {
      "title": "Account Director (Japan)",
      "shortcode": "BF0AB8287B",
      "code": "",
      "employment_type": "Full-time",
      "telecommuting": false,
      "department": "Client Services",
      "url": "https://apply.workable.com/j/BF0AB8287B",
      "shortlink": "https://apply.workable.com/j/BF0AB8287B",
      "application_url": "https://apply.workable.com/j/BF0AB8287B/apply",
      "published_on": "2026-02-04",
      "created_at": "2026-02-04",
      "country": "Australia",
      "city": "Sydney",
      "state": "New South Wales",
      "education": "",
      "experience": "Director",
      "function": "Marketing",
      "industry": "Marketing and Advertising",
      "locations": [
        {
          "country": "Australia",
          "countryCode": "AU",
          "city": "Sydney",
          "region": "New South Wales",
          "hidden": false
        }
      ]
    }
  ]
}
```

## Contributing

Contributions welcome. Keep it simple.

```bash
# Clone and install
git clone https://github.com/dougwithseismic/jobsearch.git
cd jobsearch/packages/workable-jobs
pnpm install

# Run locally
pnpm dev          # Run the library
pnpm cli          # Run the CLI in dev mode
pnpm build        # Build for production
pnpm check-types  # Type check
pnpm test         # Run tests
```

### Guidelines

- TypeScript strict mode
- No external runtime dependencies (Node built-ins only)
- Keep output formats consistent
- Test with `pnpm check-types` before submitting

## Also Available On

### Apify Store

The [Workable Jobs Scraper](https://apify.com/deadlyaccurate/workable-jobs-scraper) is available on Apify -- zero setup, scheduled runs, webhook integrations, and API access.

## License

MIT

---

## Author

**Doug Silkstone** -- Lead Full Stack Software Engineer. 15+ years, 3x exits. TypeScript, React, Node, scraping & automation.

[![Email](https://img.shields.io/badge/Email-doug%40withseismic.com-EA4335?logo=gmail&logoColor=white)](mailto:doug@withseismic.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-dougsilkstone-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/dougsilkstone)
[![GitHub](https://img.shields.io/badge/GitHub-dougwithseismic-181717?logo=github&logoColor=white)](https://github.com/dougwithseismic)
[![Book a Call](https://img.shields.io/badge/Book_a_Call-45min-00C853?logo=googlecalendar&logoColor=white)](https://cal.com/dougwithseismic/session-45)
[![Apify](https://img.shields.io/badge/Apify-deadlyaccurate-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate)

Need a custom scraper, data pipeline, or automation? [Book a call](https://cal.com/dougwithseismic/session-45) or email [doug@withseismic.com](mailto:doug@withseismic.com).
