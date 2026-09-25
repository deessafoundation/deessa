# Accessibility Standards - Per-Page Checklist

**Status:** Living Document
**Last Updated:** 2026-09-21
**Scope:** Every public-facing page must meet these standards

---

## How to Use This Document

For each page you build or audit, go through every section below. Mark each item as:
- `[x]` - Done
- `[ ]` - Not done
- `[~]` - Partial / needs review

At the bottom of each page section, add a summary block:

```markdown
### Page: [Page Name]
- [ ] All standards met
- [ ] Contrast mode verified
- [ ] Keyboard navigation verified
- [ ] Screen reader tested
```

---

## 1. Structural Semantics

Every page must have proper HTML landmark structure.

| # | Standard | WCAG Reference |
|---|----------|----------------|
| 1.1 | Page uses semantic HTML5 elements: `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>` | 1.3.1 Info and Relationships |
| 1.2 | Only ONE `<main>` element per page | Best Practice |
| 1.3 | All content sections use `<section>` with an `aria-label` or visible heading | 1.3.1 |
| 1.4 | Page has a single, descriptive `<h1>` | 1.3.1 |
| 1.5 | Heading hierarchy is sequential (h1 → h2 → h3), never skips levels | 1.3.1 |
| 1.6 | Lists use `<ul>`, `<ol>`, or `<dl>` instead of div-based lists | 1.3.1 |

### Code Reference
- Layout wraps pages in `<main id="main-content">` (`app/(public)/layout.tsx:36`)
- Skip-to-main link targets this ID (`app/(public)/layout.tsx:22-27`)

---

## 2. Skip Navigation

| # | Standard | WCAG Reference |
|---|----------|----------------|
| 2.1 | Skip-to-main-content link is the first focusable element on the page | 2.4.1 Bypass Blocks |
| 2.2 | Link is visually hidden until focused (slides into view) | 2.4.1 |
| 2.3 | Link targets `<main>` or `#main-content` with matching `id` | 2.4.1 |
| 2.4 | Link has high contrast styling (blue bg, white text) | 2.4.1 |

### Implementation
```tsx
// app/(public)/layout.tsx - Must be first child inside root div
<a href="#main-content" className="skip-to-main">Skip to main content</a>
```

```css
/* globals.css */
.skip-to-main {
  position: absolute;
  left: -10000px;           /* Hidden off-screen */
  z-index: 999;
  background-color: oklch(0.68 0.11 230);
  color: white;
  padding: 1rem 2rem;
}
.skip-to-main:focus {
  left: 50%;                /* Centered on focus */
  transform: translateX(-50%);
  top: 0;
}
```

---

## 3. High Contrast Mode

Every page must render correctly when `body.high-contrast` is active. High contrast means readable content and identifiable controls; it does **not** mean obscuring photographs or forcing every pixel to pure black or white.

These standards incorporate the Podcast, navbar, homepage, and public hero fixes made on 2026-09-20 and 2026-09-21. They supersede the earlier blanket rules to remove all gradients, make every overlay white, or preserve all `text-white` utilities regardless of their actual background.

### 3.1 Foregrounds and Surfaces

| # | Standard | Implementation requirement |
|---|----------|----------------------------|
| 3.1.1 | Choose foreground and background together | Dark text on light surfaces; white text on dark surfaces. Inspect the final computed styles, including child elements. |
| 3.1.2 | Preserve meaningful image detail | Use grayscale for hero photography. Avoid stacking brightness reduction, heavy contrast filters, and near-opaque overlays. |
| 3.1.3 | Gray surfaces and neutral gradients are allowed | Use them to preserve image visibility and text contrast. Decorative colored gradients can be simplified per component. |
| 3.1.4 | Separate media overlays from content surfaces | Thumbnail overlays may become transparent. Hero overlays may retain deliberate shading behind text. Neither should become an accidental solid white or black cover. |
| 3.1.5 | Pair button text, icons, borders, and surface colors | Check default, hover, focus, active, and disabled states. Do not infer the correct foreground from `text-white` or `bg-*` alone. |
| 3.1.6 | Keep focus visible against its immediate surroundings | A black outline works on light surfaces; the homepage hero uses a white focus outline on a dark image. |
| 3.1.7 | Verify contrast separately from visual appearance | Grayscale and the overlay percentages below are design choices, not proof of WCAG conformance. Measure text and non-text contrast against the rendered background. |

### 3.2 Selector Ownership and Cascade Safety

