# Moises AI -- Deep Dive Dossier

**Last Updated:** 2026-02-15
**Priority Tier:** 2
**Overall Assessment:** Rocket-ship music AI company (70M users, $50M+ raised, Apple App of the Year) with a genuine web platform play via AI Studio (browser-based DAW). Remote-first with EU engineers. The openDAW open-source fork is a high-value contribution angle. No frontend/fullstack role currently posted, but the company is growing fast and the web platform is their newest product line. Strong speculative outreach candidate.
**Existing Relationship:** No

---

## Current Openings

| Role | Team | Link | Posted | Salary | Doug Fit |
|------|------|------|--------|--------|----------|
| Solutions Engineer | Music.AI (Enterprise) | music.ai/careers | Recent | Not posted | Moderate -- Doug has the technical depth but this is a sales-engineering hybrid role, not pure engineering |
| Music Generation Researcher | Data Science | music.ai/careers | Recent | Not posted | Weak -- requires ML/research PhD-level expertise |
| PhD Research Internships | Data Science | music.ai/careers | Recent | Not posted | Not relevant |
| iOS Engineer | Engineering | music.ai/careers | Recent | Not posted | Weak -- iOS, not web |
| IT Operations Lead | Operations | music.ai/careers | Recent | Not posted | Not relevant |

No frontend or full-stack engineering roles are currently posted. However, Moises has historically hired web developers (their GitHub has archived frontend-code-test and web-developer-growth-test repos, both JavaScript). The launch of AI Studio (browser-based web DAW) in August 2025 drove a 30% surge in daily new users -- this is their fastest-growing product surface and will need dedicated web engineering talent.

**Key insight:** The web-developer-growth-test repo on GitHub (updated Jan 2025) is specifically a "developer test assignment for candidate evaluation" -- this means they were actively hiring web developers as recently as January 2025. The AI Studio product requires ongoing web engineering investment. A speculative outreach about the web platform is well-timed.

## Recent Activity (Last 6 Months)

- **Jan 2026:** Raised $40M Series A led by Connect Ventures (CAA + NEA partnership) and monashees. Total funding now $50M+. Additional backers include Samsung Next, Kickstart, Toba Capital. Music industry angels: Freddy Wexler, 3LAU, Alexander23.
- **Dec 2025:** 2025 Year in Review -- 70M total users, 15M new users in 2025 alone (fastest growth year ever). Over 50 AI models in production.
- **Aug 2025:** Launched AI Studio -- browser-based, AI-native audio editor with generative capabilities. Creates individual instrumental stems that match the style of uploaded recordings. Context-aware music generation. Drove 30% surge in daily new users.
- **Feb 2025:** Launched Moises Live at NAMM 2025 -- real-time audio control powered by AI Smart Volume.
- **2024:** Won Apple iPad App of the Year.
- **Music.AI umbrella:** Established Music.AI as the enterprise platform brand, dedicated to enterprise-grade AI models and infrastructure for ethical AI in music/audio.

This is a company in hypergrowth. $40M Series A in Jan 2026, 15M new users in 2025, and a new web platform (AI Studio) that is driving user acquisition. The timing is excellent for outreach -- they have fresh funding and are expanding their product surface to the web.

## Tech & Engineering

**Stack:** AI/ML (50+ proprietary models), audio processing, web platform (TypeScript -- openDAW fork), mobile (iOS, Android), Python (ML infrastructure), C++ (rudder-sdk-cpp fork), JavaScript/Node.js
**Engineering Blog:** No dedicated engineering blog found. Company blog at moises.ai/blog focuses on product news and press releases.
**GitHub Org:** github.com/moises-ai -- 11 public repos
**Open Source Activity:** Active and growing. Standout repo: openDAW fork (TypeScript web DAW), moises-db (172 stars, ML dataset), maestro-worker-python.
**Contribution Opportunity:** High
**Culture Signal:** Moving fast -- hypergrowth, rapid product launches (AI Studio, Moises Live), team of 100+ from Spotify/Pandora/TikTok. Nearly all developers are musicians themselves.

The tech stack is a mix of ML/audio processing (Python, C++) and web platform (TypeScript). The openDAW fork is significant -- it shows Moises is investing in an open-source web DAW built in TypeScript, which is the foundation technology for AI Studio. This fork was last updated Feb 13, 2026 (2 days ago), indicating active development.

