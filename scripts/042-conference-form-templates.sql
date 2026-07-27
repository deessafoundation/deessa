-- ═══════════════════════════════════════════════════════════════════════════
-- Phase 4: Conference Form Templates
-- ═══════════════════════════════════════════════════════════════════════════
-- Creates a table for storing reusable form templates.
-- Admins can save forms as templates and apply them to new events.
-- ═══════════════════════════════════════════════════════════════════════════

-- Create form templates table
CREATE TABLE IF NOT EXISTS conference_form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Template metadata
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),  -- e.g., "workshop", "seminar", "networking"
  is_public BOOLEAN DEFAULT false,  -- Public templates visible to all admins

  -- The form configuration (same structure as conference_form_schemas.form_config)
  form_config JSONB NOT NULL,

  -- Audit trail
  created_by UUID REFERENCES admin_users(id),
  times_used INT DEFAULT 0,  -- Track how popular the template is

  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX idx_conference_form_templates_created_by 
  ON conference_form_templates(created_by)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_conference_form_templates_public 
  ON conference_form_templates(is_public, category)
  WHERE deleted_at IS NULL AND is_public = true;

CREATE INDEX idx_conference_form_templates_category 
  ON conference_form_templates(category)
  WHERE deleted_at IS NULL;

-- GIN index for searching within form_config JSON
CREATE INDEX idx_conference_form_templates_form_config
  ON conference_form_templates USING GIN (form_config);

-- ═══════════════════════════════════════════════════════════════════════════
-- Triggers
-- ═══════════════════════════════════════════════════════════════════════════

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_conference_form_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_conference_form_template_updated_at
BEFORE UPDATE ON conference_form_templates
FOR EACH ROW
EXECUTE FUNCTION update_conference_form_template_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE conference_form_templates ENABLE ROW LEVEL SECURITY;

-- Admins can view all templates (public + their own)
CREATE POLICY "Admins can view templates"
ON conference_form_templates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
  AND deleted_at IS NULL
  AND (
    is_public = true
    OR created_by = auth.uid()
  )
);

-- Admins can create templates
CREATE POLICY "Admins can create templates"
ON conference_form_templates
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
  AND created_by = auth.uid()
);

-- Admins can update their own templates
CREATE POLICY "Admins can update own templates"
ON conference_form_templates
FOR UPDATE
USING (
  created_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
);

-- Super admins can update any template
CREATE POLICY "Super admins can update any template"
ON conference_form_templates
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
    AND admin_users.role = 'SUPER_ADMIN'
  )
);

-- Admins can soft delete their own templates
CREATE POLICY "Admins can delete own templates"
ON conference_form_templates
FOR UPDATE
USING (
  created_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.id = auth.uid()
  )
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Seed Default Templates
-- ═══════════════════════════════════════════════════════════════════════════

-- Template 1: Basic Registration (minimal fields)
INSERT INTO conference_form_templates (name, description, category, is_public, form_config)
VALUES (
  'Basic Registration',
  'Simple registration form with name, email, and consent only',
  'basic',
  true,
  jsonb_build_object(
    'version', 1,
    'steps', jsonb_build_array(
      jsonb_build_object(
        'id', 'personal',
        'label', 'Personal Information',
        'order', 0,
        'fields', jsonb_build_array(
          jsonb_build_object(
            'id', 'full_name',
            'type', 'text',
            'label', 'Full Name',
            'required', true,
            'storage', 'core',
            'coreColumn', 'full_name',
            'order', 0
          ),
          jsonb_build_object(
            'id', 'email',
            'type', 'email',
            'label', 'Email Address',
            'required', true,
            'storage', 'core',
            'coreColumn', 'email',
            'order', 1
          ),
          jsonb_build_object(
            'id', 'consent_terms',
            'type', 'toggle',
            'label', 'I agree to the terms and conditions',
            'required', true,
            'storage', 'core',
            'coreColumn', 'consent_terms',
            'order', 2
          )
        )
      )
    ),
    'metadata', jsonb_build_object(
      'createdAt', now()::text,
      'notes', 'Basic template with minimal required fields'
    )
  )
)
ON CONFLICT DO NOTHING;

-- Template 2: Workshop Registration
INSERT INTO conference_form_templates (name, description, category, is_public, form_config)
VALUES (
  'Workshop Registration',
  'Registration form for workshops with skill level and dietary preferences',
  'workshop',
  true,
  jsonb_build_object(
    'version', 1,
    'steps', jsonb_build_array(
      jsonb_build_object(
        'id', 'personal',
        'label', 'Personal Details',
        'order', 0,
        'fields', jsonb_build_array(
          jsonb_build_object(
            'id', 'full_name',
            'type', 'text',
            'label', 'Full Name',
            'required', true,
            'storage', 'core',
            'order', 0
          ),
          jsonb_build_object(
            'id', 'email',
            'type', 'email',
            'label', 'Email Address',
            'required', true,
            'storage', 'core',
            'order', 1
          ),
          jsonb_build_object(
            'id', 'organization',
            'type', 'text',
            'label', 'Organization',
            'storage', 'core',
            'order', 2
          )
        )
      ),
      jsonb_build_object(
        'id', 'workshop',
        'label', 'Workshop Preferences',
        'order', 1,
        'fields', jsonb_build_array(
          jsonb_build_object(
            'id', 'skill_level',
            'type', 'radio',
            'label', 'Skill Level',
            'required', true,
            'storage', 'custom',
            'order', 0,
            'options', jsonb_build_array(
              jsonb_build_object('value', 'beginner', 'label', 'Beginner'),
              jsonb_build_object('value', 'intermediate', 'label', 'Intermediate'),
              jsonb_build_object('value', 'advanced', 'label', 'Advanced')
            )
          ),
          jsonb_build_object(
            'id', 'dietary_preference',
            'type', 'select',
            'label', 'Dietary Preferences',
            'storage', 'core',
            'order', 1,
            'options', jsonb_build_array(
              jsonb_build_object('value', 'none', 'label', 'No restrictions'),
              jsonb_build_object('value', 'vegetarian', 'label', 'Vegetarian'),
              jsonb_build_object('value', 'vegan', 'label', 'Vegan'),
              jsonb_build_object('value', 'gluten_free', 'label', 'Gluten Free'),
              jsonb_build_object('value', 'other', 'label', 'Other')
            )
          )
        )
      )
    ),
    'metadata', jsonb_build_object(
      'createdAt', now()::text,
      'notes', 'Template for workshop registrations'
    )
  )
)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- Verification Queries
-- ═══════════════════════════════════════════════════════════════════════════

-- List all templates
SELECT id, name, category, is_public, times_used, created_at
FROM conference_form_templates
WHERE deleted_at IS NULL
ORDER BY times_used DESC, created_at DESC;

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'conference_form_templates';

-- ═══════════════════════════════════════════════════════════════════════════
-- Migration Complete
-- ═══════════════════════════════════════════════════════════════════════════
-- Next Steps:
--   1. Build template selector UI in form builder
--   2. Implement save-as-template action
--   3. Test template application to new events
--   4. Add template preview functionality
-- ═══════════════════════════════════════════════════════════════════════════
