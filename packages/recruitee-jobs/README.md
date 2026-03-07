# Recruitee Jobs Scraper - Every Job From Recruitee-Powered Companies

[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/recruitee-jobs-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Scrape every job from companies using [Recruitee](https://recruitee.com) as their ATS. Bynder, Miro, Factorial, Personio, Vinted, and hundreds more.

**The only Recruitee scraper that auto-discovers companies.** No manual URL input needed. One click, every job.

## What does Recruitee Jobs Scraper do?

This Actor discovers every company hosting a job board on `*.recruitee.com`, hits their public offers API, and returns structured data for every open role.

Other Recruitee scrapers (competitors: Recruitee Jobs Search, 6 users) require you to already know the company URL. This one finds them for you -- auto-discovering company subdomains and validating each against Recruitee's API.

**What you get per job:**

| Field | Example |
|-------|---------|
| `company` | bynder |
| `title` | Senior Software Engineer |
| `department` | Engineering |
| `location` | Amsterdam, Netherlands |
| `country` | Netherlands |
| `city` | Amsterdam |
| `remote` | true |
| `employmentType` | FullTime |
| `tags` | ["engineering", "remote"] |
| `publishedAt` | 2026-03-01T00:00:00.000Z |
| `careersUrl` | https://bynder.recruitee.com/o/senior-software-engineer |

Plus `companySlug`, `jobId`, `state`, `scrapedAt`, and optionally `description`.

## How to use Recruitee Jobs Scraper

### Mode 1: Scrape Everything (Zero Config)

Set `mode` to **`all`** and click Start. That's it.

The Actor will:
1. Auto-discover every company using Recruitee via Common Crawl
2. Hit each company's public API endpoint concurrently
3. Push every job to the dataset

**Input:**
```json
{
  "mode": "all"
}
```

### Mode 2: Scrape Specific Companies

Set `mode` to **`companies`** and provide an array of Recruitee subdomains.

The slug is the subdomain in `{slug}.recruitee.com`. For example, Bynder's job board is at `bynder.recruitee.com`, so the slug is `bynder`.

**Input:**
```json
{
  "mode": "companies",
  "companies": ["bynder", "miro", "factorial", "personio"]
}
```

### Mode 3: Quick Search

Set `mode` to **`search`** to scrape specific companies and immediately filter by keyword, location, or department.

**Input:**
```json
{
  "mode": "search",
  "companies": ["bynder", "miro", "factorial"],
  "keywordFilter": "senior|staff|lead",
  "locationFilter": "remote|europe",
  "remoteOnly": true
}
```

## Filtering

All filters use **regex patterns** (case-insensitive) and can be combined:

### Find remote engineering jobs in Europe

```json
{
  "mode": "all",
  "remoteOnly": true,
  "locationFilter": "europe|germany|uk|france|netherlands|spain|portugal|czech|austria|switzerland|sweden|denmark|finland|norway|ireland|poland",
  "departmentFilter": "engineering|product|technology"
}
```

### Find senior leadership roles

```json
{
  "mode": "all",
  "keywordFilter": "lead|staff|principal|head.of|director|vp|founding",
  "departmentFilter": "engineering"
}
```

## Output example

Each row in the dataset is one job posting:

```json
{
  "company": "bynder",
  "companySlug": "bynder",
  "jobId": 12345,
  "title": "Senior Software Engineer, Backend",
  "department": "Engineering",
  "location": "Amsterdam, Netherlands",
  "country": "Netherlands",
  "city": "Amsterdam",
  "state": "North Holland",
  "remote": true,
  "employmentType": "FullTime",
  "tags": ["engineering", "backend"],
  "publishedAt": "2026-02-15T00:00:00.000Z",
  "careersUrl": "https://bynder.recruitee.com/o/senior-software-engineer-backend",
  "scrapedAt": "2026-03-06T09:33:00.000Z"
}
```

Export as **JSON**, **CSV**, **Excel**, **XML**, or **RSS** from the Dataset tab.

## How much does it cost?

This Actor uses minimal compute -- no browser, just HTTP API calls.

| Run Type | Time | Memory | Approximate Cost |
|----------|------|--------|------------------|
| Full scrape (all) | ~2 min | 512 MB | ~$0.05 |
| 50 companies | ~15 sec | 256 MB | ~$0.01 |
| Single company | ~2 sec | 256 MB | < $0.01 |

**Free tier:** Apify's free plan includes $5/month in platform credits -- enough for ~100 full scrapes.

## Integrate via API

### JavaScript / TypeScript

```javascript
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: 'YOUR_API_TOKEN' });

const run = await client.actor('deadlyaccurate/recruitee-jobs-scraper').call({
  mode: 'all',
  remoteOnly: true,
  departmentFilter: 'engineering',
});

const { items } = await client.dataset(run.defaultDatasetId).listItems();

console.log(`Found ${items.length} jobs`);
items.forEach((job) => {
  console.log(`${job.company} -- ${job.title} (${job.location})`);
});
```

### Python

```python
from apify_client import ApifyClient

client = ApifyClient('YOUR_API_TOKEN')

run = client.actor('deadlyaccurate/recruitee-jobs-scraper').call(run_input={
    'mode': 'all',
    'remoteOnly': True,
    'locationFilter': 'europe|uk|germany',
})

dataset = client.dataset(run['defaultDatasetId'])
for item in dataset.iterate_items():
    print(f"{item['company']} -- {item['title']} ({item['location']})")
```

## Recruitee's API

The Actor uses Recruitee's **public offers API**:

```
GET https://{slug}.recruitee.com/api/offers
```

This is a public API intended for companies to build custom career pages. No authentication required.

## Use cases

- **Job seekers:** Find every open role at companies using Recruitee
- **Recruiters:** Monitor hiring activity across the Recruitee ecosystem
- **Market researchers:** Track which departments are growing
- **Job board operators:** Feed structured job data into your platform
- **Lead generation:** Find companies actively hiring in specific domains

## FAQ

**How often should I run this?**
Job postings change daily. A weekly full scrape catches most changes.

**Can I scrape a company not in the discovery list?**
Yes -- use `companies` mode and provide the subdomain directly.

**Is this legal?**
This Actor uses Recruitee's public API endpoint. The data is publicly accessible. No authentication is bypassed.

**Why is this Actor so fast?**
No browser. No proxy. Just native HTTP `fetch` calls to Recruitee's API with concurrent workers. Each API response is pure JSON.

## Open source

Built on [recruitee-jobs](https://github.com/dougwithseismic/jobsearch) -- an open-source TypeScript library and CLI tool.

Also available as:
- **CLI tool:** `npx recruitee-jobs scrape`
- **Library:** `import { scrapeAll } from 'recruitee-jobs'`

---

## Author

**Doug Silkstone** -- Lead Full Stack Software Engineer. 15+ years, 3x exits. TypeScript, React, Node, scraping & automation.

[![Email](https://img.shields.io/badge/Email-doug%40withseismic.com-EA4335?logo=gmail&logoColor=white)](mailto:doug@withseismic.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-dougsilkstone-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/dougsilkstone)
[![GitHub](https://img.shields.io/badge/GitHub-dougwithseismic-181717?logo=github&logoColor=white)](https://github.com/dougwithseismic)
[![Book a Call](https://img.shields.io/badge/Book_a_Call-45min-00C853?logo=googlecalendar&logoColor=white)](https://cal.com/dougwithseismic/session-45)
[![Apify](https://img.shields.io/badge/Apify-deadlyaccurate-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate)

Need a custom scraper, data pipeline, or automation? [Book a call](https://cal.com/dougwithseismic/session-45) or email [doug@withseismic.com](mailto:doug@withseismic.com).
