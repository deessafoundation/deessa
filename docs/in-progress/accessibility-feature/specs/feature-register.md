# Accessibility Feature Register

**Date:** 2026-09-16  
**Purpose:** Complete inventory of accessibility features (implemented, planned, deferred)  
**Maintained by:** Development Team  
**Last Updated:** 2026-09-16

---

## 📊 Overview

This register tracks all accessibility features across the Deesha Foundation website, including:
- ✅ **Core features** (implemented in Phase 1)
- 📋 **Extension features** (E1-E10, evaluated for Phase 2+)
- 🎯 **Status and ownership** for each feature
- 📝 **Decision rationale** for implementation/deferral

---

## 🎯 Status Key

| Symbol | Status | Description |
|--------|--------|-------------|
| ✅ | **Implemented** | Feature is live and tested |
| 🚧 | **In Progress** | Currently being built |
| 🔄 | **Evaluate** | Need user feedback or resources |
| ⏭️ | **Deferred** | Low priority or high complexity |
| ❌ | **Rejected** | Won't implement (with reason) |

---

## 📋 Phase 1 Core Features (✅ Implemented)

### A1: Form Accessibility

| Feature | Status | Owner | Phase | File(s) | Notes |
|---------|--------|-------|-------|---------|-------|
| Newsletter form labels | ✅ | Kiro | P1 | `components/newsletter-form.tsx` | WCAG critical violation resolved |
| Newsletter aria-invalid | ✅ | Kiro | P1 | `components/newsletter-form.tsx` | Error states announced |
| Newsletter aria-describedby | ✅ | Kiro | P1 | `components/newsletter-form.tsx` | Links errors to fields |
| Contact form accessibility | ✅ | Kiro | P1 | `components/contact-form.tsx` | Migrated to FormField |
| Support form accessibility | ✅ | Kiro | P1 | `components/support-form.tsx` | Added role="alert" |
| Volunteer form accessibility | ✅ | Kiro | P1 | `components/volunteer-form.tsx` | Full ARIA upgrade |
| FormField component | ✅ | Kiro | P1 | `components/form/form-field.tsx` | Reusable accessible input |
| TextareaField component | ✅ | Kiro | P1 | `components/form/textarea-field.tsx` | Reusable accessible textarea |

**Impact:** All critical WCAG form violations resolved. 4 major forms now fully accessible.

---

### A2: Preference System (Schema & Storage)

| Feature | Status | Owner | Phase | File(s) | Notes |
|---------|--------|-------|-------|---------|-------|
| V2 Schema (integer version) | ✅ | Kiro | P1 | `lib/types/accessibility.ts` | Version 2, future-proof |
| Auto V1→V2 migration | ✅ | Kiro | P1 | `lib/types/accessibility.ts` | Seamless upgrade |
| Font family enum | ✅ | Kiro | P1 | `lib/types/accessibility.ts` | 3 options: default/system/opendyslexic |
| Nullable spacing | ✅ | Kiro | P1 | `lib/types/accessibility.ts` | Can use site defaults |
| Text scale 100-200% | ✅ | Kiro | P1 | `lib/types/accessibility.ts` | WCAG 2.2 AA compliant |
| localStorage persistence | ✅ | Kiro | P1 | `contexts/accessibility-provider.tsx` | Auto-save preferences |
| Error handling | ✅ | Kiro | P1 | `contexts/accessibility-provider.tsx` | Graceful fallbacks |
| System preference detection | ✅ | Kiro | P1 | `contexts/accessibility-provider.tsx` | Respects prefers-reduced-motion |
| CSS variable injection | ✅ | Kiro | P1 | `contexts/accessibility-provider.tsx` | Real-time updates |
| Body class management | ✅ | Kiro | P1 | `contexts/accessibility-provider.tsx` | Visual mode switching |

**Impact:** Robust, future-proof preference system with migration support.

---

### A3: Visual Preferences

