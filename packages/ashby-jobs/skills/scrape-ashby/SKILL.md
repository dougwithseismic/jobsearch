---
name: scrape-ashby
description: Scrape all Ashby job boards and search for matching roles. Runs the full discover-scrape-search pipeline. Use when user says "scrape ashby" or wants to run the full job scraping pipeline.
allowed-tools: Bash, Read, Write, Grep, Glob
---

# Scrape Ashby Job Boards

Run the ashby-jobs CLI to scrape and search Ashby job boards.

## Steps

1. Check if scraped data already exists at `/Users/godzillaaa/Documents/WEB_PROJECTS/jobsearch/packages/ashby-jobs/ashby-data/`. If `all-jobs.json` exists and is less than 24 hours old, skip to step 3.

2. Run the scraper:
```bash
cd /Users/godzillaaa/Documents/WEB_PROJECTS/jobsearch/packages/ashby-jobs && npx tsx bin/cli.ts scrape --quiet
```

3. Ask the user what they want to search for, or default to remote European engineering roles:
```bash
cd /Users/godzillaaa/Documents/WEB_PROJECTS/jobsearch/packages/ashby-jobs && npx tsx bin/cli.ts search --remote --location "europe|EU|germany|berlin|prague|czech|london|uk|netherlands|amsterdam|sweden|spain|portugal|france|austria|switzerland|poland|ireland|denmark|finland|norway|italy|estonia" --department "engineering|product|technology" --format table --limit 100
```

4. Present results in a table format. Highlight roles that match Doug's profile (Lead, Senior, Staff, Full Stack, Growth Engineer).

5. Cross-reference with the company database at `/Users/godzillaaa/Documents/WEB_PROJECTS/jobsearch/apps/web/app/data/companies.ts` to flag companies already in the pipeline.
