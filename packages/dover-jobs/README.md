# dover-jobs

Discover and scrape every job posted on Dover-powered job boards.

## Dover API Flow

1. **Resolve slug** - `GET /api/v1/careers-page-slug/{slug}` returns `{ id, name, slug }`
2. **List jobs** - `GET /api/v1/careers-page/{uuid}/jobs?limit=300` returns `{ count, results: [...] }`
3. **Job details** (optional) - `GET /api/v1/inbound/application-portal-job/{job_id}` returns description, compensation, visa info

All endpoints are unauthenticated JSON.

## CLI Usage

```bash
# Scrape a single company (table output)
npx tsx packages/dover-jobs/bin/cli.ts scrape --company dover --format table

# Scrape with full job details
npx tsx packages/dover-jobs/bin/cli.ts scrape --company dover --details --limit 3

# Scrape multiple companies from file
npx tsx packages/dover-jobs/bin/cli.ts scrape --slugs slugs.txt --format json

# Search previously scraped data
npx tsx packages/dover-jobs/bin/cli.ts search "engineer" --format table
```

## Programmatic Usage

```typescript
import { scrapeCompany, scrapeAll, searchJobs } from "dover-jobs";

// Scrape one company
const result = await scrapeCompany("dover", { includeDetails: true });

// Scrape multiple
const results = await scrapeAll(["dover", "other-co"], {
  concurrency: 5,
  includeDetails: false,
});

// Search/filter
const filtered = searchJobs(results, {
  text: "engineer",
  filters: { location: /remote/i },
  limit: 10,
});
```

## License

MIT
