# Technical Implementation Guide - Accessibility Features

**Version:** 2.0  
**Date:** 2026-09-16  
**Audience:** Developers, Technical Leads

---

## Overview

This document provides technical details about the accessibility feature implementation in the deessa Foundation website. It covers architecture, code organization, integration patterns, and maintenance guidelines.

---

## Architecture

### High-Level Components

```
┌─────────────────────────────────────────────┐
│         Public Layout (app/(public))        │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │   AccessibilityProvider (Context)     │ │
│  │   - Preference state management       │ │
│  │   - localStorage/sessionStorage       │ │
│  │   - CSS variable injection            │ │
│  │   - Body class management             │ │
│  │   - System preference detection       │ │
│  └───────────────────────────────────────┘ │
│                      │                      │
│       ┌──────────────┼──────────────┐      │
│       │              │              │      │
│   ┌───▼───┐  ┌───────▼───────┐  ┌──▼───┐  │
│   │ Panel │  │ useAccessibility│  │Footer│  │
│   │ Button│  │     Hook       │  │ Link │  │
│   └───────┘  └────────┬───────┘  └──────┘  │
│                       │                     │
│               ┌───────▼────────┐            │
│               │  Child Pages   │            │
│               │ (consume hook) │            │
│               └────────────────┘            │
└─────────────────────────────────────────────┘
```

### Core Files

| File | Purpose | LOC |
|------|---------|-----|
| `contexts/accessibility-provider.tsx` | Context provider, state management, persistence | ~400 |
| `components/home-accessibility-button.tsx` | Floating button & settings panel UI | ~650 |
| `lib/types/accessibility.ts` | TypeScript types, validation, migration | ~300 |
| `lib/hooks/use-accessibility.ts` | Consumer hook | ~50 |
| `lib/utils/accessibility.ts` | Utility functions | ~100 |
| `app/globals.css` (accessibility section) | Scoped CSS for features | ~500 |

**Total:** ~2,000 lines of code

---

## Data Model

### Type Definitions

```typescript
// lib/types/accessibility.ts

// Version 2 Schema (Current)
export interface AccessibilityPreferences {
  textScale: number              // 1.0 - 2.0 (100% - 200%)
  lineSpacing: number | null     // 1.5 - 2.5 or null (use default)
  letterSpacing: number | null   // 0 - 0.12 or null (use default)
  fontFamily: 'default' | 'system' | 'opendyslexic'
  highContrast: boolean
  reduceMotion: boolean
  sensoryFriendly: boolean
}

// Storage format
export interface StoredAccessibilityData {
  version: number                // Integer version (current: 2)
  preferences: AccessibilityPreferences
  lastUpdated: string            // ISO 8601 timestamp
}
```

### Default Values

```typescript
export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  textScale: 1.0,
  lineSpacing: null,    // null = use site default
  letterSpacing: null,  // null = use site default
  fontFamily: 'default',
  highContrast: false,
  reduceMotion: false,
  sensoryFriendly: false,
}
```

### Storage Configuration

```typescript
export const STORAGE_CONFIG = {
  KEY: 'deessa-a11y-preferences',
  VERSION: 2,
  MAX_SIZE: 4096, // 4 KB limit
} as const
```

---

## Implementation Details

### 1. Preference Provider

**File:** `contexts/accessibility-provider.tsx`

**Responsibilities:**
1. Load preferences from storage on mount
2. Validate and sanitize stored data
3. Migrate V1 → V2 if needed
4. Apply preferences to DOM (CSS variables, body classes)
5. Persist changes to storage
6. Provide context to child components

**Key Features:**

**Initialization:**
```typescript
useEffect(() => {
  // Try localStorage, fallback to sessionStorage
  let stored = localStorage.getItem(STORAGE_CONFIG.KEY)
  if (!stored) {
    stored = sessionStorage.getItem(STORAGE_CONFIG.KEY)
  }
  
  // Validate and load
  if (stored) {
    const parsed = JSON.parse(stored)
    if (isValidStoredData(parsed)) {
      setPreferences(validatePreferences(parsed.preferences))
    } else if (isValidStoredDataV1(parsed)) {
      // Migrate V1 to V2
      setPreferences(migrateV1toV2(parsed.preferences))
    }
  }
  
  setIsLoading(false)
}, [])
```

