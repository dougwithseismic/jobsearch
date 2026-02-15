# How Linear Redesigned the Issue Tracker and Grew to $10M ARR

## Detailed Outline

---

### 1. The Fastest App Nobody Expected (~500 words)
**Narrative role: HOOK**

Open with the visceral contrast: you click "create issue" in Linear and it happens before your finger lifts. Then you remember what Jira felt like -- the spinner, the lag, the three-second wait to do something that should be instant.

Introduce Karri Saarinen, principal designer at Airbnb who built a Chrome extension to simplify Jira that went viral internally. Introduce Tuomas Artman, one of Uber's most respected mobile engineers, who'd been building sync engines for a decade. Introduce Jori Lallo, early Coinbase engineer. Three people who felt the same pain at three different companies.

Key data: Linear achieves sub-50ms response times vs Jira's 1-2 seconds. 3.7x faster in benchmarks.

Set up the question: in 2019, with Jira holding 36%+ market share and GitHub Issues being free, how do you convince anyone to try yet another issue tracker? The answer turned out to be deceptively simple -- you make it so fast and so well-crafted that developers can't stop talking about it.

**Sources:** Sequoia spotlight, Karri's blog, Eleken case study, performance benchmarks

---

### 2. Why the World Didn't Need Another Issue Tracker (~600 words)
**Narrative role: BACKGROUND**

Map the 2019 battlefield. Jira owned 36.57% of project management software. Microsoft Project held 19.78%. Smartsheet, Asana, Monday.com fought over the rest. GitHub Issues was free and good enough for many. The total addressable market was growing at 10.67% CAGR, but the spoils went to incumbents.

Discuss the graveyard of challengers. Many tools had tried the "better Jira" pitch and failed. Switching costs were enormous -- years of accumulated workflows, integrations, muscle memory.

Then the twist: Linear's seed round. Sequoia's Stephanie Zhan heard about Linear because "people she trusts in her Twitter network were hyped about it." The $4.2M seed from Sequoia and Index Ventures in November 2019 wasn't about the market being attractive -- it was about the team and the early signal from developers.

10,000 people on a waitlist for a project management tool. That itself was the signal.

**Sources:** Datanyze market data, TechCrunch seed round, Growth Letter waitlist analysis

---

### 3. The Problem Hiding in Plain Sight (~650 words)
**Narrative role: CHALLENGE**

Jira was designed for a world where managers needed visibility and process compliance. Over time, it became a tool optimized for the people who approved the purchase, not the people who used it every day. Required fields multiplied. Configuration options exploded. Performance degraded as features accumulated.

The founders all experienced this firsthand. Saarinen at Airbnb. Artman at Uber. Lallo at Coinbase. Companies had evolved their development processes, but the tools hadn't kept pace.

Bring in the research on flow state. Gloria Mark's finding that it takes 23 minutes to refocus after interruption. The McKinsey stat that developers spend only 41% of their workday in productive flow. When your issue tracker takes 2 seconds to load every screen change, and a developer switches between it and their code editor dozens of times per day, those seconds compound into hours of lost productivity.

The insight that made Linear possible: the gap between what procurement departments bought (configurability, reporting, compliance) and what developers needed (speed, simplicity, keyboard-native workflows). The people who chose the tool and the people who used the tool had fundamentally different requirements.

**Sources:** Stack Overflow flow state research, DEV Community Jira complaints, First Round Review interviews

---

### 4. Speed as a Feature and Other Bets (~900 words)
**Narrative role: APPROACH**

This is the core technical and strategic section. Three major bets:

**Bet 1: The Sync Engine.** Tuomas Artman brought a decade of sync engine experience from Uber and Groupon. Linear's local-first architecture syncs data to the device and renders UI updates before the server confirms. Built on React, MobX, TypeScript, and Node.js with PostgreSQL, plus what Artman calls "home-made sync magic." The result: offline functionality, optimistic updates, and interactions that feel instant. New features can be developed without modifying server-side code. The sync engine was later reverse-engineered by the community, endorsed by Artman himself.

