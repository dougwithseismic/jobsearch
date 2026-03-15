# JazzHR Jobs Scraper -- Every Job From Early-Stage Startups

[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/jazzhr-jobs-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Scrape every job from every company using [JazzHR](https://www.jazzhr.com) as their ATS. Popular with early-stage startups and small businesses. Widget parser + JSON-LD enrichment for salary data.

**The only JazzHR scraper that auto-discovers companies.** No manual URL input needed. One click, every job.

## What does JazzHR Jobs Scraper do?

This Actor discovers every company using JazzHR's embeddable widget, parses the widget HTML to extract job listings, and optionally enriches each job with JSON-LD structured data from the detail page.

**What you get per job:**

| Field | Example |
|-------|---------|
| `company` | acme |
| `title` | Senior Software Engineer |
| `department` | Engineering |
| `location` | San Francisco, CA |
| `applyUrl` | https://acme.applytojob.com/apply/abc123 |
| `datePosted` | 2026-03-01 |
| `employmentType` | FULL_TIME |
| `salary` | {currency: "USD", min: 120000, max: 180000} |

Plus `jobId`, `experienceLevel`, `city`, `state`, `company` info, `scrapedAt`, and optionally `descriptionHtml`.

## How to use JazzHR Jobs Scraper

### Mode 1: Scrape Everything (Zero Config)

Set `mode` to **`all`** and click Start.

The Actor will:
1. Auto-discover every company using JazzHR
2. Fetch each company's widget HTML
3. Parse job listings from embedded HTML
4. Push every job to the dataset

**Input:**
```json
{
  "mode": "all"
}
```

### Mode 2: Scrape Specific Companies

Set `mode` to **`companies`** and provide an array of JazzHR slugs.

**Input:**
```json
{
  "mode": "companies",
  "companies": ["acme", "coolstartup", "techco"]
}
```

### Mode 3: Quick Search

Set `mode` to **`search`** to scrape specific companies and immediately filter.

**Input:**
```json
{
  "mode": "search",
  "companies": ["acme", "coolstartup"],
  "keywordFilter": "senior|staff|lead",
  "locationFilter": "remote|san francisco",
  "includeDescriptions": true
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

### Find senior roles with salary data

```json
{
  "mode": "all",
  "keywordFilter": "lead|staff|principal|head.of|director|senior",
  "includeDescriptions": true
}
```

### Filter cheat sheet

| Filter | Pattern | Matches |
|--------|---------|---------|
| **Remote roles** | `locationFilter: "remote"` | All remote jobs |
| **Engineering** | `departmentFilter: "engineering\|product"` | Tech departments |
| **Leadership** | `keywordFilter: "lead\|staff\|head.of\|director"` | Senior positions |
| **Full-stack** | `keywordFilter: "full.?stack\|fullstack"` | Full-stack roles |

## Output example

Each row in the dataset is one job posting:

```json
{
  "company": "acme",
  "companySlug": "acme",
  "jobId": "job_abc123",
  "title": "Senior Software Engineer",
  "department": "Engineering",
  "location": "San Francisco, CA",
  "applyUrl": "https://acme.applytojob.com/apply/abc123",
  "datePosted": "2026-03-01",
  "employmentType": "FULL_TIME",
  "scrapedAt": "2026-03-15T09:00:00.000Z"
}
```

With `includeDescriptions` enabled, salary and description fields are added when available.

Export as **JSON**, **CSV**, **Excel**, **XML**, or **RSS** from the Dataset tab.

## How much does it cost?

No browser rendering needed. The widget endpoint returns lightweight HTML.

| Run Type | Time | Memory | Approximate Cost |
|----------|------|--------|------------------|
| Full scrape (all) | ~3 min | 512 MB | ~$0.08 |
| Full + descriptions | ~8 min | 512 MB | ~$0.15 |
| 50 companies | ~15 sec | 256 MB | ~$0.01 |
| Single company | ~2 sec | 256 MB | < $0.01 |

Pricing is based on [Apify compute units](https://docs.apify.com/platform/actors/running/usage-and-resources). No browser rendering, no proxy needed.

**Free tier:** Apify's free plan includes $5/month in platform credits -- enough for ~30 full scrapes with descriptions.

## Integrate via API

### JavaScript / TypeScript

```javascript
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({ token: 'YOUR_API_TOKEN' });

const run = await client.actor('deadlyaccurate/jazzhr-jobs-scraper').call({
  mode: 'all',
  departmentFilter: 'engineering',
  includeDescriptions: true,
});

const { items } = await client.dataset(run.defaultDatasetId).listItems();

console.log(`Found ${items.length} jobs`);
items.forEach((job) => {
  const salary = job.salary ? `${job.salary.currency} ${job.salary.min}-${job.salary.max}` : 'N/A';
  console.log(`${job.company} -- ${job.title} (${salary})`);
});
```

### Python

```python
from apify_client import ApifyClient

client = ApifyClient('YOUR_API_TOKEN')

run = client.actor('deadlyaccurate/jazzhr-jobs-scraper').call(run_input={
    'mode': 'all',
    'departmentFilter': 'engineering',
    'includeDescriptions': True,
})

dataset = client.dataset(run['defaultDatasetId'])
for item in dataset.iterate_items():
    print(f"{item['company']} -- {item['title']} ({item.get('location', 'N/A')})")
```

## JazzHR's Widget

The Actor uses JazzHR's **public embeddable widget**:

```
GET https://app.jazz.co/widgets/basic/create/{slug}
```

This is a public endpoint designed for companies to embed job listings on their websites. No authentication required. The widget contains HTML with job blocks including title, location, department, and apply URLs.

For enriched data, the Actor also fetches detail pages at `{slug}.applytojob.com/apply/{jobId}` and extracts JSON-LD `JobPosting` structured data (schema.org).

## Use cases

- **Job seekers:** Find roles at early-stage startups invisible on major job boards
- **Recruiters:** Monitor hiring activity at small and growing companies
- **Salary researchers:** Extract structured salary data from JSON-LD schemas
- **Job board operators:** Feed structured startup job data into your platform
- **Lead generation:** Find early-stage companies actively hiring

## FAQ

**Why JazzHR?**
JazzHR is the most popular ATS for early-stage startups and small businesses. These companies are invisible on Greenhouse/Lever-focused job boards.

**How does the JSON-LD enrichment work?**
Each JazzHR detail page includes a `<script type="application/ld+json">` block with structured `JobPosting` data. The Actor extracts salary ranges, employment type, experience requirements, and company info.

**Why are some salary fields empty?**
Not all companies configure compensation in their JazzHR listings. Salary data comes from the JSON-LD block, which is optional.

**Is `includeDescriptions` worth the extra time?**
If you need salary data or full descriptions, yes. Without it, you get fast discovery data (title, department, location, apply URL). With it, you get enriched data at the cost of one additional HTTP request per job.

## Open source

Built on [jazzhr-jobs](https://github.com/dougwithseismic/jazzhr-jobs) -- an open-source TypeScript library and CLI tool.

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
