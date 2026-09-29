# Accessibility Implementation Checklist

**Version:** 3.0  
**Updated:** 2026-09-15  
**Status:** Planned work; no implementation items are marked complete.  
**Specification:** [README.md](./README.md)  
**Acceptance cases:** [VALIDATION.md](./VALIDATION.md)

## How to track work

Use the task IDs in implementation PRs and test records. For each completed task record its owner, code/content reference and evidence. A checkbox means verified completion, not that code was merely written. If a task is inapplicable, record the reason and reviewer. Split grouped tasks by route/component in the inventory.

Phases 1 and 2 can be developed independently after Phase 0, but the shared panel depends on both. Complete baseline fixes before claiming the optional panel makes the site accessible. CI/deployment infrastructure and production rollout execution are intentionally outside this checklist.

## Phase 0 — Inventory and design confirmation

### Scope and baseline

- [ ] A0-01 Assign implementation, content, design and accessibility-test owners; one person may own multiple roles.
- [ ] A0-02 Review the specification's control ranges, defaults, no-autoplay policy and public-layout scope.
- [ ] A0-03 Enumerate every public route/template and representative CMS record; include direct entry and error states.
- [ ] A0-04 Mark demo exclusions explicitly and check production navigation does not depend on them.
- [ ] A0-05 Inventory third-party players, checkout handoffs, PDFs/receipts and accessible alternatives.
- [ ] A0-06 Record key journeys: discover information, read article, use media, contact/support, donate, register and recover payment.
- [ ] A0-07 Create a criterion register covering every WCAG 2.2 A/AA criterion with applicability and test method.
- [ ] A0-08 Capture baseline automated findings, keyboard failures, screenshots and representative screen-reader results.
- [ ] A0-09 Record actual test browsers/devices/assistive technologies and available user-testing capacity.
- [ ] A0-10 Measure baseline route sizes, LCP, CLS and interaction response; confirm proposed performance budgets.

### Repository inventory

- [ ] A0-11 Trace where both existing accessibility widgets render and all consumers of their props.
- [ ] A0-12 Confirm showAccessibilityToolbar CMS wiring and preserve transcript-specific callbacks.
- [ ] A0-13 List actual localStorage keys and confirm whether any genuine persisted preference format exists.
- [ ] A0-14 Inventory root/body mutations, theme classes, existing font variables and portal containers.
- [ ] A0-15 Inventory hard-coded colors, fixed-pixel text, leading/tracking utilities, fixed heights and clipping.
- [ ] A0-16 Inventory CSS animations, pseudo-elements, transitions, scroll effects, timers, Framer Motion and any live GSAP use.
- [ ] A0-17 Inventory autoplay/retry/resume logic in every live media component.
- [ ] A0-18 Inventory forms, validation utilities, announcements, timeouts and external payment states.
- [ ] A0-19 Inventory modal/menu interactions and current route-focus/skip-link behavior.
- [ ] A0-20 Identify article/transcript containers eligible for reading mode and authored section IDs.
- [ ] A0-21 Inventory current languages/scripts and font glyph requirements.
- [ ] A0-22 Check current CSP and feasible public-layout prepaint script ordering in installed Next.js.
- [ ] A0-23 Record existing test setup and missing DOM/browser dependencies without changing CI workflows.
- [ ] A0-24 Produce panel wireframes for desktop, 320px viewport, 200% text and software-keyboard states.
- [ ] A0-25 Resolve scope/design blockers in a decision log before their dependent implementation.

**Gate:** Route/component inventory, baseline evidence, owners and design decisions exist. Do not replace missing measurements with assumed scores.

## Phase 1 — Accessible default site

### Structure and navigation

- [ ] A1-01 Correct page titles, primary headings and logical heading structure across scoped templates.
- [ ] A1-02 Add/repair the main landmark and skip link with a real focusable destination.
- [ ] A1-03 Label multiple navigation/region landmarks and remove redundant or incorrect ARIA.
- [ ] A1-04 Verify desktop/mobile navigation with keyboard, touch and screen readers.
- [ ] A1-05 Ensure every interactive element has a name and native semantic role.
- [ ] A1-06 Repair focus visibility and non-color selected/error cues.
- [ ] A1-07 Prevent sticky headers, banners, floating controls and dialogs from obscuring focus.
- [ ] A1-08 Define and implement route-change, back/forward and anchor focus behavior without duplicate announcements.
- [ ] A1-09 Check dropdowns, tooltips and hover content for keyboard access, dismissal and persistence.
- [ ] A1-10 Correct meaningful image alternatives and decorative image/icon hiding.
- [ ] A1-11 Check link purpose, current-page state, new-window behavior and download descriptions.
- [ ] A1-12 Audit populated/empty/error states of search, filters, pagination, tables and accordions.

