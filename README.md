# Job Search System

An AI-powered job search pipeline that researches, evaluates, and builds personalized outreach for 162 European startups in a single day. Built by two engineers directing ten parallel Claude Code threads from a shared code-server.

## What This Is

Senior engineer job searching is broken. The tools are designed for volume, not signal. This project treats the job search as an engineering problem: automate the research, score the companies, surface the signal, and build infrastructure for intelligent outreach.

The system evaluated 162 companies across music tech, gaming, creative tools, travel, developer platforms, and agencies. It produced 51 deep-dive intelligence dossiers, a tiered priority list, and a seven-approach outreach playbook. The entire pipeline — from first search to ready-to-send outreach materials — runs through Claude Code skills that chain research into strategy into personalized messages.

## Architecture

```
jobsearch/
├── apps/web/                  # Next.js 16 + React 19 monorepo app
│   ├── app/page.tsx           # Tinder-style company swipe tool
│   ├── app/company/[slug]/    # Dynamic company detail pages (162 URLs)
│   ├── app/api/decisions/     # Swipe decisions → JSON on disk
│   ├── app/api/research/      # HN Algolia proxy + cache
│   ├── app/api/screenshot/    # Puppeteer screenshot service
│   ├── app/data/companies.ts  # 162 companies, typed + scored
│   └── app/lib/               # Slugify, dossier loader
│
├── .claude/skills/            # Claude Code skills (the pipeline)
│   ├── company-research/      # Discover + evaluate + score companies
│   ├── company-deep-dive/     # Full intelligence dossiers
│   ├── outreach-strategy/     # Personalized approach planning
│   ├── craft-outreach/        # Ready-to-send messages in Doug's voice
│   └── journey-log/           # Document decisions and milestones
│
├── journey/                   # The documented story
│   ├── LOG.md                 # Chronological journey log (13 entries)
│   ├── TIER_LIST.md           # 7 Tier 1 / 15 Tier 2 / 28 Tier 3
│   ├── OUTREACH_STRATEGY.md   # 7 outreach approaches playbook
│   ├── IMMEDIATE_ACTIONS.md   # Hot opportunities with live roles
│   ├── dossiers/              # 51 company intelligence files
│   ├── strategies/            # Per-company outreach strategies
│   └── outreach/              # Crafted outreach materials
│
├── assets/                    # Scraped candidate profile data
│   ├── companies.md           # Detailed markdown dossiers (1100+ lines)
│   ├── companies.csv          # Structured company data
│   ├── cv.json                # Structured candidate profile
│   ├── CONTRA_PORTFOLIO.md    # 8 projects, 3 reviews, pricing
│   ├── LINKEDIN_PROFILE.md    # Full LinkedIn scrape
│   ├── GITHUB_PROFILE.md      # 124 repos, 3,142 contributions/year
│   ├── WITHSEISMIC_COMPREHENSIVE_CONTENT.md  # Consultancy site (892 lines)
│   └── CLUTCH_REVIEWS.md      # 3 verified 5.0/5.0 reviews
│
├── article-writer/            # Article generation pipeline
│   └── articles/ai-job-search-162-companies/
│       ├── output/article.md  # 6,452-word case study
│       ├── research/          # 6 section research files (170+ sources)
│       ├── article.json       # Spec, targets, quality gates
│       └── progress.txt       # Iteration log
│
├── decisions.json             # 144 company decisions (50 yes / 14 maybe / 80 no)
└── research-cache.json        # HN mention cache
```

## The Swipe Tool

A keyboard-driven company review interface built in the Next.js app. Each card shows a logo (Google favicon API), company name, location, work model, salary, fit score, and notes. Arrow keys for yes/no/maybe, backspace to undo. A research panel beneath each card shows a live website screenshot (Puppeteer), top Hacker News mentions (Algolia API), and one-click links to Glassdoor, LinkedIn, GitHub, and Google News.

Decisions persist to `decisions.json` on disk — not localStorage. Files are more useful downstream: other agents consume them, they diff cleanly, and they survive browser restarts.

## Company Detail Pages

Every company has a dynamic page at `/company/[slug]` showing the full profile, swipe decision, and rendered dossier markdown. Click a company name in the swipe tool, read the intelligence, click back. Makes the dossiers browsable instead of trapped in a filesystem.