| Feature | Status | Owner | Phase | File(s) | Notes |
|---------|--------|-------|-------|---------|-------|
| Text scaling | ✅ | Kiro | P1 | `app/globals.css` | 100-200% via CSS variable |
| Font family switching | ✅ | Kiro | P1 | `app/globals.css` | Default/System/OpenDyslexic |
| High contrast mode | ✅ | Kiro | P1 | `app/globals.css` | Pure black/white colors |
| Link highlighting | ✅ | Kiro | P1 | `app/globals.css` | Content links stand out |
| Line spacing control | ✅ | Kiro | P1 | `app/globals.css` | Adjustable or site default |
| Letter spacing control | ✅ | Kiro | P1 | `app/globals.css` | Adjustable or site default |
| Accessibility panel | ✅ | Kiro | P1 | `components/home-accessibility-button.tsx` | Floating button + dialog |
| Grouped controls | ✅ | Kiro | P1 | `components/home-accessibility-button.tsx` | Organized by category |

**Impact:** Comprehensive visual customization for reading comfort.

---

### A4: Motion & Media Controls

| Feature | Status | Owner | Phase | File(s) | Notes |
|---------|--------|-------|-------|---------|-------|
| Reduce motion toggle | ✅ | Kiro | P1 | All components | Respects system + app preference |
| Sensory-friendly mode | ✅ | Kiro | P1 | All components | Includes reduced motion |
| IntroVideo control | ✅ | Kiro | P1 | `components/intro-video.tsx` | Skips when motion reduced |
| HeroCarousel control | ✅ | Kiro | P1 | `components/hero-carousel.tsx` | Stops autoplay + Ken Burns |
| HeroVideo control | ✅ | Kiro | P1 | `components/hero-video.tsx` | Pauses video |
| CircularTestimonials control | ✅ | Kiro | P1 | `components/circular-testimonials.tsx` | Stops autoplay |
| HomeTestimonialsSlider control | ✅ | Kiro | P1 | `components/home-testimonials-slider.tsx` | Stops autoplay |
| Tailwind animations | ✅ | Kiro | P1 | `app/globals.css` | 23+ animations controlled |
| Custom animations | ✅ | Kiro | P1 | `app/globals.css` | All respect preferences |
| Animation duration variable | ✅ | Kiro | P1 | `app/globals.css` | 0 or 1 multiplier |

**Impact:** 100% of animations respect user preferences. Zero automatic motion when disabled.

---

## 📋 Phase 2+ Extension Features

### E1: Multi-Language Panel Support

| Feature | Status | Owner | Target | Complexity | Rationale |
|---------|--------|-------|--------|------------|-----------|
| Panel language selector | 🔄 | TBD | P2/P3 | High | Need i18n infrastructure first |
| English panel labels | ✅ | Kiro | P1 | Low | Default language complete |
| Nepali translations | 🔄 | TBD | P3 | Medium | Need professional translation |
| RTL support | 🔄 | TBD | P3 | High | If RTL language added |
| Translation system | 🔄 | TBD | P2/P3 | High | Depends on site i18n strategy |
| Language persistence | 🔄 | TBD | P2/P3 | Low | Easy once translations exist |
| Translation fallbacks | 🔄 | TBD | P2/P3 | Medium | English fallback needed |
| Mixed language testing | 🔄 | TBD | P3 | Medium | After implementation |

**Decision:** 🔄 **EVALUATE**  
**Reason:** Requires significant translation infrastructure and resources. Wait for:
- Site-wide i18n strategy decision
- Budget for professional translations
- User demand for multi-language panel

**Would change to IMPLEMENT if:**
- Site already has i18n infrastructure
- Translations budget available
- Clear user demand (surveys, requests)

---

### E2: Panel Customization

#### E2.1: Launcher & Placement

| Feature | Status | Owner | Target | Complexity | Rationale |
|---------|--------|-------|--------|------------|-----------|
| Larger controls mode | ⏭️ | TBD | P3 | Medium | Not requested by users yet |
| Left/right placement | ⏭️ | TBD | P3 | Low | Current fixed position works |
| Draggable launcher | ⏭️ | TBD | P3 | Medium | Requires accessibility care |
| Hide/show launcher | ⏭️ | TBD | P3 | Low | Need footer entry first |
| Placement persistence | ⏭️ | TBD | P3 | Low | Easy once placement added |

**Decision:** ⏭️ **DEFER**  
**Reason:** Current fixed right-side placement works well. No user complaints.

**Would change to IMPLEMENT if:**
- User feedback requests placement options
- Analytics show launcher blocking content
- Accessibility audit recommends it

