# Rollback Plan — Database Security Fixes

**Date:** 2026-09-12

## Overview

All fixes are non-destructive and reversible. If any issue arises, use the rollback steps below.

---

## Rollback: SECURITY DEFINER Views (001)

The views were recreated without SECURITY DEFINER. To restore the original behavior:

```sql
-- Restore donation_stats_by_currency with SECURITY DEFINER
DROP VIEW IF EXISTS public.donation_stats_by_currency;
CREATE VIEW public.donation_stats_by_currency WITH (security_invoker = false) AS
SELECT
  currency,
  COUNT(*) AS total_donations,
  SUM(amount) AS total_amount,
  COUNT(CASE WHEN is_monthly THEN 1 END) AS monthly_donations,
  COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) AS completed_donations,
  SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) AS completed_amount
FROM donations
GROUP BY currency;

GRANT SELECT ON public.donation_stats_by_currency TO authenticated;
```

Repeat similarly for the other 3 views if needed. The original view definitions are in:
- `scripts/008-currency-support.sql`
- `scripts/payments-v2/025-create-payment-logs-table.sql`
- `scripts/056-event-payment-integration.sql`

---

## Rollback: RLS Enablement (002)

To disable RLS on any table:

```sql
-- Example: disable RLS on payments table
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access" ON public.payments;

-- Repeat for other tables as needed:
-- ALTER TABLE public.receipts DISABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Service role full access" ON public.receipts;
-- ... etc
```

**Note:** Disabling RLS re-exposes the table via the REST API. Only do this if you have a specific reason.

---

## Rollback: Phantom Table (payments_with_session)

If `payments_with_session` was dropped and turns out to be needed:

```sql
-- Check if data was backed up before dropping
-- Re-create the table from backup or migration
```

**Recommendation:** Before dropping, query the table to understand its contents:
```sql
SELECT * FROM public.payments_with_session LIMIT 10;
\d public.payments_with_session
```

---

## Verification After Any Rollback

1. Run the Supabase database linter to confirm which errors reappear
2. Test the application endpoints that use affected tables:
   - Donation creation: `/api/donations/create`
   - Payment webhooks: `/api/webhooks/stripe`
   - Admin dashboard: `/admin/payments`
   - Receipt generation: `/api/receipts/download`

---

## Emergency: Full Rollback

If all fixes need to be reverted:

```sql
-- Disable RLS on all tables
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_failures DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_sequences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_change_log DISABLE ROW LEVEL SECURITY;

-- Drop all new policies
DROP POLICY IF EXISTS "Service role full access" ON public.payments;
DROP POLICY IF EXISTS "Service role full access" ON public.receipts;
DROP POLICY IF EXISTS "Service role full access" ON public.payment_jobs;
DROP POLICY IF EXISTS "Service role full access" ON public.email_failures;
DROP POLICY IF EXISTS "Service role full access" ON public.payment_events;
DROP POLICY IF EXISTS "Service role full access" ON public.receipt_sequences;
DROP POLICY IF EXISTS "Service role full access" ON public.payment_logs;
DROP POLICY IF EXISTS "Service role full access" ON public.review_notes;
DROP POLICY IF EXISTS "Service role full access" ON public.status_change_log;

-- Views auto-revert to previous state on next run of original migration
-- Or manually recreate from original migration files
```

---

## Risk Assessment

| Fix | Reversibility | Risk of Rollback |
|-----|--------------|------------------|
| View recreation | Trivial | None — just re-run original migration |
| RLS enablement | Trivial | Low — re-exposes tables via API |
| Phantom table drop | **Not reversible** without backup | Medium — query table first |

**Key insight:** The only non-reversible action is dropping `payments_with_session`. Always query it first and back up if needed.
