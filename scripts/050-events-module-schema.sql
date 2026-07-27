-- =============================================
-- EVENTS MODULE — DATABASE SCHEMA
-- Migration: 050-events-module-schema.sql
-- Date: July 23, 2026
-- =============================================
--
-- This migration creates the complete Events Module schema.
-- It DROPS the existing events table (no production data)
-- and creates all new tables from scratch.
--
-- DEC-001: Drop existing events table, create fresh
-- DEC-005: is_free flag for free/paid/free-then-paid events
-- DEC-006: max_capacity nullable (waitlist deferred to Phase 2+)
-- DEC-007: Single agenda table with day_number column
--
-- Tables created:
--   1. events                    — Core event records
--   2. event_agenda_items        — Multi-day schedule/sessions
--   3. event_form_schemas        — Versioned registration forms
--   4. event_form_templates      — Reusable form starting points
--   5. event_registrations       — Registration submissions
--   6. event_ticket_types        — Pricing tiers per event
--   7. event_email_templates     — Customizable email content
--
-- Views created:
--   event_registrations_with_event — JOIN view for admin dashboards
--
-- Functions created:
--   can_delete_event(UUID) — Guard: checks if event has registrations
--
-- RLS policies applied to all new tables.
-- =============================================


-- =============================================
-- 0. DROP EXISTING EVENTS TABLE
-- =============================================
-- DEC-001: No production data in events table.
-- Conference system has its own conference_* tables (completely independent).
-- Safe to drop and recreate with the new schema.

DROP TABLE IF EXISTS event_agenda_items CASCADE;
DROP TABLE IF EXISTS event_form_schemas CASCADE;
DROP TABLE IF EXISTS event_form_templates CASCADE;
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS event_ticket_types CASCADE;
DROP TABLE IF EXISTS event_email_templates CASCADE;
DROP TABLE IF EXISTS events CASCADE;


-- =============================================
-- 1. EVENTS TABLE (Fresh)
-- =============================================
-- Core event record. All event types (conference, workshop, seminar, etc.)
-- live here. Admin creates events, public browses published ones.

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,

  -- Dates & Location
  event_date DATE NOT NULL,
  event_time TEXT,                        -- Display text: "09:00 AM"
  event_end_date DATE,
  location TEXT NOT NULL,
  venue_name TEXT,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,

  -- Media
  image TEXT,                             -- Card thumbnail
  banner_url TEXT,                        -- Hero/detail page image
  gallery JSONB NOT NULL DEFAULT '[]',    -- Array of image URLs

  -- Status & Type
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'disabled', 'archived')),
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('conference', 'workshop', 'seminar', 'meetup', 'general')),

  -- Registration
  registration_enabled BOOLEAN NOT NULL DEFAULT true,
  registration_open_at TIMESTAMPTZ,
  registration_close_at TIMESTAMPTZ,
  max_capacity INT,                       -- NULL = unlimited (waitlist deferred)

  -- Pricing (DEC-005)
  is_free BOOLEAN NOT NULL DEFAULT false,

  -- Contact
  contact_email TEXT,

  -- Audit
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_events_status_date ON events(status, event_date);
CREATE INDEX idx_events_category ON events(category, status);
CREATE INDEX idx_events_slug ON events(slug);

-- RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Public: see published events
CREATE POLICY "Public can view published events"
  ON events FOR SELECT
  USING (status = 'published');

-- Admin: full access
CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING (is_admin_user());


-- =============================================
-- 2. EVENT AGENDA ITEMS
-- =============================================
-- DEC-007: Single table with day_number for multi-day support.
-- Simpler queries, no JOINs, sufficient for 1-3 day events.

CREATE TABLE event_agenda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Multi-day support
  day_number INT NOT NULL DEFAULT 1,
  day_label TEXT,                         -- Optional: "Day 1: Opening", "Saturday"

  -- Time slots (display text to avoid timezone issues)
  start_time TEXT,                        -- "09:00 AM"
  end_time TEXT,                          -- "10:30 AM"

  -- Session details
  title TEXT NOT NULL,
  description TEXT,
  speaker_name TEXT,
  speaker_title TEXT,
  track_or_room TEXT,

  -- Ordering
  sort_order INT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_agenda_event_day
  ON event_agenda_items(event_id, day_number, sort_order);

