-- ============================================================
-- payments-v3 / 002-fix-payment-uniqueness.sql
-- Fixes gap: S04 (partial) — global provider transaction uniqueness
-- ============================================================
-- Problem: The existing unique constraint `unique_donation_transaction`
-- on payments is `(donation_id, transaction_id)`. This is not globally
-- unique: the same provider transaction could be inserted for two different
-- donation rows (e.g., after a backfill or a Khalti pidx rebind).
--
-- Additionally, there is no `environment` column distinguishing test vs live
-- payments, which is required so test-mode transactions cannot be confused
-- with live ones sharing the same provider transaction ID.
--
-- This migration:
--   1. Adds `environment TEXT CHECK ('test', 'live')` to payments if not present.
--   2. Adds a global unique constraint `(provider, environment, transaction_id)`.
--   3. Drops the old `(donation_id, transaction_id)` constraint if still present,
--      because the new one is strictly stronger (and that one breaks for
--      event-registration-only rows where donation_id IS NULL).
--
-- Safe to run after: 001-fix-payments-owner-constraint.sql
-- Idempotent: yes
-- Do NOT run SQL against live data. Do NOT modify application code.
-- ============================================================


-- ── 1. Add `environment` column if missing ────────────────────────────────────
-- Values: 'test' (sandbox, Stripe test mode, eSewa RC) or 'live' (production).
-- Existing rows are all test/sandbox per user confirmation; default = 'test'.
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS environment TEXT NOT NULL DEFAULT 'test';

-- Add CHECK constraint on environment values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'payments'::regclass
      AND contype  = 'c'
      AND conname  = 'payments_environment_check'
  ) THEN
    ALTER TABLE payments
      ADD CONSTRAINT payments_environment_check
      CHECK (environment IN ('test', 'live'));
  END IF;
END $$;


-- ── 2. Drop the old narrow uniqueness constraint if it exists ─────────────────
-- `unique_donation_transaction` is (donation_id, transaction_id).
-- This is insufficient and also fails for event-registration rows where
-- donation_id IS NULL (NULLs are not equal in UNIQUE indexes).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'payments'::regclass
      AND contype  = 'u'
      AND conname  = 'unique_donation_transaction'
  ) THEN
    ALTER TABLE payments DROP CONSTRAINT unique_donation_transaction;
  END IF;
END $$;


-- ── 3. Add the global provider/environment/transaction uniqueness constraint ───
-- This prevents the same real-world charge from producing two payments rows,
-- regardless of which entity owns each row.
-- Using a unique index (not a named CONSTRAINT) so we can use IF NOT EXISTS.
CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_env_txn_uq
  ON payments (provider, environment, transaction_id);
