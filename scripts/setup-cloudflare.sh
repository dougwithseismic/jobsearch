#!/bin/bash
set -euo pipefail

echo "=== Cloudflare Job Board Setup ==="
echo ""

# Check wrangler is available
if ! command -v wrangler &> /dev/null && ! npx wrangler --version &> /dev/null; then
    echo "Error: wrangler not found. Install with: pnpm add -g wrangler"
    exit 1
fi

echo "Step 1: Logging in to Cloudflare..."
npx wrangler login

echo ""
echo "Step 2: Creating D1 database..."
DB_OUTPUT=$(npx wrangler d1 create job-board 2>&1)
echo "$DB_OUTPUT"

# Extract database ID
DB_ID=$(echo "$DB_OUTPUT" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2)

if [ -n "$DB_ID" ]; then
    echo ""
    echo "Step 3: Updating wrangler.toml with database ID: $DB_ID"
    sed -i.bak "s/placeholder-create-via-wrangler/$DB_ID/" apps/board/wrangler.toml
    rm -f apps/board/wrangler.toml.bak
    echo "Updated wrangler.toml"
else
    echo ""
    echo "Warning: Could not extract database ID. Please update apps/board/wrangler.toml manually."
    echo "Look for the database_id in the output above."
fi

echo ""
echo "Step 4: Creating initial schema..."
# Generate the schema SQL
cat > /tmp/init-schema.sql << 'EOSQL'
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  source_id TEXT NOT NULL,
  company TEXT NOT NULL,
  company_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  department TEXT DEFAULT '',
  location TEXT DEFAULT '',
  country TEXT DEFAULT '',
  region TEXT DEFAULT 'other',
  is_remote INTEGER NOT NULL DEFAULT 0,
  employment_type TEXT DEFAULT '',
  salary TEXT DEFAULT '',
  apply_url TEXT NOT NULL,
  job_url TEXT DEFAULT '',
  published_at TEXT DEFAULT '',
  scraped_at TEXT NOT NULL,
  tags TEXT DEFAULT '',
  description_snippet TEXT DEFAULT ''
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_source_sourceId ON jobs(source, source_id);
CREATE INDEX IF NOT EXISTS idx_region ON jobs(region);
CREATE INDEX IF NOT EXISTS idx_is_remote ON jobs(is_remote);
CREATE INDEX IF NOT EXISTS idx_published_at ON jobs(published_at);
CREATE INDEX IF NOT EXISTS idx_company_slug ON jobs(company_slug);
CREATE INDEX IF NOT EXISTS idx_source ON jobs(source);
EOSQL

echo "Applying schema to local D1..."
npx wrangler d1 execute job-board --local --file=/tmp/init-schema.sql --config=apps/board/wrangler.toml

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Start dev server:  pnpm --filter=@jobsearch/board dev"
echo "  2. Run ingest:        pnpm --filter=@jobsearch/job-ingest tsx src/cli.ts --all"
echo "  3. Deploy:            pnpm --filter=@jobsearch/board deploy"
echo ""
echo "For GitHub Actions, add these secrets to your repo:"
echo "  - CLOUDFLARE_API_TOKEN"
echo "  - CLOUDFLARE_ACCOUNT_ID"
