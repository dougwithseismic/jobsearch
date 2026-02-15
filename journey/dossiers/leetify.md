# Leetify -- Deep Dive Dossier

**Last Updated:** 2026-02-15
**Priority Tier:** 2
**Overall Assessment:** High-passion, small-team gaming analytics company at a genuine inflection point (expanding from CS2 to LoL and beyond). Strong cultural fit for Doug's gaming interests and growth engineering background, but no engineering roles currently posted and limited funding runway. Best approached as a speculative outreach to the CTO.
**Existing Relationship:** No

---

## Current Openings

| Role | Team | Link | Posted | Salary | Doug Fit |
|------|------|------|--------|--------|----------|
| Head of Operations | Operations / CEO Office | leetify.teamtailor.com/jobs | Recent | Not posted | Weak -- operations/admin role, not engineering |

No engineering roles are currently posted. Leetify's careers page (leetify.com/careers) and TeamTailor board show only the Head of Operations position. Historical postings show they have previously hired full-stack developers (a past listing on TheHub.io referenced a full-stack developer role for their esports startup). Given the team size (~19 people), engineering hires likely happen through network/referral rather than public postings.

**Hiring pattern:** Leetify appears to hire opportunistically rather than on a fixed schedule. With $2.5M seed raised in Nov 2023 and no subsequent round announced, they are likely being conservative with headcount. The Head of Operations hire suggests the CEO (Anders Ekman) is trying to offload operational work to focus on product/growth -- which is exactly the inflection point where a senior growth engineer becomes valuable.

## Recent Activity (Last 6 Months)

- **Dec 2025:** Launched Leetify Recap 2025 -- personalized annual stats review for CS2 players. Viral engagement mechanic (shareable recap pages).
- **2025:** Expanded to League of Legends -- first game beyond CS2. Leetify Rating now available for LoL matches, unified friend-following across games.
- **2025:** New Home page launched -- focused on accomplishments, rankups, and highlights tracking.
- **2025:** Leetify Rating recalibrated for CS2 -- updated rating system with new benchmarks.
- **Late 2024:** Published 2024 roadmap outlining multi-game expansion strategy.
- **Nov 2023:** Raised $2.5M Seed round led by Alpine and Antler. Total funding: $3.48M across 2 rounds from 9 investors (including Inventure).
- **No layoffs, no acquisition rumors, no red flags detected.**

The LoL expansion is the most significant strategic move. It signals Leetify is positioning as a multi-game analytics platform, not just a CS2 tool. This is the growth engineering challenge -- building a scalable platform architecture that supports multiple game integrations.

## Tech & Engineering

**Stack:** Web platform, data analytics, AI/ML. Based on GitHub repos and CTO background: JavaScript/TypeScript, PostgreSQL (pgcopydb fork), Node.js. CS2 demo parsing (JavaScript). Chrome extension (TypeScript). The CTO (Vitalii Zurian) has deep PHP/Symfony background but the product appears to be primarily JS/TS.
**Engineering Blog:** leetify.com/blog -- product-focused blog, not deep technical content. Anders Ekman (CEO) is primary author.
**GitHub Org:** github.com/leetify -- 7 public repos
**Open Source Activity:** Limited. Mostly forks of tools they use (pgcopydb, demofile, node-steam, ValveResourceFormat). One original Chrome extension (archived).
**Contribution Opportunity:** Low
**Culture Signal:** Moving fast -- small team shipping product rapidly, expanding to new games. Limited public engineering writing.

The tech stack leans heavily on game data parsing (demo files, Steam APIs) and analytics. The ValveResourceFormat fork is interesting -- it is a Source 2 resource file parser, directly relevant to Doug's Valve Source 2 modding side project. The pgcopydb fork suggests PostgreSQL at scale for match data.

Engineering culture signals are thin for a 19-person team. No public engineering blog posts, no conference talks found, no significant open-source contributions. This is typical of a small seed-stage gaming startup -- heads down shipping, not writing about it.

### GitHub Contribution Analysis

No actionable GitHub contribution path found. The repos are mostly archived or forked utilities. The Chrome extension (leetify-gcpd-upload) is archived. The demofile and node-steam forks are unmaintained. There are no open issues in Doug's stack.

**However:** The ValveResourceFormat fork (Source 2 resource parser) is directly aligned with Doug's Source 2 modding side project. This is not a PR opportunity but a conversation starter -- Doug can reference his own Source 2 work when reaching out.

## Key Contacts

| Name | Title | LinkedIn | Recent Content | Why Them |
|------|-------|----------|----------------|----------|
| Vitalii Zurian | CTO & Co-founder | linkedin.com/in/vitaliizurian | No public blog/talks found. Active GitHub (79 repos, PHP/JS). | Technical decision-maker. Direct path to engineering hiring decisions. |
| Anders Ekman | CEO & Co-founder | linkedin.com/in/datanders | LinkedIn posts about Leetify roadmap. Active on X (@leetAnders). Blog posts on leetify.com. | Approachable -- writes publicly about the company. Former Swedish CS national team player. |

