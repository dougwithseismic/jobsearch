# Research Notes: What Code Generation Actually Speeds Up

## Acceptance Rates by Language
- Java: highest at 57.7-61%
- JavaScript: 54.1%
- Python: 41.0%
- C: 29.7%
- Overall acceptance rate: 27-30% (varies by context)
- Higher acceptance during non-working hours (less complex tasks)
- [Source: arXiv 2501.13282, GitHub stats]

## Acceptance Rates by Task Difficulty
- Easy problems: 89.3% correctness
- Medium problems: 72.1% correctness
- Hard problems: 43.4% correctness
- By domain: Binary Tree problems 90.1%, Graph problems 49.5%
- [Source: ACM research]

## Defect Rates: AI vs Human
- AI-generated PRs: 10.83 issues avg vs 6.45 for human PRs (1.7x more)
- AI PRs contain 1.4x more critical issues, 1.7x more major issues
- AI code simpler and more repetitive but prone to unused constructs
- Human code has greater structural complexity, different maintainability issues
- Conflicting evidence: some studies show GPT-4 with advanced prompts outperforms human code
- [Source: CodeRabbit report, arXiv 2508.21634, arXiv 2508.00700]

## GitHub Copilot Code Quality (Vendor Claims)
- Readability improved 3.62%
- Reliability improved 2.94%
- Maintainability improved 2.47%
- Conciseness improved 4.16%
- 13.6% more lines without readability errors
- 5% more likely to be approved in code review
- 84% increase in successful builds
- [Source: GitHub Blog]

## ZoomInfo Enterprise Deployment
- 400+ developers evaluated
- Four-phase systematic deployment
- 33% suggestion acceptance rate, 20% for lines of code
- 72% developer satisfaction
- ~20% time savings reported
- Limitations: lack of domain-specific logic, inconsistent quality
- [Source: arXiv 2501.13282]

## Where AI Excels vs Struggles

### Strong performance:
- Boilerplate and repetitive code
- Simple algorithms and data structures
- API integration patterns
- Test scaffolding
- Documentation generation

### Weak performance:
- Complex algorithmic problems
- Architecture decisions
- Domain-specific business logic
- Security-sensitive code
- Large codebase navigation

## Test Generation
- LLMs effective for simple code test generation
- Effectiveness decreases with code complexity
- AI-generated tests lack semantic diversity
- CoverUp (coverage-guided) substantially improves state of art
- Useful for test scaffolding but manual review still needed
- [Source: MDPI, arXiv research]

## Developer Experience Impact
- Microsoft: ~11 weeks for developers to fully realize productivity gains
- Initial productivity dip during ramp-up period
- Ramp-up investment often overlooked in ROI calculations
