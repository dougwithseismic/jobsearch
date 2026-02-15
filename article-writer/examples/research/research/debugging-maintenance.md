# Research Notes: The Debugging and Maintenance Story

## LLM Debugging Effectiveness
- LLMs show promise in automated bug localization and repair
- Approaches: token-level bug location prediction, then bug fixing with different LLMs
- Separation of bug localization and fixing enables better integration of diverse context
- Fault localization accuracy evaluated at file and line levels
- Dynamic reproduction capabilities still limited
- Agent-based systems need optimization in both LLM and agentic flow design
- [Source: ACM 10.1145/3660773, arXiv 2411.10213]

## Code Review Impact
- LLM-based automated review: 73.8% of comments resolved
- BUT: average PR closure time increased from 5h52m to 8h20m
- Most practitioners reported minor improvement in code quality
- LLM tools useful for bug detection, quality awareness, best practices
- Automated Code Review benchmarks often fail to reflect real-world complexity
- [Source: arXiv 2505.16339, arXiv 2404.18496]

## Microsoft's AI-Powered Code Review
- Internal AI review gave early exposure for rapid iteration
- Insights defined experiences like inline suggestions and human-in-the-loop flows
- Led to GitHub Copilot for Pull Request Reviews (GA April 2025)
- Focus: review quality, usability, developer trust
- [Source: Microsoft Engineering Blog]

## Google's AI Code Review
- Gemini Code Assist integrated into GitHub as PR reviewer
- Produces instant PR summaries
- Flags potential bugs and deviations from best practices
- Suggests code changes
- Available at no charge
- [Source: Google/Gemini documentation]

## Code Review Burden (Downstream Costs)
- Copilot-heavy PRs take 26% longer to review
- AI-specific issues: inappropriate pattern usage, architectural misalignment
- 67% of developers spend more time debugging AI-generated code
- 68% spend more time resolving security vulnerabilities
- Senior dev original code contributions dropped 19%
- Senior dev code review workload increased 6.5%
- Salesforce: 30% code volume increase, PRs beyond 20 files and 1000 lines
- [Source: CodeRabbit, HelpNetSecurity, Salesforce Engineering]

## Technical Debt from AI-Generated Code
- Cursor adoption study (806 repos): transient velocity gains, persistent tech debt
- Self-reinforcing cycle: productivity surges to maintenance burdens
- MIT professor: "AI is like a brand new credit card for accumulating technical debt"
- GitClear: code churn doubled since pre-AI baseline
- Refactoring activity dropped from 24.1% to 9.5% of changed lines
- [Source: arXiv 2511.04427, GitClear 2025]

## Legacy Code vs Greenfield
- LLMs better for greenfield (less context needed)
- Poor performance on large existing codebases (METR finding)
- Tacit knowledge and context poorly handled
- Google migration success: AI wrote 75% of migration code, but task was highly structured/repetitive
