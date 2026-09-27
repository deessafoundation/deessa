# E8: Wiktionary dictionary execution checklist

**Date:** 2026-09-25  
**Status:** Planned only; no implementation tasks completed.  
**Specification:** [Research, architecture and behaviour](../specs/dictionary-wiktionary-plan.md)  
**Parent tracker:** [E8 dictionary and plain-language support](../tasks.md#e8--dictionary-and-plain-language-support)

This checklist refines E8 for English definitions. Translation, authored glossary management and speech remain separate work. It does not mark the parent E8 tasks complete or replace unrelated work.

## D1: Verify provider and produce normalized results

**Dependencies:** None. **Scope:** Small, approximately 3 files.

**Likely files:** `lib/dictionary/wiktionary.ts`, `__tests__/accessibility/dictionary-provider.test.ts`, research evidence in the specification.

- [ ] Verify the documented JSON shape, a genuine miss, English-section absence and deployment-host connectivity; resolve the real identifying contact URL.
- [ ] Implement fixed-host fetching, total deadline, bounded response parsing, case handling and plain-text extraction with source/license metadata.
- [ ] Add fixtures for entities, nested markup, malicious elements, malformed JSON, ambiguous senses and missing English results.

**Verification:** Focused provider tests pass; a small manual live check confirms the contract without being part of CI. Confirm server HTML parsing adds no browser bundle weight.

## D2: Expose a bounded same-origin lookup route

**Dependencies:** D1. **Scope:** Medium, approximately 3–4 files.

**Likely files:** `app/api/dictionary/route.ts`, route tests, provider module, existing limiter integration if needed.

- [ ] Implement the specified success/error contract, input validation, successful/miss caching and uncached operational failures.
- [ ] Set User-Agent; enforce abuse controls, concurrency/cooldown behaviour and server kill switch without a new paid service.
- [ ] Verify cache behaviour and shared-egress limits on the actual hosting environment; document any per-instance limitations before release.

**Verification:** Mocked 404/429/503/timeout/invalid-data cases pass; disabled/invalid requests cause no upstream call; repeated successful lookups use the configured cache. No arbitrary upstream URLs or visitor cookies are forwarded.

## Checkpoint: Provider ready

- [ ] Provider and route tests pass, license metadata is retained, and no new paid infrastructure is required.
- [ ] Experimental-endpoint and deployment limitations are recorded accurately.

## D3: Add the stored Dictionary setting

**Dependencies:** D2. **Scope:** Medium, approximately 4 files.

**Likely files:** `lib/types/accessibility.ts`, `contexts/accessibility-provider.tsx`, `components/home-accessibility-button.tsx`, existing preference tests.

- [ ] Add Off / Select words / Hover + select; default off; expose the meaning of each choice accessibly.
- [ ] Migrate V3 to V4 without losing preferences; retain V1/V2 decoding and storage-failure behaviour.
- [ ] Include dictionary in Reset All, individual reset, modified-state comparison and announcement labels.

**Verification:** Migration/reset tests cover saved current and legacy preferences, malformed modes and unavailable storage. Enabling a mode alone causes no lookup request.

## D4: Deliver selection and manual lookup

**Dependencies:** D2, D3. **Scope:** Medium, approximately 5 files.

**Likely files:** new dictionary component and CSS module, `lib/dictionary/selection.ts`, `app/(public)/layout.tsx`, eligibility tests.

- [ ] Connect stable single-word selection and a discoverable keyboard form to the route; exclude the full protected range and inventory sensitive public routes.
- [ ] Deliver a viewport-aware card with sourced senses, status/errors, close behaviour, polite announcements and deliberate keyboard access.
- [ ] Preserve native selection/copy; cancel stale work on reset, disable, route exit and superseding requests; bound browser cache.

**Verification:** Tests cover punctuation, case, mixed scripts, excluded elements/ranges, late responses and disabled behaviour. Manually verify keyboard and mobile selection before adding hover.

## Checkpoint: Useful without hover

- [ ] A keyboard/screen-reader user can enable, query, read and close the result.
- [ ] A touch user can select a word without breaking native menus; offline/failed lookup never blocks reading.

## D5: Add optional hover and coordinate reading aids

**Dependencies:** D4. **Scope:** Medium, approximately 3–5 files.

**Likely files:** dictionary component, selection helpers/tests, dictionary CSS, reading-aids component if necessary.

- [ ] Add 600 ms same-word dwell, fine-pointer gating, feature-detected hit-testing and no DOM word wrapping.
- [ ] Support moving the pointer into the card, Escape suppression and selection precedence; suspend for active modals.
- [ ] Keep the card readable with reading mask/guide and all appearance preferences; selection/manual remain usable without hover support.

**Verification:** Real-browser checks in Chrome/Edge, Firefox and Safari where available. Record unavailable browser coverage explicitly. Confirm rapid movement and dragging do not generate request storms or stale popups.

## D6: Complete validation and release documentation

**Dependencies:** D5. **Scope:** Medium, approximately 3–5 documentation/test files.

- [ ] Run `pnpm test -- --config jest.accessibility.config.cjs --runInBand`, targeted ESLint and `pnpm build`; report pre-existing failures separately without weakening checks.
- [ ] Verify 320/390 px widths, 200% text scale, browser zoom, contrast modes, font/spacing changes, reduced motion, long content, keyboard focus and screen-reader announcements. Check zero dictionary traffic when off and after reset.
- [ ] Update the user guide, E8 tracker, source/maintenance notes and rollback instructions; record staging cache/limiter evidence and license display.

**Verification:** Run mocked outages/429 with Retry-After and a representative live lookup on staging. Confirm error messages distinguish missing words from service failures and the kill switch works. Application logging excludes lookup text; hosting access-log retention is documented.

## Completion checkpoint

- [ ] All specified acceptance checks have recorded evidence.
- [ ] No unreviewed runtime changes outside dictionary scope; existing working-tree edits preserved.
- [ ] Feature remains opt-in and no paid service has been introduced.
