# Conference Form Builder — UI/UX Improvement Tasks

> **Source audit:** [UI-UX-Analysis.md](./UI-UX-Analysis.md)  
> **Scope:** Admin form builder at `/admin/conference/settings/form-builder` + related public renderer fidelity  
> **Goal:** Fix correctness/trust issues first, then usability, power features, polish, and a11y  
> **Status:** Not started  
> **Last updated:** 2026-07-23

---

## How to use this list

| Field | Meaning |
|-------|---------|
| **ID** | Stable task id (`P0-01`, `P1-03`, …) |
| **Priority** | P0 = ship-blockers · P1 = high UX impact · P2 = power features · P3 = polish |
| **Effort** | S ≤ 0.5 day · M = 1–2 days · L = 3–5 days |
| **Status** | `[ ]` todo · `[~]` in progress · `[x]` done · `[-]` cancelled |

Track progress by checking boxes and updating the summary table below.

### Progress summary

| Phase | Focus | Tasks | Done |
|-------|--------|------:|-----:|
| A | Trust & correctness (P0) | 8 | 0 |
| B | Usability & discoverability (P1) | 14 | 0 |
| C | Power features (P2) | 12 | 0 |
| D | Polish, a11y, performance (P3) | 12 | 0 |
| **Total** | | **46** | **0** |

---

## Phase A — Trust & Correctness (P0)

> Fix bugs that break save/publish, field order, or crash empty states. Do these before any visual polish.

### P0-01 — Fix save/publish API call signature

- [ ] **P0-01** Fix `updateFormSchema` client invocation so `eventId` and `publish` are not swapped
  - **Severity:** High (publish can fail or target wrong event)
  - **Effort:** S
  - **Files:**
    - `components/admin/conference-form-builder.tsx`
    - `lib/actions/conference-form-schema.ts`
    - `app/admin/conference/settings/form-builder/page.tsx`
  - **Work:**
    1. Resolve current event id on the page (or via prop/hook).
    2. Call `updateFormSchema(schema, eventId, publish)` with correct args.
    3. Handle missing event with a clear toast (“Create/select an event first”).
  - **Acceptance criteria:**
    - [ ] Save Draft creates a non-active schema version for the correct event.
    - [ ] Publish activates the new version for that event only.
    - [ ] Unit/integration test covers both draft and publish paths.
  - **Depends on:** —
  - **Refs:** Audit §9.1

---

### P0-02 — Null / missing schema fallback

- [ ] **P0-02** Never pass `null` into `ConferenceFormBuilder`
  - **Severity:** High (page crash)
  - **Effort:** S
  - **Files:**
    - `app/admin/conference/settings/form-builder/page.tsx`
    - `lib/types/conference-form-schema.ts` (default schema helper)
    - Optionally `lib/actions/conference-form-schema.ts`
  - **Work:**
    1. Add `getDefaultFormSchema()` with locked `full_name`, `email`, `consent_terms` + one step.
    2. Page: `const schema = (await getActiveFormSchema()) ?? getDefaultFormSchema()`.
    3. Guard client components against empty `steps` without throwing.
  - **Acceptance criteria:**
    - [ ] Fresh install / no DB rows still renders Form Builder.
    - [ ] Locked core fields present in default schema.
  - **Depends on:** —
  - **Refs:** Audit §1.3, §10

---

### P0-03 — Sync `field.order` on add and reorder

- [ ] **P0-03** Keep canvas order identical to public form order
  - **Severity:** High (registrants see wrong field order)
  - **Effort:** S
  - **Files:**
    - `components/admin/form-field-palette.tsx`
    - `components/admin/form-canvas.tsx`
    - `components/conference/dynamic-step.tsx` (verify sort)
  - **Work:**
    1. On field add, set `order` to `step.fields.length` (or reindex 0..n).
    2. On up/down reorder, reindex `order` for all fields in that step.
    3. Sort canvas display by `order` for consistency.
  - **Acceptance criteria:**
    - [ ] Reorder in builder → Preview shows same order.
    - [ ] Publish → public registration form matches builder order.
  - **Depends on:** —
  - **Refs:** Audit §3.1

---

### P0-04 — Reindex `order` after delete and step moves

