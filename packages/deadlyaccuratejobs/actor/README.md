# deadlyaccuratejobs — One Search, Every ATS

[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/deadlyaccuratejobs)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-23-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Platforms](https://img.shields.io/badge/ATS_Platforms-8-ff6d00)](https://apify.com/deadlyaccurate/deadlyaccuratejobs)
[![Companies](https://img.shields.io/badge/Companies-3%2C114+-7c4dff)](https://apify.com/deadlyaccurate/deadlyaccuratejobs)

Search for a company by name. Get back every open job. No need to know which ATS they use, what their slug is, or which scraper to run. One input, unified output.

**The only job scraper that auto-resolves companies to their ATS platform.** Type "Stripe" and get 526 jobs from Greenhouse in 0.6 seconds. Type "Notion" and get 151 jobs from Ashby in 1.9 seconds. You don't need to know any of that — just the company name.

## What does deadlyaccuratejobs do?

This Actor takes a company name, figures out which ATS platform(s) they use across 8 supported platforms, scrapes every open job, normalizes the data into a unified schema, and returns it. All in one call.

Other scrapers require you to:
1. Know the company uses Greenhouse (or Lever, or Ashby, or...)
2. Know their slug on that platform
3. Run the correct platform-specific scraper

This one just asks: **who?**

**What you get per job:**

| Field | Example |
|-------|---------|
| `id` | `greenhouse_7546284` |
| `title` | `Senior Software Engineer` |
| `location.text` | `San Francisco, CA` |
| `location.country` | `US` |
| `location.region` | `north-america` |
| `workplaceType` | `remote` / `hybrid` / `onsite` |
| `seniorityLevel` | `senior` / `staff` / `lead` / ... |
| `department` | `Engineering` |
| `employmentType` | `full-time` / `contract` / ... |
| `salary.text` | `$150,000 - $200,000` |
| `salary.min` / `max` | `150000` / `200000` |
| `company.name` | `Stripe` |
| `company.ats` | `greenhouse` |
| `applyUrl` | `https://boards.greenhouse.io/stripe/jobs/7546284#app` |
| `publishedAt` | `2026-03-13T19:00:45Z` |
| `tags` | `["engineering", "san-francisco"]` |

Same schema regardless of which ATS the company uses.

## How to use deadlyaccuratejobs

### Mode 1: Search (Default)

Type a company name. Get every job.

**Input:**
```json
{
  "mode": "search",
  "company": "Stripe"
}
```

The Actor will:
1. Query 3,114 company slugs across 8 ATS platforms
2. Fuzzy-match your company name to the right slug(s)
3. Hit the matched ATS API(s)
4. Normalize everything into a unified schema
5. Push results to the dataset

### Mode 2: Resolve

Just find out which ATS a company uses, without scraping any jobs.

**Input:**
```json
{
  "mode": "resolve",
  "company": "Figma"
}
```

**Output:**
```json
{
  "company": "Figma",
  "matches": [
    { "ats": "greenhouse", "slug": "figma", "confidence": "exact" }
  ]
}
```

### Mode 3: Direct

Skip resolution entirely. Provide a slug and ATS platform directly — useful when you already know the details or the company isn't in the slug index.

**Input:**
```json
{
  "mode": "direct",
  "slug": "stripe",
  "ats": "greenhouse",
  "remoteOnly": true
}
```

### Mode 4: Stats

Get slug counts per platform — see what's in the index.

**Input:**
```json
{
  "mode": "stats"
}
```

**Output:**
```json
{
  "totalSlugs": 3114,
  "platforms": [
    { "source": "greenhouse", "slugCount": 581 },
    { "source": "lever", "slugCount": 492 },
    { "source": "ashby", "slugCount": 438 }
  ]
}
```

## Input schema

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `mode` | string | `search` | `search`, `resolve`, `stats`, or `direct` |
| `company` | string | | Company name to look up (modes: search, resolve) |
| `slug` | string | | Company slug on the ATS platform (mode: direct) |
| `ats` | string | | ATS platform name (mode: direct). One of: `greenhouse`, `lever`, `ashby`, `workable`, `smartrecruiters`, `breezyhr`, `personio`, `recruitee` |
| `remoteOnly` | boolean | `false` | Only return remote jobs |
| `locationFilter` | string | | Regex pattern to match location, country, or region |
| `keywordFilter` | string | | Regex pattern to match title, department, description, tags |
| `departmentFilter` | string | | Regex pattern to match department name |
| `seniorityFilter` | string | | Comma-separated seniority levels: `intern`, `junior`, `mid`, `senior`, `staff`, `lead`, `principal`, `director`, `vp`, `c-level` |
| `sinceFilter` | string | | Only jobs published after this. Duration (`3h`, `2d`, `1w`, `1m`) or ISO date (`2026-03-10`) |
| `limit` | number | | Max number of results to return |
| `slugApiUrl` | string | | Override the slug KV API URL (advanced) |

## Filtering

All filters use **regex patterns** (case-insensitive) and can be combined.

### Remote engineering jobs at Stripe

```json
{
  "mode": "search",
  "company": "Stripe",
  "remoteOnly": true,
  "departmentFilter": "engineering|product|technology"
}
```

### Senior/Staff roles at Notion in Europe

```json
{
  "mode": "search",
  "company": "Notion",
  "seniorityFilter": "senior,staff,lead",
  "locationFilter": "europe|germany|uk|france|netherlands|spain|portugal|czech|austria"
}
```

### React/TypeScript jobs posted in the last week

```json
{
  "mode": "search",
  "company": "Canva",
  "keywordFilter": "react|typescript|full.?stack|frontend",
  "sinceFilter": "1w"
}
```

### Filter cheat sheet

| Goal | Filters |
|------|---------|
| **Remote European engineering** | `remoteOnly: true`, `locationFilter: "europe\|uk\|germany"`, `departmentFilter: "engineering"` |
| **Leadership roles** | `seniorityFilter: "lead,staff,principal,director,vp"` |
| **Full-stack** | `keywordFilter: "full.?stack\|fullstack"` |
| **Recent postings** | `sinceFilter: "7d"` |
| **Entry-level** | `seniorityFilter: "intern,junior"` |

## Output example

Each row in the dataset is one job posting, normalized to the same schema regardless of source ATS:

```json
{
  "id": "greenhouse_7546284",
  "title": "Senior Software Engineer",
  "location": {
    "text": "San Francisco, CA",
    "country": "US",
    "region": "north-america"
  },
  "workplaceType": "hybrid",
  "seniorityLevel": "senior",
  "department": "Engineering",
  "employmentType": "full-time",
  "salary": {
    "text": "$150,000 - $200,000",
    "min": 150000,
    "max": 200000
  },
  "company": {
    "name": "Stripe",
    "ats": "greenhouse"
  },
  "applyUrl": "https://boards.greenhouse.io/stripe/jobs/7546284#app",
  "publishedAt": "2026-03-13T19:00:45Z",
  "tags": ["engineering", "san-francisco"]
}
```

Export as **JSON**, **CSV**, **Excel**, **XML**, or **RSS** from the Dataset tab.

## Supported ATS platforms

| Platform | Companies in Index | API Type |
|----------|--------------------|----------|
| Greenhouse | 581 | Public JSON API |
| Lever | 492 | Public JSON API |
| Ashby | 438 | Public JSON API |
| SmartRecruiters | 410 | Public JSON API |
| Workable | 389 | Public JSON API |
| BreezyHR | 312 | Public JSON API |
| Personio | 267 | Public XML API |
| Recruitee | 225 | Public JSON API |
| **Total** | **3,114** | |

All platforms are queried via their public, documented APIs. No browser rendering, no proxy, no authentication bypass.

## Performance

| Company | ATS | Jobs | Time |
|---------|-----|------|------|
| Stripe | Greenhouse | 526 | 0.6s |
| Notion | Ashby | 151 | 1.9s |
| Spotify | Lever | 154 | 9.5s |
| Canva | SmartRecruiters | 341 | 4.9s |
| Discord | Greenhouse | 83 | 0.3s |
| Figma | Greenhouse | 164 | 0.3s |

Resolution (fetching the slug index) is ~100ms on first call, instant on subsequent calls due to 5-minute in-memory cache. The slug index is fetched in parallel across all 8 platforms.

## How much does it cost?

This Actor uses minimal compute — no browser, just HTTP API calls. Resolution + scraping is fast because it only hits the matched platform(s), not all 8.

| Run Type | Time | Memory | Approximate Cost |
|----------|------|--------|------------------|
| Single company (search) | 0.3 - 10s | 256 MB | < $0.01 |
| Resolve only | < 1s | 256 MB | < $0.01 |
| Stats | < 1s | 256 MB | < $0.01 |
| Direct scrape | 0.3 - 10s | 256 MB | < $0.01 |

Pricing is based on [Apify compute units](https://docs.apify.com/platform/actors/running/usage-and-resources). The Actor is extremely efficient because it uses native ATS APIs (no browser rendering, no proxy needed).

**Free tier:** Apify's free plan includes $5/month in platform credits — enough for hundreds of searches.

## Use cases

- **Job seekers:** Search any company by name, get every open role with filters for remote, location, seniority. No need to figure out which ATS they use.
- **Recruiters:** Monitor hiring across companies without maintaining separate scrapers for each ATS platform.
- **Job board operators:** Feed structured, unified job data from 3,114 companies into your platform with one actor.
- **Market researchers:** Track which roles are open, which departments are growing, across any company regardless of their ATS.
- **Lead generation:** Find companies actively hiring in specific roles/departments — one search per company, every platform covered.
- **Competitive intelligence:** Compare hiring patterns across companies that use different ATS platforms, all in the same output format.

## Integrate via API

### JavaScript / TypeScript

```javascript
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: 'YOUR_API_TOKEN' });

const run = await client.actor('deadlyaccurate/deadlyaccuratejobs').call({
  mode: 'search',
  company: 'Stripe',
  remoteOnly: true,
  keywordFilter: 'engineer',
  seniorityFilter: 'senior,staff',
});

const { items } = await client.dataset(run.defaultDatasetId).listItems();

console.log(`Found ${items.length} jobs`);
items.forEach((job) => {
  console.log(`${job.company.name} — ${job.title} (${job.location.text}) [${job.company.ats}]`);
});
```

### Python

```python
from apify_client import ApifyClient

client = ApifyClient('YOUR_API_TOKEN')

run = client.actor('deadlyaccurate/deadlyaccuratejobs').call(run_input={
    'mode': 'search',
    'company': 'Stripe',
    'remoteOnly': True,
    'keywordFilter': 'engineer',
})

dataset = client.dataset(run['defaultDatasetId'])
for item in dataset.iterate_items():
    print(f"{item['company']['name']} — {item['title']} ({item['location']['text']})")
```

### cURL

```bash
# Start a run
curl -X POST "https://api.apify.com/v2/acts/deadlyaccurate~deadlyaccuratejobs/runs?token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mode": "search", "company": "Stripe", "remoteOnly": true}'

# Get results (replace DATASET_ID)
curl "https://api.apify.com/v2/datasets/DATASET_ID/items?token=YOUR_TOKEN&format=json"
```

## FAQ

**How does it know which ATS a company uses?**
The Actor maintains an index of 3,114 company slugs across 8 ATS platforms, stored in Cloudflare KV. When you search for a company, it fuzzy-matches your input against this index using exact match, variant suffixes (-inc, -io, -co, -hq, -labs, -ai, -tech), and substring matching.

**What if a company isn't in the index?**
Use `direct` mode with the slug and ATS platform name. You can also run `resolve` mode first to check if a company is known.

**Can a company be on multiple ATS platforms?**
Yes. The resolver checks all 8 platforms and returns every match. The Actor scrapes all matched platforms and merges the results.

**How often is the slug index updated?**
New companies are discovered via SearXNG and uploaded to the KV index. The Actor fetches the latest index on every run.

**Is this legal?**
This Actor uses public, documented APIs provided by each ATS platform for building custom career pages. No authentication is bypassed. All data is publicly accessible on the respective job board domains.

**Why is it so fast?**
No browser. No proxy. Just native HTTP calls to ATS APIs. The slug index is fetched in parallel and cached in memory. Only the matched platform(s) are scraped — not all 8.

## Other scrapers by this author

Individual ATS scrapers if you need platform-specific features:

- [Ashby Jobs Scraper](https://apify.com/deadlyaccurate/ashby-jobs-scraper) — 2,800+ companies, auto-discovery
- [Greenhouse Jobs Scraper](https://apify.com/deadlyaccurate/greenhouse-jobs-scraper)
- [Lever Jobs Scraper](https://apify.com/deadlyaccurate/lever-jobs-scraper)
- [Workable Jobs Scraper](https://apify.com/deadlyaccurate/workable-jobs-scraper)
- [SmartRecruiters Jobs Scraper](https://apify.com/deadlyaccurate/smartrecruiters-jobs-scraper)
- [BreezyHR Jobs Scraper](https://apify.com/deadlyaccurate/breezyhr-jobs-scraper)
- [Personio Jobs Scraper](https://apify.com/deadlyaccurate/personio-jobs-scraper)
- [Recruitee Jobs Scraper](https://apify.com/deadlyaccurate/recruitee-jobs-scraper)

---

## Author

**Doug Silkstone** — Lead Full Stack Software Engineer. 15+ years, 3x exits. TypeScript, React, Node, scraping & automation.

[![Email](https://img.shields.io/badge/Email-doug%40withseismic.com-EA4335?logo=gmail&logoColor=white)](mailto:doug@withseismic.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-dougsilkstone-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/dougsilkstone)
[![GitHub](https://img.shields.io/badge/GitHub-dougwithseismic-181717?logo=github&logoColor=white)](https://github.com/dougwithseismic)
[![Apify](https://img.shields.io/badge/Apify-deadlyaccurate-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate)

Need a custom scraper, data pipeline, or automation? Email [doug@withseismic.com](mailto:doug@withseismic.com).
