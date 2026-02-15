# Spitfire Audio -- Deep Dive Dossier

**Last Updated:** 2026-02-15
**Priority Tier:** 2 (Warm) -- upgraded from Tier 3 due to active engineering openings and WebView/web tech stack
**Overall Assessment:** The most actionable opportunity in this batch. Spitfire Audio is actively hiring Software Engineers and DevOps Engineers, uses JUCE + WebView (web tech for plugin UI), was acquired by Splice for ~$50M in April 2025, and is London-based with hybrid/remote options. However, significant red flags: Glassdoor 3.9, 25% layoffs in 2023, co-founder controversy, ongoing staff turnover concerns. Doug should apply but go in with eyes open.
**Existing Relationship:** No

---

## Current Openings

| Role | Team | Link | Posted | Salary | Doug Fit |
|------|------|------|--------|--------|----------|
| Software Engineer | Engineering | apply.workable.com/spitfireaudio | Unknown | Not posted | **Strong** -- JUCE + WebView stack, they're building plugin UIs with web tech. Doug's React/web expertise is directly relevant |
| Software QA Engineer | Engineering | apply.workable.com/spitfireaudio | Unknown | Not posted | Weak -- QA role, below Doug's level |
| DevOps Engineer | Engineering | apply.workable.com/spitfireaudio | Unknown | Not posted | Moderate -- Doug has DevOps experience (Vercel, AWS, GCP) but it's not his primary strength |
| CRM Manager | Marketing | apply.workable.com/spitfireaudio | Unknown | Not posted | Weak -- not engineering |
| Website Project Manager | Web | apply.workable.com/spitfireaudio | Unknown | Not posted | Moderate -- Doug could do this but it's below his level |
| Product Marketing Manager | Marketing | apply.workable.com/spitfireaudio | Unknown | Not posted | Weak -- not engineering |
| Creative Director | Creative | apply.workable.com/spitfireaudio | Unknown | Not posted | Weak -- not engineering |

**Key insight:** The Software Engineer role is the most relevant. Spitfire's LABS plugin was rebuilt using JUCE + WebView, meaning they're using web technologies (HTML/CSS/JS) for plugin UI rendering. This is the bridge between Doug's web expertise and the audio plugin world. They explicitly want people who can build with web tech inside native audio applications.

Applications go to careers@spitfireaudio.com with "Your chosen role title and LinkedIn" in the subject line.

## Recent Activity (Last 6 Months)

- **Apr 2025:** Acquired by Splice for ~$50M. Spitfire continues operating independently under its own brand. CEO Olivier Robert-Murphy reports to Splice CEO Kakul Srivastava. Paul Thomson (co-founder) continues leading creative direction.
- **2025:** First Splice x Spitfire collaboration launched -- Hollywood-grade orchestral tools made accessible to electronic producers through Splice's INSTRUMENT platform.
- **2025:** Splice launched INSTRUMENT platform ($12.99/month) with 1,200+ presets at launch, partially built on Spitfire content.
- **2023:** 25% of employees made redundant. Co-founder Christian Henson departed after controversy over public statements. Multiple Glassdoor reviews describe ongoing staff losses and management instability.
- **Ongoing:** Hiring across engineering, product, marketing -- suggests rebuilding after the 2023 contraction and post-acquisition.

The acquisition by Splice is the dominant story. It brings capital ($105M+ raised by Splice), distribution (Splice's user base), and AI technology (Splice's AI discovery engine). But it also brings integration complexity, cultural change, and potential redundancies as the companies merge operations.

## Tech & Engineering

**Stack:** C++, JUCE (audio framework), WebView (web-based plugin UI), custom audio engine, web platform
**Engineering Blog:** None found
**GitHub Org:** None found as public
**Open Source Activity:** None visible
**Culture Signal:** Concerning -- Glassdoor 3.9, layoffs, staff turnover, but technical approach is innovative

The most notable technical fact about Spitfire Audio: **they use WebView inside JUCE for plugin UI**. This is a modern and somewhat controversial approach in the audio plugin world. Instead of building native C++ UIs, they render web pages (HTML/CSS/JavaScript) inside the plugin window. Benefits include faster UI iteration, easier parity between website and product, and access to web developers (not just C++ specialists).

The LABS team (James Baxter, Jake Mills, Martin Robinson) built the latest LABS plugin with this approach. Their Air Reverb product also uses web tech for UI.

Spitfire made their own audio engine on top of JUCE but uses web technologies for the interface layer. This creates a clear separation: C++ for audio processing, web tech for UI and content management. The LABS plugin includes content management features (downloading packs, managing content) built with web technologies.

This tech stack is the most Doug-compatible in the entire music tech vertical.

## Key Contacts

| Name | Title | LinkedIn | Recent Content | Why Them |
|------|-------|----------|----------------|----------|
| Martin Robinson | Lead Software Engineer | linkedin.com/in/0x4d52 | JUCE "Made with JUCE" feature, lectures on music technology | Lead engineer, built LABS with WebView/JUCE. Most relevant technical contact |
| James Bellamy | Head of Web Engineering | linkedin.com/in/james-bellamy-92a411a | None found publicly | Leads web engineering -- directly manages the kind of role Doug would fill |
| Jake Mills | Software Engineer (LABS team) | Not found | JUCE "Made with JUCE" feature on LABS rebuild | Part of the WebView/JUCE team, potential peer |
| Rosa Di-Finizio | Lead Audio Developer | linkedin.com/in/rosadi-finizio | LinkedIn (6+ years in music tech) | Audio development lead |
| Ben DeVille | VP of Product & CX | linkedin.com/in/ben-deville-49ba4b14 | None found | Product leadership, reports into Splice leadership |
| Olivier Robert-Murphy | CEO | Not found | Splice acquisition press | Final decision maker but cold outreach unlikely to land |

