# Component Reorganization Analysis

> **Generated:** 2026-10-01  
> **Status:** Phase 1 Complete — Analysis & Inventory  
> **Method:** Automated analysis via context-gatherer sub-agent + manual validation

---

## Executive Summary

The deessa Foundation codebase contains **250+ component files** organized across multiple directories with **mixed organizational patterns**. Analysis reveals:

- ✅ **6 well-organized feature directories** with clear boundaries (podcasts, programs, conference, events, accessibility, arts)
- ⚠️ **70+ root-level components** requiring categorization across multiple domains
- ⚠️ **73 UI components** mixing generic primitives (appropriate) with domain-specific cards (inappropriate)
- ⚠️ **60+ admin components** with partial organization (6 subdirectories but 40+ uncategorized root files)
- ✅ **23+ CSS modules** properly co-located with components
- ✅ **Consistent @/components/ import pattern** throughout codebase
- ⚠️ **Duplicate components** identified (event cards, potential form duplicates)
- ⚠️ **Missing feature directories** for donations, whatwedo, stories, newsletter

**Primary issue:** `homepage-sections.tsx` is a 1,273-line mega-component containing 8 separate sections that should be split and organized by domain.

---

## 1. Root-Level Components Analysis (`components/`)

### 1.1 Homepage-Specific Components (Should be Co-Located)

| Component | Lines | Exports | Used By | CSS Module | Client | Notes |
|-----------|-------|---------|---------|------------|--------|-------|
| `homepage-sections.tsx` | 1,273 | 9 sections | `app/(public)/page.tsx` | `homepage-sections.module.css` | ✓ | **MEGA-COMPONENT** — ImpactStatsBar, OurStorySection, MissionVisionSection, ProgramsSection, TimelineSection, PodcastSection, TestimonialsSection, PartnersSection, ContactSection |
| `hero-carousel.tsx` | ~200 | HeroCarousel, HeroSlide | `app/(public)/page.tsx` | - | ✓ | Homepage hero with slides |
| `homepage-image.tsx` | ~50 | HomepageImage | `homepage-sections.tsx` | - | ✓ | Client wrapper for Next.js Image |
| `home-faqs.tsx` | ~150 | HomeFAQs | `app/(public)/page.tsx` | - | ✓ | FAQ accordion section |
| `home-testimonials-slider.tsx` | ? | HomeTestimonialsSlider | **UNUSED** | - | ? | No imports found |
| `impact-counter.tsx` | ~80 | ImpactCounter | `homepage-sections.tsx` | - | ✓ | Animated counter component |
| `circular-testimonials.tsx` | ~300 | CircularTestimonials | `homepage-sections.tsx` | - | ✓ | Testimonial carousel |
| `hero-video.tsx` | ? | HeroVideo | **UNUSED** | - | ? | No imports found |
| `intro-video.tsx` | ~100 | IntroVideo | `app/(public)/layout.tsx` | - | ✓ | Welcome video modal |
| `development-notice-modal.tsx` | ~80 | DevelopmentNoticeModal | `app/(public)/layout.tsx` | `development-notice-modal.module.css` | ✓ | Dev environment indicator |

**Recommendation:** Create `components/features/homepage/` directory for homepage-specific components. Consider splitting `homepage-sections.tsx` into individual section files.

### 1.2 Domain-Specific Components (Should be Categorized)

#### About Domain
| Component | Exports | Used By | CSS Module | Client | Proposed Location |
|-----------|---------|---------|------------|--------|-------------------|
| `about-hero.tsx` | AboutHero | `app/(public)/about/page.tsx` | `about-hero.module.css` | ✓ | `features/about/` |

#### Contact Domain
| Component | Exports | Used By | CSS Module | Client | Proposed Location |
|-----------|---------|---------|------------|--------|-------------------|
| `contact-form.tsx` | ContactForm | `contact-form-prefilled.tsx` | - | ✓ | `features/contact/` |
| `contact-form-prefilled.tsx` | ContactFormPrefilled | `app/(public)/contact/page.tsx` | - | ✓ | `features/contact/` |

#### Donation Domain
| Component | Exports | Used By | CSS Module | Client | Proposed Location |
|-----------|---------|---------|------------|--------|-------------------|
| `donation-amount-picker.tsx` | DonationAmountPicker | **UNUSED** | - | ? | Archive or `features/donations/` |
| `receipt-preview.tsx` | ReceiptPreview | `app/(public)/donate/success/success-content.tsx` | - | ✓ | `features/donations/` |

