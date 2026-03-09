import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { getStats } from "../db/queries";

type Bindings = { DB: D1Database; STATS_KV: KVNamespace };

const statsRoute = new Hono<{ Bindings: Bindings }>();

const STATS_KV_KEY = "stats";
const STATS_KV_TTL = 900; // 15 minutes

statsRoute.get("/stats", async (c) => {
  // Try KV first — sub-millisecond, globally replicated
  try {
    const cached = await c.env.STATS_KV.get(STATS_KV_KEY);
    if (cached) {
      return c.json(JSON.parse(cached), 200, {
        "Cache-Control": "public, max-age=600, stale-while-revalidate=300",
        "X-Stats-Source": "kv",
      });
    }
  } catch {
    // KV unavailable (local dev or error) — fall through to D1
  }

  // KV miss — query D1
  const db = drizzle(c.env.DB);
  const stats = await getStats(db);

  // Write back to KV in the background
  try {
    c.executionCtx.waitUntil(
      c.env.STATS_KV.put(STATS_KV_KEY, JSON.stringify(stats), {
        expirationTtl: STATS_KV_TTL,
      }),
    );
  } catch {
    // KV write failed — no problem
  }

  return c.json(stats, 200, {
    "Cache-Control": "public, max-age=600, stale-while-revalidate=300",
    "X-Stats-Source": "d1",
  });
});

export { statsRoute };
