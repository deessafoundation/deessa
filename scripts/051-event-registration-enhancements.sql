-- =============================================
-- EVENT REGISTRATION ENHANCEMENTS
-- Migration: 051-event-registration-enhancements.sql
-- Date: July 24, 2026
-- =============================================
--
-- Adds columns needed for the registration detail page:
--   - Admin notes & tracking
--   - Status timestamps (confirmed_at, cancelled_at)
--   - Payment lifecycle timestamps
--   - Email tracking timestamps
--   - Check-in tracking
--   - Registration source
--   - Ticket type reference
--   - Admin who performed actions
--
-- Creates:
--   - event_registration_emails table (communication log)
-- =============================================


-- =============================================
-- 1. ADD COLUMNS TO event_registrations
-- =============================================

-- Admin notes
ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Organization (extracted from custom_fields for display)
ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS organization TEXT;

-- Status timestamps
ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- Admin who performed actions
ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS confirmed_by TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_by TEXT;

-- Payment lifecycle timestamps
ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS payment_initiated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_review_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_override_by TEXT;

-- Email tracking timestamps
ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS last_registration_email_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_confirmation_email_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_cancellation_email_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_custom_email_sent_at TIMESTAMPTZ;

-- Check-in tracking
ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checked_in_by TEXT;

-- Registration source
ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS registration_source TEXT;

-- Ticket type reference
ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS ticket_type_id UUID REFERENCES event_ticket_types(id);


-- =============================================
-- 2. INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_event_reg_checked_in
  ON event_registrations(checked_in_at)
  WHERE checked_in_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_event_reg_ticket_type
  ON event_registrations(ticket_type_id)
  WHERE ticket_type_id IS NOT NULL;


-- =============================================
-- 3. COMMUNICATION LOG TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS event_registration_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  template_type TEXT, -- 'confirmation' | 'payment_receipt' | 'reminder' | 'cancellation' | 'custom'
  subject TEXT NOT NULL,
  body_html TEXT,
  body_text TEXT,
  sent_to TEXT NOT NULL,
  sent_by TEXT, -- admin user email or 'system'

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_reg_emails_reg
  ON event_registration_emails(registration_id);

CREATE INDEX IF NOT EXISTS idx_event_reg_emails_event
  ON event_registration_emails(event_id);

-- RLS
ALTER TABLE event_registration_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage registration emails"
  ON event_registration_emails FOR ALL
  USING (is_admin_user());


-- =============================================
-- 4. UPDATE VIEW
-- =============================================

-- Drop and recreate the view to include new columns
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


-- =============================================
-- 5. ADMIN NOTES HISTORY TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS event_registration_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  note TEXT NOT NULL,
  created_by TEXT, -- admin email or user ID

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_reg_notes_reg
  ON event_registration_notes(registration_id, created_at DESC);

-- RLS
ALTER TABLE event_registration_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage registration notes"
  ON event_registration_notes FOR ALL
  USING (is_admin_user());


-- =============================================
-- MIGRATION COMPLETE
-- =============================================
