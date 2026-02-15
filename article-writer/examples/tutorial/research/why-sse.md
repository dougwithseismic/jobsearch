# Research: Why Server-Sent Events Beat WebSockets for Dashboards

## SSE vs WebSockets Performance

- Tests show minimal performance difference for unidirectional data. The majority of CPU is spent parsing and rendering data, not transporting it.
- SSE runs over standard HTTP, benefiting from HTTP/2 multiplexing (100+ streams per connection) and HTTP/3 QUIC for mobile.
- WebSockets maintain edge for high-frequency bidirectional (chat, gaming, collaborative editing).
- SSE has built-in reconnection; WebSockets require manual reconnection logic.

## Browser Support (2026)

- All modern browsers: Firefox 6+, Chrome 6+, Opera 11.5+, Safari 5+, Edge 79+.
- HTTP/1.1 limitation: 6 SSE connections per browser+domain. Marked "Won't fix" in Chrome/Firefox.
- HTTP/2 removes this limit: default 100-200 concurrent streams per connection.
- Since SSE is just a long-running HTTP request, HTTP/2 multiplexing makes it viable for many streams.

## Companies Using SSE in Production

- **Vercel AI SDK**: Uses SSE for streaming LLM responses. Handles connection drops, partial message reconstruction.
- **OpenAI**: ChatGPT streaming responses use SSE protocol.
- **Upstash**: Real-time notifications built with SSE + Redis + Next.js.
- **Mercure**: Open-source SSE hub used in Symfony/API Platform ecosystems.

## Decision Matrix: SSE vs WebSocket vs Polling

| Feature | SSE | WebSocket | Polling |
|---------|-----|-----------|---------|
| Direction | Server → Client | Bidirectional | Client → Server → Client |
| Protocol | HTTP | WS (upgrade) | HTTP |
| Reconnection | Automatic | Manual | N/A |
| Binary data | No (text only) | Yes | Yes |
| HTTP/2 benefit | Multiplexed | Separate connection | N/A |
| Firewall friendly | Yes | Sometimes blocked | Yes |
| Complexity | Low | Medium | Low |
| Best for | Dashboards, feeds, notifications | Chat, gaming, collaboration | Legacy, simple updates |

## Sources

- https://www.nimbleway.com/blog/server-sent-events-vs-websockets-what-is-the-difference-2026-guide
- https://dev.to/polliog/server-sent-events-beat-websockets-for-95-of-real-time-apps-heres-why-a4l
- https://www.timeplus.com/post/websocket-vs-sse
- https://ably.com/blog/websockets-vs-sse
- https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
- https://developer.mozilla.org/en-US/docs/Web/API/EventSource
- https://www.smashingmagazine.com/2018/02/sse-websockets-data-flow-http2/
- https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol
- https://softwaremill.com/sse-vs-websockets-comparing-real-time-communication-protocols/
