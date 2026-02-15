# Research: Shipping Agents to Real Users

## Deployment Architectures
- Containerized microservices with agent orchestration layer
- Kubernetes-based with auto-scaling
- Serverless for bursty workloads
- Hybrid: persistent agents on VMs, ephemeral tasks on serverless

## Real-World Production Examples

### Cursor
- AI coding assistant with deep editor integration
- Manages agent sessions with context preservation
- Tab-based model routing for cost efficiency

### Replit Agent v3 (2026)
- 200-minute autonomous work sessions
- Self-healing code capabilities
- After database incident: auto separation dev/prod, planning-only mode

### Linear
- AI-integrated project management
- Agent handles triage, classification, assignment
- Human-in-the-loop for decisions above confidence threshold

### Doctolib
- Claude Code across entire engineering team
- Replaced legacy testing infrastructure in hours
- 40% faster feature shipping

## Cost Profiles
- Enterprise build in-house: $5M-$20M over 3 years
- Off-the-shelf solutions: $300K-$2M over 3 years
- Most budgets underestimate TCO by 40-60%
- Token costs scale with agent complexity and loop depth
- Smart routing reduces costs 30-50%
- Prompt caching reduces costs up to 90% for suitable workloads

## Human-in-the-Loop Patterns
- 60% of organizations restrict agent access to sensitive data without human oversight
- Nearly half employ HITL controls across high-risk workflows
- Rising HITL review costs driving agentic AI adoption
- Patterns: approval gates, confidence thresholds, escalation chains
- Critical for irreversible actions (deletions, financial transactions, communications)

## Safety and Guardrails
- Input validation: check user requests before agent processes
- Output validation: verify agent responses before delivering
- Sandboxing: MicroVMs (Firecracker), gVisor, hardened containers
- Network egress controls
- Zero-trust: all actions explicitly allowed
- Audit logging for all agent decisions and actions
- Rate limiting to prevent runaway costs

## Scaling Challenges
- Only 11% of orgs have agents in production
- Fewer than 1 in 4 have successfully scaled
- Cost overruns from token-heavy loops
- Model API rate limits
- State management at scale
- Observability overhead
