# Contrast and reading aids: implementation plan

Status: Complete — closed at the user’s request on 2026-09-26. The final behavior is recorded in STANDARDS.md, section 24; the original design below is historical.
Date: 2026-09-23
Companion standard: ../STANDARDS.md

## 1. Agreed experience

Extend the existing public accessibility panel; do not install another widget.

Contrast choices:

| Mode | Behavior |
| --- | --- |
| Normal | Existing site appearance |
| High contrast | Existing black-on-white contrast treatment |
| Inverted contrast | Predominantly white-on-black content and controls, with deliberately paired foregrounds/backgrounds |

“Inverted contrast” means a dark high-contrast palette, not photographic-negative inversion of every pixel. Preserve media and the established grayscale/photo-scrim treatments. Actual pixel inversion would be a different feature and is outside this plan.

Cursor/reading-aid control cycles in this exact order:

Off → Large cursor → Reading mask → Reading guide → Off.

Each activation replaces the previous aid. Contrast and the cursor control work independently. Show the active name and progress (for example, “Reading mask, 2 of 3”), plus a direct Off/reset action. Existing text, font, spacing, reduced-motion, sensory-friendly, link-highlight, and reading-mode settings retain their meaning. The existing `readingMode` layout preference is NOT the reading mask.

## 2. What the code review established

- `contexts/accessibility-provider.tsx` already owns persistence, validation, body classes, reset, presets, system preferences, and live announcements.
- `lib/types/accessibility.ts` uses storage schema V2, with legacy V1 migration. Contrast is currently `highContrast: boolean`. Validation, equality checks, defaults, presets, and migration all enumerate fields explicitly; adding only panel buttons would be incomplete.
- The visible panel is `components/home-accessibility-button.tsx`, portaled to document.body. `components/accessibility-toolbar.tsx` also consumes the contrast boolean and must be included in the consumer migration.
- Public layout already wraps all public routes in the provider. Admin routes must not acquire these effects.
- Existing contrast CSS includes broad `!important` overrides, component-specific exceptions, photo treatments, and explicit SVG-path colors. The recent episode play-circle issue demonstrates why text/background/icon colors must be handled together.
- Sensory-friendly styles change filters/transforms and hide some decorative elements. Reading overlays require an explicit exemption so their position and visibility are stable.
- Accessibility and UI dialogs use multiple z-index levels; an arbitrary giant z-index would risk covering menus and video dialogs.

## 3. State and storage design

Introduce schema V3 with two canonical fields:

```ts
type ContrastMode = 'normal' | 'high' | 'inverted'
type CursorMode = 'off' | 'large' | 'mask' | 'guide'
```

Replace the stored contrast boolean with `contrastMode`; add `cursorMode`. Do not persist a second boolean alongside the enum. Update every existing contrast consumer, including the alternate toolbar and examples. Keep the existing storage key and load-before-save guard.

Migration rules:

- V2 highContrast=false → normal; true → high; cursorMode → off.
- V1 first follows the established font/text/spacing conversion, then maps into V3.
- Preserve all unrelated settings, including explicit null spacing values and system reduced-motion behavior.
- Missing/invalid new enum values fall back safely without discarding valid older preferences.
- Update defaults, validation, equality, modified indicators, individual resets, Reset All, preset expansion, and both announcement maps together.
- Reset Contrast → normal; reset Cursor → off. Existing presets retain their current behavior and do not silently enable a reading aid.
- Preserve a V2 migration backup before overwriting storage, for rollback recovery; do not clear user settings on deployment.
- Continue localStorage/sessionStorage fallback. Test unavailable storage and corrupt JSON as well as successful migration.

## 4. Contrast implementation

Do not apply `filter: invert()` to body or a wrapper. That can invert media, change stacking/containing blocks, and interfere with fixed elements and portals.

Use the existing high-contrast class for shared non-color behavior and an explicit public contrast-mode attribute for palette selection. Establish semantic pairs for canvas, content, muted content, surface, border, filled controls, control text, focus, selected states, and disabled states.

Before enabling the new palette:

1. Inventory existing high-contrast rules in globals and component modules.
2. Convert relevant hard-coded content/control colors to paired semantic variables, retaining the current light-mode values exactly.
3. Keep photo scrims, white-on-photo text, play triangles/circles, and meaningful media layers separate from content palette variables. Retain the recent scoped thumbnail fix.
4. Define inverted values for the same pairs, including hover, focus, selected, expanded, error, and placeholder states.
5. Check navbar, footer, accessibility panel, portaled dropdowns/dialogs, and video controls as explicit surfaces.

Avoid new universal descendant-color rules and background-class substring matching. Keep all new CSS scoped to public accessibility ownership, including owned portals. Respect browser forced-colors instead of disabling it site-wide. Do not equate inversion with automatic WCAG compliance.

## 5. Cursor and reading overlays

Create a small client component, mounted once inside the public provider, with a CSS module. Portal its visual reading layers directly to document.body, outside filtered/transformed content wrappers.

Large cursor:

- Use a local SVG cursor asset with a clear outline, an accurate hotspot, and a native fallback.
- Provide arrow and actionable-pointer variants. Preserve text selection, resize, and disabled cursor semantics.
- Do not hide the native cursor and draw a pointer with React on every mouse movement.
- Apply only for an appropriate fine pointer. Browser chrome and cross-origin iframe content remain outside our control.