#### Events Domain
| Component | Exports | Used By | CSS Module | Client | Proposed Location |
|-----------|---------|---------|------------|--------|-------------------|
| `event-preview-card.tsx` | EventPreviewCard | **UNUSED** | - | ✓ | Duplicate of `ui/event-card.tsx` — Archive |
| `event-registration-modal.tsx` | EventRegistrationModal | `app/(public)/events/page.tsx` | - | ✓ | `features/events/` |

#### Engagement Domain
| Component | Exports | Used By | CSS Module | Client | Proposed Location |
|-----------|---------|---------|------------|--------|-------------------|
| `support-form.tsx` | SupportForm | `app/(public)/support/page.tsx` | - | ✓ | `features/support/` |
| `volunteer-form.tsx` | VolunteerForm | `app/(public)/get-involved/page.tsx` | - | ✓ | `features/volunteer/` |
| `newsletter-form.tsx` | NewsletterForm | `footer.tsx` | - | ✓ | `shared/` (used in footer) |

#### Partners Domain
| Component | Exports | Used By | CSS Module | Client | Proposed Location |
|-----------|---------|---------|------------|--------|-------------------|
| `partner-strip.tsx` | PartnerStrip | **UNUSED** | - | ? | Archive (functionality in homepage-sections) |

#### Press/Media Domain
| Component | Exports | Used By | CSS Module | Client | Proposed Location |
|-----------|---------|---------|------------|--------|-------------------|
| `resource-downloads.tsx` | ResourceDownloads, brandResources, legalResources | `app/(public)/about/page.tsx`, `app/(public)/press/page.tsx` | - | - | `features/press/` or `shared/` |

#### What We Do Domain
| Component | Exports | Used By | CSS Module | Client | Proposed Location |
|-----------|---------|---------|------------|--------|-------------------|
| `what-we-do-area-detail.tsx` | WhatWeDoAreaDetail | `app/(public)/whatwedo/[slug]/page.tsx` | - | ✓ | `features/whatwedo/` |
| `what-we-do-video-player.tsx` | WhatWeDoVideoPlayer | `what-we-do-area-detail.tsx` | - | ✓ | `features/whatwedo/` |

#### Stories Domain
| Component | Exports | Used By | CSS Module | Client | Proposed Location |
|-----------|---------|---------|------------|--------|-------------------|
| `stories-carousel.tsx` | StoriesCarousel | **UNUSED** | - | ? | Archive |

### 1.3 Layout & Infrastructure (Correctly Placed)

| Component | Exports | Used By | CSS Module | Client | Status |
|-----------|---------|---------|------------|--------|--------|
| `navbar.tsx` | Navbar | `navbar-wrapper.tsx` | `navbar.module.css` | ✓ | Move to `layout/` |
| `navbar-wrapper.tsx` | NavbarWrapper | `app/(public)/layout.tsx` | - | ✓ | Move to `layout/` |
| `footer.tsx` | Footer | `app/(public)/layout.tsx` | - | ✓ | Move to `layout/` |
| `page-hero-contrast.module.css` | (styles only) | Multiple pages | N/A | - | Consider moving to `app/` or `styles/` |

### 1.4 Shared Utilities (Correctly Identified)

| Component | Exports | Used By | CSS Module | Client | Proposed Location |
|-----------|---------|---------|------------|--------|-------------------|
| `social-icons.tsx` | Facebook, Twitter, Instagram, Youtube, Linkedin | Podcast components, footer, admin | - | - | `shared/` |
| `share-button.tsx` | ShareButton | `app/(public)/podcasts/[slug]/page.tsx` | - | ✓ | `shared/` |
| `scroll-animations.tsx` | ScrollReveal, CountUp, BackToTop | `homepage-sections.tsx`, `home-faqs.tsx` | - | ✓ | `shared/` |
| `secret-key-listener.tsx` | SecretKeyListener | `app/(public)/page.tsx` | - | ✓ | `shared/` (admin quick-access) |
| `global-video-modal.tsx` | GlobalVideoModal | `app/(public)/layout.tsx` | - | ✓ | `shared/` |
| `theme-provider.tsx` | ThemeProvider | **UNUSED** | - | ? | Archive or verify usage |

---

## 2. UI Components Analysis (`components/ui/`)

### 2.1 Generic Primitives (Correctly Placed) — 67 files

#### Form Controls (17 components)
- `input.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx`, `radio-group.tsx`, `switch.tsx`, `label.tsx`, `form.tsx`
- `date-picker.tsx`, `date-time-picker.tsx`, `time-picker.tsx`, `input-otp.tsx`
- `fancy-select.tsx`, `location-picker.tsx`, `calendar.tsx`
- `field.tsx` (compound with 10 exports), `input-group.tsx` (compound with 6 exports)

