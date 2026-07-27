# Admin Events UX - Visual Guide

**Date:** July 24, 2026  
**Purpose:** Visual representation of the new admin events flow

---

## Page 1: Events List (`/admin/events`)

```
┌────────────────────────────────────────────────────────────┐
│  Events                                    [+ New Event]    │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ╔═══════════════════════════════════════════════════════╗ │
│  ║ Title            Date        Category    Status     ✎ ║ │
│  ╠═══════════════════════════════════════════════════════╣ │
│  ║ Summer Workshop  Jul 30     Workshop     Published   ║ │
│  ║ ← Double-click to open                               ║ │
│  ╟───────────────────────────────────────────────────────╢ │
│  ║ Tech Conference  Aug 15     Conference   Draft       ║ │
│  ╟───────────────────────────────────────────────────────╢ │
│  ║ Yoga Session     Aug 20     Wellness     Published   ║ │
│  ╚═══════════════════════════════════════════════════════╝ │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

**Interaction:** Double-click any row → Opens registrations page

---

## Page 2: Registrations (`/admin/events/[id]`)

```
┌────────────────────────────────────────────────────────────┐
│  ← Back to Events                                           │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Registrations                          [⚙️ Settings]      │
│  Summer Workshop                                            │
│                                                             │
│  ╔═══════════════════════════════════════════════════════╗ │
│  ║ Name      Email          Phone    Status    Payment  ║ │
│  ╠═══════════════════════════════════════════════════════╣ │
│  ║ John Doe  john@email     123456   ✓ confirmed  paid  ║ │
│  ╟───────────────────────────────────────────────────────╢ │
│  ║ Jane Smith jane@email    234567   ⏱ pending   unpaid ║ │
│  ╟───────────────────────────────────────────────────────╢ │
│  ║ Bob Wilson bob@email     345678   ✓ confirmed  paid  ║ │
│  ╚═══════════════════════════════════════════════════════╝ │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Clean, focused table view
- Settings button prominently placed
- No distracting stats or cards
- Direct access to registration data

**Interaction:** Click Settings → Opens settings dashboard

---

## Page 3: Settings Dashboard (`/admin/events/[id]/settings`)

```
┌────────────────────────────────────────────────────────────┐
│  ← Back to Registrations                                    │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Event Settings                                             │
│  Summer Workshop                                            │
│                                                             │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐ │
│  │ 👥 Total │ ✓ Conf   │ ⏱ Pend  │ ✕ Canc   │ 💰 Rev   │ │
│  │   25     │   20     │   3      │   2      │ NPR 50K  │ │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Event Overview                                       │   │
│  │                                                      │   │
│  │ [Published] [Workshop] [Paid]                       │   │
│  │                                                      │   │
│  │ 📅 Jul 30, 2026 • 10:00 AM    📍 Community Center   │   │
│  │ 📝 Active (v2)                 🎟️ 3 Active          │   │
│  │                                                      │   │
│  │ [🔗 View Public Page]                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Settings Sections                                          │
│                                                             │
│  ┌────────────┬────────────┬────────────┬────────────┐    │
│  │ 📝 Details │ 🖼️ Media   │ 📍 Location│ 📅 Agenda  │    │
│  │ Basic info │ Images &   │ Venue      │ Schedule & │    │
│  │            │ videos     │ details    │ sessions   │    │
│  └────────────┴────────────┴────────────┴────────────┘    │
│                                                             │
│  ┌────────────┬────────────┬────────────┐                 │
│  │ 🎟️ Tickets │ 📋 Form    │ ✉️ Email   │                 │
│  │ & Pricing  │ Registration│ Templates  │                 │
│  │ Ticket cfg │ Form bld   │ Automated  │                 │
│  └────────────┴────────────┴────────────┘                 │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Comprehensive stats at a glance
- Event overview with all key information
- Card-based navigation to settings sections
- Hover effects on cards
- Quick access to public page

**Interaction:** Click any card → Opens specific settings page

---

## Navigation Flow Diagram

```
┌─────────────────┐
│  Events List    │
│  /admin/events  │
└────────┬────────┘
         │
         │ Double-click
         ↓
┌────────────────────┐
│  Registrations     │ ←────────┐
│  /events/[id]      │          │
└────────┬───────────┘          │
         │                      │
         │ Settings button      │
         ↓                      │
┌────────────────────┐          │
│  Settings          │          │
│  /events/[id]/     │          │
│  settings          │ ─────────┘
└────────┬───────────┘  Back link
         │
         │ Click card
         ↓
┌────────────────────┐
│  Specific Setting  │
│  /events/[id]/     │
│  details           │
│  media             │
│  location          │
│  etc.              │
└────────────────────┘
```

---

## Information Hierarchy

### Level 1: Registrations (Primary)
**Purpose:** Quick access to most important data  
**Content:** Registration records, statuses, payment info  
**Actions:** View data, access settings  

### Level 2: Settings Dashboard (Secondary)
**Purpose:** Configuration and management overview  
**Content:** Stats, overview, navigation to specific settings  
**Actions:** Navigate to detailed settings, view metrics  

### Level 3: Specific Settings (Tertiary)
**Purpose:** Detailed configuration  
**Content:** Form inputs, editors, detailed management  
**Actions:** Edit, save, configure specific aspects  

---

## Color Coding Reference

### Status Badges
- **Published:** 🟢 Green background
- **Draft:** 🔘 Gray background
- **Disabled:** 🟡 Yellow background
- **Archived:** 🔴 Red background

### Registration Status
- **Confirmed:** ✓ Green badge
- **Pending:** ⏱ Yellow badge
- **Cancelled:** ✕ Red badge
- **Expired:** ⊗ Gray badge

### Settings Cards
- **Details:** 🔵 Blue icon
- **Media:** 🟣 Purple icon
- **Location:** 🟢 Green icon
- **Agenda:** 🟠 Orange icon
- **Tickets:** 🩷 Pink icon
- **Form:** 🩵 Teal icon
- **Email:** 🟣 Indigo icon

---

## Mobile Responsiveness

### Small Screens (<640px)
- Stats cards: 1 column
- Settings cards: 1 column
- Table: Horizontal scroll
- Simplified navigation

### Medium Screens (640-1024px)
- Stats cards: 2 columns
- Settings cards: 2 columns
- Full table visible

### Large Screens (>1024px)
- Stats cards: 5 columns
- Settings cards: 4 columns
- Spacious layout

---

## Keyboard Shortcuts (Future Enhancement)

Potential shortcuts for faster navigation:
- `e` - Go to Events list
- `r` - Go to Registrations (when in event)
- `s` - Go to Settings (when in event)
- `/` - Focus search
- `n` - New event
- `Esc` - Go back

---

## Accessibility Features

- **Semantic HTML:** Proper heading hierarchy
- **ARIA Labels:** Descriptive labels for icons
- **Keyboard Navigation:** All interactive elements focusable
- **Color Contrast:** WCAG AA compliant
- **Screen Reader:** Descriptive text for all actions

---

## User Feedback

### Visual Feedback
- Hover states on cards
- Active states on buttons
- Loading states for async operations
- Success/error messages

### State Indicators
- Badge colors for status
- Icons for different states
- Count displays for metrics
- Empty states with helpful messages

---

**Last Updated:** July 24, 2026  
**Version:** 1.0  
**Maintained By:** Development Team
