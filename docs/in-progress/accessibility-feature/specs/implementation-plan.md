---
title: "Website Accessibility — Implementation Plan"
description: "Accessible defaults, personalization, user flows, state contracts and acceptance criteria"
owner: "Deesha Development Team"
status: planning
category: feature
audience: developer
last_updated: 2026-09-15
---

# Website Accessibility — Implementation Plan

**Version:** 3.0  
**Status:** Planning specification. No application implementation or completed accessibility audit is implied.  
**Current boundary:** Improve accessibility implementation documentation first; start application code afterward. CI/deployment infrastructure changes are outside this planning pass.

## 1. Document map and decisions

| Document | Purpose |
| --- | --- |
| [CHECKLIST.md](./CHECKLIST.md) | Ordered implementation tasks and completion gates |
| [VALIDATION.md](./VALIDATION.md) | Test scenarios, route coverage and acceptance evidence |
| [OpenDyslexic integration](./opendyslexic-integration.md) | Font sourcing, loading, fallback and verification |
| [IMPROVEMENTS.md](./IMPROVEMENTS.md) | Factual change log and outstanding work |

This README defines behavior. The checklist tracks execution; validation defines how to prove it. Resolve discrepancies before implementing the affected behavior.

**Decisions for this version:**

- Fix accessibility in the default site, then add optional personalization.
- One public-layout provider, one shared settings panel, multiple optional entry points.
- Store only validated, versioned preferences locally. No preference analytics or account synchronization.
- Preserve OS reduced-motion and forced-colors requirements independently of saved settings.
- No browser-zoom detection, combined enlargement cap, or emergency unstyled mode.
- No automatic intro takeover or automatic video/carousel playback in the target default experience.
- Optional fonts are preferences, not treatments or a guarantee of better reading.
- Keep implementation tasks unchecked until evidence exists.
- Deployment automation, percentage rollout, monitoring infrastructure and an operational runbook rewrite are deferred. The existing [rollback document](../../runbooks/accessibility-rollback.md) is an unvalidated historical draft, not an approved execution procedure.

## 2. Outcome, scope and accessibility target

People must be able to read content, navigate, use forms, watch or read media, donate and register without first enabling an accessibility widget. The settings panel personalizes an already usable site.

### Scope of the first implementation

- All published routes under app/(public), including direct-entry detail pages, payment returns and success/failure/pending states.
- Public navigation, footer, dialogs, notifications, rich content, search/filter controls, media and forms.
- Documents and third-party services reached from those journeys: inventory their limitations and provide accessible alternatives where needed.
- Personalization applies to the public shell and its portals. Leaving that shell must restore the prior root presentation.
- Shared-component changes require admin regression checks. A complete admin accessibility audit is separate; do not claim whole-product conformance from a public-site audit.
- Confirm whether demo routes are publicly linked before excluding them.

**Target:** WCAG 2.2 Level AA for the declared public scope. Maintain an applicability and result entry for every A/AA criterion. Automated tools alone cannot establish conformance. Claims must match the scope and evidence of the completed audit. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

Product requirements also emphasize clear language, predictable layouts, no surprise media, generous controls and testing with people with different access needs. Do not assume all autistic or dyslexic users prefer the same presentation.

### Included preferences

| Setting | Options / range | Default |
| --- | --- | --- |
| Text size | 100–200%, steps of 10 percentage points | 100% |
| Reading font | Site default, system sans-serif, OpenDyslexic | Site default |
| Higher contrast | On/off | Off; default colors must still pass |
| Reduce motion | On/off, with OS requirements always effective | Off |
| Sensory-friendly presentation | On/off | Off |
| Line spacing | Site default or 1.5–2.5, steps of 0.1 | Site default |
| Letter spacing | Site default or 0–0.12em, steps of 0.01em | Site default |
| Highlight links | On/off | Off |
| Reading mode | On/off on explicitly eligible content pages | Off |

Jump-to-section links and keyboard help are navigation aids, not persisted preferences. Word/paragraph spacing sliders are not first-release controls; tolerating external overrides of those properties remains required.

Account sync, usage analytics, a new dark-mode selector, disability-labeled presets, text-to-speech, custom global keyboard shortcuts, reading rulers and cursor replacement are deferred. Baseline failures cannot be deferred merely because a related optional feature is out of scope.

## 3. Repository integration map

Observed on 2026-09-15; confirm during the inventory phase.

