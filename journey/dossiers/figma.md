# Figma — Deep Dive Dossier

**Last Updated:** 2026-02-15
**Priority Tier:** 3 (Watch)
**Overall Assessment:** Iconic design tool with deep TypeScript + C++/WASM architecture. London engineering office exists and is growing. However, stock has crashed 85% post-IPO on AI disruption fears, limited London senior engineering openings currently visible, and hybrid requirement in London. Watch for when senior roles open — the technical environment (WebGL, WASM, C++) aligns with Doug's growing interest in lower-level work.
**Existing Relationship:** No

---

## Current Openings

| Role | Team | Link | Posted | Salary | Doug Fit |
|------|------|------|--------|--------|----------|
| Manager, Software Engineering - Dev Mode Extensibility | Developer Tools | [boards.greenhouse.io/figma](https://boards.greenhouse.io/figma) | Uncertain (may be filled) | Not posted | **Moderate** — Engineering management in London. Doug has management experience but this is API/extensibility focused, not growth. |
| Software Engineer, Graphics - Figma Weave | Graphics | [boards.greenhouse.io/figma](https://boards.greenhouse.io/figma) | Active | Not posted | **Weak-to-Moderate** — London or Tel Aviv. Graphics/rendering focus. Interesting for C++ growth but not Doug's core strength yet. |
| Software Engineer Intern, Developer Tools (2026) | Developer Tools | [boards.greenhouse.io/figma](https://job-boards.greenhouse.io/figma/jobs/5621177004) | Active | Intern-level | **N/A** — Internship |
| Manager, Software Engineering - Developer Tools | Developer Tools | London | Active | Not posted | **Moderate** — Similar to Dev Mode Extensibility role. Management of developer platform team. |

Limited senior IC engineering roles in London currently. Most engineering hiring appears US-focused. The London office is growing but still building out.

## Recent Activity (Last 6 Months)

- **Jul 2025:** IPO on NYSE under ticker "FIG" at $33/share. Stock surged to $143 (briefly ~$68B valuation) on first day, then crashed.
- **Feb 2026:** Stock down ~85% from peak, trading near $21. Market fears around AI disrupting design tools (competitors like Claude Code, v0, etc.).
- **2025:** Launched Figma Make (AI prototyping), Figma Draw (AI sketching), Figma Sites (AI web development). Major AI product push.
- **2025:** Config London 2025 conference held — signal of London office investment.
- **Jan 2026:** 180-day lockup ended, enabling employee share sales. Further downward pressure on stock.
- **No major layoffs announced** despite stock crash, though Blind forums show employee anxiety.

## Tech & Engineering

**Stack:** C++ compiled to WebAssembly (canvas/rendering), TypeScript + React (UI layer), WebGL (rendering), Ruby + Go + TypeScript (backend). Plugin system uses JavaScript/TypeScript in sandboxed iframes.
**Engineering Blog:** [figma.com/blog/engineering](https://www.figma.com/blog/engineering/) — Excellent, detailed technical posts. Posts on WebAssembly migration (3x load time improvement), TypeScript migration from custom language, game engine-inspired architecture, plugin system design.
**GitHub Org:** Limited public repos — core product is proprietary.
**Open Source Activity:** Some open-source contributions (plugin API, developer tools). Published detailed engineering blog posts sharing architectural decisions.
**Culture Signal:** **Mature & thoughtful** — Detailed engineering blog, public conference talks, game-engine-inspired architecture. VP of Engineering Marcel Weekes actively speaks at conferences and publishes.

Key engineering culture signals:
- Architecture inspired by game engines (C++/WebGL) rather than typical web stacks
- Migrating from custom programming language to TypeScript — shows pragmatic evolution
- Active engineering blog with deep technical content
- Config conference (annual, including London edition) shows community investment
- Strong design culture — engineering works closely with product and design
- Plugin ecosystem and developer platform team in London
- Post-IPO, likely some uncertainty and possible shifts in engineering priorities

## Key Contacts

| Name | Title | LinkedIn | Recent Content | Why Them |
|------|-------|----------|----------------|----------|
| Marcel Weekes | VP, Product Engineering | [The Org](https://theorg.com/org/figma/org-chart/marcel-weekes) | First Round podcast on IC-to-manager transition, ELC podcast on Config/DevMode, Figma blog post on AI-era engineering skills | Active thought leader. Speaks publicly about engineering leadership. Key decision maker for London eng team. |

**Recommended first contact:** Marcel Weekes (VP, Product Engineering) — Extremely active in public engineering content (podcasts, blog posts, conference talks). His content on engineering management and AI-era skills gives Doug multiple conversation hooks. As VP overseeing product engineering, he influences London hiring.

## Pain Points & Opportunities

### What They Need
- **Navigating AI disruption narrative:** Stock crash driven by AI fears. Need to demonstrate that AI enhances Figma rather than replaces it. Figma Make, Draw, and Sites are their response.
- **Building out London engineering presence:** Hiring engineering managers and building European teams.
- **Developer platform/extensibility:** Dev Mode, Code Connect, MCP server — bridging design and development. Active hiring in this area.
- **Maintaining morale post-IPO crash:** 85% stock decline from peak affects retention and hiring ability.

### How Doug Solves It
- **TypeScript + C++ interest:** Doug's growing C++ work (Source 2 modding) and 8 years of React/TypeScript maps to Figma's unique TS/C++/WASM architecture. Few candidates have both.
- **Plugin/extension ecosystem experience:** Doug has built automation tooling and NPM packages — relevant for the developer extensibility platform.
- **Growth engineering:** While Figma's challenge is different from typical growth, Doug's experience driving adoption and engagement (0 to 1M at Patrianna, GTM at Mekamon for Apple Store launch) is relevant as Figma needs to prove growth to public market investors.
- **Engineering leadership:** If a management role opens, Doug's team-building experience (9-person team at Patrianna) is relevant.

### First 90 Days Sketch
Month 1: Onboard into the Developer Tools or extensibility team in London. Understand the C++/WASM/TypeScript architecture boundary. Contribute to Dev Mode or plugin system improvements.
Month 2: Own a feature in the developer platform — likely plugin API improvements, Code Connect enhancements, or MCP server work. Learn the WebGL/C++ rendering stack enough to be effective.
Month 3: Ship meaningful improvements to developer experience. Begin contributing to cross-team architecture discussions. Establish relationships with the London engineering team.

## Proposed Angles

1. **C++ and TypeScript Dual Expertise** (Technical)
   "Figma's game-engine-inspired architecture — C++ compiled to WASM for the canvas, TypeScript + React for the UI — is one of the most interesting tech stacks in the industry. I'm one of the rare engineers who works in both worlds: 8 years of React/TypeScript professionally, and increasingly deep C++ work on a Valve Source 2 game modding platform. I've been reading your engineering blog posts on the WASM migration and TypeScript evolution with great interest."

2. **Developer Platform Builder** (Technical)
   "Figma's developer ecosystem (Dev Mode, Code Connect, MCP server, plugins) is becoming the bridge between design and code — and that's where I see the future of product development. I've built extension systems and developer tools (author of multiple NPM automation packages) and understand what makes a platform that developers actually want to build on. I'd love to discuss how the London team is shaping Figma's developer experience."

3. **Growth Engineering in a Post-IPO World** (Business)
   "After the IPO, Figma needs to prove to public markets that AI is a tailwind, not a headwind. I've spent my career driving growth in exactly these high-stakes moments — taking Patrianna from zero to 1M players, leading go-to-market for a product launched in Apple Stores globally, and building growth systems at Groupon and Contra. I'd love to discuss how the engineering team is thinking about AI-driven growth."

## Notes

- **Stock crash is a red flag and an opportunity:** The 85% decline from peak means equity-based compensation is worth much less than expected. However, if you believe in Figma long-term, getting in at depressed prices could be advantageous. The product itself remains strong.
- **Limited London senior roles:** Currently mostly management and intern roles visible in London. May need to wait for senior IC roles to open, or pursue the engineering manager track.
- **Hybrid London required:** Not remote-friendly. Doug would need to be in London.
- **AI competition narrative:** The market is worried about AI replacing Figma's users (designers), not Figma's engineers. This is an existential question for the company. Figma's response (Make, Draw, Sites) seems strong but unproven.
- **IPO lockup ended:** January 2026 lockup expiry means employee selling pressure. Could affect morale and retention, potentially creating more openings soon.
- **Salary data point:** Figma is known to pay well. Glassdoor suggests $150K-$250K+ for senior engineers in the US; London roles may be adjusted but still competitive.

---

*Generated by company-deep-dive skill. Verify key facts before using in outreach.*
