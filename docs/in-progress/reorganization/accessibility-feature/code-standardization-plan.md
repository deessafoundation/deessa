# Accessibility feature: code standardization plan

Status: EXECUTED 2026-09-26 — Phase 1 tooling (§10.9), Phase 2 reorganization (§10.8), Phase 3 conventions (`AGENTS.md`), Phase 4 verification (§8) all green. Remaining: commit (user), plus the later repo-wide format commit (D1).
Date: 2026-09-26
Companion standard: ../../accessibility-feature/STANDARDS.md

## 1. Purpose

The reading-guide/cursor-aids work shipped functionally (verified live on 2026-09-26: 19/19 accessibility tests, targeted ESLint, browser checks for guide geometry, click-through, keyboard focus and persistence), but its code is spread across three locations and four styling mechanisms, and the repository has no formatter. This plan consolidates the feature and defines a convention so the structure does not drift again. It is deliberately ordered tooling-first, so formatting churn lands before file moves.

## 2. Diagnosis

| Gap                                    | Evidence                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No formatter                           | Only `eslint.config.mjs` exists (7 lines, Next presets only). No Prettier, no `.editorconfig`, no stylelint. `package.json` has a single `"lint": "eslint ."` script. Quote style already drifts: `accessibility-reading-aids.tsx` uses single quotes, `home-accessibility-button.tsx` uses double.                                                 |
| No style rules in ESLint               | `no-duplicate-imports` is absent; the duplicate lucide-react import at `home-accessibility-button.tsx:4` and `:7` passes lint.                                                                                                                                                                                                                      |
| Feature split across three locations   | Flat `components/` holds `accessibility-reading-aids.tsx` + `.module.css`, `reading-guide-sticker.tsx`, `accessibility-toolbar.tsx`, `home-accessibility-button.tsx`, `public-accessibility.css`. Feature folder `components/accessibility/` holds `dictionary.tsx` + `.module.css`, `typography-controls.tsx`, `use-dictionary-triggers.ts`.       |
| Four styling mechanisms in one feature | CSS Module (reading-aids), global CSS (`public-accessibility.css`, imported at `app/(public)/layout.tsx:2`), Tailwind utilities (panel), inline `style={{}}` (`reading-guide-sticker.tsx:11,14`, `home-accessibility-button.tsx:128,158,215`). Tailwind is the default elsewhere: 322 of 387 components use it, 16 import a module CSS, 6 use both. |
| Duplicate control surfaces             | `accessibility-toolbar.tsx` (alternate toolbar, no reading-guide control) vs `home-accessibility-button.tsx` (full panel).                                                                                                                                                                                                                          |
| Misleading names                       | `home-accessibility-button.tsx` mounts on every public route (`app/(public)/layout.tsx:47`), not the homepage. `homepage-accessibility.module.css` is imported only by `hero-carousel.tsx:5` and `homepage-sections.tsx:6`, never by the button it is named after.                                                                                  |
| Readability                            | `accessibility-reading-aids.tsx:96` crams the whole mask/guide ternary onto one line.                                                                                                                                                                                                                                                               |

Global CSS elsewhere follows the `app/` pattern (`app/globals.css` at 3269 lines, `app/print-styles.css`); `components/public-accessibility.css` is the outlier. Complex/animated pieces elsewhere use a module CSS co-located with their component (`navbar.module.css`, `podcasts/archive-thumbnail.module.css`, `programs/templates/editorial-photo.module.css`).

## 3. Folder structure: current and target

### Current (2026-09-26)

The feature is split across three locations, with a global stylesheet sitting inside `components/` and two misnamed files:

```
components/
├─ accessibility/                        # feature folder — but only half the feature lives here
│  ├─ dictionary.tsx
│  ├─ dictionary.module.css
│  ├─ typography-controls.tsx
│  └─ use-dictionary-triggers.ts
├─ accessibility-reading-aids.tsx        # flat — reading guide + mask layer
├─ accessibility-reading-aids.module.css # flat — co-located with its component ✓
├─ reading-guide-sticker.tsx             # flat
├─ home-accessibility-button.tsx         # flat — misnamed; mounts on all public routes
├─ homepage-accessibility.module.css     # misnamed; imported only by hero-carousel + homepage-sections
├─ accessibility-toolbar.tsx             # flat — duplicate control surface (no guide control)
└─ public-accessibility.css              # GLOBAL css wrongly inside components/
app/
├─ globals.css                           # 3269 lines — house location for global CSS
└─ print-styles.css
contexts/accessibility-provider.tsx      ✓ correct
lib/types/accessibility.ts               ✓ correct
lib/hooks/use-accessibility.ts           ✓ correct
lib/utils/accessibility.ts               ✓ correct
app/(public)/layout.tsx                  ✓ mount point (lines 2, 10, 13, 47–48)
jest.accessibility.config.cjs            ✓ correct
__tests__/accessibility/                 ✓ correct
public/accessibility/reading-friends/    ✓ correct (sticker PNG target)
```

### Target (after Phases 1–3)

One feature folder, global CSS moved to `app/`, names match behavior, duplicate surface removed:

```
components/
├─ accessibility/                        # the whole feature in one place
│  ├─ reading-aids.tsx                   ← moved from components/accessibility-reading-aids.tsx
│  ├─ reading-aids.module.css            ← moved (stays co-located with its component)
│  ├─ reading-guide-sticker.tsx          ← moved from components/reading-guide-sticker.tsx
│  ├─ panel.tsx                          ← renamed+moved from home-accessibility-button.tsx
│  ├─ dictionary.tsx                     ✓ stays
│  ├─ dictionary.module.css              ✓ stays
│  ├─ typography-controls.tsx            ✓ stays
│  ├─ use-dictionary-triggers.ts         ✓ stays
│  └─ accessibility-toolbar.tsx          [deleted under D2; if kept, moves here with a guide control]
├─ homepage-sections.module.css          ← renamed from homepage-accessibility.module.css (stays in
│                                             components/ root — its real consumers hero-carousel.tsx
│                                             and homepage-sections.tsx live here)
├─ navbar.module.css                     ✓ stays (house pattern: module CSS beside its component)
└─ page-hero-contrast.module.css         ✓ stays
app/
├─ public-accessibility.css              ← moved from components/public-accessibility.css (D3)
├─ globals.css                           ✓ stays — the only big global stylesheet
└─ print-styles.css                      ✓ stays
contexts/, lib/, app/(public)/layout.tsx, jest.accessibility.config.cjs,
__tests__/accessibility/, public/accessibility/reading-friends/
                                        ✓ unchanged (imports updated only where files moved)
```

Result: `components/` root keeps only genuinely shared or homepage-owned files; every accessibility concern resolves under `components/accessibility/`, every global stylesheet under `app/`, and no file name contradicts where it is used.

## 4. Phase 0 — decisions required before any work

| #   | Decision                                                                                                            | Recommendation                                       |
| --- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| D1  | Formatter scope: (a) changed files only via lint-staged, (b) one atomic repo-wide format commit, (c) both sequenced | (a) now, (b) as a separate later commit              |
| D2  | `accessibility-toolbar.tsx`: delete, or keep and add the missing guide control                                      | Delete — it is an alternate surface nothing links to |
| D3  | Global a11y CSS destination: new `app/public-accessibility.css`, or merge into the 3269-line `globals.css`          | Move to `app/` as its own file                       |
| D4  | Scope: accessibility feature only, or repo-wide inline-style cleanup too                                            | Accessibility feature now; repo-wide later           |

## 5. Phase 1 — tooling (prevents regression; first)

Executed 2026-09-26 (outcomes and verification in §10.9):

1. Prettier added; `.prettierrc` = `{ "printWidth": 120, "semi": false, "singleQuote": false, "trailingComma": "all", "endOfLine": "lf" }` — chosen by measurement: double-quoted imports dominate 575 files vs 237, semicolonless 856 vs 9, width 120 had the fewest mismatches (769 files vs 801/844/859 at other candidate configs); repo is LF throughout (`core.autocrlf=false`). `.editorconfig` and `.prettierignore` (node_modules, build output, `pnpm-lock.yaml`, `public/`) added alongside.
2. `format` (`prettier --write .`), `format:check` and `typecheck` scripts added; lint-staged runs `prettier --write` only (deliberately no ESLint — hooks must never block a commit) driven by `.husky/pre-commit` via husky's `prepare` script.
3. `typecheck` is report-only: 283 pre-existing repo errors, 0 in touched files (§10.9); it gates nothing.
4. Added as **warnings** (promoting to errors would worsen the 548-error repo lint baseline): `no-duplicate-imports`, `prefer-const`.
5. Deferred: `prettier-plugin-tailwindcss` — installing it reorders Tailwind classes repo-wide; bundle it with the separate repo-wide format commit instead.

