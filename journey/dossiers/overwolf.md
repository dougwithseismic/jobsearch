# Overwolf -- Deep Dive Dossier

**Last Updated:** 2026-02-15
**Priority Tier:** 1 (Hot)
**Overall Assessment:** Gaming modding platform with 35M MAU and $100M ad revenue -- a direct match for Doug's Valve Source 2 modding interest and TypeScript/React expertise. The company is in aggressive growth mode (no layoffs, expanding EU presence, launching Scalibur programmatic product). The main concern is that most engineering roles are Israel-based, though EU remote may be possible given their expansion.
**Existing Relationship:** No

---

## Current Openings

| Role | Team | Link | Posted | Salary | Doug Fit |
|------|------|------|--------|--------|----------|
| Senior Full Stack Developer | Creator Tools | https://echojobs.io/job/overwolf-senior-full-stack-developer-rlwv2 | Active | Not posted | **Strong** -- React, AWS, TypeScript. Building tools for mod creators = direct match for Doug's Source 2 modding platform work. 2+ years React required (Doug has 8). |
| Software Engineer Tech Lead (Outplayed) | Outplayed (video/screen capture) | https://careers.overwolf.com/career/35.945 | Active | Not posted | **Strong** -- Lead the software team. TypeScript + C# required, React as bonus. Manages and mentors team. Doug's team leadership + gaming interest align well. |
| Team Lead Software Engineer (Outplayed) | Outplayed | https://careers.overwolf.com/career/DA.817 | Active | Not posted | **Strong** -- Shapes product roadmap, manages engineering team. Frontend + backend breadth required. |
| Engineering Manager (Outplayed) | Outplayed | https://builtin.com/job/engineering-manager-outplayed/8049765 | Active | Not posted | **Moderate** -- More management-focused. Doug has the experience but may prefer IC/hybrid roles. |
| Low Level Engineer | Core Platform | https://careers.overwolf.com/career/C2.A5D | Active | Not posted | **Moderate** -- Low-level infrastructure. Aligns with Doug's growing C++ interest but may be too specialized. |
| Full Stack Developer | Platform | https://echojobs.io/job/overwolf-full-stack-developer-8tjhx | Active | Not posted | **Strong** -- React + AWS + TypeScript. Platform development for gaming creators. |

**Notes:** 22+ open positions total. Multiple relevant engineering roles. The Senior Full Stack Developer and Tech Lead roles are the strongest matches. Most positions appear to be Ramat Gan (Israel) based with hybrid arrangements. EU remote status needs verification.

## Recent Activity (Last 6 Months)

- **Feb 2026:** Eyal Betzalel named COO of Overwolf Ads to support gaming media empire expansion. Will lead Scalibur programmatic product launch.
- **Feb 2026:** IAB ALM 2026 -- Overwolf on stage alongside Twitch and Microsoft, demonstrating industry standing.
- **Jan 2026:** Overwolf Developers Newsletter shows active platform development with new APIs and game integrations.
- **Q1 2026:** Scalibur programmatic product expected to debut -- extends Overwolf's reach beyond owned inventory into the open programmatic web.
- **Aug 2025:** Expanded European operations with Adam Davis (ex-Activision Blizzard) as Director of Brand Partnerships. EU team drove 385% revenue growth since entering EU market in 2024.
- **2025:** Paid out $300M+ to in-game creators. Named "Top Ad Tech Company" and "Best Gaming Platform" at ADWEEK Tech Stack Awards 2025. Won 5 awards at The Drum Awards 2025.
- **2024:** Doubled ad revenue from $50M to $100M. Goal: $1B payouts to creators by 2030.
- **No layoffs reported.** Company is in aggressive expansion mode with new leadership hires and product launches.

## Tech & Engineering

