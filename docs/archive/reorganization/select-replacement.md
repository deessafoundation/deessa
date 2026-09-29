---
title: "Select Replacement â€” FancySelect Migration"
description: "All native <select elements and Radix UI Select components have been replaced with a custom FancySelect component com..."
owner: "deessa Team"
status: archived
category: archived
audience: admin
last_updated: 2026-09-12
---
# Select Replacement â€” FancySelect Migration

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
| `components/conference/step2-participation.tsx` | Role selector â€” native `<select>` â†’ FancySelect |
| `components/conference/step3-additional-info.tsx` | Dietary preferences â€” native `<select>` â†’ FancySelect |

### Events Module

| File | What Changed |
|------|-------------|
| `components/events/admin/EventDetailsForm.tsx` | Event category â€” Radix Select â†’ FancySelect (uncontrolled with `name` + `defaultValue`) |

### Support

| File | What Changed |
|------|-------------|
| `components/support-form.tsx` | Issue type â€” native `<select>` â†’ FancySelect |

### Podcasts

| File | What Changed |
|------|-------------|
| `components/podcasts/episodes-page-content.tsx` | Sort by â€” native `<select>` â†’ FancySelect |
| `components/podcasts/highlights-page-content.tsx` | Episode filter + Sort by â€” 2 native `<select>` â†’ FancySelect |

### Admin â€” Forms

| File | What Changed |
|------|-------------|
| `components/admin/event-form.tsx` | Event type â€” Radix Select â†’ FancySelect (uncontrolled with `name`) |
| `components/admin/partner-form.tsx` | Partner type â€” Radix Select â†’ FancySelect (controlled) |
| `components/admin/project-form.tsx` | Category + Status â€” 2 Radix Select â†’ FancySelect (uncontrolled with `name`) |
| `components/admin/admin-user-form.tsx` | Role â€” Radix Select â†’ FancySelect (uncontrolled with `name`) |
| `components/admin/admin-user-edit-form.tsx` | Role â€” Radix Select â†’ FancySelect (controlled, disabled for self) |
| `components/admin/stat-form.tsx` | Category + Icon + Color â€” 3 Radix Select â†’ FancySelect (controlled) |

### Admin â€” Settings

| File | What Changed |
|------|-------------|
| `components/admin/payment-settings-form.tsx` | Primary provider + Currency â€” 2 Radix Select â†’ FancySelect |
| `components/admin/conference-settings-form.tsx` | Currency â€” native `<select>` â†’ FancySelect |
| `components/admin/notification-center-client.tsx` | Filter â€” Radix Select â†’ FancySelect |

### Admin â€” Conference Form Builder

| File | What Changed |
|------|-------------|
| `components/admin/conference-form-builder/EventSelector.tsx` | Event selector â€” Radix Select â†’ FancySelect (complex JSX options simplified to text) |
| `components/admin/conference-form-builder/FormTemplateChooser.tsx` | Category filter â€” Radix Select â†’ FancySelect |
| `components/admin/conference-form-builder/EnhancedConditionalEditor.tsx` | 7 selects (field, operator, value, logic) â€” all Radix Select â†’ FancySelect |
| `components/admin/form-conditional-editor.tsx` | Depends on + Operator + Value â€” 3 native `<select>` â†’ FancySelect |
| `components/admin/form-field-palette.tsx` | Target step â€” native `<select>` â†’ FancySelect |

### Admin â€” Donations

| File | What Changed |
|------|-------------|
| `components/admin/donations/donations-table-client.tsx` | Status + Type + Currency filters â€” 3 Radix Select â†’ FancySelect |
| `components/admin/donations/review-status-card.tsx` | Review status â€” Radix Select â†’ FancySelect |
| `components/admin/donations/status-change-modal.tsx` | New status â€” Radix Select â†’ FancySelect |

### Admin â€” Payments

| File | What Changed |
|------|-------------|
| `components/admin/payments/payments-table-client.tsx` | Type + Status + Provider filters â€” 3 Radix Select â†’ FancySelect |

### Admin â€” Media

