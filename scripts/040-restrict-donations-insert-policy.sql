-- ============================================================================
-- Security hardening: restrict the anonymous INSERT policy on `donations`.
--
-- Problem:
--   The original policy (scripts/001-create-tables.sql) was:
--       CREATE POLICY "Allow anonymous inserts" ON donations
--         FOR INSERT WITH CHECK (true);
--   The public anon key ships to every browser, so anyone could insert donation
--   rows with payment_status = 'completed', an arbitrary amount, forged receipt
--   fields, or provider confirmation references — polluting financial reports
--   and injecting records under other people's identities.
--
-- Fix:
--   Anonymous/public inserts may ONLY create genuinely pending donations with no
--   confirmation, receipt, or provider-reference fields set. Every state change
--   after creation (marking paid, receipts, provider refs) happens server-side
--   through the service role, which bypasses RLS and is unaffected by this policy.
--
-- Safe for the existing flow: lib/actions/donation.ts inserts with
--   payment_status = 'pending' and none of the restricted columns set, then does
--   all follow-up UPDATEs with the service-role client.
--
-- ⚠️ WHEN ADDING A COLUMN TO THIS POLICY: check it has no DEFAULT first.
--   WITH CHECK is evaluated AFTER column defaults are applied, so listing a
--   column that defaults to a non-NULL value makes the policy unsatisfiable and
--   blocks EVERY donation with "42501: new row violates row-level security
--   policy". That is exactly what verification_id did (see note below).
-- ============================================================================

-- Prerequisites: scripts/payments-v2/028-add-confirmed-at-to-donations.sql and
-- scripts/payments-v2/029-add-verification-id-to-donations.sql must be applied
-- first — this policy references donations.confirmed_at and donations.verification_id.
-- Both are ADD COLUMN IF NOT EXISTS, so re-running them is safe.

DROP POLICY IF EXISTS "Allow anonymous inserts" ON donations;
DROP POLICY IF EXISTS "Anon can create pending donations only" ON donations;

CREATE POLICY "Anon can create pending donations only" ON donations
  FOR INSERT
  WITH CHECK (
    payment_status = 'pending'
    AND receipt_number IS NULL
    AND receipt_url IS NULL
    AND receipt_generated_at IS NULL
    AND receipt_sent_at IS NULL
    AND confirmed_at IS NULL
    AND provider_ref IS NULL
    AND payment_id IS NULL
    AND stripe_session_id IS NULL
    AND stripe_subscription_id IS NULL
    AND khalti_pidx IS NULL
    AND esewa_transaction_uuid IS NULL
    AND esewa_transaction_code IS NULL
    -- NOTE: verification_id is deliberately NOT checked. It is declared
    -- `UUID DEFAULT gen_random_uuid()` in payments-v2/029, and WITH CHECK runs
    -- AFTER defaults are applied, so `verification_id IS NULL` is never true and
    -- rejects every donation with error 42501. Superseded by migration 041.
  );

COMMENT ON POLICY "Anon can create pending donations only" ON donations IS
  'Public/anon inserts are limited to pending donations with no confirmation, receipt, or provider-reference fields. All confirmation happens server-side via the service role.';
