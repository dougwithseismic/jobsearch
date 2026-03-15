# JazzHR Jobs Scraper - Auto-Discover Early-Stage Startups

[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/jazzhr-jobs-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Scrape every job from every company using [JazzHR](https://www.jazzhr.com) as their ATS. Popular with early-stage startups and small businesses. Widget HTML parser + JSON-LD enrichment for salary data.

**The only JazzHR scraper that auto-discovers companies.** No manual URL input needed. One click, every job.

## What does JazzHR Jobs Scraper do?

This scraper discovers every company using JazzHR's embeddable widget, parses the widget HTML to extract job listings, and optionally enriches each job with JSON-LD structured data from the detail page for salary, employment type, and full descriptions.

**Two-step enrichment:**
1. Parse widget HTML at `app.jazz.co/widgets/basic/create/{slug}` for job listings
2. Fetch each detail page at `{slug}.applytojob.com/apply/{jobId}` for JSON-LD `JobPosting` data

**What you get per job:**

| Field | Example |
|-------|---------|
| `title` | Senior Software Engineer |
| `department` | Engineering |
| `location` | San Francisco, CA |
| `applyUrl` | https://acme.applytojob.com/apply/abc123 |
| `datePosted` | 2026-03-01 |
| `employmentType` | FULL_TIME |
| `salary.currency` | USD |
| `salary.min` | 120000 |
| `salary.max` | 180000 |
| `salary.period` | year |

Plus `company` info (name, URL, logo), `city`, `state`, `experienceLevel`, and optionally `descriptionHtml`.

## How to use

### 1. Scrape everything (zero config)

Set **Mode** to `all` and run. The scraper will:
1. Discover company slugs from the slug API
2. Fetch each company's widget HTML
3. Parse job listings from embedded HTML
4. Return structured data

### 2. Scrape specific companies

Set **Mode** to `companies` and provide slugs:
```
["acme", "coolstartup", "techco"]
```

The slug is used in `app.jazz.co/widgets/basic/create/{slug}`.

### 3. Filter results

Use regex patterns to narrow results:
- **Location Filter:** `san francisco|remote|new york`
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
| `includeDescriptions` | boolean | `false` | Fetch detail pages for descriptions + JSON-LD |
| `concurrency` | integer | `10` | Parallel requests (1-20) |
| `maxCompanies` | integer | `0` | Limit companies (0 = all) |

## Output example

```json
{
  "company": "acme",
  "companySlug": "acme",
  "jobId": "job_abc123",
  "title": "Senior Software Engineer",
  "department": "Engineering",
  "location": "San Francisco, CA",
  "applyUrl": "https://acme.applytojob.com/apply/abc123",
  "datePosted": "2026-03-01",
  "employmentType": "FULL_TIME",
  "scrapedAt": "2026-03-15T09:00:00.000Z"
}
```

With `includeDescriptions` enabled:

```json
{
  "company": "acme",
  "companySlug": "acme",
  "jobId": "job_abc123",
  "title": "Senior Software Engineer",
  "department": "Engineering",
  "location": "San Francisco, CA",
  "applyUrl": "https://acme.applytojob.com/apply/abc123",
  "datePosted": "2026-03-01",
  "employmentType": "FULL_TIME",
  "experienceLevel": "5+ years",
  "salary": {
    "currency": "USD",
    "min": 120000,
    "max": 180000,
    "period": "year"
  },
  "descriptionHtml": "<p>We're looking for a senior engineer...</p>",
  "scrapedAt": "2026-03-15T09:00:00.000Z"
}
```

Export as **JSON**, **CSV**, **Excel**, **XML**, or **RSS** from the Dataset tab.

## How it works

JazzHR doesn't have a public JSON API. Instead, the scraper:

1. **Widget parsing:** Fetches the embeddable widget HTML from `app.jazz.co/widgets/basic/create/{slug}`. Parses job blocks identified by `id="resumator-job-{jobId}"` to extract title, location, department, and apply URL.

2. **JSON-LD enrichment:** When `includeDescriptions` is enabled, fetches each job's detail page at the `applytojob.com` URL and extracts the `<script type="application/ld+json">` block containing a `JobPosting` schema. This provides salary data, employment type, experience requirements, and full descriptions.

This two-step approach gives you fast discovery from the widget plus rich structured data from JSON-LD when you need it.

## How much does it cost?

No browser rendering needed. The widget endpoint returns lightweight HTML.

| Run Type | Time | Memory | Approximate Cost |
|----------|------|--------|------------------|
| Full scrape (all) | ~3 min | 512 MB | ~$0.08 |
| Full + descriptions | ~8 min | 512 MB | ~$0.15 |
| 50 companies | ~15 sec | 256 MB | ~$0.01 |
| Single company | ~2 sec | 256 MB | < $0.01 |

**Free tier:** Apify's free plan includes $5/month -- enough for ~30 full scrapes with descriptions.

## Also available as a library

```bash
npx jazzhr-jobs scrape --company acme --format table
```

### Library usage

```typescript
import { discoverSlugs, scrapeCompany, scrapeAll } from "jazzhr-jobs";

// Scrape one company (widget data only)
const result = await scrapeCompany("acme");
console.log(result?.jobs);

// With JSON-LD enrichment
const enriched = await scrapeCompany("acme", { includeDescriptions: true });
console.log(enriched?.jobs[0]?.salary);

// Discover and scrape all
const slugs = await discoverSlugs();
const all = await scrapeAll(slugs, { concurrency: 10 });
```

## Use cases

- **Job seekers:** Find roles at early-stage startups using JazzHR
- **Recruiters:** Monitor hiring activity at small companies
- **Salary researchers:** Extract salary data from JSON-LD JobPosting schemas
- **Job board operators:** Feed structured startup job data into your platform
- **Lead generation:** Find small companies actively hiring

## FAQ

**Why JazzHR?**
JazzHR is the go-to ATS for early-stage startups and small businesses that have outgrown spreadsheets but aren't ready for Greenhouse/Lever. Covers companies invisible on other ATS scrapers.

**How does the JSON-LD enrichment work?**
Each JazzHR detail page includes a `<script type="application/ld+json">` block with structured `JobPosting` data per schema.org. The scraper extracts salary ranges, employment type, experience requirements, and company info from this structured data.

**Why are some salary fields empty?**
Not all companies include compensation in their JazzHR listings. The salary data comes from the JSON-LD block, which is only populated when the company configures it.

---

## Author

**Doug Silkstone** -- Lead Full Stack Software Engineer. 15+ years, 3x exits. TypeScript, React, Node, scraping & automation.

[![Email](https://img.shields.io/badge/Email-doug%40withseismic.com-EA4335?logo=gmail&logoColor=white)](mailto:doug@withseismic.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-dougsilkstone-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/dougsilkstone)
[![GitHub](https://img.shields.io/badge/GitHub-dougwithseismic-181717?logo=github&logoColor=white)](https://github.com/dougwithseismic)
[![Apify](https://img.shields.io/badge/Apify-deadlyaccurate-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate)
