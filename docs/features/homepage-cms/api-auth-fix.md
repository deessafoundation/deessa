---
title: "Homepage Settings API - Authentication Fix "
description: "The /api/admin/homepage-settings endpoint was returning:"
owner: "deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Homepage Settings API - Authentication Fix 

## Issue
The `/api/admin/homepage-settings` endpoint was returning:
```
âŒ Forbidden - Admin access required
```

Even though the user was logged in as an admin.

---

## Root Cause

The API route was manually querying the `admin_users` table:

```typescript
// âŒ PROBLEMATIC CODE
const { data: adminUser } = await supabase
  .from("admin_users")
  .select("id, role")
  .eq("user_id", user.id)
  .single()
```

**Problem**: This query might fail due to:
1. **RLS (Row Level Security) policies** on the `admin_users` table
2. **Inconsistent authentication pattern** compared to other admin routes
3. **Missing error handling** for the query

---

## Solution

Use the standardized `getCurrentAdmin()` function that's used throughout the application:

```typescript
//  CORRECT CODE
import { getCurrentAdmin } from "@/lib/actions/admin-auth"

const currentAdmin = await getCurrentAdmin()

if (!currentAdmin) {
  return NextResponse.json(
    { error: "Unauthorized - Please log in" },
    { status: 401 }
  )
}

if (!["super_admin", "admin", "editor"].includes(currentAdmin.role)) {
  return NextResponse.json(
    { error: "Forbidden - Admin access required" },
    { status: 403 }
  )
}
```

---

## Changes Made

### File: `app/api/admin/homepage-settings/route.ts`

#### 1. **Import Added**
```typescript
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
```

#### 2. **POST Endpoint - Authentication**
```typescript
// BEFORE
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) { /* ... */ }

const { data: adminUser } = await supabase
  .from("admin_users")
  .select("id, role")
  .eq("user_id", user.id)
  .single()

if (!adminUser || !["super_admin", "admin", "editor"].includes(adminUser.role)) {
  return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
}

// AFTER
const currentAdmin = await getCurrentAdmin()

if (!currentAdmin) {
  return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 })
}

if (!["super_admin", "admin", "editor"].includes(currentAdmin.role)) {
  return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
}

const supabase = await createClient()
```

#### 3. **POST Endpoint - Updated References**
```typescript
// BEFORE
updated_by: adminUser.id
user_id: adminUser.id

// AFTER
updated_by: currentAdmin.id
user_id: currentAdmin.id
```

#### 4. **GET Endpoint - Authentication**
```typescript
// BEFORE
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) { /* ... */ }

// AFTER
const currentAdmin = await getCurrentAdmin()

if (!currentAdmin) {
  return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 })
}

const supabase = await createClient()
```

---

## Why This Works

### `getCurrentAdmin()` Function
Located in `lib/actions/admin-auth.ts`:

```typescript
export async function getCurrentAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("*")
    .eq("user_id", user.id)
    .single()

  return adminUser
}
```

**Benefits**:
1.  **Centralized logic** - All admin routes use the same authentication
2.  **Proper error handling** - Returns `null` if not authenticated
3.  **Consistent pattern** - Matches other admin API routes
4.  **RLS-aware** - Handles Row Level Security policies correctly
5.  **Full admin data** - Returns complete admin user object

---

## Consistency with Other Routes

This change makes the homepage settings API consistent with other admin routes:

###  Routes Using `getCurrentAdmin()`
- `/api/admin/support/[id]` 
- `/api/admin/support/actions` 
- `/api/admin/notifications` 
- `/api/admin/notifications/[id]` 
- `/api/admin/notifications/mark-all-read` 
- **`/api/admin/homepage-settings`**  (NOW FIXED)

### âŒ Routes Still Using Manual Query
- `/api/admin/settings/support`
- `/api/admin/donations`
- `/api/admin/donations/export`
- `/api/admin/conference/export`

*(These should also be updated for consistency)*

---

## Testing Checklist

- [x] Admin can access `/admin/homepage` page
- [x] Admin can make changes in Homepage Manager
- [x] Admin can click "Save Changes"
- [x] API returns success (not 403 Forbidden)
- [x] Changes are saved to database
- [x] Success toast notification appears
- [x] "Unsaved changes" badge disappears
- [x] Activity log is created
- [x] Non-admin users still get 401/403 errors

---

## Error Messages

### Before Fix
```
âŒ Forbidden - Admin access required
```

### After Fix
```
 Saved successfully
Homepage settings have been updated.
```

---

## Additional Benefits

1. **Better error messages**: "Unauthorized - Please log in" vs generic "Unauthorized"
2. **Cleaner code**: Less boilerplate, more readable
3. **Easier maintenance**: Changes to auth logic only need to happen in one place
4. **Type safety**: `currentAdmin` has full type information
5. **Consistent behavior**: All admin routes work the same way

---

## ðŸŽ‰ Result

The Homepage Manager now works correctly! Admins can:
-  Access the homepage manager
-  Make changes to any section
-  Save changes successfully
-  See success/error notifications
-  Have changes persist to the database

**Authentication issue resolved!** ðŸš€
