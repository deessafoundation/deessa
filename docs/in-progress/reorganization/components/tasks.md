# deessa Foundation — component reorganization tasks

Updated: 2026-10-04.
**Current status: B01–B71 implemented. The REVIEW cleanup archived 55 unreferenced code files, removed three duplicate copies, and retained ten referenced files unchanged. Runtime observation and documented authenticated-flow limitations remain.**

Final review: [Git/source, import, production build and browser evidence](usage-audit/archive-cleanup/README.md). No unexplained source changes were found; production build and 45 program tests passed. The component guide and root AGENTS.md are updated. Runtime observation and authenticated workflows remain follow-up work.

This is the new active checklist, based on the current brief and independently checked repository evidence. It supersedes the old plan without inheriting its completion claims, deletion recommendations, target paths or estimates. Earlier documents remain in [history](history/README.md); the original archived plan is also intact.

## Working rules

- Preserve functionality. Preparation and analysis may change documentation only: no component moves, renames, deletions, import changes or behavior changes.
- Separate observed facts, proposed decisions and unresolved questions. Never mark a phase complete just because its document exists.
- No imports does not mean safe to delete; similar names do not establish duplicates; a folder name does not establish ownership.
- Keep structural moves separate from splitting components, consolidating builders, fixing behavior or converting exports.
- Use pnpm. Analysis does not run formatting, lint, typecheck or tests without an explicit request. The migration brief requires validation after every later migration batch.
- Preserve unrelated work. Inspect Git status; do not reset, discard, stage or commit unrelated changes.
- Use **deessa** in active documentation and preserve historical documents verbatim.

## Phase 0 — preparation

**Acceptance:** Record the actual repository configuration and starting worktree; preserve earlier work without changing application code.

- [x] Confirm package identity (`deessa`) and inspect repository structure.
- [x] Read root AGENTS.md, including the direct feature-folder convention and opt-in verification rule.
- [x] Inspect package.json scripts, tsconfig.json, next.config.mjs, postcss.config.mjs and components.json.
- [x] Confirm `@/*` resolves to the root and Tailwind uses CSS-first configuration.
- [x] Record branch, HEAD and initial Git status in README.md.
- [x] Record that the starting tree contains untracked Kiro documentation rather than claiming a completely clean worktree.
- [x] Preserve the full archived tasks.md and Kiro's documents under history/ before replacing active content.
- [x] Establish the requested documentation workspace and this new active checklist.
- [x] Record that `typescript.ignoreBuildErrors: true` makes a production build insufficient to establish type safety.

**Evidence:** [README](README.md), [history](history/README.md).

## Phase 1 — complete component analysis

**Acceptance:** Every component-tree file has a traceable inventory entry; important systems have source-backed explanations; uncertain usage and ownership are explicitly recorded.

### 1A. Inventory and evidence

- [x] Enumerate all files, including code, hooks, CSS and assets: 434 files at the starting snapshot.
- [x] Parse aliases, relative imports, re-exports, literal dynamic imports and explicit type references across repository source.
- [x] Capture exports, hooks, JSX composition, directives, consumers, app-entry ancestors and test-import ancestry.
- [x] Separate no-incoming-edge files from disconnected and type-only consumer chains.
- [x] Publish the complete human-readable inventory in analysis.md with per-file evidence.
- [x] Review all 434 responsibilities and candidate categories against code and consumers; record generic contracts, preliminary relocation sensitivity, confidence and uncertainty.
- [x] Apply USED, LIKELY UNUSED, UNCERTAIN and DYNAMICALLY REFERENCED consistently, without implying deletion approval.
- [x] Document non-import references, test mocks, assets and computed script loaders alongside the graph.

### 1B. System and boundary review

