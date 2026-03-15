# Apify Actor Management Guide

How to build, deploy, and manage the 9 job scraper Apify actors in this monorepo.

## Architecture

```
packages/{ats}-jobs/          # Scraper library (npm package)
  ├── src/index.ts            # Library code (discoverSlugs, scrapeAll, etc.)
  ├── bin/cli.ts              # CLI wrapper
  ├── .actor/                 # Apify schemas (shared with actor/)
  │   ├── actor.json
  │   ├── input_schema.json
  │   ├── output_schema.json
  │   ├── dataset_schema.json
  │   └── key_value_store_schema.json
  └── actor/                  # Apify actor (standalone deployable)
      ├── src/main.ts         # Actor entry point
      ├── dist/main.js        # Compiled JS (created by `tsc`)
      ├── package.json        # Actor deps (apify, scraper lib, job-ingest)
      ├── tsconfig.json
      └── Dockerfile          # Custom build with tsc step

packages/job-ingest/          # Shared normalizer + unified schema
  ├── src/normalizers/*.ts    # Per-ATS normalizers
  ├── src/unified-schema.ts   # UnifiedJob types
  ├── dist/                   # Compiled JS (created by `tsc`)
  └── package.json
```

## Actor IDs

| Actor | Apify ID | Apify Console |
|---|---|---|
| greenhouse-jobs | `shARfvH3khPvImoHN` | [Console](https://console.apify.com/actors/shARfvH3khPvImoHN) |
| lever-jobs | `5pVN3mj6brJ2d2wu7` | [Console](https://console.apify.com/actors/5pVN3mj6brJ2d2wu7) |
| ashby-jobs | `a6iPNVFsAtk8kaYsn` | [Console](https://console.apify.com/actors/a6iPNVFsAtk8kaYsn) |
| smartrecruiters-jobs | `lMLVODQUSYBL64bXW` | [Console](https://console.apify.com/actors/lMLVODQUSYBL64bXW) |
| workable-jobs | `uE5EBBxMaf8TsX6er` | [Console](https://console.apify.com/actors/uE5EBBxMaf8TsX6er) |
| breezyhr-jobs | `InPkj0WsiVCg08urt` | [Console](https://console.apify.com/actors/InPkj0WsiVCg08urt) |
| personio-jobs | `XYqex5DbPG1pqFDZ4` | [Console](https://console.apify.com/actors/XYqex5DbPG1pqFDZ4) |
| recruitee-jobs | `Re6ZHliubx6uZ4qlw` | [Console](https://console.apify.com/actors/Re6ZHliubx6uZ4qlw) |
| hn-jobs | `6yIzafQOIC3S6cnhm` | [Console](https://console.apify.com/actors/6yIzafQOIC3S6cnhm) |
| teamtailor-jobs | *not yet deployed* | — |
| pinpoint-jobs | *not yet deployed* | — |
| dover-jobs | `lOpx0Gw2cVtbKFfH0` | [Console](https://console.apify.com/actors/lOpx0Gw2cVtbKFfH0) |
| bamboohr-jobs | *not yet deployed* | — |
| jazzhr-jobs | *not yet deployed* | — |
| jobvite-jobs | `4g2y9UxVzo00MN5C7` | [Console](https://console.apify.com/actors/4g2y9UxVzo00MN5C7) |
| **deadlyaccuratejobs** | `99Iti3WKdLg9klIam` | [Console](https://console.apify.com/actors/99Iti3WKdLg9klIam) |

## Building & Deploying

### Prerequisites

```bash
npm install -g apify-cli    # Install Apify CLI
apify login                 # Authenticate (saves token to ~/.apify/auth.json)
```

### Deploy all actors

```bash
bash deploy-actors.sh
```

This script:
1. Builds `job-ingest` (compiles normalizers to JS)
2. Builds each scraper package
3. Builds each actor's TypeScript (`tsc` in actor/)
4. Packs scraper + job-ingest as tarballs (for `file:` refs — Apify uses npm, not pnpm)
5. Temporarily swaps `workspace:*` → `file:./xxx.tgz` in actor package.json
6. Runs `apify push --force`
7. Restores package.json and cleans up tarballs

### Deploy a single actor

```bash
cd packages/greenhouse-jobs/actor
# Build locally first
npx tsc
# Pack dependencies
cd ../../.. && pnpm --filter greenhouse-jobs pack --pack-destination packages/greenhouse-jobs/actor/
pnpm --filter @jobsearch/job-ingest pack --pack-destination packages/greenhouse-jobs/actor/
# Update package.json to file: refs, push, restore
cd packages/greenhouse-jobs/actor && apify push --force
```

### Why `workspace:*` doesn't work on Apify

Apify's Docker builder runs `npm install --only=prod`. npm doesn't support pnpm's `workspace:*` protocol. The deploy script works around this by packing dependencies as `.tgz` tarballs and using `file:./xxx.tgz` references during push.

### TypeScript actors on Apify

Each actor has a custom `Dockerfile` that includes a `tsc` build step:

```dockerfile
FROM apify/actor-node:20
COPY --chown=myuser:myuser package*.json ./
RUN npm --quiet set progress=false \
    && npm install --only=prod --no-optional
COPY --chown=myuser:myuser . ./
CMD ["node", "dist/main.js"]
```

The `dist/main.js` is pre-compiled locally by the deploy script. Apify doesn't need to run `tsc` — the compiled JS is included in the push.

## Apify API Reference

The CLI covers basic operations. For everything else, use the REST API.

### Authentication

```bash
# Get your token
cat ~/.apify/auth.json | jq .token

# All API calls use ?token=YOUR_TOKEN
TOKEN=$(python3 -c "import json; print(json.load(open('$HOME/.apify/auth.json'))['token'])")
```

### Actor Management (REST API)

```bash
# Get actor details
curl -s "https://api.apify.com/v2/acts/{ACTOR_ID}?token=${TOKEN}"

# Update actor metadata (title, description, pricing, etc.)
curl -X PUT "https://api.apify.com/v2/acts/{ACTOR_ID}?token=${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Actor Title",
    "description": "Max 300 chars",
    "seoTitle": "Max 60 chars",
    "seoDescription": "Max 160 chars",
    "notice": null,
    "isPublic": true,
    "categories": ["JOBS", "AUTOMATION"]
  }'

# Set pricing (price changes need startedAt 2+ weeks out)
curl -X PUT "https://api.apify.com/v2/acts/{ACTOR_ID}?token=${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "pricingInfos": [{
      "pricingModel": "PAY_PER_EVENT",
      "startedAt": "2026-04-01T00:00:00Z",
      "pricingPerEvent": {
        "actorChargeEvents": {
          "apify-actor-start": {
            "eventTitle": "Actor start",
            "eventPriceUsd": 0.00005,
            "isOneTimeEvent": true
          },
          "apify-default-dataset-item": {
            "eventTitle": "Result",
            "eventPriceUsd": 0.0015,
            "isPrimaryEvent": true
          }
        }
      }
    }]
  }'

# Set maintenance mode
curl -X PUT "https://api.apify.com/v2/acts/{ACTOR_ID}?token=${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"notice": "UNDER_MAINTENANCE"}'

# Remove maintenance mode
curl -X PUT "https://api.apify.com/v2/acts/{ACTOR_ID}?token=${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"notice": null}'

# Deprecate an actor
curl -X PUT "https://api.apify.com/v2/acts/{ACTOR_ID}?token=${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"isDeprecated": true}'
```

### Running Actors (REST API)

```bash
# Start a run
curl -X POST "https://api.apify.com/v2/acts/{ACTOR_ID}/runs?token=${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"mode": "companies", "companies": ["stripe"], "outputFormat": "unified"}'

# Check run status
curl -s "https://api.apify.com/v2/acts/{ACTOR_ID}/runs/last?token=${TOKEN}" | jq '.data.status'

# Get run logs
curl -s "https://api.apify.com/v2/acts/{ACTOR_ID}/runs/last/log?token=${TOKEN}"

# Get dataset items from a run
curl -s "https://api.apify.com/v2/acts/{ACTOR_ID}/runs/last/dataset/items?token=${TOKEN}"
```

### CLI Commands

```bash
apify login                    # Authenticate
apify push                     # Deploy actor from current dir
apify push --force             # Force deploy (overwrite remote changes)
apify run                      # Run actor locally
apify actors ls                # List your actors
apify actors info {ACTOR_ID}   # Get actor details
apify actors call {ACTOR_ID}   # Run actor remotely and wait for result
apify actors start {ACTOR_ID}  # Start actor remotely (don't wait)
apify actors build {ACTOR_ID}  # Trigger a build
```

### Field Limits

| Field | Max Length |
|---|---|
| `title` | No limit (but keep it readable) |
| `description` | 300 characters |
| `seoTitle` | 60 characters |
| `seoDescription` | 160 characters |

### Pricing Rules

- Price changes require `startedAt` at least **2 weeks** in the future
- To modify existing pricing, include the current pricing entry as prefix + new entry appended
- Actors without prior pricing can set it immediately with a future `startedAt`
- Use `PAY_PER_EVENT` model with `apify-default-dataset-item` as the primary event

## Slug Discovery

Slugs are served from Cloudflare Workers KV:

```
GET  https://job-slugs.wd40.workers.dev/slugs           # All platforms + counts
GET  https://job-slugs.wd40.workers.dev/slugs/greenhouse # Newline-delimited slugs
GET  https://job-slugs.wd40.workers.dev/slugs/lever?json # JSON array
PUT  https://job-slugs.wd40.workers.dev/slugs/greenhouse # Upload slugs (auth optional)
```

### Run discovery (requires SearXNG)

```bash
# Start SearXNG
docker run -d --name searxng -p 8888:8080 searxng/searxng

# Enable JSON format (first time only)
docker exec searxng python3 -c "
with open('/etc/searxng/settings.yml') as f: c=f.read()
c=c.replace('# formats:','formats:\n    - json\n    - html\n  # formats:')
with open('/etc/searxng/settings.yml','w') as f: f.write(c)
"
docker restart searxng

# Run discovery
npx tsx packages/job-ingest/discover.ts --platform all --max-queries 30 --pages 5

# Upload to Cloudflare
npx tsx packages/job-ingest/upload-slugs.ts --url https://job-slugs.wd40.workers.dev
```

## Output Format

All actors support 3 output modes via the `outputFormat` input:

- **`unified`** (default) — Normalized `UnifiedJob` with structured location, salary, company sub-objects
- **`raw`** — Native ATS format, no normalization
- **`both`** — Unified schema with original ATS data in the `raw` field

## Current Pricing

| Actor | Price/1K Results |
|---|---|
| Greenhouse | $1.50 |
| Lever | $1.50 |
| Ashby | $1.50 |
| Workable | $2.00 |
| SmartRecruiters | $1.00 |
| BreezyHR | $2.00 |
| Personio | $2.00 |
| Recruitee | $2.00 |
| HN Jobs | $0.50 |
| Dover | $2.00 |
