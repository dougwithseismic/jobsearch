# article-writer

An autonomous article-writing agent for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). Give it a topic and a format, and it researches, writes, and self-edits until the article passes every quality gate — no hand-holding required.

Handles everything from 500-word email newsletters to 10,000+ word deep dives across 8 content types, each with its own research depth, narrative arc, and quality standards.

## Install

Requires [Claude Code](https://docs.anthropic.com/en/docs/claude-code) v1.0.33 or later.

```shell
# Add the marketplace
/plugin marketplace add dougwithseismic/article-writer

# Install the plugin
/plugin install article-writer@article-writer
```

For local development:

```bash
claude --plugin-dir ./article-writer
```

## Usage

Just tell Claude what you want to write. It will pick the right content type, research depth, and quality targets automatically.

```
Write me a long-form article about the state of AI agents in 2025

Write a short news piece covering the latest React Server Components release

I need a tutorial on building a RAG pipeline with LangChain, around 3000 words

Write an email newsletter summarizing this week's AI tool launches
```

The agent figures out the content type from your description and runs the full pipeline — research, outline, write, embed media, review, evaluate — looping until all quality gates pass.

### Slash commands

Under the hood, the plugin exposes skills you can call directly if you want more control:

| Command | What It Does |
|---------|-------------|
| `/article-writer:prd [topic]` | Creates the article spec |
| `/article-writer:research [section-id]` | Deep research for one section |
| `/article-writer:outline` | Builds a detailed outline from research |
| `/article-writer:write-section [section-id]` | Writes one section |
| `/article-writer:embed-media` | Finds YouTube videos and generates diagrams |
| `/article-writer:review` | Fact-checks and polishes |
| `/article-writer:eval` | Runs quality gates (PASS/WARN/FAIL) |
| `/article-writer:writer` | The autonomous loop — runs the full pipeline |

The `prd` command accepts an optional content type and word count prefix:

```
/article-writer:prd news: Topic here
/article-writer:prd tutorial 3000 words: Topic here
```

But most of the time, just describe what you need in plain English and let the agent handle the rest.

## Content Types

| Type | Words | Sections | Links | Examples | Prose | Best For |
|------|------:|:--------:|------:|---------:|------:|----------|
| `long-form` | 10,000 | 8-12 | 30+ | 10+ | 70% | Comprehensive guides, deep dives |
| `research` | 8,000 | 6-10 | 40+ | 8+ | 75% | Data-driven analysis, whitepapers |
| `tutorial` | 5,000 | 5-8 | 15+ | 5+ | 55% | Step-by-step walkthroughs |
| `case-study` | 4,000 | 4-6 | 10+ | 3+ | 75% | Company or project deep dives |
| `opinion` | 3,000 | 4-6 | 10+ | 5+ | 80% | Argument-driven essays |
| `listicle` | 3,000 | 5-15 | 15+ | 8+ | 40% | Curated lists with context |
| `news` | 1,500 | 3-5 | 8+ | 3+ | 80% | Timely coverage, announcements |
| `email` | 1,000 | 2-4 | 3+ | 2+ | 85% | Newsletters, email campaigns |

Setting a custom word count scales all other targets proportionally.

**Content type** controls format — length, structure, quality gates, narrative arc. **Article type** controls evidence — code samples for technical topics, revenue data for business, etc. Article type is auto-detected from the topic. These two axes are independent: a "technical tutorial" and a "technical long-form" gather the same evidence but produce completely different formats.

## Pipeline

The agent adapts its pipeline to the content type.

**Long-form, research, case-study, tutorial:**
```
RESEARCH -> OUTLINE -> WRITE -> EMBED MEDIA -> REVIEW -> EVAL
                         ^                                  |
                         +------ REVISE IF EVAL FAILS ------+
```

**Email, news, opinion, listicle:**
```
RESEARCH -> WRITE -> REVIEW -> EVAL
              ^                  |
              +-- REVISE IF FAIL +
```

Short formats skip the outline (fewer than 5 sections) and media embedding.

## Quality Gates

Every article is evaluated against targets set during the PRD phase. All thresholds live in `article.json` and scale with your content type and word count — nothing is hardcoded.

| Gate | What It Checks |
|------|---------------|
| Word count | Total words >= `targets.minimum_words` |
| Section completeness | Each section meets its word minimum |
| External links | Unique URLs >= `targets.external_links` |
| Real-world examples | Named people, companies, studies >= `targets.real_world_examples` |
| Prose ratio | Flowing prose vs bullet lists >= `editorial_standards.prose_ratio_minimum` |
| Header style | No double-barreled colon headers |
| Narrative quality | Hook, flow, and closing all present |

If any gate fails, the writer loop identifies the gaps and revises automatically.

## Article Structure

Each article gets its own directory:

```
articles/[slug]/
  article.json       # Spec, targets, sections, quality gates
  progress.txt       # Iteration log
  outline.md         # Detailed outline (long formats only)
  research/
    sources.json     # All sources with metadata
    [section-id].md  # Research notes per section
  output/
    article.md       # Final article
```

## Customization

**Presets** — Edit `templates/presets.json` to change defaults for any content type or add new ones. Each preset defines word targets, section ranges, research depth, editorial rules, and the narrative arc template.

**Per-article overrides** — The PRD populates `article.json` from presets (scaled by custom word count). You can edit `article.json` directly to fine-tune any target for a specific article.

## Examples

The `examples/` directory contains complete article specs for all 8 content types, with research, outlines, and finished articles you can reference.

## Hooks

- **Stop** — Evaluates article quality before the agent completes. Reads all thresholds from `article.json`.
- **PreToolUse (WebSearch)** — Logs search queries during research.
- **PostToolUse (Write)** — Reports word count when `article.md` is updated.

## License

MIT