#### Layout Components (9 components)
- `card.tsx`, `section.tsx`, `separator.tsx`, `breadcrumb.tsx`, `aspect-ratio.tsx`
- `scroll-area.tsx`, `resizable.tsx`, `sidebar.tsx`
- `item.tsx` (compound with 10 exports)

#### Navigation (9 components)
- `tabs.tsx`, `tabs-switcher.tsx`, `navigation-menu.tsx`, `menubar.tsx`
- `dropdown-menu.tsx`, `context-menu.tsx`, `pagination.tsx`

#### Overlays (10 components)
- `dialog.tsx`, `sheet.tsx`, `drawer.tsx`, `popover.tsx`, `hover-card.tsx`
- `tooltip.tsx`, `alert-dialog.tsx`, `command.tsx`

#### Feedback (9 components)
- `alert.tsx`, `toast.tsx`, `toaster.tsx`, `sonner.tsx`, `spinner.tsx`
- `skeleton.tsx`, `progress.tsx`
- `empty.tsx` (compound with 6 exports)

#### Buttons (5 components)
- `button.tsx`, `button-group.tsx` (compound with 4 exports), `toggle.tsx`, `toggle-group.tsx`, `print-button.tsx`

#### Data Display (6 components)
- `table.tsx`, `avatar.tsx`, `badge.tsx`, `detail-row.tsx`, `kbd.tsx`

#### Interactive (4 components)
- `accordion.tsx`, `collapsible.tsx`, `carousel.tsx`, `slider.tsx`

#### Charts (1 component)
- `chart.tsx`

#### Utilities (2 components)
- `use-mobile.tsx` ⚠️ **HOOK MISPLACED** (should be in `hooks/`)
- `use-toast.ts` ⚠️ **HOOK MISPLACED** (should be in `hooks/`)

#### Decorative (2 components)
- `brush-stroke.tsx`, `animated-brush-quote.tsx`

### 2.2 Domain-Specific Components (Organizational Debt) — 6 files

| Component | Props Indicate Domain | Usage Found | Recommendation |
|-----------|----------------------|-------------|----------------|
| `event-card.tsx` | category, time, location, verified, date badge | **NONE** | Archive or move to `shared/cards/` (duplicate of root `event-preview-card.tsx`) |
| `story-card.tsx` | category, readTime, excerpt, date | **NONE** | Archive (inline implementation used instead) |
| `project-card.tsx` | Specialized project display | **NONE** | Archive or move to `shared/cards/` |
| `initiative-card.tsx` | Specialized initiative display | **NONE** | Archive or move to `shared/cards/` |
| `team-member-card.tsx` | name, role, bio, social links | **NONE** | Archive or move to `shared/cards/` |
| `stat-card.tsx` | Statistics display | **NONE** | Archive or move to `shared/cards/` |

**Critical Issue:** These 6 components define domain-specific props (category, readTime, location, etc.) rather than generic composition APIs, violating the UI primitives principle. No usage evidence found for any of them, suggesting they may have been replaced by inline implementations.

---

## 3. Feature Directories Analysis

### 3.1 Well-Organized Features

#### `components/podcasts/` — 23 files ✅

**Organization:** Flat structure, all podcast-related components together

| Category | Files | Notes |
|----------|-------|-------|
| Archive | `podcast-archive-section.tsx`, `archive-thumbnail.tsx`, `archive-thumbnail-image.tsx` | Archive view with thumbnails |
| Episodes | `episodes-page-content.tsx`, `podcast-latest-episode.tsx` | Episode listings |
| Highlights | `highlights-page-content.tsx`, `highlights-carousel.tsx`, `all-highlights-card.tsx`, `all-highlights-section.tsx` | Featured content |
| Cards | `podcast-card.tsx`, `podcast-guest-card.tsx`, `podcast-highlight-card.tsx`, `podcast-share-card.tsx` | Display components |
| Hero | `podcast-hero-section.tsx`, `podcast-main-hero.tsx`, `podcast-series-intro.tsx` | Hero sections |
| UI | `podcast-filter-sidebar.tsx`, `podcast-grid.tsx`, `podcast-sticky-player.tsx`, `podcast-video-modal.tsx`, `podcast-transcript.tsx`, `podcast-preview-section.tsx`, `podcast-section.tsx` | Interactive UI |
| CSS | `podcasts-page.module.css`, `highlights-page.module.css`, `archive-thumbnail.module.css` | Co-located styles |

**Used By:** `app/(public)/podcasts/page.tsx`, `app/(public)/podcasts/[slug]/page.tsx`

**Assessment:** ✅ **Excellent organization** — Self-contained feature with clear boundaries, co-located CSS, consistent naming.