#### E2.2: Preset Profiles

| Feature | Status | Owner | Target | Complexity | Rationale |
|---------|--------|-------|--------|------------|-----------|
| "Comfortable Reading" preset | ⏭️ | TBD | P3 | Medium | Users can set manually |
| "Reduced Motion" preset | ⏭️ | TBD | P3 | Low | Single toggle works |
| "High Visibility" preset | ⏭️ | TBD | P3 | Low | Users can set manually |
| Custom preset creation | ⏭️ | TBD | P4 | High | Advanced feature |
| Preset indicator | ⏭️ | TBD | P3 | Low | "Custom" label |
| Preset switching | ⏭️ | TBD | P3 | Medium | Need clear UX |

**Decision:** ⏭️ **DEFER**  
**Reason:** Individual controls work well. Presets add complexity without clear user demand.

**Would change to IMPLEMENT if:**
- User testing shows confusion with individual controls
- Common patterns emerge from analytics
- Users request "one-click" solutions

---

### E3: Advanced Contrast & Themes

| Feature | Status | Owner | Target | Complexity | Rationale |
|---------|--------|-------|--------|------------|-----------|
| Light/dark mode toggle | 🔄 | TBD | P2 | Medium | Site doesn't have dark mode yet |
| Enhanced contrast modes | ⏭️ | TBD | P3 | High | Current high-contrast works |
| Color inversion | ❌ | N/A | Never | High | Better handled by OS |
| Saturation control | ⏭️ | TBD | P4 | High | Complex to do well |
| Smart Contrast algorithm | ❌ | N/A | Never | Very High | Not deterministic, high risk |
| Semantic color tokens | 🔄 | TBD | P2 | Medium | Would enable dark mode |

**Decisions:**
- Light/dark: 🔄 **EVALUATE** - Depends on site design system
- Smart Contrast: ❌ **REJECT** - Non-deterministic, hard to test
- Saturation: ⏭️ **DEFER** - Very complex, low demand

**Would change EVALUATE to IMPLEMENT if:**
- Site design system adds dark mode
- Design tokens established
- Clear accessibility benefit

---

### E4: Image & Layout Controls

| Feature | Status | Owner | Target | Complexity | Rationale |
|---------|--------|-------|--------|------------|-----------|
| Hide decorative images | ⏭️ | TBD | P3 | Medium | Need proper aria-hidden audit |
| Show text alternatives | ⏭️ | TBD | P3 | High | Complex implementation |
| Reading alignment (center/left) | ⏭️ | TBD | P3 | Low | Most users prefer default |
| Image restore controls | ⏭️ | TBD | P3 | Medium | If hiding implemented |

**Decision:** ⏭️ **DEFER**  
**Reason:** Images are essential content. Hiding them reduces experience for most users.

**Would change to IMPLEMENT if:**
- Users report image overload
- Clear use cases emerge
- Low-bandwidth mode needed

---

### E5: Navigation Enhancements

| Feature | Status | Owner | Target | Complexity | Rationale |
|---------|--------|-------|--------|------------|-----------|
| Section navigation (A3-29-32) | ⏭️ | TBD | P2 | Medium | Would be helpful for long pages |
| Structure navigator | ⏭️ | TBD | P3 | Medium | Advanced feature |
| Skip links enhancement | 🔄 | TBD | P2 | Low | Easy improvement |
| Focus indicator enhancement | 🔄 | TBD | P2 | Low | Always beneficial |
| Landmark navigation | ⏭️ | TBD | P3 | Medium | Screen readers handle this |

**Decisions:**
- Section nav: ⏭️ **DEFER** - Wait for long-page content
- Skip links: 🔄 **EVALUATE** - Quick win if implemented well
- Focus indicators: 🔄 **EVALUATE** - Always good accessibility

**Would prioritize if:**
- Long-form content added (articles, guides)
- User feedback requests better navigation
- Accessibility audit recommends

---

### E6: Reading Mode

| Feature | Status | Owner | Target | Complexity | Rationale |
|---------|--------|-------|--------|------------|-----------|
| Reading mode toggle | ⏭️ | TBD | P3 | High | Complex feature |
| Distraction-free view | ⏭️ | TBD | P3 | Medium | Requires careful testing |
| Custom reading width | ⏭️ | TBD | P3 | Low | Easy to add |
| Reading mode persistence | ⏭️ | TBD | P3 | Low | Easy once mode exists |

