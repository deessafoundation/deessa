-- ============================================================================
-- Bank transfer donations
--
-- Adds the columns needed to record an offline bank transfer, and a PRIVATE
-- storage bucket for the donor's deposit slip / transfer screenshot.
--
-- Bank transfers are not a payment gateway: nothing verifies them
-- programmatically. Rows land as `pending` and an admin confirms them against
-- the bank statement via changePaymentStatus(), which triggers the existing
-- receipt generation.
--
-- Prerequisite: scripts/040-restrict-donations-insert-policy.sql
-- Re-runnable.
-- ============================================================================

ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS bank_account_id     TEXT,
  ADD COLUMN IF NOT EXISTS bank_transfer_date  DATE,
  ADD COLUMN IF NOT EXISTS bank_proof_path     TEXT;

COMMENT ON COLUMN donations.bank_account_id IS
  'Which published account the donor says they paid into (BANK_ACCOUNTS[].id in lib/payments/bank-details.ts)';
COMMENT ON COLUMN donations.bank_transfer_date IS
  'Date the donor says the transfer was made — used to locate the line on the bank statement';
COMMENT ON COLUMN donations.bank_proof_path IS
  'Path within the private bank-transfer-proofs storage bucket. Never a public URL.';

CREATE INDEX IF NOT EXISTS idx_donations_bank_pending
  ON donations (created_at DESC)
  WHERE provider = 'bank' AND payment_status = 'pending';

-- ---------------------------------------------------------------------------
-- Supersedes the policy created in 040: same rules, plus the new bank columns.
-- A donor may state a reference and a date, but must not be able to point
-- bank_proof_path at an arbitrary object in the bucket — that is set
-- server-side with the service role after a successful upload.
-- ---------------------------------------------------------------------------

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
    AND bank_proof_path IS NULL
    -- NOTE: verification_id is deliberately NOT checked here.
    -- 029-add-verification-id-to-donations.sql declares it
    -- `UUID DEFAULT gen_random_uuid()`, and WITH CHECK is evaluated AFTER
    -- defaults are applied — so `verification_id IS NULL` can never be true and
    -- would reject every donation with error 42501. It is only a public lookup
    -- handle for /verify/[id], carries no confirmation authority, and its unique
    -- index prevents colliding with an existing receipt.
  );

COMMENT ON POLICY "Anon can create pending donations only" ON donations IS
  'Public/anon inserts are limited to pending donations with no confirmation, receipt, provider-reference, or proof-path fields. All confirmation happens server-side via the service role.';

-- ---------------------------------------------------------------------------
-- Private bucket for proof of transfer.
-- No storage.objects policies are created on purpose: with RLS enabled and no
-- policy, only the service role can read or write. Admins view a proof through
-- a server-generated signed URL (same pattern as support-screenshots).
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('bank-transfer-proofs', 'bank-transfer-proofs', false)
ON CONFLICT (id) DO UPDATE SET public = false;
