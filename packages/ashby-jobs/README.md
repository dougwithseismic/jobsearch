# Ashby Jobs Scraper — Every Job From 2,800+ Companies

[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/ashby-jobs-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Jobs Scraped](https://img.shields.io/badge/Jobs_Scraped-16%2C699+-ff6d00)](https://apify.com/deadlyaccurate/ashby-jobs-scraper)
[![Companies](https://img.shields.io/badge/Companies-2%2C800+-7c4dff)](https://apify.com/deadlyaccurate/ashby-jobs-scraper)

Scrape **40,000+ jobs** from every company using [Ashby](https://www.ashbyhq.com) as their ATS. OpenAI, Notion, Ramp, Deel, Linear, Cursor, Snowflake, Vanta, Deliveroo, and 2,800+ more.

**The only Ashby scraper that auto-discovers companies.** No manual URL input needed. One click, every job.

## What does Ashby Jobs Scraper do?

This Actor discovers every company hosting a job board on `jobs.ashbyhq.com`, scrapes their public posting API, and returns structured data for every open role.

Other Ashby scrapers require you to already know the company URL. This one finds them for you — auto-discovering 1,350+ company slugs and validating each against Ashby's API.

**What you get per job:**

| Field | Example |
|-------|---------|
| `company` | Linear |
| `title` | Senior Software Engineer |
| `department` | Engineering |
| `team` | Backend |
| `location` | Remote - Europe |
| `isRemote` | true |
| `workplaceType` | Remote |
| `employmentType` | FullTime |
| `compensationTierSummary` | EUR 120,000 - 160,000 |
| `publishedAt` | 2026-03-01T00:00:00.000Z |
| `jobUrl` | https://jobs.ashbyhq.com/linear/abc123 |
| `applyUrl` | https://jobs.ashbyhq.com/linear/abc123/application |
| `country` | Germany |
| `city` | Berlin |

Plus `companySlug`, `jobId`, `secondaryLocations`, `region`, `scrapedAt`, and optionally `description`.

## Latest scrape stats

| Metric | Count |
|--------|-------|
| Companies with active jobs | **830+** |
| Total jobs scraped | **16,699** |
| Remote jobs | **7,726** (46%) |
| Europe-related jobs | **3,379** (20%) |
| Full scrape time | **~2 minutes** |

## How to use Ashby Jobs Scraper

### Mode 1: Scrape Everything (Zero Config)

Set `mode` to **`all`** and click Start. That's it.

The Actor will:
1. Auto-discover every company using Ashby (~90 seconds)
2. Hit each company's public API endpoint concurrently (~60 seconds)
3. Push every listed job to the dataset

**Input:**
```json
{
  "mode": "all"
}
```

### Mode 2: Scrape Specific Companies

Set `mode` to **`companies`** and provide an array of Ashby slugs.

The slug is the path in `jobs.ashbyhq.com/{slug}`. For example, Linear's job board is at `jobs.ashbyhq.com/linear`, so the slug is `linear`.

**Input:**
```json
{
  "mode": "companies",
  "companies": ["linear", "notion", "posthog", "openai", "vercel"]
}
```

### Mode 3: Quick Search

Set `mode` to **`search`** to scrape specific companies and immediately filter by keyword, location, or department. Faster than a full scrape when you know what you're looking for.

**Input:**
```json
{
  "mode": "search",
  "companies": ["openai", "notion", "linear", "cursor", "ramp"],
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

### Find React/TypeScript jobs

```json
{
  "mode": "all",
  "keywordFilter": "react|typescript|full.?stack|frontend"
}
```

### Filter cheat sheet

| Filter | Pattern | Matches |
|--------|---------|---------|
| **Remote European engineering** | `remoteOnly: true`, `locationFilter: "europe\|uk\|germany"`, `departmentFilter: "engineering"` | ~500 jobs |
| **Leadership** | `keywordFilter: "lead\|staff\|head.of\|director\|vp"` | ~800 jobs |
| **Full-stack** | `keywordFilter: "full.?stack\|fullstack"` | ~400 jobs |
| **Entry-level** | `keywordFilter: "intern\|junior\|entry\|graduate"` | ~300 jobs |
| **US tech hubs** | `locationFilter: "san francisco\|new york\|austin\|seattle"` | ~2,000 jobs |

## Output example

Each row in the dataset is one job posting:

```json
{
  "company": "Linear",
  "companySlug": "linear",
  "jobId": "453f1ba0-a35e-4ed2-8215-1514e0a30b92",
  "title": "Senior Software Engineer, Backend",
  "department": "Engineering",
  "team": "Backend",
  "employmentType": "FullTime",
  "location": "Remote - Europe",
  "secondaryLocations": ["Remote - US", "Remote - Canada"],
  "isRemote": true,
  "workplaceType": "Remote",
  "publishedAt": "2026-02-15T00:00:00.000Z",
  "jobUrl": "https://jobs.ashbyhq.com/linear/453f1ba0",
  "applyUrl": "https://jobs.ashbyhq.com/linear/453f1ba0/application",
  "compensationTierSummary": "USD 150,000 - 210,000",
  "country": "United States",
  "region": "California",
  "city": "San Francisco",
  "scrapedAt": "2026-03-06T09:33:00.000Z"
}
```

Export as **JSON**, **CSV**, **Excel**, **XML**, or **RSS** from the Dataset tab.

## How much does it cost?

This Actor uses minimal compute — no browser, just HTTP API calls. A full scrape of all 1,350+ companies typically uses:

| Run Type | Time | Memory | Approximate Cost |
|----------|------|--------|------------------|
| Full scrape (all) | ~2 min | 512 MB | ~$0.05 |
| 50 companies | ~15 sec | 256 MB | ~$0.01 |
| Single company | ~2 sec | 256 MB | < $0.01 |

Pricing is based on [Apify compute units](https://docs.apify.com/platform/actors/running/usage-and-resources). The Actor is extremely efficient because it uses Ashby's native API (no browser rendering, no proxy needed).

**Free tier:** Apify's free plan includes $5/month in platform credits — enough for ~100 full scrapes.

## Integrate via API

### JavaScript / TypeScript

```javascript
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: 'YOUR_API_TOKEN' });

// Run the scraper
const run = await client.actor('deadlyaccurate/ashby-jobs-scraper').call({
  mode: 'all',
  remoteOnly: true,
  departmentFilter: 'engineering',
});

// Get results
const { items } = await client.dataset(run.defaultDatasetId).listItems();

console.log(`Found ${items.length} jobs`);
items.forEach((job) => {
  console.log(`${job.company} — ${job.title} (${job.location})`);
});
```

### Python

```python
from apify_client import ApifyClient

client = ApifyClient('YOUR_API_TOKEN')

run = client.actor('deadlyaccurate/ashby-jobs-scraper').call(run_input={
    'mode': 'all',
    'remoteOnly': True,
    'locationFilter': 'europe|uk|germany',
})

dataset = client.dataset(run['defaultDatasetId'])
for item in dataset.iterate_items():
    print(f"{item['company']} — {item['title']} ({item['location']})")
```

### cURL

```bash
# Start a run
curl -X POST "https://api.apify.com/v2/acts/deadlyaccurate~ashby-jobs-scraper/runs?token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mode": "companies", "companies": ["linear", "notion"]}'

# Get results (replace RUN_ID)
curl "https://api.apify.com/v2/datasets/DATASET_ID/items?token=YOUR_TOKEN&format=json"
```

### Webhooks

Set up a [webhook](https://docs.apify.com/platform/integrations/webhooks) to get notified when the scrape completes. POST the dataset URL to your server, Slack, or any HTTP endpoint.

### Scheduled runs

Use [Apify Schedules](https://docs.apify.com/platform/schedules) to run daily or weekly. Great for:
- Job alert systems
- Market intelligence dashboards
- Competitor hiring tracking

## Ashby's API

The Actor uses Ashby's **public job posting API**:

```
GET https://api.ashbyhq.com/posting-api/job-board/{slug}?includeCompensation=true
```

This is a [documented, public API](https://developers.ashbyhq.com/docs/public-job-posting-api) intended for companies to build custom career pages. No authentication required. No rate limits observed at 10 concurrent requests.

The API returns all listed job postings with full metadata. The Actor filters out unlisted postings (draft/internal roles).

## Use cases

- **Job seekers:** Find every open role at companies you care about, filtered by your criteria
- **Recruiters:** Monitor hiring activity across the Ashby ecosystem
- **Market researchers:** Track which departments are growing, which roles are in demand
- **Job board operators:** Feed structured job data into your platform
- **Lead generation:** Find companies actively hiring (and therefore spending) in specific domains
- **Competitive intelligence:** Track competitor hiring patterns and team growth

## FAQ

**How often should I run this?**
Job postings change daily. A weekly full scrape catches most changes. For specific companies you're tracking closely, daily runs in `companies` mode are cheap.

**Why do some companies show 0 jobs?**
Their Ashby board may be empty, they may have switched ATS providers, or all their roles are unlisted (internal). The Actor only returns publicly listed positions.

**Can I scrape a company not in the discovery list?**
Yes — use `companies` mode and provide the slug directly. Auto-discovery finds ~1,350 companies, but there are ~2,800+ total. If you know a slug, just add it.

**Is this legal?**
This Actor uses Ashby's public, documented API endpoint. The data is publicly accessible on `jobs.ashbyhq.com`. No authentication is bypassed. See [Ashby's API docs](https://developers.ashbyhq.com/docs/public-job-posting-api).

**Why is this Actor so fast?**
No browser. No proxy. Just native HTTP `fetch` calls to Ashby's API with 10 concurrent workers. Each API response is pure JSON — no HTML parsing needed.

**How do I find a company's slug?**
Visit their career page. If it's hosted on Ashby, the URL will be `jobs.ashbyhq.com/{slug}`. The slug is that path segment. You can also run in `all` mode first — the output includes every discovered slug.

## Top companies on Ashby (by job count)

| Company | Jobs | | Company | Jobs |
|---------|------|-|---------|------|
| OpenAI | 614 | | Dandy | 142 |
| Airwallex | 604 | | Kraken | 138 |
| Snowflake | 420 | | Ramp | 132 |
| Crusoe | 310 | | UiPath | 131 |
| Roadsurfer | 297 | | Cohere | 125 |
| Deel | 276 | | Zip | 113 |
| EverAI | 265 | | Hopper | 108 |
| Deliveroo | 241 | | ElevenLabs | 105 |
| Harvey | 213 | | DeepL | 100 |
| Vanta | 185 | | Alan | 99 |

## Open source

Built on [ashby-jobs](https://github.com/dougwithseismic/ashby-jobs) — an open-source TypeScript library and CLI tool. Star it on GitHub.

Also available as:
- **CLI tool:** `npx ashby-jobs scrape`
- **Claude Code plugin:** Auto-discovers and searches Ashby jobs from within Claude Code
- **React Ink TUI:** Interactive terminal browser for job results

## Other scrapers by this author

Coming soon: Greenhouse, Lever, and Workable scrapers using the same auto-discovery technique.

---

## Author

**Doug Silkstone** — Lead Full Stack Software Engineer. 15+ years, 3x exits. TypeScript, React, Node, scraping & automation.

[![Email](https://img.shields.io/badge/Email-doug%40withseismic.com-EA4335?logo=gmail&logoColor=white)](mailto:doug@withseismic.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-dougsilkstone-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/dougsilkstone)
[![GitHub](https://img.shields.io/badge/GitHub-dougwithseismic-181717?logo=github&logoColor=white)](https://github.com/dougwithseismic)
[![Book a Call](https://img.shields.io/badge/Book_a_Call-30min-00C853?logo=googlecalendar&logoColor=white)](https://Cal.com/dougwithseismic/30min)
[![Apify](https://img.shields.io/badge/Apify-deadlyaccurate-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate)

Need a custom scraper, data pipeline, or automation? [Book a call](https://Cal.com/dougwithseismic/30min) or email [doug@withseismic.com](mailto:doug@withseismic.com).