**Stack:** JavaScript/TypeScript, C#, React (community boilerplate), Electron.js (Overwolf Electron is a direct fork), Node.js, HTML/CSS, game integration APIs, C++ (low-level), Windows desktop app development
**Engineering Blog:** https://blog.overwolf.com/ -- Active but more product/business focused than deeply technical.
**Developer Docs:** https://dev.overwolf.com/ -- Comprehensive developer documentation for building Overwolf apps.
**GitHub Org:** https://github.com/overwolf -- Multiple public repos including sample apps, TypeScript type definitions, event sample apps, plugin DLLs, detection tools. TypeScript is a first-class citizen in the dev ecosystem.
**Open Source Activity:** Moderate. TypeScript type definitions, sample apps, and documentation are open source. The platform itself is proprietary but the developer tools ecosystem is open.
**Culture Signal:** **Moving fast** -- Gaming industry DNA. Playful job descriptions with Easter eggs. Strong creator-first mentality. Engineering focused on platform reliability for 35M MAU.

Overwolf's technical architecture is unique: it's a desktop platform (Electron-based) that overlays on PC games, providing APIs for in-game app development. The developer ecosystem supports TypeScript natively with comprehensive type definitions. Apps built on the platform use web technologies (JS/TS, React, Angular, Vue) running inside the Overwolf container. This means Doug's web technology expertise translates directly to Overwolf app development.

The Outplayed product (video/screen capture for gamers) is a standalone product within the Overwolf ecosystem and appears to be a major hiring focus based on multiple open roles.

## Key Contacts

| Name | Title | LinkedIn | Recent Content | Why Them |
|------|-------|----------|----------------|----------|
| Tom Wolf | VP of R&D | https://www.crunchbase.com/person/tom-wolf | N/A -- limited public content | Top technical leader since 2013. Oversees all R&D. The person to reach for engineering direction and culture. |
| Uri Marchand | CEO & Co-Founder | https://www.crunchbase.com/person/uri-marchand | Naavik podcast appearance, press interviews on creator economy and $1B payout goal | Vision-setter. Spoke on Naavik podcast about the guild for in-game creators. Public-facing and approachable. |
| Alon Rabinovitz | Co-Founder & CPO | N/A | Product strategy content | Owns product direction. Could be relevant for understanding where creator tools are heading. |
| Eyal Betzalel | COO, Overwolf Ads | https://www.exchangewire.com/blog/2026/02/05/eyal-betzalel-named-coo-of-overwolf-ads-to-support-gaming-media-empire-expansion/ | Recent appointment coverage | New hire leading Scalibur launch. Ad tech background. Less relevant for engineering but demonstrates company growth. |

**Recommended first contact:** Tom Wolf, VP R&D -- Though he has limited public content, he's been leading Overwolf's engineering since 2013 and would be the decision-maker for engineering hires. If Tom is unreachable, approaching through a Senior Full Stack Developer or Tech Lead already at Overwolf (find on LinkedIn) may provide a warmer path.

**Alternative approach:** Given the gaming/creator focus, Doug could also approach through the developer community -- building a small Overwolf app or mod tool and leveraging that as a conversation starter with the team. This would be a high-effort but high-impact differentiator.

## Pain Points & Opportunities

### What They Need
- **Scalable creator tools:** With 165,000 creators and $300M+ in payouts, the tools that creators use to build, distribute, and monetize need to be world-class. The Senior Full Stack Developer role is specifically about equipping creators with better tools.
- **Platform reliability at 35M MAU:** Desktop app + overlay + game integrations across 1,500+ games is technically challenging. Reliability and performance are constant battles.
- **Scaling ad tech infrastructure:** Doubling from $50M to $100M in ad revenue and launching Scalibur (programmatic) means the ad serving, analytics, and reporting infrastructure needs serious scaling.
- **European market expansion:** 385% EU revenue growth means the European team is growing fast and may need more engineering capacity.
- **Modernizing the tech stack:** Electron-based desktop app with web overlay technology. As games evolve (Source 2, Unreal Engine 5+), the integration layer needs constant updating.

