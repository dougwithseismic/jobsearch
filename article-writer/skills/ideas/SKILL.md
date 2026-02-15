---
name: ideas
description: Brainstorm plot developments, character arcs, scene suggestions, and thematic explorations. Reads voice profile, open threads, and continuity state to generate grounded, voice-aware ideas.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Ideas Generator

Brainstorm ideas for: **$ARGUMENTS**

## Purpose

Generate creative ideas grounded in the manuscript's existing voice, characters, threads, and themes. Every idea must feel like it belongs in THIS book — not a generic suggestion that could apply to any story.

Ideas are cheap. Good ideas that respect the author's voice and serve the existing narrative are rare. That's what this skill produces.

## Arguments

- No arguments: Generate a broad set of ideas across characters, threads, and themes
- `$ARGUMENTS`: Focus area — can be a character name, thread ID, relationship, theme, or chapter concept

**Examples:**
- `/ideas` — broad brainstorm across the whole manuscript
- `/ideas Annie` — ideas focused on Annie's arc
- `/ideas the buried letter` — ideas exploring Dorothy's secret
- `/ideas Ruth and her mother` — relationship development ideas
- `/ideas chapter 3` — ideas for what could happen next

## Setup

### Step 1: Load Voice Profile

Read `books/[slug]/voice-profile.json` for:
- Character profiles and their current states
- Open threads and planted seeds
- Motifs and thematic patterns
- The author's voice constraints (what NOT to suggest)

### Step 2: Load Context

Read from `books/[slug]/notes/`:
- `threads.json` — unresolved plot threads
- `continuity.json` — current character and setting states
- `ideas.md` — previously generated ideas (avoid repeats)

Read the manuscript itself if needed for specific reference.

## Idea Generation

### For Each Idea, Provide:

```markdown
### [Short evocative title]

**Characters:** [who's involved]
**Thread:** [which open thread this develops, if any]
**Emotional core:** [what the scene is really about underneath]

**The idea:**
[2-3 paragraphs describing what happens, not as a plot summary but as a narrative
possibility. What's the surface action? What's happening underneath? Where does
the tension live?]

**Potential scenes:**
- [Scene 1: brief description with POV character]
- [Scene 2: brief description with POV character]

**Voice considerations:**
[How this idea works with the author's established voice. Which character's
POV would carry it best? What sensory details would ground it? What needs to
stay understated?]

**Risks:**
[What could go wrong with this idea — how it could feel forced, betray a
character, or break the established tone]
```

### Idea Categories

When generating a broad brainstorm, cover these categories:

**Thread developments** — Where could existing open threads go? What would complicate them? What would bring them closer to resolution?

**Character pressure** — What events or revelations would put pressure on a character's current coping strategy? What would force them to change?

**Relationship shifts** — What could change the dynamic between two characters? A shared experience? A confession? A misunderstanding? A kindness?

**Motif deepening** — How could existing motifs appear in new contexts? What scene would give a motif new meaning?

**Structural possibilities** — What scenes would create parallel or contrast between characters? What POV switch would reveal something the reader doesn't know?

**The quiet moments** — Not every idea needs to be a turning point. What small, observational scenes would deepen character without advancing plot?

## Quality Standards

**Every idea must:**
- Be grounded in what already exists in the manuscript
- Respect the author's voice (no ideas that would require writing the author can't do)
- Serve character over plot (this is literary fiction, not thriller plotting)
- Identify subtext — what's the scene really about underneath the surface action
- Consider which POV character would best carry it
- Acknowledge risks and potential pitfalls

**Ideas must NOT:**
- Suggest dramatic events that don't match the manuscript's register (no car chases in domestic literary fiction)
- Propose dialogue that sounds nothing like the characters
- Ignore continuity (suggesting scenes that contradict established facts)
- Be generic (ideas should be specific to THESE characters in THIS world)
- Resolve threads too neatly — life doesn't wrap up cleanly and neither should this book
- Suggest forbidden voice patterns ("she felt a wave of realization...")

## Output

### Write to `notes/ideas.md`

Append new ideas with a timestamp header:

```markdown
---
## Ideas Generated [YYYY-MM-DD]
Focus: [broad / character name / thread / etc.]

[ideas here]

---
```

### Append to progress.txt

```
[timestamp] Phase: IDEAS | Focus: [focus area]
- Generated: [N] ideas
- Threads developed: [list]
- Characters explored: [list]
- Next: [suggested next step]
```

## Output Summary

After generating ideas, report:
- Number of ideas generated
- Which threads they develop
- Which characters they explore
- Top 2-3 strongest ideas (brief summary)
- Suggested next step: `/chapter-plan [brief based on strongest idea]`
