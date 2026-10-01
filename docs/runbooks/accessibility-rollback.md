# Accessibility System Rollback Runbook

**Purpose:** Emergency rollback procedure for accessibility feature issues  
**Owner:** DevOps + Engineering Team  
**Last Updated:** 2026-09-14  

---

## Quick Decision Tree

```
Is the site completely broken? 
├─ YES → Execute Level 1 Rollback (Immediate)
└─ NO → Is accessibility worse than before?
    ├─ YES → Execute Level 2 Rollback (Feature Flag)
    └─ NO → Is performance degraded > 10%?
        ├─ YES → Investigate + Consider Level 2
        └─ NO → Fix forward (create issue)
```

---

## Severity Levels

| Level | Condition | Examples | Response Time |
|-------|-----------|----------|---------------|
| **P0** | Site unusable or completely broken | White screen, infinite loops, cannot navigate | < 15 minutes |
| **P1** | Accessibility significantly degraded | Keyboard navigation broken, screen readers fail | < 1 hour |
| **P2** | Performance impact | Page load > 5s, Lighthouse score < 70 | < 4 hours |
| **P3** | Minor issues | Visual glitches, edge case bugs | Fix forward |

---

## Level 1: Immediate Rollback (< 5 minutes)

**When:** P0 issues - site is broken

### Steps

```bash
# 1. Disable feature flag
vercel env rm NEXT_PUBLIC_ENABLE_NEW_A11Y production
vercel env add NEXT_PUBLIC_ENABLE_NEW_A11Y production
# When prompted, enter: false

# 2. Trigger immediate redeploy
vercel --prod --force

# 3. Verify deployment
curl -I https://deessafoundation.com

# 4. Check monitoring
# Visit: [Your monitoring dashboard URL]

# 5. Notify team
# Post in #incidents Slack channel
```

### Verification Checklist

- [ ] Deployment completed successfully
- [ ] Homepage loads without errors
- [ ] Accessibility widget shows old version (or is disabled)
- [ ] No console errors
- [ ] Error rate returned to normal

**Time to Recovery:** 5-10 minutes

---

## Level 2: Feature Flag Disable (< 30 minutes)

**When:** P1 issues - accessibility degraded but site functional

### Steps

```bash
# 1. SSH into server or access admin panel
# Update environment variables

# Option A: Vercel CLI
vercel env rm NEXT_PUBLIC_ENABLE_NEW_A11Y production
vercel env add NEXT_PUBLIC_ENABLE_NEW_A11Y production
# Enter: false

# Option B: Vercel Dashboard
# Go to: Project Settings → Environment Variables
# Edit NEXT_PUBLIC_ENABLE_NEW_A11Y
# Set to: false
# Save and redeploy

# 2. Gradual disable (if rollout is percentage-based)
# Reduce percentage to 0%
NEXT_PUBLIC_A11Y_ROLLOUT_PERCENTAGE=0

# 3. Monitor for 15 minutes
# Check error rates
# Check user reports
# Verify old system is working
```

### Verification Checklist

- [ ] Old accessibility system is active
- [ ] New system is fully disabled
- [ ] localStorage from new system doesn't interfere
- [ ] All pages load correctly
- [ ] Keyboard navigation works
- [ ] Screen readers function properly

**Time to Recovery:** 30 minutes

---

## Level 3: Git Revert (< 2 hours)

**When:** Feature flags don't work or need complete code removal

### Steps

```bash
# 1. Find the problematic commit/merge
git log --oneline --all --graph --decorate -20
git log --oneline --grep="accessibility"

# Example output:
# a1b2c3d Merge pull request #123 from feature/accessibility-system
# d4e5f6g Phase 5: Accessibility system complete
# g7h8i9j Phase 4: Testing and validation

# 2. Create hotfix branch
git checkout main
git pull origin main
git checkout -b hotfix/revert-accessibility-system

# 3. Revert the merge commit (use parent 1 to keep main branch changes)
git revert -m 1 a1b2c3d

# 4. Test locally
npm install
npm run build
npm run start

# Visit http://localhost:3000
# Test thoroughly:
# - Homepage loads
# - Old accessibility widgets work
# - No console errors
# - All pages functional

# 5. Push and create PR
git push origin hotfix/revert-accessibility-system

# Create PR with title: "[HOTFIX] Revert accessibility system"
# Tag: @engineering-lead @devops

# 6. Fast-track merge and deploy
# Bypass normal review process for P0/P1
gh pr merge --squash --admin

# 7. Deploy to production
git checkout main
git pull origin main
vercel --prod
```

### Verification Checklist

- [ ] Build succeeds locally
- [ ] No TypeScript errors
- [ ] All pages load
- [ ] Old components render correctly
- [ ] Tests pass
- [ ] Production deploy successful
- [ ] Site is stable for 30 minutes

**Time to Recovery:** 1-2 hours

---

## Level 4: Full Code Removal (< 4 hours)

**When:** Revert doesn't work or causes merge conflicts

### Steps

