# Partners System - Orphaned Records Fix

## Problem

Error message: **"This partner is already added to this event"** but no partners are visible in the UI.

### Root Cause

Orphaned records in the `context_partners` table - the `partner_id` references a partner that was deleted from the `partners` table, but the link record wasn't removed.

**Why it happens:**
1. Partner was added to event
2. Partner was later deleted from global partners table
3. The `context_partners` record still exists (orphaned)
4. The `context_partners_detailed` view uses `INNER JOIN`, so orphaned records don't appear
5. The duplicate check sees the orphaned record → shows error
6. But the view doesn't return it → appears as if no partners exist

## Solution Implemented

### 1. Automatic Cleanup on Component Mount

**File:** `components/admin/events/partners-editor.tsx`

When you open the Partners tab, the component automatically:
1. Checks for orphaned `context_partners` records
2. Deletes any found
3. Shows notification if cleanup occurred
4. Refreshes the partner list

```typescript
useEffect(() => {
  const checkAndCleanOrphaned = async () => {
    const { cleanupOrphanedPartners } = await import("@/lib/actions/cleanup-orphaned-partners")
    const result = await cleanupOrphanedPartners(eventId)
    
    if (result.success && result.orphanedCount > 0) {
      console.log(`Cleaned up ${result.orphanedCount} orphaned records`)
      notifications.showInfo({ description: `Cleaned up ${result.orphanedCount} orphaned partner record(s)` })
      onUpdate?.() // Refresh
    }
  }
  checkAndCleanOrphaned()
}, [eventId, onUpdate])
```

### 2. Diagnostic Logging

**File:** `app/api/admin/events/[id]/partners/linked/route.ts`

The API endpoint now logs diagnostic info when it detects a mismatch:

```
[Partners Diagnostic] Event abc-123:
  - Raw context_partners: 3
  - Detailed view results: 2
  - Orphaned records: 1
  - Orphaned partner IDs: xyz-789
```

Check your browser console or server logs for these warnings.

### 3. Manual Cleanup Action

**File:** `lib/actions/cleanup-orphaned-partners.ts`

Server action that:
- Fetches all `context_partners` for an event
- Checks which `partner_id`s don't exist in `partners` table
- Deletes orphaned records
- Logs activity for audit trail

### 4. Database Diagnostic Scripts

**Diagnostic:** `scripts/db/diagnostics/check-orphaned-partners.sql`

Run this to see all orphaned records across your database:

```sql
-- Shows orphaned context_partners
SELECT 
  cp.id,
  cp.context_type,
  cp.context_id,
  cp.partner_id,
  'Orphaned: Partner does not exist' as issue
FROM context_partners cp
LEFT JOIN partners p ON cp.partner_id = p.id
WHERE p.id IS NULL;
```

**Cleanup:** `scripts/db/maintenance/cleanup-orphaned-partners.sql`

Run this to manually clean up all orphaned records (if needed).

## How to Fix Now

### Option 1: Automatic (Recommended)

Just refresh the Partners tab in your event settings. The cleanup will run automatically.

### Option 2: Database Query

If you want to clean up manually across all events:

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/tqljblbdfhjfqnegjobi/sql)
2. Run the diagnostic script to see orphaned records:
   ```sql
   SELECT 
     cp.id,
     cp.context_type,
     cp.context_id,
     cp.partner_id
   FROM context_partners cp
   LEFT JOIN partners p ON cp.partner_id = p.id
   WHERE p.id IS NULL;
   ```
3. Delete orphaned records:
   ```sql
   DELETE FROM context_partners
   WHERE id IN (
     SELECT cp.id
     FROM context_partners cp
     LEFT JOIN partners p ON cp.partner_id = p.id
     WHERE p.id IS NULL
   );
   ```

### Option 3: Check Browser Console

1. Open Developer Tools (F12)
2. Go to Partners tab
3. Look for cleanup notification
4. Check console for diagnostic logs

## Prevention

### Database Constraint (Already in Place)

```sql
partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE
```

The `ON DELETE CASCADE` means when a partner is deleted, all `context_partners` records should be automatically deleted.

**Why it might not have worked:**
- Migration was applied after orphaned records existed
- Database constraint wasn't enforced on existing data

### UI-Level Prevention

The partners editor now:
1. ✅ Validates category exists before adding
2. ✅ Checks for duplicates before adding
3. ✅ Auto-cleans orphaned records on mount
4. ✅ Shows diagnostic info in logs

## Testing the Fix

1. **Create a test scenario:**
   ```sql
   -- Add a partner
   INSERT INTO partners (id, name, is_published) 
   VALUES ('test-partner-id', 'Test Partner', true);
   
   -- Link to event
   INSERT INTO context_partners (context_type, context_id, partner_id, category_key)
   VALUES ('event', 'your-event-id', 'test-partner-id', 'organizers');
   
   -- Delete the partner (creates orphan)
   DELETE FROM partners WHERE id = 'test-partner-id';
   ```

2. **Verify cleanup:**
   - Reload Partners tab
   - Should see "Cleaned up 1 orphaned partner record(s)" notification
   - No error when trying to add new partners

3. **Check console:**
   - Should see diagnostic log with orphaned count
   - Should see cleanup success message

## Files Changed

- `components/admin/events/partners-editor.tsx` — Auto cleanup on mount
- `app/api/admin/events/[id]/partners/linked/route.ts` — Diagnostic logging
- `lib/actions/cleanup-orphaned-partners.ts` — Cleanup server action
- `scripts/db/diagnostics/check-orphaned-partners.sql` — Diagnostic queries
- `scripts/db/maintenance/cleanup-orphaned-partners.sql` — Manual cleanup

## Related Issues

This fix also resolves:
- ❌ "Partner count shows X but only Y visible" discrepancies
- ❌ Cannot add partners after previous partner was deleted
- ❌ Duplicate error for partners that don't appear in UI

---

**Status:** ✅ Fixed with automatic cleanup  
**Date:** October 28, 2026  
**Next:** Try refreshing the Partners tab - cleanup should run automatically!
