# Recraft --- Deep Dive Dossier

**Last Updated:** 2026-02-15
**Priority Tier:** 3 (Watch)
**Overall Assessment:** Recraft is a fast-growing AI design tool with impressive traction (4M+ users, $5M ARR, 700% user growth YoY) and strong technical pedigree (founder created CatBoost at Yandex). However, the fit for Doug is limited right now: current openings are all ML-focused (Junior ML Engineer, ML Data Engineer, ML Research Engineer, Neural Network Optimization Engineer). The Frontend Developer/Software Engineer (App) role was previously posted but appears filled. Recraft's product is frontend-heavy and uses React, but the engineering team is heavily ML-skewed. This is a "watch" company --- if they post frontend/full-stack roles, it could become a strong opportunity given the product's design-tool nature and European roots. The London location and creative-tool category are both appealing.
**Existing Relationship:** No

---

## Current Openings

| Role | Team | Link | Posted | Salary | Doug Fit |
|------|------|------|--------|--------|----------|
| Junior Machine Learning Engineer | Engineering/ML | https://jobs.ashbyhq.com/recraft | Unknown | Not posted | Weak --- ML role, wrong specialization for Doug. |
| ML Data Engineer | Engineering/ML | https://jobs.ashbyhq.com/recraft | Unknown | Not posted | Weak --- ML data pipeline role. |
| ML Research Engineer | Engineering/ML | https://jobs.ashbyhq.com/recraft | Unknown | Not posted | Weak --- research-focused ML role. |
| Neural Network Optimization Engineer | Engineering/ML | https://jobs.ashbyhq.com/recraft | Unknown | Not posted | Weak --- deep neural network optimization. |

**Previously posted (likely filled):**

| Role | Notes | Doug Fit |
|------|-------|----------|
| Frontend Developer / Software Engineer (App) | React, React Native, mobile-first web applications, 5+ years experience required. Collaboration with Design, Backend, and ML teams. | Strong --- React-based, product-focused, mobile-first web app development. Would have been an excellent match. |
| Backend Software Engineer | Building and maintaining backend infrastructure for AI-driven creative platform. | Moderate --- Doug has backend experience (Node.js, Hono) though it's not his primary focus. |
| Computational Geometry Software Engineer | Advanced geometric algorithms for SVG/vector capabilities. | Weak --- specialized geometry/math role. |

**Assessment:** No currently open roles match Doug's profile. The frontend/app engineer role was a strong fit but appears filled. Recraft's hiring is currently weighted toward ML engineering. However, as the product matures and the user base grows (4M+ users), they will inevitably need more frontend and full-stack engineers to build the web application layer. The careers page invites speculative applications: "Send your CV to careers@recraft.ai, and we'll reach out when new opportunities arise."

## Recent Activity (Last 6 Months)

- **May 2025:** Raised $30M Series B led by Accel, with participation from Madrona Ventures, Khosla Ventures, Nat Friedman, Elad Gil, and RTP Global. Reported $5M ARR and 4M+ users at the time.
- **May 2025:** TechCrunch coverage noting Recraft's model had beaten DALL-E and Midjourney on the PartiPrompts benchmark while still in stealth.
- **2025:** Launched Recraft V3 ("red_panda") --- first model with positioning control for precise logo/character/product placement without manual edits.
- **2025:** Launched Advanced Style Creation and Controls for brand consistency at scale.
- **2025:** 700% increase in user adoption over the previous year. 10X expansion in two years.
- **2025:** Customers include Amazon, NVIDIA, Salesforce, and Uber.
- **2024 (context):** $12M Series A led by Khosla Ventures. Total funding now $42M across 2 rounds.

**Hacker News reception:** Multiple front-page appearances. Discussions about Recraft's vector generation capabilities and model quality generated positive community interest. Recraft V3 topping benchmarks was widely covered.

## Tech & Engineering

