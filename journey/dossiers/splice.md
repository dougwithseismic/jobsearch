# Splice — Deep Dive Dossier

**Last Updated:** 2026-02-15
**Priority Tier:** 2 (Warm)
**Overall Assessment:** Premier music tech company ($142.8M revenue, 330 employees) in an exciting strategic moment — acquired Spitfire Audio ($50M) and Kits AI, partnered with UMG on AI tools, CEO named TIME 100 AI. Strong culture (Glassdoor 4.4) with UK remote presence. However, current engineering roles are senior management and US-focused. Go-heavy backend is a stack gap for Doug. Best approached through the London/UK angle with a growth engineering pitch.
**Existing Relationship:** No

---

## Current Openings

| Role | Team | Link | Posted | Salary | Doug Fit |
|------|------|------|--------|--------|----------|
| Senior Manager, Engineering - Data | Data Engineering | job-boards.greenhouse.io/splice | Current | Not posted | **Moderate** — Engineering management role focused on data pipelines/analytics. Doug has leadership experience (9-person team at Patrianna) but this is data-specific, not product engineering. US-only. |
| Senior Manager, Product Engineering - Splice Sounds | Product Engineering | job-boards.greenhouse.io/splice | Current | Not posted | **Moderate-Strong** — Full-stack team leadership, DAW technologies, C++ and web. Doug's leadership matches, but C++ desktop/DAW focus is a gap. US-only. |
| Senior Product Manager, Growth | Product | job-boards.greenhouse.io/splice | Current | Not posted | **Moderate** — Growth role but PM not engineering. Doug's growth engineering experience is relevant but this isn't an IC engineering role. US-only. |
| Senior Director Marketing, Instruments | Marketing | job-boards.greenhouse.io/splice | Current | Not posted | **Weak** — Marketing role, UK-based though. |
| Senior Product Designer, Growth | Design | job-boards.greenhouse.io/splice | Current | Not posted | **Weak** — Design role. |

**Summary:** No current engineering IC roles that perfectly match Doug. The Senior Manager roles are management-track and US-focused. The most interesting signal is the Growth PM role — if a Growth Engineering role opened, that would be a direct hit. The UK-based marketing role confirms they have London operations (post-Spitfire Audio acquisition).

## Recent Activity (Last 6 Months)

- **Dec 2025:** **Universal Music Group partnership** — collaborating on next-generation AI-powered music creation tools for artists. Major industry validation.
- **Late 2025:** **Acquired Kits AI** — AI-powered voice production platform for music creators. Second acquisition in the AI music space.
- **Oct 2025:** Launched **Splice Instrument** — new virtual instrument platform built on Spitfire Audio's LABS. First move beyond samples into instruments.
- **Apr 2025:** **Acquired Spitfire Audio for ~$50M** — London-based premium orchestral sample library maker. Major expansion into the $640M plugin market.
- **2024:** Platform hit nearly **350 million downloads** across the year
- **Ongoing:** $142.8M revenue, ~330 employees across US and UK
- **Ongoing:** CEO Kakul Srivastava named to **TIME 100 Most Influential People in AI 2025**

**Past concern:** Multiple layoffs and reorgs (2022-2023). Glassdoor reviews from that era mention "layoffs, layoffs, layoffs." However, the company appears to have recovered strongly with strategic acquisitions and partnerships.

**Red flags:** Engineering culture has some concerning Glassdoor notes — "competition about who can be the smartest" on engineering/data teams, "procrastination on real tech debt," and "oppressively stodgy environment for creative contributors." These are worth probing.

## Tech & Engineering

**Stack:** Go (primary backend), Angular/TypeScript (web frontend), C++/C# (desktop/DAW), Objective-C (macOS), React (newer work), gRPC, Web Audio API, audio streaming infrastructure
**Engineering Blog:** splice.com/blog/category/engineering/ — exists but appears dormant (recent posts are years old, focused on Go language features)
**GitHub Org:** github.com/splice — limited public repos (superpowered-boilerplate-react is one)
**Open Source Activity:** **Minimal.** Not an open-source-first company. Engineering blog hasn't been active recently.
**Culture Signal:** **Mixed** — The company lives its DISCO values (Glassdoor 4.4, 87% recommend), but engineering culture has specific complaints about competitiveness and tech debt avoidance. Go-heavy backend is mature but not Doug's primary stack.

**Key architectural detail:** Splice uses a client/server architecture where the desktop app GUI communicates with a local Go server (which proxies to cloud APIs). This gRPC-based approach enforces separation of concerns. The web frontend has historically been Angular, though React appears in newer work.

**CTO Matt Aimonetti** (co-founder) is deeply technical — former sound engineer turned software engineer, Go advocate, has been CTO since 2013. He's written publicly about scaling engineering teams and the decision to build on Go.

## Key Contacts

| Name | Title | LinkedIn | Recent Content | Why Them |
|------|-------|----------|----------------|----------|
| Matt Aimonetti | CTO & Co-Founder | linkedin.com/in/mattaimonetti | Medium posts on engineering leadership, podcast appearances on Go and audio tech, personal blog at matt.aimonetti.net | Co-founder and technical leader. Sound engineer background means he'd appreciate a music tech conversation. Writes publicly — approachable. |
| Kevin Stewart | SVP Engineering | linkedin.com/in/kstewart | ELC Podcast on leading transformation and team empowerment at Splice | SVP Eng manages the engineering org. Ex-Adobe (Creative Cloud transition), ex-Fastly, ex-Harvest. Podcast appearance shows he's approachable. |
| Kakul Srivastava | CEO | linkedin.com/in/kakul | TIME 100 AI, Billboard interviews on AI strategy, Spitfire Audio acquisition press | CEO and public face. Ex-Adobe, ex-Flickr. Very visible but may not be the right first contact for an engineering conversation. |
| Steve Martocci | Co-Founder | linkedin.com/in/stevemartocci | Co-founder presence | Co-founder but less visible in current engineering conversations. |

