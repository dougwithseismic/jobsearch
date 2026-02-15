# Job Search Journey Log

This is a living document tracking the entire job search process — what we did, why, and what happened. The goal is to create a complete narrative that can later be turned into content (blog post, case study, talk, etc.).

---

## Entry Format

Each entry follows this structure:

- **Date:** When it happened
- **Phase:** Which stage of the search (Setup, Research, Outreach, Interview, Decision)
- **What:** What was done
- **Why:** The reasoning behind this action
- **How:** Tools, agents, and methods used
- **Outcome:** What resulted
- **Decisions:** Key choices made and alternatives considered
- **Reflection:** What we'd do differently, what worked well

---

## Log

### 2026-02-15 — Project Setup

**Phase:** Setup
**What:** Initialized the job search monorepo and established the agentic workflow system. Created CLAUDE.md with full candidate profile, search criteria, and project rules. Built the first skill — `company-research` — to automate finding and evaluating companies.
**Why:** Doug wanted to approach this job search systematically, using AI agents to automate the tedious parts (company discovery, research, evaluation) while keeping human judgment on the important decisions (which companies to pursue, how to position himself). The idea: treat the job search like a product engineering problem.
**How:** Turborepo monorepo, Claude Code as the orchestration layer, custom skills for repeatable workflows.
**Outcome:** Foundation in place — project structure, candidate profile documented, company research agent ready.
**Decisions:**
- Chose to build this as a real codebase (not just chat conversations) so the work compounds
- Used Claude skills system over custom scripts for flexibility
- Decided to document the journey from day one (this log)
**Reflection:** Starting with the meta-documentation early means we capture the "why" while it's fresh, not reconstructing it later.

---

### 2026-02-15 — Location Update & Search Preferences Defined

**Phase:** Setup
**What:** Updated candidate profile from "South West England, UK" to "Prague, Czech Republic (originally from South West England, UK)" across CLAUDE.md and cv.json. Defined target industries and anti-preferences for the job search.
**Why:** The profile was out of date — Doug has been based in Prague for 8 years. More importantly, we needed to define what kind of role Doug actually wants before doing any company research. Without clear preferences, the search would be too broad to be useful.
**How:** Direct file edits to CLAUDE.md and cv.json. Added new sections: "Industries & Areas of Interest" and "Current Side Projects" to the project instructions.
**Outcome:** Search criteria locked in. Target verticals: music tech, games, gaming tools, event production, travel, novel/weird tech, mission-driven companies, B2C. Hard no on: fintech, generic B2B SaaS. Geography: European startups and scale-ups. Also captured that Doug is actively working on a Valve Source 2 modding platform and C++ — signals that broaden his profile beyond the typical "React guy" positioning.
**Decisions:**
- Decided to be explicit about anti-preferences (no fintech/B2B SaaS) rather than just listing positives — this saves time when filtering companies later
- Added current side projects to CLAUDE.md since they signal genuine interest in games/modding, not just "I'm open to anything"
**Reflection:** Defining what you don't want is just as valuable as defining what you do. The Source 2 modding and C++ work is a genuine differentiator — most senior React engineers don't also write memory-hooking tools in C++.

---

### 2026-02-15 — Comprehensive Profile Scraping Sprint

**Phase:** Setup
**What:** Scraped all of Doug's public-facing profiles and compiled them into structured asset files. Covered 6 sources: Contra portfolio, withSeismic.com, LinkedIn, Clutch.co, GitHub, and downloaded the CV PDF. Organized everything into an `assets/` folder.
**Why:** To build a single source of truth about Doug's professional presence. Every claim in a cover letter, every project mentioned in an application, every testimonial — it should all be instantly accessible to the agents that will later craft outreach messages. You can't write compelling applications if you don't know what you're working with.
**How:** Parallel browser automation using Claude-in-Chrome MCP tools across multiple tabs simultaneously. Spawned 3 concurrent agents to scrape Contra, withSeismic, and LinkedIn at the same time. Used GitHub CLI (`gh api`) with GraphQL for structured repo data instead of browser scraping. Used JavaScript injection (`document.body.innerText` in chunks) to extract Clutch reviews when the standard page text extraction only captured partial content. Downloaded 4 Contra project hero images via browser automation.
**Outcome:**
Complete asset library created:
- `CONTRA_PORTFOLIO.md` — 8 projects with full descriptions, tech stacks, URLs. 3 client reviews (all 5.0/5.0). 3 service tiers ($150/hr, $1,500 security audit, $7,000 sprint). Profile stats: $10k+ earned, 8x hired, Unicorn Club member, 104 followers.
- `WITHSEISMIC_COMPREHENSIVE_CONTENT.md` — 892 lines. Pricing model ($7k/sprint), 6 service areas (Chrome extensions, LLM workflows, Playwright automation, MVP dev, internal tools, MCP servers), 11 case studies, full tech stack, embedded YouTube video URL.
- `LINKEDIN_PROFILE.md` — Full profile with headline, about, experience, open-to-work details (seeking Full Stack Engineer, JS Developer, AI Software Developer roles), skills endorsements, 1 recommendation from Inna Prysenko.
- `CLUTCH_REVIEWS.md` — 3 verified reviews (all 5.0/5.0). Standout: Nico Marino's Chrome extension project "saved 48hrs/week" with "ROI in 1 week." Profile shows $150-$199/hr rate, min $25k project size.
- `GITHUB_PROFILE.md` — 124 public repos, 80 followers, 3,142 contributions in the last year. Top repo: react-tailwind-chrome-extension-template (73 stars, 12 forks). 6 pinned repos spanning TypeScript, C++, and forks of TanStack Query and Mastra. Active in AI tooling, browser extensions, game modding, and automation.
- `cv.json` — Structured candidate data.
- `images/contra/` — 4 project hero images (Supabase Manager, AI Marketplace, CtxEng, Helix AI).
- Doug's CV PDF.
**Decisions:**
- Chose parallel browser scraping over sequential to save time — 3 agents ran simultaneously on Contra, withSeismic, and LinkedIn
- Used GitHub CLI + GraphQL API instead of browser scraping for GitHub — structured data is more reliable than parsing rendered HTML, and the API gives stars/forks/languages cleanly
- Used JavaScript injection for Clutch instead of `get_page_text` after the article extractor only captured 1 of 3 reviews — chunked `innerText` extraction (0-8000, 5000-12000, 8500+) with overlapping ranges ensured nothing was missed
- Organized all scraped content into `assets/` folder rather than leaving files scattered in root — clean structure for agents to reference later
- Had to re-run the Contra scraping agent after the first one produced nearly empty output — learned that browser agents sometimes need very explicit instructions about what to extract
**Reflection:** The parallel scraping approach worked well — what would have been 30+ minutes of sequential browsing happened in about 10 minutes. The biggest surprise was how rich the Clutch reviews were: specific ROI numbers ("saved 48 hours per week," "ROI in one week") that are gold for application materials. The GitHub profile revealed a story that's easy to miss: Doug isn't just a web developer, he's building C++ memory-hooking tools, forking game SDKs, and contributing to AI agent frameworks. That range is rare and should be front-and-center in applications to games/novel-tech companies. One lesson learned: always check agent output before moving on. The first Contra agent silently failed and produced garbage — if we hadn't caught it, we'd have a gap in the asset library.

---

### 2026-02-15 — Housekeeping: Killed Rogue Article-Writer Hooks

**Phase:** Setup
**What:** Diagnosed and removed spurious article-writer hooks that were firing during the session, interrupting workflow with errors about a missing `article.json` file.
**Why:** Stop hooks from another project's plugin were bleeding into this session, creating noise and confusion. Every tool call was triggering an article-writer check that had nothing to do with the job search.
**How:** Found the entry `"article-writer@article-writer": false` in `~/.claude/settings.json` under `enabledPlugins`. Even though it was set to `false`, the hooks still fired. Removed the entry entirely by setting `enabledPlugins` to `{}`.
**Outcome:** Entry removed, but hooks continued firing for the remainder of the session because they're cached at startup. Will be fully cleared on next session restart.
**Decisions:**
- Removed the plugin entry entirely rather than trying to configure it differently — cleaner to eliminate it than debug why `false` wasn't being respected
**Reflection:** Minor but worth noting: plugin/hook systems that fire globally rather than being scoped to project directories are a footgun. This is the kind of thing that erodes trust in automated workflows — unexpected side effects from unrelated configurations.

---

### 2026-02-15 — Company Research Sprint: 101 Companies Across 6 Verticals

