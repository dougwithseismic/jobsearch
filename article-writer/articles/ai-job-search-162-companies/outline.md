# Article Outline: I Built an AI-Powered System to Research 162 Companies in a Day

## Narrative Arc: HOOK → BACKGROUND → CHALLENGE → APPROACH → RESULTS → LESSONS

---

## 1. The Recruiter's Inbox Problem (~600 words)

**Role:** Hook — establish the broken system

**Opening:** Personal credibility statement (3 exits, MIT feature, million users) contrasted with the absurdity of not knowing where to apply.

**Key beats:**
- The AI doom loop (Daniel Chait, Greenhouse): both sides weaponized AI, trust collapsed
- The numbers: 75% ghosted, 10% of inbound qualified (Orosz), 11,000 LinkedIn apps/minute
- The senior engineer paradox: the more experienced you are, the more specific your criteria, the less useful existing tools become
- The pivot: "So I did what any engineer would do — I built something"

**Data points:** Greenhouse 2025 report, Pragmatic Engineer hiring manager survey, Interview Guys 2025 Ghosting Index

**Transition to next:** From "the system is broken" to "here's what I was actually looking for"

---

## 2. What I Was Actually Looking For (~700 words)

**Role:** Background — establish the specific search criteria

**Opening:** Prague, February 2026. Specific constraints that make this search hard.

**Key beats:**
- The profile: 15 years, TypeScript/React, growth engineering, scraping specialty, 3 exits
- The criteria: revenue-adjacent ownership, European startups, interesting verticals (music, gaming, events, travel), NOT fintech/B2B SaaS
- The European landscape: $58B in VC, 58,000+ startups, but 29% hiring rate and narrow specialization
- Prague specifically: 470+ startups, 60,000 IT specialists, but VC at 0.07% of GDP
- The narrowing funnel: each criterion halves the pool

**Data points:** Atomico State of European Tech, Ravio compensation report, Czech Founders data

**Transition to next:** "The criteria were clear. Finding 160+ companies that might match — without spending three months on LinkedIn — was the problem."

---

## 3. Swiping Blind on 162 Companies (~800 words)

**Role:** Challenge — the data quality problem

**Opening:** "The first research sprint produced 101 companies in a few hours. And they were almost useless."

**Key beats:**
- What the AI agents actually produced: company names, one-line descriptions, locations, rough fit scores
- The data quality wall: "AI music discovery" tells you nothing about whether you should work there
- Building the swipe tool: Tinder-style interface, arrow keys, three-way decisions (yes/no/maybe)
- The Hick's Law insight: reducing 162 simultaneous decisions to binary sequential ones
- The forcing function: the tool exposed what data was missing (not what data was present)
- The enrichment sprint: screenshots, HN mentions, research links, reputation scoring

**Data points:** Hick's Law, decision fatigue research, 81% AI data quality issues (Qlik)

**Transition to next:** "The tool was fast. The data feeding it wasn't good enough. Time to build the machine properly."

---

## 4. Building the Machine (~1200 words)

**Role:** Approach — the technical build (heaviest section)

**Opening:** "The system has five layers, and each one exists because the previous one broke."

**Five layers, each emerging from a failure:**

### Layer 1: The Research Agents
- Claude Code as orchestration layer
- Custom skills for repeatable workflows
- Parallel browser automation (3 agents scraping simultaneously)
- Profile scraping sprint: Contra, LinkedIn, GitHub, withSeismic, Clutch

