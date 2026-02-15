# Research: Wiring Up the Dashboard Components

## EventSource API in React

- Create `EventSource` in `useEffect`, close on cleanup.
- Use `useRef` for the EventSource instance to avoid re-creation on re-renders.
- `eventSource.onmessage` for default events, `addEventListener` for named events.
- `eventSource.onerror` fires on connection loss; check `readyState` to determine action.

## Custom useEventSource Hook Pattern

```typescript
function useEventSource(url: string, options?: { events?: string[] }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('connecting');
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => setStatus('open');
    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) setStatus('closed');
    };
    es.onmessage = (event) => setData(JSON.parse(event.data));

    return () => es.close();
  }, [url]);

  return { data, status };
}
```

## Reconnection with Exponential Backoff

- Formula: `INITIAL_DELAY * Math.pow(2, retryCount)`
- Cap at 30 seconds: `Math.min(1000 * Math.pow(2, attempt), 30000)`
- Add jitter (up to 30% variance) to prevent thundering herd.
- Track retry count with `useRef`.
- Use `useCallback` for connect/disconnect to prevent unnecessary re-creation.

## Recharts for Streaming Data

- Recharts is built on D3 + React, uses SVG rendering.
- `LineChart`, `AreaChart` for time-series data.
- Keep a sliding window of data points (e.g., last 20) for performance.
- `isAnimationActive={false}` for frequent updates to prevent animation jank.
- Responsive: wrap in `ResponsiveContainer`.

## Memory Leak Prevention

- Always close EventSource in useEffect cleanup.
- Clear any setTimeout/setInterval refs on unmount.
- Use AbortController pattern for fetch-based SSE alternatives.

## Sources

- https://developer.mozilla.org/en-US/docs/Web/API/EventSource
- https://oneuptime.com/blog/post/2026-01-15-server-sent-events-sse-react/view
- https://gist.github.com/Mosharush/8bbc178bbc7e47c7c7c554dd7b5c5528
- https://github.com/alexanderkasten/use-next-sse
- https://github.com/recharts/recharts
- https://embeddable.com/blog/react-chart-libraries
- https://blog.logrocket.com/best-react-chart-libraries-2025/
- https://medium.com/@dlrnjstjs/implementing-react-sse-server-sent-events-real-time-notification-system-a999bb983d1b
