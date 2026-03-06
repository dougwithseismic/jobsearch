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

### 2026-02-16 — Slonik Deep Dive: Finding the Perfect PR for Contra's CTO

**Phase:** Outreach
**What:** Conducted a comprehensive analysis of Gajus Kuizinas's (Contra CTO) open source portfolio to identify the highest-value contribution opportunity. Mapped all 333 repos, verified all 26 open Slonik issues against live GitHub data, researched community sentiment across Reddit/HN/blogs, and identified Issue #719 (DISCARD ALL on connection pool return) as the ideal PR target — an enhancement Gajus himself approved four months ago that nobody's built yet.

**Why:** Contra is Doug's warmest lead — prior client relationship through withSeismic, exact stack match (React/TS/Next.js/Node/PostgreSQL), remote-first, well-funded ($45M). But no engineering roles are currently posted. The outreach needs to create demand, not respond to it. Contributing to Gajus's open source work creates a technically credible warm introduction: "I submitted a PR for the pool cleanup feature you mentioned in #719" hits differently than any cold message. This is the "demonstrate, don't apply" philosophy applied to its most important target.

**How:** Two parallel research tracks:
1. **GitHub deep dive** — Browser agent explored github.com/gajus, cataloguing repos by downloads, stars, activity, and open issues. Found that Gajus's top projects by volume aren't the famous ones: roarr (5.36M weekly downloads), global-agent (4.78M), eslint-plugin-jsdoc (4.65M) dwarf Slonik's 117K. But Slonik (4.9K stars, 1,196 releases, updated 4 days ago) is the flagship — it's what Contra actually uses.
2. **Community sentiment research** — Web search agent trawled Reddit, HN, blogs, and Stack Overflow for Slonik pain points. Uncovered a damning pattern: the community loves Slonik's ideas (SQL-first, runtime Zod validation, type safety) but is frustrated by the execution (frequent breaking changes, forced Zod migration in v33, dismissive responses to gradual adoption requests). A company literally forked Slonik (Silverhand/Logto) rather than deal with the upgrade path. Kysely now has 20x the downloads. The market has moved.

Then verified every open issue against live GitHub:
- **#719** (DISCARD ALL) — Gajus responded "This is a reasonable improvement" Nov 6, 2025. Zero PRs submitted. This is it.
- **#660** (connection leak on error) — real production pain, connection never releases. Backup target.
- **#569** (DISABLE_TIMEOUT silently uses 10s) — open almost 2 years, straightforward default value bug.
- **#743** (undefined bypasses timeout defaults) — classic config spread bug.
- **#740** (sql.unsafe returns `any`) — already has a linked PR (#741), might step on toes.
- **#706** (Zod peer deps) — dependency management, not a code contribution.
- **#751** (transformRowAsync parallelization) — newest, complex internals.

**Outcome:**
- Full map of Gajus's open source: 333 repos, 2.6K followers, 20M+ weekly NPM downloads across portfolio
- Slonik community analysis: loved for ideas, frustrated by breaking changes, market share eroding to Kysely/Drizzle/postgres.js
- Primary PR target: Issue #719 — approved enhancement, zero competition, addresses Slonik's weakest area (connection pooling)
- Backup targets: #660 (hero play — production connection leak), #569 (easy win — wrong default value)
- Also identified Liqe (Lucene-like parser, 670 stars, 13 issues) as an alternative lower-friction contribution — ReDoS protection needed, broken type definitions

**Decisions:**
- Chose #719 over easier bugs (#569, #743) — an approved enhancement shows initiative and taste, not just bug-fixing ability. Gajus already said yes to the concept; now someone needs to build it
- Chose Slonik over Liqe — Slonik is Contra's actual database layer and Gajus's pride project. A contribution there carries more weight than a fix to a utility library
- Chose contribution over building something new (like a Slonik migration tool or postgres.js wrapper) — the goal is a warm introduction to Gajus, not a competing project. The PR creates a conversation; a competing tool creates distance
- Logged the community sentiment findings (breaking changes, Kysely migration, Silverhand fork) as context for the outreach strategy — understanding Slonik's market position helps frame Doug's contribution as supporting the project, not criticizing it

**Reflection:** This is the most surgically targeted outreach prep so far. Instead of "apply to Contra and hope," the plan is: build a specific feature that the CTO already approved → submit the PR → reference it in outreach alongside the existing withSeismic relationship. Three touchpoints: prior client work, shared open-source values (Doug maintains NPM packages too), and a concrete code contribution. The community research also revealed something useful for the outreach angle — Slonik is losing market share and Gajus is actively maintaining it (release 4 days ago, 1,196 total releases). A quality contributor who shows up and ships is valuable to a maintainer watching competitors grow. Doug isn't just asking for a job; he's showing up as someone who strengthens Gajus's ecosystem. That's the play.

---

### 2026-02-16 — First Open Source PR: ColdFusion Support for Raycast's ray.so

**Phase:** Outreach
**What:** Spotted issue #324 on Raycast's `ray-so` repository — a feature request for ColdFusion (CFML/CFScript) syntax highlighting that had been open since November 2025. Researched the codebase, sourced a compatible TextMate grammar, implemented the feature, verified it locally, and submitted PR #407. The whole thing — from reading the issue to a merged-ready PR — took a single session.

