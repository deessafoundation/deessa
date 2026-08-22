---
title: "Form Builder Refresh Fix - Complete Solution"
description: "When admins applied a template, made changes, saved as draft, and refreshed the page â€” the form builder reverted to..."
owner: "Deesha Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Form Builder Refresh Fix - Complete Solution

## Problem Summary
When admins applied a template, made changes, saved as draft, and refreshed the page â€” the form builder reverted to the default schema (name, email, phone) instead of showing the saved work.

## Root Cause Analysis

### The Real Issue
The component rendering logic had a critical flaw:

**Before Fix:**
```tsx
<EventFormBuilder
  initialSchema={formSchema || DEFAULT_SCHEMA}
/>
```

**What happened:**
1. Page loads â†’ `formSchema` state is `null`
2. EventFormBuilder mounts with `DEFAULT_SCHEMA` as `initialSchema`
3. API fetch completes â†’ `formSchema` state updates with saved data
4. BUT: EventFormBuilder already mounted and ignores the new `initialSchema` prop
5. Result: User sees default schema instead of their saved work

## The Solution

### 1. Fetch Form Schema on Component Mount (Independent of Tab)
**File:** `components/events/admin/EventSettingsClient.tsx`

```tsx
// Fetch form schema on mount (independent of tab switching)
useEffect(() => {
  if (!data) return
  fetch(`/api/admin/events/${eventId}/form-schema`)
    .then((r) => r.json())
    .then((json) => {
      if (json.schema) {
        setFormSchema(json.schema)
      }
    })
    .catch(() => {})
}, [eventId, data, formSchemaVersion])
```

**Why:** Ensures schema is fetched immediately when the page loads, not just when switching to the form-builder tab.

### 2. Conditional Rendering with Loading State
**File:** `components/events/admin/EventSettingsClient.tsx`

```tsx
<div className={activeTab === "form-builder" ? "" : "hidden"}>
  {formSchema !== null ? (
    <EventFormBuilder
      key={`form-builder-${eventId}-${formSchemaVersion}`}
      eventId={eventId}
      initialSchema={formSchema}
      onSchemaSaved={(schema) => {
        setFormSchema(schema)
        setFormSchemaVersion((v) => v + 1)
      }}
    />
  ) : (
    <LoadingSkeleton />
  )}
</div>
```

**Why this works:**
- **Conditional Render:** Only renders EventFormBuilder when `formSchema !== null`
- **Key Prop:** Forces remount when schema version changes
- **No Default Fallback:** Removes the `|| DEFAULT_SCHEMA` pattern that was causing the bug

### 3. Keep Hidden Div Approach for Tab Switching
The component uses hidden divs instead of conditional mounting to preserve local state when switching between tabs:

```tsx
<div className={activeTab === "form-builder" ? "" : "hidden"}>
```

This prevents losing unsaved changes when users switch tabs.

## What Was Already Fixed (From Previous Attempts)

### API Route Fix
**File:** `app/api/admin/events/[id]/form-schema/route.ts`
- âœ… Changed to `createServiceRoleClient()` (bypasses RLS)
- âœ… Added fallback to fetch latest draft if no active schema exists

### Parent State Sync
**File:** `components/events/admin/EventSettingsClient.tsx`
- âœ… Added `onSchemaSaved` callback to update parent state immediately

## Testing Checklist

- [x] Apply a template â†’ Save draft â†’ Refresh page â†’ Schema persists âœ…
- [x] Edit fields â†’ Save draft â†’ Refresh page â†’ Edits persist âœ…
- [x] Switch tabs â†’ Form builder preserves local state âœ…
- [x] Save draft â†’ Switch tabs â†’ Come back â†’ Edits still there âœ…
- [x] Can edit field labels, options, validation rules âœ…
- [x] Publish form â†’ Refresh â†’ Shows published version âœ…

## Key Takeaways

1. **Never use default fallbacks with `initialSchema`** when the real data is being fetched asynchronously
2. **Use `key` prop to force remount** when external data changes
3. **Fetch critical data early** (on mount, not on tab switch)
4. **Show loading states** while data is being fetched
5. **Hidden divs preserve state** better than conditional rendering for tab content

## Files Modified

1. `components/events/admin/EventSettingsClient.tsx`
   - Moved form schema fetch to separate useEffect (runs on mount)
   - Changed EventFormBuilder rendering to conditional with loading state
   - Added key prop for controlled remounting

2. `components/events/admin/EventFormBuilder/index.tsx`
   - Removed sync effect that was preventing edits
   - Cleaned up duplicate state declarations

## Result

âœ… **Form builder now correctly loads saved schemas on page refresh**  
âœ… **All field editing functionality works as expected**  
âœ… **Tab switching preserves unsaved changes**  
âœ… **No more reverting to default schema**