- [ ] **P0-04** Reindex field/step order after destructive or structural ops
  - **Severity:** High (related to P0-03)
  - **Effort:** S
  - **Files:**
    - `components/admin/form-canvas.tsx`
    - `components/admin/form-step-editor.tsx`
  - **Work:**
    1. After delete field → reindex remaining fields.
    2. After step reorder/delete → ensure `step.order` and nested field integrity.
  - **Acceptance criteria:**
    - [ ] No duplicate `order` values within a step.
    - [ ] Conditional “fields before me” still valid after reorders.
  - **Depends on:** P0-03
  - **Refs:** Audit §3.1, §10

---

### P0-05 — Live vs draft status after save

- [ ] **P0-05** Reflect server version and publish state in the action bar
  - **Severity:** High (admin uncertainty)
  - **Effort:** M
  - **Files:**
    - `components/admin/conference-form-builder.tsx`
    - `lib/actions/conference-form-schema.ts` (return richer result if needed)
  - **Work:**
    1. On successful save, update local `schema.version` from result.
    2. Show chips: `Live vN` · `Draft saved` · `Unsaved changes`.
    3. Distinguish draft save vs publish in button loading labels (“Saving…” / “Publishing…”).
  - **Acceptance criteria:**
    - [ ] Version number updates without full page reload.
    - [ ] Admin can tell whether current edits are live.
  - **Depends on:** P0-01
  - **Refs:** Audit §6.2, §6.4, §9.4

---

### P0-06 — Wire event context into the builder

- [ ] **P0-06** Scope form builder to a selected event
  - **Severity:** High (multi-event product)
  - **Effort:** M
  - **Files:**
    - `components/admin/conference-form-builder/EventSelector.tsx` (exists, unwired)
    - `components/admin/conference-form-builder.tsx`
    - `app/admin/conference/settings/form-builder/page.tsx`
  - **Work:**
    1. Mount `EventSelector` in action bar.
    2. Load schema for selected `eventId`.
    3. Save/publish only that event’s schema.
    4. Warn when switching event with unsaved changes.
  - **Acceptance criteria:**
    - [ ] Switching events loads the correct schema.
    - [ ] Publishing event A never activates schema for event B.
  - **Depends on:** P0-01, P0-02
  - **Refs:** Audit §9.2

---

### P0-07 — Actionable validation error list

- [ ] **P0-07** Replace toast-only validation blobs with a navigable error panel
  - **Severity:** High
  - **Effort:** M
  - **Files:**
    - `components/admin/conference-form-builder.tsx`
    - `lib/validation/schema-validation.ts` (ensure path → fieldId mapping)
  - **Work:**
    1. Show collapsible “N errors / N warnings” panel under action bar when invalid.
    2. Each error click selects the field and opens properties.
    3. Highlight invalid field cards on canvas (red border).
  - **Acceptance criteria:**
    - [ ] User can fix all errors without reading toast text.
    - [ ] Warnings still allow save with confirmation.
  - **Depends on:** —
  - **Refs:** Audit §4.4, §6.1

---

### P0-08 — Replace native `confirm` / `alert` for critical flows

- [ ] **P0-08** Use design-system dialogs for delete, warnings, preview submit
  - **Severity:** Medium–High (trust + a11y)
  - **Effort:** S–M
  - **Files:**
    - `components/admin/form-canvas.tsx`
    - `components/admin/form-step-editor.tsx`
    - `components/admin/form-conditional-editor.tsx`
    - `components/admin/form-preview.tsx`
    - `components/admin/conference-form-builder.tsx`
  - **Work:**
    1. Delete field/step → AlertDialog.
    2. Save warnings → AlertDialog with Continue / Cancel.
    3. Preview submit → toast + optional payload drawer (no `alert`).
  - **Acceptance criteria:**
    - [ ] No `window.confirm` / `window.alert` in form-builder components.
    - [ ] Dialogs keyboard-dismissible (Escape) and focus-trapped.
  - **Depends on:** —
  - **Refs:** Audit §4.5, §6.3

---

## Phase B — Usability & Discoverability (P1)

> Make the builder obvious for first-time admins and usable on real admin screens.

### P1-01 — First-run empty state with starter paths

