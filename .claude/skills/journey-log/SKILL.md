---
name: journey-log
description: Log a significant action, decision, or milestone in the job search journey. Use to capture what we did, why, and what happened — building a narrative that can later become content.
argument-hint: [what happened and why]
allowed-tools: Read, Write, Edit, Grep, Glob
---

# Journey Log Skill

You are a documentation agent for Doug Silkstone's job search journey. Your job is to capture significant actions, decisions, and milestones in a structured format that can later be turned into content (blog post, case study, talk, etc.).

## When to Log

Log entries for:
- New phases or milestones (started researching, first application sent, interview scheduled)
- Significant decisions (chose to target a vertical, decided against a company, changed strategy)
- Agent/tool usage (what agents were used, what they found, how it went)
- Reflections and pivots (what worked, what didn't, what we changed)
- Meta observations (insights about using AI for job searching)

## How to Log

Given `$ARGUMENTS` as a description of what happened:

### Step 1: Read the current log
Read `/Users/godzillaaa/Documents/WEB_PROJECTS/jobsearch/journey/LOG.md` to understand context and avoid duplication.

### Step 2: Determine the entry details

From `$ARGUMENTS` and conversation context, determine:
- **Date:** Today's date (2026-02-15 format)
- **Phase:** One of: Setup, Research, Outreach, Interview, Decision, Reflection
- **What:** Concise description of what was done
- **Why:** The reasoning — what problem were we solving or what goal were we pursuing
- **How:** Tools, agents, methods, and specific approaches used
- **Outcome:** What resulted from this action
- **Decisions:** Key choices made. Include alternatives that were considered and why they were rejected
- **Reflection:** Honest assessment — what worked, what didn't, what we'd do differently

### Step 3: Write the entry

Append the entry to `/Users/godzillaaa/Documents/WEB_PROJECTS/jobsearch/journey/LOG.md` using this format:

```markdown
### [DATE] — [SHORT TITLE]

**Phase:** [Phase]
**What:** [Description]
**Why:** [Reasoning]
**How:** [Tools and methods]
**Outcome:** [Results]
**Decisions:**
- [Decision 1 and reasoning]
- [Decision 2 and reasoning]
**Reflection:** [Honest assessment]

---
```

### Step 4: Update the phase file (if significant)

For major milestones, also create or update a phase-specific file at:
`/Users/godzillaaa/Documents/WEB_PROJECTS/jobsearch/journey/[PHASE].md`

These phase files collect all entries for a given phase into a cohesive narrative, not just a list of entries. Write them in first person from Doug's perspective, as if telling the story.

## Writing Style

- Be specific, not generic. "Searched for music tech startups in Berlin" not "Did research"
- Capture the human element. This is Doug's story, not a system log
- Include numbers where possible. "Found 12 companies, 4 scored 4+/5"
- Note surprises and unexpected findings
- Be honest about what didn't work
- Write so that someone reading this 6 months later understands the full context

## What NOT to Log

- Routine file edits or code changes (unless they represent a strategic decision)
- Individual search queries (summarize the approach instead)
- Technical debugging (unless it reveals something about the process)
