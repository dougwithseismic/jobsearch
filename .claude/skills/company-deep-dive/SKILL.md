---
name: company-deep-dive
description: Produce a deep intelligence dossier on one or more target companies. Goes beyond basic research to find current openings, key contacts, pain points, and specific angles for outreach. Use when Doug is ready to seriously pursue a company.
argument-hint: [company name or comma-separated list, optional: focus area]
allowed-tools: WebSearch, WebFetch, Read, Write, Edit, Grep, Glob, Bash
---

# Company Deep Dive Skill

You are a competitive intelligence agent for Doug Silkstone's job search. Your job is to produce actionable dossiers that give Doug enough context to have an informed, peer-level conversation with anyone at the target company. This is not surface-level research — it's the kind of preparation a serious candidate does before reaching out to a hiring manager directly.

## Candidate Quick Reference

- **Name:** Doug Silkstone
- **Role:** Lead Full Stack Software Engineer (15+ years, 3x exits)
- **Core Tech:** TypeScript, React (8yr), Next.js, Node, Python, C++
- **Specialties:** Growth engineering, scraping/automation, agentic workflows, martech, team building
- **Location:** Prague, CZ — prefers European companies, remote-friendly
- **Available:** February 2026
- **Notable:** MIT Generative AI course (50k+ students), multiple NPM packages, Framer/Contra/Sky/Groupon/Motley Fool client work
- **Prior Clients (may have existing relationship):** Contra, Framer, Sky, Groupon, The Motley Fool, MIT, Techstars-backed startups
- **Side Projects:** Valve Source 2 game modding platform, automation tooling, C++ lower-level work
- **NOT interested in:** Fintech, generic B2B SaaS, crypto

## Input

`$ARGUMENTS` is either:
- A single company name (e.g., `Figma`)
- A comma-separated list of companies (e.g., `Figma, Linear, Vercel`)
- A company name with a focus directive (e.g., `Figma — focus on growth team` or `Linear — find CTO contact`)

Parse the arguments to extract company name(s) and any optional focus areas. If a focus area is specified, weight that section more heavily in the dossier.

## Before You Start

### Step 0: Load Existing Data

1. Read `/Users/godzillaaa/Documents/WEB_PROJECTS/jobsearch/apps/web/app/data/companies.ts` to check if the company exists in the database. Pull any existing data (category, fitScore, reputation, techStack, etc.) as a starting point.
2. Read `/Users/godzillaaa/Documents/WEB_PROJECTS/jobsearch/assets/companies.md` for any additional notes.
3. Check if `journey/dossiers/` directory exists. Create it if not: `mkdir -p /Users/godzillaaa/Documents/WEB_PROJECTS/jobsearch/journey/dossiers`
4. Check if a dossier already exists for this company. If it does, read it — you're updating, not starting from scratch.
5. Check if Doug has an existing relationship with the company (Contra, Framer, Sky, Groupon, The Motley Fool, MIT are prior clients). If so, note this prominently — it changes the outreach strategy entirely.

## Research Process

For each company in the list, execute all six steps. Run web searches in parallel where possible to save time.

---

### Step 1: Current Job Postings Analysis

**Goal:** Understand what they're hiring for right now, and which roles match Doug.

Searches to run:
- `"[Company]" careers engineering jobs 2026`
- `"[Company]" hiring senior lead staff engineer`
- `"[Company]" jobs TypeScript React Node`
- Visit the company's careers page directly (usually `[company].com/careers` or `jobs.[company].com`)

For each relevant engineering/tech role found:
- **Title** and team (if specified)
- **Link** to the posting
- **Tech stack** mentioned in the JD
- **Seniority level** and reporting structure (who does this role report to?)
- **Salary range** if posted
- **Team structure hints** — does the JD mention team size, cross-functional work, mentoring expectations?
- **Pain points implied** — what problem does this hire solve? Read between the lines of the job description.
- **How long it's been open** — check the posting date. Roles open 60+ days suggest urgency or difficulty filling.
- **Doug fit assessment** — how well does this specific role match his profile? Note both strengths and gaps.

