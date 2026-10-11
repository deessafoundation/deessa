-- Optional homepage community feed. No changes to existing tables or policies.
BEGIN;
CREATE TABLE IF NOT EXISTS public.facebook_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_url text NOT NULL UNIQUE CHECK (length(post_url) <= 2048 AND post_url LIKE 'https://www.facebook.com/%'),
  title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 120),
  image_url text,
  image_alt text,
  display_order integer NOT NULL DEFAULT 0 CHECK (display_order BETWEEN 0 AND 10000),
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (image_url IS NULL OR (image_alt IS NOT NULL AND length(trim(image_alt)) BETWEEN 1 AND 300))
);
ALTER TABLE public.facebook_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Published community posts are public" ON public.facebook_posts;
CREATE POLICY "Published community posts are public" ON public.facebook_posts
  FOR SELECT TO anon, authenticated USING (is_published = true);
-- All mutations go through server actions that authorize active settings admins.
REVOKE ALL ON public.facebook_posts FROM anon, authenticated;
GRANT SELECT ON public.facebook_posts TO anon, authenticated;
GRANT ALL ON public.facebook_posts TO service_role;
CREATE INDEX IF NOT EXISTS facebook_posts_published_order_idx
  ON public.facebook_posts (display_order, created_at DESC) WHERE is_published = true;
COMMIT;
