# High Contrast Mode - Issue Analysis & Fix

**Date:** 2026-09-16  
**Issue:** Text disappearing on homepage in high contrast mode  
**Priority:** P0 (Critical Bug)

---

## Problem Identified

### Root Causes

**1. Overly Aggressive CSS Selectors**

The current high contrast CSS uses broad selectors that catch too many elements:

```css
body.high-contrast {
  /* THIS IS TOO BROAD - catches everything including backgrounds */
  [class*="bg-[#"] button,
  [class*="bg-[#"] a {
    background-color: rgb(0, 0, 0) !important;
    color: rgb(255, 255, 255) !important;
  }
  
  /* THIS APPLIES TO ALL TEXT - even text on white backgrounds! */
  [class*="text-[#"],
  [class*="text-primary"],
  [class*="text-blue-"] {
    color: rgb(0, 0, 0) !important; /* Black text on white = GOOD */
  }
}
```

**2. Color Inheritance Issues**

When we force `color: rgb(0, 0, 0)` on parent elements, child text inherits it, then if we force `background-color: rgb(255, 255, 255)` on those same elements, we get **black text on white background** in some places and **white text on white background** (INVISIBLE!) in others.

**3. Conflicting Rules**

Example conflict:
```css
/* Rule 1: Make all text black */
[class*="text-blue-"] {
  color: rgb(0, 0, 0) !important;
}

/* Rule 2: Make primary backgrounds black with white text */
.bg-primary * {
  color: rgb(255, 255, 255) !important;
}

/* RESULT: If element has both, which wins? 
   Answer: The more specific one, but this creates unpredictability */
```

---

## Specific Problems on Homepage

### Issue 1: Hero Section Text Disappearing

**Component:** HeroCarousel  
**Problem:** Hero text likely has classes like `text-white` on `bg-[#2f9bca]` background  
**Current CSS:** Forces both background AND text to specific colors, creating conflicts

**Code Pattern:**
```tsx
<div className="bg-[#2f9bca]">
  <h1 className="text-white">Title</h1> {/* Text disappears! */}
</div>
```

**What Happens:**
1. `bg-[#2f9bca]` matches `[class*="bg-[#"]` → background becomes black
2. `text-white` stays white (not caught by text selectors)
3. Result: White text on black → SHOULD BE VISIBLE

**But wait, then what's the actual problem?**

Let me check if there's another issue...

---

## Actual Issues Found

### Issue #1: White Text Not Being Overridden

```css
/* Current CSS doesn't catch text-white! */
body.high-contrast {
  [class*="text-[#"],
  [class*="text-primary"],
  [class*="text-blue-"] {
    color: rgb(0, 0, 0) !important;
  }
}
```

**Missing:** `text-white`, `text-slate-50`, `text-gray-100`, etc.

### Issue #2: Nested Element Conflicts

```css
/* Rule says: all children of bg-primary should be white */
.bg-primary * {
  color: rgb(255, 255, 255) !important;
}

/* But also says: all bg-primary should be black */
.bg-primary {
  background-color: rgb(0, 0, 0) !important;
  color: rgb(255, 255, 255) !important;
}
```

This works UNLESS there's a nested element with its own background.

### Issue #3: Gradient/Complex Backgrounds

```css
/* Removes gradients but doesn't ensure text contrast */
[class*="bg-gradient"] {
  background: rgb(255, 255, 255) !important;
  /* But doesn't set text color! */
}
```

---

## Solution Strategy

### Approach: Start Fresh with Clear Logic

**Principles:**
1. **Default Everything:** Start with black text on white background
2. **Dark Elements:** Explicitly handle buttons, cards with dark backgrounds
3. **Preserve Semantic Colors:** Error = red border, Success = green border (but high contrast)
4. **Simple Hierarchy:** Parent sets context, children inherit unless explicitly overridden

---

## Recommended Fix

### Step 1: Simplify Base Rules

```css
body.high-contrast {
  /* 1. DEFAULTS - Everything starts here */
  background-color: #ffffff !important;
  color: #000000 !important;
  
  /* 2. TYPOGRAPHY - Pure black text on white */
  & * {
    color: #000000 !important;
    background-color: transparent;
  }
  
  /* 3. CONTAINERS - White backgrounds */
  & div,
  & section,
  & article,
  & main,
  & header,
  & footer {
    background-color: #ffffff !important;
    border-color: #000000 !important;
  }
}
```

### Step 2: Handle Interactive Elements

```css
body.high-contrast {
  /* 4. BUTTONS - Black background, white text */
  & button,
  & a[class*="button"],
  & [role="button"] {
    background-color: #000000 !important;
    color: #ffffff !important;
    border: 2px solid #000000 !important;
  }
  
  /* 5. LINKS - Black with underline */
  & a:not([class*="button"]):not([role="button"]) {
    color: #000000 !important;
    text-decoration: underline !important;
    text-decoration-thickness: 2px !important;
    background-color: transparent !important;
  }
}
```