**Phase:** Research
**What:** Conducted a deep research sprint across Doug's target verticals — music tech, gaming/modding, events tech, travel tech, creative tools, and novel B2C. Produced a database of 101 companies in CSV format and a detailed markdown dossier (`companies.md`, 1100+ lines) covering every company with location, funding, tech stack, and a vibes-based fit score from 1-5.
**Why:** Doug needed a comprehensive map of the European startup landscape in his areas of interest. Rather than applying to whatever LinkedIn surfaced, the goal was to build a curated target list: companies where his specific background (growth engineering, scraping/automation, TS/React, 3x exits) would be genuinely valued, not just another applicant.
**How:** Web searches across Wellfound, remote job boards (RemoteGameJobs, WorkingNomads, GameJobs.co), company career pages, and EU startup databases. Manual curation into structured CSV and markdown formats. Companies were tagged with fit scores based on rough alignment with Doug's profile.
**Outcome:** 101 companies documented. Distribution: ~25 music/audio, ~25 gaming, ~10 events, ~8 travel, ~15 creative tools, ~18 other (AI, sports tech, developer tools). Strong Prague cluster discovered (Mews, Apify, Productboard, Bohemia Interactive, Warhorse, Medevio). 15 companies scored 5/5 fit including Framer (prior relationship), Contra (prior relationship), Apify (scraping expertise match), Kiwi.com (same country), and Leetify (gaming analytics + growth engineering).
**Decisions:**
- Cast a wide net first (101 companies) rather than a narrow one — the plan was always to filter down with human judgment
- Included "underdogs" (small teams like Bitwig at 30 people, FabFilter, Kilohearts) alongside unicorns (Mews $1.2B, Sorare $4.3B) — Doug's background spans both
- Explicitly excluded pure fintech and generic B2B SaaS per Doug's preferences
- Fit scores were subjective/vibes-based, not formula-driven — this became a problem later
**Reflection:** The breadth was right but the depth was wrong. Each company entry had at most a sentence or two of description. When it came time to actually review them, "Music rights management" or "Entertainment sound platform" wasn't enough to make a yes/no decision on. The fit scores had no documented methodology — they were rough intuitions baked into the notes during research. Lesson: research quantity without review-quality context creates a bottleneck downstream.

---

### 2026-02-15 — Built the Company Swipe Review Tool

**Phase:** Setup
**What:** Built an interactive Tinder-style company review app inside the existing Next.js monorepo (`apps/web`). One card at a time, keyboard-driven (← → ↓ for no/yes/maybe), with company logos pulled via Google's free favicon API, and decisions persisted to a local `decisions.json` file at the project root.
**Why:** Doug had 101 companies to triage and needed a fast way to do yes/no/maybe sense checks. Reading a CSV or scrolling through 1100 lines of markdown is slow and doesn't give you a feedback loop. The goal was: make a decision in under 5 seconds per company, with enough context on the card, and capture those decisions in a machine-readable format the system can use downstream.
**How:** Built directly in `apps/web` (Next.js 16, React 19). No extra dependencies — just the existing monorepo stack. Client component with `useCallback` for keyboard handlers, swipe animations via CSS transforms (card slides left for no, right for yes), and a Next.js API route (`/api/decisions/route.ts`) that reads/writes a JSON file on disk. Company logos via Google's favicon service (`google.com/s2/favicons?domain=...&sz=128`) — free, no API key, works for any domain. Dark theme, progress bar, undo support.
**Outcome:** Working app at localhost:3000 with 101 company cards. Each card shows: company logo, name, role (if known), location, work model, salary range, website link, notes, and fit score badge (color-coded green/yellow/grey/red). Arrow keys for rapid decisions, backspace to undo with full history. Progress bar shows reviewed count and running yes/maybe tallies. Results view at the end with tabbed filtering (Yes/Maybe/No/All) and export to JSON or CSV. Decisions write to `decisions.json` — a real file, not localStorage.
**Decisions:**
- Local JSON file over localStorage — Doug's instinct. A file is more useful downstream: other agents can consume it, it can be committed to the repo, you can diff it. localStorage dies with the browser
- Google favicon over logo.dev API — free, no signup, good enough at 48px. Logo.dev starts at $33/month for paid tier
- Arrow keys as primary controls (← → ↓) over letter keys (Y/N/M) — more natural for rapid swiping. Letter keys still work as fallback
- Built in the existing Next.js app rather than a standalone tool — avoids project bloat, already had the monorepo infra
- Three-way decisions (yes/no/maybe) rather than binary — "maybe" captures "interesting but need to learn more" which is a real and frequent state in job searching
- Initially used localStorage, then switched to file-based persistence mid-session at Doug's suggestion. This was the right call — it changed the tool from a throwaway UI into part of the pipeline
**Reflection:** The tool works well mechanically but exposed the data quality problem immediately. When Doug started using it, the first thing he asked was "How did you measure the fit number?" — revealing the scores had no transparency or methodology. The second issue: cards like "AI music discovery" or "Music rights management" simply don't give enough context to make a real decision. You're swiping blind. The tool is ready but the data feeding it isn't. Next step needs to be an enrichment pass: fetch real descriptions from company websites, document actual tech stacks, and build a proper weighted scoring model against Doug's profile dimensions (location proximity, tech overlap, domain interest, role seniority, growth stage, prior relationships). The tool itself took about 20 minutes to build — the data quality gap will take longer to close but matters more.

---

### 2026-02-15 — Underdogs Round: Music Production & Gaming Analytics (Companies 101–117)

**Phase:** Research
**What:** Expanded the company list from 100 to 117, specifically targeting scrappy underdogs in music production (VST/DAW companies) and gaming analytics tools. Doug specifically called out Overwolf and Leetify as examples of the vibe he wanted — tools that serve passionate communities, built by small teams punching above their weight.
**Why:** The first 100 companies skewed toward bigger, established names. Doug wanted the list to include the kind of companies where a senior engineer joining would genuinely change the trajectory — 10-30 person teams with real traction and passionate user bases. Music production plugins and gaming analytics tools are deeply personal interests, not just career targets.
**How:** Targeted web searches for gaming analytics startups (CS2 coaching, esports tools), music production underdogs (DAW companies, plugin makers, sample platforms). Found companies like Leetify (200k+ MAU, AI coaching for CS2), Bitwig (30-person DAW team competing with Ableton), FabFilter (Engineering Emmy-winning plugins from Amsterdam), and Kilohearts (modular plugin ecosystem from Stockholm).
**Outcome:** 17 new companies added. Gaming analytics: Leetify, GGPredict, SCOPE.GG, Porofessor.gg, Kronte, Improbable. Music production: Bitwig, FabFilter, Kilohearts, Sonible, u-he, Spitfire Audio, Beatport/Plugin Boutique, Moonbase, Splice, LANDR, BandLab. Several of these are too small to have public hiring pages, but they're the kind of places where a cold DM from someone with the right background could create a role.
**Decisions:**
- Included companies as small as 9 people (Kilohearts) and 16 people (u-he) — normally too small for a structured job search, but the fit is so strong it's worth a speculative approach
- Kept Improbable despite its troubled history ($600M+ raised, multiple pivots) because the tech challenges are genuinely interesting
- Added Moonbase (indie plugin e-commerce) because they're hiring Head of Growth — directly maps to Doug's growth engineering background
**Reflection:** This was the most fun research batch. These are companies I'd genuinely want to work at, not just "they have good funding and the stack matches." The question is whether companies this small have budget for a senior hire at market rates. Many of these will need a different approach than applying through a careers page — it'll be more about demonstrating value through the community (contributing to forums, building tools, engaging with the product) and then making a direct pitch.

---

### 2026-02-15 — Reputation & Reliability Research: The Due Diligence Sprint

**Phase:** Research
**What:** Conducted a comprehensive reputation audit across all 117 companies in the database. For each company with enough public data, researched: Glassdoor ratings, layoff history (2022–2026), scandals or controversies, financial stability, CEO approval, culture signals, and internal employee sentiment. Added an A-F reputation rating to every company entry in both `companies.md` and `companies.csv`. Also updated the `company-research` skill to include reputation research as a mandatory step for all future searches.
**Why:** Doug asked a pointed question: "Can you add a rating of the reliability of the company?" Fit scores only measure whether the tech stack and vertical match — they say nothing about whether the company is a good place to work. A company can score 5/5 fit and still be a nightmare if they're doing rolling layoffs, have toxic leadership, or just gutted their engineering team. We needed a second dimension: not just "do I want to work there?" but "would it be safe to work there?"
**How:** Three parallel research agents ran simultaneously, each handling a batch of companies:
- **Batch 1 (Music/Audio):** 20 companies — Epidemic Sound through Beatport/Plugin Boutique
- **Batch 2 (Gaming):** 22 companies — Supercell through Improbable
- **Batch 3 (Creative/Travel/Events):** 28 companies — XCEED through Contra

