# How The Accessibility System Works

## TL;DR - It's Already Global! 🎉

**You DON'T need to change individual pages!** The accessibility settings apply automatically to all pages under `app/(public)/` because they're wrapped in the `AccessibilityProvider`.

---

## Architecture Overview

```
app/(public)/layout.tsx
└── <AccessibilityProvider>      ← Central brain
    └── All your pages            ← Automatically get features!
        ├── /
        ├── /about
        ├── /events
        ├── /donate
        └── ... any page
```

---

## How Each Feature Works

### 1. ✅ Text Size (100% - 200%)

**How it works:**
```tsx
// Provider sets CSS variable when user changes slider
root.style.setProperty('--a11y-font-scale', String(preferences.textScale))
```

**Global CSS applies it:**
```css
body {
  font-size: calc(16px * var(--a11y-font-scale));
}
```

**Result:** All text on all pages resizes automatically!

**Where it works:**
- ✅ All body text
- ✅ Headings (h1, h2, h3, etc.)
- ✅ Buttons
- ✅ Navigation
- ✅ Forms
- ✅ Footer

**Potential exceptions:**
- ⚠️ Some CSS modules with hard-coded pixel sizes (campaign-concept.module.css, program-demo.module.css)
- ⚠️ SVG text elements (if any)
- 🔧 **Fix**: Convert hard-coded `font-size: 16px` to `font-size: 1rem` to inherit scaling

---

### 2. ✅ Line Spacing (1.5 - 2.5)

**How it works:**
```tsx
root.style.setProperty('--a11y-line-height', String(preferences.lineSpacing))
```

**Global CSS:**
```css
body {
  line-height: var(--a11y-line-height);
}
```

**Result:** All text line spacing changes everywhere automatically!

---

### 3. ✅ Letter Spacing (0% - 12%)

**How it works:**
```tsx
root.style.setProperty('--a11y-letter-spacing', `${preferences.letterSpacing}em`)
```

**Global CSS:**
```css
body {
  letter-spacing: var(--a11y-letter-spacing);
}
```

**Result:** All text letter spacing changes everywhere automatically!

---

### 4. ✅ High Contrast Mode

**How it works:**
```tsx
// Provider adds/removes body class
body.classList.toggle('high-contrast', preferences.highContrast)
```

**Global CSS:**
```css
body.high-contrast {
  /* High contrast colors apply to everything */
  --bg-main: #000000;
  --text-main: #FFFFFF;
  /* ... more colors ... */
}
```

**Result:** All pages switch to high contrast colors!

---

### 5. ✅ Reduce Motion

**How it works:**
```tsx
body.classList.toggle('reduce-motion', preferences.reduceMotion)
```

**Global CSS:**
```css
body.reduce-motion *,
body.reduce-motion *::before,
body.reduce-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}
```

**Result:** All animations stop on all pages!

**Where it works:**
- ✅ CSS animations
- ✅ CSS transitions
- ✅ Scroll animations
- ✅ Hero carousels
- ✅ Loading spinners
- ✅ Hover effects

---

### 6. ✅ Sensory-Friendly Mode

**How it works:**
```tsx
body.classList.toggle('sensory-friendly', preferences.sensoryFriendly)
```

**Global CSS:**
```css
/* Reduces visual saturation on content */
body.sensory-friendly main > * {
  filter: saturate(0.8);
}

/* Removes decorative patterns */
body.sensory-friendly .pattern-confetti,
body.sensory-friendly [class*="pattern-"] {
  background-image: none !important;
}

/* Simplifies gradients */
body.sensory-friendly [class*="gradient-"] {
  background: rgb(var(--brand-primary)) !important;
  background-image: none !important;
}

/* Stops ALL animations (includes reduce-motion) */
/* Simplifies shadows */
/* Removes parallax effects */
/* ... and more ... */
```

**Result:** Calmer visual experience on all pages!

---

### 7. ✅ Dyslexia-Friendly Font

**How it works:**
```tsx
body.classList.toggle('dyslexia-font', preferences.dyslexiaFont)
```

**Global CSS:**
```css
body.dyslexia-font,
body.dyslexia-font * {
  font-family: 'OpenDyslexic', Arial, sans-serif !important;
}

/* Exceptions for code/monospace */
body.dyslexia-font code,
body.dyslexia-font pre {
  font-family: 'Courier New', monospace !important;
}
```

**Result:** Font changes everywhere on all pages!

**Note:** Font file must be present in `/public/fonts/opendyslexic/`

---

## What Applies Automatically vs What Needs Work

### ✅ Works Automatically on ALL Pages

1. **Text Size** - Uses CSS variable, scales everything
2. **Line Spacing** - Uses CSS variable, applies globally
3. **Letter Spacing** - Uses CSS variable, applies globally
4. **High Contrast** - Body class triggers color tokens
5. **Reduce Motion** - Body class stops all animations
6. **Sensory-Friendly** - Body class simplifies visuals
7. **Dyslexia Font** - Body class changes font family

### ⚠️ Potential Issues (Need Testing)

