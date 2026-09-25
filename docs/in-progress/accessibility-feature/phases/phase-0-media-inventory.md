# Phase 0: Media & Animation Inventory

**Date:** 2026-09-16  
**Status:** ✅ Complete  
**Critical Finding:** **MAJOR GAP** - No media components respect accessibility preferences

---

## 🚨 Executive Summary

**CRITICAL ISSUE FOUND:** All media components currently **ignore** the `reduceMotion` and `sensoryFriendly` preferences. This is the biggest implementation gap for Phase 1-2.

### Impact:
- ❌ IntroVideo autoplays regardless of preferences
- ❌ HeroCarousel auto-advances regardless of preferences  
- ❌ Framer Motion animations run regardless of preferences
- ❌ CSS animations (Ken Burns effect) run regardless of preferences

### Good News:
- ✅ HeroCarousel checks system `prefers-reduced-motion`
- ✅ Most components have pause controls
- ✅ Clean architecture makes integration straightforward

---

## 📦 Media Components Inventory

### 1. IntroVideo (`components/intro-video.tsx`)

**Status:** ❌ **CRITICAL - Not Connected**

**Current Behavior:**
- Autoplays full-screen video on first visit (muted)
- Shows for 30 minutes between visits
- Has skip button
- Plays logo animation at end
- Dispatches custom events for navbar coordination

**Accessibility Issues:**
| Issue | Severity | Notes |
|-------|----------|-------|
| Autoplay | 🔴 Critical | No respect for reduceMotion preference |
| Full-screen takeover | 🔴 Critical | Blocks all content, no way to disable permanently |
| Required interaction | 🟡 Medium | Need to click to unmute (good for autoplay policy) |
| Animation | 🟡 Medium | Logo flies to navbar, ignores motion preferences |
| localStorage | 🟢 Low | Uses introShown/introLastShown (separate from a11y) |

**What Works:**
- ✅ Skip button accessible
- ✅ Keyboard support (button)
- ✅ ARIA labels present
- ✅ Doesn't show in demo routes

**Integration Needed:**
```typescript
// Add to IntroVideo
const { preferences } = useAccessibility()
const shouldAutoplay = !preferences.reduceMotion && !preferences.sensoryFriendly

// Don't show intro if motion disabled
if (shouldAutoplay === false) {
  return null // or show static poster with opt-in play
}
```

**A4 Tasks:** A4-03, A4-04

---

### 2. HeroCarousel (`components/hero-carousel.tsx`)

**Status:** ⚠️ **PARTIAL - System Only**

**Current Behavior:**
- Auto-advances slides every 6 seconds
- Has prev/next arrows
- Has pause/play button
- Checks system `prefers-reduced-motion` ✅
- Ken Burns zoom effect on images
- News ticker with marquee animation

**Accessibility Good Practices:**
- ✅ Checks system prefers-reduced-motion
- ✅ Pauses on hover/focus
- ✅ Keyboard navigation (arrows)
- ✅ ARIA carousel semantics
- ✅ Live region for screen readers
- ✅ Explicit pause/play controls

**Accessibility Issues:**
| Issue | Severity | Notes |
|-------|----------|-------|
| App preferences ignored | 🔴 Critical | Only checks system, not app reduceMotion |
| Ken Burns runs if system allows | 🟡 Medium | Should check sensoryFriendly too |
| News ticker always animates | 🟡 Medium | Should respect motion preferences |
| Scroll bounce indicator | 🟡 Medium | Hidden if system reduced, good! |

**What's Almost There:**
```typescript
// CURRENT - Only system
const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  setPrefersReducedMotion(mediaQuery.matches)
}, [])

// NEEDED - App preferences too
const { preferences } = useAccessibility()
const effectiveReducedMotion = preferences.reduceMotion || 
                                 preferences.sensoryFriendly || 
                                 prefersReducedMotion
```

**Integration Needed:**
- Import useAccessibility hook
- Combine system + app preferences
- Apply to: autoplay, Ken Burns, news ticker, scroll indicator

**A4 Tasks:** A4-01, A4-06

---

### 3. GlobalVideoModal (`components/global-video-modal.tsx`)

**Status:** 📝 **Not Audited Yet**

**Action Required:** Read and document this component

---

### 4. Circular Testimonials

