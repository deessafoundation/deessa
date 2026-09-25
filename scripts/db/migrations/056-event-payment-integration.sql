-- ============================================================
-- DEESSA Foundation — Event Registration: Payment Integration
-- Migration: 056-event-payment-integration.sql
-- Run in Supabase SQL Editor. Safe to run multiple times (IF NOT EXISTS).
-- ============================================================
-- Adds provider-specific session columns, unique constraints,
-- and payment_events linkage for the events payment flow.
-- ============================================================


-- ── 1. Add provider-specific session columns ─────────────────────────────────
-- The events module originally used only `provider_session_ref` (generic).
-- We add dedicated columns for each provider to enable unique constraints
-- and fast webhook lookups (same pattern as conference_registrations).

ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS khalti_pidx TEXT,
  ADD COLUMN IF NOT EXISTS esewa_transaction_uuid TEXT;


-- ── 2. Unique constraints for webhook reconciliation ─────────────────────────
-- Prevents duplicate provider session IDs from being inserted, enforcing
-- idempotency at the database level for Stripe, Khalti, and eSewa webhooks.
-- Uses partial unique indexes (WHERE col IS NOT NULL) so NULLs are allowed.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_event_reg_stripe_session_id'
  ) THEN
    ALTER TABLE event_registrations
      ADD CONSTRAINT uq_event_reg_stripe_session_id UNIQUE (stripe_session_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_event_reg_khalti_pidx'
  ) THEN
    ALTER TABLE event_registrations
      ADD CONSTRAINT uq_event_reg_khalti_pidx UNIQUE (khalti_pidx);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'uq_event_reg_esewa_uuid'
  ) THEN
    ALTER TABLE event_registrations
      ADD CONSTRAINT uq_event_reg_esewa_uuid UNIQUE (esewa_transaction_uuid);
  END IF;
END $$;


-- ── 3. Add "review" to payment_status CHECK constraint ───────────────────────
-- The original schema only allowed ('unpaid','paid','refunded','failed').
-- We add 'review' for amount-mismatch cases flagged for admin investigation.

ALTER TABLE event_registrations
  DROP CONSTRAINT IF EXISTS event_registrations_payment_status_check;

ALTER TABLE event_registrations
  ADD CONSTRAINT event_registrations_payment_status_check
  CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'failed', 'review'));


-- ── 4. Add event_registration_id to payment_events ───────────────────────────
-- The payment_events table (from 009) has donation_id and conference_registration_id.
-- We add event_registration_id to enable idempotency checks for event payments.

ALTER TABLE payment_events
  ADD COLUMN IF NOT EXISTS event_registration_id UUID
    REFERENCES event_registrations(id) ON DELETE SET NULL;


-- ── 5. Performance indexes for webhook lookups ────────────────────────────────
-- Fast lookups when Stripe/Khalti/eSewa webhooks arrive.

CREATE INDEX IF NOT EXISTS idx_event_reg_stripe_session
  ON event_registrations (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_event_reg_khalti_pidx
  ON event_registrations (khalti_pidx)
  WHERE khalti_pidx IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_event_reg_esewa_uuid
  ON event_registrations (esewa_transaction_uuid)
  WHERE esewa_transaction_uuid IS NOT NULL;

-- Fast expiry scan (only pending unpaid rows)
CREATE INDEX IF NOT EXISTS idx_event_reg_expires
  ON event_registrations (expires_at)
  WHERE status IN ('pending') AND payment_status = 'unpaid';

-- Index for payment_events linkage
CREATE INDEX IF NOT EXISTS idx_payment_events_event_reg
  ON payment_events (event_registration_id)
  WHERE event_registration_id IS NOT NULL;


-- ── 6. Update the view to include new columns ────────────────────────────────
-- Recreate the view so admin dashboards can access provider session columns.

DROP VIEW IF EXISTS event_registrations_with_event;

CREATE OR REPLACE VIEW event_registrations_with_event AS
SELECT
  r.id,
  r.event_id,
  r.full_name,
  r.email,
  r.phone,
  r.organization,
  r.custom_fields,
  r.form_schema_version,
  r.status,
  r.admin_notes,
  r.confirmed_at,
  r.cancelled_at,
  r.confirmed_by,
  r.cancelled_by,
  r.payment_status,
  r.payment_amount,
  r.payment_currency,
  r.payment_provider,
  r.payment_id,
  r.provider_session_ref,
  r.stripe_session_id,
  r.khalti_pidx,
  r.esewa_transaction_uuid,
  r.payment_initiated_at,
  r.payment_paid_at,
  r.payment_failed_at,
  r.payment_review_at,
  r.payment_override_by,
  r.consent_terms,
  r.consent_marketing,
  r.expires_at,
  r.checked_in_at,
  r.checked_in_by,
  r.registration_source,
  r.ticket_type_id,
  r.last_registration_email_sent_at,
  r.last_confirmation_email_sent_at,
  r.last_cancellation_email_sent_at,
  r.last_custom_email_sent_at,
  r.created_at,
  r.updated_at,
  e.title AS event_title,
  e.slug AS event_slug,
  e.event_date,
  e.event_time,
  e.location,
  e.is_free,
  e.status AS event_status
FROM event_registrations r
JOIN events e ON r.event_id = e.id;


-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
