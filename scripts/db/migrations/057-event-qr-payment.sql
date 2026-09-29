-- ═══════════════════════════════════════════════════════════════════════════
-- Event QR Code Payment Support
-- ═══════════════════════════════════════════════════════════════════════════
-- Adds QR code payment support for events:
--   1. Admin uploads QR code image + payment instructions on event settings
--   2. Public event page displays QR code for attendees to scan and pay
--   3. During registration, attendee uploads payment screenshot as proof
--   4. Admin reviews screenshot and manually marks payment as verified
--
-- New columns:
--   events.payment_qr_image_url   — Admin-uploaded QR code image (public bucket)
--   events.payment_instructions   — Payment instructions text
--   event_registrations.payment_screenshot_url — Attendee-uploaded proof (private bucket)
--
-- New storage bucket:
--   event-payment-screenshots — PRIVATE bucket for payment proof screenshots
--   Only service role can read/write; admin views via signed URLs
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Add columns to events table
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS payment_qr_image_url TEXT,
  ADD COLUMN IF NOT EXISTS payment_instructions TEXT;

COMMENT ON COLUMN events.payment_qr_image_url IS
  'Admin-uploaded QR code image URL for manual bank/wallet payment. Public URL from event-images bucket.';
COMMENT ON COLUMN events.payment_instructions IS
  'Payment instructions displayed alongside QR code (e.g., "Scan to pay NPR 500. Use name as reference.")';

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Add column to event_registrations table
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;

COMMENT ON COLUMN event_registrations.payment_screenshot_url IS
  'Storage path within event-payment-screenshots bucket. NOT a public URL — use service role signed URL to access.';

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Private storage bucket for payment screenshots
-- ─────────────────────────────────────────────────────────────────────────
-- Same pattern as bank-transfer-proofs (041-bank-transfer-donations.sql):
--   - Private bucket (public = false)
--   - NO storage.objects policies created
--   - With RLS enabled and no policy, only service role can read/write
--   - Admin views via server-minted signed URLs (1-hour expiry)
--   - Public upload handled via API route using service role client

INSERT INTO storage.buckets (id, name, public)
VALUES ('event-payment-screenshots', 'event-payment-screenshots', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- ─────────────────────────────────────────────────────────────────────────
-- 4. Indexes for common queries
-- ─────────────────────────────────────────────────────────────────────────

-- Quick lookup: find registrations with uploaded screenshots (for admin review)
CREATE INDEX IF NOT EXISTS idx_event_reg_screenshot
  ON event_registrations(event_id, payment_status)
  WHERE payment_screenshot_url IS NOT NULL;

-- Quick lookup: events with QR payment enabled
CREATE INDEX IF NOT EXISTS idx_events_qr_payment
  ON events(id)
  WHERE payment_qr_image_url IS NOT NULL AND is_free = false;

-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════
-- Summary:
--   - events table: +payment_qr_image_url, +payment_instructions
--   - event_registrations table: +payment_screenshot_url
--   - Private storage bucket: event-payment-screenshots
--   - 2 new indexes for query performance
--
-- Backward compatible: all new columns are nullable, no breaking changes.
-- Existing paid events (Stripe/Khazi/eSewa) continue to work unchanged.
-- ═══════════════════════════════════════════════════════════════════════════
