# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
pnpm install              # Install all dependencies
pnpm dev                  # Run all apps in dev mode (Turborepo)
pnpm dev --filter=web     # Run only the web app (http://localhost:3000)
pnpm build                # Build all apps
pnpm lint                 # Lint all packages
pnpm check-types          # Type-check all packages
pnpm format               # Format with Prettier
```

Single-app commands from root:
```bash
pnpm --filter=web dev     # Dev server for web app only
pnpm --filter=web build   # Build web app only
pnpm --filter=web lint    # Lint web app only (eslint --max-warnings 0)
```

## Architecture

**Monorepo:** Turborepo + pnpm workspaces, TypeScript strict mode, Node >=18

### Apps
- **`apps/web`** — Next.js 16 (App Router), React 19. Company swipe tool, detail pages, CV page, API routes
- **`apps/docs`** — Docs app (Turborepo default)

### Packages
- **`packages/ui`** — Shared React components
- **`packages/eslint-config`** — Shared ESLint config
- **`packages/typescript-config`** — Shared TSConfig base

### Web App Structure
- `app/page.tsx` — Tinder-style company swipe tool (keyboard-driven: arrow keys yes/no/maybe, backspace undo)
- `app/company/[slug]/page.tsx` — Dynamic company detail pages with rendered dossier markdown
- `app/cv/page.tsx` — CV page
- `app/api/decisions/route.ts` — Swipe decisions API (reads/writes `decisions.json` on disk)
- `app/api/research/route.ts` — HN Algolia proxy + cache
- `app/api/screenshot/route.ts` — Puppeteer screenshot service
- `app/api/cv/route.ts` — CV API
- `app/data/companies.ts` — **Most important data file.** TypeScript company database (147 companies), typed + scored
- `app/lib/slugify.ts` — Slug generation
- `app/lib/dossier.ts` — Dossier markdown loader

### Data Persistence
File-based, not database. JSON/MD/TS files on disk — decisions, research cache, company data, dossiers. Consumed by agents and tools, diffs cleanly in git.

## Mission

AI-powered job search system for Doug Silkstone — Lead Full Stack Software Engineer, 15+ years experience, 3x exits. Automates company research, job discovery, and application preparation.

## Candidate Profile

- **Name:** Doug Silkstone | **Location:** Prague, CZ | **Available:** February 2026
- **Core Tech:** TypeScript, React (8yr), Next.js, Node, Python, C++, Tailwind, Vercel, AWS, Postgres, GCP, Hono, Drizzle
- **Specialties:** Scraping & Automation, Growth Engineering, Agentic Workflows, Martech
- **Notable:** MIT GenAI course (50K+ students), 3x exits, clients include Contra, Framer, Motley Fool, Groupon, Sky
- **GitHub:** https://github.com/dougwithseismic | **LinkedIn:** https://linkedin.com/in/dougsilkstone | **Portfolio:** https://contra.com/doug_silkstone/work

### What He Wants
- Ownership of a revenue-adjacent problem
- Build/mentor a team as success grows
- Europe-based funded startups/scale-ups
- Music tech, games, creative tools, travel, novel B2C — **not** fintech or generic B2B SaaS
- Prefers smaller underdog companies over big unicorns

### Work History (Key Roles)
1. **DinnersWithFriends.co.uk** — Technical Founder (2024–Present)
2. **Patrianna Ltd** — Lead Growth Engineer (2022–2023) — Zero to 1M players, hired 9-person team
3. **getBenson.com** — Senior Full-Stack (2021–2022) — 25M monthly sessions, exited 2023
4. **withSeismic.com** — Full Stack Consultant (2016–Present) — Contra, Sky, Groupon, Motley Fool, Framer, MIT
5. **Vouchernaut.com** — Full Stack (2018–2021) — 10K+ brands, exited 2021
6. **Mekamon / Reach Robotics** — Head of Digital (2016–2018) — Apple Store launch
7. **Vouchercloud** — Performance Marketing (2015–2016) — NASDAQ acquisition

## Outreach Pipeline

Five Claude Code skills in `.claude/skills/`:

1. **`/company-research`** — Discover + evaluate + score companies via web search
2. **`/company-deep-dive [name]`** — Full intelligence dossier → `journey/dossiers/{slug}.md`
3. **`/outreach-strategy [name]`** — Personalized approach plan (requires dossier) → `journey/strategies/{slug}.md`
4. **`/craft-outreach [name]`** — Ready-to-send messages (requires strategy) → `journey/outreach/{slug}.md`
5. **`/journey-log`** — Document decisions and milestones → `journey/LOG.md`

Each skill checks prerequisites. Pipeline: deep-dive → strategy → outreach.

### Key Data Files
- **`apps/web/app/data/companies.ts`** — 147 companies, typed + scored. Powers the swipe UI.
- **`decisions.json`** — 50 yes / 14 maybe / 80 no
- **`journey/TIER_LIST.md`** — Tier 1 (7), Tier 2 (15), Tier 3 (28)
- **`journey/dossiers/`**, **`journey/strategies/`**, **`journey/outreach/`** — Per-company pipeline outputs

### Blacklist
- **Apify** — Rejected by Doug. Do NOT include in outreach or recommendations.

### Doug's Voice (Critical for Outreach Copy)
- Short sentences. No compound em-dash chains.
- Facts not feelings — lead with numbers, not "I'm passionate about..."
- Honest about gaps. Don't hide weaknesses.
- **No AI patterns:** Never use "I don't just X, I Y" — flagged as obviously GPT
- **No corporate speak:** No "leverage", "synergy", "drive outcomes"
- **No humble brags.** No false modesty wrapping achievements.
- **Opener:** "Hey —" not "Dear Hiring Manager"
- **LinkedIn connection requests:** Dead simple. "Hey {name} - sending out the connect just in case. Cheers - Doug." No pitch.
- All `/craft-outreach` output needs human rewrite before sending. Good strategy/angles, but copy reads like LinkedIn influencer.
- If it sounds like ChatGPT wrote it, it's wrong.

### Model Selection for Batch Tasks
- **Opus** for Tier 1 (7 companies) — nuanced analysis worth the cost
- **Sonnet** for Tier 2-3 — structured templates keep quality high at lower cost
- Use `model: "sonnet"` parameter on Task tool for batch Tier 2-3 work

## Journey Log

Documented case study capturing the full narrative. Write for a future reader — be specific, include numbers, capture the *why*.

- **`journey/LOG.md`** — Chronological log
- **`journey/[PHASE].md`** — Phase narratives (Setup, Research, Outreach, Interview, Decision)
- Invoke `/journey-log` after significant actions (new phases, strategic decisions, pivots, milestones)

## Project Rules

- Use `pnpm add package@latest` to install dependencies — never hardcode package.json
- Don't push to git without being explicitly told
- Never co-author commits or mention AI in commit messages
- Don't run Supabase queries
- When fixing bugs, explain what the issue was after fixing
- No markdown summaries unless asked
