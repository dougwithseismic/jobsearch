# CI/CD Pipeline & Best Practices

## Pipeline overview

```
                   ┌─────────────┐
                   │  PR / Push  │
                   └──────┬──────┘
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
         ┌────────┐  ┌────────┐  ┌──────────┐
         │  Test  │  │ Resolve│  │  Type    │
         │ (unit) │  │ Smoke  │  │  Check   │
         └───┬────┘  └───┬────┘  └────┬─────┘
             │           │            │
             └───────────┼────────────┘
                         │
                    ┌────┴────┐
                    │  Merge  │
                    └────┬────┘
                         │
           ┌─────────────┼─────────────┐
           ▼             ▼             ▼
      ┌─────────┐  ┌──────────┐  ┌──────────┐
      │ Deploy  │  │  Ingest  │  │ Discover │
      │ (board) │  │  (4x/day)│  │ (weekly) │
      └─────────┘  └──────────┘  └──────────┘
```

## Workflows

### 1. `deadlyaccuratejobs.yml` — CI for this package

**Triggers:**
- Push to `main` touching `packages/deadlyaccuratejobs/**` or normalizer/schema files
- PRs touching the same paths
- Manual dispatch with optional company name + smoke test toggle

**Jobs:**

| Job | When | Timeout | What it does |
|-----|------|---------|-------------|
| `test` | Always | 5min | `vitest run` + `tsc --noEmit` |
| `resolve-smoke` | Always | 3min | Hits live KV API, resolves Stripe/Notion/Spotify, checks stats |
| `scrape-smoke` | Manual only | 10min | Full end-to-end: resolve + scrape + filter + JSON output |
| `discover-slugs` | Manual only | 60min | SearXNG discovery per platform (matrix), uploads to KV |

**Concurrency:** Cancels in-progress runs on same branch. Prevents wasted compute on rapid pushes.

### 2. `ingest.yml` — Existing pipeline (runs 4x daily)

Scrapes all 9 ATS platforms via `job-ingest`, exports SQL, pushes to D1.

deadlyaccuratejobs doesn't need its own scheduled scrape — it scrapes on-demand when you search. The ingest pipeline keeps the D1 database fresh for the board app.

### 3. `deploy.yml` — Deploys board app on push to main

Triggered by changes to `apps/board/**` or `packages/**`. Runs `wrangler deploy`.

## Secrets

| Secret | Used by | Purpose |
|--------|---------|---------|
| `CLOUDFLARE_API_TOKEN` | ingest, deploy | D1 access + wrangler deploy |
| `CLOUDFLARE_ACCOUNT_ID` | ingest, deploy | Account identification |
| `CLOUDFLARE_ZONE_ID` | ingest | Cache purge after D1 push |
| `SLUGS_AUTH_TOKEN` | discover-slugs | Authenticated PUT to KV Worker |

## Best practices

### 1. Test pyramid

```
                    ┌─────────┐
                    │  Smoke  │  ← Live API (resolve-smoke, scrape-smoke)
                   ┌┴─────────┴┐
                   │Integration │  ← resolver.test.ts (hits KV API)
                  ┌┴───────────┴┐
                  │    Unit     │  ← filters.test.ts (pure logic, no network)
                  └─────────────┘
```

- **Unit tests** run on every push. Fast, deterministic, no network.
- **Integration tests** (resolver) hit the live KV API but don't scrape. Cheap and fast (<200ms).
- **Smoke tests** (scrape) only run on manual trigger. Hit external ATS APIs — expensive, slow, rate-limit-sensitive.

### 2. Path-scoped triggers

Only run CI when relevant files change:

```yaml
paths:
  - 'packages/deadlyaccuratejobs/**'
  - 'packages/job-ingest/src/normalizers/**'    # Normalizer changes affect output
  - 'packages/job-ingest/src/scraper-factory.ts' # Adapter changes affect scraping
  - 'packages/job-ingest/src/unified-schema.ts'  # Schema changes affect types
```

Individual scraper package changes (`packages/greenhouse-jobs/**`) don't trigger this workflow — they have their own tests. But normalizer changes do, because they affect the unified output.

### 3. Concurrency control

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

If you push 3 commits in quick succession, only the last one runs. The previous two are cancelled. Saves ~80% of wasted CI minutes on rapid iteration.

### 4. Matrix strategy for discovery

The `discover-slugs` job uses a matrix across 8 platforms:

```yaml
strategy:
  matrix:
    platform: [greenhouse, lever, ashby, workable, ...]
  fail-fast: false
```

`fail-fast: false` means if BreezyHR discovery fails, the other 7 platforms still complete. SearXNG can be flaky with rate limiting — one platform failing shouldn't block the others.

### 5. Artifact handling

