# Database Security Fixes - Execution Guide

**Date:** 2026-09-12  
**Status:** Ready for execution  
**Total Scripts:** 7

---

## ✅ Pre-Execution Checklist

- [ ] **Backup database** - Create a Supabase backup or pg_dump
- [ ] **Test on staging** - If staging environment exists, test there first
- [ ] **Read this guide completely** before executing
- [ ] **Verify service-role key** is set in environment variables
- [ ] **Check application is using service-role client** (already verified ✅)
- [ ] **Review all scripts** in this directory

---

## 📋 Execution Order (IMPORTANT)

Execute scripts in this exact order to avoid dependency issues:

### Phase 1: Low-Risk View Fixes
**Script:** `001-fix-security-definer-views.sql`  
**Risk:** None  
**Estimated time:** < 1 second  
**Rollback:** Easy (recreate with original definitions)

**How to execute:**
1. Open Supabase SQL Editor
2. Copy the entire contents of `scripts/fixes/001-fix-security-definer-views.sql`
3. Paste into SQL Editor
4. Click **Run** or press Ctrl+Enter

### Phase 2: Function Search Path Hardening
**Script:** `004-fix-function-search-paths.sql`  
**Risk:** None (defense-in-depth)  
**Estimated time:** < 5 seconds  
**Rollback:** Easy (functions work identically)

**How to execute:**
1. Copy contents of `scripts/fixes/004-fix-function-search-paths.sql`
2. Paste into Supabase SQL Editor
3. Run

### Phase 3: RLS Policy Tightening
**Script:** `005-fix-permissive-rls-policies.sql`  
**Risk:** None (intentional policies preserved)  
**Estimated time:** < 2 seconds  
**Rollback:** Easy (recreate original policies)

**How to execute:**
1. Copy contents of `scripts/fixes/005-fix-permissive-rls-policies.sql`
2. Paste into Supabase SQL Editor
3. Run

### Phase 4: Critical RLS Enablement
**Script:** `002-enable-rls-tables.sql`  
**Risk:** None (service-role bypasses RLS)  
**Estimated time:** < 3 seconds  
**Rollback:** Medium (disable RLS on tables)

**How to execute:**
1. Copy contents of `scripts/fixes/002-enable-rls-tables.sql`
2. Paste into Supabase SQL Editor
3. Run

### Phase 5: Sensitive Column Protection Verification
**Script:** `003-sensitive-columns-protection.sql`  
**Risk:** None (verification only)  
**Estimated time:** < 1 second  
**Rollback:** N/A (no changes made)

**How to execute:**
1. Copy contents of `scripts/fixes/003-sensitive-columns-protection.sql`
2. Paste into Supabase SQL Editor
3. Run

### Phase 6: Function Permission Restrictions
**Script:** `007-fix-function-execution-perms.sql`  
**Risk:** None (app uses service-role)  
**Estimated time:** < 2 seconds  
**Rollback:** Easy (re-grant permissions)

**How to execute:**
1. Copy contents of `scripts/fixes/007-fix-function-execution-perms.sql`
2. Paste into Supabase SQL Editor
3. Run

### Phase 7: Storage Bucket Hardening
**Script:** `006-fix-public-bucket-listing.sql`  
**Risk:** Low (receipts use service-role .download())  
**Estimated time:** < 1 second  
**Rollback:** Easy (set public = true)

**How to execute:**
1. Copy contents of `scripts/fixes/006-fix-public-bucket-listing.sql`
2. Paste into Supabase SQL Editor
3. Run

---

## 🔍 Verification After Each Phase

### After Phase 1 (Views)
```sql
-- Check views no longer have SECURITY DEFINER
SELECT 
  schemaname,
  viewname,
  viewowner,
  definition
FROM pg_views
WHERE viewname IN (
  'donation_stats_by_currency',
  'recent_payment_errors',
  'payment_mismatches',
  'event_registrations_with_event'
);

-- Expected: All should use SECURITY INVOKER (default)
```

### After Phase 2 (Functions)
```sql
-- Verify search_path is set on functions
SELECT 
  proname AS function_name,
  proconfig AS config
FROM pg_proc
WHERE proname IN (
  'search_podcasts',
  'get_next_receipt_number',
  'is_admin_user',
  'create_admin_notification'
)
AND pronamespace = 'public'::regnamespace;

-- Expected: proconfig should contain "search_path=public"
```

### After Phase 4 (RLS)
```sql
-- Verify RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
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

-- Expected: All should have rls_enabled = true

-- Verify policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN (
  'payments',
  'receipts',
  'payment_events',
  'payment_logs'
)
ORDER BY tablename;

-- Expected: Each table should have "Service role full access" policy
```