### How Doug Solves It
- **Creator tools expertise:** Doug is building a Valve Source 2 modding platform right now. He understands the creator/modder mindset from the inside. His experience building Vouchernaut (tooling for 10,000+ brands) shows he can build platforms that serve large creator ecosystems.
- **Growth engineering for scale:** Took a gaming product from 0 to 1M players at Patrianna. Understands gaming metrics, engagement loops, and growth levers.
- **TypeScript/React mastery:** 8 years React, deep TypeScript. The Overwolf developer ecosystem is TypeScript-first, and the creator tools are web-based.
- **Automation & tooling:** Author of NPM automation packages. Can improve the developer experience for both internal teams and the 165k creator community.
- **Team leadership in gaming:** Led a 9-member growth team at a game studio (Patrianna). Understands gaming culture, shipping cadence, and the unique challenges of gaming products.

### First 90 Days Sketch
- **Month 1:** Onboard to the creator tools codebase. Build and ship a small Overwolf app to deeply understand the developer experience from the creator's perspective. Identify friction points in the creator toolchain that Doug can improve.
- **Month 2:** Take ownership of a creator tools feature -- potentially improving the dashboard, analytics, or monetization tools. Apply growth engineering principles to increase creator adoption and retention.
- **Month 3:** Lead a technical initiative to improve creator DX -- potentially building better TypeScript tooling, improving documentation, or creating templates that make it easier for new creators to ship their first app. Begin mentoring team members on React/TypeScript best practices.

## Proposed Angles

1. **Source 2 Modding Platform Builder** (Technical)
   "I'm currently building a Valve Source 2 game modding platform as a side project, so your creator tools really caught my attention. I led a gaming studio that grew from zero to 1M players, and I've been thinking about how the modding/creator tooling experience could be significantly improved with better TypeScript DX and automation. I'd love to discuss how you're evolving the creator platform."

2. **Growth Engineering for Gaming** (Business)
   "Doubling ad revenue to $100M and paying out $300M to creators is remarkable growth. At Patrianna, I led the growth engineering team that took a new game studio from zero to 1M players in under a year. I'm interested in how the creator-side growth engineering works at Overwolf -- specifically how you think about creator acquisition, retention, and monetization scaling."

3. **Creator Economy + Automation** (Technical/Business)
   "I built Vouchernaut, an automation platform serving 10,000+ brands with 250k monthly sessions -- similar in spirit to building tooling for a large creator ecosystem. With 165k creators on Overwolf and the Scalibur launch coming, there's a fascinating scaling challenge in creator tools that I'd love to dig into."

## Notes

- **Location concern:** Most engineering roles appear to be Israel-based (Ramat Gan). Doug is in Prague. Need to verify if remote EU is possible for engineering roles. The EU expansion is currently focused on business/sales roles (Adam Davis in Brand Partnerships). However, some roles list "hybrid" which could mean flexible.
- **Salary opacity:** No salary ranges posted. Israeli tech salaries can be competitive but EU remote may come with geographic adjustment.
- **Gaming culture fit:** Overwolf is deeply gaming-native. The job descriptions include Easter eggs and humor. Doug's gaming interest (Source 2 modding, Patrianna gaming studio) is a strong cultural signal.
- **C# requirement:** The Tech Lead role requires C# proficiency alongside TypeScript. Doug's primary backend languages are TypeScript/Node and Python, not C#. This could be a gap for some roles.
- **Outplayed focus:** Multiple Outplayed roles suggest this is a growth area. It's a video/screen capture app for gamers -- interesting product but potentially less aligned with Doug's modding interest than the core creator platform.
- **No recent funding:** Last major round was $75M in 2021. The company is profitable ($100M ad revenue) and hasn't needed new funding. This is a positive signal of business health but also means less cash influx for rapid hiring.
- **High opportunity:** The direct overlap between Doug's Source 2 modding project and Overwolf's core business is the strongest natural fit across all companies in the pipeline.

---

*Generated by company-deep-dive skill. Verify key facts before using in outreach.*
