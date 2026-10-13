-- =============================================
-- UNIVERSAL PARTNERS SYSTEM
-- Migration: 070-universal-partners-system.sql
-- Date: October 28, 2026
-- =============================================
--
-- This migration creates a universal, context-agnostic partners system
-- with configurable categories and dual-level ordering.
--
-- Architecture:
--   1. partners (existing) — Master partner directory
--   2. partner_categories (new) — Configurable category definitions per context
--   3. context_partners (new) — Links partners to any context with category assignment
--
-- Context types supported:
--   - 'event' (links to events table)
--   - 'homepage' (global, context_id = NULL)
--   - 'program', 'about', 'story', 'project' (future extensibility)
--
-- Ordering model:
--   - Category-level: partner_categories.display_order (controls category sequence)
--   - Partner-level: context_partners.display_order (controls partner order within category)
--
-- Design decisions:
--   - Fully configurable categories per context (different events can have different categories)
--   - Partners can appear in multiple contexts/categories
--   - Per-partner visibility toggle (is_visible)
--   - Logo storage will be handled by storage bucket (separate migration)
-- =============================================


-- =============================================
-- 1. PARTNER CATEGORIES TABLE
-- =============================================
-- Defines the categories available for a specific context.
-- Admin configures these per context (e.g., Event A has "Organizers, Sponsors, Media Partners").

CREATE TABLE partner_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Context identification
  context_type TEXT NOT NULL
    CHECK (context_type IN ('event', 'homepage', 'program', 'about', 'story', 'project')),
  context_id UUID,                          -- NULL for global contexts like 'homepage'

  -- Category definition
  category_key TEXT NOT NULL,               -- Programmatic key: 'organizers', 'sponsors', etc.
  category_label TEXT NOT NULL,             -- Display name: "Organizing Partners", "Sponsors"
  display_order INT NOT NULL DEFAULT 0,     -- Category ordering (lower = appears first)

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_partner_categories_context
  ON partner_categories(context_type, context_id);
CREATE INDEX idx_partner_categories_context_order
  ON partner_categories(context_type, context_id, display_order);

-- Unique constraint: one category_key per context (handles NULL context_id)
-- Split into two indexes: one for NULL context_id, one for non-NULL
CREATE UNIQUE INDEX uq_partner_category_per_context_null
  ON partner_categories(context_type, category_key)
  WHERE context_id IS NULL;

CREATE UNIQUE INDEX uq_partner_category_per_context_not_null
  ON partner_categories(context_type, context_id, category_key)
  WHERE context_id IS NOT NULL;

-- RLS
ALTER TABLE partner_categories ENABLE ROW LEVEL SECURITY;

-- Public: read all categories
CREATE POLICY "Public can view partner categories"
  ON partner_categories FOR SELECT
  USING (true);

-- Admin: full access
CREATE POLICY "Admins can manage partner categories"
  ON partner_categories FOR ALL
  USING (is_admin_user());


-- =============================================
-- 2. CONTEXT PARTNERS TABLE
-- =============================================
-- Links partners to contexts with category assignment and ordering.
-- This is the "junction table" that makes the system universal.

CREATE TABLE context_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Context identification (mirrors partner_categories)
  context_type TEXT NOT NULL
    CHECK (context_type IN ('event', 'homepage', 'program', 'about', 'story', 'project')),
  context_id UUID,                          -- NULL for global contexts

  -- Partner link
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,

  -- Category assignment
  category_key TEXT NOT NULL,               -- Must match a category_key in partner_categories

  -- Ordering within category
  display_order INT NOT NULL DEFAULT 0,     -- Lower = appears first within category

  -- Visibility
  is_visible BOOLEAN NOT NULL DEFAULT true,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_context_partners_context
  ON context_partners(context_type, context_id);
CREATE INDEX idx_context_partners_partner
  ON context_partners(partner_id);
CREATE INDEX idx_context_partners_category_order
  ON context_partners(context_type, context_id, category_key, display_order);
CREATE INDEX idx_context_partners_visible
  ON context_partners(context_type, context_id, is_visible)
  WHERE is_visible = true;

-- Unique constraint: one partner per context (handles NULL context_id)
-- Split into two indexes: one for NULL context_id, one for non-NULL
CREATE UNIQUE INDEX uq_partner_per_context_null
  ON context_partners(context_type, partner_id)
  WHERE context_id IS NULL;

CREATE UNIQUE INDEX uq_partner_per_context_not_null
  ON context_partners(context_type, context_id, partner_id)
  WHERE context_id IS NOT NULL;

-- RLS
ALTER TABLE context_partners ENABLE ROW LEVEL SECURITY;