#### `components/programs/` — 6 files + 3 subdirectories ✅

**Organization:** Hierarchical with sections/, templates/, demo/ subdirectories

| Category | Files | Notes |
|----------|-------|-------|
| Root | `CmsProgramRenderer.tsx`, `SafeImage.tsx`, `ProgramLoading.tsx`, `LoadingSkeleton.tsx` | Core rendering + utilities |
| CSS | `program-loading.module.css`, `programs.module.css` | Co-located styles |
| `sections/` | 18 files | ActivitiesSection, CTASection, FactsBarSection, FaqSection, FeaturesSection, GallerySection, HowItWorksSection, ProgramHero, ProgressTrackerSection, QuoteSection, RelatedProgramsSection, ResourcesSection, RichTextSection, SectionHeading, SectionNav, StatsSection, StorySection, TimelineSection, WhoWeSupportSection |
| `templates/` | 3 files + CSS | CampaignTemplate, OutreachTemplate, ResearchTemplate (editorial-style layouts) |
| `demo/` | Multiple files | Demo content and interactive components |

**Used By:** `app/(public)/whatwedo/[slug]/page.tsx`

**Assessment:** ✅ **Excellent organization** — Clear separation of concerns, extensible section system, template-based rendering.

#### `components/conference/` — 9 files ✅

**Organization:** Form-builder pattern with step components

| Category | Files | Notes |
|----------|-------|-------|
| Root | `conference-registration-form.tsx`, `dynamic-form-renderer.tsx`, `dynamic-step.tsx`, `step-progress-bar.tsx` | Form engine |
| Steps | `step1-personal-details.tsx`, `step2-participation.tsx`, `step3-additional-info.tsx`, `step4-review.tsx` | Wizard steps |
| Fields | `fields/` subdirectory | Custom form fields |

**Used By:** Conference registration pages

**Assessment:** ✅ **Good organization** — Clear step-based pattern, all "use client" for interactivity.

#### `components/events/` — 1 file + 2 subdirectories ✅

**Organization:** Admin/public separation mimicking app router

| Category | Files | Notes |
|----------|-------|-------|
| Root | `share-event-button.tsx` | Shared utility |
| `admin/` | 18 files | AgendaEditor, EmailTemplateEditor, EventCheckInButton, EventCommunicationLog, EventDeleteRegistrationButton, EventDetailsForm, EventFormBuilder/, EventLocationForm, EventMediaForm, EventPaymentInfo, EventRegistrationEmailActions, EventRegistrationNotes, EventSettingsClient, EventSettingsPanel, EventSettingsTabs, EventSettingsWrapper, EventStatusActions, PricingEditor, RegistrationsTable |
| `public/` | 3 files | event-registration-form.tsx, EventError.tsx, EventLoading.tsx |

**Assessment:** ✅ **Excellent organization** — Mirrors app router admin/public separation, clear boundaries.

#### `components/accessibility/` — 10 files ✅

**Organization:** Feature-based with co-located CSS modules

| Category | Files | Notes |
|----------|-------|-------|
| Panel | `panel.tsx`, `panel-primitives.tsx` | Accessibility toolbar infrastructure |
| Dictionary | `dictionary.tsx`, `dictionary.module.css`, `use-dictionary-triggers.ts` | Term definitions |
| Reading Aids | `reading-aids.tsx`, `reading-aids.module.css`, `reading-guide-sticker.tsx` | Reading assistance tools |
| TTS | `tts-controls.tsx`, `tts-mini-player.tsx` | Text-to-speech features |

**Assessment:** ✅ **Good organization** — Self-contained accessibility feature, co-located CSS.

#### `components/arts/` — 3 files ✅

**Organization:** Simple feature with gallery + homepage integration

| Files | Notes |
|-------|-------|
| `arts-gallery.tsx`, `home-art-feature.tsx`, `arts.module.css` | Gallery + homepage feature + styles |

**Used By:** `app/(public)/arts/page.tsx`, `app/(public)/page.tsx` (homepage)

**Assessment:** ✅ **Good organization** — Small, focused feature with clear boundaries.

### 3.2 Partially Organized Features

#### `components/donation/` — 2 files ⚠️

| Files | Notes |
|-------|-------|
| `donation-form.tsx`, `bank-transfer-panel.tsx` | Donation forms |

**Missing:** Root-level `donation-amount-picker.tsx`, `receipt-preview.tsx` should be here

**Assessment:** ⚠️ **Incomplete** — Core donation components scattered in root.

#### `components/whatwedo/` — 2 files ⚠️

