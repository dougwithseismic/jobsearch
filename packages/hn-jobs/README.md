# HN Who is Hiring Scraper — Every Job From Hacker News, Structured

[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/hn-jobs-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Scrape **every job posting** from Hacker News ["Who is Hiring?"](https://news.ycombinator.com/submitted?id=whoishiring) monthly threads. Returns structured data — company, title, location, remote status, salary, technologies, apply URLs, and full descriptions.

## Why this one?

There are a few HN job scrapers on Apify. Here's why this one is different.

**Other scrapers rely on OpenAI to parse comments.** That means every run costs extra, depends on an external API key, and gives inconsistent results when the model changes. This scraper uses deterministic parsing — same input, same output, every time. No AI API calls, no extra costs, no surprises.

**Other scrapers only grab the latest thread.** HN posts a new "Who is Hiring?" thread every month. Most scrapers find one thread and stop. This one lets you scrape 1-12 months at once — useful for trend analysis, building datasets, or catching jobs from companies that posted last month but are still hiring.

**Other scrapers have no filtering.** You get a data dump and figure it out yourself. This one has built-in regex filters for location, keywords, technologies, and remote status — so you only get the jobs you care about.

**Other scrapers are minimal.** Short descriptions, no tests, no documentation. This one has 46 tests, full documentation, and is also available as an open-source TypeScript library and CLI tool.

### Head-to-head

| | This scraper | kutaui/hackernews-job-scraper | carmine_tennis/hn-who-is-hiring |
|---|:---:|:---:|:---:|
| Multi-month scraping (1-12) | Yes | No | No |
| Built-in filters (location, tech, remote) | Yes | No | No |
| Parsing approach | Deterministic | OpenAI (extra cost) | Unknown |
| Technology detection | 65+ keywords | Via OpenAI | Unknown |
| Test suite | 46 tests | None | None |
| Also a library/CLI | Yes | No | No |
| Price per 1,000 jobs | **$5** | $10 | $2 |
| Active users | New | 1 (dead since Nov '25) | 2 |

## What you get

Every month, [@whoishiring](https://news.ycombinator.com/user?id=whoishiring) posts a thread on Hacker News. Hundreds of companies — mostly startups, many founder-posted — drop job listings as comments. This scraper fetches those threads, parses every comment, and returns clean structured data.

| Field | Example |
|-------|---------|
| `company` | Cosuno |
| `title` | Senior Full Stack Developer (TypeScript) |
| `location` | Berlin, Germany |
| `isRemote` | true |
| `salary` | EUR 70k-100k |
| `technologies` | typescript, react, next.js, node.js, postgres |
| `url` | https://cosuno.com/careers |
| `commentUrl` | https://news.ycombinator.com/item?id=12345 |
| `threadMonth` | March 2026 |
| `description` | Full job description text |

Plus `isOnsite`, `isHybrid`, `applyUrl`, `postedAt`, and `threadUrl`.

### Recent scrape numbers

| Metric | Count |
|--------|-------|
| Jobs per 2-month scrape | **~690** |
| Remote jobs | **~50%** |
| With salary listed | **~15%** |
| Technologies detected | **~76%** |
| Scrape time (2 months) | **~45 seconds** |

## How to use it

Set the number of months and click Start. That's it.

```json
{
  "months": 2
}
```

### Filter examples

**Remote senior roles in Europe:**
```json
{
  "months": 2,
  "remoteOnly": true,
  "locationFilter": "europe|germany|uk|france|netherlands|spain|czech|poland",
  "keywordFilter": "senior|staff|lead|principal|founding"
}
```

**TypeScript/React jobs only:**
```json
{
  "months": 3,
  "technologyFilter": "typescript|react|next\\.js"
}
```

**Founding engineer roles:**
```json
{
  "months": 2,
  "keywordFilter": "founding|first engineer|head of"
}
```

### All input options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `months` | integer | 2 | Monthly threads to scrape (1-12) |
| `concurrency` | integer | 10 | Parallel requests (1-20) |
| `remoteOnly` | boolean | false | Only remote jobs |
| `locationFilter` | string | | Regex for location |
| `keywordFilter` | string | | Regex for title/description |
| `technologyFilter` | string | | Regex for technologies |
| `includeRawHtml` | boolean | false | Include raw HN comment HTML |

## Output

Each row in the dataset is one job:

```json
{
  "hnId": 43254321,
  "company": "Cosuno",
  "title": "Senior Full Stack Developer (TypeScript)",
  "location": "Berlin, Germany",
  "isRemote": true,
  "isOnsite": false,
  "isHybrid": false,
  "salary": "EUR 70k-100k",
  "technologies": ["typescript", "react", "next.js", "node.js", "postgresql"],
  "url": "https://cosuno.com/careers",
  "applyUrl": "https://cosuno.com/careers",
  "description": "We're building the construction industry's collaboration platform...",
  "postedAt": "2026-03-03T15:22:00.000Z",
  "threadMonth": "March 2026",
  "commentUrl": "https://news.ycombinator.com/item?id=43254321"
}
```

Export as JSON, CSV, Excel, or any format supported by Apify datasets.

A `SUMMARY` key in the key-value store gives you run metadata — total jobs, top companies by posting count, filters applied, and elapsed time.

## How much does it cost?

No browser, no proxy, no external API calls. Just lightweight HTTP fetches to HN's public Firebase API.

| Scrape | Time | Results | Cost |
|--------|------|---------|------|
| 1 month | ~25 sec | ~350 jobs | ~$1.75 |
| 2 months | ~45 sec | ~700 jobs | ~$3.50 |
| 6 months | ~2 min | ~2,000 jobs | ~$10.00 |

Plus Apify platform usage (minimal — 256 MB memory, no browser).

## Use cases

- **Job seekers** — Find startup jobs posted directly by founders, not recruiters
- **Recruiters** — Monitor the HN hiring community for sourcing leads
- **Job board operators** — Ingest founder-posted jobs that never hit LinkedIn or Indeed
- **Market researchers** — Track what technologies startups are hiring for, month over month
- **Data teams** — Build structured datasets from HN's unstructured comments

## Companion scraper

Pairs with [Ashby Jobs Scraper](https://apify.com/deadlyaccurate/ashby-jobs-scraper) — which scrapes 16,000+ jobs from 2,800+ companies using Ashby as their ATS (OpenAI, Notion, Ramp, Deel, Linear, Cursor, and more).

**HN Jobs** catches early-stage, founder-posted roles. **Ashby Jobs** catches established companies with formal hiring. Together they cover the startup ecosystem end to end.

## Open source

Also available as an open-source [TypeScript library and CLI tool](https://github.com/dougwithseismic/hn-jobs). Use it programmatically, run it locally, or deploy it here on Apify.

---

**Doug Silkstone** — Lead Full Stack Software Engineer. 15+ years, 3x exits. TypeScript, React, Node, scraping & automation.

[![Email](https://img.shields.io/badge/Email-doug%40withseismic.com-EA4335?logo=gmail&logoColor=white)](mailto:doug@withseismic.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-dougsilkstone-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/dougsilkstone)
[![GitHub](https://img.shields.io/badge/GitHub-dougwithseismic-181717?logo=github&logoColor=white)](https://github.com/dougwithseismic)
[![Book a Call](https://img.shields.io/badge/Book_a_Call-45min-00C853?logo=googlecalendar&logoColor=white)](https://cal.com/dougwithseismic/session-45)
[![Apify](https://img.shields.io/badge/Apify-deadlyaccurate-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate)

Need a custom scraper, data pipeline, or automation? [Book a call](https://cal.com/dougwithseismic/session-45) or email [doug@withseismic.com](mailto:doug@withseismic.com).
