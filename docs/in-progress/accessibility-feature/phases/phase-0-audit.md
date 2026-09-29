# Phase 0: Pre-Implementation Audit Report

**Date:** 2026-09-14  
**Status:** ✅ Complete  
**Purpose:** Document existing code state before accessibility system implementation  

---

## 1. localStorage Keys Audit

### Existing Keys Found

| Key | Location | Purpose | Conflict Risk |
|-----|----------|---------|---------------|
| `accessibility-seen` | `components/accessibility-toolbar.tsx` | First-time instructions banner | ⚠️ **MEDIUM** - Should migrate to new system |
| `introShown` | `components/intro-video.tsx` | Track if intro video was shown | ✅ **LOW** - No conflict |
| `introLastShown` | `components/intro-video.tsx` | Timestamp of last intro show | ✅ **LOW** - No conflict |
| `deessa-editor-backup-{storyId}` | `components/admin/rich-text-editor` | Auto-save editor content | ✅ **LOW** - No conflict |
| `photo-wall-demo-override` | `app/demo/photo-wall/page.tsx` | Demo panel configuration | ✅ **LOW** - No conflict |

### Proposed New Keys

| Key | Purpose | Conflicts |
|-----|---------|-----------|
| `deessa-a11y-preferences` | Store all accessibility preferences | ✅ **NONE** - Unique prefix |
| `deessa-a11y-version` | Track schema version for migrations | ✅ **NONE** - Unique prefix |

### Migration Plan for `accessibility-seen`

```typescript
// In AccessibilityProvider initialization
const migrateOldSettings = () => {
  const oldSeen = localStorage.getItem('accessibility-seen')
  if (oldSeen === 'true') {
    // User has seen old toolbar instructions
    // No migration needed - this flag is for UI only
    localStorage.removeItem('accessibility-seen') // Clean up
  }
}
```

**Decision:** ✅ Safe to proceed with `deessa-a11y-preferences` key

---

## 2. CSS Custom Properties Audit

### Existing CSS Variables (DO NOT USE)

**Already Defined in `app/globals.css`:**

```css
/* Theme colors */
--background, --foreground, --card, --primary, --secondary, --muted
--accent, --destructive, --border, --input, --ring

/* Brand colors */
--brand-primary, --brand-primary-dark, --brand-purple, --brand-yellow
--accent-empowerment, --accent-environment, --accent-education

/* Semantic */
--success, --warning, --danger, --info

/* Neutrals */
--bg-white, --bg-soft, --text-main, --text-muted

/* Typography */
--font-sans, --font-heading, --font-comic, --font-marissa, --font-dm-sans

/* Layout */
--radius, --radius-sm, --radius-md, --radius-lg, --radius-xl
--surface, --foreground-muted

/* Charts */
--chart-1 through --chart-7

/* Sidebar */
--sidebar, --sidebar-foreground, --sidebar-primary, etc.
```

### Proposed New CSS Variables (SAFE TO ADD)

```css
:root {
  /* Accessibility-specific variables - using a11y prefix to avoid conflicts */
  --a11y-font-scale: 1;                    /* 0.8 - 1.4 */
  --a11y-line-height: 1.5;                 /* 1.5 - 2.5 */
  --a11y-letter-spacing: 0em;              /* 0 - 0.12em */
  --a11y-animation-duration: 1;            /* 0 or 1 (multiplier) */
  --a11y-transition-duration: 200ms;       /* Calculated */
  --a11y-contrast-multiplier: 1;           /* For high contrast mode */
  
  /* Font family overrides (applied via body class) */
  --font-dyslexic: 'OpenDyslexic', Arial, sans-serif;
}
```

**Conflict Check:** ✅ **NONE** - No existing variables use `a11y` prefix

---

## 3. Existing Accessibility Implementation

### Current Components

#### 3.1 HomeAccessibilityButton
- **Location:** `components/home-accessibility-button.tsx` (207 lines)
- **Used in:** `app/(public)/page.tsx` (homepage only)
- **State:** Local React state (not persisted)
- **Features:**
  - Font size: 80-140% via `document.documentElement.style.fontSize`
  - High contrast: Toggle `body.high-contrast` class
  - Reduce motion: Toggle `body.reduce-motion` class
  - Calming mode: Toggle `body.calming-mode` class
  - Reset all
