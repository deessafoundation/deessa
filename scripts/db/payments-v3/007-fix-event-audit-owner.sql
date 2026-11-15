-- ============================================================
-- payments-v3 / 007-fix-event-audit-owner.sql
-- Fixes gap: S06 — event/audit ownership is not consistently constrained
-- ============================================================
-- Problem (from schema-review.md S06):
--   1. `payment_events` can have donation_id and event_registration_id both NULL
--      or both populated without any constraint. Financial events must have
--      exactly one owner, while provider-lifecycle events (e.g. payout.created)
--      may have no owner only if event_type matches 'provider.%'.
--   2. `status_change_log` had its NOT NULL dropped on donation_id in migration 059
--      to allow event records, but no constraint was added to ensure exactly
--      one owner is set. Rows can currently have no owner or multiple owners.
--   3. `review_notes` has the same issue from migration 059.
--   4. `donations.reviewed_by` must reference `admin_users(id)`, not `auth.users(id)`.
--
-- This migration:
--   1. Adds owner constraint on `payment_events`:
--      - (donation_id IS NOT NULL AND event_registration_id IS NULL) OR
--      - (donation_id IS NULL AND event_registration_id IS NOT NULL) OR
--      - (donation_id IS NULL AND event_registration_id IS NULL AND event_type LIKE 'provider.%')
--   2. Ensures `status_change_log` has an exactly-one-owner CHECK:
--      - (donation_id IS NOT NULL)::int + (event_registration_id IS NOT NULL)::int = 1
--   3. Ensures `review_notes` has an exactly-one-owner CHECK:
--      - (donation_id IS NOT NULL)::int + (event_registration_id IS NOT NULL)::int = 1
--   4. Validates and enforces that `donations.reviewed_by` references `admin_users(id)`.
--   5. Changes FK on `payment_events` from ON DELETE CASCADE / SET NULL to
--      ON DELETE RESTRICT to preserve audit trail integrity.
--
-- Safe to run after: 001–006, 056, 059
-- Idempotent: yes
-- Do NOT run SQL against live data. Do NOT modify application code.
-- ============================================================


-- ── 1. payment_events owner constraint ───────────────────────────────────────

-- Ensure event_type column exists (from 023)
ALTER TABLE payment_events
  ADD COLUMN IF NOT EXISTS event_type TEXT;

-- Drop any existing owner check on payment_events
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'payment_events'::regclass
      AND contype  = 'c'
      AND conname  = 'payment_events_owner_check'
  ) THEN
    ALTER TABLE payment_events DROP CONSTRAINT payment_events_owner_check;
  END IF;
END $$;

-- Add the corrected owner check:
-- Exactly one owner (donation OR event_registration), OR neither ONLY IF provider-lifecycle event
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'payment_events'::regclass
      AND contype  = 'c'
      AND conname  = 'payment_events_owner_check'
  ) THEN
    ALTER TABLE payment_events
      ADD CONSTRAINT payment_events_owner_check
      CHECK (
        (donation_id IS NOT NULL AND event_registration_id IS NULL)
        OR
        (donation_id IS NULL AND event_registration_id IS NOT NULL)
        OR
        (donation_id IS NULL AND event_registration_id IS NULL AND event_type LIKE 'provider.%')
      );
  END IF;
END $$;


-- ── 2. Update payment_events FKs to ON DELETE RESTRICT ───────────────────────
-- Financial and webhook audit events must not be silently deleted when an owner is deleted.

-- 2a. donation_id FK
DO $$
DECLARE
  v_conname TEXT;
BEGIN
  SELECT c.conname INTO v_conname
  FROM pg_constraint c
  JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
  WHERE c.conrelid  = 'payment_events'::regclass
    AND c.contype   = 'f'
    AND a.attname   = 'donation_id'
    AND c.confdeltype <> 'r';

  IF v_conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE payment_events DROP CONSTRAINT %I', v_conname);
    ALTER TABLE payment_events
      ADD CONSTRAINT payment_events_donation_id_fkey
      FOREIGN KEY (donation_id)
      REFERENCES donations(id)
      ON DELETE RESTRICT;
  END IF;
END $$;