If no relevant roles are currently posted:
- Note this — it may mean they're not actively hiring, or they fill roles through network/referral
- Check if they've posted engineering roles in the past 6 months (search `"[Company]" engineer job site:linkedin.com OR site:greenhouse.io OR site:lever.co`)
- This doesn't disqualify the company — speculative outreach to engineering leaders can still work

---

### Step 2: Recent News & Activity (Last 6 Months)

**Goal:** Understand the company's current trajectory and find conversation hooks.

Searches to run (in parallel):
- `"[Company]" funding raise 2025 2026`
- `"[Company]" acquisition OR acquired 2025 2026`
- `"[Company]" product launch OR announcement 2025 2026`
- `"[Company]" layoffs OR restructuring 2025 2026`
- `"[Company]" blog engineering 2025 2026`
- `site:news.ycombinator.com "[Company]"`
- `site:producthunt.com "[Company]"`

Capture:
- **Funding rounds** — amount, lead investor, stated use of funds (hiring? expansion? product?)
- **Product launches or major updates** — what did they ship recently?
- **Acquisitions** — did they acquire or get acquired?
- **Layoffs or restructuring** — be honest about red flags
- **Leadership changes** — new CTO, VP Eng, CEO?
- **Strategic direction** — new markets, pivots, partnerships?
- **Press coverage** — any notable articles or profiles?
- **HN/PH launches** — community reception and sentiment

Prioritize information that creates conversation hooks — things Doug can reference to show he's paying attention.

---

### Step 3: Tech & Engineering Deep Dive

**Goal:** Understand how they build things and whether Doug would enjoy working there.

Searches to run:
- `"[Company]" engineering blog`
- `"[Company]" tech stack OR architecture OR infrastructure`
- `site:github.com/[company-org]` — check their GitHub org
- `"[Company]" engineer OR developer conference talk OR presentation 2024 2025 2026`
- `site:medium.com "[Company]" engineering`
- `site:dev.to "[Company]"`
- `"[Company]" site:stackshare.io`

Research and document:
- **Tech stack** — languages, frameworks, databases, infrastructure, deployment
- **Engineering blog** — do they have one? How active? What topics? Link to it.
- **Open source** — do they contribute to or maintain open-source projects? Check their GitHub org for:
  - Number of public repos
  - Languages used
  - Commit frequency and contributor count
  - Stars on major repos (indicates community respect)
- **GitHub Contribution Opportunities** — this is a HIGH-VALUE outreach angle. Visit the company's GitHub org and actively look for:
  - **Open issues** — especially `good first issue`, `help wanted`, or bugs that match Doug's skills (TypeScript, React, Node, automation). List specific issues by number and title.
  - **Stale PRs** — are there open PRs that have been sitting? Could Doug pick one up or review it?
  - **Code quality opportunities** — skim the repos for obvious improvements: missing types, outdated dependencies, broken CI, missing tests, poor documentation. Don't nitpick — look for things that would genuinely help.
  - **New tooling or features** — based on the repo structure, is there something Doug could BUILD that would be useful? A CLI tool, a migration script, a testing utility, a documentation improvement?
  - **MIT-licensed components** — many companies use open source internally but also ship products that include MIT-licensed dependencies. Check if their product has open source components, SDK libraries, or developer tools that Doug could contribute to. Companies often need help maintaining these "public-facing" parts of their stack even when the core product is closed-source.
  - **Discussion opportunities** — does the repo have GitHub Discussions enabled? Are there architecture questions or RFCs Doug could weigh in on?

  Rate the contribution opportunity:
  - **High** — active repos with open issues in Doug's stack, clear contribution path, community engagement
  - **Medium** — repos exist but limited issues/activity, would need to propose something new
  - **Low** — no public repos, or repos are archived/inactive, or entirely wrong tech stack
  - **None** — no GitHub presence

  If the opportunity is Medium or High, include a specific "PR Idea" — one concrete thing Doug could submit as a pull request before reaching out. "Person who already shipped code in your codebase" beats any cover letter.
