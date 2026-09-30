# Foundation Name Consistency - Rename Analysis

**Date:** 2026-09-18
**Correct Name:** `deessa` (lowercase, always)
**Website:** `deessafoundation.com`
**Status:** Audit Complete - Awaiting Implementation

---

## Rule

**Every instance of the foundation name must be `deessa` (lowercase).** No "Deesha", no "DEESSA", no "Deessa", no "deesa". The only exceptions are:

- React component names (PascalCase required by convention): `DeessaCompanionPage`
- HTTP User-Agent strings (no spaces allowed): `DeessaFoundation/1.0`
- File paths that must match actual filenames on disk

---

## Summary

| Pattern | Occurrences | Fix Type |
|---------|-------------|----------|
| `"Deesha Foundation"` (wrong 'h') | ~140 | Simple replace |
| `"deesha"` (wrong 'h') in code logic | ~5 | Simple replace (not deployed yet) |
| `"deesha.org"` (wrong domain, should be deessafoundation.com) | ~8 | Simple replace |
| `"deeshafoundation.org"` (wrong domain + spelling) | 2 | Simple replace |
| `"DEESSA"` (all caps) | ~130 | Simple replace |
| `"Deessa"` (capitalized D) | ~18 | Simple replace |
| `"deesa-resources"` (missing 's') | 1 dir + refs | **File rename + refactor** |
| `"Deesha Team"` in docs frontmatter | 100+ files | Simple replace |

**Total: ~300+ occurrences across ~80+ files**

The ONLY thing needing refactor is the directory rename (`deesa-resources` -> `deessa-resources`). Everything else is safe find-and-replace.

---

## SECTION 1: CRITICAL - SEO and Metadata

These affect Google indexing and browser tabs. Change `SITE_NAME` and `ORGANIZATION_NAME` constants first - they cascade to many pages.

### `lib/seo/metadata-utils.ts`

| Line | Current | Replacement |
|------|---------|-------------|
| 11 | `const SITE_NAME = 'Deesha Foundation'` | `const SITE_NAME = 'deessa Foundation'` |
| 96 | `authors: author ? [author] : ['Deesha Foundation']` | `... : ['deessa Foundation']` |

### `lib/seo/structured-data.ts`

| Line | Current | Replacement |
|------|---------|-------------|
| 125 | `const ORGANIZATION_NAME = 'Deesha Foundation'` | `const ORGANIZATION_NAME = 'deessa Foundation'` |
| 136 | `alternateName: 'DEESSA Foundation'` | `alternateName: 'deessa Foundation'` |

### `app/layout.tsx`

| Line | Current | Replacement |
|------|---------|-------------|
| 18 | `"Deesha Foundation - Empowering Nepal Through Education & Social Development"` | `"deessa Foundation - ..."` |
| 19 | `"%s \| Deesha Foundation"` | `"%s \| deessa Foundation"` |
| 35 | `authors: [{ name: "Deesha Foundation" }]` | `[{ name: "deessa Foundation" }]` |
| 36 | `creator: "Deesha Foundation"` | `"deessa Foundation"` |
| 37 | `publisher: "Deesha Foundation"` | `"deessa Foundation"` |
| 53 | `siteName: "Deesha Foundation"` | `"deessa Foundation"` |
| 54 | `title: "Deesha Foundation - Empowering Nepal"` | `"deessa Foundation - ..."` |
| 62 | `alt: "Deesha Foundation - Empowering Nepal"` | `"deessa Foundation - ..."` |
| 68 | `title: "Deesha Foundation - Empowering Nepal"` | `"deessa Foundation - ..."` |

### Public Page Metadata

| File | Line | Current | Replacement |
|------|------|---------|-------------|
| `app/(public)/page.tsx` | 28 | `"Deesha Foundation - Empowering..."` | `"deessa Foundation - ..."` |
| `app/(public)/about/page.tsx` | 10 | `"Who We Are - About Deesha Foundation"` | `"...deessa Foundation"` |
| `app/(public)/about/page.tsx` | 12 | `"Learn about Deesha Foundation..."` | `"...deessa Foundation..."` |
| `app/(public)/about/page.tsx` | 15 | `"about Deesha Foundation"` | `"about deessa Foundation"` |
| `app/(public)/contact/page.tsx` | 12 | `"...Deesha Foundation"` | `"...deessa Foundation"` |
| `app/(public)/contact/page.tsx` | 13 | `"...Deesha Foundation..."` | `"...deessa Foundation..."` |
| `app/(public)/contact/page.tsx` | 16 | `"contact Deesha Foundation"` | `"contact deessa Foundation"` |
| `app/(public)/stories/page.tsx` | 15 | `"...Deesha Foundation..."` | `"...deessa Foundation..."` |
| `app/(public)/stories/[slug]/page.tsx` | 68 | `authors: ['Deesha Foundation']` | `['deessa Foundation']` |
| `app/(public)/events/page.tsx` | 29 | `"...Deesha Foundation..."` | `"...deessa Foundation..."` |

