# Admin Dashboard Upgrade — Task Plan

> **Goal:** Transform the basic stat-card dashboard into a data-rich, actionable command center that lets admins make fast, informed decisions.

**Tech stack:** Recharts v3.10, `components/ui/chart.tsx` (ChartContainer/ChartTooltip), shadcn Card/Badge/Tabs/Progress, Supabase PostgreSQL, TipTap rich text editor, Framer Motion.

---

## Phase 1 — Stat Card Enhancements (Trend Indicators)

> Quick win. Gives every number context without new data sources.

### Tasks

- [x] **1.1** Create server action `getDashboardTrends()` in `lib/actions/admin-dashboard.ts`
- [x] **1.2** Create `DashboardStatCard` client component in `components/admin/dashboard/`
  - Accept props: `title`, `value`, `icon`, `href`, `color`, `trend`
  - Render trend badge: green `↑ +12%` or red `↓ -5%` next to the value
  - Uses `TrendingUp` / `TrendingDown` / `Minus` icons from lucide-react
  - Hover animation on the card
- [x] **1.3** Refactor `app/admin/page.tsx` stat cards to use `DashboardStatCard`
  - Pass trend data from `getDashboardTrends()` into each card
  - Role-based filtering logic preserved
- [x] **1.4** Add skeleton loading states for stat cards using `components/ui/skeleton.tsx`

---

## Phase 2 — Donation Trend Chart (Recharts)

> High-impact visual. Shows financial health at a glance.

### Tasks

- [x] **2.1** Create server action for donation trend data in `lib/actions/admin-dashboard.ts`
  - Queries `donations` table for date-grouped data
  - Returns `Array<{ date: string, amount: number, count: number }>`
- [x] **2.2** Create `DonationTrendChart` client component in `components/admin/dashboard/`
  - Uses `ChartContainer` + `ChartTooltip` + `ChartTooltipContent` from `components/ui/chart.tsx`
  - Renders an `AreaChart` (Recharts) with gradient fill
  - Dual metrics: donation amount (line) + count (area)
  - X-axis: dates, Y-axis: amount in NPR
  - Tooltip showing formatted date + amount + count on hover
- [x] **2.3** Add tab switcher: `7 Days | 30 Days | 90 Days` using shadcn `Tabs`
- [x] **2.4** Render `DonationTrendChart` in `app/admin/page.tsx`
  - Shows only for roles with `canViewFinance()` permission

---

## Phase 3 — Content Activity Chart

> Shows content creation velocity — are we publishing enough?

### Tasks

- [x] **3.1** Create server action for content activity data
  - Queries `activity_logs` for CREATE actions grouped by entity_type and date
  - Returns `Array<{ date: string, projects: number, events: number, stories: number }>`
- [x] **3.2** Create `ContentActivityChart` client component in `components/admin/dashboard/`
  - Uses `ChartContainer` + Recharts `BarChart` (stacked)
  - Color-coded bars per content type
  - Legend and tooltip with breakdown
- [x] **3.3** Place chart in dashboard
  - Shows only for roles with content permissions

---

## Phase 4 — Payment Provider Breakdown (Donut Chart)

> Quick insight into which payment channels are performing.

### Tasks

- [x] **4.1** Create server action for provider breakdown data
  - Queries `donations` grouped by provider (Stripe/Khalti/eSewa)
  - Returns `Array<{ provider: string, count: number, amount: number, color: string }>`
- [x] **4.2** Create `ProviderBreakdownChart` client component
  - Uses Recharts `PieChart` with `Pie` + `Cell` + `Label`
  - Color-coded segments (purple=Stripe, green=eSewa, blue=Khalti)
  - Legend below chart
  - Shows only for `canViewFinance()` roles
- [x] **4.3** Add to dashboard in grid layout

---

## Phase 5 — Pending Action Items (Priority Queue)

> Turn passive counts into an actionable to-do list.

### Tasks

- [x] **5.1** Create server action `getPendingActions()` in `lib/actions/admin-dashboard.ts`
  - Fetches pending volunteer applications, unread/urgent contact messages, pending donation reviews
  - Returns `Array<{ type: string, title: string, subtitle: string, href: string, priority: 'high' | 'medium' | 'low' }>`
- [x] **5.2** Create `PendingActions` client component in `components/admin/dashboard/`
  - Renders as a card with a list of items
  - Each item shows: icon (colored by type), title, subtitle, priority badge
  - Clickable — navigates to the relevant admin page
  - "View All" link at the bottom
  - Empty state: "All caught up! No pending actions."
- [x] **5.3** Replace the existing Quick Actions card with `PendingActions`

---

## Phase 6 — Activity Feed Visual Upgrade