| Files | Notes |
|-------|-------|
| `whatwedo-hero.tsx`, `whatwedo-hero.module.css` | Hero section only |

**Missing:** Root-level `what-we-do-area-detail.tsx`, `what-we-do-video-player.tsx` should be here

**Assessment:** ⚠️ **Incomplete** — Related components in root directory.

### 3.3 Other Directories

#### `components/form/` — 3 files

| Files | Purpose |
|-------|---------|
| `form-field.tsx`, `textarea-field.tsx`, `index.ts` | Shared form primitives |

**Used By:** `contact-form.tsx`, `volunteer-form.tsx`

**Assessment:** ✅ **Appropriate** — Shared form abstractions.

#### `components/seo/` — 1 file

| Files | Purpose |
|-------|---------|
| `structured-data.tsx` | JSON-LD schema markup |

**Assessment:** ✅ **Appropriate** — Shared SEO utility.

#### `components/photo-wall/` — 1 file

| Files | Purpose |
|-------|---------|
| `photo-wall.tsx` | Interactive photo collage |

**Assessment:** ⚠️ **Single-file directory** — Consider flattening to `shared/photo-wall.tsx`.

#### `components/error-pages/` — 5 files + 1 image

| Files | Purpose |
|-------|---------|
| `GenericErrorPage.tsx`, `NetworkErrorPage.tsx`, `NotFoundErrorPage.tsx`, `ServerErrorPage.tsx`, `UnauthorizedErrorPage.tsx`, `astronaut.png` | Error boundaries |

**Issues:**
- ⚠️ **PascalCase filenames** (should be kebab-case)
- All use "use client" directive
- Used by app error boundaries

**Assessment:** ⚠️ **Naming violation** — Needs kebab-case conversion, otherwise appropriate.

---

## 4. Admin Components Analysis (`components/admin/`)

### 4.1 Well-Organized Subdirectories — 6 directories

#### `admin/dashboard/` — 14 files ✅

Centralized dashboard components: activity-feed, content-activity-chart, dashboard-date-filter, dashboard-stat-card, donation charts (by-category, trend, monthly-vs-onetime, provider-breakdown), event-capacity-chart, fundraising-progress-chart, pending-actions, system-health-card, volunteer-skills-chart, index.ts

#### `admin/donations/` — 13 files ✅

Donation review system: activity-timeline, donations-table-client, donor-information, error-boundary, payment-technical, review-action-dialog, review-dashboard-client, review-notes-section, review-status-card, status-change-modal, transaction-detail-client, transaction-header, transaction-overview

#### `admin/homepage-manager/` — 1 file + components/ subdirectory ✅

Homepage CMS: `HomepageManagerClient.tsx` with nested `components/` containing 15 manager components (banners, color-picker, cta-cards, featured-stories, flags, hero-carousel, hero-ctas, hero, marquee, programs, seo, stats, testimonials, timeline, trust-indicators)

#### `admin/program-sections/` — 15 files ✅

Program editor system: AssetPicker, forms/, ImageMetadataFields, index.tsx, program-id-context, ProgramMediaLibrary, section-actions, SectionList, SectionPropertiesPanel, SectionTypePicker, SortableSectionCard, template-layouts, TemplateSection, TemplateSectionsEditor, types, useSectionState, VersionHistoryPanel

#### `admin/rich-text-editor/` — Multiple files ✅

Rich text editing: toolbar, dialogs, extensions, hooks

#### `admin/support/` — Files ✅

Support ticket management components

### 4.2 Uncategorized Admin Root Files — 40+ files ⚠️

**Should be organized into subdirectories:**

