/**
 * Cloudflare Worker — slug API for job scrapers.
 *
 * GET /slugs/:platform        → newline-delimited slug list
 * GET /slugs/:platform?json   → JSON array
 * GET /slugs                  → list all platforms + counts
 * PUT /slugs/:platform        → upload slugs (requires AUTH_TOKEN header)
 */

interface Env {
  SLUGS: KVNamespace;
  AUTH_TOKEN?: string;
}

const PLATFORMS = [
  "greenhouse", "lever", "ashby", "workable",
  "smartrecruiters", "breezyhr", "personio", "recruitee",
];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for any consumer
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // GET /slugs — list all platforms with counts
    if (path === "/slugs" && request.method === "GET") {
      const summary: Record<string, { count: number; updatedAt: string | null }> = {};
      for (const platform of PLATFORMS) {
        const data = await env.SLUGS.get(platform);
        const meta = await env.SLUGS.get(`${platform}:meta`);
        const slugs = data ? data.split("\n").filter(Boolean) : [];
        summary[platform] = {
          count: slugs.length,
          updatedAt: meta ?? null,
        };
      }
      return new Response(JSON.stringify(summary, null, 2), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
      });
    }

    // Match /slugs/:platform
    const match = path.match(/^\/slugs\/([a-z-]+)$/);
    if (!match) {
      return new Response("Not found", { status: 404, headers: corsHeaders });
    }

    const platform = match[1]!;
    if (!PLATFORMS.includes(platform)) {
      return new Response(`Unknown platform: ${platform}`, { status: 404, headers: corsHeaders });
    }

    // PUT /slugs/:platform — upload slugs
    if (request.method === "PUT") {
      const token = request.headers.get("Authorization")?.replace("Bearer ", "");
      if (env.AUTH_TOKEN && token !== env.AUTH_TOKEN) {
        return new Response("Unauthorized", { status: 401, headers: corsHeaders });
      }

      const body = await request.text();
      const slugs = body.split("\n").map(s => s.trim()).filter(Boolean);

      await env.SLUGS.put(platform, slugs.join("\n"));
      await env.SLUGS.put(`${platform}:meta`, new Date().toISOString());

      return new Response(JSON.stringify({ platform, count: slugs.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /slugs/:platform — return slugs
    if (request.method === "GET") {
      const data = await env.SLUGS.get(platform);
      if (!data) {
        return new Response("", {
          headers: { ...corsHeaders, "Content-Type": "text/plain", "Cache-Control": "public, max-age=60" },
        });
      }

      const wantJson = url.searchParams.has("json");
      if (wantJson) {
        const slugs = data.split("\n").filter(Boolean);
        return new Response(JSON.stringify(slugs), {
          headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
        });
      }

      return new Response(data, {
        headers: { ...corsHeaders, "Content-Type": "text/plain", "Cache-Control": "public, max-age=3600" },
      });
    }

    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  },
};