- Scope component corrections with CSS Modules, a dedicated component class, a stable hero ID, or a purpose-specific data attribute, under `body.high-contrast`.
- Do not use `.group`, `h3`, `p`, `span`, `button`, or utility substrings as the sole component identifier. `.group` is shared by cards, navigation, footer links, and many unrelated elements.
- Attribute substring selectors match the entire class string. `[class*="bg-slate-9"]` also matches `dark:bg-slate-900` even when dark mode is inactive; hover utilities can match the same way.
- Use `!important` only where needed to override existing important or inline declarations. Scope the override narrowly; do not escalate global selectors to repair one component.
- Keep normal-mode utilities and interaction handlers intact. Existing broad rules remain in `app/globals.css`; their presence is not a pattern to copy into new work.
- Only the podcast **text** rules were narrowed from `.group` to `.podcast-card` during this work. Other broad podcast/media rules remain and require their own regression review before further cleanup.

Example from the homepage implementation:

```css
/* CSS Module: only this hero's identified controls receive these colors. */
:global(body.high-contrast) :global(#home-hero).hero [data-hero-control],
:global(body.high-contrast) :global(#home-hero).hero [data-hero-control] * {
  color: #000 !important;
}

:global(body.high-contrast) :global(#home-hero).hero [data-hero-control] {
  background: #fff !important;
  border: 2px solid #000 !important;
}
```

### 3.3 Failures Found and How We Fixed Them

| Area | Cause / observed failure | Implemented correction |
|------|--------------------------|------------------------|
| Podcast Episode Archive | A `bg-black/20` play overlay became opaque black; the bottom gradient became solid white and covered the image and part of the play circle. | Dedicated CSS Module classes for overlay layers; both become transparent in high contrast. |
| Podcast play icon | Setting the SVG's color alone did not override rules targeting its inner shape. The result was a white triangle on a white circle. | Scope `color`, `fill`, and `stroke` to the play SVG **and its descendants**, with a white circle. Explicit fill is appropriate for this solid play triangle, not for every outline icon. |
| Latest Episode | The same opaque play overlay covered the thumbnail. | Reused the scoped thumbnail styles and fallback image component; retained the video-modal click handler. |
| Navbar: Podcasts, Support, Contact | Dark-mode class substrings triggered white descendant text, while another rule made links black. Correcting text alone produced black-on-black buttons. | Explicitly paired a white row/link surface with black labels and icon descendants in `navbar.module.css`; retained a black border and active-link underline via `aria-current`. |
| Homepage program titles and footer labels | Global rules described as podcast rules actually targeted every `.group h3`, `.group p`, and `.group span`. | Restricted those text selectors to `.podcast-card`; added that class to the relevant podcast cards. Program headings and footer labels regain their appropriate foreground colors. |
| Homepage hero badge and controls | Backdrop-blur backgrounds turned white while button labels and arrow/pause icons stayed white. | Identified controls with `data-hero-control`; set their surface, text, descendants, and focus treatment together. |
| Homepage podcast feature | CTA text became black on a black card; the play triangle lacked contrast. | Narrowed the podcast text rule and added a scoped white play surface with black icon color. |
| Homepage testimonials | `hsl(var(--primary))` and similar expressions wrapped complete color values in another color function. The SVG stroke became `none`. | Passed `var(--primary)` and `var(--primary-foreground)` directly; used `color-mix(...)` for opacity. Added high-contrast black controls with white strokes. |
| Homepage images | Remote URLs were prefixed with `/`, producing `/https://...`; some local files were missing. | Preserved absolute URLs, normalized relative paths, and used the existing local placeholder on error. No CMS records were changed. |
| Homepage Our Story image | A gradient utility was converted into a solid white overlay. | Replaced its utility-based background with a scoped overlay class that is transparent in high contrast. |
| Dark hero photographs | Heavy image filters plus stacked dark scrims erased image detail. Two 85%-black overlays leave only 2.25% of the original light contribution. | Use `grayscale(1)` without extra brightness reduction, then one deliberate scrim matched to the text position. |

### 3.4 Hero Treatment Matrix

All values below apply **only in high-contrast mode**. Preserve the existing normal-mode design, links, content, and motion behavior.

