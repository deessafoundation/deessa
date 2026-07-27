# Component Reorganization Plan

> **Status:** Planning only — no files moved or renamed yet.
> **Created:** 2026-07-22
> **Stack:** Next.js 16 + Supabase + Tailwind CSS + Radix UI (shadcn/ui pattern)
> **Path alias:** `@/*` → project root (tsconfig.json)

---

## 1. Current State Analysis

### 1.1 Full Components Inventory

**Root-level components (`components/`) — 28 files:**

| File | Export(s) | Used In | Status |
|------|-----------|---------|--------|
| `about-hero.tsx` | `AboutHero` | `app/(public)/about/page.tsx` | ✅ Used |
| `accessibility-toolbar.tsx` | `AccessibilityToolbar` | — | ⚠️ **UNUSED** |
| `circular-testimonials.tsx` | `CircularTestimonials` | `components/homepage-sections.tsx` | ✅ Used |
| `contact-form.tsx` | `ContactForm` | `components/contact-form-prefilled.tsx` | ✅ Used (internal) |
| `contact-form-prefilled.tsx` | `ContactFormPrefilled` | `app/(public)/contact/page.tsx` | ✅ Used |
| `development-notice-modal.tsx` | `DevelopmentNoticeModal` | `app/(public)/layout.tsx` | ✅ Used |
| `donation-amount-picker.tsx` | `DonationAmountPicker` | — | ⚠️ **UNUSED** |
| `event-preview-card.tsx` | `EventPreviewCard` | — | ⚠️ **UNUSED** |
| `event-registration-modal.tsx` | `EventRegistrationModal` | `app/(public)/events/page.tsx` | ✅ Used |
| `footer.tsx` | `Footer` | `app/(public)/layout.tsx` | ✅ Used |
| `global-video-modal.tsx` | `GlobalVideoModal` | `app/(public)/layout.tsx` | ✅ Used |
| `hero-carousel.tsx` | `HeroCarousel`, `HeroSlide` | `app/(public)/page.tsx` | ✅ Used |
| `hero-video.tsx` | `HeroVideo` | — | ⚠️ **UNUSED** |
| `home-accessibility-button.tsx` | `HomeAccessibilityButton` | `app/(public)/page.tsx` | ✅ Used |
| `home-faqs.tsx` | `HomeFAQs` | `app/(public)/page.tsx` | ✅ Used |
| `home-testimonials-slider.tsx` | `HomeTestimonialsSlider` | — | ⚠️ **UNUSED** |
| `homepage-sections.tsx` | 9 exports (ImpactStatsBar, OurStorySection, etc.) | `app/(public)/page.tsx` | ✅ Used |
| `impact-counter.tsx` | `ImpactCounter` | `components/homepage-sections.tsx` | ✅ Used |
| `intro-video.tsx` | `IntroVideo` | `app/(public)/layout.tsx` | ✅ Used |
| `navbar-wrapper.tsx` | `NavbarWrapper` | `app/(public)/layout.tsx` | ✅ Used |
| `navbar.tsx` | `Navbar` | `components/navbar-wrapper.tsx` | ✅ Used (internal) |
| `newsletter-form.tsx` | `NewsletterForm` | `components/footer.tsx` | ✅ Used (internal) |
| `partner-strip.tsx` | `PartnerStrip` | — | ⚠️ **UNUSED** |
| `receipt-preview.tsx` | `ReceiptPreview` | `app/(public)/donate/success/success-content.tsx` | ✅ Used |
| `resource-downloads.tsx` | `ResourceDownloads`, `brandResources`, `legalResources` | `app/(public)/about/page.tsx`, `app/(public)/press/page.tsx` | ✅ Used |
| `scroll-animations.tsx` | 8 exports (ScrollReveal, CountUp, etc.) | `components/homepage-sections.tsx`, `components/home-faqs.tsx` | ✅ Used |
| `secret-key-listener.tsx` | `SecretKeyListener` | `app/(public)/page.tsx` | ✅ Used |
| `share-button.tsx` | `ShareButton` | `app/(public)/podcasts/[slug]/page.tsx` | ✅ Used |
| `social-icons.tsx` | Facebook, Twitter, Instagram, Youtube, Linkedin | Multiple podcast, footer, site-settings files | ✅ Used |
| `stories-carousel.tsx` | `StoriesCarousel` | — | ⚠️ **UNUSED** |
| `support-form.tsx` | `SupportForm` | `app/(public)/support/page.tsx` | ✅ Used |
| `theme-provider.tsx` | `ThemeProvider` | — | ⚠️ **UNUSED** |
| `volunteer-form.tsx` | `VolunteerForm` | `app/(public)/get-involved/page.tsx` | ✅ Used |

**UI primitives (`components/ui/`) — 67 files:**

Standard shadcn/ui components: `accordion`, `alert-dialog`, `alert`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input`, `input-otp`, `kbd`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toaster`, `toggle-group`, `toggle`, `tooltip`

