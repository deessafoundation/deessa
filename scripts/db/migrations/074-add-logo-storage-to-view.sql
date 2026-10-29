-- =============================================
-- ADD LOGO STORAGE PATH TO CONTEXT PARTNERS VIEW
-- Migration: 074-add-logo-storage-to-view.sql
-- Date: October 28, 2026
-- =============================================
--
-- Problem:
--   The context_partners_detailed view only exposes p.logo (legacy URL field)
--   but not p.logo_storage_path (new storage bucket field).
--   This means partner logos uploaded to storage aren't visible in the view.
--
-- Solution:
--   Drop and recreate the view to include logo_storage_path and logo_uploaded_at.
--   Frontend can prioritize logo_storage_path over legacy logo field.
-- =============================================

-- Drop the existing view first (required to change column structure)
DROP VIEW IF EXISTS context_partners_detailed;

-- Recreate the view with additional logo fields
CREATE VIEW context_partners_detailed AS
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
  p.logo AS partner_logo,                           -- Legacy URL field
  p.logo_storage_path AS partner_logo_storage_path, -- NEW: Storage bucket path
  p.logo_uploaded_at AS partner_logo_uploaded_at,   -- NEW: Upload timestamp
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

-- Regrant view access
GRANT SELECT ON context_partners_detailed TO authenticated, anon;

-- =============================================
-- NOTES
-- =============================================
-- Frontend should prioritize logo_storage_path over partner_logo:
--   1. If logo_storage_path exists, construct URL: /storage/v1/object/public/partner-logos/{path}
--   2. Otherwise, fall back to partner_logo (legacy direct URL)
-- =============================================
