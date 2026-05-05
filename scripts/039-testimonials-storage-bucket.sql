-- =============================================
-- TESTIMONIALS STORAGE BUCKET
-- Creates storage bucket for testimonial profile images
-- =============================================
-- 
-- IMPORTANT: Run this script in Supabase SQL Editor as postgres role
-- If you get "must be owner of table buckets" error:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Make sure you're running as the postgres user (default)
-- 3. Or create bucket via UI: Storage > New Bucket
-- =============================================

-- Create testimonials storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'testimonials',
  'testimonials',
  true, -- Public bucket for testimonial images
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view testimonial images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload testimonial images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update testimonial images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete testimonial images" ON storage.objects;

-- Public read access to testimonial images
CREATE POLICY "Public can view testimonial images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'testimonials');

-- Admins can upload testimonial images
CREATE POLICY "Admins can upload testimonial images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'testimonials' 
  AND auth.role() = 'authenticated'
);

-- Admins can update testimonial images
CREATE POLICY "Admins can update testimonial images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'testimonials' 
  AND auth.role() = 'authenticated'
);

-- Admins can delete testimonial images
CREATE POLICY "Admins can delete testimonial images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'testimonials' 
  AND auth.role() = 'authenticated'
);

-- =============================================
-- VERIFY SETUP
-- =============================================

-- Check that testimonials bucket exists
SELECT 
  id, 
  name, 
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'testimonials';

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE storage.buckets IS 'Storage buckets for file uploads';