- [ ] **P1-01** Empty-state onboarding when no steps/fields
  - **Effort:** M
  - **Files:**
    - `components/admin/form-canvas.tsx`
    - `components/admin/conference-form-builder.tsx`
  - **Work:**
    1. Three CTAs: **Start from template** · **Use default registration** · **Start blank**.
    2. Short tip: “1 Add step → 2 Add fields → 3 Configure → 4 Preview → 5 Publish”.
    3. Use Lucide icons (no emoji).
  - **Acceptance criteria:**
    - [ ] New admin can create a usable form in &lt; 2 minutes without docs.
  - **Depends on:** P0-02, P1-02
  - **Refs:** Audit §1.1, §1.4

---

### P1-02 — Wire form templates into the builder

- [ ] **P1-02** Mount `FormTemplateChooser` and make apply/save work end-to-end
  - **Effort:** M
  - **Files:**
    - `components/admin/conference-form-builder/FormTemplateChooser.tsx`
    - `components/admin/conference-form-builder.tsx`
    - `lib/actions/conference-form-templates.ts`
  - **Work:**
    1. Add **Templates** button to action bar.
    2. Apply template → replace local schema (confirm if dirty).
    3. Save current form as template.
    4. Mark unsaved after apply.
  - **Acceptance criteria:**
    - [ ] Browse / apply / save-as-template works for selected event.
    - [ ] Applying template does not auto-publish.
  - **Depends on:** P0-06 (event id)
  - **Refs:** Audit §1.2

---

### P1-03 — Responsive three-panel layout

- [ ] **P1-03** Collapse builder for tablet/narrow laptop/mobile admin
  - **Effort:** L
  - **Files:**
    - `components/admin/conference-form-builder.tsx`
    - Possibly new `FormBuilderShell.tsx`
  - **Work:**
    1. `≥ lg`: keep 3 columns (palette / canvas / properties).
    2. `md–lg`: canvas center; palette & properties as sheet/drawer.
    3. `< md`: bottom tabs — Steps · Build · Settings · Preview.
    4. Preserve selection state across layout modes.
  - **Acceptance criteria:**
    - [ ] Usable at 375px, 768px, 1024px, 1440px without horizontal scroll.
    - [ ] All primary actions reachable on touch.
  - **Depends on:** —
  - **Refs:** Audit §3.6, persona Mobile

---

### P1-04 — Always-visible field actions (not hover-only)

- [ ] **P1-04** Show move/delete on selected field; ensure 44×44 touch targets
  - **Effort:** S
  - **Files:**
    - `components/admin/form-canvas.tsx`
    - `components/admin/form-step-editor.tsx`
  - **Work:**
    1. Selected field: actions always visible.
    2. Unselected: show on hover *and* focus-within.
    3. Minimum hit area 44px on touch breakpoints.
  - **Acceptance criteria:**
    - [ ] Touch users can reorder/delete without hovering.
  - **Depends on:** —
  - **Refs:** Audit §3.4

---

### P1-05 — Categorize field palette

- [ ] **P1-05** Group field types for scanability
  - **Effort:** S
  - **Files:**
    - `components/admin/form-field-palette.tsx`
  - **Work:**
    1. Groups: **Basic** · **Choice** · **Layout** · **Advanced**.
    2. Optional search filter when list grows.
  - **Acceptance criteria:**
    - [ ] Groups collapse/expand or use clear section headers.
  - **Depends on:** —
  - **Refs:** Audit §2.1

---

### P1-06 — Add Paragraph to palette

- [ ] **P1-06** Expose `paragraph` field type in palette under Layout
  - **Effort:** S
  - **Files:**
    - `components/admin/form-field-palette.tsx`
  - **Acceptance criteria:**
    - [ ] Admin can add paragraph; public form renders it.
  - **Depends on:** —
  - **Refs:** Audit §2.2

---

### P1-07 — Distinct icons for radio vs checkbox

- [ ] **P1-07** Fix shared `CheckSquare` icon collision
  - **Effort:** S
  - **Files:**
    - `components/admin/form-field-palette.tsx`
    - `components/admin/form-canvas.tsx` (`getFieldIcon`)
  - **Work:**
    1. Radio → `Circle` / `CircleDot`; Checkbox → `CheckSquare`.
    2. Replace emoji canvas glyphs with Lucide.
  - **Acceptance criteria:**
    - [ ] Palette and canvas use the same icon language.
  - **Depends on:** —
  - **Refs:** Audit §2.5, §5.3