**Status:** 📝 **Not Found in Initial Scan**

**Action Required:** Locate and audit this component

---

### 5. Home Testimonials Slider

**Status:** 📝 **May be Unused**

**Action Required:** Verify if this is in production

---

## 🎨 Animation Inventory

### Framer Motion Usage

**Status:** ✅ **EXTENSIVE USE** - Found in 15+ components

**Components Using Framer Motion:**

| Component | Location | Animations | Respects Motion? |
|-----------|----------|------------|------------------|
| AnimatedBrushQuote | `components/ui/animated-brush-quote.tsx` | Fade in, slide up | ❌ No |
| GallerySection | `components/programs/sections/GallerySection.tsx` | Fade, scale, slide | ❌ No |
| RichTextSection | `components/programs/sections/RichTextSection.tsx` | Fade, slide up | ❌ No |
| WhoWeSupportSection | `components/programs/sections/WhoWeSupportSection.tsx` | Fade, slide up | ❌ No |
| TimelineSection | `components/programs/sections/TimelineSection.tsx` | Fade, slide left | ❌ No |
| StatsSection | `components/programs/sections/StatsSection.tsx` | Fade, scale | ❌ No |
| QuoteSection | `components/programs/sections/QuoteSection.tsx` | Fade, slide up | ❌ No |
| ProgramHero | `components/programs/sections/ProgramHero.tsx` | Fade, slide, scale | ❌ No |
| ProgressTrackerSection | `components/programs/sections/ProgressTrackerSection.tsx` | Fade, scale | ❌ No |
| ImpactMetricsSection | `components/programs/sections/ImpactMetricsSection.tsx` | Scale, pulse | ❌ No |
| CallToActionSection | `components/programs/sections/CallToActionSection.tsx` | Fade, slide | ❌ No |

**Common Patterns:**
```typescript
// Typical usage (NOT respecting preferences)
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
```

**Integration Strategy:**

Option A: **Framer Motion Context Provider** (Recommended)
```typescript
// Create wrapper provider
import { MotionConfig } from 'framer-motion'
import { useAccessibility } from '@/lib/hooks/use-accessibility'

export function AccessibleMotionConfig({ children }) {
  const { preferences } = useAccessibility()
  const reducedMotion = preferences.reduceMotion || preferences.sensoryFriendly
  
  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
      {children}
    </MotionConfig>
  )
}
```

Option B: **Individual Component Updates** (More control)
```typescript
// In each component
const { preferences } = useAccessibility()
const reducedMotion = preferences.reduceMotion || preferences.sensoryFriendly

<motion.div
  initial={reducedMotion ? false : { opacity: 0, y: 20 }}
  whileInView={reducedMotion ? false : { opacity: 1, y: 0 }}
  transition={reducedMotion ? { duration: 0 } : { duration: 0.6 }}
>
```

**Recommendation:** Use Option A (MotionConfig) for efficiency - one change fixes all Framer Motion animations.

**A4 Tasks:** A4-07

---

### CSS Animations

**Found:**
1. **Ken Burns Effect** - `animate-kenburns` in HeroCarousel
2. **Marquee Animation** - News ticker
3. **Scroll Bounce** - Scroll indicator
4. **Fade/Slide Transitions** - Various
5. **Button Shine** - `btn-shine` class

**Integration Needed:**
```css
/* In globals.css */
body.reduce-motion *,
body.sensory-friendly * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
  scroll-behavior: auto !important;
}
```

**A4 Tasks:** A4-08

---

## 📝 Timer/Interval Inventory

**Components with Timers:**

| Component | Timer Use | Respects Preferences? |
|-----------|-----------|----------------------|
| IntroVideo | Video playback, retry | ❌ No |
| HeroCarousel | Auto-advance (6s) | ⚠️ System only |
| Stats counters | Number animation | ❌ Not audited yet |

**Action Required:** Audit stats counter components

---

## 🎯 Priority Actions for A4 Phase

### 🔴 Critical (Must Fix First):

1. **A4-03: Intro Video**
   - Add preference check
   - Provide opt-in play button instead of autoplay
   - Or remove intro entirely if sensory/motion disabled

2. **A4-01: Hero Carousel**
   - Connect to app preferences (not just system)
   - Disable autoplay if motion reduced
   - Keep manual controls working

