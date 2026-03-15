# job-slugs — Cloudflare KV Slug API

Cloudflare Worker that stores and serves company slugs for 8 ATS platforms via KV. The scrapers and `deadlyaccuratejobs` resolver fetch slugs from this API to know which companies exist on which platform.

**Supported platforms:** Greenhouse, Lever, Ashby, Workable, SmartRecruiters, BreezyHR, Personio, Recruitee

## API Endpoints

### `GET /slugs`

List all platforms with slug counts and last-updated timestamps.

```json
{
  "greenhouse": { "count": 581, "updatedAt": "2026-03-14T12:00:00.000Z" },
  "lever": { "count": 423, "updatedAt": "2026-03-14T12:00:00.000Z" }
}
```

**Cache:** `public, max-age=300` (5 minutes)

### `GET /slugs/:platform`

Returns newline-delimited slug list as `text/plain`.

```
stripe
notion
figma
```

Add `?json` for a JSON array response:

```json
["stripe", "notion", "figma"]
```

**Cache:** `public, max-age=3600` (1 hour)

### `PUT /slugs/:platform`

Upload slugs for a platform. Body is newline-delimited text.

```bash
curl -X PUT https://job-slugs.wd40.workers.dev/slugs/greenhouse \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: text/plain" \
  --data-binary @discovered/greenhouse-slugs.txt
```

**Response:**
```json
{ "platform": "greenhouse", "count": 581 }
```

**Auth:** Requires `Authorization: Bearer <token>` header. Token is set via the `AUTH_TOKEN` secret in the Worker environment.

## CORS

All responses include open CORS headers (`Access-Control-Allow-Origin: *`). The Worker handles `OPTIONS` preflight requests for `GET`, `PUT`, and `Content-Type`/`Authorization` headers.

## How slugs get populated

```
SearXNG (local Docker)
    |
    |  site:boards.greenhouse.io, site:jobs.lever.co, etc.
    v
discover.ts           Runs 30 search strategies per platform, extracts slugs from URLs
    |
    |  Saves to packages/job-ingest/discovered/{platform}-slugs.txt
    v
upload-slugs.ts       Reads .txt files, PUTs each to the Worker API
    |
    v
This Worker           Stores in Cloudflare KV, serves to scrapers + resolver
```

### Running discovery + upload

```bash
# 1. Start SearXNG
docker run -d --name searxng -p 8888:8080 searxng/searxng

# 2. Discover slugs (all platforms, or target one)
npx tsx packages/job-ingest/discover.ts
npx tsx packages/job-ingest/discover.ts --platform greenhouse --max-queries 10

# 3. Upload to the Worker
npx tsx packages/job-ingest/upload-slugs.ts \
  --url https://job-slugs.wd40.workers.dev \
  --token YOUR_AUTH_TOKEN
```

`upload-slugs.ts` also reads `SLUGS_API_URL` and `SLUGS_AUTH_TOKEN` from environment variables as defaults.

## Local development

```bash
cd packages/job-ingest/worker
npx wrangler dev
# Worker runs at http://localhost:8787
```

KV is simulated locally by Wrangler. Upload slugs against `http://localhost:8787` to test.

## Deployment

```bash
cd packages/job-ingest/worker
npx wrangler deploy

# Set the auth token secret (one-time)
npx wrangler secret put AUTH_TOKEN
```

**Worker name:** `job-slugs`
**KV namespace binding:** `SLUGS`

## Architecture

```
packages/job-ingest/worker/
├── src/
│   └── index.ts          # Worker entry point — routing, KV reads/writes, CORS
└── wrangler.toml         # Worker config + KV binding
```
