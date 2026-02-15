---
name: research
description: Deep research for an article section. Scales research depth based on article.json targets. Gathers sources, finds real-world examples, collects supporting evidence, and identifies case studies.
allowed-tools: Read, Write, WebSearch, WebFetch, Glob
---

# Section Research Agent

Research the section: **$ARGUMENTS**

## Setup

1. **Load Article Context**
   - Read `article.json` to find section matching `$ARGUMENTS`
   - Note the section's `scaffold`, `required_elements`, and `research_questions`
   - Understand the `narrative_role` (hook, foundation, deep-dive, etc.)
   - Check `article_type` to know what kinds of evidence to prioritize
   - Check `content_type` to understand the format
   - **Read `research_config`** for this article's research depth settings:
     - `sources_per_section` — how many sources to gather
     - `search_queries_min` — minimum number of search queries
     - `include_video_research` — whether to search for videos

2. **Review What's Needed**
   - Word target for this section (from section's `word_target`)
   - Required examples and links (from section's `required_elements`)
   - Specific research questions to answer
   - Research depth from `research_config`

## Research Standards

All targets come from `article.json` — do NOT use hardcoded values:

- **Sources per section**: from `research_config.sources_per_section`
- **Examples per section**: from section's `required_elements.examples_minimum`
- **Search queries**: at least `research_config.search_queries_min`
- **Supporting evidence** appropriate to the article type
- **Expert quotes** where available
- **Contrasting viewpoints** if they exist

## Research Process

### Phase 1: Broad Search

Run at least `research_config.search_queries_min` search queries. Scale up for deeper articles.

```
Query patterns:
- "[topic] 2025 2026" - Recent content
- "[topic] guide" - Educational content
- "[topic] examples" - Real implementations
- "[topic] best practices" - Expert recommendations
- "[topic] case study" - Real-world applications
- "[topic] vs [alternative]" - Comparisons
- "[topic] research data statistics" - Hard evidence
- "[topic] expert opinion" - Authority voices
```

For shorter formats (email, news), focus on the most relevant 2-3 query patterns. For long-form and research articles, use all patterns and add topic-specific queries.

### Phase 2: Find Real-World Examples

Search specifically for examples matching the section's `required_elements.examples_minimum`:
- **Named companies** that succeeded or failed with this approach
- **Named people** (founders, practitioners, experts) with relevant stories
- **Research studies** with concrete findings and data
- **Case studies** with measurable outcomes
- **Historical examples** or precedents
- **Conference talks or interviews** with practitioners

For each example found, note:
- Name (person, company, study) and URL
- What makes it notable
- Specific details, numbers, or outcomes
- Why it matters for the article's argument

### Phase 3: Deep Dive (WebFetch)

For the most promising sources (scale to article depth):
- **Long-form/Research**: Fetch 5+ top sources
- **Tutorial/Case-study**: Fetch 3-4 top sources
- **News/Opinion**: Fetch 2-3 top sources
- **Email**: Fetch 1-2 top sources

For each:
- Fetch full content
- Extract key insights, not just summaries
- Pull exact quotes with attribution
- Note any data/statistics
- Gather evidence appropriate to the article type

### Phase 4: Topic-Specific Evidence

Based on `article_type` in article.json, prioritize gathering:

| Article Type | Evidence to Prioritize |
|-------------|----------------------|
| Technical | Code samples, documentation, benchmarks, repo examples |
| Business | Revenue figures, growth metrics, strategy breakdowns |
| Marketing | Campaign results, conversion data, channel comparisons |
| Opinion | Research papers, expert positions, counterarguments |
| Tutorial | Step-by-step processes, tool comparisons, common pitfalls |
| Cultural | Quotes, surveys, trend data, cultural artifacts |

### Phase 5: Video/Media Content

**Only run this phase if `research_config.include_video_research` is true.**

Search for relevant videos:
- Conference talks (often have unique insights)
- Interviews with practitioners
- Documentary-style explorations of the topic

Note: Title, URL, timestamp of key moments, why it's valuable

## Output Files

### 1. Research Notes: `research/[section-id].md`

Structure your notes for easy writing:

```markdown
# Research: [Section Title]

## Executive Summary
3-4 sentences capturing the most important findings for this section.

## Key Insights (for narrative)
1. **Insight with hook potential**: [explanation with source]
2. **Surprising finding**: [explanation with source]
3. **Common misconception**: [what people get wrong]

## Real-World Examples

### [Example Name 1]
- **URL**: [link]
- **What happened**: [description]
- **Key detail**: [specific numbers, outcomes, or quotes]
- **Why it's notable**: [what makes this a good example]

### [Example Name 2]
... continue for required number of examples ...

## Supporting Evidence

### [Evidence piece 1]
- **Source**: [url]
- **Type**: [data/quote/case study/code sample]
- **Content**: [the actual evidence]
- **Context**: [how to use this in the article]

## Expert Quotes
> "Quote that captures key insight"
> — [Name], [Role] at [Company] ([Source](url))

## Statistics & Data
- [Stat 1 with source]
- [Stat 2 with source]

## Video Resources
- **[Video Title](url)** - [Why it's valuable, key timestamp]

## Contrasting Views (if any)
- View A: [perspective with source]
- View B: [alternative perspective with source]

## Questions Answered

### Q: [Research question 1]
**A:** [Detailed answer with citations]

### Q: [Research question 2]
**A:** [Detailed answer with citations]

## Raw Sources
| Title | URL | Type | Key Value |
|-------|-----|------|-----------|
| ... | ... | doc/blog/video | ... |
```

### 2. Update sources.json

Append comprehensive source data:

```json
{
  "section": "section-id",
  "researched_at": "timestamp",
  "sources": [
    {
      "title": "Source Title",
      "url": "https://...",
      "type": "documentation|blog|video|research|case-study|interview",
      "authority": "high|medium",
      "key_quotes": ["quote 1", "quote 2"],
      "accessed": "YYYY-MM-DD"
    }
  ],
  "examples": [
    {
      "name": "Example Name",
      "url": "https://...",
      "description": "What it is",
      "relevance": "Why include in article"
    }
  ]
}
```

### 3. Update article.json
- Set `research_complete: true`
- Add discovered sources to main sources array

### 4. Append to progress.txt
```
[timestamp] Research: [section-id]
- Sources: N (target: [sources_per_section from research_config])
- Examples found: N (target: [examples_minimum from section])
- Key insight: [one sentence]
- Research quality: [PASS/NEEDS MORE]
```

## Quality Check

Before marking complete, verify against `article.json` targets:
- [ ] Sources gathered meets `research_config.sources_per_section`
- [ ] Examples found meets section's `required_elements.examples_minimum`
- [ ] Evidence appropriate to article type collected
- [ ] Research questions answered with citations
- [ ] Enough material to write the section's `word_target`

If any check fails, do more research before completing.

## Completion

Summarize:
- Sources gathered (vs target from article.json)
- Examples found (vs target from article.json)
- Evidence collected
- Research quality assessment
- Next step: `/research [next-section]` or `/outline` when all done
