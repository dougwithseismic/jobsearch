import { createMiddleware } from "hono/factory";

/**
 * Simple hash function for generating ETags.
 * Uses the Web Crypto API (available in Workers) for a fast SHA-256 digest,
 * truncated to 16 hex chars for a compact weak ETag.
 */
async function quickHash(data: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", data);
  const arr = new Uint8Array(digest);
  let hex = "";
  for (let i = 0; i < 8; i++) {
    hex += arr[i].toString(16).padStart(2, "0");
  }
  return hex;
}

/**
 * ETag middleware. Generates a weak ETag from the response body hash.
 * Returns 304 Not Modified if the client sends a matching If-None-Match.
 */
export const etag = createMiddleware(async (c, next) => {
  // Only handle GET requests
  if (c.req.method !== "GET") {
    await next();
    return;
  }

  await next();

  // Only tag successful JSON responses
  if (c.res.status !== 200) return;

  try {
    const body = await c.res.clone().arrayBuffer();
    const hash = await quickHash(body);
    const etagValue = `W/"${hash}"`;

    // Check If-None-Match
    const ifNoneMatch = c.req.header("If-None-Match");
    if (ifNoneMatch && ifNoneMatch === etagValue) {
      c.res = new Response(null, {
        status: 304,
        headers: {
          ETag: etagValue,
          "Cache-Control": c.res.headers.get("Cache-Control") || "",
        },
      });
      return;
    }

    c.res.headers.set("ETag", etagValue);
  } catch {
    // If anything fails, just skip ETag — response still works
  }
});