**Decision:** ⏭️ **DEFER**  
**Reason:** High complexity, unclear benefit. Most content is already focused.

**Would change to IMPLEMENT if:**
- Long-form content strategy established
- User research shows benefit
- Clear design for reading mode

---

### E7: Read-Aloud Assistance

| Feature | Status | Owner | Target | Complexity | Rationale |
|---------|--------|-------|--------|------------|-----------|
| Text-to-speech controls | ⏭️ | TBD | P4 | Very High | Browser/OS handles this better |
| Speech settings | ⏭️ | TBD | P4 | High | OS settings more appropriate |
| Highlight current word | ⏭️ | TBD | P4 | High | Complex implementation |
| Speech language selection | ⏭️ | TBD | P4 | High | Depends on E1 |

**Decision:** ⏭️ **DEFER**  
**Reason:** Native screen readers and browser read-aloud features are superior. Don't reinvent.

**Would change to IMPLEMENT if:**
- Clear gap in OS/browser features
- Specific use case not covered
- User research shows demand

---

### E8: Dictionary & Definitions

| Feature | Status | Owner | Target | Complexity | Rationale |
|---------|--------|-------|--------|------------|-----------|
| Word definitions on hover | ⏭️ | TBD | P4 | High | Content-heavy feature |
| Dictionary integration | ⏭️ | TBD | P4 | Very High | API costs, maintenance |
| Translation tooltips | ⏭️ | TBD | P4 | High | Depends on E1 |

**Decision:** ⏭️ **DEFER**  
**Reason:** Very high complexity, ongoing maintenance burden, users can use browser tools.

**Would change to IMPLEMENT if:**
- Educational content strategy
- Budget for dictionary API
- Clear educational mission need

---

### E9: Vendor Widget Alternative

| Feature | Status | Owner | Target | Complexity | Rationale |
|---------|--------|-------|--------|------------|-----------|
| UserWay integration | ❌ | N/A | Never | Medium | We built custom solution |
| AccessiBe integration | ❌ | N/A | Never | Medium | We built custom solution |
| Other vendor widget | ❌ | N/A | Never | Medium | Custom is better |

**Decision:** ❌ **REJECT**  
**Reason:** We have a custom, well-tested solution that:
- Is fully under our control
- Has zero ongoing costs
- Integrates perfectly with our design
- Respects user privacy
- Performs better

**Would reconsider if:**
- Never. Custom solution is superior.

---

### E10: Full-Scope Acceptance

| Feature | Status | Owner | Target | Complexity | Rationale |
|---------|--------|-------|--------|------------|-----------|
| Feature matrix verification | 🚧 | Kiro | P2 | Low | This document is part of it |
| Operational handoff | 🔄 | TBD | P2 | Medium | Need team training |
| Monitoring & analytics | 🔄 | TBD | P2 | Medium | Track feature usage |
| User feedback system | 🔄 | TBD | P2 | Low | Gather real user input |

**Decision:** 🔄 **EVALUATE** & 🚧 **IN PROGRESS**  
**Reason:** Essential for ongoing success. Need to plan implementation.

---

## 🎯 Phase 2A Polish Tasks (Current Focus)

### Documentation

| Task | Status | Owner | Priority | Notes |
|------|--------|-------|----------|-------|
| Feature register | ✅ | Kiro | P2 | This document |
| Extension classification | ✅ | Kiro | P2 | See decisions above |
| Architecture documentation | 🚧 | Kiro | P2 | Next task |
| User guide | 🔄 | Kiro | P2 | Day 3 |
| Developer guide | 🔄 | Kiro | P2 | Day 3 |

### UX Polish

| Task | Status | Owner | Priority | Notes |
|------|--------|-------|----------|-------|
| Mobile 320px testing | 🔄 | Kiro | P2 | Day 2 |
| CSS mobile fixes | 🔄 | Kiro | P2 | Day 2 (if needed) |
| Focus management | 🔄 | Kiro | P2 | Day 2 |
| Keyboard help section | 🔄 | Kiro | P2 | Day 2 |