Each agent ran 15-30 web searches per batch, targeting Glassdoor reviews, layoff trackers (TrueUp, Crunchbase), news articles, and employee forums. Results were compiled into A-F ratings with one-line summaries, then written into both `companies.md` (as a new `- **Reputation:**` bullet per company) and `companies.csv` (appended to the Notes column).
**Outcome:** 70 companies received reputation ratings. The remaining ~47 were either too small for public data (Bitwig, FabFilter, u-he, etc.) or from the original pre-expansion list without career-page-level detail. Key findings that changed the picture:

*Companies that looked great but aren't:*
- **Ableton** (D) — Laid off 20% of staff in 2024. Glassdoor 3.2. Compensation rated 2.8/5. The Berlin dream DAW company is in trouble
- **Paradox Interactive** (D) — Documented sexual harassment scandal (69% of women reported mistreatment). Forced RTO. Studio closures
- **Bending Spoons** (F) — Glassdoor 4.7 internally, but their actual business model is acquiring companies and firing nearly everyone. Evernote, WeTransfer, Vimeo, Hopin — all gutted
- **Hopin** (F) — Three layoff rounds in a single year (2022), then sold to Bending Spoons who fired the rest. $7.7B to effectively defunct
- **Omio** (D) — CEO publicly denied layoffs on the same day they cut 20% of engineers. Glassdoor 3.1
- **Productboard** (D) — Prague unicorn that imploded. Massive layoffs since 2022, constant pivots, leadership churn. Employees describe "trauma bonding"
- **Sorare** (D) — 13% layoff, then 35% layoff, revenue declining, 220M EUR losses. NFT market collapse dragged them down

*Companies that are better than expected:*
- **Apify** (A) — Glassdoor 4.8 (5.0 in Prague specifically). 100% recommend. No layoffs. Outstanding culture and comp. Prague's best-kept secret
- **Photoroom** (A) — Glassdoor 4.9. Culture rated 5.0. No layoffs. $50M revenue growing fast. Paris
- **XCEED** (A) — Glassdoor 4.8, 94% recommend, unlimited holidays, no layoffs. Barcelona events tech
- **Linear** (A) — 100% recommend, culture 4.6, no layoffs, remote-first
- **Musixmatch** (A) — Glassdoor 4.1, no layoffs, 86% recommend. Stable Bologna/London music data company
- **Synthesia** (A) — Glassdoor 4.4, competitive pay, high-trust culture, no layoffs. London AI video

*Surprises:*
- **Ready Player Me** was acquired by Netflix in Dec 2025 and is ceasing independent operations — no longer a viable target
- **Larian Studios** (B-) had Dec 2025 allegations of sexual harassment and tolerance of extremist views — concerning for the studio behind one of the best RPGs ever made
- **Epidemic Sound** (C) has strong revenue ($182M, +29% YoY) but Glassdoor 2.8 with rolling layoffs every 6-8 weeks since 2023 — a company printing money while destroying morale
- **Spitfire Audio** (C) has Glassdoor 4.4 that's misleading — they cut 25% of staff in 2023, had a co-founder public fallout, and continue hemorrhaging people
- **Coffee Stain Studios** (B) survived the Embracer Group apocalypse (7,800 layoffs across the group) and spun off as an independent public company in Dec 2025

**Decisions:**
- Ran 3 agents in parallel rather than sequentially — this saved significant time, each agent handled ~20-28 companies in one pass
- Used A-F rating scale instead of numbers to avoid confusion with the 1-5 fit scores — two different dimensions (fit vs. reputation) need distinct scales
- Rated companies `?` when too small for meaningful data rather than guessing — better to acknowledge the gap than fabricate confidence
- Updated the `company-research` skill to include reputation research (Step 4) as a permanent part of the workflow — every future company search will automatically include Glassdoor, layoff, and controversy checks
- Kept the one-line summary format (`Rep: B — Glassdoor 4.2, no layoffs, strong culture`) rather than writing paragraphs — this needs to be scannable, not exhaustive

**Reflection:** This was the most valuable research step so far. The fit scores told us "this company does cool things in your space." The reputation ratings tell us "but would you actually want to work there?" The combination creates a 2D map: high-fit + high-reputation companies (Apify, Photoroom, Musixmatch, Linear, Synthesia) are the priority targets. High-fit + low-reputation companies (Ableton, Paradox, Productboard) are warnings — they'd be exciting on paper but potentially miserable in practice.

The biggest insight: Glassdoor scores alone are misleading. Spitfire Audio has 4.4 stars but cut a quarter of their staff. Bending Spoons has 4.7 stars because they rate their internal Milan team — not the hundreds of acquired employees they fired. You have to look at layoff history, revenue trajectory, leadership stability, and the *trend* of reviews, not just the number.

What we'd do differently: start the reputation research earlier, ideally during the initial company discovery sprint rather than as a separate pass. Every hour spent researching a company that turns out to be toxic is wasted. The updated skill now does this automatically.

The database now has two dimensions for every company: how well it fits Doug's profile (1-5) and how reliable it is as an employer (A-F). That's a much better foundation for the outreach phase.

---

### 2026-02-15 — Deep Debugging: Killed the Article-Writer Ghost Hook

**Phase:** Setup
**What:** Investigated and permanently removed a rogue `article-writer` plugin that had been silently firing a Stop hook on every single Claude response across all projects. The hook was sending the entire conversation to a haiku model to "evaluate article quality" — even in this job search project where no article exists. When the model returned an empty response (which happened frequently), Claude Code threw a "hook invalidated JSON" error that interrupted the workflow.
**Why:** Doug flagged a persistent error — something like "stop: hook invalidated JSON" — appearing whenever Claude finished responding. It was disrupting every session and eroding trust in the tooling. Turned out this was the same article-writer plugin that was flagged earlier in the day (the "Housekeeping" entry above), but the earlier fix only removed the `enabledPlugins` entry from settings.json. The actual hooks were cached and continued firing from `/Users/godzillaaa/.claude/plugins/cache/article-writer/`.
**How:** Systematic forensic investigation:
1. Checked `~/.claude/settings.json` — no hooks configured there
2. Checked project-level `.claude/` — clean, only skills
3. Found 17 hook definition files across the plugin ecosystem (security-guidance, hookify, ralph-wiggum, ralph-loop, learning-output-style, explanatory-output-style, article-writer)
4. Read every hook script and its source code to understand what each does
5. Tested hooks manually by piping JSON through them
6. Dug into Claude Code's minified source (`cli.js`) to find the `Es4` validation function and understand exactly what "invalid JSON" means in the hook pipeline
7. Analyzed debug logs across multiple sessions — found the smoking gun in `4440b1a1`: lines showing `"Hooks: Model response:"` (empty) followed by `"Hooks: error parsing response as JSON:"` — the article-writer's prompt-type Stop hook was getting empty model responses that failed JSON parsing
8. Confirmed the hook was firing on every stop by checking 6+ session debug logs — each showed the article evaluation prompt being sent to haiku

Removed both the cached plugin (`~/.claude/plugins/cache/article-writer/`) and the marketplace source (`~/.claude/plugins/marketplaces/article-writer/`).
**Outcome:** Article-writer plugin fully eliminated. No more spurious Stop hook firing, no more wasted API calls to haiku on every response, no more JSON parsing errors. Sessions should be noticeably faster since every single Claude stop was adding a model round-trip for an irrelevant article quality check.
**Decisions:**
- Deleted the entire plugin (cache + marketplace) rather than just disabling the hook — the earlier attempt to disable via `enabledPlugins: false` didn't work, and there's no reason to keep a plugin around that has no relevance to this project
- Chose to investigate thoroughly rather than just nuking all plugins — wanted to understand the root cause so we'd recognize similar issues faster in the future
- Left other plugin hooks intact (security-guidance, hookify, ralph-wiggum, etc.) since they're either dormant (no state files to trigger them) or useful (security pattern warnings on file edits)
**Reflection:** This was a 30-minute debugging session for what turned out to be a single rogue plugin. The investigation revealed something important about Claude Code's plugin architecture: hooks from cached plugins fire globally regardless of project context or the `enabledPlugins` setting. A Stop hook that makes sense for an article-writing project becomes a tax on every other project. The earlier "fix" (removing the `enabledPlugins` entry) was insufficient because the cached hooks live independently. This is the second time today we've hit this same plugin — first as noise, now as a breaking error. The lesson: when a plugin misbehaves, delete the cache, not just the config. Also worth noting: the debug logs were invaluable. Without `~/.claude/debug/`, this would have been a guessing game. The exact line `"Hooks: error parsing response as JSON:"` told us everything.

---

### 2026-02-15 — Hardened the Company Research Skill Into a Production Workflow

