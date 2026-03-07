# SmartRecruiters Jobs Scraper - Auto-Discovery

[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/smartrecruiters-jobs-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Scrape every job from companies using [SmartRecruiters](https://www.smartrecruiters.com) as their ATS. Visa, Spotify, Bosch, Ubisoft, Sanofi, Bayer, Siemens, adidas, and thousands more.

**The only SmartRecruiters scraper that auto-discovers companies.** No manual URL input needed. One click, every job.

## What does SmartRecruiters Jobs Scraper do?

This Actor discovers every company hosting a job board on `careers.smartrecruiters.com`, scrapes their public Posting API, and returns structured data for every open role.

The existing Smart Recruiters Job Board Scraper on Apify (30 users, ~$0.0002/result) requires you to already know the company URL. This one finds them for you -- auto-discovering company identifiers via Common Crawl and validating each against SmartRecruiters' public API.

**What you get per job:**

| Field | Example |
|-------|---------|
| `company` | Spotify |
| `title` | Senior Backend Engineer |
| `department` | Engineering |
| `employmentType` | Full-time |
| `experienceLevel` | Mid-Senior level |
| `city` | Stockholm |
| `region` | Stockholm |
| `country` | Sweden |
| `isRemote` | true |
| `releasedDate` | 2026-03-01T00:00:00.000Z |
| `jobUrl` | https://jobs.smartrecruiters.com/Spotify/abc123 |
| `refNumber` | REF-12345 |

Plus `companySlug`, `jobId`, `industry`, `function`, `recruiterName`, `scrapedAt`, and optionally `description`.

## How to use SmartRecruiters Jobs Scraper

### Mode 1: Scrape Everything (Zero Config)

Set `mode` to **`all`** and click Start. That's it.

The Actor will:
1. Auto-discover every company using SmartRecruiters via Common Crawl
2. Hit each company's public Posting API endpoint with pagination
3. Push every job to the dataset

**Input:**
```json
{
  "mode": "all"
}
```

### Mode 2: Scrape Specific Companies

Set `mode` to **`companies`** and provide an array of SmartRecruiters company identifiers.

The identifier is the path in `careers.smartrecruiters.com/{identifier}`. For example, Spotify's job board is at `careers.smartrecruiters.com/Spotify`, so the identifier is `Spotify`.

**Input:**
```json
{
  "mode": "companies",
  "companies": ["Spotify", "Visa", "BOSCH", "Ubisoft", "Sanofi"]
}
```

### Mode 3: Quick Search

Set `mode` to **`search`** to scrape specific companies and immediately filter by keyword, location, or department.

**Input:**
```json
{
  "mode": "search",
  "companies": ["Spotify", "Visa", "BOSCH"],
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
  "company": "Spotify",
  "companySlug": "Spotify",
  "jobId": "743999abc123",
  "title": "Senior Backend Engineer",
  "department": "Engineering",
  "employmentType": "Full-time",
  "experienceLevel": "Mid-Senior level",
  "city": "Stockholm",
  "region": "Stockholm",
  "country": "Sweden",
  "isRemote": true,
  "industry": "Technology",
  "function": "Engineering",
  "releasedDate": "2026-02-15T00:00:00.000Z",
  "refNumber": "REF-12345",
  "jobUrl": "https://jobs.smartrecruiters.com/Spotify/743999abc123",
  "recruiterName": "Jane Smith",
  "scrapedAt": "2026-03-06T09:33:00.000Z"
}
```

Export as **JSON**, **CSV**, **Excel**, **XML**, or **RSS** from the Dataset tab.

## How much does it cost?

This Actor uses minimal compute -- no browser, just HTTP API calls.

| Run Type | Time | Memory | Approximate Cost |
|----------|------|--------|------------------|
| Full scrape (all) | ~3-5 min | 512 MB | ~$0.05-0.10 |
| 50 companies | ~30 sec | 256 MB | ~$0.01 |
| Single company | ~3 sec | 256 MB | < $0.01 |

**Free tier:** Apify's free plan includes $5/month -- enough for many full scrapes.

## Integrate via API

### JavaScript / TypeScript

```javascript
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: 'YOUR_API_TOKEN' });

const run = await client.actor('deadlyaccurate/smartrecruiters-jobs-scraper').call({
  mode: 'all',
  remoteOnly: true,
  departmentFilter: 'engineering',
});

const { items } = await client.dataset(run.defaultDatasetId).listItems();

console.log(`Found ${items.length} jobs`);
items.forEach((job) => {
  console.log(`${job.company} - ${job.title} (${job.city}, ${job.country})`);
});
```

### Python

```python
from apify_client import ApifyClient

client = ApifyClient('YOUR_API_TOKEN')

run = client.actor('deadlyaccurate/smartrecruiters-jobs-scraper').call(run_input={
    'mode': 'all',
    'remoteOnly': True,
    'locationFilter': 'europe|uk|germany',
})

dataset = client.dataset(run['defaultDatasetId'])
for item in dataset.iterate_items():
    print(f"{item['company']} - {item['title']} ({item['city']}, {item['country']})")
```

## SmartRecruiters' API

The Actor uses SmartRecruiters' **public Posting API**:

```
GET https://api.smartrecruiters.com/v1/companies/{companyIdentifier}/postings?limit=100&offset=0
```

This is a [documented, public API](https://developers.smartrecruiters.com/reference/postings) intended for companies to build custom career pages. No authentication required for the Posting API.

The API supports pagination with `limit` and `offset` parameters. The Actor pages through all results automatically.

## Use cases

- **Job seekers:** Find every open role at companies you care about, filtered by your criteria
- **Recruiters:** Monitor hiring activity across the SmartRecruiters ecosystem
- **Market researchers:** Track which departments are growing, which roles are in demand
- **Job board operators:** Feed structured job data into your platform
- **Lead generation:** Find companies actively hiring in specific domains
- **Competitive intelligence:** Track competitor hiring patterns and team growth

## FAQ

**How often should I run this?**
Job postings change daily. A weekly full scrape catches most changes. For specific companies, daily runs in `companies` mode are cheap.

**Why do some companies show 0 jobs?**
Their job board may be empty, they may have switched ATS providers. The Actor only returns companies with active postings.

**Is this legal?**
This Actor uses SmartRecruiters' public, documented Posting API endpoint. The data is publicly accessible. No authentication is bypassed.

**Why is this Actor efficient?**
No browser. No proxy. Just native HTTP `fetch` calls with concurrent workers. Each API response is pure JSON -- no HTML parsing needed.

## Open source

Built on [smartrecruiters-jobs](https://github.com/dougwithseismic/jobsearch) -- an open-source TypeScript library and CLI tool.

Also available as:
- **CLI tool:** `npx smartrecruiters-jobs scrape`
- **TypeScript library:** `import { scrapeCompany } from 'smartrecruiters-jobs'`

## Other scrapers by this author

- [Ashby Jobs Scraper](https://apify.com/deadlyaccurate/ashby-jobs-scraper) -- 2,800+ companies, same auto-discovery technique

---

## Author

**Doug Silkstone** -- Lead Full Stack Software Engineer. 15+ years, 3x exits. TypeScript, React, Node, scraping & automation.

[![Email](https://img.shields.io/badge/Email-doug%40withseismic.com-EA4335?logo=gmail&logoColor=white)](mailto:doug@withseismic.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-dougsilkstone-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/dougsilkstone)
[![GitHub](https://img.shields.io/badge/GitHub-dougwithseismic-181717?logo=github&logoColor=white)](https://github.com/dougwithseismic)
[![Book a Call](https://img.shields.io/badge/Book_a_Call-45min-00C853?logo=googlecalendar&logoColor=white)](https://cal.com/dougwithseismic/session-45)
[![Apify](https://img.shields.io/badge/Apify-deadlyaccurate-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate)

Need a custom scraper, data pipeline, or automation? [Book a call](https://cal.com/dougwithseismic/session-45) or email [doug@withseismic.com](mailto:doug@withseismic.com).
