# Raycast --- Deep Dive Dossier

**Last Updated:** 2026-02-16
**Priority Tier:** 2 (Warm) --- borderline Tier 1 due to strong stack fit, open Design Engineer role, and cultural alignment
**Overall Assessment:** Raycast is a developer-beloved productivity launcher built by ex-Facebook engineers, with a 39-person remote-first team across 16 countries. The tech stack is React, TypeScript, Node.js, and Next.js --- a near-perfect match for Doug. The company expanded from Mac-only to iOS and Windows in 2025, and is now positioning itself as an "operating system for professionals in the age of AI." The Design Engineer role (EUR 100-135K, remote CET +/- 3 hours) is the active opening. While the title suggests more design than engineering, the actual requirements (Next.js, TypeScript, Radix Primitives, AI tools like Cursor/Claude) and responsibilities (own features from ideation to maintenance, contribute to design system, maintain open-source projects) make this a strong fit for Doug. The "no code reviews by default" culture signals high-trust engineering. Raycast's open-source extensions ecosystem (7.2K stars, MIT-licensed, TypeScript/React) offers an excellent contribution path.
**Existing Relationship:** Yes — PR #407 submitted to `raycast/ray-so` (CFML syntax highlighting, closes issue #324). First code contribution to Raycast's codebase.

---

## Current Openings

| Role | Team | Link | Posted | Salary | Doug Fit |
|------|------|------|--------|--------|----------|
| Design Engineer | Web | https://www.raycast.com/jobs/design-engineer | Dec 2025 | EUR 100,000-135,000 | Strong --- Next.js + TypeScript + Radix Primitives. Full feature ownership. Open-source maintenance. AI tool proficiency required. The "design" in the title is about building web experiences (website, web tools), not graphic design. Doug's 8 years of React + design sensibility fits well. |
| Solutions/Sales Engineer | GTM | https://www.raycast.com/careers | Dec 2025 | Not posted | Weak --- sales-focused role, first sales hire for enterprise GTM. Not Doug's lane. |

**Role deep dive --- Design Engineer:**

This role is focused on Raycast's web presence and web-based tools (ray.so, website, marketing pages), not the core desktop app. Key requirements:
- **Next.js** with understanding of new feature ROI
- **TypeScript** proficiency
- **Radix Primitives** for component foundations
- **AI proficiency** with Cursor or Claude
- Marketing-minded, able to break down projects into deliverables
- Detail-oriented, empathetic communicator
- Tools: Linear, GitHub, Vercel, Slack, Figma, Notion

The job description emphasizes shipping "web-based experiences that will help people be more productive." This maps well to Doug's profile: he builds web products, understands growth/marketing context, and has deep Next.js + TypeScript expertise. The EUR 100-135K salary is at market for a European remote role but below what Doug might command given his 15+ years of experience. Negotiation room likely exists for someone with his profile.

**Open 2+ months:** Posted in December 2025, so approximately 2 months open. Not necessarily a red flag for a specialized role at a 39-person company, but worth noting.

## Recent Activity (Last 6 Months)

- **Dec 2025:** "Raycast Wrapped 2025" feature launched --- personalized usage insights for users. 2,500+ extensions in the store.
- **Dec 2025:** Thomas Paul Mann reflected on 2025: went from Mac-only to three platforms (Mac, iOS, Windows) in one year.
- **Nov 2025:** Raycast for Windows launched in beta with core features (app launching, file search, clipboard history, AI chat).
- **Mid-2025:** When Apple tried to compete via Spotlight improvements, Raycast had its strongest month ever with most downloads in history.
- **May 2025:** Raycast for iOS launched ("powerful productivity on the go").
- **2025:** Companies began adopting Raycast as "table stakes for productive teams" --- enterprise momentum growing.
- **2026 vision:** Rethinking what a "modern operating system for professionals" looks like in the age of AI. Plans to turn LLMs into actual computer operators that can control apps on Mac and PC.
- **2026:** Announced plan to be more open, share more of their journey, and provide behind-the-scenes content.

