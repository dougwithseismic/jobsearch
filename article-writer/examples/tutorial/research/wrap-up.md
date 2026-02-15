# Research: Where to Go from Here

## When to Graduate from SSE to WebSockets

- SSE handles up to ~10,000 concurrent connections per server instance with minimal CPU.
- Migrate to WebSockets when you need: bidirectional communication, binary data, mobile optimization, or scale past 100K users.
- Hybrid approach: SSE for dashboard feeds, WebSockets for interactive features (chat, collaboration).
- Start simple with SSE, upgrade only when the use case demands it.

## Extension Ideas

1. **Postgres LISTEN/NOTIFY**: Replace polling with true push-based updates. One LISTEN connection per server instance, fan out to SSE clients.
2. **Redis Pub/Sub**: For multi-instance deployments. Publish events to Redis, each server instance subscribes and forwards to its SSE clients.
3. **WebTransport**: Emerging protocol (HTTP/3-based) for low-latency bidirectional streaming. Not yet widely supported but worth watching.

## Open Source Examples

- **use-next-sse**: Lightweight React hook library for SSE in Next.js. https://github.com/alexanderkasten/use-next-sse
- **Tinybird + Tremor + Next.js**: Real-time analytics dashboard. https://www.tinybird.co/blog-posts/real-time-dashboard-step-by-step
- **Next.js Dashboard Topics on GitHub**: https://github.com/topics/nextjs-dashboard

## Managed Real-Time Services (if SSE isn't enough)

- **Ably**: Managed real-time messaging with SSE fallback. https://ably.com
- **Pusher**: Channels API for real-time features. https://pusher.com
- **Supabase Realtime**: Postgres-native real-time built on Phoenix channels.
- **Upstash**: Redis-based real-time with Next.js integration.

## Further Reading

- MDN Server-Sent Events: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
- Next.js Streaming docs: https://nextjs.org/learn/dashboard-app/streaming
- Drizzle ORM docs: https://orm.drizzle.team
- Recharts: https://recharts.org

## Sources

- https://dev.to/haraf/server-sent-events-sse-vs-websockets-vs-long-polling-whats-best-in-2025-5ep8
- https://softwaremill.com/sse-vs-websockets-comparing-real-time-communication-protocols/
- https://github.com/alexanderkasten/use-next-sse
- https://www.tinybird.co/blog-posts/real-time-dashboard-step-by-step
- https://github.com/topics/real-time-dashboard
- https://rxdb.info/articles/websockets-sse-polling-webrtc-webtransport.html
- https://www.videosdk.live/developer-hub/websocket/sse-websocket
