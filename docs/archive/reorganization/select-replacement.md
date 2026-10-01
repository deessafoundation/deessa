---
title: "Select Replacement — FancySelect Migration"
description: "All native <select elements and Radix UI Select components have been replaced with a custom FancySelect component com..."
owner: "deessa Team"
status: archived
category: archived
audience: admin
last_updated: 2026-09-12
---
# Select Replacement — FancySelect Migration

All native `<select>` elements and Radix UI `Select` components have been replaced with a custom `FancySelect` component (`components/ui/fancy-select.tsx`).

## FancySelect API

```tsx
<FancySelect
  value={string}              // controlled
  defaultValue={string}       // uncontrolled
  onValueChange={(v) => {}}   // callback
  options={[{ value, label, disabled? }]}
  placeholder={string}
  disabled={boolean}
  name={string}               // renders hidden <input> for form submission
  size="sm" | "default" | "lg"
  variant="default" | "toolbar"
  className={string}
/>
```

---

## Files Modified

### Conference Module

| File | What Changed |
|------|-------------|
| `components/conference/step2-participation.tsx` | Role selector — native `<select>` → FancySelect |
| `components/conference/step3-additional-info.tsx` | Dietary preferences — native `<select>` → FancySelect |

### Events Module

| File | What Changed |
|------|-------------|
| `components/events/admin/EventDetailsForm.tsx` | Event category — Radix Select → FancySelect (uncontrolled with `name` + `defaultValue`) |

### Support

| File | What Changed |
|------|-------------|
| `components/support-form.tsx` | Issue type — native `<select>` → FancySelect |

### Podcasts

| File | What Changed |
|------|-------------|
| `components/podcasts/episodes-page-content.tsx` | Sort by — native `<select>` → FancySelect |
| `components/podcasts/highlights-page-content.tsx` | Episode filter + Sort by — 2 native `<select>` → FancySelect |

### Admin — Forms

| File | What Changed |
|------|-------------|
| `components/admin/event-form.tsx` | Event type — Radix Select → FancySelect (uncontrolled with `name`) |
| `components/admin/partner-form.tsx` | Partner type — Radix Select → FancySelect (controlled) |
| `components/admin/project-form.tsx` | Category + Status — 2 Radix Select → FancySelect (uncontrolled with `name`) |
| `components/admin/admin-user-form.tsx` | Role — Radix Select → FancySelect (uncontrolled with `name`) |
| `components/admin/admin-user-edit-form.tsx` | Role — Radix Select → FancySelect (controlled, disabled for self) |
| `components/admin/stat-form.tsx` | Category + Icon + Color — 3 Radix Select → FancySelect (controlled) |

### Admin — Settings

| File | What Changed |
|------|-------------|
| `components/admin/payment-settings-form.tsx` | Primary provider + Currency — 2 Radix Select → FancySelect |
| `components/admin/conference-settings-form.tsx` | Currency — native `<select>` → FancySelect |
| `components/admin/notification-center-client.tsx` | Filter — Radix Select → FancySelect |

### Admin — Conference Form Builder

| File | What Changed |
|------|-------------|
| `components/admin/conference-form-builder/EventSelector.tsx` | Event selector — Radix Select → FancySelect (complex JSX options simplified to text) |
| `components/admin/conference-form-builder/FormTemplateChooser.tsx` | Category filter — Radix Select → FancySelect |
| `components/admin/conference-form-builder/EnhancedConditionalEditor.tsx` | 7 selects (field, operator, value, logic) — all Radix Select → FancySelect |
| `components/admin/form-conditional-editor.tsx` | Depends on + Operator + Value — 3 native `<select>` → FancySelect |
| `components/admin/form-field-palette.tsx` | Target step — native `<select>` → FancySelect |

### Admin — Donations

| File | What Changed |
|------|-------------|
| `components/admin/donations/donations-table-client.tsx` | Status + Type + Currency filters — 3 Radix Select → FancySelect |
| `components/admin/donations/review-status-card.tsx` | Review status — Radix Select → FancySelect |
| `components/admin/donations/status-change-modal.tsx` | New status — Radix Select → FancySelect |

### Admin — Payments

| File | What Changed |
|------|-------------|
| `components/admin/payments/payments-table-client.tsx` | Type + Status + Provider filters — 3 Radix Select → FancySelect |

### Admin — Media

| File | What Changed |
|------|-------------|
| `components/admin/media-library-client.tsx` | Type + Bucket filters — 2 Radix Select → FancySelect |

