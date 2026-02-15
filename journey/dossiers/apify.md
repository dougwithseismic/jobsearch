# Apify — Deep Dive Dossier

**Last Updated:** 2026-02-15
**Priority Tier:** 1 (Hot)
**Overall Assessment:** Exceptional fit. Prague-based, TypeScript/Node.js core stack, directly aligned with Doug's scraping/automation expertise. Growing fast ($25M ARR, ~160 people), outstanding culture (Glassdoor 4.8), actively hiring for multiple engineering roles including an Engineering Team Lead. No layoffs, no red flags.
**Existing Relationship:** No — but Prague local advantage and deep domain overlap create a strong cold-outreach position.

---

## Current Openings

| Role | Team | Link | Posted | Salary | Doug Fit |
|------|------|------|--------|--------|----------|
| Engineering Team Lead | Foundation Engineering | [Ashby](https://jobs.ashbyhq.com/apify/be181704-08fd-4a25-bda7-d1d83e1a7947) | Active | Not posted (stock options + profit sharing included) | **Strong** — Leads ~5 engineers on core platform (API, data storage, autoscaling). Doug's team-building + backend experience is a direct match. |
| Frontend Engineer (React.js, Next.js) | Application Engineering | [Ashby](https://jobs.ashbyhq.com/apify) | Active | Not posted | **Strong** — React/Next.js, animations, design systems. 8yr React experience fits perfectly. |
| Senior Backend Engineer (Developer Platform) | Foundation Engineering | [Ashby](https://jobs.ashbyhq.com/apify) | Active | Not posted | **Strong** — Node.js/TypeScript, building developer APIs and platform services. Core expertise match. |
| Senior Backend Engineer (Proxy & Unblocking) | Foundation Engineering | [Ashby](https://jobs.ashbyhq.com/apify) | Active | Not posted | **Moderate** — Scraping/anti-detection specialty. Doug has automation experience but this is niche proxy work. |
| Applied AI Engineer | Foundation Engineering | [Ashby](https://jobs.ashbyhq.com/apify) | Active | Not posted | **Moderate** — Python/TypeScript, AI tools and agentic workflows. Doug has LLM/AI experience from MIT course and side projects. |

**Best-fit role: Engineering Team Lead.** This is the highest-impact position — it combines hands-on backend work (TypeScript/Node.js) with leading a team of ~5, owning critical infrastructure (API processing 10k req/s, data storage at hundreds of TB scale). Doug's track record of building and leading teams (9-person team at Patrianna, cross-functional team at Mekamon) plus his scraping/automation expertise makes this a standout match.

**Second choice: Senior Backend Engineer (Developer Platform)** if the team lead role doesn't align with timing or if Doug wants to start hands-on before moving into leadership.

---

## Recent Activity (Last 6 Months)

- **Jan 2025:** Jan Curn (CEO) named EY Entrepreneur of the Year for Prague.
- **Jan 2026:** $1M Developer Challenge concluded — 704 developers, 3,329 Actors published, 1,086 qualifying. Demonstrates massive community investment and marketplace growth.
- **2025:** Revenue grew from $13.3M (2024) to $25M ARR. Team grew from ~116 to ~160 people. No layoffs.
- **Nov 2025:** Launched standalone MCP (Model Context Protocol) server — positioning for AI agent ecosystem.
- **Mar 2025:** Introduced pay-per-event pricing model for developers on the marketplace.
- **Feb 2025:** Redesigned homepage and brand refresh.
- **2024:** Major migration from Meteor.js to NestJS completed (160,000 lines of code). UI bundle size reduced 47%, build times from 17.5 min to 3.5 seconds. Switched from Braintree to Stripe. Migrated monitoring from New Relic to self-hosted Grafana stack.
- **Dec 2025:** Crawlee Cloud (self-hosted, open-source platform) launched on Hacker News.

**Trajectory:** Clear upward. Revenue nearly doubled year-over-year, team growing, community thriving (Discord nearing 10k members), and the $1M Challenge signals confidence and capital. Positioned at the intersection of web scraping and AI data pipelines — a hot market.

---

## Tech & Engineering

**Stack:** TypeScript, Node.js, NestJS, Next.js, React, Express.js, Python (Crawlee for Python), MongoDB, Redis, DynamoDB, S3, AWS, Kubernetes, Helm, Docker, Grafana, Prometheus, Sentry, PagerDuty, GitHub Actions
**Engineering Blog:** [blog.apify.com](https://blog.apify.com) — Active, CTO-authored, technically deep
**GitHub Org:** [github.com/apify](https://github.com/apify) — 199 public repos
**Open Source Activity:** Very strong. Crawlee (JS) is the flagship OSS project. Crawlee for Python gained 5k GitHub stars within months of launch. Also: super-scraper, MCP servers, SDKs, documentation.
**Culture Signal:** **Mature & thoughtful**

Apify's engineering culture is well-documented thanks to CTO Marek Trunkat's blog posts. Key characteristics:

- **T-shaped engineers in full-stack teams.** Each team owns the entire lifecycle: spec, build, ship, monitor. No separate frontend/backend/ops teams — everyone spans the stack.
- **Unified TypeScript stack.** Deliberate decision to minimize technology sprawl. They recently added Python (for Crawlee) but the core platform is TypeScript end-to-end.
- **Continuous incremental improvement.** The Meteor-to-NestJS migration happened over a year without halting feature work — both codebases coexisted in a monorepo with endpoints migrated one at a time.
- **Two-week sprints, multiple daily deployments.** Code reviews, automated testing, CI/CD maturity.
- **Optional technical working groups:** Frontend symposium, backend symposium, tech coffee — cross-team knowledge sharing without mandatory meetings.
- **~80 engineers across 12+ teams** as of late 2024, likely grown since.
- **SOC 2 compliant** — indicates enterprise maturity.

This is an engineering culture Doug would thrive in. The ownership model, TypeScript-first approach, and emphasis on shipping aligns with his working style.

---

## Key Contacts

| Name | Title | LinkedIn | Recent Content | Why Them |
|------|-------|----------|----------------|----------|
| Marek Trunkat | CTO | [LinkedIn](https://cz.linkedin.com/in/marektrunkat) | [2024 Engineering Retrospective](https://blog.apify.com/apify-engineering/), [Engineering Culture post](https://blog.apify.com/building-engineering-culture-at-apify/), [WebExpo talk](https://webexpo.net/prague2022/talk/how-i-learned-to-love-incidents-the-hard-way.html), signageOS CTO panel (2025) | CTO who writes publicly about engineering culture. Most approachable senior leader. Blog posts provide excellent conversation hooks. |
| Jan Curn | Founder & CEO | [LinkedIn](https://www.linkedin.com/in/jancurn/) | [TechFinitive interview (Feb 2025)](https://www.techfinitive.com/interviews/jan-curn-co-founder-and-ceo-of-apify/), [Cerebral Valley profile](https://cerebralvalley.beehiiv.com/p/apify-is-building-the-infrastructure-for-ai-s-data-problem), EY Entrepreneur of the Year | Founder who started company from YC Fellowship in 2015. Active on Apify platform itself. |
| Jan Zenisek | VP of Product | [LinkedIn](https://cz.linkedin.com/in/janzenisek) | None found | Product leader — relevant if applying for roles at the product/engineering intersection. |
| Ondra Urban | COO (former engineering lead) | [LinkedIn](https://www.linkedin.com/in/ondra-urban/) | [Sessionize speaker profile](https://sessionize.com/ondra-urban/), multiple Apify blog posts | Transitioned from engineering leadership to COO. Understands both technical and business sides. |

**Recommended first contact:** Marek Trunkat (CTO) — He's the hiring authority for engineering, writes publicly about engineering culture, and his blog posts provide natural conversation starters. Prague-based, so even an in-person coffee is possible.

---

## Pain Points & Opportunities

### What They Need

- **Scaling the platform infrastructure.** 40M+ monthly Actor runs (100% YoY growth) means continuous scaling challenges. Their DNS hit AWS Route53 limits, MongoDB at 1.5TB is straining — they need experienced engineers who've scaled systems.
- **Growing the developer marketplace.** The $1M Challenge brought 3,329 new Actors. Now they need to maintain quality, improve discoverability, and keep developers earning on the platform.
- **AI/LLM integration.** MCP server launch signals a push into AI agent tooling. They need engineers who understand both scraping infrastructure AND AI pipelines.
- **Team leadership.** Engineering Team Lead role is open — they're growing teams and need experienced people managers who can also write code.
- **Frontend modernization.** After the massive backend migration, the frontend (React/Next.js) needs continued investment — design systems, animations, DX.

### How Doug Solves It

| Their Need | Doug's Relevant Experience |
|-----------|--------------------------|
| Scaling platform from startup to growth stage | Built and scaled systems at getBenson (25M monthly sessions), Vouchernaut (250k monthly sessions, 10k+ brands) |
| Developer marketplace growth | Built automation NPM packages (understands developer ecosystem), led growth from 0 to 1M players at Patrianna |
| AI/LLM integration with scraping | Featured in MIT Generative AI course (50k+ students), building agentic workflows, deep scraping expertise |
| Engineering team leadership | Led 9-person engineering team at Patrianna, cross-functional team at Mekamon, consultant leadership at withSeismic |
| TypeScript/Node.js full-stack | 15+ years engineering, TypeScript is primary language, React (8yr), Next.js, Node, NestJS experience |
| Frontend quality & design systems | Long React history, Framer/design tool experience, animation and interaction work |

### First 90 Days Sketch

**Month 1:** Onboard into the Engineering Team Lead role. Learn the Actor platform architecture, API layer, and data storage systems. Ship a small improvement to demonstrate technical capability. Build relationships with direct reports and peer team leads.

**Month 2:** Identify the highest-leverage scaling challenge (likely the MongoDB sharding or API performance) and propose a plan. Start contributing to the engineering culture discussions (frontend/backend symposiums). Begin shaping the team's Q2 roadmap.

**Month 3:** Execute on the scaling initiative. Introduce any process improvements from experience (retrospectives, code review practices, incident response). Potentially contribute to the AI/MCP integration efforts given scraping domain knowledge. Present findings to the broader engineering org.

---

## Proposed Angles

1. **Scraping Domain Expert** (Technical)
   "I've been building web scraping and automation tools for years — including Vouchernaut, which automated affiliate data extraction across 10,000+ brands at scale. I read Marek's engineering retrospective about the Meteor-to-NestJS migration and the MongoDB scaling challenges at 40M monthly runs. I've dealt with similar scaling inflection points and would love to discuss how the platform architecture is evolving as you push into AI data pipelines."

2. **Team Builder at Scale** (Business)
   "Congrats on the $25M ARR milestone and the incredible $1M Challenge results — 3,329 Actors from 704 developers is a serious community flywheel. I noticed the Engineering Team Lead opening for the Foundation Engineering team. At Patrianna, I built and led a 9-person growth engineering team that took a product from zero to 1M players, and I'm looking for exactly this kind of ownership over a revenue-critical technical surface."

3. **Prague Local + TypeScript Native** (Network/Practical)
   "I'm based here in Prague and have been following Apify since the early days — the Crawlee ecosystem and the MCP server launch are exactly the kind of developer tooling I geek out about. As someone who's spent 15 years in TypeScript/Node.js and authored automation NPM packages, the Engineering Team Lead role in Foundation Engineering feels like a natural fit. Would love to grab a coffee at Lucerna Palace and chat about where the platform is heading."

---

## Notes

- **Salary transparency is missing.** Apify doesn't post salary ranges. Prague market for senior engineers is roughly CZK 1.4M-2.2M/year (~EUR 57k-90k). Glassdoor reviews mention "compensation" as one of the few negatives, though also mention stock options and profit sharing. Worth negotiating carefully — Doug's experience level should command top-of-band or above.
- **Hybrid model.** Apify is hybrid in Prague (Lucerna Palace office). Doug being in Prague is a significant advantage — many roles require CZ residency.
- **The Engineering Team Lead role reports directly to the CTO** (Marek Trunkat), which is excellent for visibility and influence.
- **Risk factors:** Low. No layoffs, growing revenue, strong culture scores, expanding team. The main question is whether compensation will match Doug's expectations given CZ market rates vs. Western European/remote rates.
- **Timing:** Multiple roles open NOW. This is the right moment to reach out.

---

*Generated by company-deep-dive skill. Verify key facts before using in outreach.*
