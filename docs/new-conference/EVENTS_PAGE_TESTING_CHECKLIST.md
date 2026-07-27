# Events Page Testing Checklist

**Page:** `/events`  
**Date:** 2026-07-24  
**Status:** Ready for Testing

---

## 1. Visual Testing

### Hero Section
- [ ] Gradient background displays correctly
- [ ] Radial color overlays are subtle and pleasant
- [ ] Grid pattern is visible but not overwhelming
- [ ] "COMMUNITY GATHERINGS" badge is readable
- [ ] Heading hierarchy is clear and impactful
- [ ] CTAs are visually distinct (primary vs secondary)
- [ ] Overview card stats display correct numbers
- [ ] Overview card buttons work as expected

### Featured Event
- [ ] Image fills container without distortion
- [ ] Blurred backdrop provides pleasant color wash
- [ ] Date block is readable and properly positioned
- [ ] Category badge contrasts well with image
- [ ] Hover effects work smoothly (scale, shadow, arrow)
- [ ] Title changes color on hover
- [ ] Metadata icons align properly
- [ ] Card is clickable and navigates to event detail

### Event Cards Grid
- [ ] Grid displays 1/2/3 columns at correct breakpoints
- [ ] All cards have equal height within rows
- [ ] Images maintain 16:10 aspect ratio
- [ ] Category badges are readable
- [ ] Date stamps are positioned correctly
- [ ] Hover effects work (lift, shadow, title color)
- [ ] Past event images show grayscale effect
- [ ] Empty state displays when no events exist

### CTA Section
- [ ] Background gradient matches brand
- [ ] Text is readable on primary background
- [ ] Buttons have proper contrast
- [ ] Hover states work on both buttons

---

## 2. Performance Testing

### Image Optimization
- [ ] Featured event image loads with priority
- [ ] Below-fold images lazy load
- [ ] Images are served as WebP/AVIF (check DevTools Network tab)
- [ ] Responsive images load appropriate sizes
- [ ] Blur placeholders appear during load
- [ ] No layout shift when images load (check CLS)

### Loading States
- [ ] Skeleton page appears immediately on navigation
- [ ] Skeleton structure matches final layout
- [ ] Animation is smooth and not distracting
- [ ] Transition from skeleton to content is seamless

### Core Web Vitals
```bash
# Run Lighthouse in DevTools
# Target scores:
# Performance: 95+
# Accessibility: 100
# Best Practices: 100
# SEO: 100
```

- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Time to Interactive < 3.5s

### Network Performance
Test with throttling:
- [ ] Fast 3G (750ms RTT, 1.5 Mbps down)
- [ ] Slow 3G (2000ms RTT, 400 Kbps down)
- [ ] Images still load acceptably
- [ ] Skeleton states provide good UX during load

---

## 3. Responsive Design Testing

### Mobile (320px - 639px)
- [ ] Hero stacks properly
- [ ] Overview card is readable
- [ ] CTAs are full-width and tappable
- [ ] Featured card image displays correctly
- [ ] Event cards are single column
- [ ] Text doesn't overflow
- [ ] Touch targets are minimum 44px

### Tablet (640px - 1023px)
- [ ] Hero may stack or display side-by-side
- [ ] Featured card remains readable
- [ ] Event grid shows 2 columns
- [ ] Navigation is accessible
- [ ] Images scale appropriately

### Desktop (1024px+)
- [ ] Hero displays 7/5 grid
- [ ] Featured card shows side-by-side layout
- [ ] Event grid shows 3 columns
- [ ] Hover effects work properly
- [ ] Content is centered with max-width

### Test Devices
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13/14 (390px)
- [ ] Samsung Galaxy (360px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)
- [ ] Desktop (1280px, 1920px)

---

## 4. Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Focus indicators are visible
- [ ] Skip to main content works
- [ ] No keyboard traps
- [ ] Return key activates links/buttons
- [ ] Focus order is logical

### Screen Reader Testing
Test with:
- [ ] NVDA (Windows)
- [ ] JAWS (Windows)
- [ ] VoiceOver (macOS/iOS)
- [ ] TalkBack (Android)

Verify:
- [ ] Landmarks are announced correctly
- [ ] Headings provide proper structure
- [ ] Images have descriptive alt text
- [ ] Links have descriptive text (not "click here")
- [ ] Time elements are announced properly
- [ ] Icons are hidden from screen readers

### Color Contrast
- [ ] All text meets WCAG AA standards (4.5:1)
- [ ] Badges have sufficient contrast
- [ ] Links are distinguishable
- [ ] Focus indicators are visible

### Browser Zoom
- [ ] Page works at 200% zoom
- [ ] Page works at 400% zoom
- [ ] No horizontal scrolling
- [ ] Text remains readable
- [ ] Layout doesn't break

---

## 5. Functional Testing

