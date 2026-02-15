# MapTiler — Deep Dive Dossier

**Last Updated:** 2026-02-15
**Priority Tier:** 2 (Warm)
**Overall Assessment:** Strong geographic fit (Brno, 2hrs from Prague), profitable company with cutting-edge WebGPU/mapping tech, solid open-source culture. No perfect-fit engineering roles currently posted, but the TypeScript SDK Developer and WebGPU SDK Developer roles are adjacent. Worth speculative outreach.
**Existing Relationship:** No

---

## Current Openings

| Role | Team | Link | Posted | Salary | Doug Fit |
|------|------|------|--------|--------|----------|
| WebGPU SDK Developer | Engineering | maptiler.peopleforce.io (Job ID 153688) | Unknown | Not posted | **Moderate** — WebGPU is cutting-edge and Doug has WebGL/graphics interest via game modding, but this is specialized GPU/graphics work, not his core stack |
| TypeScript Developer (Europe) | SDK/Engineering | weworkremotely.com/remote-jobs/maptiler-typescript-developer-europe | Recent | Not posted | **Strong** — TypeScript SDK development, frontend frameworks, geospatial libraries. Doug's 8yr React + TS expertise is a direct match. Geospatial library experience is the gap. |
| Maps Search Engineer (Europe) | Engineering | weworkremotely.com/remote-jobs/maptiler-maps-search-engineer-europe-only | Recent | Not posted | **Moderate** — Requires TypeScript + Node + Java + Rust + strong DB experience. Doug matches on TS/Node/DB but Java/Rust are gaps. |
| Senior UX/UI Designer | Design | maptiler.peopleforce.io (Job ID 178604) | Recent | Not posted | **Weak** — Design role, not engineering |
| Product Marketing Specialist | Marketing | maptiler.peopleforce.io (Job ID 165510) | Recent | Not posted | **Weak** — Marketing role |
| Senior Product Designer | Design | maptiler.peopleforce.io (Job ID 156962) | Recent | Not posted | **Weak** — Design role |

**Summary:** The TypeScript Developer role is the strongest match. The WebGPU SDK Developer role is interesting but niche. No senior/lead engineering roles currently posted, which means Doug would need to either apply for the TS Developer role or do speculative outreach about a more senior position.

## Recent Activity (Last 6 Months)

- **Jan 2026:** Launched georeferenced PDF upload feature — transform static engineering drawings into interactive map layers in MapTiler Cloud
- **Dec 2025:** Released new spacebox and halo features for globe visualizations with customizable atmospheric effects and star backgrounds
- **Dec 2025:** Launched new Landscape map style
- **Dec 2025:** Published "5 Years of Innovation" retrospective, announced MapTiler Open Foundation with $100K commitment to open-source projects
- **Oct 2025:** Held first-ever user conference **MapTiler Connect 25** in Zurich — hybrid event with major announcements:
  - **GeoSplats** — 3D Gaussian Splatting for geospatial data, rendered in real-time via WebGPU (exclusive beta)
  - **Native Mobile SDKs** for Kotlin and Swift
  - **Next-generation maps** with enhanced styling
- **Sep 2025:** Hit **$5.9M revenue** with 54-person team — strong profitability signal
- **Ongoing:** One of the main founders and sponsors of MapLibre, the fully open-source mapping library forked from Mapbox GL JS

**Red flags:** None. Company appears healthy, growing, and profitable without external funding pressure.

## Tech & Engineering

**Stack:** TypeScript, JavaScript, WebGPU, WebGL, MapLibre GL JS, Python, C++, Rust, Kotlin, Swift, PostgreSQL (geospatial)
**Engineering Blog:** maptiler.com/news (product-focused) + medium.com/maptiler (tagged posts)
**GitHub Org:** github.com/maptiler — Active, 50+ public repos
**Open Source Activity:** **Excellent.** Core contributor and co-founder of MapLibre. Major repos include:
- `tileserver-gl` — 2,721 stars (vector/raster map server)
- `maptiler-sdk-js` — 121 stars (TypeScript SDK)
- `maptiler-geocoding-control` — 67 stars (TS geocoding component)
- `maptiler-client-js` — 22 stars (TS API wrapper)
- Multiple repos in TypeScript, JavaScript, Python, C++, Kotlin, Swift

**Culture Signal:** **Mature & thoughtful** — Strong open-source commitment, annual conference, active publishing, cutting-edge R&D (GeoSplats/WebGPU). Maps serve 500M monthly users across customer applications. The company clearly invests in developer experience and public tooling.

The engineering team works across Brno (CZ), Zug (CH), and remote locations across Europe. PhD-level technical leadership (CEO has PhD in cartography/geodesy). This is a technically deep company — not a shallow SaaS layer.

## Key Contacts

