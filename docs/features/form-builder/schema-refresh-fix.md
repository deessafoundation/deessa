---
title: "Form Schema Refresh Issue - Complete Fix"
description: "When users applied a template, made changes, saved as draft, published, and then refreshed the page â€” the form buil..."
owner: "deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Form Schema Refresh Issue - Complete Fix

## Problem Summary
When users applied a template, made changes, saved as draft, published, and then refreshed the page â€” the form builder reverted to the default schema (just name, email, phone fields) instead of showing the saved work.

## Root Cause Analysis

### Previous Fixes (Partial)
The original issue description mentioned 4 breaks that were supposedly fixed:
1.  **API route using wrong Supabase client** - Changed to service role client
2.  **API only fetching active schemas** - Added fallback to latest version
3.  **Component unmounting on tab switch** - Changed to hidden div pattern
4.  **Parent state not synced after save** - Added onSchemaSaved callback

### The Real Problem (The 5th Break)
Despite the above fixes, the issue persisted on page refresh. The actual problem was:

**Break 5: Initial schema not synced after page refresh**

The `EventFormBuilder` component receives an `initialSchema` prop that is only used during the **initial mount** via the `useBuilderState` hook. When the page refreshes:

1. `EventSettingsClient` fetches data from `/api/admin/events/[id]/settings`
2. The form-builder tab's schema is fetched from `/api/admin/events/[id]/form-schema` in a `useEffect`
3. The `formSchema` state gets updated with the fetched data
4. BUT the `EventFormBuilder` component was already mounted with the hardcoded default schema
5. Since the component stays mounted (hidden div pattern), it never re-initializes with the new `formSchema`

The `initialSchema` prop was being passed as:
```typescript
initialSchema={
  formSchema || {
    version: 1,
    steps: [/* default schema */]
  }
}
```

On first render, `formSchema` is `null`, so it uses the default. When `formSchema` updates from the API, the prop changes, but `EventFormBuilder` doesn't react to this change.

## The Solution

### Fix 1: Fetch Form Schema on Mount (EventSettingsClient.tsx)
Moved the form schema fetch out of the tab-switching `useEffect` and into its own `useEffect` that runs on mount:

```typescript
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

This ensures the schema is always fetched when the component mounts, not just when switching to the form-builder tab.

### Fix 2: React to initialSchema Changes (EventFormBuilder/index.tsx)
Added a `useEffect` to sync the builder's internal state when the `initialSchema` prop changes:

```typescript
// Sync with external schema updates (e.g., on page refresh)
useEffect(() => {
  // Only update if the incoming initialSchema is meaningfully different
  // and we don't have unsaved changes
  if (!hasUnsavedChanges && initialSchema && JSON.stringify(initialSchema) !== JSON.stringify(schema)) {
    setSchema(initialSchema)
    lastSavedSchemaRef.current = initialSchema
  }
}, [initialSchema, hasUnsavedChanges, schema, setSchema])
```

This effect:
- Listens for changes to `initialSchema`
- Only updates if there are no unsaved changes (prevents overwriting user work)
- Compares schemas by stringifying to detect meaningful changes
- Updates both the current schema and the "last saved" reference

## Data Flow After Fix

### On Page Load/Refresh
1. `EventSettingsClient` mounts
2. Fetches event settings from `/api/admin/events/[id]/settings`
3. **Immediately** fetches form schema from `/api/admin/events/[id]/form-schema` (not waiting for tab switch)
4. `formSchema` state updates with fetched data
5. `EventFormBuilder` receives updated `initialSchema` prop
6. `useEffect` in `EventFormBuilder` detects the change and updates internal state
7. User sees their saved form schema 

### On Tab Switch
1. Tab switches to form-builder
2. Form is already loaded with correct schema (from mount)
3. No additional fetch needed

### On Save
1. User saves/publishes form
2. `onSchemaSaved` callback updates parent's `formSchema` state
3. `formSchemaVersion` increments
4. This triggers a re-fetch (due to dependency in the fetch `useEffect`)
5. Everything stays in sync

### On Refresh After Save
1. Same as "On Page Load/Refresh" flow
2. Latest schema is fetched and displayed correctly 

## Files Modified

### 1. `components/events/admin/EventSettingsClient.tsx`
- **Change**: Split the data fetching logic
- **Before**: Form schema only fetched when switching to form-builder tab
- **After**: Form schema fetched on mount, independent of active tab

### 2. `components/events/admin/EventFormBuilder/index.tsx`
- **Change**: Added schema sync effect
- **Before**: Only used `initialSchema` during mount via `useBuilderState`
- **After**: Reacts to `initialSchema` prop changes and syncs internal state

## Why This Works

The combination of both fixes ensures:

1. **Early Loading**: Schema is fetched as soon as the settings page loads
2. **Prop Reactivity**: Builder component responds to schema updates from parent
3. **State Persistence**: Hidden div pattern keeps component mounted
4. **Change Protection**: Only syncs when there are no unsaved changes
5. **Refresh Safety**: Page refresh loads saved schema correctly

## Testing Checklist

- [ ] Apply a template
- [ ] Make changes to the form
- [ ] Save as draft
- [ ] Refresh the page â†’ Form should show draft changes
- [ ] Publish the form
- [ ] Refresh the page â†’ Form should show published version
- [ ] Switch tabs
- [ ] Return to form-builder tab â†’ State should be preserved
- [ ] Make changes without saving
- [ ] Refresh page â†’ Should show last saved version (unsaved changes lost, as expected)

## Additional Notes

- The fix respects unsaved changes - it won't overwrite work in progress
- The hidden div pattern remains in place for tab switching performance
- The service role client in the API route ensures RLS doesn't interfere
- The fallback to latest schema (even drafts) ensures admin can always see their work