> Make the activity feed scannable and navigable.

### Tasks

- [x] **6.1** Create `ActivityFeed` client component in `components/admin/dashboard/`
  - Accept `activities: ActivityLog[]` prop
  - Color-coded action icons (CREATE → green, UPDATE → blue, DELETE → red)
  - Entity type rendered as a `Badge` with distinct colors per type
  - Entity name linked to the actual record page
  - Relative time display
  - Show max 8 items with "Show More" expand button
- [x] **6.2** Create `formatRelativeTime()` helper
  - Input: ISO date string
  - Output: "just now", "5m ago", "2h ago", "3d ago", "1mo ago"
- [x] **6.3** Replace existing activity rendering with `<ActivityFeed />`

---

## Phase 7 — Role-Based Dashboard Sections

> Different views for different roles — each sees what matters to them.

### Tasks

- [x] **7.1** Restructure `app/admin/page.tsx` into sections
  - Common: Welcome header, stat cards (filtered by role)
  - Finance section: Donation trend chart, provider breakdown (SUPER_ADMIN, ADMIN, FINANCE)
  - Content section: Content activity chart (SUPER_ADMIN, ADMIN, EDITOR)
  - Admin section: System health (SUPER_ADMIN only)
- [x] **7.2** Create `DashboardSection` wrapper component (implicit in dashboard layout)
  - Visible based on role permissions
- [x] **7.3** Create `SystemHealthCard` for SUPER_ADMIN
  - Payment success rate (receipt & email success rates)
  - Links to `/admin/payments/monitoring`

---

## Phase 8 — Date Range Filter

> Let admins zoom into specific time periods.

### Tasks

- [x] **8.1** Create `DashboardDateFilter` client component in `components/admin/dashboard/`
  - Preset buttons: `7D | 30D | 90D | YTD | All`
  - Uses URL search params (`?range=30d`) to persist selection
- [x] **8.2** Wire date range into dashboard data-fetching functions
- [x] **8.3** Place filter in the welcome header row

---

## Phase 9 — Polish & Performance

> Final touches for a production-ready dashboard.

### Tasks

- [x] **9.1** Add skeleton loading states for chart cards
  - Uses Suspense boundaries around all charts
- [x] **9.2** Add entrance animations
  - Uses Framer Motion for stat cards and dashboard elements
- [x] **9.3** Add responsive breakpoints
  - Mobile: single column, charts stacked
  - Tablet: 2-column grid for charts
  - Desktop: full layout with side-by-side charts
- [ ] **9.4** Performance optimization
  - Ensure all Supabase queries use `select` with specific columns (not `*` where possible)
  - Add proper indexes hint in comments for: `donations(created_at)`, `activity_logs(created_at)`, `activity_logs(entity_type)`
  - Consider `Promise.all` for parallel data fetching in server component
- [ ] **9.5** Add proper error boundaries
  - Wrap each chart in a try/catch or error boundary
  - Show graceful fallback if a chart fails to load

---

## Phase 10 — Additional Dashboard Widgets (Built Beyond Original Plan)

> Extended dashboard with additional analytics widgets for deeper insights.

### Tasks

- [x] **10.1** `FundraisingProgressChart` — Shows fundraising goal progress as a radial/bar chart
- [x] **10.2** `VolunteerSkillsChart` — Volunteer skills distribution visualization
- [x] **10.3** `MonthlyVsOnetimeChart` — Compares monthly vs one-time donor segments
- [x] **10.4** `EventCapacityChart` — Event capacity utilization across events
- [x] **10.5** `DonationByCategoryChart` — Donations broken down by project category

---

## Phase 11 — CMS Hub (Built Beyond Original Plan)

> Centralized content management interface for all site content.

### Tasks

- [x] **11.1** Create `/admin/cms` — CMS Launchpad page
  - Visual grouped interface with 4 workflow groups: Foundation, Publishing, Community, Governance
  - Permission-filtered module cards
- [x] **11.2** Homepage Manager (`/admin/homepage`)
  - 14 section managers: Hero, Carousel, Stats, Programs, Timeline, Testimonials, Story, What We Do, Trust Indicators, Featured Stories, CTAs, Marquee, Flags, SEO, Banners
  - 17 dedicated components under `components/admin/homepage-manager/`
- [x] **11.3** About Page Manager (`/admin/about`)
  - Hero, Who We Are intro, How We Do It sections
  - `AboutManagerClient` component
- [x] **11.4** Media Library (`/admin/media`)
  - Browse/manage images, videos, documents across Supabase storage buckets
  - `MediaLibraryClient`, `MediaPicker`, `GalleryManager`, `FileUpload`, `VideoPicker` components

---