- [x] Inspect public shell composition and NavbarWrapper's server-data boundary.
- [x] Inspect conference registry, repeating-field cycle, event reuse and admin previews.
- [x] Inspect program template dispatch and production dependencies on demo resources.
- [x] Inspect admin editor entry points, section factory, runtime helpers and public editor demo.
- [x] Verify MediaPicker is actively rendered by the admin media library; withdraw the earlier archival recommendation.
- [x] Identify donation/payment/support reuse and rich-text-editor coupling.
- [x] Compare duplicate hooks and identify the old toast API mismatch without changing it.
- [x] Identify shared CSS consumers and the public astronaut asset reference.
- [x] Publish dependency-map.md with exact relationships, cycle details and migration implications.
- [x] Give every ambiguity below a documented disposition: resolve it with evidence or state the missing evidence/decision explicitly.
- [x] Cross-check totals, inventory coverage, references and completion claims across active documents: 434 inventory rows and profiles, no broken document links, archived plan preserved byte-for-byte, no component text changes.

### Required ambiguity register

| ID | Question | Evidence / consequence |
| --- | --- | --- |
| A01 | Direct feature folders versus a features layer | Reconcile current AGENTS.md and the proposed architecture before finalizing target paths. |
| A02 | Shared conference/event rendering | DynamicStep, StepProgressBar and registry fields serve both public domains and admin previews. |
| A03 | Shared builder controls | Event builder imports conference-directory controls; FormTemplateChooser uses event-module actions. |
| A04 | Production-used demo resources | Program templates use demo CSS and CommunicationBoard. Do not archive demo/ as a unit. |
| A05 | Admin finance/common boundaries | Donation-folder components serve payments; ActivityTimeline also serves support. |
| A06 | Public editor demo | Public demo intentionally imports admin editors; preserve and review this exception. |
| A07 | Generic versus domain presentation | Contracts reviewed: generic cards/layout/form wrappers, cross-domain PhotoWall, podcast-specific ShareButton; final placement remains Phase 2. |
| A08 | No app-entry ancestry | Review 88 files with no incoming edge plus nine disconnected/type-only files; distinguish retained primitives, legacy systems and assets. |
| A09 | Toast compatibility | Hooks and legacy Toaster expect exports absent from the current Sonner toast module. Record a baseline issue, not an automatic migration fix. |
| A10 | Server/client boundaries and barrels | Preserve async server wrappers and type-only references; absence of use client does not prove server compatibility. |

**Exit gate:** Inventory, dependency map and explicit ambiguity dispositions are ready for review. Static analysis does not certify runtime behavior.

## Phase 2 — architecture and naming standards

**Depends on:** Phase 1 evidence and review of A01–A10.
**Acceptance:** Boundaries follow actual dependencies; naming rules cover exceptions and preserve behavior.

- [x] Create architecture.md from evidence, not the earlier illustrative tree.
- [x] Define generic UI, public domain, layout, shared, admin and error ownership rules.
- [x] Reconcile AGENTS.md's location convention with the chosen architecture, including podcasts.
- [x] Define allowed cross-domain and public/admin-preview dependencies; document exceptions.
- [x] Preserve coherent systems; avoid empty folders and a shared dumping ground.
- [x] Address existing barrels and registry cycles without silently adding refactoring to structural work.
- [x] Create naming-convention.md covering files, folders, hooks, exports, CSS pairing and justified exceptions.
- [x] Preserve default/named exports and internal identifiers unless separately approved.
- [x] Address index entry points, acronym casing, Windows-safe renames, collisions and runtime code inside types/actions files.
- [x] Review the standards against every inventory group; retain unresolved targets as REVIEW.

**Evidence:** [Architecture and group coverage](architecture.md), [naming conventions and exceptions](naming-convention.md). Standards are established for mapping; file retention and mixed demo destinations remain REVIEW. Phase 4 review still precedes execution.

## Phase 3 — exact migration plan

**Depends on:** Agreed Phase 2 standards.
**Acceptance:** Every file is accounted for, proposed changes are traceable, and each batch can be reviewed and validated independently.

