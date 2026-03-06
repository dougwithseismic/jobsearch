# There Are 40,000+ Jobs You're Not Seeing

Every major startup you've heard of — OpenAI, Notion, Ramp, Figma — posts their jobs through Ashby. Over 2,800 companies use it as their ATS. But unlike LinkedIn or Indeed, there's no single page where you can search all of them at once.

So I built one. A scraper that discovers every company on Ashby and pulls every open role. 830 companies. 16,699 jobs. Under two minutes.

Here's how.

## The Problem

Ashby gives each company a job board at `jobs.ashbyhq.com/{company-slug}`. They also have a clean posting API:

```
GET https://api.ashbyhq.com/posting-api/job-board/{slug}?includeCompensation=true
```

The response is generous. You get title, department, location, remote status, workplace type, compensation tiers, full descriptions, apply URLs. Everything you'd want for a job search tool.

The catch: you need to know the slug. There's no discovery endpoint. No directory. No list of "all companies using Ashby." If you don't already know a company uses Ashby, you'll never find their jobs.

## Dead Ends

First thing I tried: `robots.txt` on `jobs.ashbyhq.com`. Nothing useful. Standard disallows, no sitemap reference.

Next: `sitemap.xml`. Ashby's job boards are SPAs. The sitemap is either empty or points to a handful of static pages. It doesn't enumerate company slugs.

I hit the API root, tried common REST patterns like `/posting-api/companies` or `/posting-api/job-boards`. All 404s. Ashby clearly doesn't want you enumerating their customer list through the API.

Fair enough. But the data is public. Every job board is on the open web. Which means someone has already crawled it.

## The Breakthrough: Common Crawl

Common Crawl has been archiving the web since 2008. They crawl billions of pages and publish the results as free, public datasets. More importantly, they maintain a CDX index — a searchable index of every URL they've ever seen.

The query is simple:

```
https://index.commoncrawl.org/CC-MAIN-2025-08-index?url=jobs.ashbyhq.com/*&output=text&fl=url&limit=100000
```

This returns every URL Common Crawl has ever visited on `jobs.ashbyhq.com`. Thousands of them. Each URL looks like:

```
https://jobs.ashbyhq.com/notion
https://jobs.ashbyhq.com/notion/abc123-def456
https://jobs.ashbyhq.com/ramp/some-job-id
https://jobs.ashbyhq.com/openai
```

Extract the first path segment from each URL. Deduplicate. You now have a list of every company that has ever had an Ashby job board.

From just two crawl indexes (CC-MAIN-2025-08 and CC-MAIN-2024-51), I got 1,354 unique slugs.

### One Gotcha

Slug discovery is case-sensitive. Common Crawl might have `jobs.ashbyhq.com/Notion` and `jobs.ashbyhq.com/notion`. The Ashby API is case-insensitive — both resolve to the same board. So you need to lowercase and deduplicate before scraping, or you'll hit the same company twice.

