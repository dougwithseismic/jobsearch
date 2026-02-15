# Research Notes: Building an Evidence-Based LLM Strategy

## Measurement Frameworks
- SPACE framework (5 dimensions) most comprehensive for LLM productivity assessment
- DX platform used by Booking.com for real-world measurement
- DORA metrics show gap between individual output and organizational delivery
- Need full-lifecycle measurement, not just code generation speed
- [Source: ACM Queue, getdx.com, DORA]

## Consensus Findings: Where LLMs Clearly Help
- Boilerplate code generation (high acceptance, low error rates)
- Documentation generation and maintenance
- Code migration/transformation (Google: 75% AI-written, 50% productivity gain)
- Test scaffolding and simple test generation
- Information discovery and codebase exploration
- Onboarding acceleration (Atlassian: 99% time savings reported)
- Routine/repetitive task automation
- API integration patterns

## Mixed Evidence Areas
- Complex algorithmic code (acceptance drops to 43.4% for hard problems)
- Code review assistance (73.8% comments resolved, but PR time increased)
- Debugging (promise shown but effectiveness varies)
- Overall net productivity (Google: +21%, METR: -19%)
- Code quality (vendor claims improvement, independent studies show more issues)

## Proceed with Caution Areas
- Security-sensitive code (45% vulnerability rate - Veracode)
- Junior developer sole reliance (deskilling risk)
- Architecture decisions on large codebases
- Domain-specific business logic
- Any context requiring tacit knowledge

## Open Research Questions
- Long-term impact on codebase maintainability (longitudinal data needed)
- Optimal task boundaries for AI assistance
- Measurement of second-order effects at organizational scale
- Impact on software architecture evolution
- Best practices for preventing skill atrophy
- How to maintain code review rigor at increased volume

## Expert Predictions (Next 2-3 Years)
- Addy Osmani: AI becoming standard part of development workflow
- Google: heading toward 50%+ AI-generated code
- Meta: predicts AI writing majority of code soon
- Replit: agent-first development becoming mainstream
- Industry: shift from code generation to full agentic workflows
- Growing emphasis on AI for non-coding tasks (information discovery, documentation)

## Recommended Framework for Leaders
1. Measure with SPACE/DORA across full lifecycle
2. Start with high-ROI, low-risk tasks (documentation, boilerplate, testing)
3. Phased rollout with measurement at each stage
4. Invest in prompt engineering training
5. Adapt code review processes explicitly for AI-generated code
6. Protect junior developer learning with hybrid mentorship
7. Monitor code quality metrics (churn, duplication, security)
8. Set task-type guidelines for AI appropriateness