### Conference Pages (DEESSA -> deessa)

| File | Line | Current | Replacement |
|------|------|---------|-------------|
| `app/(public)/conference/page.tsx` | 33 | `"DEESSA National Conference 2026 \| DEESSA Foundation"` | `"deessa National... \| deessa Foundation"` |
| `app/(public)/conference/page.tsx` | 35 | `"...DEESSA National Conference 2026..."` | `"...deessa National..."` |
| `app/(public)/conference/page.tsx` | 55 | `"DEESSA National Conference 2026"` | `"deessa National..."` |
| `app/(public)/conference/register/page.tsx` | 5 | `"Register \| DEESSA National Conference 2026"` | `"...deessa National..."` |
| `app/(public)/conference/register/page.tsx` | 7 | `"...DEESSA National Conference 2026..."` | `"...deessa National..."` |
| `app/(public)/conference/register/success/page.tsx` | 6 | `"...DEESSA National Conference 2026"` | `"...deessa National..."` |
| `app/(public)/conference/register/success/page.tsx` | 32 | `"DEESSA-2026-????"` | `"deessa-2026-????"` |
| `app/(public)/conference/register/pending-payment/page.tsx` | 229 | `DEESSA Foundation` | `deessa Foundation` |
| `app/(public)/conference/register/pending-payment/page.tsx` | 255 | `DEESSA National Conference 2026` | `deessa National...` |
| `app/(public)/conference/register/payment-success/page.tsx` | 141 | `"...DEESSA National Conference 2026."` | `"...deessa National..."` |
| `app/(public)/conference/register/payment-options/page.tsx` | 84 | `DEESSA Foundation` | `deessa Foundation` |
| `app/(public)/conference/register/failure/page.tsx` | 12 | `"...DEESSA National Conference 2026"` | `"...deessa National..."` |
| `app/(public)/conference/register/failure/page.tsx` | 91 | `DEESSA National Conference 2026.` | `deessa National...` |

### Other Public Pages (DEESSA -> deessa)

| File | Line | Current | Replacement |
|------|------|---------|-------------|
| `app/(public)/programs/page.tsx` | 8 | `"Programs - DEESSA Foundation"` | `"...deessa Foundation"` |
| `app/(public)/programs/page.tsx` | 22 | `DEESSA FOUNDATION` | `deessa FOUNDATION` |
| `app/(public)/podcasts/page.tsx` | 59 | `DEESSA Voices: Stories of Resilience` | `deessa Voices: ...` |
| `app/(public)/whatwedo/[slug]/page.tsx` | 36 | `... \| DEESSA Foundation` | `... \| deessa Foundation` |
| `app/(public)/events/[slug]/page.tsx` | 692 | `Stay connected with Deessa Foundation` | `...deessa Foundation` |
| `app/(public)/stories/[slug]/page.tsx` | 144 | `DEESSA Foundation` | `deessa Foundation` |
| `app/(public)/complete-payment/page.tsx` | 156, 264 | `DEESSA Foundation` | `deessa Foundation` |
| `app/(public)/complete-payment/page.tsx` | 280 | `DEESSA National Conference 2026` | `deessa National...` |
| `app/(public)/events/[slug]/register/pending-payment/page.tsx` | 247 | `DEESSA Foundation` | `deessa Foundation` |
| `app/(public)/events/[slug]/register/payment-options/page.tsx` | 109 | `DEESSA Foundation` | `deessa Foundation` |

### Demo Pages (DEESSA -> deessa)