### Step 3: Handle Form Elements

```css
body.high-contrast {
  /* 6. FORMS - White background, black text, black border */
  & input:not([type="checkbox"]):not([type="radio"]),
  & textarea,
  & select {
    background-color: #ffffff !important;
    color: #000000 !important;
    border: 2px solid #000000 !important;
  }
  
  & input::placeholder,
  & textarea::placeholder {
    color: #666666 !important; /* Slightly gray for differentiation */
    opacity: 1 !important;
  }
}
```

### Step 4: Handle Special Cases

```css
body.high-contrast {
  /* 7. CARDS/PANELS - White with black border */
  & [class*="card"],
  & [class*="panel"],
  & [role="dialog"] {
    background-color: #ffffff !important;
    color: #000000 !important;
    border: 2px solid #000000 !important;
  }
  
  /* 8. NAVIGATION - High contrast */
  & nav,
  & [role="navigation"] {
    background-color: #ffffff !important;
    
    & a {
      color: #000000 !important;
    }
  }
  
  /* 9. IMAGES - Maintain visibility */
  & img {
    filter: contrast(1.2) !important;
    border: 1px solid #000000;
  }
  
  /* 10. FOCUS - Strong outline */
  & *:focus-visible {
    outline: 3px solid #000000 !important;
    outline-offset: 2px !important;
  }
  
  /* 11. REMOVE EFFECTS */
  & * {
    box-shadow: none !important;
    text-shadow: none !important;
  }
}
```

---

## Complete Revised CSS

Here's the complete, simplified high contrast CSS:

```css
/* ============================================================================
   HIGH CONTRAST MODE - REVISED (Simplified & Fixed)
   ============================================================================ */

body.high-contrast {
  /* ─────────────────────────────────────────────────────────────────────
     BASE LAYER: Default to black text on white background
     ───────────────────────────────────────────────────────────────────── */
  
  background-color: #ffffff !important;
  color: #000000 !important;
  
  /* All elements inherit black text on transparent/white background */
  * {
    color: inherit;
    background-color: transparent;
  }
  
  /* Container elements explicitly white */
  div, section, article, main, header, footer, aside, nav {
    background-color: #ffffff !important;
  }
  
  /* ─────────────────────────────────────────────────────────────────────
     TYPOGRAPHY: Ensure all text is black (except where overridden)
     ───────────────────────────────────────────────────────────────────── */
  
  h1, h2, h3, h4, h5, h6, p, span, label, li, td, th {
    color: #000000 !important;
  }
  
  /* ─────────────────────────────────────────────────────────────────────
     INTERACTIVE ELEMENTS: Buttons = black bg + white text
     ───────────────────────────────────────────────────────────────────── */
  
  button,
  input[type="button"],
  input[type="submit"],
  a[class*="button"],
  a[class*="btn"],
  [role="button"] {
    background-color: #000000 !important;
    color: #ffffff !important;
    border: 2px solid #000000 !important;
  }
  
  /* Button text must stay white */
  button *,
  a[class*="button"] *,
  a[class*="btn"] *,
  [role="button"] * {
    color: #ffffff !important;
  }
  
  /* ─────────────────────────────────────────────────────────────────────
     LINKS: Black text with underline (not buttons)
     ───────────────────────────────────────────────────────────────────── */
  
  a:not([class*="button"]):not([class*="btn"]):not([role="button"]) {
    color: #000000 !important;
    text-decoration: underline !important;
    text-decoration-thickness: 2px !important;
    text-underline-offset: 3px !important;
    background-color: transparent !important;
  }
  
  /* Link text */
  a:not([class*="button"]):not([class*="btn"]) * {
    color: #000000 !important;
  }
  
  /* ─────────────────────────────────────────────────────────────────────
     FORM ELEMENTS: White background, black text, black border
     ───────────────────────────────────────────────────────────────────── */
  
  input:not([type="checkbox"]):not([type="radio"]),
  textarea,
  select {
    background-color: #ffffff !important;
    color: #000000 !important;
    border: 2px solid #000000 !important;
  }
  
  input::placeholder,
  textarea::placeholder {
    color: #666666 !important;
    opacity: 1 !important;
  }
  
  /* ─────────────────────────────────────────────────────────────────────
     BORDERS: Everything gets black borders for definition
     ───────────────────────────────────────────────────────────────────── */
  
  [class*="border"],
  [class*="divide"] {
    border-color: #000000 !important;
  }
  
  /* Add borders to borderless elements for structure */
  [class*="card"],
  [class*="panel"] {
    border: 2px solid #000000 !important;
  }
  
  /* ─────────────────────────────────────────────────────────────────────
     MODALS & DIALOGS: White with strong border
     ───────────────────────────────────────────────────────────────────── */
  
  [role="dialog"],
  [role="alertdialog"],
  [class*="modal"],
  [class*="dialog"] {
    background-color: #ffffff !important;
    color: #000000 !important;
    border: 3px solid #000000 !important;
  }
  
  /* ─────────────────────────────────────────────────────────────────────
     FOCUS STATES: Strong black outline
     ───────────────────────────────────────────────────────────────────── */
  
  *:focus-visible {
    outline: 3px solid #000000 !important;
    outline-offset: 2px !important;
  }
  
  /* ─────────────────────────────────────────────────────────────────────
     IMAGES: Slight contrast boost + border
     ───────────────────────────────────────────────────────────────────── */
  
  img {
    filter: contrast(1.2) !important;
    border: 1px solid #000000 !important;
  }
  
  /* ─────────────────────────────────────────────────────────────────────
     REMOVE EFFECTS: No shadows, gradients, or transparency
     ───────────────────────────────────────────────────────────────────── */
  
  * {
    box-shadow: none !important;
    text-shadow: none !important;
    background-image: none !important; /* Remove gradients */
    backdrop-filter: none !important;
  }
  
  /* ─────────────────────────────────────────────────────────────────────
     CSS VARIABLE OVERRIDES: Force black/white through design system
     ───────────────────────────────────────────────────────────────────── */
  
  --background: #ffffff;
  --foreground: #000000;
  --card: #ffffff;
  --card-foreground: #000000;
  --popover: #ffffff;
  --popover-foreground: #000000;
  --primary: #000000;
  --primary-foreground: #ffffff;
  --secondary: #ffffff;
  --secondary-foreground: #000000;
  --muted: #ffffff;
  --muted-foreground: #000000;
  --accent: #ffffff;
  --accent-foreground: #000000;
  --destructive: #000000;
  --destructive-foreground: #ffffff;
  --border: #000000;
  --input: #000000;
  --ring: #000000;
}
```