| Page / selector | Media and text | Desktop treatment | Mobile treatment |
|-----------------|----------------|-------------------|------------------|
| Home / `#home-hero` | Photo, left-aligned white text | Grayscale; one horizontal black scrim: 68% at left, 60% at the 60% stop, 25% at right. Existing vertical scrim becomes transparent. | At widths <= 767px, a uniform 60% black scrim. |
| Who We Are / `.about-hero-section` | Photo, left-aligned white text | Grayscale; same 68% / 60% / 25% scrim. Replaces `contrast(1.4) brightness(0.6)` plus a 92% black scrim. | Uniform 60% black scrim. |
| What We Do / `#whatwedo-hero` | Photo mosaic, white text | Grayscale images; same horizontal scrim; explicitly white hero copy. | Uniform 60% black scrim; the extra mobile-only dark overlay becomes transparent to avoid double darkening. |
| Stories / `#stories-hero` | Background photo, dark text | Grayscale photo at opacity 1; white scrim: 82% at left, 70% at the 60% stop, 55% at right. Hide decorative colored glow layers. | Uniform 80% white scrim. |
| Our Story / `#our-story-hero` | Photo, centered white text | Grayscale; uniform 60% black scrim across the image, with white title, subtitle, and badge text. | Same uniform scrim for centered copy. |
| Events / `#events-hero` | Decorative background, dark text; **no hero photo** | Neutral 135-degree gradient from `#f3f3f3` to `#dedede`; hide colored/pattern decoration layers. | Same light-gray treatment. |

Do not apply grayscale to an entire section: it also affects text, buttons, and other content. Filter only the image or background-photo layer. Do not add an unrelated photo to a hero that has none merely to match another page.

### 3.5 Media Loading and Color Tokens

1. Diagnose CSS coverage separately from loading failures. Check the image request, resolved URL, `complete`, and `naturalWidth`; lazy images outside the viewport may not have loaded yet.
2. Podcast archive/latest fallback order is saved thumbnail URL → YouTube `hqdefault.jpg` → `/placeholder.svg`. Track failed sources so errors do not create an endless retry loop. If every source fails, retain an accessible unavailable message.
3. Homepage hero/story fallback is `/image_coming_soon.png`. Missing original images still require an asset/CMS correction; a placeholder is not recovery of the original photo.
4. Preserve `https://...` URLs; add a leading slash only to local relative paths. Remote hosts must also satisfy the existing Next.js image configuration.
5. Use `sizes` appropriate to the component's layout and preserve alt text, dimensions/fill, and existing image behavior.
6. Inspect the token format before using it. A complete `oklch(...)`, `lab(...)`, or other CSS color must be used as `var(--token)`, not `hsl(var(--token))`. Use `color-mix(in srgb, var(--token) 80%, transparent)` when appropriate.

### 3.6 Diagnostic and Implementation Workflow

1. Reproduce the issue on the actual route with high contrast enabled. Capture a before screenshot and identify the exact component rendering it; similarly named cards may use different files.
2. Inspect every layer: image, image wrapper, dark/play overlay, gradient strip, badge, SVG, SVG path, text, and the nearest painted background.
3. Read computed `color`, `background`, `background-image`, `opacity`, `filter`, `fill`, and `stroke`. A correct parent color does not guarantee correct descendants.
4. Identify the winning selector and its scope. Check utility substring matches, dark/hover class strings, inline styles, `!important`, and stacking order.
5. Make the smallest correction at the owning component. Change both foreground and background where needed; reuse a scoped component when the same failure occurs in another section.
6. Keep normal styling, routes, modal handlers, filtering, pagination, carousel state, CMS data, and unrelated working-tree changes intact.
7. Verify the intended page again after each edit. Confirm `location.href` before evaluating DOM state or taking screenshots, especially when using multiple browser tabs or sessions.
8. Test the affected controls and neighboring shared components. Record failures, untested states, and pre-existing lint findings instead of claiming all functionality or accessibility requirements passed.

### 3.7 Regression Checklist

- [ ] Normal mode and high-contrast mode both checked after the final edit.
- [ ] Text, CTA labels, SVG shapes, borders, and focus indicators remain visible.
- [ ] Thumbnail overlays do not cover photos or clip play circles.
- [ ] Hero photos retain visible detail; text contrast is measured against representative light and dark image regions.
- [ ] Default, hover, keyboard focus, active, and disabled states checked where applicable.
- [ ] Desktop and mobile layouts checked; text wrapping and 200% scaling do not obscure content.
- [ ] Previous/next, pause/play, testimonial navigation, links, and video-modal actions exercised when affected; unchanged handlers alone are not a functional test.
- [ ] Image success and failure paths checked without assuming unloaded lazy images are broken.
- [ ] Navbar, footer, homepage, podcast archive/latest, and other consumers checked when a shared selector changes.
- [ ] User accessibility settings restored after testing; temporary DOM toggles are not persistence tests.
- [ ] Findings distinguish visual checks from automated contrast, keyboard, screen-reader, and full regression results.

---

## 4. Keyboard Navigation

