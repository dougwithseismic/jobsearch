# Research: Deno Sandbox and AI Code Execution

## Deno Sandbox (February 3, 2026)
- NOT an AI SDK in the traditional sense - it's a sandboxed execution environment for AI-generated code
- Lightweight Linux microVMs using Firecracker technology (same as AWS Lambda)
- Each sandbox runs in its own isolated microVM
- Boots in under a second
- JavaScript and Python SDKs for programmatic creation
- Defense against prompt injection attacks
- Secrets/API keys protected: never enter sandbox, only appear on outbound HTTP to pre-approved hosts
- Available as npm package: @deno/sandbox and on JSR: @deno/sandbox

## Strategic Context
- More LLM-generated code being released with ability to call external APIs using real credentials without human review
- AI agents increasingly need to execute code safely
- Use cases: AI agents, vibe-coding environments, secure plugins, ephemeral CI runners, customer-supplied code
- Included in Deno Deploy plan with usage-based pricing (pay for compute time, not wall-clock)

## Competitive Landscape
- Bun acquired by Anthropic (December 2025) for AI coding infrastructure
- Deno positioning itself as the safe execution layer for AI-generated code
- Firecracker microVMs offer stronger isolation than V8 isolates alone
- This is defense-in-depth: process isolation + VM isolation + permission model

## Industry Trend
- AI code generation growing rapidly in 2025-2026
- Need for secure sandboxed execution is a real pain point
- Multiple approaches: microVMs (Firecracker), gVisor, container isolation
- Deno's permission model gives it a natural advantage for sandboxing