- [x] Create migration-plan.md with current path, target path, action, reason, consumers/imports, dependencies, risk and validation.
- [x] Include KEEP and REVIEW entries so omissions cannot silently become deletions.
- [x] Justify MOVE, RENAME, MOVE + RENAME, MERGE and ARCHIVE individually; never choose DELETE automatically.
- [x] Map CSS, assets, hooks, barrels, tests, mock strings, script loaders and configuration references with their systems.
- [x] Check target collisions and exact path casing.
- [x] Order small batches from the dependency map; separate unrelated domains and high-risk systems.
- [x] Give each batch entry/exit criteria, affected routes and a recovery plan that preserves unrelated work.
- [x] Create initial testing-strategy.md using actual scripts and known configuration limitations; finalize per-batch checks with the mapping.
- [x] Identify relevant suites and uncovered runtime behavior for each batch.

**Evidence:** [Migration plan](migration-plan.md) and [mapping/reference ledger](migration-mapping.json): 434 files, 190 proposed moves/renames, 176 KEEP, 68 REVIEW; 71 batches and 421 reference-update entries. No merge or archive is proposed. Phase 4 remains required.

## Phase 4 — review gate

**Depends on:** Phases 1–3 documents.
**Acceptance:** The concrete mapping is reviewable, contradictions are resolved, and ambiguous moves are excluded from execution.

- [x] Review analysis, dependency map, architecture, naming, migration plan and testing strategy together.
- [x] Verify complete file coverage and an owning batch for every reference update.
- [x] Review high-risk systems, shared CSS, server boundaries and public/admin exceptions.
- [x] Resolve ambiguous migrations or keep them REVIEW with no execution scheduled.
- [x] Record the reviewed plan version and findings in review.md.
- [x] User authorized B01 execution and readable naming improvements where justified.
- [x] Recheck Git status and source drift; refresh affected evidence.

**Review:** [Findings, corrections and fingerprint](review.md). Static audit passed; baseline, runtime checks and execution remain pending.

## Phase 5 — execute one reviewed batch

**Depends on:** Phase 4 gate. Repeat Phase 5 → Phase 6 for every batch.

- [ ] Capture the pre-batch diff and validation baseline.
- [ ] Move/rename only mapped files and update their references together.
- [ ] Preserve CSS ownership, directives, exports, behavior and accessibility selectors.
- [ ] Avoid unrelated refactoring, feature development, global formatting and baseline-error cleanup.
- [ ] Review the diff for unexpected changes.
- [ ] Complete Phase 6 before starting another batch.
- [ ] Update the batch ledger and migration-plan.md with actual outcomes.

### Batch ledger

The reviewed schedule contains 71 batches. This ledger records execution; implemented does not mean all authenticated UI gates have passed. Phase 5/6 checklists are reusable per-batch gates.

