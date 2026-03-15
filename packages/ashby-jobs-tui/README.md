# ashby-jobs-tui

Interactive terminal UI for discovering and browsing job postings from companies that use [Ashby](https://www.ashbyhq.com/) as their ATS.

Built with [Ink](https://github.com/vadimdemedes/ink) (React for CLIs).

## Features

- **Scrape** -- Discover companies using Ashby via Common Crawl and scrape all their job postings
- **Browse** -- Navigate companies and drill into individual job listings
- **Search** -- Filter jobs by keyword, location, department, and remote status
- **Dashboard** -- Stats overview with top companies by job count
- Open apply URLs in your browser or copy them to clipboard

## Usage

```bash
# Dev mode
pnpm dev

# Build + run
pnpm build
pnpm start
```

Or run the binary directly after building:

```bash
node bin/cli.js
```

## Keyboard Shortcuts

| Key              | Action                       |
|------------------|------------------------------|
| `Tab` / `Shift+Tab` | Switch screens            |
| `Up` / `Down`    | Navigate lists               |
| `Enter`          | Select / expand              |
| `Esc`            | Go back                      |
| `/`              | Focus search                 |
| `r`              | Toggle remote filter         |
| `o`              | Open apply URL in browser    |
| `c`              | Copy apply URL to clipboard  |
| `s`              | Start scrape                 |
| `?`              | Toggle help                  |
| `q`              | Quit                         |

## Screens

1. **Dashboard** -- Summary stats: total companies, total jobs, remote job percentage, top 10 companies by listing count
2. **Browse** -- Three-level drill-down: companies -> jobs -> job detail
3. **Search** -- Real-time filtering with keyword, location (regex), department (regex), and remote toggle
4. **Scrape** -- Runs the `ashby-jobs` scraper with live progress bar

## Dependencies

Uses the `ashby-jobs` package (workspace sibling) for scraping and search. Data is persisted to `ashby-data/` as JSON.

## Requirements

Node >= 18

## Author

Doug Silkstone
