# Research: Deno Deploy Edge Details

## Technical Architecture
- Globally distributed V8 isolate cloud running in 32 regions
- Multi-tenant architecture with control plane and data plane separation
- Control plane: deployment management, accounts, analytics, billing
- Data plane: edge regions with storage buckets, edge proxies, runner VMs
- Deployments automatically replicated globally with zero config
- V8 isolates offer faster cold starts than Lambda functions or VMs
- Each isolate is a distinct execution context with completely separate states

## Features
- Built-in APIs for key/value databases (Deno KV) and job queues
- Web Platform APIs support: fetch(), compression streams, WebSocket
- Node.js built-in modules support (e.g., node:http) on Deploy
- Static file serving support
- Auto-detects frameworks (Next.js, Fresh, etc.)
- Opt-in permission system to mitigate supply chain attacks

## Pricing (as of 2026)
- Free tier: 1M requests/month, 100GB egress, 1GB KV storage - no credit card, never expires, commercial use allowed
- Pro: $20/month - 5M requests, 200GB egress
- Builder: $200/month
- Enterprise: custom pricing

## Company Adoption
- Netlify: Powers Netlify Edge Functions using Deno Subhosting, adoption growing among Fortune 500 companies
- Supabase: Deno Edge Functions for deploying custom TypeScript functions globally at the edge
- Both use Deno Deploy as infrastructure layer

## Competitive Comparison
- Cloudflare Workers: Also uses V8 isolates, larger edge network, more established
- Vercel Edge Functions: Tied to Next.js/Vercel ecosystem
- Deno Deploy: Tighter runtime integration, simpler deployment story, now GA
