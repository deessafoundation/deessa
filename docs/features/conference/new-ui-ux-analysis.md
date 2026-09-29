---
title: "Conference Form Builder â€” UI/UX Audit Report"
description: "Scope: Admin form builder at /admin/conference/settings/form-builder"
owner: "deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Conference Form Builder â€” UI/UX Audit Report

**Scope:** Admin form builder at `/admin/conference/settings/form-builder`  
**Code reviewed:** `ConferenceFormBuilder`, palette/canvas/editor/preview/step editors, schema types, validation, public `DynamicFormRenderer`, and Phase 4 components that exist but are not wired in  
**Personas:** First-time admin, power user (multi-event / complex logic), mobile admin (if applicable)  
**Date:** 2026-07-23

---

## Executive Summary

The Conference Form Builder is a solid **three-panel structural foundation** (palette â†’ canvas â†’ properties) with multi-step forms, basic validation, conditional show/hide, draft/publish, and a real-form preview. For a foundation/conference product, that architecture is the right shape.

However, the experience today feels like a **capable Phase 2 MVP with unfinished Phase 4 work sitting beside it**. Several advanced features (templates, enhanced conditionals, event selector, performance hook, file/date config) are implemented as components or types but **not integrated into the live builder**. Meanwhile, first-time flow, reordering fidelity, mobile admin layout, accessibility, and the save/publish path have concrete gaps that will block trust.

### Overall health (by area)

| Area | Score | Snapshot |
|------|-------|----------|
| Onboarding & first impressions | â­â­ | Functional, not guided; empty state is weak |
| Field library | â­â­â­ | Decent type coverage; flat, incomplete config |
| Layout & canvas | â­â­ | No true DnD; order bug risk; not mobile |
| Config panels | â­â­â­ | Clear basics; advanced options missing/unwired |
| Visual design | â­â­â­ | Admin tokens OK; emoji + raw inputs inconsistent |
| Feedback & errors | â­â­â­ | Badges/toasts good; errors not actionable |
| Accessibility | â­â­ | Builder largely inaccessible by keyboard |
| Performance | â­â­ | Fine for small forms; dirty-check & no virtualization |
| Preview & publish | â­â­ | Preview good; publish path / version UX fragile |
| Edge cases | â­â­ | Multi-step works; complex logic half-built |

**Strategic takeaway:** Prioritize **trust & correctness** (save/publish, field order, empty/null schema) and **discoverability** (templates, grouped fields, inline errors) before adding more field types. The product already has more backend capability than the UI exposes.

---

## 1. Onboarding & First Impressions

### Current state

- Entry: Conference Settings â†’ **Form Builder** tab (`settings/layout.tsx`).
- Layout: action bar + fixed 3-column grid (3/6/3).
- Empty canvas: dashed box + emoji + â€œAdd fields from the left panel.â€
- Steps: managed in the **left** panel (`FormStepEditor`), not the canvas.
- Docs/admin guide describe a clearer flow than the UI actually teaches.
- `FormTemplateChooser` exists but is **not mounted** in `ConferenceFormBuilder`.
- `getActiveFormSchema()` can return `null`; the page still passes it as `initialSchema: FormSchema` â†’ likely runtime crash when `schema.steps` is read.

### Pain points

| # | What's wrong | Why it matters | Severity | Suggested improvement |
|---|--------------|----------------|----------|------------------------|
| 1.1 | No first-run empty state with primary CTAs (â€œStart from templateâ€, â€œBlank multi-step formâ€, â€œUse default registrationâ€) | First-time admins donâ€™t know whether to create a step, add a field, or if a form already exists | **High** | Empty state card with 2â€“3 starter paths; wire `FormTemplateChooser` |
| 1.2 | Templates built but not connected | Docs promise templates; UI doesnâ€™t deliver â†’ trust gap | **High** | Mount Templates in action bar; show starter cards on empty schema |
| 1.3 | Null / missing schema not handled | Blank DB state can break the page entirely | **High** | Fallback to a default schema (locked name/email/consent + 1 step) |
| 1.4 | No in-product help (tour, coach marks, â€œHow this worksâ€) | Three-panel builders are power tools; without guidance, time-to-first-field is high | **Medium** | One-time coach: â€œ1 Add step â†’ 2 Add fields â†’ 3 Configure â†’ 4 Preview â†’ 5 Publishâ€ |
| 1.5 | Copy mismatch (docs say Add Step on canvas; UI has it in left panel) | Increases support load and confusion | **Low** | Align docs + add short helper under canvas header |

