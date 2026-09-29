# Phase 0: CSS & Styling Audit

**Date:** 2026-09-16
**File Analyzed:** `app/globals.css` (1400+ lines)
**Status:** Complete
**Grade:** B+ (Strong foundation, needs refinement)

---

## Executive Summary

**Good News:** CSS already has significant accessibility features built-in!

### What's Already Working:

1. **Reduced Motion Support** - Comprehensive `@media (prefers-reduced-motion: reduce)` queries
2. **Focus Indicators** - Strong 3px outlines with proper color contrast
3. **Skip Link** - Properly implemented skip-to-main
4. **Screen Reader Class** - `.sr-only` utility present
5. **High Contrast Mode** - Basic implementation exists
6. **Semantic Color Tokens** - Using CSS custom properties (good for theming)

### Areas Needing Work:

1. **Existing accessibility classes not fully implemented**
2. **Animation connections missing** (need to respect app preferences)
3. **Some hard-coded colors exist**
4. **High contrast mode could be more comprehensive**

---

## Accessibility Features Already Present

### 1. Reduced Motion Support

**System prefers-reduced-motion:**
```css
@media (prefers-reduced-motion: reduce) {
  .animate-marquee,
  .animate-shimmer,
  .animate-fade-in-up {
    animation: none !important;
  }

  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

**Also disables custom animations:**
```css
@media (prefers-reduced-motion: reduce) {
  .animate-kenburns,
  .animate-float-particle,
  .animate-scroll-bounce,
  .animate-cta-ripple,
  /* ... 15+ more animations */
  {
    animation: none !important;
  }

  .hover-lift:hover {
    transform: none !important;
  }
}
```

**Status:** Excellent - Comprehensive coverage
**Action:** Need to connect to app preferences (not just system)

---

### 2. Focus Indicators

**Universal focus:**
```css
*:focus-visible {
  outline: 3px solid oklch(0.68 0.11 230); /* Ocean Blue */
  outline-offset: 2px;
  border-radius: 4px;
}
```

**Button focus:**
```css
button:focus-visible {
  outline: 3px solid oklch(0.68 0.11 230);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px oklch(0.68 0.11 230 / 0.2);
}
```

**Link focus:**
```css
a:focus-visible {
  outline: 3px solid oklch(0.68 0.11 230);
  outline-offset: 2px;
  text-decoration: underline;
  text-decoration-thickness: 2px;
}
```

**Form inputs:**
```css
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 3px solid oklch(0.68 0.11 230);
  outline-offset: 0px;
  border-color: oklch(0.68 0.11 230);
  box-shadow: 0 0 0 3px oklch(0.68 0.11 230 / 0.2);
}
```

**Status:** Excellent
**Contrast:** Ocean blue (#3FABDE) on white has good contrast
**Width:** 3px exceeds WCAG 2.2 minimum (2px)
**Action:** Keep as-is

---

### 3. Skip Link

```css
.skip-to-main {
  position: absolute;
  left: -9999px;
  z-index: 999;
  padding: 1rem 1.5rem;
  background-color: oklch(0.68 0.11 230);
  color: white;
  text-decoration: none;
  border-radius: 0 0 0.5rem 0.5rem;
}

.skip-to-main:focus {
  left: 50%;
  transform: translateX(-50%);
  top: 0;
}
```

**Status:** Perfect - Exactly how it should be
**Action:** None needed

---

### 4. Screen Reader Only Class

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

**Status:** Standard - Correct implementation
**Action:** None needed

---

## Partial Implementations (Need Work)

### 5. Text Size Classes (Exists but Unused)

**Found in CSS:**
```css
body.text-normal { font-size: 16px; }
body.text-large { font-size: 18px; }
body.text-xlarge { font-size: 20px; }
```

**Issues:**
- Not connected to provider
- Using fixed pixel sizes (should use % or rem)
- Limited scaling (16px, 18px, 20px vs spec: 100-200%)
- Inconsistent with spec (should be `textScale` variable)

**Should Be:**
```css
html[data-a11y-scope="public"] {
  font-size: calc(100% * var(--a11y-text-scale, 1));
}
```

**Action:** Replace in A2/A3 phase

---

### 6. High Contrast Mode (Basic)

**Found in CSS:**
```css
body.high-contrast {
  --text-main: 0 0 0;
  --text-muted: 33 37 41;
  --bg-white: 255 255 255;
  --bg-soft: 255 255 255;
  --border: 0 0 0;
}

