-- ============================================================
-- FIX: Public Bucket Allows Listing
-- Issue: Supabase Database Linter #0025
-- Date: 2026-09-12
-- ============================================================
--
-- PROBLEM:
--   15 public storage buckets have broad SELECT policies that
--   allow anyone to list all files in the bucket.
--
-- FIX:
--   Make receipts bucket private (uses service-role .download())
--   Other image buckets left public (listing is acceptable for images)
--
-- SAFETY:
--   - Receipts are accessed via service-role client using .download()
--   - Token-based authentication protects receipt access
--   - No public URLs are used for receipts
--   - Image buckets remain unchanged (listing is low risk)
-- ============================================================


-- ============================================================
-- RECEIPTS BUCKET: Make Private (HIGH PRIORITY)
-- Receipts contain donor PII and should not be listable
-- ============================================================

-- Step 1: Make the bucket private
UPDATE storage.buckets
SET public = false
WHERE id = 'receipts';

-- Step 2: Remove existing broad SELECT policy
DROP POLICY IF EXISTS "Anyone can view receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public receipts access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read receipts" ON storage.objects;

-- Step 3: Create service-role only policy
-- The app uses service-role client with .download() method
-- See: app/api/receipts/download/route.ts
CREATE POLICY "Service role can manage receipts"
  ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'receipts'
    AND auth.role() = 'service_role'
  )
  WITH CHECK (
    bucket_id = 'receipts'
    AND auth.role() = 'service_role'
  );


-- ============================================================
-- IMAGE/ASSET BUCKETS: Keep Public (LOW RISK)
-- Listing is acceptable for public image assets
-- ============================================================
-- 
-- The following buckets allow listing but this is acceptable:
--   - conference-uploads (event files)
--   - event-images (event photos)
--   - event-uploads (event-related files)
--   - hero-images (homepage banners)
--   - og-images (social media previews)
--   - partner-logos (sponsor logos)
--   - press-gallery (press photos)
--   - project-images (project photos)
--   - site-assets (general assets)
--   - story-images (blog images)
--   - team-photos (team member photos)
--   - testimonials (testimonial images)
--   - videos (video files)
--
-- Risk Assessment: Low - these are public marketing assets
-- No changes needed unless security policy requires it
--
-- ============================================================


-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Verify receipts bucket is now private
SELECT 
  id AS bucket_name,
  public AS is_public,
  CASE 
    WHEN public THEN '❌ Still public'
    ELSE '✅ Private (correct)'
  END AS status
FROM storage.buckets
WHERE id = 'receipts';

-- Verify receipts policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%receipt%';

-- Expected result: Only service_role policy exists
