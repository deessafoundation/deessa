-- =============================================
-- PARTNER CONTEXT OWNERSHIP
-- Migration: 073-partner-context-ownership.sql
-- Date: October 28, 2026
-- =============================================
--
-- Adds context ownership tracking to partners table to distinguish
-- between global partners and event-specific/context-specific partners.
--
-- Problem:
--   Partners created inline in event settings were going to the global
--   partners directory, causing confusion and clutter.
--
-- Solution:
--   Track where each partner was created (created_context_type, created_context_id).
--   - Global partners: created_context_type IS NULL
--   - Event-specific: created_context_type = 'event', created_context_id = <event_id>
--
-- Impact:
--   - "Available partners" query will only show global partners
--   - Event-specific partners are only available within their owning event
--   - Maintains single partners table for referential integrity
-- =============================================

-- Add context ownership columns to partners table
ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS created_context_type TEXT
    CHECK (created_context_type IN ('event', 'homepage', 'program', 'about', 'story', 'project')),
  ADD COLUMN IF NOT EXISTS created_context_id UUID;

-- Index for filtering by ownership
CREATE INDEX idx_partners_context_ownership
  ON partners(created_context_type, created_context_id);

-- Index for global partners (NULL ownership = global)
CREATE INDEX idx_partners_global
  ON partners(created_context_type)
  WHERE created_context_type IS NULL;

-- Helper function: Check if partner is global
CREATE OR REPLACE FUNCTION partner_is_global(p_partner_id UUID)
RETURNS BOOLEAN AS $$
  SELECT created_context_type IS NULL
  FROM partners
  WHERE id = p_partner_id;
$$ LANGUAGE sql STABLE;

-- Helper function: Get partners available for a context
-- Returns global partners + partners created in this specific context
CREATE OR REPLACE FUNCTION get_available_partners_for_context(
  p_context_type TEXT,
  p_context_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  logo TEXT,
  website TEXT,
  description TEXT,
  type TEXT,
  is_published BOOLEAN,
  created_context_type TEXT,
  created_context_id UUID
) AS $$
  SELECT
    id,
    name,
    logo,
    website,
    description,
    type,
    is_published,
    created_context_type,
    created_context_id
  FROM partners
  WHERE
    is_published = true
    AND (
      -- Global partners (no ownership)
      created_context_type IS NULL
      OR
      -- Partners created in this specific context
      (
        created_context_type = p_context_type
        AND (
          (p_context_id IS NULL AND created_context_id IS NULL)
          OR created_context_id = p_context_id
        )
      )
    )
  ORDER BY name ASC;
$$ LANGUAGE sql STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION partner_is_global(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_available_partners_for_context(TEXT, UUID) TO authenticated, anon;

-- =============================================
-- DATA MIGRATION
-- =============================================
-- Mark all existing partners as global (created_context_type = NULL)
-- This preserves backward compatibility.

-- All existing partners become global by default (NULL ownership)
-- No UPDATE needed since columns are added as NULL by default

-- =============================================
-- NOTES
-- =============================================
-- Moving forward:
--   - Partners created via /admin/partners page: created_context_type = NULL (global)
--   - Partners created via event settings: created_context_type = 'event', created_context_id = <event_id>
--   - Available partners query must filter by context ownership
--   - UI must distinguish between global and context-specific partners
-- =============================================

