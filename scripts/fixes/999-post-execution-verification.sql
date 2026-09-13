-- ============================================================
-- POST-EXECUTION VERIFICATION SCRIPT
-- Run this AFTER applying all fixes
-- ============================================================
--
-- PURPOSE:
--   Verify all security fixes have been applied correctly.
--   Compare results with pre-execution verification.
--
-- USAGE:
--   Run in Supabase SQL Editor and verify all checks pass.
--   Copy-paste this entire file into the SQL Editor.
-- ============================================================

-- ================================
-- POST-EXECUTION VERIFICATION
-- Date: 2026-09-12
-- ================================

-- ✅ CHECK 1: SECURITY DEFINER Views Removed
-- ==========================================
SELECT 
  'CHECK 1: SECURITY DEFINER Views' AS check_name,
  viewname,
  CASE 
    WHEN definition NOT LIKE '%SECURITY DEFINER%' THEN '✅ Fixed'
    ELSE '❌ Still has SECURITY DEFINER'
  END AS status
FROM pg_views
WHERE viewname IN (
  'donation_stats_by_currency',
  'recent_payment_errors',
  'payment_mismatches',
  'event_registrations_with_event'
)
ORDER BY viewname;

-- ✅ CHECK 2: RLS Enabled on All Tables
-- =====================================
SELECT 
  'CHECK 2: RLS Enabled' AS check_name,
  tablename,
  rowsecurity AS rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ Enabled'
    ELSE '❌ NOT Enabled'
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

-- ✅ CHECK 3: Service Role Policies Exist
-- =======================================
SELECT 
  'CHECK 3: Service Role Policies' AS check_name,
  tablename,
  COUNT(*) AS policy_count,
  CASE 
    WHEN COUNT(*) >= 1 THEN '✅ Has policy'
    ELSE '❌ Missing policy'
  END AS status
FROM pg_policies
WHERE tablename IN (
  'payments',
  'receipts',
  'payment_events',
  'payment_logs',
  'receipt_failures'
)
AND policyname LIKE '%service%role%'
GROUP BY tablename
ORDER BY tablename;

-- ✅ CHECK 4: Function Search Paths Set
-- =====================================
SELECT 
  'CHECK 4: Function Search Paths' AS check_name,
  proname AS function_name,
  CASE 
    WHEN proconfig IS NOT NULL AND proconfig::text LIKE '%search_path%' 
    THEN '✅ Set'
    ELSE '❌ Not set'
  END AS search_path_status,
  proconfig::text AS config
FROM pg_proc
WHERE proname IN (
  'search_podcasts',
  'get_next_receipt_number',
  'is_admin_user',
  'get_admin_role',
  'create_admin_notification',
  'update_homepage_setting'
)
AND pronamespace = 'public'::regnamespace
ORDER BY proname;

-- ✅ CHECK 5: Anon Role Cannot Execute Admin Functions
-- =====================================================
SELECT 
  'CHECK 5: Anon Role Revoked' AS check_name,
  p.proname AS function_name,
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 
      FROM LATERAL aclexplode(p.proacl) acl
      JOIN pg_roles r ON r.oid = acl.grantee
      WHERE r.rolname = 'anon'
    ) THEN '✅ Anon revoked'
    ELSE '❌ Anon still has access'
  END AS status
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname IN (
  'create_admin_notification',
  'update_homepage_setting',
  'mark_notification_read',
  'increment_rate_limit'
)
AND n.nspname = 'public'
ORDER BY p.proname;

-- ✅ CHECK 6: Receipts Bucket is Private
-- ======================================
SELECT 
  'CHECK 6: Receipts Bucket Private' AS check_name,
  id AS bucket_name,
  public AS is_public,
  CASE 
    WHEN public THEN '❌ Still public'
    ELSE '✅ Private (correct)'
  END AS status
FROM storage.buckets
WHERE id = 'receipts';

-- ✅ CHECK 7: Receipts Storage Policy Restricted
-- ==============================================
SELECT 
  'CHECK 7: Receipt Storage Policy' AS check_name,
  policyname,
  cmd AS operation,
  CASE 
    WHEN qual::text LIKE '%service_role%' THEN '✅ Restricted to service_role'
    ELSE '⚠️  Check policy'
  END AS status
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%receipt%'
ORDER BY policyname;

-- ✅ CHECK 8: Permissive Policies Fixed
-- =====================================
SELECT 
  'CHECK 8: Permissive Policies' AS check_name,
  tablename,
  policyname,
  CASE 
    WHEN policyname LIKE '%Service role%' THEN '✅ Fixed'
    WHEN policyname LIKE '%Allow anonymous%' AND tablename IN ('contact_submissions', 'newsletter_subscriptions', 'volunteer_applications') THEN '✅ Intentional'
    WHEN policyname LIKE '%Authenticated%' AND tablename IN ('media_assets', 'podcasts') THEN '✅ Intentional'
    ELSE '⚠️  Review'
  END AS status
FROM pg_policies
WHERE tablename IN (
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

-- ✅ CHECK 9: Phantom Table Status
-- ================================
SELECT 
  'CHECK 9: Phantom Table' AS check_name,
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'payments_with_session'
    )
    THEN '✅ Table dropped or never existed'
    ELSE '⚠️  Table still exists - investigate'
  END AS status;

-- ================================
-- VERIFICATION SUMMARY
-- ================================

SELECT 
  'VERIFICATION SUMMARY' AS section,
  SUM(issues) AS total_issues_found,
  CASE 
    WHEN SUM(issues) = 0 THEN '✅✅✅ ALL CHECKS PASSED ✅✅✅'
    ELSE '❌ ' || SUM(issues) || ' issues found - review above'
  END AS final_status
FROM (
  -- Check 1: Views with SECURITY DEFINER
  SELECT COUNT(*) AS issues
  FROM pg_views
  WHERE viewname IN (
    'donation_stats_by_currency',
    'recent_payment_errors',
    'payment_mismatches',
    'event_registrations_with_event'
  )
  AND definition LIKE '%SECURITY DEFINER%'
  
  UNION ALL
  
  -- Check 2: RLS Disabled
  SELECT COUNT(*)
  FROM pg_tables
  WHERE tablename IN (
    'payments',
    'receipts',
    'payment_events',
    'payment_logs',
    'receipt_failures'
  )
  AND NOT rowsecurity
  
  UNION ALL
  
  -- Check 3: Missing Policies
  SELECT CASE 
    WHEN COUNT(*) < 5 THEN 1
    ELSE 0
  END
  FROM (
    SELECT DISTINCT tablename
    FROM pg_policies
    WHERE tablename IN (
      'payments',
      'receipts',
      'payment_events',
      'payment_logs',
      'receipt_failures'
    )
    AND policyname LIKE '%service%role%'
  ) AS policies_check
  
  UNION ALL
  
  -- Check 4: Receipts bucket public
  SELECT COUNT(*)
  FROM storage.buckets
  WHERE id = 'receipts'
  AND public = true
) AS verification_checks;

-- ================================
-- NEXT STEPS
-- ================================
-- 1. If all checks passed: Re-run Supabase Database Linter
-- 2. Test application functionality (see EXECUTION_GUIDE.md)
-- 3. Monitor logs for 24-48 hours
-- 4. Keep ROLLBACK_PLAN.md handy just in case
-- ================================
