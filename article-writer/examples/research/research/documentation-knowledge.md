# Research Notes: Where LLMs Quietly Excel

## Documentation Generation
- LLMs can analyze complex codebases, providing clear summaries of function purpose/mechanics
- Drastically reduced time understanding new/existing projects
- Making onboarding and collaboration more efficient
- LLM-based doc generation can transform codebases into organized topic files
- Workflow-driven steps with state management for resumability
- [Source: Agent Skills, dev.to]

## Developer Onboarding
- Case study at LKS Next (IT consulting firm) using Action Design Research
- Prioritizing self-directed learning resources over burdening mentors
- Considerations around using third-party LLMs for proprietary code
- Structured documentation with predictable patterns improves LLM retrieval accuracy
- [Source: CSEE&T 2024 Industry Track]

## Atlassian's Findings (2025 State of DevEx)
- 99% of developers saving time using AI
- 68% save 10+ hours per week
- Dramatic shift from 2024 (only 38% reported time savings)
- Developers using saved time for: improving code, new features, documentation
- BUT: 50% lose 10+ hours/week to non-coding tasks
- 63% say leaders don't understand their pain points (up from 44%)
- 3,500 developers surveyed across 6 countries
- [Source: Atlassian DevEx Report 2025]

## Atlassian's AI Tools
- Rovo Chat: hybrid LLM approach (GPT, Claude, Gemini, Mistral, LLaMA)
- Rovo Dev CLI: ranked #1 on SWE-bench for real-world issue resolution
- PR reviews pull from internal documentation for coding standards and security policies
- [Source: Atlassian Engineering Blog]

## Stripe's AI Architecture
- Domain-specific foundation model for fraud detection
- Compliance investigation agents with decomposed architecture
- Built internal LLM proxy service on Amazon Bedrock
- Focus on security vetting and prompt caching
- [Source: Stripe Engineering Blog]

## Knowledge Transfer Benefits
- Documentation most impactful where it reduces information discovery time
- Top developer time-wasters: finding info (services, docs, APIs), adapting tech, context switching
- GitHub survey: 97% of 2000 developers used AI tools at work
- Documentation should include FAQs, troubleshooting, be generated from specs/code
- [Source: GitHub, Atlassian]

## Quality of LLM vs Human Documentation
- When documentation structured with predictable patterns, LLMs surface correct results
- New contributors benefit from same clarity and structure
- AI-generated docs need human review for accuracy on domain-specific content
- Best for: API documentation, code comments, README generation, changelog generation
