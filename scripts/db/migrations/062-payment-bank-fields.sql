-- =============================================
-- 062: Add manual bank transfer fields to events
-- =============================================
-- When QR payment is enabled, admins can also provide bank transfer details
-- (bank name, account name, account number) as an alternative to scanning the QR code.

-- ── Events: bank transfer fields ─────────────────────────────────────────────
ALTER TABLE events ADD COLUMN IF NOT EXISTS payment_bank_name TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS payment_account_name TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS payment_account_number TEXT;

-- Add comments for clarity
COMMENT ON COLUMN events.payment_bank_name IS 'Bank name for manual transfer (e.g. Nabil Bank)';
COMMENT ON COLUMN events.payment_account_name IS 'Account holder name for manual transfer';
COMMENT ON COLUMN events.payment_account_number IS 'Account number for manual transfer';
