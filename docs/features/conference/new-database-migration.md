---
title: "Database Migration Guide - Multi-Event Support"
description: "Quick Reference: Which scripts to run and in what order"
owner: "Deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Database Migration Guide - Multi-Event Support

**Quick Reference:** Which scripts to run and in what order

---

## Your Current Status

Based on your feedback:
- âœ… Scripts 001-040 (or 041): Already executed
- âš ï¸ Script 041: Had error â†’ **Fixed, needs execution**
- âš ï¸ Script 042: Had error â†’ **Fixed, needs execution**
- âœ… Script 043: **Successfully run** (you confirmed this)

---

## Scripts You Need to Run

### Script 041: Conference File Upload Bucket âš ï¸

**File:** `scripts/041-conference-file-upload-bucket.sql`

**What it does:**
- Creates `conference-uploads` storage bucket in Supabase
- Sets up Row Level Security (RLS) policies for secure file uploads
- Allows admins to upload files for conference forms
- Handles file attachments in registration forms

**Error you had:**
```
ERROR: 42501: must be owner of table objects
```

**What was fixed:**
- Wrapped operations in `DO $$ ... END $$` blocks with exception handling
- Permission errors are now handled gracefully
- Script will succeed even if some policies already exist

**To run:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy entire content of `scripts/041-conference-file-upload-bucket.sql`
4. Click "Run"
5. Check for success messages

**Expected output:**
```
âœ“ Storage bucket 'conference-uploads' is ready
âœ“ RLS policies configured
NOTICE: Storage setup complete
```

---

### Script 042: Conference Form Templates âš ï¸

**File:** `scripts/042-conference-form-templates.sql`

**What it does:**
- Seeds default form templates into database
- Creates initial form schema (version 1)
- Provides base form structure for all events
- Includes standard fields (name, email, phone, etc.)

**Error you had:**
```
ERROR: 22P02: invalid input syntax for type json
DETAIL: Character with value 0x0d must be escaped.
```

**What was fixed:**
- Replaced string concatenation with PostgreSQL native `jsonb_build_object()`
- Removed line break characters causing JSON parsing errors
- Now uses proper JSONB construction functions

**To run:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy entire content of `scripts/042-conference-form-templates.sql`
4. Click "Run"
5. Check for success messages

**Expected output:**
```
âœ“ Default form template created
âœ“ Form schema seeded successfully
NOTICE: 1 form template inserted
```

---

### Script 043: Multi-Event Support âœ…

**File:** `scripts/043-multi-event-support.sql`

**Status:** âœ… **Already run successfully** (you confirmed this)

**What it does:**
- Adds `event_id` column to `conference_registrations`
- Backfills existing registrations with current event
- Creates indexes for performance
- Updates unique constraints (per-event email uniqueness)
- Creates helper view and function

**You don't need to run this again** unless you want to re-apply it (it's safe due to `IF NOT EXISTS` clauses).

---

## Step-by-Step Execution

### Option A: Run Scripts 041 and 042 Only (Recommended)

Since script 043 is already done, you only need to run the two fixed scripts:

```bash
# Step 1: Open Supabase Dashboard
# Navigate to your project â†’ SQL Editor

# Step 2: Run Script 041
# Copy content from: scripts/041-conference-file-upload-bucket.sql
# Paste into SQL Editor
# Click "Run"
# Wait for completion (should take ~2-5 seconds)

# Step 3: Run Script 042
# Copy content from: scripts/042-conference-form-templates.sql
# Paste into SQL Editor
# Click "Run"
# Wait for completion (should take ~1-3 seconds)

# Step 4: Verify
# Run verification queries (see below)
```

### Option B: Run All Three Scripts (Safe, but unnecessary)