| Batch | Scope / mapping | Status | Validation | Remaining issue |
| --- | --- | --- | --- | --- |
| B01 | about; M001, M002 | Implemented | Build and baseline comparisons passed; public browser checks passed | Legacy jsdom harness remains unresolved |
| B02 | admin/about; M019 | Implemented | Build and baseline comparisons passed ; login redirects unchanged | Authenticated UI interactions unverified |
| B03 | admin/access; M164 | Implemented | Build and baseline comparisons passed ; login redirects unchanged | Authenticated UI interactions unverified |
| B04 | admin/arts; M026 | Implemented | Build and baseline comparisons passed ; login redirects unchanged | Authenticated UI interactions unverified |
| B05 | admin/impact; M166, M167 | Implemented | Build and baseline comparisons passed ; login redirects unchanged | Authenticated UI interactions unverified |
| B06 | admin/notifications; M099, M100 | Implemented | Build and baseline comparisons passed ; login redirects unchanged | Authenticated UI interactions unverified |
| B07 | admin/partners; M102, M103 | Implemented | Build and baseline comparisons passed ; login redirects unchanged | Authenticated UI interactions unverified |
| B08 | admin/podcasts; M051, M109 | Implemented | Build and baseline comparisons passed ; login redirects unchanged | Authenticated UI interactions unverified |
| B09 | admin/profile; M104, M110 | Implemented | Build and baseline comparisons passed ; login redirects unchanged | Authenticated UI interactions unverified |
| B10 | admin/projects; M144, M145 | Implemented | Build and baseline comparisons passed ; login redirects unchanged | Authenticated UI interactions unverified |
| B11 | admin/settings; M075, M101, M163, M165 | Implemented | Build/baseline comparisons and login redirects passed | Authenticated UI unverified |
| B12 | admin/stories; M053, M168, M169 | Implemented | Build/baseline comparisons and login redirects passed | Authenticated UI unverified |
| B13 | admin/support; M095, M146, M170, M171 | Implemented | Build/baseline comparisons and login redirects passed | Authenticated UI unverified |
| B14 | admin/support; M172 | Implemented | Build/baseline comparisons and login redirects passed | Authenticated UI unverified |
| B15 | admin/team; M179, M180 | Implemented | Build/baseline comparisons and login redirects passed | Authenticated UI unverified |
| B16 | admin/users; M024, M025 | Implemented | Build/baseline and login redirects passed | Authenticated UI unverified |
| B17 | admin/volunteers; M182 | Implemented | Build/baseline and login redirects passed | Authenticated UI unverified |
| B18 | contact; M216, M217 | Implemented | Build/baseline and browser comparisons passed | Submission/delivery unverified |
| B19 | errors; M223, M224, M225, M226 | Implemented | Build/baseline and browser comparisons passed | Existing React #418; actual boundary failures not induced |
| B20 | errors; M227 | Implemented | Build/baseline and browser comparisons passed | Other role/context combinations unverified |
| B21 | homepage; M268, M272, M273, M274 | Implemented | Build/diagnostic and recorded route checks passed | Runtime limits in batch evidence |
| B22 | homepage; M348, M349 | Implemented | Build/diagnostic and recorded route checks passed | Runtime limits in batch evidence |
| B23 | newsletter; M280 | Implemented | Build/diagnostic and recorded route checks passed | Runtime limits in batch evidence |
| B24 | podcasts; M351 | Implemented | Build/diagnostic and recorded route checks passed | Runtime limits in batch evidence |
| B25 | press; M347 | Implemented | Build/diagnostic and recorded route checks passed | Runtime limits in batch evidence |
| B26 | support; M354 | Implemented | Build/diagnostic and recorded route checks passed | Runtime limits in batch evidence |
| B27 | volunteer; M430 | Implemented | Build/diagnostic and recorded route checks passed | Runtime limits in batch evidence |
| B28 | what-we-do; M431, M432, M433, M434 | Implemented | Build/diagnostic and recorded route checks passed | Runtime limits in batch evidence |
| B29 | admin/common; M036, M054, M057 | Implemented | Build/diagnostic and recorded route checks passed | Runtime limits in batch evidence |
| B30 | admin/finance; M061, M062, M063, M105 | Implemented | Build/diagnostic and recorded route checks passed | Runtime limits in batch evidence |
| B31 | admin/homepage; M077, M078, M079, M080 | Implemented | Build/diagnostic and recorded route checks passed | Runtime limits in batch evidence |
| B32 | admin/homepage; M081, M082, M083, M084 | Implemented | Build/diagnostic and recorded route checks passed | Runtime limits in batch evidence |
| B33 | admin/homepage; M085, M086, M087, M088 | Implemented | Build/diagnostic and recorded route checks passed | Runtime limits in batch evidence |
| B34 | admin/homepage; M089, M090, M091, M092 | Implemented | Build/diagnostic and recorded route checks passed | Runtime limits in batch evidence |
| B35 | admin/homepage; M093, M094 | Implemented | Build/diagnostic and recorded route checks passed | Runtime limits in batch evidence |
| B36 | admin/layout; M020, M021, M022, M023 | Implemented | Build/diagnostic and recorded route checks passed | Runtime limits in batch evidence |
| B37 | admin/media; M068, M096 | Implemented | Build/diagnostic and recorded route checks passed | Runtime limits in batch evidence |
| B38 | admin/media; M097 | Implemented | Build/diagnostic and recorded route checks passed | Runtime limits in batch evidence |
| B39 | admin/rich-text-editor; M147 | Implemented | Build/diagnostic and recorded route checks passed | Runtime limits in batch evidence |
| B40 | donations; M221, M222, M346 | Implemented | Build/diagnostic and recorded route checks passed | Runtime limits in batch evidence |
| B41 | layout; M218, M219, M263, M267 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B42 | layout; M276, M277, M278, M279 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B43 | shared; M186, M281 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B44 | shared; M352 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B45 | admin/conference; M027, M028, M029, M031 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B46 | admin/conference; M032, M033, M034, M035 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B47 | admin/conference; M052, M069, M071, M072 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B48 | admin/conference; M073, M074 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B49 | admin/events; M231, M232, M233, M234 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B50 | admin/events; M235, M236, M237, M238 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B51 | admin/events; M239, M240, M241, M242 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B52 | admin/events; M243, M244, M245, M246 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B53 | admin/events; M247, M248, M249, M250 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B54 | admin/events; M251, M252, M256, M257 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B55 | admin/events; M258 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B56 | admin/programs; M014, M016, M018, M111 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B57 | admin/programs; M112, M113 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B58 | admin/programs; M114, M115, M116, M117 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B59 | admin/programs; M118, M119, M120, M121 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B60 | admin/programs; M122, M123, M124, M125 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B61 | admin/programs; M126, M127, M128, M129 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B62 | admin/programs; M130, M131, M132, M133 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B63 | admin/programs; M134, M135, M136, M137 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B64 | admin/programs; M138, M139, M140 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B65 | admin/programs; M141, M142 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B66 | admin/programs; M143 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B67 | events; M259 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B68 | programs; M309, M311 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B69 | programs; M312, M313 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B70 | programs; M315, M330, M339 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |
| B71 | programs; M340, M341, M342, M343 | Implemented | Build/diagnostic and recorded route/browser checks passed | Runtime limits in batch evidence |

