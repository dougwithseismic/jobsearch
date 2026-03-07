# Breezy HR Jobs Scraper - All Companies

[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/breezyhr-jobs-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Scrape every job from every company using [Breezy HR](https://breezy.hr) as their ATS. Hubstaff, Attentive, and hundreds more.

**The first BreezyHR-specific scraper on Apify.** No existing actor targets BreezyHR's public JSON API. Auto-discovers companies, no manual URL input needed.

## Why this one?

| Feature | This Actor | Generic web scrapers |
|---------|-----------|---------------------|
| Auto-discovers companies | Yes (Common Crawl) | No - you provide URLs |
| Price per result | Free / platform cost only | Varies |
| BreezyHR native API | Yes (JSON endpoint) | No - HTML parsing |
| Filters (dept, location, salary, remote) | Yes | Limited |
| Structured output | JSON dataset + summary | Varies |
| Also a library/CLI | Yes (npm package) | No |
| Handles non-JSON redirects | Yes (graceful skip) | Breaks |

BreezyHR hosts job boards at `{company}.breezy.hr` with a public `/json` endpoint. Some companies redirect to custom career sites -- this scraper handles that gracefully, skipping non-JSON responses instead of crashing.

## What does Breezy HR Jobs Scraper do?

This Actor discovers every company hosting a job board on BreezyHR, hits their public JSON API, and returns structured data for every open role.

**What you get per job:**

| Field | Example |
|-------|---------|
| `company` | Hubstaff |
| `name` | Senior Software Engineer |
| `department` | Engineering |
| `location` | Berlin, Germany |
| `isRemote` | true |
| `salary` | $80,000 - $120,000 / yr |
| `type` | Full Time |
| `publishedDate` | 2026-03-01T00:00:00.000Z |
| `url` | https://hubstaff.breezy.hr/p/abc123-senior-engineer |

Plus `companySlug`, `jobId`, `friendlyId`, `locations` array, and `scrapedAt`.

## How to use

### 1. Scrape everything (zero config)

Set **Mode** to `all` and run. The Actor will:
1. Discover company subdomains from Common Crawl indexes
2. Hit every company's BreezyHR JSON endpoint
3. Return every open job as a structured dataset row

### 2. Scrape specific companies

Set **Mode** to `companies` and provide subdomains:
```
["hubstaff", "attentive", "breezy"]
```

### 3. Filter results

Use regex patterns to narrow results:
- **Location Filter:** `europe|germany|uk|remote`
- **Department Filter:** `engineering|product`
- **Keyword Filter:** `senior|staff|lead`
- **Salary Filter:** `\$` (any job with salary listed)
- **Remote Only:** Toggle on for remote jobs only

## Input schema

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `mode` | string | `all` | `all`, `companies`, or `search` |
| `companies` | string[] | `[]` | Company subdomains to scrape |
| `locationFilter` | string | `""` | Regex location filter |
| `departmentFilter` | string | `""` | Regex department filter |
| `keywordFilter` | string | `""` | Regex title/keyword filter |
| `salaryFilter` | string | `""` | Regex salary filter |
| `remoteOnly` | boolean | `false` | Only remote jobs |
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

This Actor is built on the `breezyhr-jobs` npm package. See [README.lib.md](./README.lib.md) for API reference, CLI usage, and install instructions.

```bash
npx breezyhr-jobs scrape --company hubstaff --format table
```
