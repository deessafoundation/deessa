-- ═══════════════════════════════════════════════════════════════════════════
-- Phase 4: Conference Form File Upload Storage Bucket
-- ═══════════════════════════════════════════════════════════════════════════
-- Creates a Supabase Storage bucket for conference registration file uploads.
-- This supports the new "file" field type in dynamic forms.
-- 
-- FIXED VERSION: Works without superuser permissions
-- 
-- Note: If bucket creation fails, you can create it manually via Supabase UI:
--   1. Go to Storage in Supabase Dashboard
--   2. Click "New bucket"
--   3. Name: conference-uploads
--   4. Make it public
-- ═══════════════════════════════════════════════════════════════════════════

-- Create storage bucket for conference form file uploads
-- Note: This may fail if you don't have permissions - that's OK, create manually
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'conference-uploads',
    'conference-uploads',
    true,  -- Public bucket (files accessible via public URL)
    5242880,  -- 5MB limit (5 * 1024 * 1024 bytes)
    ARRAY[
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ]
  )
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE '✓ Bucket created or already exists';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE '⚠ Insufficient permissions to create bucket. Please create manually via Supabase UI.';
    RAISE NOTICE '  Bucket name: conference-uploads';
    RAISE NOTICE '  Make it public: Yes';
    RAISE NOTICE '  File size limit: 5MB';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Storage Policies
-- ═══════════════════════════════════════════════════════════════════════════

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can upload conference files" ON storage.objects;
DROP POLICY IF EXISTS "Conference files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete conference files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update conference file metadata" ON storage.objects;

-- Policy: Anyone can upload to the bucket (for registration forms)
DO $$
BEGIN
  CREATE POLICY "Anyone can upload conference files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'conference-uploads'
  );
  
  RAISE NOTICE '✓ Upload policy created';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE '⚠ Cannot create policies - insufficient permissions';
    RAISE NOTICE '  You may need to create policies via Supabase UI';
  WHEN duplicate_object THEN
    RAISE NOTICE '✓ Upload policy already exists';
END $$;

-- Policy: Uploaded files are publicly readable
DO $$
BEGIN
  CREATE POLICY "Conference files are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'conference-uploads');
  
  RAISE NOTICE '✓ Read policy created';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE '⚠ Cannot create read policy';
  WHEN duplicate_object THEN
    RAISE NOTICE '✓ Read policy already exists';
END $$;

-- Policy: Admins can delete files (for cleanup)
DO $$
BEGIN
  CREATE POLICY "Admins can delete conference files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'conference-uploads'
    AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );
  
  RAISE NOTICE '✓ Delete policy created';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE '⚠ Cannot create delete policy';
  WHEN duplicate_object THEN
    RAISE NOTICE '✓ Delete policy already exists';
END $$;

-- Policy: Admins can update file metadata
DO $$
BEGIN
  CREATE POLICY "Admins can update conference file metadata"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'conference-uploads'
    AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );
  
  RAISE NOTICE '✓ Update policy created';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE '⚠ Cannot create update policy';
  WHEN duplicate_object THEN
    RAISE NOTICE '✓ Update policy already exists';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Manual Bucket Creation Instructions (if automated creation failed)
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'conference-uploads') THEN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE 'MANUAL BUCKET CREATION REQUIRED';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE 'Please create the bucket manually:';
    RAISE NOTICE '1. Go to Storage in Supabase Dashboard';
    RAISE NOTICE '2. Click "New bucket"';
    RAISE NOTICE '3. Name: conference-uploads';
    RAISE NOTICE '4. Public: Yes (checked)';
    RAISE NOTICE '5. File size limit: 5MB (5242880 bytes)';
    RAISE NOTICE '6. Allowed MIME types: image/*, application/pdf, text/*';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '✓ Bucket "conference-uploads" exists and is ready';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Migration Complete
-- ═══════════════════════════════════════════════════════════════════════════
-- If you see warnings above, create the bucket manually via Supabase UI.
-- Otherwise, everything is ready for file uploads!
-- ═══════════════════════════════════════════════════════════════════════════
