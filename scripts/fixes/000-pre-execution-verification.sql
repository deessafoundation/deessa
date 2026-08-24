-- ============================================================
-- PRE-EXECUTION VERIFICATION SCRIPT
-- Run this BEFORE applying any fixes
-- ============================================================
--
-- PURPOSE:
--   Document the current state of the database before fixes.
--   This creates a baseline for comparison after fixes are applied.
--
-- USAGE:
--   Run in Supabase SQL Editor and save the output.
--   Copy-paste this entire file into the SQL Editor.
-- ============================================================

-- ================================
-- PRE-EXECUTION DATABASE STATE
-- Date: 2026-09-12
-- ================================

-- 1. SECURITY DEFINER VIEWS
-- =========================
SELECT 
  '1. SECURITY DEFINER VIEWS' AS section,
  schemaname,
  viewname,
  viewowner
FROM pg_views
WHERE viewname IN (
  'donation_stats_by_currency',
  'recent_payment_errors',
  'payment_mismatches',
  'event_registrations_with_event'
)
ORDER BY viewname;

-- 2. RLS STATUS ON TABLES
-- =======================
SELECT 
  '2. RLS STATUS ON TABLES' AS section,
  schemaname,
  tablename,
  rowsecurity AS rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ Enabled'
    ELSE '❌ Disabled'
  END AS status
FROM pg_tables
WHERE tablename IN (
  'payments',
  'receipts',
  'payment_jobs',
  'email_failures',
  'payment_events',
  'receipt_sequences',
  'payment_logs',
  'review_notes',
  'status_change_log',
  'receipt_failures'
)
ORDER BY tablename;

-- 3. EXISTING RLS POLICIES
-- ========================
SELECT 
  '3. EXISTING RLS POLICIES' AS section,
  schemaname,
  tablename,
  policyname,
  cmd AS operation,
  LEFT(qual::text, 50) AS using_clause,
  LEFT(with_check::text, 50) AS with_check_clause
FROM pg_policies
WHERE tablename IN (
  'payments',
  'receipts',
  'payment_events',
  'payment_logs',
  'contact_submissions',
  'newsletter_subscriptions',
  'volunteer_applications',
  'media_assets',
  'podcasts'
)
ORDER BY tablename, policyname;

-- 4. FUNCTION SEARCH PATHS
-- ========================
SELECT 
  '4. FUNCTION SEARCH PATHS' AS section,
  proname AS function_name,
  COALESCE(proconfig::text, 'Not set') AS search_path_config
FROM pg_proc
WHERE proname IN (
  'search_podcasts',
  'get_next_receipt_number',
  'is_admin_user',
  'get_admin_role',
  'create_admin_notification',
  'mark_notification_read',
  'update_homepage_setting'
)
AND pronamespace = 'public'::regnamespace
ORDER BY proname;

-- 5. FUNCTION EXECUTE PERMISSIONS
-- ================================
SELECT 
  '5. FUNCTION EXECUTE PERMISSIONS' AS section,
  p.proname AS function_name,
  array_agg(DISTINCT r.rolname ORDER BY r.rolname) AS roles_with_execute
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
LEFT JOIN LATERAL (
  SELECT (aclexplode(p.proacl)).grantee AS grantee_oid
) acl ON true
LEFT JOIN pg_roles r ON r.oid = acl.grantee_oid
WHERE p.proname IN (
  'create_admin_notification',
  'update_homepage_setting',
  'mark_notification_read',
  'mark_all_notifications_read',
  'increment_rate_limit',
  'is_admin_user',
  'get_admin_role'
)
AND n.nspname = 'public'
GROUP BY p.proname
ORDER BY p.proname;

-- 6. STORAGE BUCKET STATUS
-- ========================
SELECT 
  '6. STORAGE BUCKET STATUS' AS section,
  id AS bucket_name,
  public AS is_public,
  CASE 
    WHEN public THEN '⚠️  Public'
    ELSE '✅ Private'
  END AS status,
  created_at
FROM storage.buckets
WHERE id IN (
  'receipts',
  'event-images',
  'partner-logos',
  'project-images',
  'story-images',
  'team-photos',
  'videos'
)
ORDER BY id;

-- 7. STORAGE POLICIES
-- ===================
SELECT 
  '7. STORAGE POLICIES' AS section,
  policyname,
  cmd AS operation,
  LEFT(qual::text, 80) AS using_clause
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND (
    policyname LIKE '%receipt%'
    OR qual::text LIKE '%receipts%'
  )
ORDER BY policyname;

-- 8. CHECK FOR PHANTOM TABLE
-- ==========================
SELECT 
  '8. CHECK FOR PHANTOM TABLE' AS section,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'payments_with_session'
    )
    THEN '⚠️  Table EXISTS - needs investigation'
    ELSE '✅ Table does not exist'
  END AS phantom_table_status;

-- 9. PERMISSIVE RLS POLICIES (USING true)
-- ========================================
SELECT 
  '9. PERMISSIVE RLS POLICIES' AS section,
  schemaname,
  tablename,
  policyname,
  cmd AS operation,
  qual::text AS using_clause,
  with_check::text AS with_check_clause
FROM pg_policies
WHERE (
  qual::text = 'true'
  OR with_check::text = 'true'
)
AND tablename IN (
  'activity_logs',
  'admin_notifications',
  'receipt_audit_log',
  'support_admin_actions',
  'contact_submissions',
  'newsletter_subscriptions',
  'volunteer_applications',
  'media_assets',
  'podcasts'
)
ORDER BY tablename, policyname;

-- ================================
-- PRE-EXECUTION VERIFICATION COMPLETE
-- Save this output for comparison after fixes
-- ================================