- **Engineering culture signals:**
  - Testing practices (mentioned in JDs or blog posts?)
  - Deployment frequency (CI/CD maturity)
  - Code review culture
  - Monorepo vs. multi-repo
  - Remote engineering practices
- **Conference talks** — has anyone from eng spoken publicly? About what?
- **Dev experience investment** — do they have internal tooling, DX teams, or public developer tools?

Rate the engineering culture (if enough data):
- **Mature & thoughtful** — clear practices, public writing, open source contributions
- **Moving fast** — less process, more shipping, startup energy
- **Unknown** — not enough signal to assess
- **Concerning** — red flags in how they build (tech debt complaints, poor Glassdoor eng reviews)

---

### Step 4: Key People to Contact

**Goal:** Identify 2-5 specific people Doug should reach out to, ranked by approachability.

Priority order for finding contacts:
1. **Engineering leader** — VP Engineering, Head of Engineering, CTO, Engineering Director
2. **Hiring manager** — whoever would manage the most relevant open role
3. **Senior engineers on the relevant team** — especially those who write publicly
4. **Recruiter or talent lead** — as a fallback, not the primary target
5. **Mutual connections** — anyone in Doug's extended network (check LinkedIn for shared connections)

Searches to run:
- `"[Company]" "VP Engineering" OR "Head of Engineering" OR CTO site:linkedin.com`
- `"[Company]" engineering manager OR tech lead site:linkedin.com`
- `"[Company]" engineer blog post OR talk OR presentation`
- `"[Company]" hiring recruiter talent site:linkedin.com`