- **ARIA:** ✅ Good - proper labels and roles
- **Persistence:** ❌ None - settings lost on reload

#### 3.2 AccessibilityToolbar
- **Location:** `components/accessibility-toolbar.tsx` (174 lines)
- **Used in:** Configurable via admin panel
- **State:** Local React state (not persisted)
- **Features:**
  - Text size: Cycles through `normal`/`large`/`xlarge` via body classes
  - High contrast: Toggle `body.high-contrast` class
  - Transcript toggle: Podcast pages only
  - Minimize: Collapses to floating button
- **ARIA:** ✅ Good - `aria-pressed`, `aria-label`, `aria-live`
- **Persistence:** ❌ None - settings lost on reload

### Problems Identified

1. **Duplicate Logic:** Both components apply `body.high-contrast` independently
2. **Inconsistent Methods:** 
   - HomeButton uses `fontSize` on `<html>`
   - Toolbar uses CSS classes on `<body>`
3. **No Persistence:** All settings lost on page reload
4. **State Conflicts:** Both widgets can't synchronize
5. **Limited Features:** No dyslexia font, no typography controls, minimal sensory mode

---

## 4. CSS Classes Already Defined

### Existing Accessibility Classes

```css
/* In app/globals.css */
body.high-contrast { /* Exists but implementation TBD */ }
body.reduce-motion { /* Exists but implementation TBD */ }
body.calming-mode { /* Exists but implementation TBD */ }
body.text-normal { /* Exists */ }
body.text-large { /* Exists */ }
body.text-xlarge { /* Exists */ }
```

### New Classes to Add

```css
body.dyslexia-font { /* OpenDyslexic font */ }
body.sensory-friendly { /* Comprehensive sensory mode */ }
body.link-highlight { /* Underline all links */ }
body.reading-mode { /* Distraction-free */ }
```

---

## 5. Feature Flags Setup

### Environment Variables to Add

```bash
# .env.local (development)
NEXT_PUBLIC_ENABLE_NEW_A11Y=true
NEXT_PUBLIC_ENABLE_SENSORY_MODE=true
NEXT_PUBLIC_ENABLE_DYSLEXIA_FONT=true
NEXT_PUBLIC_A11Y_ROLLOUT_PERCENTAGE=100

# .env.production (initially)
NEXT_PUBLIC_ENABLE_NEW_A11Y=false
NEXT_PUBLIC_ENABLE_SENSORY_MODE=false
NEXT_PUBLIC_ENABLE_DYSLEXIA_FONT=false
NEXT_PUBLIC_A11Y_ROLLOUT_PERCENTAGE=0
```

### Feature Flag Implementation

```typescript
// lib/feature-flags.ts (to be created)
export const ACCESSIBILITY_FLAGS = {
  NEW_SYSTEM: process.env.NEXT_PUBLIC_ENABLE_NEW_A11Y === 'true',
  SENSORY_MODE: process.env.NEXT_PUBLIC_ENABLE_SENSORY_MODE === 'true',
  DYSLEXIA_FONT: process.env.NEXT_PUBLIC_ENABLE_DYSLEXIA_FONT === 'true',
  ROLLOUT_PCT: parseInt(process.env.NEXT_PUBLIC_A11Y_ROLLOUT_PERCENTAGE || '0', 10),
}

export function isA11yEnabled(userId?: string): boolean {
  if (!ACCESSIBILITY_FLAGS.NEW_SYSTEM) return false
  if (ACCESSIBILITY_FLAGS.ROLLOUT_PCT === 100) return true
  if (ACCESSIBILITY_FLAGS.ROLLOUT_PCT === 0) return false
  
  // Percentage-based rollout (deterministic based on userId or sessionId)
  const id = userId || sessionStorage.getItem('session-id') || Math.random().toString()
  const hash = simpleHash(id)
  return (hash % 100) < ACCESSIBILITY_FLAGS.ROLLOUT_PCT
}
```

---

## 6. OpenDyslexic Font Assets

### Required Files