## 6. Phase 2 — restructure the feature

1. `git mv` into `components/accessibility/`: `accessibility-reading-aids.tsx`, `accessibility-reading-aids.module.css`, `reading-guide-sticker.tsx`, and `accessibility-toolbar.tsx` if D2 keeps it.
2. `git mv components/public-accessibility.css app/public-accessibility.css`; update the import at `app/(public)/layout.tsx:2`.
3. Rename `home-accessibility-button.tsx` to `accessibility-panel.tsx`; update `app/(public)/layout.tsx:10` and the `ReadingGuideSticker` import.
4. Rename `homepage-accessibility.module.css` to match its real consumers (for example `homepage-sections.module.css`); update `hero-carousel.tsx:5` and `homepage-sections.tsx:6`.
5. Apply D2: delete the alternate toolbar, or add the reading-guide cycle to it.
6. Split the one-line ternary at `accessibility-reading-aids.tsx:96` into an early return or an extracted JSX variable.
7. Merge the duplicate lucide-react import at `home-accessibility-button.tsx:4` and `:7`.
8. Replace the static inline styles in `reading-guide-sticker.tsx:11,14` with classes; keep only dynamic values such as the text-scale progress width at `home-accessibility-button.tsx:215`.

Use `git mv` throughout so history follows the files, and commit phase by phase.

## 7. Phase 3 — write the convention down

Executed 2026-09-26: root `AGENTS.md` created (none existed) with the six conventions below — command references updated to pnpm — plus a short Tooling section (format/lint/typecheck gates, the accessibility test command, hook behavior).

Add a short "Frontend conventions" section to `AGENTS.md` (or the feature STANDARDS.md):

- Default styling is Tailwind plus the `cn()` helper from `lib/utils.ts`.
- CSS Modules are for keyframe animations, layers driven by CSS custom properties, and `forced-colors`/`print` media queries.
- Global CSS lives only under `app/`; it holds theme tokens and contrast/print/forced-colors overrides.
- Inline `style={{}}` is for dynamic values only (CSS variables, computed widths) — never static layout.
- Components live in `components/<feature>/`; the `home-` prefix is reserved for homepage-only components.
- Every feature ships with a formatter-clean diff and passes `npm run lint`.

## 8. Phase 4 — verification

1. `npm run lint`, `npm run format:check`, and the accessibility suite (`node node_modules/jest/bin/jest.js --config jest.accessibility.config.cjs --runInBand`, currently 19 tests across 5 suites).
2. Browser smoke test of the guide, mask, contrast cycles and reload persistence using the existing headless QA script against `http://localhost:3000/podcasts/episodes/`.

Executed 2026-09-26 (all green):

- **Lint**: repo-wide `pnpm run lint` → 536 errors (548 baseline; the drop comes from the deleted files), 551 warnings of which exactly 34 come from the two new rules (23 `no-duplicate-imports`, 11 `prefer-const`). No new errors anywhere.
- **`format:check`**: 15/15 changed files clean; 1118 files remain unformatted for the later repo-wide commit (D1).
- **Tests**: accessibility suite 19/19 across 5 suites.
- **Browser smoke** (headless Chromium, localhost:3000/podcasts/episodes/): reading guide renders in its portal layer (butterfly marker + guide line), reading mask renders as the above/below band pair, negative mode sets `filter: invert(1)` on `<html>`, Escape closes the panel, and after reload both guide and negative persist — segment `aria-checked` states and the DOM effects (root filter, aid portal, guide line) all restored. Console shows only the pre-existing `site.webmanifest` 404s and Vercel CSP noise; no new errors, no sticker 404s (the emoji marker fallback renders).

3. Confirm the moved imports resolve and the reading layer still portals to `document.body`.

