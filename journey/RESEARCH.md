# Phase: Research

*Written from Doug's perspective — building the map of where to go next.*

---

I started with a question: how do you find 100+ companies that match a very specific set of preferences without spending weeks on LinkedIn? The answer turned out to be: treat it like a scraping project. Cast a wide net with targeted queries, collect everything into a structured format, then filter with human judgment.

## The First 100

The initial sprint produced 100 companies across six verticals — music tech, gaming, events, travel, creative tools, and novel B2C. I went wide on purpose. Wellfound, remote job boards, EU startup databases, company career pages. Everything went into two files: a detailed markdown dossier (`companies.md`, 1100+ lines) and a structured CSV for machine consumption.

The distribution felt right: ~25 music/audio, ~25 gaming, ~10 events, ~8 travel, ~15 creative tools, ~18 other. A strong Prague cluster emerged that I hadn't expected — Mews (hospitality unicorn), Apify (scraping platform), Productboard, Bohemia Interactive, Warhorse Studios. Some of these are literally down the street.

Each company got a vibes-based fit score from 1-5. Fifteen companies scored 5/5, including two I've actually worked with before (Framer, Contra) and one that maps perfectly to my scraping expertise (Apify). But the fit scores were gut feelings, not methodology — and that became a problem when I tried to actually use them for decision-making.

## The Underdogs

The first 100 skewed toward established names — unicorns, Series B+, 500+ employee companies. But some of the most exciting opportunities are at 10-30 person teams punching above their weight. So I did a second pass specifically targeting underdogs.

Music production was the richest vein. Bitwig (30 people in Berlin, building a DAW that producers love, competing directly with Ableton). FabFilter (Amsterdam, Engineering Emmy-winning audio plugins, hiring C++ devs). Kilohearts (9 people in Sweden building a genuinely innovative modular plugin system). Spitfire Audio (London, hiring full-stack devs, made by musicians for musicians). These are companies where joining means you'd be 5-10% of the entire engineering team.

Gaming analytics was the other find. Leetify (Stockholm, 200k+ monthly active players, AI coaching for CS2) is exactly the kind of company I'd want to build at — small team, massive user love, at an inflection point of scaling from one game to many. GGPredict and SCOPE.GG are similar energy.

The question with companies this small: do they have budget for a senior hire? Many of these won't have a standard careers page. The approach will need to be different — demonstrate value through community engagement, build something visible, then make a direct pitch.

## The Due Diligence Sprint

Then came the reality check. I had 117 companies rated on "fit" — how well their tech stack, vertical, and location matched my preferences. But fit doesn't tell you anything about whether a company is a good place to actually work. So I ran a comprehensive reputation audit.

Three parallel research agents, each handling 20-28 companies. Glassdoor ratings, layoff trackers, news articles, employee forums, CEO approval ratings, controversy searches. Every company got an A-F reputation rating.

The results were sobering.

### Companies I Would Have Chased — But Shouldn't

**Ableton** (D) was the one that stung. The Berlin dream DAW company. I've used their products for years. But they laid off 20% of staff in 2024, Glassdoor sits at 3.2, compensation is rated 2.8/5, and morale has collapsed. The creative paradise image doesn't match the reality.

**Paradox Interactive** (D) publishes some of the deepest strategy games in existence. But they have a documented sexual harassment scandal — 69% of women at the company reported mistreatment. They're forcing return-to-office and closing studios.

**Bending Spoons** (F) was the most instructive. Glassdoor 4.7 — sounds amazing! Except those reviews are from their internal Milan team. Their actual business model is acquiring companies (Evernote, WeTransfer, Vimeo, Hopin) and firing nearly everyone. They're the corporate raider of the app world. This is a company that looks perfect on paper and is genuinely destructive in practice.

**Productboard** (D) is a Prague unicorn I'd been excited about — same city, React/TypeScript stack, product-focused. But they've been in freefall since 2022: massive layoffs, closed most offices, constant pivots, leadership churn. Employees describe "trauma bonding." The unicorn label is a scar, not a badge.

### Companies That Are Better Than Expected

**Apify** (A) is the standout. Glassdoor 4.8 — and 5.0 specifically in Prague. 100% of employees recommend it. No layoffs. Outstanding culture and compensation ratings. It's a web scraping platform, which maps directly to my automation expertise. And it's literally in Prague. This went from "interesting" to "top 3 target."

