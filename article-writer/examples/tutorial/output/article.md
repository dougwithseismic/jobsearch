# Build a Real-Time Dashboard with Next.js, Drizzle ORM, and Server-Sent Events

*A hands-on guide to streaming live data from Postgres to the browser without WebSockets, polling, or third-party services*

---

## Why Server-Sent Events Beat WebSockets for Dashboards

Every real-time tutorial starts the same way. You need live updates in the browser, so you reach for WebSockets. Thirty minutes later you're configuring a WebSocket server, wrestling with connection state, writing reconnection logic, and adding a heartbeat system to detect stale connections. You step back and realize: you're only sending data in one direction. The server pushes metrics to the client. The client never sends anything back. You just built a bidirectional highway to carry one-way traffic.

This is the exact scenario where [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) (SSE) shine. SSE is a browser-native API that's been supported since 2012. It opens a persistent HTTP connection, and the server pushes text-based events through it. No upgrade handshake. No new protocol. No additional server infrastructure. Just HTTP doing what HTTP does, with the connection held open.

The reason most developers overlook SSE is simple: WebSockets get all the attention. But when you compare the two head-to-head for dashboard use cases, SSE wins on nearly every dimension that matters.

| Feature | SSE | WebSocket | Polling |
|---|---|---|---|
| Data direction | Server to client | Bidirectional | Client to server to client |
| Protocol | Standard HTTP | WS (upgrade from HTTP) | Standard HTTP |
| Auto-reconnection | Built-in | You build it yourself | Not applicable |
| Binary data | Text only | Text and binary | Either |
| HTTP/2 multiplexing | Yes (100+ streams) | Separate TCP connection | Not applicable |
| Firewall friendly | Always | Sometimes blocked | Always |
| Implementation complexity | Low | Medium to high | Low |
| Best for | Dashboards, feeds, notifications | Chat, gaming, collaboration | Legacy systems, infrequent updates |

