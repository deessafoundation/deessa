# Accessibility Schema Migration Plan

**Date:** 2026-09-16  
**Goal:** Update schema to match specification WITHOUT breaking existing users  
**Strategy:** Backwards-compatible migration with fallbacks

---

## 📋 Summary of Changes

| Change | Current | New | Breaking? | Migration |
|--------|---------|-----|-----------|-----------|
| Text scale range | 0.8-1.4 | 1.0-2.0 | ⚠️ Yes | Clamp to new range |
| Font family | Boolean | Enum | ⚠️ Yes | Map boolean to enum |
| Line spacing | 1.5 (always) | null \| 1.5-2.5 | ✅ No | Keep existing values |
| Letter spacing | 0 (always) | null \| 0-0.12 | ✅ No | Keep existing values |
| Version | String "1.0" | Integer 1 | ⚠️ Yes | Parse or new version |

---

## 🎯 Migration Strategy: Version Bump

**Approach:** Create **version 2** schema, migrate from version 1

### Why Not In-Place Update?
- Safer: old and new formats coexist during transition
- Clear: version 2 has explicit meaning
- Testable: can validate both formats
- Reversible: can rollback if needed

---

## 📝 Schema Definitions

### Version 1 (Current - Being Deprecated)

```typescript
interface AccessibilityPreferencesV1 {
  textScale: number              // 0.8-1.4
  dyslexiaFont: boolean          // true/false
  highContrast: boolean
  reduceMotion: boolean
  sensoryFriendly: boolean
  linkHighlight: boolean
  lineSpacing: number            // 1.5-2.5 (always has value)
  letterSpacing: number          // 0-0.12 (always has value)
  readingMode: boolean
}

interface StoredAccessibilityDataV1 {
  version: "1" | "1.0"           // String format
  preferences: AccessibilityPreferencesV1
  lastUpdated: string
}
```

### Version 2 (New - Spec-Aligned)

```typescript
interface AccessibilityPreferencesV2 {
  textScale: number              // 1.0-2.0 (NEW RANGE)
  fontFamily: 'default' | 'system' | 'opendyslexic'  // NEW: enum
  highContrast: boolean
  reduceMotion: boolean
  sensoryFriendly: boolean
  linkHighlight: boolean
  lineSpacing: number | null     // NEW: null = site default
  letterSpacing: number | null   // NEW: null = site default
  readingMode: boolean
}

interface StoredAccessibilityDataV2 {
  version: 2                     // NEW: integer
  preferences: AccessibilityPreferencesV2
  lastUpdated: string
}
```

---

## 🔄 Migration Logic

### Step 1: Read Storage

```typescript
function loadPreferences(): AccessibilityPreferencesV2 {
  try {
    const stored = localStorage.getItem('deessa-a11y-preferences')
    if (!stored) {
      return DEFAULT_PREFERENCES_V2
    }
    
    const parsed = JSON.parse(stored)
    
    // Check version
    if (parsed.version === 2) {
      // Already V2 - validate and use
      return validateV2(parsed.preferences)
    }
    
    if (parsed.version === "1" || parsed.version === "1.0" || parsed.version === 1) {
      // V1 - migrate to V2
      return migrateV1toV2(parsed.preferences)
    }
    
    // Unknown version - use defaults
    console.warn('Unknown preference version:', parsed.version)
    return DEFAULT_PREFERENCES_V2
    
  } catch (error) {
    console.error('Failed to load preferences:', error)
    return DEFAULT_PREFERENCES_V2
  }
}
```

### Step 2: Migrate V1 → V2