**Recommended first contact:** Martin Robinson -- as Lead Software Engineer who built LABS with WebView/JUCE and also lectures on music technology, he's both approachable (public content creator) and technically relevant. He would understand and value Doug's web engineering background.

**Secondary contact:** James Bellamy (Head of Web Engineering) -- directly manages the web engineering function. His background is interesting: he was a music editor who worked on Atonement and Les Miserables before moving into engineering.

## Pain Points & Opportunities

### What They Need
- **Post-acquisition integration:** Blending Spitfire's audio technology with Splice's AI discovery engine and INSTRUMENT platform. This is a massive engineering challenge spanning web platforms, audio engines, and data pipelines.
- **Rebuilding after 2023:** The layoffs and staff departures left gaps. They're actively hiring across multiple roles, suggesting they're still rebuilding capacity.
- **WebView/JUCE scaling:** Expanding the web-in-plugin approach to more products beyond LABS and Air Reverb. Each new product built this way needs web engineering.
- **Splice INSTRUMENT integration:** The $12.99/month platform with 1,200+ presets needs continuous content pipeline, user analytics, and subscription management.
- **Content management at scale:** Spitfire has hundreds of sample libraries. Managing discovery, delivery, and updates at scale is a web engineering problem.

### How Doug Solves It

| Their Need | Doug's Relevant Experience |
|-----------|--------------------------|
| WebView plugin UIs (React/web tech) | 8 years React, deep Next.js and web platform experience |
| Post-acquisition platform integration | Built SaaS at getBenson serving 80+ brands, understands multi-tenant platforms |
| Content management at scale | Built Vouchernaut managing 10,000+ brands with automated pipelines |
| Growth post-acquisition | Led growth engineering at Patrianna (0 to 1M users), growth consulting at Groupon/Motley Fool |
| Subscription/commerce | Built Stripe Connect integration at DinnersWithFriends, affiliate automation at Vouchernaut |
| Rebuilding engineering culture | Hired and led 9-member team at Patrianna, cross-functional team at Mekamon |

### First 90 Days Sketch
Join the engineering team focused on the WebView/JUCE plugin platform. Month 1: learn the audio engine, understand the LABS architecture, ship small improvements to the web UI layer. Month 2: contribute to the Splice integration work -- how Spitfire content surfaces through INSTRUMENT, how the discovery pipeline works. Month 3: own a significant piece of the content management or user experience layer, propose improvements to the web-in-plugin architecture based on modern React patterns.

## Proposed Angles

1. **WebView/JUCE Architecture** (Technical)
   "I read about the LABS rebuild using WebView and JUCE -- using web tech for plugin UI is a bold and smart approach. I've spent 8 years in React building web platforms at scale, and I'm now doing C++ work on a game modding platform. The web-inside-native pattern is exactly the kind of bridge I find fascinating. I'd love to talk about how the architecture has evolved."

2. **Post-Acquisition Growth** (Business)
   "The Splice acquisition opens up incredible distribution for Spitfire's libraries. At Patrianna, I led growth engineering that took a new product from zero to 1M players, and I've done growth consulting for Groupon and Motley Fool. The post-acquisition growth playbook -- how to leverage a parent company's platform without losing what makes the product special -- is something I've thought about deeply."

3. **Content Pipeline Scale** (Technical)
   "Managing hundreds of sample libraries across a new INSTRUMENT platform is fundamentally a content automation challenge. At Vouchernaut, I built systems that automated content management for 10,000+ brands handling 250k monthly sessions. The parallels to scaling Spitfire's library delivery through Splice's platform are striking."

## Notes

- **Strongest Tier 3 candidate -- arguably Tier 2:** Active engineering openings, WebView/web tech stack, London location, and real engineering challenges post-Splice acquisition. This is the most actionable company in this batch.
- **Red flags are real:**
  - Glassdoor 3.9 (was 4.4 before 2023 issues)
  - 25% layoffs in early 2023
  - Co-founder Christian Henson departed amid controversy
  - Multiple reviews cite ongoing staff turnover, nepotism in management, and decision-making paralysis
  - "Two classes of staff" culture described by employees
- **Splice ownership:** Double-edged sword. Brings capital and distribution but also corporate oversight, potential redundancies, and AI-first strategy that may not align with Spitfire's craftsmanship culture.
- **Application method:** Email careers@spitfireaudio.com with role title and LinkedIn in subject. This is a low-friction application.
- **Location:** London, Tileyard Studios. Hybrid working. May have remote options given "employees around the globe."
- **Salary:** Not posted. London music tech salaries are typically below standard tech salaries. Expect GBP 55-80k range for a senior software engineer role.
- **Timing:** NOW -- they are actively hiring. Apply before the roles close.

---

*Generated by company-deep-dive skill. Verify key facts before using in outreach.*