**Stack:** ML/AI: Python, proprietary diffusion models (built in-house). Frontend: React (confirmed by job postings), React Native for mobile. Backend: Unknown specifics, but likely Python-based given ML focus. APIs: RESTful API with MCP (Model Context Protocol) integration. Vector graphics: SVG-native generation. Infrastructure: Unknown, likely cloud-based GPU compute.
**Engineering Blog:** https://www.recraft.ai/blog --- active, but primarily product-focused case studies and usage guides rather than deep technical engineering content.
**GitHub Org:** https://github.com/recraft-ai --- 3 public repositories.
**Open Source Activity:** Limited but meaningful. Two integration-focused repos (ComfyUI node, MCP server) plus a forked React Native cookies library. The MCP server is TypeScript-based and MIT-licensed.
**Contribution Opportunity:** Medium --- the MCP server repo is TypeScript (Doug's primary language), MIT-licensed, actively maintained, and has 0 open issues but only 45 stars. Small enough to make a meaningful contribution.
**Culture Signal:** Moving fast --- small team (30-50 people), hyper-growth phase, ML-heavy engineering culture. Limited public signal on web/product engineering practices. No Glassdoor data available for the AI startup (distinct from unrelated "ReCraft" companies).

Recraft's engineering team is heavily ML-focused. The founder Anna Veronika Dorogush built CatBoost at Yandex, and the team includes ICPC medalists and top Kaggle competitors. The proprietary diffusion model is built entirely in-house, not fine-tuned from open-source models. This suggests deep technical capability but also that the web/product engineering side may be secondary to the ML research side. The product itself is a sophisticated web-based design tool, so they clearly have competent frontend engineers, but they don't write publicly about web engineering practices.

### GitHub Contribution Analysis

**Repos Worth Looking At:**
- `recraft-ai/mcp-recraft-server` --- MCP server for Recraft API integration. 45 stars, TypeScript (97.4%), MIT license, v1.6.5. Provides image generation, style creation, background removal, vectorization, and upscaling via Model Context Protocol.

**Open Issues / PR Opportunities:**
- 0 open issues currently, but the repo is relatively new and small. Opportunities to propose:
  - Improved TypeScript types and documentation
  - Additional MCP tool implementations for newer API features
  - Better error handling and retry logic
  - Test coverage (likely minimal given the repo's size)

**PR Idea:** The MCP server is the best contribution target. Doug could add comprehensive TypeScript type definitions for the API responses, improve error handling with proper TypeScript discriminated unions, or add a test suite. Given Doug's expertise in automation tooling and TypeScript, a PR that improves the developer experience of this integration point would demonstrate both technical skill and familiarity with the product.

**MIT/OSS Component Angle:** The MCP server (TypeScript, MIT) and ComfyUI node (Python, MIT) are both public-facing integration points. The MCP server is particularly relevant given the growing MCP ecosystem --- Doug could contribute improvements that benefit the broader developer community using Recraft's API.

## Key Contacts

| Name | Title | LinkedIn | Recent Content | Why Them |
|------|-------|----------|----------------|----------|
| Anna Veronika Dorogush | Founder & CEO | https://uk.linkedin.com/in/anna-veronika-dorogush-08739637 | Evil Martians podcast interview, TechFundingNews profile, LinkedIn posts about funding and product launches. Created CatBoost at Yandex. | Founder/CEO of a 30-50 person company --- accessible and makes hiring decisions. ML background means she values technical depth. |

**Note:** No VP of Engineering, CTO, or engineering manager was identifiable from public sources. At a company of this size, Anna likely makes or heavily influences all engineering hires. The team of 13 ML engineers is led directly by her.

**Recommended first contact:** Anna Veronika Dorogush --- as founder/CEO of a small company, she is the decision-maker. Her technical background (CatBoost, Yandex ML) means she would engage with a technically substantive conversation. Reference the MCP server or the frontend architecture challenge of building a professional design tool.

## Pain Points & Opportunities

### What They Need
- **Frontend/product engineering depth:** As the user base scales past 4M and enterprise customers (Amazon, NVIDIA, Salesforce) come onboard, the web application layer needs to be enterprise-grade. This means performance, accessibility, design system maturity, and complex state management.
- **Mobile app development:** The Frontend Developer/App role signals they are building native mobile experiences (React Native). They need engineers who can bridge web and mobile.
- **Growth engineering:** With $30M in the bank and $5M ARR, they need to accelerate revenue growth. Growth engineering, conversion optimization, and onboarding flows are critical.
- **Developer ecosystem:** The MCP server and API integrations suggest they are building a developer platform. This needs TypeScript-savvy engineers who understand API design and developer experience.
- **Scaling beyond ML:** The team is ML-heavy. As they grow, they need senior web/product engineers who can build the application layer independently while collaborating with the ML team.

### How Doug Solves It
- **Professional design tool UX:** Doug has 8 years of React experience building complex, interactive web applications. A design tool like Recraft requires sophisticated state management, canvas interactions, and real-time UI updates --- the kind of frontend complexity Doug thrives in.
- **Growth engineering for creative tools:** Doug's growth engineering experience at Patrianna (0 to 1M users), Groupon, and Motley Fool directly applies to Recraft's need to convert free users to paid, optimize onboarding, and drive enterprise adoption.
- **Developer platform experience:** Doug has authored multiple NPM packages and built developer-facing tools. Improving the Recraft API, SDK, and integration ecosystem is right in his wheelhouse.
- **AI product integration:** Doug's MIT Generative AI course involvement and agentic workflow experience means he understands how to build products on top of AI models --- not just the models themselves.

### First 90 Days Sketch
1. **Month 1:** Own a significant frontend feature or improvement in the web design tool. Understand the architecture connecting the React frontend to the ML backend. Identify performance bottlenecks and UX friction points.
2. **Month 2:** Ship improvements to the developer integration layer (API, MCP server, SDK). Begin building growth engineering infrastructure (analytics, A/B testing, conversion tracking).
3. **Month 3:** Propose and begin building a growth engineering initiative --- onboarding optimization, enterprise feature gating, or a self-serve upgrade flow. Establish frontend engineering practices (testing, component library, design system) that can scale with the team.

## Proposed Angles

1. **MCP Server Contribution Angle** (Technical)
   "I've been exploring Recraft's MCP server integration and see some opportunities to improve the TypeScript developer experience --- better type safety, error handling, and test coverage. I've authored several automation NPM packages and would love to contribute. Happy to submit a PR first and discuss from there --- I find that shipping code is a better introduction than a cover letter."

2. **Design Tool Frontend Complexity Angle** (Technical)
   "Building a professional-grade design tool in the browser is one of the hardest frontend engineering challenges. I've spent 8 years building complex React applications --- from SaaS platforms protecting 25M monthly sessions to real-time interactive tools. I'm curious how your team approaches the frontend architecture challenge of rendering AI-generated content (especially SVG) in a responsive, performant design canvas."

3. **Growth Engineering for Creative Tools Angle** (Business)
   "Congratulations on the Series B and the 700% user growth. I led growth engineering at Patrianna where we went from zero to 1M users, and I've been thinking about how growth engineering principles apply to creative tools specifically --- the conversion funnel from free exploration to paid professional use is fundamentally different from SaaS or gaming. I'd love to discuss how you're approaching the growth side as you scale past 4M users."

## Notes

- **Timing:** No frontend roles currently open. This is a watch-list company. The speculative application route (careers@recraft.ai) is an option, especially if paired with a GitHub contribution.
- **Location:** London-based, on-site preferred based on job postings. This could be challenging from Prague. Worth asking about remote flexibility, especially for senior roles.
- **Team composition risk:** The engineering team is heavily ML-focused (13 ML engineers). A frontend/full-stack hire might feel isolated if there is no established web engineering team culture. This could be an opportunity (build the web eng team from scratch) or a frustration (ML priorities dominate roadmap).
- **Competitive landscape:** Recraft competes with Midjourney, DALL-E, Adobe Firefly, and Canva's AI features. Their differentiator is SVG-native generation and brand consistency. This is a crowded space, but the professional design tool angle (vs. consumer image generation) is defensible.
- **Founder profile:** Anna Veronika Dorogush has an impressive technical pedigree (CatBoost, Yandex, Google, Microsoft). As a technical founder, she likely values engineering depth. The fact that she's a solo female founder in AI is notable and may attract mission-driven candidates.
- **PR contribution strategy:** The MCP server repo is the clearest path. It's TypeScript, MIT-licensed, and small enough that a meaningful PR would be noticed. This is the recommended "foot in the door" approach.

---

*Generated by company-deep-dive skill. Verify key facts before using in outreach.*