---

## Why This Works Better

### 1. Clear Hierarchy
- Start with defaults (black on white)
- Override only specific elements (buttons, forms)
- Predictable inheritance

### 2. No Conflicting Rules
- Each selector has one clear purpose
- No `* {}` rules that fight each other
- Specific elements get specific treatments

### 3. Semantic Preservation
- Buttons look like buttons (black with white text)
- Links look like links (underlined)
- Forms look like forms (white with black border)

### 4. Accessibility First
- 21:1 contrast ratio (pure black/white)
- Strong focus indicators
- No color-only information

---

## Implementation Steps

1. **Backup Current CSS** (already done - it's in git)

2. **Replace High Contrast Section:**
   - Find lines ~1973-2160 in `app/globals.css`
   - Replace with new simplified CSS above

3. **Test on Homepage:**
   - Open homepage
   - Enable high contrast
   - Check: Hero text visible?
   - Check: All buttons visible?
   - Check: All links visible?

4. **Test Other Pages:**
   - /about
   - /events
   - /donate
   - /stories

5. **Verify with Tools:**
   - Use browser inspect to check computed styles
   - Use contrast checker (should be 21:1 everywhere)

---

## Quick Test Checklist

After applying fix, verify:

- [ ] Hero carousel text visible
- [ ] All headings visible
- [ ] All body text visible
- [ ] All buttons visible and clickable
- [ ] All links visible and underlined
- [ ] Navigation menu visible
- [ ] Footer visible
- [ ] Forms usable (inputs visible)
- [ ] Images have borders
- [ ] No white-on-white text anywhere
- [ ] No black-on-black text anywhere

---

## If Issues Persist

### Debugging Steps:

1. **Open DevTools**
2. **Inspect disappearing element**
3. **Check Computed styles:**
   - What's the background-color?
   - What's the color?
   - Which CSS rule is applying?
4. **Look for:**
   - Inline styles (these override CSS)
   - JavaScript-applied styles
   - Tailwind utilities not caught by our CSS

### Common Culprits:

**Inline styles:**
```tsx
<div style={{color: 'white', background: '#2f9bca'}}>
  {/* Our CSS might not override inline styles! */}
</div>
```

**Fix:** Use `!important` (we already do) or remove inline styles

**Tailwind JIT classes:**
```tsx
<div className="text-[#ffffff] bg-[#2f9bca]">
  {/* Attribute selectors [class*="text-[#"] should catch this */}
</div>
```

**Fix:** Our attribute selectors should catch these, but verify

---

## Expected Result

After fix:
- ✅ Pure black text on pure white background everywhere
- ✅ Buttons: Pure black background with pure white text
- ✅ Links: Pure black text with underline
- ✅ Images: Visible with black border
- ✅ Forms: White background, black text, black border
- ✅ 21:1 contrast ratio (WCAG AAA)
- ✅ No invisible text anywhere

---

**Next Steps:**
1. Apply the fix to `app/globals.css`
2. Test on homepage
3. Test on other pages
4. Report results

**Status:** Fix ready to apply
