---
name: eval
description: Evaluate article quality against targets defined in article.json. All thresholds are read from the spec, not hardcoded. Returns PASS or FAIL with specific issues.
allowed-tools: Read, Glob, Bash
---

# Article Quality Evaluation

Evaluate the article and return a quality verdict.

## Load Article State

1. Read `article.json` for targets, gates, and editorial standards
2. Read `output/article.md` for actual content
3. Read `progress.txt` for iteration history

**All thresholds come from article.json.** Do NOT use hardcoded values. The article's `content_type` and any custom word count have already been baked into the targets during PRD generation.

Extract these values from article.json:
- `targets.total_words` — the ideal word count
- `targets.minimum_words` — the minimum acceptable word count
- `targets.external_links` — required link count
- `targets.real_world_examples` — required example count
- `quality_gates.min_words_per_section` — minimum words per section
- `quality_gates.min_links_per_section` — minimum links per section
- `quality_gates.min_examples_total` — minimum examples total
- `editorial_standards.prose_ratio_minimum` — minimum prose ratio (as decimal, e.g., 0.7 = 70%)

## Quality Gates

### Gate 1: Word Count

Read targets from article.json:
- **Minimum**: `targets.minimum_words`
- **Target**: `targets.total_words`

```bash
# Count words in article.md
wc -w output/article.md
```

| Result | Verdict |
|--------|---------|
| < minimum_words * 0.75 | FAIL - Far below minimum |
| minimum_words * 0.75 to minimum_words - 1 | WARN - Below target |
| minimum_words to total_words - 1 | PASS - Meets minimum |
| >= total_words | PASS - Meets target |

### Gate 2: Section Completeness

All sections in `article.json` must have `status: "written"` with `word_count >= quality_gates.min_words_per_section`.

**Check each section:**
- [ ] Has content in article.md
- [ ] Meets `quality_gates.min_words_per_section`
- [ ] Has opening hook
- [ ] Has closing transition

| Result | Verdict |
|--------|---------|
| Any section missing | FAIL |
| Any section < min_words_per_section | FAIL |
| All sections complete | PASS |

### Gate 3: External Links

**Target**: `targets.external_links`

Count unique external URLs in article.md (not internal anchors).

| Result | Verdict |
|--------|---------|
| < target * 0.66 | FAIL - Needs more sources |
| target * 0.66 to target - 1 | WARN - Below target |
| >= target | PASS |

### Gate 4: Real-World Examples

**Target**: `targets.real_world_examples`

Look for concrete, named examples with:
- Named person, company, project, study, or organization
- External URL or verifiable reference
- Description of what happened, what they did, or what was found

These can be case studies, company examples, named projects, research findings, historical events, public figures — whatever fits the article's topic.

| Result | Verdict |
|--------|---------|
| < target * 0.5 | FAIL - Needs more examples |
| target * 0.5 to target - 1 | WARN - Below target |
| >= target | PASS |

### Gate 5: Prose Ratio

**Target**: `editorial_standards.prose_ratio_minimum` (e.g., 0.7 = 70%)

Count:
- Lines that are bullet points (`- ` or `* `)
- Lines that are numbered items (`1. `, `2. `, etc.)
- Lines in code blocks
- Lines in tables

Compare to total content lines.

| Result | Verdict |
|--------|---------|
| < target - 0.1 | FAIL - Too listicle-heavy |
| target - 0.1 to target - 0.01 | WARN - Below target |
| >= target | PASS |

**Common issues to flag:**
- Sections that are mostly bullet points
- Lists without surrounding narrative
- Concepts explained as bullets rather than paragraphs

### Gate 6: Header Style

**Target**: Conversational headers, NO double-barreled colon style

Scan all `##` and `###` headers for:
- Colons separating topic from description (BAD)
- Academic/formal phrasing (BAD)

**Patterns to FAIL:**
- "Finding Prospects: Where to Look and Who to Target"
- "Email Deliverability: The Technical Foundation"
- "Follow-Ups: Why They Matter and How to Write Them"