| # | Standard | WCAG Reference |
|---|----------|----------------|
| 4.1 | All interactive elements are focusable via Tab | 2.1.1 Keyboard |
| 4.2 | Focus order follows logical reading order (top-to-bottom, left-to-right) | 2.4.3 Focus Order |
| 4.3 | Focus indicator is visible on every focusable element | 2.4.7 Focus Visible |
| 4.4 | No keyboard traps (user can always Tab away) | 2.1.2 No Keyboard Trap |
| 4.5 | Custom widgets implement expected keyboard patterns | 4.1.2 Name, Role, Value |

### 4.1 Component Keyboard Patterns

| Component | Keys | Behavior |
|-----------|------|----------|
| **Carousel** | `ArrowLeft`, `ArrowRight` | Navigate slides |
| **Carousel** | Focus/Blur | Pause/resume autoplay |
| **Modal/Dialog** | `Escape` | Close modal |
| **Accessibility Panel** | `Escape` | Close panel |
| **Dropdown menus** | `ArrowUp`, `ArrowDown`, `Enter`, `Escape` | Navigate and select |
| **Multi-step forms** | `Ctrl+ArrowRight/Left`, `Ctrl+Enter`, `Escape` | Next/Previous/Submit/Cancel |
| **Accordion/FAQ** | `Enter`, `Space` | Toggle expand/collapse |
| **Slider/Range** | `ArrowLeft/Right`, `ArrowUp/Down` | Adjust value |
| **Carousel indicators** | `Enter`, `Space` | Go to slide |

### 4.2 Focus Management

| # | Standard |
|---|----------|
| 4.2.1 | Modals trap focus inside when open |
| 4.2.2 | Closing a modal returns focus to the trigger element |
| 4.2.3 | The accessibility panel stores `previousFocusRef` and restores on close |
| 4.2.4 | Autoplaying carousels pause when any child receives focus |
| 4.2.5 | Skip links receive focus via Tab as the first element |

---

## 5. Screen Reader Support

### 5.1 ARIA Attributes

| # | Standard | WCAG Reference |
|---|----------|----------------|
| 5.1.1 | Decorative images have `aria-hidden="true"` or empty `alt=""` | 1.1.1 Non-text Content |
| 5.1.2 | Meaningful images have descriptive `alt` text | 1.1.1 |
| 5.1.3 | Interactive elements have `aria-label` when visual label is insufficient | 4.1.2 |
| 5.1.4 | Dynamic state changes use `aria-pressed`, `aria-expanded`, `aria-selected` | 4.1.2 |
| 5.1.5 | Carousels use `aria-roledescription="carousel"` and `aria-roledescription="slide"` | Best Practice |
| 5.1.6 | Forms use `aria-required`, `aria-invalid`, `aria-describedby` for errors | 3.3.2 Labels or Instructions |
| 5.1.7 | Loading states use `role="status"` or `aria-live="polite"` | 4.1.3 Status Messages |
| 5.1.8 | Error messages use `role="alert"` | 3.3.3 Error Suggestion |

### 5.2 Live Regions

| # | Standard |
|---|----------|
| 5.2.1 | A `LiveAnnouncer` element exists with `role="status"` and `aria-live="polite"` |
| 5.2.2 | Accessibility preference changes announce: "[Setting] enabled/disabled/updated" |
| 5.2.3 | Form validation errors announce to screen readers |
| 5.2.4 | Carousel slide changes announce current slide number |
| 5.2.5 | Dynamic content updates (e.g. "items loaded") announce via live region |

### 5.3 Visually Hidden Content

Use `.sr-only` class for screen-reader-only content:

| # | Use Case |
|---|----------|
| 5.3.1 | "Previous slide" / "Next slide" button labels in carousels |
| 5.3.2 | Dialog close button labels |
| 5.3.3 | Pagination "More pages" labels |
| 5.3.4 | Form field labels when visual label is elsewhere |
| 5.3.5 | Section headings that are only for screen reader navigation |

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

---

## 6. Color Contrast

| # | Standard | WCAG Reference |
|---|----------|----------------|
| 6.1 | Normal text (< 18pt / < 14pt bold): contrast ratio >= 4.5:1 | 1.4.3 Contrast (Minimum) |
| 6.2 | Large text (>= 18pt / >= 14pt bold): contrast ratio >= 3:1 | 1.4.3 |
| 6.3 | UI components and graphical objects: contrast ratio >= 3:1 | 1.4.11 Non-text Contrast |
| 6.4 | Focus indicators: contrast ratio >= 3:1 against adjacent colors | 2.4.7 |

### 6.1 Utility Functions

Use the built-in contrast checker:

