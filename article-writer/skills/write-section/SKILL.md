---
name: write-section
description: Write a comprehensive article section with strong narrative prose, real examples, and inline citations. Reads word targets and prose ratio from article.json. Prioritizes flowing text over bullet lists.
allowed-tools: Read, Write, Edit, Glob, WebFetch
---

# Section Writer

Write the section: **$ARGUMENTS**

## Editorial Philosophy

**Narrative over lists.** Readers come for insight, not bullet points. Every list needs surrounding prose that explains the "why" and connects ideas. Lists are punctuation, not the main text.

**Critical thinking over information dumps.** Don't just present facts—analyze them. Ask: Why does this matter? What's the trade-off? When would you NOT do this? The best sections make readers think, not just note-take.

**Headers that flow.** Avoid double-barreled titles with colons like "Finding Prospects: Where to Look and Who to Target". Instead, use direct, punchy headers: "Where the Good Prospects Hide" or "Building Your First 100 Contacts".

## Setup

1. **Load Section Context**
   - Read `article.json` for section scaffold, `article_type`, and `content_type`
   - Read the section's `word_target` and `word_minimum` — these are the targets for THIS section
   - Read `editorial_standards.prose_ratio_minimum` — this is the prose ratio target
   - Note the `narrative_role` (hook, context, foundation, deep-dive, practical, inspiration, action, etc.)
   - Review research questions to answer

2. **Load Research**
   - Read `research/[section-id].md`
   - Identify the strongest examples, quotes, and data
   - Find the narrative thread—what story does this section tell?

3. **Review Previous Sections** (if not first)
   - Read `output/article.md` for voice continuity
   - Plan a natural bridge from the previous section

## Writing Standards

All targets come from `article.json` — do NOT use hardcoded values:

- **Word target**: from section's `word_target` field
- **Word minimum**: from section's `word_minimum` field (fallback to `quality_gates.min_words_per_section`)
- **Prose ratio**: from `editorial_standards.prose_ratio_minimum`
- **Examples per section**: from section's `required_elements.examples_minimum`
- **Links per section**: from section's `required_elements.external_links_minimum` (fallback to `quality_gates.min_links_per_section`)
- **Prose-first** — build narrative, use lists sparingly
- **Evidence** introduced with context, followed by analysis
- **Inline citations** for claims
- **Headers that read naturally** — no colon-heavy academic style

## Content Type Adaptations

Adjust your writing approach based on the `content_type` in article.json:

**Email/Newsletter**: Get to the point fast. Short paragraphs. One clear CTA. Conversational and direct. No lengthy preambles.

**News**: Inverted pyramid — most important info first. Tight prose. Quote sources. Stay factual and timely.

**Listicle**: Each item gets a punchy header and supporting prose. Lists are expected but each item still needs narrative context.

**Tutorial**: Step-by-step clarity. Code samples with context. "Here's what we're building" before diving in. Check comprehension between steps.

**Opinion**: Strong thesis statements. Acknowledge counterarguments. Build an argument, not just a list of claims.

**Reddit**: Write like a real person posting to a subreddit. First person. No corporate voice, no buzzwords, no "leverage" or "game-changer" anywhere. Be direct, honest, and specific. Acknowledge limitations and downsides — reddit will call you out if you don't. Skip formal headers unless the post is long enough to need them. When you use headers, keep them dead casual. No emoji spam. The tone is "someone who actually knows what they're talking about sharing it plainly."

**Long-form/Research/Case-study**: Full narrative treatment as described in the writing process below.

## Writing Process

### Step 1: The Opening

Start mid-action or with a concrete scenario. Never start with "In this section, we'll cover..."

Scale the opening length to the section size:
- Short sections (under 500 words): 1-2 sentences
- Medium sections (500-800 words): 1 short paragraph
- Full sections (800+ words): 1-2 paragraphs (100-150 words)

**Strong openings:**
- Scenario: "Marco sent 300 emails. Three months later, he'd closed $15,000 in consulting work."
- Problem: "Your perfectly crafted email means nothing if it lands in spam."
- Contrast: "In 2020, the playbook worked. By 2026, the same approach gets you ignored."
- Provocative: "Most people who 'try' this approach do it wrong and give up too quickly."

The first paragraph should make the reader lean in.

### Step 2: Building the Body

**Write in prose paragraphs, not bullet cascades.**

When you have 5 related points, don't write 5 bullets. Write 2-3 paragraphs that weave those points into a coherent argument. Use a list only when you're presenting truly parallel items (like a tool comparison or a step-by-step checklist).

**The prose-to-list ratio:** Check `editorial_standards.prose_ratio_minimum` from article.json. If the target is 70%, aim for 70% flowing prose and 30% structured elements. If the target is 40% (listicle), lists are more acceptable but still need surrounding context.

**Pattern for deep explanations:**

1. State the insight in one clear sentence
2. Explain why it matters (1-2 paragraphs)
3. Give a concrete example (real person, company, or study)
4. Show the nuance or trade-off
5. Connect to what comes next