-- RLS
ALTER TABLE event_agenda_items ENABLE ROW LEVEL SECURITY;

-- Public: see agenda for published events
CREATE POLICY "Public can view agenda for published events"
  ON event_agenda_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_agenda_items.event_id
      AND events.status = 'published'
    )
  );

-- Admin: full access
CREATE POLICY "Admins can manage agenda items"
  ON event_agenda_items FOR ALL
  USING (is_admin_user());


-- =============================================
-- 3. EVENT FORM SCHEMAS
-- =============================================
-- Versioned form definitions per event.
-- Mirrors the proven conference_form_schemas pattern.
-- Only ONE active schema per event at a time.

CREATE TABLE event_form_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  version INT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  form_config JSONB NOT NULL,             -- Full FormSchema JSON (same shape as conference)
  created_by UUID REFERENCES admin_users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_event_form_schema_version UNIQUE (event_id, version)
);

-- Only one active schema per event
CREATE UNIQUE INDEX uq_event_form_schema_active
  ON event_form_schemas(event_id) WHERE is_active = true;

-- Quick "get active schema" query
CREATE INDEX idx_event_form_schema_event_active
  ON event_form_schemas(event_id, is_active)
  WHERE is_active = true;

-- RLS
ALTER TABLE event_form_schemas ENABLE ROW LEVEL SECURITY;

-- Public: read active schema only (for registration form rendering)
CREATE POLICY "Public can read active form schema"
  ON event_form_schemas FOR SELECT
  USING (is_active = true);

-- Admin: full access
CREATE POLICY "Admins can manage form schemas"
  ON event_form_schemas FOR ALL
  USING (is_admin_user());


-- =============================================
-- 4. EVENT FORM TEMPLATES
-- =============================================
-- Reusable form starting points.
-- Unlike conference version, this will be wired into the UI from day one.

CREATE TABLE event_form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,                           -- 'default' | 'academic' | 'business' | etc.
  is_public BOOLEAN DEFAULT false,
  form_config JSONB NOT NULL,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE event_form_templates ENABLE ROW LEVEL SECURITY;

-- Public: read public templates
CREATE POLICY "Public can view public templates"
  ON event_form_templates FOR SELECT
  USING (is_public = true);

-- Admin: full access
CREATE POLICY "Admins can manage templates"
  ON event_form_templates FOR ALL
  USING (is_admin_user());


-- =============================================
-- 5. EVENT REGISTRATIONS
-- =============================================
-- Slimmer than conference_registrations.
-- Core fields (full_name, email, phone) in fixed columns.
-- Everything else in custom_fields JSONB.
-- ON DELETE RESTRICT: cannot delete event with registrations.

CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,

  -- Core fields (always in columns for email/payment/legal)
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  -- Dynamic fields (schema-driven per event)
  custom_fields JSONB NOT NULL DEFAULT '{}',
  form_schema_version INT,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'expired')),

  -- Payment
  payment_status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'failed')),
  payment_amount DECIMAL,
  payment_currency TEXT,
  payment_provider TEXT,                   -- 'stripe' | 'khalti' | 'esewa'
  payment_id TEXT,
  provider_session_ref TEXT,               -- Generalized: one column for all providers

  -- Consent
  consent_terms BOOLEAN NOT NULL DEFAULT false,
  consent_marketing BOOLEAN NOT NULL DEFAULT false,

  -- Expiry
  expires_at TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique: one active registration per email per event
CREATE UNIQUE INDEX uq_event_reg_active_email_per_event
  ON event_registrations(event_id, email)
  WHERE status NOT IN ('cancelled', 'expired');

-- Query indexes
CREATE INDEX idx_event_reg_event_status ON event_registrations(event_id, status);
CREATE INDEX idx_event_reg_event_payment ON event_registrations(event_id, payment_status);
CREATE INDEX idx_event_reg_created ON event_registrations(created_at);

-- RLS
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Public: INSERT only (with validation)
CREATE POLICY "Public can register for events"
  ON event_registrations FOR INSERT
  WITH CHECK (
    full_name IS NOT NULL
    AND email IS NOT NULL
    AND consent_terms = true
    AND event_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_registrations.event_id
      AND events.status = 'published'
    )
  );

