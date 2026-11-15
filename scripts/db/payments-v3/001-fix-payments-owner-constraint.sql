-- ============================================================
-- payments-v3 / 001-fix-payments-owner-constraint.sql
-- Fixes gap: S01
-- ============================================================
-- Problem: `payments.donation_id` was declared NOT NULL in migration 020,
-- which makes it impossible for event-registration-only rows to satisfy the
-- exactly-one-owner check added by 057b.
-- `event_registration_id` FK used ON DELETE SET NULL in 057b, which also
-- conflicts with the exactly-one-owner check (deleting the owner would
-- produce a row with no owner instead of blocking the delete).
--
-- This migration:
--   1. Drops the broken exactly-one-owner check (payments_entity_fk_check) if
--      it was added with the wrong semantics by 057b.
--   2. Makes `donation_id` nullable so event-only payments are representable.
--   3. Ensures `event_registration_id` FK exists with ON DELETE RESTRICT.
--   4. Drops the old SET NULL FK constraint if it has the wrong deletion action.
--   5. Re-adds the exactly-one-owner check with correct semantics.
--   6. Locks entity_type to only 'donation' | 'event_registration'.
--
-- Safe to run after: 020, 040b, 056, 057b
-- Idempotent: yes (DO blocks guard all structural changes)
-- Do NOT run SQL against live data. Do NOT modify application code.
-- ============================================================

-- ── 1. Drop the broken check constraint if it exists ─────────────────────────
-- (057b may have added it; we replace it with a corrected version below)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payments_entity_fk_check'
      AND conrelid = 'payments'::regclass
  ) THEN
    ALTER TABLE payments DROP CONSTRAINT payments_entity_fk_check;
  END IF;
END $$;


-- ── 2. Make donation_id nullable ──────────────────────────────────────────────
-- The original 020 declared it NOT NULL. 057b never fixed this, so event-only
-- rows can never be inserted. We drop the NOT NULL constraint idempotently.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'payments'
      AND column_name  = 'donation_id'
      AND is_nullable  = 'NO'
  ) THEN
    ALTER TABLE payments ALTER COLUMN donation_id DROP NOT NULL;
  END IF;
END $$;


-- ── 3. Add event_registration_id FK with RESTRICT if not present ──────────────
-- If 057b already added this column but with ON DELETE SET NULL, we need to
-- drop that FK constraint and re-add it with ON DELETE RESTRICT.

-- 3a. Add the column if it does not exist yet
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS event_registration_id UUID;

-- 3b. Find and drop any existing FK from payments.event_registration_id that
--     does NOT use RESTRICT deletion action (confdelete code 'a' = NO ACTION,
--     'r' = RESTRICT, 'c' = CASCADE, 'n' = SET NULL, 'd' = SET DEFAULT).
DO $$
DECLARE
  v_conname TEXT;
BEGIN
  SELECT c.conname INTO v_conname
  FROM pg_constraint c
  JOIN pg_attribute a ON a.attrelid = c.conrelid
                      AND a.attnum = ANY(c.conkey)
  WHERE c.conrelid  = 'payments'::regclass
    AND c.contype   = 'f'
    AND a.attname   = 'event_registration_id'
    AND c.confdeltype <> 'r'; -- not RESTRICT

  IF v_conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE payments DROP CONSTRAINT %I', v_conname);
  END IF;
END $$;

-- 3c. Add the FK with ON DELETE RESTRICT if no RESTRICT FK exists yet
DO $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid
                        AND a.attnum = ANY(c.conkey)
    WHERE c.conrelid   = 'payments'::regclass
      AND c.contype    = 'f'
      AND a.attname    = 'event_registration_id'
      AND c.confdeltype = 'r'
  ) INTO v_exists;

  IF NOT v_exists THEN
    ALTER TABLE payments
      ADD CONSTRAINT payments_event_registration_id_fkey
      FOREIGN KEY (event_registration_id)
      REFERENCES event_registrations(id)
      ON DELETE RESTRICT;
  END IF;
END $$;


-- ── 4. Also switch donation_id FK from CASCADE to RESTRICT if needed ──────────
-- Financial ledger rows must not vanish when their owner is deleted.
-- Note: changing a FK deletion action requires dropping and re-adding.
-- We only do this if the current action is NOT already RESTRICT/NO ACTION.
DO $$
DECLARE
  v_conname TEXT;
BEGIN
  SELECT c.conname INTO v_conname
  FROM pg_constraint c
  JOIN pg_attribute a ON a.attrelid = c.conrelid
                      AND a.attnum = ANY(c.conkey)
  WHERE c.conrelid  = 'payments'::regclass
    AND c.contype   = 'f'
    AND a.attname   = 'donation_id'
    AND c.confdeltype NOT IN ('r', 'a'); -- not RESTRICT and not NO ACTION

  IF v_conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE payments DROP CONSTRAINT %I', v_conname);
    ALTER TABLE payments
      ADD CONSTRAINT payments_donation_id_fkey
      FOREIGN KEY (donation_id)
      REFERENCES donations(id)
      ON DELETE RESTRICT;
  END IF;
END $$;


-- ── 5. Add/fix entity_type column ─────────────────────────────────────────────
-- Ensure column exists; default is 'donation' for existing rows.
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS entity_type TEXT DEFAULT 'donation';

-- Drop the old entity_type CHECK if it allowed 'conference_registration'
DO $$
DECLARE
  v_conname TEXT;
BEGIN
  -- Find any check constraint on the payments table that references entity_type
  -- and allows 'conference_registration' (the retired value).
  SELECT c.conname INTO v_conname
  FROM pg_constraint c
  WHERE c.conrelid = 'payments'::regclass
    AND c.contype  = 'c'
    AND c.conname LIKE '%entity_type%'
    AND pg_get_constraintdef(c.oid) LIKE '%conference%';

  IF v_conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE payments DROP CONSTRAINT %I', v_conname);
  END IF;
END $$;

-- Add the corrected entity_type CHECK (donation | event_registration only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'payments'::regclass
      AND contype  = 'c'
      AND conname  = 'payments_entity_type_check'
  ) THEN
    ALTER TABLE payments
      ADD CONSTRAINT payments_entity_type_check
      CHECK (entity_type IN ('donation', 'event_registration'));
  END IF;
END $$;

-- Backfill any NULL entity_type rows (should only be pre-057b rows = donations)
UPDATE payments
SET entity_type = 'donation'
WHERE entity_type IS NULL;

-- Make entity_type NOT NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'payments'
      AND column_name  = 'entity_type'
      AND is_nullable  = 'YES'
  ) THEN
    ALTER TABLE payments ALTER COLUMN entity_type SET NOT NULL;
  END IF;
END $$;


-- ── 6. Add the corrected exactly-one-owner CHECK ──────────────────────────────
-- Exactly one of (donation_id, event_registration_id) must be set,
-- and entity_type must match which one is set.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'payments'::regclass
      AND contype  = 'c'
      AND conname  = 'payments_entity_fk_check'
  ) THEN
    ALTER TABLE payments
      ADD CONSTRAINT payments_entity_fk_check
      CHECK (
        (
          donation_id IS NOT NULL
          AND event_registration_id IS NULL
          AND entity_type = 'donation'
        ) OR (
          donation_id IS NULL
          AND event_registration_id IS NOT NULL
          AND entity_type = 'event_registration'
        )
      );
  END IF;
END $$;


-- ── 7. Supporting index for event registration FK lookups ─────────────────────
CREATE INDEX IF NOT EXISTS idx_payments_event_reg
  ON payments (event_registration_id)
  WHERE event_registration_id IS NOT NULL;
