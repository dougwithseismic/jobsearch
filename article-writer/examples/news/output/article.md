# Deno Deploy Goes GA and Bets Big on Sandboxing AI-Generated Code

*General availability, Firecracker-powered microVMs for untrusted code, and a runtime that keeps pulling ahead on security.*

---

## What Deno Just Shipped

Three days ago, the Deno team [announced](https://deno.com/blog/deno-deploy-is-ga) two products that signal where the company is headed next. [Deno Deploy](https://deno.com/deploy) reached general availability after nearly five years in beta, and alongside it, a brand-new product called [Deno Sandbox](https://deno.com/blog/introducing-deno-sandbox) launched in beta -- a secure execution environment built specifically for AI-generated code.

The Sandbox announcement is the more surprising of the two. As LLM-powered agents increasingly generate and execute code that calls external APIs with real credentials and no human review, the industry has a growing trust problem. Deno's answer is to run each piece of untrusted code inside its own [Firecracker microVM](https://docs.deno.com/sandbox/) -- the same isolation technology that powers AWS Lambda -- with boot times under one second. Secrets and API keys never enter the sandbox. They only surface when outbound HTTP requests hit a pre-approved host, which means a prompt injection attack that generates malicious code still cannot exfiltrate credentials.

The Deploy GA, meanwhile, represents a complete rework of what the team previously called "Deploy Classic." The new version runs on Deno 2.0, ships with a redesigned dashboard, and automatically detects which JavaScript framework you are using -- whether that is Fresh, Next.js, or something else -- then runs the appropriate build commands without configuration. For teams already running on Deno Deploy's beta, the upgrade path is straightforward. For everyone else, the free tier still includes one million requests per month and 100 GB of outbound transfer, with no credit card required.

These releases did not arrive in isolation. In December, [Deno 2.6](https://deno.com/blog/v2.6) shipped with `dx` (a `npx` equivalent for running package binaries from npm and JSR), `deno audit` for scanning dependencies against GitHub's CVE database, and an experimental Go-based TypeScript type checker called `tsgo` that delivers roughly 2x faster type checking. Together, these moves paint a clear picture: Deno is no longer positioning itself as just a better runtime. It is building a platform.

```bash
# Deno 2.6: run any npm/JSR binary without installing it globally
deno dx create-next-app@latest my-app

# Audit your dependencies against known vulnerabilities
deno audit
```

## One Command to the Edge

Deno Deploy runs your code across [32 regions worldwide](https://deno.com/blog/anatomy-isolate-cloud) using V8 isolates -- lightweight execution contexts that share a host process but maintain completely separate state. Unlike traditional container-based serverless platforms where cold starts can take hundreds of milliseconds, V8 isolates spin up in single-digit milliseconds because they skip the overhead of booting an operating system or even a process. The result is a [multi-tenant cloud](https://deno.com/blog/build-secure-performant-cloud-platform) where deployments are automatically replicated globally with zero additional configuration from the developer.

The architecture separates concerns into a control plane and a data plane. The control plane handles accounts, analytics, billing, and deployment management. The data plane is where code actually runs -- spread across edge regions that contain storage buckets, edge proxies, and the virtual machines hosting V8 isolate runners. When a user hits your application, the request routes to the nearest region, and if the isolate is not already warm, it spins up fast enough that the user never notices.

What makes the GA release notable beyond infrastructure maturity is the developer experience layer on top. Deploy now supports [Node.js built-in modules](https://docs.deno.com/runtime/fundamentals/node/) like `node:http` directly at the edge, meaning existing Node applications can run on Deploy with minimal changes. The platform also includes built-in APIs for [Deno KV](https://deno.com/blog/anatomy-isolate-cloud) (a globally consistent key-value database) and job queues, which removes the need to wire up external databases for common stateful patterns.

[Netlify](https://deno.com/blog/netlify-subhosting) built its entire Edge Functions product on Deno's subhosting infrastructure, and adoption has grown to include Fortune 500 companies. [Supabase](https://supabase.com/features/deno-edge-functions) runs its Edge Functions on Deno as well, giving developers a way to deploy custom TypeScript functions that execute close to their users. These are not experimental integrations -- they are production infrastructure serving real traffic at scale.

```typescript
// A simple Deno Deploy edge function with KV storage
const kv = await Deno.openKv();

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  if (url.pathname === "/visit") {
    const count = await kv.get(["visits"]);
    await kv.set(["visits"], (count.value as number || 0) + 1);
    return new Response(`Visit count: ${(count.value as number || 0) + 1}`);
  }
  return new Response("Hello from the edge");
});
```

On pricing, Deno Deploy keeps a generous free tier: one million requests per month, 100 GB of egress, and 1 GB of KV storage with no expiration and no credit card. The [Pro tier](https://deno.com/deploy/pricing) runs $20 per month for five million requests and 200 GB of egress. A Builder tier at $200 per month and custom Enterprise pricing round out the options. Compared to Cloudflare Workers, the free tier is competitive, though Cloudflare's larger edge network and longer track record still give it an advantage for latency-sensitive workloads that need presence in more regions.

## The AI Code Problem Nobody Solved Cleanly

The timing of [Deno Sandbox](https://deno.com/blog/introducing-deno-sandbox) is not accidental. Throughout 2025 and into 2026, the industry has watched AI agents evolve from generating code snippets that developers copy-paste into production to autonomously executing code that interacts with live services. The security implications are significant: an LLM that can write and run arbitrary code with access to your API keys and database credentials is one prompt injection away from a serious incident.

Deno Sandbox addresses this with a defense-in-depth architecture. Each sandbox runs inside its own Firecracker microVM, providing hardware-level isolation between tenants. This is a step beyond V8 isolate-level separation -- even if an attacker escapes the JavaScript execution context, they are still contained within a lightweight virtual machine that has no access to the host system or neighboring workloads. The sandbox also inherits Deno's runtime permission model, so network access, file system reads, and environment variable access are all denied by default and must be explicitly granted.

The product ships with both [JavaScript and Python SDKs](https://jsr.io/@deno/sandbox) for creating sandboxes programmatically. You can spin up an environment, execute untrusted code, and tear it down in a workflow that takes less than a second end-to-end. The use cases the team is targeting include AI agents executing generated code, vibe-coding environments where users write and run code in the browser, secure plugin systems for SaaS platforms, ephemeral CI runners, and any situation where customer-supplied code needs to execute safely.

The strategic context matters here too. In December 2025, [Anthropic acquired Bun](https://devclass.com/2025/12/03/bun-javascript-runtime-acquired-by-anthropic-tying-its-future-to-ai-coding/), the JavaScript runtime known for raw speed, to power its AI coding products including Claude Code and the Claude Agent SDK. That acquisition sent a clear signal: runtime companies and AI companies are converging. Deno is making its own AI infrastructure play, but from the opposite direction -- rather than optimizing for speed, it is optimizing for safety. For organizations building AI agents that execute code on behalf of users, the question of which runtime to trust with that execution is becoming a serious architectural decision.

Sandbox is included in existing Deno Deploy plans with [usage-based pricing](https://deno.com/deploy/pricing) -- you pay for compute time, not wall-clock time, which means you are not billed while a sandbox sits idle waiting for the next AI-generated code block to execute.

## Where This Leaves the Runtime Wars

The JavaScript runtime landscape in early 2026 looks nothing like it did two years ago. [Node.js 24](https://blog.logrocket.com/node-js-24-new/) entered LTS in October 2025 with OpenSSL 3.5, a global URLPattern API, NPM 11, and a stricter security posture -- improvements that reflect competitive pressure from both Deno and Bun. The [2025 Stack Overflow Developer Survey](https://survey.stackoverflow.co/2025) still shows Node.js commanding roughly half of all backend JavaScript usage, while Deno sits at 3.5% of respondents.

[Bun](https://www.infoq.com/news/2026/01/bun-v3-1-release/), now under Anthropic's ownership, continues to lead on raw performance benchmarks -- handling over 52,000 requests per second compared to Deno's roughly 22,000 and Node's approximately 13,000 in synthetic tests. Its 1.3 release brought built-in database clients and zero-config frontend development, pushing further into the all-in-one runtime territory.

But Deno is the only one of the three that has built a full deployment platform and an AI-specific execution sandbox as first-party products. That is a different bet: rather than winning on speed or ecosystem size, Deno is wagering that security and integrated infrastructure matter more as AI-generated code becomes the norm rather than the exception.

Gaps remain. Native npm modules like `bcrypt` and `sharp` still hit [compatibility walls](https://docs.deno.com/runtime/fundamentals/node/) in Deno, though mainstream packages work without modification. Enterprise adoption is still early. The [JSR registry](https://deno.com/blog/jsr_open_beta) is gaining ground -- it now supports pnpm and Yarn and hosts the Deno standard library across 37 packages -- but it is not close to npm's scale. And with LTS support scheduled to end after April 2026, the Deno team will need to clarify its long-term support story for organizations that plan in multi-year cycles.

What developers should watch: whether Deploy GA and Sandbox drive measurable adoption beyond Deno's current base, what new products emerge from the company's work on distributed state (hinted at by Ryan Dahl in a [May 2025 blog post](https://deno.com/blog/changes)), and whether Bun's Anthropic backing pulls AI-focused developers in a different direction entirely. The runtime wars are no longer about which JavaScript engine starts faster. They are about which platform you trust to run code that was not written by a human.
