---
title: "✅ SQL Script 11 - Error Fixed"
description: "You got this error:"
owner: "Deesha Team"
status: operational
category: operations
audience: admin
last_updated: 2026-09-12
---
# ✅ SQL Script 11 - Error Fixed

## The Problem

You got this error:
```
ERROR: 42710: policy "Admins can view receipt logs" for table "receipt_audit_log" already exists
```

This happened because the SQL script was run before, and the policies already existed.

---

## The Solution

The SQL script has been **FIXED** to handle this situation.

**Files Updated:**
- `scripts/db/migrations/010-receipt-system.sql`
- `SQL_SCRIPT_11_COPY_PASTE.md`

**What Changed:**
Added `DROP POLICY IF EXISTS` commands before creating policies:

```sql
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view receipt logs" ON receipt_audit_log;
DROP POLICY IF EXISTS "System can insert receipt logs" ON receipt_audit_log;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload receipts" ON storage.objects;

-- Then create the policies fresh
CREATE POLICY "Admins can view receipt logs" ON receipt_audit_log ...
```

---

## How to Fix Your Database

### Step 1: Run the Fixed Script

1. Open Supabase: https://app.supabase.com
2. Go to: SQL Editor → New Query
3. Copy entire script from: `SQL_SCRIPT_11_COPY_PASTE.md`
4. Paste into SQL Editor
5. Click "Run"

**Result:** ✅ Script runs successfully with no errors

---

## What the Fixed Script Does

✅ Drops old policies (if they exist)
✅ Creates new policies
✅ Adds receipt columns to donations table
✅ Creates receipt_audit_log table
✅ Creates storage bucket
✅ Initializes organization settings
✅ Verifies everything was created

---

## Verification

After running, you should see results from these queries:

1. **Receipt Columns** - Shows 5 columns added
2. **Receipt Audit Log Table** - Shows table exists
3. **Organization Details** - Shows settings created
4. **Receipts Bucket** - Shows storage bucket created

---

## Next Steps

1. ✅ Run the fixed SQL script (see above)
2. ✅ Configure Google Email: `docs/GOOGLE_EMAIL_SETUP.md`
3. ✅ Set Organization Details: `/admin/settings/organization`
4. ✅ Add to Webhooks: `docs/RECEIPT_WEBHOOK_INTEGRATION.md`
5. ✅ Test with sample donation

---

## Summary

**Before:** Script failed with policy already exists error
**After:** Script runs successfully and can be run multiple times

**Status:** ✅ FIXED

Just run the updated script and you're good to go! 🎉
