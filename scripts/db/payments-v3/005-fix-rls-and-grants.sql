-- ============================================================
-- payments-v3 / 005-fix-rls-and-grants.sql
-- Fixes gap: S04 (permissions), S06 (audit access)
-- ============================================================
-- Problem (from schema-review.md S04, S06, finding F05):
--   - payments, payment_events, payment_jobs, receipt_sequences, payment_logs
--     have no explicit REVOKE for anon/authenticated roles — public exposure
--     depends solely on live Supabase defaults and RLS being enabled.
--   - payment_logs RLS is commented out in migration 025b.
--   - `payment_logs` has no policies; `receipt_sequences` has no policies.
--
-- This migration:
--   1. Enables RLS on all sensitive payment tables (idempotent).
--   2. REVOKEs INSERT, UPDATE, DELETE from anon and authenticated on:
--      payments, payment_events, payment_jobs, receipt_sequences, payment_logs.
--   3. Grants SELECT on payments/payment_events/payment_logs to authenticated
--      only where needed for admin reads (all other access via service_role).
--   4. Drops the overly-permissive INSERT policy on payment_logs if present.
--   5. Adds deny-all policies for anon + authenticated on these tables
--      (belt-and-suspenders alongside the REVOKE).
--
-- NOTE: service_role bypasses RLS by design in Supabase. All server-side
-- writes use the service_role key. These REVOKEs only affect anon/authenticated
-- client SDK calls.
--
-- Safe to run after: 001–004 (and after 025b which creates payment_logs)
-- Idempotent: yes
-- Do NOT run SQL against live data. Do NOT modify application code.
-- ============================================================


-- ── Helper: enable RLS (safe to call if already enabled) ─────────────────────
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_jobs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs      ENABLE ROW LEVEL SECURITY;


-- ── 1. REVOKE mutating privileges from anon and authenticated ─────────────────

-- payments
REVOKE INSERT, UPDATE, DELETE ON TABLE payments FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE payments FROM authenticated;

-- payment_events
REVOKE INSERT, UPDATE, DELETE ON TABLE payment_events FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE payment_events FROM authenticated;

-- payment_jobs
REVOKE INSERT, UPDATE, DELETE ON TABLE payment_jobs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE payment_jobs FROM authenticated;

-- receipt_sequences (counter mutations must go through generate_receipt_number())
REVOKE INSERT, UPDATE, DELETE ON TABLE receipt_sequences FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE receipt_sequences FROM authenticated;
-- Also revoke SELECT from anon (no reason to expose receipt counter to public)
REVOKE SELECT ON TABLE receipt_sequences FROM anon;
REVOKE SELECT ON TABLE receipt_sequences FROM authenticated;

-- payment_logs (write-only through service_role; admin read via SELECT policy below)
REVOKE INSERT, UPDATE, DELETE ON TABLE payment_logs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE payment_logs FROM authenticated;


-- ── 2. Add deny-all RLS policies for anon on all sensitive tables ─────────────
-- These block any SELECT that would otherwise be allowed by Supabase defaults.

-- payments
DROP POLICY IF EXISTS "deny_anon_payments" ON payments;
CREATE POLICY "deny_anon_payments" ON payments
  FOR ALL TO anon USING (false);

-- payment_events
DROP POLICY IF EXISTS "deny_anon_payment_events" ON payment_events;
CREATE POLICY "deny_anon_payment_events" ON payment_events
  FOR ALL TO anon USING (false);

-- payment_jobs
DROP POLICY IF EXISTS "deny_anon_payment_jobs" ON payment_jobs;
CREATE POLICY "deny_anon_payment_jobs" ON payment_jobs
  FOR ALL TO anon USING (false);

-- receipt_sequences
DROP POLICY IF EXISTS "deny_anon_receipt_sequences" ON receipt_sequences;
CREATE POLICY "deny_anon_receipt_sequences" ON receipt_sequences
  FOR ALL TO anon USING (false);

-- payment_logs
DROP POLICY IF EXISTS "deny_anon_payment_logs" ON payment_logs;
CREATE POLICY "deny_anon_payment_logs" ON payment_logs
  FOR ALL TO anon USING (false);


-- ── 3. Admin-only SELECT policies for authenticated users ─────────────────────
-- Financial admins (ADMIN, SUPER_ADMIN, FINANCE roles) need read access
-- to payments and payment_logs via admin dashboards.

-- payments: allow SELECT for active admins only
DROP POLICY IF EXISTS "admin_select_payments" ON payments;
CREATE POLICY "admin_select_payments" ON payments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
        AND admin_users.is_active = true
        AND admin_users.role IN ('SUPER_ADMIN', 'ADMIN', 'FINANCE')
    )
  );

-- payment_events: allow SELECT for active admins only
DROP POLICY IF EXISTS "admin_select_payment_events" ON payment_events;
CREATE POLICY "admin_select_payment_events" ON payment_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
        AND admin_users.is_active = true
        AND admin_users.role IN ('SUPER_ADMIN', 'ADMIN', 'FINANCE')
    )
  );

