# Accessibility Validation Plan

**Version:** 3.0  
**Updated:** 2026-09-15  
**Status:** Test specification; no results are claimed.  
**Related:** [Implementation plan](./README.md), [task checklist](./CHECKLIST.md)

## 1. Evidence and coverage

For every test record route/content fixture, application build, date, tester, browser/OS/assistive technology, starting preferences, steps, expected/actual result and an evidence link. Record failures with user impact and an owner. Use synthetic personal data and sandbox payment providers; never perform a real donation to test accessibility.

Create a register for all applicable WCAG 2.2 A/AA criteria. This document's cases are an engineering test plan, not a replacement for that register or a complete conformance audit.

### Route inventory

Include every published public route. The following seed families come from the repository; expand dynamic routes with real representative fixtures and verify exact live URLs.

| Family | Seed routes / states |
| --- | --- |
| Entry and information | /, /about, /our-story, /impact, /whatwedo, /programs |
| Rich content | /whatwedo/[slug], /stories, /stories/[slug], /press |
| Media | /podcasts, /podcasts/[slug], /podcasts/episodes, /podcasts/highlights |
| Contact and support | /contact, /support, /get-involved, newsletter forms |
| Donation | /donate, /donate/success, /donate/cancel and external handoff |
| Events | /events, /events/[slug], registration and all payment/result children |
| Conference | /conference, registration and all payment/result children |
| Recovery / verification | /complete-payment, /payments/khalti/return, /verify, /verify/[id] |
| Policy and future help | /privacy, /terms, planned accessibility statement |
| Error states | Not-found, content unavailable, request failure, expired/invalid token, empty lists |
| Shared components | Menus, footer, settings, video modal, development notice, toaster |
| Boundary regression | Public -> admin -> public; changed shared primitives used by admin |

For repeated templates, automate broad route scanning and manually inspect representative short/long/empty/error records plus every critical transaction flow. Exclude a route only with a documented scope reason.

## 2. Test setup

- Use the existing pnpm lockfile and project Jest conventions.
- Keep existing node-environment suites intact. Add a dedicated DOM environment/configuration or file-level environment for accessibility component tests.
- Add and pin compatible Testing Library, user-event, jest-dom, jest-axe and the Jest DOM environment as actually required. A jsdom dependency alone does not configure Jest.
- Use Playwright and @axe-core/playwright for browser journeys/scans if introduced; pin compatible versions and install browsers for the local test environment.
- Run the actual app with deterministic content and sandbox configuration. Specify how a developer starts it, seeds fixtures and executes tests.
- Document proposed commands as proposed until scripts exist. Prefer clear commands such as test:a11y:unit and test:a11y:e2e once implemented; do not claim they run today.
- Test the actual panel and rendered controls, not just a provider containing an unrelated button.
- Use browser tests for layout, contrast, focus visibility, fonts, media and hydration. JSDOM cannot prove those behaviors.
- CI/deployment workflow changes are outside this documentation scope.

## 3. Foundation cases

| ID | Scenario | Expected result | Type |
| --- | --- | --- | --- |
| V01 | Empty storage | Defaults; no initial preference write; ready completes | Unit/browser |
| V02 | Valid canonical saved record | Controls and root presentation reflect saved values after initialization | Unit/browser |
| V03 | Malformed JSON, null, array, missing envelope, oversized record | Safe defaults; no crash or initialization overwrite | Unit/browser |
| V04 | Wrong field types, unknown fields, out-of-range values, invalid enum | Strict normalization; missing fields default; finite values clamp/round | Unit |
| V05 | Future schema version | Original record preserved; memory-only changes; Reset is explicit recovery | Unit/browser |
| V06 | Read/write/remove throws | Usable controls/content; accurate persistence notice; no retry storm | Unit/browser |
| V07 | Reload with saved font/scale/contrast | Prepaint visual restoration; no hydration error or default overwrite | Browser |
| V08 | Bootstrap blocked/failed | Provider still initializes; content/media remain safe and visible | Browser |
| V09 | JavaScript disabled | Core readable content/navigation and static posters; no permanently hidden reveals | Browser/manual |
| V10 | Rapid range changes | Immediate visuals; bounded writes; final committed value saved | Unit/browser |
| V11 | Reset with queued writes | Pending writes cancelled; only preference key removed; defaults remain | Unit/browser |
| V12 | Two tabs edit / reset / clear | Current record propagates; no write loop or stale replay | Browser |
| V13 | Genuine legacy record, only if confirmed | Correct mapping; old key retained until new write succeeds | Unit |
| V14 | Strict Mode, remount, public/admin transition | One active provider; clean listeners/styles; prior unrelated root values preserved | Unit/browser |
| V15 | Font completes after reset/new selection | Stale completion ignored | Unit/browser |
| V16 | Storage disabled during visit | In-memory actions continue; no sensitive payload in logs | Browser |