body.high-contrast * {
  border-color: rgb(0, 0, 0) !important;
}

body.high-contrast a {
  text-decoration: underline;
  font-weight: 600;
}

body.high-contrast button {
  border: 2px solid rgb(0, 0, 0) !important;
  font-weight: 600;
}

body.high-contrast img {
  filter: contrast(1.2);
}
```

**Status:** Basic - Works but could be better

**Issues:**
- Only changes a few colors
- Many UI elements not covered
- Could conflict with semantic tokens
- No dark mode variant

**Action:** Enhance in A3 phase with semantic tokens

---

## Animation Inventory

### Found 30+ Keyframe Animations:

| Animation | Usage | Respects Reduced Motion? |
|-----------|-------|-------------------------|
| `shimmer` | Tabs | Yes |
| `marquee` | Partner strip, news ticker | Yes |
| `fadeInUp` | General fade | Yes |
| `kenburns` | Hero images | Yes |
| `floatParticle` | Decorative | Yes |
| `scrollBounce` | Scroll indicator | Yes |
| `ctaRipple` | CTA buttons | Yes |
| `badgeBounce` | Badges | Yes |
| `iconFloat` | Icons | Yes |
| `glowPulse` | Hover effects | Yes |
| `timelineDraw` | Timeline | Yes |
| `yearPulse` | Year bubbles | Yes |
| `avatarGlow` | Avatars | Yes |
| `soundWave` | Sound effects | Yes |
| `waveBar` | Waveforms | Not in list! |
| `heartbeat` | Heartbeat button | Yes |
| `marqueeReverse` | Reverse marquee | Yes |
| `fade-up/down/left/right` | General fades | Not in list! |
| `scale-in` | Scale transitions | Not in list! |
| `dotPulse` | Map markers | Yes |
| `cartBounce` | Cart animations | Not in list! |

**Total:** 30+ keyframe animations

**Status:**
- Most covered by reduced-motion media query
- Some missing from the disable list
- Only respects SYSTEM preference, not app preference

---

## Color & Contrast Analysis

### CSS Custom Properties (Good Practice!)

```css
:root {
  --brand-primary: 63 171 222;           /* #3FABDE - Ocean Blue */
  --brand-primary-dark: 11 95 138;       /* #0B5F8A */
  --success: 22 163 74;                  /* Green */
  --warning: 245 158 11;                 /* Amber */
  --danger: 220 38 38;                   /* Red */
  --info: 37 99 235;                     /* Blue */
}
```

**Advantages:**
- Centralized color management
- Easy to theme
- Can be overridden for high contrast

**Hard-Coded Colors Found:**

In animation effects:
```css
box-shadow: 0 0 0 0 rgba(63, 171, 222, 0.5);  /* Hard-coded */
box-shadow: 0 0 15px rgba(59, 130, 246, 0.4); /* Hard-coded */
background-color: #14b8a6;                     /* Hard-coded teal */
```

**Action:** Convert to CSS variables in A3 phase

---

## Specific Issues Found

### 1. Missing from Reduced Motion (Add These)

```css
@media (prefers-reduced-motion: reduce) {
  /* ADD THESE: */
  .animate-fade-up,
  .animate-fade-down,
  .animate-fade-left,
  .animate-fade-right,
  .animate-scale-in,
  .animate-wave-bar,
  .group:hover .animate-cart-bounce {
    animation: none !important;
  }
}
```

### 2. Hover Effects Still Animate

Even with reduced motion, hover effects still trigger:
```css
.hover-glow-blue:hover {
  animation: glowPulse 2s ease-in-out infinite;
}
```

Should be:
```css
@media (prefers-reduced-motion: reduce) {
  .hover-glow-blue:hover,
  .hover-glow-green:hover,
  .hover-glow-orange:hover,
  .hover-glow-purple:hover {
    animation: none !important;
    /* Keep static glow */
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
  }
}
```

### 3. Card Flip 3D Transform

```css
.card-flip-container:hover .card-flip-inner {
  transform: rotateY(180deg);
}
```

Should respect reduced motion:
```css
@media (prefers-reduced-motion: reduce) {
  .card-flip-inner {
    transition: none !important;
  }
  .card-flip-container:hover .card-flip-inner {
    transform: none;
  }
}
```

---

## Action Items

### Priority 1: Connect App Preferences to CSS (Critical)

**Current State:**
```css
/* Only respects SYSTEM preference */
@media (prefers-reduced-motion: reduce) {
  .animate-marquee { animation: none !important; }
  /* ... 30+ more animations */
}
```

**Needed:**
```css
/* Respect BOTH system AND app preferences */
@media (prefers-reduced-motion: reduce),
body.reduce-motion {
  .animate-marquee { animation: none !important; }
  /* ... same animations */
}

