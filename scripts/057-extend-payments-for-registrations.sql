-- ============================================================
-- DEESSA Foundation — Extend Payments Table for Event Registrations
-- Migration: 057-extend-payments-for-registrations.sql
-- Run in Supabase SQL Editor. Safe to run multiple times (IF NOT EXISTS).
-- ============================================================
-- Adds event_registration_id FK with polymorphic integrity constraints
-- to enable V2 PaymentService to track event registration payments.
--
-- Prerequisites:
-- - Migration 056 must be run first (adds event_registration_id to payment_events)
-- - Migration 020 must exist (creates payments table)
-- 
-- Safe to run: Yes (idempotent with IF NOT EXISTS checks)
-- ============================================================


-- ── 1. Add event_registration_id column ──────────────────────────────────────
-- Nullable FK to event_registrations table. NULL allowed because existing
-- rows are all donations (no event_registration_id).

ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS event_registration_id UUID 
  REFERENCES event_registrations(id) ON DELETE SET NULL;


-- ── 2. Add entity_type discriminator column ──────────────────────────────────
-- Makes polymorphic FK pattern explicit and enables proper indexing.
-- 'donation' = row links to donations table
-- 'event_registration' = row links to event_registrations table

ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS entity_type TEXT 
  DEFAULT 'donation' 
  CHECK (entity_type IN ('donation', 'event_registration'));


-- ── 3. Backfill existing rows ────────────────────────────────────────────────
-- All existing payments are donations (only donations use V2 PaymentService today).

UPDATE payments 
SET entity_type = 'donation' 
WHERE entity_type IS NULL;


-- ── 4. Make entity_type non-nullable ─────────────────────────────────────────
-- After backfill, enforce that every row has an entity_type.

ALTER TABLE payments 
  ALTER COLUMN entity_type SET NOT NULL;


-- ── 5. Add CHECK constraint for polymorphic FK integrity ─────────────────────
-- Ensures exactly ONE FK is set:
-- - If donation: donation_id NOT NULL, event_registration_id NULL
-- - If event registration: donation_id NULL, event_registration_id NOT NULL
--
-- Prevents:
-- - Orphaned rows (neither FK set)
-- - Corrupted rows (both FKs set)

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payments_entity_fk_check'
  ) THEN
    ALTER TABLE payments 
      ADD CONSTRAINT payments_entity_fk_check 
      CHECK (
        (donation_id IS NOT NULL AND event_registration_id IS NULL AND entity_type = 'donation') OR
        (donation_id IS NULL AND event_registration_id IS NOT NULL AND entity_type = 'event_registration')
      );
  END IF;
END $$;


-- ── 6. Add index for event registration lookups ──────────────────────────────
-- Partial index (WHERE event_registration_id IS NOT NULL) for fast webhook lookups.

CREATE INDEX IF NOT EXISTS idx_payments_event_reg 
  ON payments (event_registration_id) 
  WHERE event_registration_id IS NOT NULL;


-- ── 7. Add index on entity_type for analytics ────────────────────────────────
-- Enables fast queries like "show all event registration payments" or
-- "count payments by entity type".

CREATE INDEX IF NOT EXISTS idx_payments_entity_type 
  ON payments (entity_type);


-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Query 1: Verify constraint works (all rows have exactly ONE FK)
DO $$ 
DECLARE
  total_count INT;
  donation_count INT;
  event_reg_count INT;
  both_count INT;
  neither_count INT;
