# Outline: How Large Language Models Are Reshaping Software Engineering Productivity

## Narrative Arc
HOOK (vendor promises vs reality) -> CONTEXT (measurement failures) -> FOUNDATION (what code gen actually does) -> DEEP DIVE x3 (debugging, documentation, hidden costs) -> ANALYSIS (organizational patterns) -> CONCLUSION (evidence-based strategy)

---

## 1. The Productivity Promise Nobody Has Verified (~800 words)
**Role**: Hook — create immediate tension between claims and evidence

### Opening hook
- GitHub Copilot generates 46% of code in enabled files, 15M developers, 88% retention rate
- Vendor headline: 55% faster task completion (GitHub), 21% faster (Google), 30% of new code AI-generated
- Immediate counter: METR 2025 RCT — experienced developers 19% SLOWER, with 39-point perception gap

### The adoption paradox
- Stack Overflow 2025: 84% adoption rate, but trust dropped to 29%
- Positive sentiment fell from 70%+ to 60%
- 66% frustrated by "almost right but not quite" outputs
- Companies investing billions based on metrics that may not measure what matters

### Thesis establishment
- Productivity impact is real but task-dependent
- Industry lacks rigorous measurement frameworks
- This article examines 40+ studies to find the actual evidence

### Transition to measurement section

---

## 2. How We Got the Metrics Wrong (~900 words)
**Role**: Context — explain why existing measurements mislead

### The measurement landscape
- SPACE framework (Forsgren et al., 2021): 5 dimensions, cannot be reduced to single metric
- DORA metrics: deployment frequency, lead time, change failure rate, MTTR
- How vendors cherry-picked: time-to-completion on isolated tasks

### The vendor measurement problem
- Self-contained tasks sacrificing realism for scale
- No prior context/familiarity required
- Algorithmic evaluation metrics missing important capabilities
- Developer self-reports unreliable (METR: 39-point gap)

### The DORA paradox
- AI adoption: 21% more tasks, 98% more PRs merged
- BUT: delivery throughput DOWN 1.5%, stability DOWN 7.2%
- Individual output up, organizational delivery flat

### Task shifting
- Cursor study (806 repos): transient velocity gains, persistent tech debt
- Bottlenecks shift from code writing to code review and testing
- Atlassian 2025: saving 10 hrs/week with AI, losing 10 hrs/week to non-coding friction

### Booking.com case: how good measurement works
- 3,500 engineers, partnered with DX platform
- 16% higher throughput for daily users
- Measuring satisfaction alongside throughput

---

## 3. What Code Generation Actually Speeds Up (~1100 words)
**Role**: Foundation — the granular evidence on where generation helps

### Acceptance rates reveal task boundaries
- By language: Java 57-61%, JavaScript 54%, Python 41%, C 29%
- By difficulty: Easy 89%, Medium 72%, Hard 43%
- By domain: Binary Tree 90%, Graph 49%

### Where quality holds
- Boilerplate and repetitive patterns: high acceptance, low error
- API integration: strong performance with known patterns
- Test scaffolding: useful starting point

### Where quality breaks down
- CodeRabbit report: AI PRs have 1.7x more issues (10.83 vs 6.45)
- 1.4x more critical issues in AI-generated code
- AI code simpler but prone to unused constructs, hardcoded debugging
- Conflicting vendor claims: GitHub says readability +3.62%, reliability +2.94%

### ZoomInfo enterprise case study
- 400+ developers, four-phase systematic deployment
- 33% acceptance rate, 20% for lines
- 72% satisfaction, ~20% time savings
- Limitation: lack of domain-specific logic

### Experience level matters
- Google RCT: newer developers 35-39% speedup, experienced 8-16%
- Microsoft: ~11 weeks to fully realize gains
- Initial productivity dip during ramp-up

### Test generation findings
- Effective for simple code, decreasing with complexity
- AI-generated tests lack semantic diversity
- Coverage-guided approaches (CoverUp) substantially improve

---

## 4. The Debugging and Maintenance Story (~1100 words)
**Role**: Deep dive — beyond generation into the full dev lifecycle

### Bug localization progress
- LLM approaches: token-level prediction then repair
- Separation of localization and fixing enables better context integration
- Agent-based systems show promise but need optimization

### Code review: the double-edged sword
- LLM automated review: 73.8% of comments resolved
- BUT: PR closure time increased from 5h52m to 8h20m
- Minor quality improvement reported by most practitioners

### Microsoft and Google adapt review processes
- Microsoft: internal AI review -> Copilot for PR Reviews (GA April 2025)
- Human-in-the-loop review flows
- Google: Gemini Code Assist as free PR reviewer
- Both handling ~30% AI-generated code

### The downstream burden
- Copilot-heavy PRs take 26% longer to review
- Senior dev original contributions dropped 19%
- Review workload increased 6.5%
- Salesforce: 30% code volume increase, PRs beyond 20 files

### Technical debt accumulation
- GitClear: code churn doubled since pre-AI baseline
- Refactoring dropped from 24.1% to 9.5%
- MIT professor quote on "credit card" for technical debt
- 67% spend more time debugging AI code than writing manually

### Legacy vs greenfield
- LLMs better for greenfield (less context needed)
- Poor on large existing codebases (METR finding)
- Google migration success: structured, repetitive tasks only

---