## 9. Effort and sequencing

| Phase                       | Effort | Depends on               |
| --------------------------- | ------ | ------------------------ |
| 0 Decisions                 | —      | done: D1–D4 recorded     |
| 0b Land uncommitted feature | ~15m   | narrow staging (§10.4.2) |
| 1 Tooling                   | ~1h    | D1 = (a) decided         |
| 2 Restructure               | ~1h    | D2, D3                   |
| 3 Convention                | ~30m   | Phase 2 names            |
| 4 Verify                    | ~30m   | Phases 1–3               |

## 10. Pre-execution impact analysis (2026-09-26)

Full dependency trace completed before any code change. Findings below are the execution checklist.

### 10.1 Exact code touch points (complete list)

Every import that references a moved/renamed file — there are no others (verified by repo-wide search including dynamic `import()` and default-import names):

| #   | File : line                                        | Current                                   | Becomes                                                                             |
| --- | -------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------- |
| 1   | `app/(public)/layout.tsx:2`                        | `@/components/public-accessibility.css`   | `@/app/public-accessibility.css` — **keep the statement at line 2, cascade safety** |
| 2   | `app/(public)/layout.tsx:10`                       | `@/components/home-accessibility-button`  | `@/components/accessibility/panel`                                                  |
| 3   | `app/(public)/layout.tsx:13`                       | `@/components/accessibility-reading-aids` | `@/components/accessibility/reading-aids`                                           |
| 4   | `app/(public)/demo/accessibility-test/page.tsx:14` | `@/components/home-accessibility-button`  | `@/components/accessibility/panel`                                                  |
| 5   | `components/hero-carousel.tsx:5`                   | `./homepage-accessibility.module.css`     | `./homepage-sections.module.css`                                                    |
| 6   | `components/homepage-sections.tsx:6`               | `./homepage-accessibility.module.css`     | `./homepage-sections.module.css`                                                    |
| 7   | inside moved `reading-aids.tsx:7`                  | `./accessibility-reading-aids.module.css` | `./reading-aids.module.css`                                                         |

Relative imports `./reading-guide-sticker` (reading-aids.tsx:6, panel.tsx:9) need **no change** — sticker and both importers move into the same folder together.

### 10.2 Deletions confirmed safe

- `components/accessibility-toolbar.tsx` (D2): **zero importers repo-wide** — no static import, no dynamic import, no identifier usage. The `showAccessibilityToolbar` CMS flag in `FlagsManager.tsx` and `app/test-cms/page.tsx:189` is a separate flag that renders nothing. Caveat: the file carries ~29 lines of uncommitted contrast-cycle migration; deletion discards it (acceptable — the component is unreachable).
- New finding, needs a D5 decision: `components/accessibility/typography-controls.tsx` also has **zero importers** — same dead-code case.

### 10.3 What was verified NOT to break

- **Class contracts**: `.accessibility-panel` / `.accessibility-button` are defined in `app/globals.css:3078–3480`, not in the moved files; renaming files does not touch them.
- **Data-attribute contracts**: the 15 `data-a11y-*` attributes referenced by `public-accessibility.css` are attributes on elements, unaffected by file paths.
- **Tests**: all `__tests__/accessibility/*` import only `lib/types/accessibility` and `lib/dictionary/*`; `jest.accessibility.config.cjs` `testMatch` only covers that folder. Component moves cannot affect the 19 tests.
- **Folder self-containment**: `components/accessibility/` has zero `../` imports; nothing inside it reaches out.
- No dynamic imports, no barrel files, no CSS `@import` chains.

### 10.4 Risks and mitigations

