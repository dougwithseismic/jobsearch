# Dover Jobs Scraper -- Every Job From YC Startups & Early-Stage Companies

[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/dover-jobs-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Scrape every job from every company using [Dover](https://www.dover.com) as their ATS. Popular with Y Combinator startups and early-stage funded companies. Rich compensation data.

**The only Dover scraper that auto-discovers companies.** No manual URL input needed. One click, every job.

## What does Dover Jobs Scraper do?

This Actor discovers every company using Dover's career pages, resolves their slug to an internal UUID via Dover's REST API, and returns structured data for every published job listing.

**What you get per job:**

| Field | Example |
|-------|---------|
| `company` | Acme Corp |
| `title` | Senior Software Engineer |
| `locations` | [{name: "Remote - US", location_type: "REMOTE"}] |
| `domain` | acme.com |
| `logoUrl` | https://dover.com/logos/acme.png |
| `is_published` | true |

Plus `companySlug`, `clientId`, `jobId`, `scrapedAt`. Unified output format includes compensation bounds, equity ranges, visa support, and employment type.

## How to use Dover Jobs Scraper

### Mode 1: Scrape Everything (Zero Config)

Set `mode` to **`all`** and click Start.

The Actor will:
1. Auto-discover every company using Dover (~15 seconds)
2. Resolve each slug to a company UUID
3. Fetch all published jobs concurrently (~2 minutes)
4. Push every job to the dataset

**Input:**
```json
{
  "mode": "all"
}
```

### Mode 2: Scrape Specific Companies

Set `mode` to **`companies`** and provide an array of Dover slugs.

The slug is the path in `app.dover.com/apply/{slug}`.

**Input:**
```json
{
  "mode": "companies",
  "companies": ["acme", "startup-xyz", "cool-company"]
}
```

### Mode 3: Quick Search

Set `mode` to **`search`** to scrape specific companies and immediately filter.

**Input:**
```json
{
  "mode": "search",
  "companies": ["acme", "startup-xyz"],
  "keywordFilter": "senior|staff|founding",
  "locationFilter": "remote|san francisco"
}
```

## Filtering

All filters use **regex patterns** (case-insensitive) and can be combined:

### Find remote engineering roles at startups

```json
{
  "mode": "all",
  "locationFilter": "remote",
  "keywordFilter": "engineer|developer|full.?stack"
}
```

### Find founding engineer roles

```json
{
  "mode": "all",
  "keywordFilter": "founding|first.engineer|head.of.engineering"
}
```

### Filter cheat sheet

| Filter | Pattern | Matches |
|--------|---------|---------|
| **Remote roles** | `locationFilter: "remote"` | All remote jobs |
| **US tech hubs** | `locationFilter: "san francisco\|new york\|austin\|seattle"` | Major US cities |
| **Founding roles** | `keywordFilter: "founding\|first.engineer\|head.of"` | Early-stage positions |
| **Full-stack** | `keywordFilter: "full.?stack\|fullstack"` | Full-stack roles |

## Output example

Each row in the dataset is one job posting:

```json
{
  "company": "Acme Corp",
  "companySlug": "acme",
  "clientId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "logoUrl": "https://dover.com/logos/acme.png",
  "domain": "acme.com",
  "jobId": "job-uuid-123",
  "title": "Senior Software Engineer",
  "locations": [
    {
      "location_type": "REMOTE",
      "location_option": {
        "id": "opt-1",
        "display_name": "Remote - US",
        "location_type": "COUNTRY",
        "city": "",
        "state": "",
        "country": "US"
      },
      "name": "Remote - US"
    }
  ],
  "isPublished": true,
  "scrapedAt": "2026-03-15T09:00:00.000Z"
}
```

Export as **JSON**, **CSV**, **Excel**, **XML**, or **RSS** from the Dataset tab.

## How much does it cost?

This Actor uses minimal compute -- no browser, just HTTP API calls. Two API calls per company (slug resolve + job fetch).

| Run Type | Time | Memory | Approximate Cost |
|----------|------|--------|------------------|
| Full scrape (all) | ~3 min | 512 MB | ~$0.08 |
| 50 companies | ~20 sec | 256 MB | ~$0.01 |
| Single company | ~2 sec | 256 MB | < $0.01 |

Pricing is based on [Apify compute units](https://docs.apify.com/platform/actors/running/usage-and-resources). No browser rendering, no proxy needed.

**Free tier:** Apify's free plan includes $5/month in platform credits -- enough for ~60 full scrapes.

## Integrate via API

### JavaScript / TypeScript

```javascript
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: 'YOUR_API_TOKEN' });

const run = await client.actor('deadlyaccurate/dover-jobs-scraper').call({
  mode: 'all',
  locationFilter: 'remote',
  keywordFilter: 'engineer',
});

const { items } = await client.dataset(run.defaultDatasetId).listItems();

console.log(`Found ${items.length} jobs`);
items.forEach((job) => {
  console.log(`${job.company} -- ${job.title}`);
});
```

### Python

```python
from apify_client import ApifyClient

client = ApifyClient('YOUR_API_TOKEN')

run = client.actor('deadlyaccurate/dover-jobs-scraper').call(run_input={
    'mode': 'all',
    'locationFilter': 'remote',
})

dataset = client.dataset(run['defaultDatasetId'])
for item in dataset.iterate_items():
    print(f"{item['company']} -- {item['title']}")
```

## Dover's API

The Actor uses Dover's **public REST API** at `app.dover.com/api/v1/`:

1. **Slug resolution:** `GET /careers-page-slug/{slug}` -- returns company UUID, name, logo, domain
2. **Job listing:** `GET /careers-page/{uuid}/jobs?limit=300` -- returns all published jobs
3. **Job detail:** `GET /application-portal-job/{jobId}` -- returns compensation, visa, full description

These are public endpoints used by Dover's own career page widgets. No authentication required.

## Use cases

- **Job seekers:** Find every open role at YC startups and early-stage companies
- **Recruiters:** Monitor hiring activity across the startup ecosystem
- **Market researchers:** Track startup hiring trends and compensation
- **Job board operators:** Feed structured startup job data into your platform
- **Investors:** Track portfolio company hiring velocity as a growth signal
- **Competitive intelligence:** Monitor startup team growth and hiring priorities

## FAQ

**Why Dover?**
Dover is the go-to ATS for Y Combinator startups and early-stage funded companies. If you're targeting the startup ecosystem, this covers companies that aren't on Greenhouse or Lever yet.

**What's the three-step process?**
Dover uses internal UUIDs, not slugs, for API calls. The scraper resolves slug to UUID automatically, then fetches jobs. You don't need to worry about it.

**Can I get salary data?**
Yes -- set `outputFormat` to `unified` and the normalizer will include compensation bounds, currency, equity ranges, and employment type when available.

## Open source

Built on [dover-jobs](https://github.com/dougwithseismic/dover-jobs) -- an open-source TypeScript library and CLI tool.

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
