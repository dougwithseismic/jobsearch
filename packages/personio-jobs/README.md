# Personio Jobs Scraper - All Companies

[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/personio-jobs-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Scrape every job from every company using [Personio](https://www.personio.de) as their ATS. N26, Celonis, Sennder, Taxfix, Contentful, Gorillas, and hundreds more European companies.

**The first Personio-specific scraper on Apify.** No existing actor covers Personio's XML job feeds. One click, every job.

## Why this one?

Personio is the dominant HR/ATS platform in Europe. Hundreds of funded startups and scale-ups across Germany, Austria, UK, Netherlands, and beyond host their careers pages at `{company}.jobs.personio.de`. There's no existing Apify actor that targets Personio specifically.

This actor:
- Auto-discovers companies via Common Crawl (no manual URL input)
- Parses Personio's public XML feed for each company
- Returns structured data: title, department, office, seniority, employment type, schedule, keywords
- Handles Personio's aggressive rate limiting with exponential backoff
- Filters by location, department, seniority, employment type, keywords
- Also works as a standalone npm package and CLI tool

## What does Personio Jobs Scraper do?

This Actor discovers every company hosting a job board on `*.jobs.personio.de`, fetches their public XML job feed, and returns structured data for every open role.

**What you get per job:**

| Field | Example |
|-------|---------|
| `company` | n26 |
| `name` | Senior Software Engineer |
| `department` | Engineering |
| `office` | Berlin |
| `seniority` | Senior |
| `employmentType` | permanent |
| `schedule` | full-time |
| `keywords` | typescript, react, node.js |
| `createdAt` | 2026-01-15T10:30:00+01:00 |
| `jobUrl` | https://n26.jobs.personio.de/job/12345 |

Plus `companySlug`, `jobId`, `recruitingCategory`, `yearsOfExperience`, `occupation`, `occupationCategory`, `scrapedAt`, and optionally `jobDescriptions` (full HTML).

## How to use

### 1. Scrape everything (zero config)

Set **Mode** to `all` and run. The Actor will:
1. Discover company subdomains from Common Crawl indexes
2. Fetch every company's Personio XML feed
3. Return every open job as a structured dataset row

### 2. Scrape specific companies

Set **Mode** to `companies` and provide subdomains:
```
["n26", "celonis", "gorillas", "personio"]
```

### 3. Filter results

Use regex patterns to narrow results:
- **Location Filter:** `berlin|munich|remote`
- **Department Filter:** `engineering|product`
- **Seniority Filter:** `senior|lead`
- **Employment Type Filter:** `permanent`
- **Keyword Filter:** `react|typescript|node`

## Input schema

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `mode` | string | `all` | `all`, `companies`, or `search` |
| `companies` | string[] | `[]` | Company subdomains to scrape |
| `locationFilter` | string | `""` | Regex office/location filter |
| `departmentFilter` | string | `""` | Regex department filter |
| `officeFilter` | string | `""` | Regex office filter |
| `keywordFilter` | string | `""` | Regex title/keyword filter |
| `seniorityFilter` | string | `""` | Regex seniority filter |
| `employmentTypeFilter` | string | `""` | Regex employment type filter |
| `includeContent` | boolean | `false` | Include full HTML descriptions |
| `concurrency` | integer | `5` | Parallel requests (1-10) |
| `maxCompanies` | integer | `0` | Limit companies (0 = all) |
| `language` | string | `en` | Language parameter for listings |

## Output

Results are stored in the default dataset. Each row is one job posting.

A **SUMMARY** record is saved to the key-value store with run stats:
- Total companies and jobs
- Elapsed time
- Filters applied
- Top 20 companies by job count

## Rate limiting

Personio aggressively rate-limits requests (HTTP 429). This actor handles it with:
- Low default concurrency (5 parallel requests)
- Built-in delays between requests (200ms)
- Exponential backoff on 429s (2s, 4s, 8s)
- Up to 3 retries per company

## Also available as a library

This Actor is built on the `personio-jobs` npm package. See [README.lib.md](./README.lib.md) for API reference, CLI usage, and install instructions.

```bash
npx personio-jobs scrape --company n26 --format table
```
