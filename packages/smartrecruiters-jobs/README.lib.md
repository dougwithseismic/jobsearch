# smartrecruiters-jobs

**Scrape every job on SmartRecruiters. Auto-discover companies. One command.**

[![npm version](https://img.shields.io/npm/v/smartrecruiters-jobs.svg)](https://www.npmjs.com/package/smartrecruiters-jobs)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node >= 18](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success)](https://www.npmjs.com/package/smartrecruiters-jobs)

---

SmartRecruiters is the ATS behind **Visa, Spotify, Bosch, Ubisoft, Sanofi, Bayer, Siemens, adidas**, and thousands of other companies. Their job boards live at `careers.smartrecruiters.com/{company}` -- but there's no central index.

`smartrecruiters-jobs` fixes that. It discovers every company using SmartRecruiters via Common Crawl, hits their public Posting API with pagination, and gives you a structured feed of every open role. JSON, CSV, or filtered search.

## Install

```bash
# Global CLI
npm install -g smartrecruiters-jobs

# Or run directly
npx smartrecruiters-jobs scrape

# Or with pnpm
pnpm add -g smartrecruiters-jobs
```

## Quick Start

```bash
# Scrape everything -- discover companies, fetch all jobs, output JSON
smartrecruiters-jobs scrape

# Find remote engineering jobs in Europe
smartrecruiters-jobs search --remote --location "europe|germany|uk|france|czech" --department "engineering"

# Single company
smartrecruiters-jobs scrape --company Spotify
```

## CLI Reference

### Commands

| Command | Description |
|---------|-------------|
| `discover` | Find all company identifiers via Common Crawl (no scraping) |
| `scrape` | Full pipeline: discover identifiers, then fetch all jobs |
| `search` | Filter and search previously scraped data |

### Options

| Option | Alias | Default | Description |
|--------|-------|---------|-------------|
| `--output <path>` | `-o` | `./smartrecruiters-data` | Output directory |
| `--format <type>` | | `json` | Output format: `json`, `csv`, or `table` |
| `--concurrency <n>` | `-c` | `10` | Max concurrent API requests |
| `--remote` | | `false` | Only include remote jobs |
| `--location <regex>` | | | Filter by location (regex pattern) |
| `--department <regex>` | | | Filter by department (regex pattern) |
| `--keyword <regex>` | | | Filter by title or description (regex pattern) |
| `--descriptions` | | `false` | Include full job descriptions (slower -- extra API call per job) |
| `--company <slug>` | | | Scrape a single company by identifier |
| `--limit <n>` | | | Max number of jobs to return |
| `--quiet` | `-q` | `false` | Suppress progress output |

### Examples

```bash
# Discover identifiers only
smartrecruiters-jobs discover

# Scrape with higher concurrency, output CSV
smartrecruiters-jobs scrape --concurrency 20 --format csv -o jobs.csv

# Remote jobs at a specific company
smartrecruiters-jobs scrape --company Spotify --remote --keyword "react|typescript"

# All design jobs, limited to 50 results
smartrecruiters-jobs search --department "design" --limit 50 --format table

# Europe-based jobs
smartrecruiters-jobs search --location "berlin|london|paris|amsterdam|prague" --format csv -o europe-jobs.csv
```

## Programmatic API

```ts
import { discoverSlugs, scrapeAll, scrapeCompany, searchJobs } from 'smartrecruiters-jobs'

// Discover all company identifiers from Common Crawl
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
const spotifyJobs = await scrapeCompany('Spotify', {
  includeDescriptions: true,
})
// => { company: 'Spotify', slug: 'Spotify', jobCount: 142, jobs: [...] }

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
  SmartRecruitersJob,
  CompanyJobs,
  FlatJob,
  DiscoverOptions,
  ScrapeAllOptions,
  ScrapeCompanyOptions,
  JobFilter,
  SearchQuery,
} from 'smartrecruiters-jobs'
```

Key interfaces:

```ts
interface SmartRecruitersJob {
  id: string
  uuid: string
  name: string
  refNumber: string
  company: { name: string; identifier: string }
  location: { city: string; region: string; country: string; remote: boolean }
  department: { label: string }
  typeOfEmployment: { label: string }
  experienceLevel: { label: string }
  industry: { label: string }
  function: { label: string }
  releasedDate: string
  creator: { name: string }
  ref: string
  descriptionHtml?: string
  qualificationsHtml?: string
  additionalInfoHtml?: string
}

interface CompanyJobs {
  company: string
  slug: string
  jobCount: number
  jobs: SmartRecruitersJob[]
  scrapedAt: string
}
```

## How Discovery Works

There's no public list of companies using SmartRecruiters. So how do you find them?

**Common Crawl.**

[Common Crawl](https://commoncrawl.org/) indexes billions of URLs. We query for every URL matching `careers.smartrecruiters.com/*` and `jobs.smartrecruiters.com/*`:

```
https://index.commoncrawl.org/CC-MAIN-2025-08-index?url=careers.smartrecruiters.com/*&output=json
```

This returns every SmartRecruiters job board URL that Common Crawl has seen. We extract the company identifier, deduplicate across multiple crawl indexes, and merge with known slugs.

From there, we hit SmartRecruiters' public Posting API for each identifier with pagination (limit=100, offset).

## SmartRecruiters API Reference

This tool uses SmartRecruiters' **public** Posting API. No authentication required.

### Endpoints

```
# List all postings (paginated)
GET https://api.smartrecruiters.com/v1/companies/{companyIdentifier}/postings?limit=100&offset=0

# Single posting detail (includes job description)
GET https://api.smartrecruiters.com/v1/companies/{companyIdentifier}/postings/{postingId}
```

### Response (list endpoint)

```json
{
  "totalFound": 142,
  "limit": 100,
  "offset": 0,
  "content": [
    {
      "id": "string",
      "uuid": "string",
      "name": "string",
      "refNumber": "string",
      "company": { "name": "string", "identifier": "string" },
      "location": { "city": "string", "region": "string", "country": "string", "remote": true },
      "department": { "label": "string" },
      "typeOfEmployment": { "label": "Full-time" },
      "experienceLevel": { "label": "Mid-Senior level" },
      "releasedDate": "ISO 8601",
      "ref": "string"
    }
  ]
}
```

## Contributing

Contributions welcome. Keep it simple.

```bash
git clone https://github.com/dougwithseismic/jobsearch.git
cd jobsearch/packages/smartrecruiters-jobs
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

## Also Available On

### Apify Store

The [SmartRecruiters Jobs Scraper](https://apify.com/deadlyaccurate/smartrecruiters-jobs-scraper) is available on Apify -- zero setup, scheduled runs, webhook integrations, and API access.

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