## 4. Panel and navigation cases

| ID | Scenario | Expected result |
| --- | --- | --- |
| V17 | Open using each entry point | One named dialog, focus on title, correct labels and current values |
| V18 | Tab and Shift+Tab through dialog | Logical order, background inert, no escape into obscured page controls |
| V19 | Escape, Close, outside click | Dialog closes and focus returns correctly |
| V20 | Trigger disappears / route changes | Fallback trigger or destination focus used appropriately |
| V21 | Open with another modal/menu present | No competing focus traps or inaccessible close control |
| V22 | Operate each control without pointer | Native keyboard behavior, correct values/limits/disabled state |
| V23 | Screen-reader control feedback | State/value announced once; no slider announcement flood |
| V24 | Reset at largest text | Reset/Close reachable; panel stays open; result announced |
| V25 | CMS optional toolbar hidden | Main settings entry remains; saved settings still apply |
| V26 | Jump to authored section | Dialog closes; focus and scroll reach heading below sticky navigation |
| V27 | Deep link, back/forward and changed route content | Stable IDs, valid destinations, sensible focus/scroll restoration |
| V28 | Podcast transcript toggle | Episode-specific visibility/callback preserved, independent of preferences |

## 5. Visual and combination matrix

Test the default state and each setting alone on every representative template. Use the following combinations on the panel, navigation, a content page and all critical form templates. Do not test only the homepage.

| ID | Combination / condition | Acceptance |
| --- | --- | --- |
| V29 | 200% site text, narrow viewport | No clipped labels/content; controls wrap/grow; settings can be reversed |
| V30 | Browser default font changed; text-only enlargement where supported | Browser preference respected; headings and controls scale |
| V31 | 200% browser zoom; 400% from 1280px width | Usable reflow; no lost information or unnecessary two-axis page scrolling |
| V32 | Browser zoom plus site text scale | Natural combination; no cap, DPR warning or stripped presentation |
| V33 | Line 1.5, paragraph 2em, letter .12em, word .16em external override | No lost content/functionality for applicable scripts |
| V34 | 200% text + maximum panel spacing | Controls/content remain operable; no hidden-overflow workaround |
| V35 | Higher contrast + font + link highlighting | Text, icons, focus and states remain distinguishable |
| V36 | Forced colors on/off while open | System colors respected; native controls/focus/selected states visible |
| V37 | Sensory on/off + explicit reduced-motion off | Effective motion reduced only as derived; saved switch not mutated |
| V38 | OS reduced motion changes live | Immediate effect without storage writes or automatic restart |
| V39 | Reading mode + font + contrast + enlarged text | Same content and links, readable layout, usable exit |
| V40 | Reading mode preference on ineligible form | Clear explanation; form layout remains normal; intent retained |
| V41 | English/Nepali/mixed-script strings | No missing glyphs, detached marks or unreadable fallback line boxes |
| V42 | Print article/receipt view | Essential content retained; settings UI hidden; font fallback usable |

Compare actual text/background pairs and non-text states. The higher-contrast toggle does not excuse a failing default palette. Inspect content over photos and videos manually.

## 6. Motion and media cases

