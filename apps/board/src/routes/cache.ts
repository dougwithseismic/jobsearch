import { Hono } from "hono";

type Bindings = {
  DB: D1Database;
  STATS_KV: KVNamespace;
  CACHE_PURGE_SECRET?: string;
};

const cacheRoute = new Hono<{ Bindings: Bindings }>();

/** Known API paths to purge from the edge cache. */
const CACHE_PATHS = ["/api/stats", "/api/jobs", "/api/search"];

cacheRoute.post("/cache/purge", async (c) => {
  // Require authorization
  const secret = c.env.CACHE_PURGE_SECRET;
  if (!secret) {
    return c.json({ error: "Cache purge not configured" }, 500);
  }

  const auth = c.req.header("Authorization");
  if (!auth || auth !== `Bearer ${secret}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const purged: string[] = [];
  const errors: string[] = [];

  // Purge KV stats
  try {
    await c.env.STATS_KV.delete("stats");
    purged.push("kv:stats");
  } catch (e) {
    errors.push(`kv:stats — ${e instanceof Error ? e.message : "unknown"}`);
  }

  // Purge edge cache for known paths
  try {
    const cache = (caches as unknown as { default: Cache }).default;
    const origin = new URL(c.req.url).origin;

    for (const path of CACHE_PATHS) {
      try {
        const key = new Request(`${origin}${path}`, { method: "GET" });
        const deleted = await cache.delete(key);
        if (deleted) purged.push(`cache:${path}`);
      } catch {
        errors.push(`cache:${path}`);
      }
    }
  } catch {
    errors.push("cache:unavailable (local dev?)");
  }

  return c.json({ ok: true, purged, errors: errors.length ? errors : undefined });
});

export { cacheRoute };