## The Skill Pipeline

Five Claude Code skills form the research-to-outreach pipeline:

1. **`/company-research`** — Discovers companies via web search, evaluates fit (1-5), checks reputation (A-F), writes to three synced data stores (TypeScript, markdown, CSV)
2. **`/company-deep-dive`** — Produces a full intelligence dossier: job openings, recent news, tech stack, 2-5 key contacts, pain points, outreach angles, and a 90-day sketch
3. **`/outreach-strategy`** — Reads the dossier and produces a personalized approach: channels, contacts, proof-of-work assessment, sequenced plan
4. **`/craft-outreach`** — Reads the strategy and produces ready-to-send messages with CV tailoring, portfolio selection, and follow-ups
5. **`/journey-log`** — Documents significant actions, decisions, and milestones for the narrative

Each skill checks its prerequisites. Strategy requires a dossier. Outreach requires a strategy. The pipeline goes from "never heard of this company" to "personalized message from someone who understands your product" in about 15 minutes of agent execution.

## Reputation Scoring

Every company gets an A-F reputation rating cross-referencing Glassdoor scores, layoff history, CEO approval trends, news coverage, and financial stability. The system explicitly warns about Glassdoor manipulation patterns: acquire-and-fire inflation (Bending Spoons: 4.7 Glassdoor, fires entire acquired workforces), post-layoff score inflation, small sample bias, and review timing around funding rounds.

Fit score (1-5) measures stack and vertical match. Reputation (A-F) measures whether it's safe to work there. The combination creates a 2D priority map.

## The Tier List

50 "yes" companies across three priority tiers:

- **Tier 1 (7)** — Full investment: dossier, proof-of-work project, personalized outreach to named contacts
- **Tier 2 (15)** — Personalized outreach with tailored CV emphasis
- **Tier 3 (28)** — Quality applications, lighter touch

Geographic and vertical clustering enables efficiency: one music demo covers 14 companies, one gaming proof-of-work covers 7, one agency portfolio narrative covers 6.

## Seven Outreach Approaches

1. **Growth audits** — 30-minute product teardowns delivered as 1-page PDFs
2. **This article** — a 6,452-word case study that IS outreach, reaching all 162 companies at once
3. **Micro-demos** — 2-4 hour builds targeting specific companies (Three.js for agencies, API toys for voice AI, Source 2 platform for gaming)
4. **Open-source PRs** — Contribute to their codebase, then apply as someone who already shipped code in their repo
5. **Forward Deployed Engineer pitch** — Reframing a decade of consultancy as the parachute-in-and-ship pattern
6. **"What I'd Build" docs** — 1-pagers outlining the first 90 days, referencing their actual product and gaps
7. **Growth teardown livestream** — High-risk/high-reward public teardowns establishing authority

## The Article

`article-writer/articles/ai-job-search-162-companies/output/article.md`

A 6,452-word case study: "I Built an AI-Powered System to Research 162 Companies in a Day." Covers the full journey from broken job boards to a working outreach machine. 44+ external links, 20+ real-world examples, 100% prose ratio. Produced through the article-writer pipeline with quality-gated iterations.

## How It Was Built

Two engineers (Doug and Inna), one shared code-server, ten concurrent Claude Code threads. The entire system — 162 companies researched, swipe tool built, reputation audits completed, screenshot service shipped, 51 dossiers produced, tier list created, outreach strategy documented — was built in a single day. The outreach machine phase (auto-assessment, tiering, dossiers, skill pipeline) took 45 minutes.

## Tech Stack

- **Monorepo:** Turborepo + pnpm workspaces
- **App:** Next.js 16, React 19, TypeScript (strict)
- **Styling:** Tailwind CSS
- **Screenshots:** Puppeteer (headless Chrome)
- **Search:** HN Algolia API (free, 10K req/hr)
- **Logos:** Google Favicon API (free, no key)
- **AI:** Claude Code with custom skills
- **Data:** JSON files on disk (decisions, research cache, company data)
- **Markdown:** react-markdown + remark-gfm for dossier rendering

## Running It

```bash
pnpm install
pnpm dev --filter=web
```

Open `http://localhost:3000` to use the swipe tool. Company detail pages at `/company/[slug]`.