```
public/fonts/opendyslexic/
├── OpenDyslexic-Regular.woff2
├── OpenDyslexic-Regular.woff
├── OpenDyslexic-Bold.woff2
├── OpenDyslexic-Bold.woff
├── OpenDyslexic-Italic.woff2
├── OpenDyslexic-Italic.woff
├── OpenDyslexic-BoldItalic.woff2
├── OpenDyslexic-BoldItalic.woff
└── LICENSE.txt
```

### Download Instructions

1. **Visit:** https://opendyslexic.org/
2. **Download:** Latest release (v2.001 or newer)
3. **Extract:** Web fonts (woff2, woff formats)
4. **Place:** In `public/fonts/opendyslexic/`
5. **License:** Save LICENSE.txt alongside fonts

### License Requirements

- **License:** SIL Open Font License + Bitstream Vera License
- **Attribution Required:** Yes
- **Commercial Use:** ✅ Allowed
- **Modification:** ✅ Allowed
- **Where to attribute:**
  - Footer: "Accessibility powered by OpenDyslexic"
  - About page: Full attribution text
  - Source code: LICENSE.txt file

**Status:** ⏳ **TODO** - Download and place fonts

---

## 7. Dependencies Check

### Current package.json Check

```bash
# Run this to check current dependencies
npm list @axe-core/react jest-axe @testing-library/jest-dom
```

### Dependencies to Add

```json
{
  "devDependencies": {
    "@axe-core/react": "^4.8.0",
    "jest-axe": "^8.0.0",
    "@testing-library/jest-dom": "^6.1.5"
  }
}
```

**Status:** ⏳ **TODO** - Install after Phase 0 approval

---

## 8. Baseline Metrics

### Lighthouse Accessibility Scores (Before)

Run this command to capture baseline:

```bash
npm run build
npx lighthouse http://localhost:3000 --only-categories=accessibility --output=json --output-path=./docs/in-progress/accessibility-feature/baseline-lighthouse.json
```

**Status:** ⏳ **TODO** - Capture before Phase 1

### Pages to Benchmark

1. Homepage (/)
2. About (/about)
3. Programs (/programs)
4. Events (/events)
5. Contact (/contact)
6. Donate (/donate)

---

## 9. Git Branch Strategy

### Branch Naming

```bash
git checkout -b feature/accessibility-system-phase-0
git checkout -b feature/accessibility-system-phase-1
git checkout -b feature/accessibility-system-phase-2
# etc.
```

**Current Branch:** ⏳ **TODO** - Create branch

---

## 10. Risk Assessment

### High Risk Items

| Risk | Mitigation |
|------|------------|
| Settings conflict between old and new widgets | Feature flag + gradual rollout |
| CSS variable name collisions | Using `a11y-` prefix (checked ✅) |
| localStorage quota exceeded | Using compact JSON schema |
| Performance degradation | Performance budget + monitoring |
| Breaking existing accessibility | Keep old components working until migration complete |

### Low Risk Items

| Item | Reason |
|------|--------|
| localStorage key conflicts | Using unique `deessa-a11y-` prefix |
| Font loading issues | Using font-display: swap |
| Browser compatibility | Modern CSS features with fallbacks |

---

## 11. Checklist Summary

### Pre-Implementation Complete ✅

- [x] Audit localStorage keys → No conflicts found
- [x] Audit CSS custom properties → Safe to use `a11y-` prefix
- [x] Document existing accessibility components
- [x] Identify problems with current implementation
- [x] Plan feature flags strategy
- [x] Document OpenDyslexic font requirements
- [x] Assess risks and mitigation strategies

### Next Steps (Execute in Phase 1)

- [ ] Download OpenDyslexic fonts
- [ ] Create feature flag configuration file
- [ ] Set up environment variables
- [ ] Capture baseline Lighthouse metrics
- [ ] Create git branch
- [ ] Install testing dependencies
- [ ] Begin Phase 1 implementation

---

## Approval Sign-Off

- [ ] **Engineering Lead:** Reviewed audit findings
- [ ] **Tech Lead:** Approved feature flag strategy
- [ ] **DevOps:** Ready to support deployment
- [ ] **Product Owner:** Approved to proceed to Phase 1

**Status:** ✅ **READY TO PROCEED TO PHASE 1**

---

**Next Document:** [Phase 1 Implementation](./phase-1-implementation.md)
