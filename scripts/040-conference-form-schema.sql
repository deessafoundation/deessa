-- ============================================================
-- DEESSA Foundation — Conference Dynamic Form Schema
-- Migration: 040-conference-form-schema.sql
-- Phase 1: Foundation & Dynamic Renderer
--
-- 1. Creates conference_form_schemas table (per-event versioned)
-- 2. Adds custom_fields JSONB + form_schema_version to conference_registrations
-- 3. RLS policies for the new table
-- 4. Indexes for performance
-- ============================================================

-- ── 1. conference_form_schemas table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conference_form_schemas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  TIMESTAMPTZ DEFAULT now(),

  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  version     INT NOT NULL,
  is_active   BOOLEAN DEFAULT false,

  -- The complete form configuration (JSONB — see lib/types/conference-form-schema.ts for shape)
  form_config JSONB NOT NULL,

  -- Audit trail
  created_by  UUID REFERENCES admin_users(id),
  notes       TEXT,

  CONSTRAINT uq_conf_form_schema_per_event UNIQUE (event_id, version)
);

COMMENT ON TABLE conference_form_schemas IS 'Versioned form schemas scoped per event. The active schema drives the public registration form.';
COMMENT ON COLUMN conference_form_schemas.event_id IS 'The event this schema belongs to. References events(id).';
COMMENT ON COLUMN conference_form_schemas.version IS 'Monotonically incrementing version number per event.';
COMMENT ON COLUMN conference_form_schemas.is_active IS 'Only one schema per event can be active at a time.';
COMMENT ON COLUMN conference_form_schemas.form_config IS 'JSONB containing the full form step/field definitions.';

-- Index for quick "get active" queries per event
CREATE INDEX IF NOT EXISTS idx_conf_form_schema_event_active
  ON conference_form_schemas (event_id, is_active)
  WHERE is_active = true;

-- Only one active schema per event at a time
CREATE UNIQUE INDEX IF NOT EXISTS uq_conf_form_schema_active_per_event
  ON conference_form_schemas (event_id, is_active)
  WHERE is_active = true;

-- ── 2. Alter conference_registrations ─────────────────────────────────────────
ALTER TABLE conference_registrations
  ADD COLUMN IF NOT EXISTS custom_fields        JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS form_schema_version  INT;

COMMENT ON COLUMN conference_registrations.custom_fields IS 'JSONB storage for dynamic (non-core) form field values. Core fields remain in fixed columns.';
COMMENT ON COLUMN conference_registrations.form_schema_version IS 'Version of the form schema used when this registration was submitted. Null for registrations created before the dynamic form system.';

-- GIN index for efficient queries on custom_fields keys/values
CREATE INDEX IF NOT EXISTS idx_conf_reg_custom_fields
  ON conference_registrations USING GIN (custom_fields);

-- ── 3. Row Level Security ─────────────────────────────────────────────────────
ALTER TABLE conference_form_schemas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies so the script can be re-run safely
DROP POLICY IF EXISTS "Public can read active form schema" ON conference_form_schemas;
DROP POLICY IF EXISTS "Admins can read all form schemas" ON conference_form_schemas;
DROP POLICY IF EXISTS "Admins can manage form schemas" ON conference_form_schemas;

-- Anyone can read the active schema (public form render needs this)
CREATE POLICY "Public can read active form schema" ON conference_form_schemas
  FOR SELECT USING (is_active = true);

-- Admins (authenticated) can read all versions
CREATE POLICY "Admins can read all form schemas" ON conference_form_schemas
  FOR SELECT USING (is_admin_user());

-- Super admins and admins can insert/update
CREATE POLICY "Admins can manage form schemas" ON conference_form_schemas
  FOR ALL USING (get_admin_role() IN ('SUPER_ADMIN', 'ADMIN'));

-- ── 4. Verify migration ──────────────────────────────────────────────────────
-- Run: SELECT * FROM conference_form_schemas LIMIT 1;
-- Run: SELECT custom_fields, form_schema_version FROM conference_registrations LIMIT 1;