| Proposed Category | Files | Notes |
|-------------------|-------|-------|
| `auth/` | `admin-user-form.tsx`, `admin-user-edit-form.tsx`, `password-form.tsx`, `permission-gate.tsx` | User authentication & authorization |
| `layout/` (✅ correct) | `admin-header.tsx`, `admin-sidebar.tsx`, `admin-layout-content.tsx`, `admin-nav-config.ts` | Admin shell components |
| `programs/` | `CampaignEditForm.tsx`, `OutreachEditForm.tsx`, `ResearchEditForm.tsx`, `ServiceEditForm.tsx`, `EditorialProgramEditor.tsx`, `ProgramEditorDemo.tsx`, `program-edit-skeleton.tsx`, `program-thumb.tsx` | Program CRUD (⚠️ PascalCase files) |
| `conference/` | `conference-form-builder.tsx`, `conference-notes.tsx`, `conference-quick-actions.tsx`, `conference-settings-form.tsx`, `conference-status-actions.tsx` | Conference management (overlaps with `conference-form-builder/`) |
| `form-builder/` | `form-canvas.tsx`, `form-conditional-editor.tsx`, `form-field-editor.tsx`, `form-field-palette.tsx`, `form-preview.tsx`, `form-step-editor.tsx` | Generic form builder components |
| `content/` or by type | `podcast-form.tsx`, `story-form.tsx`, `story-preview-modal.tsx`, `event-form.tsx`, `project-form.tsx`, `partner-form.tsx`, `stat-form.tsx`, `team-member-form.tsx` | Content CRUD forms |
| `actions/` | `delete-podcast-button.tsx`, `delete-registration-button.tsx`, `delete-story-button.tsx`, `partner-actions.tsx`, `project-actions.tsx`, `stat-actions.tsx`, `support-actions.tsx`, `volunteer-actions.tsx`, `team-delete-button.tsx` | Action components (could be co-located with forms) |
| `settings/` | `organization-settings-form.tsx`, `payment-settings-form.tsx`, `profile-form.tsx`, `setup-form.tsx`, `site-settings-form.tsx`, `settings-tabs.tsx` | Settings forms |
| `media/` | `file-upload.tsx`, `gallery-manager.tsx`, `media-library-client.tsx`, `media-picker.tsx`, `video-picker.tsx` | Media management |
| `notifications/` | `notification-bell.tsx`, `notification-bell-realtime.tsx`, `notification-center-client.tsx`, `internal-note-modal.tsx`, `reply-modal.tsx` | Notifications & communication |
| Other subdirs | `about-manager/`, `artworks/`, `payments/` | Already exist as subdirectories |
| Utilities | `confirm-dialog.tsx`, `team-table.tsx`, `support-screenshot-modal.tsx`, `support-toggle-modal.tsx`, `support-toggle.tsx` | Shared admin utilities |

**Critical Issues:**
- ⚠️ **PascalCase admin files:** `CampaignEditForm.tsx`, `OutreachEditForm.tsx`, `ResearchEditForm.tsx`, `ServiceEditForm.tsx`, `EditorialProgramEditor.tsx`, `ProgramEditorDemo.tsx` violate kebab-case convention
- ⚠️ **Duplicate conference systems:** Both `conference-form-builder.tsx` (root) and `conference-form-builder/` (subdirectory) exist
- ⚠️ **Form/action separation:** Delete buttons and action components separated from their related forms

---

## 5. CSS Modules Inventory

### 5.1 Properly Co-Located CSS Modules — 23+ files ✅

| Component | CSS Module | Location | Notes |
|-----------|------------|----------|-------|
| `about-hero.tsx` | `about-hero.module.css` | Root | About page hero |
| `navbar.tsx` | `navbar.module.css` | Root | Navigation styles |
| `homepage-sections.tsx` | `homepage-sections.module.css` | Root | Homepage section styles |
| `development-notice-modal.tsx` | `development-notice-modal.module.css` | Root | Dev indicator |
| (component files) | `page-hero-contrast.module.css` | Root | Shared hero contrast styles |
| Podcasts | `podcasts-page.module.css` | `podcasts/` | Podcast page styles |
| Podcasts | `highlights-page.module.css` | `podcasts/` | Highlights page styles |
| Podcasts | `archive-thumbnail.module.css` | `podcasts/` | Archive thumbnail styles |
| Programs | `program-loading.module.css` | `programs/` | Loading state styles |
| Programs | `programs.module.css` | `programs/` | General program styles |
| Programs | `editorial-photo.module.css` | `programs/templates/` | Editorial template styles |
| Programs | `campaign-concept.module.css` | `programs/demo/` | Campaign demo styles |
| Accessibility | `dictionary.module.css` | `accessibility/` | Dictionary feature styles |
| Accessibility | `reading-aids.module.css` | `accessibility/` | Reading aids styles |
| Arts | `arts.module.css` | `arts/` | Art gallery styles |
| WhatWeDo | `whatwedo-hero.module.css` | `whatwedo/` | What We Do hero styles |
| App pages | `about-intro.module.css` | `app/(public)/about/` | About page section |
| App pages | `about-sections.module.css` | `app/(public)/about/` | About page sections |
| App pages | `org-structure.module.css` | `app/(public)/about/` | Organization structure |
| App pages | Additional CSS modules in app/ directory | Various `app/` locations | Page-specific styles |

**Assessment:** ✅ **Good pattern** — CSS modules are consistently co-located with their components following best practices.

---

## 6. Client vs Server Components

### 6.1 Client Components ("use client") — 120+ files

**Categories requiring client-side interactivity:**

