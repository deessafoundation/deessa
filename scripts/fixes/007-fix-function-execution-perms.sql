-- ============================================================
-- FIX: Function EXECUTE Permissions
-- Issue: Supabase Database Linter #0028, #0029
-- Date: 2026-09-12
-- ============================================================
--
-- PROBLEM:
--   SECURITY DEFINER functions are callable by anon/authenticated
--   via REST API. REVOKE from anon/authenticated alone doesn't
--   work because PostgreSQL grants EXECUTE to PUBLIC by default.
--
-- FIX:
--   REVOKE from PUBLIC first, then from anon/authenticated,
--   then GRANT only to service_role.
-- ============================================================


-- ============================================================
-- Admin write functions — only service_role should call these
-- ============================================================

REVOKE ALL ON FUNCTION public.create_admin_notification(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_admin_notification(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) FROM anon;
REVOKE ALL ON FUNCTION public.create_admin_notification(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_admin_notification(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) TO service_role;

REVOKE ALL ON FUNCTION public.mark_notification_read(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mark_notification_read(UUID) FROM anon;
REVOKE ALL ON FUNCTION public.mark_notification_read(UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.mark_notification_read(UUID) TO service_role;

REVOKE ALL ON FUNCTION public.mark_all_notifications_read() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mark_all_notifications_read() FROM anon;
REVOKE ALL ON FUNCTION public.mark_all_notifications_read() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read() TO service_role;

REVOKE ALL ON FUNCTION public.update_homepage_setting(TEXT, JSONB, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_homepage_setting(TEXT, JSONB, UUID) FROM anon;
REVOKE ALL ON FUNCTION public.update_homepage_setting(TEXT, JSONB, UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.update_homepage_setting(TEXT, JSONB, UUID) TO service_role;

REVOKE ALL ON FUNCTION public.increment_rate_limit(TEXT, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_rate_limit(TEXT, INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.increment_rate_limit(TEXT, INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.increment_rate_limit(TEXT, INTEGER) TO service_role;


-- ============================================================
-- Admin check functions — keep for authenticated, block anon
-- ============================================================

REVOKE ALL ON FUNCTION public.is_admin_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin_user() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO service_role;

REVOKE ALL ON FUNCTION public.get_admin_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_admin_role() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_admin_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_role() TO service_role;

REVOKE ALL ON FUNCTION public.get_unread_notification_count() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_unread_notification_count() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_unread_notification_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unread_notification_count() TO service_role;


-- ============================================================
-- Homepage read-only functions — keep for authenticated, block anon
-- ============================================================

REVOKE ALL ON FUNCTION public.get_homepage_stats() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_homepage_stats() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_homepage_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_homepage_stats() TO service_role;

REVOKE ALL ON FUNCTION public.get_homepage_programs() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_homepage_programs() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_homepage_programs() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_homepage_programs() TO service_role;

REVOKE ALL ON FUNCTION public.get_homepage_trust_indicators() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_homepage_trust_indicators() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_homepage_trust_indicators() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_homepage_trust_indicators() TO service_role;

REVOKE ALL ON FUNCTION public.get_homepage_featured_stories_rules() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_homepage_featured_stories_rules() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_homepage_featured_stories_rules() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_homepage_featured_stories_rules() TO service_role;