**Best-in-class ref:** Google Forms opens into an editable blank form with a title and one question; Typeform uses templates as the default start; Airtable Forms starts from an existing table structure.

---

## 2. Field / Component Library

### Current state

- Click-to-add palette with **13 types** (text, textarea, email, tel, number, select, radio, checkbox, toggle, heading, date, url, file).
- Schema also defines **`paragraph`**, but it is **not in the palette** (only a default label exists).
- Flat vertical list; no search, categories, or drag-from-palette.
- Choice fields get default â€œOption 1 / Option 2â€.
- Radio & checkbox both use `CheckSquare` icon.
- Date/file exist in palette and public renderers, but **property UI never edits** `fileUploadConfig` or `dateValidation`.

### Pain points

| # | What's wrong | Why it matters | Severity | Suggested improvement |
|---|--------------|----------------|----------|------------------------|
| 2.1 | Uncategorized long list | Cognitive load; hard to scan for â€œchoiceâ€ vs â€œlayoutâ€ | **Medium** | Groups: Basic Â· Choice Â· Layout Â· Advanced |
| 2.2 | `paragraph` type missing from palette | Schema/docs claim it; admins canâ€™t add informational text blocks | **Medium** | Add Paragraph to palette under Layout |
| 2.3 | Date/file have no builder config | Admins canâ€™t set max size, MIME types, min/max date without code | **High** | Type-specific property sections (file size/types; date min/max) |
| 2.4 | No pattern/regex or default-value UI (schema supports both) | Power users stuck; validation incomplete | **Medium** | Optional â€œAdvanced validationâ€ + default value |
| 2.5 | Identical icons for radio vs checkbox | Discoverability failure | **Low** | Distinct Lucide icons (`Circle` vs `CheckSquare`) |
| 2.6 | Click-only add; no drop target on canvas | Power users expect drag; multi-step targeting is easy to mis-set | **Medium** | Drag type onto step; highlight drop zone |

**Best-in-class ref:** Typeform/Jotform group field types; Tally and Fillout make layout blocks (text, divider) first-class.

---

## 3. Layout & Canvas Interactions

### Current state

- Fields listed as selectable cards per step.
- Reorder: **up/down chevrons** (visible on hover only).
- Delete with `confirm()`; locked fields (`full_name`, `email`, `consent_terms`) protected.
- `GripVertical` imported in canvas but **unused** â€” no drag-and-drop.
- Option rows show grab cursor + grip but **options cannot be reordered**.
- Canvas is **structural**, not a true visual form mock (half-width is a badge only).
- Layout: `grid-cols-12` with no responsive breakpoints â†’ stacked poorly / unusable on small screens.
- **Critical fidelity issue:** new fields always get `order: 0`; canvas reorder only swaps array indices; public `DynamicStep` sorts by `field.order` â†’ **published order may not match the builder**.

### Pain points

| # | What's wrong | Why it matters | Severity | Suggested improvement |
|---|--------------|----------------|----------|------------------------|
| 3.1 | Field `order` not updated on add/reorder | Registrants may see different field order than admin built | **High** | On every reorder/add, rewrite `order` 0..n; sort canvas by `order` |
| 3.2 | No drag-and-drop reordering | Slow for large forms; hover-only controls fail touch | **High** | dnd-kit / sortable list; always-visible drag handle |
| 3.3 | Option grip is non-functional | Looks broken; power users canâ€™t reorder choices | **Medium** | Implement option DnD or remove grip affordance |
| 3.4 | Hover-only field actions | Mobile/trackpad: hard to discover delete/move | **Medium** | Always show on selected; 44px touch targets |
| 3.5 | No move field across steps | Multi-page editing requires delete+recreate | **Medium** | â€œMove to stepâ€¦â€ in properties or DnD between steps |
| 3.6 | Canvas not responsive | Admin on tablet/laptop narrow window is painful | **High** | Collapse to tabs/drawers: Fields \| Canvas \| Properties under `lg` |
| 3.7 | Half-width not visualized | Layout surprises only in Preview | **Low** | Canvas 2-col mock for half-width pairs |