**Hacker News reception:** Strong positive sentiment. "Raycast for Windows" (Dec 2025) generated discussion. Multiple HN posts show Linux developers building Raycast-compatible launchers, indicating the product has become a reference standard for developer productivity tools.

## Tech & Engineering

**Stack:** Core app: Swift (macOS), native platform code for iOS and Windows. Extensions: React, TypeScript, Node.js (JavaScriptCore runtime). Web properties: Next.js, TypeScript, Radix Primitives, Vercel. Process architecture: XPC inter-process communication, V8 isolates for extension sandboxing. API: Custom React reconciler for native UI rendering from React components.
**Engineering Blog:** https://www.raycast.com/blog --- active, high quality. Notable posts: "No code reviews by default" (engineering culture), "How the Raycast API and extensions work" (architecture), "Making our API more powerful" (API design philosophy).
**GitHub Org:** https://github.com/raycast --- active, multiple repos.
**Open Source Activity:** Excellent. The extensions repo is the centerpiece of their developer ecosystem.
**Contribution Opportunity:** High --- massive open-source ecosystem with clear contribution paths.
**Culture Signal:** Mature & thoughtful --- high-trust, ownership-driven, async-first. "No code reviews by default" policy reflects deep engineering culture. Engineers own features from ideation to maintenance. Nightly internal releases, feature flags for quality gates. Full remote (39 people, 16 countries). Only 1 Glassdoor review (too small a sample), but public signals are overwhelmingly positive.

Raycast's engineering culture is distinctive and well-documented. Key principles:
- **No mandatory code reviews:** Engineers push to main and request reviews only when they choose. This is built on trust and ownership.
- **Nightly internal releases:** All commits from the day are bundled and released internally each night for feedback and testing.
- **Feature flags:** Features are kept internal until quality bar is met.
- **Full ownership:** Engineers own features from ideation through maintenance. No hand-offs.
- **Async-first:** Distributed team across 16 countries requires strong async communication.
- **Small team, high output:** 39 people shipped three platform versions in one year (Mac, iOS, Windows).

### GitHub Contribution Analysis

**Repos Worth Looking At:**

- `raycast/extensions` --- 7.2K stars, 5.4K forks, TypeScript (89.7%), MIT license. The community extension marketplace. 714 open issues, 298 open PRs. 16,978 commits from 94+ contributors. This is a massive, active open-source project.
- `raycast/ray-so` --- 2.2K stars, 312 forks, TypeScript (84.9%), MIT license, Next.js. Web tools for code images, icon maker, prompt/preset/snippet explorers. 7 open issues, 11 open PRs. 535 commits, 94+ contributors.
- `raycast/utils` --- Utilities to streamline building Raycast extensions. TypeScript.
- `raycast/script-commands` --- Script commands for productivity workflows.

**Open Issues / PR Opportunities:**

The `raycast/extensions` repo has 714 open issues --- many are bug reports and feature requests for specific extensions. Key opportunities:
- Build a new extension that showcases Doug's skills (e.g., a sophisticated automation extension, a developer workflow tool, or an AI-powered extension)
- Fix bugs in popular extensions (TypeScript/React fixes)
- Improve TypeScript types in the utils package

The `raycast/ray-so` repo has 7 open issues and is built with Next.js + TypeScript --- directly in Doug's stack. Contributing here demonstrates ability to work in their actual web codebase.

**PR Submitted:** PR #407 — Added CFML (ColdFusion) syntax highlighting support (https://github.com/raycast/ray-so/pull/407). Closes issue #324. Sourced a MIT-licensed TextMate grammar, created the project's first custom grammar wrapper, and established a reusable pattern for adding languages Shiki doesn't bundle. All lint checks passed. This directly demonstrates the skills needed for the Design Engineer role and creates a warm introduction to the team.