```ts
import { meetsContrastRatio, calculateContrastRatio } from '@/lib/utils/accessibility'

// Check if a color pair passes WCAG AA
meetsContrastRatio('#3FABDE', '#FFFFFF')        // false - blue on white
meetsContrastRatio('#000000', '#FFFFFF')        // true - black on white
meetsContrastRatio('#000000', '#FFFFFF', true)  // true - large text

// Get exact ratio
calculateContrastRatio('#000000', '#FFFFFF')     // 21:1
```

### 6.2 Contrast in High Contrast Mode

Pure black on pure white (or the inverse) has a 21:1 ratio. However, not every surface in this implementation uses that pair: hero photographs, gray gradients, transparent layers, and some accent treatments have different effective backgrounds.

Do not claim automatic AAA compliance from the presence of `body.high-contrast`. Measure the final rendered foreground/background pair against section 6 requirements. For text over photos, test representative bright and dark areas at the actual crop, viewport, and text position. Recheck when CMS images or copy change. See section 3.4 for current hero treatments and section 19 for the limits of completed validation.

---

## 7. Text Scaling & Typography

| # | Standard | WCAG Reference |
|---|----------|----------------|
| 7.1 | Text scales from 100% to 200% without content loss | 1.4.4 Resize Text |
| 7.2 | At >= 150% text scale, line clamping and truncation are removed | 1.4.4 |
| 7.3 | Layout does not break or overlap at any text scale | 1.4.4 |
| 7.4 | Line spacing adjustable from 1.5 to 2.5 | 1.4.12 Text Spacing |
| 7.5 | Letter spacing adjustable from 0 to 0.12em | 1.4.12 |

### CSS Variable System

```css
:root {
  --a11y-font-scale: 1;        /* 1.0 - 2.0 */
  --a11y-line-height: 1.5;     /* 1.5 - 2.5 */
  --a11y-letter-spacing: 0em;  /* 0 - 0.12em */
}

body {
  font-size: calc(16px * var(--a11y-font-scale));
  line-height: var(--a11y-line-height);
  letter-spacing: var(--a11y-letter-spacing);
}
```

### Anti-Clipping Rules

```css
/* At >= 150% text scale, remove restrictions that clip text */
html[data-text-scale-high="true"] [class*="line-clamp"] {
  -webkit-line-clamp: unset;
}
html[data-text-scale-high="true"] [class*="truncate"] {
  overflow: visible;
  text-overflow: unset;
  white-space: normal;
}
```

---

## 8. Motion & Animation

| # | Standard | WCAG Reference |
|---|----------|----------------|
| 8.1 | Animations respect `prefers-reduced-motion: reduce` | 2.3.3 Animation from Interactions |
| 8.2 | Carousel autoplay pauses on hover and focus | 2.2.2 Pause, Stop, Hide |
| 8.3 | No content flashes more than 3 times per second | 2.3.1 Three Flashes |
| 8.4 | Reduced motion mode disables all CSS animations and transitions | Best Practice |
| 8.5 | Sensory-friendly mode additionally reduces image saturation to 0.8 | Autism-informed |

### Animation CSS Variables

```css
:root {
  --a11y-animation-duration: 1;    /* 0 = off, 1 = on */
  --a11y-transition-duration: 200ms;  /* 0ms when disabled */
}
```

### Reduced Motion CSS

```css
body.reduce-motion *,
body.reduce-motion *::before,
body.reduce-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}
```

---

## 9. Sensory-Friendly Mode

| # | Standard | Detail |
|---|----------|--------|
| 9.1 | All animations, transitions, transforms disabled | Excludes a11y widget |
| 9.2 | Image saturation reduced to 0.8 | Applied to `main > *` only |
| 9.3 | Shadows simplified to minimal | `--shadow-sm/md/lg` reduced |
| 9.4 | Gradients simplified or removed | Solid colors preferred |
| 9.5 | Backdrop blur effects removed | `backdrop-filter: none` |
| 9.6 | Line height increased to 1.7 | Better readability |
| 9.7 | Auto-enables reduce motion | Always paired |
| 9.8 | Accessibility widget position preserved | `position: fixed !important` |

### Critical Rule

The accessibility panel itself must NEVER be affected by sensory-friendly mode:

```css
body.sensory-friendly .accessibility-button,
body.sensory-friendly .accessibility-panel {
  filter: none !important;
  transform: none !important;
}
```

---

## 10. Focus Indicators

