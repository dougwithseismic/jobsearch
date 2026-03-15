# How We Discover 3,000+ Companies Across 8 ATS Platforms — For Free

The hardest part of building a job scraper suite isn't the scraping. It's finding the companies to scrape.

Greenhouse, Lever, Ashby, Workable — none of them publish a directory of companies using their platform. No sitemap, no API endpoint, no public listing. You can scrape `boards.greenhouse.io/stripe` if you know Stripe uses Greenhouse, but how do you find the other 5,000 companies?

This is the discovery problem, and it's the reason most job scrapers on Apify ask you to manually input company slugs. We solved it with SearXNG.

## The discovery problem

Every ATS platform hosts company career pages at predictable URLs:

- `boards.greenhouse.io/{company}`
- `jobs.lever.co/{company}`
- `jobs.ashbyhq.com/{company}`
- `apply.workable.com/{company}`
- `careers.smartrecruiters.com/{company}`
- `{company}.breezy.hr`
- `{company}.jobs.personio.de`
- `{company}.recruitee.com`

The slug after the domain is all you need. But where do you get a list of all valid slugs?

### What doesn't work

**ATS sitemaps** — We checked every platform's `robots.txt` and tried every sitemap path. Greenhouse returns 404. Lever returns 404. Ashby serves an SPA. Workable redirects to an error page. SmartRecruiters returns HTML instead of XML. None of them expose a company directory via sitemap.

**ATS APIs** — No platform has a "list all companies" endpoint. Ashby's API requires auth. SmartRecruiters blocks all bots except LinkedInBot. These are closed ecosystems.

**Common Crawl** — This was our first approach. Query Common Crawl's index for `boards.greenhouse.io/*` URLs, extract slugs from the results. It works, but it's painfully slow (2 minutes per index, 3 indexes = 6 minutes minimum) and the data is months old. A company that started using Greenhouse last week won't show up until the next CC crawl.

**Hardcoded slug lists** — The classic approach. Maintain a list of known companies per platform. This rots immediately. We had 10 Recruitee slugs — 9 of them returned 404 because those companies migrated to custom domains.

### What the competitors do

