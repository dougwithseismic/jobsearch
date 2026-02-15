---
name: edit
description: Professional fiction editor with 6 passes. Checks AI pattern contamination, voice fidelity, POV consistency, continuity, prose tightening, and scene assessment. Assembles scenes into chapter.md.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Fiction Editor — Six-Pass Edit

Edit the chapter: **$ARGUMENTS**

## Purpose

Apply a professional fiction edit in six structured passes. This is not line editing for style preference — it is quality assurance against voice contamination, consistency failures, and prose weakness. Each pass has specific criteria and hard-fail conditions.

The editor's job is to protect the author's voice. If a passage doesn't sound like the manuscript, it gets flagged or rewritten.

## Arguments

- `$ARGUMENTS`: Chapter identifier (e.g., `chapter-3`)
- Operates on all scenes in `chapters/chapter-N/scenes/`

## Setup

### Step 1: Load All Scenes

Read every scene file in `books/[slug]/chapters/chapter-N/scenes/` in order.

### Step 2: Load Voice Profile

Read `books/[slug]/voice-profile.json` for:
- Forbidden patterns (Pass 1)
- Prose markers (Pass 2)
- Character profiles (Pass 3)
- Quality gates

### Step 3: Load Continuity

Read `books/[slug]/notes/continuity.json` for Pass 4.

### Step 4: Load Chapter Plan

Read `books/[slug]/chapters/chapter-N/plan.json` for scene intentions and requirements.

## The Six Passes

### Pass 1: AI Pattern Detection

**Hard-fail pass.** Scan every sentence for patterns on the forbidden list from voice-profile.json. This pass has zero tolerance.

**What to scan for:**

1. **Emotion-telling phrases** — Any instance of naming an emotion directly rather than showing it through action, sensation, or observation
   - "She felt sad/angry/relieved/hopeful"
   - "He was overcome with grief"
   - "A wave of emotion washed over her"
   - "Something stirred inside him"

2. **Purple prose markers** — Overwritten metaphors and stock literary language
   - "The weight of the world on her shoulders"
   - "Silence hung heavy in the air"
   - "Time seemed to stop/stand still"
   - "The world fell away"

3. **AI transition phrases** — Stock connective tissue that AI tends to generate
   - "Little did she know"
   - "Meanwhile"
   - "And that's when everything changed"
   - "She found herself..."
   - "If only she had known"

4. **Lazy constructions** — Shortcuts that avoid doing the actual writing work
   - Adverb clusters (three+ adverbs in proximity)
   - "Couldn't help but..."
   - "Something shifted between them"
   - Explaining subtext in narration

5. **All specific patterns from voice-profile.json `forbidden_patterns` array**

**Action:** For each flagged instance:
- Quote the offending passage
- Identify which forbidden pattern it matches
- Rewrite the passage to achieve the same effect through voice-appropriate means
- Log the fix

**Verdict:** FAIL if any forbidden patterns remain after this pass. Every instance must be resolved.

### Pass 2: Voice Fidelity

Compare the prose against the voice profile's prose markers. This pass ensures the writing sounds like the author, not like a competent AI approximation.

**Check against prose markers:**

1. **Sentence patterns** — Does the sentence length distribution match the manuscript? Are the clause structures consistent? Does the punctuation match the author's habits?

2. **Paragraph patterns** — Are paragraphs the right length? Do they open and close the way the author's do? Is single-sentence emphasis used the way the author uses it?

3. **Dialogue patterns** — Do tags match the author's preference? Is the beat frequency right? Do characters sound like themselves?

4. **Description patterns** — Is the sensory hierarchy correct? Is the detail level right? Does the prose use lists-in-prose the way the author does?

5. **Emotional rendering** — Is emotion shown the way the author shows it? Is the restraint level correct? Does interior monologue match the author's style?

**Action:** For passages that don't match the voice profile:
- Quote the passage
- Identify which prose marker it violates
- Rewrite to match the author's established patterns
- Log the change

**Verdict:** FAIL if significant voice deviations remain. Minor drift is a WARN.

### Pass 3: POV Consistency

Ensure each scene stays firmly inside its POV character's consciousness.

**Check:**

1. **No head-hopping** — The narrative never reveals another character's internal state. "She wondered what he was thinking" is fine. "He was thinking about lunch" from her POV is not.

2. **Character filter applied** — Does the POV character notice what they would notice? Does the prose reflect their specific sensory priorities from the voice profile?

3. **Vocabulary appropriate** — Is the register right for this character? Annie's sections shouldn't read like Drew's. Dorothy's fragments shouldn't sound like Ruth's measured restraint.

4. **Blind spots preserved** — Characters should NOT suddenly perceive things about themselves that the profile marks as blind spots. Annie doesn't recognize her own hypocrisy. Ruth doesn't see her own strength.

5. **Character-specific instructions followed** — Check the `writing_instructions` field in the voice profile for each POV character.

**Action:** Flag and fix any POV breaks. This is usually a rewrite, not a line edit.

**Verdict:** FAIL if head-hopping occurs. WARN for minor filter inconsistencies.

### Pass 4: Continuity Check

Verify the chapter against established facts from the manuscript and continuity tracker.

**Check:**

1. **Character states** — Are characters in the right physical and emotional state based on where we last left them?

2. **Setting details** — Do rooms, streets, objects match previous descriptions? If Annie's mug has a hairline crack, it still has a hairline crack.