1. **CSS cascade order (highest risk)**: `public-accessibility.css` fights `globals.css` with `!important` + `body.high-contrast` scoping (206 lines). The import stays at `layout.tsx:2`, so order should hold, but dev serves CSS as separate chunks — **verify in the browser after the move**: compare `document.styleSheets` order and computed styles in high-contrast, negative and normal modes against the pre-move screenshot baseline.
2. **The feature is uncommitted**: `accessibility-reading-aids.tsx` + `.module.css`, `reading-guide-sticker.tsx`, `public-accessibility.css` are untracked; `home-accessibility-button.tsx` (700-line diff), `accessibility-provider.tsx`, `lib/types/accessibility.ts`, `app/(public)/layout.tsx` are modified. `git mv` needs tracked files → **Step 0 must land the feature first**, narrowly staged (the tree also carries 90+ unrelated modified files — never `git add -A`).
3. **`hero-carousel.tsx` carries 1 pending a11y line** (`inert={i !== current}` at :125) — rides along with the import edit; it belongs to the same feature.
4. **Lint gate is already red repo-wide**: `eslint .` fails today with 548 pre-existing errors → the gate stays "targeted ESLint on touched files" (as STANDARDS.md already does). New rules are safe to add but their repo-wide counts must be known: `no-duplicate-imports` = 23 violations, `prefer-const` = 11 (27 files). Fix violations only in files this plan touches.
5. **Live docs referencing old paths** (update in Phase 3): `docs/runbooks/accessibility-rollback.md:201`, `accessibility-feature/STANDARDS.md:653,666,675`, `tasks.md:144,410`, `specs/feature-register.md:80–81`, `specs/dictionary-wiktionary-plan.md:103,105`, `operations/technical-implementation-guide.md:51,190,551`. Archive/changelog/phases documents are historical records and stay untouched.

### 10.5 Revised execution order

0. **Land the uncommitted accessibility feature** with narrow staging (own commit).
1. Phase 1 tooling (D1 = changed-files-only).
2. Phase 2 moves/deletes using exactly the 7 touch points in §10.1.
3. Phase 3 convention text + live-doc path updates.
4. Phase 4 verify: targeted ESLint on touched files, accessibility Jest suite, browser QA (guide/mask/contrast + stylesheet-order check from §10.4.1).

Decided: D5 = yes — delete `typography-controls.tsx` (executed, §10.7).

### 10.6 Changes observed 2026-09-26 evening (user edits, 8:20–8:37 PM)

The user reworked the cursor controls after §10.1–10.5 was written. Re-verified against the current files:

**What changed:**

- `CursorMode` lost `'large'` → now `'off' | 'mask' | 'guide'` (`lib/types/accessibility.ts:31–32`); the cycle is Off → Reading mask → Reading guide → Off.
- Large Cursor became an independent boolean toggle `bigCursor` (panel `Toggle` at `home-accessibility-button.tsx:356`).
- New preference `widgetPosition` (`bottom-right | bottom-left | middle-right | middle-left`, default `bottom-right`) with a local `SegmentedControl` UI (`home-accessibility-button.tsx:28,393–395`); the cycle cards were replaced by segmented controls, which also retires the old "n of 3" label bug.
- `public-accessibility.css` grew 14 lines: high-contrast `.accessibility-panel` rules (:195–203) and negative-mode `backdrop-filter` kills (:212–215).
- Panel shrank to 387 lines (net deletion of the old cycle-card markup).

**Wiring audit — both new fields are consistently plumbed:** defaults (types :164/:173, :468/:477), validation (:398/:408), sanitize (:432/:442), `preferencesEqual` (:502/:512), `body.dataset.a11yBigCursor` apply/cleanup (provider :228/:255), announcements (provider :311/:320/:366/:375). `accessibility-reading-aids.tsx` already gates on `['mask','guide']` (:21, :93) and its imports are unchanged — **the §10.1 touch-point list remains exact.**

**Breakages introduced (must be fixed in Step 0):**

1. **3 of 19 accessibility tests now FAIL**: `preferences.test.ts:9` (two V2-migration expectations do not include the new `bigCursor`/`widgetPosition` defaults that decode now adds) and `preferences.test.ts:33` (cycle assertion still hardcodes `'large'`).
2. **Targeted ESLint now fails**: two `@typescript-eslint/no-explicit-any` errors — `home-accessibility-button.tsx:28` (`SegmentedControl` `onChange: (val: any)`) and `:51` (`Toggle` `icon: any`). These passed lint before tonight's edits.

**New plan-relevant findings:**

