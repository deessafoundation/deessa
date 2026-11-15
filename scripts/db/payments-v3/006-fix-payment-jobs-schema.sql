-- ============================================================
-- payments-v3 / 006-fix-payment-jobs-schema.sql
-- Fixes gap: S05 — recovery schema is only partly usable
-- ============================================================
-- Problem (from schema-review.md S05):
--   - `payment_jobs` has status/retry fields but no job deduplication key,
--     no claim lease, and no dead-letter visibility.
--   - Queue code is a placeholder.
--   - The `donation_id NOT NULL` FK on the existing table excludes event jobs.
--
-- This migration:
--   1. Adds missing columns to `payment_jobs` for a proper database queue:
--      - deduplication_key: prevents duplicate jobs per entity/type
--      - claim_expires_at: lease expiry (NULL = unclaimed)
--      - claimed_by: worker identity string
--      - max_retries: replaces/supplements existing max_attempts
--      - retry_count: current retry count (separate from existing attempts)
--      - last_error: last failure message
--      - dead_lettered_at: when the job was moved to dead-letter state
--   2. Makes donation_id nullable (same reasoning as payments; event jobs need it).
--   3. Extends the status CHECK to include 'dead_lettered'.
--   4. Adds the partial unique index on deduplication_key for active jobs.
--   5. Adds an index for efficient queue polling (claim next unclaimed job).
--
-- NOTE: `payment_jobs` was originally created with `donation_id NOT NULL`
-- (migration 022). That constraint is dropped here idempotently.
--
-- Safe to run after: 001–005
-- Idempotent: yes
-- Do NOT run SQL against live data. Do NOT modify application code.
-- ============================================================


-- ── 1. Make donation_id nullable ──────────────────────────────────────────────
-- Event-registration jobs do not have a donation_id.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'payment_jobs'
      AND column_name  = 'donation_id'
      AND is_nullable  = 'NO'
  ) THEN
    ALTER TABLE payment_jobs ALTER COLUMN donation_id DROP NOT NULL;
  END IF;
END $$;


-- ── 2. Add event_registration_id FK if not present ────────────────────────────
ALTER TABLE payment_jobs
  ADD COLUMN IF NOT EXISTS event_registration_id UUID
    REFERENCES event_registrations(id) ON DELETE RESTRICT;


-- ── 3. Add deduplication_key ──────────────────────────────────────────────────
-- Semantic: '<entity_type>:<entity_id>:<job_type>'
-- e.g., 'donation:abc123:receipt_generation'
-- NOT NULL but added as nullable first, backfilled, then set NOT NULL.
ALTER TABLE payment_jobs
  ADD COLUMN IF NOT EXISTS deduplication_key TEXT;

-- Backfill existing rows using donation_id + job_type (best-effort)
UPDATE payment_jobs
SET deduplication_key = 'donation:' || donation_id::TEXT || ':' || job_type
WHERE deduplication_key IS NULL
  AND donation_id IS NOT NULL;

-- For rows with no donation_id (should not exist yet, but be safe):
UPDATE payment_jobs
SET deduplication_key = 'unknown:' || id::TEXT || ':' || job_type
WHERE deduplication_key IS NULL;

-- Now enforce NOT NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'payment_jobs'
      AND column_name  = 'deduplication_key'
      AND is_nullable  = 'YES'
  ) THEN
    ALTER TABLE payment_jobs ALTER COLUMN deduplication_key SET NOT NULL;
  END IF;
END $$;


-- ── 4. Add lease and worker-identity columns ──────────────────────────────────
ALTER TABLE payment_jobs
  ADD COLUMN IF NOT EXISTS claim_expires_at TIMESTAMPTZ;    -- NULL = unclaimed

ALTER TABLE payment_jobs
  ADD COLUMN IF NOT EXISTS claimed_by TEXT;                  -- worker identifier


-- ── 5. Add retry-tracking columns ─────────────────────────────────────────────
-- max_retries supplements / may supersede existing max_attempts; both kept for
-- compatibility with any existing code that reads max_attempts.
ALTER TABLE payment_jobs
  ADD COLUMN IF NOT EXISTS max_retries   INT NOT NULL DEFAULT 5;

ALTER TABLE payment_jobs
  ADD COLUMN IF NOT EXISTS retry_count   INT NOT NULL DEFAULT 0;

ALTER TABLE payment_jobs
  ADD COLUMN IF NOT EXISTS last_error    TEXT;

ALTER TABLE payment_jobs
  ADD COLUMN IF NOT EXISTS dead_lettered_at TIMESTAMPTZ;


-- ── 6. Extend status CHECK to include 'dead_lettered' ────────────────────────
-- The existing check_job_status constraint allows only 4 statuses.
-- Drop and recreate to add 'dead_lettered'.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'payment_jobs'::regclass
      AND contype  = 'c'
      AND conname  = 'check_job_status'
  ) THEN
    ALTER TABLE payment_jobs DROP CONSTRAINT check_job_status;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'payment_jobs'::regclass
      AND contype  = 'c'
      AND conname  = 'payment_jobs_status_check'
  ) THEN
    ALTER TABLE payment_jobs
      ADD CONSTRAINT payment_jobs_status_check
      CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'dead_lettered'));
  END IF;
END $$;


-- ── 7. Partial unique index on deduplication_key for active jobs ──────────────
-- Allows multiple completed/dead_lettered rows with the same key (historical),
-- but prevents duplicate active work items.
CREATE UNIQUE INDEX IF NOT EXISTS payment_jobs_dedup
  ON payment_jobs (deduplication_key)
  WHERE status NOT IN ('completed', 'dead_lettered');


-- ── 8. Index for efficient queue polling ──────────────────────────────────────
-- Workers query: status = 'pending' AND (claim_expires_at IS NULL OR < NOW())
-- ordered by next_retry_at ASC NULLS FIRST.
CREATE INDEX IF NOT EXISTS idx_payment_jobs_claimable
  ON payment_jobs (status, claim_expires_at, next_retry_at)
  WHERE status = 'pending';


-- ── 9. Index for looking up jobs by event_registration_id ────────────────────
CREATE INDEX IF NOT EXISTS idx_payment_jobs_event_reg
  ON payment_jobs (event_registration_id)
  WHERE event_registration_id IS NOT NULL;
