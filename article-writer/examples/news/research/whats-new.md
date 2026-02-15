# Research: What's New in Deno (Early 2026)

## Key Facts

### Deno Deploy GA (February 3, 2026)
- Deno Deploy reached General Availability after first beta in June 2021
- New dashboard, new execution environment running Deno 2.0
- Auto-detects JavaScript frameworks and runs appropriate build commands
- Runs in 32 regions globally using V8 isolates
- Launched alongside Deno Sandbox (beta)

### Deno Sandbox (February 3, 2026)
- Secure environment built specifically for AI-generated code
- Lightweight Linux microVMs using Firecracker (same tech as AWS Lambda)
- Boots in under a second
- JavaScript and Python SDKs for programmatic creation
- Secrets/API keys never enter sandbox; only appear on outbound HTTP to pre-approved hosts
- Use cases: AI agents executing code, vibe-coding, secure plugin systems, ephemeral CI runners

### Deno 2.6 (December 10, 2025)
- `dx` command: equivalent to npx for running package binaries from npm and JSR
- `tsgo`: experimental TypeScript type checker written in Go, 2x faster
- `deno audit`: scans dependencies against GitHub CVE database
- `deno approve-scripts`: granular control over lifecycle scripts
- Minimum dependency age controls to prevent supply chain attacks
- Native source maps
- More granular permissions with --ignore-read and --ignore-env

### Adoption Numbers
- Deno adoption more than doubled since Deno 2 release (October 2024) per Ryan Dahl
- 4.1 million downloads on GitHub, 250,000 monthly active users
- Stack Overflow 2025 survey: 3.5% of respondents use Deno regularly vs 49.9% for Node.js

### Key Quotes / Context
- Ryan Dahl created both Node.js and Deno
- Deno 2.0 released October 2024 with npm compatibility
- Fresh 2.0 framework in development, being used in production at Deno
- JSR (JavaScript Registry) supports pnpm and Yarn as of April 2025
