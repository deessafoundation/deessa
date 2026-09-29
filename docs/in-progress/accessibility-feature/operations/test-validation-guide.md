# Accessibility Feature Test Validation Guide

**Version:** 1.0  
**Date:** 2026-09-16  
**Target:** WCAG 2.2 Level AA  
**Status:** Ready for Execution

---

## Document Purpose

This guide provides step-by-step test scenarios for validating the deessa Foundation accessibility features. It covers:
- Manual testing procedures
- Automated testing recommendations
- Acceptance criteria for each feature
- Browser/device test matrix
- Bug reporting template

---

## Table of Contents

1. [Test Environment Setup](#1-test-environment-setup)
2. [Feature Test Scenarios](#2-feature-test-scenarios)
3. [Keyboard Navigation Tests](#3-keyboard-navigation-tests)
4. [Screen Reader Tests](#4-screen-reader-tests)
5. [Mobile/Touch Tests](#5-mobiletouch-tests)
6. [Persistence Tests](#6-persistence-tests)
7. [Integration Tests](#7-integration-tests)
8. [Performance Tests](#8-performance-tests)
9. [Browser/Device Matrix](#9-browserdevice-matrix)
10. [Bug Reporting](#10-bug-reporting)

---

## 1. Test Environment Setup

### 1.1 Required Test Environments

**Desktop Browsers:**
- ✅ Chrome (latest) on Windows
- ✅ Firefox (latest) on Windows
- ✅ Safari (latest) on macOS
- ✅ Edge (latest) on Windows

**Mobile Devices:**
- ✅ iOS Safari (iPhone 12+, iOS 15+)
- ✅ Android Chrome (Pixel/Samsung, Android 11+)

**Screen Readers:**
- ✅ NVDA (latest) + Chrome/Firefox on Windows
- ✅ VoiceOver + Safari on macOS
- ✅ VoiceOver + Safari on iOS
- ✅ TalkBack + Chrome on Android

### 1.2 Test URLs

**Local Development:**
```
http://localhost:3000
```

**Staging/Preview:**
```
https://[preview-url].vercel.app
```

**Production (when deployed):**
```
https://deessafoundation.com
```

### 1.3 Test Data Preparation

**localStorage Key:**
```
deessa-a11y-preferences
```

**Test Preference JSON:**
```json
{
  "version": 2,
  "textScale": 1.5,
  "lineSpacing": 2.0,
  "letterSpacing": 0.08,
  "fontFamily": "opendyslexic",
  "highContrast": true,
  "reduceMotion": true,
  "sensoryFriendly": true
}
```

**Reset State:**
```javascript
// In browser console
localStorage.removeItem('deessa-a11y-preferences')
location.reload()
```

---

## 2. Feature Test Scenarios

### 2.1 Text Size Control

**Feature ID:** FEAT-001  
**Control Type:** Buttons + Visual Progress Bar  
**Range:** 100% - 200% (1.0 - 2.0)

#### Test Case 2.1.1: Increase Text Size

**Steps:**
1. Open homepage
2. Click floating accessibility button (blue circle, bottom right)
3. Verify panel opens
4. Click "+" (ZoomIn) button in "Text Size" section
5. Observe text size increase

**Expected Results:**
- ✅ Text size increases by ~10% per click
- ✅ Percentage label updates (e.g., "100%" → "110%")
- ✅ Progress bar fills proportionally
- ✅ All text on page scales (headings, body, buttons)
- ✅ Layout does not break
- ✅ Button becomes disabled at 200%
- ✅ Amber "Modified" indicator appears

**Acceptance Criteria:**
- Text scales smoothly without layout breaks
- Maximum 200% limit enforced
- No horizontal scrolling at 320px viewport width
- Setting persists on page reload

#### Test Case 2.1.2: Decrease Text Size

**Steps:**
1. With text size at 150%
2. Click "-" (ZoomOut) button
3. Observe text size decrease

**Expected Results:**
- ✅ Text size decreases by ~10% per click
- ✅ Percentage label updates
- ✅ Progress bar empties proportionally
- ✅ Button becomes disabled at 100%
- ✅ Modified indicator disappears at default (100%)

#### Test Case 2.1.3: Individual Reset

**Steps:**
1. Increase text size to 150%
2. Click reset icon (↻) next to "Text Size" label
3. Verify reset

**Expected Results:**
- ✅ Text size returns to 100%
- ✅ Modified indicator disappears
- ✅ Other settings remain unchanged
- ✅ Setting persists as 100%

**Priority:** P0 (Critical)  
**WCAG:** 1.4.4 Resize Text (Level AA)

---

### 2.2 Line Spacing Control

**Feature ID:** FEAT-002  
**Control Type:** Range Slider  
**Range:** 1.5 - 2.5

#### Test Case 2.2.1: Adjust Line Spacing

**Steps:**
1. Open accessibility panel
2. Locate "Line Spacing" slider
3. Drag slider to right (increase)
4. Observe spacing changes

**Expected Results:**
- ✅ Line height increases in real-time
- ✅ Value label updates (e.g., "1.5" → "2.0")
- ✅ Applied to all text content (paragraphs, lists, etc.)
- ✅ No text clipping or overflow
- ✅ Modified indicator appears when ≠ null (default)

**Keyboard Test:**
- ✅ Focus slider with Tab
- ✅ Use ← → to adjust (0.1 step)
- ✅ Use Home/End for min/max
- ✅ Screen reader announces value

#### Test Case 2.2.2: Default State (null)

**Steps:**
1. Fresh install (no saved preferences)
2. Open panel
3. Check Line Spacing value

**Expected Results:**
- ✅ Shows "Default" instead of numeric value
- ✅ No modified indicator
- ✅ Line spacing uses authored CSS values

**Priority:** P1 (High)  
**WCAG:** 1.4.12 Text Spacing (Level AA)

---

### 2.3 Letter Spacing Control

**Feature ID:** FEAT-003  
**Control Type:** Range Slider  
**Range:** 0% - 12% (0 - 0.12em)

#### Test Case 2.3.1: Adjust Letter Spacing

**Steps:**
1. Open accessibility panel
2. Locate "Letter Spacing" slider
3. Drag slider to right
4. Observe character spacing changes

**Expected Results:**
- ✅ Space between letters increases
- ✅ Value label shows percentage (e.g., "8%")
- ✅ Applied to all text
- ✅ Text remains readable at maximum (12%)
- ✅ Modified indicator appears when ≠ null

**Accessibility:**
- ✅ Slider labeled with id/for
- ✅ aria-valuenow updates
- ✅ Keyboard navigation works

**Priority:** P1 (High)  
**WCAG:** 1.4.12 Text Spacing (Level AA)

---

### 2.4 Font Family Control

**Feature ID:** FEAT-004  
**Control Type:** Select Dropdown  
**Options:** Default, System, OpenDyslexic

#### Test Case 2.4.1: Change to System Font

**Steps:**
1. Open accessibility panel
2. Locate "Font Family" dropdown
3. Select "System"
4. Observe font change

**Expected Results:**
- ✅ All text uses system font stack:
  - macOS: San Francisco
  - Windows: Segoe UI
  - Android: Roboto
  - Fallback: Arial
- ✅ Font loads instantly (no download)
- ✅ Modified indicator appears
- ✅ Readable with all scripts (English, Nepali)

#### Test Case 2.4.2: Change to OpenDyslexic

**Steps:**
1. Select "OpenDyslexic" from dropdown
2. Wait for font loading
3. Verify font change

**Expected Results:**
- ✅ OpenDyslexic font loads
- ✅ Applied to all text including headings
- ✅ Font file loads from `/public/fonts/` directory
- ✅ Loading status visible (if slow connection)
- ✅ Fallback font shows during load

**Negative Test:**
1. Block font file (DevTools Network tab)
2. Select OpenDyslexic
3. Verify graceful fallback

**Expected:**
- ✅ Sans-serif fallback remains readable
- ✅ No layout breaks
- ✅ User informed of loading issue (recommended)

#### Test Case 2.4.3: Reset to Default

**Steps:**
1. With OpenDyslexic selected
2. Click reset icon
3. Verify default restored

**Expected Results:**
- ✅ Returns to site's default font (Inter/system stack)
- ✅ Modified indicator disappears
- ✅ No flash of unstyled text

**Priority:** P1 (High)  
**WCAG:** User preference support

---

### 2.5 High Contrast Mode

**Feature ID:** FEAT-005  
**Control Type:** Toggle Button  
**States:** ON / OFF

#### Test Case 2.5.1: Enable High Contrast

**Steps:**
1. Open accessibility panel
2. Click "High Contrast" toggle button
3. Observe color changes

**Expected Results:**
- ✅ Background becomes pure white (#ffffff)
- ✅ Text becomes pure black (#000000)
- ✅ Border contrast increases
- ✅ Button shows "ON" state
- ✅ `aria-pressed="true"` set
- ✅ Modified indicator appears
- ✅ Body class `high-contrast` added

**Visual Verification:**
- All text readable (no gray on gray)
- Focus indicators highly visible
- Interactive elements clearly distinguished
- No loss of information

#### Test Case 2.5.2: Contrast Ratios

**Manual Check with Color Picker:**

| Element | Foreground | Background | Required | Actual |
|---------|-----------|------------|----------|--------|
| Body text | #000000 | #ffffff | ≥4.5:1 | 21:1 ✅ |
| Headings | #000000 | #ffffff | ≥4.5:1 | 21:1 ✅ |
| Links | TBD | #ffffff | ≥4.5:1 | TBD |
| Buttons | TBD | TBD | ≥3:1 | TBD |

**Tool:** WebAIM Contrast Checker or browser DevTools

**Priority:** P0 (Critical)  
**WCAG:** 1.4.3 Contrast (Minimum) (Level AA)

---

### 2.6 Reduce Motion Mode

**Feature ID:** FEAT-006  
**Control Type:** Toggle Button  
**States:** ON / OFF

#### Test Case 2.6.1: Enable Reduce Motion

**Steps:**
1. Open homepage (with animations playing)
2. Open accessibility panel
3. Click "Reduce Motion" toggle
4. Observe animation changes

**Expected Results:**
- ✅ Hero carousel stops autoplay
- ✅ Testimonial carousel stops autoplay
- ✅ Intro video does not autoplay
- ✅ Ken Burns effect disabled on images
- ✅ Scroll animations become instant
- ✅ CSS transitions/animations disabled
- ✅ Framer Motion respects preference
- ✅ Button shows "ON" state

**Components to Verify:**
1. ✅ HeroCarousel - autoplay stops
2. ✅ CircularTestimonials - autoplay stops
3. ✅ HomeTestimonialsSlider - autoplay stops
4. ✅ IntroVideo - skips entirely
5. ✅ HeroVideo - pauses, no retry
6. ✅ ScrollAnimations - instant reveal
7. ✅ CSS animations - disabled

**CSS Verification:**
```css
body.reduce-motion * {
  animation: none !important;
  transition: none !important;
}
```

**Manual Test:**
- Scroll through homepage
- Navigate to /about, /events, /stories
- Verify no unexpected motion

#### Test Case 2.6.2: Manual Controls Still Work

**Steps:**
1. With Reduce Motion ON
2. Click carousel next/prev arrows
3. Click video play button

**Expected Results:**
- ✅ Manual navigation still works
- ✅ Transitions instant (no animation)
- ✅ User-initiated playback allowed
- ✅ No autoplay or auto-resume

**Priority:** P0 (Critical)  
**WCAG:** 2.3.3 Animation from Interactions (Level AAA target), 2.2.2 Pause, Stop, Hide (Level A)

---

### 2.7 Sensory-Friendly Mode

**Feature ID:** FEAT-007  
**Control Type:** Toggle Button  
**States:** ON / OFF

#### Test Case 2.7.1: Enable Sensory-Friendly

**Steps:**
1. Open accessibility panel
2. Click "Sensory-Friendly Mode" toggle
3. Observe visual simplification

**Expected Results:**
- ✅ All shadows removed (`box-shadow: none !important`)
- ✅ Image saturation reduced to 80%
- ✅ Decorative patterns simplified/hidden
- ✅ Gradient backgrounds may simplify (if implemented)
- ✅ Motion disabled (if not already)
- ✅ Button shows "ON" state
- ✅ Body class `sensory-friendly` added

**Visual Verification:**
- Page feels calmer, less busy
- Content hierarchy still clear
- Functional elements preserved
- No information loss

#### Test Case 2.7.2: Combined with Other Settings

**Steps:**
1. Enable Sensory-Friendly Mode
2. Enable High Contrast
3. Increase Text Size to 150%
4. Select OpenDyslexic font

**Expected Results:**
- ✅ All settings work together
- ✅ No conflicts or visual glitches
- ✅ Page remains usable
- ✅ Performance acceptable

**Priority:** P1 (High)  
**WCAG:** User preference support (best practice)

---

### 2.8 Reset All Functionality

**Feature ID:** FEAT-008  
**Control Type:** Button

#### Test Case 2.8.1: Reset All Preferences

**Steps:**
1. Configure multiple settings:
   - Text Size: 150%
   - High Contrast: ON
   - Reduce Motion: ON
   - Font: OpenDyslexic
2. Click "Reset All" button at bottom of panel
3. Verify complete reset

**Expected Results:**
- ✅ All settings return to defaults:
  - Text Scale: 100%
  - Line Spacing: null (Default)
  - Letter Spacing: null (Default)
  - Font Family: 'default'
  - High Contrast: OFF
  - Reduce Motion: OFF
  - Sensory-Friendly: OFF
- ✅ All modified indicators disappear
- ✅ Page appearance returns to default
- ✅ localStorage cleared
- ✅ OS-level preferences (if any) still respected

**User Feedback:**
- ✅ Confirmation required before reset (or instant with undo option)
- ✅ Visual feedback that reset occurred

**Priority:** P0 (Critical)

---

## 3. Keyboard Navigation Tests

### 3.1 Launch and Close Panel

**Test Case KB-001: Open Panel with Keyboard**

**Steps:**
1. Load homepage
2. Press Tab until floating button has focus
3. Press Space or Enter
4. Verify panel opens

**Expected Results:**
- ✅ Focus visible on button
- ✅ Panel opens on Space/Enter
- ✅ Focus moves to first control in panel
- ✅ Screen reader announces: "Dialog, Accessibility"

**Test Case KB-002: Close Panel with Escape**

**Steps:**
1. With panel open
2. Press Escape key

**Expected Results:**
- ✅ Panel closes
- ✅ Focus returns to launcher button
- ✅ No keyboard trap

**Test Case KB-003: Close Panel with Close Button**

**Steps:**
1. With panel open
2. Tab to Close button (X)
3. Press Space or Enter

**Expected Results:**
- ✅ Panel closes
- ✅ Focus returns to launcher button

---

### 3.2 Control Navigation

**Test Case KB-004: Tab Through All Controls**

**Steps:**
1. Open panel
2. Press Tab repeatedly
3. Note focus order

**Expected Tab Order:**
1. Close button (X)
2. Text Size - Reset (if modified)
3. Text Size - Decrease (-)
4. Text Size - Increase (+)
5. Line Spacing - Reset (if modified)
6. Line Spacing - Slider
7. Letter Spacing - Reset (if modified)
8. Letter Spacing - Slider
9. Font Family - Reset (if modified)
10. Font Family - Select dropdown
11. High Contrast - Reset (if modified)
12. High Contrast - Toggle button
13. Reduce Motion - Reset (if modified)
14. Reduce Motion - Toggle button
15. Sensory-Friendly - Reset (if modified)
16. Sensory-Friendly - Toggle button
17. Reset All button
18. Keyboard Help - Details toggle

**Verification:**
- ✅ Order is logical (top to bottom)
- ✅ No tab stops on non-interactive elements
- ✅ Focus always visible
- ✅ No focus surprises

**Test Case KB-005: Reverse Tab (Shift+Tab)**

**Steps:**
1. Tab to last control (Keyboard Help)
2. Hold Shift and press Tab repeatedly
3. Verify reverse order

**Expected Results:**
- ✅ Focus moves backward in reverse order
- ✅ All controls reachable
- ✅ No traps or skips

---

### 3.3 Slider Keyboard Operation

**Test Case KB-006: Adjust Sliders with Arrows**

**Steps:**
1. Tab to Line Spacing slider
2. Press Right Arrow
3. Press Left Arrow
4. Press Home
5. Press End

**Expected Results:**
- ✅ Right Arrow: Increases value by 0.1
- ✅ Left Arrow: Decreases value by 0.1
- ✅ Home: Jumps to minimum (1.5)
- ✅ End: Jumps to maximum (2.5)
- ✅ Value label updates in real-time
- ✅ Screen reader announces new value

**Repeat for Letter Spacing slider:**
- ✅ Step: 0.01
- ✅ Min: 0
- ✅ Max: 0.12

---

### 3.4 Toggle Button Operation

**Test Case KB-007: Toggle with Space/Enter**

**Steps:**
1. Tab to "High Contrast" toggle
2. Press Space
3. Press Enter (should also work)

**Expected Results:**
- ✅ Both Space and Enter toggle the button
- ✅ Visual state changes (ON/OFF)
- ✅ aria-pressed updates
- ✅ Screen reader announces new state
- ✅ High contrast CSS applies immediately

---

### 3.5 Focus Trap

**Test Case KB-008: Focus Containment**

**Steps:**
1. Open panel
2. Tab through all controls to last element
3. Press Tab again

**Expected Results:**
- ✅ Focus wraps to first control (Close button)
- ✅ Focus does not escape to page behind panel
- ✅ Background effectively inert

**Test Case KB-009: Shift+Tab from First Control**

**Steps:**
1. Focus on Close button (first control)
2. Press Shift+Tab

**Expected Results:**
- ✅ Focus wraps to last control
- ✅ No focus on page behind panel

---

## 4. Screen Reader Tests

### 4.1 NVDA (Windows) Tests

**Test SR-001: Open Panel Announcement**

**Environment:** NVDA + Chrome/Firefox on Windows

**Steps:**
1. Navigate to homepage with NVDA running
2. Tab to accessibility button
3. Press Enter

**Expected Announcement:**
```
"Accessibility options, button, collapsed"
[Press Enter]
"Dialog, Accessibility"
"Close accessibility panel, button"
```

**Verification:**
- ✅ Role announced as "dialog"
- ✅ Dialog title announced
- ✅ First control announced

---

**Test SR-002: Navigate Controls**

**Steps:**
1. With panel open, press Tab through controls
2. Listen to announcements

**Expected Announcements:**

| Control | Expected |
|---------|----------|
| Text Size Decrease | "Decrease font size, button" |
| Text Size Increase | "Increase font size, button" |
| Line Spacing | "Line spacing slider, 1.5, 1.5 to 2.5" |
| High Contrast | "High Contrast, toggle button, not pressed" |
| (After press) | "High Contrast, toggle button, pressed" |

**Verification:**
- ✅ All buttons have meaningful names
- ✅ Toggle state announced correctly
- ✅ Slider values announced
- ✅ No "button button" or "unlabeled"

---

**Test SR-003: Modified Indicators**

**Steps:**
1. Increase text size to 150%
2. Tab to Text Size label area
3. Listen for modified announcement

**Expected:**
```
"Text Size (150%), Modified from default"
```

**Verification:**
- ✅ Indicator announced inline with label
- ✅ Not just "dot" or "image"

---

**Test SR-004: Slider Interaction**

**Steps:**
1. Tab to Line Spacing slider
2. Press Right Arrow 3 times
3. Listen to announcements

**Expected:**
```
"Line spacing slider, 1.5, 1.5 to 2.5"
[Right Arrow]
"1.6"
[Right Arrow]
"1.7"
[Right Arrow]
"1.8"
```

**Verification:**
- ✅ Value announced on each change
- ✅ No lag or missing announcements
- ✅ aria-valuenow working

---

### 4.2 VoiceOver (macOS) Tests

**Test SR-005: Panel Navigation**

**Environment:** VoiceOver + Safari on macOS

**Steps:**
1. Activate VoiceOver (Cmd+F5)
2. Navigate to accessibility button (VO+Right Arrow or Tab)
3. Activate with VO+Space

**Expected Announcement:**
```
"Accessibility options, button"
[VO+Space]
"Accessibility, dialog"
"Close accessibility panel, button"
```

**Verification:**
- ✅ VoiceOver rotor shows "Form Controls"
- ✅ All controls accessible via VO navigation
- ✅ Dialog properly announced

---

**Test SR-006: VoiceOver Rotor**

**Steps:**
1. With panel open, activate rotor (VO+U)
2. Navigate to "Form Controls"
3. List all controls

**Expected:**
- ✅ All buttons, sliders, selects appear in rotor
- ✅ Names match visual labels
- ✅ No duplicate or missing controls

---

### 4.3 Mobile Screen Reader Tests

**Test SR-007: VoiceOver iOS**

**Environment:** iPhone with VoiceOver + Safari

**Steps:**
1. Enable VoiceOver (Settings > Accessibility)
2. Swipe to accessibility button
3. Double-tap to open
4. Swipe through controls

**Expected:**
- ✅ All controls reachable by swiping
- ✅ Double-tap activates buttons
- ✅ Slider adjustable with swipe up/down
- ✅ Toggle state announced
- ✅ Panel closeable with two-finger scrub gesture

---

**Test SR-008: TalkBack Android**

**Environment:** Android device with TalkBack + Chrome

**Steps:**
1. Enable TalkBack (Settings > Accessibility)
2. Swipe to accessibility button
3. Double-tap to open
4. Navigate controls

**Expected:**
- ✅ Controls announced correctly
- ✅ Actions accessible (swipe left/right for controls)
- ✅ Reading order logical
- ✅ No navigation traps

---

## 5. Mobile/Touch Tests

### 5.1 Touch Target Sizes

**Test MT-001: Measure Touch Targets**

**Tool:** Browser DevTools > Inspect

**Targets to Measure:**
| Element | Expected Size | Actual | Pass/Fail |
|---------|---------------|--------|-----------|
| Floating button | 56px × 56px | ☐ px | ☐ |
| Text +/- buttons | 40px × 40px | ☐ px | ☐ |
| Toggle buttons | ≥ 48px height | ☐ px | ☐ |
| Close button | 40px × 40px | ☐ px | ☐ |
| Reset icons | ≥ 24px × 24px (AA) | ☐ px | ☐ |

**WCAG Requirement:** ≥24px (Level AA), ≥44px (Level AAA target)

---

### 5.2 Touch Interaction

**Test MT-002: Touch All Controls**

**Device:** iOS iPhone or Android phone

**Steps:**
1. Open panel on mobile device
2. Tap each button with thumb
3. Drag sliders
4. Tap toggles

**Expected Results:**
- ✅ All buttons activate on first tap
- ✅ No accidental touches of adjacent controls
- ✅ Sliders drag smoothly
- ✅ No need for zooming to hit targets
- ✅ Touch feedback visible (color change)

---

### 5.3 Viewport Sizes

**Test MT-003: 320px Width**

**Setup:** Chrome DevTools > Responsive mode > 320px width

**Steps:**
1. Load homepage at 320px width
2. Open accessibility panel
3. Verify layout

**Expected Results:**
- ✅ Panel fits within viewport (no horizontal scroll)
- ✅ All text readable (no truncation)
- ✅ Controls not overlapping
- ✅ Scrollable if content exceeds height
- ✅ Buttons remain tappable

**Test at:** 320px, 375px, 414px, 768px

---

### 5.4 iOS Safe Area

**Test MT-004: iPhone Bottom Bar**

**Device:** iPhone with notch/home indicator

**Steps:**
1. Open panel
2. Verify panel position relative to bottom

**Expected Results:**
- ✅ Panel not obscured by home indicator
- ✅ `env(safe-area-inset-bottom)` respected
- ✅ Minimum 24px (1.5rem) above home indicator

---

### 5.5 Software Keyboard

**Test MT-005: Keyboard Overlap**

**Steps:**
1. Open panel on mobile
2. Tap in any future text input (if added)
3. Observe keyboard behavior

**Expected Results:**
- ✅ Panel repositions above keyboard
- ✅ Active field visible
- ✅ Scrollable if needed
- ✅ No content hidden behind keyboard

**Note:** Current version has no text inputs, test if added

---

### 5.6 Orientation

**Test MT-006: Rotation**

**Steps:**
1. Open panel in portrait mode
2. Rotate device to landscape
3. Rotate back to portrait

**Expected Results:**
- ✅ Panel remains open
- ✅ Layout adapts to new orientation
- ✅ All controls remain accessible
- ✅ No visual glitches

**WCAG:** 1.3.4 Orientation (Level AA) - Content not restricted to single orientation

---

## 6. Persistence Tests

### 6.1 localStorage Tests

**Test PS-001: Save and Reload**

**Steps:**
1. Set all preferences to non-default values
2. Close browser tab completely
3. Reopen site in new tab
4. Open accessibility panel

**Expected Results:**
- ✅ All preferences restored exactly
- ✅ Visual appearance matches saved preferences
- ✅ Modified indicators appear
- ✅ Panel shows correct values

**Verify each preference individually:**
- Text Scale: 1.5 → Reloads as 1.5 ✅
- Line Spacing: 2.0 → Reloads as 2.0 ✅
- Letter Spacing: 0.08 → Reloads as 0.08 ✅
- Font Family: 'opendyslexic' → Reloads as OpenDyslexic ✅
- High Contrast: true → Reloads as ON ✅
- Reduce Motion: true → Reloads as ON ✅
- Sensory-Friendly: true → Reloads as ON ✅

---

**Test PS-002: Cross-Tab Synchronization**

**Steps:**
1. Open site in Tab A
2. Set text size to 150%
3. Open site in Tab B (new tab)
4. Check if preferences appear

**Expected:**
- ✅ Tab B loads with saved preferences
- ⚠️ Live sync across tabs is NOT implemented (acceptable)
- ✅ Refresh Tab B to see changes from Tab A

---

**Test PS-003: localStorage Quota Error**

**Steps:**
1. Fill localStorage to quota (DevTools > Application > Storage)
2. Change an accessibility preference
3. Observe behavior

**Expected Results:**
- ✅ Preference still works (sessionStorage fallback)
- ✅ No error modal blocks user
- ✅ Preference lost on browser close (expected)
- ✅ User informed of temporary mode (recommended)

**Code Verification:**
```typescript
try {
  localStorage.setItem(key, value)
} catch {
  sessionStorage.setItem(key, value) // Fallback ✅
}
```

---

**Test PS-004: Private/Incognito Mode**

**Steps:**
1. Open site in private/incognito window
2. Set preferences
3. Reload page in same session

**Expected Results:**
- ✅ Preferences persist within session (sessionStorage)
- ✅ Preferences cleared on browser close (expected)
- ✅ No errors or crashes

---

**Test PS-005: Clear Browsing Data**

**Steps:**
1. Set preferences
2. Browser Settings > Clear browsing data > localStorage
3. Reload page

**Expected Results:**
- ✅ Preferences reset to defaults
- ✅ No error messages
- ✅ Site functions normally
- ✅ User can set preferences again

---

### 6.2 Reset Persistence

**Test PS-006: Individual Reset**

**Steps:**
1. Set Text Size to 150%
2. Set High Contrast to ON
3. Click reset icon next to Text Size only
4. Reload page

**Expected Results:**
- ✅ Text Size resets to 100%
- ✅ High Contrast remains ON
- ✅ localStorage updated correctly
- ✅ Preferences persist after reload

---

**Test PS-007: Reset All**

**Steps:**
1. Set multiple preferences
2. Click "Reset All" button
3. Reload page

**Expected Results:**
- ✅ All preferences return to defaults
- ✅ localStorage key deleted or set to defaults
- ✅ No preferences persist after reload
- ✅ Visual appearance fully reset

---

## 7. Integration Tests

### 7.1 Route Navigation

**Test INT-001: Preferences Across Pages**

**Steps:**
1. Set text size to 150% on homepage
2. Navigate to /about
3. Navigate to /events
4. Navigate to /donate
5. Return to homepage

**Expected Results:**
- ✅ Preferences apply on all pages
- ✅ No flash of unstyled content
- ✅ No preference reset on navigation
- ✅ Panel state (open/closed) resets per page (expected)

---

**Test INT-002: Public to Admin Navigation**

**Steps:**
1. Set preferences on public site
2. Navigate to /admin (if accessible)
3. Return to public site

**Expected Results:**
- ✅ Preferences cleared in admin area
- ✅ Body classes removed
- ✅ Preferences restored on return to public
- ✅ No CSS conflicts

**Code Check:**
- Public layout wraps children in provider
- Admin layout does NOT include provider ✅

---

### 7.2 Component Integration

**Test INT-003: Modal Interactions**

**Steps:**
1. Open accessibility panel
2. Open video modal (if present)
3. Verify behavior

**Expected:**
- ✅ Video modal can open over panel
- ✅ Panel can be closed while modal open
- ✅ Focus management correct for both
- ✅ Escape key closes top-most (modal first, then panel)

---

**Test INT-004: Mobile Menu**

**Steps:**
1. On mobile, open hamburger menu
2. Open accessibility panel
3. Verify interaction

**Expected:**
- ✅ Both can coexist (or one closes the other)
- ✅ No z-index conflicts
- ✅ Both closeable
- ✅ No layout breaks

---

### 7.3 Form Interactions

**Test INT-005: Donation Form**

**Steps:**
1. Set text size to 150% and high contrast
2. Navigate to /donate
3. Fill out donation form
4. Submit

**Expected Results:**
- ✅ Form readable with preferences applied
- ✅ Validation errors visible in high contrast
- ✅ Form submission works normally
- ✅ Success/error pages respect preferences

---

### 7.4 Media Player Integration

**Test INT-006: Video Controls**

**Steps:**
1. Enable Reduce Motion
2. Navigate to page with video
3. Click play button manually
4. Interact with controls

**Expected Results:**
- ✅ Video does not autoplay
- ✅ Manual play works
- ✅ Controls visible and functional
- ✅ Captions/subtitles accessible
- ✅ No auto-resume after pause

---

### 7.5 CMS Content

**Test INT-007: Dynamic Content**

**Steps:**
1. Set preferences
2. View blog post/story with rich text
3. Verify formatting

**Expected Results:**
- ✅ Text scaling applies to CMS content
- ✅ Line/letter spacing applies
- ✅ High contrast applies to text/links
- ✅ Images not affected by font changes
- ✅ No layout breaks in rich text

---

## 8. Performance Tests

### 8.1 Load Time

**Test PERF-001: Default State Performance**

**Measurement:** Lighthouse, WebPageTest, or DevTools Performance

**Scenario:** Fresh load, no preferences saved

**Metrics to Measure:**
| Metric | Target | Actual | Pass/Fail |
|--------|--------|--------|-----------|
| First Contentful Paint (FCP) | < 1.8s | ☐ | ☐ |
| Largest Contentful Paint (LCP) | < 2.5s | ☐ | ☐ |
| Total Blocking Time (TBT) | < 200ms | ☐ | ☐ |
| Cumulative Layout Shift (CLS) | < 0.1 | ☐ | ☐ |

**Verification:**
- ✅ Accessibility features do not delay first render
- ✅ Panel code does not block critical path
- ✅ No font downloads in default state

---

**Test PERF-002: With OpenDyslexic Font**

**Steps:**
1. Select OpenDyslexic font
2. Reload page
3. Measure performance

**Expected:**
- ✅ Font loads asynchronously
- ✅ Fallback font shown during load
- ✅ No layout shift when font swaps
- ✅ Font cached after first load

**Font File Size Check:**
- OpenDyslexic woff2: ☐ KB (target: <100 KB)

---

**Test PERF-003: Interaction Responsiveness**

**Measurement:** Manual feel + DevTools Performance recording

**Steps:**
1. Open accessibility panel
2. Rapidly adjust text size slider
3. Toggle high contrast on/off quickly
4. Record interaction latency

**Expected:**
- ✅ Panel opens in <100ms
- ✅ Slider updates feel instant (<16ms per frame)
- ✅ Toggle response immediate
- ✅ No janky animations
- ✅ 60 FPS maintained (or motion disabled)

---

### 8.2 Memory Usage

**Test PERF-004: Memory Leaks**

**Steps:**
1. Open DevTools > Memory
2. Take heap snapshot
3. Open/close panel 20 times
4. Take second heap snapshot
5. Compare

**Expected Results:**
- ✅ Memory usage stable or minimal growth
- ✅ Event listeners cleaned up
- ✅ No detached DOM nodes
- ✅ No accumulating timers

**Code Verification:**
```typescript
useEffect(() => {
  // Setup
  return () => {
    // Cleanup ✅
  }
}, [deps])
```

---

### 8.3 Bundle Size

**Test PERF-005: JavaScript Bundle Impact**

**Measurement:** Build output, Bundle Analyzer

**Check:**
```bash
npm run build
# Check .next/static/chunks sizes
```

**Expected:**
- Accessibility provider: <5 KB gzipped
- Panel component: <10 KB gzipped
- Total impact: <15 KB gzipped
- No duplicate dependencies

---

## 9. Browser/Device Matrix

### 9.1 Desktop Matrix

| Browser | Version | OS | Status | Tester | Date |
|---------|---------|-----|--------|--------|------|
| Chrome | Latest | Windows 11 | ☐ | | |
| Firefox | Latest | Windows 11 | ☐ | | |
| Edge | Latest | Windows 11 | ☐ | | |
| Safari | Latest | macOS 13+ | ☐ | | |
| Chrome | Latest | macOS 13+ | ☐ | | |

### 9.2 Mobile Matrix

| Device | OS | Browser | Screen Reader | Status | Tester | Date |
|--------|-----|---------|---------------|--------|--------|------|
| iPhone 12+ | iOS 15+ | Safari | VoiceOver | ☐ | | |
| iPhone 12+ | iOS 15+ | Safari | None | ☐ | | |
| Pixel/Samsung | Android 11+ | Chrome | TalkBack | ☐ | | |
| Pixel/Samsung | Android 11+ | Chrome | None | ☐ | | |
| iPad | iOS 15+ | Safari | VoiceOver | ☐ | | |

### 9.3 Screen Reader Matrix

| AT | Version | Browser | OS | Priority | Status | Tester | Date |
|----|---------|---------|-----|----------|--------|--------|------|
| NVDA | Latest | Chrome | Windows | P0 | ☐ | | |
| NVDA | Latest | Firefox | Windows | P1 | ☐ | | |
| JAWS | Latest | Chrome | Windows | P2 | ☐ | | |
| VoiceOver | Latest | Safari | macOS | P0 | ☐ | | |
| VoiceOver | Latest | Safari | iOS | P0 | ☐ | | |
| TalkBack | Latest | Chrome | Android | P1 | ☐ | | |

---

## 10. Bug Reporting

### 10.1 Bug Report Template

```markdown
## Bug Report

**Bug ID:** BUG-[number]
**Date Reported:** YYYY-MM-DD
**Reporter:** [Name]
**Priority:** P0 / P1 / P2 / P3

### Environment
- **Device:** Desktop / iPhone / Android
- **OS:** Windows 11 / macOS 13 / iOS 16 / Android 12
- **Browser:** Chrome 120 / Safari 17 / Firefox 121
- **Screen Reader:** NVDA 2024 / VoiceOver / None
- **Viewport:** 1920×1080 / 375×667 / etc.

### Steps to Reproduce
1. 
2. 
3. 

### Expected Result


### Actual Result


### Screenshots/Videos
[Attach or link]

### Console Errors
```
[Paste any console errors]
```

### Additional Context


### Suggested Fix (optional)


### WCAG Impact
**Criterion:** [e.g., 2.1.1 Keyboard]
**Level:** A / AA / AAA
**Blocker:** Yes / No
```

---

### 10.2 Priority Definitions

**P0 - Critical (Blocker):**
- Prevents core functionality
- WCAG Level A failure
- Affects all users
- Must fix before launch

**Examples:**
- Keyboard trap
- Screen reader can't access controls
- Preferences don't save
- Panel won't open

**P1 - High:**
- Significant usability issue
- WCAG Level AA failure
- Affects many users
- Fix before launch if possible

**Examples:**
- Insufficient contrast
- Missing focus indicators
- Slider doesn't announce value
- Layout breaks at 150% zoom

**P2 - Medium:**
- Minor usability issue
- Best practice recommendation
- Affects some users
- Fix in next iteration

**Examples:**
- Inconsistent label wording
- Suboptimal button placement
- Missing status announcements

**P3 - Low:**
- Polish or enhancement
- WCAG Level AAA
- Affects few users
- Nice to have

**Examples:**
- Animation timing could be smoother
- Tooltip text could be clearer
- Prefer different icon

---

## 11. Acceptance Criteria Summary

### 11.1 Must Pass (Launch Blockers)

- [ ] All controls keyboard accessible
- [ ] No keyboard traps
- [ ] Screen reader can operate all features (NVDA + Chrome minimum)
- [ ] Preferences persist across page loads
- [ ] High contrast meets 4.5:1 ratio minimum
- [ ] Touch targets ≥24px (preferably 40px+)
- [ ] No motion when Reduce Motion enabled
- [ ] No JavaScript errors in console
- [ ] Works on Chrome, Firefox, Safari (desktop)
- [ ] Works on iOS Safari and Android Chrome (mobile)
- [ ] Build succeeds with no warnings

### 11.2 Should Pass (High Priority)

- [ ] VoiceOver (iOS/macOS) fully functional
- [ ] All modified indicators announced
- [ ] Focus visible on all controls
- [ ] Panel usable at 320px width
- [ ] No layout breaks at 200% text size
- [ ] Sensory-friendly mode clearly reduces stimuli
- [ ] Reset functions work correctly
- [ ] No performance regression (LCP <2.5s)

### 11.3 Nice to Have (Enhancements)

- [ ] JAWS screen reader tested
- [ ] TalkBack tested
- [ ] Status messages with aria-live
- [ ] Custom focus indicators beyond browser default
- [ ] Animated transitions respect reduce motion

---

## 12. Sign-Off

### Test Completion Checklist

- [ ] All P0 tests executed and passed
- [ ] All P1 tests executed (passes or documented exceptions)
- [ ] At least 2 screen readers tested (NVDA + VoiceOver recommended)
- [ ] Mobile testing completed on iOS and Android
- [ ] Performance benchmarks within targets
- [ ] No open P0 bugs
- [ ] P1 bugs documented with mitigation plan
- [ ] Test evidence collected (screenshots, recordings)
- [ ] Accessibility statement reviewed
- [ ] Team sign-off obtained

### Approvals

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| QA Tester | | | |
| Accessibility Lead | | | |
| Product Owner | | | |

---

**Document Version:** 1.0  
**Last Updated:** 2026-09-16  
**Next Review:** Before production deployment