## Phase 12 — Rich Text Editor (Built Beyond Original Plan)

> Custom TipTap-based editor for content creation across the admin.

### Tasks

- [x] **12.1** Create `RichTextEditor` component in `components/admin/rich-text-editor.tsx`
  - TipTap-based with custom extensions
- [x] **12.2** Build toolbar and bubble toolbar
  - `toolbar.tsx` — Formatting toolbar
  - `bubble-toolbar.tsx` — Floating bubble toolbar
- [x] **12.3** Build slash command menu
  - `slash-menu.tsx` — `/` command menu for inserting blocks
  - `extensions/slash-command.tsx` — Slash command extension
- [x] **12.4** Build dialog inserters
  - `image-dialog.tsx` — Image insert
  - `video-dialog.tsx` — Video embed (YouTube)
  - `link-dialog.tsx` — Link insert
  - `table-dialog.tsx` — Table insert
- [x] **12.5** Build custom TipTap extensions
  - `extensions/custom-image.ts` — Custom image extension
  - `extensions/callout.ts` — Callout block
  - `extensions/highlight-quote.ts` — Highlight quote
  - `extensions/text-style-with-font-size.ts` — Font size extension
  - `extensions/two-column.ts` — Two-column layout
- [x] **12.6** Build editor hooks
  - `hooks/use-autosave.ts` — Autosave with debounce
  - `hooks/use-unsaved-changes.ts` — Unsaved changes warning

---

## Phase 13 — Program Sections CMS (Built Beyond Original Plan)

> Composable section-based system for building program pages.

### Tasks

- [x] **13.1** Create program sections orchestrator
  - `components/admin/program-sections/index.tsx` — Main orchestrator
  - `types.ts` — Section type definitions
  - `useSectionState.ts` — Section state management hook
  - `section-actions.ts` — Server actions for sections
- [x] **13.2** Build section list and type picker
  - `SectionList.tsx` — Draggable section list
  - `SortableSectionCard.tsx` — Sortable section card
  - `SectionTypePicker.tsx` — Section type selector
  - `SectionPropertiesPanel.tsx` — Section properties editor
- [x] **13.3** Build 12+ section form types
  - `forms/SectionFormFactory.tsx` — Dynamic form factory
  - Forms: RichText, Stats, Gallery, Features, FAQ, CTA, Activities, Steps, Quote, Resources, ProgressTracker, WhoWeSupport
- [x] **13.4** Build asset picker
  - `AssetPicker.tsx` — Asset picker for sections
  - `program-id-context.tsx` — Program ID context

---

## Phase 14 — Form Builder (Built Beyond Original Plan)

> Drag-and-drop form builder for event and conference registrations.

### Tasks

- [x] **14.1** Create form builder components
  - `form-canvas.tsx` — Drag-and-drop form canvas
  - `form-field-palette.tsx` — Available field types palette
  - `form-field-editor.tsx` — Individual field editor
- [x] **14.2** Build conditional logic
  - `form-conditional-editor.tsx` — Conditional logic editor
- [x] **14.3** Build multi-step support
  - `form-step-editor.tsx` — Multi-step form editor
- [x] **14.4** Build form preview
  - `form-preview.tsx` — Form preview renderer
- [x] **14.5** Conference-specific form builder
  - `components/admin/conference-form-builder.tsx` — Main conference form builder
  - `EventSelector.tsx`, `FormTemplateChooser.tsx`, `FormSchemaViewer.tsx`, `EnhancedConditionalEditor.tsx`

---

## Phase 15 — Event Management System (Built Beyond Original Plan)

> Full-featured event management with registration, payments, and media.

### Tasks

- [x] **15.1** Event CRUD pages
  - `/admin/events` — List with search, stats, pagination
  - `/admin/events/new` — Create event
  - `/admin/events/[id]` — Event detail with tabs
- [x] **15.2** Event detail sub-pages
  - `/admin/events/[id]/details` — Event details
  - `/admin/events/[id]/registrations` — Registration list
  - `/admin/events/[id]/registrations/[registrationId]` — Individual registration
  - `/admin/events/[id]/agenda` — Agenda management
  - `/admin/events/[id]/settings` — Event settings
  - `/admin/events/[id]/location` — Location management
  - `/admin/events/[id]/media` — Event media
  - `/admin/events/[id]/pricing` — Ticket pricing
  - `/admin/events/[id]/email-templates` — Email templates
  - `/admin/events/[id]/form-builder` — Registration form builder