/* Also handle sensory-friendly mode */
body.sensory-friendly {
  .animate-marquee { animation: none !important; }
  /* Same animations */
}
```

**Files to Update:** `app/globals.css` (lines ~1300-1400)
**Changes Required:** Add `body.reduce-motion` selector to all `@media (prefers-reduced-motion)` queries; add `body.sensory-friendly` selector to same animations
**Estimated:** 30 lines (mostly selector additions)
**Effort:** 1 hour
**Phase:** A3 (CSS integration)

---

### Priority 2: Fix Text Scaling Implementation (Critical)

**Current State (Incorrect):**
```css
body.text-normal { font-size: 16px; }
body.text-large { font-size: 18px; }
body.text-xlarge { font-size: 20px; }
```

**Issues:**
- Fixed pixel sizes (not responsive)
- Limited range (16-20px vs spec: 100-200%)
- Body classes not set by provider
- Not using CSS variable

**Correct Implementation:**
```css
/* Remove the old classes, add this instead */
html[data-a11y-scope="public"] {
  font-size: calc(100% * var(--a11y-text-scale, 1));
}

/* Ensure it works with user browser settings */
body {
  font-size: 1rem; /* Inherits from html */
}
```

**Provider Updates:**
```typescript
// In accessibility-provider.tsx
useEffect(() => {
  document.documentElement.style.setProperty(
    '--a11y-text-scale',
    effectivePrefs.textScale.toString()
  );
}, [effectivePrefs.textScale]);
```

**Files to Update:**
- `app/globals.css` (remove 3 lines, add 4 lines)
- `contexts/accessibility-provider.tsx` (add CSS variable injection)

**Changes Required:** Delete old `body.text-*` classes; add `html[data-a11y-scope]` selector with calc(); update provider to inject `--a11y-text-scale` variable
**Estimated:** 10 lines in CSS, 5 lines in provider
**Effort:** 30 minutes
**Phase:** A2 (Provider) + A3 (CSS)

---

### Priority 3: Add Missing Animations to Reduced-Motion

**Missing Animations Found:**
```css
@keyframes waveBar { /* not disabled */ }
@keyframes fade-up { /* not disabled */ }
@keyframes fade-down { /* not disabled */ }
@keyframes fade-left { /* not disabled */ }
@keyframes fade-right { /* not disabled */ }
@keyframes scale-in { /* not disabled */ }
@keyframes cartBounce { /* not disabled */ }
```

**Add to Reduced-Motion Block:**
```css
@media (prefers-reduced-motion: reduce),
body.reduce-motion,
body.sensory-friendly {
  .animate-marquee,
  .animate-shimmer,
  .animate-fade-in-up,
  /* ... existing animations ... */
  .animate-wave-bar,
  .animate-fade-up,
  .animate-fade-down,
  .animate-fade-left,
  .animate-fade-right,
  .animate-scale-in,
  .animate-cart-bounce {
    animation: none !important;
  }
}
```

**Files to Update:** `app/globals.css` (add 7 animation classes to existing list)
**Estimated:** 7 lines
**Effort:** 15 minutes
**Phase:** A3 (CSS integration)

---

### Priority 4: Enhance High Contrast Mode (Medium)

**Current State (Basic):**
```css
body.high-contrast {
  --text-main: 0 0 0;
  --text-muted: 33 37 41;
  --bg-white: 255 255 255;
  --bg-soft: 255 255 255;
  --border: 0 0 0;
}