## 5. Where LLMs Quietly Excel (~1000 words)
**Role**: Deep dive — the underappreciated wins

### Documentation as the hidden multiplier
- LLMs excel at analyzing codebases and generating summaries
- Dramatically reduces time understanding new/existing projects
- Structured documentation improves LLM retrieval accuracy

### Atlassian's State of DevEx 2025
- 99% of developers saving time with AI
- 68% save 10+ hours per week (up from 38% in 2024)
- Top time-wasters: finding information, adapting tech, context switching
- BUT: 50% lose 10+ hours to non-coding tasks
- 63% say leaders don't understand their pain points

### Developer onboarding
- LKS Next case study: Action Design Research methodology
- Prioritizing self-directed resources over burdening mentors
- LLMs as onboarding accelerators for new team members

### Atlassian's AI tools in practice
- Rovo Chat: hybrid LLM approach across multiple models
- Rovo Dev CLI: #1 on SWE-bench for real-world issue resolution
- PR reviews pulling from internal documentation

### Stripe's approach
- Domain-specific foundation model for fraud detection
- Compliance investigation agents with decomposed architecture
- Internal LLM proxy service for security and management

### The information discovery opportunity
- 97% of developers used AI tools at work (GitHub survey)
- Documentation most impactful where it reduces search time
- AI-generated docs need human review for domain accuracy

---

## 6. The Costs That Don't Show Up in Benchmarks (~1100 words)
**Role**: Deep dive — the critical counterweight

### GitClear's longitudinal analysis
- 211 million changed lines (2020-2024)
- Code churn doubled vs 2021 baseline
- 41% higher churn in AI-generated code
- Copy/paste: 8.3% to 12.3% (48% increase)
- Refactoring: 24.1% to 9.5%
- 4x growth in code clones (2025 update)

### Security vulnerabilities
- Stanford (Boneh): AI users wrote less secure code, believed it more secure
- Veracode 2025: 45% of AI code had security flaws
- 100+ LLMs tested, Java 72% failure rate
- XSS 86% failure, Log Injection 88% failure
- Larger models NO better than smaller (systemic)

### The deskilling concern
- Developers worried about cognitive offloading
- Newer developers saw largest gains but most at-risk
- Effective AI use requires high skill ceiling (prompt engineering)
- Reduced team collaboration reported

### Code review burden escalation
- 10.83 issues per AI PR vs 6.45 human
- Senior devs: contributions down 19%, review workload up 6.5%
- Copilot PRs take 26% longer to review
- Salesforce: 30% volume increase

### The over-reliance trap
- METR: 39-point perception gap (believed faster, actually slower)
- Over-optimism about capabilities
- LLMs interfere with existing codebase knowledge
- Poor at tacit knowledge and context

---

## 7. What the Most Effective Teams Do Differently (~1100 words)
**Role**: Analysis — synthesis of success patterns

### Palo Alto Networks case study
- 2,000 developers, up to 40% productivity gain (avg 25%)
- Phased rollout: prototype -> 150 core devs -> 1000+
- Started with low-stakes, open-source projects
- Multi-vendor training: AWS, Anthropic, Sourcegraph

### The rollout pattern that works
- Start small, measure, expand
- Explicit task-type guidelines
- Training investment alongside tool investment
- Measurement at every stage

### Adapted code review processes
- Microsoft/Google: human-in-the-loop review flows
- Explicit policies for AI-generated code
- Review time budget adjustments

### Prompt engineering as organizational capability
- 72% of companies integrated AI, 74% struggle to scale value
- Prompt engineering market exploding ($280M -> $2.5B projected)
- Effective prompts handle 85% of heavy lifting
- Must be taught, not assumed

### Mentorship in the AI era
- Hybrid approach: AI tools + human guidance
- Senior devs define AI-acceptable vs manual-review boundaries
- Focus on uniquely human capabilities
- Junior+AI for routine; human mentorship for complexity

### Measurement done right
- Use SPACE/DORA across full lifecycle
- Monitor churn, duplication, security alongside speed
- Track satisfaction and trust metrics
- Booking.com model: DX platform partnership

---

## 8. Building an Evidence-Based LLM Strategy (~900 words)
**Role**: Conclusion — actionable synthesis

### Where evidence strongly supports adoption
- Boilerplate and repetitive code
- Documentation generation/maintenance
- Code migration (structured, repetitive)
- Onboarding and information discovery
- Test scaffolding

### Where evidence is mixed
- Complex algorithmic code
- Code review assistance
- Debugging
- Overall net productivity

### Where to proceed with caution
- Security-sensitive code (45% vulnerability rate)
- Junior developer sole reliance
- Architecture decisions on large codebases
- Domain-specific business logic

### A measurement framework for leaders
- Full-lifecycle measurement (not just generation speed)
- SPACE framework for multidimensional assessment
- Track downstream costs: churn, review time, defect rates
- Phased rollout with gates at each stage

### Open questions
- Long-term codebase maintainability
- Optimal task boundaries
- Second-order effects at organizational scale
- Architecture evolution impact
- Skill atrophy prevention

### What the next two years will reveal
- Movement toward agentic workflows
- Growing emphasis on non-coding tasks
- 50%+ AI-generated code at major companies
- Need for longitudinal studies across organizations
- Evidence-based adoption will separate leaders from laggards
