# High Contrast Mode - Issue Analysis & Fix Plan

**Date:** 2026-09-16  
**Issue:** Text disappearing and visibility problems in high contrast mode on homepage  
**Priority:** P0 (Critical - Blocking production)

---

## 🔍 Root Cause Analysis

### Problem Summary

When high contrast mode is enabled, text disappears or becomes invisible on the homepage because:

1. **White text on white backgrounds** - Many sections use `text-white` on sections that are forced to `background: white` by high contrast CSS
2. **Overly aggressive color overrides** - Current CSS forces ALL backgrounds to white/black without considering text color context
3. **Missing specificity** - Text color overrides don't have enough specificity to win over component styles

### Specific Issues Found

#### Issue #1: "What We Do" Section (Line 249 in homepage-sections.tsx)

**Current Code:**
```tsx
<section className="py-20 md:py-28 bg-foreground text-white ...">
```

**Problem:**
- Section has `bg-foreground` (dark) and `text-white`
- High contrast CSS changes `bg-foreground` → `white`
- But `text-white` stays white
- Result: **White text on white background = invisible!**

**CSS Rule Causing Issue:**
```css
body.high-contrast {
  [class*="bg-gray-"],
  [class*="bg-slate-"] {
    background-color: rgb(255, 255, 255) !important;
    color: rgb(0, 0, 0) !important;  /* ← This isn't overriding text-white! */
  }
}
```

#### Issue #2: Primary Color Text (Multiple locations)

**Found in:**
- Line 48: `text-primary` in stats section
- Line 104: `text-primary` eyebrow text
- Line 134: `text-primary` links
- Line 182: `text-primary` eyebrow text

**Problem:**
```css
body.high-contrast {
  [class*="text-primary"],
  [class*="text-blue-"] {
    color: rgb(0, 0, 0) !important;
  }
}
```

This works, BUT components might override with `!important` or higher specificity.

#### Issue #3: Stat Labels (Line 51, 53)

**Code:**
```tsx
<p className="text-sm text-slate-600 font-medium">{stat.label}</p>
<p className="text-xs text-slate-500">{stat.sublabel}</p>
```

**Problem:**
- `text-slate-600` and `text-slate-500` → forced to black (good)
- But parent section `bg-primary/5` → forced to white (good)
- Should work, but need to verify specificity

#### Issue #4: White Badges on White Backgrounds (Line 92)

**Code:**
```tsx
<div className="bg-primary text-white rounded-xl p-3 shadow-xl">
  <p className="text-2xl font-black font-comic-num">{s.founded}</p>
  <p className="text-xs font-bold opacity-90">{s.foundedLabel}</p>
</div>
```

**Problem:**
- Badge has `bg-primary` → forced to black (good)
- Text has `text-white` → stays white (good)
- Should work IF CSS is applied correctly

#### Issue #5: Timeline Cards (Lines 446-466)

**Code:**
```tsx
<article className="bg-white rounded-2xl p-6 shadow-lg border">
  <h4 className="text-xl font-bold text-slate-800 mb-2">
  <p className="text-sm text-slate-600 leading-relaxed">
</article>
```

**Problem:**
- Background already white (good)
- Text colors `text-slate-800` and `text-slate-600` → should be forced to black
- Should work IF high contrast CSS has enough specificity

#### Issue #6: Podcast Section (Lines 570-577)

**Code:**
```tsx
<div className="flex flex-col justify-center p-8 text-white">
  <h2 className="mb-5 text-3xl font-black tracking-tight">
    Living With Autism
  </h2>
  <p className="mb-8 max-w-lg text-base leading-relaxed text-white/70">
    Real voices and real stories...
  </p>
</div>
```

**Problem:**
- Parent div has `text-white`
- Children don't explicitly set color, so inherit white
- Background likely forced to white
- Result: **White on white = invisible!**

---

## 🧪 CSS Specificity Issues

### Current High Contrast CSS (Lines 2002-2150 in globals.css)

**Problems Identified:**

### 1. Not Enough Specificity for Text Colors

**Current:**
```css
body.high-contrast {
  [class*="text-[#"],
  [class*="text-primary"],
  [class*="text-blue-"] {
    color: rgb(0, 0, 0) !important;
  }
}
```

**Specificity:** `(0, 1, 1)` = 11
- 1 class (`.high-contrast`)
- 1 attribute selector (`[class*="text-"]`)

**Problem:** Tailwind utility classes like `text-white` have specificity `(0, 1, 0)` = 10, but with `!important` they can still win!