**Best-in-class ref:** Webflow / Framer form builders and Google Forms drag handles; Typeform â€œblockâ€ list with always-visible reorder.

---

## 4. Configuration / Settings Panels

### Current state

**Strengths**

- Clear label, placeholder, help text, required, width.
- Options editor for select/radio/checkbox.
- Min/max selections for checkboxes.
- Length/value validation for text/number.
- Conditional section with plain-language summary.
- Locked-field explanation is excellent.

**Gaps**

- Conditional UI exposes only 4 operators; schema + engine support contains / numeric / nested ANDÂ·OR.
- `EnhancedConditionalEditor` is **not used** (`FormConditionalEditor` is).
- Option **values** not editable (only labels) â€” conditionals compare values, so renaming labels without values confuses logic.
- No UI for file/date advanced config, pattern validation, default values, or calculations (schema has `calculation`).
- Required control is a custom toggle without proper switch semantics.

### Pain points

| # | What's wrong | Why it matters | Severity | Suggested improvement |
|---|--------------|----------------|----------|------------------------|
| 4.1 | Advanced conditionals implemented but unwired | Power users hit a ceiling; code already exists | **High** | Replace with `EnhancedConditionalEditor` + operator tooltips |
| 4.2 | Option values hidden/auto-generated | Conditional rules break when values are opaque | **Medium** | Show value field (auto-slug from label, editable) |
| 4.3 | No file/date property sections | â€œFile Uploadâ€ is half a feature | **High** | Config panels matching public field capabilities |
| 4.4 | Validation errors only at save time in toast | Fixing multi-error forms is hunt-and-peck | **High** | Error list with jump-to-field; inline red borders on bad fields |
| 4.5 | `confirm()` for warnings | Breaks design system; no keyboard-friendly dialog | **Low** | Use shadcn AlertDialog |

**Best-in-class ref:** Airtableâ€™s condition builder (â€œWhere â€¦â€) and Typeform Logic Map for multi-branch visibility.

---

## 5. Visual Design & Consistency

### Current state

- Aligns reasonably with admin chrome: `rounded-xl`, `border-border`, `bg-card`, primary accents.
- Action badges for unsaved / errors / warnings are clear.
- **Inconsistency:** builder uses raw `<input>`/`<select>` + emoji empty states; Phase 4 public fields use shadcn `Input`/`Label` and better a11y.
- Canvas type glyphs mix mono letters and emoji (ðŸ“ž, â˜‘) while palette uses Lucide.

### Pain points

| # | What's wrong | Why it matters | Severity | Suggested improvement |
|---|--------------|----------------|----------|------------------------|
| 5.1 | Emoji as UI icons | Clashes with product polish; accessibility noise | **Medium** | Lucide empty states only |
| 5.2 | Mixed form control systems | Feels unfinished vs rest of admin (shadcn) | **Medium** | Standardize on shared `Input`, `Label`, `Switch`, `Select` |
| 5.3 | Canvas icons inconsistent with palette | Visual language split | **Low** | Same Lucide icons on canvas cards |

---

## 6. Feedback & Error States

### Current state

- Dirty tracking + `beforeunload` warning â€” good.
- Live validation badges (errors/warnings counts).
- Save blocked on invalid; warnings use native confirm.
- Toast success/error on save.
- Preview empty state exists.
- **Weak:** validation messages are multi-line toast text, not navigable.
- Saving draft and publishing share one `isSaving`; button text only says â€œPublishingâ€¦â€.
- After save success, local `schema.version` is **not updated** from server `nextVersion`.
- Preview submit: `alert` + `console.log` â€” developer-centric, not admin-centric.

### Pain points

| # | What's wrong | Why it matters | Severity | Suggested improvement |
|---|--------------|----------------|----------|------------------------|
| 6.1 | Errors not linked to fields | High friction when many issues | **High** | Persistent error panel; click â†’ select field + open properties |
| 6.2 | Publish path / dirty-state after save incomplete | Version badge can lie; admin unsure whatâ€™s live | **High** | Refresh schema from server result; show â€œDraft vN / Live vMâ€ |
| 6.3 | Preview submission feedback is `alert` | Feels broken / unprofessional | **Medium** | Toast + collapsible â€œSample payloadâ€ panel |
| 6.4 | Loading copy inaccurate for draft saves | Minor trust issue | **Low** | â€œSavingâ€¦â€ vs â€œPublishingâ€¦â€ |
| 6.5 | No undo after delete field/step | Destructive with only confirm | **Medium** | Soft-delete + toast Undo (30s) |