### Forms and consequential journeys

- [ ] A1-13 Add persistent form labels, instructions, field grouping and appropriate autocomplete/input purpose.
- [ ] A1-14 Link field errors to inputs and expose invalid state.
- [ ] A1-15 Implement consistent invalid-submit focus and an accessible error summary where useful.
- [ ] A1-16 Preserve values after validation/network errors and offer clear recovery.
- [ ] A1-17 Announce asynchronous pending/success/failure states without repeated error chatter.
- [ ] A1-18 Prevent duplicate submissions while keeping progress and recovery understandable.
- [ ] A1-19 Verify donation/event/conference review-and-correction steps before consequential submission.
- [ ] A1-20 Test payment handoff, return, pending, cancelled, failed and successful states with sandbox fixtures.
- [ ] A1-21 Audit paste/password-manager support, OTP/CAPTCHA and time limits where present.
- [ ] A1-22 Verify contact/support/verification/newsletter forms and any additional inventoried forms.
- [ ] A1-23 Ensure drag/gesture interactions have non-drag and keyboard alternatives.

### Default media and content

- [ ] A1-24 Remove automatic intro takeover; expose optional watch action without blocking navigation.
- [ ] A1-25 Default background/hero media to static posters and provide explicit playback controls.
- [ ] A1-26 Default all carousels to manual operation; retain deliberate rotation controls where justified.
- [ ] A1-27 Stop rotation on focus/hover and require explicit restart.
- [ ] A1-28 Remove hidden slides from keyboard interaction and correct slide announcements.
- [ ] A1-29 Make scroll-reveal content and counters readable without JavaScript and under reduced motion.
- [ ] A1-30 Audit captions, transcripts and description of meaningful visual media information.
- [ ] A1-31 Add titles/controls and failure alternatives to embedded players.
- [ ] A1-32 Audit public documents/receipts and provide accessible equivalents where required.
- [ ] A1-33 Correct default palette contrast and non-text state/focus contrast.
- [ ] A1-34 Check target sizes, orientation, pinch zoom and content with browser text preferences.

**Gate:** Critical public journeys work without personalization. Record and remediate baseline accessibility failures independently of the new panel.

## Phase 2 — Preference foundation

### Schema and storage

- [ ] A2-01 Create the canonical types/defaults and one integer-versioned schema from the specification.
- [ ] A2-02 Implement the 4 KiB read limit and non-null object/version validation.
- [ ] A2-03 Implement strict booleans, font enum, finite-number checks, clamping and step rounding.
- [ ] A2-04 Preserve null spacing as authored defaults; ignore unknown fields safely.
- [ ] A2-05 Handle malformed/oversized/unsupported records without throwing or writing on initialization.
- [ ] A2-06 Preserve future-version records and provide memory-only mode with explicit reset recovery.
- [ ] A2-07 Implement guarded storage read/write/remove results, including access and quota errors.
- [ ] A2-08 Implement a migration only if inventory proves a shipped format; test mapping and successful-write-before-cleanup.
- [ ] A2-09 Preserve unrelated keys, including accessibility-seen and intro-specific records.
- [ ] A2-10 Unit-test every parser branch and range boundary with representative fixtures.

### Provider and lifecycle

- [ ] A2-11 Create a single provider in the public shell and the shared consumer hook.
- [ ] A2-12 Separate saved intent, effective state, readiness and persistence status.
- [ ] A2-13 Implement explicit initialization without a competing mount-time save effect.
- [ ] A2-14 Subscribe to reduced-motion, prefers-contrast and forced-colors changes; clean subscriptions.
- [ ] A2-15 Implement precedence as a pure function without mutating saved intent.
- [ ] A2-16 Create an allowlisted DOM adapter with namespaced attributes/properties.
- [ ] A2-17 Capture/restore previous owned inline values without deleting unrelated root state.
- [ ] A2-18 Cover portals and root toaster styling while the public shell is active.
- [ ] A2-19 Verify cleanup and restoration on public -> admin -> public navigation.
- [ ] A2-20 Ensure initialization/storage errors never hide or prevent rendering children.
- [ ] A2-21 Keep actions/context stable enough to avoid unrelated component work; measure before optimizing.
- [ ] A2-22 Test remounts, Strict Mode lifecycle and absence of duplicate listeners/providers.