**Recommended first contact:** Anders Ekman -- more publicly active than the CTO, writes about the company's direction, and as CEO of a 19-person startup, he is directly involved in all hiring decisions. His background as a competitive CS player means he will respond well to genuine gaming/esports enthusiasm.

## Pain Points & Opportunities

### What They Need

- **Multi-game platform architecture:** Expanding from CS2 to LoL (and presumably more games) requires building a scalable data ingestion and analytics pipeline that is game-agnostic. This is a significant engineering challenge.
- **Growth engineering:** 200k+ MAU to 500k+ requires deliberate growth tactics -- virality mechanics (the Recap feature is a good start), onboarding optimization, retention loops, referral programs.
- **Web platform maturity:** As they add games and features, the frontend complexity grows. They need someone who can build robust, performant web experiences at scale.
- **Team scaling:** At 19 people, they are at the point where engineering processes start mattering -- code review culture, CI/CD, testing, documentation. A senior hire who has done this before is extremely valuable.
- **Revenue diversification:** Likely monetizing through premium subscriptions. Need to optimize conversion, reduce churn, build pricing infrastructure.

### How Doug Solves It

| Their Need | Doug's Relevant Experience |
|-----------|--------------------------|
| Multi-game platform growth | Led greenfield game studio from 0 to 1M players at Patrianna. Understands gaming user acquisition and retention at scale. |
| Viral growth mechanics | Growth engineering across Contra, Groupon, Motley Fool. Built the kind of shareable/viral features (like Recap) that drive organic growth. |
| Web platform at scale | 8 years React, deep Next.js. Built SaaS protecting 25M monthly sessions at getBenson. Can handle the frontend complexity of a multi-game analytics dashboard. |
| Data/automation expertise | Built Vouchernaut (affiliate automation for 10k+ brands). Author of automation NPM packages. Can build the data pipeline infrastructure for ingesting match data across multiple games. |
| Team building at inflection point | Hired and led 9-member team at Patrianna. Knows how to establish engineering practices while maintaining startup velocity. |

### First 90 Days Sketch

**Month 1:** Deep dive into the codebase and data pipeline architecture. Ship one meaningful improvement to the LoL integration or analytics dashboard. Build rapport with the team by contributing immediately.
**Month 2:** Propose and begin building a game-agnostic data ingestion framework. Start implementing growth experiments (onboarding flow optimization, referral mechanics). Establish basic engineering practices (PR review process, CI improvements).
**Month 3:** Launch first growth experiment results. Have the multi-game architecture POC running. Begin scoping the next game integration. Establish metrics dashboards for user growth and engagement.

## Proposed Angles

1. **Source 2 Modding Connection** (Technical)
   "I noticed your GitHub has a ValveResourceFormat fork -- I'm actively building a Valve Source 2 game modding platform as a side project and have been deep in the Source 2 tooling ecosystem. Combined with my experience scaling a game studio from 0 to 1M players at Patrianna, I'd love to chat about how you're approaching the multi-game expansion from CS2 to LoL and beyond."

2. **Growth at the Inflection Point** (Business)
   "The Leetify Recap feature is a brilliant viral growth mechanic -- reminds me of what we built at Patrianna when scaling from zero to 1M gamers. I've been thinking about what the next generation of growth loops looks like for gaming analytics platforms, especially as you expand beyond CS2. Would love to share some ideas."

3. **Gaming + Growth Engineering** (Technical/Business)
   "Your expansion to LoL signals a fascinating platform architecture challenge -- building game-agnostic analytics at scale. I've spent the last few years doing exactly this kind of growth engineering (scaling a game studio, building data automation for 10k+ brands at Vouchernaut, and now doing Source 2 modding). The intersection of gaming domain expertise and growth engineering is rare -- happy to chat about what I've learned."

## Notes

- **Funding runway concern:** $3.48M total raised with no round since Nov 2023. At 19 employees, they likely have 12-18 months of runway remaining (depending on revenue). A senior hire is expensive for them. Doug may need to be flexible on compensation or consider equity-heavy packages.
- **CTO tech background:** Vitalii Zurian's background is PHP/Symfony (Atlassian tools, Funding Circle). The product appears to have evolved to JS/TS. This is a potential friction point or an opportunity -- Doug's deep TypeScript expertise could be exactly what they need to modernize the stack.
- **Remote-friendly:** Fully remote company, which aligns with Doug's Prague location.
- **Size risk:** At 19 people, this is very early stage. Limited process, limited resources, but maximum impact per person.
- **The Source 2 connection is gold.** Doug's side project building a Valve Source 2 modding platform is a genuine, unique hook that no other candidate would have. Lead with this.

---

*Generated by company-deep-dive skill. Verify key facts before using in outreach.*
