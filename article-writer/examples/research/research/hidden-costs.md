# Research Notes: The Costs That Don't Show Up in Benchmarks

## GitClear Code Quality Analysis
- 211 million changed lines analyzed (2020-2024)
- Code churn doubled compared to 2021 pre-AI baseline
- AI-generated code: 41% higher churn rate than human-written code
- Copy/pasted lines surged from 8.3% (2020) to 12.3% (2024) — 48% increase
- Refactored ("moved") lines dropped from 24.1% (2020) to 9.5% (2024)
- Changed lines associated with refactoring: 25% (2021) to <10% (2024)
- 4x growth in code clones (2025 update)
- [Source: GitClear 2024 and 2025 reports]

## Security Vulnerabilities

### Stanford (Dan Boneh's team)
- AI assistant users wrote significantly less secure code
- Users with AI more likely to believe their code was secure (false confidence)
- Users who trusted AI less and engaged more with prompts had fewer vulnerabilities
- Conclusion: AI assistants should be viewed with caution
- [Source: Stanford EE, arXiv 2211.03622]

### Veracode 2025 Report
- 45% of AI-generated code had security flaws
- 100+ LLMs tested across Java, JavaScript, Python, C#
- 80 code completion tasks with known CWE vulnerability potential
- Java: 72% security failure rate (riskiest language)
- Cross-Site Scripting (CWE-80): 86% failure rate
- Log Injection (CWE-117): 88% failure rate
- SQL Injection (CWE-89): 20% failure rate
- Larger models NO better than smaller models (systemic issue)
- [Source: Veracode GenAI Code Security Report 2025]

## Junior Developer Deskilling
- Developers worried about skill loss from AI reliance
- Concerns about cognitive offloading and reduced collaboration
- Newer developers saw largest speed gains (35-39%) but also most at risk
- Effective AI use requires prompt engineering skill (high learning ceiling)
- METR: "one dev with >50h of Cursor experience saw speedup" — suggesting high skill floor
- [Source: arXiv 2507.03156, METR study]

## Code Review Burden
- AI-generated PRs: 10.83 issues vs 6.45 human (1.7x more)
- 1.4x more critical issues, 1.7x more major issues
- Copilot-heavy PRs take 26% longer to review
- Senior developers' original code contributions dropped 19%
- Senior devs' review workload increased 6.5%
- Salesforce: 30% code volume increase from AI adoption
- [Source: CodeRabbit, HelpNetSecurity, Salesforce Engineering]

## Over-Reliance Effects
- METR: developers estimated 20% speedup, actual result 19% slowdown
- Causes: over-optimism about LLM capabilities, interference with existing knowledge
- Poor LLM performance on large codebases
- Low reliability of generated code
- LLMs do very poorly using tacit knowledge and context
- [Source: METR 2025]

## Technical Debt Cycle
- Cursor study (806 repos): velocity gains transient, tech debt persistent
- Self-reinforcing cycle: initial surges to maintenance burdens
- Dampens future development velocity
- MIT: "AI is like a brand new credit card for accumulating technical debt"
- 67% of devs spend more time debugging AI code than writing manually
- [Source: arXiv 2511.04427, Harness State of Software Delivery 2025]
