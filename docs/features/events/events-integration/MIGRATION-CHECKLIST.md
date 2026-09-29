---
title: "Migration 057 Pre-Flight Checklist"
description: "Run these queries in Supabase SQL Editor to verify prerequisites:"
owner: "deessa Team"
status: active
category: feature
audience: developer
last_updated: 2026-09-12
---
# Migration 057 Pre-Flight Checklist

## Before Running Migration

### ✅ Prerequisites Verification

Run these queries in Supabase SQL Editor to verify prerequisites:

```sql
-- 1. Verify migration 056 ran successfully
-- Check: event_registrations has 'review' in CHECK constraint
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'event_registrations'::regclass
  AND conname = 'event_registrations_payment_status_check';

-- Expected output should include: ...IN ('unpaid', 'paid', 'refunded', 'failed', 'review'))
-- If NOT found or missing 'review', STOP and run migration 056 first


-- 2. Verify payment_events has event_registration_id column
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'payment_events'
  AND column_name = 'event_registration_id';

-- Expected: 1 row with column_name = 'event_registration_id', data_type = 'uuid', is_nullable = 'YES'
-- If NO rows, STOP and run migration 056 first


-- 3. Verify payments table exists and has expected structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'payments'
  AND column_name IN ('id', 'donation_id', 'provider', 'transaction_id', 'amount', 'currency', 'status')
ORDER BY column_name;

-- Expected: 7 rows (id, donation_id, provider, transaction_id, amount, currency, status)
-- If table doesn't exist, STOP and run migration 020 first


-- 4. Check if migration 057 already ran
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'payments'
  AND column_name IN ('event_registration_id', 'entity_type');

-- Expected: 0 rows (columns don't exist yet)
-- If 2 rows returned, migration 057 already ran — safe to re-run, but verify constraints work
```

---

## Running the Migration

### Step 1: Backup Current State (Optional but Recommended)

```sql
-- Count existing payments
SELECT COUNT(*) AS total_payments FROM payments;

-- Sample existing data
SELECT id, donation_id, provider, amount, currency, status, created_at
FROM payments
ORDER BY created_at DESC
LIMIT 5;
```

### Step 2: Run Migration 057

1. Open Supabase SQL Editor
2. Copy entire contents of `scripts/db/migrations/057b-extend-payments-for-registrations.sql`
3. Paste into SQL Editor
4. Click "Run"
5. Wait for completion (should take < 5 seconds for small tables, < 30 seconds for large tables)

### Step 3: Verify Migration Success

The migration includes automatic verification. Check the output for:

```
NOTICE:  Payments table verification:
NOTICE:    Total rows: X
NOTICE:    With donation_id: X
NOTICE:    With event_registration_id: 0
NOTICE:    With BOTH (should be 0): 0
NOTICE:    With NEITHER (should be 0): 0
NOTICE:  ✅ Polymorphic FK integrity verified
```

**If you see any errors**, check Section "Troubleshooting" below.

### Step 4: Manual Verification (Recommended)

```sql
-- Verify new columns exist
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'payments'
  AND column_name IN ('event_registration_id', 'entity_type')
ORDER BY column_name;

-- Expected output:
-- event_registration_id | uuid | YES  | NULL
-- entity_type           | text | NO   | 'donation'::text


-- Verify CHECK constraint exists
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'payments'::regclass
  AND conname = 'payments_entity_fk_check';

-- Expected: 1 row with CHECK constraint definition


-- Verify indexes exist
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'payments'
  AND indexname IN ('idx_payments_event_reg', 'idx_payments_entity_type')
ORDER BY indexname;

-- Expected: 2 rows (idx_payments_event_reg, idx_payments_entity_type)


-- Verify all existing rows are 'donation' type
SELECT 
  entity_type,
  COUNT(*) AS count
FROM payments
GROUP BY entity_type;

-- Expected: 1 row with entity_type = 'donation', count = X (total payments)
```

---

## Post-Migration Testing

### Test 1: Verify Constraint Blocks Invalid Inserts

```sql
-- This should FAIL with CHECK constraint error
INSERT INTO payments (
  entity_type,
  provider,
  transaction_id,
  amount,
  currency,
  status,
  verified_at
) VALUES (
  'donation',
  'stripe',
  'test_constraint_check',
  10.00,
  'USD',
  'paid',
  NOW()
);

-- Expected error: 
-- new row for relation "payments" violates check constraint "payments_entity_fk_check"
```

