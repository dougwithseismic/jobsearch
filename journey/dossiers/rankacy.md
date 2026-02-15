# Rankacy — Deep Dive Dossier

**Last Updated:** 2026-02-15
**Priority Tier:** 2
**Overall Assessment:** Czech gaming AI startup building proprietary behavioral analytics from CS2 data. Interesting vertical fit (gaming), close proximity (Ostrava, 2hr from Prague), and ambitious expansion plans into B2B behavioral AI. Python-heavy backend limits direct stack overlap, but growth engineering, data platform, and analytics expertise translate well.
**Existing Relationship:** No

---

## Current Openings

| Role | Category | Location | Type | Level | Link |
|------|----------|----------|------|-------|------|
| 2D & 3D Frontend Developer | Front-end | Ostrava (Onsite) / Remote | Full-time / Part-time | Junior / Medior | [View](https://rankacy.com/careers) |
| Director of Finance | Management | Prague / Ostrava (On-site) | Full-time | Senior | [View](https://rankacy.com/careers) |
| LLM Engineer | AI | Ostrava (Onsite) | Full-time | Medior | [View](https://rankacy.com/careers) |
| ML/AI Engineer | AI | Ostrava (Onsite) | Full-time | Medior | [View](https://rankacy.com/careers) |
| Senior Computer Vision Engineer | AI | Ostrava (Onsite) | Full-time | Senior | [View](https://rankacy.com/careers) |
| Senior UX Designer | Design | Ostrava (Onsite) / Remote | Full-time / Part-time | Senior | [View](https://rankacy.com/careers) |
| Founding Back-End Engineer | Back-end | Ostrava (Onsite, 6mo minimum) | Full-time | Senior | [LinkedIn post](https://www.linkedin.com/posts/michal-fogelton_at-rankacy-we-need-a-founding-back-end-engineer-activity-7310687754722398208-Kxa9) |
| Open Application | Any | Ostrava / Remote | Full-time / Part-time | All levels | [View](https://rankacy.com/careers) |

**Note:** No dedicated "growth engineer" or "full-stack TypeScript" role currently listed, but the Founding Back-End Engineer and Open Application are avenues. The Director of Finance role in Prague is notable — it confirms they have a Prague presence. The company is clearly in a heavy hiring phase across AI, engineering, and design.

## Recent Activity (Last 6 Months)

- **Mobile app launched** (December 22, 2025) — Android app for CS2 stats on the go
- **POSITIV Business & Style magazine feature** — CEO Michael Blazik interviewed about expanding AI beyond gaming into industry transformation
- **50,000+ users milestone** reached on the platform (up from 40K during alpha)
- **TOP 4 startup of 2025** in the Moravskoslezsky region (Innovate Moravia recognition)
- **Founding Back-End Engineer search** launched (LinkedIn, ~March 2025) — signals scaling the core platform
- **Steam Workshop integration** — Released "Rankacy - Basic Training" and "Rankacy - Aim Hub" workshop maps
- **200+ TB of gameplay data** processed (1,600 years of gameplay as of mid-2025)
- **Professional endorsement** — CS2 pro STYKO publicly endorsed the platform
- **rankacy.ai B2B arm** — Positioning their GPRT model for enterprise applications (game developers, behavioral analytics)
- **Published research** — Team published CLaRa paper on cost-effective LLM function calling (MENDEL journal)

## Tech & Engineering

**Stack:**
- **Backend:** Python (primary), microservices architecture, AWS
- **AI/ML:** Custom neural networks, transformers, cross-attention mechanisms, proprietary GPRT model
- **Data:** 200+ TB gameplay data, custom parser for frame-by-frame analysis, ChromaDB (vector DB for LLM optimization)
- **Frontend:** Web platform (specific framework unconfirmed — likely React based on job listings for 2D/3D frontend)
- **Mobile:** Android app (com.rankacy.mobile)
- **Gaming Integration:** Steam Workshop maps, Valve demo parser
- **LLM:** OpenAI API integration, CLaRa framework for cost-effective function calling
- **Research:** Python 3.11.7, Pydantic, published academic work

**Engineering Blog:** None found (they have a general blog at rankacy.com/blog focused on CS2 tips and content)
**GitHub Org:** [github.com/Rankacy](https://github.com/Rankacy) — 1 public repo (CLaRa: cost-effective LLM function calling via vector DB)
**Culture Signal:** Startup energy, "break the rules, build the future" ethos. Young team from VŠB-TUO. International conferences. Gaming-first culture. Emphasis on learning and edge projects. The careers page mentions "learn or get left behind" and "projects on the edge — build stuff nobody's tried before."

The engineering approach centers on building proprietary AI rather than using off-the-shelf solutions. They train custom models on millions of behavioral patterns. The CTO (Miloslav Szczypka) is a PhD researcher and lecturer, which suggests a research-oriented engineering culture. Their published CLaRa paper demonstrates academic rigor — they reduced LLM token consumption by 210% through vector DB-based function routing.

## Key Contacts

| Name | Title | LinkedIn | Recent Content | Why Them |
|------|-------|----------|----------------|----------|
| Michael Blazik | CEO & Co-founder | [LinkedIn](https://www.linkedin.com/in/michael-blazik/) | Magazine interviews, expansion vision posts | Decision maker, drives company vision, passionate about proving Central European AI |
| Miloslav Szczypka | CTO & Co-founder, AI/ML/LLM Architect | [LinkedIn](https://www.linkedin.com/in/miloslav-szczypka/) | Published research (CLaRa), PhD researcher | Technical decision maker, would evaluate eng candidates, academic credibility |
| Michal Fogelton | Interim Head of Talent Acquisition | [LinkedIn](https://www.linkedin.com/in/michal-fogelton/) | Posted Founding Back-End Engineer role | Hiring gatekeeper, best first point of contact for applications |
| Lukas Jochymek | NLP Engineer | [LinkedIn](https://www.linkedin.com/in/luk%C3%A1%C5%A1-jochymek-421638212/) | CLaRa paper co-author | Technical team member, could provide inside perspective |
| Emanuel Dopater | Data Analyst | [LinkedIn](https://www.linkedin.com/in/emanuel-dopater-50b442176/) | — | Data team member |
| Daniel Gavlas | Engineer (studying at VŠB-TUO) | [LinkedIn](https://www.linkedin.com/in/danielgavlas20/) | — | Engineering team |

**Recommended first contact:** Michal Fogelton (Interim Head of Talent Acquisition) — he's actively posting about open roles and is the hiring gatekeeper. Alternative: Michael Blazik (CEO) directly, given the company is small enough that the CEO is still involved in hiring decisions and Doug's profile is senior enough to warrant a direct approach.

## Pain Points & Opportunities

### What They Need

Based on their stage, hiring patterns, and product trajectory:

1. **Platform scaling** — They're processing 200+ TB of data and growing. The "Founding Back-End Engineer" search specifically calls for someone to "architect, optimize, and scale the platform from the ground up." This signals they've outgrown their initial architecture.

2. **Growth engineering** — 50K users is decent but modest for a freemium gaming tool. Their pricing is low (EUR 3.99-7.99/mo). They need to convert free users to paid, reduce churn, and accelerate user acquisition. No current growth/marketing engineering hire listed.

3. **B2B product development** — rankacy.ai is their next frontier: selling behavioral AI to game developers and eventually industries like defense, healthcare, and education. This requires a completely different product motion — enterprise dashboards, APIs, developer experience, sales engineering.

4. **Web platform maturity** — Their current frontend hire is "2D & 3D Frontend Developer (Junior/Medior)" — they need senior-level platform engineering to build the web experience that matches their AI sophistication.

5. **Data-driven monetization** — With 200TB of behavioral data and 7M analyzed players, they're sitting on a gold mine of insights. They need someone who understands how to package data products for both consumers and enterprises.

### How Doug Solves It

Doug's experience maps to several critical needs:

- **Growth engineering expertise** — Doug took Patrianna's game studio from 0 to 1M players. Rankacy has 50K users and needs to 10-20x that. His growth playbook from gaming (Patrianna), consumer products (Contra, Groupon), and content (Motley Fool) directly applies. He knows how to build conversion funnels, optimize onboarding, and drive viral loops in gaming contexts.

- **Scraping & automation background** — Vouchernaut processed data for 10,000+ brands at scale. Doug's NPM automation packages and withSeismic consulting demonstrate he can build reliable data pipelines. Rankacy needs to scale their data processing and match analysis infrastructure.

- **SEO & content-led growth** — DinnersWithFriends.co.uk and Vouchercloud performance marketing experience. Rankacy has a blog but no apparent SEO strategy. With 50K users and growing, organic search could be a major acquisition channel for gaming tools.

- **Team building** — Doug built a 9-member team at Patrianna and led cross-functional teams at Mekamon. Rankacy is ~30 people and growing fast. They'll need engineering leadership as they scale.

- **B2B product experience** — getBenson.com protected 25M monthly sessions and onboarded 80+ brands. This B2B SaaS experience maps directly to rankacy.ai's enterprise ambitions.

- **3x exits signal** — getBenson (2023), Vouchernaut (2021), Vouchercloud (NASDAQ acquisition) demonstrate Doug can build things that have commercial value, which matters for a startup seeking product-market fit on the B2B side.

- **Technical overlap** — While Rankacy is Python-heavy, Doug's TypeScript/React/Node expertise is relevant for the frontend platform, developer tools, and API layer. His growing C++ work also aligns with gaming infrastructure.

### First 90 Days Sketch

**Days 1-30: Assess & Quick Wins**
- Audit the current web platform architecture, user funnel, and conversion metrics
- Identify the biggest leaks in the free-to-paid conversion pipeline
- Set up proper analytics tracking if not already in place (growth eng fundamentals)
- Get familiar with the GPRT model capabilities and the data pipeline
- Ship 2-3 quick wins on the web platform (onboarding improvements, CTA optimization)

**Days 31-60: Growth Infrastructure**
- Build an experimentation framework for A/B testing features and pricing
- Design the growth loop: match analysis -> highlights -> social sharing -> new users -> match analysis
- Start SEO/content strategy for CS2-related searches (massive organic opportunity)
- Prototype the rankacy.ai developer dashboard and API documentation
- Establish engineering practices for the web platform (CI/CD, monitoring, testing)

**Days 61-90: Scale & Strategy**
- Launch first growth experiments targeting 2-3x user acquisition rate
- Ship v1 of the rankacy.ai B2B platform with developer onboarding
- Propose a data product strategy: what insights can be packaged for game developers?
- Build the case for expanding beyond CS2 (Valorant, Dota 2, etc.) based on data
- Present a 6-month growth roadmap to leadership with clear KPIs

## Proposed Angles

1. **Michael Blazik (CEO)** — "I've been following what you're building at Rankacy from Prague — the GPRT model and the behavioral AI expansion beyond gaming is exactly the kind of problem I love working on. At Patrianna, I took a gaming studio from zero to 1M players as Lead Growth Engineer. I'd love to chat about how growth engineering could accelerate both rankacy.com's user acquisition and rankacy.ai's enterprise traction."

2. **Miloslav Szczypka (CTO)** — "Your CLaRa paper on cost-effective LLM function calling caught my attention — reducing token consumption by 210% through vector DB routing is clever work. I've been building automation tooling and agentic workflows for years, and I'm currently deep into Source 2 modding and LLM tooling. Would be great to compare notes on scaling AI infrastructure — especially interested in how you're handling the 200TB+ data pipeline."

3. **Michal Fogelton (Head of Talent)** — "I saw your post about the Founding Back-End Engineer role. While my primary stack is TypeScript/React/Node, my experience might be relevant from a different angle: I've built growth engineering teams and scaled data-heavy platforms (getBenson protected 25M sessions/month, Vouchernaut processed 10K+ brands). Happy to discuss whether there's a growth-focused engineering role that could help Rankacy scale from 50K to 500K users."

## Notes

**Positives:**
- Czech-based (Ostrava, ~2hr train from Prague). Director of Finance role lists Prague as a location option.
- Gaming vertical is a perfect interest match for Doug (Source 2 modding, gaming tools)
- Ambitious vision (behavioral AI beyond gaming), not just a CS2 stats tracker
- Small enough team (~30) that a senior hire would have real ownership and impact
- Published academic research (CLaRa) signals intellectual depth
- Growing fast — multiple open roles across AI, engineering, and design
- Pro player endorsements and 50K+ users show real traction

**Concerns:**
- Python-heavy backend — Doug's TypeScript/React stack has limited direct overlap on the backend side
- Early stage with unclear funding runway — only a British angel investor mentioned publicly, no known VC round
- Ostrava-based with onsite preference for most roles (6-month onsite for Founding Back-End Engineer)
- Small Trustpilot review set (3.9 rating, ~18 reviews) — mixed user feedback on training features
- No current "growth engineer" or "senior full-stack" role listed — would need to pitch a new position
- Revenue model is low-ARPU consumer subscriptions (EUR 3.99-7.99/mo) — need to see B2B traction for sustainability
- "Learn or get left behind" culture messaging could signal intense pace expectations

**Open Questions:**
- What is their current MRR/ARR and funding runway?
- Is there appetite for a growth engineering function, or are they purely AI/ML focused in hiring?
- How far along is rankacy.ai (the B2B arm)? Is it generating revenue?
- Would they consider a remote/hybrid arrangement for a senior Prague-based hire?
- What is the team culture really like day-to-day? (No Glassdoor data to reference)
- Are they planning to expand beyond CS2 to other games?

**Timing:** Good. They're in an active hiring phase with 7+ open roles. The company is at an inflection point — transitioning from gaming tool to AI platform company. A growth-minded senior engineer could have outsized impact right now.

---
*Generated by company-deep-dive skill. Verify key facts before using in outreach.*
