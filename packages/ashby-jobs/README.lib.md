# ashby-jobs

**Scrape every job on Ashby. All 2,800+ companies. One command.**

[![npm version](https://img.shields.io/npm/v/ashby-jobs.svg)](https://www.npmjs.com/package/ashby-jobs)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node >= 18](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success)](https://www.npmjs.com/package/ashby-jobs)
[![Jobs Scraped](https://img.shields.io/badge/Jobs_Scraped-16%2C699+-ff6d00)](https://github.com/dougwithseismic/ashby-jobs)
[![Companies](https://img.shields.io/badge/Companies-2%2C800+-7c4dff)](https://github.com/dougwithseismic/ashby-jobs)
[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/ashby-jobs-scraper)

---

Ashby is the ATS behind **OpenAI, Notion, Ramp, Deel, Linear, Cursor, Snowflake, Vanta**, and 2,800+ other companies. Their job boards live at `jobs.ashbyhq.com/{company}` — but there's no central index.

`ashby-jobs` fixes that. It discovers every company using Ashby via Common Crawl, hits Ashby's public posting API, and gives you a structured feed of every open role. JSON, CSV, or filtered search.

### Latest scrape

| Metric | Count |
|--------|-------|
| Companies with active jobs | **830** |
| Total jobs | **16,699** |
| Remote jobs | **7,726** (46%) |
| Europe-related jobs | **3,379** (20%) |
| Full scrape time | **~2 minutes** |

## Install

```bash
# Global CLI
npm install -g ashby-jobs

# Or run directly
npx ashby-jobs scrape

# Or with pnpm
pnpm add -g ashby-jobs
```

## Quick Start

```bash
# Scrape everything — discover companies, fetch all jobs, output JSON
ashby-jobs scrape

# Find remote engineering jobs in Europe
ashby-jobs search --remote --location "europe|germany|uk|france|czech" --department "engineering"

# Single company
ashby-jobs scrape --company linear
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
| `--output <path>` | `-o` | stdout | Write output to a file |
| `--format <type>` | `-f` | `json` | Output format: `json`, `csv`, or `table` |
| `--concurrency <n>` | `-c` | `10` | Max concurrent API requests |
| `--remote` | | `false` | Only include remote jobs |
| `--location <regex>` | `-l` | | Filter by location (regex pattern) |
| `--department <regex>` | `-d` | | Filter by department (regex pattern) |
| `--keyword <regex>` | `-k` | | Filter by title or description (regex pattern) |
| `--compensation` | | `true` | Include compensation data |
| `--descriptions` | | `false` | Include full job descriptions (larger output) |
| `--company <slug>` | | | Scrape a single company by slug |
| `--limit <n>` | | | Max number of jobs to return |
| `--quiet` | `-q` | `false` | Suppress progress output |

### Examples

```bash
# Discover slugs only (useful for seeing what's out there)
ashby-jobs discover --format table

# Scrape with higher concurrency, output CSV
ashby-jobs scrape --concurrency 20 --format csv -o jobs.csv

# Remote React/TypeScript jobs at specific companies
ashby-jobs scrape --company notion --remote --keyword "react|typescript"

# All design jobs, limited to 50 results
ashby-jobs search --department "design" --limit 50 --format table

# Europe-based jobs with compensation data
ashby-jobs search --location "berlin|london|paris|amsterdam|prague" --format csv -o europe-jobs.csv
```

## Programmatic API

```ts
import { discoverSlugs, scrapeAll, scrapeCompany, searchJobs } from 'ashby-jobs'

// Discover all company slugs from Common Crawl
const slugs = await discoverSlugs({
  onProgress: (msg) => console.log(msg),
})
// => ['linear', 'notion', 'openai', 'ramp', ...]  (~1,350 slugs)

// Scrape all companies
const results = await scrapeAll({
  concurrency: 15,
  includeDescriptions: false,
  onProgress: (done, total, found) => {
    console.log(`${done}/${total} companies — ${found} jobs found`)
  },
})

// Scrape a single company
const linearJobs = await scrapeCompany('linear', {
  includeDescriptions: true,
})
// => { company: 'Linear', slug: 'linear', jobCount: 42, jobs: [...] }

// Search and filter
const remoteEngineering = searchJobs(results, 'senior engineer', {
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
  AshbyJob,
  CompanyJobs,
  FlatJob,
  DiscoverOptions,
  ScrapeAllOptions,
  ScrapeCompanyOptions,
  JobFilter,
  SearchQuery,
} from 'ashby-jobs'
```

Key interfaces:

```ts
interface AshbyJob {
  id: string
  title: string
  department: string
  team: string
  employmentType: string
  location: string
  isRemote: boolean
  workplaceType: string
  publishedAt: string
  jobUrl: string
  applyUrl: string
  compensationTierSummary?: string
  descriptionPlain?: string
  descriptionHtml?: string
}

interface CompanyJobs {
  company: string
  slug: string
  jobCount: number
  jobs: AshbyJob[]
  scrapedAt: string
}
```

## How Discovery Works

Here's the interesting part. There's no public list of companies using Ashby. So how do you find all 2,800+ of them?

**Common Crawl.**

[Common Crawl](https://commoncrawl.org/) is a nonprofit that crawls the entire web and makes the data freely available. They index billions of URLs. Their CDX API lets you query for URL patterns across all their crawls.

We query for every URL matching `jobs.ashbyhq.com/*`:

```
https://index.commoncrawl.org/CC-MAIN-2025-06-index?url=jobs.ashbyhq.com/*&output=json
```

This returns every Ashby job board URL that Common Crawl has ever seen. We extract the path segment — that's the company slug. Deduplicate, and you've got a near-complete index of every company using Ashby.

The tool queries multiple crawl indexes (the web changes, companies come and go) and merges the results. Total discovery takes about 30 seconds and reliably finds 1,350+ unique company slugs.

From there, we hit Ashby's public posting API for each slug. Some companies have shut down, some have no open roles, some have renamed — but the vast majority return live job data.

## Claude Code Plugin

Install as a Claude Code plugin to search Ashby jobs directly from your terminal:

```bash
claude plugin install ashby-jobs
```

Or add it manually to your Claude Code config:

```json
{
  "plugins": ["ashby-jobs"]
}
```

Once installed, the plugin auto-triggers when you ask about job searching. Try:

```
> Find me remote senior engineering jobs at companies using Ashby
> What companies on Ashby are hiring in Berlin?
> Show me all open roles at Linear
```

## Output Examples

### JSON (default)

```json
[
  {
    "company": "Linear",
    "slug": "linear",
    "jobCount": 3,
    "scrapedAt": "2025-03-06T10:30:00.000Z",
    "jobs": [
      {
        "id": "abc12345-6789-def0-1234-567890abcdef",
        "title": "Senior Frontend Engineer",
        "department": "Engineering",
        "team": "Product",
        "employmentType": "FullTime",
        "location": "San Francisco, CA or Remote (US/Europe)",
        "isRemote": true,
        "workplaceType": "Remote",
        "publishedAt": "2025-02-15T00:00:00.000Z",
        "jobUrl": "https://jobs.ashbyhq.com/linear/abc12345",
        "applyUrl": "https://jobs.ashbyhq.com/linear/abc12345/application",
        "compensationTierSummary": "$180,000 - $240,000 USD"
      }
    ]
  }
]
```

### CSV

```csv
company,slug,title,department,location,isRemote,employmentType,compensationTierSummary,jobUrl
Linear,linear,Senior Frontend Engineer,Engineering,"San Francisco, CA or Remote",true,FullTime,$180k - $240k,https://jobs.ashbyhq.com/linear/abc12345
Notion,notion,Product Designer,Design,"New York, NY",false,FullTime,$160k - $200k,https://jobs.ashbyhq.com/notion/def67890
Ramp,ramp,Staff Backend Engineer,Engineering,Remote,true,FullTime,$200k - $280k,https://jobs.ashbyhq.com/ramp/ghi24680
```

### Table

```
┌──────────┬─────────────────────────────┬─────────────┬──────────────────────┬────────┬────────────────────┐
│ Company  │ Title                       │ Department  │ Location             │ Remote │ Compensation       │
├──────────┼─────────────────────────────┼─────────────┼──────────────────────┼────────┼────────────────────┤
│ Linear   │ Senior Frontend Engineer    │ Engineering │ SF / Remote (US/EU)  │ Yes    │ $180k - $240k      │
│ Notion   │ Product Designer            │ Design      │ New York, NY         │ No     │ $160k - $200k      │
│ Ramp     │ Staff Backend Engineer      │ Engineering │ Remote               │ Yes    │ $200k - $280k      │
│ Cursor   │ ML Engineer                 │ AI          │ San Francisco, CA    │ No     │ $220k - $300k      │
│ Vanta    │ Senior Security Engineer    │ Engineering │ Remote (US)          │ Yes    │ $175k - $230k      │
└──────────┴─────────────────────────────┴─────────────┴──────────────────────┴────────┴────────────────────┘
```

## Filtering Examples

### Remote engineering jobs in Europe

```bash
ashby-jobs search \
  --remote \
  --location "europe|germany|uk|france|netherlands|czech|spain|portugal|sweden|poland" \
  --department "engineering" \
  --format table
```

### Companies hiring React developers

```bash
ashby-jobs search \
  --keyword "react" \
  --descriptions \
  --format csv -o react-jobs.csv
```

### Senior roles with compensation data

```bash
ashby-jobs search \
  --keyword "senior|staff|lead|principal" \
  --format json | jq '[.[] | .jobs[] | select(.compensationTierSummary != null)]'
```

### Export everything for spreadsheet analysis

```bash
ashby-jobs scrape --format csv -o all-ashby-jobs.csv
```

That CSV opens directly in Excel, Google Sheets, or any data tool.

## Ashby API Reference

This tool uses Ashby's **public** posting API. No authentication required.

### Endpoint

```
GET https://api.ashbyhq.com/posting-api/job-board/{slug}?includeCompensation=true
```

### Response

```json
{
  "jobs": [
    {
      "id": "string",
      "title": "string",
      "departmentName": "string",
      "teamName": "string",
      "employmentType": "FullTime | PartTime | Intern | Contract | Temporary",
      "location": "string",
      "secondaryLocations": [{ "location": "string" }],
      "isRemote": true,
      "isListed": true,
      "publishedAt": "ISO 8601",
      "jobUrl": "string",
      "applyUrl": "string",
      "descriptionPlain": "string",
      "descriptionHtml": "string",
      "compensationTierSummary": "string | null",
      "address": {
        "postalAddress": {
          "addressLocality": "string",
          "addressRegion": "string",
          "addressCountry": "string"
        }
      }
    }
  ]
}
```

Slugs are the path segment from `jobs.ashbyhq.com/{slug}`. If a company has no active jobs or the slug is invalid, the API returns an empty `jobs` array.

## Contributing

Contributions welcome. Keep it simple.

```bash
# Clone and install
git clone https://github.com/dougwithseismic/ashby-jobs.git
cd ashby-jobs
pnpm install

# Run locally
pnpm dev          # Run the library
pnpm cli          # Run the CLI in dev mode
pnpm build        # Build for production
pnpm check-types  # Type check
```

### Guidelines

- TypeScript strict mode
- No external runtime dependencies (Node built-ins only)
- Keep output formats consistent
- Test with `pnpm check-types` before submitting

## Also Available On

### Apify Store

Don't want to run it yourself? The [Ashby Jobs Scraper](https://apify.com/deadlyaccurate/ashby-jobs-scraper) is available on Apify — zero setup, scheduled runs, webhook integrations, and API access.

There are other Ashby scrapers on Apify, but they all require you to already know the company URL. This is the only one that **auto-discovers companies** via Common Crawl. One click, every job.

| Feature | ashby-jobs | Other Ashby Scrapers |
|---------|-----------|---------------------|
| Auto-discovers companies | Yes (Common Crawl) | No — manual URL input |
| Companies covered | 2,800+ | 1 at a time |
| Browser required | No (pure API) | Usually yes |
| Proxy required | No | Usually yes |
| Full scrape time | ~2 min | Varies |
| Cost per run | ~$0.05 | $0.50+ (browser compute) |

## License

MIT

---

## Author

**Doug Silkstone** — Lead Full Stack Software Engineer. 15+ years, 3x exits. TypeScript, React, Node, scraping & automation.

[![Email](https://img.shields.io/badge/Email-doug%40withseismic.com-EA4335?logo=gmail&logoColor=white)](mailto:doug@withseismic.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-dougsilkstone-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/dougsilkstone)
[![GitHub](https://img.shields.io/badge/GitHub-dougwithseismic-181717?logo=github&logoColor=white)](https://github.com/dougwithseismic)
[![Book a Call](https://img.shields.io/badge/Book_a_Call-30min-00C853?logo=googlecalendar&logoColor=white)](https://Cal.com/dougwithseismic/30min)
[![Apify](https://img.shields.io/badge/Apify-deadlyaccurate-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate)

Need a custom scraper, data pipeline, or automation? [Book a call](https://Cal.com/dougwithseismic/30min) or email [doug@withseismic.com](mailto:doug@withseismic.com).