If this insert **succeeds**, the CHECK constraint is not working. Investigate immediately.

### Test 2: Verify Valid Donation Insert Still Works

```sql
-- This should SUCCEED (donation with donation_id)
INSERT INTO payments (
  donation_id,
  entity_type,
  provider,
  transaction_id,
  amount,
  currency,
  status,
  verified_at
)
SELECT 
  id,
  'donation',
  'stripe',
  'test_migration_057_' || gen_random_uuid(),
  100.00,
  'USD',
  'paid',
  NOW()
FROM donations
WHERE payment_status = 'completed'
LIMIT 1;

-- Should succeed with: INSERT 0 1

-- Clean up test row
DELETE FROM payments WHERE transaction_id LIKE 'test_migration_057_%';
```

---

## Troubleshooting

### Issue: "table payments does not exist"

**Cause:** Migration 020 (creates payments table) not run yet.

**Fix:**
1. Run migration 020 first: `scripts/db/payments-v2/020-create-payments-table.sql`
2. Then re-run migration 057

---

### Issue: "column event_registration_id does not exist in table payment_events"

**Cause:** Migration 056 not run yet.

**Fix:**
1. Run migration 056 first: `scripts/db/migrations/056-event-payment-integration.sql`
2. Then re-run migration 057

---

### Issue: "constraint payments_entity_fk_check already exists"

**Cause:** Migration 057 already ran previously.

**Fix:** This is safe. The migration is idempotent. The constraint already exists and is working.

**Verify:** Run the verification queries in Step 4 to confirm everything is correct.

---

### Issue: Verification shows "With BOTH: X" or "With NEITHER: X" > 0

**Cause:** Data corruption OR constraint not properly applied.

**Fix:**
1. **DO NOT PROCEED with V2 implementation**
2. Identify corrupted rows:
   ```sql
   -- Find rows with BOTH FKs
   SELECT * FROM payments 
   WHERE donation_id IS NOT NULL AND event_registration_id IS NOT NULL;
   
   -- Find rows with NEITHER FK
   SELECT * FROM payments 
   WHERE donation_id IS NULL AND event_registration_id IS NULL;
   ```
3. Investigate why these rows exist
4. Manually correct or delete corrupted rows
5. Re-run verification

---

### Issue: Migration hangs or takes > 1 minute

**Cause:** Large `payments` table (> 100k rows) causing slow UPDATE or ALTER TABLE.

**Fix:**
1. Check table size: `SELECT COUNT(*) FROM payments;`
2. If > 100k rows, consider running during low-traffic window
3. Monitor progress: Check Supabase logs for lock waits
4. If stuck for > 5 minutes, cancel and contact DBA

---

## Rollback Procedure

**⚠️ ONLY use if V2 PaymentService has NOT written any event_registration_id rows yet**

```sql
-- Check if any event registration payments exist
SELECT COUNT(*) FROM payments WHERE event_registration_id IS NOT NULL;

-- If count = 0, safe to rollback:
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_entity_fk_check;
DROP INDEX IF EXISTS idx_payments_entity_type;
DROP INDEX IF EXISTS idx_payments_event_reg;
ALTER TABLE payments DROP COLUMN IF EXISTS entity_type;
ALTER TABLE payments DROP COLUMN IF EXISTS event_registration_id;
```

**If count > 0:** CANNOT safely rollback. Event payments exist and would be orphaned.

---

## Next Steps After Successful Migration

- [ ] Verify migration success (all checks pass)
- [ ] Update PLAN.md status: Phase 0 ✅ Complete
- [ ] Proceed to Phase 1: Implement `PaymentService.confirmRegistration()` method
- [ ] Update monitoring dashboards to include entity_type breakdown

---

## Quick Reference

| Check | Command | Expected Result |
|-------|---------|----------------|
| Migration 056 ran | `SELECT * FROM information_schema.columns WHERE table_name='payment_events' AND column_name='event_registration_id'` | 1 row |
| Migration 057 ran | `SELECT * FROM information_schema.columns WHERE table_name='payments' AND column_name='entity_type'` | 1 row |
| Constraint exists | `SELECT * FROM pg_constraint WHERE conname='payments_entity_fk_check'` | 1 row |
| No corruption | `SELECT COUNT(*) FROM payments WHERE (donation_id IS NOT NULL AND event_registration_id IS NOT NULL) OR (donation_id IS NULL AND event_registration_id IS NULL)` | 0 |

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-27  
**Status:** Ready for Production Use
