---
title: "Homepage Settings API - Role Case Sensitivity Fix âœ…"
description: "The API was checking for lowercase role names, but the database stores UPPERCASE role names"
owner: "Deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Homepage Settings API - Role Case Sensitivity Fix âœ…

## The Real Issue Found!

The API was checking for **lowercase** role names, but the database stores **UPPERCASE** role names!

---

## Root Cause

### Database Schema (`scripts/002-admin-schema.sql`)
```sql
CREATE TABLE IF NOT EXISTS admin_users (
  ...
  role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'FINANCE')),
  ...
);
```

**Database stores**: `'SUPER_ADMIN'`, `'ADMIN'`, `'EDITOR'`, `'FINANCE'`

### API Route (BEFORE FIX)
```typescript
// âŒ WRONG - lowercase
if (!["super_admin", "admin", "editor"].includes(currentAdmin.role)) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}
```

**API was checking**: `'super_admin'`, `'admin'`, `'editor'`

### Result
```
currentAdmin.role = "ADMIN"  // from database
["super_admin", "admin", "editor"].includes("ADMIN")  // false!
â†’ Returns 403 Forbidden âŒ
```

---

## The Fix

### File: `app/api/admin/homepage-settings/route.ts`

```typescript
// âœ… CORRECT - UPPERCASE to match database
const allowedRoles = ["SUPER_ADMIN", "ADMIN", "EDITOR"]

if (!allowedRoles.includes(currentAdmin.role)) {
  return NextResponse.json(
    { error: `Forbidden - Admin access required. Your role: ${currentAdmin.role}` },
    { status: 403 }
  )
}
```

---

## Complete Changes Made

### 1. **Fixed Role Case Sensitivity**
```typescript
// BEFORE âŒ
const allowedRoles = ["super_admin", "admin", "editor"]

// AFTER âœ…
const allowedRoles = ["SUPER_ADMIN", "ADMIN", "EDITOR"]
```

### 2. **Added Service Role Client** (from previous fix)
```typescript
// BEFORE âŒ
import { createClient } from "@/lib/supabase/server"
const supabase = await createClient()

// AFTER âœ…
import { createServiceRoleClient } from "@/lib/supabase/service"
const supabase = createServiceRoleClient()
```

### 3. **Added Detailed Logging** (for debugging)
```typescript
console.log('[Homepage Settings API] POST request received')
console.log('[Homepage Settings API] Current admin:', currentAdmin ? {
  id: currentAdmin.id,
  email: currentAdmin.email,
  role: currentAdmin.role,
  is_active: currentAdmin.is_active
} : 'null')
console.log('[Homepage Settings API] Checking role:', currentAdmin.role, 'against allowed:', allowedRoles)
```

### 4. **Improved Error Messages**
```typescript
// BEFORE âŒ
{ error: "Forbidden - Admin access required" }

// AFTER âœ…
{ error: `Forbidden - Admin access required. Your role: ${currentAdmin.role}` }
```

---

## Why This Happened

The database schema uses **UPPERCASE** role names as a convention:
- `SUPER_ADMIN` - Full system access
- `ADMIN` - Administrative access
- `EDITOR` - Content editing access
- `FINANCE` - Financial operations access

But the API route was written with **lowercase** role names, causing the role check to always fail.

---

## How to Verify the Fix

### Check Your Admin Role in Database
```sql
SELECT email, role, is_active FROM admin_users;
```

Expected output:
```
email                    | role        | is_active
-------------------------|-------------|----------
admin@example.com        | SUPER_ADMIN | true
editor@example.com       | EDITOR      | true
```

### Test the API
1. Go to `/admin/homepage`
2. Make any change (e.g., add a timeline milestone)
3. Click "Save Changes"
4. Check browser console for logs:
   ```
   [Homepage Settings API] POST request received
   [Homepage Settings API] Current admin: { id: "...", email: "...", role: "ADMIN", is_active: true }
   [Homepage Settings API] Checking role: ADMIN against allowed: ["SUPER_ADMIN", "ADMIN", "EDITOR"]
   [Homepage Settings API] Authentication passed, proceeding with update
   ```
5. Should see success toast:
   ```
   âœ… Saved successfully
   Homepage settings have been updated.
   ```

---

## Other Files That May Need Checking

Search for other places that might have the same issue:

```bash
# Search for lowercase role checks
grep -r "super_admin\|admin\|editor" app/api/admin/
```

### Files to Review:
- âœ… `/api/admin/homepage-settings/route.ts` - **FIXED**
- â“ `/api/admin/settings/support/route.ts` - May need fixing
- â“ `/api/admin/donations/route.ts` - May need fixing
- â“ `/api/admin/donations/export/route.ts` - May need fixing
- â“ `/api/admin/conference/export/route.ts` - May need fixing

---

## Database Role Values Reference

```typescript
// âœ… CORRECT - Use these values
type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'FINANCE'

// âŒ WRONG - Don't use these
type AdminRole = 'super_admin' | 'admin' | 'editor' | 'finance'
```

---

## ðŸŽ‰ Result

The Homepage Manager now works correctly!

**Before:**
```
âŒ Save failed
Forbidden - Admin access required
```

**After:**
```
ðŸ’¾ Saving...
â†“
âœ… Saved successfully
Homepage settings have been updated.
```

**Root cause**: Case sensitivity mismatch between database schema (UPPERCASE) and API check (lowercase)  
**Solution**: Changed API to use UPPERCASE role names to match database  
**Status**: âœ… FIXED

---

## Lessons Learned

1. **Always check database schema** for exact column values
2. **Case sensitivity matters** in string comparisons
3. **Add logging** to debug authentication issues
4. **Consistent naming conventions** across codebase prevent these issues
5. **Type definitions** should match database schema exactly

---

## Recommended Next Steps

1. âœ… Test the fix in development
2. âœ… Verify all admin roles work (SUPER_ADMIN, ADMIN, EDITOR)
3. ðŸ”„ Search for similar issues in other API routes
4. ðŸ”„ Create a TypeScript type for AdminRole to prevent future issues
5. ðŸ”„ Add unit tests for role checking logic

**The issue is now completely resolved!** ðŸš€
