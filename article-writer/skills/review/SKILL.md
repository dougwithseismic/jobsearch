---
name: review
description: Fact-check, polish, and finalize the article. Verifies sources, fixes editorial issues (bullet-heavy sections, colon headers), and marks complete.
allowed-tools: Read, Write, Edit, Glob, WebSearch, WebFetch
---

# Article Review & Polish

Perform final review and polish of the article.

## Setup

1. **Load Article**
   - Read `articles/[slug]/article.json`
   - Read `articles/[slug]/output/article.md`
   - Read `articles/[slug]/research/sources.json`

## Review Checklist

### 1. Fact Verification
For each major claim:
- Cross-reference with sources
- Check if information is current (not outdated)
- Verify examples are accurately represented
- Flag anything that needs updating

If outdated info found:
- Use WebSearch to find current information
- Update the content with new citations

### 2. Source Quality Check
Verify all cited sources:
- Links are valid (not 404)
- Sources are authoritative
- Publication dates are recent enough
- No broken YouTube embeds

### 3. Readability Polish
- Ensure smooth transitions between sections
- Check for repetitive phrasing
- Verify consistent terminology
- Confirm specialized terms are explained on first use

### 4. Structure Review
- Introduction hooks the reader
- Each section has clear purpose
- Conclusion summarizes key points
- Call-to-action or next steps included

### 5. Formatting Check
- Consistent heading hierarchy
- Media embeds render properly
- No orphaned images or broken media

### 6. Editorial Style Check

**Headers:**
- NO double-barreled colon headers (e.g., "Topic: Explanation")
- Headers should flow conversationally
- Fix: "Finding Prospects: Where to Look" → "Where Good Prospects Hide"

**Prose-to-list ratio:**
- Target: 70% flowing prose, 30% structured elements
- If sections are bullet-heavy, rewrite bullets as paragraphs
- Lists need surrounding prose explaining the "why"

**Lists that need rewriting:**
Look for patterns like:
```
Benefits of X:
- Point 1
- Point 2
- Point 3
```
Rewrite as narrative paragraphs that explain WHY each point matters.

**Critical thinking:**
- Each section should analyze, not just list
- Add trade-offs, nuances, "when NOT to do this"
- Every claim should have a "why this matters"

## Improvements to Make

### Readability Enhancements
- Add transition sentences between sections
- Break up long paragraphs
- Add bullet points for lists of items
- Ensure any technical content is explained

### SEO/Discoverability
- Title is engaging and descriptive
- Summary captures key value
- Headings use natural language
- Tags are comprehensive

## Output

### 1. Update article.md
Apply all polish edits directly to the file.

### 2. Update article.json
```json
{
  "status": "complete",
  "completed_date": "YYYY-MM-DD",
  "final_word_count": N,
  "review_notes": "Brief summary of changes made"
}
```

### 3. Final progress.txt Entry
```
[timestamp] Article COMPLETE
- Final word count: N
- Sections: N
- Sources: N
- YouTube embeds: N
- Review notes: [summary of polish applied]

=== ARTICLE FINISHED ===
```

## Completion

Provide final summary:
- Article title
- Total word count
- Number of sources
- Number of media embeds
- Location: `articles/[slug]/output/article.md`

Congratulate on completed article!