**Phase:** Setup
**What:** Major upgrade to the `company-research` skill (`.claude/skills/company-research/SKILL.md`), transforming it from a basic discovery script into a comprehensive research-and-enrichment workflow. The skill now writes to three data destinations (markdown, CSV, and TypeScript), includes a full Company interface schema, has a dedicated enrichment mode, and encodes all the lessons learned from researching 117 companies.
**Why:** The skill was written before we'd actually done serious research at scale. After running three parallel reputation agents across 70+ companies, we discovered: (1) file paths were wrong (pointed to root instead of `assets/`), (2) the TypeScript data file that powers the swipe tool wasn't being updated at all, (3) the reputation research was described as a separate step when it should be integrated into discovery, (4) Glassdoor scores are systematically misleading in ways the skill didn't warn about, and (5) there was no way to backfill missing data for existing companies. Doug also added a full TypeScript interface definition and an enrichment mode for filling gaps in existing entries.
**How:** Iterative editing of SKILL.md. First pass fixed paths and added the `?` rating for small companies. Second pass (Doug's edits) added the TypeScript data file as a third output destination, defined the Company interface with required fields, added enrichment mode instructions, expanded Step 2 with tech stack discovery tips, and restructured the output step into 5a/5b/5c for the three file targets.
**Outcome:** The skill now:
- Writes to all three data stores (MD, CSV, TS) — with the TypeScript file flagged as most important since it powers the UI
- Defines a strict Company interface with 15 fields, 6 of which must never be blank
- Includes a "Glassdoor Pitfalls" section documenting five specific patterns of misleading reviews (acquire-and-fire inflation, post-layoff score inflation, small sample bias, review timing, CEO denial pattern)
- Supports `enrich` mode for backfilling thin entries instead of only discovering new companies
- Checks for acquisitions/shutdowns (learned from Ready Player Me disappearing)
- Uses +/- rating modifiers (B+, B-, C+, C-) for more granular reputation scoring
- Produces a 2D priority map (fit × reputation) in its summary output
**Decisions:**
- Made the TypeScript file the "critical" output — this is what the user actually sees and interacts with, so it takes priority over the markdown dossier
- Added enrichment mode as a separate workflow rather than mixing it into discovery — different mental model (filling gaps vs. finding new companies)
- Encoded specific company examples in the Glassdoor pitfalls section (Bending Spoons, Spitfire Audio, Omio) — concrete examples are more useful than abstract warnings
- Required `description` and `whyCool` to never be blank — these are the two fields that make the swipe tool useful; without them you're swiping blind
- Added tech stack discovery tips (GitHub org, StackShare, engineering blogs, job postings) because tech stack was one of the most commonly empty fields
**Reflection:** This is the skill doing what skills should do — encoding institutional knowledge so it doesn't have to be rediscovered. Every lesson from the reputation sprint is now baked into the process. The enrichment mode is particularly valuable: we have 117 companies but many have thin data (empty descriptions, no tech stacks, no salary info). Rather than re-researching from scratch, the enrichment workflow reads the existing data and fills gaps. The TypeScript interface definition is a forcing function — it makes it impossible to add a company without providing the minimum viable data. The skill went from "search and dump results" to "research, evaluate, cross-reference, and update three synchronized data stores." It's a proper workflow now.

---

### 2026-02-15 — Live Research Panel: From Swiping Blind to Swiping Informed

**Phase:** Setup
**What:** Added an always-visible Research Panel below every company card in the swiping interface. The panel pulls in three types of live data: a real-time website screenshot (via thum.io), the top 5 Hacker News mentions (via HN Algolia API), and one-click research links to Google News, LinkedIn, Glassdoor, and GitHub. Also built a new API route (`/api/research`) that proxies the HN API and caches results to a local `research-cache.json` file — same pattern as `decisions.json`.
**Why:** The swipe tool exposed a fundamental problem: you can't make a meaningful yes/no decision about a company from a one-line description and a fit score. "AI music discovery" tells you nothing about whether the product is real, whether anyone cares about them, or what the company actually *looks like*. Doug needed to see the company — their actual website, what the tech community says about them, and quick access to deeper research — all without leaving the card flow. The alternative was opening 5 tabs per company, which kills the speed advantage of the swiping interface entirely.
**How:** Three files, zero new dependencies:
- `ResearchPanel` component in `page.tsx` — renders below `CompanyCard`, fetches HN data on mount per company, shows a thum.io screenshot as a lazy-loaded `<img>`, and generates search URLs for Google News, LinkedIn, Glassdoor, and GitHub
- `/api/research/route.ts` — server-side proxy to HN Algolia (`hn.algolia.com/api/v1/search`), avoids CORS, caches results keyed by company name so the same company is never re-fetched
- `globals.css` additions — dark-themed styles for the panel, screenshot container with loading skeleton, HN mention cards, and research link buttons
**Outcome:** Every card now has live context beneath it. Website screenshots load in 2-5 seconds (thum.io generates on-demand). HN mentions show title, points, comment count, and date — or "No mentions found" for obscure companies. Research links open in new tabs. Navigating to a new card triggers fresh data; going back to a previously viewed company loads HN data instantly from cache. Built and passing build checks in a single implementation pass.
**Decisions:**
- Used thum.io for screenshots over alternatives (Screenshotlayer, URLBox, Microlink) — free, no API key, no signup, just an `<img src>` that works. Trade-off: slower first load (2-5s) but zero configuration
- Proxied HN API through a Next.js route rather than calling from the client — avoids CORS issues and lets us cache server-side to a file (same pattern as decisions)
- File-based cache over in-memory — survives server restarts, can be inspected and committed, consistent with the project's "files over ephemeral state" philosophy
- Showed top 5 HN stories rather than all results — enough signal without overwhelming the card view
- Put research links as buttons rather than auto-loading multiple iframes — keeps the panel fast and lets Doug choose which deep-dive to pursue
**Reflection:** This is the feature that turns the swipe tool from a toy into a real research instrument. Before: you're reading a sentence and guessing. After: you're seeing the actual website, checking if the tech community talks about them, and one click away from Glassdoor and LinkedIn. The zero-dependency approach paid off — no API keys to manage, no rate limits to worry about (HN Algolia allows 10k requests/hour), no paid services to sign up for. The file-based caching means repeat views are instant and the research data accumulates as an asset alongside decisions.json. The whole feature — API route, component, styles — shipped in one pass with a clean build. Sometimes the simplest tools are the most impactful.

---

### 2026-02-15 — Build vs. Buy: Replaced Two Broken SaaS Services With 50 Lines of Puppeteer

**Phase:** Setup
**What:** The website screenshot feature initially relied on thum.io (a free screenshot-as-a-service). It returned "image not authorized" — requires a paid SitEarth account. Swapped to WordPress mshots (`s.wordpress.com/mshots/v1/`). That one never loaded either. Instead of hunting for a third external service, we installed Puppeteer and built our own screenshot API in about 5 minutes. New route at `/api/screenshot` launches headless Chrome, captures a 1280x800 screenshot, saves it to `public/screenshots/{domain}.png`, and serves it as a static file on subsequent requests.
**Why:** Two external screenshot services failed back-to-back. The pattern was clear: we were depending on someone else's free tier for a capability that's trivial to build locally. Puppeteer is one dependency, the route is ~50 lines, and the result is better than any external service — full control over viewport size, no rate limits, no API keys, no "image not authorized" surprises, and screenshots persist as permanent local files.
**How:** `pnpm add puppeteer@latest`, downloaded Chrome for Testing via Puppeteer's CLI, wrote `/api/screenshot/route.ts` that checks for a cached PNG by domain name before launching a browser. Updated `ResearchPanel` to fetch from our own API instead of pointing an `<img>` at an external URL. Shows "Capturing screenshot..." on first load (~5-10s while Puppeteer works), then instant on every subsequent view.
**Outcome:** Screenshots now work reliably for every company. First capture takes a few seconds; every repeat view is instant from disk. The `public/screenshots/` folder accumulates as an asset — 117 company website snapshots that can be browsed, committed, or used elsewhere.
**Decisions:**
- Built our own over finding a third external service — after two failures, the pattern was clear: free screenshot APIs are unreliable and the capability is cheap to own
- Full Puppeteer over puppeteer-core — simpler setup, downloads its own Chrome, no dependency on the user's browser installation
- Stored in `public/screenshots/` so Next.js serves them as static files — no streaming, no base64, just a PNG on disk served by the framework
- Considered SQLite for the growing number of data files (decisions.json, research-cache.json, now screenshots/) but decided against it — the files are working fine, they're human-readable and diffable, and SQLite would add migration complexity for no immediate benefit. Revisit when we need real queries
**Reflection:** This is a micro case study in what AI-assisted development does to the build-vs-buy equation. Two years ago, you'd evaluate screenshot services, compare pricing tiers, maybe write a wrapper. Today the conversation was literally: "These don't work. Can we just build it?" and the answer was yes, in under 5 minutes, with a better result than either paid service would have provided. The meta-lesson: a lot of SaaS tooling exists because building the thing yourself used to be too much hassle. When an AI pair programmer can scaffold the equivalent in minutes, the calculus flips. The threshold for "just build it" drops dramatically. This won't kill every SaaS — complex, stateful, multi-tenant products are a different story — but for utilities like "take a screenshot of a URL"? The wrapper service is dead. You're faster building it than signing up for it.

---

### 2026-02-15 — Deep Research Sprint: From Niche Obscurities to the Agency Angle

**Phase:** Research
**What:** Ran three consecutive research rounds (Rounds 3-6) that pushed the company database from ~117 to ~162 entries. The research evolved significantly across rounds — starting with genuinely obscure niche companies (game modding platforms, robot bartenders, deepfake detection), pivoting to European companies where the *actual job* matches Doug's web stack, and culminating in a completely new category: creative agencies and product studios. Added ~45 new companies spanning game server hosting, mapping tech, pet GPS, AI voice platforms, music streaming, holiday rental AI, open-source BI, genomics, e-bikes, and 7 European agencies.

**Why:** The initial 117 companies covered the obvious targets. But the "obvious" list is what everyone applies to. The goal shifted to finding companies most job seekers wouldn't think to look at: the weird, the wonderful, the genuinely novel. Then a key insight emerged mid-session: many truly interesting companies (autonomous drones, satellite tech, underwater robotics) need embedded/hardware engineers, not TypeScript/React developers. The sweet spot turned out to be *interesting domains where the actual engineering work is Doug's stack*. The agency angle came from Doug directly — realising agencies let you work across multiple verticals instead of committing to one. This was the biggest strategic shift of the day.

**How:** Six rounds of web search across multiple vectors:
- Niche verticals: game hack companies, music automation, autonomous drones, biohacking, AR/VR
- European startups with web stacks: filtered for companies that *need* TypeScript/React/Node, not just interesting companies
- HN "Who is Hiring" Feb 2026: scraped the TypeScript filter for EU companies — found Realm.fun, MiLaboratories, Upway
- Creative agencies: Awwwards winners, FWA nominees, European product studios, dev shops with interesting clients
- Reputation checks integrated with discovery (not separate) — lesson from earlier rounds

Three data destinations updated per company: TypeScript (swipe tool), markdown dossier, CSV.

**Outcome:**
*Rounds 3-4 (Niche):* 27 companies — game modding (mod.io), anti-cheat (BattlEye), AI music (AIVA, Moises), drones (Wingcopter), robot bartenders (Yanu), satellites (ICEYE), brain interfaces (INBRAIN), deepfake detection (Sensity AI), vertical farming (Avisomo). Many scored 3/5 — interesting but too engineering-heavy.

*Round 5 (European + Doug's Stack):* 10 companies — the quality round. MapTiler (Brno, 2hr from Prague!), Tractive (4-day work week, Glassdoor 4.8), ElevenLabs (Growth Engineer — literally Doug's title), Deezer (dream music vertical), Realm.fun (gaming + TypeScript + EU remote), Arbio (AI + holiday rentals, Berlin, €31M), Lightdash (exact stack match: TS/React/Node/Express, YC + Accel).

*Round 6 (Agencies):* 8 entries — ustwo (Monument Valley creators, Glassdoor 4.3), Bakken & Bæck (Glassdoor 4.7, 100% recommend, 5.0 WLB), 14islands (anti-burnout, Awwwards winners, Stockholm), Brainhub (TS/React/Node, NatGeo client, Glassdoor 4.6), Stink Studios (Spotify/Google/Nike, London/Paris/Berlin), Demodern (creative tech, Cologne), Significa (Porto, design-forward), Linear ($1.25B unicorn, EU timezones).

**Decisions:**
- Shifted strategy from "find cool companies" to "find cool companies that need Doug's skills" — the pivotal moment. Robot bartenders are exciting but need embedded C++ engineers, not React developers
- Added agencies as a first-class category — Doug's consultancy background (withSeismic, Contra) makes this natural. Agencies solve the "can't pick one vertical" problem
- Skipped Pitch (Berlin) despite fitting the profile — laid off 2/3 of workforce Jan 2024. Rep: F
- Skipped Creative Fabrica (Amsterdam) — Glassdoor 3.5, micromanagement, CEO chaos
- Kept reputation checks integrated with discovery — much more efficient

**Reflection:** The agency angle was the breakthrough. Doug's career already follows an agency pattern — withSeismic is his consultancy, and his best stories (Contra, Sky, Groupon, MIT, Framer) are client engagements. Agencies like Bakken & Bæck, 14islands, and ustwo let him do creative, varied, product-focused work without committing to one vertical.

The research also revealed a tension: the companies Doug finds most *exciting* (autonomous drones, robot bartenders, brain interfaces) aren't the ones that need his skills. The ones that need his skills (BI tools, dev platforms, e-commerce) are less exciting. The sweet spot is narrow: companies doing genuinely interesting things where the web platform IS the product — Realm.fun (game servers → TypeScript dashboard), MapTiler (maps → TypeScript SDK), Tractive (pet GPS → React app), ElevenLabs (voice AI → growth engineering).

Three standout finds: (1) **Tractive** — 4-day work week, Glassdoor 4.8, Senior Full-Stack role, Austria. Best employer reputation in the entire 162-company database. (2) **Bakken & Bæck** — Glassdoor 4.7, 100% recommend, 5.0 WLB. Five European offices. The agency dream. (3) **ElevenLabs** — Growth Engineer (Website) is literally Doug's specialty. $6.6B unicorn. Almost too perfect — though polarized reviews (C+) add risk.

Total database: ~162 companies. Ready for swipe review and outreach.

---

### 2026-02-15 — Strategy Session: "Don't Ask for Permission to Add Value"

**Phase:** Research → Outreach (transition)
**What:** Stopped mid-research to brainstorm outreach strategy. Doug asked the right question: "Is there an angle I'm missing? Because I need to actually add value — not just say 'hey, I think your company is cool, give me a job.'" This turned into a full strategy session that produced 7 concrete outreach approaches and a prioritized action plan. The core insight: **don't apply — demonstrate. Show up with the receipt, not the request.**

**Why:** 162 companies in a database means nothing if the outreach is generic. Doug's competing against hundreds of other senior engineers for every role. The differentiator isn't the CV (everyone has a CV) — it's proving you can add value *before* they hire you. The question shifted from "where should I apply?" to "how do I make hiring managers say 'we need this person' before I even ask?"

**How:** Inventory of Doug's unique assets → brainstorm of approaches → reality-check against effort/impact → prioritized action plan. Documented everything in `journey/OUTREACH_STRATEGY.md` as a standalone playbook.

**Outcome:** Seven outreach strategies identified, four prioritized for immediate action:

**The Seven Approaches:**

1. **Growth Audits as Cold Outreach** — Pick top 10 targets, do a 30-minute teardown of their public-facing product (website perf, SEO, conversion, onboarding). Deliver as a 1-page PDF or Loom video alongside the application. For ElevenLabs' Growth Engineer role: show growth thinking before they ask. For Realm.fun (bootstrapped): audit their landing page conversion and pricing — small companies feel this immediately.

2. **This Job Search IS the Portfolio Piece** — The AI-powered research pipeline, swipe tool, automated scoring, Puppeteer screenshot service, journey documentation — this entire project demonstrates exactly what growth engineering is. Write it up as an article: "I built an AI system to research 162 companies in a day. Here's what I learned." Publish on personal blog, cross-post to HN/Dev.to. Creates inbound interest. Companies on the list would see it.

3. **Micro-Demos Targeting Specific Companies** — 2-4 hour builds showing domain understanding. For agencies (14islands, Bakken & Bæck): a Three.js creative web experiment, posted on Twitter, tagging them. For ElevenLabs: something creative with their API. For gaming companies: the Source 2 modding platform IS the demo. For MapTiler: build something cool with their TypeScript SDK.

4. **Open-Source Contribution Play** — Lightdash is fully open-source (TypeScript/React/Node) — contribute a PR, then apply as "person who already shipped code in our codebase." Apify has open-source crawling tools matching Doug's scraping specialty. MapTiler has open-source SDKs. One meaningful PR > 100 applications.

5. **The "Forward Deployed Engineer" Pitch** — Doug's withSeismic career IS this: parachute into a client's hardest problem, understand it, ship the solution. Contra, Sky, Groupon, MIT, Framer — every engagement follows this pattern. Package as a narrative for agencies and startups that need someone who can do client-facing technical work.

6. **Speculative "What I'd Build" Documents** — For top 3-5 targets, write a 1-pager: "If I joined [Company] as Lead Engineer, here's what I'd build in the first 90 days." Reference their actual product, actual gaps, actual tech stack. Shows research depth, outcome thinking, and opinions.

7. **Growth Teardown Livestream (Far-Fetched)** — Pick 5 companies, do a live teardown of their growth funnels on YouTube/Twitter. High risk/high reward. Establishes authority as the growth engineering voice in European startups. Requires confidence and credibility — but 15 years and 3 exits provide that.

**Prioritized First Moves:**
1. Write the article about this job search system (80% written in the journey log already)
2. Pick 5 top targets, do mini growth audits (30 min each, single-page output)
3. Ship the Source 2 modding platform (even a beta — unique differentiator for gaming)
4. One Lightdash PR (instant credibility: "I've already contributed to your codebase")

**Decisions:**
- Strategy documented as a standalone playbook (`journey/OUTREACH_STRATEGY.md`) not just a log entry — this needs to be a living reference document during the outreach phase, not buried in chronological logs
- Chose "demonstrate, don't apply" as the core philosophy over traditional application flows — Doug's background supports this (he's been doing it his whole career through withSeismic)
- Prioritized the article first because it has the widest blast radius — one piece of content can reach all 162 companies at once, while growth audits are 1:1
- Decided growth audits should be 30 minutes max per company — enough to show insight, not so much that it's free consulting