1. **Hard-coded font sizes** in CSS modules:
   - `components/programs/demo/campaign-concept.module.css`
   - `components/programs/demo/program-demo.module.css`
   - These use `font-size: 16px` instead of `font-size: 1rem`
   
2. **Inline styles** in components:
   - If any component has inline `style={{fontSize: '16px'}}`, it won't scale
   - Solution: Use `style={{fontSize: '1rem'}}` or no inline font size

3. **Third-party components**:
   - Video players
   - Payment forms (Stripe/PayPal iframes)
   - These are outside our control

4. **Canvas/SVG text**:
   - Canvas text doesn't use CSS
   - SVG text might need special handling

---

## Testing Checklist

### Test Each Feature on Multiple Pages

- [ ] **Homepage** (`/`)
  - [ ] Change text size - all text scales
  - [ ] Change line spacing - text lines space out
  - [ ] Change letter spacing - letters space out
  - [ ] Enable high contrast - colors change
  - [ ] Enable reduce motion - animations stop
  - [ ] Enable sensory mode - visuals calm down
  - [ ] Enable dyslexia font - font changes

- [ ] **About Page** (`/about`)
  - [ ] All settings apply

- [ ] **Events Page** (`/events`)
  - [ ] All settings apply

- [ ] **Event Detail** (`/events/[slug]`)
  - [ ] All settings apply

- [ ] **Donate Page** (`/donate`)
  - [ ] All settings apply
  - [ ] Form labels resize
  - [ ] Buttons resize

- [ ] **Contact Page** (`/contact`)
  - [ ] Form elements respect settings

- [ ] **Demo Pages** (`/demo/accessibility-test`)
  - [ ] Comprehensive feature testing

---

## Troubleshooting

### Problem: Text size not changing in specific component

**Diagnosis:**
1. Inspect element in DevTools
2. Look at computed font-size
3. Check if it's using `px` instead of `rem`

**Solution:**
```css
/* Bad */
.my-component {
  font-size: 16px;  /* Won't scale! */
}

/* Good */
.my-component {
  font-size: 1rem;  /* Scales with --a11y-font-scale */
}
```

### Problem: Animations not stopping

**Diagnosis:**
1. Check if element has inline styles
2. Check if animation is JavaScript-based (not CSS)

**Solution:**
```tsx
// Check for reduce motion in component
const { preferences } = useAccessibility()

const shouldAnimate = !preferences.reduceMotion && !preferences.sensoryFriendly

return (
  <motion.div
    animate={shouldAnimate ? { opacity: 1 } : {}}
    initial={shouldAnimate ? { opacity: 0 } : {}}
  >
    Content
  </motion.div>
)
```

### Problem: Font not changing

**Diagnosis:**
1. Check if OpenDyslexic font files exist in `/public/fonts/opendyslexic/`
2. Check browser console for font loading errors

**Solution:**
- Ensure font files are present
- Check `app/fonts.ts` for proper font definition
- Fallback to Arial is automatic if font missing

---

## How Settings Persist

### Storage Location
```typescript
// localStorage key
const key = 'deesha-a11y-preferences'

// Stored data structure
{
  version: 1,
  preferences: {
    textScale: 1.2,
    lineSpacing: 1.7,
    letterSpacing: 0.05,
    highContrast: false,
    reduceMotion: true,
    sensoryFriendly: false,
    dyslexiaFont: true,
    linkHighlight: false,
    readingMode: false
  },
  lastUpdated: "2024-09-16T..."
}
```

### Persistence Flow

1. **User changes setting** → Provider updates state
2. **State updates** → Applies to DOM immediately (classes/CSS variables)
3. **After 150ms** → Saves to localStorage (debounced)
4. **Page refresh** → Reads from localStorage → Applies settings
5. **Different tab** → Storage event → Syncs settings

---

## Performance

### Current Costs

- **Initial JS**: ~15 KiB (provider + button)
- **CSS**: ~10 KiB (accessibility rules)
- **Font**: ~0 KiB (only loads if user enables)
- **localStorage**: <1 KiB per user

### When Settings Apply

1. **First visit**: Instant (no settings)
2. **Returning user**: Settings apply before first paint (bootstrap)
3. **Setting change**: Instant (CSS variables/classes)
4. **Font change**: 1-2s (font download time)

---

## Summary

### ✅ What You Have

- Global accessibility system that works on all public pages
- No per-page configuration needed
- Settings persist across sessions
- Settings sync across tabs
- Graceful fallbacks for errors

### 📝 What To Do

1. **Test** each feature on main pages
2. **Fix** any hard-coded pixel font sizes in CSS modules (convert to rem)
3. **Check** third-party components (iframes can't be styled)
4. **Document** any known limitations

### 🎯 Key Takeaway

The system is **already global and working**! You just need to test and potentially fix a few CSS modules that use hard-coded pixel sizes instead of relative units.

The "magic" is:
1. One provider at the root (`app/(public)/layout.tsx`)
2. CSS variables and body classes that affect everything
3. Global CSS rules that respond to those variables/classes

No per-page code needed! 🎉
