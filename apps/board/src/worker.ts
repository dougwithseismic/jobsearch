import { Hono } from "hono";
import { cors } from "hono/cors";
import { jobsRoute } from "./routes/jobs";
import { searchRoute } from "./routes/search";
import { statsRoute } from "./routes/stats";
import { cacheRoute } from "./routes/cache";
import { edgeCache } from "./middleware/cache";
import { etag } from "./middleware/etag";

type Bindings = {
  DB: D1Database;
  ASSETS: Fetcher;
  STATS_KV: KVNamespace;
  CACHE_PURGE_SECRET?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("/api/*", cors());
app.use("/api/*", edgeCache);
app.use("/api/*", etag);

app.route("/api", jobsRoute);
app.route("/api", searchRoute);
app.route("/api", statsRoute);
app.route("/api", cacheRoute);

export type AppType = typeof app;
export default app;
