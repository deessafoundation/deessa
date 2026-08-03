-- 061-pay-at-venue-payment-methods.sql
-- Adds toggleable payment method columns and payment_method storage on registrations.

-- ── Events: payment method toggles ───────────────────────────────────────────
-- allow_online_payment defaults true for backward compat (existing paid events used online)
ALTER TABLE events ADD COLUMN IF NOT EXISTS allow_online_payment BOOLEAN NOT NULL DEFAULT true;
-- allow_qr_payment defaults false (admin must explicitly enable and upload QR)
ALTER TABLE events ADD COLUMN IF NOT EXISTS allow_qr_payment BOOLEAN NOT NULL DEFAULT false;
-- allow_pay_at_venue defaults false
ALTER TABLE events ADD COLUMN IF NOT EXISTS allow_pay_at_venue BOOLEAN NOT NULL DEFAULT false;

-- ── Registrations: store chosen payment method ────────────────────────────────
-- 'online' | 'qr' | 'venue' | null (free events)
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS payment_method TEXT
  CHECK (payment_method IS NULL OR payment_method IN ('online', 'qr', 'venue'));
