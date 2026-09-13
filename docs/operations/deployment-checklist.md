---
title: "ðŸš€ Homepage CMS Deployment Checklist"
description: "- x SQL migration file created scripts/037-homepage-cms-schema.sql"
owner: "Deesha Team"
status: operational
category: operations
audience: admin
last_updated: 2026-09-12
---
# ðŸš€ Homepage CMS Deployment Checklist

## Pre-Deployment Verification

### âœ… Phase 1 & 2 Complete
- [x] SQL migration file created (`scripts/037-homepage-cms-schema.sql`)
- [x] TypeScript types defined (`lib/types/homepage-settings.ts`)
- [x] Data loaders created (`lib/data/homepage-settings.ts`)
- [x] Impact page migrated (`app/(public)/impact/page.tsx`)
- [x] Impact client component updated (`app/(public)/impact/ImpactClientPage.tsx`)
- [x] Test page created (`app/test-cms/page.tsx`)
- [x] No TypeScript errors
- [x] No breaking changes
- [x] Fallbacks implemented

---

## Deployment Steps

### Step 1: Test Locally (Before SQL Migration)

```bash
# Start dev server
npm run dev

# Visit test page
# Open: http://localhost:3000/test-cms
```

**Expected Result:**
- âœ… Page loads without errors
- âœ… All sections display data
- âœ… Data comes from fallback values
- âœ… No console errors

**If test fails:**
- Check TypeScript errors: `npm run type-check`
- Check console for errors
- Verify imports are correct

---

### Step 2: Run SQL Migration

**Option A: Supabase Dashboard (Recommended)**

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Create new query
4. Copy entire contents of `scripts/037-homepage-cms-schema.sql`
5. Click "Run"
6. Wait for success message

**Option B: Command Line**

```bash
# Replace with your actual connection details
psql -h db.your-project.supabase.co \
     -U postgres \
     -d postgres \
     -f scripts/037-homepage-cms-schema.sql
```

**Expected Output:**
```
INSERT 0 1
INSERT 0 1
INSERT 0 1
...
CREATE FUNCTION
CREATE FUNCTION
CREATE FUNCTION
```

---

### Step 3: Verify Database

```sql
-- Check that 10 keys were created
SELECT key, updated_at 
FROM site_settings 
WHERE key LIKE 'homepage_%'
ORDER BY key;
```

**Expected Result: 10 rows**
1. `homepage_banners`
2. `homepage_cta_cards`
3. `homepage_featured_stories_rules`
4. `homepage_flags`
5. `homepage_hero_ctas`
6. `homepage_marquee_settings`
7. `homepage_programs`
8. `homepage_seo`
9. `homepage_stats`
10. `homepage_trust_indicators`

**Verify data structure:**
```sql
-- Check stats data
SELECT value 
FROM site_settings 
WHERE key = 'homepage_stats';

-- Should return JSON with 8 stats
```

---

### Step 4: Test Locally (After SQL Migration)

```bash
# Restart dev server (to clear cache)
npm run dev

# Visit test page again
# Open: http://localhost:3000/test-cms
```

**Expected Result:**
- âœ… Page loads without errors
- âœ… All sections display data
- âœ… Data now comes from database
- âœ… Values match what's in SQL migration
- âœ… No console errors

---

### Step 5: Test Impact Page

```bash
# Visit impact page
# Open: http://localhost:3000/impact
```

**Expected Result:**
- âœ… Page loads normally
- âœ… Stats section displays correctly
- âœ… Programs section displays correctly
- âœ… Layout unchanged
- âœ… No visual differences
- âœ… No console errors

**Test Checklist:**
- [ ] Hero section loads
- [ ] Stats section shows 8 stats (2 rows of 4)
- [ ] Programs section shows 3 program blocks
- [ ] Images load correctly
- [ ] Links work
- [ ] Animations work
- [ ] Mobile responsive
- [ ] No console errors

---

### Step 6: Test Fallback System

**Simulate database failure:**

1. Temporarily break database connection
2. Visit `/impact` page
3. Verify page still works with fallback values

