# AIVA Technologies — Deep Dive Dossier

**Last Updated:** 2026-02-15
**Priority Tier:** 3 (Watch)
**Overall Assessment:** Pioneering AI music company with a unique claim (first virtual artist registered with SACEM), but limited funding ($2.5-7.5M total over 8+ years), small team (~20), and a tech stack that's somewhat dated (Angular 8, MongoDB). The Full Stack Developer role is remote-friendly and technically feasible for Doug, but the company's growth trajectory is unclear. Interesting domain, uncertain business.
**Existing Relationship:** No

---

## Current Openings

| Role | Team | Link | Posted | Salary | Doug Fit |
|------|------|------|--------|--------|----------|
| Full Stack Developer (Angular / Node JS) | Full-Stack Programming | [We Work Remotely](https://weworkremotely.com/remote-jobs/aiva-technologies-full-stack-developer-angular-node-js) | Active (long-standing) | Not posted | Moderate — Doug knows Node.js and can learn Angular, but the stack (Angular 8, MongoDB) is dated. The role involves interfacing with internal Audio and AI Composition APIs, which is interesting. Requires 3+ years full-stack experience — well below Doug's level. |
| Senior Software Engineer | Engineering | [aiva.ai/jobs](https://www.aiva.ai/jobs) | Active | Not posted | Moderate-Strong — More aligned with Doug's seniority. No details available on requirements. |
| DevOps | Infrastructure | [aiva.ai/jobs](https://www.aiva.ai/jobs) | Active | Not posted | Weak — Not Doug's primary focus. |
| Deep Learning Engineer | R&D | [aiva.ai/jobs](https://www.aiva.ai/jobs) | Active | Not posted | Weak — Research-focused ML role, not Doug's background. |

**Notes:** The jobs page lists roles without detailed descriptions. The Full Stack Developer listing on We Work Remotely specifies Angular 8, Node.js, and MongoDB with at least 3 years experience. Multiple roles being open simultaneously for a ~20 person team suggests either growth or turnover.

## Recent Activity (Last 6 Months)

- **Jul 2024:** Kayacan Ventures (Istanbul) invested in AIVA's Series A round — most recent documented investment activity
- **No significant news found for late 2025 or early 2026** — The company has been relatively quiet publicly
- **Historical context:** NetEase Games led a $1.69M Series A in Jun 2020. Total funding is reported between $2.5M-$7.5M across multiple small rounds, grants, and prize money.
- **AIVA product** continues to be available as a consumer/prosumer AI music composition tool

**Trajectory:** Unclear. The company was founded in 2016 and has raised relatively little institutional capital over 8+ years. No recent funding announcements. The consumer AI music generation space has become extremely competitive (Suno, Udio, etc.), which could be both an opportunity (AIVA has first-mover credibility) and a threat (well-funded competitors).

## Tech & Engineering

**Stack:** Node.js, Angular 8, MongoDB, Python, C++, Celery (task queue), DigitalOcean (current hosting), roadmap to containerize with Kubernetes and deploy on AWS
**Engineering Blog:** None found
**GitHub Org:** None found (closed source)
**Open Source Activity:** None found
**Culture Signal:** Unknown — Too little public signal to assess

The tech stack raises some concerns. Angular 8 is significantly outdated (current Angular is v17+). The mention of planning to containerize with Kubernetes and move to AWS suggests they're still on relatively basic infrastructure (DigitalOcean). This isn't necessarily bad for a small team, but it does indicate the engineering hasn't been heavily invested in modernization. The interesting technical aspects are the internal Audio and AI Composition APIs — this is where the proprietary IP lives, and interfacing with these would be the compelling part of the Full Stack Developer role.

## Key Contacts

| Name | Title | LinkedIn | Recent Content | Why Them |
|------|-------|----------|----------------|----------|
| Pierre Barreau | Co-Founder & CEO | [LinkedIn](https://www.linkedin.com/in/pierre-barreau-040883105/) | Occasional press interviews, Crunchbase profile | CEO and public face. Computer scientist, award-nominated director and composer. Leads company vision. |
| Denis Shtefan | Co-Founder & CTO | [The Org](https://theorg.com/org/aiva-technologies/org-chart/denis-shtefan) | Published researcher, listed on Crunchbase | Technical decision-maker. Published researcher in creative music generation using AI. Would evaluate engineering hires. |
| Vincent Barreau | Co-Founder & COO | Not found publicly | None found | Operational co-founder. |

**Recommended first contact:** Denis Shtefan — As CTO and co-founder, he's the technical leader and would be the right person to discuss engineering roles. His background as a published researcher and composer suggests he'd value someone who can appreciate both the technical and creative aspects of what AIVA does.

## Pain Points & Opportunities

### What They Need
- Full-stack engineers to build and maintain the web platform where users interact with AIVA's AI composition capabilities
- Infrastructure modernization — they explicitly mention a roadmap to containerize and move to AWS/Kubernetes
- Someone who can interface between the web platform and the AI/audio backend APIs
- Competitive product improvements — the AI music generation market has exploded with Suno, Udio, and others

### How Doug Solves It
- **Platform modernization:** Doug's experience with modern stacks (TypeScript, React, Next.js, Node, PostgreSQL, AWS) could help AIVA modernize their Angular 8 / MongoDB / DigitalOcean stack. His infrastructure experience with AWS and deployment pipelines directly matches their stated roadmap.
- **API-driven product building:** Interfacing with internal APIs is something Doug does in his sleep — he's built products across dozens of API integrations.
- **AI integration experience:** Featured in MIT Generative AI course (50k+ students), building agentic workflows. Understands how to build products on top of AI capabilities.
- **Growth and product thinking:** AIVA needs to differentiate in a crowded market. Doug's growth engineering background could help them think about product-led growth and user acquisition.

### First 90 Days Sketch
- Weeks 1-4: Understand the existing codebase, APIs, and infrastructure. Identify quick wins for modernization.
- Weeks 5-8: Begin infrastructure migration work (containerization, AWS setup). Improve the developer experience for the team.
- Weeks 9-12: Ship a user-facing feature improvement and present a technical modernization roadmap.

## Proposed Angles

1. **AI Product Building** (Technical)
   "AIVA's position as the first AI composer recognized by SACEM is remarkable — that kind of institutional credibility is hard-won. I've been working at the intersection of AI and product engineering, including being featured in MIT's Generative AI course that reached 50,000+ students. I'm curious how you're evolving the product platform as the AI music generation space becomes more competitive — there's a fascinating challenge in making AI composition tools that professional creators actually trust."

2. **Platform Modernization** (Technical)
   "I noticed you're looking for full-stack developers and have a roadmap toward containerization and AWS. I've built and scaled web platforms on AWS across multiple companies — most recently at DinnersWithFriends (TypeScript, Next.js, Hono, PostgreSQL on GCP) and previously at getBenson where we handled 25M monthly sessions. If modernizing the platform infrastructure is on the agenda, that's something I've done multiple times and could hit the ground running on."

3. **Remote European Engineer** (Cultural)
   "As a European-based engineer (Prague) with remote-first experience across multiple companies and time zones, AIVA's international team of 8+ nationalities resonates with how I work best. The combination of AI, music, and a Luxembourg-based team with remote flexibility is an interesting setup — I'd enjoy the challenge of building products for creative professionals."

## Notes

- **Competitive landscape concern:** Suno and Udio have raised significantly more money and are building consumer AI music generation tools. AIVA's differentiation (composer recognition by SACEM, professional use cases for films/games/commercials) is real but may struggle against well-funded competitors.
- **Tech stack dated:** Angular 8 and MongoDB without containerization in 2026 suggests under-investment in engineering modernization. This could be an opportunity (Doug helps modernize) or a red flag (the company doesn't prioritize engineering).
- **Funding ambiguity:** Reported funding ranges from $2.5M to $7.5M across sources. Either way, it's modest for a company founded in 2016. No recent rounds suggest they're either profitable/sustainable or struggling to raise.
- **Remote-friendly:** Explicitly accepts fully remote applicants, which is a plus for Doug in Prague.
- **NetEase investment:** Chinese gaming giant NetEase as an investor is interesting — could signal potential for AI music in gaming, which aligns with Doug's gaming interests.
- **Seniority mismatch:** The Full Stack Developer role asks for 3+ years experience, well below Doug's level. The Senior Software Engineer role might be better but lacks details.

---

*Generated by company-deep-dive skill. Verify key facts before using in outreach.*
