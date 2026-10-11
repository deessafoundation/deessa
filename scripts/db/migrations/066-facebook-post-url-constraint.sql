-- Repair the constraint if 065 was copied from rich text with Markdown links.
-- Does not remove or modify any saved post.
BEGIN;
ALTER TABLE public.facebook_posts DROP CONSTRAINT IF EXISTS facebook_posts_post_url_check;
ALTER TABLE public.facebook_posts ADD CONSTRAINT facebook_posts_post_url_check
  CHECK (length(post_url) <= 2048 AND post_url LIKE 'https://www.facebook.com/%');
COMMIT;