body.high-contrast * {
  border-color: rgb(0, 0, 0) !important;
}
```

**Enhanced Implementation:**
```css
body.high-contrast {
  /* Stronger text contrast */
  --text-main: 0 0 0;
  --text-muted: 33 37 41;
  --text-inverse: 255 255 255;

  /* Pure white/black backgrounds */
  --bg-white: 255 255 255;
  --bg-soft: 255 255 255;
  --bg-dark: 0 0 0;

  /* Strong borders */
  --border: 0 0 0;
  --border-focus: 0 0 255;

  /* Ensure links are underlined */
  --link-decoration: underline;

  /* Remove background images for clarity */
  background-image: none !important;
}

body.high-contrast * {
  border-color: rgb(0, 0, 0) !important;
  background-image: none !important; /* Remove decorative backgrounds */
}

body.high-contrast a {
  text-decoration: underline;
  text-decoration-thickness: 2px;
  font-weight: 600;
  color: rgb(0, 0, 255); /* Accessible blue */
}

body.high-contrast button {
  border: 2px solid rgb(0, 0, 0) !important;
  font-weight: 600;
  background-color: rgb(255, 255, 255) !important;
  color: rgb(0, 0, 0) !important;
}

body.high-contrast img {
  filter: contrast(1.3) saturate(1.2);
  border: 1px solid rgb(0, 0, 0);
}

/* Ensure focus is visible in high contrast */
body.high-contrast *:focus-visible {
  outline: 3px solid rgb(0, 0, 255) !important;
  outline-offset: 2px;
}
```

**Files to Update:** `app/globals.css` (enhance existing high-contrast block)
**Estimated:** 20 lines
**Effort:** 1 hour
**Phase:** A3 (CSS integration)

---

### Priority 5: Add Sensory-Friendly Mode Styles (Medium)

**New Feature - Not Yet Implemented:**

```css
/* Sensory-friendly mode: reduce visual noise */
body.sensory-friendly {
  /* Animations already disabled above */

  /* Reduce decorative elements */
  .decorative-gradient,
  .decorative-shape,
  .background-pattern {
    opacity: 0.3 !important;
  }

  /* Tone down shadows */
  * {
    box-shadow: none !important;
  }

  /* Keep essential shadows only */
  .card,
  .modal,
  .dropdown {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  }

  /* Reduce image saturation slightly */
  img:not([role="presentation"]) {
    filter: saturate(0.8);
  }

  /* Remove background videos */
  video.background-video {
    display: none !important;
  }

  /* Simplify borders */
  * {
    border-radius: min(var(--border-radius, 0.5rem), 0.5rem) !important;
  }
}
```

**Files to Update:** `app/globals.css` (new section)
**Estimated:** 25 lines
**Effort:** 1 hour
**Phase:** A4 (Feature implementation)

---

### Priority 6: Add Body Classes from Provider (Low)

**Current Provider:**
Provider sets classes like:
- `high-contrast`
- `reduce-motion`
- `sensory-friendly`
- `link-highlight`

**Ensure These Are Set:**
Verify in `contexts/accessibility-provider.tsx`:

```typescript
useEffect(() => {
  const body = document.body;

  // High contrast
  body.classList.toggle('high-contrast', effectivePrefs.highContrast);

  // Reduce motion
  body.classList.toggle('reduce-motion', effectivePrefs.reduceMotion);

  // Sensory friendly
  body.classList.toggle('sensory-friendly', effectivePrefs.sensoryFriendly);

  // Link highlight
  body.classList.toggle('link-highlight', effectivePrefs.linkHighlight);
}, [effectivePrefs]);
```

**Files to Update:** `contexts/accessibility-provider.tsx` (verify existing code)
**Estimated:** 0-10 lines (may already exist)
**Effort:** 15 minutes
**Phase:** A2 (Provider)

---

### Priority 7: Add Link Highlight Styles (Low)

**Current State:**
Provider sets `link-highlight` class but no CSS implementation.

**Add Styles:**
```css
body.link-highlight a {
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;
}

body.link-highlight a:hover {
  background-color: rgba(63, 171, 222, 0.1);
  padding: 0 2px;
  border-radius: 2px;
}

