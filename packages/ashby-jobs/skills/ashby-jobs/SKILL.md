---
name: ashby-jobs
description: Discover and scrape jobs from 2,800+ companies using Ashby as their ATS. Search and filter by location, remote status, department, and keywords. Use when looking for jobs, researching companies hiring, or building job market intelligence.
allowed-tools: Bash, Read, Write, Grep, Glob
---

# Ashby Jobs Skill

You are a job search agent with access to the `ashby-jobs` CLI tool. This tool discovers companies using Ashby as their ATS (Applicant Tracking System) and scrapes their public job boards via the Ashby API.

## Tool Location

The CLI is at `/Users/godzillaaa/Documents/WEB_PROJECTS/jobsearch/packages/ashby-jobs/`. Run it with:

```bash
cd /Users/godzillaaa/Documents/WEB_PROJECTS/jobsearch/packages/ashby-jobs && pnpm cli <command> [options]
```

Or if built:

```bash
npx ashby-jobs <command> [options]
```

## Available Commands

### 1. `discover` — Find Companies Using Ashby

Queries Common Crawl CDX indexes to find all companies hosting job boards on `jobs.ashbyhq.com`.

```bash
pnpm cli discover [--output slugs.json]
```

- Outputs a list of company slugs (e.g., `linear`, `notion`, `vercel`)
- Last discovery found ~2,800 unique companies
- Results saved to `data/slugs.json` by default
- Only needs to run occasionally (weekly/monthly) since new companies appear slowly

### 2. `scrape` — Scrape Job Boards

Hits the public Ashby API for each discovered company slug and pulls all job postings.

```bash
# Scrape all discovered companies
pnpm cli scrape [--concurrency 10] [--output data/jobs.json]

# Scrape a single company
pnpm cli scrape --company linear

# Include full job descriptions (larger output)
pnpm cli scrape --descriptions
```

**API endpoint used:** `GET https://api.ashbyhq.com/posting-api/job-board/{slug}?includeCompensation=true`

- Default concurrency: 10 parallel requests
- Output: JSON array of `CompanyJobs` objects
- Each job includes: title, department, team, location, remote status, workplace type, compensation, apply URL
- Last scrape: 830 companies responded (some slugs are stale), 16,699 total jobs

### 3. `search` — Search & Filter Jobs

Search the scraped job data with filters.

```bash
# Free text search
pnpm cli search "senior engineer"

# Filter by remote status
pnpm cli search --remote

# Filter by location (regex)
pnpm cli search --location "europe|germany|berlin|prague|london|remote"

# Filter by department (regex)
pnpm cli search --department "engineering|product"

# Filter by title keyword (regex)
pnpm cli search --keyword "lead|senior|staff|principal"

# Combine filters
pnpm cli search --remote --keyword "fullstack|full.stack" --department "engineering"

# Limit results
pnpm cli search --remote --keyword "typescript" --limit 50

# Output as JSON
pnpm cli search --remote --json
```

## Common Workflows

### Find Remote Engineering Jobs in Europe

```bash
pnpm cli search --remote --location "europe|EU|germany|berlin|munich|prague|czech|london|uk|netherlands|amsterdam|sweden|stockholm|spain|barcelona|portugal|lisbon|france|paris|austria|vienna|switzerland|zurich|poland|warsaw|ireland|dublin|denmark|copenhagen|finland|helsinki|norway|oslo|italy|milan|estonia|tallinn|latvia|riga|lithuania|vilnius|croatia|romania|bucharest|hungary|budapest|belgium|brussels" --department "engineering|product|technology"
```

### Find Growth/Marketing Engineering Roles

```bash
pnpm cli search --keyword "growth|marketing.engineer|conversion|seo|analytics" --remote
```

### Find Leadership Roles

```bash
pnpm cli search --keyword "lead|staff|principal|head.of|director|vp|manager" --department "engineering"
```

### Scrape a Specific Company

```bash
pnpm cli scrape --company figma
pnpm cli search --keyword "." --location "." | grep -i figma
```

### Full Pipeline: Discover, Scrape, Search

```bash
# Step 1: Discover all Ashby companies (slow, ~5-10 min)
pnpm cli discover --output data/slugs.json

# Step 2: Scrape all job boards (slow, ~10-20 min at concurrency 10)
pnpm cli scrape --output data/jobs.json

# Step 3: Search the results (instant)
pnpm cli search --remote --keyword "senior engineer" --limit 100
```

## Output Format

### Default (Table)

Jobs are displayed in a table with columns: Company, Title, Department, Location, Remote, Compensation, Apply URL.

### JSON (`--json` flag)

Returns an array of `FlatJob` objects:

```json
{
  "company": "Linear",
  "slug": "linear",
  "id": "abc123",
  "title": "Senior Software Engineer",
  "department": "Engineering",
  "team": "Backend",
  "employmentType": "FullTime",
  "location": "Remote - Europe",
  "isRemote": true,
  "workplaceType": "Remote",
  "publishedAt": "2026-02-15",
  "jobUrl": "https://jobs.ashbyhq.com/linear/abc123",
  "applyUrl": "https://jobs.ashbyhq.com/linear/abc123/application",
  "compensationTierSummary": "EUR 120,000 - 160,000"
}
```

## Data Files

All data is stored in `/Users/godzillaaa/Documents/WEB_PROJECTS/jobsearch/packages/ashby-jobs/data/`:

- `slugs.json` — Discovered company slugs
- `jobs.json` — Full scrape results (all companies, all jobs)
- `search-results/` — Saved search results

## Tips

### Location Regex Patterns

Europe-focused searches benefit from broad regex patterns. Key locations for remote-friendly European companies:

```
europe|EU|remote|germany|berlin|munich|prague|czech|london|uk|netherlands|amsterdam|sweden|stockholm|spain|barcelona|portugal|lisbon|france|paris|austria|vienna|switzerland|zurich|poland|warsaw|ireland|dublin|denmark|copenhagen|finland|helsinki|norway|oslo|italy|milan|estonia|tallinn
```

### Department Patterns

```
engineering|product|technology|platform|infrastructure|data|machine.learning|growth|developer.experience
```

### Title Patterns

For Doug's target roles:
```
lead|senior|staff|principal|full.stack|fullstack|frontend|growth.engineer|founding.engineer
```

### Interpreting Results

- **isRemote: true** means the company explicitly tagged the role as remote
- **workplaceType** can be: Remote, Hybrid, OnSite, or empty
- **location** often contains region info like "Remote - Europe" or "Berlin, Germany"
- **compensationTierSummary** is only present if the company opted into Ashby's compensation feature
- Jobs without compensation listed may still have competitive pay — check the apply URL
- **publishedAt** tells you how fresh the listing is — roles open 60+ days may indicate urgency or difficulty filling

### Combining with Company Database

Cross-reference results with the company database at `apps/web/app/data/companies.ts` to check if a company is already tracked, scored, or blacklisted. Use the slug field to match.

## When to Use This Skill

- User asks about jobs on Ashby or job boards
- User wants to find companies hiring for specific roles
- User needs to research what companies are hiring in a specific location
- User wants to discover new companies to add to the pipeline
- User asks about remote jobs in Europe
- User wants compensation data for specific roles or companies
- User wants to check if a specific company is hiring on Ashby
