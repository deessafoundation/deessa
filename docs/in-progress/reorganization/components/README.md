<!-- Generated evidence cleanup completed 2026-10-04: temporary helpers, raw captures and screenshots referenced below have been removed. The generator commands below are historical records, not runnable instructions. See artifact-cleanup.md for retained records. -->

# deessa Foundation — component reorganization

Final maintenance guidance: [components/README.md](../../../../components/README.md). The [complete Git/source and production verification review](usage-audit/archive-cleanup/README.md) records the completed moves, archival, duplicate removal, and remaining runtime limitations.

Updated: 2026-10-04. Phases 0–4 are reviewed and execution was authorized. **B01–B71 are implemented with build/baseline comparisons recorded. Validation limits are recorded per batch; the 68-entry REVIEW queue remains.**

The repository and its actual consumers govern this work. Earlier plans are historical evidence, not instructions to delete, archive, flatten, split, or move code. The brand name is **deessa**; the existing checkout directory name is unchanged.

## Read in this order

1. [Tasks and phase gates](tasks.md)
2. [Analysis and complete file inventory](analysis.md)
3. [Per-file evidence](component-details.md): exports, importers, route ancestors, dependencies, hooks, CSS and test links
4. [Dependency map and review questions](dependency-map.md)
5. [Architecture standards](architecture.md) and [naming conventions](naming-convention.md)
6. [Exact migration plan](migration-plan.md) and [mapping/reference ledger](migration-mapping.json)
7. [Validation strategy](testing-strategy.md)
8. [Phase 4 review and execution gate](review.md)
9. [Historical plans](history/README.md)

Phase 2 retains direct `components/<domain>/` folders, consistent with AGENTS.md, and documents existing cross-domain exceptions. The architecture is a target standard, not the current filesystem. `migration-plan.md` now maps all 434 files with 71 planned batches. These mappings passed technical review with the fingerprint recorded in [review.md](review.md); retention, toast compatibility and mixed demo-resource destinations remain explicit REVIEW items.

## Verified preparation baseline

| Item | Observed value |
| --- | --- |
| Checkout | `D:/Web Codes/Projects/Deesha Foundation` |
| Package identity | `deessa`, version `0.1.0`, private |
| Git branch | `farhan-branch` |
| HEAD at start | `4b554621f140c636530d114da3171368a66242cb` |
| Initial Git status | Only `?? docs/in-progress/reorganization/components/`; no tracked modifications |
| Existing new documents | Kiro's `analysis.md` and `tasks.md`; no README or dependency map |
| Framework | Next.js `16.3.4`, React / React DOM `19.2.8` in package.json |
| Installed tooling inspected | Next.js `16.3.4`, TypeScript `6.0.3`, Node `v24.19.0` |
| Package manager | pnpm; `pnpm-lock.yaml` and `pnpm-workspace.yaml` present |
| TypeScript | strict; bundler resolution; React JSX transform; incremental; noEmit |
| Alias | `@/*` → `./*` in `tsconfig.json` |
| TypeScript source scope | All `**/*.ts`, `**/*.tsx`, generated Next types; only node_modules excluded |
| Styling | Tailwind 4; `@tailwindcss/postcss`; CSS-first tokens in `app/globals.css` |
| Tailwind configuration | No root tailwind.config file; components.json has an empty Tailwind config path |
| shadcn | New York, RSC and TSX enabled; aliases for components, ui, hooks, lib, utils |
| Next build caveat | `typescript.ignoreBuildErrors: true`; build success is not type safety |
| Other relevant Next configuration | `@react-pdf/renderer` server external; 6mb server-action body limit; image allowlist; `/programs` redirects to `/whatwedo` |

The sandbox Git account initially failed the ownership check. The baseline was read with approved execution outside the sandbox; no global Git configuration was changed. No commit, branch switch, staging, or application-source edit was performed for this analysis.

## Scope and safeguards

- Account for every file below `components/`, including hooks, registries, types, styles, and assets. Follow consumers into app routes, contexts, hooks, lib, data, tests and scripts.
- Preserve default/named exports, client directives, server actions, rendering behavior and accessibility behavior during future structural moves.
- No automatic deletion or archival. No component splitting, deduplication, generic delete-button abstraction, or form-builder consolidation in this analysis.
- Keep the public/admin distinction separate from domain ownership. A public renderer used in an admin preview still belongs to its domain.
- Read `docs/in-progress/accessibility-feature/STANDARDS.md` in full before any later UI edit. Preserve scoped contrast selectors and CSS-module relationships.
- Local Next.js boundary and lazy-loading guides were consulted for this analysis. Read the relevant installed guide again when a later code change needs a different API.
- Tests, lint, typecheck, formatter and build were not run for this documentation-only phase. The user's migration brief requires validation after every later migration batch; see the validation strategy.

## Evidence maintenance

`collect-evidence.cjs` parses source with the installed TypeScript syntax API; it does not compile, typecheck, import application modules, connect to services, or run tests. It writes only `component-evidence.json` here. Run from the repository root:

```powershell
node docs/in-progress/reorganization/components/collect-evidence.cjs
node docs/in-progress/reorganization/components/render-inventory.cjs
```

The renderer refreshes the inventory section and per-file evidence using explicit responsibility/category annotations in `reviewed-roles.cjs`. It rejects missing or extra annotations. Update those source-reviewed annotations when files or responsibilities change; regeneration alone cannot review new code. Manually review narrative conclusions after any source change. The snapshot is tied to the baseline above and SHA-256 hashes in the evidence; it is not a live dashboard. Static graph reachability is conservative, particularly for barrels and unused imported bindings. It cannot certify rendered behavior or prove a file safe to delete.

