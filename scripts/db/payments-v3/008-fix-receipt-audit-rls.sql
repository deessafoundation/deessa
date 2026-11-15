-- ============================================================
-- payments-v3 / 008-fix-receipt-audit-rls.sql
-- Fixes gap: S04 permissions, finding F05
-- ============================================================
-- Problem: In migration 010-receipt-system.sql, the INSERT policy was defined as:
--   CREATE POLICY "System can insert receipt logs" ON receipt_audit_log
--     FOR INSERT WITH CHECK (true);
--
-- This allowed ANY client (including anonymous visitors or authenticated non-admin
-- users) to insert arbitrary forged rows into the receipt audit log.
--
-- This migration:
--   1. Drops the open `WITH CHECK (true)` policy on `receipt_audit_log`.
--   2. Explicitly REVOKEs INSERT, UPDATE, DELETE on `receipt_audit_log` from
--      anon, authenticated, and public roles.
--   3. Adds a replacement INSERT policy requiring `auth.role() = 'service_role'`.
--   4. Adds explicit denial policies for mutations by anon and authenticated users.
--   5. Refreshes the admin SELECT policy so only active admins with appropriate
--      roles (SUPER_ADMIN, ADMIN, FINANCE) can view receipt audit logs.
--
-- Safe to run after: 001–007, 010
-- Idempotent: yes
-- Do NOT run SQL against live data. Do NOT modify application code.
-- ============================================================


-- ── 1. Ensure RLS is enabled ─────────────────────────────────────────────────
ALTER TABLE receipt_audit_log ENABLE ROW LEVEL SECURITY;


-- ── 2. Explicitly REVOKE mutating privileges ─────────────────────────────────
REVOKE INSERT, UPDATE, DELETE ON TABLE receipt_audit_log FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE receipt_audit_log FROM authenticated;
REVOKE ALL                     ON TABLE receipt_audit_log FROM public;

-- Grant minimal permissions back to service_role and authenticated
GRANT ALL    ON TABLE receipt_audit_log TO service_role;
GRANT SELECT ON TABLE receipt_audit_log TO authenticated;


-- ── 3. Drop the insecure WITH CHECK (true) policy ────────────────────────────
DROP POLICY IF EXISTS "System can insert receipt logs" ON receipt_audit_log;
DROP POLICY IF EXISTS "service_role_insert_receipt_audit_log" ON receipt_audit_log;


-- ── 4. Add service-role-only INSERT policy ────────────────────────────────────
-- Belt-and-suspenders alongside REVOKE: only service_role can insert audit rows.
CREATE POLICY "service_role_insert_receipt_audit_log" ON receipt_audit_log
  FOR INSERT TO authenticated, anon
  WITH CHECK (auth.role() = 'service_role');


-- ── 5. Deny all anon access (SELECT, INSERT, UPDATE, DELETE) ──────────────────
DROP POLICY IF EXISTS "deny_anon_receipt_audit_log" ON receipt_audit_log;
CREATE POLICY "deny_anon_receipt_audit_log" ON receipt_audit_log
  FOR ALL TO anon USING (false);


-- ── 6. Deny authenticated UPDATE and DELETE ──────────────────────────────────
-- Receipt audit records are strictly append-only; even admins cannot modify or delete them.
DROP POLICY IF EXISTS "deny_authenticated_update_receipt_audit_log" ON receipt_audit_log;
CREATE POLICY "deny_authenticated_update_receipt_audit_log" ON receipt_audit_log
  FOR UPDATE TO authenticated USING (false);

DROP POLICY IF EXISTS "deny_authenticated_delete_receipt_audit_log" ON receipt_audit_log;
CREATE POLICY "deny_authenticated_delete_receipt_audit_log" ON receipt_audit_log
  FOR DELETE TO authenticated USING (false);


-- ── 7. Admin-only SELECT policy ──────────────────────────────────────────────
-- Replaces "Admins can view receipt logs" with role-checked active admin restriction.
DROP POLICY IF EXISTS "Admins can view receipt logs" ON receipt_audit_log;
DROP POLICY IF EXISTS "admin_select_receipt_audit_log" ON receipt_audit_log;

CREATE POLICY "admin_select_receipt_audit_log" ON receipt_audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
        AND admin_users.is_active = true
        AND admin_users.role IN ('SUPER_ADMIN', 'ADMIN', 'FINANCE')
    )
  );