**Expected Result:**
- âœ… Page loads (doesn't crash)
- âœ… Stats display (from fallback)
- âœ… Programs display (from fallback)
- âœ… Console shows error log (expected)
- âœ… User sees no errors

---

### Step 7: Commit Changes

```bash
# Check what changed
git status

# Review changes
git diff

# Stage changes
git add scripts/037-homepage-cms-schema.sql
git add lib/types/homepage-settings.ts
git add lib/data/homepage-settings.ts
git add app/(public)/impact/page.tsx
git add app/(public)/impact/ImpactClientPage.tsx
git add app/test-cms/page.tsx
git add docs/
git add *.md

# Commit
git commit -m "feat: Add Homepage CMS with fallback support

- Add database schema for 10 homepage content sections
- Create TypeScript types and data loaders
- Migrate Impact page to use CMS data
- Include nice-to-have features (marquee grouping, trust indicators, etc.)
- Implement triple-layer fallback system
- Add comprehensive documentation
- Zero breaking changes"
```

---

### Step 8: Deploy to Staging

```bash
# Push to staging branch
git push origin staging

# Or deploy to Vercel staging
vercel --prod=false
```

**Staging Tests:**
- [ ] Run SQL migration on staging database
- [ ] Verify `/test-cms` page works
- [ ] Verify `/impact` page works
- [ ] Test on multiple devices
- [ ] Test on multiple browsers
- [ ] Check Vercel logs for errors
- [ ] Test performance (should be unchanged)

---

### Step 9: Deploy to Production

```bash
# Merge to main
git checkout main
git merge staging
git push origin main

# Or deploy to Vercel production
vercel --prod
```

**Production Checklist:**
- [ ] Run SQL migration on production database
- [ ] Verify `/impact` page works
- [ ] Monitor error logs
- [ ] Check analytics (no drop in traffic)
- [ ] Test from different locations
- [ ] Verify SEO unchanged

---

### Step 10: Clean Up

```bash
# Delete test page (after confirming everything works)
rm -rf app/test-cms

# Commit cleanup
git add app/test-cms
git commit -m "chore: Remove CMS test page"
git push origin main
```

---

## Rollback Plan

### If Something Goes Wrong

**Level 1: Code Rollback (Immediate)**
```bash
# Revert last commit
git revert HEAD
git push origin main

# Site will use fallback values (works normally)
```

**Level 2: Database Rollback (If needed)**
```sql
-- Remove CMS keys
DELETE FROM site_settings WHERE key LIKE 'homepage_%';

-- Site will use fallback values (works normally)
```

**Level 3: Full Rollback (Nuclear option)**
```bash
# Restore from backup
# Site will work with fallback values during restore
```

---

## Post-Deployment Monitoring

### First 24 Hours

**Monitor:**
- [ ] Error logs (Vercel/Supabase)
- [ ] Page load times
- [ ] User traffic patterns
- [ ] Console errors (browser)
- [ ] Database query performance

**Check:**
- [ ] `/impact` page loads < 2 seconds
- [ ] No increase in error rate
- [ ] No user complaints
- [ ] Analytics unchanged

### First Week

**Verify:**
- [ ] No performance degradation
- [ ] No SEO impact
- [ ] No accessibility issues
- [ ] Database queries efficient

---

## Success Criteria

### âœ… Deployment Successful If:

1. **Functionality**
   - âœ… Impact page loads correctly
   - âœ… Stats display properly
   - âœ… Programs display properly
   - âœ… No console errors
   - âœ… Fallbacks work

2. **Performance**
   - âœ… Page load time unchanged
   - âœ… No database slowdowns
   - âœ… No memory leaks
   - âœ… Lighthouse score unchanged

3. **User Experience**
   - âœ… No visual changes
   - âœ… No broken links
   - âœ… Mobile works
   - âœ… Accessibility maintained

4. **Technical**
   - âœ… No TypeScript errors
   - âœ… No runtime errors
   - âœ… Database queries efficient
   - âœ… Caching works

---

## Next Steps (Phase 3)

After successful deployment:

1. **Plan Admin UI**
   - Design mockups
   - Choose UI framework
   - Plan user workflows

2. **Build Admin Interface**
   - Create `/admin/homepage-manager` page
   - Add form components
   - Implement image uploader
   - Add preview panel

3. **Test Admin UI**
   - Test CRUD operations
   - Verify data validation
   - Test image uploads
   - Test preview

4. **Train Editors**
   - Create user guide
   - Record demo video
   - Provide support

---

## Support

### If You Need Help

**Documentation:**
- `docs/HOMEPAGE_CMS_MIGRATION.md` - Full guide
- `HOMEPAGE_CMS_COMPLETE_SUMMARY.md` - Summary
- `QUICK_START_HOMEPAGE_CMS.md` - Quick reference

**Common Issues:**

**Q: TypeScript errors?**
A: Restart TS server, run `npm run type-check`

**Q: Page not loading?**
A: Check console, verify imports, check database connection

**Q: Data not updating?**
A: Clear Next.js cache, restart dev server

**Q: Fallbacks not working?**
A: Check loader functions, verify default values

---

## Final Checklist

Before marking as complete:

- [ ] SQL migration run successfully
- [ ] Database verified (10 keys exist)
- [ ] Test page works (`/test-cms`)
- [ ] Impact page works (`/impact`)
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Fallbacks tested
- [ ] Staging deployed and tested
- [ ] Production deployed
- [ ] Monitoring in place
- [ ] Documentation complete
- [ ] Team notified

---

**Status**: Ready for deployment! ðŸš€

**Risk Level**: ðŸŸ¢ Low (full fallback support)

**Estimated Time**: 30-60 minutes

**Rollback Time**: < 5 minutes
