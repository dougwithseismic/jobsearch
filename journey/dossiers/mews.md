# Mews -- Deep Dive Dossier

**Last Updated:** 2026-02-15
**Priority Tier:** 1 (Hot)
**Overall Assessment:** Prague-based $2.5B unicorn with 800+ employees, actively hiring frontend and staff engineers, heavily investing in agentic AI, and running a React/TypeScript stack that maps directly to Doug's core expertise. The combination of location (same city), tech fit, company trajectory, and AI/automation ambitions makes this the highest-opportunity target.
**Existing Relationship:** No

---

## Current Openings

| Role | Team | Link | Posted | Salary | Doug Fit |
|------|------|------|--------|--------|----------|
| Mid/Senior Frontend Engineer | Cross-functional team | https://developers.mews.com/career/mid-senior-frontend-engineer/ | Active | Not posted (est. CZK 1-2M/yr per Levels.fyi) | **Strong** -- TypeScript, React, Redux, styled-components. 8yr React experience is a direct match. Mentoring junior devs is expected. |
| Staff Software Engineer | Architecture/Platform | https://www.mews.com/en/careers/jobs | Active | Not posted | **Strong** -- Cloud-native systems design, mentoring engineers, architectural strategy. Doug's 15yr experience and team leadership fits staff-level. |
| Engineering Manager (Fintech) | Payments team (6-9 engineers) | https://www.mews.com/en/careers/jobs | Active | Not posted | **Moderate** -- People management focus. Doug has team-building experience (Patrianna, Mekamon) but this is payments/fintech-adjacent, not his preference. |

**Notes:** Mews has ~11 open positions at any given time. The Senior Frontend and Staff Engineer roles are the strongest matches. Mews is a Best Places to Work 2026 winner and Great Place to Work certified in CZ and UK.

## Recent Activity (Last 6 Months)

- **Jan 2026:** Closed $300M Series D led by EQT Growth (with Atomico, HarbourVest, Kinnevik, Battery Ventures, Tiger Global). Valuation now $2.5B. Funds earmarked for AI, payments expansion, and international growth.
- **Nov 2025:** Published "Agentic AI for Hotels" report -- outlining how autonomous AI agents will manage day-to-day hotel operations, optimize revenue, and personalize guest experiences.
- **Oct 2025:** Acquired DataChat, a US-based generative AI analytics platform, to build fully agentic hospitality systems where AI agents autonomously manage operations.
- **2025 Full Year:** SaaS gross profit grew 55%. Platform processed $19.7B in transaction volume. 42M+ bookings handled. Grew from ~12,500 to 15,000 customers across 85 countries (85% YoY growth). Revenue hit $200M+.
- **No layoffs reported.** Mews appears to be in aggressive growth mode with no restructuring signals.

## Tech & Engineering

**Stack:** TypeScript, React, Redux, styled-components, TanStack Query, TanStack Router, Vite, Rspack, Nx, fp-ts, Effect, zod, GitHub, Azure DevOps (CI/CD), C# (backend via FuncSharp), Kotlin (mobile via BLoC pattern), Flutter, Terraform, MSSQL
**Engineering Blog:** https://developers.mews.com/ -- Active. Publishes detailed technical content on React architecture, scaling, and engineering leadership.
**GitHub Org:** https://github.com/MewsSystems -- 22 public repos. FuncSharp (C# functional programming), Kotlin BLoC, Flutter packages, Terraform providers, Connector API docs.
**Open Source Activity:** Moderate. Open-source functional programming libraries (FuncSharp), Flutter packages, and API documentation. Not a major OSS presence but demonstrates engineering investment.
**Culture Signal:** **Mature & thoughtful** -- Detailed engineering blog posts on React scaling, architecture principles, testing pyramids, and code review practices. Design token-based component library. TypeScript migration in progress. Monorepo with circular import detection. ESLint + Prettier enforced.

The engineering org is substantial (~200+ engineers based on growth from 170 in 2022). Teams are cross-functional (6-9 engineers per team). They use Suspense boundaries with pre-fetching, TanStack Router for type-safe routing, and have a custom component library with design tokens. Testing follows a decomposed triangle approach (unit, integration, E2E) with focus on pipeline speed. They explicitly value "teams shipping independently" and modular architecture.

**Key architectural detail:** Backend is primarily C# (.NET) with frontend in React/TypeScript. This means Doug would likely be strongest in a frontend-heavy or full-stack-leaning-frontend role, though his Node.js experience could be relevant for tooling/services.

## Key Contacts

| Name | Title | LinkedIn | Recent Content | Why Them |
|------|-------|----------|----------------|----------|
| Pepa Starychfojtu | Chief Product & Technology Officer | https://www.linkedin.com/in/starychfojtu/ | Mews Unfold presentations, AI in hospitality talks | Top technical leader. Started as backend dev, worked up to CPTO. Understands the engineering culture deeply. |
| Ryan Tomlinson | VP Engineering, Platforms | https://www.linkedin.com/in/ryan-c-tomlinson/ | Engineering leadership content | Platforms VP -- likely oversees the infrastructure and tooling teams. Prior experience at Salesforce, OpenTable. |
| Conor Winders | VP Product & Engineering | https://www.linkedin.com/in/conorwinders/ | Mews Unfold talk on AI in hospitality | Product-engineering bridge. Spoke about making the platform "more intelligent, more intuitive." |
| Petr Bambusek | Senior Staff Engineer, Head of Frontend | https://theorg.com/org/mews/org-chart/petr-bambusek | Mews Developers blog contributions | Head of Frontend since 2013. Longest-tenured frontend engineer. Would be a direct peer or hiring manager for frontend roles. |