---

## 7. Accessibility

### Current state (builder)

- Almost **no** `aria-label` / keyboard handlers on icon-only buttons (move, delete, close, edit).
- Field cards are `<div onClick>` â€” not in tab order, no Enter/Space activation.
- Custom required toggle lacks `role="switch"` / `aria-checked`.
- Hover-only controls fail keyboard and many touch UIs.
- Preview overlay: no evident focus trap, Escape handling, or `aria-modal`.

### Current state (public form â€” related)

- Progress bar has solid `role="progressbar"` + ARIA values.
- Date/URL/file fields use `aria-invalid` / `aria-describedby`.
- Older text/email/etc. fields use labels but often **omit** `aria-invalid` / describedby for errors.
- Radio uses `fieldset`/`legend` and large hit targets â€” good pattern.

### Pain points

| # | What's wrong | Why it matters | Severity | Suggested improvement |
|---|--------------|----------------|----------|------------------------|
| 7.1 | Builder not keyboard operable | Admins using keyboard / AT canâ€™t use core UI | **High** | Buttons for cards; roving tabindex; aria-labels on all icon buttons |
| 7.2 | Preview modal a11y incomplete | Focus can escape; screen readers lose context | **Medium** | Use Dialog primitive with focus trap + Escape |
| 7.3 | Public field a11y inconsistent by type | Some registrants get poorer error announcement | **Medium** | Shared `FieldShell` with label, help, error IDs |
| 7.4 | Color-only required indicator (`*`) | OK if combined with text; ensure not sole cue | **Low** | Keep * + â€œRequiredâ€ in help or aria-required |

---

## 8. Performance

### Current state

- Dirty check: full `JSON.stringify(schema)` on every change.
- Each field update clones/walks the full schema.
- No list virtualization for many fields/options.
- `useFormPerformance` memoizes conditional evaluation but is **not used** by `DynamicFormRenderer`.
- Fine for ~10â€“20 fields; will feel sticky for conference forms with many workshops/options/conditionals.

### Pain points

| # | What's wrong | Why it matters | Severity | Suggested improvement |
|---|--------------|----------------|----------|------------------------|
| 8.1 | Stringify dirty-check every keystroke in properties | Lag on large schemas | **Medium** | Structural dirty flag / hash / `useRef` baseline |
| 8.2 | No virtualization | Long steps jank | **Lowâ€“Medium** | Virtualize when fields > 40 |
| 8.3 | Performance hook unused | Paid engineering cost without benefit | **Medium** | Wire into renderer; optional metrics for debug |

---

## 9. Preview & Publishing Flow

### Current state

- **Preview:** modal, real `DynamicFormRenderer` â€” strong choice.
- No device-size toggle, no â€œopen in new tabâ€, no shareable preview URL.
- **Save Draft / Publish** buttons with disabled states.
- Server action signature: `updateFormSchema(schema, eventId, publish?)`.
- Client calls: `updateFormSchema(schema, publish)` â€” **boolean is passed as `eventId`**.
  - Draft (`false`): falsy â†’ falls back to â€œcurrent eventâ€ (may work).
  - Publish (`true`): truthy non-UUID â†’ queries can fail or mis-target event.
- No event selector in UI despite `EventSelector` component existing.
- No version history / rollback UI in builder.

### Pain points

| # | What's wrong | Why it matters | Severity | Suggested improvement |
|---|--------------|----------------|----------|------------------------|
| 9.1 | Save/publish API call signature mismatch | Publish may fail or attach schema to wrong event | **High** | Pass real `eventId`; fix client call; add tests |
| 9.2 | No multi-event context in builder | Multi-event docs exist; UI is global/current only | **High** | Wire `EventSelector`; scope schema per event |
| 9.3 | Preview lacks device/share modes | Mobile registrant experience untested | **Medium** | Phone/tablet frame + â€œOpen public register URLâ€ |
| 9.4 | Unclear live vs draft | Admins fear â€œbreaking registrationâ€ | **High** | Status chip: Live v3 Â· Editing draft Â· Diff summary before publish |
| 9.5 | No rollback | Mistaken publish is high-stakes for live events | **Medium** | Version list + â€œRestore versionâ€ |