**Alternative PR Idea:** Build a high-quality Raycast extension that solves a real developer problem. Extensions are built with React + TypeScript + Node --- Doug's exact stack. An extension related to automation, scraping, or agentic workflows would showcase his unique specialties while contributing to the ecosystem. The extension goes through the review process, creating a direct interaction with the Raycast team.

**MIT/OSS Component Angle:** Both the extensions repo and ray-so are MIT-licensed. The extensions ecosystem is Raycast's core growth engine (2,500+ extensions driving user adoption). High-quality extensions from experienced developers are genuinely valuable to the company. The Developer API documentation is excellent (developers.raycast.com), making it easy to contribute.

## Key Contacts

| Name | Title | LinkedIn | Recent Content | Why Them |
|------|-------|----------|----------------|----------|
| Thomas Paul Mann | CEO & Co-Founder | https://www.linkedin.com/in/thomas-paul-mann/ | X/Twitter: @thomaspaulmann (active). 2025 year-in-review thread. Changelog podcast interview (#587). Ness Labs interview. Blog post "No code reviews by default." | Co-founder who still codes. Ex-Facebook engineer. Publicly discusses engineering culture and product decisions. Approachable through content engagement. |
| Petr Nikolaev | CTO & Co-Founder | https://x.com/pitnikola | X/Twitter: @pitnikola. Leading the "Hype" team (marketing/growth --- first non-product team at Raycast). | Technical co-founder running growth/marketing --- interesting because he bridges engineering and GTM. Could discuss growth engineering angles. |

**Note:** At a 39-person company, the co-founders are accessible and involved in hiring decisions. No VP of Engineering or Engineering Manager titles found --- the flat structure means going directly to the founders is appropriate.

**Recommended first contact:** Thomas Paul Mann --- he is the CEO, active on Twitter/X, has given multiple public interviews, and wrote the "No code reviews by default" blog post that reveals his engineering values. He would appreciate a technical conversation about web engineering, developer tools, or extension ecosystem growth. Alternatively, contribute to ray-so or build an extension first, creating a warm introduction through the code review process.

## Pain Points & Opportunities

### What They Need
- **Web experience excellence:** The Design Engineer role signals they need someone to level up their web presence (raycast.com, ray.so tools, marketing pages). As they expand to Windows and iOS, the web layer becomes more important for cross-platform onboarding, documentation, and marketing.
- **Growth engineering for enterprise:** They recently posted their first sales hire (Solutions/Sales Engineer). Enterprise GTM needs growth engineering support --- self-serve onboarding, team management features, usage analytics dashboards.
- **Extension ecosystem growth:** 2,500+ extensions, but quality and discoverability matter. They need the ecosystem to keep growing to drive user adoption and retention.
- **AI integration depth:** Their 2026 vision is to turn LLMs into "computer operators." This requires sophisticated agentic workflow engineering --- connecting AI to OS-level actions, building reliable tool-calling chains.
- **Cross-platform web challenges:** With Mac, iOS, and Windows versions, they need web properties that work seamlessly across contexts. Progressive web app thinking, responsive design, and cross-platform consistency.

### How Doug Solves It
- **Next.js + TypeScript mastery:** The Design Engineer role literally requires Next.js and TypeScript. Doug has 8 years of React, deep Next.js expertise, and builds production applications with this exact stack daily.
- **Growth engineering for developer tools:** Doug's growth engineering experience at Patrianna (0 to 1M users), Groupon, and Motley Fool applies directly. He understands conversion funnels, user onboarding, and the metrics that matter for product-led growth.
- **Open-source and developer ecosystem experience:** Doug has authored multiple NPM packages and understands developer experience from both sides. He can contribute to the extension ecosystem and improve the developer platform.
- **Agentic workflow expertise:** Doug is actively building agentic workflows and AI tooling. The 2026 vision of LLMs as computer operators aligns directly with his current side projects and interests.
- **Design sensibility:** The role asks for someone who can work in Figma and obsess over details. Doug's work with Framer and his portfolio (contra.com/doug_silkstone/work) demonstrates design awareness beyond typical engineering.

