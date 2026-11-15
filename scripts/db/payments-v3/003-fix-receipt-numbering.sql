-- ============================================================
-- payments-v3 / 003-fix-receipt-numbering.sql
-- Fixes gap: S03 — incompatible receipt numbering implementations
-- ============================================================
-- Problem:
--   migration 011b created a bigint-returning `get_next_receipt_number()`
--   marked STABLE (incorrect — it consumes a sequence, making it VOLATILE).
--
--   payments-v2/025 created `receipt_sequences` table and replaced
--   `get_next_receipt_number()` with a TEXT-returning version using annual
--   counters — but that migration used `CREATE FUNCTION` (not OR REPLACE),
--   so if 011b's version was already deployed it may still be live.
--   Also, 025 starts the counter at 1 rather than seeding from existing
--   issued receipt numbers, risking collision with already-issued receipts.
--
--   Additionally, 025 named the function `get_next_receipt_number()` while
--   the brief says the application calls `generate_receipt_number()`. Both
--   names appear in various places — we consolidate here.
--
-- This migration:
--   1. Drops ALL existing variants of the receipt number function (both names,
--      both return types) to get to a clean slate.
--   2. Ensures the `receipt_sequences` table exists (025 may have created it).
--   3. Seeds the current-year counter from the highest issued receipt number
--      on `donations.receipt_number`, so we can never issue a collision.
--   4. Creates the canonical `generate_receipt_number()` function:
--      - Returns TEXT (format: RCP-YYYY-NNNNN)
--      - VOLATILE (correct — has side effects)
--      - SECURITY DEFINER with pinned search_path = public
--      - REVOKE EXECUTE from PUBLIC; only service_role may call it
--
-- Safe to run after: 010, 011b, 025
-- Idempotent: yes (uses CREATE OR REPLACE; seed is a MAX so reruns are safe)
-- Do NOT run SQL against live data. Do NOT modify application code.
-- ============================================================


-- ── 1. Drop all existing receipt-number function variants ─────────────────────
-- Drop both possible names and both possible signatures.

-- From 011b (bigint return, uses sequence)
DROP FUNCTION IF EXISTS get_next_receipt_number();

-- From 025 (text return, uses receipt_sequences table)
-- The CREATE FUNCTION in 025 (not OR REPLACE) means it may have failed silently
-- if 011b's version already existed with a different signature. Drop anyway.
DROP FUNCTION IF EXISTS generate_receipt_number();


-- ── 2. Ensure receipt_sequences table exists ──────────────────────────────────
-- Matches the schema introduced in payments-v2/025.
CREATE TABLE IF NOT EXISTS receipt_sequences (
  year        INT  PRIMARY KEY,
  last_number INT  NOT NULL DEFAULT 0
);

-- Defensively handle column name variations (last_sequence vs last_number)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'receipt_sequences' AND column_name = 'last_sequence'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'receipt_sequences' AND column_name = 'last_number'
  ) THEN
    ALTER TABLE receipt_sequences RENAME COLUMN last_sequence TO last_number;
  END IF;
END $$;

-- Revoke default public insert/update (tightened further in 005)
-- Done here because the table was originally unprotected in 025.
ALTER TABLE receipt_sequences ENABLE ROW LEVEL SECURITY;


-- ── 3. Seed current-year counter from already-issued receipt numbers ──────────
-- Extract the numeric portion of existing receipt numbers (RCP-YYYY-NNNNN or
-- older formats). Advance the counter so the first issued number is max+1.
DO $$
DECLARE
  v_year      INT  := EXTRACT(YEAR FROM NOW())::INT;
  v_max_num   INT;
BEGIN
  -- Find the highest trailing number in this year's receipt_number values.
  -- Pattern matches RCP-YYYY-NNNNN style; falls back to 0 if none found.
  SELECT COALESCE(
    MAX(
      (regexp_match(receipt_number, '-(\d+)$'))[1]::INT
    ),
    0
  )
  INTO v_max_num
  FROM donations
  WHERE receipt_number IS NOT NULL
    AND receipt_number LIKE 'RCP-' || v_year || '-%';

  -- Upsert the counter: if the row already exists (from a previous run or 025),
  -- only advance it — never go backwards.
  INSERT INTO receipt_sequences (year, last_number)
  VALUES (v_year, v_max_num)
  ON CONFLICT (year)
  DO UPDATE SET last_number = GREATEST(receipt_sequences.last_number, EXCLUDED.last_number);
END $$;


-- ── 4. Create the canonical generate_receipt_number() function ─────────────────
-- Properties:
--   • Returns TEXT in format RCP-YYYY-NNNNN
--   • VOLATILE (correct — the INSERT/UPDATE has side effects)
--   • SECURITY DEFINER so service_role callers bypass RLS on receipt_sequences
--   • search_path pinned to 'public' to prevent search_path injection
--   • EXECUTE revoked from PUBLIC; only service_role may call

CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_year        INT;
  v_next_num    INT;
  v_receipt_num TEXT;
BEGIN
  v_year := EXTRACT(YEAR FROM NOW())::INT;

  -- Atomically insert-or-increment the annual counter.
  -- ON CONFLICT ensures only one counter row per year exists.
  INSERT INTO receipt_sequences (year, last_number)
  VALUES (v_year, 1)
  ON CONFLICT (year)
  DO UPDATE SET last_number = receipt_sequences.last_number + 1
  RETURNING last_number INTO v_next_num;

  -- Format: RCP-YYYY-NNNNN (zero-padded to 5 digits; max 99,999/year)
  v_receipt_num := 'RCP-' || v_year::TEXT || '-' || LPAD(v_next_num::TEXT, 5, '0');

  RETURN v_receipt_num;
END;
$$;

-- Restrict execute: revoke from PUBLIC, grant only to service_role
REVOKE EXECUTE ON FUNCTION generate_receipt_number() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION generate_receipt_number() TO   service_role;

COMMENT ON FUNCTION generate_receipt_number() IS
  'Atomic annual receipt number generator. Returns RCP-YYYY-NNNNN. '
  'VOLATILE (mutates receipt_sequences). SECURITY DEFINER. '
  'Only service_role may execute. Max 99,999 receipts per year.';


-- ── 5. Drop the old receipt_number_seq sequence if still present ──────────────
-- From 011b — no longer needed.
DROP SEQUENCE IF EXISTS receipt_number_seq;