| # | Standard | WCAG Reference |
|---|----------|----------------|
| 10.1 | All interactive elements have visible focus indicator | 2.4.7 Focus Visible |
| 10.2 | Focus indicator has >= 3:1 contrast ratio | 1.4.11 Non-text Contrast |
| 10.3 | Focus indicator is consistent across the page | Best Practice |

### Focus Styles by Mode

| Mode | Outline | Offset |
|------|---------|--------|
| Default | `3px solid oklch(0.68 0.11 230)` (ocean blue) | 2px |
| High Contrast | Black on light surfaces; white on dark hero surfaces | Component-specific: baseline 3px, homepage hero 4px |
| Sensory-Friendly | `4px solid oklch(0.68 0.11 230)` (thicker) | 3px |

---

## 11. Forms

| # | Standard | WCAG Reference |
|---|----------|----------------|
| 11.1 | Every form field has a visible or `aria-label` label | 1.3.1 |
| 11.2 | Required fields marked with `aria-required="true"` | 3.3.2 |
| 11.3 | Required asterisks have `aria-hidden="true"` | Best Practice |
| 11.4 | Error messages linked via `aria-describedby` | 3.3.1 Error Identification |
| 11.5 | Invalid fields have `aria-invalid="true"` | 3.3.1 |
| 11.6 | Error containers use `role="alert"` | 4.1.3 Status Messages |
| 11.7 | Checkbox/radio groups use `role="group"` with `aria-labelledby` | 1.3.1 |
| 11.8 | Form labels use `<label htmlFor>` or `aria-label` | 1.3.1 |

### Form Accessibility Pattern

```tsx
<label htmlFor="email" className="sr-only">Email address</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={!!error}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && (
  <p id="email-error" role="alert">{error}</p>
)}
```

---

## 12. Images & Media

| # | Standard | WCAG Reference |
|---|----------|----------------|
| 12.1 | All meaningful images have descriptive `alt` text | 1.1.1 Non-text Content |
| 12.2 | Decorative images have `alt=""` or `aria-hidden="true"` | 1.1.1 |
| 12.3 | Videos have captions/transcripts available | 1.2.1 Audio-only and Video-only |
| 12.4 | Autoplaying videos are muted by default | Best Practice |
| 12.5 | Video mute/unmute buttons have `aria-label` describing state | 4.1.2 |
| 12.6 | Partner/logo strips use `aria-hidden="true"` on decorative logos | Best Practice |

---

## 13. Navigation

| # | Standard | WCAG Reference |
|---|----------|----------------|
| 13.1 | Main navigation uses `<nav>` with `aria-label` | 1.3.1 |
| 13.2 | Mobile menu toggle has `aria-label` | 4.1.2 |
| 13.3 | Mobile drawer uses `role="dialog"` and `aria-modal="true"` | 4.1.2 |
| 13.4 | Close button has `aria-label="Close menu"` | 4.1.2 |
| 13.5 | Active page indicated via `aria-current="page"` or visual styling | 2.4.8 Location |
| 13.6 | Breadcrumbs use `aria-label="Breadcrumb"` | Best Practice |

---

## 14. Modals & Overlays

| # | Standard | WCAG Reference |
|---|----------|----------------|
| 14.1 | Modal uses `role="dialog"` and `aria-modal="true"` | 4.1.2 |
| 14.2 | Modal has `aria-labelledby` pointing to title | 4.1.2 |
| 14.3 | Focus is trapped inside modal when open | 2.1.2 |
| 14.4 | `Escape` key closes the modal | 2.1.1 |
| 14.5 | Focus returns to trigger element on close | Best Practice |
| 14.6 | Backdrop click closes the modal (optional but recommended) | Best Practice |
| 14.7 | Close button has `aria-label` | 4.1.2 |

---

## 15. Persistence & State

| # | Standard |
|---|----------|
| 15.1 | Accessibility preferences persist in `localStorage` with `sessionStorage` fallback |
| 15.2 | Stored data includes version number for future migrations |
| 15.3 | Preferences are validated and clamped to safe ranges on load |
| 15.4 | V1 to V2 migration is handled transparently |
| 15.5 | Storage quota errors are caught and user is informed via live announcer |
| 15.6 | System preference changes (`prefers-reduced-motion`) auto-apply at runtime |

### Storage Schema

```ts
interface StoredAccessibilityData {
  version: 2
  preferences: AccessibilityPreferences
  lastUpdated: string  // ISO 8601
}
```

---

## 16. Print Styles

| # | Standard |
|---|----------|
| 16.1 | High contrast settings preserved in print (black-on-white) |
| 16.2 | Dyslexia font preserved in print |
| 16.3 | Accessibility controls hidden in print |
| 16.4 | All animations/transitions disabled in print |

