-- ═══════════════════════════════════════════════════════════════════════════
-- Event Module File Upload Storage Bucket
-- ═══════════════════════════════════════════════════════════════════════════
-- Creates a Supabase Storage bucket for event registration file uploads.
-- Replaces the shared "conference-uploads" bucket for event-specific files.
--
-- Note: If bucket creation fails, you can create it manually via Supabase UI:
--   1. Go to Storage in Supabase Dashboard
--   2. Click "New bucket"
--   3. Name: event-uploads
--   4. Make it public
-- ═══════════════════════════════════════════════════════════════════════════

-- Create storage bucket for event form file uploads
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'event-uploads',
    'event-uploads',
    true,
    5242880,  -- 5MB limit
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
    RAISE NOTICE '  Bucket name: event-uploads';
    RAISE NOTICE '  Make it public: Yes';
    RAISE NOTICE '  File size limit: 5MB';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Storage Policies
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Anyone can upload event files" ON storage.objects;
DROP POLICY IF EXISTS "Event files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete event files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update event file metadata" ON storage.objects;

DO $$
BEGIN
  CREATE POLICY "Anyone can upload event files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'event-uploads');

  RAISE NOTICE '✓ Upload policy created';
EXCEPTION
  WHEN insufficient_privilege THEN RAISE NOTICE '⚠ Cannot create upload policy';
  WHEN duplicate_object THEN RAISE NOTICE '✓ Upload policy already exists';
END $$;

DO $$
BEGIN
  CREATE POLICY "Event files are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'event-uploads');

  RAISE NOTICE '✓ Read policy created';
EXCEPTION
  WHEN insufficient_privilege THEN RAISE NOTICE '⚠ Cannot create read policy';
  WHEN duplicate_object THEN RAISE NOTICE '✓ Read policy already exists';
END $$;

DO $$
BEGIN
  CREATE POLICY "Admins can delete event files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'event-uploads'
    AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

  RAISE NOTICE '✓ Delete policy created';
EXCEPTION
  WHEN insufficient_privilege THEN RAISE NOTICE '⚠ Cannot create delete policy';
  WHEN duplicate_object THEN RAISE NOTICE '✓ Delete policy already exists';
END $$;

DO $$
BEGIN
  CREATE POLICY "Admins can update event file metadata"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'event-uploads'
    AND EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

  RAISE NOTICE '✓ Update policy created';
EXCEPTION
  WHEN insufficient_privilege THEN RAISE NOTICE '⚠ Cannot create update policy';
  WHEN duplicate_object THEN RAISE NOTICE '✓ Update policy already exists';
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Manual Bucket Creation Instructions (if automated creation failed)
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'event-uploads') THEN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE 'MANUAL BUCKET CREATION REQUIRED';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE '1. Go to Storage in Supabase Dashboard';
    RAISE NOTICE '2. Click "New bucket"';
    RAISE NOTICE '3. Name: event-uploads';
    RAISE NOTICE '4. Public: Yes (checked)';
    RAISE NOTICE '5. File size limit: 5MB (5242880 bytes)';
    RAISE NOTICE '6. Allowed MIME types: image/*, application/pdf, text/*';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
  ELSE
    RAISE NOTICE '✓ Bucket "event-uploads" exists and is ready';
  END IF;
END $$;