## Phase 6 — validate each batch

**Acceptance:** No migration-caused failure remains; required checks have recorded outcomes. Blocked or unrun checks are not passes.

- [ ] Run `pnpm run typecheck`; compare diagnostics with the recorded baseline.
- [ ] Run `pnpm run lint` and focused `pnpm exec eslint <changed-source-files>` as appropriate; separate old findings from new ones.
- [ ] Run `pnpm run build`; do not substitute it for typecheck.
- [ ] Run relevant tests using actual repository configurations.
- [ ] Search old paths, relative imports, re-exports, dynamic imports, test mocks, CSS references and script loaders.
- [ ] Check exact casing and module cycles, distinguishing type-only and runtime edges.
- [ ] Exercise affected routes and interactions, including demos and admin previews when applicable.
- [ ] Verify normal/contrast modes, keyboard behavior, responsive layout and relevant accessibility states for moved UI.
- [ ] Fix migration-caused failures before continuing; document baseline issues without weakening checks.
- [ ] Save results and limitations; update this checklist and migration-plan.md.

## Phase 7 — final cleanup and verification

**Depends on:** Every reviewed batch passing its exit gates.

- [ ] Review obsolete files separately; remove/archive only with an explicit reviewed disposition.
- [ ] Remove empty directories and temporary migration code after confirming they are no longer needed.
- [ ] Verify naming, UI boundaries, domain ownership, admin separation and justified shared use.
- [ ] Verify no unintended duplicates, stale imports, broken CSS or dynamic references remain.
- [ ] Run final typecheck, lint, build and relevant tests; report outstanding pre-existing failures honestly.
- [ ] Complete affected-route regression checks and document uncovered behavior.
- [ ] Update active documents to the actual final tree; retain historical evidence.
- [ ] Review final Git diff and confirm unrelated work is intact.
- [ ] Mark completion only when the accepted scope and validation gates are satisfied.