```bash
# 1. Create clean branch
git checkout -b hotfix/remove-accessibility-system main

# 2. Remove new files
rm -rf contexts/accessibility-provider.tsx
rm -rf components/accessibility/panel.tsx
rm -rf components/accessibility/landmark-nav.tsx
rm -rf components/accessibility/reading-mode.tsx
rm -rf lib/hooks/use-accessibility.ts
rm -rf __tests__/**/*.a11y.test.tsx

# 3. Restore old versions of modified files
git checkout <commit-before-accessibility> -- \
  components/home-accessibility-button.tsx \
  components/accessibility-toolbar.tsx \
  app/globals.css \
  app/(public)/layout.tsx \
  lib/utils/accessibility.ts

# 4. Remove imports from layout
# Edit app/(public)/layout.tsx
# Remove: import { AccessibilityProvider } from '@/contexts/accessibility-provider'
# Remove: <AccessibilityProvider> wrapper

# 5. Clean up package.json
# Remove any new dependencies:
# - @fontsource/opendyslexic
# - @axe-core/react (if added)
# - jest-axe (if added)

npm install

# 6. Remove environment variables
# Edit .env files, remove:
# - NEXT_PUBLIC_ENABLE_NEW_A11Y
# - NEXT_PUBLIC_ENABLE_SENSORY_MODE
# - NEXT_PUBLIC_ENABLE_DYSLEXIA_FONT

# 7. Test exhaustively
npm run build
npm run test
npm run start

# 8. Commit and push
git add .
git commit -m "hotfix: Remove accessibility system completely"
git push origin hotfix/remove-accessibility-system

# 9. Create and merge PR
gh pr create --title "[HOTFIX] Complete removal of new accessibility system" \
             --body "Removes all new accessibility code due to P0 incident"

gh pr merge --squash --admin

# 10. Deploy
vercel --prod
```

### Verification Checklist

- [ ] All new files removed
- [ ] Old files restored
- [ ] No import errors
- [ ] Build succeeds
- [ ] Tests pass
- [ ] Site functions normally
- [ ] Old accessibility features work
- [ ] No residual bugs

**Time to Recovery:** 2-4 hours

---

## Post-Rollback Actions

### Immediate (Within 1 hour)

1. **Notify Stakeholders**
   - Post in #general Slack channel
   - Email product owner
   - Update status page if public-facing

2. **Document the Incident**
   - Create incident report in `/docs/incidents/`
   - Record: What happened, when, impact, rollback actions taken

3. **Monitor for 2 hours**
   - Watch error rates
   - Check user feedback
   - Review support tickets

### Within 24 Hours

1. **Post-Mortem Meeting**
   - Who: Engineering team, DevOps, Product
   - What: Root cause analysis
   - Why: Identify what went wrong
   - How: Prevent future occurrences

2. **Create Action Items**
   - Testing gaps
   - Monitoring improvements
   - Process improvements

3. **Update Runbook**
   - Document lessons learned
   - Add new scenarios
   - Improve procedures

### Within 1 Week

1. **Fix Forward Plan**
   - Identify root cause
   - Create fix PR
   - More comprehensive testing
   - Gradual re-rollout strategy

2. **Testing Improvements**
   - Add test coverage for failure scenario
   - Improve staging environment
   - Add automated checks

---

## Monitoring Dashboards

### Key Metrics to Watch

1. **Error Rate**
   - URL: `[Your error tracking dashboard]`
   - Normal: < 0.1%
   - Alert: > 1%

2. **Page Load Time**
   - URL: `[Your performance monitoring]`
   - Normal: < 3s (p95)
   - Alert: > 5s (p95)

3. **Lighthouse Scores**
   - URL: `[Your Lighthouse CI]`
   - Normal: Accessibility > 90
   - Alert: Accessibility < 85

4. **User Reports**
   - Check support email
   - Monitor #feedback Slack channel
   - Review in-app feedback widget

### Alert Conditions

```yaml
# Alert rules (example for monitoring system)
alerts:
  - name: High Error Rate
    condition: error_rate > 1%
    duration: 5 minutes
    action: Page on-call engineer
    
  - name: Slow Page Load
    condition: p95_load_time > 5s
    duration: 10 minutes
    action: Notify team
    
  - name: Accessibility Score Drop
    condition: lighthouse_a11y < 85
    action: Notify accessibility lead
```

---

## Communication Templates

### Slack Alert (P0/P1)

```
🚨 INCIDENT: Accessibility System Issue

Severity: P0 / P1
Impact: [Describe user impact]
Action: Executing Level [1/2/3] rollback
ETA: [Time estimate]
Status Page: [Link if applicable]

Updates will be posted every 15 minutes.
```

### User-Facing Status Update

```
We're currently experiencing technical issues with our accessibility features. 
Our team is working on a fix. 

The site remains accessible during this time. 
We apologize for any inconvenience.

Last updated: [Timestamp]
```

### Post-Incident Email

```
Subject: Resolution: Accessibility Feature Issue

Dear Team,

We experienced an incident with our new accessibility system on [date].

What happened: [Brief description]
Impact: [User impact]
Resolution: [What we did]
Duration: [Downtime]

We've identified the root cause and are taking steps to prevent this from happening again.

Thank you for your patience.

[Team Name]
```

---

## Contact Information

| Role | Contact | Backup |
|------|---------|--------|
| **On-Call Engineer** | [Phone/Slack] | [Backup contact] |
| **DevOps Lead** | [Phone/Slack] | [Backup contact] |
| **Engineering Lead** | [Phone/Slack] | [Backup contact] |
| **Product Owner** | [Phone/Slack] | [Backup contact] |

---

## Related Documentation

- Main Accessibility Plan: `/docs/in-progress/accessibility-feature/README.md`
- Incident Reports: `/docs/incidents/`
- Deployment Guide: `/docs/deployment/README.md`
- Monitoring Setup: `/docs/operations/monitoring.md`

---

**Remember:** When in doubt, prioritize user experience. It's better to rollback quickly than to leave users with a broken experience.