### Bootstrap, edits and synchronization

- [ ] A2-23 Build the small prepaint read/validate/apply path from shared contracts.
- [ ] A2-24 Verify script ordering with streamed HTML and actual CSP; do not weaken CSP.
- [ ] A2-25 Keep server and first client control markup consistent; avoid browser storage access during render.
- [ ] A2-26 Test saved visual settings on cold load and identify/document only necessary root hydration suppression.
- [ ] A2-27 Verify bootstrap-blocked and no-JS fallbacks show content and static media.
- [ ] A2-28 Apply edits immediately and persist only after readiness.
- [ ] A2-29 Coalesce range writes and flush committed values without losing the final selection.
- [ ] A2-30 Re-read the latest record before a field commit; document last-write-wins limitations.
- [ ] A2-31 Process storage changes/removal/clear without writing back.
- [ ] A2-32 Cancel stale queued writes after external updates and reset.
- [ ] A2-33 Reset only this key, preserve OS behavior, and accurately report deletion failures.
- [ ] A2-34 Display one accessible memory-only persistence notice; no recurring retry loop.
- [ ] A2-35 Test two tabs, interrupted edits, storage failure, reset and rapid navigation.

**Gate:** State, storage, prepaint, failure and cleanup behavior pass the foundation cases in VALIDATION.md.

## Phase 3 — Shared controls and visual preferences

### Panel integration

- [ ] A3-01 Build the shared settings dialog with existing audited primitives.
- [ ] A3-02 Add persistent public-navigation entry and footer statement/help link.
- [ ] A3-03 Move homepage panel ownership into the public layout and prevent duplicate dialogs.
- [ ] A3-04 Connect optional toolbar shortcuts to shared preferences.
- [ ] A3-05 Preserve episode-local transcript control behavior.
- [ ] A3-06 Ensure CMS toolbar visibility cannot disable the main settings entry or OS behavior.
- [ ] A3-07 Remove old duplicate root/body mutations and superseded classes only after integration.
- [ ] A3-08 Implement title focus, focus containment, Escape/Close and return-focus behavior.
- [ ] A3-09 Resolve interaction with mobile menu, video modal and development-notice modal.
- [ ] A3-10 Implement grouped controls, more-options disclosure, labels, values and state semantics.
- [ ] A3-11 Add text-size limits, default spacing choices and non-drag keyboard operation.
- [ ] A3-12 Show effective OS/sensory constraints without silently changing the saved switch.
- [ ] A3-13 Add reset feedback and persistence notices without duplicate announcements.
- [ ] A3-14 Make panel/controls usable at 320px, enlarged text, safe areas and with software keyboard.
- [ ] A3-15 Add concise keyboard help without global shortcuts.

### Typography and contrast

- [ ] A3-16 Implement root-relative text scale preserving browser base size.
- [ ] A3-17 Make fixed-pixel readable text and typography clamps respond appropriately.
- [ ] A3-18 Apply spacing overrides to real headings, labels, controls, tables and rich content.
- [ ] A3-19 Define narrow script/code exceptions and verify external word/paragraph spacing overrides.
- [ ] A3-20 Remove clipping in fixed-height heroes/cards, absolute layouts and overflow wrappers.
- [ ] A3-21 Verify default, intermediate and 200% text sizes across real templates.
- [ ] A3-22 Implement higher-contrast values using existing semantic color tokens.
- [ ] A3-23 Resolve hard-coded color conflicts in cards, buttons, forms, overlays and media captions.
- [ ] A3-24 Test focused/hovered/selected/invalid/disabled states and non-text contrast.
- [ ] A3-25 Respect forced colors and live OS contrast changes.
- [ ] A3-26 Implement content-link highlighting with clear button-style-link exceptions.
- [ ] A3-27 Consolidate preference rules in a scoped stylesheet; preserve unrelated styles.
- [ ] A3-28 Test browser base-font changes, 200% zoom and 400%/320px reflow without DPR logic.

### Section navigation

