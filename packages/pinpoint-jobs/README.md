# Pinpoint Jobs Scraper - Auto-Discover 500+ Companies

[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/pinpoint-jobs-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Scrape every job from every company using [Pinpoint](https://www.pinpointhq.com) as their ATS. Popular in the UK market with 500+ companies. Rich compensation data, workplace types, and structured location info.

**The only Pinpoint scraper that auto-discovers companies.** No manual URL input needed. One click, every job.

## What does Pinpoint Jobs Scraper do?

This scraper discovers every company hosting a job board on `{slug}.pinpointhq.com`, hits their public JSON API, and returns structured data for every open role.

**What you get per job:**

| Field | Example |
|-------|---------|
| `title` | Senior Software Engineer |
| `department` | Engineering |
| `location` | {city: "London", province: "England"} |
| `workplaceType` | hybrid |
| `employmentType` | full_time |
| `compensationMin` | 80000 |
| `compensationMax` | 110000 |
| `compensationCurrency` | GBP |
| `compensationFrequency` | yearly |
| `url` | https://acme.pinpointhq.com/postings/12345 |

Plus `company`, `slug`, `id`, `deadlineAt`, `reportingTo`, `requisitionId`, `scrapedAt`, and optionally `content` (full HTML).

## How to use

### 1. Scrape everything (zero config)

Set **Mode** to `all` and run. The scraper will:
1. Discover company slugs from the slug API
2. Hit every company's JSON API endpoint concurrently
3. Return every open job as structured data

### 2. Scrape specific companies

Set **Mode** to `companies` and provide slugs:
```
["monzo", "bulb", "checkout"]
```

The slug is the subdomain in `{slug}.pinpointhq.com`.

### 3. Filter results

Use regex patterns to narrow results:
- **Location Filter:** `london|manchester|remote`
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
| `includeContent` | boolean | `false` | Include full HTML descriptions |
| `concurrency` | integer | `10` | Parallel requests (1-20) |
| `maxCompanies` | integer | `0` | Limit companies (0 = all) |

## Output example

```json
{
  "company": "monzo",
  "companySlug": "monzo",
  "id": "abc-123",
  "title": "Senior Backend Engineer",
  "department": "Engineering",
  "location": {
    "id": "loc-1",
    "city": "London",
    "name": "London Office",
    "postalCode": "EC2R 8AH",
    "province": "England"
  },
  "workplaceType": "hybrid",
  "workplaceTypeText": "Hybrid",
  "employmentType": "full_time",
  "employmentTypeText": "Full Time",
  "compensationVisible": true,
  "compensationMin": 80000,
  "compensationMax": 110000,
  "compensationCurrency": "GBP",
  "compensationFrequency": "yearly",
  "url": "https://monzo.pinpointhq.com/postings/abc-123",
  "scrapedAt": "2026-03-15T09:00:00.000Z"
}
```

Export as **JSON**, **CSV**, **Excel**, **XML**, or **RSS** from the Dataset tab.

## How it works

Pinpoint exposes a public JSON API at `{slug}.pinpointhq.com/postings.json`. The response contains a `data` array of job postings with full structured metadata including compensation ranges, workplace types, and location details.

The API returns all data in a single response -- no pagination needed for most companies.

## How much does it cost?

This scraper uses minimal compute -- no browser, just HTTP JSON fetches. Typical costs:

| Run Type | Time | Memory | Approximate Cost |
|----------|------|--------|------------------|
| Full scrape (all) | ~2 min | 512 MB | ~$0.05 |
| 50 companies | ~10 sec | 256 MB | ~$0.01 |
| Single company | ~1 sec | 256 MB | < $0.01 |

**Free tier:** Apify's free plan includes $5/month -- enough for ~100 full scrapes.

## Also available as a library

```bash
npx pinpoint-jobs scrape --company monzo --format table
```

### Library usage

```typescript
import { discoverSlugs, scrapeCompany, scrapeAll } from "pinpoint-jobs";

// Scrape one company
const result = await scrapeCompany("monzo");
console.log(result?.jobs);

// Discover and scrape all
const slugs = await discoverSlugs();
const all = await scrapeAll(slugs, { concurrency: 10 });
```

## Use cases

- **Job seekers:** Find every open role at UK-based companies using Pinpoint
- **Recruiters:** Monitor hiring activity across the UK tech market
- **Market researchers:** Track compensation ranges across companies and roles
- **Job board operators:** Feed structured UK job data with salary info into your platform
- **Lead generation:** Find companies actively hiring in the UK

---

## Author

**Doug Silkstone** -- Lead Full Stack Software Engineer. 15+ years, 3x exits. TypeScript, React, Node, scraping & automation.

[![Email](https://img.shields.io/badge/Email-doug%40withseismic.com-EA4335?logo=gmail&logoColor=white)](mailto:doug@withseismic.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-dougsilkstone-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/dougsilkstone)
[![GitHub](https://img.shields.io/badge/GitHub-dougwithseismic-181717?logo=github&logoColor=white)](https://github.com/dougwithseismic)
[![Apify](https://img.shields.io/badge/Apify-deadlyaccurate-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate)
