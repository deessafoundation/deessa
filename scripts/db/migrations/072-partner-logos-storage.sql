-- =============================================
-- PARTNER LOGOS STORAGE BUCKET
-- Migration: 072-partner-logos-storage.sql
-- Date: October 28, 2026
-- =============================================
--
-- Creates storage bucket for partner logo uploads.
--
-- Bucket configuration:
--   - Name: partner-logos
--   - Public access: true (logos are public assets)
--   - File size limit: 2MB
--   - Allowed types: image/jpeg, image/png, image/webp, image/svg+xml
--   - File naming: {partner_id}/{timestamp}_{original_name}
--
-- RLS policies:
--   - Public: read access to all logos
--   - Admin: full access (upload, update, delete)
-- =============================================


-- =============================================
-- 1. CREATE STORAGE BUCKET
-- =============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partner-logos',
  'partner-logos',
  true,  -- Public bucket (logos are public)
  2097152,  -- 2MB = 2 * 1024 * 1024 bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;


-- =============================================
-- 2. STORAGE RLS POLICIES
-- =============================================

-- Drop existing policies if they exist (idempotent migration)
DROP POLICY IF EXISTS "Public can view partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update partner logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete partner logos" ON storage.objects;

-- Public: read all logos
CREATE POLICY "Public can view partner logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'partner-logos');

-- Admin: upload logos
CREATE POLICY "Admins can upload partner logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'partner-logos'
    AND is_admin_user()
  );

-- Admin: update logos
CREATE POLICY "Admins can update partner logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'partner-logos'
    AND is_admin_user()
  );

-- Admin: delete logos
CREATE POLICY "Admins can delete partner logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'partner-logos'
    AND is_admin_user()
  );


-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- Summary:
--   - partner-logos bucket created (2MB limit, public access)
--   - RLS policies applied (public read, admin full access)
--
-- Usage in app:
--   1. Admin uploads logo → storage.from('partner-logos').upload(...)
--   2. Store path in partners.logo_storage_path
--   3. Get public URL → storage.from('partner-logos').getPublicUrl(path)
--   4. Display in UI with alt text for accessibility
--
-- Next steps:
--   1. Create TypeScript types in lib/types/partners.ts
--   2. Create upload helper in lib/actions/context-partners.ts
--   3. Build admin UI for logo uploads
-- =============================================