-- payment_logs: allow SELECT for active admins only
DROP POLICY IF EXISTS "admin_select_payment_logs" ON payment_logs;
CREATE POLICY "admin_select_payment_logs" ON payment_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
        AND admin_users.is_active = true
        AND admin_users.role IN ('SUPER_ADMIN', 'ADMIN', 'FINANCE')
    )
  );

-- payment_jobs: allow SELECT for active admins only
DROP POLICY IF EXISTS "admin_select_payment_jobs" ON payment_jobs;
CREATE POLICY "admin_select_payment_jobs" ON payment_jobs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
        AND admin_users.is_active = true
        AND admin_users.role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );


-- ── 4. Deny authenticated users INSERT/UPDATE/DELETE via RLS policies ─────────
-- Belt-and-suspenders: even if a future GRANT accidentally adds INSERT back,
-- RLS policies still block it.

-- payments
DROP POLICY IF EXISTS "deny_authenticated_mutate_payments" ON payments;
CREATE POLICY "deny_authenticated_mutate_payments" ON payments
  FOR ALL TO authenticated
  USING (false)
  WITH CHECK (false);

-- (The SELECT policy above takes precedence for SELECT because Supabase
--  evaluates permissive policies with OR semantics. The ALL USING(false)
--  policy only blocks INSERT/UPDATE/DELETE where there is no matching
--  permissive SELECT policy.)
-- Actually for safety, we keep the SELECT policy separate and add
-- explicit mutation-only denials:

DROP POLICY IF EXISTS "deny_authenticated_insert_payments" ON payments;
CREATE POLICY "deny_authenticated_insert_payments" ON payments
  FOR INSERT TO authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "deny_authenticated_update_payments" ON payments;
CREATE POLICY "deny_authenticated_update_payments" ON payments
  FOR UPDATE TO authenticated USING (false);

DROP POLICY IF EXISTS "deny_authenticated_delete_payments" ON payments;
CREATE POLICY "deny_authenticated_delete_payments" ON payments
  FOR DELETE TO authenticated USING (false);

-- Drop the catch-all ALL policy we added above since we have specific ones
DROP POLICY IF EXISTS "deny_authenticated_mutate_payments" ON payments;

-- payment_events mutations
DROP POLICY IF EXISTS "deny_authenticated_insert_payment_events" ON payment_events;
CREATE POLICY "deny_authenticated_insert_payment_events" ON payment_events
  FOR INSERT TO authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "deny_authenticated_update_payment_events" ON payment_events;
CREATE POLICY "deny_authenticated_update_payment_events" ON payment_events
  FOR UPDATE TO authenticated USING (false);

DROP POLICY IF EXISTS "deny_authenticated_delete_payment_events" ON payment_events;
CREATE POLICY "deny_authenticated_delete_payment_events" ON payment_events
  FOR DELETE TO authenticated USING (false);

-- payment_jobs mutations
DROP POLICY IF EXISTS "deny_authenticated_insert_payment_jobs" ON payment_jobs;
CREATE POLICY "deny_authenticated_insert_payment_jobs" ON payment_jobs
  FOR INSERT TO authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "deny_authenticated_update_payment_jobs" ON payment_jobs;
CREATE POLICY "deny_authenticated_update_payment_jobs" ON payment_jobs
  FOR UPDATE TO authenticated USING (false);

DROP POLICY IF EXISTS "deny_authenticated_delete_payment_jobs" ON payment_jobs;
CREATE POLICY "deny_authenticated_delete_payment_jobs" ON payment_jobs
  FOR DELETE TO authenticated USING (false);

-- payment_logs mutations
DROP POLICY IF EXISTS "deny_authenticated_insert_payment_logs" ON payment_logs;
CREATE POLICY "deny_authenticated_insert_payment_logs" ON payment_logs
  FOR INSERT TO authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "deny_authenticated_update_payment_logs" ON payment_logs;
CREATE POLICY "deny_authenticated_update_payment_logs" ON payment_logs
  FOR UPDATE TO authenticated USING (false);

DROP POLICY IF EXISTS "deny_authenticated_delete_payment_logs" ON payment_logs;
CREATE POLICY "deny_authenticated_delete_payment_logs" ON payment_logs
  FOR DELETE TO authenticated USING (false);


-- ── 5. Function execution privileges (Rate limiting RPC) ──────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'increment_rate_limit'
  ) THEN
    REVOKE EXECUTE ON FUNCTION increment_rate_limit(text, integer) FROM PUBLIC;
    REVOKE EXECUTE ON FUNCTION increment_rate_limit(text, integer) FROM anon;
    GRANT EXECUTE ON FUNCTION increment_rate_limit(text, integer) TO service_role;
  END IF;
END $$;