We looked at how other scrapers solve this. [stapply-ai/ats-scrapers](https://github.com/stapply-ai/ats-scrapers) on GitHub has the answer: **search engines**.

Their approach: run `site:boards.greenhouse.io` queries against search engines, extract company slugs from the URLs in search results. Simple, effective, and it finds companies that Common Crawl misses because Google's index is days old, not months.

They support two backends:
1. **SerpAPI** (paid) — Google search API, $50/mo for 5,000 queries
2. **SearXNG** (free) — self-hosted meta-search engine, unlimited queries

We went with SearXNG.

## What is SearXNG

[SearXNG](https://github.com/searxng/searxng) is a free, open-source meta-search engine. You self-host it, and it aggregates results from Bing, Brave, Qwant, DuckDuckGo, and dozens of other search engines. No API keys, no rate limits, no usage tracking.

It runs as a single Docker container:

```bash
docker run -d --name searxng -p 8888:8080 searxng/searxng
```

That's it. You now have a search API at `localhost:8888` that returns JSON:

```bash
curl "http://localhost:8888/search?q=site:boards.greenhouse.io&format=json"
```

Each result includes a URL. Extract the company slug from the URL. Repeat with different queries. Accumulate slugs over time.

## The discovery strategy

A single `site:boards.greenhouse.io` query only returns ~30 results. To find thousands of companies, you need to vary the queries. We use 30 search strategies per platform:

```
site:boards.greenhouse.io
site:boards.greenhouse.io careers
site:boards.greenhouse.io jobs
site:boards.greenhouse.io software engineer
site:boards.greenhouse.io product manager
site:boards.greenhouse.io remote
site:boards.greenhouse.io "Berlin"
site:boards.greenhouse.io "New York"
site:boards.greenhouse.io "Y Combinator"
site:boards.greenhouse.io startup
...
```

Each query surfaces different companies. `site:boards.greenhouse.io "Berlin"` finds European companies that `site:boards.greenhouse.io` alone misses. `site:boards.greenhouse.io startup` finds early-stage companies. The queries cast a wide net.

For each query, we paginate through up to 5 pages of results. Each page yields ~10 new URLs. We extract the company slug from each URL, deduplicate, validate (filter out paths like `/api`, `/embed`, `/sitemap.xml`), and save.

### Results from a single run

10 queries per platform, 5 pages per query, ~8 minutes total:

| Platform | Companies Found |
|---|---|
| SmartRecruiters | 595 |
| Greenhouse | 581 |
| Workable | 476 |
| BreezyHR | 367 |
| Ashby | 337 |
| Lever | 306 |
| Personio | 289 |
| Recruitee | 163 |
| **Total** | **3,114** |

With the full 30 strategies, you'd find significantly more. And each subsequent run accumulates — slugs discovered last week are still in the cache even if they don't appear in this week's search results.

## Architecture

```
┌─────────────────────────────────────────┐
│  SearXNG (Docker or Railway)            │
│  Aggregates Bing, Brave, Qwant, etc.   │
│  JSON API at localhost:8888             │
└──────────────┬──────────────────────────┘
               │ site: queries
               │
┌──────────────▼──────────────────────────┐
│  discover.ts                            │
│  30 search strategies per platform      │
│  Extract slugs from URLs, validate      │
│  Save to discovered/*.txt               │
└──────────────┬──────────────────────────┘
               │ uploads slugs
               │
┌──────────────▼──────────────────────────┐
│  Cloudflare Workers KV                  │
│  job-slugs.wd40.workers.dev             │
│  GET /slugs/greenhouse → slug list      │
│  Edge-cached, <60ms globally            │
└──────────────┬──────────────────────────┘
               │ fetches slugs at runtime
               │
┌──────────────▼──────────────────────────┐
│  Scraper actors (Apify or local CLI)    │
│  discoverSlugs() → fetch from API       │
│  scrapeAll(slugs) → scrape companies    │
│  normalize() → UnifiedJob output        │
└─────────────────────────────────────────┘
```

Discovery and scraping are completely decoupled. The scrapers never touch SearXNG directly — they fetch a pre-computed slug list from the Cloudflare edge in <60ms. Discovery runs weekly in the background. Scraping runs daily.

## Why SearXNG over alternatives

### vs. Common Crawl

| | Common Crawl | SearXNG |
|---|---|---|
| Speed | 6+ minutes (3 index queries, 120s timeout each) | ~8 minutes for 3,000+ companies |
| Freshness | Months old (crawl lag) | Days old (Google/Bing index) |
| Reliability | Flaky (timeouts, 5xx errors) | Local instance, always available |
| Cost | Free | Free (self-hosted) |
| Coverage | Good for large sites, misses small ones | Better for long-tail discovery |

### vs. SerpAPI / Google Custom Search

| | SerpAPI | SearXNG |
|---|---|---|
| Cost | $50/mo (5,000 searches) | Free |
| Rate limits | 100 queries/min | None (self-hosted) |
| Setup | API key signup | `docker run` |
| Results quality | Google-quality | Aggregated (Bing + Brave + Qwant) |
| Dependency | Third-party service | Self-hosted, you own it |

SerpAPI gives you Google results, which are arguably better. But for `site:` queries, the difference is negligible — Bing and Brave index the same ATS job board pages. And you can't beat free + unlimited.

### vs. Hardcoded slug lists

| | Hardcoded | SearXNG discovery |
|---|---|---|
| Maintenance | Manual, rots immediately | Automatic, accumulates over time |
| Coverage | Whatever you remembered to add | Whatever search engines have indexed |
| Freshness | Stale from day one | Updated weekly |
| New companies | Miss them until someone reports | Found automatically |

## Running discovery

### First time setup

```bash
# Start SearXNG
docker run -d --name searxng -p 8888:8080 searxng/searxng

# Enable JSON output (first time only)
docker exec searxng python3 -c "
with open('/etc/searxng/settings.yml') as f: c=f.read()
c=c.replace('# formats:','formats:\n    - json\n    - html\n  # formats:')
with open('/etc/searxng/settings.yml','w') as f: f.write(c)
"
docker restart searxng
```

### Run discovery

```bash
# All platforms, 30 queries each, 5 pages per query
npx tsx packages/job-ingest/discover.ts --platform all --max-queries 30 --pages 5

# Single platform
npx tsx packages/job-ingest/discover.ts --platform greenhouse --max-queries 10 --pages 3

# Upload to Cloudflare Worker
npx tsx packages/job-ingest/upload-slugs.ts --url https://job-slugs.wd40.workers.dev
```

### Scheduled discovery

For always-fresh slugs, run discovery weekly. On Railway, you'd deploy SearXNG as an always-on service and run the discovery script via cron. Locally, a simple cron job works:

```bash
# Weekly discovery + upload (add to crontab)
0 3 * * 0 cd /path/to/jobsearch && npx tsx packages/job-ingest/discover.ts --platform all && npx tsx packages/job-ingest/upload-slugs.ts --url https://job-slugs.wd40.workers.dev
```

## The slug API

Discovered slugs are served from Cloudflare Workers KV — a key-value store replicated to 300+ edge locations worldwide. When an Apify actor calls `discoverSlugs()`, it fetches the slug list from the nearest Cloudflare edge node in under 60ms. No SearXNG involved at runtime.

```
GET  https://job-slugs.wd40.workers.dev/slugs              → all platforms + counts
GET  https://job-slugs.wd40.workers.dev/slugs/greenhouse    → newline-delimited slugs
GET  https://job-slugs.wd40.workers.dev/slugs/lever?json    → JSON array
PUT  https://job-slugs.wd40.workers.dev/slugs/greenhouse    → upload new slugs
```

The Worker is ~50 lines of code. It reads from KV, returns plain text or JSON, and supports CORS for browser access. Slugs are cached for 1 hour at the edge.

## What we learned

**Discovery is infrastructure, not a feature.** Treating it as a background process that runs independently from scraping was the key insight. The scrapers don't care where slugs come from — they just fetch a list and scrape it.

**Search engines are the best company directory.** No ATS platform publishes a list of their customers. But search engines have already indexed all their career pages. A `site:` query is effectively asking "which companies have pages on this domain?" — exactly the question we need answered.

**Accumulation beats freshness.** A company discovered last month is still valid this month. The slug cache only grows. Stale slugs get filtered naturally when `scrapeCompany()` returns null (company removed their board or migrated). No manual cleanup needed.

**SearXNG is underrated.** A self-hosted meta-search engine with a JSON API, zero rate limits, and no API keys? For any project that needs programmatic search — not just job scraping — SearXNG is a tool worth knowing about.

---

*This discovery system powers 9 Apify actors that together scrape jobs from 3,000+ companies across Greenhouse, Lever, Ashby, Workable, SmartRecruiters, BreezyHR, Personio, and Recruitee. The slug API serves requests from the Cloudflare edge in under 60ms. Total infrastructure cost: $0/month (SearXNG is self-hosted, Cloudflare Workers KV free tier is 100K reads/day).*