| Area | Existing implementation / required integration |
| --- | --- |
| Homepage widget | components/home-accessibility-button.tsx changes root font size/body classes using local state; mounted in app/(public)/page.tsx |
| Toolbar | components/accessibility-toolbar.tsx has separate state and an episode transcript callback |
| Public shell | app/(public)/layout.tsx mounts intro media, navigation, development notice, footer and global video modal |
| Root shell | app/layout.tsx owns fonts, toaster and existing analytics |
| Styling | app/globals.css mixes semantic tokens, hard-coded colors, heading fonts, rem sizing, animation rules and old accessibility classes |
| Media | hero-video, intro-video, hero-carousel, circular-testimonials, home-testimonials-slider and podcast components |
| Animated content | scroll-animations and Framer Motion public page sections; inspect GSAP usage if present in live routes |
| Primitives | Existing Radix dialog/switch/slider primitives can be reused, with composed behavior verified |
| Forms | Donation, contact, support, event/conference registration, verification and payment result journeys |
| Storage | accessibility-seen is toolbar help dismissal, not preferences; introShown/introLastShown belong to intro behavior |
| Test setup | Jest currently uses a node environment; DOM and browser test setup must be planned explicitly |
| Existing guide | docs/features/admin/accessibility-toolbar.md claims persistence not present in the inspected controls; update when actual behavior is implemented |

Inventory actual render paths and CMS configuration. A component existing on disk does not prove it is in production. Do not infer saved preferences from the old toolbar help key or invent legacy storage formats.

## 4. Settings panel and user flows

### Entry points and layout

- Put a persistent “Accessibility settings” entry in public navigation and a link to an accessibility statement in the footer.
- Move ownership from the homepage into the public layout. An optional floating shortcut must not obscure focused content, mobile navigation or support controls.
- The optional toolbar reads/writes the same state and opens the same panel. Never render two competing dialogs.
- The CMS showAccessibilityToolbar setting controls only the additional toolbar. It must not remove the primary entry or baseline accessibility.
- Group controls into Text and reading, Motion and presentation, More reading options, and Reset/help.
- Keep text size and core toggles visible. Put detailed spacing controls in an accessible disclosure.
- Apply edits immediately without a Save button, account, reload or navigation.
- At narrow widths, large text and an open software keyboard, the panel scrolls vertically inside the available viewport. Close/reset remain reachable; respect safe areas.

### Interaction contract