-- Admin: full access
CREATE POLICY "Admins can manage registrations"
  ON event_registrations FOR ALL
  USING (is_admin_user());


-- =============================================
-- 6. EVENT TICKET TYPES
-- =============================================
-- Pricing tiers per event.
-- One event can have multiple ticket types (Early Bird, Regular, Student, etc.)

CREATE TABLE event_ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  name TEXT NOT NULL,                      -- "Early Bird", "Regular", "Student"
  price DECIMAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'NPR',
  capacity INT,                           -- NULL = unlimited
  sales_start TIMESTAMPTZ,
  sales_end TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_ticket_event ON event_ticket_types(event_id, is_active);

-- RLS
ALTER TABLE event_ticket_types ENABLE ROW LEVEL SECURITY;

-- Public: read active ticket types for published events
CREATE POLICY "Public can view ticket types"
  ON event_ticket_types FOR SELECT
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_ticket_types.event_id
      AND events.status = 'published'
    )
  );

-- Admin: full access
CREATE POLICY "Admins can manage ticket types"
  ON event_ticket_types FOR ALL
  USING (is_admin_user());


-- =============================================
-- 7. EVENT EMAIL TEMPLATES
-- =============================================
-- Customizable email content per event.
-- Supports variable interpolation: {{full_name}}, {{event_title}}, etc.

CREATE TABLE event_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  template_type TEXT NOT NULL
    CHECK (template_type IN ('confirmation', 'payment_receipt', 'reminder', 'cancellation', 'custom')),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_event_email_template UNIQUE (event_id, template_type)
);

-- RLS
ALTER TABLE event_email_templates ENABLE ROW LEVEL SECURITY;

-- Admin only (email templates contain admin-configured content)
CREATE POLICY "Admins can manage email templates"
  ON event_email_templates FOR ALL
  USING (is_admin_user());


-- =============================================
-- 8. HELPER VIEW
-- =============================================
-- Convenient JOIN for admin dashboards.
-- Shows registration data with event context.

CREATE OR REPLACE VIEW event_registrations_with_event AS
SELECT
  r.id,
  r.event_id,
  r.full_name,
  r.email,
  r.phone,
  r.custom_fields,
  r.form_schema_version,
  r.status,
  r.payment_status,
  r.payment_amount,
  r.payment_currency,
  r.payment_provider,
  r.payment_id,
  r.provider_session_ref,
  r.consent_terms,
  r.consent_marketing,
  r.expires_at,
  r.created_at,
  r.updated_at,
  e.title AS event_title,
  e.slug AS event_slug,
  e.event_date,
  e.status AS event_status
FROM event_registrations r
JOIN events e ON r.event_id = e.id;


-- =============================================
-- 9. HELPER FUNCTION
-- =============================================
-- Guard function: checks if an event can be deleted.
-- Returns false if event has any registrations.

CREATE OR REPLACE FUNCTION can_delete_event(p_event_id UUID)
RETURNS BOOLEAN AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM event_registrations WHERE event_id = p_event_id
  );
$$ LANGUAGE sql STABLE;

-- Grant execute to authenticated users (admin check happens in app layer)
GRANT EXECUTE ON FUNCTION can_delete_event(UUID) TO authenticated;


-- =============================================
-- 10. SEED DEFAULT DATA (Optional)
-- =============================================
-- Insert a default email template for new events.
-- Admin can customize these per event later.

-- Note: Default templates are NOT seeded here because they require an event_id.
-- Instead, when an admin creates a new event, the app layer will create
-- default email templates via server actions.


-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- Summary:
--   - events table: dropped and recreated with new schema
--   - 6 new tables created with proper constraints and indexes
--   - RLS policies applied to all tables
--   - Helper view and function created
--   - All foreign keys reference admin_users(id) and events(id)
--
-- Next steps:
--   1. Verify migration runs cleanly on dev database
--   2. Test RLS policies with public and admin roles
--   3. Create lib/types/events-module.ts
--   4. Create lib/actions/events-module/event-crud.ts
-- =============================================