3. **Timeline** — Does the time of day, season, and elapsed time make sense?

4. **Relationships** — Are character dynamics consistent with their last interaction?

5. **Objects and props** — Do significant objects appear where they should be? Drew's slippers. Annie's badge. Dorothy's letters.

**Action:** Flag contradictions. Fix anything that can be fixed with a word change. Flag larger issues that require scene-level revision.

**Verdict:** FAIL if factual contradictions exist. WARN for minor inconsistencies.

### Pass 5: Prose Tightening

Line-level editing to sharpen the prose without changing the voice.

**Operations:**

1. **Cut redundancy** — Remove words that don't earn their place. "She nodded her head" → "She nodded." "He stood up" → "He stood." (Only if the author's style favors economy.)

2. **Strengthen verbs** — Replace weak verb + adverb with a strong verb. "Walked quickly" → "hurried." (Only if the author uses strong verbs — check the profile.)

3. **Tighten dialogue** — Remove dialogue that restates what's already clear from action or context. Real people don't explain themselves completely.

4. **Sharpen images** — Where a description is vague, make it specific. "A nice day" → "A Tuesday in October with low cloud." (Match the author's specificity level.)

5. **Check rhythm** — Read sentences aloud (mentally). Do the rhythms work? Is there accidental meter? Unintended rhyme? Clunky consonant clusters?

**Constraint:** Do NOT tighten to the point where the voice changes. Some authors are naturally discursive. Some repeat for emphasis. The prose markers in the voice profile define what "tight" means for THIS author.

**Action:** Make edits directly. Log significant changes.

**Verdict:** This pass doesn't fail — it improves. Note the number and nature of edits made.

### Pass 6: Scene Assessment

Evaluate each scene as a unit of storytelling.

**Check:**

1. **Does something change?** Every scene should shift something — a relationship, an understanding, a situation, however small. If nothing changes, the scene is static.

2. **Is the tension present?** Both surface action and underneath subtext should be discernible. If you can only find one layer, the scene needs work.

3. **Does the opening earn attention?** Within the first 2-3 sentences, is the reader pulled in? Or is it throat-clearing?

4. **Does the closing resonate?** The last image, line, or beat should carry weight. Does it land?

5. **Does it serve the chapter?** How does this scene contribute to the chapter's overall purpose from the plan?

**Action:** Note strengths and weaknesses. Suggest specific fixes for scenes that don't meet criteria.

**Verdict:** FAIL if a scene is static (nothing changes). WARN for weak openings or closings.

## Assembly

After all six passes are complete on all scenes:

### Assemble `chapters/chapter-N/chapter.md`

Combine all scenes in order into a single chapter file. Include:
- Chapter title
- Scene breaks (use `* * *` or whitespace as appropriate to the author's style)
- Clean, final prose

### Create Edit Report

Write `chapters/chapter-N/edit-report.json`:

```json
{
  "chapter": "N",
  "edited_at": "YYYY-MM-DD",
  "overall_verdict": "PASS|FAIL|WARN",
  "passes": {
    "ai_pattern_detection": {
      "patterns_found": 0,
      "patterns_fixed": 0,
      "verdict": "PASS|FAIL"
    },
    "voice_fidelity": {
      "deviations_found": 0,
      "deviations_fixed": 0,
      "verdict": "PASS|FAIL|WARN"
    },
    "pov_consistency": {
      "breaks_found": 0,
      "breaks_fixed": 0,
      "verdict": "PASS|FAIL|WARN"
    },
    "continuity": {
      "contradictions_found": 0,
      "contradictions_fixed": 0,
      "verdict": "PASS|FAIL|WARN"
    },
    "prose_tightening": {
      "edits_made": 0,
      "words_cut": 0,
      "verdict": "IMPROVED"
    },
    "scene_assessment": {
      "scenes_assessed": 0,
      "scenes_pass": 0,
      "scenes_need_work": 0,
      "verdict": "PASS|FAIL|WARN"
    }
  },
  "issues_remaining": [
    "Any unresolved issues"
  ],
  "chapter_stats": {
    "total_words": 0,
    "scenes": 0,
    "pov_characters": []
  }
}
```

### Update Continuity

After editing, update `notes/continuity.json` with any new character states, setting details, or timeline advances from this chapter.

### Append to progress.txt

```
[timestamp] Phase: EDIT | Chapter: [N]
- Pass 1 (AI patterns): [N] found, [N] fixed — [PASS/FAIL]
- Pass 2 (Voice fidelity): [N] deviations — [PASS/FAIL/WARN]
- Pass 3 (POV consistency): [N] breaks — [PASS/FAIL/WARN]
- Pass 4 (Continuity): [N] issues — [PASS/FAIL/WARN]
- Pass 5 (Prose tightening): [N] edits, [N] words cut
- Pass 6 (Scene assessment): [N]/[N] scenes pass — [PASS/FAIL/WARN]
- Overall: [PASS/FAIL/WARN]
- Words: [N] total
- Next: [/book-writer or specific revision needed]
```

## Output Summary

After editing, report:
- Overall verdict (PASS/FAIL/WARN)
- Results per pass (1-line each)
- Total forbidden patterns found and fixed
- Total word count after tightening
- Any issues that need author input (can't be auto-resolved)
- Next step: If PASS, the chapter is ready. If FAIL, specific scenes need revision.
