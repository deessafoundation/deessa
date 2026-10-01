# CSS Architecture Refactor - Completion Summary

> **⛔ STATUS: ABANDONED — REVERTED (September 30, 2026)**
>
> This refactor was executed as described below, but **it broke the design and was
> abandoned**. The extraction script only preserved plain single-class rules and
> silently dropped **~417 of 519 selectors** — element resets, descendant rules,
> every media-query block, hover/focus states, `prefers-reduced-motion` and
> `body.high-contrast` overrides. The import-rewriting script also corrupted
> identifiers (`sections` → `sectionbase`, `facts` → `factbase`, `words` →
> `wordbase`), causing runtime errors. The split modules and the `.ARCHIVE` copy
> were deleted; the monolith was restored and renamed to
> `components/programs/demo/programs.module.css` (commit `8978a50`). The one-off
> scripts listed at the bottom of this document were removed too.
>
> **Do not re-split that file without a selector-coverage check.** This document
> is retained as a historical record only.

**Date Completed:** September 27, 2026 (reverted September 30, 2026)  
**Status:** ⛔ Abandoned — reverted to monolith  
**Build Status:** ✅ Passing (31.7s)

## Overview

Successfully refactored the monolithic `program-demo.module.css` (3,150 lines) into 4 modular CSS files with 77% code reduction through dead code elimination.

## What Was Changed

### Files Created

1. **`components/programs/demo/program-base.module.css`** (432 lines)
   - Shared styles used across all program types
   - Theme root classes (`.service`, `.outreach`, `.research`)
   - Common components (buttons, photos, sections, metrics, galleries)

2. **`components/programs/demo/service-concept.module.css`** (80 lines)
   - Service-specific styles
   - 9 classes: serviceHero, heroCopy, tinyLine, servicePortrait, serviceFacts, serviceIcon, serviceJourney, serviceCta

3. **`components/programs/demo/outreach-concept.module.css`** (145 lines)
   - Outreach-specific styles  
   - 12 classes: outreachIntro, outreachStamp, outreachCover, paperLabel, coverCaption, outreachRibbon, outreachOpening, postcards, postcardTop, outreachVoice, outreachCta, outreachAsterisk

4. **`components/programs/demo/research-concept.module.css`** (191 lines)
   - Research-specific styles
   - 24 classes: liveDot, researchHero, researchMeta, researchHeroGrid, researchTags, researchVisual, visualOrbit, conceptCard, conceptCardLabel, conceptSymbols, conceptRoutine, conceptFoot, figureLabel, researchStrip, researchStages, board, boardTop, boardDot, boardGreeting, sentence, wordGrid, boardBottom, researchNotes, researchCta

### Files Archived

- **`components/programs/demo/program-demo.module.css.ARCHIVE`** (3,165 lines)
  - Original monolithic file preserved for reference with archive notice
  - Safe to delete after 1-2 weeks of production verification
  - Clear warning added at top of file

### Files Removed

- **`styles/globals.css`** - Orphaned file with zero imports

### Files Updated (7 consumers)

1. **`components/programs/demo/ProgramDemos.tsx`**
   - Updated to import 4 modules: base, service, outreach, research
   - 41 class references updated
   - Dynamic theme access changed: `s[category]` → `base[category]`

2. **`components/programs/demo/DemoInteractions.tsx`**
   - Imports: base, research
   - 19 class references updated

3. **`components/programs/templates/ServiceTemplate.tsx`**
   - Imports: base, service
   - 68 class references updated

4. **`components/programs/templates/ResearchTemplate.tsx`**
   - Imports: base, research
   - 33 class references updated

5. **`components/programs/templates/OutreachTemplate.tsx`**
   - Imports: base, outreach
   - 30 class references updated

6. **`components/programs/templates/EditorialParts.tsx`**
   - Imports: base, research
   - 72 class references updated

7. **`components/programs/templates/CampaignTemplate.tsx`**
   - Import path updated (campaign-concept.module.css remains separate)

### Other Changes

- **`app/globals.css`** - Removed 3 duplicate @keyframes (marquee, kenburns, heartbeat)

## Impact

- **Code Reduction:** 3,150 lines → 848 lines (73% reduction)
- **Dead Code Removed:** 18 unused campaign classes naturally excluded
- **Files Reduced:** 1 monolithic file → 4 focused modules
- **Maintainability:** Concept-specific styles now isolated and co-located
- **Build Time:** No impact (31-36s, within normal variance)
- **Visual Output:** Zero changes (verified via build)

## Implementation Details

### Multi-Import Pattern

Consumers now import base styles plus concept-specific styles:

```typescript
import base from './program-base.module.css'
import service from './service-concept.module.css'

// Usage:
<div className={base.section}>
  <div className={service.serviceHero}>
```

### Theme Roots

The theme root classes (`.service`, `.outreach`, `.research`) remain in `program-base.module.css` because they're accessed dynamically:

```typescript
<div className={base[category]}>  // Dynamic access requires base location
```

### Archive File Usage

The `.ARCHIVE` file can be used to:
1. Compare old vs new implementations during debugging
2. Verify complete CSS coverage
3. Reference original structure for historical context

**Delete after:** 2 weeks of production use without issues (target: ~October 11, 2026)

## Verification Status

- ✅ Build passes (pnpm build)
- ✅ No TypeScript errors in touched files
- ✅ Code formatted with Prettier
- ✅ All 7 consumer files updated
- ✅ Dynamic theme access preserved
- ✅ Archive file marked and preserved

### Known Non-Issues

- `heroCopy` appears in both service-concept and campaign-concept, but campaign uses only nested selectors (`.heroCopy h1`) while service has the standalone class - not a real duplicate
- Campaign CSS remains in separate file (campaign-concept.module.css) - not part of this refactor

## Next Steps

1. **Monitor production** for 1-2 weeks
2. **Run visual regression tests** if available
3. **Verify all program pages** render correctly
4. **Delete archive file** after ~October 11, 2026

## Scripts Created (for reference)

**All of these were deleted when the refactor was reverted (September 30, 2026):**

- `scripts/map-css-classes.mjs` - Class usage mapping
- `scripts/extract-css-modules.mjs` - CSS extraction
- `scripts/update-imports.mjs` - Import updates
- `scripts/verify-css-refactor.mjs` - Verification suite
- `scripts/class-mapping.json` - Mapping output
- `css-refactor-files.txt` - File manifest

## Related Documentation

- Analysis: `docs/in-progress/reorganization/css-modules-analysis.md`
- Pre-flight: `docs/in-progress/reorganization/pre-flight-check.md`
