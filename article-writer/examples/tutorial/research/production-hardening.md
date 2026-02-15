# Research: Making It Production-Ready

## Exponential Backoff with Jitter

- Base formula: `delay = min(initialDelay * 2^attempt, maxDelay)`
- Add jitter: `delay = delay * (0.7 + Math.random() * 0.3)` (70-100% of calculated delay)
- Prevents thundering herd when server restarts and all clients reconnect simultaneously.
- EventSource has built-in reconnect but no backoff — custom implementation needed.

## Heartbeat Events

- Send a comment line (`: heartbeat\n\n`) or named event every 15-30 seconds.
- Keeps connection alive through proxies, load balancers, CDNs that timeout idle connections.
- Client can use heartbeat absence to detect stale connections and force reconnect.

## Authentication for SSE Routes

- EventSource API does NOT support custom headers (no Authorization header).
- Workaround 1: Pass token as URL query parameter: `/api/stream?token=xxx`
- Workaround 2: Use cookies (httpOnly, secure) — works automatically with same-origin.
- Workaround 3: Use fetch-based SSE with ReadableStream reader for custom headers.
- Next.js middleware can validate tokens/cookies before the route handler runs.

## Connection Limits

- HTTP/1.1: 6 connections per domain per browser. This is the single biggest SSE gotcha.
- HTTP/2: ~100 concurrent streams per connection. Problem solved.
- Ensure your deployment serves over HTTP/2 (most modern hosts do).

## Postgres LISTEN/NOTIFY

- True push: database notifies server of changes instead of polling.
- `NOTIFY channel_name, 'payload'` — trigger sends notification with JSON payload.
- `LISTEN channel_name` — server subscribes using a dedicated connection.
- Use `postgres` (postgres-js) `.listen()` method.
- Limitation: each LISTEN uses one persistent connection; not for thousands of listeners.
- Pattern: one LISTEN connection per server instance → fan out to SSE clients.

## Deployment Considerations

- **Vercel**: Serverless functions timeout at 60s (free) to 800s (paid). SSE works but connections are short-lived. Use for demos, not production dashboards.
- **Railway**: Long-running server, no timeout limits. Ideal for SSE. https://railway.app
- **Fly.io**: Container-based, global regions, WebSocket/SSE first-class. https://fly.io
- **Self-hosted**: Any Node.js server with reverse proxy (nginx, caddy) works perfectly.

## Sources

- https://vercel.com/kb/guide/what-can-i-do-about-vercel-serverless-functions-timing-out
- https://docs.railway.com/maturity/compare-to-vercel
- https://www.pedroalonso.net/blog/postgres-listen-notify-real-time/
- https://oneuptime.com/blog/post/2026-01-25-use-listen-notify-real-time-postgresql/view
- https://www.postgresql.org/docs/current/sql-notify.html
- https://www.postgresql.org/docs/current/sql-listen.html
- https://github.com/drizzle-team/drizzle-orm/issues/2102
- https://authjs.dev/getting-started/session-management/protecting
- https://clerk.com/articles/complete-authentication-guide-for-nextjs-app-router
