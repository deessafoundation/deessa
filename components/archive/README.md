# deessa Foundation — archived components

Archived on 2026-10-04 following the [repository usage audit](../../docs/in-progress/reorganization/components/usage-audit/README.md). These **55 code files** had no discovered consumers. Original names and folder structure are preserved below this directory. Only relative imports needed for relocation were adjusted; UI behavior and styles were preserved.

This is a temporary holding area. Do not introduce production imports from it. Archived TypeScript remains included by the current TypeScript configuration; archival does not hide existing diagnostics or exclude these files from linting.

## When deletion can be considered

Keep these files while exercising the website and admin workflows through a representative period of normal use. Before deleting them, repeat the dependency search (including type imports, re-exports, dynamic loaders, scripts, tests and asset references), confirm no active code imports the archive, and perform the appropriate build and workflow checks. Investigate regressions and restore relevant files if needed. Elapsed time alone does not prove deletion is safe. Once normal operation and the fresh audit support removal, these archived files can be deleted in a separate cleanup. No automatic deletion date is set.

## Restore a file

The [operation manifest](../../docs/in-progress/reorganization/components/usage-audit/archive-cleanup/manifest.json) records original paths, hashes and every import adjustment. Check for an existing file at the original path before restoring. Move the archived file back and reverse its recorded specifier edits; account for any later dependency renames. Do not overwrite newer work.

## Archived inventory

| Original path | Archived file |
|---|---|
| `components/admin/CampaignEditForm.tsx` | [admin/CampaignEditForm.tsx](admin/CampaignEditForm.tsx) |
| `components/admin/OutreachEditForm.tsx` | [admin/OutreachEditForm.tsx](admin/OutreachEditForm.tsx) |
| `components/admin/ResearchEditForm.tsx` | [admin/ResearchEditForm.tsx](admin/ResearchEditForm.tsx) |
| `components/admin/conference-form-builder/FormSchemaViewer.tsx` | [admin/conference-form-builder/FormSchemaViewer.tsx](admin/conference-form-builder/FormSchemaViewer.tsx) |
| `components/admin/event-form.tsx` | [admin/event-form.tsx](admin/event-form.tsx) |
| `components/admin/form-conditional-editor.tsx` | [admin/form-conditional-editor.tsx](admin/form-conditional-editor.tsx) |
| `components/admin/homepage-manager-client.tsx` | [admin/homepage-manager-client.tsx](admin/homepage-manager-client.tsx) |
| `components/admin/notification-bell-realtime.tsx` | [admin/notification-bell-realtime.tsx](admin/notification-bell-realtime.tsx) |
| `components/admin/permission-gate.tsx` | [admin/permission-gate.tsx](admin/permission-gate.tsx) |
| `components/admin/support-toggle.tsx` | [admin/support-toggle.tsx](admin/support-toggle.tsx) |
| `components/admin/team-delete-button.tsx` | [admin/team-delete-button.tsx](admin/team-delete-button.tsx) |
| `components/donation-amount-picker.tsx` | [donation-amount-picker.tsx](donation-amount-picker.tsx) |
| `components/event-preview-card.tsx` | [event-preview-card.tsx](event-preview-card.tsx) |
| `components/event-registration-modal.tsx` | [event-registration-modal.tsx](event-registration-modal.tsx) |
| `components/events/admin/EventSettingsPanel.tsx` | [events/admin/EventSettingsPanel.tsx](events/admin/EventSettingsPanel.tsx) |
| `components/events/admin/EventSettingsWrapper.tsx` | [events/admin/EventSettingsWrapper.tsx](events/admin/EventSettingsWrapper.tsx) |
| `components/events/public/EventLoading.tsx` | [events/public/EventLoading.tsx](events/public/EventLoading.tsx) |
| `components/hero-video.tsx` | [hero-video.tsx](hero-video.tsx) |
| `components/home-faqs.tsx` | [home-faqs.tsx](home-faqs.tsx) |
| `components/home-testimonials-slider.tsx` | [home-testimonials-slider.tsx](home-testimonials-slider.tsx) |
| `components/impact-counter.tsx` | [impact-counter.tsx](impact-counter.tsx) |
| `components/partner-strip.tsx` | [partner-strip.tsx](partner-strip.tsx) |
| `components/podcasts/podcast-filter-sidebar.tsx` | [podcasts/podcast-filter-sidebar.tsx](podcasts/podcast-filter-sidebar.tsx) |
| `components/podcasts/podcast-grid.tsx` | [podcasts/podcast-grid.tsx](podcasts/podcast-grid.tsx) |
| `components/podcasts/podcast-guest-card.tsx` | [podcasts/podcast-guest-card.tsx](podcasts/podcast-guest-card.tsx) |
| `components/podcasts/podcast-hero-section.tsx` | [podcasts/podcast-hero-section.tsx](podcasts/podcast-hero-section.tsx) |
| `components/podcasts/podcast-latest-episode.tsx` | [podcasts/podcast-latest-episode.tsx](podcasts/podcast-latest-episode.tsx) |
| `components/podcasts/podcast-main-hero.tsx` | [podcasts/podcast-main-hero.tsx](podcasts/podcast-main-hero.tsx) |
| `components/podcasts/podcast-preview-section.tsx` | [podcasts/podcast-preview-section.tsx](podcasts/podcast-preview-section.tsx) |
| `components/podcasts/podcast-section.tsx` | [podcasts/podcast-section.tsx](podcasts/podcast-section.tsx) |
| `components/programs/LoadingSkeleton.tsx` | [programs/LoadingSkeleton.tsx](programs/LoadingSkeleton.tsx) |
| `components/programs/sections/ActivitiesSection.tsx` | [programs/sections/ActivitiesSection.tsx](programs/sections/ActivitiesSection.tsx) |
| `components/programs/sections/CTASection.tsx` | [programs/sections/CTASection.tsx](programs/sections/CTASection.tsx) |
| `components/programs/sections/FactsBarSection.tsx` | [programs/sections/FactsBarSection.tsx](programs/sections/FactsBarSection.tsx) |
| `components/programs/sections/FaqSection.tsx` | [programs/sections/FaqSection.tsx](programs/sections/FaqSection.tsx) |
| `components/programs/sections/FeaturesSection.tsx` | [programs/sections/FeaturesSection.tsx](programs/sections/FeaturesSection.tsx) |
| `components/programs/sections/GallerySection.tsx` | [programs/sections/GallerySection.tsx](programs/sections/GallerySection.tsx) |
| `components/programs/sections/HowItWorksSection.tsx` | [programs/sections/HowItWorksSection.tsx](programs/sections/HowItWorksSection.tsx) |
| `components/programs/sections/ProgramHero.tsx` | [programs/sections/ProgramHero.tsx](programs/sections/ProgramHero.tsx) |
| `components/programs/sections/ProgressTrackerSection.tsx` | [programs/sections/ProgressTrackerSection.tsx](programs/sections/ProgressTrackerSection.tsx) |
| `components/programs/sections/QuoteSection.tsx` | [programs/sections/QuoteSection.tsx](programs/sections/QuoteSection.tsx) |
| `components/programs/sections/ResourcesSection.tsx` | [programs/sections/ResourcesSection.tsx](programs/sections/ResourcesSection.tsx) |
| `components/programs/sections/RichTextSection.tsx` | [programs/sections/RichTextSection.tsx](programs/sections/RichTextSection.tsx) |
| `components/programs/sections/SectionNav.tsx` | [programs/sections/SectionNav.tsx](programs/sections/SectionNav.tsx) |
| `components/programs/sections/StatsSection.tsx` | [programs/sections/StatsSection.tsx](programs/sections/StatsSection.tsx) |
| `components/programs/sections/StorySection.tsx` | [programs/sections/StorySection.tsx](programs/sections/StorySection.tsx) |
| `components/programs/sections/TimelineSection.tsx` | [programs/sections/TimelineSection.tsx](programs/sections/TimelineSection.tsx) |
| `components/programs/sections/WhoWeSupportSection.tsx` | [programs/sections/WhoWeSupportSection.tsx](programs/sections/WhoWeSupportSection.tsx) |
| `components/stories-carousel.tsx` | [stories-carousel.tsx](stories-carousel.tsx) |
| `components/theme-provider.tsx` | [theme-provider.tsx](theme-provider.tsx) |
| `components/ui/event-card.tsx` | [ui/event-card.tsx](ui/event-card.tsx) |
| `components/ui/project-card.tsx` | [ui/project-card.tsx](ui/project-card.tsx) |
| `components/ui/story-card.tsx` | [ui/story-card.tsx](ui/story-card.tsx) |
| `components/ui/team-member-card.tsx` | [ui/team-member-card.tsx](ui/team-member-card.tsx) |
| `components/ui/toaster.tsx` | [ui/toaster.tsx](ui/toaster.tsx) |

