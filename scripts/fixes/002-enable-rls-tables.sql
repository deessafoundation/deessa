-- ============================================================
-- FIX: Enable RLS on Public Tables
-- Issue: Supabase Database Linter #0013
-- Date: 2026-09-12
-- ============================================================
--
-- PROBLEM:
--   11 tables in the public schema have RLS disabled, making
--   them accessible via the REST API with the anon key.
--
-- FIX:
--   Enable RLS and add a service_role-only policy. Since ALL
--   application code uses createServiceClient() (which uses the
--   service-role key and bypasses RLS), this will NOT break
--   any existing functionality.
--
-- SAFETY:
--   - Service-role client bypasses RLS entirely
--   - No user-facing queries hit these tables directly
--   - Webhooks use service-role client
--   - RPC functions run with SECURITY DEFINER
--
-- NOTE:
--   The `payments_with_session` table is NOT in any migration
--   script. It may be a phantom table created manually. After
--   enabling RLS on the real tables, investigate and drop it
--   if confirmed unused.
-- ============================================================


-- ============================================================
-- 1. payments
--    Source: scripts/payments-v2/020-create-payments-table.sql
--    App access: PaymentService, admin-actions, backfill (all service-role)
-- ============================================================
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON public.payments
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ============================================================
-- 2. receipts
--    Source: scripts/payments-v2/021-create-receipts-table.sql
--    App access: validation.ts (service-role)
-- ============================================================
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON public.receipts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ============================================================
-- 3. payment_jobs
--    Source: scripts/payments-v2/022-create-payment-jobs-table.sql
--    App access: JobQueue.ts (placeholder, not yet active)
-- ============================================================
ALTER TABLE public.payment_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON public.payment_jobs
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ============================================================
-- 4. email_failures
--    Source: scripts/payments-v2/027-create-email-failures-table.sql
--    App access: metrics.ts, admin emails (service-role)
-- ============================================================
ALTER TABLE public.email_failures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON public.email_failures
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ============================================================
-- 5. payment_events
--    Source: scripts/009-payment-security-hardening.sql
--    App access: PaymentService, webhooks, admin (heaviest usage)
-- ============================================================
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON public.payment_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ============================================================
-- 6. receipt_sequences
--    Source: scripts/payments-v2/025-atomic-receipt-number.sql
--    App access: generator.ts via get_next_receipt_number() RPC
--    Note: RPC function is SECURITY DEFINER, so RLS won't block it
-- ============================================================
ALTER TABLE public.receipt_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON public.receipt_sequences
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ============================================================
-- 7. payment_logs
--    Source: scripts/payments-v2/025-create-payment-logs-table.sql
--    App access: logging.ts (service-role)
-- ============================================================
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON public.payment_logs
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ============================================================
-- 8. review_notes
--    Source: scripts/030-admin-transaction-detail-schema.sql
--    App access: admin-payment-actions, admin-donation-actions (service-role)
-- ============================================================
ALTER TABLE public.review_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON public.review_notes
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ============================================================
-- 9. status_change_log
--    Source: scripts/030-admin-transaction-detail-schema.sql
--    App access: admin-payment-actions, admin-donation-actions (service-role)
-- ============================================================
ALTER TABLE public.status_change_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON public.status_change_log
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ============================================================
-- 10. receipt_failures
--    Source: scripts/payments-v2/026-create-receipt-failures-table.sql
--    App access: Monitoring/admin workflows (service-role)
-- ============================================================
ALTER TABLE public.receipt_failures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON public.receipt_failures
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');


-- ============================================================
-- 11. payments_with_session (PHANTOM TABLE — investigate first!)
--     Not found in any migration script.
--     If this table exists but is unused, DROP it instead.
--     Uncomment below only if the table must be kept.
-- ============================================================
-- ALTER TABLE public.payments_with_session ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Service role full access"
--   ON public.payments_with_session
--   FOR ALL
--   USING (auth.role() = 'service_role')
--   WITH CHECK (auth.role() = 'service_role');

-- RECOMMENDED: Investigate and drop if unused
-- SELECT * FROM public.payments_with_session LIMIT 5;
-- DROP TABLE IF EXISTS public.payments_with_session;
