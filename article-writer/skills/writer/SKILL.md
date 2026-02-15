---
name: writer
description: Main autonomous loop for writing articles. Orchestrates research, writing, and quality evaluation until all gates pass. Reads all targets from article.json — supports any content type and word length.
allowed-tools: Read, Write, Edit, Glob, WebSearch, WebFetch
---

# Article Writer — Autonomous Loop

Write a complete, publication-ready article autonomously.

## Arguments

- No arguments: Continue work on the most recent article
- `$ARGUMENTS`: Specific article slug to work on

## Quality Targets

This loop runs until the article meets ALL quality gates **as defined in article.json**.

All targets are read from the article spec — there are no hardcoded thresholds. The PRD phase already set appropriate targets based on the content type and any custom word count.

Read these from `article.json`:
- `targets.total_words` and `targets.minimum_words`
- `targets.external_links`
- `targets.real_world_examples`
- `quality_gates.min_words_per_section`
- `quality_gates.min_links_per_section`
- `quality_gates.min_examples_total`
- `editorial_standards.prose_ratio_minimum`
- `research_config` (sources per section, search depth, video research)

## Editorial Standards

The article should read like a well-crafted piece appropriate to its content type, not a listicle dressed up with paragraphs. Key principles:

**Narrative over lists.** Every list needs surrounding prose explaining the "why". Lists are punctuation, not the main text. (Relaxed for listicle content type.)

**Critical thinking over information dumps.** Don't just present facts—analyze them. What's the trade-off? When would you NOT do this?

**Headers that flow.** NO double-barreled titles with colons. Use direct, conversational headers.

- Bad: "Finding Prospects: Where to Look and Who to Target"
- Good: "Where Good Prospects Hide"

**Don't add headers for headers' sake.** Articles should flow as continuous prose, not be chopped into dozens of micro-sections. Only use H3 subheadings when they serve a genuine structural purpose. Aim for 2-4 H3s per major section maximum.

## Pipeline

The pipeline adapts based on `content_type`:

**Full pipeline** (long-form, research, case-study):
```
RESEARCH (all sections) -> OUTLINE -> WRITE (section by section) -> EMBED MEDIA -> REVIEW -> EVAL
                                          ^                                           |
                                          +----------- REVISE IF EVAL FAILS ----------+
```

**Shortened pipeline** (email, news, reddit):
```
RESEARCH (all sections) -> WRITE (section by section) -> REVIEW -> EVAL
                                  ^                                  |
                                  +------ REVISE IF EVAL FAILS -----+
```

Skip OUTLINE for content types with fewer than 5 sections.
Skip EMBED MEDIA for email, news, and reddit content types.

## Execution Steps

### Step 1: Load State

```javascript
// Find active article
const articleDir = findMostRecent('articles/*/article.json')
const article = readJSON(articleDir)
const progress = read('progress.txt')
```

Determine current phase based on state. Log the content type and targets.

### Step 2: Phase Detection

```
IF not all sections have research_complete: true
   -> PHASE: RESEARCH
   -> Action: Research next incomplete section

ELSE IF outline.md does not exist AND targets.sections >= 5
   -> PHASE: OUTLINE
   -> Action: Generate detailed outline

ELSE IF any section has status !== "written" OR word_count < quality_gates.min_words_per_section
   -> PHASE: WRITING
   -> Action: Write next incomplete section

ELSE IF content_type NOT IN ["email", "news", "reddit"] AND article has unprocessed media placeholders
   -> PHASE: EMBED
   -> Action: Process media embeds

ELSE IF status !== "reviewed"
   -> PHASE: REVIEW
   -> Action: Review and polish

ELSE
   -> PHASE: EVAL
   -> Action: Run quality evaluation
```

### Step 3: Execute Phase

#### RESEARCH Phase

For each section without `research_complete: true`:
1. Load section scaffold and research questions
2. Execute at least `research_config.search_queries_min` WebSearch queries
3. Find `research_config.sources_per_section` sources per section
4. Find examples matching section's `required_elements.examples_minimum`
5. Write comprehensive research notes
6. Update article.json

**Quality check before moving on (from article.json):**
- Sources meet `research_config.sources_per_section`
- Examples meet section requirements
- Evidence appropriate to article type collected

#### OUTLINE Phase