**Reflection:** This might be the most important entry in the log. Everything up to this point was preparation — building the database, scoring companies, checking reputations. But the actual *outcome* of a job search depends on how you show up, not how much research you've done.

The key realization: Doug's career already demonstrates the exact pattern he should use for outreach. withSeismic's entire model is "I show up, understand your problem, and build the solution." The job search should follow the same playbook — show up with value already created, not with a request for an interview.

The article about this job search system is the highest-leverage move because it's meta: it's a growth engineering project about finding a growth engineering job, built with the exact tools and thinking that a growth engineer would use. It's the proof and the pitch in one artifact.

The tension from earlier research (exciting companies vs. companies that need Doug's skills) resolves here too. The growth audit approach works regardless of domain — you're demonstrating *how you think about growth problems*, which transfers across any vertical. An ElevenLabs audit and a Tractive audit look very different, but they both demonstrate the same muscle.

---

### 2026-02-15 — Two Engineers, One Code Server, Ten Claude Threads

**Phase:** Setup
**What:** Undocumented until now: the entire project was built as a two-person operation. Doug and his girlfriend Inna — both software engineers — worked from two MacBooks connected to a single shared code-server (VS Code), using one Claude Code account. At any given time, 6 to 10 concurrent Claude threads were running in parallel. Doug frontloaded the work on his local machine and set up the environment so Inna could jump in seamlessly.
**Why:** A job search that involves building a research pipeline, a swipe tool, custom skills, browser agents, data enrichment, and strategy documentation is too much for one person to orchestrate alone — even with AI. Having two engineers coordinating the Claude swarm meant faster iteration, better quality control (one person can review while the other generates), and the ability to run parallel workstreams (e.g., Inna running research agents while Doug built UI features). It also meant the shared code-server was the single source of truth — no branch conflicts, no "which version is current?" problems.
**How:** The setup itself had a journey. First instinct was Google Sheets — which lasted about three seconds before feeling archaic and wrong for a project that was clearly going to involve code, agents, and tooling. Asked Claude for suggestions. Syncthing came up as an option but Inna didn't want to install anything on her laptop — fair enough. Then the obvious answer: they're on the same network. Code-server. One VS Code instance running on Doug's machine, accessible from Inna's MacBook via the browser. Perfect — zero installation on her end, shared filesystem, shared terminal, shared Claude Code account. Coordination was verbal (same room) rather than through PRs or async tools. The Claude threads were distributed across tasks: some running research agents, some building features, some doing reputation audits, some debugging. At peak, 10 threads operating concurrently — effectively a two-human, ten-AI engineering team.
**Outcome:** The entire day's output — 162 companies researched and scored, a full swipe review tool built, reputation audits completed, screenshot service built, research panel shipped, outreach strategy documented, and this journey log written — was produced in a single session by this setup. The throughput would not have been possible with a single person managing Claude threads sequentially.
**Decisions:**
- Google Sheets was the first idea and immediately rejected — felt archaic for a project that was going to be code, agents, and tooling from minute one
- Syncthing was suggested by Claude but rejected because Inna didn't want to install anything on her laptop — a reasonable constraint that turned out to be the right filter
- Code-server was the winner: same network, zero installation on Inna's end, full VS Code in the browser, shared filesystem and terminals. Perfect fit
- One Claude Code account rather than two — simpler coordination, single billing, and avoids duplicate work across accounts
- Verbal coordination over written (Slack, comments) — they're in the same room, and the speed of "hey, I'm about to edit the companies file" beats any async tool
**Reflection:** This is the part of the story that doesn't show up in git logs or tool outputs. The narrative of "AI-powered job search" is incomplete without acknowledging it was a collaborative effort — two people orchestrating a swarm of AI agents together. The setup itself is worth documenting as a pattern: shared code-server + shared AI account + co-located engineers is a surprisingly effective multiplier. It's pair programming, but instead of two people on one problem, it's two people directing ten parallel AI streams across different problems. The bottleneck was never the AI — it was human attention. Having two sets of eyes meant twice the capacity to review, redirect, and quality-check the output. Inna's involvement also brought a different perspective to the research — catching things Doug might have glossed over, questioning assumptions, and keeping the strategy honest.

---

### 2026-02-15 — Outreach Machine: Auto-Assessment, Tiering, and Three New Skills

**Phase:** Research → Outreach (transition)
**What:** Built the complete outreach infrastructure in a single session. Four major deliverables: (1) Auto-assessed 96 unreviewed companies based on Doug's established decision patterns, bringing the total to 144 reviewed companies (50 yes, 14 maybe, 80 no). (2) Created a comprehensive tier list (`journey/TIER_LIST.md`) ranking all 50 "yes" companies into three priority tiers. (3) Built three new Claude Code skills — `/company-deep-dive`, `/outreach-strategy`, and `/craft-outreach` — forming a complete pipeline from research to ready-to-send messages. (4) Created the directory structure for dossiers, strategies, and outreach materials.

**Why:** Having 162 companies in a database is useless without a system to act on them. Doug's philosophy — "don't apply like everyone else, apply like someone who already understands their problems" — requires deep research per company, a personalized strategy, and carefully crafted messages. Doing this manually for 50 companies would take weeks. The skill pipeline automates the research-heavy parts while keeping Doug's voice and judgment in the loop.

**How:** Parallelized everything. While auto-assessment and tiering ran in the main thread, three background agents built the skills simultaneously. Auto-assessment used Doug's existing 48 decisions as training data — patterns like "music tech → yes," "D/F reputation → no," "wrong stack → no," "B2B SaaS → no" were applied to the 96 unseen companies. Tiering used a 2D matrix of fit score × reputation × strategic value.

**Outcome:**

*Tier 1 — Dream Roles (7):* Apify (Prague, scraping = Doug's specialty), Photoroom (Paris, Glassdoor 4.9), Framer (Amsterdam, prior client relationship), Mews (Prague unicorn), Overwolf (gaming platform, fitScore 5), Bakken & Baeck (best-rated agency in EU), Tractive (4-day work week, Glassdoor 4.8). Each gets a proof-of-work project.

*Tier 2 — Strong Matches (15):* XCEED, Deezer, Contra, Leetify, Musixmatch, MapTiler, Realm.fun, Splice, Brainhub, Moises AI, Linear, Arturia, ustwo, 14islands, Supercell. Personalized outreach with tailored CV.

*Tier 3 — Worth Applying (28):* Quality applications but lighter touch.

*Three Skills Built:*
- `/company-deep-dive` — 6-step research process producing a dossier with job postings, recent news, tech deep dive, key contacts, pain points, and outreach angles. Output: `journey/dossiers/{slug}.md`
- `/outreach-strategy` — 10-step process reading the dossier and producing channel selection, contact identification, angle mapping, proof-of-work assessment, and outreach sequence. Output: `journey/strategies/{slug}.md`
- `/craft-outreach` — 7-step process producing ready-to-send messages with Doug's actual voice, CV tailoring, portfolio selection, and follow-up drafts. Includes extensive "Doug's Voice" section with good/bad examples and quality checks (specificity, voice, length, truth, cringe). Output: `journey/outreach/{slug}.md`

**Decisions:**
- Auto-assessed rather than requiring manual review of 96 more companies — Doug had reviewed 48 and the patterns were clear enough to extrapolate
- Three separate skills rather than one monolithic workflow — each can be run independently, allows Doug to iterate at any stage
- Tier 1 limited to 7 companies — small enough to give each full investment (deep dive, proof-of-work, personalized everything)
- Skills check for prerequisites — deep-dive checks company exists in database, strategy checks for dossier, craft-outreach checks for strategy. Clear error messages if something's missing

**Reflection:** This is the moment the project shifts from "research tool" to "outreach machine." The three-skill pipeline means Doug can go from "I've never heard of this company" to "here's a personalized message from someone who clearly understands your product and problems" in about 15 minutes of agent execution. The auto-assessment was the riskiest move — algorithmically deciding yes/no for 96 companies — but Doug's decision patterns were consistent enough that the model could replicate them. The tiering forces prioritization: instead of "apply to all 50," it's "invest deeply in 7, personalize for 15, apply efficiently to 28." Geographic and vertical clustering in the tier list also enables efficiency — one music demo covers 14 companies, one gaming proof-of-work covers 7.

---

### 2026-02-15 — First Deep Dive: Rankacy (Doug's Request)

**Phase:** Outreach
**What:** Doug specifically requested research on Rankacy (https://rankacy.com/), a Czech AI gaming analytics startup. Ran the full pipeline: added Rankacy to the company database (ID 147), marked as "yes" in decisions, and produced the first deep dive dossier using the newly built `/company-deep-dive` skill. This was the first real test of the dossier skill.

**Why:** Rankacy ticks multiple boxes — Czech-based (Ostrava, 2hr from Prague), gaming vertical (one of Doug's top interest areas), AI-powered analytics, actively hiring founding engineers. Doug found them and wanted the full treatment.

**How:** Comprehensive web research across the company's website, careers page, LinkedIn profiles, Product Hunt, Trustpilot, Steam Workshop, POSITIV magazine feature, and GitHub. The agent discovered significantly more than a surface scan would have: proprietary GPRT model trained on 200TB+ of gameplay data, published CLaRa research paper on cost-effective LLM function calling, CEO Michael Blazik (former lawyer with sports background in China), CTO Miloslav Szczypka (PhD researcher and lecturer at VŠB-TUO), team of ~30 mostly from the same university, expanding from gaming into B2B behavioral analytics via rankacy.ai.

**Outcome:**
- Added to `companies.ts` as ID 147 (fitScore 4, category Gaming, hybrid work model)
- Added `"147": "yes"` to `decisions.json`
- Dossier written to `journey/dossiers/rankacy.md` — includes 8 current job openings, 6 key contacts with LinkedIn profiles, 5 pain points mapped to Doug's experience, 3 outreach angles (one per key contact), and a 90-day plan sketch
- Priority Tier: 2 — strong vertical and geographic fit, but Python-heavy backend and no current growth/full-stack TypeScript role means Doug would need to pitch a new position

**Key Finding:** Rankacy's biggest need isn't more AI engineers (they have those) — it's growth engineering. They have 50K users on a EUR 3.99-7.99/mo subscription. Doug's experience taking Patrianna from 0 to 1M players is directly relevant. The rankacy.ai B2B arm needs someone who understands how to package data products for enterprises — Doug's getBenson experience (25M sessions/month, 80+ brands onboarded) maps here perfectly.

**Decisions:**
- Assigned Tier 2 not Tier 1 — great fit on vertical and location, but the stack mismatch (Python vs TypeScript) and the need to pitch a custom role adds friction
- Recommended approaching Michal Fogelton (Head of Talent) first, with Michael Blazik (CEO) as the alternative — company is small enough that the CEO is still involved in hiring, and Doug's seniority warrants a direct approach
- Noted the Founding Back-End Engineer role requires 6 months onsite in Ostrava — a constraint worth discussing but not a dealbreaker given the 2hr train from Prague

**Reflection:** This was the first real test of the `/company-deep-dive` skill, and it produced a genuinely useful dossier. The key contacts, pain points, and outreach angles are specific enough to write personalized messages from — not generic "I love your mission" boilerplate. The research uncovered details (CLaRa paper, GPRT model, university partnerships, POSITIV magazine feature) that wouldn't appear in a standard job search. This is exactly the kind of intelligence that makes outreach feel like "someone who already understands our problems" rather than "another applicant."

---

### 2026-02-15 — 50 Dossiers in One Evening: The Deep Dive Sprint

**Phase:** Outreach
**What:** Ran `/company-deep-dive` across all 50 "yes" companies — every company in Tier 1, Tier 2, and Tier 3. Launched 10 parallel Opus agents, each handling a batch of 3-7 companies. 44 out of 50 dossiers completed before agents hit the API usage limit. Relaunched 2 more agents for the remaining 6 companies. Final result: 51 dossiers in `journey/dossiers/` (50 tiered + Rankacy).

**Why:** The tier list told us *who* to pursue. The dossiers tell us *how*. Each dossier contains current job openings, recent news, tech stack analysis, 2-5 key contacts with LinkedIn profiles, pain points mapped to Doug's experience, a first-90-days sketch, and 2-3 ready-to-use outreach angles. This is the intelligence layer that turns generic applications into "someone who already understands our problems."

**How:** 10 agents running in parallel, grouped by tier:
- 2 agents for Tier 1 (7 companies, deepest research)
- 3 agents for Tier 2 (15 companies)
- 5 agents for Tier 3 (28 companies)

8 of 10 agents hit the usage limit mid-work ("You're out of extra usage · resets 10pm") but had already written most of their dossiers. Only the Tier 3 Music batch 2 (FabFilter, Kilohearts, Sonible, u-he, Spitfire Audio) completed fully within limits — it also produced the best comparative summary, upgrading Spitfire Audio from Tier 3 to Tier 2.

The 6 missing companies (Leetify, Musixmatch, Moises AI, Supercell, Recraft, Raycast) were caught by 2 follow-up agents. Total: 51 dossiers written.

**Outcome:**

*Immediate Hots — Companies with live roles and clear action paths:*
- **Raycast** — Design Engineer role (EUR 100-135K), perfect stack (Next.js/TS), fully remote from Prague. Agent recommended upgrading to borderline Tier 1. `raycast/ray-so` repo has 7 open issues in Next.js/TypeScript — PR opportunity before applying.
- **Musixmatch** — 2 live engineering roles right now: Frontend React Developer and Senior Backend JavaScript Engineer. $67.9M revenue, profitable. MIT-licensed SDK (101 stars, 6 open issues) offers a contribution path.
- **Spitfire Audio** — Active Software Engineer role. WebView/JUCE architecture bridges to Doug's web expertise. Agent upgraded from Tier 3 to Tier 2.
- **Moises AI** — No live web role but $40M Series A just closed. openDAW GitHub fork (TypeScript web DAW, updated 2 days ago) is the single highest-value PR opportunity across all 50 companies. Were hiring web devs as recently as Jan 2025.
- **Supercell** — D2C Store growth story (112% organic traffic increase, $42M+ app store commission savings) maps perfectly to Doug's Patrianna experience. Web roles appear recently filled but 30% headcount growth means new ones are coming. Samuel Klinkmann (Community Tech Lead) identified as key contact.

*Cost Learning:* All 50 companies were researched using Opus. This was expensive. The structured skill template does most of the heavy lifting — Sonnet could handle Tier 2-3 dossiers with minimal quality loss. Future batch runs (outreach strategies, message crafting) should use Sonnet for Tier 2-3, reserving Opus for Tier 1 only.

*Skill Update:* Added a "GitHub Contribution Analysis" section to the `/company-deep-dive` skill mid-sprint. Future dossiers will include: open issues in Doug's stack, specific PR ideas, MIT-licensed component opportunities, and a contribution opportunity rating (High/Medium/Low/None). This was Doug's insight — the open source angle (submitting a PR before applying) is one of the strongest outreach moves, especially for companies with MIT-licensed SDKs or developer tools.

**Decisions:**
- Ran all tiers at once rather than starting with Tier 1 only — velocity matters when you're job searching, and the agents can work in parallel
- Used Opus for everything — in hindsight, Sonnet for Tier 2-3 would have been the right call. Saved this as a convention for future runs
- Updated the skill mid-sprint — the currently running agents didn't get the GitHub analysis update, but all future deep dives will include it
- Created `journey/IMMEDIATE_ACTIONS.md` as a living action list pulled from dossier findings — separates "what to do this week" from the dossier archive

**Reflection:** This is 50 personalized intelligence dossiers produced in a single evening. In a traditional job search, this level of research might take 2-3 weeks of full-time work — visiting each company's careers page, reading their engineering blog, finding contacts on LinkedIn, analyzing their tech stack, mapping pain points to your experience. The AI pipeline compressed it into hours. But the real value isn't the speed — it's the consistency. Every dossier follows the same rigorous structure, so nothing gets missed. The immediate hots that surfaced (Raycast, Musixmatch, Moises AI, Spitfire Audio) weren't on the radar as urgent before the deep dives. The research changed the priority ordering — Raycast went from "Tier 3, developer tools" to "borderline Tier 1, apply this week." That's the point of doing the research before the outreach.

The cost lesson is real though. 12 Opus agents doing web research is powerful but expensive. The skill templates are structured enough that Sonnet follows them well — the intelligence is baked into the process, not the model. Tier 1 deserves the extra reasoning power for nuanced angles; Tier 2-3 gets 90% of the quality at a fraction of the cost.

---

### 2026-02-15 — Company Detail Pages: From Raw Markdown to Browsable Dossiers

**Phase:** Outreach
**What:** Added dynamic `/company/[slug]` detail pages to the web app. Each of the 147 companies now has its own URL (e.g., `/company/apify`, `/company/bakken-and-baeck`) showing the full company profile — metadata, decision status, and the rendered dossier markdown — all in one place. Company names in both the swipe cards and results list are now clickable links to their detail pages.

**Why:** We had 51 dossiers sitting in `journey/dossiers/` as raw markdown files — rich intelligence that was only accessible by opening files in a code editor. Doug needed a way to browse company research in context: see the company metadata from `companies.ts`, the yes/no/maybe decision from `decisions.json`, and the deep-dive dossier all on one page. This makes the research actionable — when it's time to write outreach for a company, everything is one click away from the swipe tool instead of hunting through filesystem paths.

**How:** Next.js App Router server components with filesystem reads — no new API routes needed. Three new files:
- `app/lib/slugify.ts` — converts company names to URL-safe slugs, handling edge cases like `&` → `and`, dots, and special characters (tested against all 51 existing dossier filenames)
- `app/lib/dossier.ts` — reads dossier markdown from `journey/dossiers/{slug}.md` using the same `process.cwd() + ../..` pattern as the decisions API
- `app/company/[slug]/page.tsx` — server component that finds the company by slug, loads the dossier and decision, and renders everything

Installed `react-markdown` and `remark-gfm` for rendering dossier content with full GFM support (tables, strikethrough, task lists). Added ~200 lines of CSS for the detail page layout, markdown typography, table styling with horizontal scroll on mobile, decision badges (color-coded yes/no/maybe/not-reviewed), and a friendly empty state for companies without dossiers.

**Outcome:** Every company in the database now has a browsable detail page. Companies with dossiers show the full rendered research — headings, tables, lists, links, code blocks, blockquotes — styled to match the dark theme. Companies without dossiers show a helpful empty state with the command to generate one (`/company-deep-dive {name}`). The swipe tool's company names are now links, so the workflow is: swipe through companies → click one that interests you → read the full dossier → back to swiping. Clean build, zero errors.

**Decisions:**
- Server components over client components — dossiers are static markdown files, no interactivity needed. Server components read files directly without API routes, simpler architecture
- `react-markdown` + `remark-gfm` over alternatives (MDX, next-mdx-remote) — dossiers are pure markdown, not React components. No need for MDX complexity
- Shared `slugify` utility instead of duplicating logic — used by both the detail page (to match URL slug to company) and the home page (to generate links)
- 800px max-width for detail pages vs 640px for swipe cards — dossiers have tables and dense content that need more horizontal space

**Reflection:** This is an infrastructure piece that makes the research *usable*. The dossiers were always the most valuable output of the deep dive sprint — 51 files containing job openings, key contacts, pain points, outreach angles — but they were trapped in the filesystem. Now they're one click from the swipe tool. The empty state is a nice touch too — it creates a clear call to action for the ~96 companies that don't have dossiers yet. Small feature, high utility.

---

### 2026-02-15 — The Article: "Write Me a 6,500-Word Case Study"

**Phase:** Outreach
**What:** Used the article-writer skill pipeline to produce "I Built an AI-Powered System to Research 162 Companies in a Day" — a 6,452-word case study covering the full journey from broken job boards to a working outreach machine. Seven sections, 44+ external links, 20+ real-world examples. The article IS outreach approach #2 from the strategy playbook — the one with the widest blast radius.

**Why:** Doug's honest about this one: it's not the proudest piece of writing. It's an AI-assisted article about an AI-assisted job search, and that self-awareness is part of the calculation. But the strategic logic is sound. Google needs to see constant traffic on Doug's domain — a dormant personal site is invisible. The article creates SEO surface area for terms like "AI job search," "company research automation," "growth engineering career." More importantly, in 2026, AI systems are reading and indexing content. LLMs crawling the web for training data or answering questions about job searching don't care about LLM-isms in the prose — they care about signal density, specificity, and structure. A 6,500-word case study packed with real company names, specific numbers, named tools, and a clear narrative arc is high-signal content regardless of how it was produced. It's a win on both fronts: human readers get a genuine story with useful insights (Glassdoor manipulation, build-vs-buy, the skills-excitement gap), and machine readers get dense, structured, reference-rich content that indexes well.

**How:** Full article-writer pipeline across multiple sessions:
1. **PRD phase** — defined the case-study format, 5,000-word target, 6 sections, narrative arc, quality gates
2. **Research phase** — 6 parallel agents produced section-specific research files (hook.md through lessons.md), totaling 170+ sources across 1,685 lines of research notes
3. **Outline phase** — mapped research to narrative structure with opening hooks, key beats, data points, and transitions per section
4. **Write phase** — first draft at 3,068 words (below 4,000 minimum)
5. **Eval phase** — ran 8 quality gates: word count FAIL, 4 sections below 500-word minimum FAIL, links/examples/prose/headers/narrative all PASS
6. **Iteration 1** — expanded 4 failing sections using research files, hit 4,000 minimum
7. **Iteration 2** — pushed from 4,000 to 5,000 target with targeted expansions across all 6 sections
8. **Review phase** — editorial pass, fact-check against research files, transition smoothness, no edits needed
9. **Major expansion** — added Section 5 "Forty-Five Minutes and an Outreach Machine" covering auto-assessment, tier list, 51 dossiers, 3-skill pipeline, 7 outreach approaches, hot opportunities, and browsable detail pages. Rewrote Puppeteer section to reflect actual timing (under 2 minutes, one-shot, paradigm shift framing). Updated closing to reference full pipeline. Final: 6,452 words across 7 sections.

The research phase was the most expensive — each section got its own agent doing 5+ web searches and producing structured notes. But the research files then served as raw material for every subsequent phase. The writing itself was iterative: draft, evaluate against gates, expand the failures, re-evaluate. Three iterations to hit minimum, one more to hit target, then the structural expansion once Doug flagged that the article stopped at the research phase and missed the entire outreach machine.

**Outcome:**
- 6,452-word case study, 7 sections, 44+ external links, 20+ real-world examples, 100% prose ratio
- Covers the full journey: broken job boards → research pipeline → swipe tool → reputation scoring → Puppeteer screenshot service → outreach machine (auto-assessment, tiering, 51 dossiers, 3-skill pipeline, 7 approaches) → findings (Glassdoor lies, skills-excitement gap, agency insight) → closing (demonstrate don't apply)
- Publish targets: personal blog (SEO), HN (reach), Dev.to (developer audience), LinkedIn (professional network)
- The article itself is meta-outreach: companies on the list who read it see themselves named, see the research depth, and see a candidate who already understands their landscape

**Decisions:**
- Case-study format over long-form — 5,000 words (later 6,500) hits the sweet spot between substantive and readable. Long-form at 10,000 words would be self-indulgent for a job search article
- Used the full article-writer pipeline rather than writing freehand — the quality gates caught real issues (sections too short, word count below minimum) that would have shipped as-is without the evaluation loop
- Added the outreach machine section after the initial "complete" — the article was technically done at 5,000 words but strategically incomplete without the second half of the day's work (dossiers, tiering, strategy, hot opportunities)
- Rewrote Puppeteer from "5 minutes" to "under 2 minutes, one-shot" — Doug's correction. The honest detail is more impressive and more accurate: you complain to an AI, and a working feature appears in under 2 minutes. That's the paradigm shift story, not "I built it quickly"
- Kept it honest about being AI-assisted — no pretense that this was hand-crafted prose. The readers who matter (hiring managers, engineers) will see the substance. The readers who'd dismiss it for being AI-assisted weren't going to hire Doug anyway

**Reflection:** There's a tension here that Doug named directly: this isn't the proudest piece of writing. It's functional content. But the strategic calculus is clear — a dormant domain is invisible, and this article creates surface area across search, social, and AI indexing. The quality gates forced a minimum standard (external links, real examples, narrative flow, prose ratio) that keeps it above the SEO slop threshold. It's specific, it names real companies and real numbers, and the insights are genuine — Glassdoor manipulation is real, the skills-excitement gap is real, the build-vs-buy inversion is real.

The meta-irony runs deep: an AI-assisted article about an AI-assisted job search, where the article itself is one of the AI-generated outreach strategies, published to a web increasingly read by AI systems. But irony doesn't invalidate utility. Better that Google sees constant traffic on Doug's domain than silence. Better that AI crawlers index a dense, specific case study than nothing. And the humans who do read it — the hiring managers at Apify, Photoroom, Raycast, Musixmatch — will see a candidate who already mapped their landscape, scored their reputation, and built infrastructure to approach them intelligently. That signal cuts through regardless of how the prose was produced.

---
