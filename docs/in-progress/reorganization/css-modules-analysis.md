# CSS Architecture Audit & Refactor Plan

**deessa Foundation Project**

**Date**: September 27, 2026 (Revision 2 — supersedes the Sep 26 draft)
**Status**: ⛔ ABANDONED — Step 3 (the CSS split) was executed but broke the design and was reverted on September 30, 2026; the monolith is now `components/programs/demo/programs.module.css`
**Scope authority**: "Audit and Refactor CSS Architecture in Next.js" task brief (organizational refactor, not a redesign)

> **Post-mortem:** the split described in Section 3 kept only plain single-class
> rules and silently dropped ~417 of 519 selectors (element resets, descendant
> rules, all media queries, hover/focus, reduced-motion and high-contrast
> overrides), and the import-rewriting script corrupted identifiers
> (`sectionbase`, `factbase`, `wordbase`). The design broke, so the split was
> abandoned and the monolith restored. The audit findings below remain valid;
> the execution plan does not. See `css-refactor-complete.md`.

---

## Table of Contents

1. [Audit Findings (Verified Against Codebase)](#1-audit-findings-verified-against-codebase)
2. [Review of Revision 1 — What Is Rejected and Why](#2-review-of-revision-1--what-is-rejected-and-why)
3. [Execution Plan](#3-execution-plan)
4. [Verification Plan](#4-verification-plan)
5. [Risks & Rollback](#5-risks--rollback)
6. [Explicitly Out of Scope](#6-explicitly-out-of-scope)

---

## 1. Audit Findings (Verified Against Codebase)

### 1.1 Global stylesheets

| File                           | Size                 | Imported by                     | Verdict                                                                                                                                                           |
| ------------------------------ | -------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/globals.css`              | 99 KB / ~3,280 lines | `app/layout.tsx`                | ✅ Correct location. Contains tokens, typography, a11y modes (high-contrast, sensory-friendly, dyslexia, text-scale), animations, editor styles                   |
| `app/public-accessibility.css` | 8 KB / 221 lines     | `app/(public)/layout.tsx`       | ✅ Correct. Public-scope accessibility contract using `data-a11y-*` global hooks                                                                                  |
| `app/print-styles.css`         | 7 KB / 297 lines     | stories page + admin story-form | ✅ Acceptable (App Router allows global CSS imports anywhere in `app/`)                                                                                           |
| `styles/globals.css`           | 5 KB / 155 lines     | **nowhere**                     | ❌ **Orphaned dead code** — stock shadcn/tokens file; `components.json` points to `app/globals.css`, grep across all ts/tsx/js/mjs/css/json finds zero references |

### 1.2 CSS Modules inventory (all colocated with consumers)

| File                                                       | Lines     | Consumers                                                                                                                       | Notes                                                               |
| ---------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `components/programs/demo/program-demo.module.css`         | **3,150** | 7 files (ProgramDemos, DemoInteractions, ServiceTemplate, ResearchTemplate, OutreachTemplate, EditorialParts, CampaignTemplate) | 🔴 Monolith: base + 4 concepts + index + responsive + high-contrast |
| `components/programs/demo/campaign-concept.module.css`     | 609       | CampaignConcept, CampaignTemplate                                                                                               | ✅ Precedent: campaign was already split out correctly              |
| `components/accessibility/dictionary.module.css`           | 260       | dictionary.tsx                                                                                                                  | ✅                                                                  |
| `app/print-styles.css`                                     | (global)  | see above                                                                                                                       |                                                                     |
| `components/page-hero-contrast.module.css`                 | 53        | 4 pages (whatwedo, stories, our-story, events)                                                                                  | ✅ Genuinely shared page-hero styles                                |
| `components/homepage-sections.module.css`                  | 59        | homepage-sections, hero-carousel                                                                                                | ✅                                                                  |
| `components/accessibility/reading-aids.module.css`         | 65        | reading-aids.tsx                                                                                                                | ✅                                                                  |
| `components/navbar.module.css`                             | 28        | navbar.tsx                                                                                                                      | ✅                                                                  |
| `components/podcasts/archive-thumbnail.module.css`         | 27        | 3 podcast components                                                                                                            | ✅                                                                  |
| `components/programs/templates/editorial-photo.module.css` | 7         | ResearchTemplate                                                                                                                | ✅                                                                  |

**No page-specific `page.module.css` exists** — pages use Tailwind + the shared `page-hero-contrast.module.css`. This is consistent and acceptable.

### 1.3 Uncommitted prior work (must be preserved)

Git shows an in-progress partial refactor (uncommitted): `accessibility-reading-aids.* → components/accessibility/reading-aids.*`, `homepage-accessibility.module.css → homepage-sections.module.css`, `components/public-accessibility.css → app/public-accessibility.css`, `home-accessibility-button.tsx → accessibility/panel.tsx`. **Revision 1 of this doc described the pre-refactor file names** — this explains its inventory errors. All new work builds on top of these changes.

### 1.4 Dead / redundant code (verified unused)

1. **Old campaign concept inside `program-demo.module.css`** — ~400 lines (rules at lines ~687–990 and responsive duplicates at ~2734–2839, ~2949–2981): `.campaignHero`, `.campaignShade`, `.campaignManifesto`, `.campaignBenefits`, `.campaignUpdate`, `.progressBand`, `.progressDetail`, `.updateGrid/.updateStamp/.updateQuote/.updateStats`, `.hugeQuote`, `.involveOption`, `.involvement`, `.campaignParticipation` etc.
   - Verified: no `.tsx` in the repo references these names. `campaign-concept.module.css` (the live campaign styles) does **not** define them — they are leftovers from before the campaign split.
2. **`CampaignContribution` component** in `DemoInteractions.tsx` is exported but never imported anywhere → its styles `.contribution`, `.amounts` are unreachable. _Decision: keep the component and its 2 styles (deleting TSX logic is out of scope); exclude from the dead-CSS deletion._
3. **Duplicate `@keyframes` in `app/globals.css`** — `marquee`, `kenburns`, `heartbeat` each defined twice (camelCase block ~line 591–1007 and kebab/duplicate block ~line 1008–1210). CSS spec: the last definition wins, so deleting the **earlier** copy is a visual no-op.

### 1.5 High-contrast duplication — context Revision 1 missed

`:global(body.high-contrast)` rules exist in 6 modules (68 matches). **They cannot be moved into a plain global stylesheet** — see §2. They coexist correctly with the already-centralized accessibility layer:

- `app/globals.css` lines ~1961–3017: mass high-contrast palette overrides (~1,000 lines)
- `app/public-accessibility.css`: public-scope contracts via `data-a11y-*` / `#main-content` hooks

Accessibility centralization **has already happened**, done the technically correct way (global hooks + module-scoped rules where the module owns the hashed class).

### 1.6 Structural facts for the monolith split

- Class usage was mapped programmatically (113 selectors parsed; every consumer scanned):
  - **Dynamic access exists**: `ProgramDemos.tsx` line 23 `s[category]` and line 93 `s[page.category]` where keys are `'service' | 'campaign' | 'outreach' | 'research'` → the 4 theme-root classes must remain reachable from whatever module that file imports as its base alias.
  - `CampaignTemplate.tsx` already demonstrates the multi-import pattern: `import s from 'campaign-concept' + import base from 'program-demo'`.
- Responsive blocks live at lines 1849 (min-1500), 1863 (max-1050), 1951/2926/3062/3146 (max-760), 2645 (reduced-motion) — each rule must travel with the file that owns its class.
- High-contrast block at 3104+ spans base and concept classes → split accordingly.

---

## 2. Review of Revision 1 — What Is Rejected and Why

| Revision 1 solution                                                                                                               | Decision                             | Reason                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Solution 1: split `program-demo.module.css` into `concepts/` dirs with **new .tsx components, ProgramLayout/ProgramNav, READMEs** | **Modified — CSS-only split**        | Component restructuring violates "do not create unnecessary folders / do not split components into excessive directories / avoid unnecessary changes to component logic". The CSS split itself is valid and follows the existing `campaign-concept.module.css` precedent.                                                                                             |
| Solution 2: move `:global(body.high-contrast)` module rules into `styles/accessibility/high-contrast.css`                         | ❌ **Rejected — technically broken** | CSS Modules hash local class names. A global `.secondaryRow` selector matches nothing in the DOM (the DOM carries `navbar_secondaryRow__hash`). Moving these rules would silently break navbar, homepage hero, page heroes, podcast thumbnails, dictionary, reading aids. Also obsolete: centralization already exists in `globals.css` + `public-accessibility.css`. |
| Solution 3: `styles/utilities/{layout,typography,buttons}.module.css` shared utilities                                            | ❌ **Rejected**                      | Task: "do not create abstractions, shared utilities, or additional files without a clear benefit"; would require rewriting JSX class references across every component (high blast radius, redesign-adjacent).                                                                                                                                                        |
| Solution 4: install Prettier + Stylelint, format all CSS                                                                          | ❌ **Rejected**                      | Task: "do not introduce a new styling framework or dependency"; formatting churn would bury the refactor diff and is not an organizational fix.                                                                                                                                                                                                                       |
| Solution 5: blind regex hex→token migration script                                                                                | ❌ **Rejected**                      | Task is organizational, not a token redesign; blind `String.replace` on colors risks visual regressions. Token compliance noted as a future recommendation only.                                                                                                                                                                                                      |
| Solution 6: documentation headers                                                                                                 | ⚪ Optional                          | Nice-to-have; only if it doesn't expand diff noise. Not required by the task.                                                                                                                                                                                                                                                                                         |
| 10-week timeline, docs/design-system, scripts, training                                                                           | ❌ **Rejected**                      | Out of scope for this task.                                                                                                                                                                                                                                                                                                                                           |
| Inventory figures (9 files, `homepage-accessibility.module.css`, `accessibility-reading-aids.module.css`, "~1,000 lines")         | ⚠️ **Corrected**                     | See §1 — Revision 1 predates the uncommitted refactor.                                                                                                                                                                                                                                                                                                                |

---

## 3. Execution Plan

Ordered steps; each step leaves the build green.

### Step 1 — Remove the orphaned stylesheet

- Delete `styles/globals.css` and the now-empty `styles/` directory (verified unreferenced).
- `components.json` already points at `app/globals.css` — no change needed.

### Step 2 — Delete verified-dead campaign v1 rules from `program-demo.module.css`

- Remove the ~400 lines listed in §1.4-1 (both base and responsive occurrences).
- **Keep**: `.campaign` theme root (used dynamically), `.contribution`/`.amounts` (attached to the unused-but-retained `CampaignContribution` export).
- Verification: automated grep of every removed selector against all `.tsx`/`.css` before deletion.

### Step 3 — Split `program-demo.module.css` (the core refactor)

**New files (colocated, mirroring the `campaign-concept.module.css` precedent — no new directories):**

| New file                                           | Contents (class groups)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/programs/demo/program-base.module.css` | `.root`, `.container`, `.section`, `.demoBar/.previewDot/.dummyLabel`, `.switcher`, `.photo`, `.kicker`, `.button/.textLink`, `.sectionHeading`, `.faqs`, `.metricGrid/.metric/.metricSection`, `.gallerySection/.galleryGrid`, `.nextConcept`, shared story/support/service-cta blocks used by ≥2 consumers (`.storySection/.storyCredit/.miniStats/.supportGrid/.cardNumber/.serviceCta/.serviceFacts/.serviceIcon/.essayGrid/.photoEssay/.postcards/.postcardTop/.participantCount/.resources/.researchStages/.interactiveSection/.interactiveGrid/.checkList`), `.actionWrap/.feedback` (DemoAction), 4 theme roots `.service/.campaign/.outreach/.research` (required by dynamic `s[category]`), `.index/.indexIntro/.indexCards`, `.contribution/.amounts` + their media-query, reduced-motion and high-contrast rules |
| `service-concept.module.css`                       | `.serviceHero .heroCopy .heroNote .servicePortrait .portraitSticker .photoNote .tinyLine .serviceJourney .journeyGrid .steps .faqSection` (+ responsive/HC)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `outreach-concept.module.css`                      | `.outreachInt ro .outreachCover .coverCaption .paperLabel .outreachRibbon .outreachOpening .outreachVoice .outreachCta .outreachAsterisk` (+ responsive/HC)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `research-concept.module.css`                      | `.research* .conceptCard* .visualOrbit .figureLabel .liveDot .board* .sentence .wordGrid` (+ responsive/HC)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| _(index)_                                          | 3 index classes fold into `program-base.module.css` (too small to warrant its own file)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `program-demo.module.css`                          | **Deleted after all consumers migrate**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

**Import updates (7 files):**

| File                   | New imports                                                                                                                                                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ProgramDemos.tsx`     | `base` + `service` + `outreach` + `research`; `s[category]` becomes `base[category]` (theme roots live in base); concept-qualified refs inside each demo function |
| `DemoInteractions.tsx` | `base` (+ `research` for `CommunicationBoard`)                                                                                                                    |
| `ServiceTemplate.tsx`  | `base` + `service`                                                                                                                                                |
| `ResearchTemplate.tsx` | `base` + `research`                                                                                                                                               |
| `OutreachTemplate.tsx` | `base` + `outreach`                                                                                                                                               |
| `EditorialParts.tsx`   | `base` + `research` (`.researchStages`)                                                                                                                           |
| `CampaignTemplate.tsx` | `base` (path rename only) + `campaign-concept`                                                                                                                    |

**Invariants (from the task brief):**

- Class **names** never change; only import paths/aliases are updated. `campaign-concept.module.css` untouched.
- Every rule keeps its exact declarations, source order semantics (base module imported first everywhere → base rules precede concept rules, matching today), and specificity.
- Multi-class selectors and media-query rules are split so each rule lands in the file owning its class; a validation script asserts **every class is defined in exactly one new file and resolves for every consumer**.
- `:global(body.high-contrast)` module rules stay in their owning modules (see §2).

### Step 4 — Deduplicate `@keyframes` in `app/globals.css`

- Delete the **earlier** of each duplicate pair: `marquee`, `kenburns`, `heartbeat` (later definition already wins → zero visual change).

### Step 5 — Verify (see §4) and produce the final report.

---

## 4. Verification Plan

1. `pnpm lint` (ESLint) — must pass.
2. `pnpm build` (Next.js production build) — must pass; catches broken CSS Module imports (`Module not found`, missing exports).
3. Automated CSS integrity check: script confirms every `s.x` / `base.x` / `service.x` reference in the 7 consumers resolves to a class defined in an imported module, and no class is defined twice across the new files.
4. Browser QA (headless browser available via skill) — exercise at desktop + mobile widths:
   - `/demo/programs` (index), `/demo/aac-support`, `/demo/community-outreach`, `/demo/deessa-companion`, `/demo/1000-families` (campaign)
   - A CMS template page using `EditorialParts`/`ServiceTemplate`
   - Navbar, homepage hero, stories/whatwedo/our-story/events heroes, podcast archive
   - Toggle **high-contrast** mode and **reduced-motion**; check focus indicators and reading guide
   - Responsive breakpoints at 1050px / 760px / 767px
5. Final file-structure review: every stylesheet has one clear purpose.

**Honesty rule**: the final report will state exactly which checks were run and their results — visual behavior is only claimed as verified if browser QA actually ran.

---

## 5. Risks & Rollback

| Risk                                                | Mitigation                                                                                                                                            |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Missed class mapping → unstyled element             | Automated reference-resolution check over all 7 consumers before build                                                                                |
| Responsive regressions from splitting media queries | Each media rule travels with its class owner; explicit breakpoint QA                                                                                  |
| CSS source-order shift changes cascade winners      | Base module imported first in every consumer (preserves today's base→concept ordering); `campaign-concept` import order in CampaignTemplate unchanged |
| High-contrast regressions                           | HC rules stay module-scoped; HC toggle tested in browser QA                                                                                           |
| Build breakage                                      | Git is the rollback boundary — work is uncommitted, `git diff`/`git checkout` per step; build run after each step                                     |

---

## 6. Explicitly Out of Scope

- Shared utility modules (`styles/utilities/*`), design-token migration scripts, Prettier/Stylelint tooling.
- Moving `:global(body.high-contrast)` rules out of modules.
- Component renames, new component directories, README scaffolding, redesign of any visual styling.
- Touching the uncommitted prior refactor beyond building on it.

---

## Appendix A — Consumer reference counts (program-demo.module.css)

| Consumer               | Classes referenced                                         |
| ---------------------- | ---------------------------------------------------------- |
| `ProgramDemos.tsx`     | 80 (all concepts + shared helpers; 2 dynamic via `s[...]`) |
| `ServiceTemplate.tsx`  | 37                                                         |
| `EditorialParts.tsx`   | 34                                                         |
| `CampaignTemplate.tsx` | 2 (`base.*`)                                               |
| `ResearchTemplate.tsx` | 21                                                         |
| `OutreachTemplate.tsx` | 14                                                         |
| `DemoInteractions.tsx` | 14                                                         |

## Appendix B — Superseded document

Revision 1 (Sep 26, 2026) is replaced by this document. Its inventory and Solutions 2–5 are obsolete or rejected per §2; its Solution 1 concept survives in modified CSS-only form in §3 Step 3.