---

## 17. Presets

Pre-configured accessibility profiles for common needs:

| Preset | Use Case | Settings |
|--------|----------|----------|
| `default` | Standard users | All defaults |
| `lowVision` | Low vision users | textScale: 1.5, highContrast: true, lineSpacing: 1.8, letterSpacing: 0.05 |
| `dyslexia` | Dyslexia | OpenDyslexic font, lineSpacing: 1.7, letterSpacing: 0.08, textScale: 1.2 |
| `sensory` | Autism/sensory processing | sensoryFriendly: true, reduceMotion: true, lineSpacing: 1.7 |
| `motor` | Motor disabilities | textScale: 1.3, reduceMotion: true, linkHighlight: true |

---

## 18. Testing Checklist

Run this checklist on EVERY page before merge:

### Automated Tests

| # | Test | Command |
|---|------|---------|
| 18.1 | axe-core accessibility scan | Browser devtools → axe extension |
| 18.2 | Lighthouse accessibility audit | Chrome DevTools → Lighthouse → Accessibility |
| 18.3 | Color contrast check | axe or manual with WebAIM contrast checker |
| 18.4 | Keyboard-only navigation | Tab through entire page |

### Manual Tests

| # | Test | How |
|---|------|-----|
| 18.5 | Tab through all interactive elements | Verify focus order and visible indicator |
| 18.6 | Enable high contrast mode | Verify all text is readable, no white-on-white |
| 18.7 | Enable sensory-friendly mode | Verify no animations, reduced saturation |
| 18.8 | Scale text to 200% | Verify no content loss or overlap |
| 18.9 | Screen reader test (VoiceOver/NVDA) | Verify all content is announced correctly |
| 18.10 | Escape key closes all modals/panels | Verify no keyboard traps |
| 18.11 | Print the page | Verify high contrast preserved, controls hidden |
| 18.12 | Test on mobile | Verify touch targets >= 44x44px, responsive layout |

### Page Audit Template

```markdown
### Page: [Page Name]
- [ ] 1. Structural semantics correct
- [ ] 2. Skip navigation present
- [ ] 3. High contrast mode verified
- [ ] 4. Keyboard navigation works
- [ ] 5. Screen reader tested
- [ ] 6. Color contrast passes WCAG AA
- [ ] 7. Text scaling to 200% works
- [ ] 8. Motion/animation respects reduced motion
- [ ] 9. Sensory-friendly mode works
- [ ] 10. Focus indicators visible
- [ ] 11. Forms are accessible
- [ ] 12. Images have alt text
- [ ] 13. Navigation is accessible
- [ ] 14. Modals are accessible
- [ ] 15. Preferences persist correctly
- [ ] 16. Print styles work
- [ ] 17. axe-core passes
- [ ] 18. Lighthouse score >= 90

**Tested by:** [Name]
**Date:** [Date]
**Issues found:** [List or "None"]
```

---

## 19. Implementation Record: 2026-09-20–21

### What changed

- **Podcasts:** Introduced `archive-thumbnail.module.css` and `ArchiveThumbnailImage`; integrated them into Episode Archive and Latest Episode. Corrected overlay transparency and the solid play triangle's SVG descendants. The image helper accepts layout-specific `sizes` and classes.
- **Navbar:** Added `navbar.module.css` and secondary-row/link classes. Paired white surfaces with black text/icons and exposed active navigation through `aria-current`.
- **Homepage:** Added `homepage-accessibility.module.css` and `HomepageImage`; corrected hero controls, the story-image overlay, podcast play circle, testimonial tokens, image URL normalization, and missing-image fallback. Added `data-hero-control` and `data-hero-shade` hooks rather than changing control handlers.
- **Shared CSS:** Narrowed the podcast text selectors to `.podcast-card`; marked the cards in `podcast-card.tsx`, `podcast-archive-section.tsx`, and `episodes-page-content.tsx`. This removed unintended effects on homepage program titles, the podcast feature link, and footer contact labels.
- **Hero follow-up:** Replaced near-black treatments with visible grayscale photography on Home, Who We Are, What We Do, and Our Story. Preserved Stories' dark text with a light grayscale backdrop; Events retained its photo-free design with a neutral gray gradient.
- **Scope:** Normal-mode utility styling and existing content/data were retained. These changes did not intentionally alter filters, event registration, video-modal handlers, carousel state logic, or destinations. That is an implementation boundary, not a guarantee that every interaction has been regression-tested.

### Verification performed and its limits

