# Research: What to Build First

## Simplest Production-Ready Architecture
- Start with a single-agent ReAct loop
- One LLM, a handful of well-defined tools, a simple retry mechanism
- Add complexity only when you hit a wall
- Anthropic's advice: start simple, optimize with evaluation, add multi-step only when needed

## Skills and Tools to Learn First
- Python fluency: non-negotiable for agent development
- Prompt engineering: now a specialized skill
- Understanding of LLM APIs: function calling, streaming, context management
- One framework deeply (LangGraph or OpenAI Agents SDK recommended)
- Evaluation and testing: build evals before building agents
- MCP fundamentals: the emerging standard for tool integration

## Best Open-Source Projects for Learning
- LangGraph: production patterns, state management
- OpenAI Agents SDK: clean abstractions, good docs
- Mem0: memory patterns
- Strands: AWS patterns, model-agnostic design
- Claude Code subagents: delegation patterns

## Job Market in 2026
- AI engineering is most in-demand tech career
- Roles requiring agentic AI skills grew 986% from 2023 to 2024
- Over half of AI job postings offer six-figure salaries
- Specialized roles: Agent Ops, AI agent trainers, orchestration engineers
- Domain experts command 30-50% higher salaries than generalists
- Trilingual skillset (ML + SWE + DevOps) earns 20-40% premium
- Significant talent shortage = opportunity

## Most Promising Unsolved Problems
- Reliable long-term memory across sessions
- Cost-effective multi-agent coordination
- Testing non-deterministic behavior at scale
- Agent safety and alignment in production
- Cross-framework interoperability (A2A + MCP still evolving)
- Context engineering: compaction without information loss
- Human-AI collaboration patterns beyond simple approval gates
- Agent-native development environments and debugging tools

## Career Advice
- Build something real: a working agent that solves an actual problem
- Contribute to open-source agent frameworks
- Learn evaluation-driven development
- Focus on production patterns, not just demos
- Understand the economics: token costs, routing, caching
