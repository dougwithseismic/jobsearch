# BattlEye — Deep Dive Dossier

**Last Updated:** 2026-02-15
**Priority Tier:** 3 (Watch)
**Overall Assessment:** Legendary anti-cheat company with incredible industry reputation, but extremely small team (~5 people) with a very specialized reverse engineering focus. The C++ alignment is interesting given Doug's growing interest in lower-level work, but the core skillset required (kernel-level reverse engineering) is distant from Doug's current expertise. A long-shot that would only work if they need web/platform engineering.
**Existing Relationship:** No

---

## Current Openings

| Role | Team | Link | Posted | Salary | Doug Fit |
|------|------|------|--------|--------|----------|
| Software Developer | Tübingen team | [battleye.com](https://www.battleye.com/2017/09/25/we-want-you/) | Ongoing | Not posted | **Weak** — Requires reverse engineering, kernel-level C/C++, anti-cheat specialization |

BattlEye's hiring page is minimal — they accept applications via email (jobs@battleye.com) and list requirements including interest in anti-cheat topics, excellent knowledge of web programming (HTML, CSS, PHP, JavaScript, MySQL, MongoDB) AND C/C++. The web programming requirement is interesting — it suggests they have web infrastructure needs beyond just the anti-cheat engine.

**Past hiring pattern:** BattlEye has had open positions listed since at least 2016-2017, suggesting they're always passively looking for the right person. This is a company that hires based on fit, not urgency.

## Recent Activity (Last 6 Months)

- **2025:** Rockstar Games added BattlEye to GTA Online PC — a massive new client win
- **2025:** War Thunder fully switched to BattlEye protection
- **Ongoing:** Now protecting 40+ major multiplayer games including PUBG, Arma, DayZ, Destiny 2, War Thunder, and GTA Online
- **Ongoing:** Looking to extend team in Tübingen, Germany

**Key insight:** BattlEye keeps winning major new contracts (GTA Online is enormous), which means their workload is growing while the team remains tiny. This creates pressure to hire, but they're extremely selective.

## Tech & Engineering

**Stack:** C, C++, C#, PHP, JavaScript, MySQL, MongoDB, kernel-level systems programming, reverse engineering
**Engineering Blog:** None found
**GitHub Org:** None found (closed-source by nature)
**Open Source Activity:** None — security through obscurity is part of the business model
**Culture Signal:** Unknown — too small and private to assess externally

BattlEye is fundamentally a security product. The core work involves kernel-level anti-cheat detection, reverse engineering cheat software, and protecting multiplayer games at the lowest level. The tech stack splits into two areas: (1) the anti-cheat engine itself (C, C++, kernel drivers) and (2) supporting web infrastructure (PHP, JS, MySQL, MongoDB). The web side likely includes dashboards, reporting tools, and client-facing portals.

There is virtually no public information about engineering practices, tooling, or culture. This is deliberate — security companies don't advertise their methods.

## Key Contacts

| Name | Title | LinkedIn | Recent Content | Why Them |
|------|-------|----------|----------------|----------|
| Bastian Suter | Founder, CEO & Lead Developer | [LinkedIn](https://de.linkedin.com/in/bastian-suter-127206108) | None found | He IS BattlEye — founded it in 2004, still leads development |

**Recommended first contact:** Bastian Suter — in a company this small, there's only one person to talk to. He's the founder, CEO, and lead developer. Any outreach needs to be highly targeted and demonstrate genuine understanding of anti-cheat technology.

## Pain Points & Opportunities

### What They Need
- Scaling web infrastructure to support 40+ game clients and their reporting/dashboard needs
- Web-based tooling for game developers integrating BattlEye
- Potentially: modernizing their web stack (they list PHP, which suggests legacy web infrastructure)
- Managing the growing client base (GTA Online alone is massive) with a tiny team

### How Doug Solves It
- **Web platform engineering:** BattlEye explicitly lists web programming skills (HTML, CSS, PHP, JS, MySQL, MongoDB) in their requirements — this is Doug's wheelhouse
- **Automation and tooling:** Doug's automation expertise could help BattlEye build better internal tools, reporting dashboards, and client integration workflows
- **C++ interest:** Doug's growing C++ work and Source 2 modding aligns directionally with BattlEye's low-level focus
- **Gaming domain knowledge:** Doug's Source 2 modding project and gaming interest means he understands the ecosystem BattlEye protects

### First 90 Days Sketch
Month 1: Learn the BattlEye ecosystem — understand the anti-cheat engine architecture, client integration workflows, and existing web infrastructure. Identify the biggest pain points in their web tooling.
Month 2: Modernize one critical web system — likely a client dashboard, reporting tool, or integration portal. Demonstrate that modern web engineering practices can dramatically improve their tooling.
Month 3: Build and ship a new web tool that reduces manual work for the team — given the tiny team size, any automation has outsized impact.

## Proposed Angles

1. **Web Infrastructure Modernization** (Technical)
   "I noticed BattlEye's job listings mention web programming alongside C/C++ — I'm curious about the web side of running anti-cheat for 40+ games. I've built automation systems and web platforms that handle massive scale (250k monthly sessions at Vouchernaut, 25M sessions at getBenson), and I'd love to discuss how modern web tooling could support BattlEye's growing client base."

2. **Gaming + C++ Trajectory** (Technical)
   "I'm currently building a Valve Source 2 modding platform and increasingly working in C++ — the anti-cheat problem space is fascinating to me as someone who understands game engines from the modding side. I'd be interested to learn more about where BattlEye sees the intersection of web infrastructure and anti-cheat technology evolving."

3. **Scaling a Tiny Team** (Business)
   "Running anti-cheat for games like GTA Online and PUBG with a small team is remarkable engineering leverage. I've spent 15+ years building automation systems that multiply small teams' output — at Vouchercloud we automated work that saved 240 hours per month. I'm curious whether similar approaches could help BattlEye scale its operations without necessarily scaling headcount."

## Notes

- **High barrier to entry:** BattlEye is extremely specialized. The core anti-cheat work requires reverse engineering expertise Doug doesn't have. The opportunity, if any, is on the web/platform side.
- **Location:** Based in Tübingen/Reutlingen, Germany. Remote work policy unknown — likely need to be in or near Germany.
- **Tiny team risk:** With ~5 employees, this is essentially a one-person company. The culture is whatever Bastian Suter decides it is.
- **No public hiring process:** Applications via email only. No ATS, no formal process. This means outreach needs to be direct, technical, and compelling.
- **Long-shot assessment:** This is a "watch and wait" company. The opportunity would come if BattlEye decides to build out web infrastructure or tooling, which their job listing hints at. Doug should keep this on the radar and potentially reach out speculatively, but shouldn't invest heavily.
- **GTA Online integration is big news:** The Rockstar partnership significantly increases BattlEye's scale and could drive hiring needs.

---

*Generated by company-deep-dive skill. Verify key facts before using in outreach.*
