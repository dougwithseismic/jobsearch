# Realm.fun — Deep Dive Dossier

**Last Updated:** 2026-02-15
**Priority Tier:** 2 (Warm)
**Overall Assessment:** Near-perfect stack match (TS/Astro/React/Supabase/K8s), gaming infra is genuinely interesting, bootstrapped & profitable, EU remote. However, no full-stack engineer role currently posted on their careers page (only non-engineering roles listed), despite a recent HN "Who is Hiring" post advertising one. Tiny team means high impact potential but also salary/equity uncertainty.
**Existing Relationship:** No

---

## Current Openings

| Role | Team | Link | Posted | Salary | Doug Fit |
|------|------|------|--------|--------|----------|
| Full-Stack Engineer | Engineering | realm.fun/careers (posted on HN Feb 2026) | ~Feb 3, 2026 | Not posted (equity options mentioned) | **Strong** — Perfect stack match: TypeScript, Astro 5, React, Supabase, PostgreSQL, Docker, K8s. Dashboard development, real-time features, payment systems, infrastructure automation. |
| Game Server Specialist | Operations | realm.fun/careers | Current | EUR 35K-55K | **Weak** — Server admin role, not engineering |
| Community Manager | Marketing | realm.fun/careers | Current | EUR 40K-60K | **Weak** — Non-technical |
| Content Creator | Marketing | realm.fun/careers | Current | EUR 38K-58K | **Weak** — Content role |
| Support Hero | Support | realm.fun/careers | Current | EUR 32K-48K | **Weak** — Support role |

**Note:** The Full-Stack Engineer role was posted on HN "Who is Hiring" (Feb 2026) by user "stubbi" but is NOT listed on their careers page alongside the other 4 roles. This could mean: (a) it filled quickly, (b) it's handled separately, or (c) they want to filter through HN-quality applicants only. The HN post is only ~12 days old, so the role is likely still open.

**HN Job Post Details (from stubbi):**
- Frontend: TypeScript, Astro 5 (SSR), Tailwind CSS
- Backend: Node, PostgreSQL via Supabase, Stripe for payments
- Infrastructure: Docker, Kubernetes, Pelican Panel
- Hosting: Hetzner Cloud
- Responsibilities: Server management dashboard, real-time features (console, metrics), payment systems, infrastructure automation (node provisioning, scaling)
- Looking for someone proficient in TypeScript with expertise in either frontend (React/Astro) or backend (Node/PostgreSQL), plus Docker/K8s knowledge
- Bonus: Personal experience with game server hosting or gameplay

## Recent Activity (Last 6 Months)

- **Feb 2026:** Actively hiring Full-Stack Engineer via HN "Who is Hiring" thread — indicates growth
- **Ongoing:** Platform supports 25+ games with 3,000+ active servers
- **Ongoing:** Describes itself as "Vercel for game servers" — positioned as the modern, developer-friendly alternative to legacy game hosting providers
- **Ongoing:** Bootstrapped and profitable — no external funding pressure

**Red flags:** Very limited public information. No press coverage, no blog, no public founding story. This is typical for a small bootstrapped company but means less due diligence data.

## Tech & Engineering

**Stack:** TypeScript, Astro 5 (SSR), React, Tailwind CSS, Node.js, Supabase (PostgreSQL), Stripe, Docker, Kubernetes, Pelican Panel, Hetzner Cloud
**Engineering Blog:** None found
**GitHub Org:** None found (no public GitHub org)
**Open Source Activity:** None found — likely all proprietary
**Culture Signal:** **Moving fast** — Small team, zero bureaucracy, async-first with optional weekly syncs, EU remote. Classic bootstrapped startup energy. The HN post emphasizes ownership and equity options.

The tech stack is modern and well-chosen. Astro 5 with SSR for the marketing/content layer, React for the dashboard app, Supabase for the backend, Hetzner for cost-effective infrastructure. This is a team that makes pragmatic choices — they're not over-engineering with AWS when Hetzner does the job.

The Pelican Panel integration (open-source game server management) suggests they're building on proven infrastructure rather than reinventing everything.

## Key Contacts

| Name | Title | LinkedIn | Recent Content | Why Them |
|------|-------|----------|----------------|----------|
| "stubbi" (HN username) | Likely founder/engineer | Unknown — no LinkedIn found | HN "Who is Hiring" post (Feb 2026) | Posted the job, likely the technical founder or lead engineer. Direct hiring authority. |

**Note:** The team is extremely private. No founder names, no team page with photos/bios, no LinkedIn presence found. The "About" page on realm.fun describes the company mission but doesn't name individuals. The HN username "stubbi" is the only identifiable contact point.

