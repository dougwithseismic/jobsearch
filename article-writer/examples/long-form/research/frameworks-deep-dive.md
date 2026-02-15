# Research: Frameworks That Survive Contact with Production

## LangGraph
- Graph-based state management, industry standard for 2026
- Lowest latency and token usage across benchmarks
- Reduces redundant context passing via graph structure
- Complex initial setup but production-ready once deployed
- Deep integration with LangChain ecosystem
- Built-in persistence, human-in-the-loop, streaming

## CrewAI
- Role-based multi-agent setups
- Excels at collaborative tasks (researcher + writer pattern)
- Fast concept-to-working-pilot pipeline
- Best for teams wanting quick prototyping
- Less granular control than LangGraph

## AutoGen (AG2)
- Built for complex multi-agent conversations
- Agent-to-agent dialogue for dynamic task solving
- Best for code generation and complex problem-solving
- Strong at conversational coordination
- Microsoft-backed

## OpenAI Agents SDK
- Production-ready evolution of Swarm
- Minimal primitives: Agents, Handoffs, Guardrails
- Built-in tracing for debugging and evaluation
- Actively maintained by OpenAI
- Good for customer support, research, content generation, code review

## Strands Agents (AWS)
- Model-agnostic with deep AWS integrations
- Relies on model capabilities rather than complex orchestration
- Teams shipping agents in days/weeks instead of months
- Used internally by Amazon Q Developer teams
- Native Bedrock integration

## PydanticAI
- Minimalist, Pythonic approach
- Pydantic for output validation and structured responses
- Dependency injection for testing
- Streaming support
- Great for type-safe, production Python environments

## Anthropic Agent SDK / mcp-agent
- Every pattern from "Building Effective Agents" + Swarm pattern
- Composable patterns
- Cloud deployment through managed infrastructure

## Build vs Buy Considerations
- No single "best" framework
- LangGraph for state-heavy workflows
- CrewAI for role-based collaboration
- OpenAI SDK for OpenAI ecosystem
- Strands for AWS shops
- PydanticAI for type-safe Python
- Many teams build thin wrappers over raw API calls
- Framework lock-in is real: evaluate escape hatches

## Minimal Agent from Scratch
- Core loop: prompt -> LLM call -> parse response -> execute tool -> repeat
- Add: tool registry, error handling, retry logic, logging
- Many production teams end up building custom thin layers
