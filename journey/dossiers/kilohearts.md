# Kilohearts -- Deep Dive Dossier

**Last Updated:** 2026-02-15
**Priority Tier:** 3 (Watch)
**Overall Assessment:** Tiny (9-person) but innovative modular plugin company in Linkoping, Sweden. Great engineering culture signals, fully independent, but no current openings and an entirely C++/DSP stack. Very long shot unless they expand into web tooling.
**Existing Relationship:** No

---

## Current Openings

| Role | Team | Link | Posted | Salary | Doug Fit |
|------|------|------|--------|--------|----------|
| *None currently* | -- | -- | -- | -- | -- |

Kilohearts' careers page states "When we have positions available they will be posted below" -- currently nothing listed. The only active hiring is for freelance animators to produce Content Bank trailers (paid hourly, ~1 week to a few months). Applications go to info@kilohearts.com.

Given the 9-person team, openings are exceptionally rare. They have 7 people in Linkoping and 2 remote globally. Past roles have not been engineering-focused externally -- they seem to hire developers through their network.

## Recent Activity (Last 6 Months)

- **Aug 2025:** Released Compactor, a free loudness-maximizing plugin added to Kilohearts Essentials. All plugins updated to v2.4.2.
- **2025:** Ran Game Audio Week 2025 Sound Design Contest -- showing expansion into game audio market.
- **2025:** Kilohearts v2 ecosystem update continued rolling out, adding modular modulation to Snap Heap and Multipass (originally launched mid-2024).
- **Nov 2024:** Released Filter Table, a wavetable-powered filtering effects plugin.
- **Ongoing:** Regular Content Bank releases for Phase Plant from third-party sound designers.

No funding rounds (bootstrapped), no acquisitions, no layoffs, no leadership changes. Steady, small, independent operation. Their Black Friday 2025 sale was extended, suggesting strong consumer demand.

## Tech & Engineering

**Stack:** C++, DSP, custom modular architecture, shared codebase across all plugins
**Engineering Blog:** None found -- no public engineering writing
**GitHub Org:** github.com/kilohearts -- only one public repo: `keson` (a small C++ library for JSON-superset reading/writing)
**Open Source Activity:** Minimal -- one small utility library
**Culture Signal:** Unknown -- but architecture suggests thoughtful engineering

Key technical insight: all Kilohearts plugins share a single codebase and version number. This is a significant architectural decision -- it means they have a unified modular framework where individual "Snapins" (effects) are components that can be used standalone or composed inside host plugins (Phase Plant, Multipass, Snap Heap). This modular architecture is genuinely innovative in the plugin space.

Their engineering philosophy emphasizes optimization: "at every point in the signal chain, all software is optimised for the highest quality processing with the lowest possible CPU load."

The `keson` open-source library (C++) reveals some engineering style: they're comfortable with pragmatic, well-scoped utilities. It's described as "a sloppy superset of JSON" -- suggesting a practical, non-dogmatic engineering culture.

## Key Contacts

| Name | Title | LinkedIn | Recent Content | Why Them |
|------|-------|----------|----------------|----------|
| Anders Stenberg | Co-Founder & Developer | kilohearts.com | Pole Position interview on modular audio | Technical co-founder, key decision maker |
| Per Larsson | Co-Founder & Programmer | linkedin.com/in (Linkoping) | None found | Co-founder, active developer |

**Recommended first contact:** Anders Stenberg -- in their Pole Position Production interview, Kilohearts discussed their engineering philosophy openly. Anders is the more publicly visible of the two co-founders and appears to engage with the community.

## Pain Points & Opportunities

### What They Need
- With only 9 people managing an entire modular ecosystem (Phase Plant, Multipass, Snap Heap, 30+ Snapins, Essentials freebies, Content Banks), they're likely stretched thin
- Game audio market expansion (Game Audio Week contest) suggests growing beyond music production
- No web platform beyond a basic e-commerce site -- no user accounts, no cloud preset sharing, no plugin analytics
- Content Bank ecosystem requires curation, distribution, and potentially a marketplace

### How Doug Solves It
- If Kilohearts were to build a web-based preset/Content Bank marketplace or community platform, Doug's full-stack expertise is directly relevant
- His experience with automation tooling (NPM packages, Vouchernaut) could help automate their Content Bank pipeline
- Game audio expansion aligns with his Source 2 modding work and gaming background (Patrianna's game studio)

### First 90 Days Sketch
Again speculative, but if they hired a web engineer: build a proper Content Bank marketplace where third-party designers can submit, users can browse/preview/purchase, and the pipeline from creation to delivery is automated. Currently this seems manual.

## Proposed Angles

1. **Modular Architecture** (Technical)
   "The shared-codebase approach behind the Kilohearts ecosystem is one of the most elegant architectural decisions in the plugin space. I'm a full-stack engineer building a modular game modding platform on Valve Source 2, and the parallels in plugin/component composition are fascinating. Would love to connect."

2. **Game Audio Expansion** (Business)
   "I noticed the Game Audio Week contest -- exciting to see Kilohearts pushing into game audio. I led a game studio from zero to 1M players at Patrianna and I'm now building modding tools for Source 2. If you're thinking about how Kilohearts tools integrate into game development workflows, I'd love to share some perspectives."

3. **Content Platform** (Technical)
   "The Content Bank ecosystem for Phase Plant is growing fast -- I've been watching the third-party releases stack up. As someone who built an affiliate automation platform serving 10,000+ brands at Vouchernaut, I'm curious whether you've considered a more robust creator marketplace. Happy to chat about what scaled for us."

## Notes

- **Key gap:** Same as FabFilter -- pure C++/DSP shop. Doug's web/growth expertise doesn't map to their current hiring needs.
- **Workplace culture:** 6 weeks paid vacation, flexible 6-8 hour days, rare overtime, conference attendance. This is an exceptionally good quality-of-life employer for its size.
- **Independence:** Fully self-funded, no external stakeholders. They make decisions purely based on what they want to build.
- **Location:** Linkoping, Sweden -- not a major tech hub. Remote possible (2 of 9 are remote) but team is concentrated locally.
- **Timing:** No openings. Extremely small team means very infrequent hiring. Check back semi-annually.
- **Red flags:** None. Healthy, respected, independent. Just tiny and not aligned with Doug's stack.

---

*Generated by company-deep-dive skill. Verify key facts before using in outreach.*
