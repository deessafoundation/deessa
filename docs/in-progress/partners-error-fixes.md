# Partners System Error Fixes

## Issue: "Failed to link partner to context"

### Root Causes Identified

1. **Missing categories** — Users trying to add partners before creating categories
2. **Generic error message** — Database errors weren't being properly surfaced
3. **No validation** — No client-side check if selected category exists

### Fixes Applied

#### 1. Enhanced Error Handling in Server Action

**File:** `lib/actions/context-partners.ts`

**Before:**
```typescript
if (error) {
  console.error("Failed to link partner:", error)
  return { success: false, error: "Failed to link partner to context" }
}
```

**After:**
```typescript
if (error) {
  console.error("Failed to link partner:", error)
  
  // Handle specific error cases
  if (error.code === "23505") {
    // Unique constraint violation
    return { success: false, error: "This partner is already added to this event" }
  }
  
  if (error.code === "23503") {
    // Foreign key violation (category doesn't exist)
    return { success: false, error: "Partner not found or category doesn't exist" }
  }
  
  return { success: false, error: `Failed to link partner: ${error.message}` }
}
```

**Benefits:**
- Shows specific error for duplicate partners (23505)
- Shows specific error for missing categories (23503)
- Shows database error message for other cases

#### 2. Client-Side Category Validation

**File:** `components/admin/events/partners-editor.tsx`

**Added to `handleAddPartner`:**
```typescript
// Check if the category exists for this event
const categoryExists = categories.some((cat) => cat.category_key === selectedCategory)
if (!categoryExists) {
  notifications.showError({ 
    description: "Selected category doesn't exist. Please create categories first." 
  })
  return
}
```

**Added to `handleCreateNewPartner`:**
```typescript
// Check if the category exists for this event
const categoryExists = categories.some((cat) => cat.category_key === selectedCategory)
if (!categoryExists) {
  notifications.showError({ 
    description: "Selected category doesn't exist. Please create categories first." 
  })
  return
}
```

**Benefits:**
- Prevents invalid API calls
- Shows helpful error before attempting to save
- Updates dependency array to include `categories`

#### 3. UI Warning for Missing Categories

**File:** `components/admin/events/partners-editor.tsx`

**Added before partner forms:**
```typescript
{categories.length === 0 ? (
  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
    <p className="text-sm text-amber-800 mb-2">
      <strong>No categories configured.</strong>
    </p>
    <p className="text-xs text-amber-700">
      Please switch to the "Categories" view and create categories first, 
      or click "Copy Defaults" to get started quickly.
    </p>
    <Button size="sm" variant="outline" onClick={() => setView("categories")} className="mt-3">
      <Settings className="mr-2 h-4 w-4" />
      Go to Categories
    </Button>
  </div>
) : showNewPartnerForm ? (
  // ... existing forms
)}
```

**Benefits:**
- Prevents user confusion
- Clear call-to-action to fix the issue
- Direct button to navigate to Categories view

## Error Codes Reference

| Code | Meaning | User Message |
|------|---------|--------------|
| 23505 | Unique constraint violation | "This partner is already added to this event" |
| 23503 | Foreign key violation | "Partner not found or category doesn't exist" |
| Other | Generic database error | "Failed to link partner: [error message]" |

## Testing Checklist

- [ ] Try adding partner without categories (should show amber warning)
- [ ] Try adding duplicate partner (should show "already added" error)
- [ ] Try adding partner with valid category (should succeed)
- [ ] Check console logs for database errors (should show specific codes)
- [ ] Click "Go to Categories" button (should switch views)

## User Flow Fix

### Before (Broken Flow)

1. User opens event → Partners tab
2. Sees empty "Manage Partners" view
3. Tries to add existing partner
4. Gets cryptic "Failed to link partner to context" error
5. **User stuck — doesn't know what's wrong**

### After (Fixed Flow)

1. User opens event → Partners tab
2. Sees amber warning: "No categories configured"
3. Clicks "Go to Categories" button
4. Creates categories (or clicks "Copy Defaults")
5. Returns to "Manage Partners" view
6. Successfully adds partners

## Migration Context

This fix is part of the partners system overhaul that includes:

- ✅ Context ownership tracking (migration 073)
- ✅ Event-specific vs global partners
- ✅ Better error handling (this fix)
- ✅ Category validation (this fix)
- ✅ UI warning for missing setup (this fix)

## Related Files

- `lib/actions/context-partners.ts` — Server action error handling
- `components/admin/events/partners-editor.tsx` — Client-side validation and UI
- `scripts/db/migrations/070-universal-partners-system.sql` — Original schema
- `scripts/db/migrations/073-partner-context-ownership.sql` — Ownership tracking

---

**Status:** ✅ Fixed  
**Date:** October 28, 2026  
**Impact:** Resolves user confusion and provides clear error messages