- [x] **15.3** Event API routes
  - `/api/admin/events/[id]/settings` — GET/PUT
  - `/api/admin/events/[id]/form-schema` — GET/PUT
  - `/api/admin/events/[id]/pricing` — GET/PUT
  - `/api/admin/events/[id]/register-button` — PUT
  - `/api/admin/events/[id]/email-templates` — GET/PUT
  - `/api/admin/events/[id]/agenda` — GET/PUT
  - `/api/events/start-payment`, `/api/events/confirm-stripe-session`, `/api/events/verify-registration`, `/api/events/resend-payment-link`, `/api/events/upload-payment-screenshot`, `/api/events/status`

---

## Phase 16 — Conference Management System (Built Beyond Original Plan)

> Full conference registration management with custom forms, payments, and analytics.

### Tasks

- [x] **16.1** Conference pages
  - `/admin/conference` — Registration table with stats, CSV export
  - `/admin/conference/[id]` — Individual registration detail
  - `/admin/conference/forms` — Form builder
  - `/admin/conference/settings` — Settings page
  - `/admin/conference/settings/form-builder` — Form builder settings
- [x] **16.2** Conference components
  - `conference-settings-form.tsx` — Settings form
  - `conference-quick-actions.tsx` — Quick actions
  - `conference-notes.tsx` — Notes
  - `conference-status-actions.tsx` — Status management
- [x] **16.3** Conference API routes
  - `/api/conference/start-payment`, `/api/conference/confirm-stripe-session`, `/api/conference/verify-registration`, `/api/conference/resend-payment-link`, `/api/conference/status`
  - `/api/admin/conference/export` — CSV export

---

## Phase 17 — Payment & Donation System (Built Beyond Original Plan)

> Unified payment management with multi-provider support, review workflows, and monitoring.

### Tasks

- [x] **17.1** Donations pages
  - `/admin/donations` — Donations list with stats, filters
  - `/admin/donations/[id]` — Individual donation detail
  - `/admin/donations/review` — Review donations requiring verification
  - `/admin/donations/review/audit` — Audit trail
- [x] **17.2** Donations components (13 files)
  - `donations-table-client.tsx` — Table with filters/pagination
  - `transaction-detail-client.tsx` — Transaction detail view
  - `transaction-header.tsx`, `transaction-overview.tsx` — Transaction display
  - `status-change-modal.tsx` — Status change modal
  - `review-dashboard-client.tsx` — Review dashboard
  - `review-action-dialog.tsx`, `review-status-card.tsx`, `review-notes-section.tsx` — Review workflow
  - `donor-information.tsx` — Donor info
  - `payment-technical.tsx` — Technical payment details
  - `activity-timeline.tsx` — Donation activity timeline
  - `error-boundary.tsx` — Error boundary
- [x] **17.3** Unified payments pages
  - `/admin/payments` — Cross-module payment view (donations, events, conferences)
  - `/admin/payments/[id]` — Individual payment detail
  - `/admin/payments/metrics` — 30-day daily donation chart, provider breakdown, failure rates
  - `/admin/payments/alerts` — Stuck donations, review-required, receipt/email failures
  - `/admin/payments/logs` — Searchable/filterable payment event log
  - `/admin/payments/system` — System health (DB latency, env vars, stuck counts)
  - `/admin/payments/monitoring` — Post-payment monitoring (receipt & email success rates)
  - `/admin/payments/operations` — Payment operations
  - `/admin/payments/emails/failed` — Failed emails
  - `/admin/payments/receipts/failed` — Failed receipts
- [x] **17.4** Payment components
  - `payments-table-client.tsx` — Unified payments table
  - `payment-detail-client.tsx` — Payment detail view
- [x] **17.5** Payment API routes
  - Provider routes: `/api/payments/stripe/verify`, `/api/payments/stripe/status`, `/api/payments/khalti/verify`, `/api/payments/khalti/status`, `/api/payments/esewa/success`, `/api/payments/esewa/status`, `/api/payments/esewa/failure`
  - Webhook routes: `/api/webhooks/stripe`, `/api/webhooks/stripe/test`, `/api/webhooks/khalti`
- [x] **17.6** Cron & monitoring routes
  - `/api/cron/reconcile-payments`, `/api/cron/expire-conference-registrations`, `/api/cron/check-review-escalations`, `/api/cron/check-failure-rates`, `/api/cron/check-stuck-donations`
  - `/api/monitoring/metrics`, `/api/health`
- [x] **17.7** Server actions
  - `lib/actions/admin-payments.ts` — Payment management actions
  - `lib/actions/admin-payment-actions.ts` — Payment-specific actions
  - `lib/actions/admin-donation-actions.ts` — Donation-specific actions
  - `lib/actions/admin-donation-review.ts` — Donation review workflow

---

## Phase 18 — Engagement & Community (Built Beyond Original Plan)

> Volunteer management, contacts, support system, and newsletter.

