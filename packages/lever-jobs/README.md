# Lever Jobs Scraper - Auto-Discover Every Company

[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/lever-jobs-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Scrape every job from every company using [Lever](https://www.lever.co) as their ATS. Netflix, Spotify, Shopify, Cloudflare, Figma, Stripe, and thousands more.

**The only Lever scraper that auto-discovers companies.** No manual URL input needed. One click, every job.

## How is this different from other Lever scrapers?

| Feature | This Actor | Lever Job Scraper (50 users) | Lever Jobs Scraper |
|---------|-----------|------------------------------|-------------------|
| Auto-discovers companies | Yes | No - requires URLs | No - requires URLs |
| Price per result | Free tier / standard | Free tier | $0.0015/result |
| Filters (remote, location, dept) | Yes | No | No |
| Also works as npm library/CLI | Yes | No | No |
| Structured output (dept, team, commitment) | Yes | Partial | Partial |

Other Lever scrapers require you to already know the company URL. This one finds them for you — auto-discovering company slugs via Common Crawl and validating each against Lever's public API.

## What does Lever Jobs Scraper do?

This Actor discovers every company hosting a job board on `jobs.lever.co`, hits their public posting API, and returns structured data for every open role.

**What you get per job:**

| Field | Example |
|-------|---------|
| `company` | netflix |
| `title` | Senior Software Engineer |
| `department` | Engineering |
| `team` | Platform |
| `location` | Remote - US |
| `commitment` | Full-time |
| `workplaceType` | remote |
| `hostedUrl` | https://jobs.lever.co/netflix/abc123 |
| `applyUrl` | https://jobs.lever.co/netflix/abc123/apply |
| `createdAt` | 2026-03-01T00:00:00.000Z |

Plus `companySlug`, `jobId`, `allLocations`, `scrapedAt`, and optionally `description`.

## How to use Lever Jobs Scraper

### Mode 1: Scrape Everything (Zero Config)

Set `mode` to **`all`** and click Start. That's it.

The Actor will:
1. Auto-discover every company using Lever
2. Hit each company's public API endpoint concurrently
3. Push every job to the dataset

**Input:**
```json
{
  "mode": "all"
}
```

### Mode 2: Scrape Specific Companies

Set `mode` to **`companies`** and provide an array of Lever slugs.

The slug is the path in `jobs.lever.co/{slug}`. For example, Netflix's job board is at `jobs.lever.co/netflix`, so the slug is `netflix`.

**Input:**
```json
{
  "mode": "companies",
  "companies": ["netflix", "spotify", "shopify", "cloudflare", "figma"]
}
```

### Mode 3: Search with Filters

Combine any mode with filters to narrow results:

```json
{
  "mode": "all",
  "remoteOnly": true,
  "locationFilter": "europe|germany|uk|france|czech",
  "departmentFilter": "engineering|product",
  "keywordFilter": "senior|staff|lead"
}
```

## Filter reference

| Filter | Type | Example | Description |
|--------|------|---------|-------------|
| `remoteOnly` | boolean | `true` | Only remote jobs (checks workplaceType, location text, allLocations) |
| `locationFilter` | regex | `"europe\|remote"` | Match against location and allLocations |
| `departmentFilter` | regex | `"engineering"` | Match against department and team |
| `keywordFilter` | regex | `"senior\|staff"` | Match against job title and description |
| `maxCompanies` | integer | `100` | Limit companies scraped (0 = all) |

## Output

Each row in the dataset is one job posting. Use the "Overview" view for a clean table, or "Full Details" for all fields.

### Export formats

- **JSON** — structured, nested
- **CSV** — flat, one row per job
- **Excel** — via Apify's built-in export

## Also available as a library and CLI

This Actor is built on the `lever-jobs` npm package. You can use it programmatically or from the command line:

```bash
npx lever-jobs scrape --company netflix --format table
npx lever-jobs scrape --remote --location "europe" --format csv
```

See [README.lib.md](README.lib.md) for full library documentation.

## Cost

Lever's public API is free and requires no authentication. This Actor makes one API call per company (~1KB response each). A full scrape of all discovered companies typically uses minimal compute.

## Legal

This Actor uses Lever's public posting API (`api.lever.co/v0/postings`), which is designed for public consumption and requires no authentication. It only accesses publicly listed job postings.