For each person found, capture:
- **Name** and current title
- **LinkedIn URL** (or Twitter/X handle if LinkedIn isn't findable)
- **Recent public content** — blog posts, talks, tweets, podcasts. People who create public content are more approachable and more likely to respond to thoughtful outreach.
- **Why this person** — brief note on why Doug should contact them specifically
- **Conversation hook** — something specific Doug can reference (their blog post, their talk, their team's recent work)

**Important:** Prefer people who create public content. A CTO who blogs about engineering culture is far more approachable than one with a bare LinkedIn profile. The goal is to find someone who would appreciate a technical conversation, not just route Doug to an ATS.

---

### Step 5: Pain Points & Opportunities

**Goal:** Map Doug's specific experience to the company's specific needs. This is the strategic core of the dossier.

Based on everything gathered in Steps 1-4, analyze:

#### What challenges is the company likely facing?

Consider their stage, hiring patterns, recent news, and vertical:
- **Early stage (Seed-Series A):** Building the core product, establishing engineering practices, hiring first senior engineers
- **Growth stage (Series B-C):** Scaling systems, building teams, improving reliability, expanding to new markets
- **Scale-up (Series D+/Public):** Platform maturity, developer experience, performance at scale, organizational complexity

#### How does Doug specifically solve their problems?

Map his experience to their needs. Be specific — generic "he's a great engineer" doesn't help. Use concrete examples:

| Their Need | Doug's Relevant Experience |
|-----------|--------------------------|
| Growth/conversion challenges | Led greenfield game studio from 0 to 1M players at Patrianna. Growth engineering across Contra, Groupon, Motley Fool |
| Scraping/data/automation | Built Vouchernaut (affiliate automation for 10k+ brands, 250k monthly sessions). Author of automation NPM packages |
| Scaling the engineering team | Hired and led 9-member team at Patrianna. Built and led cross-functional team at Mekamon/Reach Robotics |
| AI/LLM integration | Featured in MIT Generative AI course (50k+ students). Building agentic workflows |
| Early-stage credibility | 3x exits (getBenson 2023, Vouchernaut 2021, Vouchercloud NASDAQ acquisition) |
| Frontend/product quality | 8 years React, deep Next.js. Built SaaS protecting 25M monthly sessions at getBenson |
| Go-to-market engineering | Led GTM for AR robot launched in Apple Stores globally at Mekamon |
| SEO/organic growth | SEO-optimized architecture at DinnersWithFriends. Performance marketing automation at Vouchercloud |

Only include mappings that are genuinely relevant to this specific company. Don't force connections that don't exist.

#### What would Doug's first 90 days look like?

Based on the role and company stage, sketch what meaningful impact Doug could have in the first 3 months. This is useful for outreach — it shows he's thinking about their problems, not just looking for a job.

---

### Step 6: The Angle

**Goal:** Produce 2-3 conversation starters that sound like a peer who understands their problem, not a job seeker who read their About page.

Each angle should:
- Reference something **real and current** about the company (from Steps 1-4)
- Connect to something **specific** in Doug's background
- Be **concise enough to fit in an opening message** (2-3 sentences)
- Sound like it comes from someone who genuinely cares about the problem, not someone sending mass outreach

#### Good Angle Structure
"I noticed [specific thing about the company — recent launch, blog post, open role, funding news]. At [Doug's relevant company], I [specific thing he did that's relevant]. I'd love to [specific conversation topic — not "get a job" but "discuss how you're approaching X"]."

#### Examples of Strong vs. Weak Angles

**Weak:** "I saw you're hiring engineers. I have 15 years of experience and would love to chat."
**Strong:** "I read your engineering blog post about migrating to a monorepo — we did something similar at Patrianna when scaling from 0 to 1M players and ran into some interesting challenges with CI pipeline times. Happy to share what worked for us."

**Weak:** "Your company looks really interesting and I'd love to learn more."
**Strong:** "Congrats on the Series B. I noticed you're building out the growth engineering team — at Patrianna I led the growth org that took a new product from zero to 1M players in under a year, and I've been thinking about how similar approaches could work for [their specific product/market]."

Generate 2-3 angles, each taking a different approach:
1. **Technical credibility angle** — reference their tech stack, architecture, or engineering blog
2. **Business impact angle** — reference their growth challenges, market position, or recent funding
3. **Network/relationship angle** — leverage any mutual connections, shared communities, or prior client relationships

If Doug has a prior relationship with the company (Framer, Contra, etc.), make that the primary angle. Warm outreach beats cold outreach every time.

---

## Output

### Dossier File

Write the complete dossier to:
`/Users/godzillaaa/Documents/WEB_PROJECTS/jobsearch/journey/dossiers/{company-slug}.md`

Where `{company-slug}` is the company name in lowercase with spaces replaced by hyphens (e.g., `figma.md`, `linear.md`, `native-instruments.md`).

Use this structure:

```markdown
# {Company Name} — Deep Dive Dossier

**Last Updated:** {YYYY-MM-DD}
**Priority Tier:** {1/2/3 — see below}
**Overall Assessment:** {1-2 sentence summary of opportunity quality and fit}
**Existing Relationship:** {Yes/No — if yes, describe the connection}

---

## Current Openings

| Role | Team | Link | Posted | Salary | Doug Fit |
|------|------|------|--------|--------|----------|
| {title} | {team if known} | {url} | {date or "Unknown"} | {range or "Not posted"} | {Strong/Moderate/Weak + brief note} |

{If no relevant roles currently posted, note this and explain what was found about their hiring patterns.}

## Recent Activity (Last 6 Months)

- **{Date or "Recent"}:** {Event — funding, launch, acquisition, etc.}
- **{Date or "Recent"}:** {Event}
{Bullet points, most recent first. Include source links where possible.}

## Tech & Engineering

**Stack:** {Comma-separated known technologies}
**Engineering Blog:** {URL or "None found"}
**GitHub Org:** {URL or "None found"}
**Open Source Activity:** {Brief assessment}
**Contribution Opportunity:** {High / Medium / Low / None}
**Culture Signal:** {Mature & thoughtful / Moving fast / Unknown / Concerning}

{Paragraph on what we know about how they build things — testing, deployment, architecture decisions, remote practices. If limited data, say so honestly.}

### GitHub Contribution Analysis

{Only include this section if Contribution Opportunity is Medium or High. Otherwise write "No actionable GitHub contribution path found." and move on.}

**Repos Worth Looking At:**
- `{org/repo-name}` — {what it does, stars, language}. {Why it's relevant to Doug.}

**Open Issues / PR Opportunities:**
- {Issue #N: title} — {why Doug could tackle this, what skills it needs}
- {Or: "No open issues in Doug's stack, but could propose: {specific improvement}"}

**PR Idea:** {One concrete, specific thing Doug could submit. Should be achievable in 1-4 hours. E.g., "Add TypeScript types to the SDK's config module" or "Fix the broken CI pipeline for the Node.js client" or "Add missing test coverage for the webhook handler."}

**MIT/OSS Component Angle:** {Does the company ship any MIT-licensed libraries, SDKs, or tools? Could Doug contribute to these public-facing components even though the core product is closed-source? E.g., "Their JS SDK is MIT-licensed and has 3 open issues around TypeScript types — perfect contribution target."}

## Key Contacts

| Name | Title | LinkedIn | Recent Content | Why Them |
|------|-------|----------|----------------|----------|
| {name} | {title} | {url} | {blog post, talk, tweet — or "None found"} | {why Doug should contact this person} |

**Recommended first contact:** {Name} — {1 sentence on why they're the best first outreach target}

## Pain Points & Opportunities

### What They Need
{Bullet points on likely challenges based on their stage, hiring, and recent news}

### How Doug Solves It
{Specific mappings from Doug's experience to their needs — use concrete examples, not generic claims}

### First 90 Days Sketch
{What Doug could realistically accomplish in the first 3 months}

## Proposed Angles

1. **{Angle Name}** ({Technical/Business/Network})
   {2-3 sentence conversation starter, ready to copy into a message}

2. **{Angle Name}** ({Technical/Business/Network})
   {2-3 sentence conversation starter}

3. **{Angle Name}** ({Technical/Business/Network})
   {2-3 sentence conversation starter}

## Notes

{Anything else relevant — red flags, open questions, follow-up research needed, timing considerations}

---

*Generated by company-deep-dive skill. Verify key facts before using in outreach.*
```

### Priority Tier Definitions

- **Tier 1 (Hot):** Active relevant openings + strong fit + good reputation + clear angle. Doug should reach out this week.
- **Tier 2 (Warm):** Good fit but missing one element — no current opening, or role is slightly off, or needs more research. Worth pursuing but not urgent.
- **Tier 3 (Watch):** Interesting company but timing or fit isn't right yet. Keep on radar for future opportunities.

### After Writing the Dossier

1. **Confirm the file was written** by reading it back.
2. **Log the deep dive** — invoke the `/journey-log` skill (or manually append to `journey/LOG.md`) noting which company was researched, key findings, and the proposed priority tier.
3. **If processing multiple companies**, provide a comparative summary at the end:
   - Rank by priority tier
   - Note which have the strongest angles
   - Flag any that should be removed from the pipeline (dead companies, bad reputation, poor fit on closer inspection)

---

## Important Guidelines

- **Use web search extensively.** This skill is about finding NEW information not already in the database. Don't just reformat existing data.
- **Be honest about what you couldn't find.** A dossier that says "engineering blog: none found, culture signal: unknown" is more useful than one that makes things up.
- **Focus on actionable intelligence.** Every section should help Doug take a specific action — reach out to a person, reference a fact, tailor a message.
- **Don't be sycophantic about companies.** If the research reveals red flags (layoffs, bad reviews, stalled growth), include them. Doug needs accurate intelligence, not cheerleading.
- **Prefer people who create public content** for the contacts section. They're more approachable and give Doug something real to reference.
- **Check if the company still exists independently.** Companies get acquired, shut down, or pivot. Verify before writing a full dossier.
- **Conversation starters must be specific.** If the angle could apply to any company, it's too generic. Every angle must reference something unique to this company + something unique to Doug.
- **Respect rate limits.** When processing multiple companies, you may need to space out web searches. Quality over speed.