- [ ] A3-29 Author stable section IDs/labels on long pages; avoid duplicate IDs.
- [ ] A3-30 Build ordinary anchor navigation from eligible sections, refreshed on route/content changes.
- [ ] A3-31 Close dialog, focus selected heading and scroll below sticky content.
- [ ] A3-32 Verify hash deep links and back/forward behavior without focus regressions.

**Gate:** The shared panel and visual controls work in actual public journeys, including portals and mobile navigation.

## Phase 4 — Motion, sensory, font and reading integration

### Motion adapters

- [ ] A4-01 Connect hero-carousel to shared effective motion state and explicit rotation policy.
- [ ] A4-02 Connect circular-testimonials and home-testimonials-slider; cancel autoplay and resume timers.
- [ ] A4-03 Connect hero-video and intro-video; remove arbitrary click/scroll retry playback.
- [ ] A4-04 Remove dependencies on intro-animation-complete for access to page content.
- [ ] A4-05 Connect podcast-main-hero and all live podcast/media components.
- [ ] A4-06 Connect scroll-animations, reveals and counters to final readable reduced-motion states.
- [ ] A4-07 Integrate Framer Motion and any inventoried GSAP/RAF/observer-based effects.
- [ ] A4-08 Handle CSS pseudo-elements, smooth scrolling, hover enlargement and animation delays.
- [ ] A4-09 Keep loading/status feedback understandable without spinning or animation-end callbacks.
- [ ] A4-10 On preference activation cancel active work; on deactivation do not auto-resume.
- [ ] A4-11 Keep deliberate informative media playback accessible with pause/mute/captions controls.
- [ ] A4-12 Test hidden tabs, offscreen media, blocked play promises, source failures and route cleanup.

### Sensory presentation

- [ ] A4-13 Map removable decoration explicitly by component.
- [ ] A4-14 Reduce decorative shadows/patterns/gradients through component styles or tokens.
- [ ] A4-15 Preserve content order, essential images, focus and validation cues.
- [ ] A4-16 Keep saved typography unchanged; test combined sensory/contrast/spacing settings.
- [ ] A4-17 Confirm no whole-body filter, arbitrary zoom cap or hidden meaningful content is introduced.

### Font choices

- [ ] A4-18 Follow the font guide: pin actual release/assets and retain their exact license/checksums.
- [ ] A4-19 Provide a zero-download system font choice.
- [ ] A4-20 Register explicit same-origin font faces and styles with no default preloading.
- [ ] A4-21 Override existing heading/number/form font rules within the public scope deliberately.
- [ ] A4-22 Test regular/bold/italic/bold-italic and Nepali/English/mixed-script fallback.
- [ ] A4-23 Keep readable fallback and a helpful status on failed or slow font loading.
- [ ] A4-24 Cancel/ignore stale font completions after reset or a newer choice.
- [ ] A4-25 Verify no optional font requests until selected and measure swap/layout impact.

### Reading mode and print

- [ ] A4-26 Mark eligible authored article/resource/transcript containers and route capability.
- [ ] A4-27 Keep the same DOM, content IDs and semantic reading order.
- [ ] A4-28 Add comfortable width/spacing and hide only identified secondary decoration/promotion.
- [ ] A4-29 Preserve essential content, links, captions, embedded forms and navigation.
- [ ] A4-30 Add Exit reading mode; preserve focus and reading position.
- [ ] A4-31 Explain ineligibility on transaction pages while retaining the saved preference.
- [ ] A4-32 Verify reading mode with larger text, font, contrast and keyboard/screen reader.
- [ ] A4-33 Add print behavior that hides controls and preserves readable content and font fallback.

**Gate:** Every inventoried live media/animation component is accounted for; no CSS-only claim of stopping JavaScript playback.

## Phase 5 — Verification and refinement

### Automated and browser testing

- [ ] A5-01 Add scoped DOM testing dependencies/environment without breaking existing node suites.
- [ ] A5-02 Add component tests for actual panel/control interactions, not only a provider wrapping a button.
- [ ] A5-03 Add browser accessibility scans for the route/state matrix.
- [ ] A5-04 Add browser checks for stored preferences, CSP/hydration, storage errors and cross-tab reset.
- [ ] A5-05 Add real media/timer lifecycle checks and inspect hidden-slide focusability.
- [ ] A5-06 Add route/portal cleanup and full-page reload checks.
- [ ] A5-07 Add large-text/reflow, external spacing and forced-colors checks.
- [ ] A5-08 Use stable sandbox fixtures for forms/payment states; redact private data from artifacts.
- [ ] A5-09 Document actual local pnpm commands and required environment setup.
- [ ] A5-10 Triage every automated finding; record criterion, impact and retest evidence.

