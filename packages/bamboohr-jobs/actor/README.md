# BambooHR Jobs Scraper -- Every Job From SMB Companies

[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/bamboohr-jobs-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Scrape every job from every company using [BambooHR](https://www.bamboohr.com) as their ATS. Big with small and mid-size businesses across all industries.

**The only BambooHR scraper that auto-discovers companies.** No manual URL input needed. One click, every job.

## What does BambooHR Jobs Scraper do?

This Actor discovers every company hosting a career page on `{slug}.bamboohr.com`, hits their JSON careers API, and returns structured data for every open role.

**What you get per job:**

| Field | Example |
|-------|---------|
| `company` | acme |
| `title` | Senior Software Engineer |
| `department` | Engineering |
| `employmentStatus` | Full-Time |
| `location` | {city: "Salt Lake City", state: "Utah"} |
| `isRemote` | true |
| `locationType` | Remote |
| `jobUrl` | https://acme.bamboohr.com/careers/123 |

With `includeContent`, also: `description`, `compensation`, `datePosted`, `minimumExperience`.

## How to use BambooHR Jobs Scraper

### Mode 1: Scrape Everything (Zero Config)

Set `mode` to **`all`** and click Start.

The Actor will:
1. Auto-discover every company using BambooHR
2. Hit each company's careers list endpoint concurrently
3. Push every listed job to the dataset

**Input:**
```json
{
  "mode": "all"
}
```

### Mode 2: Scrape Specific Companies

Set `mode` to **`companies`** and provide an array of BambooHR slugs.

The slug is the subdomain in `{slug}.bamboohr.com`.

**Input:**
```json
{
  "mode": "companies",
  "companies": ["acme", "techcorp", "startup"]
}
```

### Mode 3: Quick Search

Set `mode` to **`search`** to scrape specific companies and immediately filter.

**Input:**
```json
{
  "mode": "search",
  "companies": ["acme", "techcorp"],
  "keywordFilter": "senior|staff|lead",
  "locationFilter": "remote|california"
}
```

## Filtering

All filters use **regex patterns** (case-insensitive) and can be combined:

### Find remote engineering jobs

```json
{
  "mode": "all",
  "locationFilter": "remote",
  "departmentFilter": "engineering|product|technology"
}
```

### Find senior roles

```json
{
  "mode": "all",
  "keywordFilter": "lead|staff|principal|head.of|director|vp|senior"
}
```

### Filter cheat sheet

| Filter | Pattern | Matches |
|--------|---------|---------|
| **Remote roles** | `locationFilter: "remote"` | All remote jobs |
| **US West Coast** | `locationFilter: "california\|oregon\|washington\|san francisco\|seattle"` | West Coast roles |
| **Engineering** | `departmentFilter: "engineering\|product\|technology"` | Tech departments |
| **Leadership** | `keywordFilter: "lead\|staff\|head.of\|director"` | Senior positions |

## Output example

Each row in the dataset is one job posting:

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
  "description": "<p>We are looking for...</p>",
  "jobUrl": "https://acme.bamboohr.com/careers/123",
  "scrapedAt": "2026-03-15T09:00:00.000Z"
}
```

Export as **JSON**, **CSV**, **Excel**, **XML**, or **RSS** from the Dataset tab.

## How much does it cost?

This Actor uses minimal compute -- no browser, just HTTP JSON fetches.

| Run Type | Time | Memory | Approximate Cost |
|----------|------|--------|------------------|
| Full scrape (all) | ~4 min | 512 MB | ~$0.08 |
| 50 companies | ~15 sec | 256 MB | ~$0.01 |
| Single company | ~2 sec | 256 MB | < $0.01 |

With `includeContent` enabled, time increases as each job requires an additional detail fetch.

Pricing is based on [Apify compute units](https://docs.apify.com/platform/actors/running/usage-and-resources). No browser rendering, no proxy needed.

**Free tier:** Apify's free plan includes $5/month in platform credits -- enough for ~60 full scrapes.

## Integrate via API

### JavaScript / TypeScript

```javascript
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: 'YOUR_API_TOKEN' });

