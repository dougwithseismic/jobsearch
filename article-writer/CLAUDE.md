# article-writer - Editorial Standards

An autonomous agent for writing articles with deep research, real-world examples, and quality-gated completion. Supports multiple content types and custom word lengths.

## Content Types

The agent supports different content formats. Each has its own default targets, but word length can always be overridden:

| Type | Default Words | Sections | Links | Examples | Prose Ratio |
|------|--------------|----------|-------|----------|-------------|
| long-form | 10,000 | 8-12 | 30+ | 10+ | 70% |
| research | 8,000 | 6-10 | 40+ | 8+ | 75% |
| news | 1,500 | 3-5 | 8+ | 3+ | 80% |
| opinion | 3,000 | 4-6 | 10+ | 5+ | 80% |
| listicle | 3,000 | 5-15 | 15+ | 8+ | 40% |
| email | 1,000 | 2-4 | 3+ | 2+ | 85% |
| tutorial | 5,000 | 5-8 | 15+ | 5+ | 55% |
| case-study | 4,000 | 4-6 | 10+ | 3+ | 75% |
| reddit | 1,500 | 2-4 | 5+ | 3+ | 90% |

**Usage examples:**
- `/prd Topic Here` — long-form article (default)
- `/prd news: Breaking coverage of X` — news format with preset targets
- `/prd 4000 words: Deep dive into Y` — long-form at custom length
- `/prd tutorial 2000 words: How to build Z` — tutorial at custom length
- `/prd reddit: Why I switched from X to Y` — reddit post, authentic voice

Content type controls **format** (length, structure, quality gates). Article type controls **evidence** (technical, business, etc.) and is auto-detected from the topic.

## Quality Standards

Quality gates are set per-article in `article.json` based on content type and custom word count. The defaults for long-form are:

- **10,000+ words** (8,000 minimum)
- **30+ external links** with citations
- **10+ real-world examples** (named people, companies, studies, or projects)
- **70%+ prose ratio** (not bullet-heavy)
- **Conversational headers** (no colon-split academic style)
- **Strong narrative** - hook, flow, closing transitions
- **800+ words per section** minimum

All downstream skills read their targets from `article.json`, not hardcoded values.

## Article Type Awareness

The agent adapts to the topic. A technical article naturally includes code samples. A business strategy piece includes case studies. A cultural essay includes quotes and references. The PRD phase detects article type and sets appropriate per-section requirements.

## Editorial Philosophy

**Narrative over lists.** Readers come for insight, not bullet points. Every list needs surrounding prose that explains the "why" and connects ideas. Lists are punctuation, not the main text.

**Critical thinking over information dumps.** Don't just present facts—analyze them. Ask: Why does this matter? What's the trade-off? When would you NOT do this?

**Headers that flow.** NO double-barreled titles with colons.

- Bad: "Finding Prospects: Where to Look and Who to Target"
- Good: "Where Good Prospects Hide"

Headers should sound like something a smart friend would say, not academic paper sections.

## Narrative Arc

The narrative arc adapts to the content type. Long-form articles follow:

```
HOOK -> CONTEXT -> FOUNDATION -> DEEP DIVES -> PRACTICAL -> INSPIRATION -> ACTION
```

Shorter formats use condensed arcs (news: hook/context/details/impact, email: hook/value/cta, etc.). The PRD reads the appropriate arc from `templates/presets.json`.

## Writing Style

### Prose First
- Prose ratio target varies by content type (40% for listicles, 85% for emails)
- Weave information into narrative, don't just list it
- Every list needs setup prose and synthesis prose

### Voice
- Active voice, second person ("you")
- Specific over vague ("13% response rate" not "good results")
- Show then tell (example before explanation)
- Every claim needs a citation
- Real examples with links, not hypotheticals

### Headers
- Short, punchy, 3-7 words
- NO colons separating topic from description
- Conversational tone, not academic

## Research Standards

Research depth scales with content type:
- Long-form/Research: 10+ sources per section, 5+ search queries
- Tutorial/Case-study: 5-8 sources per section, 4+ search queries
- News/Opinion: 3-5 sources per section, 3+ search queries
- Reddit: 3 sources per section, 3+ search queries
- Email: 3 sources per section, 2+ search queries

## Project Structure

```
articles/[slug]/
├── article.json     # Spec, sections, progress, quality gates
├── progress.txt     # Learnings and iteration log
├── outline.md       # Detailed outline
├── research/        # Research notes per section
│   ├── sources.json
│   └── [section-id].md
└── output/
    └── article.md   # Final article
```

---

## Book Writing Skills

The agent also supports autonomous fiction writing, designed to preserve an author's voice while assisting with planning, drafting, editing, and ideation.

### Skills

| Skill | Purpose |
|-------|---------|
| voice | Extract a voice profile from a manuscript — prose markers, forbidden patterns, character POV filters, motifs, quality gates |
| ideas | Brainstorm plot, character, and scene ideas grounded in the manuscript's voice and open threads |
| chapter-plan | Create scene breakdowns with POV assignments, tension mapping, and continuity requirements |
| write-scene | Write a single scene in the author's voice, filtered through a specific character's consciousness |
| edit | Six-pass fiction editor — AI pattern detection, voice fidelity, POV consistency, continuity, prose tightening, scene assessment |
| book-writer | Autonomous orchestrator loop: VOICE → CHAPTER PLAN → WRITE SCENES → EDIT → EVAL |

### Usage

- `/voice mum.md` — Extract voice profile from manuscript, create book project
- `/ideas` — Broad brainstorm across characters and threads
- `/ideas Ruth and her mother` — Focused ideas for a specific relationship
- `/chapter-plan Annie crosses the road to help the young mother` — Plan a chapter from a brief
- `/write-scene chapter-3/scene-1` — Write a specific scene
- `/edit chapter-3` — Run the six-pass edit on a chapter
- `/book-writer` — Run the full autonomous loop

### Quality Philosophy

**Voice fidelity is the primary quality gate.** If it doesn't sound like the author, it fails. Zero tolerance for AI patterns — no "she felt a wave of", no "little did she know", no adverb clusters, no told emotions.

The voice profile (extracted from the actual manuscript, not a template) defines:
- What the author's prose sounds like (sentence patterns, paragraph habits, dialogue style)
- What the author never does (forbidden patterns — hard-fail list)
- How each character filters the world (POV-specific voice constraints)
- Recurring motifs and their thematic function

### Book Project Structure

```
books/[slug]/
├── voice-profile.json     # Central config (extracted from manuscript)
├── progress.txt           # Iteration log
├── manuscript.md          # Source manuscript
├── chapters/
│   └── chapter-N/
│       ├── plan.json      # Scene breakdowns
│       ├── scenes/*.md    # Individual scenes
│       ├── chapter.md     # Assembled chapter
│       └── edit-report.json
└── notes/
    ├── threads.json       # Unresolved plot threads
    ├── ideas.md           # Generated ideas
    └── continuity.json    # Character state tracking
```