**Bet 2: Opinionated Design.** Where Jira gave users infinite configurability, Linear gave them strong defaults. The Linear Method prescribes issues flowing from Triage to Backlog to In Progress. Two-week cycles as the standard work unit. Three abstractions -- Roadmaps, Projects, Cycles -- instead of Jira's sprawling taxonomy. Keyboard-first: Cmd+K for the command palette, / for filtering, E for assignment. Every action built for people who live in code editors and terminals.

Karri's philosophy: "You can't build the optimal tool for anything if it's very flexible or endlessly customizable." Instead of building for everyone, they built for someone specific -- the small-to-mid-size engineering team that wanted to ship fast.

**Bet 3: Product-Led Growth.** No outbound sales. The product had to sell itself. Free tier with unlimited members. Building in public on Twitter, treating the account as a live changelog. Invite-only beta for nearly a year, onboarding 10-20 users at a time ("go slow to go fast"). Network effects: every engineer who adopted Linear would naturally pull in teammates.

Loom case study: engineering team switched from Jira in April 2022. The "wow" moment was updating a ticket during a Zoom call and watching it sync in real time for everyone.

**Sources:** Linear sync engine post, localfirst.fm podcast, Figma blog on Linear Method, Linear pricing teardown

---

### 5. From Waitlist to $10M ARR (~750 words)
**Narrative role: RESULTS**

Walk through the milestones chronologically:

- 2019: Founded. 10,000-person waitlist. $4.2M seed from Sequoia.
- 2020: Invite-only beta. $13M Series A from Sequoia.
- 2022: Loom, Ramp, and others fully migrate from Jira.
- 2023: $8.4M revenue. $35M Series B from Accel at $400M valuation.
- January 2025: Linear's 6th birthday. Karri tweets the metrics -- team of 70, 10,000+ companies, Enterprise ARR up 2000%, first Fortune 100 customer, Net Revenue Retention 140%+, net operating income up 1400%, profitable.
- June 2025: $100M revenue. $82M Series C. $1.25B valuation. Unicorn.

Notable customers: OpenAI, Cash App, Vercel, Loom, Ramp, Brex, Mercury, Perplexity, Substack, Supercell. Coinbase, Automattic, and Block migrated after decades on other tools.

Ramp built with Linear from day one and scaled to 1,000+ employees without switching.

The efficiency metric: $12.5M in value per employee, versus $1-2M at typical startups. A team of roughly 70 people building a billion-dollar company.

The 140% NRR tells the story of product-market fit. Existing customers don't just stay -- they expand.

**Sources:** Karri's birthday tweet, GetLatka revenue data, TechFundingNews unicorn coverage, Linear customers page

---

### 6. What Linear Teaches Every Product Builder (~600 words)
**Narrative role: LESSONS**

Four transferable lessons, told through Linear's specific choices:

**Performance is a feature, not a metric.** Linear didn't optimize load times as a KPI. They built an entirely different architecture -- local-first sync -- so that performance was baked into the product's DNA. The lesson: in any category where the incumbent is slow, speed alone can be a wedge.

**Opinionated beats configurable in crowded markets.** Jira let you build anything. Linear told you how to work. Karri's insight that narrowing the surface area of choice reduces decision fatigue and creates consistency. The courage to say no to customization requests.

**Bottom-up beats top-down when the product is good enough.** Linear didn't sell to CTOs. They made a tool that individual engineers loved, then let those engineers champion it internally. The free tier, the building in public, the Twitter changelog -- all designed to reach the person who would actually use the product.

**Small teams win with taste.** 70 people. $1.25 billion. Karri actively rejects hustle culture. The company has been profitable since early on, never burning through capital to chase growth. Craft over velocity.

Close with the broader meaning: Linear's story isn't just about issue trackers. It's proof that even the most dominated, most "boring" markets can be disrupted if you build something that people genuinely love to use. The moat isn't features -- it's the feeling of using the product.

**Sources:** First Round Review, Figma blog rules, Entrepreneur interview, Linear Method page
