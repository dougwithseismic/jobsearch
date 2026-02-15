# Audiomovers (Abbey Road Studios) — Deep Dive Dossier

**Last Updated:** 2026-02-15
**Priority Tier:** 3 (Watch)
**Overall Assessment:** Small but prestigious audio software company (part of Abbey Road Studios / Universal Music Group). Actively hiring across C++/JUCE and full-stack web roles. The C++ work aligns with Doug's growing interest in lower-level programming, and the full-stack web role is a direct fit. Small team (~11) means high ownership but limited growth path. The Abbey Road brand adds prestige.
**Existing Relationship:** No

---

## Current Openings

| Role | Team | Link | Posted | Salary | Doug Fit |
|------|------|------|--------|--------|----------|
| Full Stack Web Developer | Web Platform | Contact jobs@audiomovers.com | Active | Not posted | Strong — Full-stack web development is Doug's core strength. Building web-based audio collaboration tools is technically interesting. |
| C++/JUCE Developer | Audio Software | Contact jobs@audiomovers.com | Active | Not posted | Moderate — Aligns with Doug's growing C++ interest and VST side projects. However, his C++ experience is less proven commercially than his web stack. |
| Infrastructure Developer | DevOps/Backend | Contact jobs@audiomovers.com | Active | Not posted | Moderate — Linux, C++ servers, WebSocket, FastCGI. Interesting overlap with his automation and infrastructure experience. |

**Notes:** Audiomovers lists positions informally (via audio.dev/jobs and direct contact) rather than on traditional job boards. This suggests they hire through network and community — which actually favors someone who can make a personal, technically credible introduction.

## Recent Activity (Last 6 Months)

- **Aug 2025:** Major LISTENTO update — 128-channel lossless audio streaming (up from 16), 384kHz sample rate support, multi-stream receiving (4 simultaneous streams), video sync, Guest Pass feature, improved timecode generation.
- **Jan 2025:** NAMM 2025 product announcements — new features and updates previewed at the industry's biggest trade show.
- **2025:** Continued development of LISTENTO as the primary product, with subscription tiers ($99-$275/year).
- **2021 (context):** Acquired by Abbey Road Studios (Universal Music Group). Continues operating under the Audiomovers name.

**Trajectory:** Steady product development under the Abbey Road umbrella. Not a high-growth startup — more of a stable, specialized audio software business backed by the resources and brand of one of the most iconic music studios in the world. The LISTENTO product is gaining features and clearly serving a real market need in remote music collaboration.

## Tech & Engineering

**Stack:** C++, JUCE framework (audio plugins), WebSocket, FastCGI, Linux servers, web platform (stack unspecified but likely modern JS/TS)
**Engineering Blog:** None found (product-focused blog at audiomovers.com/news)
**GitHub Org:** None found (closed source, proprietary audio software)
**Open Source Activity:** None found
**Culture Signal:** Mature & thoughtful — Both founders come from deep audio engineering backgrounds (Waves Audio, Avid/Pro Tools). The product is technically sophisticated (real-time lossless multichannel audio streaming). Small team suggests careful, quality-focused development.

The technical challenge at Audiomovers is genuinely interesting: real-time, low-latency, high-fidelity audio streaming across the internet. This involves C++/JUCE for the plugin/application layer, web technologies for the collaboration platform, and infrastructure engineering for the streaming backend. The 128-channel lossless streaming capability is technically impressive and suggests strong engineering fundamentals. The founders' backgrounds (combined 15+ years at Waves Audio and Avid) mean the engineering bar is high.

## Key Contacts