## Duplicate copies removed

These three unused copies were byte-identical to the retained files immediately before removal.

| Removed copy | Retained original |
|---|---|
| `components/error-pages/astronaut.png` | `public/astronaut.png` |
| `components/ui/use-mobile.tsx` | `hooks/use-mobile.ts` |
| `components/ui/use-toast.ts` | `hooks/use-toast.ts` |

## Files left in place

Ten reviewed files remain unchanged: three production dependencies, three files supplying active types, and four children referenced by archived parents. We will evaluate them separately.

- `components/admin/video-picker.tsx` — disconnected component dependency
- `components/conference/step1-personal-details.tsx` — active type dependency
- `components/conference/step2-participation.tsx` — active type dependency
- `components/conference/step3-additional-info.tsx` — active type dependency
- `components/events/admin/EventSettingsTabs.tsx` — disconnected component dependency
- `components/podcasts/podcast-card.tsx` — disconnected component dependency
- `components/programs/demo/DemoInteractions.tsx` — production dependency
- `components/programs/demo/campaign-concept.module.css` — production dependency
- `components/programs/demo/programs.module.css` — production dependency
- `components/programs/sections/SectionHeading.tsx` — disconnected component dependency

## Verification for this operation

The initial cleanup verified all 55 moves and resulting hashes, the three identical duplicates and preserved originals, all ten retained hashes, and 2673 local module edges against the pre-archive graph. No source file outside the archived/deleted set changed during archival.

The subsequent [final reorganization review](../../docs/in-progress/reorganization/components/usage-audit/archive-cleanup/README.md) passed a production build, 45 program tests, exact-case import checks and 66 production browser states. Authenticated mutations, payment completion and normal-use observation remain outstanding; review the recorded limitations before deciding to delete this archive.