| File | Line | Current | Replacement |
|------|------|---------|-------------|
| `app/(public)/demo/programs/page.tsx` | 5 | `"...DEESSA Foundation"` | `"...deessa Foundation"` |
| `app/(public)/demo/deessa-companion/page.tsx` | 5 | `"...DEESSA Foundation"` | `"...deessa Foundation"` |
| `app/(public)/demo/community-outreach/page.tsx` | 5 | `"...DEESSA Foundation"` | `"...deessa Foundation"` |
| `app/(public)/demo/1000-families/page.tsx` | 6, 9 | `"...DEESSA Foundation"` | `"...deessa Foundation"` |
| `app/(public)/demo/aac-support/page.tsx` | 6, 9 | `"...DEESSA Foundation"` | `"...deessa Foundation"` |

---

## SECTION 2: HIGH - Code Logic (Requires Migration)

### `components/events/admin/EventFormBuilder/SchemaImportExport.tsx`

| Line | Current | Replacement |
|------|---------|-------------|
| 29 | `deesha_form_schema: boolean` | `deessa_form_schema: boolean` |
| 44 | `deesha_form_schema: true` | `deessa_form_schema: true` |
| 82 | `if (!data.deesha_form_schema)` | `if (!data.deessa_form_schema)` |
| 83 | `"This is not a valid Deesha form schema file."` | `"...deessa..."` |

**NOT DEPLOYED YET:** Only one event created, no exported schemas in production. Simple replace is safe.

### `lib/types/accessibility.ts` - localStorage key

| Line | Current | Replacement |
|------|---------|-------------|
| 228 | `KEY: 'deesha-a11y-preferences'` | `KEY: 'deessa-a11y-preferences'` |

**NOT DEPLOYED YET:** Feature was built yesterday and hasn't gone to production. Simple replace is safe.

**Also update:**
- `app/(public)/demo/accessibility-test/page.tsx` (lines 499, 508)
- ~20 docs files in `docs/in-progress/accessibility-feature/`

### `components/admin/homepage-manager/components/SEOManager.tsx`

| Line | Current | Replacement |
|------|---------|-------------|
| 98 | `https://deeshafoundation.org` | `https://deessafoundation.com` |

---

## SECTION 3: Email Templates (DEESSA -> deessa)

~60+ occurrences across all email files. All sender names, subjects, body content, and footers.

### Files to update:

- `lib/email/conference-mailer.ts` (lines 56, 58, 94, 96, 122, 124, 162, 178, 194, 246, 256, 258, 273, 283, 285)
- `lib/email/contact-mailer.ts` (lines 111, 155, 173, 176, 204, 217, 219)
- `lib/email/support-mailer.ts` (lines 165, 260, 263, 291, 304)
- `lib/email/support-reply.ts` (lines 18, 29)
- `lib/email/support-assignment.ts` (line 41)
- `lib/email/support-unassignment-mailer.ts` (line 35)
- `lib/email/support-reassignment-mailer.ts` (lines 60, 66)
- `lib/email/receipt-mailer.ts` (line 68)
- `lib/email/event-mailer.ts` (lines 48, 268)
- `lib/email/templates/receipt.ts` (lines 71, 83, 101, 122, 225, 240, 322)
- `lib/email/templates/conference-cancellation.ts` (lines 28, 40, 66, 156)
- `lib/email/templates/conference-registration.ts` (lines 35, 47, 72, 181)
- `lib/email/templates/conference-confirmation.ts` (lines 30, 41, 53, 71, 94, 194)
- `lib/email/templates/default-event-templates.ts` (lines 25, 31, 591)
- `lib/email/templates/support-assignment.ts` (lines 60, 183)
- `lib/email/templates/support-unassignment.ts` (lines 51, 156)
- `lib/email/templates/support-reply.ts` (lines 27, 50, 134)
- `lib/email/templates/support-reassignment.ts` (lines 73, 222)
- `lib/conference-settings-defaults.ts` (lines 49, 98, 99, 111, 112, 126, 127)
- `lib/actions/conference-registration.ts` (line 340)
- `app/api/events/resend-payment-link/route.ts` (line 192)

---

## SECTION 4: Components (DEESSA/Deessa -> deessa)