Reading mask:

- Two dimming regions leave a clear horizontal reading band, initially about 160 CSS px high; enlarge/clamp it for increased text scale and small viewports.
- Follow pointer Y; clamp at viewport edges. Keyboard focus moves the band to the focused element, expanding it when needed so controls are not obscured.

Reading guide:

- A clearly outlined horizontal rule follows pointer Y just below the reading position. Use a contrasting edge so it remains visible on light, dark, and photographic backgrounds.
- Move it with keyboard focus too, without capturing arrow keys or changing native form behavior.

Both reading layers:

- `pointer-events: none`, no tabindex, and `aria-hidden=true`; they must never intercept clicks, selection, dragging, wheel scrolling, or touch events.
- Hide over the accessibility panel, active modal/dialog, and embedded-player interaction; resume afterwards without changing the saved preference. Audit custom dialogs and Radix portals explicitly.
- Remain off until a pointer location or keyboard focus provides a useful position. Hide on window blur/pointer exit and during print; avoid an initial flash.
- Do not draw a fake pointer on touch-only devices. Keep the preference available for a later mouse/trackpad; mask/guide may follow keyboard focus, not ordinary touch scrolling.
- Attach listeners only while needed. Use passive pointer listeners, refs/CSS variables, and at most one requestAnimationFrame update per frame. Do not rerender the page or write storage on pointer movement.
- Clean up listeners, animation frames, portal nodes, and owned mode classes when disabled/unmounted or when leaving public routes.

## 6. Panel semantics and layering

Use a labeled native contrast select/radio group so all three contrast choices are discoverable. For the requested cycling Cursor tile, use a button activated by click/Enter/Space, visible current-mode text, an accessible name describing the current and next mode, and a polite announcement only when the mode changes. A boolean aria-pressed value alone cannot describe its four states.

Preserve the panel's existing focus return, Escape behavior, and footer opener. Do not add document-wide keyboard shortcuts. Pointer position updates must not generate live announcements.

Define a documented reading-layer stacking level relative to the public content, sticky navigation, accessibility panel, dropdowns, dialogs, toasts, and video overlays. Explicitly exempt the reading layer from sensory-friendly decorative hiding and transforms; do not rely on its incidental CSS class name.

## 7. Implementation order and review gates

1. Add V3 types, migration, validation, defaults, equality, resets, presets, and tests. Gate: old saved settings survive unchanged except for the intended field mapping.
2. Refactor high-contrast palette pairs without exposing inverted mode. Gate: existing high-contrast screenshot/computed-style checks remain equivalent, especially thumbnails, play icons, navbar, and hero controls.
3. Add and test the inverted palette on representative public surfaces and portals. Gate: no unreadable content or negative media, and switching back restores prior appearance.
4. Build cursor/mask/guide as an isolated component. Gate: pointer/keyboard behavior and cleanup tests pass without mounting the production panel control.
5. Add panel controls and reset/announcement integration. Gate: combined settings, navigation persistence, and modal interactions pass.
6. Update STANDARDS.md and record actual route/state results. Ship only verified states; leave unrelated business logic and CMS content untouched.

## 8. Required regression tests

Automated behavior tests:

- V1/V2 migration, V3 round-trip, invalid enums/JSON, unavailable storage, null spacing, presets, per-control reset, Reset All, and modified indicators.
- Exact cursor cycle and independent contrast switching; no simultaneous mask and guide.
- Pointer events pass through; no focusable overlay; no listeners/frames remain after disable or unmount.
- Keyboard focus is visible in mask/guide mode; native input navigation and selection remain intact.
- Panel/dialog suspension and resumption; no effects leak into admin routes.

Browser checks:

- All three contrast modes × four cursor states on a representative page; then representative pairs with text at 200%, each font, sensory-friendly and reduced motion.
- Desktop and 390px mobile; pointer, keyboard-only, touch, and a real screen reader. Include system forced-colors.
- Home carousel, all hero treatments, episode archive/latest/all-episodes/highlights, play triangle/circle, share button, filters, navbar/mobile drawer, footer, and accessibility panel.
- Contact/Support forms; donation selection and validation; Conference steps and event upload; verification and payment status states. Do not submit real transactions for UI testing.
- Program, story and event detail, including CMS imagery; video modal, dropdowns, sticky navigation, tooltip/error content, zoom, scroll, and print.
- Normal mode before/after disabling both features; refresh and client-side navigation; public → admin → public.

Release evidence must distinguish source review, axe results, computed-color assertions, screenshots, interaction tests, and untested states. Resolve/use valid fixtures for the previously observed event/story database permission errors before claiming those populated flows are verified. Existing repository-wide type/lint failures must be tracked separately from new diagnostics.

## 9. Boundaries and completion criteria

No backend, payment, submission, registration, CMS, or navigation destinations need changing. Do not promise zero regressions; require the gates above instead. Cross-origin embedded players keep their own cursor/theme behavior.

Complete when both features are usable, saved settings migrate safely, existing contrast and normal modes remain stable, overlays never block interaction, reset fully restores defaults, and verification/documentation accurately cover the tested routes and states.