```typescript
async function discoverSlugs(crawlIds: string[]): Promise<string[]> {
  const allSlugs = new Set<string>();

  for (const crawlId of crawlIds) {
    const url = `https://index.commoncrawl.org/${crawlId}-index?url=jobs.ashbyhq.com/*&output=text&fl=url&limit=100000`;
    const response = await fetch(url);
    const text = await response.text();

    for (const line of text.split("\n")) {
      const match = line.match(/jobs\.ashbyhq\.com\/([^\/\s?#]+)/);
      if (match) {
        allSlugs.add(match[1].toLowerCase());
      }
    }
  }

  return [...allSlugs];
}
```

Two HTTP requests. 1,354 slugs. No auth, no API keys, no scraping frameworks.

## Building the Scraper

With slugs in hand, the scraper itself is straightforward. Hit the posting API for each slug. Handle 404s gracefully — some companies have left Ashby since Common Crawl visited them. Collect the results.

The interesting part is concurrency. 1,354 sequential HTTP requests would take forever. But hammering the API with 1,354 simultaneous requests is rude and likely to get rate-limited.

I went with a simple worker pool. Ten concurrent workers pulling from a shared queue:

```typescript
async function scrapeAll(
  slugs: string[],
  concurrency = 10,
  onProgress?: (done: number, total: number, found: number) => void
): Promise<CompanyJobs[]> {
  const results: CompanyJobs[] = [];
  let cursor = 0;
  let done = 0;

  async function worker() {
    while (cursor < slugs.length) {
      const slug = slugs[cursor++];
      if (!slug) continue;

      try {
        const url = `https://api.ashbyhq.com/posting-api/job-board/${slug}?includeCompensation=true`;
        const res = await fetch(url);

        if (res.ok) {
          const data = await res.json();
          if (data.jobs?.length > 0) {
            results.push({
              company: data.jobBoard?.title ?? slug,
              slug,
              jobCount: data.jobs.length,
              jobs: data.jobs,
              scrapedAt: new Date().toISOString(),
            });
          }
        }
      } catch {
        // Network error, skip
      }

      done++;
      onProgress?.(done, slugs.length, results.length);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}
```

No external dependencies. No Puppeteer, no Playwright, no scraping library. Just `fetch` and a loop. The entire tool has zero production dependencies — it runs on Node's built-in APIs.

### What the API Returns

The Ashby posting API response shape is clean:

```json
{
  "jobBoard": {
    "title": "Notion",
    "descriptionPlain": "..."
  },
  "jobs": [
    {
      "id": "abc-123",
      "title": "Senior Software Engineer",
      "department": "Engineering",
      "team": "Core Platform",
      "employmentType": "FullTime",
      "location": "San Francisco, CA",
      "secondaryLocations": [
        { "location": "New York, NY" }
      ],
      "isRemote": false,
      "workplaceType": "Hybrid",
      "publishedAt": "2025-01-15T00:00:00.000Z",
      "isListed": true,
      "jobUrl": "https://jobs.ashbyhq.com/notion/abc-123",
      "applyUrl": "https://jobs.ashbyhq.com/notion/abc-123/application",
      "compensationTierSummary": "$180K - $250K",
      "address": {
        "postalAddress": {
          "addressLocality": "San Francisco",
          "addressRegion": "CA",
          "addressCountry": "US"
        }
      }
    }
  ]
}
```

Compensation data, remote status, structured addresses, multiple locations per role. This is richer than what most job aggregators give you.

## Results

The full run:

- **1,354** slugs discovered from Common Crawl
- **830** companies with active job boards
- **524** slugs returned 404 (companies that left Ashby)
- **16,699** total open jobs
- **~110 seconds** total runtime with 10 workers

The 404 rate (~39%) makes sense. Common Crawl archives go back years. Companies switch ATS providers, shut down, or get acquired. The 404s resolve instantly — Ashby returns them in under 50ms — so they don't meaningfully slow the scrape.

Top companies by job count included the usual suspects: large tech companies with hundreds of open roles each.

## Making It Useful

Raw JSON with 16,000 jobs isn't useful. So I added filtering and multiple output formats.

### CLI Usage

```bash
# Discover slugs, scrape everything, output JSON
npx ashby-jobs --output jobs.json

# Only remote engineering jobs in Europe
npx ashby-jobs --remote --location "europe|london|berlin|prague" --department "engineering"

# CSV for spreadsheet analysis
npx ashby-jobs --format csv --output jobs.csv

# Scrape a single company
npx ashby-jobs --slug notion --output notion-jobs.json
```

### As a Library

```typescript
import { discoverSlugs, scrapeAll, filterResults } from "ashby-jobs";

const slugs = await discoverSlugs(["CC-MAIN-2025-08"]);
const allJobs = await scrapeAll(slugs, 10);

// Find remote TypeScript roles
const matches = filterResults(allJobs, {
  remote: true,
  keyword: /typescript/i,
});
```

### Claude Code Plugin

The tool also ships as a Claude Code plugin. Drop it into your project and you can ask Claude to search Ashby jobs conversationally: "Find me remote senior frontend roles at European startups."

## The Technique Generalizes

This isn't an Ashby-specific trick. The pattern works for any ATS with predictable URL structures:

- **Greenhouse**: `boards.greenhouse.io/{slug}` — same Common Crawl discovery works
- **Lever**: `jobs.lever.co/{slug}` — same pattern
- **Workable**: `apply.workable.com/{slug}` — same pattern

The Common Crawl CDX index is the universal company slug discovery tool. If an ATS hosts public job boards at predictable URLs, Common Crawl has already enumerated them for you.

Query template:

```
https://index.commoncrawl.org/CC-MAIN-{year}-{week}-index?url={ats-domain}/*&output=text&fl=url&limit=100000
```

Replace the domain. Extract slugs. Hit the API. You now have every job on that platform.

For the truly ambitious: combine Ashby + Greenhouse + Lever + Workable. That covers the ATS stack of most funded startups. You'd have a more complete job index than any single aggregator.

## The Bigger Picture

I built this as part of a larger project — an AI-powered job search system that automates company research, generates outreach strategies, and tracks applications. The Ashby scraper feeds the discovery layer. Instead of browsing job boards one at a time, I pull everything into a structured dataset and let code do the filtering.

The job search industry has a data asymmetry problem. Companies know everything about candidates (LinkedIn profiles, GitHub activity, application history). Candidates get a search box and a prayer. Tools like this tip the balance back a bit.

## Try It

```bash
npx ashby-jobs --help
```

Source: [github.com/dougwithseismic/jobsearch/tree/main/packages/ashby-jobs](https://github.com/dougwithseismic/jobsearch/tree/main/packages/ashby-jobs)

MIT licensed. Zero dependencies. Works on Node 18+.

If you build the Greenhouse or Lever version, let me know. I'd like to see what a unified index looks like.