**Persistence:**
```typescript
useEffect(() => {
  if (isLoading) return
  
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (localError) {
    // Fallback to sessionStorage on quota error
    sessionStorage.setItem(key, JSON.stringify(data))
  }
}, [preferences, isLoading])
```

**DOM Application:**
```typescript
useEffect(() => {
  const root = document.documentElement
  
  // CSS variables
  root.style.setProperty('--a11y-text-scale', String(preferences.textScale))
  
  // Body classes
  if (preferences.highContrast) {
    document.body.classList.add('high-contrast')
  } else {
    document.body.classList.remove('high-contrast')
  }
  
  // ... (similar for other preferences)
}, [preferences])
```

---

### 2. Settings Panel Component

**File:** `components/home-accessibility-button.tsx`

**Structure:**
1. Floating button (bottom-right)
2. Modal dialog with settings
3. Focus management
4. Keyboard navigation

**Key Patterns:**

**Focus Trap:**
```typescript
useEffect(() => {
  if (isOpen) {
    // Store previous focus
    previousFocusRef.current = document.activeElement
    
    // Focus first control
    setTimeout(() => {
      const first = panelRef.current?.querySelector('button, input, select')
      first?.focus()
    }, 100)
  } else {
    // Return focus
    previousFocusRef.current?.focus()
  }
}, [isOpen])
```

**Escape Key:**
```typescript
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false)
    }
  }
  
  document.addEventListener('keydown', handleEscape)
  return () => document.removeEventListener('keydown', handleEscape)
}, [isOpen])
```

---

### 3. CSS Implementation

**File:** `app/globals.css`

**Scoping:**
All accessibility CSS is scoped to `html[data-a11y-scope="public"]` to prevent conflicts with admin area.

**CSS Variables:**
```css
html[data-a11y-scope="public"] {
  font-size: calc(100% * var(--a11y-text-scale, 1));
}

html[data-a11y-scope="public"] * {
  line-height: var(--a11y-line-height) !important;
  letter-spacing: var(--a11y-letter-spacing) !important;
}
```

**Body Classes:**
```css
body.high-contrast {
  background: #ffffff !important;
  color: #000000 !important;
}

body.reduce-motion *,
body.sensory-friendly * {
  animation-duration: 0.01ms !important;
  transition-duration: 0.01ms !important;
}

body.font-opendyslexic {
  font-family: 'OpenDyslexic', sans-serif !important;
}
```

---

## Integration Patterns

### For New Components

**1. Consume Accessibility Context:**

```typescript
import { useAccessibility } from '@/lib/hooks/use-accessibility'

export function MyComponent() {
  const { preferences } = useAccessibility()
  
  // Use preferences to adapt behavior
  const shouldAnimate = !preferences.reduceMotion && !preferences.sensoryFriendly
  
  return (
    <div>
      {shouldAnimate ? <AnimatedElement /> : <StaticElement />}
    </div>
  )
}
```

**2. Media Components (Videos, Carousels):**

```typescript
const { preferences } = useAccessibility()
const [autoplay, setAutoplay] = useState(false)

useEffect(() => {
  // Respect motion preferences
  if (preferences.reduceMotion || preferences.sensoryFriendly) {
    setAutoplay(false)
    // Stop any playing media
    videoRef.current?.pause()
  }
}, [preferences.reduceMotion, preferences.sensoryFriendly])
```

**3. Check for Modifications:**

```typescript
import { DEFAULT_ACCESSIBILITY_PREFERENCES } from '@/lib/types/accessibility'

const isModified = preferences.textScale !== DEFAULT_ACCESSIBILITY_PREFERENCES.textScale
```

---

## Migration Guide (V1 → V2)

### V1 Schema (Legacy)

```typescript
interface AccessibilityPreferencesV1 {
  textScale: number
  dyslexiaFont: boolean  // ← Changed to fontFamily enum
  highContrast: boolean
  reduceMotion: boolean
  calmingMode: boolean   // ← Renamed to sensoryFriendly
  // lineSpacing and letterSpacing didn't exist
}
```

