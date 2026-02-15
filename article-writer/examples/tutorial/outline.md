# Outline: Build a Real-Time Dashboard with Next.js, Drizzle ORM, and Server-Sent Events

## 1. Why Server-Sent Events Beat WebSockets for Dashboards (~550 words)
**Narrative role: Hook**

- Open with the familiar scene: developer reaches for WebSockets, spends hours on connection state, reconnection logic, and server setup for what amounts to one-way data flow
- Introduce SSE as the overlooked native alternative — built into every browser since 2012
- Decision matrix table: SSE vs WebSocket vs Polling (direction, protocol, reconnection, complexity, best use cases)
- Real-world adoption: OpenAI streams ChatGPT responses over SSE, Vercel AI SDK uses SSE as its default streaming protocol, Mercure hub powers SSE in the Symfony ecosystem
- HTTP/2 multiplexing eliminates the old 6-connection limit (now 100+ streams per connection)
- Preview of what we're building: live analytics dashboard with streaming counters, a real-time chart, and an activity feed
- Transition: let's set up the project

## 2. What You Need Before We Start (~450 words)
**Narrative role: Prerequisites**

- Tech stack with pinned versions: Next.js 15, Drizzle ORM, postgres (postgres-js driver), Recharts, TypeScript, Tailwind CSS
- Scaffold command: `pnpm create next-app@latest realtime-dashboard --typescript --tailwind --app --src-dir`
- Install dependencies: `pnpm add drizzle-orm postgres recharts` and `pnpm add -D drizzle-kit`
- Postgres setup options: Docker one-liner, Neon free tier, local install
- Environment variable: DATABASE_URL in .env.local
- drizzle.config.ts setup
- Expected folder structure after setup
- Transition: with the project scaffolded, let's design our data layer

## 3. Designing the Schema with Drizzle (~800 words)
**Narrative role: Foundation**

- Why Drizzle over raw SQL or Prisma: TypeScript-first schema = compile-time safety, no code generation step
- Database connection singleton (src/lib/db.ts): postgres-js driver + drizzle wrapper with dev hot-reload guard
- Schema file (src/lib/schema.ts):
  - `events` table: id, name, properties (jsonb), created_at — tracks dashboard events
  - `metricsSnapshots` table: id, page_views, active_sessions, events_count, recorded_at — periodic rollups
- Type inference with $inferSelect and $inferInsert
- drizzle.config.ts pointing to schema and DATABASE_URL
- Running migrations: `pnpm drizzle-kit generate` then `pnpm drizzle-kit push` for dev
- Seed script (src/lib/seed.ts): generates 100 events and 50 metric snapshots with realistic data
- Running the seed: `npx tsx src/lib/seed.ts`
- Transition: with data in the database, let's stream it to the browser

## 4. Building the Streaming API Route (~900 words)
**Narrative role: Walkthrough**

- What an SSE response looks like: Content-Type text/event-stream, the data/event/id/retry format
- The route handler file: src/app/api/dashboard/stream/route.ts
- Step 1: Basic streaming skeleton with ReadableStream and TextEncoder
- Step 2: SSE helper function to format events correctly (data lines, double newline)
- Step 3: Database polling loop — query Drizzle for latest metrics every 2 seconds
- Step 4: Named events — separate "metrics" and "activity" event types
- Step 5: Client disconnection cleanup using request.signal (AbortSignal)
- Step 6: Heartbeat comments to keep connection alive through proxies
- Testing with curl: `curl -N http://localhost:3000/api/dashboard/stream`
- Explaining the output format and what the client will receive
- The `export const dynamic = 'force-dynamic'` directive and why it matters
- Transition: the server is streaming — time to consume it in React

## 5. Wiring Up the Dashboard Components (~900 words)
**Narrative role: Walkthrough**

- The useEventSource custom hook (src/hooks/use-event-source.ts):
  - Creates EventSource, tracks connection status
  - Supports named event listeners via addEventListener
  - Cleanup on unmount to prevent memory leaks
  - Returns typed data, status, and error
- MetricCard component: displays a single metric with animated value transitions using CSS transitions
- ActivityFeed component: shows recent events in a scrolling list, new items slide in
- StreamingChart component: Recharts LineChart with a sliding window of the last 20 data points
  - ResponsiveContainer for responsive sizing
  - isAnimationActive={false} for frequent updates
- Dashboard page (src/app/page.tsx): Server component wrapper with client component island
- DashboardClient component: uses the hook, distributes data to widgets
- Handling loading and error states
- Transition: it works on localhost — but production has different rules

## 6. Making It Production-Ready (~800 words)
**Narrative role: Advanced**

- Problem 1: Reconnection — EventSource auto-reconnects, but without backoff
  - Enhanced hook with exponential backoff: delay = min(1000 * 2^attempt, 30000)
  - Jitter: multiply by random factor between 0.7 and 1.0
  - Max retry count before giving up
- Problem 2: Stale connections — proxies and load balancers drop idle connections
  - Server-side heartbeat every 15 seconds (SSE comment line)
  - Client-side heartbeat timeout: if no data for 45 seconds, force reconnect
- Problem 3: Authentication
  - EventSource doesn't support custom headers
  - Cookie-based auth: httpOnly cookies work automatically
  - Token-based: pass via URL query param (encrypted, short-lived)
  - Next.js middleware validation before route handler
- Problem 4: Connection limits
  - HTTP/1.1 = 6 per domain per browser (across all tabs)
  - HTTP/2 = 100+ streams multiplexed on one connection
  - Ensure deployment serves HTTP/2 (most modern hosts do)
- Problem 5: Scaling beyond polling
  - Postgres LISTEN/NOTIFY: database pushes changes to server
  - Pattern: one LISTEN connection per server instance, fan out to SSE clients
  - Code example: pg NOTIFY trigger + server listener
- Deployment platform comparison:
  - Vercel: 60s-800s function timeout, fine for demos
  - Railway: no timeout, persistent processes, ideal for SSE
  - Fly.io: global regions, container-based, first-class streaming support
- Production checklist (5 items)
- Transition: you've built something real — here's where to take it next

## 7. Where to Go from Here (~600 words)
**Narrative role: Wrap-up**

- Recap: what we built (SSE route, Drizzle queries, React dashboard, reconnection logic)
- The key architectural decision: SSE over WebSockets for unidirectional data
- Extension ideas:
  1. Postgres LISTEN/NOTIFY to replace polling
  2. Redis Pub/Sub for multi-instance deployments
  3. WebSocket upgrade for bidirectional features (chat, user interactions)
  4. WebTransport (HTTP/3-based, emerging protocol)
- When to graduate from SSE: bidirectional needs, binary data, >100K concurrent users
- Links to further reading: MDN SSE docs, Drizzle ORM docs, Recharts docs, Next.js streaming guide
- Closing encouragement: you now own the entire real-time pipeline with zero vendor lock-in