**Best-in-class ref:** Typeformâ€™s dual Preview + Share; Webflowâ€™s Publish with â€œlast publishedâ€ timestamp; Google Forms â€œSendâ€ vs autosave draft model.

**Source evidence:**

```tsx
// components/admin/conference-form-builder.tsx
const result = await updateFormSchema(schema, publish)
```

```ts
// lib/actions/conference-form-schema.ts
export async function updateFormSchema(
  schema: FormSchema,
  eventId: string,
  publish: boolean = false,
): Promise<{ success: boolean; error?: string; version?: number }>
```

---

## 10. Edge Cases

| Scenario | Current behavior | Gap | Severity |
|----------|------------------|-----|----------|
| Many fields (50+) | Long scroll lists, full re-renders | No virtualize, slow dirty check | Medium |
| Many options | Manual add only; no bulk paste | Power-user pain | Medium |
| Conditional branches | Single condition in UI | AND/OR editor exists but unwired; no visual logic map | High |
| Multi-page forms | Steps work well | No step jump in preview; no per-step validation summary | Medium |
| Cross-step conditionals | Engine allows earlier fields | Dependency list is â€œfields before thisâ€; OK if order correct | Low if order fixed |
| Empty steps | Warning only | Can publish awkward empty pages | Low |
| Locked core fields | Clear lock UX | Good | â€” |
| Null schema / no event | Likely crash / failed save | Must handle | High |
| File uploads in preview | Real upload path may hit storage | Preview should mock uploads | Medium |
| Field order vs canvas | Sort by `order` on public form | **Order bug** | High |

---

## Persona Walkthroughs

### First-time user

1. Finds Form Builder tab â€” OK.
2. Sees three dense panels with little explanation â€” **friction**.
3. Must create a step before fields unlock â€” **non-obvious** if schema empty.
4. No templates on screen despite docs.
5. Preview helps; publish confidence low without live/draft clarity.

### Power user

1. Multi-step + conditionals appreciated.
2. Hits walls: no AND/OR UI, no move-across-steps, no bulk options, no value editing, no version history.
3. Discovers grip handles that donâ€™t drag â€” **trust damage**.
4. Enhanced tools exist in repo but not productized â€” **internal waste**.

### Mobile / narrow admin

1. Fixed 12-column layout does not adapt.
2. Hover-only actions and small hit targets fail.
3. Effectively **desktop-only**; treat mobile admin as unsupported until responsive redesign.

---

## Prioritized Recommendations (Top 10)

| Priority | Recommendation | Impact | Effort (est.) |
|----------|----------------|--------|----------------|
| **P0** | Fix `updateFormSchema(schema, eventId, publish)` client call + null schema fallback | Unblocks trust / live events | S |
| **P0** | Persist & sync `field.order` on add/reorder; sort builder by order | Canvas = public form | S |
| **P1** | Responsive builder: tab/drawer layout under `lg`; always-visible actions | Mobile + laptop usability | M |
| **P1** | Actionable validation panel (click error â†’ select field) | Faster fix loops | M |
| **P1** | Wire templates + first-run empty state | Time-to-first-form | M |
| **P1** | Live vs draft status + refresh version after save | Publish confidence | M |
| **P2** | Real DnD for fields & options (or remove fake grips) | Power-user speed | M |
| **P2** | Wire `EnhancedConditionalEditor` + editable option values | Complex forms | M |
| **P2** | File/date property config UI | Complete advertised field types | M |
| **P3** | A11y pass (keyboard, aria, Dialog preview) + shadcn control consistency | Inclusion + polish | Mâ€“L |

---

## Before / After Mockup Suggestions

### A. First-run empty state (before â†’ after)

**Before:** Dashed box, emoji, â€œNo steps yet / Add fields from the left.â€

**After:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Build your registration form                               â”‚
â”‚  Choose a starting point. You can fully edit everything.    â”‚
â”‚                                                             â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”‚
â”‚  â”‚ âœ¨ Template  â”‚  â”‚ ðŸ“‹ Default   â”‚  â”‚ ï¼‹ Blank     â”‚     â”‚
â”‚  â”‚ Workshop /   â”‚  â”‚ Conference   â”‚  â”‚ Start empty  â”‚     â”‚
â”‚  â”‚ Seminar â€¦    â”‚  â”‚ registration â”‚  â”‚              â”‚     â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â”‚
â”‚                                                             â”‚
â”‚  Tip: Forms are multi-step. Add a step, then drop fields.   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### B. Action bar (after)