### Layer 2: The Swipe Tool
- Next.js in the existing monorepo, zero new dependencies
- Google favicon API for logos (free, no key)
- decisions.json on disk (not localStorage — Doug's instinct)
- Arrow keys for speed, backspace to undo

### Layer 3: The Reputation Scoring System
- Glassdoor scores are structurally compromised (376.3% AI review increase, WSJ 400+ companies gaming)
- A-F rating scale cross-referencing Glassdoor + layoff history + news + financial stability
- Three parallel agents, each handling 20-28 companies
- The 2D priority map: fit score × reputation

### Layer 4: The Screenshot Service (Build vs Buy)
- thum.io: "image not authorized"
- WordPress mshots: never loaded
- Puppeteer in 50 lines: better than both, permanent files on disk
- The meta-lesson: AI pair programming flipped build-vs-buy economics

### Layer 5: The Live Research Panel
- HN mentions via Algolia API (free, 10k requests/hour)
- One-click links to Google News, LinkedIn, Glassdoor, GitHub
- File-based caching (same philosophy as decisions.json)

**Data points:** Originality.AI study, WSJ investigation, SpaceX mugs, Puppeteer docs

**Transition to next:** "The machine was running. 162 companies scored, rated, and ready. But the most interesting findings weren't in the data — they were in the patterns."

---

## 5. What 162 Companies Actually Taught Me (~1000 words)

**Role:** Results — three counterintuitive findings

**Opening:** "The data told three stories I wasn't expecting."

### Finding 1: Glassdoor Scores Lie (Systematically)
- Bending Spoons: 4.7 rating, but fires 75-100% of every acquisition (Evernote, WeTransfer, Vimeo, Filmic — full timeline)
- Spitfire Audio: 4.4 rating, cut 25% of staff, co-founder departed
- Ableton: D rating, laid off 20%, Glassdoor 3.2
- The survivorship bias: reviews come from survivors, not the fired
- Epidemic Sound: $182M revenue, Glassdoor 2.8, rolling layoffs every 6-8 weeks

### Finding 2: The Excitement-Skills Gap
- Robot bartenders, autonomous drones, brain interfaces — exciting but need embedded/hardware engineers
- BI tools, dev platforms, e-commerce — boring-sounding but need Doug's exact stack
- The sweet spot: interesting domains where the web platform IS the product
- Examples: Realm.fun (game servers → TS dashboard), MapTiler (maps → TS SDK), Tractive (pet GPS → React app)

### Finding 3: The Agency Angle
- Doug's career already follows an agency pattern (withSeismic, Contra, Sky, Groupon, MIT)
- Agencies solve "can't pick one vertical": music one month, gaming the next
- ustwo: employee-owned, built Monument Valley alongside client work
- Bakken & Bæck: Glassdoor 4.7, 100% recommend, 5.0 work-life balance
- The structural insight: agencies offer variety without changing jobs

**Data points:** Bending Spoons acquisition timeline (TechCrunch, PetaPixel), ustwo engineering blog, Bakken & Bæck about page

**Transition to next:** "The system didn't just find companies — it changed how I think about what I'm looking for."

---

## 6. Growth Engineering Your Own Career (~700 words)

**Role:** Lessons — the meta-lesson + practical takeaway

**Opening:** "The irony isn't lost on me: I used growth engineering to find a growth engineering job."

**Key beats:**
- The meta-lesson: the build IS the portfolio, the process IS the pitch
- Dan Abramov → Redux → Facebook. Kenneth Reitz → Requests → Heroku. The pattern is consistent.
- The broken math: 2% cold application success rate vs 30% referral rate
- Greg Kroah-Hartman: "If you get five commits in the Linux kernel you will get offered the job"
- What this project demonstrates: systems thinking, data literacy, automation, build-vs-buy judgment, communication
- The "demonstrate, don't apply" thesis: show up with the receipt, not the request
- Practical advice: spend 80% of search time on networking/demonstration, 20% on applications
- The two-person setup: Doug and Inna, two MacBooks, one code-server, ten Claude threads
- Closing: the real product wasn't the database — it was the proof

**Data points:** OpenArc networking data, How-To Geek side project profiles, HAMY.xyz job search data

**Closing line:** Something that ties back to the opening — the system found 162 companies, but the real signal was in the building.

---

## Cross-Cutting Elements

**External links target (13+):** Pragmatic Engineer, Greenhouse/Fortune, Originality.AI, TechCrunch (Bending Spoons), PetaPixel (Vimeo), ustwo engineering, Bakken & Bæck, Puppeteer docs, Claude Code docs, OpenArc networking stats, How-To Geek, HN Algolia API, WSJ/Challenger Gray

**Real-world examples target (4+):** Bending Spoons acquire-and-fire, thum.io/mshots → Puppeteer build-vs-buy, ustwo/Bakken & Bæck agency model, Dan Abramov/Kenneth Reitz demonstration-to-hire

**Prose ratio target (75%+):** Narrative-driven throughout. Lists only for the Bending Spoons timeline and the five system layers. Everything else flows as prose.

**Voice:** First person, direct, specific. "I built" not "one might consider building." Numbers over adjectives. Show then tell.
