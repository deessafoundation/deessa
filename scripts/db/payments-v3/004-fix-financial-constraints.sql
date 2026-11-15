-- ============================================================
-- payments-v3 / 004-fix-financial-constraints.sql
-- Fixes gap: S04 — financial data rules are incomplete
-- ============================================================
-- Problem (from schema-review.md S04):
--   - No positive-amount CHECK on donations.amount or payments.amount
--   - No currency allowlist on donations.currency
--   - No canonical status/provider allowlist on donations
--
-- All existing data is confirmed sandbox/test; constraints can be added
-- without worrying about legacy violations (user confirmed data loss OK).
--
-- This migration adds CHECK constraints, using DO blocks for idempotency.
--
-- Safe to run after: 001, 002
-- Idempotent: yes
-- Do NOT run SQL against live data. Do NOT modify application code.
-- ============================================================


-- ── 1. donations.amount > 0 ───────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'donations'::regclass
      AND contype  = 'c'
      AND conname  = 'donations_amount_positive'
  ) THEN
    ALTER TABLE donations
      ADD CONSTRAINT donations_amount_positive
      CHECK (amount > 0);
  END IF;
END $$;


-- ── 2. payments.amount > 0 ────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'payments'::regclass
      AND contype  = 'c'
      AND conname  = 'payments_amount_positive'
  ) THEN
    ALTER TABLE payments
      ADD CONSTRAINT payments_amount_positive
      CHECK (amount > 0);
  END IF;
END $$;


-- ── 3. donations.currency allowlist ──────────────────────────────────────────
-- Supported set: USD (Stripe), NPR (eSewa/Khalti), AUD, GBP, EUR, CAD (Stripe).
-- The original schema defaulted to 'INR' (migration 001); that default is
-- intentionally NOT changed here — it must be corrected via application code.
-- If any existing rows have 'INR', this constraint will fail; that is by design
-- (the brief says sandbox data may be lost and constraints can be added freely).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'donations'::regclass
      AND contype  = 'c'
      AND conname  = 'donations_currency_check'
  ) THEN
    ALTER TABLE donations
      ADD CONSTRAINT donations_currency_check
      CHECK (currency IN ('USD', 'NPR', 'AUD', 'GBP', 'EUR', 'CAD'));
  END IF;
END $$;


-- ── 4. donations.payment_status allowlist ────────────────────────────────────
-- Drop any conflicting check with a different name, then add the canonical one.
-- Statuses: pending → completed | failed | review | refunded | disputed
DO $$
DECLARE
  v_conname TEXT;
BEGIN
  -- Drop any existing payment_status check that is not the canonical one
  FOR v_conname IN
    SELECT c.conname
    FROM pg_constraint c
    WHERE c.conrelid = 'donations'::regclass
      AND c.contype  = 'c'
      AND c.conname LIKE '%payment_status%'
      AND c.conname <> 'donations_payment_status_check'
  LOOP
    EXECUTE format('ALTER TABLE donations DROP CONSTRAINT %I', v_conname);
  END LOOP;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'donations'::regclass
      AND contype  = 'c'
      AND conname  = 'donations_payment_status_check'
  ) THEN
    ALTER TABLE donations
      ADD CONSTRAINT donations_payment_status_check
      CHECK (payment_status IN (
        'pending', 'completed', 'failed', 'review', 'refunded', 'disputed'
      ));
  END IF;
END $$;


-- ── 5. donations.provider allowlist ──────────────────────────────────────────
-- Active gateways: stripe, esewa, khalti, bank (manual bank transfer).
-- 'unknown' covers legacy rows whose provider was not recorded.
-- Conference is retired; 'conference' is not in this list.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'donations'::regclass
      AND contype  = 'c'
      AND conname  = 'donations_provider_check'
  ) THEN
    ALTER TABLE donations
      ADD CONSTRAINT donations_provider_check
      CHECK (provider IN ('stripe', 'esewa', 'khalti', 'bank', 'unknown'));
  END IF;
END $$;