```
[ Event: Spring Summit â–¾ ]  Live v3 Â· Editing unsaved   [ Templates ]
[ Preview â–¾ ]  [ Save draft ]  [ Publishâ€¦ ]
```

Publish opens a confirm sheet: field count, step count, warnings, â€œWhat registrants will see.â€

### C. Canvas field card (after)

```
â ¿  [Icon] Full name * ðŸ”’          â†‘ â†“  ðŸ—‘
         text Â· required Â· core
```

- Drag handle always visible
- Selected: properties drawer opens (right on desktop, bottom sheet on mobile)

### D. Conditional logic (after â€” Typeform/Airtable style)

```
Show this field when:
  [ Attendance mode â–¾ ]  [ equals â–¾ ]  [ In-person â–¾ ]
  [ + Add condition ]   Logic: ( AND â—‹ OR )
```

### E. Responsive (after)

| Breakpoint | Layout |
|------------|--------|
| â‰¥1280px | 3-column as today |
| 768â€“1279 | Canvas center; palette & properties as slide-overs |
| <768 | Bottom nav: Steps Â· Build Â· Settings Â· Preview |

---

## Best-in-Class References

| Product | Steal this |
|---------|------------|
| **Google Forms** | Instant blank form; autosave; simple question types; always-clear structure |
| **Typeform** | Block-based flow, logic map, strong preview, template-first onboarding |
| **Airtable Forms** | Condition builder language (â€œwhere field isâ€¦â€), tight data model alignment |
| **Tally / Fillout** | Modern field palette groups, layout blocks, delightful empty states |
| **Jotform** | Dense power-user field library with search |

---

## Whatâ€™s Working Well (keep)

1. **Three-panel mental model** â€” industry-standard and learnable.
2. **Locked core fields** with explanation â€” legally/system-critical UX done right.
3. **Preview using the real public renderer** â€” reduces WYSIWYG drift.
4. **Schema validation** (duplicates, condition direction, circular deps) â€” strong foundation.
5. **Unsaved-changes guard** (`beforeunload` + badge).
6. **Multi-step organization** as a first-class concept (not an afterthought).
7. **Plain-language conditional summary** when logic is enabled.

---

## Suggested Implementation Phases

**Phase A â€” Trust (1 sprint)**  
P0 save/event fix, null schema, field `order` sync, live/draft chip.

**Phase B â€” Usability (1â€“2 sprints)**  
Responsive layout, templates + empty state, error jump list, DnD or honest up/down UX.

**Phase C â€” Power (1â€“2 sprints)**  
Enhanced conditionals, file/date config, option values, version history, a11y pass.

---

## Key source files reviewed

| Area | Path |
|------|------|
| Main builder | `components/admin/conference-form-builder.tsx` |
| Palette | `components/admin/form-field-palette.tsx` |
| Canvas | `components/admin/form-canvas.tsx` |
| Properties | `components/admin/form-field-editor.tsx` |
| Steps | `components/admin/form-step-editor.tsx` |
| Conditionals (wired) | `components/admin/form-conditional-editor.tsx` |
| Conditionals (unwired) | `components/admin/conference-form-builder/EnhancedConditionalEditor.tsx` |
| Templates (unwired) | `components/admin/conference-form-builder/FormTemplateChooser.tsx` |
| Preview | `components/admin/form-preview.tsx` |
| Public renderer | `components/conference/dynamic-form-renderer.tsx`, `dynamic-step.tsx` |
| Schema types | `lib/types/conference-form-schema.ts` |
| Validation | `lib/validation/schema-validation.ts` |
| Save/publish | `lib/actions/conference-form-schema.ts` |
| Page entry | `app/admin/conference/settings/form-builder/page.tsx` |

---

## Audit note

This review is based on **code and docs as implemented**, not a live click-through in a browser. Findings that depend on runtime (e.g. exact publish failure mode with boolean `eventId`) should be verified once against a staging event, but the client/server signature mismatch is unambiguous in source.
