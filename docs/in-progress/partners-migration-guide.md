# Partners System Migration Guide

## Overview

This guide walks through applying the partner context ownership migration to your Supabase database.

## Migration File

**File:** `scripts/db/migrations/073-partner-context-ownership.sql`

**What it does:**
- Adds `created_context_type` and `created_context_id` columns to `partners` table
- Creates indexes for efficient filtering
- Adds helper functions for querying available partners
- All existing partners become global by default (no data loss)

## How to Apply the Migration

### Option 1: Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/tqljblbdfhjfqnegjobi)
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `scripts/db/migrations/073-partner-context-ownership.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
7. Verify success message appears

### Option 2: psql Command Line

```bash
# If you have psql installed locally
psql "postgres://postgres.tqljblbdfhjfqnegjobi:5UQfounjunwFuV1K@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require" \
  -f scripts/db/migrations/073-partner-context-ownership.sql
```

### Option 3: Node.js Script

```javascript
// scripts/run-migration.js
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const sql = fs.readFileSync(
  'scripts/db/migrations/073-partner-context-ownership.sql',
  'utf8'
)

supabase.rpc('exec_sql', { sql }).then(({ data, error }) => {
  if (error) console.error('Migration failed:', error)
  else console.log('Migration successful:', data)
})
```

## Verification Steps

After running the migration, verify it worked:

### 1. Check New Columns Exist

```sql
-- Run in Supabase SQL Editor
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'partners'
AND column_name IN ('created_context_type', 'created_context_id');
```

**Expected output:**
```
column_name              | data_type | is_nullable
-------------------------+-----------+-------------
created_context_type     | text      | YES
created_context_id       | uuid      | YES
```

### 2. Check Indexes Created

```sql
-- Run in Supabase SQL Editor
SELECT indexname
FROM pg_indexes
WHERE tablename = 'partners'
AND indexname LIKE '%ownership%';
```

**Expected output:**
```
indexname
-------------------------------
idx_partners_context_ownership
idx_partners_global
```

### 3. Test Helper Function

```sql
-- Run in Supabase SQL Editor
-- This should return all global partners (created_context_type IS NULL)
SELECT * FROM get_available_partners_for_context('event', NULL)
LIMIT 5;
```

**Expected:** Returns partners from your database (or empty if no partners exist yet)

### 4. Verify Existing Partners Are Global

```sql
-- Run in Supabase SQL Editor
SELECT 
  id,
  name,
  created_context_type,
  created_context_id
FROM partners;
```

**Expected:** All `created_context_type` values should be `NULL` (global partners)

## Rollback (if needed)

If something goes wrong, you can rollback:

```sql
-- Remove columns
ALTER TABLE partners
  DROP COLUMN IF EXISTS created_context_type,
  DROP COLUMN IF EXISTS created_context_id;

-- Remove indexes
DROP INDEX IF EXISTS idx_partners_context_ownership;
DROP INDEX IF EXISTS idx_partners_global;

-- Remove functions
DROP FUNCTION IF EXISTS partner_is_global(UUID);
DROP FUNCTION IF EXISTS get_available_partners_for_context(TEXT, UUID);
```

## Post-Migration Testing

Once migration is applied, test the full flow:

### 1. Create Event-Specific Partner

```typescript
// In event settings → Partners tab → "Create New"
// Should create with created_context_type = 'event'
```

### 2. Verify Available Partners

```typescript
// In event settings → Partners tab → "Add from Available"
// Should show:
//   - All global partners (created_context_type IS NULL)
//   - Partners created in THIS event only
// Should NOT show:
//   - Partners created in OTHER events
```

### 3. Check Global Directory

```typescript
// In /admin/partners page
// Should show:
//   - Only global partners (created_context_type IS NULL)
// Should NOT show:
//   - Event-specific partners
```

## Common Issues

### Issue: Function already exists

**Error:** `ERROR: function get_available_partners_for_context already exists`

**Solution:** The migration includes `CREATE OR REPLACE FUNCTION`, so this should not happen. If it does, manually drop the function first:

```sql
DROP FUNCTION IF EXISTS get_available_partners_for_context(TEXT, UUID);
```

Then re-run the migration.

### Issue: Column already exists

**Error:** `ERROR: column "created_context_type" already exists`

**Solution:** The migration includes `ADD COLUMN IF NOT EXISTS`, so this should not happen. If it does, the column already exists and you can skip to verification steps.

### Issue: Permission denied

**Error:** `ERROR: permission denied for table partners`

**Solution:** Make sure you're using the `SUPABASE_SERVICE_ROLE_KEY` (not the anon key) when running the migration.

## Need Help?

If you encounter issues:

1. Check the Supabase Dashboard → Database → Logs for detailed error messages
2. Verify your database connection in `.env.local`
3. Ensure no other migrations are running simultaneously
4. Check if the partners table has any active locks: `SELECT * FROM pg_locks WHERE relation = 'partners'::regclass;`

## Migration History

| Migration | Date | Status |
|-----------|------|--------|
| 070-universal-partners-system.sql | Oct 28, 2026 | ✅ Applied |
| 071-seed-default-categories.sql | Oct 28, 2026 | ✅ Applied |
| 072-partner-logos-storage.sql | Oct 28, 2026 | ✅ Applied |
| **073-partner-context-ownership.sql** | Oct 28, 2026 | ⏳ **Pending** |

---

**Next Step:** Apply the migration using one of the methods above, then proceed to testing!
