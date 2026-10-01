# Autism Speaks accessibility: analysis and deessa implementation roadmap

**Reviewed:** 16 September 2026  
**Status:** Research and implementation proposal; application code unchanged.  
**Reference:** [Autism Speaks](https://www.autismspeaks.org/)  
**Relationship to existing plans:** This supplements [README.md](./README.md), [CHECKLIST.md](./CHECKLIST.md), and [VALIDATION.md](./VALIDATION.md). The README remains the behavior specification. New features below are proposals, not silently approved additions to its scope.

**Detailed execution backlog:** [tasks.md](./tasks.md) consolidates the core task IDs and adds feature-by-feature extension tasks, dependencies and acceptance gates.

## 1. Recommendation

We can achieve a similarly capable experience by extending deessa's existing React accessibility system. The reference site uses **UserWay**, verified from the open menu's branding, its `userwayAccessibilityIcon` control, and its `cdn.userway.org` iframe. It is a third-party personalization widget rather than evidence that every part of the underlying site is accessible.

For deessa, prioritize a reliable shared panel, accessible default pages, typography, contrast, and complete motion control. Add navigation and reading aids after that foundation. Consider a vendor only if advanced voice/dictionary features justify its ongoing cost and integration requirements.

The visible breadth of the reference is achievable. Equivalent usability requires testing entire journeys, including forms, media, documents and payment handoffs; installing a menu does not establish that result.

## 2. What was actually inspected

The homepage was loaded in a live browser, the floating bottom-left accessibility button was opened, and the UserWay menu was scrolled. Both a screenshot and the accessibility tree were inspected. Public page text and official W3C guidance were also reviewed. deessa findings below come from source inspection, not a running-site audit.

**Evidence limits:** Menu presence and exposed descriptions were verified. Individual transformations, speech output, persistence, mobile behavior, profile contents and full keyboard/screen-reader compatibility were not tested. The profiles expansion could not be completed because the browser tool rejected iframe input coordinates. A feature being listed below does not mean its effectiveness was verified. No conformance score is assigned to either site.

### Verified reference menu inventory

| Visible feature | Observed detail | How to approach it in deessa |
| --- | --- | --- |
| Accessibility launcher | Floating icon; menu title advertises CTRL+U | Shared launcher plus footer link; avoid copying a shortcut that conflicts with browser commands |
| Widget language | English (USA) selector | Translate panel labels and help through our content strategy; menu translation is separate from translating the website |
| Accessibility Profiles | Collapsible preset section | Consider task-based presets such as Comfortable reading and Less motion; profile contents were not verified |
| Oversized Widget | Separate switch | Make panel controls generously sized and responsive; optional larger controls later |
| Screen Reader | UserWay-branded reading control | Optional read-aloud feature later; preserve compatibility with users' own assistive technology |
| Contrast + | Exposed description names invert, dark contrast and light contrast | Start with one tested higher-contrast theme; additional themes only after token/state audits |
| Smart Contrast | Separate option | Prefer validated theme colors before considering automatic contrast alteration |
| Highlight Links | Dedicated toggle | Expose existing `linkHighlight` preference after CSS verification |
| Bigger Text | Dedicated toggle | Extend our control to the existing plan's 100–200% range |
| Text Spacing | Dedicated toggle | Reuse spacing controls; verify wrapping and user stylesheet overrides |
| Pause Animations | Dedicated toggle | Pause actual JS animations, videos and carousels, not only CSS animations |
| Hide Images | Dedicated toggle | Optional later; preserve informative images or equivalent alternatives and layout |
| Dyslexia Friendly | Font control with vendor information link | Offer site default, system sans-serif and OpenDyslexic as preferences |
| Cursor | Enhanced cursor control | Optional larger pointer; retain native text-selection and resize cursors |
| Tooltips | Dedicated toggle | Make existing help keyboard/touch accessible before adding global tooltips |
| Page Structure | Dedicated option | Build an optional heading/landmark navigator from semantic page content |
| Line Height | Dedicated toggle | Reuse the current line-spacing model |
| Text Align | Dedicated toggle | Optional reading-area alignment; preserve RTL, tables and form layout |
| Dictionary | Dedicated toggle | Later content/language feature requiring definition sources and editorial review |
| Saturation | Dedicated toggle | Prefer scoped decorative-image treatment and semantic colors |
| Reset / Move / Hide | Reset button and launcher customization section | Reliable reset first; movement/hiding later with a permanent way to reopen |

This inventory records the live [Autism Speaks homepage menu](https://www.autismspeaks.org/). Vendor documentation separately describes widget customization and API controls: [UserWay help](https://help.userway.org/en/collections/3433175-userway-accessibility-widget), [UserWay API](https://userway.org/docs/). Vendor documentation does not prove which options work on the reference site.

### Useful patterns outside the widget

The homepage exposes a skip link, named navigation controls, descriptive image alternatives, search, and prominent help routes. It groups resources by audience and topic. These reduce navigation effort and deserve attention alongside visual settings. This observation does not establish correct focus behavior or complete image-alternative quality.

## 3. What deessa already has

| Source | Existing implementation | Implication |
| --- | --- | --- |
| `contexts/accessibility-provider.tsx` | React context, versioned local persistence, preference validation, announcements, root CSS variables and body classes | Extend this system instead of introducing a second preference owner |
| `lib/types/accessibility.ts` | Text scale, font toggle, contrast, motion, sensory mode, links, line/letter spacing and reading mode | Much of the basic feature vocabulary exists |
| `components/home-accessibility-button.tsx` | Floating portal panel, text/spacing controls, contrast, motion, sensory/font toggles, reset | Rebuild interaction semantics while retaining useful preference wiring |
| `components/accessibility-toolbar.tsx` | Separate toolbar with text presets, contrast and optional transcript callback | Consolidate settings entry points; transcript availability remains a media responsibility |
| `app/(public)/layout.tsx` | Public provider, skip link, main landmark, intro and video-modal integration | Public shell is the natural integration boundary |
| `app/globals.css` | Typography variables and contrast/sensory/reading styles | Consolidate broad and repeated rules before expanding visual modes |

The repository already has a detailed accessibility implementation plan. Historical completion notes are not proof that the current implementation meets that plan.

### Concrete gaps found in source

1. **Panel interaction:** The floating panel is a generic `div` with a clickable backdrop. This component has no dialog role/name, focus containment, Escape handler or focus restoration. Use the installed Radix dialog primitive with a labeled title and verified keyboard behavior.
2. **Small-screen geometry:** The panel uses `w-80` plus a 1.5rem right offset. At a 320px viewport, that combination can extend beyond the left edge. Use bounded width, safe-area spacing and a scrollable mobile sheet.
3. **Text-size mismatch:** The floating control allows 80–140%; the other toolbar cycles 100/120/140%. The planning README specifies 100–200%. Share one range and integer step model across entries.
4. **Incomplete exposed controls:** `linkHighlight` and `readingMode` exist in state but are not offered by the inspected floating panel. Verify their behavior before exposing them.
5. **Reset and OS preference:** `resetAll()` assigns static defaults. With OS reduced motion already active, the change listener may not fire again. Compute effective motion independently of resettable user settings.
6. **Motion is not just CSS:** The sensory CSS sets `animation-play-state` on `video[autoplay]`; this does not pause video playback. Integrate `pause()` and player/carousel APIs in the owning components. Audit GSAP and Framer Motion usage too.
7. **Broad sensory styling:** A rule reduces opacity on `[aria-hidden="true"]:not(svg)`. That attribute does not mean an element is visually decorative; backdrops and other UI can be affected. Use explicit decorative markers.
8. **Lifecycle and initial rendering:** Preferences load in effects, and the inspected root/body style effects do not restore prior values on provider unmount. Implement the existing plan's initial-paint strategy and public-scope cleanup; verify navigation into admin.

These are source findings and test targets. No running deessa browser session was audited during this documentation task.

## 4. Proposed user experience

Use a labeled Accessibility entry available throughout public routes and a permanent footer entry. Opening it presents a compact, scrollable panel with clear sections:

- **Reading:** text size, font, line spacing, letter spacing and reading layout.
- **Appearance:** higher contrast and link highlighting.
- **Motion and comfort:** reduced motion and sensory-friendly presentation, with a brief description of exactly what changes.
- **Help:** reset, accessibility statement and a monitored feedback route.

Show active values and ordinary on/off states. Changes apply immediately and remain locally saved. Keep the close/reset controls reachable at high zoom. Explain when reduced motion remains active because of the operating system. Avoid labeling presets with diagnoses or promising that a font treats a reading difficulty.

For a modal panel, move focus inside, contain Tab navigation, support Escape, and return focus to the opener; background content must be inert while modal. See [WAI dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). Use approximately 44px controls as a product design target, rather than describing that number as the universal AA requirement.

Do not add all twenty reference options to the first release. A smaller, understandable panel with reliable controls is the first milestone.

## 5. Implementation architecture

### State and persistence

Keep one provider under the public layout and one shared panel. Extract validated defaults, migration and effective preference calculation into reusable functions. Treat user choices and effective settings separately: sensory mode and OS motion requirements can force effective reduced motion without destroying the user's underlying preference.

Use versioned, allowlisted local data; handle malformed JSON, unavailable storage and migration failures with safe defaults. Respect the existing README's cross-tab reset and synchronization contract. Do not collect preference values in analytics or infer disability from them.

Apply saved presentation before paint through the existing plan's small CSP-compatible initialization design, sharing validation logic with hydration. Restore only styles/classes owned by this feature on public-layout exit. Avoid network dependence for basic settings.

### Styling and component adapters

Consolidate presentation into documented CSS variables and explicit feature attributes. Prefer scoped content selectors to universal filters or style rewriting. Test theme tokens across text, buttons, links, inputs, validation states, overlays and focus indicators.

Media components need explicit adapters for effective reduced motion: stop autoplay, stop timers and animated loops, show usable static content, and preserve manual playback controls. Turning motion back on must not unexpectedly restart audio/video. Essential loading and payment status must remain understandable without spinning effects.

Reading mode should adjust content width and density without removing navigation, forms, required notices or meaningful content. Fonts need suitable language fallback, especially for Nepali/Devanagari content; optional font choice must not make unsupported scripts unreadable.

### Advanced features after the core

| Feature | Implementation direction | Important acceptance condition |
| --- | --- | --- |
| Page structure | Derive a heading list from semantic content; update on route change | Activation scrolls and focuses the target without confusing history |
| Reading guide | Optional visual ruler tied to pointer/keyboard position | Does not intercept clicks or obscure focused controls; easy dismissal |
| Larger cursor | Scoped CSS cursor assets | Pointer-only enhancement; never presented as keyboard accessibility |
| Image visibility | Explicitly distinguish decorative and informative media | Preserve equivalent information and essential controls |
| Read aloud | Separate controller for start/pause/resume/stop, rate and language | No automatic speech; stop on navigation; verify browser/device voice availability and any data processing |
| Dictionary | Select known terms and show reviewed definitions | Works by keyboard/touch; verified language coverage and content licensing |
| Presets | Apply transparent bundles of existing settings | Users can inspect changes, adjust individually and reset predictably |

A read-aloud tool should be named as such. It does not replace NVDA, VoiceOver or other assistive technology, and must not speak over them automatically. Do not promise Nepali speech support until tested on target devices.

## 6. Build ourselves or integrate UserWay?

| Approach | Advantages | Costs and constraints |
| --- | --- | --- |
| Extend our current system — recommended | Fits existing architecture; exact control of sensory/media behavior, branding and local preference handling | We own accessibility engineering, testing, maintenance and advanced reading features |
| Evaluate UserWay | Closely resembles the reference menu; vendor maintains its widget | Verify current plan features, licensing, privacy, CSP, performance, language coverage, iframe behavior and compatibility through a trial |

No vendor pricing or plan entitlement was verified. Do not estimate purchase cost from this review. A trial should compare the same representative routes and assistive-technology scenarios as the custom implementation. If adopted, replace overlapping controls rather than running two systems that fight over fonts, colors and motion.

## 7. Delivery sequence

| Priority | Deliverable | Done when |
| --- | --- | --- |
| P0 | Baseline route audit and source issues above | Keyboard, focus, forms, media and content failures have recorded fixes or scoped issues |
| P1 | Shared panel and state/lifecycle repair | Open/close, mobile layout, reset, saved preferences, OS behavior and route cleanup pass |
| P1 | Core typography, contrast, links and sensory behavior | Real public pages work with combined settings and JS/media motion is controlled |
| P2 | Reading layout, page structure and optional presets | User testing shows benefit; essential information remains available |
| P3 | Read aloud, dictionary, cursor and image options | Language, content, privacy, performance and fallback requirements pass |

Estimate after P0 establishes the number of affected templates, media components and third-party flows. Separate panel engineering from content remediation and user testing in any estimate. This document does not change deployment infrastructure or mark implementation tasks complete.

## 8. Validation and success criteria

Target the existing plan's **WCAG 2.2 AA public scope**. Relevant checks include text contrast (normally 4.5:1; 3:1 for large text), 200% text enlargement, reflow at 320 CSS pixels subject to criterion exceptions, keyboard access and visible/unobscured focus. Test user text-spacing overrides together: 1.5 line height, 2em paragraph spacing, 0.12em letter spacing and 0.16em word spacing. These are summarized checks, not the full standard. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

Use [VALIDATION.md](./VALIDATION.md) for the full matrix and add evidence for:

- Homepage and direct-entry article/program pages; navigation, contact, donation and event registration; pending, error and success states.
- Keyboard-only use; NVDA with a Windows browser; VoiceOver with Safari where test equipment is available; touch and screen magnification.
- Panel at narrow widths, 200% text size and 400% browser zoom; combined spacing/font/contrast modes; close/reset always reachable.
- OS reduced motion and forced colors; video, intro, carousel, modal and animated loading states.
- Fresh load, saved settings reload, malformed/blocked storage, cross-tab changes, reset and leaving the public shell.
- Meaningful images, captions/transcripts, heading order, labels, validation messages, accessible download alternatives and third-party limitations.
- Automated accessibility scanning plus manual triage and task-based testing with people with varied access needs. Record tool/browser versions and unresolved issues.

Do not report a passing automated scan as proof of full conformance. The success measure is that people can complete the important journeys with and without personalized settings.

## 9. Immediate implementation handoff

Start with the panel semantics, mobile sizing, shared text scale and effective reduced-motion model. Then connect motion preferences to the real media components and consolidate the CSS. This produces a useful first increment using the architecture already present, while the remaining UserWay-inspired features can be evaluated individually.

**Documentation verification:** Existing source and planning files were inspected; reference menu observations and untested behavior are separated above. Application tests were not run because this task adds only this research document.
