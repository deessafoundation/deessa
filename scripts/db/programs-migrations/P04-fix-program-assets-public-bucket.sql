-- Fix: Make program-assets bucket public (like event-images)
-- The bucket was created as private, but getPublicUrl only works with public buckets.

UPDATE storage.buckets
SET public = true
WHERE id = 'program-assets';

-- Add public read policy so anyone can view published program images
DROP POLICY IF EXISTS "program_assets_public_read" ON storage.objects;
CREATE POLICY "program_assets_public_read"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'program-assets');
