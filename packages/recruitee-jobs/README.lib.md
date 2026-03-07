# recruitee-jobs

**Scrape every job on Recruitee. All companies. One command.**

[![npm version](https://img.shields.io/npm/v/recruitee-jobs.svg)](https://www.npmjs.com/package/recruitee-jobs)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node >= 18](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success)](https://www.npmjs.com/package/recruitee-jobs)
[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/recruitee-jobs-scraper)

---

Recruitee is the ATS behind hundreds of companies. Their job boards live at `{company}.recruitee.com` -- but there's no central index.

`recruitee-jobs` fixes that. It discovers every company using Recruitee via Common Crawl, hits their public offers API, and gives you a structured feed of every open role. JSON, CSV, or filtered search.

## Install

```bash
# Global CLI
npm install -g recruitee-jobs

# Or run directly
npx recruitee-jobs scrape

# Or with pnpm
pnpm add -g recruitee-jobs
```

## Quick Start

```bash
# Scrape everything -- discover companies, fetch all jobs, output JSON
recruitee-jobs scrape

# Find remote engineering jobs in Europe
recruitee-jobs search --remote --location "europe|germany|uk|france|czech" --department "engineering"

# Single company
recruitee-jobs scrape --company bynder
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
| `--output <path>` | `-o` | `./recruitee-data` | Output directory |
| `--format <type>` | | `json` | Output format: `json`, `csv`, or `table` |
| `--concurrency <n>` | `-c` | `10` | Max concurrent API requests |
| `--remote` | | `false` | Only include remote jobs |
| `--location <regex>` | | | Filter by location (regex pattern) |
| `--department <regex>` | | | Filter by department (regex pattern) |
| `--keyword <regex>` | | | Filter by title or description (regex pattern) |
| `--country <regex>` | | | Filter by country (regex pattern) |
| `--descriptions` | | `false` | Include full job descriptions (larger output) |
| `--company <slug>` | | | Scrape a single company by subdomain |
| `--limit <n>` | | | Max number of jobs to return |
| `--quiet` | `-q` | `false` | Suppress progress output |

### Examples

```bash
# Discover slugs only
recruitee-jobs discover --format table

# Scrape with higher concurrency, output CSV
recruitee-jobs scrape --concurrency 20 --format csv

# Remote React/TypeScript jobs at specific companies
recruitee-jobs scrape --company bynder --remote --keyword "react|typescript"

# All design jobs, limited to 50 results
recruitee-jobs search --department "design" --limit 50 --format table
```

## Programmatic API

```ts
import { discoverSlugs, scrapeAll, scrapeCompany, searchJobs } from 'recruitee-jobs'

// Discover all company slugs from Common Crawl
const slugs = await discoverSlugs({
  onProgress: (msg) => console.log(msg),
})

// Scrape all companies
const results = await scrapeAll(slugs, {
  concurrency: 15,
  includeDescriptions: false,
  onProgress: (done, total, found) => {
    console.log(`${done}/${total} companies -- ${found} with jobs`)
  },
})

// Scrape a single company
const bynderJobs = await scrapeCompany('bynder', {
  includeDescriptions: true,
})

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
  RecruiteeJob,
  CompanyJobs,
  FlatJob,
  DiscoverOptions,
  ScrapeAllOptions,
  ScrapeCompanyOptions,
  JobFilter,
  SearchQuery,
} from 'recruitee-jobs'
```

Key interfaces:

```ts
interface RecruiteeJob {
  id: number
  title: string
  slug: string
  department: string
  location: string
  country: string
  city: string
  state: string
  remote: boolean
  employmentType: string
  publishedAt: string
  careersUrl: string
  tags: string[]
  description: string
  requirements: string
  descriptionPlain?: string
}

interface CompanyJobs {
  company: string
  slug: string
  jobCount: number
  jobs: RecruiteeJob[]
  scrapedAt: string
}
```

## How Discovery Works

There's no public list of companies using Recruitee. So how do you find them all?

**Common Crawl.**

[Common Crawl](https://commoncrawl.org/) crawls the entire web and makes the data freely available. Their CDX API lets you query for URL patterns.

We query for every URL matching `*.recruitee.com/*`:

```
https://index.commoncrawl.org/CC-MAIN-2025-08-index?url=*.recruitee.com/*&output=json&limit=5000
```

This returns every Recruitee job board URL that Common Crawl has seen. We extract the subdomain -- that's the company slug. Deduplicate, filter out non-company subdomains (www, api, app, help, etc.), and you've got a near-complete index.

## Recruitee API Reference

This tool uses Recruitee's **public** offers API. No authentication required.

### Endpoint

```
GET https://{slug}.recruitee.com/api/offers
```

### Response

```json
{
  "offers": [
    {
      "id": 12345,
      "title": "Senior Software Engineer",
      "slug": "senior-software-engineer",
      "department": "Engineering",
      "location": "Amsterdam, Netherlands",
      "country": "Netherlands",
      "city": "Amsterdam",
      "state": "North Holland",
      "remote": true,
      "description": "<p>HTML description</p>",
      "requirements": "<p>HTML requirements</p>",
      "careers_url": "https://company.recruitee.com/o/senior-software-engineer",
      "created_at": "2026-02-28T00:00:00Z",
      "published_at": "2026-03-01T00:00:00Z",
      "tags": ["engineering", "remote"],
      "employment_type_code": "full_time",
      "min_hours": null,
      "max_hours": null
    }
  ]
}
```

## Contributing

Contributions welcome. Keep it simple.

```bash
git clone https://github.com/dougwithseismic/jobsearch.git
cd jobsearch/packages/recruitee-jobs
pnpm install

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
