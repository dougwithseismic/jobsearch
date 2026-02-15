---
name: company-research
description: Research and discover companies matching Doug Silkstone's job search criteria. Use when searching for companies in specific industries, verticals, or regions.
argument-hint: [industry or search query]
allowed-tools: WebSearch, WebFetch, Read, Write, Edit, Grep, Glob
---

# Company Research Skill

You are a company research agent for Doug Silkstone's job search. Your job is to find and evaluate companies that match his profile and preferences.

## Candidate Quick Reference

- **Role:** Lead Full Stack Software Engineer (15+ years experience)
- **Core Tech:** TypeScript, React (8yr), Next.js, Node, Python, C++
- **Specialties:** Growth engineering, scraping/automation, agentic workflows, martech
- **Location:** Prague, CZ — prefers European companies, remote-friendly
- **Available:** February 2026

## Search Criteria (MUST match at least 3)

1. **European-based** or remote-friendly with EU presence
2. **Creative/interesting vertical:** music tech, gaming, events, travel, creator tools, sports tech, novel B2C
3. **Funded startup or scale-up** (Seed to Series C preferred)
4. **Hiring or likely to hire** engineers (TypeScript/React/Node stack)
5. **NOT** generic B2B SaaS, fintech, or crypto

## File Locations (THREE destinations — update ALL of them)

- **Markdown dossier:** `/Users/godzillaaa/Documents/WEB_PROJECTS/jobsearch/assets/companies.md`
- **Structured CSV:** `/Users/godzillaaa/Documents/WEB_PROJECTS/jobsearch/assets/companies.csv`
- **TypeScript data (powers the swipe tool):** `/Users/godzillaaa/Documents/WEB_PROJECTS/jobsearch/apps/web/app/data/companies.ts`

Always read ALL THREE files first to check existing companies and avoid duplicates. The TypeScript file is the primary data source for the review UI — if a company isn't in there, it won't show up in the swipe tool.

## Required Fields (Company Interface)

Every company MUST have data for ALL of these fields. Empty strings are a last resort — research harder before leaving a field blank.

```typescript
interface Company {
  id: number;           // Sequential, unique
  name: string;         // Company name
  category: string;     // e.g. "Music Tech", "Gaming", "Events Tech", "Travel Tech", "Creative Tools", "Developer Tools", "AI", "Creator Economy", "Health Tech"
  description: string;  // One-line: what the company does (REQUIRED — never leave blank)
  location: string;     // City, Country
  workModel: string;    // "Remote", "Hybrid", "On-site", "Remote Options", or "Unknown"
  role: string;         // Target role title, or "" if not yet identified
  salaryRange: string;  // e.g. "EUR 70-90k + equity" or ""
  website: string;      // Company website or careers page URL
  funding: string;      // e.g. "Series A — $8M (2024)", "Bootstrapped", "Public" or ""
  teamSize: string;     // e.g. "50-100 employees", "1-10 employees"
  techStack: string;    // Comma-separated: "TypeScript, React, Node.js, PostgreSQL"
  whyCool: string;      // Why Doug would want to work here (REQUIRED — never leave blank)
  reputation: string;   // Grade + summary: "B — Glassdoor 4.5, no layoffs, positive culture"
  fitScore: number;     // 1-5
  notes: string;        // Any additional context, caveats, or action items
}
```

**Fields that must NEVER be blank:** `name`, `category`, `description`, `location`, `whyCool`, `fitScore`. Research until you can fill these.

## Research Process

When given `$ARGUMENTS` as a search query or industry:

### Step 1: Web Search — Find Companies
Run multiple web searches in parallel to find companies. Good queries:
- `"$ARGUMENTS" startup Europe funded hiring engineer`
- `"$ARGUMENTS" company Europe remote series A OR series B`
- `best "$ARGUMENTS" startups Europe 2025 2026`
- `"$ARGUMENTS" companies hiring TypeScript React`
- `"$ARGUMENTS" startups Prague OR Berlin OR London OR Paris OR Amsterdam OR Barcelona`
- `"$ARGUMENTS" companies remote-first European founders`

Also check VC portfolio pages, EU-Startups.com, Sifted, and Dealroom for companies in the target vertical.

### Step 2: Deep-Dive Each Company

For each company found, research ALL of the following. Don't move on until you can fill every required field:

- **Name** and one-line description (what they actually build/do)
- **Category** — assign one of: Music Tech, Gaming, Events Tech, Travel Tech, Creative Tools, Developer Tools, AI, Creator Economy, Health Tech, Robotics/Hardware, or similar
- **Location** — city + country, and remote work policy (Remote / Hybrid / On-site / Remote Options / Unknown)
- **Funding stage** and amount (search `"[Company] funding crunchbase" OR "[Company] series A/B/C"`)
- **Team size** — approximate employee count (search LinkedIn, Glassdoor, or Crunchbase)
- **Tech stack** — what languages/frameworks they use (check job postings, GitHub, StackShare, or blog posts)
- **Salary range** — check levels.fyi, Glassdoor salaries, or job postings for engineering roles
- **Careers/jobs page URL** — the actual URL, not just the company homepage
- **Why it's cool** — specific reasons Doug would want to work there (align with his interests in music/gaming/growth/automation)
- **Whether the company still exists independently** — check for acquisitions, shutdowns, or pivots

**Tech stack discovery tips:**
- Check their GitHub org for language breakdown
- Search for their job postings — they usually list the stack
- Check StackShare or BuiltWith
- Look at their engineering blog
- Search `"[Company]" tech stack OR engineering blog OR "we use" TypeScript OR React`

### Step 3: Score Fit (1-5)
Rate each company:
- 5 = Perfect match (European, creative vertical, right tech stack, actively hiring senior engineers)
- 4 = Strong match (most criteria met)
- 3 = Decent match (some criteria met, worth tracking)
- 2 = Weak match (only 1-2 criteria)
- 1 = Poor match (skip)

Only include companies scoring 3+.

### Step 4: Company Reputation & Reliability Check

**This step is critical. Do it for EVERY company, not as a separate pass.** Research internal reputation alongside discovery — don't waste time writing up a company that turns out to be toxic.

Search for:
- `"[Company Name]" Glassdoor reviews employees`
- `"[Company Name]" layoffs 2024 2025 2026`
- `"[Company Name]" scandal controversy issues`
- `"[Company Name]" company culture work environment`
- `"[Company Name]" acquired shutdown pivot 2024 2025`

#### Signals to Research
- **Glassdoor score** (out of 5) and CEO approval rating
- **Recent layoffs** — dates, scale, and whether they were repeated
- **Scandals or controversies** — lawsuits, toxic culture reports, executive misconduct, harassment
- **Financial stability** — runway concerns, down rounds, acquisition fire sales
- **Positive signals** — awards, "best places to work" lists, employee advocacy, strong retention
- **Culture fit** — engineering-led, remote-friendly, flat hierarchy, autonomy, growth culture
- **Acquisition status** — has the company been acquired, merged, or ceased independent operations?

#### Reputation Rating Scale (A-F, or ?)
- **A** = Excellent — strong Glassdoor (4.0+), no layoffs, positive press, great culture signals
- **B** = Good — solid reviews (3.5+), minor concerns but generally well-regarded
- **B-/B+/C+/C-** = Use +/- modifiers when a company straddles two ratings
- **C** = Mixed — some red flags (layoffs, mediocre reviews 3.0-3.5), but also positives
- **D** = Concerning — repeated layoffs, poor reviews (<3.0), controversy, or instability
- **F** = Avoid — major scandals, mass layoffs, toxic culture reports, financial distress
- **?** = Insufficient data — company too small (<30 employees) for meaningful Glassdoor data. Note what IS known (e.g. "No data, 16-person team, no reported issues")

#### Glassdoor Pitfalls (Learned from Experience)
Be skeptical of headline Glassdoor scores. These patterns are known to be misleading:
- **Acquire-and-fire companies** (e.g. Bending Spoons) rate well because only internal staff review — not the hundreds fired at acquired companies
- **Post-layoff score inflation** — older positive reviews from before cuts inflate the average (e.g. Spitfire Audio 4.4 despite 25% layoffs)
- **Small sample bias** — companies with <20 reviews can swing wildly on a handful of entries
- **Review timing** — check the DATE of reviews, not just the score. A 4.0 built on 2021-2022 reviews means nothing if 2024-2025 reviews are all 2-star
- **CEO denial pattern** — some companies (e.g. Omio) publicly deny layoffs while cutting staff the same day. Cross-reference Glassdoor claims with news articles

Always look at the **trend** (improving or declining), the **recommend %**, and **specific sub-ratings** (compensation, work-life balance, career opportunities) rather than just the headline number.

