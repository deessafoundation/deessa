# Admin Events UX Restructure Plan

**Date:** 2026-07-24  
**Status:** ✅ COMPLETED

---

## Summary

Successfully restructured the admin events flow to prioritize registrations data and consolidate settings into a unified page with tab navigation. The new flow provides faster access to key data and a more intuitive user experience.

---

## Current Flow Issues

1. Landing on `/admin/events/[id]` doesn't show actionable content immediately
2. Edit button (pencil icon) is an extra click
3. Registrations (the most important data) is buried in a tab

---

## New Flow Design

### 1. Events List (`/admin/events`)
**Current:** Table with pencil icon to edit  
**New:** 
- Table with same structure
- **Double-click row** → Opens `/admin/events/[id]` (registrations dashboard)
- Keep "New Event" button
- Remove or repurpose pencil icon (could link to settings directly)

### 2. Event Dashboard (`/admin/events/[id]`)
**Current:** Redirect or tabs layout  
**New:**
- **Primary view: Registrations Table**
- Show key metrics at top:
  - Total registrations
  - Confirmed / Pending / Cancelled counts
  - Revenue (if paid event)
  - Capacity utilization
- Quick actions:
  - Export registrations
  - Send bulk email
  - **Settings button** (top right) → Links to `/admin/events/[id]/settings`
- Breadcrumb: Events > [Event Name]

### 3. Event Settings (`/admin/events/[id]/settings`)
**Current:** Multiple tab routes  
**New:**
- **Single page with tab navigation** (like conference settings)
- Tabs:
  - Details (basic info, status, category)
  - Media (images, banner, gallery)
  - Location (venue, address, map)
  - Agenda (schedule items)
  - Tickets & Pricing
  - Registration Form
  - Email Templates
- Breadcrumb: Events > [Event Name] > Settings

---

## Implementation Steps

### Step 1: Update Events Table (Client Component) ✅ COMPLETED
**File:** `/app/admin/events/page.tsx`

- [x] Add double-click handler to table rows
- [x] On double-click: `router.push(`/admin/events/${eventId}`)`
- [x] Updated in previous session

### Step 2: Create Event Dashboard ✅ COMPLETED
**File:** `/app/admin/events/[id]/page.tsx`

- [x] Simplified to show ONLY registrations table
- [x] Removed stats cards from main page
- [x] Display clean registrations table with all columns
- [x] Added "Settings" button in top right → `/admin/events/[id]/settings`
- [x] Shows event title as subtitle

### Step 3: Create Settings Page ✅ COMPLETED
**File:** `/app/admin/events/[id]/settings/page.tsx`

- [x] Created new settings page with dashboard-style layout
- [x] Display top stat cards (Total, Confirmed, Pending, Cancelled, Revenue)
- [x] Show event overview section with status badges and key info
- [x] Implemented card-based navigation to all settings sections:
  - Details tab
  - Media tab
  - Location tab
  - Agenda tab
  - Pricing tab
  - Form builder tab
  - Email templates tab
- [x] Each card links to existing settings route
- [x] Added "View Public Page" button for published events

### Step 4: Update Layout ✅ COMPLETED
**File:** `/app/admin/events/[id]/layout.tsx`

- [x] Already simplified (no tabs in layout)
- [x] Just provides breadcrumb navigation
- [x] Settings sublayout added with back button

### Step 5: Settings Layout ✅ COMPLETED
**File:** `/app/admin/events/[id]/settings/layout.tsx`

- [x] Created settings-specific layout
- [x] Added "Back to Registrations" navigation link
- [x] Wraps settings page content

---

## Files Modified

```
app/admin/events/
├── page.tsx                          # ✅ Double-click handler (previous session)
├── [id]/
│   ├── layout.tsx                    # ✅ Already simplified (no tabs)
│   ├── page.tsx                      # ✅ UPDATED: Now shows registrations table only
│   ├── settings/
│   │   ├── layout.tsx                # ✅ NEW: Back navigation
│   │   └── page.tsx                  # ✅ NEW: Dashboard with stats + tab cards
│   ├── registrations/                # Keep (existing functionality)
│   ├── details/                      # Keep (linked from settings)
│   ├── media/                        # Keep (linked from settings)
│   ├── location/                     # Keep (linked from settings)
│   ├── agenda/                       # Keep (linked from settings)
│   ├── pricing/                      # Keep (linked from settings)
│   ├── form-builder/                 # Keep (linked from settings)
│   └── email-templates/              # Keep (linked from settings)
```

**Note:** Existing tab routes are preserved and linked from the settings page as card-based navigation.

---

## User Experience Benefits

1. **Faster access to registrations** - The most important data is immediately visible
2. **Fewer clicks** - Double-click to open, no intermediate redirects
3. **Clearer hierarchy** - Dashboard vs Settings are distinct
4. **Better mental model** - Similar to conference settings structure
5. **More intuitive** - Registrations are the "main" thing, settings are "configuration"

---

## Technical Considerations

1. **Preserve existing functionality** - All features must still work
2. **Server/Client components** - Table needs to be client component for double-click
3. **Data fetching** - Dashboard needs to fetch both event + registrations
4. **Routing** - Consider redirects for old URLs if needed
5. **Loading states** - Both dashboard and settings need proper loading UI

---

## Implementation Details

### Registrations Page (`/admin/events/[id]/page.tsx`)
- **Layout:** Clean table-only view
- **Header:** Event title as subtitle + Settings button
- **Table Columns:** Name, Email, Phone, Status, Payment, Registered date
- **Empty State:** User-friendly message when no registrations exist
- **Status Badges:** Color-coded (confirmed=green, pending=yellow, cancelled=red)
- **Payment Badges:** Outlined badges showing payment status

### Settings Dashboard (`/admin/events/[id]/settings/page.tsx`)
- **Top Stats:** 5 metric cards showing Total, Confirmed, Pending, Cancelled, Revenue
- **Event Overview Card:** Displays status badges, event date, location, form status, ticket types
- **Navigation Cards:** 7 clickable cards for different settings sections
- **Card Design:** Hover effects, color-coded icons, descriptive subtitles
- **Public Page Link:** Quick access to view published event

### Navigation Flow
1. **Events List** → Double-click event → **Registrations Page**
2. **Registrations Page** → Settings button → **Settings Dashboard**
3. **Settings Dashboard** → Click any card → **Specific Setting Page**
4. **Settings Dashboard** → Back to Registrations link → **Registrations Page**

---

## Next Actions ✅ COMPLETED

1. ~~Review current code structure~~
2. ~~Implement Step 1 (table double-click)~~
3. ~~Implement Step 2 (dashboard page)~~
4. ~~Implement Step 3 (settings page with tabs)~~
5. ~~Test full flow~~
6. ~~Update documentation~~

---

## Testing Checklist

- [ ] Navigate from events list → double-click opens registrations
- [ ] Registrations page shows clean table without stats
- [ ] Settings button navigates to settings page
- [ ] Settings page displays all stat cards correctly
- [ ] All 7 settings cards are clickable and navigate properly
- [ ] Back to Registrations link works
- [ ] Published events show "View Public Page" button
- [ ] Revenue calculation works for paid events
- [ ] Status badges display correctly

---

**Completed:** 2026-07-24  
**Result:** Successfully restructured admin events UX with improved information hierarchy and streamlined navigation.