**Why:** The 50-dossier sprint flagged Raycast as a hot opportunity: Design Engineer role (EUR 100-135K), exact stack match (Next.js/TypeScript), fully remote from Prague, and the dossier specifically noted that `raycast/ray-so` had open issues in Doug's wheelhouse. This is the open-source contribution play from the outreach strategy — ship code in a company's codebase before you ever apply. A merged PR to ray.so is a warm intro to Raycast's engineering team: "I've already contributed to your product" hits differently than "I'm a fan of Raycast."

**How:** End-to-end implementation:
1. Pulled the issue details via `gh` CLI — ColdFusion user requesting CFML/CFScript syntax support, maintainer (samuelkraft) confirmed they accept TextMate grammars and would approve a PR
2. Cloned ray.so, explored the architecture: Shiki v1.0.0 for syntax highlighting, languages registered in a single `languages.ts` file via dynamic imports of `shiki/langs/*.mjs` modules
3. Confirmed Shiki doesn't bundle a ColdFusion grammar (checked all 300+ bundled languages — no match)
4. Researched three grammar sources: the official TextMate ColdFusion bundle (XML, stale since 2009), ilich/vscode-coldfusion (XML, unmaintained), and KamasamaK/vscode-cfml (JSON, MIT licensed, comprehensive). Chose vscode-cfml — already in Shiki-native `.tmLanguage.json` format, covers both tag-based CFML and CFScript, self-contained with no external grammar dependencies
5. Created the first custom grammar in the project: `grammars/cfml.tmLanguage.json` (606KB grammar file) + `grammars/cfml.ts` (thin wrapper exporting in Shiki's expected format with MIT attribution)
6. Added 4-line entry to `languages.ts` — alphabetically placed, dynamically imported so it only loads when selected
7. Ran the full PR review: verified alphabetical ordering, import path conventions, TypeScript strictness, module format matching Shiki's shape, license compatibility (MIT ↔ MIT), and ESLint/Prettier compliance via lint-staged
8. Spun up dev server, verified CFML appears in the language dropdown and highlights both tag-based and script-based ColdFusion correctly
9. Forked to `dougwithseismic/ray-so`, pushed branch `feat/cfml-syntax-support`, created PR #407 on `raycast/ray-so`

**Outcome:**
- PR #407 submitted: https://github.com/raycast/ray-so/pull/407
- 3 files changed, 15,507 insertions (mostly the grammar JSON)
- All lint-staged checks passed (ESLint + Prettier)
- Establishes a reusable pattern for adding custom grammars that Shiki doesn't ship — first custom language in the project's history
- Closes issue #324 which had been open for 3+ months

**Decisions:**
- Chose vscode-cfml grammar over the TextMate official bundle — the official bundle is XML format (needs conversion), hasn't been updated since 2009, and has less comprehensive scope coverage. vscode-cfml is already JSON, MIT licensed, and covers both CFML and CFScript
- Created a `grammars/` directory with a wrapper module rather than trying to inline the grammar — establishes a clean pattern for future custom grammars, and the 606KB JSON needs to be code-split via dynamic import
- Added license attribution in the wrapper file (`MIT (c) 2017 KamasamaK`) — the PR review flagged this as the only missing piece, and MIT requires the copyright notice in substantial portions
- One entry for "CFML" rather than separate entries for "CFML" and "CFScript" — the grammar handles both syntaxes in a single scope, and splitting would create confusion about which to select

**Reflection:** This is the open-source play working exactly as designed. The dossier identified ray.so as having open issues in Doug's stack. The issue was a perfect target: clearly defined, maintainer-approved, requires real engineering work (not a typo fix), and the solution demonstrates competence with the exact technologies Raycast uses (Next.js, TypeScript, Shiki, TextMate grammars). The contribution is genuine — ColdFusion developers actually need this feature — which matters. Performative PRs that exist only to get noticed are transparent and counterproductive. This one solves a real problem that a real user requested.

The pattern is now proven and repeatable: read the dossier → find open issues → pick one that's substantive but scoped → ship it → reference it in outreach. Musixmatch's SDK, Moises AI's openDAW fork, and Lightdash's entire codebase are all sitting there with the same opportunity. Each PR is both a genuine contribution and a warm introduction to the engineering team.

---

### 2026-02-16 — Slonik PR #756: deferResetConnection for Contra/Gajus Outreach

**Phase:** Outreach
**What:** Implemented and submitted PR #756 to gajus/slonik adding a `deferResetConnection` option that runs DISCARD ALL in the background after connection release, addressing issue #719.
**Why:** Gajus Kuizinas (Contra CTO) is the maintainer of Slonik, his flagship open-source project. Contra is Tier 1. The strategy: demonstrate technical competence directly in Gajus's codebase, on an issue he himself approved as "a reasonable improvement" (Nov 6, 2025), then reference the PR in outreach. This is the "demonstrate, don't apply" philosophy at its most targeted — contributing to the CTO's personal project in the exact area (connection pooling) where Slonik has received the most community criticism.
**How:** Deep-dived into Slonik's architecture across the monorepo — traced the full connection release flow from `createConnection.ts` through `connection.release()` to `internalRelease()` in the driver factory. The implementation adds a deferred execution path: when `deferResetConnection: true`, `release()` resolves immediately (unblocking the caller), fires `resetConnection` in the background via an async IIFE, keeps the connection in `PENDING_RELEASE` state (via `isResetting` flag) to prevent premature reuse, and emits the `release` event only after the reset completes. Failed resets destroy the connection. `destroy()` coordinates with deferred resets via the graceful termination timeout. Wrote 8 unit tests covering the full lifecycle. All existing 40 pool tests continue to pass.
**Outcome:** PR #756 submitted to gajus/slonik (https://github.com/gajus/slonik/pull/756). Changes span 4 source files across 2 packages (`@slonik/driver` and `slonik`), plus changeset and tests. The PR includes comprehensive documentation in the body explaining the mechanism, usage example, and test coverage.
**Decisions:**
- Chose issue #719 over #660 (connection leak) and #569 (DISABLE_TIMEOUT) — #719 had explicit maintainer approval, was scoped enough for a single PR, and targets Slonik's weakest area (connection pooling)
- Implemented at the driver layer (`createDriverFactory.ts`) rather than the pool or connection layer — this is where `resetConnection` actually executes, and it keeps the change minimal
- Made `deferResetConnection` opt-in (default `false`) rather than changing the default behavior — respects existing users, no breaking change, and lets the maintainer decide if it should ever become the default
- Used `isResetting` flag + `PENDING_RELEASE` state rather than a separate `RESETTING` state — avoids adding a new state to the driver's state machine, which would require changes across the pool layer
- Extracted `setIdleTimeoutAndEmitRelease()` helper to avoid duplicating the idle timeout + release event logic between the sync and deferred paths

**Reflection:** This PR is the strongest proof-of-work play we've executed so far. Unlike the Raycast grammar contribution (which was a niche feature for a large company), this directly targets the CTO of a Tier 1 company, in his personal flagship project, on an issue he personally blessed. The code touches the core connection pool lifecycle — this isn't a docs fix or a config change, it's real systems-level TypeScript work that demonstrates exactly the kind of engineering Doug does.

The research pipeline paid off: the dossier identified Gajus's OSS portfolio, the issue triage found #719 as the highest-signal target, and the implementation was clean because we understood the codebase architecture before writing a line of code. Total time from "let's look at Gajus's repos" to submitted PR: one session.

The outreach angle is now loaded: "Hey Gajus, I submitted PR #756 for the deferred pool reset you mentioned in #719" is a warm, technically credible opener that demonstrates shared values (open source, Postgres, TypeScript, connection pool correctness) before pivoting to the Contra conversation.

---

### 2026-02-16 — Slonik PR #756: Integration Testing & Verification

**Phase:** Outreach
**What:** Verified the deferResetConnection feature actually works against a real PostgreSQL 16 instance, caught and fixed a workspace resolution issue, updated the PR with local testing details, and assessed follow-up contribution opportunities.
**Why:** Unit tests with mocks prove the logic, but they don't prove the feature works in production. Before putting Doug's name on this PR, we needed to verify that DISCARD ALL genuinely runs in the background, that session state actually resets, and that failure modes degrade gracefully. Also needed to evaluate whether the work opens up further issues to file — and decided it doesn't, at least not yet.
**How:** Spun up a PostgreSQL 16 instance via Docker, wrote 5 integration tests exercising the full flow through `createPool` + `createPgDriverFactory`. Hit a snag: pnpm resolved `@slonik/driver` to the published npm package (which doesn't have our changes) instead of the local workspace. The npm package ships `src/` alongside `dist/`, and tsimp was loading the TypeScript source over the compiled JS. Had to patch both `src/` and `dist/` in two separate node_modules copies (one per zod peer dep version) to get the real driver code running. Once patched, all 5 integration tests passed — including the critical test proving `resetFinished === false` at query return time (the deferred reset genuinely runs in the background).
**Outcome:**
- 5/5 integration tests pass against real PostgreSQL 16
- PR #756 updated with detailed "Local testing" section describing each verification step, signed off with "ATB, Doug"
- Contra dossier updated: PR status changed from "plan" to "submitted and verified," notes updated to reflect the strategic decision not to file follow-up issues preemptively
- Assessed follow-up opportunities (selective reset, connection warmup, observability, state machine cleanup, #660 connection leak). Conclusion: none are worth filing as separate issues right now — selective reset and warmup are already possible via existing APIs, observability is too vague, state machine cleanup is presumptuous from a first-time contributor, and #660 already exists. These become conversation starters if Gajus engages on the PR, not preemptive issue filings.
**Decisions:**
- Decided NOT to file follow-up issues on Slonik — one clean PR is the move. Multiple issues from a first-time contributor reads as flag-planting, not genuine contribution. Let the work speak first.
- Used `--body-file` for PR body updates after a shell alias (`bat`) mangled a heredoc and wiped the PR description. Lesson learned on the tooling side.
- Patched node_modules rather than fighting pnpm workspace resolution — pragmatic choice for a one-off verification, not worth debugging the monorepo's dependency topology.
**Reflection:** The "does it actually work?" question was the right one to ask. Mock tests passed from the start, but the integration test revealed that the workspace wasn't even running our code — we were testing the published driver the whole time. Without the real PostgreSQL verification, we'd have shipped a PR that we'd never actually run end-to-end. The key proof point: `resetFinished === false` at the moment the query returns to the caller. That single boolean is the difference between "the code looks right" and "this actually works."

The strategic restraint on follow-up issues was also the right call. The instinct to "show more" by filing issues is strong, but the outreach philosophy is "demonstrate, don't apply" — and that applies to open source contribution too. One excellent PR demonstrates more than one PR and four speculative issues.

---

### 2026-02-16 — Slonik PR #756: Gajus Responds, Config Removed, PR Simplified

**Phase:** Outreach
**What:** Gajus (Contra CTO, Slonik maintainer) responded to PR #756 within hours: "I think this could be default/does not need to be configurable?" Analyzed his feedback, agreed completely, refactored the PR to remove the `deferResetConnection` config option entirely, making deferred reset the unconditional default behavior. Updated 6 files across 2 packages, rewrote all tests, rebuilt, verified, pushed, updated the PR body, and replied to Gajus confirming the change.

**Why:** Gajus's feedback was both technically correct and strategically excellent. There's no scenario where blocking `release()` on a reset query benefits the caller — the connection can't be reused during reset regardless (it's in `PENDING_RELEASE` state), and the pool already tracks it correctly. Making it unconditional eliminates config surface area, reduces the changeset to just `@slonik/driver` (no `slonik` package changes needed for types/defaults), and produces a cleaner diff. From a contributor standpoint, responding quickly and agreeing with the maintainer's design instinct — rather than defending the original approach — shows good judgment and collaboration.

**How:**
1. Analyzed Gajus's comment — considered whether there's any scenario where blocking is valuable. Conclusion: no. The original config was defensive ("let the maintainer choose"), but the maintainer is telling us to just make it the default. Listen to the maintainer.
2. Removed `deferResetConnection` from `DriverConfiguration` type in `createDriverFactory.ts`
3. Simplified `internalRelease()` to always take the deferred path — no more branching on config
4. Removed from `ClientConfiguration` type in `types.ts`, from defaults in `createClientConfiguration.ts`, and from the test helper
5. Rewrote all 7 tests (down from 8 — the "blocking vs deferred" comparison test no longer makes sense)
6. Built all packages — TypeScript compilation clean
7. Ran all 7 driver tests — passed
8. Ran all 40 pool tests — passed (same pre-existing flaky timing test, passes in isolation)
9. ESLint clean on all changed files
10. Committed, rebased onto remote (which had a merge commit we didn't have locally), pushed
11. Updated PR body via `--body-file` to describe the simplified approach
12. Replied to Gajus on the PR confirming the change

**Outcome:**
- PR #756 updated: 6 files changed, net -100 lines deleted (simpler is better)
- Changeset simplified to just `@slonik/driver` minor bump (removed `slonik` from changeset since no type/config changes needed there anymore)
- PR title updated to "feat: run resetConnection in background after release" (removed reference to config option)
- Gajus has been replied to: "Done — removed the `deferResetConnection` config option entirely. Deferred reset is now the unconditional behavior."
- Turnaround from Gajus's comment to updated PR: single session

**Decisions:**
- Immediately agreed with Gajus rather than defending the config option — the instinct to make things configurable is a common engineering habit, but Gajus is right that it adds complexity without value. A first-time contributor who listens to the maintainer and adapts quickly makes a better impression than one who argues
- Dropped from 8 tests to 7 — the "blocking release waits for reset" test only existed to contrast with the deferred path. With no blocking path, it's meaningless
- Removed `slonik` from the changeset — with no `deferResetConnection` in `ClientConfiguration` or defaults, the `slonik` package has zero changes. Cleaner changeset = easier review
- Used `--body-file` again for the PR body update (lesson learned from the `bat` alias incident earlier)

**Reflection:** This is exactly how open source contribution should work. The feedback loop was tight: submit PR → maintainer responds with design suggestion → agree and implement → push update. Gajus's response within hours is a strong signal — he's engaged with the PR, not ignoring it. And his suggestion made the code genuinely better: fewer lines, no config to document, no config to test, no config for users to misunderstand.

The meta-lesson: the original PR was over-engineered. The "safe" choice of making it configurable (default `false`) added types to two packages, defaults to two more files, and doubled the test surface area — all for a code path (blocking reset) that nobody wants. Gajus cut through that in one sentence. Good maintainers do that.

From a strategic perspective, this interaction is gold. Doug now has a bidirectional conversation with Contra's CTO on a technical topic. The PR isn't just sitting in a queue; Gajus is actively shaping the implementation. When Doug sends the outreach message, it's not "I submitted a PR" — it's "we already collaborated on the pool reset feature." That's a meaningfully different starting position.

---

### 2026-02-16 — The Contribution Map: Scanning 200+ EU Open Source Repos for Proof-of-Work Targets

**Phase:** Outreach
**What:** Ran a comprehensive intelligence sweep across European open source — music tech, gaming, creative tools, and developer tools — to map every actionable PR target and complementary tool idea for the outreach pipeline. Deployed 4 parallel research agents that collectively explored 200+ GitHub orgs and repos, verified issue counts, checked hiring pages, and cross-referenced against the existing company database. Also brainstormed 15 original open source tool ideas that could serve as proof-of-work for specific companies.

**Why:** With the Slonik PR (Contra) and ray.so PR (Raycast) proving the "demonstrate, don't apply" approach works, the question became: where else can we do this? The existing 51 dossiers flagged some OSS opportunities, but only for companies we'd already researched. This sweep went wider — looking for repos and companies that weren't on the radar yet, especially in Doug's passion verticals (music, games, creative tools). The goal: build a menu of 20+ actionable contribution targets so Doug can pick based on what he's genuinely excited about, not just what's strategically optimal.

**How:** Four parallel research agents, each with a different mandate:

1. **EU Music Tech OSS Agent** — Explored GitHub orgs for Ableton, Bitwig, Spotify, Deezer, SoundCloud, Steinberg, Epidemic Sound, Elk Audio, Renoise, Native Instruments, Moises AI. Also searched GitHub topics (music, audio, daw, vst, web-audio) for indie projects. Used `gh` CLI to verify star counts, issue counts, and recent activity.

2. **EU Gaming OSS Agent** — Explored PlayCanvas, Overwolf, Nexus Mods, Facepunch, mod.io, Ubisoft, Godot, Leetify, FACEIT, PixiJS. Also found community game projects (AncientBeast, OpenFrontIO, Athena Crisis, boardgame.io, Colyseus). Checked SourceMod for Source 2 modding opportunities.

3. **EU Creative/Dev Tools Agent** — Explored tldraw, Excalidraw, Tiptap, n8n, Remotion, xyflow, Medusa, Deepnote, Prisma, Strapi, Directus, Penpot, Storyblok, Liveblocks, Cal.com, Trigger.dev, Documenso, Theatre.js, Motion Canvas, Dub.co. Verified EU presence for each.

4. **Complementary Tool Ideas Agent** — Brainstormed 15 original tool concepts across web audio, gaming, creative coding, and developer tools. Each scoped to 1-3 days, with specific target companies and skill demonstrations.

**Outcome:**

*New high-value discoveries not in any existing dossier:*

**Music (TypeScript):**
- openDAW (Cologne) — 1,204 stars, 36 open issues, pushed today. Pure TypeScript web DAW. Moises AI forked this.
- Tone.js — 14.7K stars, 61 issues. THE web audio framework.
- wavesurfer.js — 10.1K stars, 50 issues. Audio waveform visualization.
- Spotify Web API TS SDK — 459 stars, 58 issues, unmaintained since Oct 2025.
- Spotify basic-pitch-ts — Audio-to-MIDI in TypeScript, needs React integration.
- Bitwig dawproject — 944 stars, 37 issues. Open DAW exchange format.
- CLAP (EU-led, by u-he + Bitwig founders) — 2.2K stars, clap-wrapper has "good first issue" labels.
- efflux-tracker (Amsterdam) — 250 stars, 10 issues. Browser DAW in TypeScript.
- Strudel (Berlin) — 2.9K stars. Live coding music in the browser.

**Gaming (TypeScript):**
- PlayCanvas React (London) — 450 stars, 15 issues. React bindings for 3D engine. Company hiring 2 Full Stack Engineers.
- PlayCanvas SuperSplat (London) — 3.6K stars, 124 issues. 3D Gaussian Splat editor.
- Nexus Mods Vortex (Exeter) — 1.2K stars, 466 issues. THE mod manager, TypeScript/Electron. Company hiring. 41M users.
- AncientBeast (Romania) — 1.8K stars, 476 issues. TypeScript/Phaser game with bounties.
- OpenFrontIO — 1.7K stars, 276 issues, 10 "good first issue" labels.
- Athena Crisis — 1.9K stars, issue #8 literally says "Build a React-Three-Fiber renderer."
- boardgame.io — 12.2K stars, 6 "help wanted" issues.
- Facepunch s&box (UK) — 3.7K stars, 2,076 issues. Source 2 engine. 9 open roles.

**Creative/Dev Tools (TypeScript, EU companies):**
- Excalidraw (Brno, CZ — 2hrs from Prague!) — 116K stars, 2,786 issues.
- Deepnote (Prague!) — 2.6K stars, TypeScript, hiring.
- n8n (Berlin) — 174K stars, 1,379 issues. Automation = Doug's DNA. Hiring TS/Node in EU.
- Tiptap (Berlin) — 35K stars, 866 issues. Hiring Sr Full Stack (EU remote). YC-backed.
- tldraw (London) — 45K stars, 313 issues. Hiring Product Engineer. 5 "good first issue."
- xyflow/React Flow (Berlin) — 35K stars. Built a Strudel music live-coding integration.
- Theatre.js (Berlin) — 12K stars. 3D animation toolbox.
- Medusa (Copenhagen) — 32K stars. Open-source commerce. Hiring engineers.
- Dub.co (EU-remote OK) — 23K stars. Growth/analytics. Hiring Staff Engineer.

*Top complementary tool ideas to build:*
- `beat-detect-wasm` (3 days) — C++ BPM detection → WASM → TypeScript → React hook. Strongest single signal: demonstrates the rarest skill combination.
- `react-vu-meter` (1.5 days) — Audio level meters (VU/PPM/LUFS) as React components. Covers 5+ music companies.
- `midi-autopilot` (2 days) — Web MIDI routing library in TypeScript. Targets Arturia, NI, Bitwig.
- `s2-asset-graph` (2 days) — Source 2 asset dependency visualizer. Authentic to Doug's modding project.
- `feature-flag-scraper` (2 days) — Detect A/B tests on any site. Killer outreach angle for growth companies.

**Decisions:**
- Prioritized companies that are actively hiring AND have TypeScript repos with open issues — a PR to a hiring company is both a contribution and an application enhancer
- Flagged PlayCanvas as a top-tier discovery — they're hiring 2 Full Stack Engineers in London, their React bindings repo has 15 TypeScript issues, and the SuperSplat editor has 124 issues. This wasn't in any dossier
- Flagged Excalidraw as geographically strategic — Brno is 2 hours from Prague, 116K stars, and 2,786 open issues in TypeScript/React. Could be a local networking play
- Identified n8n as a natural fit that was hiding in plain sight — 174K stars, automation platform, Berlin with EU-remote, hiring TypeScript/Node engineers. Doug's automation expertise is the proof-of-work here
- Chose `beat-detect-wasm` as the strongest tool to build — the C++ → WASM → TypeScript → React pipeline is something almost nobody can do end-to-end. It's the most differentiated signal Doug can send to any music tech company
- Did NOT add these companies to the companies database yet — this is a research output, not a commitment. Doug should pick which ones to pursue based on genuine interest

**Reflection:** This sweep fundamentally changed the shape of the outreach pipeline. Before today, the "demonstrate, don't apply" strategy was limited to companies in the existing dossiers — mostly from the original 147-company swipe. Now there's a map of 30+ actionable OSS targets across music, gaming, and creative tools, many at companies that weren't even in the database.

The most surprising finds: PlayCanvas (hiring, React bindings, 3D — perfect intersection), Excalidraw (literally 2 hours from Prague, 116K stars), and n8n (automation platform that's basically Doug's resume as a product). These aren't just contribution targets — they're genuine companies worth considering.

The tool ideas add another dimension. Instead of only contributing to other people's repos, Doug can build original tools that demonstrate skill AND create conversation starters. `beat-detect-wasm` is the standout: "I built a BPM detector that compiles C++ to WebAssembly with TypeScript bindings and a React hook" is a sentence that would make any music tech CTO pay attention. And it's authentic — Doug is genuinely moving into C++ and lower-level work.

The meta-observation: at this point, the constraint isn't "where can we contribute?" — it's "what does Doug actually want to work on?" The best outreach comes from genuine interest, not strategic optimization. The map is drawn; now it's about following curiosity.

---

### 2026-02-16 — Outreach Pipeline Complete + Voice Calibration Lesson

**Phase:** Outreach
**What:** Completed the full 3-stage outreach pipeline (dossier → strategy → craft-outreach) for 5 underdog companies: Lightdash, Leetify, MapTiler, Bakken & Baeck, Tractive. Then started executing — browser automation to fill out Tractive's application form. Hit a critical voice problem: the first cover letter draft was obviously AI-generated.

**Why:** Doug said "to get the cash flowing" — we needed to shift from proof-of-work PRs and research to actually sending messages and applying. Selected 5 smaller underdog companies (Doug's preference over big names like Apify, which he's blacklisted). Used browser automation tools to speed up the tedious form-filling.

**How:** Launched 5 parallel `/outreach-strategy` agents (Sonnet model for cost efficiency), waited for completion, then launched 5 parallel `/craft-outreach` agents. All 10 agents completed successfully — produced ready-to-send LinkedIn messages, cover letters, follow-up sequences, CV tailoring notes, and proof-of-work suggestions for each company. Then used Chrome browser automation (MCP tools) to navigate to Tractive's Teamtailor application form and start filling it out.

**Outcome:**
- 5 complete outreach packages at `journey/outreach/{company}.md`
- 5 strategies at `journey/strategies/{company}.md`
- Tractive application form partially filled via browser automation
- **Voice lesson learned:** The `/craft-outreach` skill's cover letter template produces text that reads like GPT — overuse of "I don't just X, I Y" constructions, corporate-sounding phrases, too polished. Doug caught it immediately: "That is a VERY GPT like message. Its overly cheesy and has too many obvious AI giveaway."

**Decisions:**
- Rewrote the Tractive cover letter in Doug's actual voice: direct, specific, conversational, honest about gaps (Java/Kotlin). No buzzwords, no humble-brag patterns, no "I don't just build features, I instrument them" constructions. The rewrite was half the length and twice as effective.
- Priority order: Tractive first (active posting), Lightdash (active posting), MapTiler (active posting, near Prague), Leetify (speculative but unique Source 2 hook), Bakken & Baeck (long game, no eng roles).
- Apify permanently blacklisted — Doug rejected multiple times, bad experience with CTO.

**Reflection:** The voice calibration issue is the single most important lesson so far. Every outreach message generated by the `/craft-outreach` skill needs a human rewrite pass before sending. The skill does good work on strategy, angles, CV tailoring, and portfolio selection — but the actual message copy reads like a LinkedIn influencer, not like Doug. Doug's voice is: short sentences, honest about gaps, leads with facts not feelings, no em-dash-heavy "I'm passionate about" garbage. The browser automation is a genuine time-saver for form-filling drudgery, but the words themselves need to be Doug's.

Going forward: all outreach messages should be drafted shorter, more direct, with Doug reviewing before send. The skill templates need a voice section that explicitly says "no corporate speak, no 'I don't just X, I Y' patterns, no humble brags."

---

### 2026-02-16 — Tractive Application Aborted: No Remote Work

**Phase:** Outreach
**What:** Got halfway through filling out Tractive's Teamtailor application form via browser automation when the screening questions revealed a dealbreaker: "Are you open to relocating to Austria?" and "Just a reminder - we don't offer fully remote work at Tractive." Application abandoned.

**Why:** Doug is based in Prague and needs remote or remote-friendly roles. Relocating to Linz, Austria is not on the table. This should have been caught during the dossier or strategy phase — the dossier noted "Hybrid Setup" as a benefit and the strategy flagged the "3-hour commute" as a risk, but neither explicitly verified that fully remote was off the table. The application form made it clear: no remote, must relocate.

**How:** Chrome browser automation (MCP tools) to navigate Tractive's careers page, find the Senior Software Engineer (Full-Stack) posting, and fill the Teamtailor form. Got through citizenship, visa status, name, cover letter (rewritten in Doug's voice after the GPT-voice lesson), start date, and referral source before hitting the relocation screening question.

**Outcome:** Tractive moved from Tier 1 to **No**. Time wasted: ~20 minutes on form filling plus the strategy and outreach generation time. Not catastrophic, but avoidable.

**Decisions:**
- Abandoned Tractive application immediately. No point applying to a role that requires Austrian relocation.
- Updated Tractive dossier to reflect "No" status with clear reason.
- Remaining 4 companies (Lightdash, Leetify, MapTiler, Bakken & Baeck) are all remote-friendly or have distributed teams.

**Reflection:** This is a process failure, not a research failure. The dossier had the data — "Hybrid Setup" and "Linz, Austria" were right there. But the strategy didn't ask the hard question: "Does hybrid mean 'some remote days' or 'must live near the office'?" Going forward, every dossier should have a **Remote Policy** field that explicitly states: fully remote / hybrid-with-relocation / on-site only. If unclear, flag it as a risk before investing in outreach materials.

The silver lining: the rewritten cover letter (Doug's actual voice, not GPT template) is solid and reusable as a template for future applications. Short, direct, honest about gaps, leads with facts.

---

### 2026-02-16 — LinkedIn Mass Connect: 58 Profiles From All 51 Dossiers

**Phase:** Outreach
**What:** Extracted every named contact from all 51 company dossiers and bulk-sent LinkedIn connection requests — no message, just the raw connect. The goal: seed Doug's LinkedIn network with decision-makers and engineering leads at every target company before any outreach begins.

**Why:** LinkedIn connections are low-friction, high-optionality. A connection request with no message doesn't burn any bridges — it just puts Doug's name and headline in front of these people. When he later sends a DM, InMail, or shows up in their notifications via a comment or post, they'll already have the connection. It's planting seeds, not harvesting.

**How:** Used a Haiku agent to scan all 51 dossier files in parallel and extract every person with a LinkedIn URL — names, titles, companies, URLs. Got back 148 contacts total, ~63 with actual LinkedIn URLs. Removed 4 Apify contacts (blacklisted). First attempted browser automation — Claude clicking Connect > Send without a note on each profile one by one. Got through 4 profiles (Alexander Wankhammer/Sonible, Angéline Camus/Deezer, Bastian Suter/BattlEye, Benjamin Guincestre/Deezer) before Doug called it — too slow. Tried `window.open()` to blast all 58 tabs at once — Chrome's popup blocker killed every one. Final solution: generated a local HTML file with an "Open All" button and batch buttons (15 tabs each). Since Doug clicks the button himself, Chrome treats it as a user gesture and allows the popups. Some profiles 404'd (stale LinkedIn slugs), but the majority landed. Doug handled the Connect clicks manually from there.

**Outcome:** ~50+ connection requests sent across companies including Deezer, Mews, Spitfire Audio, Bakken & Baeck, Linear, Splice, Photoroom, Neko Health, Groover, Arturia, Facepunch, XCEED, MapTiler, Lightdash, and more. Network seeded across nearly every target company.

**Decisions:**
- No message on connection requests. Doug's philosophy: "Hey — sending out the connect just in case. Cheers — Doug" is the maximum. For a mass connect pass, even that's too much. Just connect, no note.
- Excluded all 4 Apify contacts (Jan Curn, Jan Zenisek, Marek Trunkat, Ondra Urban) — company is blacklisted due to prior CTO issues.
- Abandoned one-by-one browser automation after 4 profiles. The ROI on automating LinkedIn's UI is terrible — each profile takes 4-5 clicks, the page layouts vary, and modals appear inconsistently. Human clicking 58 tabs is faster than agent clicking 58 profiles.
- Batch tab approach (15 at a time) was the sweet spot — Chrome handles it, LinkedIn doesn't rate-limit, and the human can blast through Connect buttons quickly.

**Reflection:** The extraction part was the real value — having an agent read 51 markdown files and pull out every contact with a LinkedIn URL in 60 seconds is something that would take a human 2+ hours. The browser automation part was the wrong tool for the job. LinkedIn's UI is hostile to automation: inconsistent button placement, modal dialogs, anti-bot detection. The HTML-file-with-batch-buttons approach was the right call — let the agent do the data work, let the human do the clicking. A good division of labor.

Some LinkedIn URLs from the dossiers were stale (404s). This is expected — dossier data is a snapshot, and people change their LinkedIn slugs, leave companies, etc. Not worth fixing retroactively; the ones that landed are the ones that matter.

---

### 2026-03-05 — Project Snapshot: Three Weeks After the Sprint

**Phase:** Outreach
**What:** Journaled the full project state, 18 days after the initial two-day sprint (Feb 15-16). The system has been largely static since the sprint — no new commits since Feb 16, but several pieces of uncommitted work have accumulated: a CV page (`apps/web/app/cv/`), a CV API route (`apps/web/app/api/cv/`), two tailored CV variants (`assets/cv-rankacy.json` for Rankacy, `assets/cv-outreach.json` for general outreach), a standalone CV HTML file (`cv.html`), another CV HTML variant (`cv-with-timeline`), and updates to `CLAUDE.md` and `cv.json`. The CLAUDE.md has been significantly revised (~111 insertions, ~108 deletions).

**Why:** The project had reached the end of the initial build sprint with massive momentum — 51 dossiers, 5 strategies, 5 outreach packages, 58 LinkedIn connections sent, a 6,500-word case study article written, and a 200+ repo contribution map produced. But then 18 days passed. This journal entry captures where things stand so the project doesn't lose its thread.

**How:** Read the full LOG.md (857 lines, 13 entries covering Feb 15-16), checked git status, examined uncommitted files, reviewed the tier list and pipeline state.

**Outcome:**

*What was built (Feb 15-16):*
- 147-company database with scores, categories, and metadata
- Tinder-style swipe tool (keyboard-driven, arrow keys)
- Company detail pages rendering 51 dossier markdowns
- Puppeteer screenshot service
- HN Algolia research panel
- 5 Claude Code skills (company-research, company-deep-dive, outreach-strategy, craft-outreach, journey-log)
- Article-writer pipeline (separate tool, 9 skills)
- File-based persistence (decisions.json, research-cache.json, dossiers, strategies, outreach)

*Pipeline state:*
- **Dossiers:** 51 completed (all 50 "yes" companies + Rankacy)
- **Strategies:** 5 completed (Lightdash, Leetify, MapTiler, Bakken & Baeck, Tractive)
- **Outreach:** 5 completed (same 5), but Tractive killed (no remote)
- **LinkedIn:** ~50+ connections sent to decision-makers across target companies
- **Article:** 6,452-word case study ready to publish
- **OSS PR strategy:** Abandoned. Slonik #756 (Contra) and ray.so #407 (Raycast) submitted but got no traction. The "contribute to their repo before applying" play sounds good in theory but didn't translate to responses. Time spent on PRs would have been better spent on direct outreach

*What's uncommitted (built since the sprint):*
- CV page and API (`apps/web/app/cv/`, `apps/web/app/api/cv/`)
- Tailored CV for Rankacy (`assets/cv-rankacy.json`) — gaming analytics focus, Python/C++ emphasis
- General outreach CV (`assets/cv-outreach.json`) — broader positioning, observability and monorepo emphasis
- Standalone CV HTMLs (`cv.html`, `cv-with-timeline`)
- CLAUDE.md refinements (significant rewrite, ~220 lines changed)

*What hasn't happened yet:*
- No Tier 1 strategies or outreach (Photoroom, Framer, Mews, Overwolf, Bakken & Baeck — only B&B has outreach but it's a Tier 1 long game, no eng roles)
- No article published (SEO, HN, Dev.to, LinkedIn targets identified but not executed)
- No proof-of-work projects shipped (Source 2 modding platform, growth audits, beat-detect-wasm)
- Remaining 45 strategies and outreach packages not generated
- No applications actually submitted (Tractive was the only attempt, aborted)

*Tier 1 status:*
| Company | Dossier | Strategy | Outreach | PR/Proof | Status |
|---------|---------|----------|----------|----------|--------|
| ~~Apify~~ | Done | — | — | — | BLACKLISTED |
| Photoroom | Done | — | — | — | Not started |
| Framer | Done | — | — | — | Not started (warm lead) |
| Mews | Done | — | — | — | Not started |
| Overwolf | Done | — | — | — | Not started |
| Bakken & Baeck | Done | Done | Done | — | Outreach ready, no eng roles |
| ~~Tractive~~ | Done | Done | Done | — | REJECTED (no remote) |

**Decisions:**
- The CV tailoring work (Rankacy-specific, outreach-general) shows the right instinct — different companies need different emphasis. The Rankacy variant leads with gaming and C++/Python; the outreach variant leads with monorepos and observability. This pattern should extend to Tier 1 companies
- Building a web-rendered CV page is smart — it's linkable, searchable, and demonstrates frontend craft. The HTML variants suggest Doug was experimenting with formats for different submission contexts
- The 18-day gap between the sprint and now is the natural energy drop after an intense 2-day build session. The system is built; the work that remains is execution (sending messages, publishing the article, submitting applications)

**Reflection:** The Feb 15-16 sprint was genuinely impressive — two engineers and ten AI threads producing a research pipeline, 51 dossiers, a swipe tool, an article, and a full outreach strategy in 48 hours. But the system is only as valuable as the outreach it enables, and 18 days later, zero applications have been submitted, zero messages sent, and the article hasn't been published. The infrastructure-to-execution gap is the story of many engineering projects: building the system feels productive; using it feels vulnerable. The next milestone isn't another feature — it's sending the first message.

The OSS PR strategy was a bust. The Slonik and ray.so contributions were well-executed engineering work, but they didn't open doors. In hindsight, the "contribute to their codebase before applying" play has a fatal assumption: that maintainers connect a GitHub PR to a hiring conversation. They don't. A PR from a stranger is just a PR from a stranger. The time spent researching Gajus's repos, implementing deferred connection resets, and adding ColdFusion grammars would have been better spent sending 10 direct messages. Lesson: clever indirection loses to direct outreach.

The uncommitted CV work suggests Doug has been iterating on self-presentation — also important, but less urgent than execution. The CV page, the tailored variants, the HTML exports — these are tools for applying. The applying itself still needs to happen.

---