### First 90 Days Sketch
1. **Month 1:** Ship a meaningful improvement to ray.so or the Raycast website. Understand the design system and component library. Fix a few open issues to build context across the codebase. Establish relationship with the design process and learn how web projects are prioritized.
2. **Month 2:** Own a web project end-to-end --- likely a new tool for ray.so, a website section, or a marketing campaign page. Begin contributing to design system improvements. Propose growth engineering ideas for the web funnel (landing pages, onboarding, enterprise sign-up flow).
3. **Month 3:** Propose and begin building a growth-oriented web project that drives measurable user acquisition or conversion. Start influencing the web engineering roadmap. Potentially prototype an agentic workflow extension that showcases AI integration capabilities.

## Proposed Angles

1. **Open Source Contribution Angle** (Technical) — **PR SHIPPED**
   "I submitted PR #407 to ray-so adding ColdFusion syntax highlighting — sourced a TextMate grammar, built the first custom language wrapper in the project, and set up a pattern for adding any grammar Shiki doesn't bundle. I've built several Next.js + TypeScript projects at scale, including a platform serving 25M monthly sessions. I find that shipping code in your actual codebase is a better introduction than any resume."

2. **Developer Tool Growth Angle** (Business)
   "Raycast's expansion from Mac to three platforms in a single year is impressive execution. I led growth engineering at Patrianna where we scaled a new product from zero to 1M users, and I've been thinking about how growth engineering principles apply to developer tools specifically --- the web funnel (raycast.com to download to daily user) has unique dynamics compared to typical SaaS. I'd love to discuss how you're approaching web-driven growth as you expand the user base."

3. **Agentic Workflows Angle** (Technical)
   "Your 2026 vision of turning LLMs into computer operators that can control any app is exactly what I'm building in my side projects. I've been featured in MIT's Generative AI course (50K+ students) and I'm deep in the agentic workflow space --- building automation tooling and exploring how AI agents can reliably interact with desktop applications. I'd love to discuss how Raycast is approaching the agent-as-OS problem."

## Notes

- **Salary consideration:** EUR 100-135K for the Design Engineer role. This is reasonable for a European remote role but potentially below market for someone with Doug's 15+ years of experience and track record. However, Raycast offers stock options, and if the company continues its trajectory, the equity could be significant. Worth negotiating on total compensation.
- **Title consideration:** "Design Engineer" may feel like a step down from "Lead Full Stack Software Engineer." However, at a 39-person company, titles are less meaningful than scope. The job description makes clear this is a senior engineering role with full ownership. Worth discussing scope and growth path in the conversation.
- **Cultural fit:** The "no code reviews by default" culture, full ownership model, and async-first communication style strongly align with Doug's preference for autonomy and ownership. This is probably the strongest cultural fit of the three companies in this batch.
- **Remote compatibility:** Fully remote, CET +/- 3 hours. Prague is in CET --- perfect timezone fit. Team of 39 across 16 countries. This is one of the most remote-friendly companies on the target list.
- **Competitive advantage:** Doug's combination of Next.js/TypeScript expertise, growth engineering background, and AI/agentic workflow experience is unusual. Most Design Engineer candidates will have the frontend skills but not the growth engineering and AI angles. This differentiation could be compelling.
- **Risk factors:** Small company (39 people) with $47.8M total funding. Revenue model is freemium with Pro tier ($8/month) and Teams tier. Enterprise adoption is nascent. Sustainability depends on continued growth and potential Series C. However, the product has strong community love, investor backing (Atomico, Accel, YC), and celebrity investors (GitHub CEO, Shopify CEO, Vercel CEO).
- **Open source status:** PR #407 submitted to ray-so on 2026-02-16. Awaiting review from samuelkraft (maintainer who encouraged community contributions on issue #324). Once merged, this becomes a concrete talking point for the Design Engineer application. Consider a second contribution (Raycast extension or another ray-so issue) to deepen the relationship before applying.

---

*Generated by company-deep-dive skill. Verify key facts before using in outreach.*
