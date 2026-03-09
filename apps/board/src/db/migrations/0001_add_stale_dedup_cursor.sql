-- Add stale/dedup tracking columns
ALTER TABLE jobs ADD COLUMN last_seen_at TEXT DEFAULT '';
ALTER TABLE jobs ADD COLUMN is_stale INTEGER NOT NULL DEFAULT 0;
ALTER TABLE jobs ADD COLUMN is_duplicate_of TEXT DEFAULT '';

-- Composite index for cursor-based pagination (published_at, id)
CREATE INDEX IF NOT EXISTS idx_published_id ON jobs(published_at, id);