---

### P1-08 — Canvas helper copy + docs alignment

- [ ] **P1-08** Clarify where to add steps/fields; align admin guide
  - **Effort:** S
  - **Files:**
    - `components/admin/form-canvas.tsx`
    - `docs/new-conference/ADMIN_USER_GUIDE.md`
  - **Work:**
    1. Canvas header: “Manage steps in the left panel · Click a field to edit”.
    2. Fix guide steps that say “Add Step on canvas”.
  - **Acceptance criteria:**
    - [ ] UI and docs describe the same flow.
  - **Depends on:** —
  - **Refs:** Audit §1.5

---

### P1-09 — Half-width visual on canvas

- [ ] **P1-09** Show half-width fields as 2-col mock on canvas
  - **Effort:** M
  - **Files:**
    - `components/admin/form-canvas.tsx`
  - **Work:**
    1. Within a step, render half-width pairs side-by-side (md+).
    2. Keep full-width spanning.
  - **Acceptance criteria:**
    - [ ] Canvas layout previews half-width without opening Preview.
  - **Depends on:** —
  - **Refs:** Audit §3.7

---

### P1-10 — Move field across steps

- [ ] **P1-10** Allow moving a field to another step without delete/recreate
  - **Effort:** M
  - **Files:**
    - `components/admin/form-field-editor.tsx`
    - `components/admin/form-canvas.tsx`
  - **Work:**
    1. Properties: “Move to step…” select.
    2. Reindex `order` in source and target steps.
    3. Validate conditionals still legal after move.
  - **Acceptance criteria:**
    - [ ] Field moves with options/validation intact.
    - [ ] Broken conditionals surface as errors (P0-07).
  - **Depends on:** P0-03, P0-07
  - **Refs:** Audit §3.5

---

### P1-11 — Preview device frames + open live URL

- [ ] **P1-11** Improve preview for mobile registrant fidelity
  - **Effort:** M
  - **Files:**
    - `components/admin/form-preview.tsx`
  - **Work:**
    1. Toggle Desktop / Tablet / Phone width frames.
    2. Button: “Open registration page” (new tab) when published.
    3. Toast on preview submit with optional JSON payload expand.
  - **Acceptance criteria:**
    - [ ] Admin can simulate mobile width without resizing browser.
  - **Depends on:** P0-08
  - **Refs:** Audit §9.3, §6.3

---

### P1-12 — Publish confirmation sheet

- [ ] **P1-12** Pre-publish summary before going live
  - **Effort:** M
  - **Files:**
    - `components/admin/conference-form-builder.tsx`
  - **Work:**
    1. Dialog: step count, field count, warnings, “This replaces live form for {event}”.
    2. Confirm → publish.
  - **Acceptance criteria:**
    - [ ] Accidental one-click publish is prevented.
  - **Depends on:** P0-01, P0-05, P0-08
  - **Refs:** Audit §9.4

---

### P1-13 — Soft-delete with undo

- [ ] **P1-13** Toast undo for field/step delete (≈30s)
  - **Effort:** M
  - **Files:**
    - `components/admin/form-canvas.tsx`
    - `components/admin/form-step-editor.tsx`
    - `components/admin/conference-form-builder.tsx`
  - **Acceptance criteria:**
    - [ ] Undo restores field/step including options and conditionals.
  - **Depends on:** P0-08
  - **Refs:** Audit §6.5

---

### P1-14 — One-time coach / checklist

- [ ] **P1-14** Lightweight first-visit checklist (dismissible, localStorage)
  - **Effort:** S–M
  - **Files:**
    - `components/admin/conference-form-builder.tsx` (or `FormBuilderOnboarding.tsx`)
  - **Work:**
    1. Checklist: Add step · Add field · Configure · Preview · Publish.
    2. Auto-check as user completes actions.
  - **Acceptance criteria:**
    - [ ] Dismiss persists per admin/browser.
  - **Depends on:** P1-01
  - **Refs:** Audit §1.4

---

## Phase C — Power Features (P2)

> Complete capabilities already half-built in schema/Phase 4 components.

### P2-01 — Wire EnhancedConditionalEditor

