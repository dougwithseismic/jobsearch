# Greenhouse Jobs Scraper - Auto-Discover All Companies

[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/greenhouse-jobs-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Scrape every job from every company using [Greenhouse](https://www.greenhouse.io) as their ATS. Airbnb, Stripe, Cloudflare, Figma, Spotify, Netflix, Pinterest, and thousands more.

**The only Greenhouse scraper that auto-discovers companies.** No manual URL input needed. One click, every job.

## Why this one?

| Feature | This Actor | Greenhouse Job Scraper (184 users) | Greenhouse Jobs Extractor |
|---------|-----------|-----------------------------------|--------------------------|
| Auto-discovers companies | Yes (Common Crawl) | No - you provide URLs | No - you provide URLs |
| Price per result | Free / platform cost only | Free / platform cost only | $0.005/result |
| Filters (dept, location, keyword) | Yes | Limited | No |
| Structured output | JSON dataset + summary | JSON | JSON |
| Also a library/CLI | Yes (npm package) | No | No |
| Test coverage | 30+ tests | Unknown | Unknown |

Other Greenhouse scrapers require you to already know the company URL. This one finds them for you -- auto-discovering company board tokens via Common Crawl and validating each against Greenhouse's public API.

## What does Greenhouse Jobs Scraper do?

This Actor discovers every company hosting a job board on `boards.greenhouse.io`, scrapes their public job board API, and returns structured data for every open role.

**What you get per job:**

| Field | Example |
|-------|---------|
| `company` | stripe |
| `title` | Senior Software Engineer |
| `departments` | ["Engineering"] |
| `offices` | ["San Francisco", "Remote"] |
| `location` | San Francisco, CA or Remote |
| `updatedAt` | 2026-03-01T00:00:00.000Z |
| `absoluteUrl` | https://boards.greenhouse.io/stripe/jobs/12345 |
| `internalJobId` | 67890 |
| `metadata` | Custom fields set by company |

Plus `companySlug`, `jobId`, `scrapedAt`, and optionally `content` (full HTML description).

## How to use

### 1. Scrape everything (zero config)

Set **Mode** to `all` and run. The Actor will:
1. Discover company board tokens from Common Crawl indexes
2. Hit every company's Greenhouse API endpoint
3. Return every open job as a structured dataset row

### 2. Scrape specific companies

Set **Mode** to `companies` and provide board tokens:
```
["stripe", "airbnb", "cloudflare", "figma"]
```

### 3. Filter results

Use regex patterns to narrow results:
- **Location Filter:** `europe|germany|uk|remote`
- **Department Filter:** `engineering|product`
- **Office Filter:** `berlin|london|san francisco`
- **Keyword Filter:** `senior|staff|lead`

## Input schema

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `mode` | string | `all` | `all`, `companies`, or `search` |
| `companies` | string[] | `[]` | Board tokens to scrape |
| `locationFilter` | string | `""` | Regex location filter |
| `departmentFilter` | string | `""` | Regex department filter |
| `officeFilter` | string | `""` | Regex office filter |
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

This Actor is built on the `greenhouse-jobs` npm package. See [README.lib.md](./README.lib.md) for API reference, CLI usage, and install instructions.

```bash
npx greenhouse-jobs scrape --company stripe --format table
```