- **Slug files** are uploaded as artifacts (7-day retention) so you can download and inspect them even if KV upload fails
- **Smoke test results** are uploaded as JSON artifacts (3-day retention) for debugging
- **SQL dumps** from ingest have 1-day retention (they're consumed by push-to-d1)

Keep retention short — artifacts cost storage and these are all regeneratable.

### 6. Timeout budgets

| Job | Timeout | Rationale |
|-----|---------|-----------|
| test | 5min | Unit tests + type check. If this takes >5min something is wrong. |
| resolve-smoke | 3min | Just KV API calls. Should complete in <30s. |
| scrape-smoke | 10min | Hits external ATS APIs. Lever can be slow (~10s). |
| discover-slugs | 60min | SearXNG runs 15 queries × 5 pages per platform. Rate limits cause waits. |
| ingest (existing) | 120min | Full scrape of all companies on one platform. |

### 7. Rate limit awareness

External ATS APIs have rate limits. The CI pipeline respects them:

- **Individual scrapers** have built-in retry with exponential backoff (1s → 2s → 4s)
- **Concurrency default is 5** (not 10) for deadlyaccuratejobs, to be a good citizen
- **SearXNG discovery** has a 1.2s delay between requests and waits 5s on 429
- **Smoke tests are manual-only** — never scheduled, so we don't DDoS ATS APIs on a cron

### 8. Separation of concerns

| Concern | Where it runs | When |
|---------|--------------|------|
| Code quality (tests, types) | `deadlyaccuratejobs.yml` | Every push/PR |
| KV API health check | `deadlyaccuratejobs.yml` resolve-smoke | Every push/PR |
| Full scrape validation | `deadlyaccuratejobs.yml` scrape-smoke | Manual only |
| Slug discovery | `deadlyaccuratejobs.yml` discover-slugs | Manual (weekly cadence) |
| Bulk ingest to D1 | `ingest.yml` | 4x daily on schedule |
| Board app deploy | `deploy.yml` | Push to main |

### 9. SearXNG in CI

The `discover-slugs` job starts SearXNG as a Docker container:

```yaml
- name: Start SearXNG
  run: |
    docker run -d --name searxng -p 8888:8080 searxng/searxng
    sleep 5
```

This works on GitHub Actions because `ubuntu-latest` has Docker pre-installed. The sleep gives SearXNG time to initialize before queries start.

For higher reliability, consider:
- A persistent SearXNG instance on a VPS (set `SEARXNG_URL` secret)
- Running discovery from a self-hosted runner with better network

### 10. When to run what

| Event | Action |
|-------|--------|
| Opening a PR | Tests + type check + resolve smoke |
| Merging to main | Same + deploy if board app changed |
| New scraper package added | Update ingest.yml matrix + add normalizer |
| Slug lists getting stale | Manual trigger `discover-slugs` |
| New company not resolving | Check if it's in KV, if not run discovery for that platform |
| Testing a specific company | Manual trigger `scrape-smoke` with company name |
| Debugging a failed ingest | Check `ingest.yml` logs, re-run single source |

## Local development

```bash
# Run tests
cd packages/deadlyaccuratejobs && npx vitest run

# Run tests in watch mode
cd packages/deadlyaccuratejobs && npx vitest

# Type check
cd packages/deadlyaccuratejobs && npx tsc --noEmit

# Quick search test
npx tsx packages/deadlyaccuratejobs/bin/cli.ts Stripe --limit 5

# Test with local KV worker
npx wrangler dev --port 8787    # in packages/job-ingest/worker/
npx tsx packages/deadlyaccuratejobs/bin/cli.ts Stripe --api-url http://localhost:8787

# Run SearXNG locally for discovery
docker run -d --name searxng -p 8888:8080 searxng/searxng
SEARXNG_URL=http://localhost:8888 npx tsx packages/job-ingest/discover.ts --platform greenhouse
```

## Adding a new ATS platform

1. Create `packages/{ats}-jobs/` following the existing pattern
2. Add normalizer at `packages/job-ingest/src/normalizers/{ats}.ts`
3. Add source to `CONTENT_FLAGS` in `packages/job-ingest/src/scraper-factory.ts`
4. Add to `Source` type in `packages/job-ingest/src/types.ts`
5. Add to matrix in `.github/workflows/ingest.yml`
6. Add to `SLUG_SOURCES` in `packages/deadlyaccuratejobs/src/types.ts`
7. Run `npx tsx packages/job-ingest/discover.ts --platform {ats}` to populate slugs
8. Upload slugs: `npx tsx packages/job-ingest/upload-slugs.ts`
9. Test: `npx tsx packages/deadlyaccuratejobs/bin/cli.ts resolve SomeCompanyOnNewAts`

deadlyaccuratejobs will automatically search the new platform — no code changes needed beyond step 6, because it queries all platforms in the `SLUG_SOURCES` list.