## Progress record

| Date | Completed | Still open |
| --- | --- | --- |
| 2026-10-01 | Independently checked preparation; preserved prior plans; published 434-file static inventory and profiles, dependency map, ambiguity dispositions and initial validation strategy; rewrote active tasks at the user's request | Detailed responsibility/category review and architecture decisions; exact mapping, migration and runtime validation |

## Execution record

- B01: About hero and CSS moved; route import updated. Names preserved because they are already descriptive. Build and browser comparisons passed; focused lint passed with existing warnings. Repository lint/typecheck match baseline; the accessibility suite remains blocked by missing jsdom. See B01 evidence.
- B02: About manager moved/renamed, route import updated; build and baseline lint/typecheck comparisons passed. Unauthenticated production redirect unchanged; authenticated edit/save/reset remains unverified. See B02 evidence.
- On 2026-10-02 the user confirmed jsdom was abandoned and authorized continuation. node-html-parser is used for Wiktionary HTML; stale jsdom imports remain. Actual dictionary-selection assertions passed in isolated Chrome without adding dependencies. This supplements B01 validation; the old Jest harness remains a maintenance issue.
- B03: setup form moved to admin/access; build/baseline comparisons and login redirect passed. Evidence.
- B04: artworks manager moved to admin/arts; build/baseline comparisons and login redirect passed. Evidence.
- B05: statistics components moved to admin/impact; focused lint/build passed, other diagnostics match baseline, three login redirects unchanged. Evidence.
- User explicitly authorized B03–B05 together on 2026-10-02; they were executed sequentially with checks after each. Authenticated edit/upload/save/delete/setup behavior remains unverified.
- B06: admin/notifications components relocated; production build and baseline comparisons passed; affected unauthenticated redirects unchanged. Evidence.
- B07: admin/partners components relocated; production build and baseline comparisons passed; affected unauthenticated redirects unchanged. Evidence.
- B08: admin/podcasts components relocated; production build and baseline comparisons passed; affected unauthenticated redirects unchanged. Evidence.
- B09: admin/profile components relocated; production build and baseline comparisons passed; affected unauthenticated redirects unchanged. Evidence.
- B10: admin/projects components relocated; production build and baseline comparisons passed; affected unauthenticated redirects unchanged. Evidence.
- User authorized continuation through B10 on 2026-10-02. B06–B10 ran sequentially. Ten component files are byte-identical to the reviewed originals; thirteen import references changed across eleven callers. All 948 baseline source/config files reconcile with B01–B10, and the component file set remains exactly 434.
- B11: admin/settings relocated; build and baseline comparisons passed; unauthenticated routes unchanged. Evidence.
- B12: admin/stories relocated; build and baseline comparisons passed; unauthenticated routes unchanged. Evidence.
- B13: admin/support relocated; build and baseline comparisons passed; unauthenticated routes unchanged. Evidence.
- B14: admin/support relocated; build and baseline comparisons passed; unauthenticated routes unchanged. Evidence.
- B15: admin/team relocated; build and baseline comparisons passed; unauthenticated routes unchanged. Evidence.
- User authorized B11–B15 on 2026-10-02. Fourteen moves and twenty changed import references completed sequentially; only planned import edits alter moved component contents. The 948-file source audit accounts for all B01–B15 changes.
- B16: admin/users implemented with checks and recorded limitations. Evidence.
- B17: admin/volunteers implemented with checks and recorded limitations. Evidence.
- B18: contact implemented with checks and recorded limitations. Evidence.
- B19: errors implemented with checks and recorded limitations. Evidence.
- B20: errors implemented with checks and recorded limitations. Evidence.
- User authorized B16–B20 on 2026-10-02. Ten moves/renames and twelve import edits completed; full source audit accounts for B01–B20. Public checks compare 42 browser states. Existing React #418 on the generic-error demo is unchanged.
- B21: homepage implemented; validation and limits.
- B22: homepage implemented; validation and limits.
- B23: newsletter implemented; validation and limits.
- B24: podcasts implemented; validation and limits.
- B25: press implemented; validation and limits.
- B26: support implemented; validation and limits.
- B27: volunteer implemented; validation and limits.
- B28: what-we-do implemented; validation and limits.
- B29: admin/common implemented; validation and limits.
- B30: admin/finance implemented; validation and limits.
- User authorized B21–B30 on 2026-10-03. Twenty-two moves and thirty-two import references completed; source/config audit and CSS co-location checks preserve the reviewed behavior. Negative-mode transition samples and other runtime limits are recorded explicitly.
- All 71 planned batches are implemented; the 68 REVIEW entries remain unchanged. No globally clean lint/typecheck or complete authenticated UI pass is claimed.

