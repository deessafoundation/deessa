-- =============================================
-- INTRO VIDEO MANAGEMENT & STORAGE
-- Migration: 075-intro-video-management.sql
-- Date: October 29, 2026
-- =============================================
--
-- Features:
--   1. Creates storage bucket 'intro-videos' for desktop and mobile video uploads & posters
--   2. Sets up RLS policies for public viewing and authenticated admin management
--   3. Seeds the default intro_video configuration in site_settings
-- =============================================

-- =============================================
-- 1. CREATE STORAGE BUCKET
-- =============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'intro-videos',
  'intro-videos',
  true,  -- Public bucket so visitors can stream the video
  157286400,  -- 150MB = 150 * 1024 * 1024 bytes
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 2. STORAGE RLS POLICIES
-- =============================================

DROP POLICY IF EXISTS "Public can view intro videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload intro videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update intro videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete intro videos" ON storage.objects;

-- Public: read intro videos and poster thumbnails
CREATE POLICY "Public can view intro videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'intro-videos');

-- Admin: upload intro videos
CREATE POLICY "Admins can upload intro videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'intro-videos'
    AND is_admin_user()
  );

-- Admin: update intro videos
CREATE POLICY "Admins can update intro videos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'intro-videos'
    AND is_admin_user()
  );

-- Admin: delete intro videos
CREATE POLICY "Admins can delete intro videos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'intro-videos'
    AND is_admin_user()
  );

-- =============================================
-- 3. SEED DEFAULT INTRO VIDEO CONFIGURATION
-- =============================================

INSERT INTO site_settings (key, value, updated_at)
VALUES (
  'intro_video',
  '{
    "enabled": true,
    "media": {
      "desktopVideoUrl": "/Deesa-Intro%20.mp4",
      "desktopPosterUrl": "",
      "mobileVideoUrl": "",
      "mobilePosterUrl": "",
      "useDesktopFallbackOnMobile": true
    },
    "behavior": {
      "frequency": "cooldown",
      "cooldownMinutes": 30,
      "homepageOnly": false,
      "allowSkip": true,
      "skipDelaySeconds": 0,
      "mutedByDefault": true
    },
    "transition": {
      "enableLogoFlyTransition": true,
      "logoUrl": "/logo.png",
      "fadeDurationMs": 1000
    }
  }'::jsonb,
  NOW()
)
ON CONFLICT (key) DO NOTHING;
