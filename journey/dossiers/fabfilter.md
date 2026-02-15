# FabFilter -- Deep Dive Dossier

**Last Updated:** 2026-02-15
**Priority Tier:** 3 (Watch)
**Overall Assessment:** World-class audio plugin company with elite reputation and ~$4.4M revenue, but no current openings and a deeply C++/DSP-focused stack that doesn't align with Doug's core strengths. Worth monitoring for any web/platform engineering hires as they grow.
**Existing Relationship:** No

---

## Current Openings

| Role | Team | Link | Posted | Salary | Doug Fit |
|------|------|------|--------|--------|----------|
| *None currently* | -- | -- | -- | -- | -- |

FabFilter's jobs page (fabfilter.com/jobs) currently states "At the moment, we don't have any job opening at FabFilter." They previously advertised for a Senior C++ Developer and an Interface/UX Designer, both of which have been filled or removed. Given the small team size (~15-25 people), openings are rare and likely filled through network or direct application.

## Recent Activity (Last 6 Months)

- **Jan 2026:** Released FabFilter Pro-C 3 compressor (EUR 169 / USD 199) with six new compression algorithms, bringing total styles to 14. Major product launch.
- **Jan 2026:** Free Pro-Q 4.10 update adding multi-plugin Instance List support -- turns Pro-Q into a full multi-track channel strip controlling Pro-C 3, Pro-DS, and Pro-G instances.
- **May 2025:** Updated FabFilter One, Simplon, and Micro with fresh design, interface scaling, and Pro Tools hardware surface support.
- **Feb 2025:** Pro-Q 4.02 update with per-band Spectral Tilt parameter and bug fixes.
- **Dec 2024:** Pro-Q 4 original release -- their most significant product launch in years.

FabFilter is on a strong product cadence. Pro-Q 4 was a landmark release, and Pro-C 3 followed quickly. They now support CLAP format alongside VST/VST3/AU/AAX. No funding rounds (bootstrapped since 2002), no acquisitions, no layoffs. Steady and healthy.

## Tech & Engineering

**Stack:** C++, DSP, custom UI framework, CLAP/VST/VST3/AU/AAX/AudioSuite plugin formats
**Engineering Blog:** None found -- no public engineering writing
**GitHub Org:** None found -- no public open source
**Open Source Activity:** None visible
**Culture Signal:** Unknown -- not enough public signal, but product quality suggests mature engineering practices

FabFilter's entire engineering output is native C++/DSP audio plugin development. They build everything from scratch -- custom audio algorithms, custom UI rendering (not JUCE-based). The quality of their products (Pro-Q is the industry-standard EQ) suggests rigorous engineering, but there is zero public signal about how they work internally. No blog, no GitHub, no conference talks found. On a forum thread about frameworks, they confirmed they use their own proprietary C++ framework, not JUCE.

The company is located at Keizersgracht 467 in central Amsterdam, described as a spacious office overlooking one of the oldest canals, with synthesizers, vinyl, and a relaxed atmosphere.

## Key Contacts

| Name | Title | LinkedIn | Recent Content | Why Them |
|------|-------|----------|----------------|----------|
| Frederik Slijkerman | Co-Founder | Not publicly listed | MusicRadar interview "Meet the Programmers" | Technical co-founder, leads development |
| Floris Klinkert | Co-Founder (MSc CS, UvA) | Not publicly listed | None found | Business/technical co-founder |

**Recommended first contact:** Frederik Slijkerman -- as the technical co-founder, he would be the decision-maker for any engineering hires. However, FabFilter is a notoriously private company with no public LinkedIn presence for either founder. Cold outreach would need to go through info@fabfilter.com.

## Pain Points & Opportunities

### What They Need
- Their recent product velocity (Pro-Q 4, Pro-C 3, Instance List integration) suggests growing complexity in their plugin ecosystem -- cross-plugin communication, multi-instance management
- CLAP format adoption is new for them -- expanding format support increases engineering surface area
- No visible web presence beyond a basic marketing site -- no user accounts, no cloud features, no subscription model
- As the team grows from ~15 to potentially 25+, they may need web infrastructure for licensing, telemetry, or user features

### How Doug Solves It
- If FabFilter ever moves toward web-based tooling (licensing portals, user accounts, preset sharing, plugin analytics), Doug's full-stack expertise becomes directly relevant
- His experience building SaaS at getBenson (protecting 25M monthly sessions) maps to any web platform they might build
- His C++ side project work (Valve Source 2 modding) shows he can bridge web and native worlds

### First 90 Days Sketch
This is speculative since there's no open role, but if FabFilter were to hire a web/platform engineer: build out a modern user account system, plugin licensing infrastructure, and potentially a preset/setting sharing platform. Their current web presence is minimal static pages.

## Proposed Angles

1. **Technical Credibility** (Technical)
   "I've been watching the Pro-Q 4 Instance List feature with interest -- cross-plugin communication at that level is a fascinating engineering challenge. I'm a full-stack engineer doing C++ game modding on the side, and I'd love to understand how you approached the inter-plugin state management. Would be great to connect."

2. **Platform Vision** (Business)
   "Congrats on the Pro-C 3 launch -- the product velocity at FabFilter has been impressive. As someone who built SaaS infrastructure handling 25M monthly sessions, I'm curious whether you've considered web-based features like cloud preset management or plugin analytics. Happy to share perspectives from the SaaS world."

3. **Music Tech Passion** (Network)
   "I'm a full-stack engineer and music producer based in Prague, actively exploring opportunities in European music tech. FabFilter's engineering quality is genuinely best-in-class. I'm doing some C++ work on a Valve Source 2 modding platform and would love to connect with fellow engineers building tools for creators."

## Notes

- **Key gap:** FabFilter is a pure C++/DSP shop. Doug's core strengths (TypeScript, React, Next.js, growth engineering) don't align with their current needs. This would only make sense if they expand into web/cloud features.
- **Privacy:** Both founders have virtually no public internet presence. No LinkedIn, no Twitter, no blog posts. Outreach must go through official channels.
- **Revenue:** Estimated ~$4.4M annually (Tracxn). Bootstrapped and profitable. No pressure to hire quickly.
- **Timing:** No current openings. Check back quarterly.
- **Red flags:** None. This is a healthy, respected company. Just not a fit right now.

---

*Generated by company-deep-dive skill. Verify key facts before using in outreach.*