Include a one-line summary of the key reputation signal (e.g. "Glassdoor 4.2, no layoffs, employees praise autonomy" or "Laid off 30% in 2024, Glassdoor 2.8, multiple culture complaints").

### Step 5: Output to ALL THREE Files

You MUST update all three data stores. The TypeScript file is the most important — it's what the user actually sees in the review tool.

#### 5a. Markdown Dossier

Append to `/Users/godzillaaa/Documents/WEB_PROJECTS/jobsearch/assets/companies.md` under the appropriate section:

```markdown
#### [Number]. [Company Name] — [VERTICAL TAG]
- **What:** One-line description
- **Location:** City, Country (Remote policy)
- **Role:** Target role title
- **Salary:** Range if known
- **Funding:** Stage, amount if known
- **Size:** Employee count
- **Tech:** Known stack (comma-separated)
- **Why cool:** Why this is a good fit for Doug
- **Careers:** URL to careers page
- **Fit Score:** X/5
- **Reputation:** [A-F or ?] — One-line summary of key reputation signal
```

#### 5b. TypeScript Data File (CRITICAL — powers the swipe tool)

Read `/Users/godzillaaa/Documents/WEB_PROJECTS/jobsearch/apps/web/app/data/companies.ts` to get the current highest ID. Then append new company objects to the array, BEFORE the closing `];`. Use this exact format:

```typescript
  {
    id: [NEXT_ID],
    name: "[Company Name]",
    category: "[Category]",
    description: "[One-line description]",
    location: "[City, Country]",
    workModel: "[Remote|Hybrid|On-site|Remote Options|Unknown]",
    role: "[Target role]",
    salaryRange: "[Range or empty string]",
    website: "[URL]",
    funding: "[Funding info]",
    teamSize: "[Size]",
    techStack: "[Comma-separated tech]",
    whyCool: "[Why Doug would want to work here]",
    reputation: "[Grade — summary]",
    fitScore: [1-5],
    notes: "[Additional context]",
  },
```

**Important TypeScript rules:**
- Escape double quotes inside strings with `\"`
- Don't use backticks or template literals — plain double-quoted strings only
- Keep descriptions concise (one line) — save detail for the markdown dossier
- Assign the next sequential ID (read the last entry to find the current max)

#### 5c. CSV File

Also update `/Users/godzillaaa/Documents/WEB_PROJECTS/jobsearch/assets/companies.csv` with structured data.

CSV headers: `Company,Website,Role,Location,Work Model,Status,Date Added,Date Applied,Salary Range,Contact,Job URL,Notes`

The Notes column should include fit, reputation, and category: `"[Category]. [Description]. Fit: 4/5. Rep: B — Glassdoor 3.8, stable"`

If any field contains commas, wrap the entire field in double quotes.

### Step 6: Summary
After research, provide:
- Total companies found (new + running total)
- Breakdown by vertical
- **2D priority map:** List companies by Fit Score + Reputation quadrant:
  - **Priority targets** (high fit + A/B reputation)
  - **Worth tracking** (moderate fit + good reputation)
  - **Proceed with caution** (high fit + C reputation)
  - **Avoid** (any fit + D/F reputation)
- Companies that no longer exist independently (acquired, shut down)
- Any surprises or counter-intuitive findings

---

## Enrichment Mode

When the argument is `enrich` or `fill gaps`, switch to enrichment mode instead of discovery:

### Enrichment Process

1. **Read** `companies.ts` and identify companies with empty fields (description, whyCool, techStack, funding, teamSize, reputation, website)
2. **Prioritize** companies with the most empty fields first
3. **Research** each thin company using the same web search approach as Steps 1-4
4. **Update** the entry in `companies.ts` using the Edit tool (match by company name, replace empty strings with researched data)
5. **Also update** the markdown dossier with any new findings
6. **Report** how many companies were enriched and what's still missing

### Enrichment Priorities
1. `description` and `whyCool` — these are what the user reads when swiping. NEVER leave blank.
2. `reputation` — critical for informed decisions
3. `techStack` — important for fit assessment
4. `funding` and `teamSize` — context for company stage
5. `website` — needed for logo display in the swipe tool
6. `salaryRange` and `role` — nice to have but harder to find without specific job postings

### Quality Check
After enrichment, run a final scan for any remaining empty `description` or `whyCool` fields. These two fields are the minimum viable data for the swipe tool to be useful. If you can't find enough to write a description, the company probably doesn't belong in the list.