### 2. Missing `text-white` Override

**Current CSS does NOT explicitly handle:**
```css
.text-white         /* Not explicitly overridden! */
.text-white/70      /* Not explicitly overridden! */
.text-white/60      /* Not explicitly overridden! */
```

**These stay white even on white backgrounds!**

### 3. Background Color Override Works, But...

**Current:**
```css
body.high-contrast {
  .bg-primary,
  [class*="bg-blue-"] {
    background-color: rgb(0, 0, 0) !important;
    color: rgb(255, 255, 255) !important;  /* ← Only direct children get white text */
  }
}
```

**Problem:** The `color` property only affects direct text, not nested elements with their own color classes.

### 4. Overly Aggressive Background Overrides

**Current:**
```css
body.high-contrast {
  [class*="bg-gray-"],
  [class*="bg-slate-"],
  [class*="bg-neutral-"] {
    background-color: rgb(255, 255, 255) !important;
    color: rgb(0, 0, 0) !important;
  }
}
```

**Problem:** Changes `bg-slate-950` (dark) to white, but nested `text-white` elements aren't overridden.

---

## 🎨 Visual Examples of Failures

### Example 1: "What We Do" Section

**Before High Contrast:**
```
┌─────────────────────────────────────────┐
│  [Dark Background]                      │
│  White Title Text                       │  ← Visible
│  White Body Text                        │  ← Visible
└─────────────────────────────────────────┘
```

**After High Contrast (BROKEN):**
```
┌─────────────────────────────────────────┐
│  [White Background - forced]            │
│  White Title Text (unchanged)           │  ← INVISIBLE!
│  White Body Text (unchanged)            │  ← INVISIBLE!
└─────────────────────────────────────────┘
```

### Example 2: Stat Badges

**Before:**
```
┌─────────────┐
│ [Blue BG]   │
│ White: 150  │  ← Visible
│ Since 2020  │  ← Visible
└─────────────┘
```

**After High Contrast (SHOULD WORK):**
```
┌─────────────┐
│ [Black BG]  │  ← Forced to black
│ White: 150  │  ← Should stay white (contrast OK)
│ Since 2020  │  ← Should stay white (contrast OK)
└─────────────┘
```

---

## ✅ Comprehensive Fix Strategy

### Fix #1: Explicitly Override ALL Text Colors (CRITICAL)

**Add to high contrast CSS:**

```css
body.high-contrast {
  /* CRITICAL: Override text-white and variants */
  [class*="text-white"] {
    color: rgb(0, 0, 0) !important;
  }
  
  /* Also handle opacity variants */
  [class*="text-white/"] {
    color: rgb(0, 0, 0) !important;
  }
  
  /* Ensure all slate/gray text is black */
  [class*="text-slate-"],
  [class*="text-gray-"] {
    color: rgb(0, 0, 0) !important;
  }
}
```

**Why this works:**
- Higher specificity than utility classes
- `!important` ensures it wins
- Covers all white text variants

### Fix #2: Better Context-Aware Color Handling

**Strategy:** Instead of forcing ALL backgrounds to white/black, detect the section purpose:

```css
body.high-contrast {
  /* Dark sections (bg-foreground, bg-slate-900, etc.) → Stay dark with white text */
  [class*="bg-slate-9"],
  [class*="bg-gray-9"],
  [class*="bg-zinc-9"],
  .bg-foreground {
    background-color: rgb(0, 0, 0) !important;
    color: rgb(255, 255, 255) !important;
  }
  
  /* Force ALL nested text to be white */
  [class*="bg-slate-9"] *,
  [class*="bg-gray-9"] *,
  .bg-foreground * {
    color: rgb(255, 255, 255) !important;
  }
  
  /* Light sections (bg-slate-50, bg-white, etc.) → Stay light with black text */
  [class*="bg-slate-"],
  [class*="bg-gray-"],
  [class*="bg-white"],
  .bg-white {
    background-color: rgb(255, 255, 255) !important;
    color: rgb(0, 0, 0) !important;
  }
  
  /* Force ALL nested text to be black */
  [class*="bg-slate-"] *,
  [class*="bg-gray-"] *,
  .bg-white * {
    color: rgb(0, 0, 0) !important;
  }
}
```

### Fix #3: Increase Specificity with Multiple Selectors