-- 2b. event_registration_id FK
DO $$
DECLARE
  v_conname TEXT;
BEGIN
  SELECT c.conname INTO v_conname
  FROM pg_constraint c
  JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
  WHERE c.conrelid  = 'payment_events'::regclass
    AND c.contype   = 'f'
    AND a.attname   = 'event_registration_id'
    AND c.confdeltype <> 'r';

  IF v_conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE payment_events DROP CONSTRAINT %I', v_conname);
    ALTER TABLE payment_events
      ADD CONSTRAINT payment_events_event_registration_id_fkey
      FOREIGN KEY (event_registration_id)
      REFERENCES event_registrations(id)
      ON DELETE RESTRICT;
  END IF;
END $$;


-- ── 3. status_change_log exactly-one-owner constraint ─────────────────────────
-- Ensure event_registration_id column exists on status_change_log (from 059)
ALTER TABLE status_change_log
  ADD COLUMN IF NOT EXISTS event_registration_id UUID
    REFERENCES event_registrations(id) ON DELETE CASCADE;

-- Drop existing constraint if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'status_change_log'::regclass
      AND contype  = 'c'
      AND conname  = 'status_change_log_owner_check'
  ) THEN
    ALTER TABLE status_change_log DROP CONSTRAINT status_change_log_owner_check;
  END IF;
END $$;

-- Add exactly-one-owner check: either donation_id OR event_registration_id must be set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'status_change_log'::regclass
      AND contype  = 'c'
      AND conname  = 'status_change_log_owner_check'
  ) THEN
    ALTER TABLE status_change_log
      ADD CONSTRAINT status_change_log_owner_check
      CHECK (
        (donation_id IS NOT NULL)::INT + (event_registration_id IS NOT NULL)::INT = 1
      );
  END IF;
END $$;


-- ── 4. review_notes exactly-one-owner constraint ─────────────────────────────
-- Ensure event_registration_id exists on review_notes (from 059)
ALTER TABLE review_notes
  ADD COLUMN IF NOT EXISTS event_registration_id UUID
    REFERENCES event_registrations(id) ON DELETE CASCADE;

-- Drop existing constraint if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'review_notes'::regclass
      AND contype  = 'c'
      AND conname  = 'review_notes_owner_check'
  ) THEN
    ALTER TABLE review_notes DROP CONSTRAINT review_notes_owner_check;
  END IF;
END $$;

-- Add exactly-one-owner check: either donation_id OR event_registration_id must be set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'review_notes'::regclass
      AND contype  = 'c'
      AND conname  = 'review_notes_owner_check'
  ) THEN
    ALTER TABLE review_notes
      ADD CONSTRAINT review_notes_owner_check
      CHECK (
        (donation_id IS NOT NULL)::INT + (event_registration_id IS NOT NULL)::INT = 1
      );
  END IF;
END $$;


-- ── 5. Ensure donations.reviewed_by references admin_users(id) ────────────────
-- Check existing FK constraint on donations.reviewed_by.
-- If it references auth.users or any table other than admin_users, drop and fix it.
DO $$
DECLARE
  v_conname TEXT;
  v_confrelid REGCLASS;
BEGIN
  SELECT c.conname, c.confrelid INTO v_conname, v_confrelid
  FROM pg_constraint c
  JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
  WHERE c.conrelid = 'donations'::regclass
    AND c.contype  = 'f'
    AND a.attname  = 'reviewed_by';

  -- If constraint exists but does not point to admin_users, drop it
  IF v_conname IS NOT NULL AND v_confrelid <> 'admin_users'::regclass THEN
    EXECUTE format('ALTER TABLE donations DROP CONSTRAINT %I', v_conname);
    v_conname := NULL;
  END IF;

  -- If no FK constraint points to admin_users, add it
  IF v_conname IS NULL THEN
    -- Ensure column exists first
    ALTER TABLE donations ADD COLUMN IF NOT EXISTS reviewed_by UUID;

    ALTER TABLE donations
      ADD CONSTRAINT donations_reviewed_by_fkey
      FOREIGN KEY (reviewed_by)
      REFERENCES admin_users(id)
      ON DELETE SET NULL;
  END IF;
END $$;