| Name | Title | LinkedIn | Recent Content | Why Them |
|------|-------|----------|----------------|----------|
| Igor Maxymenko | Co-Founder & CEO | No LinkedIn found publicly | Abbey Road interview, MusicRadar feature, product announcements | Company leader. Background at Blue Microphones and Waves Audio. Would make hiring decisions. |
| Yuriy Shevyrov | Co-Founder & Head of Technology | [LinkedIn](https://www.linkedin.com/in/yshevyrov/) | Abbey Road profile | Technical decision-maker. Former Avid (Pro Tools) team lead and Waves Audio engineer. Would evaluate technical candidates. |

**Recommended first contact:** Yuriy Shevyrov — As Head of Technology and co-founder, he's the person who would evaluate engineering candidates. His background at Avid (7 years as team lead on Pro Tools) and Waves Audio means he'd respect someone with deep technical chops. The approach should be technically credible and reference the LISTENTO product specifically.

## Pain Points & Opportunities

### What They Need
- Web developers who can build the collaboration platform side of LISTENTO — the product is expanding beyond just audio streaming into workflow tools (video sync, Guest Pass, multi-stream management)
- Infrastructure engineers to handle the backend for 128-channel lossless streaming at scale
- Potentially someone who can bridge the gap between the C++/JUCE audio layer and the web platform
- A small team (~11) that needs people who can wear multiple hats

### How Doug Solves It
- **Full-stack web for audio products:** Doug's core strength. Building the web collaboration layer for LISTENTO is a direct match for his experience building production web applications.
- **C++ growing expertise:** Doug is actively building Valve Source 2 modding tools and doing more C++ work. While not his primary commercial experience, it shows genuine interest and growing capability in the language Audiomovers uses for their core product.
- **Infrastructure and automation:** Built automation systems across multiple companies. The WebSocket/streaming infrastructure challenge is in his wheelhouse.
- **Small team ownership:** Has thrived in small teams and startups — 3x exits from small-to-medium companies. Comfortable owning large parts of a product.

### First 90 Days Sketch
- Weeks 1-4: Deep dive into the LISTENTO architecture. Understand the web platform codebase and how it interfaces with the C++/JUCE audio layer. Ship a small improvement to demonstrate competence.
- Weeks 5-8: Take ownership of a web platform feature — likely something related to the Guest Pass system, multi-stream management UI, or collaboration workflow improvements.
- Weeks 9-12: Propose and begin building a feature that bridges web and audio capabilities, leveraging understanding of both layers.

## Proposed Angles

1. **VST/Audio Tech Enthusiasm** (Technical)
   "The LISTENTO 128-channel update is seriously impressive engineering — real-time lossless streaming at that scale is no small feat. I build VST-related tools and Valve Source 2 modding platforms as side projects, so audio software architecture is something I genuinely care about. I'd love to hear how you're handling the web collaboration layer alongside the C++/JUCE core — that intersection of web platform and audio engine is exactly where my interests converge."

2. **Web Platform for Audio Professionals** (Business)
   "I noticed you're looking for Full Stack Web Developers. I've spent 15 years building production web platforms — including SaaS products like getBenson (25M monthly sessions) and automation tools used by thousands of professionals. The Guest Pass feature and multi-stream collaboration in LISTENTO suggest the product is evolving from a pure audio tool into a collaboration platform, and that's a transition I have direct experience building."

3. **Small Team, High Ownership** (Cultural)
   "What appeals to me about Audiomovers is the combination of a small, expert team and a technically challenging product backed by Abbey Road's brand. I've built and exited three companies as a hands-on engineer, and I do my best work when I can own significant parts of a product. The opportunity to work on something used by professional studios worldwide, in a team where every engineer's contribution is visible, is exactly what I'm looking for."

## Notes

- **Location:** Hybrid in London (Abbey Road). Doug is in Prague. Need to clarify remote work policy — for a team of 11 with founders based in London, they may require on-site presence.
- **Salary unknown:** Being part of Universal Music Group could mean decent compensation, but small acquired teams sometimes retain startup-level pay. Worth investigating.
- **C++ opportunity:** This is one of the few music tech companies where Doug could combine his web expertise with his growing C++ interest. The bridge between web platform and JUCE audio engine is a unique selling point.
- **Hiring process:** No formal careers page — positions listed informally via audio.dev/jobs and direct email (jobs@audiomovers.com). This means networking and a warm introduction are more important than applying through an ATS.
- **Small team risk:** At ~11 people, there's limited career growth path. This would be a role about craft and ownership, not about climbing a ladder.
- **Abbey Road brand:** Working at Abbey Road Studios is inherently prestigious in the music tech world. Good for Doug's profile regardless.

---

*Generated by company-deep-dive skill. Verify key facts before using in outreach.*
