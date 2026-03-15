# Jobvite Jobs Scraper — Every Job From 1,200+ Companies

[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/jobvite-jobs-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-23-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Scrape every job from every company using [Jobvite](https://www.jobvite.com) as their ATS. IDEA Public Schools, Transdev, Cash America Pawn, and 1,200+ more.

**Auto-discovers companies and resolves Jobvite's two-step slug→companyId→XML flow automatically.**

## How it works

1. Input a company slug (e.g. `conair`)
2. Actor fetches career page HTML, extracts the `companyId`
3. Fetches the XML job feed at `app.jobvite.com/CompanyJobs/Xml.aspx?c={id}`
4. Returns structured job data with full descriptions

## Modes

| Mode | Description |
|------|-------------|
| `all` | Discover all companies from slug list, scrape everything |
| `companies` | Scrape specific company slugs |
| `search` | Scrape companies with filters applied |

## Input schema

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `mode` | string | `all` | `all`, `companies`, or `search` |
| `companies` | string[] | `[]` | Company slugs to scrape |
| `locationFilter` | string | `""` | Regex location filter |
| `departmentFilter` | string | `""` | Regex department filter |
| `keywordFilter` | string | `""` | Regex keyword filter |
| `remoteOnly` | boolean | `false` | Only remote jobs |
| `concurrency` | integer | `5` | Parallel requests (keep low — Cloudflare rate limits) |
| `maxCompanies` | integer | `0` | Limit companies (0 = all) |
| `outputFormat` | string | `unified` | `unified`, `raw`, or `both` |

## Output fields

| Field | Example |
|-------|---------|
| `title` | Senior Software Engineer |
| `category` | Engineering |
| `jobType` | Full-Time |
| `location` | San Francisco, CA, US |
| `date` | 2026-03-01 |
| `description` | Full HTML description |
| `applyUrl` | Direct apply link |
| `remoteType` | No Remote / Hybrid / Remote |

## Rate limiting

Jobvite uses Cloudflare protection. The scraper includes automatic retry with exponential backoff for 429/1015 errors. Keep concurrency at 5 or lower.

## Author

**Doug Silkstone** — Lead Full Stack Engineer

[![GitHub](https://img.shields.io/badge/GitHub-dougwithseismic-181717?logo=github)](https://github.com/dougwithseismic)
[![Apify](https://img.shields.io/badge/Apify-deadlyaccurate-00C853?logo=apify)](https://apify.com/deadlyaccurate)
