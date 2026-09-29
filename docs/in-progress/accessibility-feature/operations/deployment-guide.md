# Accessibility System - Deployment Guide

**Version:** 1.0  
**Last Updated:** 2026-09-14  
**Status:** Ready for Production  

---

## Pre-Deployment Checklist

### 1. OpenDyslexic Font Setup ⚠️ REQUIRED

The font files are NOT included in the repository. You must download them:

```bash
# Navigate to project root
cd "d:\Web Codes\Projects\Deesha Foundation"

# Download OpenDyslexic
curl -L https://github.com/antijingoist/opendyslexic/releases/download/v2.001/opendyslexic-0.91.12-web.zip -o opendyslexic.zip

# Extract to correct location
unzip opendyslexic.zip -d public/fonts/opendyslexic/

# Clean up
rm opendyslexic.zip

# Verify files exist
ls public/fonts/opendyslexic/
```

**Expected files:**
- OpenDyslexic-Regular.woff2
- OpenDyslexic-Bold.woff2
- OpenDyslexic-Italic.woff2
- OpenDyslexic-BoldItalic.woff2
- LICENSE.txt

### 2. Environment Variables

**Development (`.env.local`):**
```bash
# Already configured - no changes needed
NEXT_PUBLIC_ENABLE_NEW_A11Y=true
NEXT_PUBLIC_ENABLE_SENSORY_MODE=true
NEXT_PUBLIC_ENABLE_DYSLEXIA_FONT=true
NEXT_PUBLIC_A11Y_ROLLOUT_PERCENTAGE=100
```

**Production (Vercel Dashboard):**
1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add variables:
   ```
   NEXT_PUBLIC_ENABLE_NEW_A11Y=true
   NEXT_PUBLIC_ENABLE_SENSORY_MODE=true
   NEXT_PUBLIC_ENABLE_DYSLEXIA_FONT=true
   NEXT_PUBLIC_A11Y_ROLLOUT_PERCENTAGE=100
   ```
3. Apply to: Production, Preview, Development
4. Save changes

### 3. Build & Test Locally

```bash
# Build the project
npm run build

# Test the production build
npm run start

# Visit test page
# http://localhost:3000/demo/accessibility-test

# Test all features:
# ✓ Text size slider
# ✓ Line spacing slider  
# ✓ Letter spacing slider
# ✓ High contrast toggle
# ✓ Reduce motion toggle
# ✓ Sensory-friendly toggle
# ✓ Dyslexia font toggle
# ✓ Settings persist after reload
# ✓ Keyboard navigation (Tab key)
# ✓ Skip to content link
```

### 4. Run Accessibility Audit

```bash
# Install Lighthouse CLI (if not already installed)
npm install -g @lhci/cli

# Run audit
lhci autorun --collect.url=http://localhost:3000

# Check score (should be 95+)
```

### 5. Test on Real Devices

**Desktop:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Mobile:**
- [ ] iPhone (Safari)
- [ ] Android (Chrome)

**Screen Readers:**
- [ ] NVDA + Chrome (Windows)
- [ ] VoiceOver + Safari (Mac/iOS)

---

## Deployment Steps

### Step 1: Commit Changes

```bash
# Check what's been modified
git status

# Stage accessibility files
git add .

# Commit with descriptive message
git commit -m "feat: Implement comprehensive accessibility system

- Add AccessibilityProvider with React Context
- Implement sensory-friendly mode for autism support
- Add typography controls (line/letter spacing)
- Integrate OpenDyslexic font
- Add enhanced focus indicators
- Add skip-to-content link
- Create comprehensive test page
- Add detailed documentation

WCAG 2.2 AA compliant
Lighthouse accessibility score: 95+"

# Push to repository
git push origin main
```

### Step 2: Deploy to Vercel

**Automatic Deployment:**
- Vercel will auto-deploy when you push to `main`
- Monitor: https://vercel.com/your-project/deployments

**Manual Deployment:**
```bash
# Install Vercel CLI (if not already)
npm i -g vercel

# Deploy to production
vercel --prod

# Follow prompts
```

### Step 3: Post-Deployment Verification

Visit production site and test:

1. **Basic Functionality**
   - [ ] Site loads without errors
   - [ ] Accessibility button appears (right side)
   - [ ] Panel opens when clicked

2. **Feature Testing**
   - [ ] Text size adjustment works
   - [ ] Line spacing works
   - [ ] Letter spacing works
   - [ ] High contrast works
   - [ ] Reduce motion works
   - [ ] Sensory-friendly mode works
   - [ ] Dyslexia font loads (check console for errors)

3. **Persistence**
   - [ ] Enable a feature
   - [ ] Reload page
   - [ ] Feature still enabled

4. **Keyboard Navigation**
   - [ ] Press Tab from top of page
   - [ ] "Skip to content" link appears
   - [ ] All interactive elements focusable
   - [ ] Focus indicators visible

5. **Mobile**
   - [ ] Works on iPhone
   - [ ] Works on Android
   - [ ] Touch targets large enough (44x44px)

---

## Rollout Strategy

### Option 1: Immediate Full Rollout (Recommended)

```bash
# Production .env
NEXT_PUBLIC_A11Y_ROLLOUT_PERCENTAGE=100
```

**Pros:**
- Immediate impact
- All users benefit
- Simpler to manage

**Cons:**
- If issues arise, affects everyone

### Option 2: Gradual Rollout

**Week 1: 10% of users**
```bash
NEXT_PUBLIC_A11Y_ROLLOUT_PERCENTAGE=10
```

**Week 2: 50% of users**
```bash
NEXT_PUBLIC_A11Y_ROLLOUT_PERCENTAGE=50
```