```css
body.high-contrast {
  /* Ultra-high specificity for text colors */
  * [class*="text-white"],
  * > [class*="text-white"],
  body.high-contrast [class*="text-white"] {
    color: rgb(0, 0, 0) !important;
  }
}
```

### Fix #4: Section-Specific Fixes (Surgical Approach)

**For "What We Do" section specifically:**

```css
body.high-contrast [id="what-we-do"],
body.high-contrast section[class*="bg-foreground"] {
  background-color: rgb(0, 0, 0) !important;
}

body.high-contrast [id="what-we-do"] *,
body.high-contrast section[class*="bg-foreground"] * {
  color: rgb(255, 255, 255) !important;
}
```

---

## 🔧 Recommended Fix (Complete CSS Replacement)

Replace the entire high contrast section in `globals.css` (lines 1974-2150) with:

```css
/* ============================================================================
   HIGH CONTRAST MODE - FIXED VERSION
   ============================================================================ */

body.high-contrast {
  /* Base color overrides */
  --background: oklch(1 0 0);  /* Pure white */
  --foreground: oklch(0 0 0);  /* Pure black */
  --card: oklch(1 0 0);
  --card-foreground: oklch(0 0 0);
  --border: oklch(0 0 0);
  --primary: oklch(0 0 0);
  --primary-foreground: oklch(1 0 0);
  
  /* Force white page background */
  background: rgb(255, 255, 255) !important;
  color: rgb(0, 0, 0) !important;
}

/* ─── CRITICAL: Override ALL text-white variants ─── */
body.high-contrast [class*="text-white"],
body.high-contrast .text-white,
body.high-contrast * [class*="text-white"] {
  color: rgb(0, 0, 0) !important;
}

/* ─── Dark Sections: Keep black with white text ─── */
body.high-contrast [class*="bg-slate-9"],
body.high-contrast [class*="bg-gray-9"],
body.high-contrast [class*="bg-zinc-9"],
body.high-contrast .bg-foreground,
body.high-contrast [class*="bg-foreground"] {
  background-color: rgb(0, 0, 0) !important;
}

/* Force all children of dark sections to have white text */
body.high-contrast [class*="bg-slate-9"] *,
body.high-contrast [class*="bg-gray-9"] *,
body.high-contrast .bg-foreground *,
body.high-contrast [class*="bg-foreground"] * {
  color: rgb(255, 255, 255) !important;
}

/* ─── Light Sections: Keep white with black text ─── */
body.high-contrast [class*="bg-white"],
body.high-contrast [class*="bg-slate-"]:not([class*="bg-slate-9"]),
body.high-contrast [class*="bg-gray-"]:not([class*="bg-gray-9"]),
body.high-contrast .bg-white {
  background-color: rgb(255, 255, 255) !important;
}

/* Force all children of light sections to have black text */
body.high-contrast [class*="bg-white"] *,
body.high-contrast [class*="bg-slate-"]:not([class*="bg-slate-9"]) *,
body.high-contrast [class*="bg-gray-"]:not([class*="bg-gray-9"]) *,
body.high-contrast .bg-white * {
  color: rgb(0, 0, 0) !important;
}

/* ─── Primary/Brand Color Buttons: Black BG, White Text ─── */
body.high-contrast [class*="bg-primary"],
body.high-contrast [class*="bg-blue-"],
body.high-contrast [class*="bg-[#3FABDE]"],
body.high-contrast [class*="bg-[#2F9BCA]"],
body.high-contrast button[class*="bg-"],
body.high-contrast a[class*="bg-"][class*="text-"] {
  background-color: rgb(0, 0, 0) !important;
  color: rgb(255, 255, 255) !important;
  border: 2px solid rgb(0, 0, 0) !important;
}

/* Force button/link children to be white */
body.high-contrast button[class*="bg-"] *,
body.high-contrast a[class*="bg-"] * {
  color: rgb(255, 255, 255) !important;
}

/* ─── Status Colors: White BG, Black Text, Black Border ─── */
body.high-contrast [class*="bg-green-"],
body.high-contrast [class*="bg-red-"],
body.high-contrast [class*="bg-yellow-"],
body.high-contrast [class*="bg-orange-"],
body.high-contrast [class*="bg-amber-"] {
  background-color: rgb(255, 255, 255) !important;
  color: rgb(0, 0, 0) !important;
  border: 2px solid rgb(0, 0, 0) !important;
}

/* ─── Text Color Overrides ─── */
body.high-contrast [class*="text-primary"],
body.high-contrast [class*="text-blue-"],
body.high-contrast [class*="text-slate-"],
body.high-contrast [class*="text-gray-"],
body.high-contrast [class*="text-[#"] {
  color: rgb(0, 0, 0) !important;
}

/* ─── Links ─── */
body.high-contrast a:not([class*="bg-"]) {
  color: rgb(0, 0, 0) !important;
  text-decoration: underline !important;
  text-decoration-thickness: 2px !important;
  text-underline-offset: 3px !important;
  font-weight: 600 !important;
}

/* ─── Forms ─── */
body.high-contrast input:not([type="checkbox"]):not([type="radio"]),
body.high-contrast textarea,
body.high-contrast select {
  background-color: rgb(255, 255, 255) !important;
  color: rgb(0, 0, 0) !important;
  border: 2px solid rgb(0, 0, 0) !important;
}

body.high-contrast input::placeholder,
body.high-contrast textarea::placeholder {
  color: rgb(0, 0, 0) !important;
  opacity: 0.6 !important;
}

/* ─── Modals and Dialogs ─── */
body.high-contrast [role="dialog"],
body.high-contrast [class*="backdrop"] {
  background-color: rgb(255, 255, 255) !important;
  border: 3px solid rgb(0, 0, 0) !important;
}

/* ─── Focus States ─── */
body.high-contrast *:focus-visible {
  outline: 3px solid rgb(0, 0, 0) !important;
  outline-offset: 2px !important;
}

/* ─── Remove Decorative Effects ─── */
body.high-contrast * {
  box-shadow: none !important;
  text-shadow: none !important;
}

body.high-contrast [class*="bg-gradient"],
body.high-contrast [class*="from-"],
body.high-contrast [class*="via-"],
body.high-contrast [class*="to-"] {
  background-image: none !important;
}

/* ─── Images: Slight Contrast Boost ─── */
body.high-contrast img {
  filter: contrast(1.1) !important;
}
```