### Manual and participant testing

- [ ] A5-11 Complete keyboard-only journeys including reverse tab order and all dialogs.
- [ ] A5-12 Test NVDA + Chrome on Windows and forced colors on a real Windows browser.
- [ ] A5-13 Test VoiceOver + Safari on macOS/iOS and TalkBack + Chrome on Android.
- [ ] A5-14 Record actual versions; test small mobile viewport, orientation and software keyboard.
- [ ] A5-15 Test browser default font, text-only enlargement where supported and pinch zoom.
- [ ] A5-16 Verify speech-control names include visible labels.
- [ ] A5-17 Audit real media alternatives, documents and rich CMS content manually.
- [ ] A5-18 Test combined preferences and reset from extreme values.
- [ ] A5-19 Test slow/failed font and media requests, disabled storage and JavaScript failure.
- [ ] A5-20 Invite participants with varied access needs, including autistic and low-vision users.
- [ ] A5-21 Define accessible sessions and agreed compensation before recruitment; participation is voluntary.
- [ ] A5-22 Record task outcomes and actionable findings without collecting unnecessary disability details.
- [ ] A5-23 Resolve and retest blocking participant and manual-audit findings.

### Quality and privacy

- [ ] A5-24 Measure before/after performance on matched routes/device/network settings.
- [ ] A5-25 Verify no optional font download in the default state.
- [ ] A5-26 Check no preference/OS signals reach analytics, logs, error payloads or automatic DOM capture.
- [ ] A5-27 Verify no sensitive form/payment data appears in test reports.
- [ ] A5-28 Complete the A/AA applicability register and explain justified non-applicability.
- [ ] A5-29 Confirm zero unresolved applicable accessibility failures for the declared target; a score alone is insufficient.
- [ ] A5-30 Run relevant existing regression tests and public-to-admin shared-component checks.

**Gate:** VALIDATION.md cases have actual evidence. No critical journey is blocked, and no failure is hidden by a high automated score.

## Phase 6 — Documentation and implementation handoff

- [ ] A6-01 Publish an accurate user guide explaining controls, device settings, local persistence and reset.
- [ ] A6-02 Correct docs/features/admin/accessibility-toolbar.md to match implemented behavior.
- [ ] A6-03 Draft the accessibility statement with tested scope, audit date, limitations and support route.
- [ ] A6-04 Verify the support/contact route itself and assign an owner for accessibility reports.
- [ ] A6-05 Update privacy wording to match actual local-only preference behavior.
- [ ] A6-06 Document CMS author checks for images, links, headings, media alternatives and documents.
- [ ] A6-07 Attach architecture decisions, test records, performance samples and font provenance.
- [ ] A6-08 Record residual limitations with owner, impact, workaround and follow-up date.
- [ ] A6-09 Review the plan/checklist against actual files and remove obsolete examples.
- [ ] A6-10 Assign ongoing checks for new components and published content.
- [ ] A6-11 Create a separate operational release task covering deployment validation, CI gates and recovery.
- [ ] A6-12 Do not use the historical rollback draft without validating it for the final implementation.

**Gate:** Accessibility implementation and documentation are ready for an operational release review. Production deployment is a separate step, not implied by checking these tasks.

## Evidence template

Use one record per task group/route as needed:

| Field | Record |
| --- | --- |
| Task IDs | |
| Owner / reviewer | |
| Build or commit / date | |
| Route / content fixture / state | |
| Browser / OS / assistive technology | |
| Steps / expected / actual | |
| Result: pass, fail or justified N/A | |
| Screenshot, recording, report or test reference | |
| Defect / follow-up owner | |


---

## Recent Completed Work

### Accessibility Button Position Fix (2024)
- [x] Fixed button position issue in sensory-friendly mode using React Portal
- [x] Removed problematic CSS filter from body element
- [x] Tested across all pages and viewport sizes
- [x] Documentation created: `SENSORY-MODE-BUTTON-FIX.md`

**Evidence**: Button maintains viewport-fixed position in all scenarios including sensory mode enabled/disabled and page scrolling.

---
