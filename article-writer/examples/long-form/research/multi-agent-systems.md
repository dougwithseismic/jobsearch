# Research: When One Agent Isn't Enough

## The Debate: Single vs Multi-Agent

### Cognition's "Don't Build Multi-Agents" (June 2025)
- Multi-agent systems with parallel sub-agents are inherently fragile
- Core problem: context isolation between agents
- "Flappy Bird" example: one agent builds Mario background, another builds non-game bird
- Neither has shared context of the other's actions
- Proposed solution: single-threaded, linear agent for reliability
- Optimal for conversational agents and coding tasks

### Anthropic's Counter: Multi-Agent Research System
- Orchestrator-worker pattern
- Lead agent coordinates, specialized subagents work in parallel
- Used for deep research tasks
- Key insight: delegation keeps verbose output in subagent context

## Production Multi-Agent Patterns

### Claude Code Sub-Agents
- Subagents preserve context by isolating exploration from main conversation
- Enforce constraints by limiting tool access
- Enable reuse across projects
- Built-in subagents: Explore, Plan, general-purpose
- Investigative work stays out of main history = longer traces before context overflow

### Coordination Protocols
- Google A2A (Agent-to-Agent): open protocol for agent interoperability
  - JSON-RPC 2.0 over HTTPS
  - Agent Cards for capability discovery
  - Supports sync, streaming (SSE), async push
  - 50+ technology partners including Salesforce, SAP, PayPal
  - Version 0.3 with gRPC support
- MCP: for tool/resource access
- A2A + MCP: complementary protocols for full agent ecosystem

### Token Economics
- Multi-agent systems use ~15x more tokens than single-agent chats
- Economic viability requires tasks where value justifies cost
- Sub-agent delegation can actually save tokens by keeping verbose output contained

## When to Go Multi-Agent
- Task requires genuinely different capabilities (research + coding + testing)
- Parallelism provides meaningful speedup
- Sub-tasks are relatively independent
- Context management overhead is justified by output quality

## When to Stay Single-Agent
- Tasks requiring coherent, sequential reasoning
- Context consistency is paramount
- Token budget is constrained
- Debugging simplicity matters

## Failure Modes
- Context isolation: agents don't know what peers are doing
- Coordination overhead exceeds benefit
- Error propagation: one agent's mistake compounds across system
- Increased debugging complexity
- Cost explosion from token multiplication