### Migration Function

```typescript
export function migrateV1toV2(v1: AccessibilityPreferencesV1): AccessibilityPreferences {
  return {
    textScale: Math.max(1.0, Math.min(2.0, v1.textScale)),
    lineSpacing: null,  // New in V2
    letterSpacing: null, // New in V2
    fontFamily: v1.dyslexiaFont ? 'opendyslexic' : 'default',
    highContrast: Boolean(v1.highContrast),
    reduceMotion: Boolean(v1.reduceMotion),
    sensoryFriendly: Boolean(v1.calmingMode),
  }
}
```

**Triggered automatically** on first load if V1 data detected.

---

## Validation and Sanitization

### Input Validation

```typescript
export function validatePreferences(prefs: unknown): AccessibilityPreferences {
  if (typeof prefs !== 'object' || prefs === null) {
    return DEFAULT_ACCESSIBILITY_PREFERENCES
  }
  
  const p = prefs as Partial<AccessibilityPreferences>
  
  return {
    textScale: validateNumber(p.textScale, 1.0, 2.0, 1.0),
    lineSpacing: validateNullableNumber(p.lineSpacing, 1.5, 2.5),
    letterSpacing: validateNullableNumber(p.letterSpacing, 0, 0.12),
    fontFamily: validateFontFamily(p.fontFamily),
    highContrast: Boolean(p.highContrast),
    reduceMotion: Boolean(p.reduceMotion),
    sensoryFriendly: Boolean(p.sensoryFriendly),
  }
}
```

**Safety Features:**
- Type checking
- Range clamping
- Enum validation
- Null handling
- Fallback to defaults

---

## Testing

### Unit Tests (Recommended)

```typescript
// __tests__/accessibility-provider.test.tsx

describe('AccessibilityProvider', () => {
  it('loads preferences from localStorage', () => {
    localStorage.setItem('deessa-a11y-preferences', JSON.stringify({
      version: 2,
      preferences: { textScale: 1.5, /* ... */ }
    }))
    
    const { result } = renderHook(() => useAccessibility(), {
      wrapper: AccessibilityProvider
    })
    
    expect(result.current.preferences.textScale).toBe(1.5)
  })
  
  it('migrates V1 to V2', () => {
    localStorage.setItem('deessa-a11y-preferences', JSON.stringify({
      version: 1,
      preferences: { dyslexiaFont: true, /* ... */ }
    }))
    
    const { result } = renderHook(() => useAccessibility(), {
      wrapper: AccessibilityProvider
    })
    
    expect(result.current.preferences.fontFamily).toBe('opendyslexic')
  })
})
```

### Integration Tests

See `TEST-VALIDATION-GUIDE.md` for comprehensive test scenarios.

---

## Performance Considerations

### Bundle Size

- Core accessibility code: ~13 KB (gzipped)
- CSS additions: ~4 KB (gzipped)
- **Total impact:** ~17 KB

### Runtime Performance

- Preference updates: <20ms
- localStorage writes: ~2-5ms (async)
- CSS variable updates: ~1ms
- Body class toggles: <1ms

### Memory Usage

- Context state: ~75 bytes
- Component instances: ~10 KB
- Event listeners: ~1 KB
- **Total:** ~11 KB in memory

---

## Security

### XSS Prevention

✅ **No innerHTML usage** - All DOM manipulation via safe APIs:
- `style.setProperty()`
- `classList.add/remove()`
- `setAttribute()`
- React JSX (auto-escaping)

✅ **Input validation** - All user input validated and sanitized:
- Numbers clamped to safe ranges
- Enums checked against allowlist
- No arbitrary strings accepted

✅ **Type safety** - TypeScript prevents type confusion

### Storage Safety

✅ **Size limits** - 4 KB maximum prevents storage exhaustion
✅ **Error handling** - Graceful degradation on storage failure
✅ **No sensitive data** - Only UI preferences stored

---

## Deployment Checklist

### Before Launch

- [ ] Run build: `npm run build`
- [ ] Verify bundle size: Check `.next/static/chunks`
- [ ] Test on production domain
- [ ] Verify CSP headers allow inline styles
- [ ] Test localStorage in different browsers
- [ ] Test private/incognito mode
- [ ] Verify font files deployed (`/public/fonts/`)
- [ ] Test mobile devices (iOS, Android)
- [ ] Run Lighthouse audit
- [ ] Test with screen readers