**Recommended first contact:** Matt Aimonetti — as CTO and co-founder with a sound engineering background, he's the most likely to appreciate a technical conversation about music tech + engineering. His public writing and podcast appearances make him approachable. Kevin Stewart is the alternative if the goal is to discuss team structure and growth roles.

## Pain Points & Opportunities

### What They Need
- **Integrating acquisitions technically** — Spitfire Audio (London, C++/JUCE) and Kits AI need to be woven into the Splice platform. This is complex cross-platform, cross-team engineering work.
- **Growth engineering** — the Growth PM and Growth Designer roles signal they're building a dedicated growth function. A growth engineer to complement this team is a natural next hire.
- **Web platform modernization** — the blog posts suggest an older Angular/Go architecture. Moving toward React/modern JS for the web experience is likely ongoing.
- **AI integration at scale** — UMG partnership, Kits AI acquisition, and CEO's AI vision all point to needing engineers who can integrate AI into production music tools.
- **London engineering presence** — post-Spitfire Audio acquisition, they need engineering capacity in Europe/UK to work with the London team.

### How Doug Solves It
- **Growth engineering is Doug's superpower:** Led growth from 0 to 1M players at Patrianna. Growth engineering across Contra, Groupon, Motley Fool. The Growth PM role signals they want this function — Doug can be the engineering counterpart.
- **Music tech passion is real:** Doug cares about music tech and VSTs (listed as a top interest). His C++ side projects and game audio experience give him credibility in audio-adjacent engineering.
- **Cross-team integration experience:** At Patrianna, Doug led a 9-person cross-functional team. At Mekamon, he led go-to-market for a hardware+software product. He knows how to integrate different technical teams and ship cohesive products.
- **European engineering capacity:** Doug is Prague-based, perfect for collaborating with the London/Spitfire Audio team on European hours.
- **AI integration readiness:** MIT Generative AI course (50K+ students), agentic workflow experience. Can bridge AI and production engineering.

### First 90 Days Sketch
- **Month 1:** Onboard with the web platform team. Understand the Go/Angular architecture and identify where React modernization or growth engineering improvements can have the most impact. Meet the Spitfire Audio London team.
- **Month 2:** Ship a growth-focused improvement — better sample discovery flow, improved onboarding for Splice Instrument users, or a conversion optimization in the creator funnel. Begin scoping AI integration opportunities.
- **Month 3:** Propose a growth engineering roadmap that ties together the sample marketplace, Splice Instrument, and Kits AI voice tools into a cohesive creator experience. Demonstrate cross-team coordination between US and UK teams.

## Proposed Angles

1. **Music Tech + Growth Engineering** (Business)
   "The Spitfire Audio acquisition and UMG partnership signal Splice is becoming the full-stack platform for music creation — that's incredibly exciting. I led growth engineering at a game studio (0 to 1M players) and have deep experience building creator-facing products. I'd love to discuss how growth engineering fits into Splice's expansion from samples into instruments and AI tools."

2. **CTO-to-CTO on Scaling Music Tech** (Technical)
   "Matt, I read your piece on maintaining confidence while scaling an engineering team — it resonated. I've scaled teams from 0 to 9 and shipped products that hit 25M monthly sessions. As someone who genuinely cares about music production tooling (it's a top interest, not a resume line), I'd love to chat about how Splice is thinking about the technical integration of Spitfire Audio and Kits AI into the platform."

3. **European Bridge** (Network/Geographic)
   "I noticed the Senior Director Marketing (Instruments) role is UK-based, which signals Splice is building European capacity post-Spitfire Audio. I'm a Lead Full Stack Engineer based in Prague with 15 years of experience and 3 exits — I'd be very interested in discussing how engineering capacity in European timezones could support the integration of the London team with the US platform."

## Notes

- **Go-heavy backend is the biggest stack gap.** Doug's primary stack is TypeScript/React/Node, not Go. However, Splice's web frontend is moving toward React, and Doug's breadth of experience suggests he can learn Go quickly.
- **US-focused roles are a concern.** Current engineering roles are "Remote - U.S." The UK marketing role and Spitfire Audio acquisition suggest European presence exists, but an EU-based engineering role may need to be created.
- **$142.8M revenue makes this a serious company.** This is not a startup — it's a scale-up with real revenue and market position. Compensation should be competitive.
- **Layoff history is worth understanding.** The 2022-2023 layoffs affected engineering heavily. Worth asking about team stability in conversations.
- **AI strategy creates urgency.** Splice is betting big on AI (CEO on TIME 100 AI, UMG partnership, Kits AI acquisition). Engineers who understand AI integration are in demand.
- **The engineering blog is dead.** Last posts are years old and all Go-focused. This is either a cultural signal (engineering doesn't prioritize writing) or just fallen off the priority list.

---

*Generated by company-deep-dive skill. Verify key facts before using in outreach.*