**Patterns that PASS:**
- "Where Good Prospects Hide"
- "The Technical Foundation Nobody Talks About"
- "Why Follow-Ups Close 70% of Deals"

| Result | Verdict |
|--------|---------|
| Any colon-split headers | FAIL |
| All conversational | PASS |

### Gate 7: Narrative Quality (Manual Check)

Review the article for:

**Opening (first ~200 words or first section):**
- [ ] Has a hook that creates curiosity
- [ ] Establishes why reader should care
- [ ] Promises specific value

**Flow:**
- [ ] Sections connect logically
- [ ] Transitions feel natural
- [ ] Building complexity (simple -> advanced)

**Closing:**
- [ ] Summarizes key insights
- [ ] Provides next steps
- [ ] Leaves reader empowered

### Gate 8: Summary Quality

Check the summary in article.json or article intro:
- [ ] Captures main value proposition
- [ ] Mentions key topics covered
- [ ] Would convince someone to read

## Evaluation Output

Create `eval-result.json`:

```json
{
  "evaluated_at": "timestamp",
  "content_type": "from article.json",
  "overall_verdict": "PASS|FAIL|WARN",
  "gates": {
    "word_count": {
      "target": "from article.json targets.total_words",
      "minimum": "from article.json targets.minimum_words",
      "actual": "N",
      "verdict": "PASS|FAIL|WARN"
    },
    "sections_complete": {
      "target": "all",
      "min_words_per_section": "from article.json quality_gates",
      "actual": "N of M",
      "verdict": "PASS|FAIL"
    },
    "external_links": {
      "target": "from article.json targets.external_links",
      "actual": "N",
      "verdict": "PASS|FAIL|WARN"
    },
    "real_world_examples": {
      "target": "from article.json targets.real_world_examples",
      "actual": "N",
      "verdict": "PASS|FAIL|WARN"
    },
    "prose_ratio": {
      "target": "from article.json editorial_standards.prose_ratio_minimum",
      "actual": "N%",
      "verdict": "PASS|FAIL|WARN"
    },
    "header_style": {
      "colon_headers_found": "N",
      "verdict": "PASS|FAIL"
    },
    "narrative_quality": {
      "hook": "PASS|FAIL",
      "flow": "PASS|FAIL",
      "closing": "PASS|FAIL",
      "verdict": "PASS|FAIL"
    }
  },
  "issues": [
    "Issue 1 description",
    "Issue 2 description"
  ],
  "recommendations": [
    "Add more examples in section X",
    "Strengthen transition between Y and Z"
  ]
}
```

## Verdict Logic

```
IF any gate is FAIL:
  overall_verdict = "FAIL"
  Article is NOT ready for completion

ELSE IF any gate is WARN:
  overall_verdict = "WARN"
  Article can complete but has quality gaps

ELSE:
  overall_verdict = "PASS"
  Article meets all quality standards
```

## Append to progress.txt

```
[timestamp] EVALUATION
======================
Content Type: [content_type]
Overall: [PASS/FAIL/WARN]

Word Count: N/[total_words target] [verdict]
Sections: N/M complete [verdict] (min [min_words_per_section] words each)
Links: N/[external_links target] [verdict]
Examples: N/[real_world_examples target] [verdict]
Prose Ratio: N% / [prose_ratio_minimum]% target [verdict]
Headers: [verdict]
Narrative: [verdict]

Issues:
- [issue 1]
- [issue 2]

Recommendations:
- [rec 1]
- [rec 2]

Decision: [COMPLETE / NEEDS REVISION]
======================
```

## Return Value

For use by Stop hook, output final line:

```
EVAL_RESULT: [PASS|FAIL|WARN]
```

If FAIL, the Stop hook should prevent completion and report issues.
If WARN, allow completion but note quality gaps.
If PASS, article meets all quality standards.