- [ ] **P2-01** Replace basic conditional UI with advanced editor
  - **Effort:** M
  - **Files:**
    - `components/admin/form-field-editor.tsx`
    - `components/admin/conference-form-builder/EnhancedConditionalEditor.tsx`
    - `components/admin/form-conditional-editor.tsx` (deprecate or keep as fallback)
  - **Work:**
    1. Support contains / numeric ops + AND·OR groups.
    2. Restrict dependencies to earlier fields (preserve current safety rule).
    3. Keep plain-language summary.
  - **Acceptance criteria:**
    - [ ] Nested conditions evaluate correctly in Preview and public form.
  - **Depends on:** —
  - **Refs:** Audit §4.1

---

### P2-02 — Editable option values

- [ ] **P2-02** Show and edit option `value` (not only label)
  - **Effort:** S–M
  - **Files:**
    - `components/admin/form-field-editor.tsx`
  - **Work:**
    1. Dual inputs: Label + Value (auto-slug from label on create).
    2. Warn if value used by conditionals is changed.
  - **Acceptance criteria:**
    - [ ] Conditionals can target stable values while labels change.
  - **Depends on:** —
  - **Refs:** Audit §4.2

---

### P2-03 — Option reorder (real or remove grip)

- [ ] **P2-03** Implement option reordering or remove fake drag handle
  - **Effort:** M (DnD) or S (remove grip)
  - **Files:**
    - `components/admin/form-field-editor.tsx`
  - **Recommended:** Sortable list (dnd-kit) for options.
  - **Acceptance criteria:**
    - [ ] Option order in builder = order in public form.
    - [ ] No non-functional grip affordance.
  - **Depends on:** P0-03 pattern
  - **Refs:** Audit §3.3

---

### P2-04 — File field config UI

- [ ] **P2-04** Properties for `fileUploadConfig`
  - **Effort:** M
  - **Files:**
    - `components/admin/form-field-editor.tsx`
    - `lib/types/conference-form-schema.ts`
  - **Work:**
    1. Max size (MB), allowed MIME types, multiple toggle.
    2. Defaults match public `FieldFile`.
  - **Acceptance criteria:**
    - [ ] Configured limits enforced in public form.
  - **Depends on:** —
  - **Refs:** Audit §2.3, §4.3

---

### P2-05 — Date field config UI

- [ ] **P2-05** Properties for `dateValidation`
  - **Effort:** M
  - **Files:**
    - `components/admin/form-field-editor.tsx`
  - **Work:**
    1. Min/max date (absolute or relative “today”, “today+30d”).
    2. Optional disabled weekdays.
  - **Acceptance criteria:**
    - [ ] Preview respects min/max.
  - **Depends on:** —
  - **Refs:** Audit §2.3, §4.3

---

### P2-06 — Pattern / regex validation UI

- [ ] **P2-06** Expose `validation.pattern` + `patternMessage` for text-like fields
  - **Effort:** S–M
  - **Files:**
    - `components/admin/form-field-editor.tsx`
    - `lib/validation/form-schema.ts` (ensure runtime uses them)
  - **Acceptance criteria:**
    - [ ] Invalid pattern fails field validation with custom message.
  - **Depends on:** —
  - **Refs:** Audit §2.4

---

### P2-07 — Default value UI

- [ ] **P2-07** Allow setting field `defaultValue` in properties
  - **Effort:** S–M
  - **Files:**
    - `components/admin/form-field-editor.tsx`
    - `components/conference/dynamic-form-renderer.tsx` (seed form state)
  - **Acceptance criteria:**
    - [ ] New registrant form opens with defaults prefilled where appropriate.
  - **Depends on:** —
  - **Refs:** Audit §2.4

---

### P2-08 — Field drag-and-drop reorder

- [ ] **P2-08** Real DnD for fields within a step (always-visible handle)
  - **Effort:** L
  - **Files:**
    - `components/admin/form-canvas.tsx`
    - Consider `@dnd-kit/core` + sortable
  - **Work:**
    1. Drag handle reorders fields.
    2. On drop, reindex `order`.
    3. Keyboard sortable alternative (or keep chevrons).
  - **Acceptance criteria:**
    - [ ] DnD works with 20+ fields without jank.
    - [ ] GripVertical no longer decorative-only.
  - **Depends on:** P0-03, P1-04
  - **Refs:** Audit §3.2

---