**Recommended first contact:** Petr Bambusek -- As Head of Frontend and Senior Staff Engineer, he's the most directly relevant technical leader for Doug's skillset. He's been at Mews for 10+ years and likely has significant influence over frontend hiring decisions. The Mews Developers blog gives Doug a natural conversation hook.

## Pain Points & Opportunities

### What They Need
- **Agentic AI integration across the platform:** After acquiring DataChat and publishing their Agentic AI report, Mews is going all-in on autonomous AI systems. They need engineers who understand LLM integration, agentic workflows, and can build AI-powered features into the existing React/TypeScript frontend.
- **Scaling frontend architecture:** With 15,000 customers and rapid growth, the frontend needs to scale. Their blog post on "Scaling React for Delivery and Performance" suggests this is an active challenge.
- **TypeScript migration completion:** They're migrating to TypeScript with "current adoption around one third of the codebase." This is a multi-year effort needing experienced TypeScript engineers.
- **Payment/fintech infrastructure:** $19.7B in transaction volume means payments reliability is critical. They're expanding Mews Payments as a core product.
- **Team scaling & mentoring:** With 800+ employees and aggressive growth, they need senior engineers who can mentor and help onboard new hires without slowing delivery.

### How Doug Solves It
- **Agentic AI / LLM expertise:** Doug is building agentic workflows and was featured in MIT's Generative AI course (50k+ students). This is exactly the skillset Mews needs as they embed AI agents across hotel operations.
- **React/TypeScript at scale:** 8 years of React, deep TypeScript expertise, experience with monorepo architecture (Turborepo). Doug has solved exactly the scaling challenges Mews is writing blog posts about.
- **Growth engineering + data:** Led growth from 0 to 1M players at Patrianna. Built systems protecting 25M monthly sessions at getBenson. Mews needs this growth mindset as they scale from 15k to 50k+ customers.
- **Team building & mentoring:** Built and led a 9-member team at Patrianna, cross-functional team at Mekamon. Mews cross-functional teams of 6-9 engineers match Doug's experience perfectly.
- **Automation & tooling:** Author of NPM automation packages. Mews' emphasis on DX investment and engineering productivity aligns with Doug's automation background.

### First 90 Days Sketch
- **Month 1:** Onboard to the React/TypeScript codebase. Contribute to the TypeScript migration effort. Get familiar with the monorepo structure, CI/CD pipeline (Azure DevOps), and component library. Ship a meaningful PR within the first two weeks.
- **Month 2:** Take ownership of a feature area. Start contributing to the agentic AI integration work -- potentially building React-based interfaces for AI agent configuration or analytics dashboards (connecting to DataChat). Identify and fix a frontend performance bottleneck.
- **Month 3:** Lead a small initiative -- potentially around improving the developer experience for the frontend monorepo, or prototyping a new AI-powered feature. Begin mentoring 1-2 junior engineers. Present a technical proposal to the broader engineering team.

## Proposed Angles

1. **Agentic AI Expertise** (Technical)
   "Your acquisition of DataChat and the agentic AI report caught my eye -- I've been building agentic workflows with LLMs and was featured in MIT's Generative AI course that reached 50k+ students. I'd love to discuss how you're thinking about embedding autonomous AI agents into the React frontend and what the developer experience looks like for building those integrations."

2. **Prague-Based Growth Engineer** (Business)
   "Congrats on the $300M Series D and hitting $200M revenue -- impressive trajectory. I'm based here in Prague and have spent the last 15 years at the intersection of growth engineering and product -- including taking a gaming product from zero to 1M players. I'd be interested to discuss how the growth engineering function works at Mews as you scale toward 50k+ properties."

3. **React at Scale** (Technical)
   "I read the Mews Developers blog post on scaling React for delivery and performance -- the approach to TanStack Router with type-safe routing and Suspense boundaries resonated with how I've been structuring large React apps. I've been working with React for 8 years including monorepo setups with Turborepo, and I'd enjoy comparing notes with your frontend team on TypeScript migration strategies."

## Notes

- **Red flags:** None significant. Glassdoor is 4.0 (solid but not exceptional). Some reviews mention workload can feel overwhelming ("always more to do than you'll have time for"). This is typical of a fast-growing startup.
- **Backend is C#:** Doug's core backend experience is Node/Express, not C#. For a truly full-stack role, there could be a gap. However, the frontend roles (Senior Frontend, Staff Engineer) play directly to his strengths.
- **Salary consideration:** CZK 1-2M/yr (roughly EUR 40-80k) for Software Engineer at Mews in Prague. Staff-level could be higher. Czech salaries are generally lower than Western Europe, but cost of living is also lower. Equity is offered as a benefit.
- **Timing is excellent:** Fresh $300M raise, AI push, active hiring. This is the ideal moment to approach.
- **Cultural fit:** Unlimited holiday, Great Place to Work certified, MewsCon (annual gathering). Values: ambitious, resilient, curious, open, human.

---

*Generated by company-deep-dive skill. Verify key facts before using in outreach.*