### Admin — Support

| File | What Changed |
|------|-------------|
| `components/admin/support/assign-modal.tsx` | Admin selector — Radix Select → FancySelect (complex JSX simplified to "Name (role)" text) |

### Admin — Rich Text Editor

| File | What Changed |
|------|-------------|
| `components/admin/rich-text-editor/toolbar.tsx` | Heading type + Font size — 2 Radix Select → FancySelect (heading uses `variant="toolbar"`) |
| `components/admin/rich-text-editor/image-dialog.tsx` | Alignment + Width — 2 Radix Select → FancySelect |

### Admin — Homepage Manager

| File | What Changed |
|------|-------------|
| `components/admin/homepage-manager-client.tsx` | Stats icon — native `<select>` → FancySelect. Also fixed default icon values to PascalCase |
| `components/admin/homepage-manager/components/TimelineManager.tsx` | Milestone icon — native `<select>` → FancySelect |
| `components/admin/homepage-manager/components/HeroCarouselManager.tsx` | CTA button style — Radix Select → FancySelect |
| `components/admin/homepage-manager/components/FeaturedStoriesManager.tsx` | Selection mode — Radix Select → FancySelect |
| `components/admin/homepage-manager/components/CTACardsManager.tsx` | Card color — Radix Select → FancySelect |
| `components/admin/homepage-manager/components/FlagsManager.tsx` | Toolbar position + Featured stories mode — 2 Radix Select → FancySelect |
| `components/admin/homepage-manager/components/HeroCTAsManager.tsx` | CTA variant — Radix Select → FancySelect |
| `components/admin/homepage-manager/components/MarqueeManager.tsx` | Spacing — Radix Select → FancySelect |

### Bugs Fixed

| File | What Changed |
|------|-------------|
| `components/podcasts/episodes-page-content.tsx` | Fixed `sortedEpisodes` → `filteredEpisodes` (pre-existing ReferenceError) |
| `components/admin/homepage-manager-client.tsx` | Fixed default stat icon values from lowercase to PascalCase to match options |

---

## Manual Testing Checklist

### Public-Facing Pages

- [ ] **Conference Registration** — `/conference`
  - Step 2: Role dropdown works, selects value, shows selected state
  - Step 3: Dietary preferences dropdown works
  - Navigate back/forth between steps, values persist

- [ ] **Support Form** — `/support` (or click "Support" in footer)
  - Issue type dropdown works
  - Submit form with selected issue type