### Post-Launch Monitoring

- Monitor error rates (storage failures)
- Track Core Web Vitals (should be unchanged)
- Collect user feedback
- Monitor browser console for warnings

---

## Maintenance

### Adding a New Preference

**1. Update Types:**

```typescript
// lib/types/accessibility.ts
export interface AccessibilityPreferences {
  // ... existing
  newPreference: string  // Add new field
}

export const DEFAULT_ACCESSIBILITY_PREFERENCES = {
  // ... existing
  newPreference: 'default-value',
}
```

**2. Update Validation:**

```typescript
export function validatePreferences(prefs: unknown): AccessibilityPreferences {
  // ...
  return {
    // ... existing
    newPreference: validateNewPreference(p.newPreference),
  }
}
```

**3. Update Provider:**

```typescript
// Apply to DOM
useEffect(() => {
  if (preferences.newPreference) {
    document.body.classList.add('new-preference')
  }
}, [preferences.newPreference])
```

**4. Add UI Control:**

```typescript
// components/home-accessibility-button.tsx
<button onClick={() => updatePreference('newPreference', newValue)}>
  New Preference
</button>
```

**5. Add CSS:**

```css
/* app/globals.css */
body.new-preference {
  /* styles */
}
```

**6. Increment Version (if breaking change):**

```typescript
export const STORAGE_CONFIG = {
  VERSION: 3,  // Increment
}
```

**7. Write Migration:**

```typescript
export function migrateV2toV3(v2: PreferencesV2): PreferencesV3 {
  return {
    ...v2,
    newPreference: 'default-value',
  }
}
```

### Removing a Preference

**Don't remove fields immediately** - Deprecated fields should:
1. Remain in types (marked as deprecated)
2. Have migration path to new structure
3. Be removed after 2 major versions

---

## Troubleshooting

### Common Issues

**Issue: Preferences not persisting**

**Cause:** localStorage quota exceeded or disabled  
**Solution:** Check fallback to sessionStorage is working  
**Debug:**
```javascript
console.log(localStorage.getItem('deessa-a11y-preferences'))
```

---

**Issue: Text scaling breaks layout**

**Cause:** Fixed heights or widths  
**Solution:** Use `min-height` instead of `height`, remove `overflow: hidden`  
**CSS Fix:**
```css
.element {
  min-height: 200px;  /* Not height: 200px */
  overflow: visible;   /* Not overflow: hidden */
}
```

---

**Issue: High contrast colors not applying**

**Cause:** CSS specificity conflict  
**Solution:** Use `!important` on accessibility overrides  
**Debug:**
```javascript
console.log(document.body.classList.contains('high-contrast'))
```

---

**Issue: Font not loading**

**Cause:** Font file missing or blocked by CSP  
**Solution:** Verify file at `/public/fonts/OpenDyslexic-Regular.woff2`  
**Check CSP:** `font-src 'self'` should be allowed

---

## API Reference

### Context Hook

```typescript
const {
  preferences,        // Current preferences object
  updatePreference,   // (key, value) => void
  resetPreference,    // (key) => void
  resetAll,          // () => void
  isLoading,         // boolean
} = useAccessibility()
```

### Update Functions

```typescript
// Update single preference
updatePreference('textScale', 1.5)
updatePreference('highContrast', true)

// Reset single preference
resetPreference('textScale')

// Reset all preferences
resetAll()
```

---

## Further Reading

- **User Guide:** `USER-ACCESSIBILITY-GUIDE.md`
- **Test Guide:** `TEST-VALIDATION-GUIDE.md`
- **Performance Audit:** `PERFORMANCE-PRIVACY-AUDIT.md`
- **Verification Report:** `PHASE-5-VERIFICATION.md`
- **WCAG 2.2:** https://www.w3.org/WAI/WCAG22/quickref/

---

**Document Maintained By:** Development Team  
**Last Updated:** 2026-09-16  
**Questions:** Contact dev team or [accessibility@deeshafoundation.org]