### Data Display
- [ ] Event count is accurate (upcoming + past)
- [ ] "Free entry" shows when all events are free
- [ ] "Next up" date is correct
- [ ] Featured event is the next upcoming
- [ ] Past events are sorted newest first
- [ ] Events without images show calendar icon

### Conditional Logic
- [ ] Featured event appears only if upcoming exists
- [ ] "More upcoming" section appears only if >1 upcoming
- [ ] Past events section appears only if past events exist
- [ ] Empty state shows when no upcoming events
- [ ] Past events link in empty state is conditional

### Links & Navigation
- [ ] All event cards link to correct detail pages
- [ ] "Browse events" scrolls to upcoming section
- [ ] "Past events" scrolls to past section
- [ ] "Host an event" goes to /contact
- [ ] "Get involved" goes to /get-involved
- [ ] Back button works correctly

### Date Formatting
- [ ] Current dates show correctly
- [ ] Past dates show correctly
- [ ] Future dates show correctly
- [ ] Urgency labels are accurate:
  - [ ] "Happening today" for today
  - [ ] "Tomorrow" for tomorrow
  - [ ] "In X days" for 2-7 days
  - [ ] "X days away" for 8-21 days

---

## 6. Browser Compatibility

### Modern Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)
- [ ] Samsung Internet
- [ ] Firefox Mobile

### Features to Verify
- [ ] CSS Grid support
- [ ] Backdrop-filter (blur) support
- [ ] CSS custom properties
- [ ] Modern image formats (WebP/AVIF)
- [ ] Intersection Observer (lazy loading)

---

## 7. Edge Cases

### No Events
- [ ] Page doesn't crash
- [ ] Empty state displays
- [ ] CTAs are still available
- [ ] No console errors

### Single Event
- [ ] Featured event shows
- [ ] "More upcoming" section doesn't show
- [ ] Layout remains intact

### Many Events (50+)
- [ ] Grid renders correctly
- [ ] Scroll performance is good
- [ ] Images lazy load properly
- [ ] No memory leaks

### Long Text
- [ ] Event titles truncate properly (line-clamp-2)
- [ ] Descriptions truncate correctly
- [ ] Location text doesn't overflow
- [ ] Layout stays stable

### Missing Data
- [ ] Events without images show fallback
- [ ] Events without time show "Time TBA"
- [ ] Events without venue show location only
- [ ] No console errors for missing fields

### Dates & Times
- [ ] Leap year events (Feb 29)
- [ ] Year boundary events (Dec 31 → Jan 1)
- [ ] Same-day multiple events
- [ ] All-day events (no time)

---

## 8. Security Testing

### Image Sources
- [ ] Only HTTPS images load
- [ ] Supabase images load correctly
- [ ] External images are validated
- [ ] No mixed content warnings

### XSS Prevention
- [ ] Event titles are sanitized
- [ ] Descriptions don't execute scripts
- [ ] User input is escaped
- [ ] No dangerouslySetInnerHTML used

---

## 9. Code Quality

### TypeScript
- [ ] No TypeScript errors
- [ ] All types are properly defined
- [ ] Event interface matches schema
- [ ] No `any` types used

### Console
- [ ] No errors in browser console
- [ ] No warnings in browser console
- [ ] No React key warnings
- [ ] No accessibility warnings

### Build
- [ ] Production build succeeds
- [ ] No build warnings
- [ ] Bundle size is reasonable
- [ ] Server components render correctly

---

## 10. Documentation

- [ ] Code has clear comments
- [ ] Component props are documented
- [ ] Helper functions have descriptions
- [ ] Configuration objects are explained
- [ ] README is updated (if needed)

---

## Testing Tools

### Automated Testing
```bash
# Lighthouse CLI
npx lighthouse https://yoursite.com/events --view

# axe DevTools (accessibility)
# Install browser extension

# PageSpeed Insights
# Visit https://pagespeed.web.dev/
```

### Manual Testing
- Chrome DevTools
- Firefox Developer Tools
- Safari Web Inspector
- Device Emulation
- Network Throttling
- Color Contrast Analyzers

### Screen Readers
- NVDA (free, Windows)
- JAWS (paid, Windows)
- VoiceOver (built-in, macOS/iOS)
- TalkBack (built-in, Android)

---

## Sign-off

### Tester Information
- **Name:** _________________
- **Date:** _________________
- **Browser/Device:** _________________

### Results Summary
- **Total Tests:** ___ / ___
- **Passed:** ___
- **Failed:** ___
- **Blocked:** ___

### Critical Issues Found
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________

### Approval
- [ ] Ready for production deployment
- [ ] Requires fixes before deployment
- [ ] Requires re-testing after fixes

**Signature:** _________________  
**Date:** _________________

---

## Notes

Use this space for additional observations, suggestions, or issues:

_______________________________________________________
_______________________________________________________
_______________________________________________________
_______________________________________________________
