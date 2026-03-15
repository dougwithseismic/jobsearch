# Pinpoint Jobs Scraper -- Every Job From 500+ UK Companies

[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/pinpoint-jobs-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Companies](https://img.shields.io/badge/Companies-500+-7c4dff)](https://apify.com/deadlyaccurate/pinpoint-jobs-scraper)

Scrape every job from every company using [Pinpoint](https://www.pinpointhq.com) as their ATS. Popular in the UK with 500+ companies. Rich compensation data included.

**The only Pinpoint scraper that auto-discovers companies.** No manual URL input needed. One click, every job.

## What does Pinpoint Jobs Scraper do?

This Actor discovers every company hosting a job board on `{slug}.pinpointhq.com`, hits their public JSON API, and returns structured data for every open role -- including salary ranges when published.

**What you get per job:**

| Field | Example |
|-------|---------|
| `company` | monzo |
| `title` | Senior Backend Engineer |
| `department` | Engineering |
| `location` | {city: "London", province: "England"} |
| `workplaceType` | hybrid |
| `employmentType` | full_time |
| `compensationMin` | 80000 |
| `compensationMax` | 110000 |
| `compensationCurrency` | GBP |
| `compensationFrequency` | yearly |
| `url` | https://monzo.pinpointhq.com/postings/abc-123 |

Plus `id`, `deadlineAt`, `reportingTo`, `requisitionId`, `scrapedAt`, and optionally `content`.

## How to use Pinpoint Jobs Scraper

### Mode 1: Scrape Everything (Zero Config)

Set `mode` to **`all`** and click Start. That's it.

The Actor will:
1. Auto-discover every company using Pinpoint (~15 seconds)
2. Hit each company's JSON API endpoint concurrently (~60 seconds)
3. Push every listed job to the dataset

**Input:**
```json
{
  "mode": "all"
}
```

### Mode 2: Scrape Specific Companies

Set `mode` to **`companies`** and provide an array of Pinpoint slugs.

The slug is the subdomain in `{slug}.pinpointhq.com`.

**Input:**
```json
{
  "mode": "companies",
  "companies": ["monzo", "bulb", "checkout"]
}
```

### Mode 3: Quick Search

Set `mode` to **`search`** to scrape specific companies and immediately filter.

**Input:**
```json
{
  "mode": "search",
  "companies": ["monzo", "bulb", "checkout"],
  "keywordFilter": "senior|staff|lead",
  "locationFilter": "london|remote"
}
```

## Filtering

All filters use **regex patterns** (case-insensitive) and can be combined:

### Find engineering jobs in London

```json
{
  "mode": "all",
  "locationFilter": "london",
  "departmentFilter": "engineering|product|technology"
}
```

### Find senior leadership roles

```json
{
  "mode": "all",
  "keywordFilter": "lead|staff|principal|head.of|director|vp|founding"
}
```

### Filter cheat sheet

| Filter | Pattern | Matches |
|--------|---------|---------|
| **London engineering** | `locationFilter: "london"`, `departmentFilter: "engineering"` | London dev roles |
| **UK-wide** | `locationFilter: "london\|manchester\|birmingham\|edinburgh\|bristol"` | Major UK cities |
| **Leadership** | `keywordFilter: "lead\|staff\|head.of\|director"` | Senior positions |
| **Remote** | `locationFilter: "remote"` | Remote-friendly roles |

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
  "deadlineAt": null,
  "reportingTo": "Engineering Manager",
  "url": "https://monzo.pinpointhq.com/postings/abc-123",
  "scrapedAt": "2026-03-15T09:00:00.000Z"
}
```

Export as **JSON**, **CSV**, **Excel**, **XML**, or **RSS** from the Dataset tab.

## How much does it cost?

This Actor uses minimal compute -- no browser, just HTTP JSON fetches.

| Run Type | Time | Memory | Approximate Cost |
|----------|------|--------|------------------|
| Full scrape (all) | ~2 min | 512 MB | ~$0.05 |
| 50 companies | ~10 sec | 256 MB | ~$0.01 |
| Single company | ~1 sec | 256 MB | < $0.01 |

Pricing is based on [Apify compute units](https://docs.apify.com/platform/actors/running/usage-and-resources). No browser rendering, no proxy needed.

**Free tier:** Apify's free plan includes $5/month in platform credits -- enough for ~100 full scrapes.

## Integrate via API

### JavaScript / TypeScript

```javascript
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: 'YOUR_API_TOKEN' });

const run = await client.actor('deadlyaccurate/pinpoint-jobs-scraper').call({
  mode: 'all',
  locationFilter: 'london|remote',
  departmentFilter: 'engineering',
});

const { items } = await client.dataset(run.defaultDatasetId).listItems();

console.log(`Found ${items.length} jobs`);
items.forEach((job) => {
  const salary = job.compensationVisible
    ? `${job.compensationCurrency} ${job.compensationMin}-${job.compensationMax}`
    : 'N/A';
  console.log(`${job.company} -- ${job.title} (${salary})`);
});
```

### Python

```python
from apify_client import ApifyClient

client = ApifyClient('YOUR_API_TOKEN')

run = client.actor('deadlyaccurate/pinpoint-jobs-scraper').call(run_input={
    'mode': 'all',
    'locationFilter': 'london|remote',
})

dataset = client.dataset(run['defaultDatasetId'])
for item in dataset.iterate_items():
    print(f"{item['company']} -- {item['title']} ({item.get('location', {}).get('city', 'N/A')})")
```

## Pinpoint's API

The Actor uses Pinpoint's **public JSON API**:

```
GET https://{slug}.pinpointhq.com/postings.json
```

This is a public endpoint. No authentication required. Returns all published job postings with full metadata including compensation ranges, workplace types, and structured location data.

## Use cases

- **Job seekers:** Find every open role at UK companies with published salary ranges
- **Recruiters:** Monitor hiring activity across the UK Pinpoint ecosystem
- **Salary researchers:** Aggregate compensation data across companies and roles
- **Job board operators:** Feed structured UK job data into your platform
- **Lead generation:** Find companies actively hiring in the UK market
- **Competitive intelligence:** Track competitor hiring and compensation patterns

## FAQ

**Why Pinpoint?**
Pinpoint is popular with UK-based companies, particularly in fintech, SaaS, and professional services. Their API returns rich structured data including compensation ranges -- rare among ATS platforms.

**How often should I run this?**
Weekly for a full scrape. Daily in `companies` mode for specific companies.

**Can I get salary data?**
Yes -- when companies choose to publish compensation on their Pinpoint board, the API returns `compensationMin`, `compensationMax`, `compensationCurrency`, and `compensationFrequency`.

## Open source

Built on [pinpoint-jobs](https://github.com/dougwithseismic/pinpoint-jobs) -- an open-source TypeScript library and CLI tool.

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
