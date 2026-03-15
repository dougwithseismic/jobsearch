# BambooHR Jobs Scraper - Auto-Discover SMB Companies

[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/bamboohr-jobs-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Scrape every job from every company using [BambooHR](https://www.bamboohr.com) as their ATS. Big with small and mid-size businesses across all industries. Two-step scrape: list endpoint for fast discovery, detail endpoint for full descriptions and compensation.

**The only BambooHR scraper that auto-discovers companies.** No manual URL input needed. One click, every job.

## What does BambooHR Jobs Scraper do?

This scraper discovers every company hosting a career page on `{slug}.bamboohr.com`, hits their JSON careers API, and returns structured data for every open role.

**What you get per job:**

| Field | Example |
|-------|---------|
| `jobOpeningName` | Senior Software Engineer |
| `departmentLabel` | Engineering |
| `employmentStatusLabel` | Full-Time |
| `location` | {city: "Salt Lake City", state: "Utah"} |
| `isRemote` | true |
| `locationType` | Remote |
| `jobOpeningShareUrl` | https://acme.bamboohr.com/careers/123 |

With `includeContent` enabled, also returns: `description` (HTML), `compensation`, `datePosted`, and `minimumExperience`.

## How to use

### 1. Scrape everything (zero config)

Set **Mode** to `all` and run. The scraper will:
1. Discover company slugs from the slug API
2. Hit every company's careers/list endpoint concurrently
3. Return every open job as structured data

### 2. Scrape specific companies

Set **Mode** to `companies` and provide slugs:
```
["acme", "techcorp", "startup"]
```

The slug is the subdomain in `{slug}.bamboohr.com`.

### 3. Filter results

Use regex patterns to narrow results:
- **Location Filter:** `utah|california|remote`
- **Department Filter:** `engineering|product`
- **Keyword Filter:** `senior|staff|lead`

## Input schema

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `mode` | string | `all` | `all`, `companies`, or `search` |
| `companies` | string[] | `[]` | Slugs to scrape |
| `locationFilter` | string | `""` | Regex location filter |
| `departmentFilter` | string | `""` | Regex department filter |
| `keywordFilter` | string | `""` | Regex title/keyword filter |
| `includeContent` | boolean | `false` | Fetch detail pages for descriptions |
| `concurrency` | integer | `10` | Parallel requests (1-20) |
| `maxCompanies` | integer | `0` | Limit companies (0 = all) |

## Output example

```json
{
  "company": "acme",
  "companySlug": "acme",
  "jobId": "123",
  "title": "Senior Software Engineer",
  "department": "Engineering",
  "employmentStatus": "Full-Time",
  "location": {
    "city": "Salt Lake City",
    "state": "Utah"
  },
  "isRemote": true,
  "jobUrl": "https://acme.bamboohr.com/careers/123",
  "scrapedAt": "2026-03-15T09:00:00.000Z"
}
```

Export as **JSON**, **CSV**, **Excel**, **XML**, or **RSS** from the Dataset tab.

## How it works

BambooHR exposes two JSON endpoints:

1. **List endpoint:** `GET {slug}.bamboohr.com/careers/list` -- returns all job openings with basic metadata (title, department, location, remote status)
2. **Detail endpoint:** `GET {slug}.bamboohr.com/careers/{jobId}/detail` -- returns full description, compensation, posting date, and share URL

The list endpoint is fast and gives you everything you need for filtering. The detail endpoint adds descriptions and is fetched per-job when `includeContent` is enabled.

BambooHR uses redirect-based routing -- a 302 response means the company doesn't exist or has no career page. The scraper handles this automatically.

## How much does it cost?

This scraper uses minimal compute -- no browser, just HTTP JSON fetches.

| Run Type | Time | Memory | Approximate Cost |
|----------|------|--------|------------------|
| Full scrape (all) | ~4 min | 512 MB | ~$0.08 |
| 50 companies | ~15 sec | 256 MB | ~$0.01 |
| Single company | ~2 sec | 256 MB | < $0.01 |

**Note:** With `includeContent` enabled, scrape time increases as each job requires an additional detail fetch.

**Free tier:** Apify's free plan includes $5/month -- enough for ~60 full scrapes.

## Also available as a library

```bash
npx bamboohr-jobs scrape --company acme --format table
```

### Library usage

```typescript
import { discoverSlugs, scrapeCompany, scrapeAll } from "bamboohr-jobs";

// Scrape one company (fast, list data only)
const result = await scrapeCompany("acme");
console.log(result?.jobs);

// With full descriptions
const detailed = await scrapeCompany("acme", { includeContent: true });

// Discover and scrape all
const slugs = await discoverSlugs();
const all = await scrapeAll(slugs, { concurrency: 10 });
```

## Use cases

- **Job seekers:** Find roles at small and mid-size companies often overlooked by big job boards
- **Recruiters:** Monitor hiring activity across SMBs
- **Market researchers:** Track hiring trends outside the big-tech ATS ecosystem
- **Job board operators:** Feed structured SMB job data into your platform
- **Lead generation:** Find growing SMBs actively hiring

## FAQ

**Why BambooHR?**
BambooHR is one of the most popular HR platforms for small and mid-size businesses. These companies are often invisible on Greenhouse/Lever-focused job boards. If you're looking beyond the usual tech startup ecosystem, BambooHR fills that gap.

**What's the difference between list and detail mode?**
The list endpoint returns basic job metadata (title, department, location, remote status) and is very fast. The detail endpoint adds full HTML descriptions, compensation info, and posting dates but requires one additional request per job.

**How often should I run this?**
Weekly for a full scrape. Daily in `companies` mode for specific companies.

---

## Author

**Doug Silkstone** -- Lead Full Stack Software Engineer. 15+ years, 3x exits. TypeScript, React, Node, scraping & automation.

[![Email](https://img.shields.io/badge/Email-doug%40withseismic.com-EA4335?logo=gmail&logoColor=white)](mailto:doug@withseismic.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-dougsilkstone-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/dougsilkstone)
[![GitHub](https://img.shields.io/badge/GitHub-dougwithseismic-181717?logo=github&logoColor=white)](https://github.com/dougwithseismic)
[![Apify](https://img.shields.io/badge/Apify-deadlyaccurate-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate)
