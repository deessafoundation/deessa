# App Directory CSS Files Analysis

**Date:** September 27, 2026  
**Status:** Analysis complete, action required

## Current State

The `/app` directory contains 3 CSS files:

| File | Lines | Size | Status | Imported? |
|------|-------|------|--------|-----------|
| `globals.css` | 3,885 | 101 KB | ✅ Active | Yes (layout.tsx) |
| `print-styles.css` | 337 | 7 KB | ⚠️ Orphaned | **No** |
| `public-accessibility.css` | 283 | 8.6 KB | ⚠️ Orphaned | **No** |

## File Purposes

### 1. globals.css ✅
**Status:** Keep as-is (correctly positioned)

**Purpose:**
- Global theme tokens (CSS custom properties)
- Font imports (Google Fonts, local Marissa Font)
- Tailwind CSS imports
- Base typography and utility classes
- High-contrast mode overrides
- Print media queries
- Forced-colors media queries
- Animation keyframes

**Why it belongs in /app:**
- Next.js convention: global styles live in `/app`
- Imported in `app/layout.tsx` (root layout)
- Contains app-wide theme tokens and resets
- Size is acceptable for a global stylesheet (3,885 lines)

**Action:** None required

---

### 2. print-styles.css ⚠️
**Status:** Orphaned - Not imported anywhere

**Purpose:**
- Print media styles for stories
- Hides navigation, headers, footers
- Shows story content optimally for printing

**Problem:**
- Zero imports found in codebase
- CSS is not being applied
- Print functionality likely broken or using inline styles

**Recommendations (choose one):**

**Option A: Import in layout.tsx** (if print styles are needed)
```typescript
import "./globals.css"
import "./print-styles.css"  // Add this
```

**Option B: Merge into globals.css** (simplify)
- globals.css already has some @media print rules
- Move print-styles.css content into globals.css
- Delete print-styles.css

**Option C: Delete if unused**
- If print functionality isn't needed/used
- Safe to delete (no imports = no impact)

**Recommended:** Option B (merge into globals.css)

---

### 3. public-accessibility.css ⚠️
**Status:** Orphaned - Not imported anywhere

**Purpose:**
- High-contrast mode overrides
- Uses `data-a11y-*` attributes
- Styles for `body.high-contrast` class

**Problem:**
- Zero imports found in codebase
- Accessibility overrides not being applied
- May duplicate rules already in globals.css

**Investigation Needed:**
- Check if globals.css already has these high-contrast rules
- Check if `data-a11y-*` attributes are used in components
- Check if `body.high-contrast` class is toggled anywhere

**Recommendations (choose one):**

**Option A: Import in layout.tsx** (if needed)
```typescript
import "./globals.css"
import "./public-accessibility.css"  // Add this
```

**Option B: Merge into globals.css** (simplify)
- globals.css already has high-contrast media queries
- Check for duplicates, merge unique rules
- Delete public-accessibility.css

**Option C: Delete if redundant**
- If globals.css already covers all cases
- If `data-a11y-*` attributes aren't used

**Recommended:** Investigate first, then likely Option B (merge)

---

## Comparison: globals.css vs Orphaned Files

### globals.css already includes:

1. **High-contrast mode:**
   ```css
   @media (prefers-contrast: high) { ... }
   body.high-contrast { ... }
   ```

2. **Print media:**
   ```css
   @media print { ... }
   ```

3. **Forced-colors mode:**
   ```css
   @media (forced-colors: active) { ... }
   ```

### Potential Duplication
The orphaned files may duplicate or extend what's already in globals.css. Need to:
1. Compare rules side-by-side
2. Identify unique vs duplicate rules
3. Decide merge vs import vs delete

---

## Recommended Action Plan

### Phase 1: Investigation (15 min)
1. Search codebase for `data-a11y-` attributes
2. Search for `body.high-contrast` class toggling
3. Test print functionality on story pages
4. Compare public-accessibility.css rules with globals.css

### Phase 2: Decision (based on findings)

**If accessibility features are actively used:**
- Import public-accessibility.css in layout.tsx
- Import print-styles.css in layout.tsx
- Or merge both into globals.css (cleaner)

**If accessibility features are dead code:**
- Delete both orphaned files
- Clean up any unused `data-a11y-*` attributes in components

### Phase 3: Consolidation (if merging)
1. Backup current globals.css
2. Append unique rules from print-styles.css
3. Append unique rules from public-accessibility.css
4. Remove duplicates
5. Test high-contrast mode
6. Test print functionality
7. Delete orphaned files
8. Commit changes

---

## Investigation Results ✅

### public-accessibility.css
**Status:** ❌ **BROKEN** - Needed but not imported

**Findings:**
- ✅ `data-a11y-*` attributes are used in 20+ components (hero sections, regions, photos)
- ✅ `body.high-contrast` class is actively toggled in `accessibility-provider.tsx`
- ❌ `public-accessibility.css` is NOT imported anywhere
- ❌ High-contrast mode rules are NOT in globals.css
- ❌ **Accessibility feature is currently broken** for users who enable high-contrast

**Components using data-a11y attributes:**
- `/donate/page.tsx` - Hero with data-a11y-hero, data-a11y-photo, data-a11y-hero-copy
- `/events/[slug]/page.tsx` - Hero sections
- `/contact/page.tsx` - Hero and contact badge
- `/press/page.tsx` - Hero photo regions
- `/get-involved/page.tsx` - Hero sections
- `/programs/page.tsx` - CTA sections
- `/stories/[slug]/page.tsx` - Story regions
- `photo-wall.tsx` - Photo wall and shade overlays
- `reading-aids.tsx` - Reading layer and guide markers
- And 10+ more components...

### print-styles.css  
**Status:** ⚠️ **UNUSED** - May be needed

**Findings:**
- Story pages exist (`/stories/[slug]`)
- Print styles define `.no-print` class and hide nav/header/footer
- No direct window.print() calls found
- Likely users use browser's native print (Ctrl+P)
- May be needed for proper print formatting

## Recommended Actions

### Priority 1: Fix Broken Accessibility (URGENT) 🚨

**Problem:** High-contrast mode is completely broken. Users can toggle it, but no styles apply.

**Solution:** Import public-accessibility.css immediately

```typescript
// app/layout.tsx
import "./globals.css"
import "./public-accessibility.css"  // FIX: Enable high-contrast styles
```

**Alternative:** Merge into globals.css (cleaner long-term)

### Priority 2: Fix Print Styles (MEDIUM)

**Problem:** Print functionality may be broken or using browser defaults only

**Solution:** Import print-styles.css

```typescript
// app/layout.tsx  
import "./globals.css"
import "./public-accessibility.css"
import "./print-styles.css"  // Enable print optimizations
```

**Alternative:** Merge into globals.css (@media print section already exists)

### Priority 3: Consolidation (OPTIONAL - Future)

---

## Risk Assessment

**Low Risk:**
- These files are already orphaned (not imported)
- Deleting them has zero immediate impact
- Can always restore from git history

**Medium Risk:**
- May break undiscovered accessibility features
- May affect print functionality if used

**Mitigation:**
- Test high-contrast mode before/after changes
- Test print on story pages
- Search for `data-a11y-` usage first