-- Public: read visible partners with context-specific rules
CREATE POLICY "Public can view visible context partners"
  ON context_partners FOR SELECT
  USING (
    is_visible = true
    AND (
      -- Homepage partners: always visible
      (context_type = 'homepage')
      OR
      -- Event partners: only if event is published
      (context_type = 'event' AND EXISTS (
        SELECT 1 FROM events
        WHERE events.id = context_partners.context_id
        AND events.status = 'published'
      ))
      OR
      -- Future context types: add visibility rules here
      (context_type IN ('program', 'about', 'story', 'project'))
    )
  );

-- Admin: full access
CREATE POLICY "Admins can manage context partners"
  ON context_partners FOR ALL
  USING (is_admin_user());


-- =============================================
-- 3. HELPER VIEW
-- =============================================
-- Denormalized view for efficient querying.
-- Joins partners, categories, and context links for complete display data.

CREATE OR REPLACE VIEW context_partners_detailed AS
SELECT
  cp.id,
  cp.context_type,
  cp.context_id,
  cp.partner_id,
  cp.category_key,
  cp.display_order AS partner_display_order,
  cp.is_visible,
  cp.created_at,
  cp.updated_at,
  -- Partner data
  p.name AS partner_name,
  p.logo AS partner_logo,
  p.website AS partner_website,
  p.description AS partner_description,
  p.type AS partner_type,
  -- Category data
  pc.category_label,
  pc.display_order AS category_display_order
FROM context_partners cp
INNER JOIN partners p ON cp.partner_id = p.id
INNER JOIN partner_categories pc
  ON cp.context_type = pc.context_type
  AND (
    (cp.context_id IS NULL AND pc.context_id IS NULL)
    OR (cp.context_id = pc.context_id)
  )
  AND cp.category_key = pc.category_key
WHERE cp.is_visible = true
ORDER BY pc.display_order ASC, cp.display_order ASC, p.name ASC;

-- Grant view access
GRANT SELECT ON context_partners_detailed TO authenticated, anon;


-- =============================================
-- 4. HELPER FUNCTIONS
-- =============================================

-- Check if a partner is linked to any context
CREATE OR REPLACE FUNCTION partner_has_contexts(p_partner_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM context_partners WHERE partner_id = p_partner_id
  );
$$ LANGUAGE sql STABLE;

-- Get partner count for a specific context
CREATE OR REPLACE FUNCTION get_context_partner_count(
  p_context_type TEXT,
  p_context_id UUID DEFAULT NULL
)
RETURNS INT AS $$
  SELECT COUNT(*)::INT
  FROM context_partners
  WHERE context_type = p_context_type
    AND (p_context_id IS NULL OR context_id = p_context_id)
    AND is_visible = true;
$$ LANGUAGE sql STABLE;

-- Grant execute
GRANT EXECUTE ON FUNCTION partner_has_contexts(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_context_partner_count(TEXT, UUID) TO authenticated, anon;


-- =============================================
-- 5. UPDATE EXISTING PARTNERS TABLE
-- =============================================
-- Add columns for logo upload support (will be managed via storage bucket).
-- The existing 'logo' column holds URLs; we'll preserve it for backward compatibility.

-- Add logo upload metadata columns
ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS logo_storage_path TEXT,        -- Path in storage bucket
  ADD COLUMN IF NOT EXISTS logo_uploaded_at TIMESTAMPTZ;

-- Add updated_at timestamp (if not already present)
ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_partners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW
  EXECUTE FUNCTION update_partners_updated_at();

-- Update RLS policies for partners table (allow public read)
DROP POLICY IF EXISTS "Public can view published partners" ON partners;
CREATE POLICY "Public can view published partners"
  ON partners FOR SELECT
  USING (is_published = true);

-- Admin full access
DROP POLICY IF EXISTS "Admins can manage partners" ON partners;
CREATE POLICY "Admins can manage partners"
  ON partners FOR ALL
  USING (is_admin_user());


-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- Summary:
--   - partner_categories table created (configurable categories per context)
--   - context_partners table created (universal junction table)
--   - context_partners_detailed view created (efficient querying)
--   - Helper functions created (partner_has_contexts, get_context_partner_count)
--   - partners table updated (logo upload columns, updated_at, trigger)
--   - RLS policies applied to all tables
--
-- Next steps:
--   1. Run 071-seed-default-categories.sql to populate default categories
--   2. Run 072-partner-logos-storage.sql to create storage bucket
--   3. Create TypeScript types in lib/types/partners.ts
--   4. Create data fetching functions in lib/data/context-partners.ts
-- =============================================