The companies building real-time products at scale already know this. The [Vercel AI SDK](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol) uses SSE as its default streaming protocol for LLM responses, handling connection drops, partial message reconstruction, and reconnection in roughly ten lines of code. OpenAI streams ChatGPT responses over SSE. The [Mercure](https://mercure.rocks/) hub provides an open-source SSE server that powers real-time features across the Symfony and API Platform ecosystems. These teams chose SSE not because they couldn't implement WebSockets, but because SSE was the right tool for unidirectional data.

One concern that used to hold SSE back was connection limits. Under HTTP/1.1, browsers enforce a hard limit of [six concurrent connections per domain](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) — and that's shared across all tabs. Open four tabs to the same dashboard and you've burned four of your six SSE slots. But HTTP/2 changed the game entirely. With [HTTP/2 multiplexing](https://www.smashingmagazine.com/2018/02/sse-websockets-data-flow-http2/), a single TCP connection carries up to 100 or more concurrent streams. Since an SSE connection is just a long-running HTTP request, your dashboard can maintain multiple named event streams without bumping into connection ceilings. Most modern hosting platforms serve HTTP/2 by default, so this limitation is effectively gone.

Here's what we're building in this tutorial: a live analytics dashboard that streams page view counts, active sessions, and event activity from Postgres to the browser using SSE. You'll get real-time metric counters with smooth animations, a streaming line chart that updates every two seconds, and a live activity feed of recent events. The server pushes all of it through a single Next.js route handler. No WebSocket server. No third-party real-time service. No polling intervals.

Let's set up the project.

---

## What You Need Before We Start

This tutorial uses a specific stack, and version alignment matters. Every dependency has been tested together, so pinning to these versions will save you from debugging compatibility issues when you should be building features. Here's exactly what we're working with:

- **[Next.js 15](https://nextjs.org/blog/next-15)** with the App Router (stable, Turbopack-powered dev server)
- **[Drizzle ORM](https://orm.drizzle.team/docs/get-started/postgresql-new)** for type-safe PostgreSQL access
- **[postgres](https://github.com/porsager/postgres)** (postgres-js) as the database driver — zero-dependency, fast
- **[Recharts](https://recharts.org)** for the streaming chart component
- **TypeScript** and **Tailwind CSS** (both included in the Next.js scaffold)
- **Node.js 20+** and **pnpm** as the package manager

We're using `postgres` (the postgres-js package) instead of `pg` for the database driver. It's a modern, zero-dependency Postgres client built specifically for JavaScript and TypeScript. It's faster in benchmarks, has a cleaner API, and is the driver that [Drizzle recommends](https://orm.drizzle.team/docs/get-started/postgresql-new) for new projects.

Start by scaffolding a new Next.js project:

```bash
pnpm create next-app@latest realtime-dashboard --typescript --tailwind --app --src-dir --eslint
```

Accept the defaults when prompted. The `--app` flag ensures you get the App Router (not the legacy Pages Router), and `--src-dir` keeps your code organized under a `src/` directory. Then install the remaining dependencies:

```bash
cd realtime-dashboard
pnpm add drizzle-orm postgres recharts
pnpm add -D drizzle-kit
```

The `drizzle-kit` package is a dev dependency because it's only used for schema migrations and the Studio UI — it never ships to production.

You'll need a PostgreSQL database. Pick whichever option suits your setup:

- **Docker** (quickest): `docker run --name dashboard-pg -e POSTGRES_PASSWORD=password -e POSTGRES_DB=dashboard -p 5432:5432 -d postgres:16`
- **[Neon](https://neon.tech)**: Free-tier serverless Postgres — create a project in the dashboard and copy the connection string
- **Local install**: `brew install postgresql@16` on macOS, then `createdb dashboard`

If you go with Docker, the container will be running in the background. You can stop it with `docker stop dashboard-pg` and restart it later with `docker start dashboard-pg`. Your data persists between restarts.

Create a `.env.local` file at the project root with your connection string:

```bash
# .env.local
DATABASE_URL="postgresql://postgres:password@localhost:5432/dashboard"
```

If you're using [Neon](https://neon.com/docs/guides/drizzle-migrations), your connection string will look different — it'll include the Neon host and require SSL. Copy it directly from the Neon dashboard.

Now add the Drizzle configuration file. Create `drizzle.config.ts` in the project root:

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

This configuration tells Drizzle Kit where to find your schema file, where to output migration files, and how to connect to the database. The `dialect` field is important — it tells the kit to generate PostgreSQL-compatible SQL.

After setup, your project structure should look like this:

```
realtime-dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/           ← we'll add schema, db, and seed files here
├── drizzle/            ← generated migrations land here
├── drizzle.config.ts
├── .env.local
├── package.json
└── tsconfig.json
```

With the project scaffolded and dependencies installed, let's design the data layer.

---

## Designing the Schema with Drizzle

Before writing any streaming code, you need data to stream. We'll design a schema that represents a realistic analytics dashboard: events flowing in, periodic metric snapshots being recorded, and the dashboard reading the latest data every few seconds.

[Drizzle ORM](https://orm.drizzle.team) takes a different approach from ORMs like Prisma. Instead of defining your schema in a separate DSL file and generating a client, you write your schema directly in TypeScript. Your table definitions are your types. There's no code generation step, no `prisma generate` to forget to run after schema changes. If you rename a column in the schema file and forget to update a query, TypeScript catches it at compile time. This matters most when you're iterating quickly on a feature like real-time data streaming, where the shape of your data flows through every layer of the stack.

Let's start with the database connection. Create `src/lib/db.ts`:

```typescript
// src/lib/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Prevent multiple connections during Next.js hot reload in development
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(connectionString);
if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });
```

The global singleton pattern is important here. Next.js hot-reloads your server code during development, and without this guard, every reload opens a new database connection. You'll exhaust your connection pool within minutes. The [Drizzle documentation](https://orm.drizzle.team/docs/get-started/postgresql-new) recommends this pattern for any framework with hot module replacement.

Now define the schema. Create `src/lib/schema.ts`:

```typescript
// src/lib/schema.ts
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  properties: jsonb("properties").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const metricsSnapshots = pgTable("metrics_snapshots", {
  id: serial("id").primaryKey(),
  pageViews: integer("page_views").notNull().default(0),
  activeSessions: integer("active_sessions").notNull().default(0),
  eventsCount: integer("events_count").notNull().default(0),
  recordedAt: timestamp("recorded_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Type inference — use these throughout your app
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type MetricsSnapshot = typeof metricsSnapshots.$inferSelect;
export type NewMetricsSnapshot = typeof metricsSnapshots.$inferInsert;
```

The `events` table captures individual actions — page views, button clicks, form submissions — with a flexible `jsonb` column for event-specific properties. The `metricsSnapshots` table stores periodic rollups: how many page views, active sessions, and total events at a given moment. In a production system, a background job would compute these snapshots. For this tutorial, we'll seed them directly.

The type inference on the last four lines is one of Drizzle's strongest features. `$inferSelect` gives you the shape of a row coming out of the database. `$inferInsert` gives you the shape of a row going in, with optional fields like `id` and `createdAt` correctly marked as optional. These types flow from your schema definition — if you add a column, every query that touches that table gets type-checked automatically.

Push the schema to your database. During development, [drizzle-kit push](https://orm.drizzle.team/docs/drizzle-kit-push) is the fastest way to sync your schema without creating migration files:

```bash
pnpm drizzle-kit push
```

For production, you'd use `drizzle-kit generate` to create versioned SQL migration files, then `drizzle-kit migrate` to apply them. But `push` keeps the feedback loop tight while you're building.

Now let's seed some data. Create `src/lib/seed.ts`:

```typescript
// src/lib/seed.ts
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { events, metricsSnapshots } from "./schema";

const connection = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(connection);

const EVENT_NAMES = [
  "page_view",
  "button_click",
  "form_submit",
  "signup",
  "purchase",
  "search",
  "file_upload",
  "share",
];

const PAGES = ["/", "/pricing", "/docs", "/blog", "/dashboard", "/settings"];

async function seed() {
  console.log("Seeding events...");

  // Insert 200 events spread over the last hour
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  const eventRows = Array.from({ length: 200 }, (_, i) => ({
    name: EVENT_NAMES[Math.floor(Math.random() * EVENT_NAMES.length)],
    properties: {
      page: PAGES[Math.floor(Math.random() * PAGES.length)],
      duration: Math.floor(Math.random() * 300),
      referrer: Math.random() > 0.5 ? "google" : "direct",
    },
    createdAt: new Date(now - Math.random() * oneHour),
  }));

  await db.insert(events).values(eventRows);
  console.log(`Inserted ${eventRows.length} events`);

  // Insert 30 metric snapshots, one every 2 minutes
  console.log("Seeding metric snapshots...");
  const snapshotRows = Array.from({ length: 30 }, (_, i) => ({
    pageViews: Math.floor(Math.random() * 500) + 100,
    activeSessions: Math.floor(Math.random() * 80) + 10,
    eventsCount: Math.floor(Math.random() * 200) + 50,
    recordedAt: new Date(now - i * 2 * 60 * 1000),
  }));

  await db.insert(metricsSnapshots).values(snapshotRows);
  console.log(`Inserted ${snapshotRows.length} snapshots`);

  await connection.end();
  console.log("Seed complete!");
}

seed().catch(console.error);
```

Run the seed script:

```bash
npx tsx src/lib/seed.ts
```

You should see confirmation that 200 events and 30 snapshots were inserted. If you want to verify, [Drizzle Studio](https://orm.drizzle.team/docs/kit-overview) gives you a visual browser: `pnpm drizzle-kit studio`.

With data in the database, let's stream it to the browser.

---

## Building the Streaming API Route

This is where the core of the tutorial lives. We're going to build a Next.js route handler that opens an SSE connection and pushes dashboard data to the client every two seconds. Before we write the code, let's understand what an SSE response actually looks like on the wire.

An SSE stream is just a long-lived HTTP response with a specific content type. The server sends text-based messages, each terminated by a double newline. The [MDN specification](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) defines four fields that each message can include:

```
event: metrics\n
id: 42\n
retry: 5000\n
data: {"pageViews": 1234, "activeSessions": 56}\n
\n
```

The `data` field carries the payload. The `event` field gives the message a name, letting clients subscribe to specific types. The `id` field allows the browser to resume from where it left off after a reconnection — it sends the last ID back as a `Last-Event-ID` header. The `retry` field tells the browser how many milliseconds to wait before reconnecting.

Now let's build the route. Create the file at `src/app/api/dashboard/stream/route.ts`:

```typescript
// src/app/api/dashboard/stream/route.ts
import { db } from "@/lib/db";
import { events, metricsSnapshots } from "@/lib/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Helper: format an SSE message
function formatSSE(event: string, data: unknown, id?: number): string {
  let message = "";
  if (event) message += `event: ${event}\n`;
  if (id !== undefined) message += `id: ${id}\n`;
  message += `data: ${JSON.stringify(data)}\n\n`;
  return message;
}

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  let eventId = 0;

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial retry interval (5 seconds)
      controller.enqueue(encoder.encode("retry: 5000\n\n"));

      const sendEvent = (event: string, data: unknown) => {
        eventId++;
        const formatted = formatSSE(event, data, eventId);
        controller.enqueue(encoder.encode(formatted));
      };

      const poll = async () => {
        try {
          // Fetch latest metrics snapshot
          const [latestMetrics] = await db
            .select()
            .from(metricsSnapshots)
            .orderBy(desc(metricsSnapshots.recordedAt))
            .limit(1);

          if (latestMetrics) {
            sendEvent("metrics", {
              pageViews: latestMetrics.pageViews,
              activeSessions: latestMetrics.activeSessions,
              eventsCount: latestMetrics.eventsCount,
              recordedAt: latestMetrics.recordedAt.toISOString(),
            });
          }

          // Fetch 5 most recent events for the activity feed
          const recentEvents = await db
            .select()
            .from(events)
            .orderBy(desc(events.createdAt))
            .limit(5);

          sendEvent("activity", recentEvents);

          // Send heartbeat comment to keep connection alive
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch (err) {
          console.error("SSE poll error:", err);
        }
      };

      // Send first batch immediately
      await poll();

      // Then poll every 2 seconds
      const interval = setInterval(poll, 2000);

      // Cleanup when client disconnects
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
```

Let's break down the key decisions in this code.

The `export const dynamic = "force-dynamic"` directive tells Next.js to never cache this route. Without it, Next.js might try to statically optimize the response, which would kill the stream. This is a common gotcha in the [Next.js App Router](https://nextjs.org/learn/dashboard-app/streaming) when working with streaming responses.

The `formatSSE` helper builds correctly-formatted SSE messages. Each message gets a named `event` field so the client can distinguish between metric updates and activity feed updates. The `id` field increments with every message, giving the browser a checkpoint for reconnection.

The `ReadableStream` is the engine of the whole operation. Its `start` callback runs once when the stream opens. Inside, we set up a polling loop with `setInterval` that queries Drizzle every two seconds. Each poll fetches the latest metrics snapshot and the five most recent events, then pushes them as named SSE events through the stream controller.

The heartbeat comment (`: heartbeat\n\n`) is a line that starts with a colon, which the SSE spec defines as a comment — the client ignores it. But it keeps data flowing through the connection, preventing reverse proxies and load balancers from closing what looks like an idle connection. [Vercel's streaming documentation](https://vercel.com/blog/an-introduction-to-streaming-on-the-web) recommends heartbeats for any production SSE endpoint.

Client disconnection handling uses `request.signal`, which is an [AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) that fires when the browser closes the connection. We listen for the `abort` event to clear the interval and close the stream controller, preventing the server from polling the database for a client that no longer exists.

The response headers are critical. `Content-Type: text/event-stream` tells the browser this is an SSE stream. `Cache-Control: no-cache, no-transform` prevents CDNs and proxies from buffering the response. `X-Accel-Buffering: no` specifically disables buffering in Nginx, which is common in containerized deployments.

Before building the frontend, test the endpoint with curl:

```bash
curl -N http://localhost:3000/api/dashboard/stream
```

The `-N` flag disables curl's output buffering. You should see a stream of events appearing every two seconds:

```
retry: 5000

event: metrics
id: 1
data: {"pageViews":342,"activeSessions":47,"eventsCount":156,"recordedAt":"2026-02-06T10:30:00.000Z"}

event: activity
id: 2
data: [{"id":200,"name":"page_view","properties":{"page":"/pricing"},"createdAt":"2026-02-06T10:29:55.000Z"}]

: heartbeat
```

The server is streaming. Time to consume it in React.

---

## Wiring Up the Dashboard Components

The server is pushing events. Now we need React components that listen to the stream, parse the data, and render a live dashboard. We'll build this in three layers: a reusable `useEventSource` hook that manages the SSE connection, individual dashboard widgets that display specific data, and a page that ties everything together.

Start with the custom hook. Create `src/hooks/use-event-source.ts`:

```typescript
// src/hooks/use-event-source.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type ConnectionStatus = "connecting" | "open" | "closed" | "error";

interface UseEventSourceOptions {
  onMessage?: (event: MessageEvent) => void;
  events?: Record<string, (data: unknown) => void>;
}

export function useEventSource(
  url: string,
  options: UseEventSourceOptions = {}
) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const esRef = useRef<EventSource | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const connect = useCallback(() => {
    // Close existing connection if any
    if (esRef.current) {
      esRef.current.close();
    }

    setStatus("connecting");
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => {
      setStatus("open");
    };

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) {
        setStatus("closed");
      } else {
        setStatus("error");
      }
    };

    // Default message handler
    es.onmessage = (event) => {
      optionsRef.current.onMessage?.(event);
    };

    // Named event handlers
    const currentEvents = optionsRef.current.events;
    if (currentEvents) {
      Object.entries(currentEvents).forEach(([eventName, handler]) => {
        es.addEventListener(eventName, ((event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            handler(data);
          } catch {
            handler(event.data);
          }
        }) as EventListener);
      });
    }

    return es;
  }, [url]);

  useEffect(() => {
    const es = connect();

    return () => {
      es.close();
      setStatus("closed");
    };
  }, [connect]);

  return { status };
}
```

This hook does several important things. It wraps the browser's native [EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) and tracks connection status through four states: connecting, open, closed, and error. The `events` option lets callers subscribe to named event types — this maps directly to the `event:` field in our SSE messages. We use `addEventListener` instead of `onmessage` because `onmessage` only fires for unnamed events, while `addEventListener` catches events with specific names like "metrics" and "activity".

The `useRef` for the options object is a pattern that prevents stale closures. Without it, the event listeners would capture the initial options and never see updates. By reading from `optionsRef.current` inside the handlers, we always use the latest callbacks without needing to tear down and rebuild the EventSource connection when handlers change.

Now let's build the dashboard widgets. Create `src/components/metric-card.tsx`:

```typescript
// src/components/metric-card.tsx
"use client";

interface MetricCardProps {
  label: string;
  value: number;
  icon: string;
}

export function MetricCard({ label, value, icon }: MetricCardProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p
        className="mt-2 text-3xl font-bold tabular-nums tracking-tight
                   transition-all duration-500 ease-out"
      >
        {value.toLocaleString()}
      </p>
    </div>
  );
}
```

The `tabular-nums` class from Tailwind ensures digits have equal widths, so the number doesn't jitter horizontally as it changes. The `transition-all duration-500` gives a smooth visual update when new values arrive.

Next, the activity feed. Create `src/components/activity-feed.tsx`:

```typescript
// src/components/activity-feed.tsx
"use client";

import type { Event } from "@/lib/schema";

interface ActivityFeedProps {
  events: Event[];
}

const EVENT_LABELS: Record<string, string> = {
  page_view: "Viewed a page",
  button_click: "Clicked a button",
  form_submit: "Submitted a form",
  signup: "Created an account",
  purchase: "Made a purchase",
  search: "Searched for something",
  file_upload: "Uploaded a file",
  share: "Shared content",
};

export function ActivityFeed({ events }: ActivityFeedProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 mb-4">
        Recent Activity
      </h3>
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between py-2
                       border-b last:border-0 animate-in fade-in duration-300"
          >
            <div>
              <p className="text-sm font-medium">
                {EVENT_LABELS[event.name] ?? event.name}
              </p>
              <p className="text-xs text-gray-400">
                {(event.properties as Record<string, unknown>)?.page as string}
              </p>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(event.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

Now the streaming chart. Create `src/components/streaming-chart.tsx`:

```typescript
// src/components/streaming-chart.tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  time: string;
  pageViews: number;
  activeSessions: number;
}

interface StreamingChartProps {
  data: DataPoint[];
}

export function StreamingChart({ data }: StreamingChartProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 mb-4">
        Live Metrics
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
          />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="pageViews"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="activeSessions"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

Notice `isAnimationActive={false}` on both `Line` components. When data updates every two seconds, [Recharts](https://recharts.org) animation causes visual stuttering because each new data point triggers a full re-animation. Disabling animation gives you clean, instant updates. The `dot={false}` prop removes circle markers from each data point, keeping the chart clean when data is dense.

We wrap the chart in a `ResponsiveContainer` so it scales to its parent's width. This is a [Recharts best practice](https://recharts.org/en-US/api/ResponsiveContainer) — without it, the chart renders at zero width inside flex containers.

Now tie everything together. Create `src/components/dashboard-client.tsx`:

```typescript
// src/components/dashboard-client.tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { useEventSource } from "@/hooks/use-event-source";
import { MetricCard } from "./metric-card";
import { ActivityFeed } from "./activity-feed";
import { StreamingChart } from "./streaming-chart";
import type { Event } from "@/lib/schema";

interface Metrics {
  pageViews: number;
  activeSessions: number;
  eventsCount: number;
  recordedAt: string;
}

interface ChartDataPoint {
  time: string;
  pageViews: number;
  activeSessions: number;
}

const MAX_CHART_POINTS = 20;

export function DashboardClient() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [activity, setActivity] = useState<Event[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const chartDataRef = useRef<ChartDataPoint[]>([]);

  const handleMetrics = useCallback((data: unknown) => {
    const m = data as Metrics;
    setMetrics(m);

    // Append to chart data with a sliding window
    const point: ChartDataPoint = {
      time: new Date(m.recordedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      pageViews: m.pageViews,
      activeSessions: m.activeSessions,
    };

    const updated = [...chartDataRef.current, point].slice(-MAX_CHART_POINTS);
    chartDataRef.current = updated;
    setChartData(updated);
  }, []);

  const handleActivity = useCallback((data: unknown) => {
    setActivity(data as Event[]);
  }, []);

  const { status } = useEventSource("/api/dashboard/stream", {
    events: {
      metrics: handleMetrics,
      activity: handleActivity,
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Live Dashboard</h1>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                status === "open"
                  ? "bg-green-500"
                  : status === "connecting"
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-500 capitalize">{status}</span>
          </div>
        </div>

        {/* Metric cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            label="Page Views"
            value={metrics?.pageViews ?? 0}
            icon="👁"
          />
          <MetricCard
            label="Active Sessions"
            value={metrics?.activeSessions ?? 0}
            icon="⚡"
          />
          <MetricCard
            label="Events"
            value={metrics?.eventsCount ?? 0}
            icon="📊"
          />
        </div>

        {/* Chart and activity feed */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <StreamingChart data={chartData} />
          </div>
          <div>
            <ActivityFeed events={activity} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

The `DashboardClient` component is where all the data flows converge. It subscribes to two named events — "metrics" and "activity" — and distributes the incoming data to the appropriate widgets. The chart maintains a sliding window of the last 20 data points using a ref (to avoid stale closure issues in the callback) alongside the state (to trigger re-renders).

The connection status indicator in the header gives users immediate feedback about the stream state. A green dot means connected, yellow means connecting, and red means disconnected. This small detail matters in production — users should never wonder whether they're seeing stale data.

Finally, update the main page. Replace `src/app/page.tsx`:

```typescript
// src/app/page.tsx
import { DashboardClient } from "@/components/dashboard-client";

export default function Home() {
  return <DashboardClient />;
}
```

Run `pnpm dev`, open `http://localhost:3000`, and you should see the dashboard updating in real time. The metric cards tick up, the chart extends to the right, and the activity feed shows the latest events. All of it powered by a single HTTP connection streaming SSE from a Next.js route handler.

It works on localhost. But production has different rules.

---

## Making It Production-Ready

The dashboard you've built works great in development. But between your local machine and a production deployment, there's a gap filled with reverse proxies, load balancers, flaky mobile connections, and authentication requirements. Let's close that gap.

### Reconnection That Actually Works

The [EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) has built-in reconnection — when the connection drops, the browser automatically tries to reconnect after a delay (default 3 seconds, or whatever the server sent in the `retry` field). But this flat retry interval is dangerous at scale. If your server restarts and 500 clients all reconnect at the exact same second, you've created a thundering herd that can knock the server right back down.

The fix is exponential backoff with jitter. Here's an enhanced version of the hook:

```typescript
// src/hooks/use-event-source-resilient.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type ConnectionStatus = "connecting" | "open" | "closed" | "error";

interface UseResilientEventSourceOptions {
  events?: Record<string, (data: unknown) => void>;
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
}

export function useResilientEventSource(
  url: string,
  options: UseResilientEventSourceOptions = {}
) {
  const {
    maxRetries = 10,
    initialDelay = 1000,
    maxDelay = 30000,
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const esRef = useRef<EventSource | null>(null);
  const retriesRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close();

    setStatus("connecting");
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => {
      setStatus("open");
      retriesRef.current = 0; // Reset on successful connection
    };

    es.onerror = () => {
      es.close();

      if (retriesRef.current >= maxRetries) {
        setStatus("closed");
        return;
      }

      setStatus("error");

      // Exponential backoff with jitter
      const delay = Math.min(
        initialDelay * Math.pow(2, retriesRef.current),
        maxDelay
      );
      const jitter = delay * (0.7 + Math.random() * 0.3);

      retriesRef.current++;

      timeoutRef.current = setTimeout(() => {
        connect();
      }, jitter);
    };

    // Register named event handlers
    const currentEvents = optionsRef.current.events;
    if (currentEvents) {
      Object.entries(currentEvents).forEach(([eventName, handler]) => {
        es.addEventListener(eventName, ((event: MessageEvent) => {
          try {
            handler(JSON.parse(event.data));
          } catch {
            handler(event.data);
          }
        }) as EventListener);
      });
    }
  }, [url, maxRetries, initialDelay, maxDelay]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
      clearTimeout(timeoutRef.current);
    };
  }, [connect]);

  return { status, retries: retriesRef.current };
}
```

The backoff formula `initialDelay * 2^retryCount` doubles the wait on each failure: 1s, 2s, 4s, 8s, 16s, capping at 30 seconds. The jitter multiplier randomizes each client's delay within a 70-100% range of the calculated value, spreading reconnection attempts across time instead of clustering them.

### Heartbeats and Stale Connection Detection

The server-side heartbeat we added earlier (the `: heartbeat\n\n` comment) keeps the connection alive through infrastructure that kills idle connections. But you also need client-side detection. If the client hasn't received any data — including heartbeats — for longer than expected, the connection is probably stale. Add a heartbeat timeout to the hook that forces a reconnect after 45 seconds of silence. The server sends heartbeats with every poll cycle (every 2 seconds), so 45 seconds of silence is a strong signal that something is broken.

### Authenticating the SSE Connection

Here's a gotcha that trips up nearly every developer working with SSE for the first time: the [EventSource API does not support custom headers](https://developer.mozilla.org/en-US/docs/Web/API/EventSource). You cannot send an `Authorization: Bearer` header. This is a browser limitation that's been the subject of debate since the API was introduced, and it's not changing.

You have two practical options. The simplest is cookie-based authentication. If your app uses [NextAuth.js](https://authjs.dev/getting-started/session-management/protecting) or any session-based auth, cookies are sent automatically with EventSource requests because they're same-origin HTTP requests. No code changes needed.

If you need token-based auth, pass the token as a query parameter:

```typescript
// Client-side
const es = new EventSource(`/api/dashboard/stream?token=${sessionToken}`);
```

Then validate in the route handler or, better yet, in [Next.js middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware):

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/dashboard/stream")) {
    const token = request.nextUrl.searchParams.get("token");
    const session = request.cookies.get("session")?.value;

    if (!token && !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate the token or session here
  }

  return NextResponse.next();
}
```

Passing tokens in query parameters means they'll appear in server access logs and browser history. Use short-lived tokens (5-10 minute expiry) and rotate them. For most applications, cookie-based auth is simpler and more secure.

### Connection Limits Across Browsers

Under HTTP/1.1, the six-connection-per-domain limit is real and painful. If a user opens your dashboard in three tabs, that's three SSE connections, leaving only three for everything else — XHR, image loading, other API calls. The [Smashing Magazine article on SSE with HTTP/2](https://www.smashingmagazine.com/2018/02/sse-websockets-data-flow-http2/) explains this well: the limit exists at the browser level and is enforced across all tabs.

HTTP/2 multiplexing solves this completely. Under HTTP/2, all streams — SSE connections, API calls, asset loads — share a single TCP connection with up to 100+ concurrent streams. Most hosting platforms serve HTTP/2 by default: [Vercel](https://vercel.com), [Railway](https://docs.railway.com/maturity/compare-to-vercel), Fly.io, and Cloudflare all do. If you're running Nginx yourself, make sure `http2` is enabled in your server block.

### Beyond Polling with Postgres LISTEN/NOTIFY

Our route handler polls the database every two seconds. It works, but polling means the server queries the database even when nothing has changed. For a busier application, [Postgres LISTEN/NOTIFY](https://www.postgresql.org/docs/current/sql-notify.html) provides true push-based updates. The database tells the server when data changes, and the server forwards that to SSE clients.

The pattern works like this: create a database trigger that fires `NOTIFY` when rows are inserted into the events table. On the server side, one persistent connection runs `LISTEN` on that channel. When a notification arrives, the server pushes it to all connected SSE clients.

```sql
-- Postgres trigger (run this via a migration)
CREATE OR REPLACE FUNCTION notify_new_event()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('new_event', row_to_json(NEW)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_insert_trigger
AFTER INSERT ON events
FOR EACH ROW EXECUTE FUNCTION notify_new_event();
```

The `postgres-js` driver supports this natively with its `.listen()` method. One important consideration: each LISTEN connection is a dedicated [PostgreSQL connection](https://www.pedroalonso.net/blog/postgres-listen-notify-real-time/), so you'd use one per server instance, not one per client. The server maintains a single listener and fans out notifications to all connected SSE streams.

### Where to Deploy

Your deployment platform choice matters more for SSE than for typical web apps because SSE connections are long-lived.

[Vercel's serverless functions](https://vercel.com/kb/guide/what-can-i-do-about-vercel-serverless-functions-timing-out) have a maximum execution time of 60 seconds on the free plan and up to 800 seconds on paid plans. That means your SSE connections will be forcibly closed at those intervals. The client will automatically reconnect (using the backoff logic we built), but you'll get brief gaps in your data stream. This is fine for demos and low-traffic dashboards.

[Railway](https://docs.railway.com/maturity/compare-to-vercel) runs your code on long-lived servers with no timeout limits. Your SSE connections stay open indefinitely. This is the best fit for a production real-time dashboard.

[Fly.io](https://fly.io) offers container-based deployments with global regions and first-class support for long-running connections. If your users are geographically distributed, Fly's edge compute model reduces latency on the initial SSE connection.

**Production checklist:**

- Exponential backoff with jitter in the client
- Server-side heartbeats every 15 seconds
- Cookie or short-lived token authentication
- HTTP/2 enabled on your deployment
- Connection cleanup on server when clients disconnect

You've built something real. Here's where to take it next.

---

## Where to Go from Here

Let's step back and look at what you've built. Starting from an empty Next.js project, you created a type-safe database layer with Drizzle ORM, a streaming API route that pushes SSE events, a set of React components that render live data, and production-hardening logic that handles the things most tutorials skip. The entire real-time pipeline — from Postgres rows to animated dashboard widgets — runs on standard HTTP with zero additional infrastructure.

The architectural decision at the center of this tutorial was choosing SSE over WebSockets for unidirectional data. That choice gave you automatic reconnection for free, compatibility with every HTTP proxy and CDN, and an implementation so thin you can read every line without scrolling. When someone asks you why you didn't use WebSockets, the answer is simple: you didn't need bidirectional communication, so you used the tool designed for one-way streaming.

There are several directions you can take this project from here.

**Replace polling with Postgres LISTEN/NOTIFY.** We showed the SQL trigger in the production section. Wiring it into the SSE route eliminates unnecessary database queries and makes updates truly instant. The [Postgres documentation on LISTEN](https://www.postgresql.org/docs/current/sql-listen.html) and [NOTIFY](https://www.postgresql.org/docs/current/sql-notify.html) covers the full protocol, and the `postgres-js` driver has built-in support.

**Add Redis Pub/Sub for multi-instance deployments.** If you deploy multiple server instances behind a load balancer, each instance only sees its own SSE clients. Redis Pub/Sub acts as a message bus: any instance can publish an event, and all instances receive it to forward to their connected clients. [Upstash](https://upstash.com/blog/sse-streaming-llm-responses) offers a serverless Redis that works well with Next.js.

**Upgrade to WebSockets for bidirectional features.** If your dashboard evolves to include user interactions — filtering data, triggering actions, collaborative annotations — SSE won't cover it. WebSockets give you a full duplex channel. The good news is that the data layer (Drizzle schema, database queries) and the component structure (metric cards, charts, feeds) transfer directly. You're only replacing the transport.

**Explore WebTransport.** Built on HTTP/3 and QUIC, [WebTransport](https://rxdb.info/articles/websockets-sse-polling-webrtc-webtransport.html) is an emerging protocol that offers bidirectional streaming with lower latency than WebSockets. Browser support is still growing, but it's worth watching for latency-sensitive applications.

When should you graduate from SSE? The thresholds are practical, not theoretical. If you need the client to send data back through the same connection, use WebSockets. If you need to transfer binary data (images, audio, files), use WebSockets. If you're scaling past 100,000 concurrent connections and need fine-grained control over the transport layer, evaluate WebSockets or WebTransport. For everything else — dashboards, notification feeds, live scores, activity streams, AI response streaming — [SSE handles it](https://softwaremill.com/sse-vs-websockets-comparing-real-time-communication-protocols/) with less code, less complexity, and less infrastructure.

For further reading, the [MDN guide on Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) is the definitive reference for the EventSource API and the SSE wire format. The [Drizzle ORM documentation](https://orm.drizzle.team) covers everything from schema design to advanced query patterns. The [Recharts API reference](https://recharts.org) has examples for every chart type. And the [Next.js streaming tutorial](https://nextjs.org/learn/dashboard-app/streaming) shows how the framework handles streaming responses at the architecture level.

You now own the entire pipeline. No vendor lock-in, no monthly bill for a real-time service, no black-box library that handles reconnection in ways you can't debug. Every line of code is yours to understand, modify, and deploy wherever you want. That's the real advantage of building with standards.
