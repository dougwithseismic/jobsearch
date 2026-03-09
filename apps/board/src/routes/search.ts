import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { searchJobs, listJobs } from "../db/queries";

type Bindings = { DB: D1Database };

const searchRoute = new Hono<{ Bindings: Bindings }>();

const querySchema = z.object({
  q: z.string().optional().default(""),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  region: z.string().optional(),
  remote: z.enum(["true", "false"]).optional().transform((v) => v === "true"),
  source: z.string().optional(),
  since: z.string().optional(),
  sort: z.enum(["published_at", "company", "title", "location", "source"]).optional(),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  cursor: z.string().optional(),
  direction: z.enum(["next", "prev"]).optional().default("next"),
  includeStale: z.enum(["true", "false"]).optional().transform((v) => v === "true"),
});

searchRoute.get("/search", zValidator("query", querySchema), async (c) => {
  const { q, ...filters } = c.req.valid("query");
  const db = drizzle(c.env.DB);

  if (!q) {
    // No search query — fall back to listJobs (supports cursor pagination)
    const result = await listJobs(db, { ...filters, sort: filters.sort ?? "published_at" });
    return c.json(result, 200, { "Cache-Control": "public, max-age=300" });
  }

  const result = await searchJobs(db, c.env.DB, q, filters);
  return c.json(result, 200, { "Cache-Control": "public, max-age=60" });
});

export { searchRoute };
