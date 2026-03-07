# Workable Jobs Scraper - Every Job From 1,700+ Companies

[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/workable-jobs-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Scrape every job from every company using [Workable](https://www.workable.com) as their ATS. 1000heads, Typeform, Spotify, Semrush, Personio, N26, Trivago, Delivery Hero, and 1,700+ more.

**The only Workable scraper that auto-discovers companies.** No manual URL input needed. One click, every job.

## Why this over existing Workable scrapers?

The top Workable Jobs Scraper on Apify has 250+ users and charges $10/month rental. It requires you to manually provide company URLs one at a time.

This Actor:
- **Auto-discovers 1,700+ companies** via Common Crawl. Zero manual input.
- **Pay per result**, not monthly rental. A full scrape costs ~$0.05.
- **No browser, no proxy** -- pure API calls. 10x faster, 10x cheaper.

## What does Workable Jobs Scraper do?

This Actor discovers every company hosting a job board on `apply.workable.com`, hits their public widget API, and returns structured data for every open role.

**What you get per job:**

| Field | Example |
|-------|---------|
| `company` | 1000heads |
| `title` | Account Director (Japan) |
| `department` | Client Services |
| `employmentType` | Full-time |
| `isRemote` | false |
| `country` | Australia |
| `city` | Sydney |
| `state` | New South Wales |
| `experience` | Director |
| `industry` | Marketing and Advertising |
| `publishedAt` | 2026-02-04 |
| `jobUrl` | https://apply.workable.com/j/BF0AB8287B |
| `applyUrl` | https://apply.workable.com/j/BF0AB8287B/apply |

Plus `companySlug`, `shortcode`, `locations` (array with countryCode), and `scrapedAt`.

## How to use Workable Jobs Scraper

### Mode 1: Scrape Everything (Zero Config)

Set `mode` to **`all`** and click Start. That's it.

The Actor will:
1. Auto-discover every company using Workable (~60 seconds)
2. Hit each company's public widget API concurrently (~90 seconds)
3. Push every job to the dataset

**Input:**
```json
{
  "mode": "all"
}
```

### Mode 2: Scrape Specific Companies

Set `mode` to **`companies`** and provide an array of Workable slugs.

The slug is the path in `apply.workable.com/{slug}`. For example, 1000heads' job board is at `apply.workable.com/1000heads`, so the slug is `1000heads`.

**Input:**
```json
{
  "mode": "companies",
  "companies": ["1000heads", "typeform", "spotify", "semrush", "personio"]
}
```

### Mode 3: Quick Search

Set `mode` to **`search`** to scrape specific companies and immediately filter by keyword, location, or department.

**Input:**
```json
{
  "mode": "search",
  "companies": ["1000heads", "typeform", "semrush"],
  "keywordFilter": "senior|staff|lead",
  "locationFilter": "remote|europe|germany",
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

### Filter cheat sheet

| Filter | Pattern | Matches |
|--------|---------|---------|
| **Remote European engineering** | `remoteOnly: true`, `locationFilter: "europe\|uk\|germany"`, `departmentFilter: "engineering"` | Remote tech roles in EU |
| **Leadership** | `keywordFilter: "lead\|staff\|head.of\|director\|vp"` | Senior positions |
| **Full-stack** | `keywordFilter: "full.?stack\|fullstack"` | Full-stack engineers |
| **Entry-level** | `keywordFilter: "intern\|junior\|entry\|graduate"` | Entry-level roles |

## Output example

Each row in the dataset is one job posting:

```json
{
  "company": "1000heads",
  "companySlug": "1000heads",
  "shortcode": "BF0AB8287B",
  "title": "Account Director (Japan)",
  "department": "Client Services",
  "employmentType": "Full-time",
  "isRemote": false,
  "country": "Australia",
  "city": "Sydney",
  "state": "New South Wales",
  "locations": [
    {
      "country": "Australia",
      "countryCode": "AU",
      "city": "Sydney",
      "region": "New South Wales"
    }
  ],
  "experience": "Director",
  "industry": "Marketing and Advertising",
  "publishedAt": "2026-02-04",
  "jobUrl": "https://apply.workable.com/j/BF0AB8287B",
  "applyUrl": "https://apply.workable.com/j/BF0AB8287B/apply",
  "scrapedAt": "2026-03-06T09:33:00.000Z"
}
```

Export as **JSON**, **CSV**, **Excel**, **XML**, or **RSS** from the Dataset tab.

## How much does it cost?

This Actor uses minimal compute -- no browser, just HTTP API calls.

| Run Type | Time | Memory | Approximate Cost |
|----------|------|--------|------------------|
| Full scrape (all) | ~3 min | 512 MB | ~$0.05 |
| 50 companies | ~15 sec | 256 MB | ~$0.01 |
| Single company | ~2 sec | 256 MB | < $0.01 |

**Free tier:** Apify's free plan includes $5/month in platform credits -- enough for ~100 full scrapes.

Compare that to the existing Workable Jobs Scraper at $10/month rental with manual URL input only.

## Integrate via API

### JavaScript / TypeScript

```javascript
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: 'YOUR_API_TOKEN' });

