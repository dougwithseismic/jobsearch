# Teamtailor Jobs Scraper -- Every Job From 6,500+ European Companies

[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/teamtailor-jobs-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Companies](https://img.shields.io/badge/Companies-6%2C500+-7c4dff)](https://apify.com/deadlyaccurate/teamtailor-jobs-scraper)

Scrape every job from every company using [Teamtailor](https://www.teamtailor.com) as their ATS. The biggest ATS in Europe -- dominant in the Nordics, DACH region, and UK. 6,500+ companies.

**The only Teamtailor scraper that auto-discovers companies.** No manual URL input needed. One click, every job.

## What does Teamtailor Jobs Scraper do?

This Actor discovers every company hosting a job board on `{slug}.teamtailor.com`, fetches their public RSS feed, and returns structured data for every open role.

Other Teamtailor scrapers require you to already know the company URL. This one finds them for you -- auto-discovering company slugs and validating each against Teamtailor's RSS endpoint.

**What you get per job:**

| Field | Example |
|-------|---------|
| `company` | klarna |
| `title` | Senior Backend Engineer |
| `department` | Engineering |
| `role` | Developer |
| `locations` | [{city: "Stockholm", country: "Sweden"}] |
| `remoteStatus` | hybrid |
| `pubDate` | 2026-03-01T00:00:00.000Z |
| `link` | https://klarna.teamtailor.com/jobs/12345 |

Plus `companySlug`, `scrapedAt`, and optionally `description` (full HTML).

## How to use Teamtailor Jobs Scraper

### Mode 1: Scrape Everything (Zero Config)

Set `mode` to **`all`** and click Start. That's it.

The Actor will:
1. Auto-discover every company using Teamtailor (~30 seconds)
2. Hit each company's RSS feed concurrently (~3-4 minutes)
3. Push every listed job to the dataset

**Input:**
```json
{
  "mode": "all"
}
```

### Mode 2: Scrape Specific Companies

Set `mode` to **`companies`** and provide an array of Teamtailor slugs.

The slug is the subdomain in `{slug}.teamtailor.com`. For example, Klarna's job board is at `klarna.teamtailor.com`, so the slug is `klarna`.

**Input:**
```json
{
  "mode": "companies",
  "companies": ["klarna", "spotify-sweden", "norrsken"]
}
```

### Mode 3: Quick Search

Set `mode` to **`search`** to scrape specific companies and immediately filter by keyword, location, or department.

**Input:**
```json
{
  "mode": "search",
  "companies": ["klarna", "spotify-sweden", "norrsken"],
  "keywordFilter": "senior|staff|lead",
  "locationFilter": "stockholm|remote"
}
```

## Filtering

All filters use **regex patterns** (case-insensitive) and can be combined:

### Find remote engineering jobs in the Nordics

```json
{
  "mode": "all",
  "locationFilter": "sweden|norway|denmark|finland|remote",
  "departmentFilter": "engineering|product|technology"
}
```

### Find senior roles in DACH

```json
{
  "mode": "all",
  "keywordFilter": "lead|staff|principal|head.of|director|vp|founding",
  "locationFilter": "germany|austria|switzerland|berlin|munich|vienna|zurich"
}
```

### Filter cheat sheet

| Filter | Pattern | Matches |
|--------|---------|---------|
| **Nordic engineering** | `locationFilter: "sweden\|norway\|denmark\|finland"`, `departmentFilter: "engineering"` | Nordic dev roles |
| **DACH region** | `locationFilter: "germany\|austria\|switzerland"` | German-speaking market |
| **UK tech** | `locationFilter: "uk\|united kingdom\|london\|manchester"` | British companies |
| **Leadership** | `keywordFilter: "lead\|staff\|head.of\|director\|vp"` | Senior positions |
| **Remote** | `locationFilter: "remote"` | Remote-friendly roles |

## Output example

Each row in the dataset is one job posting:

```json
{
  "company": "klarna",
  "companySlug": "klarna",
  "title": "Senior Backend Engineer",
  "department": "Engineering",
  "role": "Developer",
  "locations": [
    {
      "name": "Stockholm",
      "city": "Stockholm",
      "country": "Sweden",
      "address": "Sveavagen 46",
      "zip": "111 34"
    }
  ],
  "remoteStatus": "hybrid",
  "pubDate": "2026-03-01T00:00:00.000Z",
  "link": "https://klarna.teamtailor.com/jobs/12345",
  "guid": "https://klarna.teamtailor.com/jobs/12345",
  "scrapedAt": "2026-03-15T09:00:00.000Z"
}
```

Export as **JSON**, **CSV**, **Excel**, **XML**, or **RSS** from the Dataset tab.

## How much does it cost?

This Actor uses minimal compute -- no browser, just HTTP RSS fetches. A full scrape of all 6,500+ companies typically uses:

| Run Type | Time | Memory | Approximate Cost |
|----------|------|--------|------------------|
| Full scrape (all) | ~5 min | 512 MB | ~$0.10 |
| 50 companies | ~15 sec | 256 MB | ~$0.01 |
| Single company | ~2 sec | 256 MB | < $0.01 |

Pricing is based on [Apify compute units](https://docs.apify.com/platform/actors/running/usage-and-resources). No browser rendering, no proxy needed.

**Free tier:** Apify's free plan includes $5/month in platform credits -- enough for ~50 full scrapes.

## Integrate via API

### JavaScript / TypeScript

```javascript
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: 'YOUR_API_TOKEN' });

const run = await client.actor('deadlyaccurate/teamtailor-jobs-scraper').call({
  mode: 'all',
  locationFilter: 'sweden|norway|denmark|finland',
  departmentFilter: 'engineering',
});

const { items } = await client.dataset(run.defaultDatasetId).listItems();

console.log(`Found ${items.length} jobs`);
items.forEach((job) => {
  console.log(`${job.company} -- ${job.title} (${job.locations?.[0]?.city})`);
});
```

### Python

```python
from apify_client import ApifyClient

client = ApifyClient('YOUR_API_TOKEN')

run = client.actor('deadlyaccurate/teamtailor-jobs-scraper').call(run_input={
    'mode': 'all',
    'locationFilter': 'sweden|norway|denmark',
    'departmentFilter': 'engineering',
})

dataset = client.dataset(run['defaultDatasetId'])
for item in dataset.iterate_items():
    print(f"{item['company']} -- {item['title']} ({item.get('locations', [{}])[0].get('city', 'N/A')})")
```

## Teamtailor's RSS Feed

The Actor uses Teamtailor's **public RSS feed**:

```
GET https://{slug}.teamtailor.com/jobs.rss?per_page=200&offset=0
```

This is a public endpoint intended for RSS readers and job aggregators. No authentication required. The feed includes custom `tt:` namespace tags for structured location data, departments, and roles.

## Use cases

- **Job seekers:** Find every open role across 6,500+ European companies, filtered by location and department
- **Recruiters:** Monitor hiring activity across the Nordic, DACH, and UK markets
- **Market researchers:** Track European tech hiring trends by region
- **Job board operators:** Feed structured European job data into your platform
- **Lead generation:** Find companies actively hiring in specific European markets
- **Competitive intelligence:** Track competitor hiring patterns across Europe

## FAQ

**Why Teamtailor?**
Teamtailor is the largest ATS in Europe, particularly dominant in Sweden, Norway, Denmark, Finland, Germany, Austria, Switzerland, and the UK. If you're tracking European hiring, this is essential coverage.

**How often should I run this?**
Job postings change daily. A weekly full scrape catches most changes. For specific companies you're tracking closely, daily runs in `companies` mode are cheap.

**Why do some companies show 0 jobs?**
Their Teamtailor board may be empty, they may have switched ATS providers, or all their roles are unpublished. The Actor only returns publicly listed positions.

**Can I scrape a company not in the discovery list?**
Yes -- use `companies` mode and provide the slug directly. If you know a company's Teamtailor subdomain, just add it.

**How do I find a company's slug?**
Visit their career page. If it's hosted on Teamtailor, the URL will be `{slug}.teamtailor.com`. The slug is that subdomain.

## Open source

Built on [teamtailor-jobs](https://github.com/dougwithseismic/teamtailor-jobs) -- an open-source TypeScript library and CLI tool.

Also available as:
- **CLI tool:** `npx teamtailor-jobs scrape`
- **npm package:** `npm install teamtailor-jobs`

## Other scrapers by this author

- [Ashby Jobs Scraper](https://apify.com/deadlyaccurate/ashby-jobs-scraper) -- 2,800+ companies
- [Greenhouse Jobs Scraper](https://apify.com/deadlyaccurate/greenhouse-jobs-scraper) -- Airbnb, Stripe, Cloudflare
- [Lever Jobs Scraper](https://apify.com/deadlyaccurate/lever-jobs-scraper) -- Netflix, Spotify, Shopify
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