| Name | Title | LinkedIn | Recent Content | Why Them |
|------|-------|----------|----------------|----------|
| Petr Pridal | CEO & Founder | linkedin.com/in/klokan | MapTiler Connect 25 keynote, MapLibre co-founder, Open Foundation announcement | Founder-CEO of 54-person company — accessible. Deeply technical (PhD, open-source author). Would appreciate a peer-level conversation. |
| Jiri Komarek | CTO / Head of Marketing | linkedin.com/in/jiri-komarek | MapTiler team page presence | CTO would be the hiring decision-maker for engineering roles |

**Note:** Limited public engineering team visibility beyond the founders. This is a 54-person company so the CEO/CTO are likely directly involved in hiring decisions.

**Recommended first contact:** Petr Pridal — as founder-CEO of a 54-person company, he's the most visible, creates public content, and would be the ultimate decision-maker. His open-source background means he'd appreciate a technical conversation.

## Pain Points & Opportunities

### What They Need
- **SDK developer talent in TypeScript** — actively hiring for TS Developer, showing this is a gap
- **WebGPU expertise** — cutting-edge GeoSplats project in exclusive beta needs developers who can push GPU-based rendering forward
- **Growth engineering for developer adoption** — MapTiler competes with Mapbox and Google Maps; developer experience and SDK quality are competitive differentiators
- **Scaling from 54 to 100+ people** — profitable growth means hiring well without losing culture
- **Enterprise customer acquisition** — $5.9M revenue is solid but maps infrastructure is a huge market (Mapbox raised $280M+)

### How Doug Solves It
- **TypeScript SDK expertise:** Doug's 8 years of React + deep TypeScript experience directly maps to their SDK development needs. His NPM package authorship means he understands developer tooling from the consumer side.
- **Growth engineering:** MapTiler needs developers to choose their platform over Mapbox/Google Maps. Doug's growth engineering background (Contra, Groupon, Motley Fool, Patrianna 0-to-1M) means he thinks about adoption funnels, not just code quality.
- **Developer experience:** Doug's consultancy background across 15+ clients means he's seen how developers actually use SDKs. He can bring outside-in perspective to MapTiler's developer tools.
- **Open-source contribution:** Doug's NPM packages and public GitHub activity align with MapTiler's open-source-first culture.

### First 90 Days Sketch
- **Month 1:** Onboard by contributing to maptiler-sdk-js. Fix bugs, write tests, and understand the MapLibre GL JS underpinnings. Ship a small but visible improvement to the SDK or docs.
- **Month 2:** Identify a friction point in the developer onboarding flow (e.g., first-time integration complexity). Build a prototype solution — maybe a React integration library or improved code examples.
- **Month 3:** Propose and begin implementing a growth-oriented developer experience improvement — better error messages, analytics on SDK usage patterns, or an interactive playground. Start contributing to the MapTiler Connect developer community.

## Proposed Angles

1. **Open Source & SDK Craft** (Technical)
   "I saw the MapTiler SDK JS repo and your founding role in MapLibre — I've authored several automation NPM packages myself and deeply care about developer experience from the consumer side. I've been looking at your TypeScript Developer role and would love to discuss how my experience building developer-facing tools across React and Node could help evolve the SDK."

2. **Growth Engineering for Developer Adoption** (Business)
   "Congrats on hitting $5.9M in revenue and the MapTiler Connect conference. The GeoSplats announcement was genuinely impressive. I led growth engineering at Patrianna where we went from zero to 1M players, and I've been thinking about how similar developer adoption strategies could work for mapping SDKs competing against Mapbox and Google. Would love to chat about how MapTiler is thinking about developer growth."

3. **Prague Neighbor** (Network/Geographic)
   "I'm a Lead Full Stack Engineer based in Prague — just 2 hours from your Brno office. I've been following MapTiler's work since the MapLibre fork, and the WebGPU direction with GeoSplats caught my attention. I'd love to grab a coffee and discuss how my TypeScript and growth engineering background might fit with what you're building."

## Notes

- **Geographic advantage is significant** — being 2 hours from the Brno office while most roles appear to be remote-Europe makes Doug a uniquely convenient candidate who can attend in-person events easily.
- **The TypeScript Developer role may be below Doug's seniority** — he may want to frame his outreach as interest in a senior/lead capacity rather than applying directly to the posted role.
- **WebGPU interest could be a differentiator** — Doug's game modding (Valve Source 2) and C++ work shows he's not afraid of lower-level graphics work, which could be relevant for GeoSplats.
- **No Glassdoor data** — company is small enough to not have reviews. This is neutral, not negative.
- **Open question:** What does the engineering org structure look like? Is there a VP/Head of Engineering, or does the CTO manage directly?

---

*Generated by company-deep-dive skill. Verify key facts before using in outreach.*