| File | What Changed |
|------|-------------|
| `components/admin/media-library-client.tsx` | Type + Bucket filters â€” 2 Radix Select â†’ FancySelect |

### Admin â€” Support

| File | What Changed |
|------|-------------|
| `components/admin/support/assign-modal.tsx` | Admin selector â€” Radix Select â†’ FancySelect (complex JSX simplified to "Name (role)" text) |

### Admin â€” Rich Text Editor

| File | What Changed |
|------|-------------|
| `components/admin/rich-text-editor/toolbar.tsx` | Heading type + Font size â€” 2 Radix Select â†’ FancySelect (heading uses `variant="toolbar"`) |
| `components/admin/rich-text-editor/image-dialog.tsx` | Alignment + Width â€” 2 Radix Select â†’ FancySelect |

### Admin â€” Homepage Manager

| File | What Changed |
|------|-------------|
| `components/admin/homepage-manager-client.tsx` | Stats icon â€” native `<select>` â†’ FancySelect. Also fixed default icon values to PascalCase |
| `components/admin/homepage-manager/components/TimelineManager.tsx` | Milestone icon â€” native `<select>` â†’ FancySelect |
| `components/admin/homepage-manager/components/HeroCarouselManager.tsx` | CTA button style â€” Radix Select â†’ FancySelect |
| `components/admin/homepage-manager/components/FeaturedStoriesManager.tsx` | Selection mode â€” Radix Select â†’ FancySelect |
| `components/admin/homepage-manager/components/CTACardsManager.tsx` | Card color â€” Radix Select â†’ FancySelect |
| `components/admin/homepage-manager/components/FlagsManager.tsx` | Toolbar position + Featured stories mode â€” 2 Radix Select â†’ FancySelect |
| `components/admin/homepage-manager/components/HeroCTAsManager.tsx` | CTA variant â€” Radix Select â†’ FancySelect |
| `components/admin/homepage-manager/components/MarqueeManager.tsx` | Spacing â€” Radix Select â†’ FancySelect |

### Bugs Fixed

| File | What Changed |
|------|-------------|
| `components/podcasts/episodes-page-content.tsx` | Fixed `sortedEpisodes` â†’ `filteredEpisodes` (pre-existing ReferenceError) |
| `components/admin/homepage-manager-client.tsx` | Fixed default stat icon values from lowercase to PascalCase to match options |

---

## Manual Testing Checklist

### Public-Facing Pages

- [ ] **Conference Registration** â€” `/conference`
  - Step 2: Role dropdown works, selects value, shows selected state
  - Step 3: Dietary preferences dropdown works
  - Navigate back/forth between steps, values persist

- [ ] **Support Form** â€” `/support` (or click "Support" in footer)
  - Issue type dropdown works
  - Submit form with selected issue type

