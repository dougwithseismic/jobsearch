# hn-jobs

**Scrape every job from HN "Who is Hiring?" threads. Structured data from unstructured comments.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node >= 18](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-success)](https://github.com/dougwithseismic/hn-jobs)
[![Apify Actor](https://img.shields.io/badge/Apify-Actor-00C853?logo=apify&logoColor=white)](https://apify.com/deadlyaccurate/hn-jobs-scraper)

---

Every month, [@whoishiring](https://news.ycombinator.com/user?id=whoishiring) posts a "Who is Hiring?" thread on Hacker News. Hundreds of companies drop job listings as top-level comments in a loose `Company | Role | Location | Remote` format.

`hn-jobs` fetches those threads via HN's Firebase API, parses every comment into structured data, and gives you company, title, location, remote/onsite/hybrid, salary, technologies, URLs, and full descriptions. JSON, CSV, or filtered search.

### Latest scrape

| Metric | Count |
|--------|-------|
| Jobs per 2-month scrape | **~690** |
| Remote jobs | **~50%** |
| With salary listed | **~15%** |
| With technologies detected | **~76%** |
| Full scrape time | **~45 seconds** |

## Install

```bash
pnpm add hn-jobs
# or
npm install hn-jobs
```

## Quick start

```typescript
import { scrapeJobs, toJSON, toCSV, toTable } from 'hn-jobs';

const jobs = await scrapeJobs({ months: 2, concurrency: 10 });

// Filter for remote TypeScript jobs
const remoteTS = jobs.filter(
  (j) => j.isRemote && j.technologies.includes('typescript')
);

console.log(toTable(remoteTS));
```

## CLI

```bash
# Scrape last 2 months, print table
pnpm cli scrape --months 2 --format table

# Scrape + filter for remote senior roles
pnpm cli scrape --months 3 --remote --keyword "senior|lead" --format csv

# Search previously scraped data
pnpm cli search "founding engineer" --remote --format table
```

### Commands

| Command | Description |
|---------|-------------|
| `scrape` (default) | Scrape HN threads and output results |
| `search <query>` | Search previously scraped data |

### Options

| Flag | Short | Description | Default |
|------|-------|-------------|---------|
| `--months <n>` | | Months to scrape | 2 |
| `--remote` | | Remote jobs only | |
| `--location <regex>` | | Filter by location | |
| `--keyword <regex>` | | Filter by title/description | |
| `--technology <regex>` | | Filter by tech | |
| `--format <fmt>` | | json, csv, table | json |
| `--output <dir>` | `-o` | Output directory | ./hn-data |
| `--limit <n>` | | Max results | |
| `--concurrency <n>` | `-c` | Parallel requests | 10 |
| `--quiet` | `-q` | Suppress progress | |

## API

### `scrapeJobs(options?)`

Scrape recent "Who is Hiring?" threads.

```typescript
const jobs = await scrapeJobs({
  months: 2,
  concurrency: 10,
  onProgress: (done, total) => console.log(`${done}/${total}`),
});
```

Returns `HNJob[]`.

### `findThreads(months?)`

Find thread metadata without scraping comments.

```typescript
const threads = await findThreads(2);
// [{ id: 43..., title: "Ask HN: Who is hiring? (March 2026)", month: "March 2026", commentIds: [...], ... }]
```

### `filterJobs(jobs, filter)`

Filter jobs by structured criteria.

```typescript
import { filterJobs } from 'hn-jobs';

const remote = filterJobs(jobs, { remote: true, technology: /react/i });
```

### `searchJobs(jobs, text?, filter?, limit?)`

Free text search with optional structured filters.

```typescript
import { searchJobs } from 'hn-jobs';

const results = searchJobs(jobs, 'founding engineer', { remote: true }, 20);
```

### `parseComment(hnId, html, postedAt, threadMonth, threadId)`

Parse a single HN comment HTML into a structured job. Returns `null` for non-job comments.

### `toJSON(jobs)`, `toCSV(jobs)`, `toTable(jobs)`

Format job arrays for export.

### `htmlToText(html)`

Strip HTML tags and decode entities from HN comment text.

## How parsing works

HN job comments are free-form text with no schema. The parser:

1. **First line** — splits on `|`, assigns company (first segment), then heuristically identifies title (role keywords), location (city/country patterns), salary (`$120k-$180k`), and remote/onsite/hybrid flags
2. **Technologies** — scans body against 65+ keywords with word-boundary checks for short terms
3. **URLs** — extracts from `href` attributes, identifies apply URLs by domain patterns (lever, greenhouse, ashby, workable)
4. **Filtering** — skips comments <50 chars, deleted, dead, or missing company names

## Output format

```json
{
  "hnId": 43254321,
  "company": "Cosuno",
  "title": "Senior Full Stack Developer (TypeScript)",
  "location": "Berlin, Germany",
  "isRemote": true,
  "isOnsite": false,
  "isHybrid": false,
  "salary": "EUR 70k-100k",
  "technologies": ["typescript", "react", "next.js", "node.js", "postgresql"],
  "url": "https://cosuno.com/careers",
  "applyUrl": "https://cosuno.com/careers",
  "commentUrl": "https://news.ycombinator.com/item?id=43254321",
  "threadMonth": "March 2026",
  "description": "We're building the construction industry's collaboration platform..."
}
```

## Tests

```bash
pnpm test          # Run test suite (46 tests)
pnpm test:watch    # Watch mode
pnpm check-types   # Type check
```

---

**Doug Silkstone** — Lead Full Stack Software Engineer. 15+ years, 3x exits. TypeScript, React, Node, scraping & automation.

[![GitHub](https://img.shields.io/badge/GitHub-dougwithseismic-181717?logo=github&logoColor=white)](https://github.com/dougwithseismic)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-dougsilkstone-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/dougsilkstone)
