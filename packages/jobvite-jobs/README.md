# jobvite-jobs

Scrape jobs from Jobvite-powered career pages via their XML feed.

## How it works

1. Fetch the company's careers page at `https://jobs.jobvite.com/{slug}`
2. Extract the `companyId` from the page JavaScript
3. Fetch the XML feed at `https://app.jobvite.com/CompanyJobs/Xml.aspx?c={companyId}`
4. Parse job listings from the XML

## CLI Usage

```bash
# Scrape a single company
npx tsx packages/jobvite-jobs/bin/cli.ts scrape --company conair --format table

# Limit results
npx tsx packages/jobvite-jobs/bin/cli.ts scrape --company conair --limit 3

# Output as JSON
npx tsx packages/jobvite-jobs/bin/cli.ts scrape --company conair --format json

# Filter by location
npx tsx packages/jobvite-jobs/bin/cli.ts scrape --company conair --location "remote"
```

## Programmatic Usage

```typescript
import { scrapeCompany, scrapeAll } from "jobvite-jobs";

// Single company
const result = await scrapeCompany("conair", { limit: 10 });

// Multiple companies
const results = await scrapeAll(["conair", "another-co"], {
  concurrency: 3,
  onProgress: (done, total, found) => console.log(`${done}/${total}`),
});
```

## Rate Limiting

Jobvite uses Cloudflare protection. The scraper includes:
- 1.5s delay between the careers page and XML feed requests
- Exponential backoff retry on 429/5xx errors
- 30s request timeout