| File | Line | Current | Replacement |
|------|------|---------|-------------|
| `components/conference/step4-review.tsx` | 149, 160 | `DEESSA Foundation` | `deessa Foundation` |
| `components/conference/step1-personal-details.tsx` | 100 | `"e.g. DEESSA Inc."` | `"e.g. deessa Inc."` |
| `components/conference/conference-registration-form.tsx` | 142 | `DEESSA Foundation` | `deessa Foundation` |
| `components/admin/reply-modal.tsx` | 37, 38, 57, 60, 84, 92, 95, 118 | `DEESSA Foundation` | `deessa Foundation` |
| `components/admin/story-form.tsx` | 175 | `DEESSA Foundation - Admin Preview` | `deessa Foundation - Admin Preview` |
| `components/admin/conference-settings-form.tsx` | 213, 671 | `DEESSA` | `deessa` |
| `components/admin/conference-quick-actions.tsx` | 280 | `DEESSA` | `deessa` |
| `components/events/admin/EmailTemplateEditor.tsx` | 98 | `"DEESSA-2026-ABC123"` | `"deessa-2026-ABC123"` |
| `components/events/public/event-registration-form.tsx` | 391, 1034, 1047 | `Deessa Foundation` | `deessa Foundation` |
| `components/podcasts/podcast-main-hero.tsx` | 59 | `DEESSA Voices:` | `deessa Voices:` |
| `components/programs/demo/ProgramDemos.tsx` | 93 | `DEESSA / PROGRAM DESIGN EXPLORATIONS` | `deessa / PROGRAM DESIGN EXPLORATIONS` |
| `lib/payments/bank-details.ts` | 31, 40 | `"Deessa Foundation"` | `"deessa Foundation"` |

---

## SECTION 5: Documentation

### 5.1 Docs frontmatter: `owner: "Deesha Team"`

**100+ files** in `docs/` contain `owner: "Deesha Team"`. Replace with `owner: "deessa Team"`.

### 5.2 API docs domain: `deesha.org` -> `deessafoundation.com`

| File | Lines | Current | Replacement |
|------|-------|---------|-------------|
| `docs/api/README.md` | 2, 3, 10, 14 | `Deesha Foundation` | `deessa Foundation` |
| `docs/api/README.md` | 19, 20 | `deesha.org` | `deessafoundation.com` |
| `docs/api/conventions.md` | 3, 12 | `Deesha Foundation` | `deessa Foundation` |
| `docs/api/conventions.md` | 237, 238 | `deesha.org` | `deessafoundation.com` |
| `docs/api/auth.md` | 2, 14 | `Deesha Foundation` | `deessa Foundation` |
| `docs/api/openapi.yaml` | 3, 6, 14 | `Deesha Foundation` | `deessa Foundation` |
| `docs/api/openapi.yaml` | 15, 18, 21, 23 | `deesha.org` | `deessafoundation.com` |

### 5.3 Other docs with "Deesha Foundation" body text

- `docs/architecture/security-vulnerabilities.md`
- `docs/architecture/currency-handling.md`
- `docs/operations/database-migration.md` (lines 4, 24, 81)
- `docs/api/admin/settings.md` (line 144)

### 5.4 Conference docs (DEESSA -> deessa)

All files in `docs/features/conference/` use "DEESSA" extensively:
- `README.md`, `00-executive-summary.md` through `11-appendix.md`
- ~60+ occurrences across headings, body text, tables, and code examples

### 5.5 Other docs with DEESSA

- `docs/features/events/` (~10 occurrences)
- `docs/features/story-editor/` (~10 occurrences)
- `docs/archive/story-editor/` (~5 occurrences)
- `docs/in-progress/programs-cms/archive/` (~5 occurrences)
- `docs/operations/README.md` (lines 3, 12)

---

## SECTION 6: CSS Comments

| File | Line | Current | Replacement |
|------|------|---------|-------------|
| `app/globals.css` | 33 | `DEESSA FOUNDATION - OCEAN BLUE THEME` | `deessa FOUNDATION - OCEAN BLUE THEME` |
| `components/programs/demo/programs.module.css` | 4, 6, 19 | `DEESSA` (in comments) | `deessa` |

---

## SECTION 7: File and Directory Renames

### 7.1 `public/deesa-resources/` directory (missing 's')

**Current:** `public/deesa-resources/`
**Target:** `public/deessa-resources/`

**Files inside (20 files):** All stay the same except:
- `General Concept Note- deeSsa Foundation .pdf` -> `General Concept Note- deessa Foundation.pdf`

**Code references to update:**
- `components/footer.tsx` lines 39-41: `/deesa-resources/...` -> `/deessa-resources/...`
- `components/resource-downloads.tsx` line 31: `/deesa-resources/...` -> `/deessa-resources/...`