### P2-09 — Drag field types from palette onto canvas

- [ ] **P2-09** Drop-to-add with step target highlight
  - **Effort:** L
  - **Files:**
    - `components/admin/form-field-palette.tsx`
    - `components/admin/form-canvas.tsx`
  - **Acceptance criteria:**
    - [ ] Dropping on a step adds field at end (or drop index).
    - [ ] Click-to-add still works.
  - **Depends on:** P2-08
  - **Refs:** Audit §2.6

---

### P2-10 — Version history & rollback

- [ ] **P2-10** List prior schema versions; restore as draft
  - **Effort:** L
  - **Files:**
    - `lib/actions/conference-form-schema.ts` (`getFormSchemaByVersion`, list versions)
    - New `FormVersionHistory.tsx`
    - `components/admin/conference-form-builder.tsx`
  - **Work:**
    1. Show version, date, notes, active flag.
    2. Restore → load into editor as unsaved draft (do not auto-publish).
  - **Acceptance criteria:**
    - [ ] Admin can recover from bad publish without DB access.
  - **Depends on:** P0-01, P0-05
  - **Refs:** Audit §9.5

---

### P2-11 — Bulk option paste

- [ ] **P2-11** Paste multi-line options (label per line; optional `value|label`)
  - **Effort:** S–M
  - **Files:**
    - `components/admin/form-field-editor.tsx`
  - **Acceptance criteria:**
    - [ ] Pasting 20 lines creates 20 options.
  - **Depends on:** P2-02
  - **Refs:** Audit §10 (many options)

---

### P2-12 — Mock file upload in preview

- [ ] **P2-12** Preview mode should not write to production storage
  - **Effort:** M
  - **Files:**
    - `components/admin/form-preview.tsx`
    - `components/conference/fields/field-file.tsx` (preview flag)
  - **Work:**
    1. Pass `previewMode` into renderer/fields.
    2. File field stores fake local blob URL / placeholder path.
  - **Acceptance criteria:**
    - [ ] Preview never uploads to Supabase Storage.
  - **Depends on:** —
  - **Refs:** Audit §10

---

## Phase D — Polish, Accessibility & Performance (P3)

### P3-01 — Builder keyboard accessibility

- [ ] **P3-01** Full keyboard operation of canvas and toolbars
  - **Effort:** L
  - **Files:** All `components/admin/form-*.tsx`, conference-form-builder
  - **Work:**
    1. Field cards as `<button>` or role=button with Enter/Space.
    2. `aria-label` on every icon-only control.
    3. Logical tab order: action bar → palette → canvas → properties.
  - **Acceptance criteria:**
    - [ ] Can select, reorder (via buttons), edit, save without mouse.
  - **Depends on:** P1-04
  - **Refs:** Audit §7.1

---

### P3-02 — Required toggle as accessible switch

- [ ] **P3-02** Use shadcn `Switch` with proper labeling
  - **Effort:** S
  - **Files:**
    - `components/admin/form-field-editor.tsx`
  - **Acceptance criteria:**
    - [ ] Screen reader announces name + state.
  - **Depends on:** —
  - **Refs:** Audit §4, §7

---

### P3-03 — Preview modal a11y

- [ ] **P3-03** Focus trap, Escape, `aria-modal`, restore focus
  - **Effort:** S–M
  - **Files:**
    - `components/admin/form-preview.tsx`
  - **Work:** Prefer shadcn `Dialog` primitive.
  - **Acceptance criteria:**
    - [ ] Focus cannot escape modal; closes on Escape.
  - **Depends on:** P0-08
  - **Refs:** Audit §7.2

---

### P3-04 — Shared public FieldShell a11y

- [ ] **P3-04** Unify label / help / error wiring across all field types
  - **Effort:** M
  - **Files:**
    - `components/conference/fields/*`
  - **Work:**
    1. Shared wrapper: `htmlFor`, `aria-invalid`, `aria-describedby`, `aria-required`.
    2. Migrate text/email/tel/number/select/textarea/toggle/checkbox to match date/url/file quality.
  - **Acceptance criteria:**
    - [ ] Errors announced consistently on all field types.
  - **Depends on:** —
  - **Refs:** Audit §7.3

---

### P3-05 — Replace emoji empty states with Lucide