**Recommended first contact:** Reply to the HN job posting by "stubbi" or email careers@realm.fun (or whatever contact is on their careers page). The HN post is the warmest entry point.

## Pain Points & Opportunities

### What They Need
- **Full-stack engineering capacity** — they're a tiny team that needs to ship features across the entire stack (dashboard, payments, infrastructure). Every engineer needs to be a force multiplier.
- **Real-time dashboard features** — game server management requires live console output, metrics, and status monitoring. This is complex frontend + backend work.
- **Payment system maturity** — Stripe integration for recurring hosting subscriptions, usage-based billing, and server credits.
- **Infrastructure automation** — scaling Kubernetes clusters, auto-provisioning game server nodes, handling DDoS protection. As they grow past 3,000+ servers, this gets complex.
- **SEO and organic growth** — they're competing against established players like Nodecraft, Shockbyte, and Apex Hosting. Content and SEO are how they win as a bootstrapped company.

### How Doug Solves It
- **Perfect stack match:** Doug's TypeScript + React + Node + PostgreSQL experience is exactly their stack. Supabase is a thin layer over Postgres — Doug's Postgres experience transfers directly.
- **Dashboard and real-time:** Doug built SaaS dashboards at getBenson (protecting 25M monthly sessions) and admin workflows at DinnersWithFriends. Real-time features are his bread and butter.
- **Payments and billing:** Stripe Connect experience at DinnersWithFriends, plus extensive e-commerce/SaaS experience across multiple clients.
- **Growth without budget:** Doug's SEO-optimized architecture experience (DinnersWithFriends), performance marketing automation (Vouchercloud), and affiliate system building (Vouchernaut) — he knows how to grow a product organically.
- **Gaming affinity:** Doug's Valve Source 2 game modding platform is directly relevant. He understands the gaming community and what gamers expect from server hosting.

### First 90 Days Sketch
- **Month 1:** Ship meaningful improvements to the server management dashboard. Fix pain points in the real-time console/metrics features. Get comfortable with the Astro + React + Supabase stack and the Pelican Panel integration.
- **Month 2:** Take ownership of either the payment system or the infrastructure automation pipeline. Implement a feature that directly improves conversion or retention — e.g., better server provisioning UX, automated scaling, or improved onboarding flow.
- **Month 3:** Propose and begin implementing a growth initiative — SEO improvements, a referral system, or API access for power users. Start contributing to the technical content strategy (setup guides, docs) that drives organic traffic.

## Proposed Angles

1. **Stack Match + Gaming** (Technical)
   "I saw your HN post for a Full-Stack Engineer — your stack (TypeScript, Astro 5, React, Supabase, K8s) is almost identical to what I use daily. I'm also building a Valve Source 2 game modding platform as a side project, so I understand the gaming server community from the user side. Would love to learn more about how you're thinking about scaling past 3,000+ servers."

2. **Growth Engineering for Bootstrapped Products** (Business)
   "I love the 'Vercel for game servers' positioning — it's exactly the kind of developer experience improvement that wins markets. I've built growth engines for bootstrapped products before (Vouchernaut to 250K monthly sessions, DinnersWithFriends with SEO-first architecture) and I'm curious how Realm.fun is thinking about organic growth against the established hosting players."

3. **Small Team, Big Impact** (Culture)
   "Your async-first, zero-bureaucracy setup is exactly what I'm looking for. I've been both a solo technical founder (DinnersWithFriends) and led a 9-person team at a game studio (Patrianna, 0 to 1M players). I thrive in environments where one engineer owns entire features end-to-end. Happy to share how I think about shipping fast with a small team."

## Notes

- **Salary uncertainty is a risk.** The non-engineering roles pay EUR 32K-60K. If engineering compensation follows a similar band (even at the top), it may be below market for Doug's experience level. Equity options could compensate, but bootstrapped company equity is illiquid.
- **Team anonymity is unusual.** No named founders, no LinkedIn presence, no team photos. This could be a privacy preference (common in gaming) or a red flag. Worth asking about during conversations.
- **The HN post is the best entry point.** Replying to "stubbi" on HN or applying directly via the careers page are the only viable approaches. No warm introduction path exists.
- **Gaming affinity is a genuine differentiator.** Most full-stack engineers don't also build game modding platforms. This makes Doug memorable.
- **Astro 5 is a positive signal.** They're using bleeding-edge tools (Astro 5 SSR just released), which suggests the technical founder cares about developer experience and stays current.
- **Open question:** How big is the engineering team currently? If it's 1-2 people, Doug would be employee #3 or #4. That's a very different proposition than joining an established team.

---

*Generated by company-deep-dive skill. Verify key facts before using in outreach.*