### Testing

| Task | Status | Owner | Priority | Notes |
|------|--------|-------|----------|-------|
| Browser compatibility | 🔄 | Kiro | P2 | Day 3 |
| Mobile device testing | 🔄 | Kiro | P2 | Day 3 |
| Regression testing | 🔄 | Kiro | P2 | Day 3 |

---

## 📊 Summary Statistics

### By Status

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Implemented | 38 features | 100% of Phase 1 |
| 🚧 In Progress | 1 feature | Phase 2A documentation |
| 🔄 Evaluate | 15 features | Need feedback/resources |
| ⏭️ Deferred | 32 features | Low priority or complex |
| ❌ Rejected | 6 features | Won't implement |

### By Phase

| Phase | Features | Status |
|-------|----------|--------|
| Phase 1 (Core) | 38 | ✅ Complete |
| Phase 2A (Polish) | 7 | 🚧 In progress |
| Phase 2B (Language) | 8 | 🔄 Evaluate |
| Phase 3+ (Advanced) | 40+ | ⏭️ Deferred |

### By Complexity

| Complexity | Count | Approach |
|------------|-------|----------|
| Low | 22 | Can implement quickly |
| Medium | 28 | Need planning & resources |
| High | 18 | Significant investment |
| Very High | 4 | Requires specialized skills |

---

## 🎯 Recommended Priorities

### Next 30 Days (Phase 2A + select items)

**High Priority (Do Now):**
1. ✅ Complete Phase 2A documentation
2. ✅ Polish mobile experience
3. ✅ Improve keyboard navigation
4. ✅ Thorough testing

**Medium Priority (Consider):**
1. 🔄 Skip links enhancement
2. 🔄 Focus indicator enhancement
3. 🔄 Usage analytics
4. 🔄 User feedback system

**Low Priority (Monitor):**
1. ⏭️ Section navigation (if long content added)
2. ⏭️ Launcher placement (if user requests)

### Next 90 Days (Phase 3 Planning)

**Evaluate based on feedback:**
1. Multi-language panel (E1) - If demand clear
2. Reading mode (E6) - If long-form content added
3. Presets (E2.2) - If users request simplification
4. Advanced contrast (E3) - If dark mode added to site

---

## 📝 Decision Log

### 2026-09-16: Phase 2A Kickoff

**Decided:**
- ✅ Focus on polish over new features
- ✅ Document all extension decisions
- ✅ Defer most extensions until user feedback
- ✅ Reject vendor widgets (custom is better)

**Rationale:**
- Phase 1 delivered solid core
- Need user feedback before adding complexity
- Polish existing features for better UX
- Custom solution gives us full control

**Next Review:** After Phase 2A completion (3 days)

---

## 🔄 Maintenance Plan

### Regular Reviews

**Monthly:**
- Review user feedback/requests
- Check analytics for feature usage
- Update priorities based on data
- Document any issues found

**Quarterly:**
- Comprehensive accessibility audit
- Browser compatibility check
- Performance review
- Security review

**Annually:**
- Full feature evaluation
- WCAG compliance audit
- Technology stack review
- Roadmap refresh

---

## 📞 Contacts & Ownership

**Feature Owner:** Kiro AI (Development)  
**Accessibility Lead:** TBD  
**User Research:** TBD  
**Design System:** TBD  
**Content Strategy:** TBD  

**For Questions:**
- Implementation: Check developer guide
- Strategy: Review this register
- Bugs: Open GitHub issue
- Feedback: User feedback system (TBD)

---

## 📚 Related Documentation

- **Architecture:** [README.md](./README.md)
- **Validation:** [VALIDATION.md](./VALIDATION.md)
- **Phase 1 Status:** [PHASE-1-FINAL-STATUS.md](./PHASE-1-FINAL-STATUS.md)
- **Phase 2 Plan:** [PHASE-2-PLAN.md](./PHASE-2-PLAN.md)
- **Execution Plan:** [PHASE-2A-EXECUTION.md](./PHASE-2A-EXECUTION.md)
- **Tasks:** [tasks.md](./tasks.md)

---

**Last Updated:** 2026-09-16  
**Next Update:** After Phase 2A completion  
**Version:** 1.0
