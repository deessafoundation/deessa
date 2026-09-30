---
title: "Component Reorganization Plan"
description: " Status: Planning only â€” no files moved or renamed yet."
owner: "deessa Team"
status: archived
category: archived
audience: admin
last_updated: 2026-09-12
---
# Component Reorganization Plan

> **Status:** Planning only â€” no files moved or renamed yet.
> **Created:** 2026-07-22
> **Stack:** Next.js 16 + Supabase + Tailwind CSS + Radix UI (shadcn/ui pattern)
> **Path alias:** `@/*` â†’ project root (tsconfig.json)

---

## 1. Current State Analysis

### 1.1 Full Components Inventory

**Root-level components (`components/`) â€” 28 files:**

| File | Export(s) | Used In | Status |
|------|-----------|---------|--------|
| `about-hero.tsx` | `AboutHero` | `app/(public)/about/page.tsx` |  Used |
| `accessibility-toolbar.tsx` | `AccessibilityToolbar` | â€” | âš ï¸ **UNUSED** |
| `circular-testimonials.tsx` | `CircularTestimonials` | `components/homepage-sections.tsx` |  Used |
| `contact-form.tsx` | `ContactForm` | `components/contact-form-prefilled.tsx` |  Used (internal) |
| `contact-form-prefilled.tsx` | `ContactFormPrefilled` | `app/(public)/contact/page.tsx` |  Used |
| `development-notice-modal.tsx` | `DevelopmentNoticeModal` | `app/(public)/layout.tsx` |  Used |
| `donation-amount-picker.tsx` | `DonationAmountPicker` | â€” | âš ï¸ **UNUSED** |
| `event-preview-card.tsx` | `EventPreviewCard` | â€” | âš ï¸ **UNUSED** |
| `event-registration-modal.tsx` | `EventRegistrationModal` | `app/(public)/events/page.tsx` |  Used |
| `footer.tsx` | `Footer` | `app/(public)/layout.tsx` |  Used |
| `global-video-modal.tsx` | `GlobalVideoModal` | `app/(public)/layout.tsx` |  Used |
| `hero-carousel.tsx` | `HeroCarousel`, `HeroSlide` | `app/(public)/page.tsx` |  Used |
| `hero-video.tsx` | `HeroVideo` | â€” | âš ï¸ **UNUSED** |
| `home-accessibility-button.tsx` | `HomeAccessibilityButton` | `app/(public)/page.tsx` |  Used |
| `home-faqs.tsx` | `HomeFAQs` | `app/(public)/page.tsx` |  Used |
| `home-testimonials-slider.tsx` | `HomeTestimonialsSlider` | â€” | âš ï¸ **UNUSED** |
| `homepage-sections.tsx` | 9 exports (ImpactStatsBar, OurStorySection, etc.) | `app/(public)/page.tsx` |  Used |
| `impact-counter.tsx` | `ImpactCounter` | `components/homepage-sections.tsx` |  Used |
| `intro-video.tsx` | `IntroVideo` | `app/(public)/layout.tsx` |  Used |
| `navbar-wrapper.tsx` | `NavbarWrapper` | `app/(public)/layout.tsx` |  Used |
| `navbar.tsx` | `Navbar` | `components/navbar-wrapper.tsx` |  Used (internal) |
| `newsletter-form.tsx` | `NewsletterForm` | `components/footer.tsx` |  Used (internal) |
| `partner-strip.tsx` | `PartnerStrip` | â€” | âš ï¸ **UNUSED** |
| `receipt-preview.tsx` | `ReceiptPreview` | `app/(public)/donate/success/success-content.tsx` |  Used |
| `resource-downloads.tsx` | `ResourceDownloads`, `brandResources`, `legalResources` | `app/(public)/about/page.tsx`, `app/(public)/press/page.tsx` |  Used |
| `scroll-animations.tsx` | 8 exports (ScrollReveal, CountUp, etc.) | `components/homepage-sections.tsx`, `components/home-faqs.tsx` |  Used |
| `secret-key-listener.tsx` | `SecretKeyListener` | `app/(public)/page.tsx` |  Used |
| `share-button.tsx` | `ShareButton` | `app/(public)/podcasts/[slug]/page.tsx` |  Used |
| `social-icons.tsx` | Facebook, Twitter, Instagram, Youtube, Linkedin | Multiple podcast, footer, site-settings files |  Used |
| `stories-carousel.tsx` | `StoriesCarousel` | â€” | âš ï¸ **UNUSED** |
| `support-form.tsx` | `SupportForm` | `app/(public)/support/page.tsx` |  Used |
| `theme-provider.tsx` | `ThemeProvider` | â€” | âš ï¸ **UNUSED** |
| `volunteer-form.tsx` | `VolunteerForm` | `app/(public)/get-involved/page.tsx` |  Used |

**UI primitives (`components/ui/`) â€” 67 files:**

Standard shadcn/ui components: `accordion`, `alert-dialog`, `alert`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input`, `input-otp`, `kbd`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toaster`, `toggle-group`, `toggle`, `tooltip`

