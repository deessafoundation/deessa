# Programs CMS — Release Runbook (P8-01)

## Pre-Release Checklist

- [ ] All Phase 5–6 tasks marked complete in tasks.md
- [ ] Migration script tested in staging (`scripts/archive/migrate-programs.ts --dry-run`)
- [ ] Feature flag `NEXT_PUBLIC_PROGRAMS_CMS=false` set in production env
- [ ] Database backup taken and verified
- [ ] Staging environment mirrors production schema

## Release Steps

### 1. Database Migrations

```bash
# Apply in order (all additive, non-destructive):
# 1. Foundation schema
psql -f scripts/db/programs-migrations/P01-programs-cms-foundation.sql

# 2. Indexes and constraints
psql -f scripts/db/programs-migrations/P02-program-assets-storage.sql

# 3. SEO columns
psql -f scripts/db/programs-migrations/P03-program-seo-columns.sql

# 4. Asset tracking
psql -f scripts/db/programs-migrations/P04-fix-program-assets-public-bucket.sql

# 5. Storage policies
psql -f scripts/db/programs-migrations/P05-simplify-program-assets-rls.sql

# 6. Section types and triggers
psql -f scripts/db/programs-migrations/P06-programs-phase12-hardening.sql

# 7. Test fixtures (OPTIONAL — skip in production)
# psql -f scripts/db/programs-migrations/P07-programs-test-fixtures.sql

# 8. Publish grants (program_versions insert, program_publications insert/update)
psql -f scripts/db/programs-migrations/P08-grant-program-versions-insert.sql

# 9. last_published_revision column
psql -f scripts/db/programs-migrations/P09-add-last-published-revision.sql

# 10. Hero document constraint fix
psql -f scripts/db/programs-migrations/P10-fix-program-drafts-hero-constraint.sql

# 11. Audit-log helper hardening
psql -f scripts/db/programs-migrations/P11-program-audit-log-security.sql

# 12. Delete grants for archive/unpublish/delete
psql -f scripts/db/programs-migrations/P12-program-lifecycle-delete-grants.sql
```

**Verify:**
```sql
SELECT COUNT(*) FROM information_schema.tables
WHERE table_name LIKE 'program%';
-- Expected: 7 tables (programs, program_drafts, program_sections,
-- program_versions, program_publications, program_assets, program_publish_requests)
```

### 2. Storage Bucket

Verify `program-assets` bucket exists in Supabase Dashboard > Storage:
- [ ] Bucket is public
- [ ] MIME type limits configured (image/jpeg, image/png, image/webp, image/avif)
- [ ] File size limit: 10MB

### 3. Import Content

```bash
# Dry run first
npx tsx scripts/archive/migrate-programs.ts --dry-run

# Review generated files
cat scripts/migration-manifest.json
cat scripts/migration-import.sql

# Execute import
npx tsx scripts/archive/migrate-programs.ts --import
# OR paste migration-import.sql into Supabase SQL Editor
```

**Verify:**
```sql
SELECT slug, category, status FROM programs;
```

### 4. Enable CMS (Gradual Rollout)

**Step 4a: Internal testing**
```env
# Set in production env (but keep flag OFF for public)
NEXT_PUBLIC_PROGRAMS_CMS=false
```
- [ ] Admin can access `/admin/programs`
- [ ] Admin can create/edit/draft programs
- [ ] Preview pages work for authorized users

**Step 4b: Enable for public**
```env
NEXT_PUBLIC_PROGRAMS_CMS=true
```
- [ ] `/whatwedo` shows CMS programs
- [ ] `/whatwedo/[slug]` renders published programs
- [ ] Category filters work
- [ ] Sitemap includes program URLs
- [ ] No console errors in browser

### 5. Post-Deploy Verification

- [ ] All 4 category templates render correctly
- [ ] Image upload and display works
- [ ] Publish/unpublish cycle works
- [ ] Version history shows correctly
- [ ] SEO metadata appears in page source
- [ ] Canonical URLs resolve correctly
- [ ] Mobile responsive (test on 375px, 768px, 1280px)
- [ ] Keyboard navigation works through sections
- [ ] Screen reader announces section nav

### 6. Monitoring

- [ ] Check Supabase logs for RLS violations
- [ ] Check Vercel/Next.js logs for render errors
- [ ] Verify no 404s on published program slugs
- [ ] Monitor image CDN (Supabase storage) for errors

## Rollback Procedure

If critical issues are found:

### Immediate (< 5 min)
```env
# Disable CMS route
NEXT_PUBLIC_PROGRAMS_CMS=false
```
This makes `/whatwedo` show fallback data and `/whatwedo/[slug]` return 404.

### Full Rollback (if needed)
1. Set `NEXT_PUBLIC_PROGRAMS_CMS=false`
2. Optionally drop CMS tables:
   ```sql
   DROP TABLE IF EXISTS program_publish_requests CASCADE;
   DROP TABLE IF EXISTS program_assets CASCADE;
   DROP TABLE IF EXISTS program_versions CASCADE;
   DROP TABLE IF EXISTS program_publications CASCADE;
   DROP TABLE IF EXISTS program_sections CASCADE;
   DROP TABLE IF EXISTS program_drafts CASCADE;
   DROP TABLE IF EXISTS programs CASCADE;
   ```
3. Remove `program-assets` storage bucket
4. Revert code changes if needed

## Environment Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_PROGRAMS_CMS` | `false` / `true` | Master switch for CMS routes |
| `NEXT_PUBLIC_SUPABASE_URL` | (existing) | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | (existing) | For migration script only |

## Key Contacts

| Role | Name | Responsibility |
|------|------|----------------|
| Engineering Lead | [TBD] | Code review, rollback decision |
| Content Owner | [TBD] | Content approval, publishing |
| DevOps | [TBD] | Database backups, deployment |

## Unresolved / Known Issues

- [ ] Old `projects` table not removed (kept for reference)
- [ ] Dashboard fundraising charts still reference old `projects` table
- [ ] Test fixtures (migration 066) should NOT be run in production