```typescript
function migrateV1toV2(v1: AccessibilityPreferencesV1): AccessibilityPreferencesV2 {
  console.log('Migrating preferences from V1 to V2...')
  
  // 1. TEXT SCALE: Clamp 0.8-1.4 to 1.0-2.0 range
  //    If user had 0.8 (80%), give them 1.0 (100%) - minimum
  //    If user had 1.0 (100%), keep at 1.0 (100%)
  //    If user had 1.4 (140%), keep at 1.4 (140%)
  const textScale = Math.max(1.0, Math.min(2.0, v1.textScale))
  
  // 2. FONT FAMILY: Map boolean to enum
  //    dyslexiaFont: false → fontFamily: 'default'
  //    dyslexiaFont: true → fontFamily: 'opendyslexic'
  const fontFamily = v1.dyslexiaFont ? 'opendyslexic' : 'default'
  
  // 3. LINE SPACING: Keep existing value (already in valid range)
  //    V1: always has value, V2: can be null
  //    Keep user's choice, don't force null
  const lineSpacing = v1.lineSpacing
  
  // 4. LETTER SPACING: Keep existing value
  //    V1: always has value (often 0), V2: can be null
  //    If user had 0, they likely want "normal" → could convert to null
  //    But safer to keep their explicit choice
  const letterSpacing = v1.letterSpacing
  
  // 5. Everything else: direct copy
  return {
    textScale,
    fontFamily,
    highContrast: v1.highContrast,
    reduceMotion: v1.reduceMotion,
    sensoryFriendly: v1.sensoryFriendly,
    linkHighlight: v1.linkHighlight,
    lineSpacing,
    letterSpacing,
    readingMode: v1.readingMode,
  }
}
```

### Step 3: Save V2

```typescript
function savePreferences(prefs: AccessibilityPreferencesV2) {
  const dataToStore: StoredAccessibilityDataV2 = {
    version: 2,  // Always save as V2
    preferences: prefs,
    lastUpdated: new Date().toISOString(),
  }
  
  localStorage.setItem('deessa-a11y-preferences', JSON.stringify(dataToStore))
  console.log('✅ Preferences saved as V2')
}
```

---

## ⚠️ Breaking Change Handling

### Text Scale: 80% Users → 100%

**Impact:** Users who set 80% (smaller text) will get 100% (normal)

**Justification:**
- Spec doesn't support below 100%
- 80% text is unusual accessibility need
- Most users use 100%+
- Better to be conservative (larger is more accessible)

**Mitigation:**
- Log when clamping occurs
- Could show one-time notice: "Text size adjusted to new minimum"
- Unlikely to affect many users

### Font: OpenDyslexic Toggle → Font Picker

**Impact:** UI changes from toggle to dropdown

**Migration:**
- ✅ Preserves user choice perfectly
- `dyslexiaFont: true` → `fontFamily: 'opendyslexic'` ✅
- `dyslexiaFont: false` → `fontFamily: 'default'` ✅

**UI Before:**
```
[✓] OpenDyslexic Font
```

**UI After:**
```
Font: [Default ▼]
      - Default
      - System
      - OpenDyslexic
```

**No Data Loss** - just better UI

---

## 🎨 New UI Components Needed

### Font Family Selector

```typescript
// New dropdown component
<select 
  value={preferences.fontFamily}
  onChange={(e) => updatePreference('fontFamily', e.target.value)}
>
  <option value="default">Default (Site Font)</option>
  <option value="system">System Font</option>
  <option value="opendyslexic">OpenDyslexic (Dyslexia-Friendly)</option>
</select>
```

### Spacing with "Site Default" Option

```typescript
// Line spacing - add "Site Default" option
<div>
  <label>
    <input 
      type="checkbox" 
      checked={preferences.lineSpacing === null}
      onChange={(e) => updatePreference('lineSpacing', e.target.checked ? null : 1.5)}
    />
    Use site default
  </label>
  
  {preferences.lineSpacing !== null && (
    <input 
      type="range"
      min="1.5"
      max="2.5"
      step="0.1"
      value={preferences.lineSpacing}
      onChange={(e) => updatePreference('lineSpacing', parseFloat(e.target.value))}
    />
  )}
</div>
```

---

## 🧪 Testing Strategy

### Test Cases:

1. **New User (No Storage)**
   - ✅ Gets V2 defaults
   - ✅ textScale: 1.0
   - ✅ fontFamily: 'default'
   - ✅ lineSpacing: 1.5
   - ✅ letterSpacing: 0

2. **Existing User with V1 (dyslexiaFont: false)**
   - ✅ Migrates to V2
   - ✅ textScale clamped if needed
   - ✅ fontFamily: 'default'
   - ✅ Keeps spacing values

3. **Existing User with V1 (dyslexiaFont: true)**
   - ✅ Migrates to V2
   - ✅ fontFamily: 'opendyslexic'
   - ✅ Font still applies correctly

