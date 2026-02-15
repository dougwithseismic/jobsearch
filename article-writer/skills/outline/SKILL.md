---
name: outline
description: Generate a detailed article outline from completed research. Creates subsections with conversational headers (no colons) and prose-focused structure.
allowed-tools: Read, Write, Edit, Glob
---

# Article Outline Generator

Generate a detailed outline for the article with completed research.

## Setup

1. **Find Active Article**
   - Locate the most recent article in `articles/`
   - Read `article.json`
   - Verify research is complete for all sections (or at least the ones to outline)

2. **Read All Research**
   - Read each `research/[section-id].md` file
   - Read `research/sources.json` for source inventory

## Outline Process

For each section in `article.json`:

### 1. Analyze Research Content
- Identify main themes and concepts
- Note logical flow and dependencies
- Find the best examples and quotes to use

### 2. Create Subsection Structure

Each section should have 2-4 subsections with **conversational headers** (no colons):

**Bad headers:**
```
## Finding Prospects: Where to Look
### Subsection 1: Introduction to Prospecting
### Subsection 2: Tools and Techniques
```

**Good headers:**
```
## Where Good Prospects Hide
### The ICP Framework
### Tools That Actually Work
### Building Your First 100 Contacts
```

Headers should sound like something you'd say to a colleague, not academic paper sections.

### 3. Plan Media Placement
- Mark where YouTube embeds fit naturally
- Note where evidence blocks (data, quotes, visuals) should go
- Identify diagram opportunities (mermaid)

## Output

### 1. Create `articles/[slug]/outline.md`
```markdown
# Article Outline: [Title]

## Introduction
- Hook: [opening angle]
- Context: [why this matters now]
- Preview: [what reader will learn]

### Subsection: What is [Topic]
- Key point 1
- Key point 2
- [EMBED: YouTube video about basics]

## [Section 2 Title]
### Subsection: [Name]
- Point with [source citation]
- [EVIDENCE: key data point or quote]

### Subsection: [Name]
- Point
- [DIAGRAM: mermaid flowchart of process]

... continue for all sections ...

## Conclusion
- Key takeaways (3-5 bullets)
- Next steps for reader
- Call to action
```

### 2. Update article.json
Add `outline` field to each section:
```json
{
  "id": "section-id",
  "outline": {
    "subsections": ["Subsection 1", "Subsection 2"],
    "media_placements": ["youtube", "diagram"],
    "key_sources": ["source-url-1", "source-url-2"]
  }
}
```

### 3. Append to progress.txt
```
[timestamp] Outline completed
- Total subsections: N
- Media placements: N
- Ready for writing
```

## Completion

Summarize:
- Total subsections created
- Planned media embeds
- Next step: run `/write-section [first-section-id]`