| Category | Example Components | Reason for Client Directive |
|----------|-------------------|----------------------------|
| Forms | contact-form, volunteer-form, donation-form, all conference steps | Form state, validation, submission |
| Admin CRUD | All admin forms, editors, tables | State management, user interactions |
| Navigation | navbar.tsx | Active link state, mobile menu |
| Layout | footer.tsx | Newsletter form state |
| Animations | hero-carousel, circular-testimonials, scroll-animations | Animation libraries (GSAP, Framer Motion) |
| Accessibility | panel, dictionary, reading-aids, tts-controls | User preferences, audio playback |
| Error Boundaries | All error-pages/ components | Error state handling |
| Interactive Displays | photo-wall, testimonial sliders, impact-counter | User interaction, animations |
| Modals | global-video-modal, event-registration-modal, story-preview-modal | Portal rendering, focus management |

### 6.2 Server Components (No "use client") — Fewer files

| Category | Example Components | Reason for Server |
|----------|-------------------|-------------------|
| CMS Rendering | CmsProgramRenderer, program sections | Data fetching, static rendering |
| SEO | structured-data.tsx | Static markup generation |
| Static Displays | Some cards, some sections | No interactivity needed |

**Pattern:** Default to server components, add "use client" only when needed for:
- State management (useState, useReducer)
- Effects (useEffect, useLayoutEffect)
- Event handlers
- Browser APIs
- Animation libraries
- Context consumers requiring client state

---

## 7. Component Duplication & Overlap

### 7.1 Confirmed Duplicates

| Duplicate Set | Files | Usage | Recommendation |
|---------------|-------|-------|----------------|
| **Event Cards** | `ui/event-card.tsx` + `event-preview-card.tsx` | Both unused | Archive both, implement inline where needed |
| **Use Mobile Hook** | `ui/use-mobile.tsx` + `hooks/use-mobile.ts` | Check which is canonical | Remove from ui/, keep in hooks/ |
| **Use Toast Hook** | `ui/use-toast.ts` + `hooks/use-toast.ts` | Check which is canonical | Remove from ui/, keep in hooks/ |
| **Homepage Manager** | `admin/homepage-manager-client.tsx` (1234 lines) + `admin/homepage-manager/HomepageManagerClient.tsx` (398 lines) | Only subfolder version imported | Delete root version |

### 7.2 Potential Duplicates (Require Investigation)

| Component Type | Files | Notes |
|----------------|-------|-------|
| Delete Buttons | `delete-podcast-button.tsx`, `delete-registration-button.tsx`, `delete-story-button.tsx`, `team-delete-button.tsx` | Could be generic `DeleteButton<T>` with type parameter |
| Action Components | `partner-actions.tsx`, `project-actions.tsx`, `stat-actions.tsx`, `support-actions.tsx`, `volunteer-actions.tsx` | Similar action menu patterns |
| Form Builders | Conference form builder + event form builder + generic form builder components | May share functionality |

---

## 8. Unused Components

### 8.1 Confirmed Unused (No Imports Found)

| Component | Location | Reason | Recommendation |
|-----------|----------|--------|----------------|
| `hero-video.tsx` | Root | No imports found | Archive |
| `home-testimonials-slider.tsx` | Root | No imports found, replaced by circular-testimonials | Archive |
| `donation-amount-picker.tsx` | Root | No imports found | Verify then archive |
| `event-preview-card.tsx` | Root | Duplicate of ui/event-card, both unused | Archive |
| `partner-strip.tsx` | Root | Functionality in homepage-sections | Archive |
| `stories-carousel.tsx` | Root | No imports found | Archive |
| `theme-provider.tsx` | Root | No imports found | Verify then archive |
| `ui/event-card.tsx` | UI | Domain-specific, no imports | Archive |
| `ui/story-card.tsx` | UI | Domain-specific, no imports, inline version used | Archive |
| `ui/project-card.tsx` | UI | Domain-specific, no imports | Archive |
| `ui/initiative-card.tsx` | UI | Domain-specific, no imports | Archive |
| `ui/team-member-card.tsx` | UI | Domain-specific, no imports | Archive |
| `ui/stat-card.tsx` | UI | Domain-specific, no imports | Archive |
| `admin/media-picker.tsx` | Admin | No imports found | Archive |

**Total: 14 components flagged for archival**

### 8.2 Uncertain (Require Manual Verification)

Components that may be dynamically imported or referenced in ways not captured by static analysis should be manually verified before archival.

---

## 9. Missing Feature Directories

Based on component analysis, the following feature directories should exist but don't:

