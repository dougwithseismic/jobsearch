# Research: Testing Agents Without Losing Your Mind

## Core Challenge
- Traditional QA assumes deterministic behavior
- Agents are non-deterministic: same input, different outputs
- Need probabilistic validation, not exact output matching

## Testing Strategies

### Five Key Shifts
1. Probabilistic validation instead of exact matching
2. Monitor behavior over time, not single-point verification
3. Measure behavioral bounds, not deterministic correctness
4. Incorporate human judgment where automation fails
5. Validate reasoning processes alongside functional outcomes

### Deterministic + LLM-as-Judge Hybrid
- Deterministic checks for: tool selection, argument construction, format compliance
- LLM-as-judge for: response quality, goal alignment
- Scoring: 0-1 scale. Below 0.5 = hard failure. Above 0.8 = pass. Between = soft failure.

### Evaluation Harness Components
- Provides instructions and tools
- Runs tasks concurrently
- Records all execution steps
- Grades outputs
- Aggregates results
- Standardized frameworks for defining tasks, running agents, capturing traces

## Regression Testing for Model Updates
- Critical when updating models or modifying prompts
- Ensure improvements in one area don't degrade elsewhere
- Capability evals with high pass rates "graduate" to regression suite
- Run continuously to catch drift
- Simulation enables automated regression at scale

## Observability Platforms

### LangSmith
- From LangChain team, deep LangChain/LangGraph integration
- Step-by-step debugging for agent workflows
- Automated testing and LLM-as-judge evaluation
- Best if already in LangChain ecosystem

### Braintrust
- Evaluation + production monitoring combined
- Analyzes millions of traces in seconds (80x faster via Brainstore database)
- Test models against datasets, compare prompts/configs
- Automated scoring and quality metrics

### Key Concepts
- Traces reconstruct complete decision path
- Capture every LLM call, tool invocation, retrieval step, intermediate decision
- Show not just what happened, but how and why

## Continuous Evaluation in Production
- Validates agent behavior in real-world conditions
- Tracks performance as agents encounter actual user inputs
- Unlike pre-deployment testing in controlled environments
- Essential for catching edge cases and drift

## 2026 Trend
- Observability integrating with governance, risk, compliance
- Risk officers getting AI compliance dashboards
- Lines blurring between monitoring and development tools
