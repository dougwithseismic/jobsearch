# Research: Building the Streaming API Route

## Next.js App Router Route Handler for SSE

- Use `export const dynamic = 'force-dynamic'` to prevent caching.
- Return a `Response` with `ReadableStream` and proper SSE headers.
- Headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`.
- Use `TextEncoder` to convert strings to `Uint8Array` for the stream.

## SSE Event Format (per MDN spec)

```
data: {"metric": "page_views", "value": 1234}\n\n

event: metric-update\n
data: {"metric": "page_views", "value": 1234}\n\n

id: 42\n
event: metric-update\n
data: {"metric": "page_views", "value": 1234}\n\n

retry: 5000\n
```

- Each message ends with `\n\n` (double newline).
- `data:` — the payload (JSON string).
- `event:` — named event type (client uses addEventListener).
- `id:` — last event ID for reconnection.
- `retry:` — reconnection interval in ms.

## Client Disconnection Detection

- Use `AbortSignal` from the request: `request.signal`.
- Or use `controller.close()` in the ReadableStream's `cancel` callback.
- The `start` function receives a `controller` — call `controller.close()` to end the stream.

## Testing with curl

```bash
curl -N http://localhost:3000/api/dashboard/stream
```

The `-N` flag disables buffering so you see events as they arrive.

## Production Patterns

- Named events for different data types (metrics, activity, alerts).
- Heartbeat events every 15-30s to keep connections alive through proxies.
- Event IDs for reconnection (client sends `Last-Event-ID` header).

## Sources

- https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
- https://www.pedroalonso.net/blog/sse-nextjs-real-time-notifications/
- https://damianhodgkiss.com/tutorials/real-time-updates-sse-nextjs
- https://hackernoon.com/streaming-in-nextjs-15-websockets-vs-server-sent-events
- https://upstash.com/blog/sse-streaming-llm-responses
- https://github.com/vercel/next.js/discussions/48427
- https://vercel.com/blog/an-introduction-to-streaming-on-the-web
- https://medium.com/@ammarbinshakir557/implementing-server-sent-events-sse-in-node-js-with-next-js-a-complete-guide-1adcdcb814fd