const run = await client.actor('deadlyaccurate/workable-jobs-scraper').call({
  mode: 'all',
  remoteOnly: true,
  departmentFilter: 'engineering',
});

const { items } = await client.dataset(run.defaultDatasetId).listItems();

console.log(`Found ${items.length} jobs`);
items.forEach((job) => {
  console.log(`${job.company} - ${job.title} (${job.country}, ${job.city})`);
});
```

### Python

```python
from apify_client import ApifyClient

client = ApifyClient('YOUR_API_TOKEN')

run = client.actor('deadlyaccurate/workable-jobs-scraper').call(run_input={
    'mode': 'all',
    'remoteOnly': True,
    'locationFilter': 'europe|uk|germany',
})

dataset = client.dataset(run['defaultDatasetId'])
for item in dataset.iterate_items():
    print(f"{item['company']} - {item['title']} ({item['country']}, {item['city']})")
```

### cURL

```bash
# Start a run
curl -X POST "https://api.apify.com/v2/acts/deadlyaccurate~workable-jobs-scraper/runs?token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mode": "companies", "companies": ["1000heads", "typeform"]}'

# Get results (replace DATASET_ID)
curl "https://api.apify.com/v2/datasets/DATASET_ID/items?token=YOUR_TOKEN&format=json"
```

## Workable's API

The Actor uses Workable's **public widget API**:

```
GET https://apply.workable.com/api/v1/widget/accounts/{slug}
```

This is a public API used by companies to embed job listings on their websites. No authentication required.

The API returns all published job postings with metadata including title, department, location, employment type, experience level, and industry.

## Use cases

- **Job seekers:** Find every open role at companies you care about, filtered by your criteria
- **Recruiters:** Monitor hiring activity across the Workable ecosystem
- **Market researchers:** Track which departments are growing, which roles are in demand
- **Job board operators:** Feed structured job data into your platform
- **Lead generation:** Find companies actively hiring in specific domains
- **Competitive intelligence:** Track competitor hiring patterns

## FAQ

**How often should I run this?**
Job postings change daily. A weekly full scrape catches most changes. For specific companies, daily runs in `companies` mode are cheap.

**Why do some companies show 0 jobs?**
Their Workable board may be empty, they may have switched ATS providers, or all roles are filled. The Actor only returns published positions.

**Can I scrape a company not in the discovery list?**
Yes -- use `companies` mode and provide the slug directly. Auto-discovery finds ~1,700 companies from Common Crawl, but there may be more.

**Is this legal?**
This Actor uses Workable's public widget API endpoint. The data is publicly accessible on `apply.workable.com`. No authentication is bypassed.

**Why is this Actor so fast?**
No browser. No proxy. Just native HTTP `fetch` calls to Workable's API with 10 concurrent workers. Each API response is pure JSON.

## Open source

Built on [workable-jobs](https://github.com/dougwithseismic/jobsearch) -- an open-source TypeScript library and CLI tool. Star it on GitHub.

Also available as:
- **CLI tool:** `npx workable-jobs scrape`
- **Library:** `npm install workable-jobs`

## Other scrapers by this author

- [Ashby Jobs Scraper](https://apify.com/deadlyaccurate/ashby-jobs-scraper) -- 2,800+ companies, 40,000+ jobs

---

## Author

**Doug Silkstone** -- Lead Full Stack Software Engineer. 15+ years, 3x exits. TypeScript, React, Node, scraping & automation.

[![Email](https://img.shields.io/badge/Email-doug%40withseismic.com-EA4335?logo=gmail&logoColor=white)](mailto:doug@withseismic.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-dougsilkstone-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/dougsilkstone)
[![GitHub](https://img.shields.io/badge/GitHub-dougwithseismic-181717?logo=github&logoColor=white)](https://github.com/dougwithseismic)
[![Book a Call](https://img.shields.io/badge/Book_a_Call-45min-00C853?logo=googlecalendar&logoColor=white)](https://cal.com/dougwithseismic/session-45)
[![Apify](https://img.shields.io/badge/Apify-deadlyaccurate-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate)

Need a custom scraper, data pipeline, or automation? [Book a call](https://cal.com/dougwithseismic/session-45) or email [doug@withseismic.com](mailto:doug@withseismic.com).
