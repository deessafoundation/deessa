---
title: "PLAN.md Revision Notes — Post-Review Update"
description: "Based on code review feedback, the plan has been updated to reflect that migration 056 already implemented critical s..."
owner: "Deesha Team"
status: active
category: feature
audience: operator
last_updated: 2026-09-12
---
# PLAN.md Revision Notes — Post-Review Update

## Date: 2025-01-27
## Status: Ready for Implementation

---

## Summary of Changes

Based on code review feedback, the plan has been updated to reflect that **migration 056 already implemented critical schema fixes**.

---

## What Changed

### ✅ REMOVED: Unnecessary Schema Fix #1

**Originally Proposed:**
```sql
-- XXX-fix-event-review-status.sql
ALTER TABLE event_registrations ADD CONSTRAINT event_registrations_payment_status_check 
  CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'failed', 'review'));
```

**Actual Status:**
- ✅ **ALREADY DONE** in migration 056 (lines 62-67)
- No action needed

---

### ✅ CONFIRMED: Schema Work Actually Required

Only **ONE** migration is needed:

**File:** `scripts/XXX-extend-payments-for-registrations.sql`

**What it does:**
- Adds `event_registration_id` column to `payments` table
- Adds `entity_type` discriminator column
- Adds CHECK constraint to ensure exactly ONE FK is set (polymorphic integrity)
- Adds index for event registration lookups

**What's NOT needed:**
- ❌ Modifying `event_registrations` CHECK constraint (already has 'review')
- ❌ Adding columns to `payment_events` (already has `event_registration_id`)
- ❌ Adding provider-specific columns to `event_registrations` (already has `stripe_session_id`, `khalti_pidx`, `esewa_transaction_uuid`)

---

## Updated Plan Structure

### Section 3.0: PREREQUISITE Schema Fix

**Before:**
- Schema Fix #1: Add 'review' to CHECK constraint
- Schema Fix #2: Extend payments table

**After:**
- ✅ Migration 056 verification checklist
- ⚠️ NEW migration: Extend payments table (only required work)

### Section 4.0: Files to Modify

**Before:**
- Two migration files (XXX-fix-event-review-status.sql, XXX-fix-payments-polymorphic-fk.sql)

**After:**
- One migration file (XXX-extend-payments-for-registrations.sql)
- Added verification queries to test CHECK constraint

### Section 6: Migration Strategy — Phase 0

**Before:**
```
Phase 0: Schema Fixes
1. Run XXX-fix-event-review-status.sql
2. Run XXX-fix-payments-polymorphic-fk.sql
3. Test constraints
```

**After:**
```
Phase 0: Schema Fix
1. Verify migration 056 ran successfully (checklist)
2. Run XXX-extend-payments-for-registrations.sql
3. Test polymorphic FK constraint with insert attempts
```

### Section 7: Testing Checklist

**Before:**
- Generic schema tests

**After:**
- Migration 056 verification tests (3 checks)
- New migration tests (6 specific constraint tests)

### Section 9: Risk Assessment

**Before:**
```
| `review` status DB error | High (without fix) | Critical | Fix CHECK constraint in Phase 0 | ✅ Fixed |
```

**After:**
```
| `review` status DB error | N/A | N/A | ✅ ALREADY FIXED in migration 056 | ✅ Complete |
```

### Appendix B: Migration Scripts

**Before:**
- Two separate scripts with full SQL

**After:**
- One consolidated script with:
  - Prerequisites section (migration 056 must run first)
  - Main migration SQL
  - Verification queries
  - Test cases (commented out)

---

## Key Takeaways

### What Migration 056 Already Did (2024)
1. ✅ Added `'review'` to `event_registrations.payment_status` CHECK constraint
2. ✅ Added `event_registration_id` to `payment_events` table
3. ✅ Added provider-specific columns to `event_registrations`:
   - `stripe_session_id`
   - `khalti_pidx`
   - `esewa_transaction_uuid`
4. ✅ Added unique constraints on provider-specific columns
5. ✅ Added performance indexes for webhook lookups

### What Still Needs to Be Done (2025)
1. ⚠️ Add `event_registration_id` to `payments` table
2. ⚠️ Add `entity_type` discriminator to `payments` table
3. ⚠️ Add CHECK constraint for polymorphic FK integrity
4. ⚠️ Add index for event registration payment lookups

---

## Migration 056 Reference

**File:** `scripts/db/migrations/056-event-payment-integration.sql`

**Key Sections:**
- Lines 13-16: Add provider-specific columns
- Lines 29-55: Add unique constraints
- Lines 62-67: Add 'review' to CHECK constraint ✅
- Lines 72-76: Add event_registration_id to payment_events ✅
- Lines 83-103: Add performance indexes

**Conclusion:** Migration 056 was comprehensive and handled most of the event payment integration groundwork. Only the `payments` table extension remains.

---

## Next Steps

1. ✅ Verify migration 056 is deployed in all environments
2. ⚠️ Create and run new migration: `scripts/XXX-extend-payments-for-registrations.sql`
3. ✅ Proceed with PaymentService implementation (all prerequisites met)

---

## Impact on Timeline

**Original Estimate:** 3-4 days implementation + 2 days testing + 1 day rollout = 6-7 days

**Revised Estimate:** 3-4 days implementation + 2 days testing + 1 day rollout = 6-7 days (unchanged)

**Reason:** Discovering migration 056 already ran reduces schema work from 2 migrations to 1, but doesn't significantly impact overall timeline since schema work was a small part of the effort.

---

## Confidence Level

**Before Review:** Medium (concerned about schema issues)

**After Review:** **High** (schema largely solved, only cleanup work remains)

---

## Questions Resolved

1. **Q:** Is 'review' in the CHECK constraint?
   **A:** ✅ Yes, added by migration 056 (lines 62-67)

2. **Q:** Does payment_events have event_registration_id?
   **A:** ✅ Yes, added by migration 056 (lines 72-76)

3. **Q:** Do we need to add provider-specific columns?
   **A:** ✅ No, already added by migration 056 (lines 13-16)

4. **Q:** What schema work is actually needed?
   **A:** ⚠️ Only the `payments` table extension with polymorphic FK integrity

---

**Document Status:** Final  
**Approved for Implementation:** Yes  
**Schema Prerequisite:** One migration (XXX-extend-payments-for-registrations.sql)
