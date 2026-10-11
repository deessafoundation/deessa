-- Enhancement: Add excerpt, tags, scheduling, and analytics to facebook_posts
-- Apply after 065-facebook-posts.sql and 066-facebook-post-url-constraint.sql (if needed)
BEGIN;

-- Add new columns
ALTER TABLE public.facebook_posts
  ADD COLUMN IF NOT EXISTS excerpt text CHECK (excerpt IS NULL OR length(trim(excerpt)) BETWEEN 1 AND 500),
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clicks integer NOT NULL DEFAULT 0;

-- Update the published posts policy to check published_at timestamp
DROP POLICY IF EXISTS "Published community posts are public" ON public.facebook_posts;
CREATE POLICY "Published community posts are public" ON public.facebook_posts
  FOR SELECT TO anon, authenticated 
  USING (is_published = true AND (published_at IS NULL OR published_at <= now()));

-- Add index for scheduled posts
CREATE INDEX IF NOT EXISTS facebook_posts_scheduled_idx
  ON public.facebook_posts (published_at) 
  WHERE is_published = true AND published_at IS NOT NULL;

-- Add index for tags
CREATE INDEX IF NOT EXISTS facebook_posts_tags_idx
  ON public.facebook_posts USING gin(tags);

-- Add index for analytics queries
CREATE INDEX IF NOT EXISTS facebook_posts_analytics_idx
  ON public.facebook_posts (views DESC, clicks DESC) 
  WHERE is_published = true;

-- Functions for incrementing views and clicks
CREATE OR REPLACE FUNCTION increment_facebook_post_views(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.facebook_posts 
  SET views = views + 1 
  WHERE id = post_id AND is_published = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_facebook_post_clicks(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.facebook_posts 
  SET clicks = clicks + 1 
  WHERE id = post_id AND is_published = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_facebook_post_views(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION increment_facebook_post_clicks(uuid) TO service_role;

COMMIT;