### 7.2 PDF filename with random casing

- `General Concept Note- deeSsa Foundation .pdf` -> `General Concept Note- deessa Foundation.pdf`

---

## SECTION 8: Domain Fixes

| File | Line | Current | Replacement |
|------|------|---------|-------------|
| `test-url-detection.js` | 53, 56, 61, 64 | `deessafoundation.org` | `deessafoundation.com` |
| `components/admin/homepage-manager/components/SEOManager.tsx` | 98 | `deeshafoundation.org` | `deessafoundation.com` |

---

## Implementation Plan

### Phase 1: Simple find-and-replace (no migration needed)

**Step 1 - SEO constants (cascading fix):**
1. `lib/seo/metadata-utils.ts` - SITE_NAME
2. `lib/seo/structured-data.ts` - ORGANIZATION_NAME

**Step 2 - Root layout:**
3. `app/layout.tsx` - all 9 occurrences

**Step 3 - Public page metadata:**
4. All 6 public page files (about, contact, stories, events, home, story slug)

**Step 4 - All DEESSA -> deessa in source code:**
5. Conference pages (~13 files)
6. Other public pages (~8 files)
7. Demo pages (~5 files)
8. Email templates (~20 files)
9. Components (~12 files)

**Step 5 - Documentation:**
10. Bulk replace `owner: "Deesha Team"` -> `owner: "deessa Team"` (100+ files)
11. Replace `Deesha Foundation` -> `deessa Foundation` in docs body text
12. Replace `deesha.org` -> `deessafoundation.com` in API docs
13. Replace `DEESSA` -> `deessa` in conference/event/story docs

**Step 6 - CSS comments:**
14. `app/globals.css` and `programs.module.css`

**Step 7 - Domain fixes:**
15. `test-url-detection.js` - `.org` -> `.com`
16. `SEOManager.tsx` - `deeshafoundation.org` -> `deessafoundation.com`

**Step 8 - Accessibility key (not deployed yet, safe to replace):**
17. `lib/types/accessibility.ts` - simple replace
18. `app/(public)/demo/accessibility-test/page.tsx` - update references
19. ~20 docs files in `docs/in-progress/accessibility-feature/`

**Step 9 - Schema import/export (not deployed yet, safe to replace):**
20. `components/events/admin/EventFormBuilder/SchemaImportExport.tsx` - simple replace

### Phase 2: File/directory rename

**Step 10 - Directory rename:**
21. Rename `public/deesa-resources/` -> `public/deessa-resources/`
22. Update `components/footer.tsx` (3 refs)
23. Update `components/resource-downloads.tsx` (1 ref)
24. Rename PDF: `General Concept Note- deeSsa Foundation .pdf`

### Phase 4: Verification

25. `npm run build` - ensure no broken imports
26. `npm run lint` - check for issues
27. Search for any remaining `Deesha`, `DEESSA`, `Deessa`, `deesa` occurrences
28. Test public pages render correct metadata
29. Test schema import/export with both old and new keys
30. Test accessibility preferences with migration

---

## Quick Verification Commands

```bash
# Find remaining wrong spellings
rg -i "deesha" --type-add 'web:*.{ts,tsx,js,jsx,html,css,json,yaml,yml,md}' -t web

# Find remaining DEESSA (should only be in node_modules after fix)
rg "DEESSA" --type-add 'web:*.{ts,tsx,js,jsx}' -t web

# Find remaining Deessa (should only be in exceptions)
rg "Deessa" --type-add 'web:*.{ts,tsx,js,jsx}' -t web

# Find deesa (missing s)
rg -i "deesa[^s]" --type-add 'web:*.{ts,tsx,js,jsx,html,css,json,yaml,yml,md}' -t web
```

---

## Risk Assessment

| Change | Risk | Mitigation |
|--------|------|------------|
| SEO metadata text | LOW | Visual verification after deploy |
| localStorage key | NONE | Not deployed yet, safe to replace |
| Schema import key | NONE | Not deployed yet, safe to replace |
| Directory rename | LOW | Redirects + update all references |
| Email sender names | LOW | Just branding change |
| Docs frontmatter | NONE | Internal metadata only |
| Domain in docs | LOW | Documentation only |
| Bank account names | LOW | Changed to match legal records |