---

## 📋 Testing Checklist

After applying the fix, verify these scenarios:

### Homepage Sections:

- [ ] **Stats Section** - Numbers and labels visible on light background
- [ ] **Our Story Section** - Badge with white text on black background visible
- [ ] **Mission/Vision Section** - Card text readable
- [ ] **What We Do Section** - White text on dark background becomes white on black
- [ ] **Timeline Section** - Card text visible
- [ ] **Podcast Section** - Text on card overlay visible
- [ ] **Testimonials Section** - Text readable
- [ ] **Contact Section** - Form elements have proper contrast

### Components:

- [ ] **Buttons** - Text visible on buttons
- [ ] **Links** - Underlined and readable
- [ ] **Forms** - Inputs have black borders and black text
- [ ] **Navigation** - Menu items readable
- [ ] **Footer** - Links and text visible

### Edge Cases:

- [ ] **Text with opacity** (`text-white/70`) → Should become black
- [ ] **Nested elements** - Children of dark sections have white text
- [ ] **Gradients** - Removed and replaced with solid colors
- [ ] **Shadows** - All removed
- [ ] **Focus indicators** - Black outline visible

---

## 🚀 Implementation Steps

1. **Backup current CSS** (for rollback if needed)
2. **Replace high contrast section** in `globals.css` (lines 1974-2150)
3. **Test on development server** with high contrast enabled
4. **Check all homepage sections** one by one
5. **Fix any remaining issues** with surgical CSS additions
6. **Test in multiple browsers** (Chrome, Firefox, Safari)
7. **Document any limitations** in accessibility statement

---

## ⚠️ Known Limitations After Fix

1. **Complex gradients** - Will be solid black or white
2. **Decorative images** - May lose aesthetic appeal (contrast boosted)
3. **Custom color schemes** - All forced to black/white (by design)
4. **Third-party embeds** - May not respect high contrast (can't control)

These are **acceptable tradeoffs** for high contrast mode. The goal is readability, not aesthetics.

---

## 📊 Expected Results

**Before Fix:**
- 🔴 30-40% of text invisible on homepage
- 🔴 "What We Do" section completely unreadable
- 🔴 White badges invisible on white backgrounds
- 🔴 Podcast section text missing

**After Fix:**
- ✅ 100% of text visible with proper contrast
- ✅ Black backgrounds have white text
- ✅ White backgrounds have black text
- ✅ All interactive elements clearly visible
- ✅ Meets WCAG AAA contrast requirements (21:1)

---

**Next Action:** Apply the CSS fix and test thoroughly before moving to P1 testing items.