**Example of prose over bullets:**

DON'T do this:
```
Benefits of follow-ups:
- Increases response rates by 21%
- 70% of responses come from emails 2-4
- Shows persistence
- Gives multiple chances to catch them at the right time
```

DO this:
```
Follow-ups aren't optional—they're where deals actually close. The data
is striking: a single follow-up increases response rates by 21%, and
three follow-ups can push that number to 50%. Most responses don't
come from your first email at all. According to research from Lemlist,
70% of positive responses arrive on the second, third, or fourth touch.

The psychology makes sense. Decision-makers are buried in email. Your
first message might arrive during a crisis, a meeting, or simply a
bad morning. Following up isn't pestering—it's giving them another
chance to engage when the timing is better.
```

### Step 3: Adding Examples and Evidence

Weave examples into the narrative. Don't isolate them in boxes.

**Good example integration:**
```
Take Marco Massaro's campaign. He targeted smaller companies where he'd
work directly with decision makers, personalized each email with specific
observations about their websites, and implemented systematic follow-ups.
His results? A 9% initial response rate that jumped to 13% after follow-ups—
and a $15,000 consulting project closed within three months.

The key insight from Marco's approach isn't volume. It's precision. He
didn't blast 5,000 generic emails. He sent 300 thoughtful ones to the
right people.
```

**When including technical evidence (code, data tables, etc.):**
```
Introduce with context explaining what the reader is about to see.

[evidence block]

Follow with analysis explaining what it means and why it matters.
```

### Step 4: Headers That Flow

**Avoid:**
- "Email Deliverability: The Technical Foundation Nobody Talks About"
- "Finding Prospects: Where to Look and Who to Target"
- "Follow-Ups: Why They Matter and How to Write Them"

**Use instead:**
- "The Technical Foundation Nobody Talks About"
- "Where the Good Prospects Hide"
- "Why Follow-Ups Close 70% of Deals"

Headers should sound like something a smart friend would say, not like academic paper sections.

### Step 5: The Closing

End with momentum. Bridge to what's next without the phrase "In the next section..."

Scale closing length to section size:
- Short sections: 1 sentence transition
- Medium sections: 1-2 sentences
- Full sections: 1 short paragraph (100-150 words)

**Strong closings:**
- Insight landing: "So the secret isn't magic—it's doing the boring work that everyone skips."
- Bridge: "Getting the foundation right is step one. But what you do next matters more."
- Call to small action: "Before you do anything else, get this one thing set up. It takes an hour and determines everything that follows."

### Step 6: Polish

Before finishing, check against article.json targets:
- [ ] Word count meets section's `word_minimum`
- [ ] Prose ratio meets `editorial_standards.prose_ratio_minimum`
- [ ] All claims have citations
- [ ] Headers read naturally (no colon-heavy titles)
- [ ] Transitions feel organic
- [ ] Read aloud—does it flow?

## Header Guidelines

**Section headers (## level):**
Short, punchy, curiosity-inducing. 3-7 words ideal.

- "The 2026 Landscape" not "The Cold Outreach Landscape in 2026: What Changed"
- "Where Prospects Hide" not "Finding Prospects: Strategies and Techniques"
- "Templates That Actually Work" not "Email Templates: Examples and Best Practices"

**Subsection headers (### level):**
Can be slightly longer but should still flow conversationally.

- "Why Most People Give Up Too Early"
- "The Sweet Spot Nobody Talks About"
- "What the Free Plan Actually Includes"

## Lists: When and How

**Use lists for:**
- Step-by-step processes (numbered)
- Tool comparisons (tables preferred)
- Checklists (checkbox format)
- Truly parallel items where scanning helps

**Don't use lists for:**
- Explaining concepts (use prose)
- Making arguments (use prose)
- Showing cause and effect (use prose)
- Anything that needs "why" explanations

**When you do use lists:**
- Introduce with a sentence explaining what follows
- Follow with a sentence synthesizing the key insight
- Never end a section on a bullet point

## Output

### 1. Append to `output/article.md`

Write in final publication format with natural headers.

### 2. Update article.json

Mark section as written with word count and link count.

### 3. Append to progress.txt

Log completion with quality metrics.

## Quality Gates

Section FAILS if:
- Under the section's `word_minimum` (from article.json)
- Prose ratio below `editorial_standards.prose_ratio_minimum`
- Double-barreled colon headers
- Lists without surrounding prose
- Missing citations
- Weak opening or closing
- Reads like an outline rather than an article

## Voice

- Active voice: "Follow-ups increase response rates" not "Response rates are increased by follow-ups"
- Second person: "You'll find that..." not "One finds that..."
- Present tense: "This approach works" not "This approach worked"
- Specific over vague: "13% response rate" not "good response rate"
- Conversational but informed: Write like a knowledgeable friend explaining over coffee

## Completion

Report:
- Word count (vs target from article.json)
- Prose-to-list ratio (vs target from article.json)
- Links included
- Quality assessment
- Next step: `/write-section [next]` or `/embed-media`
