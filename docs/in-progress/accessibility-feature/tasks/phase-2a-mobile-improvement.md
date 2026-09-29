# Mobile & UX Improvement Plan

**Date:** 2026-09-16  
**Component:** `components/home-accessibility-button.tsx`  
**Goal:** Improve mobile experience and keyboard navigation

---

## 🔍 Current Analysis

### What's Good ✅
- Uses React Portal (proper z-index handling)
- Fixed positioning works
- All controls have labels
- ARIA attributes present
- Responsive slider controls

### What Needs Improvement 📝

**Mobile Issues:**
1. Panel width `w-80` (320px) might be tight on 320px viewport
2. Bottom spacing might conflict with mobile browser UI
3. Touch targets should be verified (44x44px minimum)
4. Horizontal scrolling possible on small screens

**Keyboard Issues:**
1. No focus trap (focus can escape panel)
2. No Escape key handler
3. Focus doesn't return to button on close
4. No keyboard shortcut to open

**UX Issues:**
1. No keyboard help section
2. Could benefit from better mobile padding
3. Close button could be larger for touch

---

## 🎯 Safe Improvements (CSS-First Approach)

### Priority 1: Mobile CSS (Low Risk)

**Changes:**
```css
/* Responsive panel width */
w-80 → w-80 max-w-[calc(100vw-2rem)]

/* Better mobile spacing */
p-6 → p-4 sm:p-6

/* Larger close button on mobile */
p-1 → p-2

/* Better bottom spacing on mobile */
bottom: 6rem → bottom: max(6rem, env(safe-area-inset-bottom) + 1.5rem)
```

**Risk:** Very low - CSS only, easily reversible

---

### Priority 2: Focus Management (Medium Risk)

**Add:**
1. Focus trap with `useEffect`
2. Escape key handler
3. Return focus on close
4. Initial focus on first control

**Pattern:**
```tsx
const buttonRef = useRef<HTMLButtonElement>(null)
const panelRef = useRef<HTMLDivElement>(null)

// Store previous focus
useEffect(() => {
  if (isOpen) {
    previousFocus.current = document.activeElement
    // Focus first interactive element
    panelRef.current?.querySelector('button, input, select')?.focus()
  } else if (previousFocus.current) {
    previousFocus.current.focus()
  }
}, [isOpen])

// Escape key
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

**Risk:** Medium - Affects interaction, test carefully

---

### Priority 3: Keyboard Help (Low Risk)

**Add:**
```tsx
<details className="mt-4 border-t border-slate-200 pt-4">
  <summary className="text-sm font-semibold text-slate-700 cursor-pointer hover:text-primary">
    Keyboard Shortcuts
  </summary>
  <dl className="mt-2 space-y-1 text-xs text-slate-600">
    <div className="flex justify-between">
      <dt><kbd className="px-1.5 py-0.5 bg-slate-100 rounded">Esc</kbd></dt>
      <dd>Close panel</dd>
    </div>
    <div className="flex justify-between">
      <dt><kbd className="px-1.5 py-0.5 bg-slate-100 rounded">Tab</kbd></dt>
      <dd>Next control</dd>
    </div>
    <div className="flex justify-between">
      <dt><kbd className="px-1.5 py-0.5 bg-slate-100 rounded">↑↓</kbd></dt>
      <dd>Adjust sliders</dd>
    </div>
  </dl>
</details>
```

**Risk:** Very low - Adding new content only

---

## 📋 Implementation Steps (Safe Order)

### Step 1: Mobile CSS Improvements (30 min)
- [ ] Update panel responsive classes
- [ ] Improve touch target sizes
- [ ] Better mobile padding
- [ ] Test at 320px, 375px, 414px
- [ ] **Build & verify**

### Step 2: Escape Key Handler (15 min)
- [ ] Add Escape key listener
- [ ] Test with keyboard
- [ ] **Build & verify**

### Step 3: Focus Management (30 min)
- [ ] Add refs
- [ ] Store/restore previous focus
- [ ] Focus first control on open
- [ ] Test tab order
- [ ] **Build & verify**

### Step 4: Keyboard Help Section (15 min)
- [ ] Add collapsible help section
- [ ] Document shortcuts
- [ ] Test on mobile
- [ ] **Build & verify**

### Step 5: Polish (15 min)
- [ ] Review all changes
- [ ] Final mobile test
- [ ] Final keyboard test
- [ ] **Build & verify**

---

## 🧪 Test Plan After Each Step

### Build Test
```bash
pnpm build
# Must succeed with no errors
```

### Manual Test
```
Desktop:
- [ ] Panel opens/closes
- [ ] All controls work
- [ ] No visual regressions

Mobile (320px):
- [ ] Panel fits viewport
- [ ] No horizontal scroll
- [ ] Touch targets adequate
- [ ] Controls work

Keyboard:
- [ ] Tab through controls
- [ ] Escape closes
- [ ] Focus returns to button
- [ ] Sliders keyboard accessible
```

---

## ⚠️ Stop Conditions

**Rollback immediately if:**
- ❌ Build fails
- ❌ Panel doesn't open
- ❌ Controls stop working
- ❌ Mobile layout breaks
- ❌ Desktop layout breaks

**Action:** `git restore components/home-accessibility-button.tsx`

---

## 📊 Expected Outcome

**Mobile:**
- ✅ Panel fits 320px viewport
- ✅ No horizontal scrolling
- ✅ Touch-friendly controls
- ✅ Better spacing

**Keyboard:**
- ✅ Escape closes panel
- ✅ Focus returns to button
- ✅ Tab stays in panel
- ✅ Help documentation

**Safety:**
- ✅ All existing features work
- ✅ No breaking changes
- ✅ Easy to rollback

---

**Ready to implement:** Say "go" for Step 1 (Mobile CSS)
