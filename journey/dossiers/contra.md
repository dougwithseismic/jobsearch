# Contra — Deep Dive Dossier

**Last Updated:** 2026-02-16
**Priority Tier:** 1 (Hot — upgrading from Tier 2 based on existing relationship)
**Overall Assessment:** Contra is the single warmest lead in Doug's pipeline. He has a prior client relationship through withSeismic, the tech stack is an exact match (React, TypeScript, Next.js), and the CTO (Gajus Kuizinas) is a prolific open source contributor who would likely respect Doug's technical background. The company is small (~29-34 employees), remote-first, well-funded ($45M), and just launched a major new product (Indy AI). No engineering roles currently posted, but at this size, warm outreach to the CTO or CEO can create a role. This should be Doug's first outreach.
**Existing Relationship:** **YES** — Doug worked with Contra through his consultancy withSeismic. This is a prior client relationship and changes the entire outreach strategy.

---

## Current Openings

| Role | Team | Link | Posted | Salary | Doug Fit |
|------|------|------|--------|--------|----------|
| Head of Partnership Revenue | Business | [Careers](https://contra.com/careers) | Recent | Not posted | Weak — business role |
| Designer (early-career) | Design | [Careers](https://contra.com/careers) | Recent | Not posted | Weak — design role |

No engineering roles are currently posted. However, this is a 29-34 person company that just launched a major new AI product (Indy AI). Engineering hiring at companies this size often happens through network and referral, not job boards. With Doug's existing relationship, this is exactly the kind of company where a warm "Hey, I saw what you launched" message to the CTO creates an opportunity.

**Historical context:** Contra has previously hired full-stack engineers, and the team has always been engineering-heavy. The $45M in funding and 20% user growth suggest continued investment in product.

## Recent Activity (Last 6 Months)

- **Jan 13, 2026:** Launched **Indy AI** — An AI-powered Chrome extension that replaces job boards by scanning your LinkedIn/X connections and surfacing warm, high-fit opportunities. Major product bet. Built with Framer for the marketing site (connection: Doug has also worked with Framer).
- **Aug 5, 2025:** Launched **Contra for Companies** — B2B product allowing companies to hire freelance/contract talent through the platform.
- **Ongoing:** Platform continues to grow with 20% user growth and $45M in funding from NEA and Unusual Ventures.
- **No layoffs reported.** Company appears stable and focused on product expansion.
- **Product Hunt presence:** Multiple launches in 2025-2026, including Indy AI. Active community engagement.
- **ESLint gold sponsor** — Contra became a gold sponsor of ESLint, signaling commitment to open source (driven by CTO Gajus).

## Tech & Engineering

**Stack:** React, TypeScript, Next.js, Node.js, PostgreSQL, GraphQL. CTO Gajus is passionate about Node.js, React, GraphQL, and PostgreSQL — these are the core technologies.
**Engineering Blog:** [Gajus on Medium](https://gajus.medium.com/) — CTO writes about JavaScript, PostgreSQL, and DevOps. Not a formal company blog, but the CTO's public writing sets the tone.
**GitHub Org:** CTO's personal GitHub: [github.com/gajus](https://github.com/gajus) — 2.6k followers, projects with 20M+ weekly NPM downloads
**Open Source Activity:** Exceptional (through CTO). Key projects:
  - **Slonik** — Node.js PostgreSQL client with type safety (4.9K stars, ~117k weekly downloads, 1,196 releases). Contra's actual database layer. Actively maintained — latest release v48.10.2 was 4 days ago. 26 open issues, strongest in connection pool improvements.
  - **roarr** — JSON logger (1.1K stars, 5.36M weekly downloads)
  - **global-agent** — HTTP/HTTPS proxy agent (388 stars, 4.78M weekly downloads)
  - **eslint-plugin-jsdoc** — JSDoc linting (1.2K stars, 4.65M weekly downloads, committed to yesterday)
  - **Liqe** — Lucene-like parser and search engine (670 stars, 24.5K weekly downloads)
  - **Turbowatch** — Fast file change detector (973 stars) — **DEPRECATED**, recommends alternatives
  - Contra is an ESLint gold sponsor
  - Total portfolio: 333 repos, 2.6K followers, 20M+ weekly NPM downloads across all projects
**Culture Signal:** Mature & thoughtful — The CTO's deep open source involvement and technical writing indicate an engineering culture that values craft, type safety, and developer experience.

**Slonik Market Context:** Community loves Slonik's ideas (SQL-first, runtime Zod validation, type safety) but has friction with frequent breaking changes (v33 forced mandatory Zod migration with no incremental path). Kysely now has 20x the downloads. Silverhand/Logto forked Slonik rather than upgrade. Despite this, Gajus is actively maintaining it — 1,196 releases shows deep commitment. A quality contributor who shows up and ships is valuable to a maintainer watching competitors grow.

The fact that Gajus maintains projects with 20M+ weekly NPM downloads while running a startup's engineering org is a strong signal about the kind of engineering culture he builds. Doug's own open source NPM packages would resonate here.

### GitHub Contribution Analysis

**Repos Worth Looking At:**
- `gajus/slonik` — 4.9K stars, TypeScript, 26 open issues. Contra's database layer. Connection pool is the weakest area with multiple open bugs.
- `gajus/liqe` — 670 stars, TypeScript/Nearley, 13 open issues. Lucene-like parser. Has "help wanted" signals (ReDoS protection, broken type definitions).
- `gajus/eslint-plugin-jsdoc` — 1.2K stars, 31 open issues. Very active but less interesting as an outreach conversation-starter.

**Open Issues / PR Opportunities:**
- **Slonik #719** — Run DISCARD ALL in the background after connection returns to pool. Gajus responded "This is a reasonable improvement" (Nov 6, 2025). **PR #756 ACTIVE — GAJUS ENGAGED** ([github.com/gajus/slonik/pull/756](https://github.com/gajus/slonik/pull/756)). Originally submitted as a configurable `deferResetConnection` option. Gajus responded within hours suggesting it should be the unconditional default. Agreed and refactored: removed config, made deferred reset the default behavior, simplified to just `@slonik/driver` changes. 7 unit tests + verified against PostgreSQL 16. **Bidirectional conversation established** — Gajus is actively shaping the implementation, not just reviewing it.
- Slonik #660 — Connection leak on error (production pain, connection never releases). Our #756 destroy coordination improvements are adjacent — could be a follow-up if relationship develops.
- Slonik #569 — DISABLE_TIMEOUT silently uses 10s instead of disabling (open almost 2 years)
- Slonik #743 — Explicit undefined bypasses timeout defaults
- Liqe — ReDoS protection, broken TagToken type definitions

**PR Status:** PR #756 active — Gajus responded with design feedback (remove config, make it default), Doug implemented the change same session. Bidirectional technical conversation established. Awaiting final merge decision.

**Contribution Opportunity:** High

## Key Contacts

| Name | Title | LinkedIn | Recent Content | Why Them |
|------|-------|----------|----------------|----------|
| Gajus Kuizinas | Co-Founder & CTO | [LinkedIn](https://www.linkedin.com/in/gajus/) | Prolific open source (20M+ weekly NPM downloads), writes on Medium about JS/PostgreSQL/DevOps, Contra profile active | **Primary target.** CTO of a 30-person company = direct hiring authority. Prolific open source contributor = appreciates technical depth. Doug's existing relationship means this isn't cold outreach. |
| Ben Huffman | Co-Founder & CEO | [LinkedIn](https://www.linkedin.com/in/ben-huffman-b7b6a8102/) | Podcast appearances, LinkedIn posts about raising $44M | Secondary target. CEO at this size has influence on all hires. Previously co-founded Ripe (acquired by Hungry in 2020). |
| Allison Nulty | Head of Product | — | — | Product leader — could provide insight into engineering needs |

**Recommended first contact:** Gajus Kuizinas — This is the most obvious first contact in Doug's entire pipeline. CTO, prolific open source contributor, prior client relationship through withSeismic. Gajus has a public Contra profile, is active on GitHub and Medium, and clearly values technical depth. A message referencing the Indy AI launch plus the prior work relationship is the warmest possible outreach.

## Pain Points & Opportunities

### What They Need
- **Scaling after Indy AI launch** — A major new AI product (Chrome extension + backend inference) requires engineering investment. The team is only ~30 people — they likely need senior engineers who can ship autonomously
- **B2B product engineering** — "Contra for Companies" is a new B2B product line. Building enterprise features (team management, billing, analytics) on top of a consumer platform is a specific challenge
- **AI/ML product engineering** — Indy AI uses AI to match opportunities to user profiles. Building reliable, useful AI features requires engineers who understand both the ML side and the product UX
- **Growth engineering** — 20% user growth needs to accelerate. Referral loops, activation flows, and retention are critical for a network-effects business
- **Open source stewardship** — With the CTO maintaining projects with 20M+ weekly downloads, there may be opportunities to contribute to or build on these open source tools

### How Doug Solves It
- **Prior relationship = trust already built.** Doug worked with Contra through withSeismic. He understands the product, the team, and the culture. Zero ramp-up on context.
- **Exact stack match:** React, TypeScript, Next.js is Doug's core stack. PostgreSQL, Node.js, GraphQL — all in his wheelhouse. This is the most direct technical fit of any company researched.
- **Growth engineering:** Led growth org at Patrianna from 0 to 1M players. Built growth systems across multiple companies. Contra's 20% user growth needs this expertise.
- **AI product experience:** Featured in MIT Generative AI course (50k+ students). Building agentic workflows. Can contribute meaningfully to Indy AI and other AI product features.
- **Open source alignment:** Doug maintains NPM packages. Gajus maintains projects with 20M+ weekly downloads. This shared context creates an immediate connection.
- **Scraping and automation:** Doug built Vouchernaut (affiliate automation for 10k+ brands). Indy AI's functionality (scanning LinkedIn/X feeds) is conceptually similar to Doug's automation expertise.

### First 90 Days Sketch
1. **Weeks 1-4:** Re-familiarize with the Contra codebase (he's seen it before). Pick up the highest-priority engineering work — likely related to Indy AI or Contra for Companies. Ship something meaningful in the first two weeks.
2. **Weeks 5-8:** Take ownership of a growth engineering initiative. Identify the biggest conversion/activation bottleneck and build a solution. Start contributing to internal tooling and developer experience.
3. **Weeks 9-12:** Propose and lead a larger initiative — whether that's expanding Indy AI's capabilities, building analytics for Contra for Companies, or establishing growth engineering practices. Begin mentoring if the team is growing.

## Proposed Angles

1. **Slonik PR + Existing Relationship** (Technical + Network — PRIMARY ANGLE)
   Lead with the Slonik contribution, pivot to the relationship. "Hey Gajus — I submitted a PR for the deferred resetConnection feature you mentioned in Slonik #719. I've been using Slonik in my own projects and the pool cleanup latency was something I'd noticed too. Separately, I wanted to reconnect — I worked with the Contra team through withSeismic, and I've been following the Indy AI launch. The Chrome extension approach to surfacing warm opportunities is clever. Would love to catch up."

2. **Existing Relationship + Indy AI Launch** (Network — FALLBACK if PR not merged)
   "Hey Gajus — congrats on the Indy AI launch. I've been following what you're building since I worked with the Contra team through withSeismic, and this feels like a natural evolution of the platform. The Chrome extension approach to surfacing opportunities through your existing network is clever — I've built similar scraping and automation systems at Vouchernaut (affiliate automation for 10k+ brands). Would love to catch up and hear how things are going."

3. **Growth Engineering + B2B Expansion** (Business)
   "The Contra for Companies launch is interesting — building a B2B product on top of a consumer network is a challenging transition that I've seen up close at companies like Groupon and The Motley Fool. At Patrianna, I led the growth engineering org that took a new product from zero to 1M players. If you're thinking about how to scale both the consumer and B2B sides of Contra, I'd love to discuss."

## Notes

- **This should be Doug's first outreach.** Warm leads beat cold leads every time. The existing relationship with Contra through withSeismic means this isn't a cold message — it's a professional reconnection. Even if there's no immediate engineering role, this conversation could surface opportunities.
- **Small team = high impact.** At 29-34 employees, every engineer has outsized influence. Doug could be one of maybe 8-12 engineers.
- **Fully remote** — No location barrier. This is a genuine advantage over Paris-based (Deezer) or Barcelona-based (XCEED) companies.
- **Indy AI is conceptually adjacent to Doug's automation work** — Vouchernaut was affiliate automation. Indy AI is opportunity automation. The technical patterns (scraping, matching, personalization) overlap.
- **Slonik PR is ACTIVE with Gajus engaged.** PR #756 (deferred DISCARD ALL) is submitted, integration-tested against PostgreSQL 16, and Gajus has already provided design feedback that was implemented same-day. This has gone beyond a code-level interaction — it's now a bidirectional technical collaboration. Four touchpoints: prior client work, shared open-source values, concrete code contribution, and active design discussion with the CTO.
- **Slonik market context strengthens the play.** Slonik is losing ground to Kysely (20x downloads), Drizzle, and postgres.js. A quality contributor showing up to strengthen the project is genuinely valuable, not performative. Gajus has 1,196 releases — he clearly cares deeply about this project.
- **Follow-up contributions exist but shouldn't be filed preemptively.** #660 (connection leak) and #569 (DISABLE_TIMEOUT) are real issues, and the deferred reset architecture is adjacent to #660. But filing issues or commenting before #756 is reviewed would read as territory-marking. Let the PR speak first, discuss these in conversation if Gajus engages.
- **Upgrading to Tier 1** — Existing relationship + exact stack match + remote-first + recent product launches + Slonik PR = the most multi-layered outreach in the pipeline.

---

*Generated by company-deep-dive skill. Verify key facts before using in outreach.*
