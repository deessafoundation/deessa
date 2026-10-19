-- Add post_type column to facebook_posts table
-- This allows controlling how the Facebook embed is displayed (photo vs full post)
BEGIN;

ALTER TABLE public.facebook_posts
  ADD COLUMN IF NOT EXISTS post_type text DEFAULT 'full' CHECK (post_type IN ('photo', 'full'));

COMMENT ON COLUMN public.facebook_posts.post_type IS 'Display type: "photo" for clean photo-only display (hides captions), "full" for complete Facebook embed with text';

COMMIT;