3. **A4-07: Framer Motion**
   - Add MotionConfig provider wrapper
   - One change fixes 15+ components

### 🟡 High Priority:

4. **A4-06: Scroll Animations**
   - Audit all scroll-triggered effects
   - Connect to preferences

5. **A4-08: CSS Animations**
   - Add global motion-reduction styles
   - Test all animated elements

6. **A4-04: Intro Animation Complete**
   - Remove dependency on intro for content access
   - Content must be available immediately

### 🟢 Medium Priority:

7. **A4-02: Other Carousels**
   - Locate and update circular testimonials
   - Check home testimonials slider

8. **A4-05: Podcast/Media**
   - Audit podcast player components
   - Check for autoplay

---

## 📊 Integration Complexity Matrix

| Component | Lines to Change | Risk | Test Complexity |
|-----------|-----------------|------|-----------------|
| IntroVideo | 10-20 | Medium | High (custom events) |
| HeroCarousel | 5-10 | Low | Medium (carousel logic) |
| Framer Motion (all) | 5-10 | Very Low | Low (provider wrapper) |
| CSS animations | 10-20 | Low | Medium (regression testing) |
| GlobalVideoModal | TBD | TBD | TBD |

**Total Estimated Changes:** ~50-100 lines across 5-10 files  
**Risk Level:** Low-Medium (well-isolated changes)  
**Test Requirements:** Visual regression, keyboard testing, screen reader

---

## 🎬 Recommended Integration Order

### Week 1: Foundation
1. Add MotionConfig wrapper (fixes all Framer Motion)
2. Add CSS animation overrides
3. Test visual regressions

### Week 2: Critical Media
4. Update HeroCarousel (high visibility)
5. Update IntroVideo (most impactful)
6. Test carousel and intro flows

### Week 3: Remaining Media
7. Audit and update GlobalVideoModal
8. Find and update remaining carousels
9. Comprehensive motion testing

---

## ✅ Checklist for A4 Phase

### A4-01: Hero Carousel
- [ ] Import useAccessibility hook
- [ ] Combine system + app preferences
- [ ] Connect to autoplay logic
- [ ] Connect to Ken Burns effect
- [ ] Connect to news ticker
- [ ] Test all states (play, pause, keyboard)

### A4-03: Intro Video
- [ ] Add preference check
- [ ] Implement opt-in behavior
- [ ] Test skip flow
- [ ] Test logo animation
- [ ] Verify custom events still work

### A4-04: Intro Dependencies
- [ ] Audit uses of intro-animation-complete event
- [ ] Ensure content accessible without intro
- [ ] Test no-intro experience

### A4-07: Framer Motion
- [ ] Create MotionConfig wrapper
- [ ] Add to public layout
- [ ] Test all program sections
- [ ] Verify no visual regressions

### A4-08: CSS Animations
- [ ] Add motion-reduction styles
- [ ] Test all animated components
- [ ] Check button hovers, transitions
- [ ] Verify smooth scrolling disabled

---

## 📁 Files Requiring Changes

**High Priority:**
- `components/intro-video.tsx` - Add preferences
- `components/hero-carousel.tsx` - Add app preferences
- `app/(public)/layout.tsx` - Add MotionConfig wrapper
- `app/globals.css` - Add motion-reduction styles

**Medium Priority:**
- `components/global-video-modal.tsx` - Audit and update
- `components/programs/sections/*.tsx` - Covered by MotionConfig
- Carousel components - TBD when located

**Low Priority:**
- Stats counter components - If they exist
- Other animation utilities

---

## 🎯 Success Criteria

### Phase Complete When:
- [ ] All identified media respects reduceMotion preference
- [ ] All identified media respects sensoryFriendly preference
- [ ] System preferences still work (backward compatible)
- [ ] Framer Motion animations disabled when appropriate
- [ ] CSS animations disabled when appropriate
- [ ] Manual controls still work (pause, play, skip)
- [ ] No content depends on animation completion
- [ ] Visual regression tests pass
- [ ] Keyboard navigation still works
- [ ] Screen reader announcements correct

---

**Status:** Ready for A4 Implementation  
**Blocker:** None - can proceed when A2/A3 complete  
**Estimated Effort:** 2-3 days for core media + 1-2 days testing