`plan-migration.cjs` generates migration-plan.md and migration-mapping.json from the evidence and explicit ownership rules. It never edits application files. Run `node docs/in-progress/reorganization/components/plan-migration.cjs` only when intentionally refreshing the proposed plan; it rejects source/config hash and file-set drift. Re-review batch IDs and narrative totals after any mapping change.

`review-plan.cjs` performs an in-memory static audit of every intermediate batch state. It does not run application tests or edit application files. See review.md for observed results and the reviewed mapping fingerprint.

Current execution results: B01 About hero relocation. The source inventory, mapping JSON and review fingerprint describe the pre-migration snapshot; execution overlays in tasks.md and migration-plan.md record live progress. Reconcile intentional changes before running snapshot regeneration.

2026-10-02 continuation: B02 About manager records the node-html-parser/jsdom clarification, supplementary dictionary checks in Chrome, and current validation limits. No jsdom dependency was restored.

2026-10-02 grouped continuation: B03 setup, B04 artworks, B05 impact statistics. Four components moved, five route imports updated; all three production builds passed and diagnostics matched baseline.

2026-10-02 grouped continuation: B06 notifications, B07 partners, B08 podcasts, B09 profile, B10 projects. Ten components moved and thirteen import references updated across eleven callers. All five builds passed; baseline diagnostic comparisons and twelve unauthenticated route checks matched. Authenticated interactions remain unverified.

2026-10-02: B11–B15 implemented sequentially: settings, stories, support dialogs/actions, support toggle, and team. Fourteen components moved and twenty import specifiers updated (two additional relative references remain unchanged because both ends moved together). All five production builds passed and diagnostics match B10. Authenticated UI interactions remain unverified. B11 admin/settings, B12 admin/stories, B13 admin/support, B14 admin/support, B15 admin/team.

2026-10-02: B16–B20 implemented sequentially: admin users, volunteers, contact forms and error pages. Ten components moved/renamed and twelve import references updated. Five production builds and baseline diagnostic comparisons passed. Public browser comparisons cover 42 states; the generic demo’s pre-existing React #418 error is unchanged. Authenticated admin interactions, contact submission and actual error-boundary failures remain unverified. B16 admin/users, B17 admin/volunteers, B18 contact, B19 errors, B20 errors.

2026-10-03 finalization: the migration audit found six displayed source-path references in `app/demo/errors/page.tsx` outside the executable-import mapping. They were corrected to the new errors directory and filenames. [Supplemental reference ledger](batches/B20/supplemental-reference-updates.json) preserves the reviewed mapping unchanged. Focused lint diagnostics match before/after, the additional production build passed, and the demo hub renders the corrected examples with HTTP 200 and no page errors. Final group audit (temporary capture removed after review) reconciles all 948 baseline files, the exact 434-file component set, all twelve mapped reference resolutions and these six supplemental updates; no stale moved-path aliases remain. Future source-drift comparisons must reverse both the mapping reference edits and this supplemental ledger.

2026-10-03: B21–B30 implemented sequentially. Twenty-two component-tree files moved and thirty-two mapped import references updated. Ten production builds and diagnostic comparisons passed. Public browser comparisons retain documented transition-timing and interaction limitations; the program-editor test file passes all eleven tests before/after B29. Authenticated admin/finance mutations remain unverified. B21 homepage, B22 homepage, B23 newsletter, B24 podcasts, B25 press, B26 support, B27 volunteer, B28 what-we-do, B29 admin/common, B30 admin/finance.

2026-10-03: B31–B40 implemented sequentially: 29 files moved/renamed, 66 mapped import-reference entries changed and one maintenance-comment path corrected. All ten builds and fresh-baseline diagnostic comparisons passed. Program-editor tests remain 11/11 passing; selected finance tests remain 32/36 passing with four unchanged baseline failures. Runtime and authenticated-flow limitations are recorded in the batch evidence. At that checkpoint, B41 had not started.

2026-10-03: B41–B50 implemented sequentially: 33 files moved/renamed and 54 mapped module-reference entries changed. All ten production builds and baseline diagnostic comparisons passed. Public browser comparisons and accessibility-test baseline comparisons are recorded per batch; authenticated conference/event workflows and other runtime limitations remain unverified. At that checkpoint, B51 had not started.

2026-10-04: B51–B60 implemented sequentially: 35 files moved/renamed and 85 mapped module-reference entries changed. All ten production builds and baseline diagnostic comparisons passed. Public browser comparisons and program-editor test comparisons are recorded per batch; authenticated event/program workflows and other runtime limitations remain unverified. At that checkpoint, B61 had not started.

2026-10-04: B61–B71 implemented sequentially: 30 files moved/renamed, 97 mapped module-reference entries changed and one mapped maintenance-comment path corrected. All eleven production builds and baseline diagnostic comparisons passed. The complete program suite passes 45/45 after every program batch; 270 browser states match baseline. All 190 reviewed moves across the 71-batch schedule are implemented. The 176 KEEP and 68 REVIEW files remain accounted for; REVIEW moves, deletion, archival and behavioral cleanup are not authorized by this completion. Authenticated persistence/upload and recorded runtime limitations remain outstanding.

Current post-migration usage: [68-file usage audit](usage-audit/README.md) traces the live tree and separates production, type-only, disconnected and unreferenced files. The original REVIEW mapping remains unchanged.


2026-10-04 — Authorized REVIEW cleanup completed: 55 unreferenced code files moved to `components/archive/`, three byte-identical unused copies removed, and ten referenced files retained unchanged. See [archive README](../../../../components/archive/README.md) and [operation manifest](usage-audit/archive-cleanup/manifest.json). The original mapping and pre-cleanup usage evidence remain historical snapshots; their original-path checks are superseded for this authorized set by the manifest. Structural/hash/import checks passed; formal verification and runtime observation were not performed for this cleanup.