Engineering culture signals: the team includes alumni from Spotify, Pandora, and TikTok. Geraldo Ramos (CEO) and Eddie Hsu (COO) are both musicians who use their own product. The flat culture is emphasized -- "no hierarchical barrier" with senior management collaborating as peers. Fully remote with a global team including EU engineers.

### GitHub Contribution Analysis

**Repos Worth Looking At:**
- `moises-ai/openDAW` -- Web-based Digital Audio Workstation. TypeScript (96%), 3 stars. Forked from andremichelle/openDAW. AGPL v3 licensed. Active: 2,371 commits, latest release v0.0.103 (Feb 9, 2026). **2 open PRs.** Roadmap targets Q1-Q3 2026 for automation tracks, recording, and 1.0 launch.
- `moises-ai/moises-db` -- Public source separation dataset. Python, 172 stars. ML training data.
- `moises-ai/extensions-boilerplate` -- JavaScript. Extensions framework, updated Jan 2026.
- `moises-ai/maestro-worker-python` -- Python worker. 9 stars.

**Open Issues / PR Opportunities:**
- openDAW has 2 open PRs that could be reviewed or supplemented
- The roadmap explicitly calls for contributors in: offline desktop builds, cloud-agnostic storage, live collaboration features, AI-powered stem splitting, comprehensive audio format support
- The extensions-boilerplate (updated Jan 2026) suggests a plugin/extension ecosystem being built -- Doug could build an extension

**PR Idea:** Contribute to the openDAW project -- specifically, the roadmap calls for "cloud-agnostic storage solutions" and "live collaboration features." Doug could submit a PR adding a storage abstraction layer or a basic WebSocket-based collaboration skeleton. Alternatively, improve the TypeScript types or add automated testing to the existing codebase. This is a 2-4 hour contribution that directly demonstrates Doug's TypeScript and web platform skills.

**MIT/OSS Component Angle:** The rudder-sdk-cpp repo is MIT-licensed (analytics SDK implementation). The openDAW fork is AGPL v3 (copyleft). The extensions-boilerplate and moises-db are public. The openDAW project is the highest-value contribution target because it directly relates to AI Studio, their fastest-growing product.

## Key Contacts

| Name | Title | LinkedIn | Recent Content | Why Them |
|------|-------|----------|----------------|----------|
| Geraldo Ramos | Co-founder & CEO | linkedin.com/in/geraldoramos | Active on X (@geraldoramos), Utah Business interview, BBH interview about Music.AI strategy | Founder-CEO of a 100+ person company. Technical background (ex-Pluralsight Tech Lead). Musician. |
| Eddie Hsu | Co-founder & COO | linkedin.com/in/eddiehsu (estimated) | Web Summit Rio 2024 press conference, BBH interview, NAMM 2025 | Leads operations and product strategy. Public speaker at Web Summit. |

**Note:** No VP/Head of Engineering was found in public searches. For a 100+ person company with 50+ AI models, there is certainly an engineering leadership layer, but they are not publicly visible. This may mean engineering leadership is done through the CTO/VP level without public profiles, or that Geraldo (as a technical CEO) still plays a direct role in engineering decisions.

**Recommended first contact:** Geraldo Ramos -- he is the technical co-founder, active on social media, has given multiple interviews, and his GitHub profile (github.com/geraldoramos) shows he is still hands-on technically. For a company this size, the CEO is still reachable and directly involved in senior hiring decisions.

## Pain Points & Opportunities

### What They Need

- **Web platform engineering for AI Studio:** AI Studio is a browser-based DAW -- this is a massive web engineering challenge (WebAudio API, real-time audio processing, complex UI state management, collaborative editing). It drove 30% user growth and is their strategic bet for expanding beyond mobile.
- **Growth engineering:** 70M users with 15M added in 2025. They need to optimize onboarding, conversion (free to premium/pro), retention, and viral loops across both mobile and web.
- **Platform scalability:** 50+ AI models in production serving 70M users. The web platform (AI Studio) adds another surface to scale.
- **Extensions/plugin ecosystem:** The extensions-boilerplate repo suggests they are building a plugin architecture for AI Studio. This needs TypeScript expertise and API design skills.
- **Enterprise platform (Music.AI):** The Solutions Engineer role signals B2B expansion. The enterprise platform needs web interfaces, dashboards, and API documentation.

### How Doug Solves It

