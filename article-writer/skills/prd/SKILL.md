---
name: prd
description: Generate a comprehensive article specification. Creates detailed scaffolding with narrative beats, word targets, and example requirements. Supports multiple content types and custom word lengths.
allowed-tools: Read, Write, Glob, WebSearch
---

# Article PRD Generator

Generate a comprehensive article specification for: **$ARGUMENTS**

## Argument Parsing

Parse the arguments to extract content type, custom word count, and topic:

**Supported formats:**
- `/prd Topic Here` — defaults to long-form, preset word count
- `/prd news: Topic Here` — uses news preset
- `/prd tutorial: Topic Here` — uses tutorial preset
- `/prd 4000 words: Topic Here` — long-form at custom 4000 words
- `/prd news 2000 words: Topic Here` — news format at custom 2000 words
- `/prd 1500 words email: Topic Here` — email format at custom 1500 words

**Parsing rules:**
1. Look for a known content type keyword: `long-form`, `research`, `news`, `opinion`, `listicle`, `email`, `tutorial`, `case-study`, `reddit`
2. Look for a word count pattern: `N words` or `Nk words` (e.g., `4000 words`, `4k words`)
3. Everything after the colon (`:`) is the topic. If no colon, everything is the topic.
4. If no content type specified, default to `long-form`
5. If no word count specified, use the preset's default

## Load Presets

Read `templates/presets.json` to get the preset for the detected content type.

**If a custom word count was specified**, scale the preset targets proportionally:
- `total_words` = custom word count
- `minimum_words` = custom word count * 0.8
- `sections` = scale proportionally from preset (minimum 2)
- `external_links` = scale proportionally (minimum 3)
- `real_world_examples` = scale proportionally (minimum 2)
- `min_words_per_section` = total_words / section_count
- `sources_per_section` = scale proportionally (minimum 3)

**Scaling formula**: `scaled_value = round(preset_value * (custom_words / preset_total_words))`

Example: If the `news` preset has `external_links: 8` at `total_words: 1500`, and you specify `3000 words`, then `external_links = round(8 * 3000/1500) = 16`.

## Target Output

Targets come from the preset (possibly scaled by custom word count):

- **Word target** from preset `targets.total_words`
- **Section count** from preset `targets.sections_min` to `targets.sections_max`
- **Examples and links** from preset targets
- **Narrative flow** — story arc from preset `narrative_arc`
- **Prose ratio** from preset `editorial.prose_ratio_minimum`

## Article Type Detection

Before scaffolding, determine the article type. This shapes what "evidence" looks like:

| Type | Primary Evidence |
|------|-----------------|
| Technical | Code samples, documentation, repos, benchmarks |
| Business/Strategy | Case studies, revenue data, company examples |
| Marketing/Growth | Campaign results, conversion data, tool comparisons |
| Opinion/Analysis | Research papers, expert quotes, historical precedent |
| Tutorial/How-To | Step-by-step walkthroughs, screenshots, before/after |
| Cultural/Trend | Quotes, surveys, cultural artifacts, timelines |

Set `article_type` in article.json. This tells downstream skills what kinds of evidence to prioritize.

Note: `article_type` (topic/evidence) is independent from `content_type` (format/length). A "technical tutorial" uses technical evidence in tutorial format. A "business news" article uses business evidence in news format.

## Editorial Philosophy

The PRD sets the tone. If the scaffolding encourages bullet-heavy writing, the article will be bullet-heavy. Build narrative thinking into the structure from the start.

**Headers that flow:** Avoid double-barreled academic titles like "Finding Prospects: Strategies for Success". Use direct, conversational headers: "Where Good Prospects Hide" or "Building Your First 100 Contacts".

**Critical thinking prompts:** Each section scaffold should include a "why it matters" question, not just "what to cover".

## Your Task

### Step 1: Topic Research

Quick WebSearch to understand:
- Current state of the topic (2025-2026)
- Key players, people, companies, and examples
- Common pain points and solutions
- What makes this topic interesting NOW

### Step 2: Define the Narrative Arc

Use the narrative arc from the content type preset. Different formats have different arcs:

**Long-form**: `HOOK -> CONTEXT -> FOUNDATION -> DEEP DIVES -> PRACTICAL -> INSPIRATION -> ACTION`
**News**: `HOOK -> CONTEXT -> DETAILS -> IMPACT -> NEXT-STEPS`
**Email**: `HOOK -> VALUE -> CTA`
**Tutorial**: `HOOK -> PREREQUISITES -> FOUNDATION -> WALKTHROUGH -> ADVANCED -> WRAP-UP`
**Case Study**: `HOOK -> BACKGROUND -> CHALLENGE -> APPROACH -> RESULTS -> LESSONS`
**Reddit**: `HOOK -> CONTEXT -> SUBSTANCE -> HONEST-TAKE`

Map sections to the arc from `templates/presets.json` for the chosen content type.

### Step 3: Create Section Scaffolding

For EACH section, define:

