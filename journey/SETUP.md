# Phase: Setup

*Written from Doug's perspective — the story of getting this thing off the ground.*

---

It started with a simple observation: job searching is essentially a data pipeline problem. You've got a candidate (me), a universe of companies, and a matching function that's usually powered by vibes and LinkedIn doom-scrolling. I wanted to do better.

I set up a Turborepo monorepo — not because a job search needs a monorepo, but because I knew this would grow. Claude Code became the orchestration layer, with custom skills for repeatable workflows. The first skill was `company-research`: give it a company name, and it goes and finds everything — funding, tech stack, team size, open roles, culture signals. The second was `journey-log`, which is writing this very document.

The first real task was fixing my own profile. My CV still said "South West England, UK" — I've been in Prague for eight years. Small thing, but it matters. If an agent is going to craft outreach for me, it needs to know where I actually am.

Then came the harder question: what do I actually want? I've spent 15 years building things — affiliate platforms, SaaS products, internal tools, growth engines. Three exits. Worked with MIT, Groupon, Sky, Contra, Framer, The Motley Fool. I could optimise for salary and go chase another fintech lead role. But I don't want to. I want to work on something that makes me want to open my laptop on a Saturday. Music tech. Games. Event production. Travel. Weird, novel stuff. Mission-driven B2C companies. European startups that value engineering-led growth.

So I wrote that down — not just the "want" list but the "absolutely not" list. No fintech. No generic B2B SaaS. Being explicit about what you don't want saves more time than being vague about what you do.

Next was the asset sprint. If agents are going to write applications for me, they need to know everything about me — not just the CV bullet points, but the client reviews, the portfolio pieces, the GitHub repos, the pricing, the case studies. So I scraped everything. All of it. In parallel.

Three browser agents ran simultaneously — one on my Contra portfolio, one on withSeismic.com, one on LinkedIn. A fourth pulled my Clutch reviews. GitHub got the API treatment (GraphQL, because I'm not parsing rendered HTML like an animal). In about 10 minutes, I had a complete asset library:

- **Contra:** 8 projects, 3 five-star reviews, service pricing ($150/hr, $7k sprints), Unicorn Club membership
- **withSeismic:** 11 case studies, full service breakdown, pricing model, YouTube embed
- **LinkedIn:** Full profile, open-to-work details, skills, a recommendation from Inna
- **Clutch:** 3 verified reviews — the Nico Marino one is gold ("saved 48 hours per week," "ROI in one week")
- **GitHub:** 124 repos, 3,142 contributions last year, pinned repos spanning TypeScript and C++, 73-star Chrome extension template

The GitHub scrape surfaced something I hadn't thought about strategically: I'm not just a React/TypeScript person. I've got a C++ memory-hooking tool, I'm forking Source 2 game SDKs, I'm contributing to AI agent frameworks (Mastra, TanStack Query). That range — web engineering plus low-level systems plus AI tooling — is unusual. It should be a headline, not a footnote.

Not everything went smoothly. The first Contra scraping agent came back with essentially empty output — it ran to completion but produced garbage. Lesson: always inspect agent output before moving on. The Clutch scraper initially only captured one of three reviews because the page text extractor truncated early. Had to switch to chunked JavaScript injection with overlapping ranges to get all three. And there were rogue article-writer hooks from another project bleeding into the session, firing on every tool call — had to dig into settings.json to kill them.

But the foundation is solid now. Every public claim about me is documented, structured, and ready for agents to reference. The search criteria are locked in. The journey log is running.

Now the real work starts: finding the companies.

---

*Status at end of Setup:*
- Location updated to Prague
- Search criteria defined (industries, anti-preferences, geography)
- Complete asset library in `assets/` (6 scraped profiles, 4 hero images, CV PDF)
- company-research skill built and ready
- journey-log skill operational
- One lesson learned: verify agent output, don't assume completion means correctness
