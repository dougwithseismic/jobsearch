# Research: The Agent Architecture Zoo

## Main Architecture Patterns

### ReAct (Reasoning + Acting)
- Iterative loop: thought -> action -> observation -> repeat
- Agent reasons in natural language, takes actions, observes results
- Best for complex, dynamic tasks requiring continuous planning and adaptation
- Simple to implement, but can loop indefinitely on hard problems

### Plan-and-Execute
- High-level planner outlines major stages
- ReAct-style executor handles fine-grained execution of each stage
- Combines strategic coherence with tactical flexibility
- Better for structured, multi-step tasks

### Orchestrator-Worker (Multi-Agent)
- Lead agent decomposes objective into sub-tasks
- Specialized workers handle individual sub-tasks in parallel
- Improves resilience: individual agents work on subproblems
- Cognition warns: context isolation between agents is the big risk

### Evaluator-Optimizer
- One agent generates, another evaluates
- Iterates until quality threshold met
- Good for content generation, code review

## Anthropic's Patterns (from "Building Effective Agents")
- Prompt chaining
- Routing
- Parallelization
- Orchestrator-workers
- Evaluator-optimizer
- Key principle: start simple, add complexity only when it improves performance

## Google's Eight Multi-Agent Design Patterns (Jan 2026)
- Sequential pipelines
- Parallel fan-out
- Hierarchical delegation
- Peer collaboration
- Human-in-the-loop
- Published as comprehensive reference architecture

## Trade-offs
- Single-agent: simpler, more coherent, context stays unified
- Multi-agent: more scalable, specialized, but context management becomes critical
- Code-generation agents vs tool-calling agents: different reliability profiles
- Code-gen agents can be more flexible but harder to constrain
- Tool-calling agents more predictable but limited to predefined tools

## 2026 Trend
- Modular multi-agent architectures breaking from monolithic systems
- Each agent handles specific function: reasoning, planning, tool calling, self-evaluation
- But Cognition argues single-threaded is more reliable for many use cases
