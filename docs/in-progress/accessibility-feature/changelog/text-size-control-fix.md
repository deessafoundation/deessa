# Bug Fix: Text Size Control Not Working

**Date:** 2026-09-16  
**Issue:** Text size slider wasn't affecting text on the page  
**Status:** ✅ Fixed  
**Build:** ✅ Compiled successfully in 36.2s

---

## 🐛 Problem

User reported that the text size control wasn't working. The slider moved but text didn't change size.

---

## 🔍 Root Cause

**The Issue:**
- CSS selector was `html[data-a11y-scope="public"]` (expects attribute on `<html>` tag)
- But the `data-a11y-scope="public"` attribute was on a `<div>` in `app/(public)/layout.tsx`
- CSS variable `--a11y-text-scale` was being set, but the scoped selector wasn't matching

**Why it didn't match:**
```tsx
// In app/(public)/layout.tsx
<div data-a11y-scope="public">  ❌ Wrong element
  <AccessibilityProvider>...</AccessibilityProvider>
</div>
```

```css
/* In app/globals.css */
html[data-a11y-scope="public"] {  /* ← Looking for html tag */
  font-size: calc(100% * var(--a11y-text-scale, 1));
}
```

---

## ✅ Solution

**Moved the attribute to the `<html>` element** where the provider applies CSS variables:

### Changes Made:

#### 1. Provider now sets `data-a11y-scope` on `<html>` ✅
**File:** `contexts/accessibility-provider.tsx`

```typescript
useEffect(() => {
  const root = document.documentElement  // <html> tag

  // Set data attribute on html element for scoped CSS
  root.setAttribute('data-a11y-scope', 'public')

  // Apply CSS variables
  root.style.setProperty('--a11y-text-scale', String(preferences.textScale))
  
  // ... other variables ...

  // Cleanup on unmount
  return () => {
    root.removeAttribute('data-a11y-scope')
    root.style.removeProperty('--a11y-text-scale')
    // ... other cleanup ...
  }
}, [preferences])
```

#### 2. Removed duplicate from layout ✅
**File:** `app/(public)/layout.tsx`

```tsx
// Before ❌
<div className={openDyslexic.variable} data-a11y-scope="public">

// After ✅
<div className={openDyslexic.variable}>
```

---

## 🧪 How It Works Now

### Flow:
1. User moves text size slider (1.0-2.0 range)
2. Provider updates `preferences.textScale`
3. Provider sets `<html data-a11y-scope="public">`
4. Provider sets `<html style="--a11y-text-scale: 1.5">`
5. CSS applies: `html[data-a11y-scope="public"] { font-size: calc(100% * 1.5) }`
6. All text scales to 150% ✅

### CSS Cascade:
```css
/* Base font size (browser default 16px) */
html {
  font-size: 100%;  /* 16px */
}

/* Scoped override when accessibility active */
html[data-a11y-scope="public"] {
  font-size: calc(100% * var(--a11y-text-scale, 1));
  /* Example: calc(100% * 1.5) = 150% = 24px */
}
```

---

## 📊 Testing Checklist

After fix, verify:

- [x] Build compiles successfully ✅
- [ ] Text size slider moves (1.0-2.0 range)
- [ ] Text visibly increases when slider moves right
- [ ] Text visibly decreases when slider moves left
- [ ] Percentage display updates (100-200%)
- [ ] Settings persist after reload
- [ ] Works at 100% (1.0)
- [ ] Works at 200% (2.0)
- [ ] Works at intermediate values (1.3, 1.7, etc.)
- [ ] Buttons disabled at min/max correctly
- [ ] Other controls still work (spacing, fonts, etc.)
- [ ] No console errors
- [ ] `<html>` has `data-a11y-scope="public"` attribute
- [ ] DevTools shows `--a11y-text-scale` CSS variable on `<html>`

---

## 📝 Files Changed

| File | Change | Lines |
|------|--------|-------|
| `contexts/accessibility-provider.tsx` | Added `data-a11y-scope` attribute to `<html>`, added cleanup | ~10 |
| `app/(public)/layout.tsx` | Removed duplicate `data-a11y-scope` from div | 1 |

**Total:** 2 files, ~11 lines

---

## 🎓 Lessons Learned

### Selector Scope Matters
- CSS attribute selectors are element-specific
- `html[attr]` won't match `div[attr]`
- Always check where CSS variables and attributes are applied

### Provider Responsibility
- Provider should own all DOM manipulations
- Don't split attribute management between provider and layout
- Single source of truth prevents mismatches

### Testing Strategy
- Always test visual changes in browser
- DevTools inspection catches CSS selector issues
- Unit tests wouldn't have caught this (DOM-specific)

---

## 🚀 Next Steps

After verifying the fix works:
1. Test text scaling at all breakpoints (mobile, tablet, desktop)
2. Test with browser zoom (should compound correctly)
3. Test with different base font sizes
4. Verify WCAG 2.2 AA compliance (200% text scaling)

---

**Fixed by:** Kiro  
**Verified by:** [Pending user testing]  
**Status:** Ready for testing in browser