- The panel hand-rolls `SegmentedControl` and `Toggle` while `components/ui/toggle-group.tsx` and `components/ui/switch.tsx` exist → extraction/reuse candidate for Phase 3 conventions.
- `isValidPreferences` now _requires_ `bigCursor` and `widgetPosition`; a V4 payload saved earlier tonight without them fails strict validation and resets to defaults. Not shipped, so no real users are affected — confirm during Phase 4.
- Live docs describing the old 4-state cycle (STANDARDS.md §24 "Off → Large Cursor → …") are now stale — added to the Phase 3 doc list.

**Updated Step 0 scope:** land the feature **and** fix the 3 failing tests + 2 lint errors first, so the reorg starts from a green baseline.

### 10.7 Baseline fixes applied (2026-09-26)

Executed ahead of the reorg so it starts from green:

1. `__tests__/accessibility/preferences.test.ts:9` — V2-migration expectations now include the new `bigCursor: defaults.bigCursor` and `widgetPosition: defaults.widgetPosition` defaults.
2. `__tests__/accessibility/preferences.test.ts:33` — cursor cycle assertion updated to the 3-state cycle `off → mask → guide → off`.
3. `components/home-accessibility-button.tsx:28` — `SegmentedControl` made generic (`<T extends string>`), removing `(val: any)`; all five call sites pass typed option arrays so inference holds.
4. `components/home-accessibility-button.tsx:51` — `Toggle` `icon` typed as `ComponentType<{ size?: number; strokeWidth?: number }>` (all usages are lucide icons), removing `icon: any`; `ComponentType` imported as a type from react.
5. **D5 executed:** `components/accessibility/typography-controls.tsx` deleted via `git rm` (zero references, tracked file).

Verification: accessibility suite **19/19 pass**; targeted ESLint on all touched files **passes**; `tsc --noEmit` reports **no errors in any touched file** (repo-wide exit 2 is pre-existing).

### 10.8 Phase 2 execution record (2026-09-26)

Step 0 turned out to be unnecessary: the user had already committed the feature (`fd2f19d`, `6d58882`, and follow-ups), which also captured the §10.7 baseline fixes. The pending changeset is therefore a **pure reorg** — nothing else.

Executed (moves only, no code modifications, nothing staged/committed):

| Action      | From                                                        | To                                                   |
| ----------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| move        | `components/accessibility-reading-aids.tsx`                 | `components/accessibility/reading-aids.tsx`          |
| move        | `components/accessibility-reading-aids.module.css`          | `components/accessibility/reading-aids.module.css`   |
| move        | `components/reading-guide-sticker.tsx`                      | `components/accessibility/reading-guide-sticker.tsx` |
| move        | `components/home-accessibility-button.tsx`                  | `components/accessibility/panel.tsx`                 |
| move        | `components/public-accessibility.css`                       | `app/public-accessibility.css` (D3)                  |
| move+rename | `components/homepage-accessibility.module.css`              | `components/homepage-sections.module.css`            |
| delete      | `components/accessibility-toolbar.tsx` (D2, zero importers) | —                                                    |

Import updates — exactly the 7 planned touch points (§10.1), verified as the only worktree-vs-HEAD diff on importers (4 files, 6 lines):

1. `app/(public)/layout.tsx:2` → `@/app/public-accessibility.css`
2. `app/(public)/layout.tsx:10` → `@/components/accessibility/panel`
3. `app/(public)/layout.tsx:13` → `@/components/accessibility/reading-aids`
4. `app/(public)/demo/accessibility-test/page.tsx:14` → `@/components/accessibility/panel`
5. `components/hero-carousel.tsx:5` → `./homepage-sections.module.css`
6. `components/homepage-sections.tsx:6` → `./homepage-sections.module.css`
7. `reading-aids.tsx:7` → `./reading-aids.module.css` (relative imports to the sticker needed no change — all three moved together)

Verification (all green):