### After Phase 6 (Function Permissions)
```sql
-- Check function execute permissions
SELECT 
  n.nspname AS schema,
  p.proname AS function_name,
  array_agg(DISTINCT r.rolname) AS has_execute
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
LEFT JOIN pg_proc_acl pa ON pa.oid = p.oid
LEFT JOIN pg_roles r ON r.oid = pa.grantee
WHERE p.proname IN (
  'create_admin_notification',
  'update_homepage_setting',
  'mark_notification_read',
  'increment_rate_limit'
)
AND n.nspname = 'public'
GROUP BY n.nspname, p.proname
ORDER BY p.proname;

-- Expected: Should only show service_role, NOT anon or authenticated
```

### After Phase 7 (Storage)
```sql
-- Verify receipts bucket is private
SELECT 
  id AS bucket_name,
  public AS is_public
FROM storage.buckets
WHERE id = 'receipts';

-- Expected: is_public = false

-- Verify policies
SELECT 
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%receipt%';

-- Expected: Only service_role policy exists
```

---

## 🧪 Application Testing

After all scripts are executed, test these critical paths:

### 1. Payment Flow (Service-Role Client)
```bash
# Test donation creation
curl -X POST https://your-domain.com/api/donations/create \
  -H "Content-Type: application/json" \
  -d '{
    "donor_name": "Test User",
    "donor_email": "test@example.com",
    "amount": 100,
    "currency": "USD",
    "provider": "stripe"
  }'
```

### 2. Receipt Generation (Service-Role Client)
```bash
# Test receipt download
curl https://your-domain.com/api/receipts/download?token=<valid-token>
```

### 3. Webhook Processing (Service-Role Client)
```bash
# Trigger a test Stripe webhook (use Stripe CLI)
stripe trigger checkout.session.completed
```

### 4. Admin Actions (Service-Role Client)
- [ ] View donations in admin dashboard
- [ ] Update donation status
- [ ] Export transaction PDF
- [ ] Resend receipt email

### 5. Form Submissions (Anon/Authenticated)
- [ ] Submit contact form
- [ ] Subscribe to newsletter
- [ ] Submit volunteer application

**Expected Result:** All operations should work identically to before

---

## ⚠️ Post-Execution Monitoring

Watch these logs for 24-48 hours after deployment:

### Application Logs
```bash
# Check for RLS permission errors
grep -i "permission denied\|rls\|row level security" app.log

# Check for receipt access errors
grep -i "receipt.*error\|receipt.*failed" app.log

# Check for payment errors
grep -i "payment.*error\|stripe.*error" app.log
```

### Database Logs
```sql
-- Check for failed queries (in Supabase dashboard)
-- Look for: "permission denied for table" or "policy violation"
```

### Metrics to Monitor
- [ ] Donation creation success rate
- [ ] Receipt generation success rate
- [ ] Webhook processing success rate
- [ ] Form submission success rate
- [ ] Admin dashboard responsiveness

---

## 🔄 Rollback Procedures

If issues arise, see `ROLLBACK_PLAN.md` for detailed rollback steps.

### Quick Rollback Commands

```sql
-- Disable RLS on all tables (emergency only)
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events DISABLE ROW LEVEL SECURITY;
-- ... (repeat for other tables)

-- Make receipts bucket public again
UPDATE storage.buckets SET public = true WHERE id = 'receipts';

-- Re-grant function permissions to anon/authenticated
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
```

---

## 📊 Success Criteria

✅ All 7 scripts executed without errors  
✅ All verification queries return expected results  
✅ Application tests pass (payment flow, receipts, webhooks, admin)  
✅ No permission errors in logs for 24 hours  
✅ Supabase database linter shows 0 errors (re-run linter)

---

## 🎯 Re-Run Linter

After all fixes are applied, verify in Supabase dashboard:

1. Go to **Database → Database Health**
2. Click **Run Linter**
3. Verify:
   - ✅ 0 errors (down from 16)
   - ✅ Fewer warnings (down from 82)

---

## 📞 Support

If you encounter issues during execution:

1. Check `ROLLBACK_PLAN.md` for rollback procedures
2. Review application logs for specific error messages
3. Verify service-role key is correctly set in environment
4. Check that all tables/functions exist before running scripts

---

## 📝 Notes

- Scripts are idempotent where possible (safe to re-run)
- All changes are reversible (see ROLLBACK_PLAN.md)
- No data is deleted or modified (structure changes only)
- Service-role client bypasses all RLS policies
- Form submission policies remain open (intentional)

**Estimated total execution time:** < 15 seconds  
**Estimated downtime:** 0 seconds (no service interruption)
