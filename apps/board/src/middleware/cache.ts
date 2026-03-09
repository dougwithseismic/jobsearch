import { createMiddleware } from "hono/factory";

type Bindings = {
  DB: D1Database;
  ASSETS: Fetcher;
  STATS_KV: KVNamespace;
  CACHE_PURGE_SECRET?: string;
};

/** Cloudflare's CacheStorage has a `default` property that the DOM type doesn't. */
function getDefaultCache(): Cache | undefined {
  try {
    return (caches as unknown as { default: Cache }).default;
  } catch {
    return undefined;
  }
}

/**
 * Returns the Cache-Control header value based on the request path.
 */
function getCacheControl(path: string): string {
  if (path.startsWith("/api/stats")) {
    return "public, max-age=600, stale-while-revalidate=300";
  }
  if (path.startsWith("/api/jobs")) {
    return "public, max-age=300, stale-while-revalidate=300";
  }
  if (path.startsWith("/api/search")) {
    return "public, max-age=120, stale-while-revalidate=300";
  }
  return "public, max-age=60";
}

/**
 * Cloudflare Cache API middleware for edge CDN caching.
 * Wraps all /api/* routes. Falls through gracefully in local dev
 * where caches.default is not available.
 */
export const edgeCache = createMiddleware<{ Bindings: Bindings }>(
  async (c, next) => {
    // Only cache GET requests
    if (c.req.method !== "GET") {
      await next();
      return;
    }

    const url = c.req.url;
    const cacheKey = new Request(url, { method: "GET" });

    const cache = getDefaultCache();
    if (!cache) {
      // Cache API not available (local dev) — fall through
      await next();
      return;
    }

    // Check cache
    try {
      const cached = await cache.match(cacheKey);
      if (cached) {
        // Return cached response directly, skip handler entirely
        const res = new Response(cached.body, cached);
        res.headers.set("X-Cache", "HIT");
        c.res = res;
        return;
      }
    } catch {
      // Cache match failed — fall through to handler
    }

    // Cache MISS — run the handler
    await next();

    // Only cache successful responses
    if (c.res.status !== 200) return;

    const path = new URL(url).pathname;
    const cacheControl = getCacheControl(path);

    // Clone the response so we can store it and still return it
    try {
      const resBody = await c.res.clone().arrayBuffer();
      const cachedResponse = new Response(resBody, {
        status: c.res.status,
        headers: c.res.headers,
      });
      cachedResponse.headers.set("Cache-Control", cacheControl);
      cachedResponse.headers.set("X-Cache", "MISS");

      // cache.put is fire-and-forget — don't await in hot path
      c.executionCtx.waitUntil(cache.put(cacheKey, cachedResponse));
    } catch {
      // Cache put failed — no problem, response still goes through
    }

    // Set headers on the actual response
    c.res.headers.set("Cache-Control", cacheControl);
    c.res.headers.set("X-Cache", "MISS");
  },
);
