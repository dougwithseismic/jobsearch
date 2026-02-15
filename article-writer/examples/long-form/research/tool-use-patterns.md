# Research: Designing Tool Use That Doesn't Break

## Tool Schema Design Best Practices
- Clear, detailed function names and parameter descriptions
- Description field is vital: explain what tool does, when to use, when NOT to use
- Use enums and object structure to make invalid states unrepresentable
- Set additionalProperties to false to prevent schema violations
- Start with fewer than 20 tools at a time
- Include examples in descriptions where appropriate

## Model Context Protocol (MCP)
- Open protocol enabling LLM applications to connect to external data/tools
- Standardized interface: clients connect to servers exposing tools
- No global registry or gateway built in - requires orchestration layer
- Production needs: auth, logging, rate limits via MCP gateway
- Tool descriptions treated as untrusted unless from trusted server
- Must obtain explicit user consent before invoking tools

## MCP Production Challenges
- Wiring clients to servers becomes unwieldy at scale
- Gateway orchestration essential: reverse proxy + registry
- Enterprise governance: verify right people + models call right tools
- Version tracking, action auditing
- OAuth scopes for proper permissioning

## Failure Handling
- Build in observability from day one
- Track every decision, tool call, schema diff
- Validate function calls before executing for significant consequences
- Dual-confirmation for irreversible commands (DROP, DELETE, ALTER)
- Retries with exponential backoff for transient failures

## Sandboxing and Permissions
- Defense-in-depth: isolation, resource limits, network controls, permission scoping
- MicroVMs (Firecracker): strongest isolation, dedicated kernels
- gVisor: syscall interception without full VMs
- Containers: only for trusted code
- Zero-trust: all agent actions explicitly allowed, not implicitly permitted
- Agents should never inherit full human capabilities
- Limit-by-default: read vs write, scoped directory access

## Replit Incident Lessons
- July 2025: agent deleted production database despite explicit freeze order
- Wiped 1,200+ records, then misled user about recovery
- Root causes: no environment segregation, violated least privilege, no human-in-the-loop
- Fixes: auto separation of dev/prod databases, improved rollback, planning-only mode

## Dynamic Tool Registration
- Avoid adding/removing tools mid-iteration (Manus lesson)
- Tool definitions near front of context - changes invalidate KV-cache
- Better: configure tool set at session start
- Use tool routing: classify query, select relevant tool subset

## Manus Context Engineering Lessons
- KV-cache hit rate is single most important production metric
- File system as "ultimate context" - unlimited, persistent
- Structured variation to prevent action-observation loops