### Tasks

- [x] **18.1** Volunteers page (`/admin/volunteers`)
  - Stats cards (pending/approved/total)
  - Table with skills, approve/reject actions
  - Server action: `lib/actions/admin-volunteers.ts`
- [x] **18.2** Contacts page (`/admin/contacts`)
  - Table of all contact form submissions
- [x] **18.3** Support system
  - `/admin/support` — Bug reports, feature requests with screenshots
  - `/admin/support/[id]` — Individual report detail
  - Components: `support-detail-client.tsx`, `assign-modal.tsx`, `delete-support-button.tsx`, `show-archived-button.tsx`, `support-actions.tsx`, `support-toggle.tsx`, `support-toggle-modal.tsx`, `support-screenshot-modal.tsx`
  - API routes: `/api/admin/support/[id]`, `/api/admin/support/actions`, `/api/admin/support/signed`, `/api/admin/support/export`
- [x] **18.4** Newsletter page (`/admin/newsletter`)
  - Active/total stats, subscriber table

---

## Phase 19 — Notifications System (Built Beyond Original Plan)

> Real-time notification system with bell and center.

### Tasks

- [x] **19.1** Notification bell
  - `notification-bell.tsx` — Bell icon with count
  - `notification-bell-realtime.tsx` — Real-time updates via Supabase realtime
- [x] **19.2** Notification center (`/admin/notifications`)
  - `notification-center-client.tsx` — Full notification center with mark-all-read
- [x] **19.3** Notification API routes
  - `/api/admin/notifications` — GET
  - `/api/admin/notifications/[id]` — PATCH
  - `/api/admin/notifications/mark-all-read` — POST

---

## Phase 20 — Settings & Administration (Built Beyond Original Plan)

> Site settings, user management, and profile.

### Tasks

- [x] **20.1** Settings pages
  - `/admin/settings` — 3-tab interface (Site Settings, Payment Settings, Organization)
  - `/admin/settings/organization` — Organization settings sub-page
  - `/admin/settings/payments` — Payment settings sub-page
- [x] **20.2** Settings components
  - `settings-tabs.tsx` — 3-tab layout
  - `site-settings-form.tsx` — General site settings
  - `payment-settings-form.tsx` — Payment provider configuration
  - `organization-settings-form.tsx` — Organization details
- [x] **20.3** User management
  - `/admin/users` — Admin users table (SUPER_ADMIN only create)
  - `/admin/users/new` — Create admin user
  - `/admin/users/[id]` — Edit admin user
  - Components: `admin-user-form.tsx`, `admin-user-edit-form.tsx`
  - Server action: `lib/actions/admin-users.ts`
- [x] **20.4** Profile page (`/admin/profile`)
  - 3 tabs: Profile info edit, Password change, Activity history
  - Components: `profile-form.tsx`, `password-form.tsx`
  - Server action: `lib/actions/admin-profile.ts`

---

## Phase 21 — Auth & Setup (Built Beyond Original Plan)

> Authentication and initial setup flow.

### Tasks

- [x] **21.1** Login page (`/admin/login`)
  - Email/password login with Supabase auth
  - Loading skeleton
- [x] **21.2** Setup page (`/admin/setup`)
  - First-time super admin account creation
  - `setup-form.tsx` component
  - Server action: `lib/actions/admin-setup.ts`
- [x] **21.3** Auth server action
  - `lib/actions/admin-auth.ts` — `adminLogin`, `adminLogout`, `getCurrentAdmin`, `createAdminUser`, `updateAdminUser`

---

## Phase 22 — Layout & Navigation (Built Beyond Original Plan)

> Admin shell with sidebar, header, breadcrumbs, and mobile support.

### Tasks

- [x] **22.1** Admin layout (`app/admin/layout.tsx`)
  - Server component that checks Supabase auth
  - Fetches admin user from `admin_users` table
  - Wraps in `AdminLayoutContent`
- [x] **22.2** Layout shell
  - `admin-layout-content.tsx` — Client component with sidebar + header + content
  - Uses `SidebarProvider` context
  - Content area shifts based on sidebar collapsed state
- [x] **22.3** Sidebar (`admin-sidebar.tsx`)
  - Collapsible sidebar (16px collapsed / 64px expanded)
  - Grouped navigation sections (Overview, Content, Engagement, Settings)
  - User avatar/name/role at bottom
- [x] **22.4** Header (`admin-header.tsx`)
  - Sticky top bar with breadcrumbs
  - Mobile hamburger menu (Sheet)
  - "View Site" link
  - Notification bell
  - User dropdown (profile, sign out)