BEGIN
  SELECT 
    COUNT(*),
    SUM(CASE WHEN donation_id IS NOT NULL THEN 1 ELSE 0 END),
    SUM(CASE WHEN event_registration_id IS NOT NULL THEN 1 ELSE 0 END),
    SUM(CASE WHEN donation_id IS NOT NULL AND event_registration_id IS NOT NULL THEN 1 ELSE 0 END),
    SUM(CASE WHEN donation_id IS NULL AND event_registration_id IS NULL THEN 1 ELSE 0 END)
  INTO total_count, donation_count, event_reg_count, both_count, neither_count
  FROM payments;

  RAISE NOTICE 'Payments table verification:';
  RAISE NOTICE '  Total rows: %', total_count;
  RAISE NOTICE '  With donation_id: %', donation_count;
  RAISE NOTICE '  With event_registration_id: %', event_reg_count;
  RAISE NOTICE '  With BOTH (should be 0): %', both_count;
  RAISE NOTICE '  With NEITHER (should be 0): %', neither_count;

  IF both_count > 0 THEN
    RAISE EXCEPTION 'CHECK constraint violated: % rows have BOTH FKs set', both_count;
  END IF;

  IF neither_count > 0 THEN
    RAISE EXCEPTION 'CHECK constraint violated: % rows have NEITHER FK set', neither_count;
  END IF;

  RAISE NOTICE '✅ Polymorphic FK integrity verified';
END $$;


-- Query 2: Show breakdown by entity_type
SELECT 
  entity_type,
  COUNT(*) AS count,
  MIN(created_at) AS first_created,
  MAX(created_at) AS last_created
FROM payments
GROUP BY entity_type
ORDER BY entity_type;


-- ============================================================
-- MANUAL TESTING (Optional — uncomment to test)
-- ============================================================

-- Test 1: Should SUCCEED (donation only)
-- INSERT INTO payments (donation_id, entity_type, provider, transaction_id, amount, currency, status, verified_at)
-- SELECT 
--   id,
--   'donation',
--   'stripe',
--   'test_donation_' || gen_random_uuid(),
--   100.00,
--   'USD',
--   'paid',
--   NOW()
-- FROM donations LIMIT 1;

-- Test 2: Should SUCCEED (event registration only) — AFTER V2 implementation
-- INSERT INTO payments (event_registration_id, entity_type, provider, transaction_id, amount, currency, status, verified_at)
-- SELECT 
--   id,
--   'event_registration',
--   'stripe',
--   'test_event_' || gen_random_uuid(),
--   50.00,
--   'USD',
--   'paid',
--   NOW()
-- FROM event_registrations LIMIT 1;

-- Test 3: Should FAIL (both FKs set)
-- INSERT INTO payments (donation_id, event_registration_id, entity_type, provider, transaction_id, amount, currency, status, verified_at)
-- VALUES (
--   gen_random_uuid(),
--   gen_random_uuid(),
--   'donation',
--   'stripe',
--   'test_invalid',
--   10.00,
--   'USD',
--   'paid',
--   NOW()
-- );
-- Expected error: new row for relation "payments" violates check constraint "payments_entity_fk_check"

-- Test 4: Should FAIL (neither FK set)
-- INSERT INTO payments (entity_type, provider, transaction_id, amount, currency, status, verified_at)
-- VALUES (
--   'donation',
--   'stripe',
--   'test_orphaned',
--   10.00,
--   'USD',
--   'paid',
--   NOW()
-- );
-- Expected error: new row for relation "payments" violates check constraint "payments_entity_fk_check"


-- ============================================================
-- ROLLBACK (if needed)
-- ============================================================
-- ONLY safe if NO payments with event_registration_id written yet!
--
-- ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_entity_fk_check;
-- DROP INDEX IF EXISTS idx_payments_entity_type;
-- DROP INDEX IF EXISTS idx_payments_event_reg;
-- ALTER TABLE payments DROP COLUMN IF EXISTS entity_type;
-- ALTER TABLE payments DROP COLUMN IF EXISTS event_registration_id;


-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Next steps:
-- 1. Implement PaymentService.confirmRegistration() method
-- 2. Update Stripe webhook handler to use PaymentService
-- 3. Update eSewa handler to use PaymentService
-- 4. Update Khalti handler to use PaymentService
-- ============================================================