| Missing Directory | Components Currently Scattered | Proposed Contents |
|-------------------|-------------------------------|-------------------|
| `features/donations/` | `donation-amount-picker.tsx`, `receipt-preview.tsx`, `donation/donation-form.tsx`, `donation/bank-transfer-panel.tsx` | All donation-related public components |
| `features/homepage/` | `homepage-sections.tsx` (split into separate sections), `hero-carousel.tsx`, `home-faqs.tsx`, `impact-counter.tsx`, `circular-testimonials.tsx`, `homepage-image.tsx`, `development-notice-modal.tsx` | All homepage-specific components |
| `features/stories/` | Currently none (stories admin form exists) | Public story display components if needed |
| `features/newsletter/` | `newsletter-form.tsx` | Newsletter subscription (currently in shared) |
| `features/press/` | `resource-downloads.tsx` | Press/media resources |
| `admin/programs/` | `CampaignEditForm.tsx`, `OutreachEditForm.tsx`, `ResearchEditForm.tsx`, `ServiceEditForm.tsx`, `EditorialProgramEditor.tsx`, `ProgramEditorDemo.tsx`, `program-edit-skeleton.tsx`, `program-thumb.tsx` | Program admin components |
| `admin/settings/` | `organization-settings-form.tsx`, `payment-settings-form.tsx`, `profile-form.tsx`, `setup-form.tsx`, `site-settings-form.tsx`, `settings-tabs.tsx` | Settings forms |
| `admin/users/` | `admin-user-form.tsx`, `admin-user-edit-form.tsx`, `password-form.tsx` | User management |

---

## 10. Import Pattern Analysis

### 10.1 Consistent Pattern ✅

**All imports use `@/components/` alias:**
```typescript
import { Button } from "@/components/ui/button"
import { PodcastCard } from "@/components/podcasts/podcast-card"
import { ServiceEditForm } from "@/components/admin/ServiceEditForm"
import { HomepageImage } from "@/components/homepage-image"
```

**No barrel exports:** Direct imports from specific files (good for tree-shaking)

### 10.2 High-Frequency Imports

**Most imported UI primitives:**
1. `button.tsx` — 100+ imports
2. `input.tsx` — 80+ imports
3. `card.tsx` — 70+ imports
4. `dialog.tsx` — 50+ imports
5. `select.tsx` — 40+ imports

**Most imported shared utilities:**
1. `scroll-animations.tsx` — Used by homepage-sections, home-faqs
2. `social-icons.tsx` — Used by podcasts, footer, admin
3. `share-button.tsx` — Used by podcast pages

---

## 11. Architectural Violations

### 11.1 Critical Issues

1. **Mega-component:** `homepage-sections.tsx` (1,273 lines) violates single-responsibility principle
2. **Domain pollution in UI:** 6 domain-specific cards in `ui/` directory
3. **Hooks in UI:** `use-mobile.tsx`, `use-toast.ts` misplaced
4. **Naming violations:** PascalCase files in error-pages/ and admin/
5. **Component duplication:** Multiple event cards, homepage-manager, hooks
6. **Uncategorized admin:** 40+ admin components in root need subdirectories
7. **Scattered features:** Homepage, donations, whatwedo components spread across root

### 11.2 Organizational Debt Metrics

- **Root-level components requiring categorization:** 70+
- **UI components that should be moved:** 6 (domain cards) + 2 (hooks)
- **Admin components requiring organization:** 40+
- **Unused components identified:** 14
- **Duplicate components:** 4 sets
- **Missing feature directories:** 8

---

## 12. Recommendations Summary

### Priority 1 (High Impact, Low Risk)
1. Archive 14 unused components
2. Remove duplicate hooks from ui/ (keep in hooks/)
3. Delete superseded `admin/homepage-manager-client.tsx`
4. Move `ui/` domain cards to `shared/cards/` or archive if unused
5. Rename PascalCase files to kebab-case

### Priority 2 (Medium Impact, Medium Risk)
6. Create missing feature directories (homepage, donations, press, stories)
7. Organize 40+ admin root files into subdirectories
8. Move scattered whatwedo components together
9. Flatten single-file directories (photo-wall)

### Priority 3 (High Impact, Higher Risk)
10. Split `homepage-sections.tsx` into individual section components
11. Consolidate duplicate form builders and delete buttons
12. Consider merging overlapping conference form systems

---

## Next Steps

1. ✅ **Analysis complete** — This document
2. ⏳ **Architecture definition** — Define final folder structure based on findings
3. ⏳ **Dependency mapping** — Identify risky migrations
4. ⏳ **Migration plan** — Create batched migration strategy
5. ⏳ **Review** — Validate plan before execution
6. ⏳ **Execute** — Incremental migration with testing

---

**Document Status:** Complete — Ready for architecture definition phase