| Their Need | Doug's Relevant Experience |
|-----------|--------------------------|
| Browser-based DAW / complex web app | 8 years React, deep TypeScript. Built complex interactive web applications (SaaS at getBenson protecting 25M sessions). Can handle the real-time, state-heavy UI challenges of a web DAW. |
| Growth engineering at scale | Led game studio from 0 to 1M players at Patrianna. Growth across Contra, Groupon, Motley Fool. Can drive the free-to-premium conversion and viral growth loops. |
| Extensions/plugin architecture | Author of multiple NPM packages. Built modular systems at Vouchernaut (10k+ brand integrations). Understands plugin/extension API design. |
| AI/agentic workflows | MIT Generative AI course (50k+ students). Building agentic workflows. Understands how to integrate AI capabilities into user-facing products. |
| Team scaling during hypergrowth | Hired and led 9-member team at Patrianna during rapid growth. Knows how to maintain quality while moving fast. |

### First 90 Days Sketch

**Month 1:** Contribute to the openDAW repo before or during onboarding (demonstrates commitment). Deep dive into AI Studio's web architecture. Ship a meaningful improvement -- likely in the TypeScript layer, UI components, or build tooling. Understand the extensions framework.
**Month 2:** Own a growth-impacting feature in AI Studio (onboarding flow, collaboration feature, or performance optimization). Begin defining engineering practices for the web platform team. Explore the music generation pipeline integration points.
**Month 3:** Drive a measurable improvement in AI Studio engagement or conversion metrics. Propose and begin building the extensions ecosystem. Establish web platform team practices and contribute to the Q2-Q3 2026 roadmap (automation tracks, recording refinement per the openDAW roadmap).

## Proposed Angles

1. **openDAW Contribution + Source 2 Modding** (Technical)
   "I've been looking at your openDAW fork on GitHub -- building a web-based DAW in TypeScript is exactly the kind of challenge I love. I'm currently building a Valve Source 2 modding platform (complex real-time web UI with TypeScript), and I've spent 8 years building React applications at scale. I'd love to contribute to openDAW and discuss how you're thinking about the AI Studio web platform architecture."

2. **Growth Engineering at Music Scale** (Business)
   "15 million new users in 2025 is remarkable growth, and the 30% surge from AI Studio shows the web platform is your next big growth surface. At Patrianna I led the growth engineering that scaled a game studio from zero to 1M players -- I've been thinking about how the same growth loops (viral sharing, onboarding optimization, community-driven retention) apply to a music creation platform. Would love to chat about what's working and where the web platform is heading."

3. **Automation + NPM Package Expertise** (Technical)
   "I noticed your extensions-boilerplate repo -- it looks like you're building a plugin ecosystem for AI Studio. I've authored multiple NPM packages and built modular automation systems that integrated 10,000+ brands at Vouchernaut. Building developer-facing APIs and extension frameworks is something I'm deeply experienced in. I'd love to discuss the extensions architecture and how the ecosystem could accelerate AI Studio adoption."

## Notes

- **No current web/frontend role posted, but the signal is strong.** The web-developer-growth-test repo (Jan 2025), the AI Studio launch, and the openDAW active development all indicate web engineering is a priority. This is a speculative outreach that is likely to find a receptive audience.
- **The openDAW contribution angle is the strongest play.** This is an active, TypeScript-heavy open-source project that directly relates to their flagship new product. A quality PR before outreach would be extremely compelling. The roadmap even lists specific areas where contributors are welcome.
- **Remote-first is a genuine advantage.** Unlike Musixmatch (Bologna hybrid), Moises is truly remote-first with EU engineers. Doug's Prague location is not a barrier.
- **Well-funded.** $40M Series A just closed in Jan 2026. They have capital to hire and are clearly in growth mode.
- **Music domain passion is genuine.** Doug lists music technology and VSTs as top interests. Moises is building the next generation of music creation tools. The domain alignment is real.
- **C++ overlap.** Doug is increasingly doing C++ and lower-level work. Moises has a C++ repo (rudder-sdk-cpp) and audio processing likely involves C++/WebAssembly. This is a secondary but real alignment.
- **Apple App of the Year 2024 is a prestige signal.** This is the kind of recognition that attracts top engineering talent and signals product quality. It is also a great conversation hook.
- **Risk: role mismatch.** The current openings (Solutions Engineer, ML Researcher, iOS) are not Doug's sweet spot. The outreach needs to explicitly position Doug for a web platform / growth engineering role that may not be formally posted yet. Framing it as "I want to help build AI Studio" is more compelling than "do you have any openings?"

---

*Generated by company-deep-dive skill. Verify key facts before using in outreach.*