Custom additions in `ui/` (non-standard shadcn):
- `animated-brush-quote.tsx` â€” decorative component
- `brush-stroke.tsx` â€” decorative component
- `button-group.tsx` â€” compound component
- `empty.tsx` â€” compound component
- `event-card.tsx` â€” domain card
- `field.tsx` â€” compound form component
- `initiative-card.tsx` â€” domain card
- `input-group.tsx` â€” compound component
- `item.tsx` â€” compound component
- `print-button.tsx` â€” utility button
- `project-card.tsx` â€” domain card
- `section.tsx` â€” layout component
- `spinner.tsx` â€” utility component
- `stat-card.tsx` â€” domain card
- `story-card.tsx` â€” domain card
- `team-member-card.tsx` â€” domain card
- `use-mobile.tsx` â€” **hook misplaced in ui/**
- `use-toast.ts` â€” **hook misplaced in ui/**

**Admin components (`components/admin/`) â€” 52 files + subfolders:**

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
- `homepage-manager-client.tsx` (1234 lines â€” **duplicate concern**)
- `media-library-client.tsx`, `media-picker.tsx` (**media-picker unused**)
- `notification-bell.tsx`, `notification-bell-realtime.tsx`, `notification-center-client.tsx`
- `rich-text-editor.tsx`, `support-toggle.tsx`, `video-picker.tsx`

Admin subfolders:
- `admin/donations/` â€” 13 files (review dashboard, transaction detail, etc.)
- `admin/homepage-manager/` â€” `HomepageManagerClient.tsx` + `components/` (15 sub-components)
- `admin/rich-text-editor/` â€” toolbar, dialogs, extensions (6), hooks (2)
- `admin/support/` â€” 4 files (assign-modal, delete, show-archived, detail)

**Feature folders:**
- `components/conference/` â€” 6 files (registration form + step components)
- `components/donation/` â€” 1 file (`donation-form.tsx`)
- `components/error-pages/` â€” 5 components + 1 image (PascalCase naming)
- `components/photo-wall/` â€” 1 file (`photo-wall.tsx`)
- `components/podcasts/` â€” 20 files

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
| **Two HomepageManagerClient** | `admin/homepage-manager-client.tsx` (1234 lines) AND `admin/homepage-manager/HomepageManagerClient.tsx` (398 lines) â€” only the subfolder version is imported |
| **Two use-mobile definitions** | `components/ui/use-mobile.tsx` AND `hooks/use-mobile.ts` |
| **Two use-toast definitions** | `components/ui/use-toast.ts` AND `hooks/use-toast.ts` |
| **Two notification bell components** | `admin/notification-bell.tsx` AND `admin/notification-bell-realtime.tsx` â€” both exist, unclear if both are used |
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
â”œâ”€â”€ ui/                          # Generic, reusable UI primitives (shadcn/ui + custom)
â”‚   â”œâ”€â”€ accordion.tsx
â”‚   â”œâ”€â”€ alert-dialog.tsx
â”‚   â”œâ”€â”€ alert.tsx
â”‚   â”œâ”€â”€ aspect-ratio.tsx
â”‚   â”œâ”€â”€ avatar.tsx
â”‚   â”œâ”€â”€ badge.tsx
â”‚   â”œâ”€â”€ breadcrumb.tsx
â”‚   â”œâ”€â”€ button.tsx
â”‚   â”œâ”€â”€ button-group.tsx
â”‚   â”œâ”€â”€ calendar.tsx
â”‚   â”œâ”€â”€ card.tsx
â”‚   â”œâ”€â”€ carousel.tsx
â”‚   â”œâ”€â”€ chart.tsx
â”‚   â”œâ”€â”€ checkbox.tsx
â”‚   â”œâ”€â”€ collapsible.tsx
â”‚   â”œâ”€â”€ command.tsx
â”‚   â”œâ”€â”€ context-menu.tsx
â”‚   â”œâ”€â”€ dialog.tsx
â”‚   â”œâ”€â”€ drawer.tsx
â”‚   â”œâ”€â”€ dropdown-menu.tsx
â”‚   â”œâ”€â”€ empty.tsx
â”‚   â”œâ”€â”€ field.tsx
â”‚   â”œâ”€â”€ form.tsx
â”‚   â”œâ”€â”€ hover-card.tsx
â”‚   â”œâ”€â”€ input.tsx
â”‚   â”œâ”€â”€ input-group.tsx
â”‚   â”œâ”€â”€ input-otp.tsx
â”‚   â”œâ”€â”€ item.tsx
â”‚   â”œâ”€â”€ kbd.tsx
â”‚   â”œâ”€â”€ label.tsx
â”‚   â”œâ”€â”€ menubar.tsx
â”‚   â”œâ”€â”€ navigation-menu.tsx
â”‚   â”œâ”€â”€ pagination.tsx
â”‚   â”œâ”€â”€ popover.tsx
â”‚   â”œâ”€â”€ progress.tsx
â”‚   â”œâ”€â”€ radio-group.tsx
â”‚   â”œâ”€â”€ resizable.tsx
â”‚   â”œâ”€â”€ scroll-area.tsx
â”‚   â”œâ”€â”€ select.tsx
â”‚   â”œâ”€â”€ separator.tsx
â”‚   â”œâ”€â”€ sheet.tsx
â”‚   â”œâ”€â”€ sidebar.tsx
â”‚   â”œâ”€â”€ skeleton.tsx
â”‚   â”œâ”€â”€ slider.tsx
â”‚   â”œâ”€â”€ sonner.tsx
â”‚   â”œâ”€â”€ spinner.tsx
â”‚   â”œâ”€â”€ switch.tsx
â”‚   â”œâ”€â”€ table.tsx
â”‚   â”œâ”€â”€ tabs.tsx
â”‚   â”œâ”€â”€ textarea.tsx
â”‚   â”œâ”€â”€ toast.tsx
â”‚   â”œâ”€â”€ toaster.tsx
â”‚   â”œâ”€â”€ toggle.tsx
â”‚   â”œâ”€â”€ toggle-group.tsx
â”‚   â””â”€â”€ tooltip.tsx
â”‚
â”œâ”€â”€ layout/                      # App shell: navbar, footer, wrappers
â”‚   â”œâ”€â”€ footer.tsx
â”‚   â”œâ”€â”€ navbar.tsx
â”‚   â”œâ”€â”€ navbar-wrapper.tsx
â”‚   â””â”€â”€ section.tsx
â”‚
â”œâ”€â”€ features/                    # Feature-specific UI (public-facing)
â”‚   â”œâ”€â”€ conference/
â”‚   â”‚   â”œâ”€â”€ conference-registration-form.tsx
â”‚   â”‚   â”œâ”€â”€ step-progress-bar.tsx
â”‚   â”‚   â”œâ”€â”€ step1-personal-details.tsx
â”‚   â”‚   â”œâ”€â”€ step2-participation.tsx
â”‚   â”‚   â”œâ”€â”€ step3-additional-info.tsx
â”‚   â”‚   â””â”€â”€ step4-review.tsx
â”‚   â”œâ”€â”€ donation/
â”‚   â”‚   â”œâ”€â”€ donation-form.tsx
â”‚   â”‚   â””â”€â”€ receipt-preview.tsx
â”‚   â”œâ”€â”€ homepage/
â”‚   â”‚   â”œâ”€â”€ hero-carousel.tsx
â”‚   â”‚   â”œâ”€â”€ homepage-sections.tsx
â”‚   â”‚   â”œâ”€â”€ impact-counter.tsx
â”‚   â”‚   â”œâ”€â”€ circular-testimonials.tsx
â”‚   â”‚   â”œâ”€â”€ home-faqs.tsx
â”‚   â”‚   â””â”€â”€ partner-strip.tsx
â”‚   â”œâ”€â”€ about/
â”‚   â”‚   â””â”€â”€ about-hero.tsx
â”‚   â”œâ”€â”€ contact/
â”‚   â”‚   â”œâ”€â”€ contact-form.tsx
â”‚   â”‚   â””â”€â”€ contact-form-prefilled.tsx
â”‚   â”œâ”€â”€ support/
â”‚   â”‚   â””â”€â”€ support-form.tsx
â”‚   â”œâ”€â”€ volunteer/
â”‚   â”‚   â””â”€â”€ volunteer-form.tsx
â”‚   â”œâ”€â”€ press/
â”‚   â”‚   â””â”€â”€ resource-downloads.tsx
â”‚   â””â”€â”€ events/
â”‚       â””â”€â”€ event-registration-modal.tsx
â”‚
â”œâ”€â”€ shared/                      # Cross-feature shared components
â”‚   â”œâ”€â”€ cards/
â”‚   â”‚   â”œâ”€â”€ event-card.tsx
â”‚   â”‚   â”œâ”€â”€ initiative-card.tsx
â”‚   â”‚   â”œâ”€â”€ project-card.tsx
â”‚   â”‚   â”œâ”€â”€ stat-card.tsx
â”‚   â”‚   â”œâ”€â”€ story-card.tsx
â”‚   â”‚   â””â”€â”€ team-member-card.tsx
â”‚   â”œâ”€â”€ decorations/
â”‚   â”‚   â”œâ”€â”€ animated-brush-quote.tsx
â”‚   â”‚   â””â”€â”€ brush-stroke.tsx
â”‚   â”œâ”€â”€ error-pages/
â”‚   â”‚   â”œâ”€â”€ generic-error-page.tsx
â”‚   â”‚   â”œâ”€â”€ network-error-page.tsx
â”‚   â”‚   â”œâ”€â”€ not-found-error-page.tsx
â”‚   â”‚   â”œâ”€â”€ server-error-page.tsx
â”‚   â”‚   â”œâ”€â”€ unauthorized-error-page.tsx
â”‚   â”‚   â””â”€â”€ astronaut.png
â”‚   â”œâ”€â”€ social-icons.tsx
â”‚   â”œâ”€â”€ share-button.tsx
â”‚   â”œâ”€â”€ newsletter-form.tsx
â”‚   â”œâ”€â”€ print-button.tsx
â”‚   â””â”€â”€ scroll-animations.tsx
â”‚
â”œâ”€â”€ admin/                       # Admin panel components
â”‚   â”œâ”€â”€ layout/
â”‚   â”‚   â”œâ”€â”€ admin-header.tsx
â”‚   â”‚   â”œâ”€â”€ admin-layout-content.tsx
â”‚   â”‚   â”œâ”€â”€ admin-nav-config.ts
â”‚   â”‚   â””â”€â”€ admin-sidebar.tsx
â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”œâ”€â”€ admin-user-form.tsx
â”‚   â”‚   â”œâ”€â”€ admin-user-edit-form.tsx
â”‚   â”‚   â”œâ”€â”€ password-form.tsx
â”‚   â”‚   â””â”€â”€ permission-gate.tsx
â”‚   â”œâ”€â”€ forms/
â”‚   â”‚   â”œâ”€â”€ event-form.tsx
â”‚   â”‚   â”œâ”€â”€ podcast-form.tsx
â”‚   â”‚   â”œâ”€â”€ story-form.tsx
â”‚   â”‚   â”œâ”€â”€ project-form.tsx
â”‚   â”‚   â”œâ”€â”€ partner-form.tsx
â”‚   â”‚   â”œâ”€â”€ stat-form.tsx
â”‚   â”‚   â”œâ”€â”€ team-member-form.tsx
â”‚   â”‚   â”œâ”€â”€ profile-form.tsx
â”‚   â”‚   â”œâ”€â”€ setup-form.tsx
â”‚   â”‚   â”œâ”€â”€ file-upload.tsx
â”‚   â”‚   â”œâ”€â”€ rich-text-editor.tsx
â”‚   â”‚   â””â”€â”€ rich-text-editor/         # (keep as-is, already well-structured)
â”‚   â”œâ”€â”€ settings/
â”‚   â”‚   â”œâ”€â”€ site-settings-form.tsx
â”‚   â”‚   â”œâ”€â”€ organization-settings-form.tsx
â”‚   â”‚   â”œâ”€â”€ conference-settings-form.tsx
â”‚   â”‚   â””â”€â”€ payment-settings-form.tsx
â”‚   â”œâ”€â”€ actions/
â”‚   â”‚   â”œâ”€â”€ delete-podcast-button.tsx
â”‚   â”‚   â”œâ”€â”€ delete-registration-button.tsx
â”‚   â”‚   â”œâ”€â”€ delete-story-button.tsx
â”‚   â”‚   â”œâ”€â”€ partner-actions.tsx
â”‚   â”‚   â”œâ”€â”€ project-actions.tsx
â”‚   â”‚   â”œâ”€â”€ stat-actions.tsx
â”‚   â”‚   â”œâ”€â”€ volunteer-actions.tsx
â”‚   â”‚   â””â”€â”€ conference-status-actions.tsx
â”‚   â”œâ”€â”€ modals/
â”‚   â”‚   â”œâ”€â”€ internal-note-modal.tsx
â”‚   â”‚   â”œâ”€â”€ reply-modal.tsx
â”‚   â”‚   â”œâ”€â”€ story-preview-modal.tsx
â”‚   â”‚   â”œâ”€â”€ support-screenshot-modal.tsx
â”‚   â”‚   â””â”€â”€ support-toggle-modal.tsx
â”‚   â”œâ”€â”€ notifications/
â”‚   â”‚   â”œâ”€â”€ notification-bell.tsx
â”‚   â”‚   â”œâ”€â”€ notification-bell-realtime.tsx
â”‚   â”‚   â””â”€â”€ notification-center-client.tsx
â”‚   â”œâ”€â”€ donations/
â”‚   â”‚   â”œâ”€â”€ activity-timeline.tsx
â”‚   â”‚   â”œâ”€â”€ donations-table-client.tsx
â”‚   â”‚   â”œâ”€â”€ donor-information.tsx
â”‚   â”‚   â”œâ”€â”€ error-boundary.tsx
â”‚   â”‚   â”œâ”€â”€ payment-technical.tsx
â”‚   â”‚   â”œâ”€â”€ review-action-dialog.tsx
â”‚   â”‚   â”œâ”€â”€ review-dashboard-client.tsx
â”‚   â”‚   â”œâ”€â”€ review-notes-section.tsx
â”‚   â”‚   â”œâ”€â”€ review-status-card.tsx
â”‚   â”‚   â”œâ”€â”€ status-change-modal.tsx
â”‚   â”‚   â”œâ”€â”€ transaction-detail-client.tsx
â”‚   â”‚   â”œâ”€â”€ transaction-header.tsx
â”‚   â”‚   â””â”€â”€ transaction-overview.tsx
â”‚   â”œâ”€â”€ support/
â”‚   â”‚   â”œâ”€â”€ assign-modal.tsx
â”‚   â”‚   â”œâ”€â”€ delete-support-button.tsx
â”‚   â”‚   â”œâ”€â”€ show-archived-button.tsx
â”‚   â”‚   â”œâ”€â”€ support-detail-client.tsx
â”‚   â”‚   â””â”€â”€ support-actions.tsx
â”‚   â”œâ”€â”€ homepage-manager/
â”‚   â”‚   â”œâ”€â”€ homepage-manager-client.tsx
â”‚   â”‚   â””â”€â”€ components/
â”‚   â”‚       â”œâ”€â”€ banners-manager.tsx
â”‚   â”‚       â”œâ”€â”€ color-picker.tsx
â”‚   â”‚       â”œâ”€â”€ cta-cards-manager.tsx
â”‚   â”‚       â”œâ”€â”€ featured-stories-manager.tsx
â”‚   â”‚       â”œâ”€â”€ flags-manager.tsx
â”‚   â”‚       â”œâ”€â”€ hero-carousel-manager.tsx
â”‚   â”‚       â”œâ”€â”€ hero-ctas-manager.tsx
â”‚   â”‚       â”œâ”€â”€ hero-manager.tsx
â”‚   â”‚       â”œâ”€â”€ marquee-manager.tsx
â”‚   â”‚       â”œâ”€â”€ programs-manager.tsx
â”‚   â”‚       â”œâ”€â”€ seo-manager.tsx
â”‚   â”‚       â”œâ”€â”€ stats-manager.tsx
â”‚   â”‚       â”œâ”€â”€ testimonials-manager.tsx
â”‚   â”‚       â”œâ”€â”€ timeline-manager.tsx
â”‚   â”‚       â””â”€â”€ trust-indicators-manager.tsx
â”‚   â”œâ”€â”€ media/
â”‚   â”‚   â”œâ”€â”€ gallery-manager.tsx
â”‚   â”‚   â””â”€â”€ media-library-client.tsx
â”‚   â””â”€â”€ conference/
â”‚       â”œâ”€â”€ conference-notes.tsx
â”‚       â””â”€â”€ conference-quick-actions.tsx
â”‚
â””â”€â”€ podcasts/                    # Podcast feature (large enough for own folder)
    â”œâ”€â”€ podcast-main-hero.tsx
    â”œâ”€â”€ podcast-hero-section.tsx
    â”œâ”€â”€ podcast-card.tsx
    â”œâ”€â”€ podcast-guest-card.tsx
    â”œâ”€â”€ podcast-highlight-card.tsx
    â”œâ”€â”€ podcast-preview-section.tsx
    â”œâ”€â”€ podcast-archive-section.tsx
    â”œâ”€â”€ podcast-latest-episode.tsx
    â”œâ”€â”€ podcast-section.tsx
    â”œâ”€â”€ podcast-sticky-player.tsx
    â”œâ”€â”€ podcast-transcript.tsx
    â”œâ”€â”€ podcast-video-modal.tsx
    â”œâ”€â”€ podcast-share-card.tsx
    â”œâ”€â”€ podcast-grid.tsx
    â”œâ”€â”€ podcast-filter-sidebar.tsx
    â”œâ”€â”€ all-highlights-card.tsx
    â”œâ”€â”€ all-highlights-section.tsx
    â”œâ”€â”€ episodes-page-content.tsx
    â””â”€â”€ highlights-page-content.tsx
```

### Rationale for Each Folder

| Folder | Purpose | Why Separate |
|--------|---------|-------------|
| `ui/` | Generic, domain-agnostic primitives | shadcn/ui convention; never contains business logic |
| `layout/` | App shell (navbar, footer, section wrapper) | These appear on every page; not feature-specific |
| `features/` | Public-facing feature components, grouped by feature | Each feature (conference, donation, homepage) has its own folder; keeps related files together |
| `shared/` | Components used across multiple features | Cards, error pages, social icons, scroll animations â€” used in many places |
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
- **Rule:** Compound components (multiple co-exported pieces from one file) stay as flat files in `ui/`. A folder is only warranted when a component has its own sub-components with independent imports/logic (e.g., `rich-text-editor/` with separate toolbar, dialogs, extensions). All current compound components in `ui/` (`field.tsx` with 10 exports, `item.tsx` with 10 exports, `input-group.tsx` with 6 exports, `empty.tsx` with 6 exports, `button-group.tsx` with 4 exports) remain flat â€” they follow the shadcn/ui convention and work well as single files.

> **Scope note â€” default vs named exports:** Converting `export default` to named exports is **deferred to a separate future cleanup** and is NOT part of this migration's checklists. The current plan moves and renames files only; it does not change export styles. Converting exports would require updating every import site simultaneously, which doubles the blast radius and makes it harder to isolate breakage. Files currently using `export default` (e.g., `PhotoWall`, `GenericErrorPage`, all `podcasts/*.tsx`, all `admin/homepage-manager/components/*.tsx`) keep their export style through this reorg.

### Co-located Files
- **Rule:** Styles are Tailwind-only (no co-located CSS files)
- **Rule:** Tests (if added) go in `__tests__/` at project root, not co-located
- **Rule:** Types are co-located as `*.types.ts` only when tightly coupled to one component

---

## 4. Migration Mapping Table

### 4.1 Root Components â†’ New Locations

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

### 4.2 UI Components â€” Stay in `ui/` (no move needed)

All 67 `ui/` files stay. Remove misplaced items:
- `components/ui/use-mobile.tsx` â†’ **DELETE** (duplicate of `hooks/use-mobile.ts`)
- `components/ui/use-toast.ts` â†’ **DELETE** (duplicate of `hooks/use-toast.ts`)

### 4.3 UI Domain Cards â†’ `shared/cards/`

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

### 4.4 Admin Components â†’ `admin/` Subfolders

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

### 4.5 Error Pages â€” Rename to kebab-case

| Current Path | New Path |
|-------------|----------|
| `components/error-pages/GenericErrorPage.tsx` | `components/shared/error-pages/generic-error-page.tsx` |
| `components/error-pages/NetworkErrorPage.tsx` | `components/shared/error-pages/network-error-page.tsx` |
| `components/error-pages/NotFoundErrorPage.tsx` | `components/shared/error-pages/not-found-error-page.tsx` |
| `components/error-pages/ServerErrorPage.tsx` | `components/shared/error-pages/server-error-page.tsx` |
| `components/error-pages/UnauthorizedErrorPage.tsx` | `components/shared/error-pages/unauthorized-error-page.tsx` |
| `components/error-pages/astronaut.png` | `components/shared/error-pages/astronaut.png` |

### 4.6 Admin Homepage Manager â€” Rename PascalCase to kebab-case

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
- [ ] Move `components/accessibility-toolbar.tsx` â†’ `components/_archive/accessibility-toolbar.tsx`
- [ ] Move `components/donation-amount-picker.tsx` â†’ `components/_archive/donation-amount-picker.tsx`
- [ ] Move `components/event-preview-card.tsx` â†’ `components/_archive/event-preview-card.tsx`
- [ ] Move `components/hero-video.tsx` â†’ `components/_archive/hero-video.tsx`
- [ ] Move `components/home-testimonials-slider.tsx` â†’ `components/_archive/home-testimonials-slider.tsx`
- [ ] Move `components/partner-strip.tsx` â†’ `components/_archive/partner-strip.tsx`
- [ ] Move `components/stories-carousel.tsx` â†’ `components/_archive/stories-carousel.tsx`
- [ ] Move `components/theme-provider.tsx` â†’ `components/_archive/theme-provider.tsx`
- [ ] Move `components/ui/use-mobile.tsx` â†’ `components/_archive/use-mobile.tsx` (keep `hooks/use-mobile.ts` as canonical)
- [ ] Move `components/ui/use-toast.ts` â†’ `components/_archive/use-toast.ts` (keep `hooks/use-toast.ts` as canonical)
- [ ] Move `components/admin/media-picker.tsx` â†’ `components/_archive/media-picker.tsx`
- [ ] Move `components/admin/homepage-manager-client.tsx` â†’ `components/_archive/homepage-manager-client.tsx` (superseded)
- [ ] Run `pnpm build` to verify nothing breaks
- [ ] **Future cleanup:** Delete `components/_archive/` after reorg is verified stable

### Phase 2: Move Layout Components
**Goal:** Establish the `layout/` folder with app shell components.
**Scope:** 4 files
**Effort:** 10 min

- [ ] Create `components/layout/` directory
- [ ] Move `components/footer.tsx` â†’ `components/layout/footer.tsx`
- [ ] Move `components/navbar.tsx` â†’ `components/layout/navbar.tsx`
- [ ] Move `components/navbar-wrapper.tsx` â†’ `components/layout/navbar-wrapper.tsx`
- [ ] Move `components/ui/section.tsx` â†’ `components/layout/section.tsx`
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
- [ ] Move `components/social-icons.tsx` â†’ `components/shared/social-icons.tsx`
- [ ] Move `components/share-button.tsx` â†’ `components/shared/share-button.tsx`
- [ ] Move `components/newsletter-form.tsx` â†’ `components/shared/newsletter-form.tsx`
- [ ] Move `components/scroll-animations.tsx` â†’ `components/shared/scroll-animations.tsx`
- [ ] Move `components/secret-key-listener.tsx` â†’ `components/shared/secret-key-listener.tsx`
- [ ] Move `components/global-video-modal.tsx` â†’ `components/shared/global-video-modal.tsx`
- [ ] Move `components/photo-wall/photo-wall.tsx` â†’ `components/shared/photo-wall.tsx` (flatten)
- [ ] Move `components/ui/event-card.tsx` â†’ `components/shared/cards/event-card.tsx`
- [ ] Move `components/ui/initiative-card.tsx` â†’ `components/shared/cards/initiative-card.tsx`
- [ ] Move `components/ui/project-card.tsx` â†’ `components/shared/cards/project-card.tsx`
- [ ] Move `components/ui/stat-card.tsx` â†’ `components/shared/cards/stat-card.tsx`
- [ ] Move `components/ui/story-card.tsx` â†’ `components/shared/cards/story-card.tsx`
- [ ] Move `components/ui/team-member-card.tsx` â†’ `components/shared/cards/team-member-card.tsx`
- [ ] Move `components/ui/print-button.tsx` â†’ `components/shared/print-button.tsx`
- [ ] Move `components/ui/animated-brush-quote.tsx` â†’ `components/shared/decorations/animated-brush-quote.tsx`
- [ ] Move `components/ui/brush-stroke.tsx` â†’ `components/shared/decorations/brush-stroke.tsx`
- [ ] Rename `components/error-pages/GenericErrorPage.tsx` â†’ `components/shared/error-pages/generic-error-page.tsx` (and all PascalCase â†’ kebab-case)
- [ ] Move all error-page files to `components/shared/error-pages/`
- [ ] Update ALL imports referencing moved files (see Import Update Plan below)
- [ ] Run `pnpm build` to verify

### Phase 4: Move Feature Components
**Goal:** Create `features/` folder structure.
**Scope:** ~15 files
**Effort:** 20 min

- [ ] Create `components/features/` with subdirectories: `about/`, `conference/`, `contact/`, `donation/`, `events/`, `homepage/`, `press/`, `support/`, `volunteer/`
- [ ] Move `components/about-hero.tsx` â†’ `components/features/about/about-hero.tsx`
- [ ] Move `components/conference/*` â†’ `components/features/conference/`
- [ ] Move `components/contact-form.tsx` â†’ `components/features/contact/contact-form.tsx`
- [ ] Move `components/contact-form-prefilled.tsx` â†’ `components/features/contact/contact-form-prefilled.tsx`
- [ ] Move `components/donation/donation-form.tsx` â†’ `components/features/donation/donation-form.tsx`
- [ ] Move `components/receipt-preview.tsx` â†’ `components/features/donation/receipt-preview.tsx`
- [ ] Move `components/event-registration-modal.tsx` â†’ `components/features/events/event-registration-modal.tsx`
- [ ] Move `components/hero-carousel.tsx` â†’ `components/features/homepage/hero-carousel.tsx`
- [ ] Move `components/homepage-sections.tsx` â†’ `components/features/homepage/homepage-sections.tsx`
- [ ] Move `components/impact-counter.tsx` â†’ `components/features/homepage/impact-counter.tsx`
- [ ] Move `components/circular-testimonials.tsx` â†’ `components/features/homepage/circular-testimonials.tsx`
- [ ] Move `components/home-faqs.tsx` â†’ `components/features/homepage/home-faqs.tsx`
- [ ] Move `components/home-accessibility-button.tsx` â†’ `components/features/homepage/home-accessibility-button.tsx`
- [ ] Move `components/development-notice-modal.tsx` â†’ `components/features/homepage/development-notice-modal.tsx`
- [ ] Move `components/intro-video.tsx` â†’ `components/features/homepage/intro-video.tsx`
- [ ] Move `components/resource-downloads.tsx` â†’ `components/features/press/resource-downloads.tsx`
- [ ] Move `components/support-form.tsx` â†’ `components/features/support/support-form.tsx`
- [ ] Move `components/volunteer-form.tsx` â†’ `components/features/volunteer/volunteer-form.tsx`
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
- [ ] Move admin support files (support-actions, support-toggle â†’ admin/support/)
- [ ] Rename `admin/homepage-manager/HomepageManagerClient.tsx` â†’ `homepage-manager-client.tsx` (PascalCase â†’ kebab-case)
- [ ] Rename all 15 files in `admin/homepage-manager/components/` from PascalCase to kebab-case (see section 4.6)
- [ ] Update imports in `admin/homepage-manager/homepage-manager-client.tsx` for renamed sub-components
- [ ] Update imports in `app/admin/homepage/page.tsx` for renamed HomepageManagerClient
- [ ] Update ALL imports referencing moved admin files
- [ ] Run `pnpm build` to verify

### Phase 6: Rename Error Pages to kebab-case
**Goal:** Fix PascalCase naming in error-pages.
**Scope:** 5 files
**Effort:** 5 min

- [ ] Rename `GenericErrorPage.tsx` â†’ `generic-error-page.tsx`
- [ ] Rename `NetworkErrorPage.tsx` â†’ `network-error-page.tsx`
- [ ] Rename `NotFoundErrorPage.tsx` â†’ `not-found-error-page.tsx`
- [ ] Rename `ServerErrorPage.tsx` â†’ `server-error-page.tsx`
- [ ] Rename `UnauthorizedErrorPage.tsx` â†’ `unauthorized-error-page.tsx`
- [ ] Update all imports (app/error.tsx, app/global-error.tsx, app/not-found.tsx, demo/errors/*)
- [ ] Run `pnpm build` to verify

### Phase 7: Final Cleanup & Verification
**Goal:** Ensure everything is clean and consistent.
**Scope:** Full codebase
**Effort:** 15 min

- [ ] Run `pnpm build` â€” zero errors
- [ ] Run `pnpm lint` â€” zero new errors
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
| `navbar-wrapper.tsx` â†’ `layout/` | `app/(public)/layout.tsx` |
| `footer.tsx` â†’ `layout/` | `app/(public)/layout.tsx` |
| `navbar.tsx` â†’ `layout/` | `components/layout/navbar-wrapper.tsx` (after move) |
| `section.tsx` â†’ `layout/` | `app/(public)/events/page.tsx`, `app/(public)/stories/[slug]/page.tsx`, `app/(public)/press/page.tsx`, `app/(public)/contact/page.tsx`, `app/(public)/support/page.tsx`, `app/(public)/about/page.tsx`, `components/homepage-sections.tsx`, `components/home-faqs.tsx` |

### Phase 3 Imports to Update (Shared)

| Moved File | Files Needing Import Update |
|-----------|---------------------------|
| `social-icons.tsx` â†’ `shared/` | `components/layout/footer.tsx`, `components/podcasts/*` (5+ files), `components/admin/podcast-form.tsx`, `components/admin/site-settings-form.tsx` |
| `scroll-animations.tsx` â†’ `shared/` | `components/features/homepage/homepage-sections.tsx`, `components/features/homepage/home-faqs.tsx` |
| `newsletter-form.tsx` â†’ `shared/` | `components/layout/footer.tsx` |
| `brush-stroke.tsx` â†’ `shared/decorations/` | `app/(public)/our-story/page.tsx`, `app/(public)/our-story/AnimatedBrushQuote.tsx`, `app/(public)/impact/ImpactClientPage.tsx`, `components/features/homepage/homepage-sections.tsx` |
| Domain cards â†’ `shared/cards/` | Multiple admin pages, public pages (search per card) |
| Error pages â†’ `shared/error-pages/` | `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`, `app/demo/errors/*` (6 files) |

### Phase 4 Imports to Update (Features)

| Moved File | Files Needing Import Update |
|-----------|---------------------------|
| `hero-carousel.tsx` â†’ `features/homepage/` | `app/(public)/page.tsx` |
| `homepage-sections.tsx` â†’ `features/homepage/` | `app/(public)/page.tsx` |
| `contact-form.tsx` â†’ `features/contact/` | `components/features/contact/contact-form-prefilled.tsx` (after move) |
| `contact-form-prefilled.tsx` â†’ `features/contact/` | `app/(public)/contact/page.tsx` |
| `donation-form.tsx` â†’ `features/donation/` | `app/(public)/donate/page.tsx` |
| `about-hero.tsx` â†’ `features/about/` | `app/(public)/about/page.tsx` |
| `resource-downloads.tsx` â†’ `features/press/` | `app/(public)/about/page.tsx`, `app/(public)/press/page.tsx` |

### Verification After Each Phase

1. Run `pnpm build` â€” must succeed with zero errors
2. Run `pnpm lint` â€” must have no new errors
3. Spot-check 3-5 random imports per phase to confirm correctness

---

## 7. Risk Section

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Broken imports after move** | High | High | Run `pnpm build` after EVERY phase. Use grep to find all imports before moving. |
| **Case-sensitivity on Linux deploy** | Medium | High | Windows is case-insensitive, Linux (Vercel) is not. Renaming `GenericErrorPage.tsx` â†’ `generic-error-page.tsx` is safe since the import path changes too. Never rely on case-insensitive matching. |
| **Circular imports** | Low | Medium | Current codebase has no circular imports. The new structure maintains the same dependency direction (ui â†’ shared â†’ features â†’ admin). |
| **Barrel file issues** | Low | Low | We are NOT introducing barrel/index.ts files in this migration. Direct imports are used everywhere. |
| **shadcn/ui CLI breaks** | Medium | Medium | `components.json` may reference `components/ui/` path. Verify it still works after moving domain cards out of `ui/`. The shadcn CLI only adds to `ui/`, so removing non-shadcn files from `ui/` is safe. |
| **Git history becomes hard to follow** | Low | Low | Use `git mv` for moves so git tracks renames. Each phase is a separate commit. |
| **Merge conflicts with in-progress work** | Medium | Medium | Coordinate timing. Do not reorganize while other PRs are in flight. Each phase is small enough to rebase if needed. |
| **Test failures** | Low | Medium | Run `pnpm test` after each phase. Tests import from `@/components/` paths. |

---

## 8. Open Decisions

| Decision | Options | Recommendation | Needed From You |
|----------|---------|---------------|-----------------|
| **Barrel exports (index.ts)?** | A) No barrels (direct imports everywhere) <br> B) Barrels per folder (e.g., `components/shared/cards/index.ts`) | **DECIDED: A â€” No barrels.** Current codebase uses direct imports. Barrels add indirection and can cause circular imports. |  Confirmed |
| **Strict feature vs type split?** | A) Feature-first (what we proposed) <br> B) Type-first (all cards together, all forms together) | **DECIDED: A â€” Feature-first.** Admin is already feature-separated. Public components map to routes. |  Confirmed |
| **Delete unused components now?** | A) Yes, delete in Phase 1 <br> B) Move to `archive/` folder first | **DECIDED: B â€” Move to archive first.** Keep them accessible during testing, delete in a later cleanup pass after reorg is verified stable. |  Confirmed |
| **Podcasts: top-level or under features/?** | A) `components/podcasts/` (current, keep as top-level) <br> B) `components/features/podcasts/` | **DECIDED: A â€” Keep top-level.** 20 files is large enough. Features/ has smaller groups. |  Confirmed |
| **Homepage-manager-client duplication** | A) Delete the root-level `admin/homepage-manager-client.tsx` <br> B) Keep both | **DECIDED: A â€” Delete.** Only the subfolder version is imported. |  Confirmed |

---

## 9. Assumptions

1. **No `src/` directory** â€” components live at `components/` (root level), confirmed by directory listing
2. **Path alias `@/*`** â€” maps to project root per `tsconfig.json`
3. **shadcn/ui** â€” the `ui/` folder follows shadcn/ui conventions; `components.json` exists at root
4. **No dynamic imports of components** â€” grep for `dynamic(` found zero hits. Grep for `import(` found 5 hits, but all are dynamic imports of **libraries** (`@react-pdf/renderer`, `@/lib/receipts/receipt-document`, `stripe`), not component files. No component reorganization step is affected.
5. **Vercel deployment** â€” Linux-based, so case-sensitivity matters for file renames
6. **No barrel files exist** â€” confirmed by searching for `index.ts` in components/
7. **`photo-wall/` folder contains only one file** â€” can be flattened
8. **`donation/` folder contains only one file** â€” will be merged into `features/donation/`
9. **`ui/use-mobile.tsx` and `hooks/use-mobile.ts` are duplicates** â€” the hooks/ version is the canonical location
10. **The `admin/homepage-manager-client.tsx` (1234 lines) is superseded** by the subfolder version â€” only the subfolder version is imported anywhere

---

## 10. Revision Log

| Date | Change | Reason |
|------|--------|--------|
| 2026-07-22 | Deferred defaultâ†’named export conversion to future cleanup | Converting export styles doubles the blast radius of each move. Mixing structural moves with export changes makes breakage harder to isolate. Scope note added to Section 3. |
| 2026-07-22 | Removed `receipt-preview.tsx` and `global-video-modal.tsx` from Open Decisions | Both had final locations already assigned in the mapping table (features/donation/ and shared/ respectively). Listing them as open decisions was contradictory. |
| 2026-07-22 | Rewrote compound component rule in Section 3 | Original rule said compound components should use prefix directories, but all 5 current compound files in ui/ (field, item, input-group, empty, button-group) are flat and work well. New rule: flat files are fine; folders only when sub-components have independent imports/logic. |
| 2026-07-22 | Removed duplicate `conference-settings-form.tsx` entry | Appeared twice in both the folder tree (Section 2) and migration mapping table (Section 4.4). |
| 2026-07-22 | Corrected dynamic imports assumption | Original claim "no dynamic imports" was based on grepping for `from "` which misses `import()` syntax. Re-searched specifically for `dynamic(` and `import(` â€” found 5 `import()` calls but all are library imports (stripe, @react-pdf/renderer), not component imports. Assumption corrected in Section 9. |
| 2026-07-22 | Moved receipt-preview.tsx from Phase 3 to Phase 4 checklist | It belongs in `features/donation/` (confirmed decision), so it should be moved in the features phase, not the shared phase. |
| 2026-07-22 | Confirmed all 5 open decisions | User chose: no barrels, feature-first, archive unused (not delete), keep podcasts top-level, delete superseded homepage-manager-client. |
| 2026-07-22 | Changed Phase 1 from "delete" to "move to archive" | User preference: unused components go to `components/_archive/` for safekeeping during testing, to be deleted in a later cleanup pass after reorg is verified stable. |
| 2026-07-22 | Added section 4.6: homepage-manager PascalCase â†’ kebab-case | Section 3 rule says "All component files use kebab-case" but 15 files in admin/homepage-manager/components/ were PascalCase and not being renamed. Added explicit rename mapping and Phase 5 tasks to close the gap. |
