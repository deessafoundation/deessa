# deessa Foundation — component migration validation

Status: Phase 3 batch profiles and route matrices are defined in [migration-plan.md](migration-plan.md). Execution overlay: B01–B71 are implemented with per-batch validation evidence. The planned batch schedule is complete; consult tasks.md for the remaining REVIEW queue and validation limitations. The [reference ledger](migration-mapping.json) records affected paths and test ancestry.

## Baseline before migration

Capture Git status, branch/HEAD, each command, exit code and diagnostics before moving files. Root AGENTS.md reports pre-existing lint and TypeScript errors. Treat those reports as context, not fresh test results. Compare actual before/after diagnostics and never turn a failed check into a pass by suppressing it.

`next.config.mjs` sets `typescript.ignoreBuildErrors: true`. A successful build cannot replace typecheck. tsconfig includes all TS/TSX files outside node_modules, so an unrendered or archived component can still produce diagnostics. Moving files into a components archive does not remove them from typechecking.

## Commands available in this repository

| Purpose | Command | Scope / limitation |
| --- | --- | --- |
| TypeScript | `pnpm run typecheck` | `tsc --noEmit`; incremental mode may update tsconfig.tsbuildinfo. |
| Repository lint | `pnpm run lint` | `eslint .`; record pre-existing failures. |
| Focused lint | `pnpm exec eslint <changed-source-files>` | List actual moved/edited source files; do not use npm/npx. |
| Build | `pnpm run build` | `next build`; ignores TS errors by current configuration and may need external resources/configuration. |
| General tests | `pnpm run test --runInBand` | Runs the package's Jest test script; direct configuration-specific form is also listed below. |
| General Jest, direct | `node node_modules/jest/bin/jest.js --config jest.config.js --runInBand` | Default node environment; payments/receipts coverage focus. |
| Programs | `node node_modules/jest/bin/jest.js --config jest.programs.config.cjs --runInBand` | Program TSX tests, alias mapper and CSS-module mock. |
| Accessibility | `node node_modules/jest/bin/jest.js --config jest.accessibility.config.cjs --runInBand` | Accessibility helper tests; not a substitute for browser interaction/contrast checks. |
| Format check | `pnpm run format:check` | Optional only when requested; repo-wide formatting is not clean per AGENTS.md. |

Do not run `pnpm run format` during migration: unrelated rewrites obscure structural diffs. No new test framework or dependency installation is required for the analysis.

The default Jest config documents an ESM/jsdom transformation limitation for story-parser tests. Capture its actual status rather than assuming it passes or fails today. Use existing focused configurations where applicable. No claim is made that every component has automated behavioral coverage.

## Every batch gate

1. Confirm the reviewed file mapping and clean separation from unrelated changes.
2. Run typecheck, lint, production build and relevant tests; compare to baseline and record limitations.
3. Search all old path spellings, including relative imports, barrels, mock strings, type references, CSS and script loaders. Review false-positive historical documentation references separately from active code.
4. Check casing on disk and in imports. A Windows resolver succeeding is not evidence of Linux case correctness.
5. Compare the component dependency graph: no missing files, accidental cycles or lost registry members.
6. Inspect the diff for directive, export, CSS, markup or behavior changes outside the planned structural edits.
7. Exercise affected routes and shared consumers. Record screenshots/interaction results when appropriate; source inspection alone does not establish functional or accessibility equivalence.
8. Fix migration-caused failures before continuing. If external prerequisites block verification, record the blocker and keep the batch incomplete.

## Route/behavior groups for the batch matrix

| Group | Required checks when affected |
| --- | --- |
| Public layout/accessibility | Home plus another public route; navbar settings, footer newsletter, intro/video modals, accessibility panel, dictionary, reading aids and TTS. |
| Shared presentation | Every observed domain consumer; include Our Story testimonials, impact PhotoWall and admin preview consumers. |
| Conference/events | Public registration flows, field conditions, repeating fields, file/signature widgets, admin previews, both builders and event settings. |
| Programs | `/whatwedo`, detail/loading paths, all category templates, admin edit/preview, public design/editor demos, program tests and mock paths. |
| Admin media | Library and selection/upload consumers; preserve picker rendering and FileUpload integration. |
| Finance/support | Donations, payments and support details; status, notes and timeline rendering. Validate mutations with appropriate test data/environment. |
| Errors | App error/global-error/not-found entries and existing error demo routes; verify public image resolution. |
| CSS modules | All listed importers, including routes and production templates that consume demo styles. |

Before UI edits, read the complete accessibility standards. After moves, check relevant normal/high/inverted-contrast states, keyboard/focus behavior, reduced motion, responsive layouts and 200% scaling. Use the standards to choose the affected checks; never declare full accessibility conformance from a successful build.

## Evidence record per batch

Record batch ID, source snapshot, exact mapping, commands/exit codes, baseline versus new diagnostics, checked routes/states, untested scenarios, corrections and final disposition. Update tasks.md and migration-plan.md only with observed outcomes. Final acceptance must distinguish completed checks from accepted outstanding pre-existing issues; a passing migration comparison is not the same as a globally clean repository.

## Phase 3 schedule integration

Each numbered batch lists COMMON plus additional validation profiles, exact app-entry ancestors, existing test ancestry and its complete source-snapshot touch set. Run the applicable suites listed above; do not treat an empty test-ancestry list as an exemption from runtime checks. Baseline diagnostic comparison, blocked-environment handling and per-batch recovery remain mandatory. A REVIEW file can receive an import update without being moved; include that change in focused lint and the diff review.

## Phase 4 corrections

Validation profiles now follow proposed ownership and affected route/test ancestry, including dedicated ADMIN_SHELL checks. ServiceEditForm uses PROGRAMS + ADMIN; conference form-preview uses REGISTRATION + ADMIN; payment-settings-form uses FINANCE + ADMIN. The source/config snapshot covers callers and new/deleted file detection. The static batch simulation in review.md is separate from the application validation baseline, which remains unrun.

2026-10-04 B51–B60 review: all ten builds pass; 948 source/config files reconcile and 312 local imports resolve with correct casing. Program tests pass 11/11 after B56–B60. The development-only editor passes category switching, schema validation and in-memory restore for four categories; editorial heading changes restore successfully. Diagnostic comparisons preserve baseline failures and normalize quoted relocated module names within their owning file. Authenticated persistence/upload flows remain unverified; no jsdom dependency was restored.

2026-10-04: B61–B71 implemented sequentially: 30 files moved/renamed, 97 mapped module-reference entries changed and one mapped maintenance-comment path corrected. All eleven production builds and baseline diagnostic comparisons passed. The complete program suite passes 45/45 after every program batch; 270 browser states match baseline. All 190 reviewed moves across the 71-batch schedule are implemented. The 176 KEEP and 68 REVIEW files remain accounted for; REVIEW moves, deletion, archival and behavioral cleanup are not authorized by this completion. Authenticated persistence/upload and recorded runtime limitations remain outstanding.
