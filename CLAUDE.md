# Job Search - Project CLAUDE.md

## Mission

Build a powerful agentic job search system for Doug Silkstone — a Lead Full Stack Software Engineer with 15+ years experience, 3x exits, and deep expertise in TypeScript, React, Next.js, growth engineering, and LLM tooling. The system should automate company research, job discovery, and application preparation to land the right role.

## Candidate Profile

- **Name:** Doug Silkstone
- **Title:** Lead Full Stack Software Engineer
- **Available:** February 2026
- **Location:** Prague, Czech Republic (originally from South West England, UK)
- **Experience:** 15+ years across engineering, product, and growth
- **Languages:** TypeScript, Python, C++
- **Core Tech:** React (8 years), Next.js, Express, Node, Tailwind, Vercel, AWS, Postgres, Mongo, GCP, Hono, Drizzle
- **Specialties:** Scraping & Automation, Martech & Analytics, Growth Engineering, Agentic Workflows
- **Notable Clients:** Contra, Framer, The Motley Fool, Groupon, Sky, MIT, Techstars-backed startups
- **Exits:** getBenson.com (2023), Vouchernaut.com (2021), Vouchercloud (NASDAQ acquisition)
- **Featured:** MIT Generative AI course (50,000+ students)
- **Open Source:** Author of multiple automation NPM packages
- **GitHub:** https://github.com/dougwithseismic
- **Portfolio:** https://contra.com/doug_silkstone/work
- **LinkedIn:** https://linkedin.com/in/dougsilkstone

### What Doug Is Looking For

- Ownership of a revenue-adjacent problem he can adopt as his own
- Opportunities to build and mentor a team as success grows
- Funded startups and scale-ups that value engineering-led growth
- **Europe-based startups** — strong preference
- **Not** another fintech or generic B2B SaaS

### Industries & Areas of Interest

- Music technology and VSTs
- Games and gaming tools
- Event production tools
- Travel-related products
- Novel / unconventional use cases of tech
- Mission-driven companies (e.g. Grammarly-style)
- Interesting B2C products

### Current Side Projects

- Valve Source 2 game modding platform
- Automation tooling
- Increasingly more C++ and lower-level work

### Work History

1. **DinnersWithFriends.co.uk** — Technical Founder (2024–Present) — TypeScript, React, Next.js, Hono, Postgres, GCP. Stripe Connect franchise model, SEO-optimized, LLM-powered admin workflows.
2. **Patrianna Ltd** — Lead Growth Engineer (2022–2023) — Led greenfield game studio from zero to 1M players. Hired and led 9-member team. TypeScript, Next.js, React, Postgres, Java Spring.
3. **getBenson.com** — Senior Full-Stack Developer (2021–2022) — Built SaaS protecting 25M monthly sessions. Onboarded 80+ brands. Commercially exited 2023.
4. **withSeismic.com** — Full Stack Engineering Consultant (2016–Present) — Consultancy across Contra.com, Sky, Groupon, The Motley Fool, Framer, MIT.
5. **Vouchernaut.com** — Full Stack Software Engineer (2018–2021) — Affiliate automation for 10,000+ brands. 250k monthly sessions. Sold to PE investors 2021.
6. **Mekamon / Reach Robotics** — Head of Digital (2016–2018) — Go-to-market for AR spider robot launched in Apple Stores globally. Hired and led cross-functional team.
7. **Vouchercloud** — Performance Marketing & Automation (2015–2016) — Multi-million-pound paid search budget. Built React internal tools saving 240 monthly hours. Later acquired by NASDAQ-listed company.

## Tech Stack (This Project)

- **Monorepo:** Turborepo with pnpm workspaces
- **Apps:** Next.js 16 (App Router), React 19
- **Packages:** Shared UI components, ESLint config, TypeScript config
- **Language:** TypeScript (strict mode)
- **Node:** >=18

## Outreach Pipeline

The project has three custom skills forming a research-to-outreach pipeline:

### Skills

1. **`/company-deep-dive [company-name]`** — Deep research producing a dossier with job postings, recent news, tech deep dive, key contacts, pain points, and outreach angles. Output: `journey/dossiers/{slug}.md`
2. **`/outreach-strategy [company-name]`** — Reads the dossier and produces channel selection, contact identification, angle mapping, proof-of-work assessment, and outreach sequence. Requires dossier first. Output: `journey/strategies/{slug}.md`
3. **`/craft-outreach [company-name]`** — Produces ready-to-send messages with Doug's voice, CV tailoring, portfolio selection, and follow-up drafts. Requires strategy first. Output: `journey/outreach/{slug}.md`

### Data Files

- **`apps/web/app/data/companies.ts`** — TypeScript company database (147 companies). Powers the swipe UI. This is the most important data file.
- **`decisions.json`** — Yes/no/maybe decisions for each company ID. 50 yes, 14 maybe, 80 no.
- **`journey/TIER_LIST.md`** — Priority tiers for all 50 "yes" companies:
  - **Tier 1 (7):** Apify, Photoroom, Framer, Mews, Overwolf, Bakken & Baeck, Tractive — full investment, proof-of-work projects
  - **Tier 2 (15):** XCEED, Deezer, Contra, Leetify, Musixmatch, MapTiler, Realm.fun, Splice, Brainhub, Moises AI, Linear, Arturia, ustwo, 14islands, Supercell — personalized outreach
  - **Tier 3 (28):** Quality applications, lighter touch

### Dossiers & Outreach Materials

- **`journey/dossiers/{slug}.md`** — Deep dive dossiers per company (job postings, contacts, pain points, angles)
- **`journey/strategies/{slug}.md`** — Outreach strategies per company (channel, person, angle, sequence)
- **`journey/outreach/{slug}.md`** — Ready-to-send outreach materials (messages, CV emphasis, follow-ups)

### Current Progress

- All 147 companies reviewed and categorized
- Tier list complete
- First dossier completed: Rankacy (`journey/dossiers/rankacy.md`)
- Next: Run `/company-deep-dive` on all 7 Tier 1 companies, then `/outreach-strategy` and `/craft-outreach`

## Journey Log

This project doubles as a documented case study. We're capturing the full narrative of the job search — what we did, why, the reasoning behind decisions, and what happened — so Doug can later turn it into content.

### How It Works

- **Log file:** `journey/LOG.md` — the running chronological log of significant actions and decisions
- **Phase files:** `journey/[PHASE].md` — cohesive narratives per phase (Setup, Research, Outreach, Interview, Decision)
- **Skill:** `/journey-log` — invoke to add a new entry

### When to Log

After any significant action, invoke `/journey-log` or manually append to `journey/LOG.md`. Significant means:
- Starting a new phase or sub-task
- Making a strategic decision (targeting a vertical, rejecting a company, changing approach)
- Using an agent/skill and getting notable results
- A pivot or change in strategy
- A milestone (first application, first interview, offer received)
- A meta-observation about the process itself

### Tone

Write for a future reader. Be specific, include numbers, capture the human reasoning — not just what happened but *why*. This is Doug's story told through the lens of building an AI-powered job search.

## Project Rules

- Use `pnpm add package@latest` to install dependencies — never hardcode package.json
- Don't push to git without being explicitly told
- Never co-author commits or mention AI in commit messages
- Don't run Supabase queries
- When fixing bugs, explain what the issue was after fixing
- No markdown summaries unless asked