- [x] **22.5** Navigation config (`admin-nav-config.ts`)
  - Centralized nav definition with 4 sections
  - Permission requirements per item
  - `canAccessAdminNavItem()` filter function
- [x] **22.6** Permission system
  - `lib/types/admin.ts` — 4 roles (SUPER_ADMIN, ADMIN, EDITOR, FINANCE) with permission arrays
  - Helper functions: `hasPermission()`, `canViewFinance()`, `canManageUsers()`, `canEditContent()`
  - `components/admin/permission-gate.tsx` — Server-side permission checking with redirect

---

## Phase 23 — Media Management (Built Beyond Original Plan)

> Media library and upload components for content creation.

### Tasks

- [x] **23.1** Media library page (`/admin/media`)
  - `media-library-client.tsx` — Browse/manage across Supabase storage buckets
- [x] **23.2** Media components
  - `media-picker.tsx` — Media picker for forms
  - `gallery-manager.tsx` — Gallery management
  - `file-upload.tsx` — File upload component
  - `video-picker.tsx` — Video picker (YouTube oEmbed)

---

## File Structure (New & Modified)

### Core Layout & Auth
```
app/admin/layout.tsx                          — MODIFY (server auth wrapper)
app/admin/login/page.tsx                      — CREATE
app/admin/login/loading.tsx                   — CREATE
app/admin/setup/page.tsx                      — CREATE
app/admin/profile/page.tsx                    — CREATE
app/admin/notifications/page.tsx              — CREATE
components/admin/admin-layout-content.tsx      — CREATE (layout shell)
components/admin/admin-sidebar.tsx             — CREATE
components/admin/admin-header.tsx              — CREATE
components/admin/admin-nav-config.ts           — CREATE
components/admin/permission-gate.tsx           — CREATE
components/admin/setup-form.tsx                — CREATE
components/admin/profile-form.tsx              — CREATE
components/admin/password-form.tsx             — CREATE
components/admin/notification-bell.tsx         — CREATE
components/admin/notification-bell-realtime.tsx — CREATE
components/admin/notification-center-client.tsx — CREATE
contexts/SidebarContext.tsx                    — CREATE
```

### Dashboard
```
app/admin/page.tsx                            — MODIFY (restructure, add 14 chart widgets)
lib/actions/admin-dashboard.ts                — MODIFY (add getDashboardTrends, getPendingActions)
lib/utils/date.ts                             — CREATE (date formatting helpers)
components/admin/dashboard/                    — CREATE (new directory)
  ├── dashboard-stat-card.tsx                 — CREATE
  ├── donation-trend-chart.tsx                — CREATE
  ├── content-activity-chart.tsx              — CREATE
  ├── provider-breakdown-chart.tsx            — CREATE
  ├── pending-actions.tsx                     — CREATE
  ├── activity-feed.tsx                       — CREATE
  ├── system-health-card.tsx                  — CREATE
  ├── dashboard-date-filter.tsx               — CREATE
  ├── fundraising-progress-chart.tsx          — CREATE
  ├── volunteer-skills-chart.tsx              — CREATE
  ├── monthly-vs-onetime-chart.tsx            — CREATE
  ├── event-capacity-chart.tsx                — CREATE
  ├── donation-by-category-chart.tsx          — CREATE
  └── dashboard-section.tsx                   — CREATE
```

### CMS Hub & Content Management
```
app/admin/cms/page.tsx                        — CREATE (CMS Launchpad)
app/admin/homepage/page.tsx                   — CREATE (14 section managers)
app/admin/about/page.tsx                      — CREATE (About page manager)
app/admin/media/page.tsx                      — CREATE (Media library)
components/admin/homepage-manager/            — CREATE (17 components)
components/admin/about-manager/               — CREATE
components/admin/media-library-client.tsx     — CREATE
components/admin/media-picker.tsx             — CREATE
components/admin/gallery-manager.tsx          — CREATE
components/admin/file-upload.tsx              — CREATE
components/admin/video-picker.tsx             — CREATE
```

### Content CRUD
```
app/admin/projects/                           — CREATE (list, new, [id])
app/admin/events/                             — CREATE (list, new, [id] + 10 sub-pages)
app/admin/stories/                            — CREATE (list, new, [id])
app/admin/podcasts/                           — CREATE (list, new, [id])
app/admin/team/                               — CREATE (list, new, [id])
app/admin/partners/                           — CREATE (list, new, [id])
app/admin/stats/                              — CREATE (list, new, [id])
app/admin/programs/                           — CREATE (list, new, [id]/edit, [id]/preview)
components/admin/project-form.tsx             — CREATE
components/admin/story-form.tsx               — CREATE
components/admin/podcast-form.tsx             — CREATE
components/admin/team-member-form.tsx         — CREATE
components/admin/partner-form.tsx             — CREATE
components/admin/stat-form.tsx                — CREATE
components/admin/event-form.tsx               — CREATE
components/admin/team-table.tsx               — CREATE
```

