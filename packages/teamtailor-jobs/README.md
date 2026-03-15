# Teamtailor Jobs Scraper - Auto-Discover All Companies

[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/teamtailor-jobs-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Scrape every job from every company using [Teamtailor](https://www.teamtailor.com) as their ATS. Storytel, Epidemic Sound, Klarna, and thousands more.

**The only Teamtailor scraper that auto-discovers companies.** No manual URL input needed. One click, every job.

## What does Teamtailor Jobs Scraper do?

This Actor discovers every company hosting a job board on `*.teamtailor.com`, scrapes their public RSS job feed, and returns structured data for every open role.

**What you get per job:**

| Field | Example |
|-------|---------|
| `company` | storytel |
| `title` | Senior Software Engineer |
| `department` | Engineering |
| `role` | Software Development |
| `locations` | [{ city: "Stockholm", country: "Sweden" }] |
| `remoteStatus` | fully / hybrid / none |
| `pubDate` | Mon, 01 Mar 2026 00:00:00 +0000 |
| `link` | https://storytel.teamtailor.com/jobs/1234-senior-software-engineer |

Plus `companySlug`, `guid`, `scrapedAt`, and optionally `description` (full HTML).

## How to use

### 1. Scrape everything (zero config)

Set **Mode** to `all` and run. The Actor will:
1. Discover company slugs from the slug API
2. Hit every company's Teamtailor RSS feed
3. Return every open job as a structured dataset row

### 2. Scrape specific companies

Set **Mode** to `companies` and provide slugs:
```
["storytel", "epidemic-sound", "klarna"]
```

### 3. Filter results

Use regex patterns to narrow results:
- **Location Filter:** `europe|germany|uk|remote`
- **Department Filter:** `engineering|product`
- **Role Filter:** `software|design`
- **Keyword Filter:** `senior|staff|lead`

## Input schema

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `mode` | string | `all` | `all`, `companies`, or `search` |
| `companies` | string[] | `[]` | Company slugs to scrape |
| `locationFilter` | string | `""` | Regex location filter |
| `departmentFilter` | string | `""` | Regex department filter |
| `roleFilter` | string | `""` | Regex role filter |
| `keywordFilter` | string | `""` | Regex title/keyword filter |
| `includeContent` | boolean | `false` | Include full HTML descriptions |
| `concurrency` | integer | `10` | Parallel requests (1-20) |
| `maxCompanies` | integer | `0` | Limit companies (0 = all) |

## Output

Results are stored in the default dataset. Each row is one job posting.

A **SUMMARY** record is saved to the key-value store with run stats:
- Total companies and jobs
- Elapsed time
- Filters applied
- Top 20 companies by job count

## Also available as a library

This Actor is built on the `teamtailor-jobs` npm package.

```bash
npx teamtailor-jobs scrape --company storytel --format table
```

### CLI examples

```bash
# Discover all known Teamtailor company slugs
teamtailor-jobs discover

# Scrape a single company
teamtailor-jobs scrape --company storytel --format table

# Scrape with filters
teamtailor-jobs scrape --slugs slugs.txt --location "sweden" --department "engineering"

# Search scraped data
teamtailor-jobs search "senior engineer" --format table
```

### Library usage

```typescript
import { scrapeCompany, scrapeAll, searchJobs } from 'teamtailor-jobs';

// Scrape one company
const result = await scrapeCompany('storytel');
console.log(result?.jobs.length, 'jobs found');

// Scrape many companies
const results = await scrapeAll(['storytel', 'epidemic-sound'], {
  concurrency: 5,
  onProgress: (done, total, found) => console.log(`${done}/${total}`),
});

// Search results
const filtered = searchJobs(results, {
  text: 'engineer',
  filters: { location: /stockholm/i },
});
```