The implementation was inspected in the local browser at `http://localhost:3000`. The workflow used Kimi WebBridge navigation/DOM inspection and screenshots, plus source inspection and targeted ESLint runs. Computed foreground/background colors, overlay styles, grayscale filters, and SVG strokes/fills were checked alongside rendered screenshots.

- Confirmed the repaired homepage text/icon treatments and successful remote hero image loading. Missing local hero/story files rendered the existing placeholder.
- Inspected normal and high-contrast homepage rendering. Visually checked the navbar correction and the later hero treatments for Home, Who We Are, What We Do, Stories, Events, and Our Story in high contrast.
- Targeted podcast lint checks completed with existing warnings. The new `HomepageImage` component passed lint. The broader homepage lint run reported three pre-existing errors: synchronous state-setting in the hero effect and two explicit `any` declarations in `homepage-sections.tsx`, plus existing unused-symbol warnings.
- The earliest podcast fixes were initially source/lint checked without completed browser visual verification. A later podcast inspection checked rendered card styles, but was not a complete playback, loading, or accessibility regression suite.
- Browser sessions were not always reliable indicators of the active route; one Our Story evaluation landed on Events and was repeated after confirming the URL. Carousel click checks did not establish reliable pause/next results. Do not record those interactions as passed merely because handlers were unchanged.
- Responsive rules were implemented, but a complete mobile-device, hover/focus-state, 200% text-scaling, screen-reader, axe/Lighthouse, contrast-ratio, or end-to-end functional audit was **not** completed during this work. Complete section 18 and the regression checklist before certifying a page as fully compliant.

### Remaining maintenance

- Replace missing local hero/story assets or update their CMS paths with approved images. Keep the fallback even after correcting content.
- Audit the remaining broad rules in `app/globals.css` before changing them. The completed work did not remove all utility-substring selectors or consolidate all accessibility CSS.
- Recheck any hero when its image or copy changes. These overlay values are not universal contrast guarantees.
- Keep file references below aligned with the implementation; prefer selector/component names over brittle line-number ranges.

---

## File Reference

Paths are repository-relative. These references describe the implementation rather than certifying that every referenced file satisfies all standards.

| File | Responsibility |
|------|----------------|
| `app/globals.css` | Legacy high-contrast rules, narrowed `.podcast-card` text rules, Who We Are hero grayscale/scrim rules, reduced motion, sensory mode, focus and print styling |
| `components/podcasts/archive-thumbnail.module.css` | Archive/latest thumbnail overlays, play-circle surface, SVG and path colors |
| `components/podcasts/archive-thumbnail-image.tsx` | Thumbnail source fallback and responsive image props |
| `components/podcasts/podcast-archive-section.tsx` | Archive integration and explicit podcast-card marker |
| `components/podcasts/podcast-latest-episode.tsx` | Latest Episode integration; existing modal action retained |
| `components/podcasts/podcast-card.tsx` | Shared podcast-card marker |
| `components/podcasts/episodes-page-content.tsx` | All-episodes card marker; not a claim of complete overlay remediation on this route |
| `components/navbar.module.css`, `components/navbar.tsx` | Scoped secondary navigation surfaces, label/icon colors, active state |
| `components/homepage-accessibility.module.css` | Homepage hero controls and scrims, story overlay, program label, podcast play icon, testimonial controls |
| `components/homepage-image.tsx` | Homepage CMS image normalization and placeholder fallback |
| `components/hero-carousel.tsx` | `#home-hero`, explicit media/control hooks, existing slide handlers |
| `components/homepage-sections.tsx` | Homepage image integration and corrected testimonial token usage |
| `components/page-hero-contrast.module.css` | Scoped What We Do, Stories, Our Story, and Events high-contrast hero treatments |
| `components/about-hero.tsx` | Who We Are photo, `.about-hero-section`, and `.about-hero-scrim` hooks |
| `app/(public)/whatwedo/page.tsx` | `#whatwedo-hero`, photo mosaic, main/mobile scrim hooks |
| `app/(public)/stories/page.tsx` | `#stories-hero`, background-photo and decoration hooks |
| `app/(public)/our-story/page.tsx` | `#our-story-hero`, centered copy and scrim hook |
| `app/(public)/events/page.tsx` | `#events-hero`, neutral decorative background hooks |
| `contexts/accessibility-provider.tsx` | Accessibility state, preference application, persistence |
| `lib/types/accessibility.ts` | Preference types, presets, validation |
| `lib/utils/accessibility.ts` | Accessibility utilities and focus/live-announcement helpers |
| `components/home-accessibility-button.tsx` | Accessibility panel UI |
| `app/(public)/layout.tsx` | Public layout and accessibility-provider integration |