**Photoroom** (A) in Paris: Glassdoor 4.9, culture rated 5.0, 100% recommend. Growing fast, $50M revenue. If the location worked, this would be a dream.

**XCEED** (A) in Barcelona: events tech, Glassdoor 4.8, unlimited holidays. Music + nightlife + tech.

**Linear** (A): 100% recommend, remote-first, no layoffs. The project management tool that developers actually love.

### Surprises

Ready Player Me got acquired by Netflix in December 2025 and is shutting down independent operations. Removed from the active list.

Larian Studios — the team behind Baldur's Gate 3, possibly the best RPG ever made — had December 2025 allegations of sexual harassment and tolerance of extremist views. Rated B- with a watch flag.

Epidemic Sound is printing money ($182M revenue, +29% YoY) while rolling layoffs every 6-8 weeks since 2023. Glassdoor 2.8. A company can be financially healthy and culturally toxic simultaneously.

Spitfire Audio has a 4.4 Glassdoor score that's actively misleading — they cut 25% of staff in early 2023, the co-founders had a public fallout, and people keep leaving. The score is inflated by older reviews from before the trouble started.

## The 2D Map

The database now has two dimensions for every company:
- **Fit Score (1-5):** How well it matches my tech stack, vertical, location, and career preferences
- **Reputation Rating (A-F):** How reliable it is as an employer — layoffs, culture, leadership, financial stability

The sweet spot is top-right: high fit + high reputation. That's where the priority targets live:

| Company | Fit | Rep | Why |
|---------|-----|-----|-----|
| Apify | 5/5 | A | Prague, scraping expertise match, outstanding culture |
| Photoroom | 5/5 | A | AI creative tool, Paris, perfect culture scores |
| Musixmatch | 4/5 | A | Music data, Bologna/London, stable and well-regarded |
| Linear | 4/5 | A | Remote, React/TS, beloved product |
| Synthesia | 4/5 | A | AI video, London, competitive pay, no layoffs |
| XCEED | 4/5 | A | Events tech, Barcelona, exceptional culture |
| Holidu | 3/5 | A | Travel search, Munich, great team culture |
| Overwolf | 5/5 | B | Modding platform, TS-based, aligns with Source 2 interest |
| Mews | 5/5 | B | Prague unicorn, $200M revenue, no layoffs |
| TravelPerk | 4/5 | B | Barcelona, unicorn, strong culture |
| Voodoo | 4/5 | B | Paris mobile gaming, growth-driven |
| Splice | 4/5 | B | Music tools, London, strong culture recovery |
| Contra | 5/5 | B | Prior relationship, exact tech stack, no layoffs |
| Framer | 5/5 | B | Prior relationship, Amsterdam, but comp concerns |

The dangerous quadrant is high-fit + low-reputation. These are the traps — exciting on paper, miserable in practice:

| Company | Fit | Rep | Warning |
|---------|-----|-----|---------|
| Ableton | 4/5 | D | 20% layoff, morale collapse |
| Paradox | 4/5 | D | Harassment scandal, forced RTO |
| Productboard | 4/5 | D | Prague, but in freefall since 2022 |
| Bending Spoons | 3/5 | F | Acquires companies, fires everyone |
| Sorare | 4/5 | D | Revenue declining, massive layoffs |

## What's Next

The research phase isn't over — I still need to check which of these companies are actively hiring and for what roles. But the map is drawn. 117 companies, scored on two dimensions, with enough context to make real decisions about where to invest outreach energy.

The updated `company-research` skill now runs reputation checks automatically, so any new companies added to the list will get the same treatment.

Next move: prioritize the top-right quadrant and start the outreach phase.

---

*Status at end of Research (so far):*
- 117 companies researched across 6 verticals
- 70 companies with A-F reputation ratings
- ~47 too small for public data (rated `?`)
- Top findings: Apify (A, Prague, perfect match), Photoroom (A), XCEED (A), Linear (A), Synthesia (A)
- Key warnings: Ableton (D), Paradox (D), Bending Spoons (F), Hopin (F), Productboard (D)
- `company-research` skill updated with mandatory reputation step
- Both `companies.md` and `companies.csv` fully updated with reputation data
