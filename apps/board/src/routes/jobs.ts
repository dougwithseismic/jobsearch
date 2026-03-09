import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { listJobs } from "../db/queries";

type Bindings = { DB: D1Database };

const jobsRoute = new Hono<{ Bindings: Bindings }>();

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  region: z.string().optional(),
  remote: z.enum(["true", "false"]).optional().transform((v) => v === "true"),
  source: z.string().optional(),
  company: z.string().optional(),
  since: z.string().optional(),
  sort: z.enum(["published_at", "company", "title", "location", "source"]).optional().default("published_at"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  cursor: z.string().optional(),
  direction: z.enum(["next", "prev"]).optional().default("next"),
  includeStale: z.enum(["true", "false"]).optional().transform((v) => v === "true"),
});

jobsRoute.get("/jobs", zValidator("query", querySchema), async (c) => {
  const filters = c.req.valid("query");
  const db = drizzle(c.env.DB);
  const result = await listJobs(db, filters);

  return c.json(result, 200, {
    "Cache-Control": "public, max-age=300",
  });
});

export { jobsRoute };