Skip if `targets.sections < 5` (short-form content doesn't need a separate outline).

1. Read all research notes
2. Create detailed outline with:
   - Section flow and transitions
   - Key points to cover
   - Example placements
   - Evidence locations
3. Write `outline.md`

#### WRITING Phase

For each section without `status: "written"` or `word_count < quality_gates.min_words_per_section`:

1. Load research notes and outline (if exists)
2. Read previous sections for continuity
3. Write to the section's `word_target`, meeting at minimum `word_minimum`:
   - Strong opening hook (no "In this section...")
   - Prose ratio meeting `editorial_standards.prose_ratio_minimum`
   - Real examples woven into narrative
   - Evidence with context and analysis
   - Conversational headers (no colons)
   - Smooth transition to next section
4. Update article.json with word count

**Quality check before moving on (from article.json):**
- Word count >= section's `word_minimum`
- Prose ratio >= `editorial_standards.prose_ratio_minimum`
- Links >= section's `required_elements.external_links_minimum`
- Examples >= section's `required_elements.examples_minimum`
- Headers conversational

#### EMBED Phase

Skip for email and news content types.

1. Scan for `<!-- YOUTUBE: -->` placeholders
2. Search for relevant videos
3. Generate responsive embed HTML
4. Add mermaid diagrams where helpful

#### REVIEW Phase

1. Read full article for flow
2. Check prose-to-list ratio against `editorial_standards.prose_ratio_minimum`
3. Verify headers flow naturally (fix colon-heavy titles)
4. Remove excessive H3 subheadings
5. Check all links work
6. Verify factual accuracy
7. Strengthen transitions
8. Polish opening and closing
9. Mark as reviewed

#### EVAL Phase

Run quality evaluation. ALL thresholds from article.json:

```
GATES (all values from article.json):
- Word count >= targets.minimum_words
- All sections >= quality_gates.min_words_per_section
- External links >= targets.external_links
- Real-world examples >= targets.real_world_examples
- Prose ratio >= editorial_standards.prose_ratio_minimum
- Headers conversational (no colons)
- Narrative quality (hook, flow, closing)
```

If ANY gate fails:
1. Identify specific gaps
2. Return to appropriate phase
3. Loop continues

If ALL gates pass:
1. Article is complete
2. Output final summary

### Step 4: Progress Tracking

After EVERY action, update progress.txt:

```
[timestamp] Phase: [phase] | Section: [section-id]
- Action: [what was done]
- Metrics: words=N, links=N, examples=N, prose_ratio=N%
- Status: [PASS/FAIL for quality checks]
- Next: [what comes next]
```

### Step 5: Loop Control

**Continue if:**
- Any quality gate not met (per article.json targets)
- Any section incomplete
- Research gaps exist
- Prose ratio below target
- Headers need fixing

**Complete when all article.json targets are met:**
- All sections written (>= min_words_per_section each)
- Total words >= minimum_words
- Links >= external_links target
- Examples >= real_world_examples target
- Prose ratio >= prose_ratio_minimum
- Headers verified
- Narrative verified
- EVAL returns PASS

## Output on Completion

```
=============================================
ARTICLE COMPLETE
=============================================

Title: [title]
Type: [article_type] | Format: [content_type]
Location: articles/[slug]/output/article.md

Quality Metrics (targets from article.json):
- Word count: N / [total_words] target
- Sections: N complete (all [min_words_per_section]+ words)
- External links: N / [external_links] target
- Real-world examples: N / [real_world_examples] target
- Prose ratio: N% / [prose_ratio_minimum]% minimum
- Headers: Conversational (no colons)
- Narrative: Strong hook, flow, closing

The article is ready for publication!
=============================================
```

## Error Handling

If a phase fails repeatedly:
1. Log the error
2. Note specific blocker
3. Attempt alternative approach
4. If still blocked, report to user

## Key Principles

1. **Quality over speed** — Don't rush through phases
2. **Prose over bullets** — Write paragraphs, not listicles (unless it IS a listicle)
3. **Rich examples** — Every claim needs evidence
4. **Real-world grounding** — Name specific people, companies, studies
5. **Strong narrative** — Story, not just information
6. **Critical thinking** — Analyze, don't just list
7. **No shortcuts** — Every gate must pass
8. **Trust the spec** — All targets come from article.json, not hardcoded values