2026-10-03 finalization: the migration audit found six displayed source-path references in `app/demo/errors/page.tsx` outside the executable-import mapping. They were corrected to the new errors directory and filenames. [Supplemental reference ledger](batches/B20/supplemental-reference-updates.json) preserves the reviewed mapping unchanged. Focused lint diagnostics match before/after, the additional production build passed, and the demo hub renders the corrected examples with HTTP 200 and no page errors. Final group audit (temporary capture removed after review) reconciles all 948 baseline files, the exact 434-file component set, all twelve mapped reference resolutions and these six supplemental updates; no stale moved-path aliases remain. Future source-drift comparisons must reverse both the mapping reference edits and this supplemental ledger.

2026-10-03: B31–B40 implemented sequentially: 29 files moved/renamed, 66 mapped import-reference entries changed and one maintenance-comment path corrected. All ten builds and fresh-baseline diagnostic comparisons passed. Program-editor tests remain 11/11 passing; selected finance tests remain 32/36 passing with four unchanged baseline failures. Runtime and authenticated-flow limitations are recorded in the batch evidence. At that checkpoint, B41 had not started.

2026-10-03: B41–B50 implemented sequentially: 33 files moved/renamed and 54 mapped module-reference entries changed. All ten production builds and baseline diagnostic comparisons passed. Public browser comparisons and accessibility-test baseline comparisons are recorded per batch; authenticated conference/event workflows and other runtime limitations remain unverified. At that checkpoint, B51 had not started.

2026-10-04: B51–B60 implemented sequentially: 35 files moved/renamed and 85 mapped module-reference entries changed. All ten production builds and baseline diagnostic comparisons passed. Public browser comparisons and program-editor test comparisons are recorded per batch; authenticated event/program workflows and other runtime limitations remain unverified. At that checkpoint, B61 had not started.

2026-10-04: B61–B71 implemented sequentially: 30 files moved/renamed, 97 mapped module-reference entries changed and one mapped maintenance-comment path corrected. All eleven production builds and baseline diagnostic comparisons passed. The complete program suite passes 45/45 after every program batch; 270 browser states match baseline. All 190 reviewed moves across the 71-batch schedule are implemented. The 176 KEEP and 68 REVIEW files remain accounted for; REVIEW moves, deletion, archival and behavioral cleanup are not authorized by this completion. Authenticated persistence/upload and recorded runtime limitations remain outstanding.

Current post-migration usage: [68-file usage audit](usage-audit/README.md) traces the live tree and separates production, type-only, disconnected and unreferenced files. The original REVIEW mapping remains unchanged.


2026-10-04 — Authorized REVIEW cleanup completed: 55 unreferenced code files moved to `components/archive/`, three byte-identical unused copies removed, and ten referenced files retained unchanged. See [archive README](../../../../components/archive/README.md) and [operation manifest](usage-audit/archive-cleanup/manifest.json). The original mapping and pre-cleanup usage evidence remain historical snapshots; their original-path checks are superseded for this authorized set by the manifest. Structural/hash/import checks passed; formal verification and runtime observation were not performed for this cleanup.