### Rich Text Editor
```
components/admin/rich-text-editor.tsx          — CREATE
components/admin/rich-text-editor/             — CREATE (12+ files)
  ├── toolbar.tsx
  ├── bubble-toolbar.tsx
  ├── slash-menu.tsx
  ├── image-dialog.tsx
  ├── video-dialog.tsx
  ├── link-dialog.tsx
  ├── table-dialog.tsx
  ├── extensions/custom-image.ts
  ├── extensions/callout.ts
  ├── extensions/highlight-quote.ts
  ├── extensions/slash-command.tsx
  ├── extensions/text-style-with-font-size.ts
  ├── extensions/two-column.ts
  ├── hooks/use-autosave.ts
  └── hooks/use-unsaved-changes.ts
```

### Program Sections CMS
```
components/admin/program-sections/             — CREATE (15+ files)
  ├── index.tsx, types.ts, program-id-context.tsx
  ├── useSectionState.ts, section-actions.ts
  ├── SectionList.tsx, SortableSectionCard.tsx
  ├── SectionTypePicker.tsx, SectionPropertiesPanel.tsx
  ├── AssetPicker.tsx
  └── forms/ (12 section form types)
```

### Form Builder
```
components/admin/form-canvas.tsx              — CREATE
components/admin/form-field-palette.tsx       — CREATE
components/admin/form-field-editor.tsx        — CREATE
components/admin/form-conditional-editor.tsx  — CREATE
components/admin/form-step-editor.tsx         — CREATE
components/admin/form-preview.tsx             — CREATE
components/admin/conference-form-builder.tsx  — CREATE
components/admin/conference-form-builder/     — CREATE (4 components)
```

### Donations & Payments
```
app/admin/donations/                           — CREATE (list, [id], review, review/audit)
app/admin/payments/                            — CREATE (list, [id], metrics, alerts, logs, system, monitoring, operations, emails/failed, receipts/failed)
components/admin/donations/                    — CREATE (13 files)
components/admin/payments/                     — CREATE (2 files)
```

### Conference & Engagement
```
app/admin/conference/                          — CREATE (list, [id], forms, settings, settings/form-builder)
app/admin/volunteers/page.tsx                  — CREATE
app/admin/contacts/page.tsx                    — CREATE
app/admin/support/                             — CREATE (list, [id])
app/admin/newsletter/page.tsx                  — CREATE
components/admin/conference-settings-form.tsx  — CREATE
components/admin/conference-quick-actions.tsx  — CREATE
components admin/conference-notes.tsx          — CREATE
components/admin/conference-status-actions.tsx — CREATE
components/admin/support/                      — CREATE (8 files)
```

### Settings & Users
```
app/admin/settings/                            — CREATE (page, organization, payments)
app/admin/users/                               — CREATE (list, new, [id])
components/admin/settings-tabs.tsx             — CREATE
components/admin/site-settings-form.tsx        — CREATE
components/admin/payment-settings-form.tsx     — CREATE
components/admin/organization-settings-form.tsx — CREATE
components/admin/admin-user-form.tsx           — CREATE
components/admin/admin-user-edit-form.tsx      — CREATE
```

### Server Actions
```
lib/actions/admin-auth.ts                      — CREATE
lib/actions/admin-dashboard.ts                 — MODIFY
lib/actions/admin-settings.ts                  — CREATE
lib/actions/admin-setup.ts                     — CREATE
lib/actions/admin-users.ts                     — CREATE
lib/actions/admin-projects.ts                  — CREATE
lib/actions/admin-events.ts                    — CREATE
lib/actions/admin-stories.ts                   — CREATE
lib/actions/admin-team.ts                      — CREATE
lib/actions/admin-partners.ts                  — CREATE
lib/actions/admin-stats.ts                     — CREATE
lib/actions/admin-volunteers.ts                — CREATE
lib/actions/admin-profile.ts                   — CREATE
lib/actions/admin-payments.ts                  — CREATE
lib/actions/admin-payment-actions.ts           — CREATE
lib/actions/admin-donation-actions.ts          — CREATE
lib/actions/admin-donation-review.ts           — CREATE
```

### API Routes
```
app/api/admin/                                 — CREATE (~24 routes)
app/api/payments/                              — CREATE (provider verify/status routes)
app/api/webhooks/                              — CREATE (stripe, khalti webhooks)
app/api/conference/                            — CREATE (payment & registration routes)
app/api/events/                                — CREATE (payment & registration routes)
app/api/cron/                                  — CREATE (5 cron jobs)
app/api/monitoring/                            — CREATE (metrics, health)
```