- [ ] **Podcasts â€” Episodes** â€” `/podcasts`
  - Sort by dropdown works (Latest, Oldest, Episode # Highâ†’Low, Episode # Lowâ†’High)
  - Episodes reorder correctly

- [ ] **Podcasts â€” Highlights** â€” `/podcasts/highlights`
  - Episode filter dropdown works (shows all episodes with counts)
  - Sort by dropdown works
  - Both filters work together

- [ ] **Impact Page** â€” `/impact`
  - Stats section renders icons correctly (should show icons, not broken images)

### Admin â€” Events

- [ ] **Events List** â€” `/admin/events`
  - Click "Create Event" or edit existing event
  - Event Type dropdown (Upcoming/Past) works
  - Submit form, value saves correctly

- [ ] **Event Details** â€” `/admin/events/[id]`
  - Category dropdown (Conference/Workshop/Seminar/Meetup/General) works
  - Save event, category persists

### Admin â€” Donations

- [ ] **Donations List** â€” `/admin/donations`
  - Status filter (All/Completed/Pending/Failed) works
  - Type filter (All/Monthly/One-time) works
  - Currency filter (All/NPR/USD/EUR/GBP/INR) works
  - Filters combine correctly
  - Click a donation to view details

- [ ] **Donation Detail** â€” `/admin/donations/[id]`
  - Review status dropdown works (Unreviewed/Verified/Flagged/Refunded)
  - Change status, it saves and updates

- [ ] **Donation Status Change** â€” (modal from donations list)
  - New Status dropdown works (Pending/Completed/Failed/Review)
  - Submit, status updates

### Admin â€” Payments

- [ ] **Payments List** â€” `/admin/payments`
  - Type filter (All/Donation/Event/Conference) works
  - Status filter (All/Paid/Pending/Failed/Refunded) works
  - Provider filter (All/Stripe/Khalti/eSewa) works
  - Filters combine correctly

### Admin â€” Projects

- [ ] **Projects List** â€” `/admin/projects`
  - Click "Create Project" or edit existing
  - Category dropdown (Education/Health/Empowerment/Relief) works
  - Status dropdown (Draft/Active/Urgent/Completed) works
  - Submit form, values save correctly

### Admin â€” Partners

- [ ] **Partners List** â€” `/admin/partners`
  - Click "Create Partner" or edit existing
  - Type dropdown (Partner/Donor/Sponsor) works
  - Submit form, value saves correctly

### Admin â€” Users

- [ ] **Admin Users** â€” `/admin/users`
  - Click "Create User"
  - Role dropdown (Super Admin/Admin/Editor/Finance) works
  - Submit form, role saves correctly

- [ ] **Edit User** â€” `/admin/users/[id]`
  - Role dropdown works
  - If editing own user, role dropdown is disabled
  - Change role, save, verify it persists

### Admin â€” Impact Stats

- [ ] **Impact Stats** â€” `/admin/stats`
  - Click "Create Stat" or edit existing
  - Display Category dropdown (Homepage/Impact Page) works
  - Icon dropdown works (shows correct icon names)
  - Color dropdown works (shows color names)
  - Submit form, values save correctly

### Admin â€” Payment Settings

- [ ] **Payment Settings** â€” `/admin/settings` (or wherever payment config lives)
  - Primary provider dropdown works (shows enabled providers)
  - Default currency dropdown (USD/NPR) works
  - Save settings, values persist

### Admin â€” Conference Settings

- [ ] **Conference Settings** â€” `/admin/conference/settings`
  - Currency dropdown (NPR/USD/EUR/GBP/INR) works
  - Save settings, value persists

### Admin â€” Notifications

- [ ] **Notification Center** â€” `/admin/notifications`
  - Filter dropdown (All/Unread/Read/Assignments/Mentions/Replies/Status Changes/System) works
  - Notifications filter correctly

### Admin â€” Conference Form Builder

- [ ] **Form Builder** â€” `/admin/conference/form-builder`
  - Event selector dropdown works (shows event titles with dates)
  - Select an event, form loads
  - Category filter in template chooser works
  - Conditional logic editor: Field, Operator, Value dropdowns all work
  - Advanced mode: AND/OR toggle works, condition fields work
  - Add/remove conditions, values persist

### Admin â€” Media Library

- [ ] **Media Library** â€” `/admin/media`
  - Type filter (All/Images/Videos/Documents) works
  - Bucket filter (All/[bucket names]) works
  - Filters combine correctly

### Admin â€” Support Admin

- [ ] **Support Tickets** â€” `/admin/support`
  - Click a ticket, click "Assign"
  - Admin dropdown shows list of admins with roles
  - Select admin, assign, verify it saves

### Admin â€” Rich Text Editor

- [ ] **Any page with rich text editor** â€” (e.g., edit a project, partner, or event description)
  - Heading type dropdown (Paragraph/H1/H2/H3/H4) works
  - Font size dropdown (12pxâ€“32px) works
  - Select text, change heading, verify it applies
  - Select text, change font size, verify it applies

- [ ] **Insert image in rich text editor**
  - Alignment dropdown (Left/Center/Right) works
  - Width dropdown (Small/Medium/Full) works
  - Insert image, verify alignment and width apply

### Admin â€” Homepage Manager

- [ ] **Homepage Manager** â€” `/admin/homepage`
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
