# Research: Memory and State Across Long-Running Tasks

## Memory Architecture Types

### Working Memory
- Current task data, recent conversation
- Held in context window
- Fast access but size-limited

### Persistent Memory
- Historical context across sessions
- Stored in external systems (vector stores, databases)
- Survives context window resets

### Hybrid Approaches
- Combine structured state + vector retrieval
- Include latest state + recent history as structured input
- RAG to pull relevant docs from long-term memory

## Context Window Overflow Strategies

### Automatic Compaction
- Summarize conversation near context limit
- Reinitiate new context with summary
- First lever in context engineering for long-term coherence

### Hierarchical Summarization
- Compress older segments while preserving essential info
- Recent exchanges remain verbatim
- Older content gets progressively more compact summaries

### Sliding Window
- Collect and summarize older events after threshold
- Used by Google ADK's Context Compaction feature

### Anchored Iterative Summarization (Factory.ai)
- Structured summary with explicit sections: session intent, file modifications, decisions, next steps
- Only newly-truncated span summarized and merged
- Structure forces preservation - prevents silent information loss
- Each section acts as checklist

## Mem0 - Production Memory Layer
- Open-source memory layer between app and LLM
- Auto-extracts relevant info from conversations
- Stores and retrieves when needed
- 26% higher accuracy, 91% lower latency, 90% token savings
- Vector storage + graph-based relationship tracking
- Apache 2.0 license, $24M raised Oct 2025
- Works with any LLM provider

## Multi-Agent State Coordination
- Shared state management critical for multi-agent systems
- Race conditions when multiple agents update shared state
- Solutions: event sourcing, message queues, shared databases with locking
- Cross-agent memories possible (PydanticAI agent memories accessible by Strands, CrewAI)

## RAG in Agent Memory vs Chat
- Chat RAG: simple retrieval of relevant documents
- Agent RAG: active memory management, the agent decides what to store and retrieve
- Agent memory is more dynamic - agents write to memory, not just read
- 2026 trend: contextual memory becoming table stakes for production agents

## Manus Lessons
- File system as ultimate context: unlimited, persistent, directly operable
- Agent learns to read/write files on demand
- KV-cache hit rate is critical metric
- Avoid changing tool definitions mid-iteration