- **Stale references**: repo-wide search for every old path in code — zero hits.
- **Files**: all 6 targets present, all 6 old paths gone.
- **Tests**: accessibility suite 19/19 pass (post-move).
- **Lint**: moved files + layout pass; the only errors in touched files (demo page, hero-carousel, homepage-sections) were reproduced on their HEAD versions — pre-existing, untouched by the move.
- **TypeScript**: `tsc --noEmit` reports no errors on any moved/renamed path; the 3 `Cannot find module` errors are pre-existing in unrelated files.
- **Browser (headless Chromium, localhost:3000/podcasts/episodes)**: reading guide renders (640px = 50% viewport, `rgb(63,171,222)`, in-viewport, new segmented radio works); **negative mode** applies `filter: invert(1)` on the root (rule lives only in the moved CSS); **high contrast** applies `body.high-contrast`, `--a11y-ink: #000` / `--a11y-paper: #fff` (defined only in the moved file — globals.css only consumes them, 127 usages, 0 definitions), and buttons compute to black-on-white; panel opens and persists; zero page errors (only the pre-existing Vercel CSP noise).

Git state after execution: `D` ×7 old paths, `??` ×6 new paths, `M` ×4 importers (6 changed lines total). Index untouched — git will pair the D/?? pairs into renames at commit time (contents are byte-identical to HEAD except `reading-aids.tsx`'s single import line).

Follow-up (2026-09-26): §6.3's symbol rename completed separately from the pure-move diff — export `HomeAccessibilityButton` → `AccessibilityPanel` in `panel.tsx`, importers updated (`app/(public)/layout.tsx:10,40`, demo page `:14,19`). Zero stale references; prettier clean; targeted lint shows only the demo page's 20 pre-existing errors (0 in panel/layout); 19/19 tests; 0 TS errors in touched files (283 total, unchanged); browser check confirms the panel opens. The other four exports were reviewed and kept: `AccessibilityReadingAids`, `AccessibilityDictionary`, `ReadingGuideSticker`, `useDictionaryTriggers`.

Note: QA detour — the panel has two triggers (a footer button and the floating `.accessibility-button` ball); early HC script failures were caused by clicking the wrong one, not by the reorg. The floating ball is the reliable target for future scripts.

### 10.9 Phase 1 tooling execution (2026-09-26)

Added: `.prettierrc`, `.prettierignore`, `.editorconfig`, `.husky/pre-commit` (`pnpm exec lint-staged`). `package.json`: scripts `format` / `format:check` / `typecheck` / `prepare`, plus the `lint-staged` key; devDeps via pnpm — prettier 3.9.9, lint-staged 17.6.0, husky 9.1.7 (`core.hooksPath` now `.husky/_`). `eslint.config.mjs`: trailing config object with `no-duplicate-imports: warn`, `prefer-const: warn`.

Changed-files format (D1): 15 files written, all `format:check`-clean afterwards (4 importers, the 6 new feature files, `eslint.config.mjs`, `package.json` — already conformant — and both plan docs). Repo-wide `format:check`: 1118 files still unformatted (docs/, data/, untouched components) — formatted only in the later repo-wide commit per D1.

Verification (all green):

- **Tests**: accessibility suite 19/19.
- **Lint**: targeted run over the 8 touched TS/mjs files → 23 errors / 7 warnings, every one pre-existing. Demo page measured directly at HEAD: 20 errors before vs 20 after. Formatting can only touch whitespace/quotes/wrapping, so the observed content rules (`react/no-unescaped-entities`, `react/jsx-no-comment-textnodes`, `@typescript-eslint/no-explicit-any`, `react-hooks/set-state-in-effect`) cannot originate from it; the new ESLint rules appear only as warnings (`homepage-sections.tsx:48` duplicate import — pre-existing code).
- **TypeScript**: 283 errors repo-wide (down from the 331 baseline — Phase 2 removed files), **0 in changed files**, the same 3 pre-existing `TS2307`s in unrelated files.
- **Hooks**: `lint-staged` runs and exits 0 (no staged files); husky returns success when `.git` is absent, so `prepare` is CI-safe.

Note superseding §10.8: after formatting, moved-file contents are no longer byte-identical to HEAD (quotes/wrapping normalized). Rename pairing at commit time relies on content similarity instead; similarity stays high for every moved pair (`accessibility-toolbar.tsx` remains the only pure deletion).

## 11. Out of scope

- Splitting `app/globals.css` (3269 lines) into modules.
- Repo-wide inline-style cleanup (`about-hero.tsx` has 20 inline styles, `circular-testimonials.tsx` 10).
- Fixing pre-existing repository TypeScript errors.
- The sticker PNG artwork itself (see `public/accessibility/reading-friends/README.md`).