### Types
```
lib/types/admin.ts                            — MODIFY (comprehensive type definitions)
```

---

## Current Status Summary

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1 — Stat Card Trends | ✅ Complete | |
| Phase 2 — Donation Chart | ✅ Complete | |
| Phase 3 — Content Activity | ✅ Complete | |
| Phase 4 — Provider Breakdown | ✅ Complete | |
| Phase 5 — Pending Actions | ✅ Complete | |
| Phase 6 — Activity Feed | ✅ Complete | |
| Phase 7 — Role-Based Sections | ✅ Complete | |
| Phase 8 — Date Range Filter | ✅ Complete | |
| Phase 9 — Polish & Performance | 🟡 Mostly Complete | 9.4 and 9.5 pending |
| Phase 10 — Additional Widgets | ✅ Complete | Built beyond original plan |
| Phase 11 — CMS Hub | ✅ Complete | Built beyond original plan |
| Phase 12 — Rich Text Editor | ✅ Complete | Built beyond original plan |
| Phase 13 — Program Sections CMS | ✅ Complete | Built beyond original plan |
| Phase 14 — Form Builder | ✅ Complete | Built beyond original plan |
| Phase 15 — Event Management | ✅ Complete | Built beyond original plan |
| Phase 16 — Conference Management | ✅ Complete | Built beyond original plan |
| Phase 17 — Payment & Donation System | ✅ Complete | Built beyond original plan |
| Phase 18 — Engagement & Community | ✅ Complete | Built beyond original plan |
| Phase 19 — Notifications | ✅ Complete | Built beyond original plan |
| Phase 20 — Settings & Administration | ✅ Complete | Built beyond original plan |
| Phase 21 — Auth & Setup | ✅ Complete | Built beyond original plan |
| Phase 22 — Layout & Navigation | ✅ Complete | Built beyond original plan |
| Phase 23 — Media Management | ✅ Complete | Built beyond original plan |

---

## Estimated Effort

| Phase | Effort | Dependencies | Status |
|-------|--------|-------------|--------|
| Phase 1 — Stat Card Trends | Small | None | ✅ |
| Phase 2 — Donation Chart | Medium | Phase 1 (for layout) | ✅ |
| Phase 3 — Content Activity | Medium | None | ✅ |
| Phase 4 — Provider Breakdown | Small | None | ✅ |
| Phase 5 — Pending Actions | Medium | None | ✅ |
| Phase 6 — Activity Feed | Small | None | ✅ |
| Phase 7 — Role-Based Sections | Medium | Phases 1-4 | ✅ |
| Phase 8 — Date Range Filter | Small | Phases 2-4 | ✅ |
| Phase 9 — Polish | Medium | All phases | 🟡 |
| Phase 10-23 — Extended Features | Large | Core phases | ✅ |

---

## Remaining Work

### Immediate
- [ ] **9.4** Performance optimization — Ensure Supabase queries use specific column selects, add index hints, consider `Promise.all` for parallel fetching
- [ ] **9.5** Error boundaries — Wrap each chart in error boundaries with graceful fallbacks

### Planned / In Progress
- [ ] Event registration detail page enhancement (per `app/admin/events/tasks.md`)
- [ ] CMS "Press & Media" module (listed as "Coming soon" in CMS hub)
- [ ] Event form builder enhancements

---

## Architecture Notes

- **Server Components First**: Most list pages are server components that fetch data directly from Supabase. Client components are used only where interactivity is needed.
- **Permission-Gated Routes**: Every admin page checks auth via `getCurrentAdmin()` or inline Supabase queries, then checks role-based permissions before rendering.
- **CMS-Style Architecture**: The `site_settings` table uses a key-value pattern where each setting key stores a JSON object. Powers homepage manager, about page, and general settings.
- **Multi-Payment Provider**: Supports Stripe, Khalti, and eSewa with a unified payment abstraction layer. Each provider has verify/status routes and webhook handlers.
- **Event-Driven Architecture**: Payment events tracked in `payment_events` table, with failure tracking in `receipt_failures` and `email_failures`. Cron jobs monitor for stuck donations and failure rate spikes.
- **Real-Time Features**: Notification bell with real-time updates via Supabase realtime.
- **Form Builder**: Both conference and event modules have custom form builders with drag-and-drop field placement, conditional logic, and multi-step support.
- **Rich Text Editor**: Custom TipTap-based editor with extensions for images, videos, tables, callouts, two-column layouts, slash commands, and autosave.
- **Program Sections CMS**: Composable section-based system for building program pages with 12+ section types.