Custom additions in `ui/` (non-standard shadcn):
- `animated-brush-quote.tsx` — decorative component
- `brush-stroke.tsx` — decorative component
- `button-group.tsx` — compound component
- `empty.tsx` — compound component
- `event-card.tsx` — domain card
- `field.tsx` — compound form component
- `initiative-card.tsx` — domain card
- `input-group.tsx` — compound component
- `item.tsx` — compound component
- `print-button.tsx` — utility button
- `project-card.tsx` — domain card
- `section.tsx` — layout component
- `spinner.tsx` — utility component
- `stat-card.tsx` — domain card
- `story-card.tsx` — domain card
- `team-member-card.tsx` — domain card
- `use-mobile.tsx` — **hook misplaced in ui/**
- `use-toast.ts` — **hook misplaced in ui/**

**Admin components (`components/admin/`) — 52 files + subfolders:**

Core admin:
- `admin-header.tsx`, `admin-layout-content.tsx`, `admin-nav-config.ts`, `admin-sidebar.tsx`
- `admin-user-edit-form.tsx`, `admin-user-form.tsx`
- `permission-gate.tsx` (server component)

Forms (one per entity):
- `event-form.tsx`, `podcast-form.tsx`, `story-form.tsx`, `project-form.tsx`, `partner-form.tsx`
- `stat-form.tsx`, `team-member-form.tsx`, `profile-form.tsx`, `password-form.tsx`
- `site-settings-form.tsx`, `organization-settings-form.tsx`, `conference-settings-form.tsx`
- `payment-settings-form.tsx`, `setup-form.tsx`

Actions/deleters:
- `delete-podcast-button.tsx`, `delete-registration-button.tsx`, `delete-story-button.tsx`
- `partner-actions.tsx`, `project-actions.tsx`, `stat-actions.tsx`, `support-actions.tsx`
- `volunteer-actions.tsx`, `conference-status-actions.tsx`

Modals:
- `internal-note-modal.tsx`, `reply-modal.tsx`, `story-preview-modal.tsx`
- `support-screenshot-modal.tsx`, `support-toggle-modal.tsx`

Other:
- `conference-notes.tsx`, `conference-quick-actions.tsx`
- `file-upload.tsx`, `gallery-manager.tsx`
- `homepage-manager-client.tsx` (1234 lines — **duplicate concern**)
- `media-library-client.tsx`, `media-picker.tsx` (**media-picker unused**)
- `notification-bell.tsx`, `notification-bell-realtime.tsx`, `notification-center-client.tsx`
- `rich-text-editor.tsx`, `support-toggle.tsx`, `video-picker.tsx`

Admin subfolders:
- `admin/donations/` — 13 files (review dashboard, transaction detail, etc.)
- `admin/homepage-manager/` — `HomepageManagerClient.tsx` + `components/` (15 sub-components)
- `admin/rich-text-editor/` — toolbar, dialogs, extensions (6), hooks (2)
- `admin/support/` — 4 files (assign-modal, delete, show-archived, detail)

**Feature folders:**
- `components/conference/` — 6 files (registration form + step components)
- `components/donation/` — 1 file (`donation-form.tsx`)
- `components/error-pages/` — 5 components + 1 image (PascalCase naming)
- `components/photo-wall/` — 1 file (`photo-wall.tsx`)
- `components/podcasts/` — 20 files

### 1.2 Naming Convention Issues

| Issue | Files Affected | Example |
|-------|---------------|---------|
| **PascalCase files** | `error-pages/GenericErrorPage.tsx`, `error-pages/NetworkErrorPage.tsx`, `error-pages/NotFoundErrorPage.tsx`, `error-pages/ServerErrorPage.tsx`, `error-pages/UnauthorizedErrorPage.tsx`, `admin/homepage-manager/HomepageManagerClient.tsx`, `admin/homepage-manager/components/*.tsx` (15 files) | All homepage-manager sub-components are PascalCase |
| **kebab-case files** (majority) | Everything else | `admin-header.tsx`, `podcast-card.tsx` |
| **Mixed default vs named exports** | Many files use default export, many use named | `PhotoWall` (default) vs `EventCard` (named) |
| **Hooks in wrong location** | `ui/use-mobile.tsx`, `ui/use-toast.ts`, `hooks/use-mobile.ts`, `hooks/use-toast.ts` | Duplicate hook definitions |

### 1.3 Duplication & Overlap

| Issue | Details |
|-------|---------|
| **Two HomepageManagerClient** | `admin/homepage-manager-client.tsx` (1234 lines) AND `admin/homepage-manager/HomepageManagerClient.tsx` (398 lines) — only the subfolder version is imported |
| **Two use-mobile definitions** | `components/ui/use-mobile.tsx` AND `hooks/use-mobile.ts` |
| **Two use-toast definitions** | `components/ui/use-toast.ts` AND `hooks/use-toast.ts` |
| **Two notification bell components** | `admin/notification-bell.tsx` AND `admin/notification-bell-realtime.tsx` — both exist, unclear if both are used |
| **Domain cards in ui/** | `event-card`, `initiative-card`, `project-card`, `stat-card`, `story-card`, `team-member-card` are domain-specific, not generic UI primitives |
| **Hooks in ui/** | `use-mobile.tsx` and `use-toast.ts` are hooks, not UI components |

### 1.4 Definitely Unused Components (flagged, not deleted)

| File | Reason |
|------|--------|
| `accessibility-toolbar.tsx` | Zero imports found |
| `donation-amount-picker.tsx` | Zero imports found |
| `event-preview-card.tsx` | Zero imports found |
| `hero-video.tsx` | Zero imports found |
| `home-testimonials-slider.tsx` | Zero imports found |
| `partner-strip.tsx` | Zero imports found |
| `stories-carousel.tsx` | Zero imports found |
| `theme-provider.tsx` | Zero imports found |
| `admin/media-picker.tsx` | Zero imports found |
| `admin/homepage-manager-client.tsx` | Superseded by subfolder version |

---

## 2. Proposed Folder Structure

```
components/
├── ui/                          # Generic, reusable UI primitives (shadcn/ui + custom)
│   ├── accordion.tsx
│   ├── alert-dialog.tsx
│   ├── alert.tsx
│   ├── aspect-ratio.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── breadcrumb.tsx
│   ├── button.tsx
│   ├── button-group.tsx
│   ├── calendar.tsx
│   ├── card.tsx
│   ├── carousel.tsx
│   ├── chart.tsx
│   ├── checkbox.tsx
│   ├── collapsible.tsx
│   ├── command.tsx
│   ├── context-menu.tsx
│   ├── dialog.tsx
│   ├── drawer.tsx
│   ├── dropdown-menu.tsx
│   ├── empty.tsx
│   ├── field.tsx
│   ├── form.tsx
│   ├── hover-card.tsx
│   ├── input.tsx
│   ├── input-group.tsx
│   ├── input-otp.tsx
│   ├── item.tsx
│   ├── kbd.tsx
│   ├── label.tsx
│   ├── menubar.tsx
│   ├── navigation-menu.tsx
│   ├── pagination.tsx
│   ├── popover.tsx
│   ├── progress.tsx
│   ├── radio-group.tsx
│   ├── resizable.tsx
│   ├── scroll-area.tsx
│   ├── select.tsx
│   ├── separator.tsx
│   ├── sheet.tsx
│   ├── sidebar.tsx
│   ├── skeleton.tsx
│   ├── slider.tsx
│   ├── sonner.tsx
│   ├── spinner.tsx
│   ├── switch.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── textarea.tsx
│   ├── toast.tsx
│   ├── toaster.tsx
│   ├── toggle.tsx
│   ├── toggle-group.tsx
│   └── tooltip.tsx
│
├── layout/                      # App shell: navbar, footer, wrappers
│   ├── footer.tsx
│   ├── navbar.tsx
│   ├── navbar-wrapper.tsx
│   └── section.tsx
│
├── features/                    # Feature-specific UI (public-facing)
│   ├── conference/
│   │   ├── conference-registration-form.tsx
│   │   ├── step-progress-bar.tsx
│   │   ├── step1-personal-details.tsx
│   │   ├── step2-participation.tsx
│   │   ├── step3-additional-info.tsx
│   │   └── step4-review.tsx
│   ├── donation/
│   │   ├── donation-form.tsx
│   │   └── receipt-preview.tsx
│   ├── homepage/
│   │   ├── hero-carousel.tsx
│   │   ├── homepage-sections.tsx
│   │   ├── impact-counter.tsx
│   │   ├── circular-testimonials.tsx
│   │   ├── home-faqs.tsx
│   │   └── partner-strip.tsx
│   ├── about/
│   │   └── about-hero.tsx
│   ├── contact/
│   │   ├── contact-form.tsx
│   │   └── contact-form-prefilled.tsx
│   ├── support/
│   │   └── support-form.tsx
│   ├── volunteer/
│   │   └── volunteer-form.tsx
│   ├── press/
│   │   └── resource-downloads.tsx
│   └── events/
│       └── event-registration-modal.tsx
│
├── shared/                      # Cross-feature shared components
│   ├── cards/
│   │   ├── event-card.tsx
│   │   ├── initiative-card.tsx
│   │   ├── project-card.tsx
│   │   ├── stat-card.tsx
│   │   ├── story-card.tsx
│   │   └── team-member-card.tsx
│   ├── decorations/
│   │   ├── animated-brush-quote.tsx
│   │   └── brush-stroke.tsx
│   ├── error-pages/
│   │   ├── generic-error-page.tsx
│   │   ├── network-error-page.tsx
│   │   ├── not-found-error-page.tsx
│   │   ├── server-error-page.tsx
│   │   ├── unauthorized-error-page.tsx
│   │   └── astronaut.png
│   ├── social-icons.tsx
│   ├── share-button.tsx
│   ├── newsletter-form.tsx
│   ├── print-button.tsx
│   └── scroll-animations.tsx
│
├── admin/                       # Admin panel components
│   ├── layout/
│   │   ├── admin-header.tsx
│   │   ├── admin-layout-content.tsx
│   │   ├── admin-nav-config.ts
│   │   └── admin-sidebar.tsx
│   ├── auth/
│   │   ├── admin-user-form.tsx
│   │   ├── admin-user-edit-form.tsx
│   │   ├── password-form.tsx
│   │   └── permission-gate.tsx
│   ├── forms/
│   │   ├── event-form.tsx
│   │   ├── podcast-form.tsx
│   │   ├── story-form.tsx
│   │   ├── project-form.tsx
│   │   ├── partner-form.tsx
│   │   ├── stat-form.tsx
│   │   ├── team-member-form.tsx
│   │   ├── profile-form.tsx
│   │   ├── setup-form.tsx
│   │   ├── file-upload.tsx
│   │   ├── rich-text-editor.tsx
│   │   └── rich-text-editor/         # (keep as-is, already well-structured)
│   ├── settings/
│   │   ├── site-settings-form.tsx
│   │   ├── organization-settings-form.tsx
│   │   ├── conference-settings-form.tsx
│   │   └── payment-settings-form.tsx
│   ├── actions/
│   │   ├── delete-podcast-button.tsx
│   │   ├── delete-registration-button.tsx
│   │   ├── delete-story-button.tsx
│   │   ├── partner-actions.tsx
│   │   ├── project-actions.tsx
│   │   ├── stat-actions.tsx
│   │   ├── volunteer-actions.tsx
│   │   └── conference-status-actions.tsx
│   ├── modals/
│   │   ├── internal-note-modal.tsx
│   │   ├── reply-modal.tsx
│   │   ├── story-preview-modal.tsx
│   │   ├── support-screenshot-modal.tsx
│   │   └── support-toggle-modal.tsx
│   ├── notifications/
│   │   ├── notification-bell.tsx
│   │   ├── notification-bell-realtime.tsx
│   │   └── notification-center-client.tsx
│   ├── donations/
│   │   ├── activity-timeline.tsx
│   │   ├── donations-table-client.tsx
│   │   ├── donor-information.tsx
│   │   ├── error-boundary.tsx
│   │   ├── payment-technical.tsx
│   │   ├── review-action-dialog.tsx
│   │   ├── review-dashboard-client.tsx
│   │   ├── review-notes-section.tsx
│   │   ├── review-status-card.tsx
│   │   ├── status-change-modal.tsx
│   │   ├── transaction-detail-client.tsx
│   │   ├── transaction-header.tsx
│   │   └── transaction-overview.tsx
│   ├── support/
│   │   ├── assign-modal.tsx
│   │   ├── delete-support-button.tsx
│   │   ├── show-archived-button.tsx
│   │   ├── support-detail-client.tsx
│   │   └── support-actions.tsx
│   ├── homepage-manager/
│   │   ├── homepage-manager-client.tsx
│   │   └── components/
│   │       ├── banners-manager.tsx
│   │       ├── color-picker.tsx
│   │       ├── cta-cards-manager.tsx
│   │       ├── featured-stories-manager.tsx
│   │       ├── flags-manager.tsx
│   │       ├── hero-carousel-manager.tsx
│   │       ├── hero-ctas-manager.tsx
│   │       ├── hero-manager.tsx
│   │       ├── marquee-manager.tsx
│   │       ├── programs-manager.tsx
│   │       ├── seo-manager.tsx
│   │       ├── stats-manager.tsx
│   │       ├── testimonials-manager.tsx
│   │       ├── timeline-manager.tsx
│   │       └── trust-indicators-manager.tsx
│   ├── media/
│   │   ├── gallery-manager.tsx
│   │   └── media-library-client.tsx
│   └── conference/
│       ├── conference-notes.tsx
│       └── conference-quick-actions.tsx
│
└── podcasts/                    # Podcast feature (large enough for own folder)
    ├── podcast-main-hero.tsx
    ├── podcast-hero-section.tsx
    ├── podcast-card.tsx
    ├── podcast-guest-card.tsx
    ├── podcast-highlight-card.tsx
    ├── podcast-preview-section.tsx
    ├── podcast-archive-section.tsx
    ├── podcast-latest-episode.tsx
    ├── podcast-section.tsx
    ├── podcast-sticky-player.tsx
    ├── podcast-transcript.tsx
    ├── podcast-video-modal.tsx
    ├── podcast-share-card.tsx
    ├── podcast-grid.tsx
    ├── podcast-filter-sidebar.tsx
    ├── all-highlights-card.tsx
    ├── all-highlights-section.tsx
    ├── episodes-page-content.tsx
    └── highlights-page-content.tsx
```

### Rationale for Each Folder

| Folder | Purpose | Why Separate |
|--------|---------|-------------|
| `ui/` | Generic, domain-agnostic primitives | shadcn/ui convention; never contains business logic |
| `layout/` | App shell (navbar, footer, section wrapper) | These appear on every page; not feature-specific |
| `features/` | Public-facing feature components, grouped by feature | Each feature (conference, donation, homepage) has its own folder; keeps related files together |
| `shared/` | Components used across multiple features | Cards, error pages, social icons, scroll animations — used in many places |
| `admin/` | All admin panel components | Admin is a separate concern with its own layout, forms, and actions |
| `podcasts/` | Podcast feature (20 files) | Large enough to warrant top-level instead of nesting under features/ |

---

## 3. Naming Convention Rules

### File Naming
- **Rule:** All component files use **kebab-case** for the filename
- **Rule:** All component exports use **PascalCase** for the component name
- **Rule:** Hooks use `use-` prefix in kebab-case (e.g., `use-mobile.ts`)
- **Rule:** Type-only files use `.types.ts` suffix
- **Rule:** Config files use `.config.ts` suffix

### Component Naming
- **Rule:** One component per file, file name matches component name in kebab-case
- **Rule:** Compound components (multiple co-exported pieces from one file) stay as flat files in `ui/`. A folder is only warranted when a component has its own sub-components with independent imports/logic (e.g., `rich-text-editor/` with separate toolbar, dialogs, extensions). All current compound components in `ui/` (`field.tsx` with 10 exports, `item.tsx` with 10 exports, `input-group.tsx` with 6 exports, `empty.tsx` with 6 exports, `button-group.tsx` with 4 exports) remain flat — they follow the shadcn/ui convention and work well as single files.

> **Scope note — default vs named exports:** Converting `export default` to named exports is **deferred to a separate future cleanup** and is NOT part of this migration's checklists. The current plan moves and renames files only; it does not change export styles. Converting exports would require updating every import site simultaneously, which doubles the blast radius and makes it harder to isolate breakage. Files currently using `export default` (e.g., `PhotoWall`, `GenericErrorPage`, all `podcasts/*.tsx`, all `admin/homepage-manager/components/*.tsx`) keep their export style through this reorg.

### Co-located Files
- **Rule:** Styles are Tailwind-only (no co-located CSS files)
- **Rule:** Tests (if added) go in `__tests__/` at project root, not co-located
- **Rule:** Types are co-located as `*.types.ts` only when tightly coupled to one component

---

## 4. Migration Mapping Table

### 4.1 Root Components → New Locations

| Current Path | New Path | Notes |
|-------------|----------|-------|
| `components/about-hero.tsx` | `components/features/about/about-hero.tsx` | |
| `components/accessibility-toolbar.tsx` | **DELETE** | Unused |
| `components/circular-testimonials.tsx` | `components/features/homepage/circular-testimonials.tsx` | |
| `components/contact-form.tsx` | `components/features/contact/contact-form.tsx` | |
| `components/contact-form-prefilled.tsx` | `components/features/contact/contact-form-prefilled.tsx` | |
| `components/development-notice-modal.tsx` | `components/features/homepage/development-notice-modal.tsx` | Homepage-specific |
| `components/donation-amount-picker.tsx` | **DELETE** | Unused |
| `components/event-preview-card.tsx` | **DELETE** | Unused |
| `components/event-registration-modal.tsx` | `components/features/events/event-registration-modal.tsx` | |
| `components/footer.tsx` | `components/layout/footer.tsx` | |
| `components/global-video-modal.tsx` | `components/shared/global-video-modal.tsx` | Used across pages |
| `components/hero-carousel.tsx` | `components/features/homepage/hero-carousel.tsx` | |
| `components/hero-video.tsx` | **DELETE** | Unused |
| `components/home-accessibility-button.tsx` | `components/features/homepage/home-accessibility-button.tsx` | |
| `components/home-faqs.tsx` | `components/features/homepage/home-faqs.tsx` | |
| `components/home-testimonials-slider.tsx` | **DELETE** | Unused |
| `components/homepage-sections.tsx` | `components/features/homepage/homepage-sections.tsx` | |
| `components/impact-counter.tsx` | `components/features/homepage/impact-counter.tsx` | |
| `components/intro-video.tsx` | `components/features/homepage/intro-video.tsx` | |
| `components/navbar-wrapper.tsx` | `components/layout/navbar-wrapper.tsx` | |
| `components/navbar.tsx` | `components/layout/navbar.tsx` | |
| `components/newsletter-form.tsx` | `components/shared/newsletter-form.tsx` | Used in footer |
| `components/partner-strip.tsx` | **DELETE** | Unused |
| `components/photo-wall/photo-wall.tsx` | `components/shared/photo-wall.tsx` | Flatten single-file folder |
| `components/receipt-preview.tsx` | `components/features/donation/receipt-preview.tsx` | |
| `components/resource-downloads.tsx` | `components/features/press/resource-downloads.tsx` | |
| `components/scroll-animations.tsx` | `components/shared/scroll-animations.tsx` | |
| `components/secret-key-listener.tsx` | `components/shared/secret-key-listener.tsx` | |
| `components/share-button.tsx` | `components/shared/share-button.tsx` | |
| `components/social-icons.tsx` | `components/shared/social-icons.tsx` | |
| `components/stories-carousel.tsx` | **DELETE** | Unused |
| `components/support-form.tsx` | `components/features/support/support-form.tsx` | |
| `components/theme-provider.tsx` | **DELETE** | Unused |
| `components/volunteer-form.tsx` | `components/features/volunteer/volunteer-form.tsx` | |

### 4.2 UI Components — Stay in `ui/` (no move needed)

All 67 `ui/` files stay. Remove misplaced items:
- `components/ui/use-mobile.tsx` → **DELETE** (duplicate of `hooks/use-mobile.ts`)
- `components/ui/use-toast.ts` → **DELETE** (duplicate of `hooks/use-toast.ts`)

### 4.3 UI Domain Cards → `shared/cards/`

| Current Path | New Path |
|-------------|----------|
| `components/ui/event-card.tsx` | `components/shared/cards/event-card.tsx` |
| `components/ui/initiative-card.tsx` | `components/shared/cards/initiative-card.tsx` |
| `components/ui/project-card.tsx` | `components/shared/cards/project-card.tsx` |
| `components/ui/stat-card.tsx` | `components/shared/cards/stat-card.tsx` |
| `components/ui/story-card.tsx` | `components/shared/cards/story-card.tsx` |
| `components/ui/team-member-card.tsx` | `components/shared/cards/team-member-card.tsx` |
| `components/ui/section.tsx` | `components/layout/section.tsx` |
| `components/ui/print-button.tsx` | `components/shared/print-button.tsx` |
| `components/ui/animated-brush-quote.tsx` | `components/shared/decorations/animated-brush-quote.tsx` |
| `components/ui/brush-stroke.tsx` | `components/shared/decorations/brush-stroke.tsx` |

### 4.4 Admin Components → `admin/` Subfolders

| Current Path | New Path |
|-------------|----------|
| `components/admin/admin-header.tsx` | `components/admin/layout/admin-header.tsx` |
| `components/admin/admin-layout-content.tsx` | `components/admin/layout/admin-layout-content.tsx` |
| `components/admin/admin-nav-config.ts` | `components/admin/layout/admin-nav-config.ts` |
| `components/admin/admin-sidebar.tsx` | `components/admin/layout/admin-sidebar.tsx` |
| `components/admin/admin-user-edit-form.tsx` | `components/admin/auth/admin-user-edit-form.tsx` |
| `components/admin/admin-user-form.tsx` | `components/admin/auth/admin-user-form.tsx` |
| `components/admin/password-form.tsx` | `components/admin/auth/password-form.tsx` |
| `components/admin/permission-gate.tsx` | `components/admin/auth/permission-gate.tsx` |
| `components/admin/event-form.tsx` | `components/admin/forms/event-form.tsx` |
| `components/admin/podcast-form.tsx` | `components/admin/forms/podcast-form.tsx` |
| `components/admin/story-form.tsx` | `components/admin/forms/story-form.tsx` |
| `components/admin/project-form.tsx` | `components/admin/forms/project-form.tsx` |
| `components/admin/partner-form.tsx` | `components/admin/forms/partner-form.tsx` |
| `components/admin/stat-form.tsx` | `components/admin/forms/stat-form.tsx` |
| `components/admin/team-member-form.tsx` | `components/admin/forms/team-member-form.tsx` |
| `components/admin/profile-form.tsx` | `components/admin/forms/profile-form.tsx` |
| `components/admin/setup-form.tsx` | `components/admin/forms/setup-form.tsx` |
| `components/admin/file-upload.tsx` | `components/admin/forms/file-upload.tsx` |
| `components/admin/rich-text-editor.tsx` | `components/admin/forms/rich-text-editor.tsx` |
| `components/admin/rich-text-editor/` | `components/admin/forms/rich-text-editor/` |
| `components/admin/site-settings-form.tsx` | `components/admin/settings/site-settings-form.tsx` |
| `components/admin/organization-settings-form.tsx` | `components/admin/settings/organization-settings-form.tsx` |
| `components/admin/conference-settings-form.tsx` | `components/admin/settings/conference-settings-form.tsx` |
| `components/admin/payment-settings-form.tsx` | `components/admin/settings/payment-settings-form.tsx` |
| `components/admin/payment-settings-form.tsx` | `components/admin/settings/payment-settings-form.tsx` |
| `components/admin/delete-podcast-button.tsx` | `components/admin/actions/delete-podcast-button.tsx` |
| `components/admin/delete-registration-button.tsx` | `components/admin/actions/delete-registration-button.tsx` |
| `components/admin/delete-story-button.tsx` | `components/admin/actions/delete-story-button.tsx` |
| `components/admin/partner-actions.tsx` | `components/admin/actions/partner-actions.tsx` |
| `components/admin/project-actions.tsx` | `components/admin/actions/project-actions.tsx` |
| `components/admin/stat-actions.tsx` | `components/admin/actions/stat-actions.tsx` |
| `components/admin/volunteer-actions.tsx` | `components/admin/actions/volunteer-actions.tsx` |
| `components/admin/conference-status-actions.tsx` | `components/admin/actions/conference-status-actions.tsx` |
| `components/admin/internal-note-modal.tsx` | `components/admin/modals/internal-note-modal.tsx` |
| `components/admin/reply-modal.tsx` | `components/admin/modals/reply-modal.tsx` |
| `components/admin/story-preview-modal.tsx` | `components/admin/modals/story-preview-modal.tsx` |
| `components/admin/support-screenshot-modal.tsx` | `components/admin/modals/support-screenshot-modal.tsx` |
| `components/admin/support-toggle-modal.tsx` | `components/admin/modals/support-toggle-modal.tsx` |
| `components/admin/notification-bell.tsx` | `components/admin/notifications/notification-bell.tsx` |
| `components/admin/notification-bell-realtime.tsx` | `components/admin/notifications/notification-bell-realtime.tsx` |
| `components/admin/notification-center-client.tsx` | `components/admin/notifications/notification-center-client.tsx` |
| `components/admin/gallery-manager.tsx` | `components/admin/media/gallery-manager.tsx` |
| `components/admin/media-library-client.tsx` | `components/admin/media/media-library-client.tsx` |
| `components/admin/media-picker.tsx` | **DELETE** | Unused |
| `components/admin/conference-notes.tsx` | `components/admin/conference/conference-notes.tsx` |
| `components/admin/conference-quick-actions.tsx` | `components/admin/conference/conference-quick-actions.tsx` |
| `components/admin/support-actions.tsx` | `components/admin/support/support-actions.tsx` |
| `components/admin/support-toggle.tsx` | `components/admin/support/support-toggle.tsx` |
| `components/admin/video-picker.tsx` | `components/admin/media/video-picker.tsx` |
| `components/admin/homepage-manager-client.tsx` | **DELETE** | Superseded by subfolder version |
| `components/admin/homepage-manager/` | `components/admin/homepage-manager/` | Folder stays; internal files renamed (see 4.6) |

### 4.5 Error Pages — Rename to kebab-case

| Current Path | New Path |
|-------------|----------|
| `components/error-pages/GenericErrorPage.tsx` | `components/shared/error-pages/generic-error-page.tsx` |
| `components/error-pages/NetworkErrorPage.tsx` | `components/shared/error-pages/network-error-page.tsx` |
| `components/error-pages/NotFoundErrorPage.tsx` | `components/shared/error-pages/not-found-error-page.tsx` |
| `components/error-pages/ServerErrorPage.tsx` | `components/shared/error-pages/server-error-page.tsx` |
| `components/error-pages/UnauthorizedErrorPage.tsx` | `components/shared/error-pages/unauthorized-error-page.tsx` |
| `components/error-pages/astronaut.png` | `components/shared/error-pages/astronaut.png` |

### 4.6 Admin Homepage Manager — Rename PascalCase to kebab-case

All 15 files in `admin/homepage-manager/components/` are currently PascalCase. Rename to kebab-case per the universal naming rule.

| Current Path | New Path |
|-------------|----------|
| `components/admin/homepage-manager/HomepageManagerClient.tsx` | `components/admin/homepage-manager/homepage-manager-client.tsx` |
| `components/admin/homepage-manager/components/BannersManager.tsx` | `components/admin/homepage-manager/components/banners-manager.tsx` |
| `components/admin/homepage-manager/components/ColorPicker.tsx` | `components/admin/homepage-manager/components/color-picker.tsx` |
| `components/admin/homepage-manager/components/CTACardsManager.tsx` | `components/admin/homepage-manager/components/cta-cards-manager.tsx` |
| `components/admin/homepage-manager/components/FeaturedStoriesManager.tsx` | `components/admin/homepage-manager/components/featured-stories-manager.tsx` |
| `components/admin/homepage-manager/components/FlagsManager.tsx` | `components/admin/homepage-manager/components/flags-manager.tsx` |
| `components/admin/homepage-manager/components/HeroCarouselManager.tsx` | `components/admin/homepage-manager/components/hero-carousel-manager.tsx` |
| `components/admin/homepage-manager/components/HeroCTAsManager.tsx` | `components/admin/homepage-manager/components/hero-ctas-manager.tsx` |
| `components/admin/homepage-manager/components/HeroManager.tsx` | `components/admin/homepage-manager/components/hero-manager.tsx` |
| `components/admin/homepage-manager/components/MarqueeManager.tsx` | `components/admin/homepage-manager/components/marquee-manager.tsx` |
| `components/admin/homepage-manager/components/ProgramsManager.tsx` | `components/admin/homepage-manager/components/programs-manager.tsx` |
| `components/admin/homepage-manager/components/SEOManager.tsx` | `components/admin/homepage-manager/components/seo-manager.tsx` |
| `components/admin/homepage-manager/components/StatsManager.tsx` | `components/admin/homepage-manager/components/stats-manager.tsx` |
| `components/admin/homepage-manager/components/TestimonialsManager.tsx` | `components/admin/homepage-manager/components/testimonials-manager.tsx` |
| `components/admin/homepage-manager/components/TimelineManager.tsx` | `components/admin/homepage-manager/components/timeline-manager.tsx` |
| `components/admin/homepage-manager/components/TrustIndicatorsManager.tsx` | `components/admin/homepage-manager/components/trust-indicators-manager.tsx` |

---

## 5. Phased Breakdown

### Phase 1: Archive Unused Components
**Goal:** Move dead code to `_archive/` before reorganizing, so it's accessible during testing but out of the way.
**Scope:** 10 unused files + 2 duplicate hooks + 1 superseded file
**Effort:** 15 min

- [ ] Verify each "unused" component truly has zero imports (search for name, not just path)
- [ ] Create `components/_archive/` directory (underscore prefix signals "not active")
- [ ] Move `components/accessibility-toolbar.tsx` → `components/_archive/accessibility-toolbar.tsx`
- [ ] Move `components/donation-amount-picker.tsx` → `components/_archive/donation-amount-picker.tsx`
- [ ] Move `components/event-preview-card.tsx` → `components/_archive/event-preview-card.tsx`
- [ ] Move `components/hero-video.tsx` → `components/_archive/hero-video.tsx`
- [ ] Move `components/home-testimonials-slider.tsx` → `components/_archive/home-testimonials-slider.tsx`
- [ ] Move `components/partner-strip.tsx` → `components/_archive/partner-strip.tsx`
- [ ] Move `components/stories-carousel.tsx` → `components/_archive/stories-carousel.tsx`
- [ ] Move `components/theme-provider.tsx` → `components/_archive/theme-provider.tsx`
- [ ] Move `components/ui/use-mobile.tsx` → `components/_archive/use-mobile.tsx` (keep `hooks/use-mobile.ts` as canonical)
- [ ] Move `components/ui/use-toast.ts` → `components/_archive/use-toast.ts` (keep `hooks/use-toast.ts` as canonical)
- [ ] Move `components/admin/media-picker.tsx` → `components/_archive/media-picker.tsx`
- [ ] Move `components/admin/homepage-manager-client.tsx` → `components/_archive/homepage-manager-client.tsx` (superseded)
- [ ] Run `pnpm build` to verify nothing breaks
- [ ] **Future cleanup:** Delete `components/_archive/` after reorg is verified stable

### Phase 2: Move Layout Components
**Goal:** Establish the `layout/` folder with app shell components.
**Scope:** 4 files
**Effort:** 10 min

- [ ] Create `components/layout/` directory
- [ ] Move `components/footer.tsx` → `components/layout/footer.tsx`
- [ ] Move `components/navbar.tsx` → `components/layout/navbar.tsx`
- [ ] Move `components/navbar-wrapper.tsx` → `components/layout/navbar-wrapper.tsx`
- [ ] Move `components/ui/section.tsx` → `components/layout/section.tsx`
- [ ] Update imports in `app/(public)/layout.tsx` (navbar-wrapper, footer)
- [ ] Update imports in `components/layout/navbar.tsx` (if it imports from ui/section)
- [ ] Update imports in `components/homepage-sections.tsx` (section)
- [ ] Run `pnpm build` to verify

### Phase 3: Move Shared Components
**Goal:** Create `shared/` folder for cross-feature components.
**Scope:** ~15 files
**Effort:** 20 min

- [ ] Create `components/shared/` directory
- [ ] Create `components/shared/cards/` directory
- [ ] Create `components/shared/decorations/` directory
- [ ] Create `components/shared/error-pages/` directory
- [ ] Move `components/social-icons.tsx` → `components/shared/social-icons.tsx`
- [ ] Move `components/share-button.tsx` → `components/shared/share-button.tsx`
- [ ] Move `components/newsletter-form.tsx` → `components/shared/newsletter-form.tsx`
- [ ] Move `components/scroll-animations.tsx` → `components/shared/scroll-animations.tsx`
- [ ] Move `components/secret-key-listener.tsx` → `components/shared/secret-key-listener.tsx`
- [ ] Move `components/global-video-modal.tsx` → `components/shared/global-video-modal.tsx`
- [ ] Move `components/photo-wall/photo-wall.tsx` → `components/shared/photo-wall.tsx` (flatten)
- [ ] Move `components/ui/event-card.tsx` → `components/shared/cards/event-card.tsx`
- [ ] Move `components/ui/initiative-card.tsx` → `components/shared/cards/initiative-card.tsx`
- [ ] Move `components/ui/project-card.tsx` → `components/shared/cards/project-card.tsx`
- [ ] Move `components/ui/stat-card.tsx` → `components/shared/cards/stat-card.tsx`
- [ ] Move `components/ui/story-card.tsx` → `components/shared/cards/story-card.tsx`
- [ ] Move `components/ui/team-member-card.tsx` → `components/shared/cards/team-member-card.tsx`
- [ ] Move `components/ui/print-button.tsx` → `components/shared/print-button.tsx`
- [ ] Move `components/ui/animated-brush-quote.tsx` → `components/shared/decorations/animated-brush-quote.tsx`
- [ ] Move `components/ui/brush-stroke.tsx` → `components/shared/decorations/brush-stroke.tsx`
- [ ] Rename `components/error-pages/GenericErrorPage.tsx` → `components/shared/error-pages/generic-error-page.tsx` (and all PascalCase → kebab-case)
- [ ] Move all error-page files to `components/shared/error-pages/`
- [ ] Update ALL imports referencing moved files (see Import Update Plan below)
- [ ] Run `pnpm build` to verify

### Phase 4: Move Feature Components
**Goal:** Create `features/` folder structure.
**Scope:** ~15 files
**Effort:** 20 min

- [ ] Create `components/features/` with subdirectories: `about/`, `conference/`, `contact/`, `donation/`, `events/`, `homepage/`, `press/`, `support/`, `volunteer/`
- [ ] Move `components/about-hero.tsx` → `components/features/about/about-hero.tsx`
- [ ] Move `components/conference/*` → `components/features/conference/`
- [ ] Move `components/contact-form.tsx` → `components/features/contact/contact-form.tsx`
- [ ] Move `components/contact-form-prefilled.tsx` → `components/features/contact/contact-form-prefilled.tsx`
- [ ] Move `components/donation/donation-form.tsx` → `components/features/donation/donation-form.tsx`
- [ ] Move `components/receipt-preview.tsx` → `components/features/donation/receipt-preview.tsx`
- [ ] Move `components/event-registration-modal.tsx` → `components/features/events/event-registration-modal.tsx`
- [ ] Move `components/hero-carousel.tsx` → `components/features/homepage/hero-carousel.tsx`
- [ ] Move `components/homepage-sections.tsx` → `components/features/homepage/homepage-sections.tsx`
- [ ] Move `components/impact-counter.tsx` → `components/features/homepage/impact-counter.tsx`
- [ ] Move `components/circular-testimonials.tsx` → `components/features/homepage/circular-testimonials.tsx`
- [ ] Move `components/home-faqs.tsx` → `components/features/homepage/home-faqs.tsx`
- [ ] Move `components/home-accessibility-button.tsx` → `components/features/homepage/home-accessibility-button.tsx`
- [ ] Move `components/development-notice-modal.tsx` → `components/features/homepage/development-notice-modal.tsx`
- [ ] Move `components/intro-video.tsx` → `components/features/homepage/intro-video.tsx`
- [ ] Move `components/resource-downloads.tsx` → `components/features/press/resource-downloads.tsx`
- [ ] Move `components/support-form.tsx` → `components/features/support/support-form.tsx`
- [ ] Move `components/volunteer-form.tsx` → `components/features/volunteer/volunteer-form.tsx`
- [ ] Update ALL imports referencing moved files
- [ ] Run `pnpm build` to verify

### Phase 5: Reorganize Admin Components
**Goal:** Split flat admin folder into logical subfolders.
**Scope:** ~40 files
**Effort:** 30 min

- [ ] Create `components/admin/layout/`, `components/admin/auth/`, `components/admin/forms/`, `components/admin/settings/`, `components/admin/actions/`, `components/admin/modals/`, `components/admin/notifications/`, `components/admin/media/`, `components/admin/conference/`
- [ ] Move admin layout files (4 files)
- [ ] Move admin auth files (4 files)
- [ ] Move admin form files (12 files + rich-text-editor folder)
- [ ] Move admin settings files (4 files)
- [ ] Move admin action files (8 files)
- [ ] Move admin modal files (5 files)
- [ ] Move admin notification files (3 files)
- [ ] Move admin media files (3 files)
- [ ] Move admin conference files (2 files)
- [ ] Move admin support files (support-actions, support-toggle → admin/support/)
- [ ] Rename `admin/homepage-manager/HomepageManagerClient.tsx` → `homepage-manager-client.tsx` (PascalCase → kebab-case)
- [ ] Rename all 15 files in `admin/homepage-manager/components/` from PascalCase to kebab-case (see section 4.6)
- [ ] Update imports in `admin/homepage-manager/homepage-manager-client.tsx` for renamed sub-components
- [ ] Update imports in `app/admin/homepage/page.tsx` for renamed HomepageManagerClient
- [ ] Update ALL imports referencing moved admin files
- [ ] Run `pnpm build` to verify

### Phase 6: Rename Error Pages to kebab-case
**Goal:** Fix PascalCase naming in error-pages.
**Scope:** 5 files
**Effort:** 5 min

- [ ] Rename `GenericErrorPage.tsx` → `generic-error-page.tsx`
- [ ] Rename `NetworkErrorPage.tsx` → `network-error-page.tsx`
- [ ] Rename `NotFoundErrorPage.tsx` → `not-found-error-page.tsx`
- [ ] Rename `ServerErrorPage.tsx` → `server-error-page.tsx`
- [ ] Rename `UnauthorizedErrorPage.tsx` → `unauthorized-error-page.tsx`
- [ ] Update all imports (app/error.tsx, app/global-error.tsx, app/not-found.tsx, demo/errors/*)
- [ ] Run `pnpm build` to verify

### Phase 7: Final Cleanup & Verification
**Goal:** Ensure everything is clean and consistent.
**Scope:** Full codebase
**Effort:** 15 min

- [ ] Run `pnpm build` — zero errors
- [ ] Run `pnpm lint` — zero new errors
- [ ] Verify no empty directories remain (e.g., old `components/photo-wall/`, `components/donation/`, `components/error-pages/`)
- [ ] Verify no orphaned files remain in old locations
- [ ] Search for any remaining `@/components/ui/event-card` style imports (domain cards now in shared/)
- [ ] Update `components.json` if it references any moved paths (shadcn/ui config)
- [ ] Delete empty directories

---

## 6. Import Update Plan

### Search Strategy

For each moved file, use this grep pattern to find ALL imports that need updating:

```
grep -r "from [\"']@/components/<old-path>" --include="*.tsx" --include="*.ts"
```

### Phase 2 Imports to Update (Layout)

| Moved File | Files Needing Import Update |
|-----------|---------------------------|
| `navbar-wrapper.tsx` → `layout/` | `app/(public)/layout.tsx` |
| `footer.tsx` → `layout/` | `app/(public)/layout.tsx` |
| `navbar.tsx` → `layout/` | `components/layout/navbar-wrapper.tsx` (after move) |
| `section.tsx` → `layout/` | `app/(public)/events/page.tsx`, `app/(public)/stories/[slug]/page.tsx`, `app/(public)/press/page.tsx`, `app/(public)/contact/page.tsx`, `app/(public)/support/page.tsx`, `app/(public)/about/page.tsx`, `components/homepage-sections.tsx`, `components/home-faqs.tsx` |

### Phase 3 Imports to Update (Shared)

| Moved File | Files Needing Import Update |
|-----------|---------------------------|
| `social-icons.tsx` → `shared/` | `components/layout/footer.tsx`, `components/podcasts/*` (5+ files), `components/admin/podcast-form.tsx`, `components/admin/site-settings-form.tsx` |
| `scroll-animations.tsx` → `shared/` | `components/features/homepage/homepage-sections.tsx`, `components/features/homepage/home-faqs.tsx` |
| `newsletter-form.tsx` → `shared/` | `components/layout/footer.tsx` |
| `brush-stroke.tsx` → `shared/decorations/` | `app/(public)/our-story/page.tsx`, `app/(public)/our-story/AnimatedBrushQuote.tsx`, `app/(public)/impact/ImpactClientPage.tsx`, `components/features/homepage/homepage-sections.tsx` |
| Domain cards → `shared/cards/` | Multiple admin pages, public pages (search per card) |
| Error pages → `shared/error-pages/` | `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`, `app/demo/errors/*` (6 files) |

### Phase 4 Imports to Update (Features)

| Moved File | Files Needing Import Update |
|-----------|---------------------------|
| `hero-carousel.tsx` → `features/homepage/` | `app/(public)/page.tsx` |
| `homepage-sections.tsx` → `features/homepage/` | `app/(public)/page.tsx` |
| `contact-form.tsx` → `features/contact/` | `components/features/contact/contact-form-prefilled.tsx` (after move) |
| `contact-form-prefilled.tsx` → `features/contact/` | `app/(public)/contact/page.tsx` |
| `donation-form.tsx` → `features/donation/` | `app/(public)/donate/page.tsx` |
| `about-hero.tsx` → `features/about/` | `app/(public)/about/page.tsx` |
| `resource-downloads.tsx` → `features/press/` | `app/(public)/about/page.tsx`, `app/(public)/press/page.tsx` |

### Verification After Each Phase

1. Run `pnpm build` — must succeed with zero errors
2. Run `pnpm lint` — must have no new errors
3. Spot-check 3-5 random imports per phase to confirm correctness

---

## 7. Risk Section

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Broken imports after move** | High | High | Run `pnpm build` after EVERY phase. Use grep to find all imports before moving. |
| **Case-sensitivity on Linux deploy** | Medium | High | Windows is case-insensitive, Linux (Vercel) is not. Renaming `GenericErrorPage.tsx` → `generic-error-page.tsx` is safe since the import path changes too. Never rely on case-insensitive matching. |
| **Circular imports** | Low | Medium | Current codebase has no circular imports. The new structure maintains the same dependency direction (ui → shared → features → admin). |
| **Barrel file issues** | Low | Low | We are NOT introducing barrel/index.ts files in this migration. Direct imports are used everywhere. |
| **shadcn/ui CLI breaks** | Medium | Medium | `components.json` may reference `components/ui/` path. Verify it still works after moving domain cards out of `ui/`. The shadcn CLI only adds to `ui/`, so removing non-shadcn files from `ui/` is safe. |
| **Git history becomes hard to follow** | Low | Low | Use `git mv` for moves so git tracks renames. Each phase is a separate commit. |
| **Merge conflicts with in-progress work** | Medium | Medium | Coordinate timing. Do not reorganize while other PRs are in flight. Each phase is small enough to rebase if needed. |
| **Test failures** | Low | Medium | Run `pnpm test` after each phase. Tests import from `@/components/` paths. |

---

## 8. Open Decisions

| Decision | Options | Recommendation | Needed From You |
|----------|---------|---------------|-----------------|
| **Barrel exports (index.ts)?** | A) No barrels (direct imports everywhere) <br> B) Barrels per folder (e.g., `components/shared/cards/index.ts`) | **DECIDED: A — No barrels.** Current codebase uses direct imports. Barrels add indirection and can cause circular imports. | ✅ Confirmed |
| **Strict feature vs type split?** | A) Feature-first (what we proposed) <br> B) Type-first (all cards together, all forms together) | **DECIDED: A — Feature-first.** Admin is already feature-separated. Public components map to routes. | ✅ Confirmed |
| **Delete unused components now?** | A) Yes, delete in Phase 1 <br> B) Move to `archive/` folder first | **DECIDED: B — Move to archive first.** Keep them accessible during testing, delete in a later cleanup pass after reorg is verified stable. | ✅ Confirmed |
| **Podcasts: top-level or under features/?** | A) `components/podcasts/` (current, keep as top-level) <br> B) `components/features/podcasts/` | **DECIDED: A — Keep top-level.** 20 files is large enough. Features/ has smaller groups. | ✅ Confirmed |
| **Homepage-manager-client duplication** | A) Delete the root-level `admin/homepage-manager-client.tsx` <br> B) Keep both | **DECIDED: A — Delete.** Only the subfolder version is imported. | ✅ Confirmed |

---

## 9. Assumptions

1. **No `src/` directory** — components live at `components/` (root level), confirmed by directory listing
2. **Path alias `@/*`** — maps to project root per `tsconfig.json`
3. **shadcn/ui** — the `ui/` folder follows shadcn/ui conventions; `components.json` exists at root
4. **No dynamic imports of components** — grep for `dynamic(` found zero hits. Grep for `import(` found 5 hits, but all are dynamic imports of **libraries** (`@react-pdf/renderer`, `@/lib/receipts/receipt-document`, `stripe`), not component files. No component reorganization step is affected.
5. **Vercel deployment** — Linux-based, so case-sensitivity matters for file renames
6. **No barrel files exist** — confirmed by searching for `index.ts` in components/
7. **`photo-wall/` folder contains only one file** — can be flattened
8. **`donation/` folder contains only one file** — will be merged into `features/donation/`
9. **`ui/use-mobile.tsx` and `hooks/use-mobile.ts` are duplicates** — the hooks/ version is the canonical location
10. **The `admin/homepage-manager-client.tsx` (1234 lines) is superseded** by the subfolder version — only the subfolder version is imported anywhere

---

## 10. Revision Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-07-22 | Deferred default→named export conversion to future cleanup | Converting export styles doubles the blast radius of each move. Mixing structural moves with export changes makes breakage harder to isolate. Scope note added to Section 3. |
| 2026-07-22 | Removed `receipt-preview.tsx` and `global-video-modal.tsx` from Open Decisions | Both had final locations already assigned in the mapping table (features/donation/ and shared/ respectively). Listing them as open decisions was contradictory. |
| 2026-07-22 | Rewrote compound component rule in Section 3 | Original rule said compound components should use prefix directories, but all 5 current compound files in ui/ (field, item, input-group, empty, button-group) are flat and work well. New rule: flat files are fine; folders only when sub-components have independent imports/logic. |
| 2026-07-22 | Removed duplicate `conference-settings-form.tsx` entry | Appeared twice in both the folder tree (Section 2) and migration mapping table (Section 4.4). |
| 2026-07-22 | Corrected dynamic imports assumption | Original claim "no dynamic imports" was based on grepping for `from "` which misses `import()` syntax. Re-searched specifically for `dynamic(` and `import(` — found 5 `import()` calls but all are library imports (stripe, @react-pdf/renderer), not component imports. Assumption corrected in Section 9. |
| 2026-07-22 | Moved receipt-preview.tsx from Phase 3 to Phase 4 checklist | It belongs in `features/donation/` (confirmed decision), so it should be moved in the features phase, not the shared phase. |
| 2026-07-22 | Confirmed all 5 open decisions | User chose: no barrels, feature-first, archive unused (not delete), keep podcasts top-level, delete superseded homepage-manager-client. |
| 2026-07-22 | Changed Phase 1 from "delete" to "move to archive" | User preference: unused components go to `components/_archive/` for safekeeping during testing, to be deleted in a later cleanup pass after reorg is verified stable. |
| 2026-07-22 | Added section 4.6: homepage-manager PascalCase → kebab-case | Section 3 rule says "All component files use kebab-case" but 15 files in admin/homepage-manager/components/ were PascalCase and not being renamed. Added explicit rename mapping and Phase 5 tasks to close the gap. |
