# Research Notes: What the Most Effective Teams Do Differently

## Palo Alto Networks Case Study
- 2,000 developers onboarded in 3 months
- Up to 40% productivity increase, average 25%
- Used Sourcegraph Cody + Anthropic Claude 3.5 Sonnet + Amazon Bedrock
- **Phased rollout**: prototype (1 month) -> 150 core developers (2 months) -> 1000+
- Started with low-stakes, open-source code projects
- **Training**: AWS (AI training), Anthropic (prompt engineering workshops), Sourcegraph (Cody sessions)
- [Source: AWS Case Study]

## Booking.com Case Study
- 3,500 engineers
- Partnered with DX for measurement
- 16% higher code throughput for daily AI users
- Developer satisfaction rose 15 points in 6 months
- "Equivalent of a senior engineer sitting beside them"
- AI users redirected time savings to higher-value work
- [Source: getdx.com]

## Microsoft/Google Adapted Review Processes
- Microsoft: internal AI review -> GitHub Copilot for PR Reviews (GA April 2025)
- Defined inline suggestions and human-in-the-loop review flows
- Google: Gemini Code Assist as PR reviewer, instant summaries, bug flagging
- Both companies: ~30% of new code is AI-generated
- Both adapted review processes for AI-specific issues
- [Source: Microsoft Engineering Blog, Google]

## Effective Integration Patterns

### From practitioner research (22 practitioners):
- Benefits: maintaining development flow, improving mental models, fostering entrepreneurship
- Key: implementation approach matters more than technology selection
- Structured frameworks achieve faster time-to-value
- [Source: arXiv 2511.06428]

### Six-Step Decision Framework:
1. Initial assessment of LLM potential
2. Pilot projects with high-ROI, data-ready use cases
3. Iterative scope expansion (prompt engineering -> RAG -> fine-tuning)
4. Proactive security and monitoring from inception
5. Internal expertise development
6. MLOps maturity requirements
- [Source: EmergentMind]

## Prompt Engineering Training Impact
- 72% of companies integrated AI into at least one business function (2024)
- 74% still struggling to achieve and scale AI value
- Prompt engineering market: $280M (2024) -> projected $2.5B (2032)
- Effective prompts: 85% of the heavy lifting in many cases
- Techniques: zero-shot, few-shot, chain-of-thought, meta, self-consistency
- [Source: DextraLabs, Google Cloud]

## Organizational Factors for Success
- Explicit code review policies for AI-generated code
- Structured prompt engineering practices
- Task-type guidelines for when to use LLM assistance
- Adapted mentorship models for junior engineers
- Measurement using SPACE/DORA frameworks, not just speed metrics
- Small batch sizes and robust testing still fundamental
- [Source: DORA report, multiple studies]

## Junior Developer Mentorship Adaptation
- Hybrid approach: AI tools + human guidance
- Senior devs define where AI use acceptable vs manual review mandatory
- Junior+AI combo for routine tasks; human mentorship for complex reasoning
- Focus on uniquely human capabilities: system thinking, cross-functional communication
- [Source: Qodo, CodeConductor]