- [ ] **P3-05** Remove emoji UI icons from builder empty states
  - **Effort:** S
  - **Files:**
    - `components/admin/form-canvas.tsx`
    - `components/admin/form-step-editor.tsx`
    - `components/admin/form-preview.tsx`
    - `components/admin/form-field-palette.tsx` (if any)
  - **Acceptance criteria:**
    - [ ] No emoji used as structural UI icons in form builder.
  - **Depends on:** P1-01
  - **Refs:** Audit §5.1

---

### P3-06 — Standardize on shadcn form controls in builder

- [ ] **P3-06** Replace raw inputs/selects with `Input`, `Label`, `Select`, `Textarea`, `Switch`
  - **Effort:** M
  - **Files:**
    - `form-field-editor.tsx`, `form-step-editor.tsx`, `form-conditional-editor.tsx`, `form-field-palette.tsx`
  - **Acceptance criteria:**
    - [ ] Visual consistency with rest of admin panel.
  - **Depends on:** —
  - **Refs:** Audit §5.2

---

### P3-07 — Cheaper dirty-state tracking

- [ ] **P3-07** Avoid full `JSON.stringify` on every schema change
  - **Effort:** M
  - **Files:**
    - `components/admin/conference-form-builder.tsx`
  - **Work:**
    1. Use dirty flag set on mutations, or hash, or structural compare.
    2. Debounce validation if needed.
  - **Acceptance criteria:**
    - [ ] Typing in properties stays smooth with 50+ fields.
  - **Depends on:** —
  - **Refs:** Audit §8.1

---

### P3-08 — Wire `useFormPerformance` into public renderer

- [ ] **P3-08** Memoize visible-field evaluation in `DynamicFormRenderer` / `DynamicStep`
  - **Effort:** S–M
  - **Files:**
    - `lib/hooks/useFormPerformance.ts`
    - `components/conference/dynamic-form-renderer.tsx`
    - `components/conference/dynamic-step.tsx`
  - **Acceptance criteria:**
    - [ ] Conditional recompute does not re-render unrelated fields unnecessarily.
  - **Depends on:** —
  - **Refs:** Audit §8.3

---

### P3-09 — Virtualize long field lists (optional threshold)

- [ ] **P3-09** Virtualize canvas when step has &gt; 40 fields
  - **Effort:** L
  - **Files:**
    - `components/admin/form-canvas.tsx`
  - **Acceptance criteria:**
    - [ ] 100-field step remains scroll-smooth.
  - **Depends on:** P2-08 (if DnD coexists)
  - **Refs:** Audit §8.2

---

### P3-10 — Prefer-reduced-motion & transition cleanup

- [ ] **P3-10** Honor `prefers-reduced-motion`; avoid `transition-all` where present
  - **Effort:** S
  - **Files:** Form builder + public form components as needed
  - **Acceptance criteria:**
    - [ ] Reduced motion disables non-essential animation.
  - **Depends on:** —
  - **Refs:** Web Interface Guidelines / UX pro max

---

### P3-11 — Preview step jump & validation summary

- [ ] **P3-11** Multi-page preview: jump to step; show per-step error counts
  - **Effort:** M
  - **Files:**
    - `components/admin/form-preview.tsx`
    - `components/conference/dynamic-form-renderer.tsx`
  - **Acceptance criteria:**
    - [ ] Admin can open step 3 without clicking Next twice.
  - **Depends on:** P1-11
  - **Refs:** Audit §10 multi-page

---

### P3-12 — Empty-step publish guard UX

- [ ] **P3-12** Block or strongly discourage publishing steps with zero fields
  - **Effort:** S
  - **Files:**
    - `lib/validation/schema-validation.ts`
    - `components/admin/conference-form-builder.tsx`
  - **Work:**
    1. Escalate empty-step from warning → error, **or** keep warning but surface in P1-12 publish sheet.
  - **Acceptance criteria:**
    - [ ] Admin cannot accidentally ship blank pages without noticing.
  - **Depends on:** P0-07, P1-12
  - **Refs:** Audit §10 empty steps

---

## Cross-cutting checklist (per PR)

Use this on every form-builder PR:

- [ ] Works for first-time empty schema and existing multi-step schema
- [ ] Save Draft and Publish both tested against a real event id
- [ ] Preview order matches canvas order
- [ ] Locked fields still non-deletable / non-optional
- [ ] No new `alert` / `confirm`
- [ ] Icon-only buttons have `aria-label`
- [ ] No emoji used as UI icons
- [ ] Responsive check at 375 / 768 / 1280
- [ ] Update [UI-UX-Analysis.md](./UI-UX-Analysis.md) status notes if a finding is fixed
- [ ] Update progress table at top of this file

---

## Suggested sprint plan

### Sprint 1 — Trust (Phase A)

| Order | IDs | Outcome |
|------:|-----|---------|
| 1 | P0-01, P0-02 | Builder loads and saves correctly |
| 2 | P0-03, P0-04 | Field order fidelity |
| 3 | P0-05, P0-06 | Event-scoped live/draft clarity |
| 4 | P0-07, P0-08 | Fixable errors + non-native dialogs |

### Sprint 2 — First-time success (Phase B core)

| Order | IDs | Outcome |
|------:|-----|---------|
| 1 | P1-02, P1-01, P1-14 | Templates + empty state + coach |
| 2 | P1-05, P1-06, P1-07, P1-08 | Clearer palette |
| 3 | P1-03, P1-04 | Responsive + touch actions |
| 4 | P1-11, P1-12 | Better preview/publish |

### Sprint 3 — Power + canvas (Phase B remainder + Phase C)

| Order | IDs | Outcome |
|------:|-----|---------|
| 1 | P1-09, P1-10, P1-13 | Layout & move & undo |
| 2 | P2-01, P2-02, P2-03 | Conditionals + options |
| 3 | P2-04, P2-05, P2-06, P2-07 | Full field config |
| 4 | P2-08, P2-09 | DnD |

### Sprint 4 — Resilience & polish (Phase C remainder + Phase D)

| Order | IDs | Outcome |
|------:|-----|---------|
| 1 | P2-10, P2-11, P2-12 | History, bulk options, safe preview files |
| 2 | P3-01 … P3-06 | A11y + visual consistency |
| 3 | P3-07 … P3-12 | Performance + multi-page polish |

---

## File ownership map

| Area | Primary files |
|------|----------------|
| Shell / action bar | `components/admin/conference-form-builder.tsx` |
| Palette | `components/admin/form-field-palette.tsx` |
| Canvas | `components/admin/form-canvas.tsx` |
| Properties | `components/admin/form-field-editor.tsx` |
| Steps | `components/admin/form-step-editor.tsx` |
| Conditionals | `form-conditional-editor.tsx`, `EnhancedConditionalEditor.tsx` |
| Templates | `FormTemplateChooser.tsx`, `lib/actions/conference-form-templates.ts` |
| Events | `EventSelector.tsx`, `lib/actions/events.ts` |
| Preview | `form-preview.tsx` |
| Schema I/O | `lib/actions/conference-form-schema.ts` |
| Validation | `lib/validation/schema-validation.ts`, `conditional-engine.ts` |
| Public form | `dynamic-form-renderer.tsx`, `dynamic-step.tsx`, `fields/*` |
| Types | `lib/types/conference-form-schema.ts` |
| Entry page | `app/admin/conference/settings/form-builder/page.tsx` |

---

## Definition of Done (overall initiative)

The Form Builder UI/UX initiative is **done** when:

1. Save Draft and Publish work reliably per event with correct versioning.
2. Canvas order always matches Preview and public registration.
3. First-time admin can start from template or default without reading external docs.
4. Builder is usable at common desktop widths and has a coherent narrow layout.
5. Validation errors are clickable and fixable in-context.
6. Advanced conditionals, file/date config, and option values are available in the UI (not only in types).
7. Keyboard users can complete core edit/save flows.
8. No decorative emoji icons; controls match admin design system.
9. Preview does not side-effect production storage.
10. Version rollback exists for mistaken publishes.

---

## Related docs

- [UI-UX-Analysis.md](./UI-UX-Analysis.md) — full audit findings
- [ADMIN_USER_GUIDE.md](./ADMIN_USER_GUIDE.md) — end-user admin docs (update as UX changes)
- [tasks.md](./tasks.md) — original implementation plan (phases 1–5)
- [PHASE_2_VISUAL_GUIDE.md](./PHASE_2_VISUAL_GUIDE.md) — original builder layout intent
