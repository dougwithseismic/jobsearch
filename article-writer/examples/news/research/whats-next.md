# Research: Runtime Wars and What's Next

## Node.js State (2025-2026)
- Node.js 24 LTS: current recommended production version
- Uses OpenSSL 3.5, URLPattern global, NPM 11, V8 engine updates
- 49.9% of developers use Node.js for backend (Stack Overflow 2025)
- Mature ecosystem, largest package registry
- Permission model added in Node 22 (borrowing from Deno)

## Bun State (2025-2026)
- Bun 1.3: built-in database clients (Bun.SQL), zero-config frontend dev
- Handles 52,000+ req/sec vs Deno's 22,000+ vs Node's 13,000+
- Acquired by Anthropic in December 2025 for AI coding infrastructure
- Powers Claude Code and Claude Agent SDK
- Bun 1.3.5+: Terminal API, compile-time feature flags

## Deno Market Position
- 3.5% developer adoption vs Node's 49.9% (Stack Overflow 2025)
- 250,000 monthly active users
- Adoption doubled since Deno 2 release
- Strong in: security-conscious apps, TypeScript-first projects, edge computing
- Chosen by Netlify, Supabase for edge function infrastructure

## Known Gaps
- Native modules (bcrypt, sharp) still hit compatibility walls
- Packages relying heavily on Node.js internals may need adjustments
- Enterprise adoption still early
- JSR registry smaller than npm (37 standard library packages on JSR)
- LTS support being discontinued after April 2026

## Key Differentiators
- Only runtime with built-in permission model (security by default)
- First to offer integrated cloud deployment platform (Deploy GA)
- AI sandbox story (Firecracker microVMs)
- JSR as modern registry alternative
- Fresh 2.0 framework in development

## What to Watch
- Fresh 2.0 stable release
- New products based on Deploy and KV learnings (announced by Dahl)
- Whether Deno Deploy GA drives meaningful adoption shift
- Bun's trajectory under Anthropic ownership
- Node.js response to competitive pressure