4. **Existing User with V1 (textScale: 0.8)**
   - ✅ Migrates to V2
   - ✅ textScale → 1.0 (clamped)
   - ⚠️ Possible notice shown

5. **User with V2 Already**
   - ✅ No migration
   - ✅ Direct validation

6. **Corrupted Storage**
   - ✅ Falls back to defaults
   - ✅ No crash

---

## 📅 Deployment Plan

### Phase 1: Code Update (No Breaking Changes Yet)

1. **Add V2 types alongside V1**
   ```typescript
   // Keep both versions
   interface AccessibilityPreferencesV1 { }
   interface AccessibilityPreferencesV2 { }
   ```

2. **Add migration function**
   - Test thoroughly
   - Handle all edge cases

3. **Deploy with V1 still active**
   - No user impact yet
   - Just code preparation

### Phase 2: Enable Migration (Soft Launch)

4. **Enable V2 reading**
   - Provider reads V1, migrates to V2 in memory
   - Still saves as V1 (no writes yet)
   - Test extensively

5. **Monitor for issues**
   - Check logs for migration errors
   - Verify no breaking changes

### Phase 3: Write V2 (Full Migration)

6. **Enable V2 writing**
   - Now saves as V2
   - Old users migrate on first edit
   - New users start with V2

7. **Monitor migration**
   - Track % of users on V2
   - Check for any edge cases

### Phase 4: Cleanup (Future)

8. **Remove V1 support** (after 90 days)
   - All users migrated
   - Can remove V1 types/code
   - Simplify codebase

---

## 🛡️ Safety Measures

### Prevent Data Loss:

1. **Never delete V1 immediately**
   - Migration keeps old data
   - Can rollback if needed

2. **Validate before saving**
   - Ensure V2 data is valid
   - Reject malformed data

3. **Graceful fallback**
   - If anything fails → use defaults
   - Never crash the app

4. **Logging**
   - Log all migrations
   - Track success/failure
   - Monitor in production

### Rollback Plan:

If migration causes issues:

```typescript
// Emergency rollback: revert to V1
const FORCE_V1 = true  // Feature flag

if (FORCE_V1) {
  // Temporarily read V1 only
  // Don't migrate
  // Gives time to fix issues
}
```

---

## ✅ Migration Checklist

### Before Implementation:

- [x] Document V1 and V2 schemas
- [x] Write migration function
- [x] Plan test cases
- [x] Get approval for breaking changes

### During Implementation:

- [ ] Create V2 types
- [ ] Write migration logic
- [ ] Add validation
- [ ] Update UI components
- [ ] Write unit tests
- [ ] Test with real V1 data

### Before Deployment:

- [ ] Test migration with various V1 states
- [ ] Test with no storage
- [ ] Test with corrupted storage
- [ ] Review logs for edge cases
- [ ] Prepare rollback procedure
- [ ] Document for users (if needed)

### After Deployment:

- [ ] Monitor migration success rate
- [ ] Check for errors in logs
- [ ] Verify UI works correctly
- [ ] Test on multiple browsers
- [ ] Gather user feedback

---

## 🎯 Success Criteria

**Migration is successful when:**

- ✅ All existing users keep their preferences
- ✅ OpenDyslexic users still see OpenDyslexic
- ✅ Text sizes preserved (except 80% → 100% clamp)
- ✅ No crashes or errors
- ✅ UI updates work smoothly
- ✅ New users get V2 from start
- ✅ Schema matches specification

---

## 📊 Expected Impact

**Users Affected:**
- Existing users with V1 preferences: **Auto-migrated** ✅
- New users: **Start with V2** ✅

**User-Visible Changes:**
- Text scale minimum: 80% → 100% (if anyone used 80%)
- Font control: Toggle → Dropdown (adds "System" option)
- Spacing: Can now select "Site Default"

**Developer Impact:**
- Updated types
- Migration code added
- New validation logic
- Updated UI components

**Timeline:**
- Implementation: 4-6 hours
- Testing: 2-3 hours
- Deployment: Gradual (Phase 1-3)
- Full migration: 30-90 days

---

**Status:** ✅ Approved, Ready to Implement  
**Risk Level:** 🟡 Medium (breaking changes, but well-mitigated)  
**Confidence:** 🟢 High (clear plan, testable, reversible)