body.link-highlight a:focus-visible {
  background-color: rgba(63, 171, 222, 0.2);
}
```

**Files to Update:** `app/globals.css` (new section)
**Estimated:** 10 lines
**Effort:** 15 minutes
**Phase:** A3 (CSS integration)

---

## Summary of Changes

| Priority | Task | Lines | Effort | Phase | Status |
|----------|------|-------|--------|-------|--------|
| 1 | Connect app preferences | 30 | 1h | A3 | Ready |
| 2 | Fix text scaling | 15 | 30m | A2+A3 | Ready |
| 3 | Add missing animations | 7 | 15m | A3 | Ready |
| 4 | Enhance high contrast | 20 | 1h | A3 | Ready |
| 5 | Add sensory-friendly | 25 | 1h | A4 | Ready |
| 6 | Verify body classes | 10 | 15m | A2 | Ready |
| 7 | Add link highlight | 10 | 15m | A3 | Ready |
| **TOTAL** | **7 tasks** | **~117** | **4.5h** | - | - |

**Note:** Initial estimate was 80 lines, actual detailed count is ~117 lines (still reasonable)

---

## Implementation Order

### Phase A2 (Provider - Week 1):
1. Verify body class management (Priority 6)
2. Add CSS variable injection for text scale (Priority 2, part 1)

### Phase A3 (CSS Integration - Week 1-2):
1. Fix text scaling in globals.css (Priority 2, part 2)
2. Connect app preferences to animations (Priority 1)
3. Add missing animations (Priority 3)
4. Add link highlight styles (Priority 7)
5. Enhance high contrast (Priority 4)

### Phase A4 (Features - Week 2-3):
1. Add sensory-friendly mode (Priority 5)

---

## Files to Modify

1. **`app/globals.css`** (~100 lines of changes)
   - Add selectors to reduced-motion queries (30 lines)
   - Fix text scaling (4 lines, remove 3)
   - Add missing animations (7 lines)
   - Enhance high contrast (20 lines)
   - Add sensory-friendly mode (25 lines)
   - Add link highlight (10 lines)

2. **`contexts/accessibility-provider.tsx`** (~10 lines)
   - Verify/add body class management (may exist)
   - Add CSS variable injection for text scale (5 lines)

**Total Files:** 2
**Total Changes:** ~110 lines
**Risk Level:** Very Low (CSS only, scoped by body classes)

---

## CSS Audit Checklist

### Already Good:
- [x] Focus indicators (3px, good contrast)
- [x] Skip link implementation
- [x] Screen reader only class
- [x] Reduced motion media query (system)
- [x] CSS custom properties for colors
- [x] Dark mode support

### Needs Enhancement:
- [ ] Connect to app preferences (not just system)
- [ ] Add missing animations to reduced-motion list
- [ ] Implement proper text scaling (100-200%)
- [ ] Add spacing variable support
- [ ] Enhance high contrast mode
- [ ] Add link highlighting styles
- [ ] Implement sensory-friendly mode styles
- [ ] Add reading mode styles

### Gaps to Fill:
- [ ] Reading mode implementation (no styles exist)
- [ ] Font family switching (OpenDyslexic)
- [ ] Complete sensory mode visuals
- [ ] Comprehensive high contrast

---

## Key Insights

### Strengths:
1. **System reduced-motion already works** - Good baseline
2. **Focus indicators are excellent** - No changes needed
3. **Semantic color tokens** - Easy to theme
4. **Comprehensive animation library** - Just needs connection

### Opportunities:
1. **80% of CSS ready** - Just needs app preference connection
2. **Body classes already applied** - Provider sets them
3. **CSS variables pattern established** - Extend for spacing
4. **Dark mode working** - Can extend for high contrast

### Risks (Low):
1. Hard-coded colors in some places
2. Some animations not in disable list
3. High contrast could conflict with tokens

---

## Testing Strategy

### Visual Testing:
1. Enable each mode individually
2. Check all pages for:
   - No layout breaks
   - Styles applied correctly
   - No conflicts

### Automated Testing:
1. Run accessibility scan before changes
2. Run accessibility scan after changes
3. Compare violation counts (should improve)

### Manual Testing:
1. Test text scaling at 100%, 150%, 200%
2. Test reduce-motion (system + app)
3. Test high-contrast mode
4. Test sensory-friendly mode
5. Test link highlighting

### Browser Testing:
- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (if available)

---

**Status:** CSS Audit Complete
**Grade:** B+ (Strong foundation, needs refinement)
**Estimated Work:** 2-3 hours for all CSS changes
**Ready for:** A3 phase implementation