- [ ] **Podcasts — Episodes** — `/podcasts`
  - Sort by dropdown works (Latest, Oldest, Episode # High→Low, Episode # Low→High)
  - Episodes reorder correctly

- [ ] **Podcasts — Highlights** — `/podcasts/highlights`
  - Episode filter dropdown works (shows all episodes with counts)
  - Sort by dropdown works
  - Both filters work together

- [ ] **Impact Page** — `/impact`
  - Stats section renders icons correctly (should show icons, not broken images)

### Admin — Events

- [ ] **Events List** — `/admin/events`
  - Click "Create Event" or edit existing event
  - Event Type dropdown (Upcoming/Past) works
  - Submit form, value saves correctly

- [ ] **Event Details** — `/admin/events/[id]`
  - Category dropdown (Conference/Workshop/Seminar/Meetup/General) works
  - Save event, category persists

### Admin — Donations

- [ ] **Donations List** — `/admin/donations`
  - Status filter (All/Completed/Pending/Failed) works
  - Type filter (All/Monthly/One-time) works
  - Currency filter (All/NPR/USD/EUR/GBP/INR) works
  - Filters combine correctly
  - Click a donation to view details

- [ ] **Donation Detail** — `/admin/donations/[id]`
  - Review status dropdown works (Unreviewed/Verified/Flagged/Refunded)
  - Change status, it saves and updates

- [ ] **Donation Status Change** — (modal from donations list)
  - New Status dropdown works (Pending/Completed/Failed/Review)
  - Submit, status updates

### Admin — Payments

- [ ] **Payments List** — `/admin/payments`
  - Type filter (All/Donation/Event/Conference) works
  - Status filter (All/Paid/Pending/Failed/Refunded) works
  - Provider filter (All/Stripe/Khalti/eSewa) works
  - Filters combine correctly

### Admin — Projects

- [ ] **Projects List** — `/admin/projects`
  - Click "Create Project" or edit existing
  - Category dropdown (Education/Health/Empowerment/Relief) works
  - Status dropdown (Draft/Active/Urgent/Completed) works
  - Submit form, values save correctly

### Admin — Partners

- [ ] **Partners List** — `/admin/partners`
  - Click "Create Partner" or edit existing
  - Type dropdown (Partner/Donor/Sponsor) works
  - Submit form, value saves correctly

### Admin — Users

- [ ] **Admin Users** — `/admin/users`
  - Click "Create User"
  - Role dropdown (Super Admin/Admin/Editor/Finance) works
  - Submit form, role saves correctly

- [ ] **Edit User** — `/admin/users/[id]`
  - Role dropdown works
  - If editing own user, role dropdown is disabled
  - Change role, save, verify it persists

### Admin — Impact Stats

- [ ] **Impact Stats** — `/admin/stats`
  - Click "Create Stat" or edit existing
  - Display Category dropdown (Homepage/Impact Page) works
  - Icon dropdown works (shows correct icon names)
  - Color dropdown works (shows color names)
  - Submit form, values save correctly

### Admin — Payment Settings

- [ ] **Payment Settings** — `/admin/settings` (or wherever payment config lives)
  - Primary provider dropdown works (shows enabled providers)
  - Default currency dropdown (USD/NPR) works
  - Save settings, values persist

### Admin — Conference Settings

- [ ] **Conference Settings** — `/admin/conference/settings`
  - Currency dropdown (NPR/USD/EUR/GBP/INR) works
  - Save settings, value persists

### Admin — Notifications

- [ ] **Notification Center** — `/admin/notifications`
  - Filter dropdown (All/Unread/Read/Assignments/Mentions/Replies/Status Changes/System) works
  - Notifications filter correctly

### Admin — Conference Form Builder

- [ ] **Form Builder** — `/admin/conference/form-builder`
  - Event selector dropdown works (shows event titles with dates)
  - Select an event, form loads
  - Category filter in template chooser works
  - Conditional logic editor: Field, Operator, Value dropdowns all work
  - Advanced mode: AND/OR toggle works, condition fields work
  - Add/remove conditions, values persist

### Admin — Media Library

- [ ] **Media Library** — `/admin/media`
  - Type filter (All/Images/Videos/Documents) works
  - Bucket filter (All/[bucket names]) works
  - Filters combine correctly

### Admin — Support Admin

- [ ] **Support Tickets** — `/admin/support`
  - Click a ticket, click "Assign"
  - Admin dropdown shows list of admins with roles
  - Select admin, assign, verify it saves

### Admin — Rich Text Editor

- [ ] **Any page with rich text editor** — (e.g., edit a project, partner, or event description)
  - Heading type dropdown (Paragraph/H1/H2/H3/H4) works
  - Font size dropdown (12px–32px) works
  - Select text, change heading, verify it applies
  - Select text, change font size, verify it applies

- [ ] **Insert image in rich text editor**
  - Alignment dropdown (Left/Center/Right) works
  - Width dropdown (Small/Medium/Full) works
  - Insert image, verify alignment and width apply

### Admin — Homepage Manager

- [ ] **Homepage Manager** — `/admin/homepage`
  - **Hero Carousel**: CTA Button Style dropdown (Primary/Secondary) works
  - **Featured Stories**: Selection Mode dropdown works
  - **CTA Cards**: Color dropdown (Orange/Teal/White/Purple/Blue) works
  - **Flags**: Toolbar Position dropdown works (when accessibility toolbar enabled)
  - **Flags**: Featured Stories Mode dropdown works
  - **Hero CTAs**: Variant dropdown (Primary/Secondary/Outline) works
  - **Marquee**: Spacing dropdown (Compact/Comfortable/Spacious) works
  - **Stats Section**: Icon dropdown works (Users/Heart/TrendingUp/BookOpen)
  - **Timeline**: Milestone icon dropdown works
  - Save each section, verify values persist

---

## Total Replacements

| Type | Count |
|------|-------|
| Native `<select>` elements | 11 |
| Radix `Select` components | 37 |
| **Total** | **48** |

| Module | Files Changed |
|--------|---------------|
| Conference | 2 |
| Events | 1 |
| Support | 1 |
| Podcasts | 2 |
| Admin forms | 6 |
| Admin settings | 3 |
| Conference builder | 5 |
| Donations | 3 |
| Payments | 1 |
| Media | 1 |
| Support admin | 1 |
| Rich text editor | 2 |
| Homepage manager | 8 |
| **Total files** | **36** |