const run = await client.actor('deadlyaccurate/bamboohr-jobs-scraper').call({
  mode: 'all',
  departmentFilter: 'engineering',
  includeContent: true,
});

const { items } = await client.dataset(run.defaultDatasetId).listItems();

console.log(`Found ${items.length} jobs`);
items.forEach((job) => {
  console.log(`${job.company} -- ${job.title} (${job.location?.city}, ${job.location?.state})`);
});
```

### Python

```python
from apify_client import ApifyClient

client = ApifyClient('YOUR_API_TOKEN')

run = client.actor('deadlyaccurate/bamboohr-jobs-scraper').call(run_input={
    'mode': 'all',
    'departmentFilter': 'engineering',
})

dataset = client.dataset(run['defaultDatasetId'])
for item in dataset.iterate_items():
    print(f"{item['company']} -- {item['title']}")
```

## BambooHR's API

The Actor uses BambooHR's **public careers API**:

```
GET https://{slug}.bamboohr.com/careers/list
GET https://{slug}.bamboohr.com/careers/{jobId}/detail
```

The list endpoint returns all openings with metadata. The detail endpoint adds full descriptions, compensation, and posting dates. Both are public endpoints used by BambooHR's embeddable career pages. No authentication required.

## Use cases

- **Job seekers:** Find roles at small and mid-size companies overlooked by big job boards
- **Recruiters:** Monitor hiring activity across SMBs and traditional businesses
- **Market researchers:** Track hiring trends outside the big-tech ATS ecosystem
- **Job board operators:** Feed structured SMB job data into your platform
- **Lead generation:** Find growing businesses actively hiring
- **HR analytics:** Track employment patterns across industries

## FAQ

**Why BambooHR?**
BambooHR dominates the SMB market. These companies are invisible on Greenhouse/Lever-focused job boards. If you want coverage beyond tech startups, BambooHR is essential.

**What's the difference between list and detail mode?**
Without `includeContent`, you get fast metadata (title, department, location, remote status). With `includeContent`, each job gets an additional detail fetch for full descriptions and compensation -- slower but richer data.

**How often should I run this?**
Weekly for a full scrape. Daily in `companies` mode for specific companies.

**Why do some slugs return nothing?**
BambooHR redirects (302) for companies that don't exist or have no public career page. The Actor handles this automatically.

## Open source

Built on [bamboohr-jobs](https://github.com/dougwithseismic/bamboohr-jobs) -- an open-source TypeScript library and CLI tool.

## Other scrapers by this author

- [Ashby Jobs Scraper](https://apify.com/deadlyaccurate/ashby-jobs-scraper) -- 2,800+ companies
- [Greenhouse Jobs Scraper](https://apify.com/deadlyaccurate/greenhouse-jobs-scraper) -- Airbnb, Stripe, Cloudflare
- [Teamtailor Jobs Scraper](https://apify.com/deadlyaccurate/teamtailor-jobs-scraper) -- 6,500+ European companies
- [deadlyaccuratejobs](https://apify.com/deadlyaccurate/deadlyaccuratejobs) -- One search, every ATS

---

## Author

**Doug Silkstone** -- Lead Full Stack Software Engineer. 15+ years, 3x exits. TypeScript, React, Node, scraping & automation.

[![Email](https://img.shields.io/badge/Email-doug%40withseismic.com-EA4335?logo=gmail&logoColor=white)](mailto:doug@withseismic.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-dougsilkstone-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/dougsilkstone)
[![GitHub](https://img.shields.io/badge/GitHub-dougwithseismic-181717?logo=github&logoColor=white)](https://github.com/dougwithseismic)
[![Book a Call](https://img.shields.io/badge/Book_a_Call-45min-00C853?logo=googlecalendar&logoColor=white)](https://cal.com/dougwithseismic/session-45)
[![Apify](https://img.shields.io/badge/Apify-deadlyaccurate-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate)

Need a custom scraper, data pipeline, or automation? [Book a call](https://cal.com/dougwithseismic/session-45) or email [doug@withseismic.com](mailto:doug@withseismic.com).