Use the existing Radix modal dialog rather than a hand-built focus trap. Give it a title and description; make the background inert, contain keyboard focus and restore it on close. Initial focus goes to the dialog title with tabindex=-1 so users receive context. [WAI dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

Controls need persistent labels, visible values and native state semantics. Use native selects/ranges or audited equivalents. All sliders work without dragging; text-size buttons expose their limits and disable at 100%/200%. More-options disclosure uses an expanded state and controlled-region association.

Use the native control announcement where sufficient. A single polite status region handles reset and persistence failure. Do not announce every slider tick, restored preference or automatic content update. No new global keyboard shortcuts.

### Panel flow

~~~text
Closed
  -> activate named entry
  -> Open; focus title
  -> edit preference
  -> normalize -> derive effective state -> apply immediately -> save if available

Open -> Escape / Close / intentional outside click
     -> close -> restore original trigger

Open -> Jump to section
     -> close -> focus target heading -> scroll below sticky navigation

Open -> Reset
     -> cancel pending saves -> apply defaults -> remove saved record
     -> remain open -> announce result

Navigation while open
     -> close -> destination route focus policy takes precedence
~~~

If the original trigger disappears, use the persistent navigation trigger. If navigation occurred, focus the destination main heading/main instead. Do not stack the panel's focus trap with a video, menu or development-notice dialog.

### Required scenarios

1. New visitor finds settings, enlarges text and navigates without losing the preference.
2. Returning visitor restores valid settings without saving defaults over them.
3. OS reduced motion remains effective even if the site toggle is off; explain “Reduced motion is enabled by your device.”
4. Storage unavailable: controls work for the visit and explain that preferences cannot be saved.
5. Another tab changes or resets settings: update without write loops or repeated announcements.
6. Reading mode preserves the article and position; exiting restores presentation without losing focus.
7. A donor can review/correct inputs, complete a sandbox handoff and understand pending/failure/retry states.
8. A failed optional font or initialization path never hides content or crashes the public page.

## 5. Architecture and module ownership

The following are proposed implementation files, not files created by this documentation update.

| Module | Responsibility |
| --- | --- |
| lib/accessibility/preferences.ts | Pure defaults, types, schema and normalization |
| lib/accessibility/storage.ts | Bounded storage access, error results and confirmed migrations |
| lib/accessibility/effective.ts | Pure preference/OS/route-capability resolution |
| lib/accessibility/dom.ts | Apply and clean only allowlisted root attributes/properties |
| lib/accessibility/bootstrap.ts | Small prepaint read/validate/apply routine using shared contracts |
| contexts/accessibility-provider.tsx | Readiness, user state, system subscriptions, storage events and actions |
| lib/hooks/use-accessibility.ts | Shared consumer API |
| components/accessibility/panel.tsx | Dialog and preference controls |
| components/accessibility/landmark-nav.tsx | Authored section links and focus handoff |
| components/accessibility/reading-mode.tsx | Presentation of eligible authored content |
| app/accessibility.css | Central scoped overrides, imported once |

The public layout mounts one provider around public media and overlays. Keep site content server-renderable. Never make rendering children depend on a font or storage request. Reuse existing live-announcement utilities only after checking lifecycle and duplicate announcements.

Expose preferences, effective preferences, ready, persistence status, updatePreference and resetPreferences. Keep panel-open state local to the shared panel owner. Memoize actions/context appropriately; do not introduce a state library without evidence it is needed.

### DOM ownership and cleanup

Use a namespaced data-a11y-scope="public" marker on html while public personalization is active. Root-scoped styling reaches dialogs/portals and the root toaster. Record all owned attributes/properties and captured prior inline values.

On leaving the public layout, remove only feature-owned markers and restore prior inline properties. Do not erase unrelated theme/font classes. Test public -> admin -> public navigation, provider remounts and React Strict Mode cleanup. On reentry, reapply saved preferences.

Remove competing mutations from both existing widgets only after the shared provider is integrated. Baseline styles and OS reduced-motion behavior stay independent of optional controls.

## 6. Canonical preferences and storage

**Storage key:** deesha-a11y-preferences  
**Version:** integer 1  
**Maximum accepted raw record:** 4 KiB

~~~json
{
  "version": 1,
  "preferences": {
    "textScale": 1,
    "fontFamily": "default",
    "highContrast": false,
    "reduceMotion": false,
    "sensoryFriendly": false,
    "lineSpacing": null,
    "letterSpacing": null,
    "linkHighlight": false,
    "readingMode": false
  }
}
~~~

Store only user intent. Do not store OS settings, effective values, panel state, route history, timestamps, identifiers or font loading status. The previous documentation's examples are not evidence that a format shipped.

### Validation rules

- Accept only a non-null, non-array object with supported integer version and a preferences object.
- Read known own properties only. Ignore unknown fields inside version 1.
- Booleans must be booleans. Do not coerce strings such as "false".
- fontFamily is default, system or opendyslexic.
- textScale must be finite; clamp to 1–2 and round to 0.1.
- lineSpacing is null or a finite value clamped to 1.5–2.5 and rounded to 0.1.
- letterSpacing is null or a finite value clamped to 0–0.12 and rounded to 0.01.
- Missing or invalid fields use defaults. Null spacing preserves authored styles.
- Malformed, oversized or unsupported older records fall back safely; never write during initialization.
- Unknown future versions stay untouched. Use memory-only preferences until an explicit Reset removes that incompatible record.
- Replace malformed data only after a user edit/reset. Migration needs proof of an actual shipped format, test fixtures and a mapping; delete the old key only after a successful new write.
- Never migrate or remove accessibility-seen as if it contained reading preferences.

### Initialization flow

~~~text
Server: semantic content + static posters + default control markup
   |
Public bootstrap:
   bounded storage read -> validate -> apply owned presentation only
   error -> accessible defaults
   |
Hydration: same initial control markup as server; ready=false
   |
Provider:
   read latest storage -> normalize -> read OS settings -> subscribe
   -> derive effective state -> apply DOM -> ready=true
   |
Explicit user edits may now persist
~~~

A small synchronous public-layout bootstrap should apply stored visual settings before visible content paints. Generate it from the shared schema/DOM contracts. Prototype actual script ordering with the installed Next.js and CSP; an ordinary post-mount effect is not a prepaint solution.

Bootstrap changes only owned root presentation, not server-rendered content. Do not read localStorage directly during React render. Existing blanket hydration-warning suppression is not a validation strategy: explain any narrowly required root suppression and test for other hydration errors.

If bootstrap is blocked or fails, the provider still initializes without crashing. No-JS pages keep readable content and static media. Controls briefly expose a loading state until ready; storage failures must still complete initialization. A verified prepaint path for returning users is an acceptance task, not a reason to hide the whole page.

### Change, reset and multi-tab behavior

| Event | Required behavior |
| --- | --- |
| Local change | Normalize, apply immediately, persist complete canonical record after readiness |
| Range input | Visual update live; coalesce writes to at most once per 150ms; flush on committed input/blur |
| Reset | Cancel pending writes, restore defaults, remove only this key, keep panel open |
| OS change | Derive/apply; never overwrite saved intent |
| storage event | Re-read current key; validate/apply; do not write back |
| Key removed / storage cleared | Other tabs reset saved intent; OS settings still apply |
| Storage error | Work in memory; show one helpful persistence notice without logging stored content |
| Unmount | Cancel pending work/listeners and clean owned DOM overrides |
| Font finishes after reset | Ignore stale completion; do not reapply the old choice |

Before committing a local field edit, use the latest valid record as its base. The synchronization contract is last completed whole-record write wins; truly simultaneous edits may overwrite one another. Do not claim transactional merging. Cancel queued stale writes after an external event. Flush committed local work before shell unmount where possible; never replay an old pending save after reset.

If deletion fails, explicitly say stored settings may return after reload. Do not claim successful deletion. Retry saving on a new intentional edit, not in an automatic loop.

## 7. Effective preferences and precedence

Saved intent is distinct from effective presentation.

~~~text
effectiveReducedMotion = OS.reduceMotion OR saved.reduceMotion OR saved.sensoryFriendly

effectiveContrast =
  forcedColors ? systemColors :
  (saved.highContrast OR OS.moreContrast) ? higherContrast : siteDefault

effectiveReadingMode = saved.readingMode AND route.readingEligible
~~~

Subscribe to live prefers-reduced-motion: reduce, prefers-contrast: more and forced-colors: active changes. There is no prefers-contrast: forced media-query value.

| Combination | Resolution |
| --- | --- |
| Sensory on + motion off | Reduce motion remains effective; explain the source |
| Sensory turned off | Preserve the original explicit reduceMotion choice |
| Sensory + explicit typography | Keep user typography; sensory mode does not silently change spacing/font |
| Forced colors + higher contrast | Use system colors |
| Reading mode + ineligible route | Retain preference; display an availability explanation; no presentation change |
| Unavailable font | Use tested fallback; keep other preferences working |
| Reset + OS settings | Reset only saved intent |
| Browser zoom + text size | Both apply naturally; no cap, DPR detection or warning |

## 8. Typography, contrast and responsive behavior

### Text scaling

Scale the root with a percentage of the browser default, conceptually:

~~~css
html[data-a11y-scope="public"] {
  font-size: calc(100% * var(--a11y-font-scale, 1));
}
~~~

At 100% preserve the user's browser base size. Do not scale only body font-size or apply transform: scale to the page.

Audit rem utilities, fixed-pixel text, clamps, leading/tracking utilities, absolute positioning, fixed-height heroes/cards and overflow-hidden wrappers. Ensure headings, labels, buttons, navigation, validation text and CMS content respond. Replace readable fixed-pixel sizes where needed. Controls grow with labels; meaningful text is not clipped to preserve a design.

### Spacing and reflow

Define explicit scoped typography overrides that reach actual text despite existing leading/tracking utilities. Use narrow exceptions for code and scripts where spacing is inappropriate. Do not modify DOM text or form values. Defaults must preserve authored typography.

Test 200% text resizing, 200% browser zoom and 400% reflow at a 1280px starting viewport. Ordinary content fits 320 CSS pixels without loss; legitimate two-dimensional content can use local labeled scrolling. Do not hide content to make the test pass. [Reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

Test external overrides of line height 1.5, paragraph spacing 2em, letter spacing 0.12em and word spacing 0.16em together where applicable. These are tolerance tests, not required defaults or a demand for four sliders. [Text-spacing guidance](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)

### Contrast, focus and targets

Audit the default palette independently of the higher-contrast toggle. Normal text generally needs 4.5:1; qualifying large text needs 3:1. Include text over images, muted/placeholder text, hover and validation states. [Contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

Map higher contrast onto actual existing tokens: background/foreground, card, popover, primary, muted, border, input and status colors. Resolve hard-coded conflicting utilities. Avoid unused new variables that do not affect components. Never apply a global body saturation/contrast filter.

Use visible focus, borders and non-color state cues. Audit non-text contrast as well. Under forced colors, respect system colors and avoid blanket forced-color-adjust: none.

Target 44×44 CSS pixels for standalone controls as a product standard. Evaluate compact controls against the AA 24px target-size rule and its exceptions; do not describe 44px as the AA minimum. [Target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

### Fonts and reading mode

Use the [font guide](./opendyslexic-integration.md). Offer system sans-serif without a download. Check English, Nepali/Devanagari, mixed scripts and numerals; do not force unsupported glyphs.

Reading mode applies only to authored article/resource/transcript containers marked data-reading-content. Keep the same DOM, IDs and semantic order; begin with a comfortable 65ch content width. Hide only explicitly identified decorative/secondary promotional elements. Keep navigation, settings, article content, captions, links, legal information and embedded forms reachable.

Provide Exit reading mode near the article. Preserve scroll/focus on entry and exit; do not clone content into a second main region. Donation/payment/registration/verification forms are ineligible. Print rules preserve readable content and applicable font preference while hiding settings controls.

## 9. Motion, sensory presentation and media

**Target default:** no automatic intro takeover and no automatic video/carousel playback. This is a change to implement, not a claim about current behavior.

| Existing behavior | Target integration |
| --- | --- |
| Intro video | Optional watch action; navigation never waits for ended events or timers |
| Hero video | Static poster initially, explicit play/pause/mute, controls visible to keyboard/touch |
| Carousels | Manual previous/next; rotation starts only from an explicit control |
| Carousel focus/hover | Stop rotation; do not restart automatically on blur/mouseleave |
| Motion preference enabled | Stop decorative playback/rotation and cancel timers, retries, RAF and animations |
| Motion preference disabled | Do not automatically resume stopped content |
| Informative media | User can intentionally play it with controls; preference does not remove access |
| Offscreen/hidden tab | Pause decorative playback; arbitrary clicks/visibility changes do not undo an explicit pause |
| Scroll reveals/counters | Reduced-motion and no-JS paths show readable final content |
| CSS motion | Handle pseudo-elements, transforms and smooth scrolling; do not disable only duration |
| JavaScript motion | Integrate Framer Motion/GSAP/observers/timers with effective state |
| Loading feedback | Text/status or static/determinate progress remains when animation stops |

Automatic rotation is unavailable under effective reduced motion, but manual slide selection remains usable. Hidden slides must not contain tabbable links/buttons. Avoid live announcements for automatic slide changes. [Carousel guidance](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)

Sensory presentation removes inventoried decorative patterns, parallax, hover enlargement, animated gradients and unnecessary shadows. Preserve content order, essential diagrams and focus/error feedback. Do not globally desaturate the body or impose arbitrary spacing multipliers.

Audit existing podcasts/videos for captions, transcripts, meaningful visual information and audio description as applicable. Include iframe titles, player controls, unavailable-embed alternatives and keyboard operation. Preserve episode-local transcript visibility callbacks during toolbar refactoring.

Define CMS author requirements for alternatives and media review. Do not defer media accessibility on the incorrect premise that the site has no media.

## 10. Baseline navigation, forms and content

- Establish descriptive page titles, sensible headings, a main landmark, working skip link and stable navigation.
- Prefer native semantics and avoid duplicate roles. In-page links use real stable IDs and scroll-margin for sticky navigation.
- Define destination focus for route changes separately from back/forward restoration and dialog closing.
- Forms need persistent labels, input purpose/autocomplete, instructions, linked inline errors and consistent invalid-submit focus.
- Invalid submission focuses an error summary or first invalid field; preserve input and provide clear corrections. Announce asynchronous success/failure without repeating every error.
- Donation and registration require review/correction of consequential inputs, comprehensible payment handoff, pending/failure/cancellation states and duplicate-submit protection. Use sandbox payments and synthetic data in tests.
- Keep password managers and paste usable. Audit OTP, CAPTCHA and time limits where present. [Authentication guidance](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html)
- Test tables, menus, filters, search, pagination and accordions in actual populated/empty/error states.
- CMS content needs meaningful links, image alternatives, language metadata, heading structure, accessible tables and embeds.
- Audit linked PDFs/receipts for reading order, tagging, links and form fields as applicable; provide an equivalent accessible HTML route where needed. A widget does not fix a PDF.
- Provide an accessibility statement with scope, audit date, known limitations and a monitored accessible support route. Do not claim legal certification.
- New content must pass author checks; document responsibilities for captions, alt text and download alternatives.

## 11. Privacy, security and resilience

First release stores preferences locally only. Do not send preferences, feature choices or OS accessibility signals to analytics, logs, error services or feedback payloads. Verify existing automatic event/DOM capture does not collect control values.

Generic operational errors may follow the site's existing policy but must not include storage content, form data, full token-bearing URLs or inferred disabilities. Do not attach preferences automatically to a support request.

Explain local storage and reset accurately. Do not state that using localStorage by itself means consent or privacy review never applies. Future telemetry or account sync needs a separate design.

Treat stored data as untrusted. Use allowlisted enums and numbers, never arbitrary HTML/CSS or evaluated content. Bootstrap must work with actual CSP without weakening it. Font files are same-origin.

Failures must be local: settings/storage/font errors never blank the page, swallow a payment result, lock keyboard focus or leave invisible content. Error recovery should restore owned presentation safely and keep baseline page content intact.

## 12. Performance and testability

Current performance baselines are **unmeasured**. Record route, build, device/browser and network for each before/after sample. These are proposed implementation budgets, to confirm during Phase 0:

| Measurement | Initial target |
| --- | --- |
| Additional initial compressed JS | <= 15 KiB for bootstrap/provider/entry |
| Bootstrap | <= 3 KiB compressed; no network dependency for validation |
| Additional compressed CSS | <= 10 KiB |
| Optional font | Zero font requests before selection |
| Local toggle response | p95 <= 100ms on agreed low-end device; font loading separate |
| Lab layout shift | CLS <= 0.1; explicitly inspect saved preferences and font swap |
| Lab LCP change | No unexplained median regression > 10% with comparable samples |

Avoid strict JSDOM mount timers and claims of zero layout shift. Measure real components. Do not introduce unrelated telemetry infrastructure for this implementation.

Use existing pnpm/Jest tooling, add isolated DOM setup and browser tests as needed, and document commands that actually exist once implemented. No CI workflow changes are part of this documentation scope.

## 13. Implementation phases and completion

| Phase | Deliverable | Depends on | Completion gate |
| --- | --- | --- | --- |
| 0 | Inventory, scope, defaults and baseline evidence | Planning review | Unknown integration points resolved |
| 1 | Baseline semantics, forms, content and media behavior | 0 | Key journeys work without personalization |
| 2 | Schema, bootstrap, storage, provider and DOM lifecycle | 0 | State/failure/synchronization tests pass |
| 3 | Shared panel, typography, contrast and navigation aids | 1, 2 | Keyboard/zoom/panel journeys pass |
| 4 | Motion adapters, sensory presentation, font and reading mode | 2, 3 | Real-component and fallback tests pass |
| 5 | Full accessibility validation and user testing | 1–4 | Applicable failures resolved; evidence recorded |
| 6 | Implementation handoff and content maintenance | 5 | Docs reflect verified behavior and remaining operational work |

The checklist contains the work items. Do not promise calendar weeks before content/media remediation and test capacity are known.

### Implementation-ready acceptance

- Scope and all A/AA applicability/results documented.
- Actual user journeys pass keyboard, representative screen readers, text enlargement and failure scenarios.
- No unresolved automated violations after manual triage; no hidden serious/critical failures.
- Storage, OS precedence, prepaint behavior, hydration, cross-tab reset and route cleanup verified.
- Media/document alternatives and content-author responsibilities established.
- Performance targets measured and met or revised with evidence.
- User testing includes varied needs; blocking findings resolved.
- User guide, accessibility statement, privacy text and admin guide describe actual behavior.
- No claim that finishing this checklist automatically completes deployment readiness.

Operational release planning, CI gates and recovery procedure validation remain separate follow-up work before publishing the implementation.


---

## Recent Implementation Updates

### Accessibility Button Position Fix (2024)

**Issue**: Accessibility button lost viewport-fixed positioning in sensory-friendly mode  
**Root cause**: CSS `filter` property on parent created containing block  
**Solution**: Implemented React Portal rendering to `document.body`  
**Status**: ✅ Fixed and tested

**Files modified:**
- `components/home-accessibility-button.tsx` - Added portal rendering
- `app/globals.css` - Removed body filter, added targeted saturation

**Documentation**: See `SENSORY-MODE-BUTTON-FIX.md` for complete technical details

---