```json
{
  "id": "section-slug",
  "title": "Short Punchy Title",
  "priority": 1,
  "status": "pending",
  "research_complete": false,
  "word_target": 0,
  "word_minimum": 0,
  "narrative_role": "from preset narrative_arc",
  "required_elements": {
    "examples_minimum": 2,
    "external_links_minimum": 3,
    "evidence_types": ["case study", "data point", "expert quote"]
  },
  "scaffold": {
    "opening_hook": "One compelling sentence that pulls reader in",
    "central_argument": "The main insight this section delivers",
    "key_questions": [
      "Why does this matter?",
      "What's the trade-off or nuance?",
      "When would you NOT do this?"
    ],
    "example_types": ["company case study", "named person", "research finding"],
    "closing_bridge": "Natural transition to next section"
  },
  "research_questions": [
    "Specific question 1?",
    "Specific question 2?",
    "What are the best real-world examples?"
  ]
}
```

**Word targets per section**: Distribute `total_words` across sections. Each section's `word_target` should be approximately `total_words / section_count`, but weight deep-dive sections heavier and intro/conclusion lighter.

**Section `word_minimum`**: Use the preset's `quality_gates.min_words_per_section`.

**Title Guidelines:**
- NO colons separating concept from description
- 3-7 words, conversational tone
- Should sound like something you'd say to a colleague

Good: "Where Good Prospects Hide"
Bad: "Finding Prospects: Strategies and Techniques"

Good: "The Foundation Nobody Talks About"
Bad: "Email Deliverability: Technical Setup and Best Practices"

### Step 4: Identify Example Requirements

For each deep-dive section, specify:
- **Real-world examples** to feature (actual companies, people, events)
- **Evidence** appropriate to the article type (code for technical, data for analytical, case studies for business)
- **Comparisons** (before/after, old vs new approach)

Scale the example requirements based on the content type. An email needs 2 examples total. A long-form article needs 10+.

### Step 5: Create Article Directory

```bash
mkdir -p articles/[slug]/{research,output,drafts}
```

### Step 6: Write article.json

```json
{
  "topic": "Original topic",
  "slug": "url-slug",
  "article_type": "technical|business|marketing|opinion|tutorial|cultural",
  "content_type": "long-form|research|news|opinion|listicle|email|tutorial|case-study",
  "title": "Compelling Title That Promises Value",
  "subtitle": "More specific description of what reader learns",
  "summary": "3-4 sentence executive summary covering: the problem, the solution, what reader will learn, why it matters now",
  "status": "draft",
  "created": "YYYY-MM-DD",
  "custom_word_count": null,
  "targets": {
    "total_words": "from preset (or custom)",
    "minimum_words": "from preset (or custom * 0.8)",
    "sections": "from preset sections_min-sections_max range",
    "external_links": "from preset (scaled if custom words)",
    "real_world_examples": "from preset (scaled if custom words)"
  },
  "editorial_standards": {
    "prose_ratio_minimum": "from preset editorial.prose_ratio_minimum",
    "max_consecutive_bullets": "from preset editorial.max_consecutive_bullets",
    "header_style": "conversational, no colons"
  },
  "narrative_arc": {
    "hook": "Why this matters now",
    "tension": "The problem/challenge",
    "resolution": "How to solve it",
    "transformation": "What reader becomes capable of"
  },
  "sections": [],
  "quality_gates": {
    "min_words_per_section": "from preset quality_gates",
    "min_links_per_section": "from preset quality_gates",
    "min_examples_total": "from preset quality_gates",
    "narrative_flow_check": true,
    "prose_ratio_check": true
  },
  "research_config": {
    "sources_per_section": "from preset research.sources_per_section",
    "search_queries_min": "from preset research.search_queries_min",
    "include_video_research": "from preset research.include_video_research"
  },
  "sources": [],
  "metadata": {
    "target_audience": "Description of who this is for",
    "reading_time": "from preset reading_time_estimate",
    "depth": "from preset depth",
    "tags": []
  }
}
```

All values labeled "from preset" must be populated from `templates/presets.json` for the chosen `content_type`, scaled if a custom word count was given.

### Step 7: Initialize progress.txt

```
# Article Progress Log
Topic: [topic]
Type: [article_type]
Format: [content_type]
Target: [total_words]+ words
Created: [date]

## Quality Gates
- [ ] All sections meet word minimums ([min_words_per_section]+)
- [ ] [external_links]+ external links
- [ ] [real_world_examples]+ real-world examples
- [ ] Narrative flow verified
- [ ] Prose ratio [prose_ratio_minimum]%+ (not bullet-heavy)
- [ ] Headers conversational (no colons)

## Iterations
```

## Output Summary

After creating the PRD, report:
- Article title and subtitle
- Content type and article type detected
- Custom word count (if specified) or preset default
- Number of sections with word targets
- Total target word count
- Key examples to feature
- Narrative arc summary
- Next step: `/research [first-section-id]`

## Quality Standard

This PRD sets the bar. Thin scaffolding produces thin sections. Invest time here to define:
- Compelling hooks and natural bridges
- Critical thinking questions (not just "what to cover")
- Concrete example requirements appropriate to the topic
- Headers that flow conversationally

A good PRD makes writing 10x easier.