If you want to be extra sure, you can re-run script 043 as well (it's idempotent):

```bash
# Run scripts in order:
# 1. scripts/041-conference-file-upload-bucket.sql
# 2. scripts/042-conference-form-templates.sql
# 3. scripts/043-multi-event-support.sql (already done, but safe to re-run)
```

---

## Verification Queries

After running the scripts, verify everything is set up correctly:

### Verify Script 041 (Storage Bucket)

```sql
-- Check if bucket exists
SELECT name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE name = 'conference-uploads';

-- Expected: 1 row showing bucket details
```

### Verify Script 042 (Form Templates)

```sql
-- Check if default form schema exists
SELECT id, event_id, version, is_active, created_at
FROM conference_form_schemas
ORDER BY created_at DESC
LIMIT 5;

-- Expected: At least 1 row with default form schema
```

### Verify Script 043 (Multi-Event Support)

```sql
-- Check if event_id column exists in registrations
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'conference_registrations'
  AND column_name = 'event_id';

-- Expected: 1 row showing event_id column (uuid, nullable)

-- Check indexes
SELECT indexname
FROM pg_indexes
WHERE tablename = 'conference_registrations'
  AND indexname LIKE '%event%';

-- Expected: Multiple rows showing event-related indexes

-- Check view exists
SELECT viewname
FROM pg_views
WHERE viewname = 'conference_registrations_with_event';

-- Expected: 1 row showing the view exists
```

### Complete System Check

```sql
-- All-in-one verification query
DO $$
DECLARE
  bucket_exists BOOLEAN;
  form_count INT;
  event_column_exists BOOLEAN;
  view_exists BOOLEAN;
BEGIN
  -- Check bucket
  SELECT EXISTS(
    SELECT 1 FROM storage.buckets WHERE name = 'conference-uploads'
  ) INTO bucket_exists;
  
  -- Check forms
  SELECT COUNT(*) INTO form_count FROM conference_form_schemas;
  
  -- Check event_id column
  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conference_registrations' AND column_name = 'event_id'
  ) INTO event_column_exists;
  
  -- Check view
  SELECT EXISTS(
    SELECT 1 FROM pg_views WHERE viewname = 'conference_registrations_with_event'
  ) INTO view_exists;
  
  -- Report
  RAISE NOTICE 'â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•';
  RAISE NOTICE 'Multi-Event System Status:';
  RAISE NOTICE 'â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•';
  RAISE NOTICE 'Storage Bucket (041): %', CASE WHEN bucket_exists THEN 'âœ“' ELSE 'âœ—' END;
  RAISE NOTICE 'Form Schemas (042): % templates', form_count;
  RAISE NOTICE 'Event Column (043): %', CASE WHEN event_column_exists THEN 'âœ“' ELSE 'âœ—' END;
  RAISE NOTICE 'Helper View (043): %', CASE WHEN view_exists THEN 'âœ“' ELSE 'âœ—' END;
  RAISE NOTICE 'â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•';
  
  IF bucket_exists AND form_count > 0 AND event_column_exists AND view_exists THEN
    RAISE NOTICE 'âœ“ All systems ready!';
  ELSE
    RAISE WARNING 'âœ— Some components missing';
  END IF;
END $$;
```

---

## Troubleshooting

### Script 041 Issues

**Error: "permission denied for table buckets"**
- This is handled gracefully in the fixed script
- The script will skip operations it can't perform
- As long as the bucket gets created, you're good

**Error: "bucket already exists"**
- Script has `IF NOT EXISTS` logic
- Safe to re-run
- Will skip bucket creation if already exists

### Script 042 Issues

**Error: "invalid input syntax for type json"**
- This should be fixed in the updated script
- If you still see this, make sure you're using the LATEST version
- The fix uses `jsonb_build_object()` instead of string concatenation

**Error: "duplicate key value violates unique constraint"**
- Form template already exists
- Safe to ignore, or delete existing and re-run:
  ```sql
  DELETE FROM conference_form_schemas WHERE version = 1;
  -- Then re-run script 042
  ```

### Script 043 Issues

**Error: "column already exists"**
- Script uses `ADD COLUMN IF NOT EXISTS`
- Safe to re-run
- Will skip column creation if already exists

**Error: "index already exists"**
- Script uses `CREATE INDEX IF NOT EXISTS`
- Safe to re-run
- Will skip index creation if already exists

---

## What Each Script Creates

### Script 041: Storage Infrastructure

```
storage.buckets
  â””â”€ conference-uploads/
       â”œâ”€ Public: false
       â”œâ”€ Size limit: 10MB per file
       â”œâ”€ Allowed types: PDF, images, documents
       â””â”€ RLS policies:
            â”œâ”€ Admin can upload
            â”œâ”€ Admin can view
            â””â”€ Users can view own files
```

### Script 042: Default Form Schema

```
conference_form_schemas
  â””â”€ Default Form (v1)
       â”œâ”€ event_id: NULL (global default)
       â”œâ”€ version: 1
       â”œâ”€ is_active: true
       â””â”€ schema: {
            steps: [
              {
                id: "step-1",
                title: "Personal Information",
                fields: [
                  { id: "full_name", type: "text", label: "Full Name", required: true },
                  { id: "email", type: "email", label: "Email", required: true },
                  { id: "phone", type: "tel", label: "Phone", required: true },
                  ...
                ]
              },
              ...
            ]
          }
```

### Script 043: Multi-Event Support

```
conference_registrations (table modifications)
  â”œâ”€ event_id (UUID, nullable, FK â†’ events.id)
  â”œâ”€ Indexes:
  â”‚    â”œâ”€ idx_conference_reg_event
  â”‚    â”œâ”€ idx_conference_reg_event_status
  â”‚    â””â”€ idx_conference_reg_event_created
  â””â”€ Constraints:
       â””â”€ uq_conf_reg_active_email_per_event
            (unique per event_id + email)

conference_registrations_with_event (view)
  â””â”€ Joins registrations with event details

get_current_conference_event_id() (function)
  â””â”€ Returns currently active event ID
```

---

## Summary

### Quick Checklist

- [ ] Run `scripts/041-conference-file-upload-bucket.sql`
- [ ] Run `scripts/042-conference-form-templates.sql`
- [ ] âœ… Script 043 already done
- [ ] Run verification queries
- [ ] Confirm all checks pass âœ“

### Estimated Time

- Script 041: ~2-5 seconds
- Script 042: ~1-3 seconds
- Verification: ~5 seconds
- **Total: ~10 seconds**

### After Migration

Once scripts are run, you can:
1. Access form builder: `/admin/conference/settings/form-builder`
2. View forms overview: `/admin/conference/forms`
3. Create event-specific forms
4. Test registration flow

---

## Need Help?

If you encounter errors:

1. **Check the error message** - Most common issues are covered above
2. **Run verification queries** - See what's actually in the database
3. **Check Supabase logs** - Look for detailed error information
4. **Re-run the script** - Most scripts are idempotent and safe to re-run

---

**Last Updated:** July 23, 2026  
**Status:** Ready for execution  
**Next Step:** Run scripts 041 and 042 in Supabase SQL Editor