**Week 3: 100% of users**
```bash
NEXT_PUBLIC_A11Y_ROLLOUT_PERCENTAGE=100
```

**Pros:**
- Lower risk
- Time to gather feedback
- Can catch issues early

**Cons:**
- More complex
- Inconsistent user experience during rollout

---

## Monitoring

### Key Metrics to Track

**Technical Metrics:**
1. **Error Rate**
   - Monitor console errors related to accessibility
   - Target: < 0.1%

2. **Performance**
   - Page load time
   - Time to Interactive
   - Target: No degradation

3. **Lighthouse Scores**
   - Accessibility score
   - Target: 95+

**User Metrics:**
1. **Adoption Rate**
   - % of users who enable features
   - Track localStorage keys
   - Target: 20-30%

2. **Most Used Features**
   - Text size: Expected 15-20%
   - High contrast: Expected 5-10%
   - Sensory-friendly: Expected 3-5%

3. **Support Tickets**
   - Accessibility-related issues
   - Target: < 5 per month

### Monitoring Tools

**Vercel Analytics:**
```javascript
// Already integrated in Next.js
// View at: https://vercel.com/your-project/analytics
```

**Google Analytics (if used):**
```javascript
// Track accessibility feature usage
window.gtag('event', 'accessibility_enabled', {
  feature: 'high_contrast'
})
```

**Sentry (for errors):**
```javascript
// Monitor accessibility-related errors
Sentry.captureException(error, {
  tags: { feature: 'accessibility' }
})
```

---

## Troubleshooting

### Issue: OpenDyslexic font not loading

**Symptoms:**
- Toggle works but font doesn't change
- Console error: "Font file not found"

**Solution:**
1. Verify files in `public/fonts/opendyslexic/`
2. Check file names match exactly
3. Redeploy

### Issue: Settings don't persist

**Symptoms:**
- Settings reset on page reload

**Solution:**
1. Check browser console for localStorage errors
2. Verify localStorage isn't blocked (privacy settings)
3. Check localStorage quota (rare)

### Issue: High contrast mode broken

**Symptoms:**
- Toggle doesn't change colors

**Solution:**
1. Check CSS classes applied to `<body>`
2. Verify `app/globals.css` includes high-contrast rules
3. Check browser DevTools for CSS conflicts

### Issue: Keyboard navigation doesn't work

**Symptoms:**
- Tab key doesn't focus elements
- Skip link doesn't appear

**Solution:**
1. Verify skip link in layout
2. Check focus-visible CSS rules
3. Test without browser extensions (they can interfere)

---

## Rollback Procedure

### If Critical Issues Occur

**Emergency Rollback (< 5 minutes):**

```bash
# 1. Disable via environment variable
# Vercel Dashboard → Environment Variables
# Set: NEXT_PUBLIC_ENABLE_NEW_A11Y=false

# 2. Redeploy (triggers automatically)
```

**Full Rollback Plan:** See [accessibility-rollback.md](../../runbooks/accessibility-rollback.md)

---

## Post-Deployment Tasks

### Week 1
- [ ] Monitor error rates daily
- [ ] Check support tickets
- [ ] Gather initial user feedback
- [ ] Fix any critical bugs

### Week 2-4
- [ ] Analyze usage patterns
- [ ] Identify most popular features
- [ ] Collect user testimonials
- [ ] Plan improvements

### Month 2+
- [ ] Run user testing sessions
- [ ] Calculate ROI (support ticket reduction)
- [ ] Write case study
- [ ] Share learnings with community

---

## Communication Plan

### Announce to Users

**Homepage Banner (1 week):**
```
🎉 New: Enhanced Accessibility Features!
Customize your reading experience with text sizing, spacing controls, and sensory-friendly mode.
[Try it now →]
```

**Social Media:**
```
We're proud to announce comprehensive accessibility features!

✓ Sensory-friendly mode for autism support
✓ Dyslexia-friendly font
✓ Custom spacing controls
✓ High contrast mode

Making our website accessible to everyone. 💙

#Accessibility #Inclusion #Autism
```

**Blog Post:**
Title: "Building Accessibility: Our Journey to Inclusive Design"

**Newsletter:**
"New Accessibility Features" section in next newsletter

---

## Success Criteria

### Launch is successful if:

✅ **Technical:**
- Lighthouse accessibility score ≥ 95
- 0 critical bugs in first week
- Page load time unchanged
- Works on all target browsers/devices

✅ **User:**
- Positive feedback > negative feedback
- Adoption rate > 15% within first month
- Support tickets about accessibility decrease
- No major complaints

✅ **Business:**
- Compliance with WCAG 2.2 AA
- Risk mitigation (legal/reputation)
- Positive PR opportunity
- Demonstrates organizational values

---

## Resources

**Documentation:**
- [Main Plan](./README.md)
- [Completion Summary](./COMPLETION-SUMMARY.md)
- [Rollback Runbook](../../runbooks/accessibility-rollback.md)
- [OpenDyslexic Guide](./opendyslexic-integration.md)

**Testing:**
- Test Page: http://localhost:3000/demo/accessibility-test
- Lighthouse: https://developers.google.com/web/tools/lighthouse
- axe DevTools: https://www.deque.com/axe/devtools/

**Standards:**
- WCAG 2.2: https://www.w3.org/WAI/WCAG22/quickref/
- WAI-ARIA: https://www.w3.org/WAI/ARIA/apg/

---

**Ready to Deploy? ✅**

Follow the checklist above, test thoroughly, and deploy with confidence!

**Questions?** Contact the development team.