| ID | Scenario | Expected result |
| --- | --- | --- |
| V43 | Cold page load, no preferences | No intro takeover, automatic video playback or carousel timer |
| V44 | Explicit play/rotation then focus/hover | Accessible pause; carousel stops and needs explicit restart |
| V45 | Enable reduced motion during playback/animation | Decorative playback and timers stop; reveals/counters settle to readable final state |
| V46 | Turn reduced motion off | No automatic restart |
| V47 | Hidden tab, offscreen media, visibility restored | Explicit pause is preserved; no unrelated-event restart |
| V48 | Failed play promise/source/embed | Helpful fallback; no repeated retry loop or blocked navigation |
| V49 | Informative video in sensory mode | Deliberate playback and captions/transcript remain available |
| V50 | Hidden carousel slides | No focusable hidden links; manual controls and state work |
| V51 | CSS disabled animation + JS motion libraries | Final visible content; no dependence on animation-end callbacks |
| V52 | Loading/error while motion disabled | Understandable static/status feedback |
| V53 | Navigate away during timers/font/media load | Resources cleaned; no stale changes on destination page |

## 7. Forms, content and manual assistive technology

For each critical journey test entry, valid submission, invalid submission, pending response, success, failure and retry where applicable.

- Labels, field groups and instructions are announced in context.
- Error summary/field association and focus match the specification.
- Entered data survives recoverable errors; repeated activation does not duplicate transactions.
- Payment confirmation and token-based recovery use sandbox fixtures, including expired tokens.
- Form controls tolerate enlargement, spacing and alternative fonts.
- Images, meaningful diagrams, captions and transcripts convey the actual content.
- Document/receipt alternatives are equivalent and reachable.
- CMS text has useful headings, links, language metadata and usable tables.
- Touch/drag actions have keyboard and non-drag alternatives.
- Authentication/paste/autocomplete and timeout handling are checked where applicable.

### Minimum manual matrix

Record exact installed versions at test time; “latest” without a version is not evidence.

| Platform | Browser / assistive technology | Coverage |
| --- | --- | --- |
| Windows | Chrome + NVDA | Settings, navigation, content and critical forms |
| Windows | Edge or Chrome + Windows forced colors | Focus, icons, control states, overlays |
| macOS | Safari + VoiceOver | Dialog, navigation, reading, media and forms |
| iOS | Safari + VoiceOver | Small viewport, touch exploration, software keyboard, orientation |
| Android | Chrome + TalkBack | Focus order, controls, forms, enlarged display/text |
| Desktop | Firefox keyboard/text enlargement | Keyboard, text scaling, reflow and form behavior |
| Low-end mobile | Agreed device/browser | Response, scrolling, font fallback and media failures |

Also check speech-control names against visible labels. Validate OS font scaling behavior empirically; do not promise iOS Dynamic Type support simply because CSS uses rem.

## 8. Privacy and performance evidence

- Inspect network requests after changing every control and resetting. No preference/OS values should be transmitted.
- Check existing analytics/error automatic capture for control-value collection; redact test artifacts.
- Verify zero optional-font requests before selecting that font, including a fresh cache.
- Record compressed JS/CSS and individual font sizes.
- Compare the same routes/build mode/device/network with repeated samples for LCP/CLS and toggle response.
- Include cold/warm font loads and saved-settings reloads. Font-display swap is not proof of zero layout shift.
- Do not add new analytics/monitoring infrastructure to satisfy these implementation checks.

## 9. Completion record

An implementation gate passes only with evidence, not a Lighthouse threshold.

- All scoped criteria have pass/fail/justified-N/A results.
- Applicable failures are resolved for the declared accessibility target.
- Automated findings are manually triaged; serious/critical findings are not silently suppressed.
- Critical journeys pass representative manual assistive-technology tests.
- User testing identifies and resolves blockers across varied access needs.
- Performance and failure-path evidence match the specification.
- Remaining limitations have an owner and accurate user-facing wording.

Record any operational release work separately. This validation plan does not execute deployment or certify production readiness.
