# Scripts Folder Reorganization Plan

> **Status:** Planning only — no files moved or renamed yet.
> **Created:** 2026-07-22
> **Updated:** 2026-09-21
> **Goal:** Reorganize the scripts folder into a clean, professional structure. All migrations are already applied — this is purely file organization.

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Architecture Review — What's Wrong](#2-architecture-review--whats-wrong)
3. [Refined Folder Structure](#3-refined-folder-structure)
4. [Naming Standard](#4-naming-standard)
5. [Migration Mapping Table](#5-migration-mapping-table)
6. [Duplicate & Dead Script Analysis](#6-duplicate--dead-script-analysis)
7. [Execution Plan](#7-execution-plan)
8. [Reference Update Plan](#8-reference-update-plan)
9. [Checklists](#9-checklists)
10. [Risk Section](#10-risk-section)
11. [Script Standards Guide](#11-script-standards-guide)
12. [Open Decisions](#12-open-decisions)

---

## 1. Current State Analysis

### 1.1 Inventory

| Category | Count | Files |
|----------|-------|-------|
| SQL migrations (numbered root) | 62 | 001-062 (with gaps and many duplicates) |
| SQL diagnostic/debug | 5 | check-rate-limit, debug-verification, diagnose-receipt, find-valid-verification, fix-verification-id |
| SQL seed | 1 | seed-default-form-schema |
| PowerShell deployment | 4 | deploy-staging, deploy-production, enable-v2-staging, monitor-staging |
| PowerShell smoke tests | 1 | smoke-tests-staging |
| PowerShell secrets/creds | 2 | generate-secrets, test-credentials |
| PowerShell other | 1 | scan-all-routes |
| Shell (bash) equivalents | 5 | deploy-staging.sh, enable-v2-staging.sh, generate-secrets.sh, smoke-tests-staging.sh, test-credentials.sh |
| JavaScript/Node scripts | 3 | check-env-vars, test-rate-limit, fix-initiative-images |
| TypeScript scripts | 3 | validate-payment-config, backfill-stripe-payment-intents, migrate-programs |
| MJS scripts | 4 | insert-podcasts, run-stories-seed, test-esewa-signature, test-gmail |
| Cron jobs | 1 | reconcile-payments.ts |
| payments-v2/ subfolder | 19 | 10 SQL migrations + 8 docs + README |
| migrations/ subfolder | 12 | 017, 060-068 programs CMS, conference_registrations, REVIEW.md |
| fixes/ subfolder | 16 | 10 SQL security/RLS fixes + 6 docs |
| **Total** | **~135+ files** | |

### 1.2 Naming Convention Analysis

| Pattern | Example | Prevalence | Problem |
|---------|---------|-----------|---------|
| `NNN-kebab-case.sql` | `001-create-tables.sql` | ~60% | Good, but numbering has gaps and duplicates |
| `NNN_snake_case.sql` | `012-create_podcasts_table.sql` | ~10% | Inconsistent with kebab-case |
| `NNN-SCREAMING.sql` | `012-receipt-sequence.sql` | ~5% | Fine, but duplicates 012 |
| `kebab-case.ext` | `check-env-vars.js` | ~15% | Good |
| `kebab-case.ps1` | `deploy-staging.ps1` | ~10% | Good |
| No numbering | `debug-verification.sql` | ~10% | Debug scripts shouldn't be numbered |

### 1.3 Critical Issues

#### Duplicate Numbers (Expanded — 10 conflicts now)
- **012** appears 2 times: `012-create_podcasts_table.sql`, `012-receipt-sequence.sql`
- **018** appears 2 times: `018-rate-limit-function.sql`, `018-rate-limits.sql`
- **025** appears 2 times: `025-atomic-receipt-number.sql`, `025-create-payment-logs-table.sql`
- **030** appears 2 times: `030-admin-transaction-detail-schema.sql`, `030-cleanup-constraint.sql`
- **039** appears 2 times: `039-homepage-cms-story-whatwedo.sql`, `039-testimonials-storage-bucket.sql`
- **040** appears 2 times: `040-conference-form-schema.sql`, `040-restrict-donations-insert-policy.sql`
- **041** appears 2 times: `041-bank-transfer-donations.sql`, `041-conference-file-upload-bucket.sql`
- **056** appears 2 times: `056-event-payment-integration.sql`, `056-event-uploads-storage-bucket.sql`
- **057** appears 3 times: `057-event-qr-payment.sql`, `057-extend-payments-for-registrations.sql`, `057-ticket-sold-count-rpc.sql`
- **060** appears 2 times: `060-add-team-social-links.sql`, `060-event-ticket-price-tbd.sql`
- **061** appears 2 times: `061-about-page-cms.sql`, `061-pay-at-venue-payment-methods.sql`
- **062** conflicts with `migrations/` folder: root has `062-payment-bank-fields.sql`, migrations has `062-program-seo-columns.sql`

#### Numbering Overlaps Between Root and migrations/
- Root has 060-062, `migrations/` has 060-068 — these are **different migration series** that were developed in parallel
- `migrations/` contains programs CMS migrations (060-068) that don't exist in root
- `migrations/017-conference-payment-columns.sql` overlaps with root's 017+ range

#### Numbering Gaps
- No 033 (gap between 032 and 034)
- No 044-049 (gap between 043 and 050)
- No 020-029 in root (they're in payments-v2/)
- No 063-068 in root (they're in migrations/)

#### Inconsistent Naming
- `012-create_podcasts_table.sql` uses snake_case
- `013-seed_podcasts.sql` uses snake_case
- `014-add_key_topics_and_structured_notes.sql` uses snake_case
- `015-add_guest_roles_and_enhance_social.sql` uses snake_case
- `016-add_podcast_highlights.sql` uses snake_case

#### Mixed Concerns
- Diagnostic SQL scripts (`debug-verification.sql`) mixed with production migrations
- Seed scripts mixed with migrations
- Documentation files (`.md`) inside `payments-v2/` and `fixes/` alongside SQL scripts
- Deployment scripts (`.ps1`) mixed with database scripts
- Security fix scripts (`fixes/`) mixed with schema migrations
- Programs CMS migrations in `migrations/` subfolder while other migrations are in root

#### Dead/Obsolete Scripts
- `011-receipt-system-complete.sql` — Superseded by `010-receipt-system.sql`
- `030-cleanup-constraint.sql` — One-time cleanup, no longer needed
- `debug-verification.sql` — Debug script with hardcoded UUID
- `find-valid-verification.sql` — Debug script
- `fix-verification-id.sql` — One-time fix script
- `fix-initiative-images.mjs` — One-time fix script

### 1.4 Reference Analysis

**References from package.json (MUST NOT BREAK):**
- `scripts/validate-payment-config.ts` → npm script `validate-config`
- `scripts/deploy-staging.ps1` → npm script `deploy:staging`
- `scripts/deploy-production.ps1` → npm script `deploy:production`
- `scripts/smoke-tests-staging.ps1` → npm script `test:staging`
- `scripts/enable-v2-staging.ps1` → npm script `enable:v2`
- `scripts/monitor-staging.ps1` → npm script `monitor:staging`

**References from README.md (root):**
- `scripts/generate-secrets.ps1` / `.sh`
- `scripts/test-credentials.ps1` / `.sh`
- `scripts/` directory mentioned for SQL scripts

**References from docs/ (700+ total references across 60+ files):**
- `scripts/001-062` numbered SQL migrations (55+ unique paths referenced)
- `scripts/payments-v2/*.sql` (10+ references)
- `scripts/migrations/*.sql` (12+ references — new programs CMS)
- `scripts/037-homepage-cms-schema.sql` (15+ references across docs)
- `scripts/039-testimonials-storage-bucket.sql` (3 references)
- `scripts/040-conference-form-schema.sql` (5 references)
- `scripts/050-events-module-schema.sql` (5+ references)
- `scripts/051-event-registration-enhancements.sql` (4 references)
- Various deployment and ops scripts referenced in deployment docs

**References from code:**
- `app/test-cms/page.tsx` references `scripts/037-homepage-cms-schema.sql`

**References from scripts-internal docs (293 references):**
- `scripts/scripts-reorg/tasks.md` — 195 references (this file)
- `scripts/fixes/warning-errors.md` — 53 references
- `scripts/payments-v2/README.md` — 46 references
- `scripts/fixes/DATABASE_ISSUES_ANALYSIS.md` — 23 references
- `scripts/fixes/EXECUTION_GUIDE.md` — 7 references

---

## 2. Architecture Review — What's Wrong

### Flaw 1: No Separation of Concerns

Database migrations, deployment scripts, diagnostic queries, seed data, and cron jobs all live in the same flat directory (plus two small subfolders). This makes it impossible to find what you need quickly.

### Flaw 2: Broken Numbering System

The numbered prefix system is supposed to indicate execution order, but:
- Numbers are duplicated (012, 025, 030)
- Numbers are scattered across folders (017 in migrations/, 020-029 in payments-v2/)
- Gaps exist (033 missing)
- Some scripts aren't numbered at all

### Flaw 3: Documentation Inside Scripts

`payments-v2/` contains 8 markdown files alongside SQL scripts. Documentation about scripts should live in `docs/`, not mixed with the scripts themselves.

### Flaw 4: Debug Scripts in Production

Debug scripts with hardcoded UUIDs (`debug-verification.sql`) and one-time fix scripts (`fix-verification-id.sql`) are mixed with production migrations. These should be clearly separated.

### Flaw 5: No Clear Entry Points

There's no obvious "start here" for someone new to the project. The README.md in payments-v2/ and fixes/ are good, but the root scripts/ has no navigation.

### Flaw 6: Duplicate Shell/PowerShell Scripts

`generate-secrets.ps1` and `generate-secrets.sh` do the same thing for different platforms. Same for `test-credentials`, `deploy-staging`, `enable-v2-staging`, `smoke-tests-staging`. This is fine (cross-platform support), but should be documented.

### Flaw 7: Parallel Migration Series (NEW)

Two separate migration numbering schemes exist in parallel:
- **Root:** 001-062 (with gaps and duplicates)
- **migrations/:** 017, 060-068 (programs CMS)
- **payments-v2/:** 020-029 (payments)

The 060-062 range conflicts between root and migrations/ — they represent different features (events vs programs). This will only get worse as more migrations are added.

### Flaw 8: Security Fixes Mixed with Migrations (NEW)

The `fixes/` folder contains 10 security/RLS fix scripts (000-007, 999) plus 6 documentation files. These are one-time security hardening scripts that should be archived, not mixed with ongoing migrations.

### Flaw 9: No Deduplication of Migration Series (NEW)

Root-level 056, 057 each have 2-3 variants. The `migrations/` folder has its own 060-068 series. Without a clear convention, developers will continue creating duplicate numbers.

---

## 3. Refined Folder Structure

```
scripts/
├── README.md                           # Navigation hub — start here
│
├── db/                                 # All database scripts
│   ├── README.md                       # Migration guide and execution order
│   ├── migrations/                     # Production migrations (run in order)
│   │   ├── README.md                   # Execution order, dependency graph
│   │   ├── 001-create-tables.sql
│   │   ├── 002-admin-schema.sql
│   │   ├── 003-storage-setup.sql
│   │   ├── 004-site-assets-storage.sql
│   │   ├── 005-expand-site-settings.sql
│   │   ├── 006-media-assets.sql
│   │   ├── 007-sync-existing-media.sql
│   │   ├── 008-currency-support.sql
│   │   ├── 009-payment-security-hardening.sql
│   │   ├── 010-receipt-system.sql
│   │   ├── 012-create-podcasts-table.sql        # Renamed from snake_case
│   │   ├── 013-seed-podcasts.sql
│   │   ├── 014-add-key-topics-and-structured-notes.sql
│   │   ├── 015-add-guest-roles-and-enhance-social.sql
│   │   ├── 016-add-podcast-highlights.sql
│   │   ├── 017-conference-payment-columns.sql   # Moved from migrations/
│   │   ├── 018-rate-limits.sql
│   │   ├── 019-conference-email-timestamps.sql
│   │   ├── 030-admin-transaction-detail-schema.sql
│   │   ├── 031-enhance-payments-stripe-references.sql
│   │   ├── 032-add-provider-and-message-to-donations.sql
│   │   ├── 034-support-feedback.sql
│   │   ├── 035-support-admin-actions.sql
│   │   ├── 036-admin-notifications.sql
│   │   ├── 037-homepage-cms-schema.sql
│   │   ├── 038-homepage-cms-additional-keys.sql
│   │   ├── 039-homepage-cms-story-whatwedo.sql
│   │   ├── 039b-testimonials-storage-bucket.sql # Renumbered from 039
│   │   ├── 040-conference-form-schema.sql
│   │   ├── 040b-restrict-donations-insert-policy.sql  # Renumbered from 040
│   │   ├── 041-conference-file-upload-bucket.sql
│   │   ├── 041b-bank-transfer-donations.sql     # Renumbered from 041
│   │   ├── 042-conference-form-templates.sql
│   │   ├── 043-multi-event-support.sql
│   │   ├── 050-events-module-schema.sql
│   │   ├── 051-event-registration-enhancements.sql
│   │   ├── 052-agenda-highlighted.sql
│   │   ├── 053-ticket-sold-count.sql
│   │   ├── 054-add-custom-email-template-type.sql
│   │   ├── 055-event-form-template-seeds.sql
│   │   ├── 056-event-payment-integration.sql
│   │   ├── 056b-event-uploads-storage-bucket.sql # Renumbered from 056
│   │   ├── 057-event-qr-payment.sql
│   │   ├── 057b-extend-payments-for-registrations.sql # Renumbered from 057
│   │   ├── 057c-ticket-sold-count-rpc.sql       # Renumbered from 057
│   │   ├── 058-add-archived-at.sql
│   │   ├── 059-extend-review-tracking-to-events.sql
│   │   ├── 060-add-team-social-links.sql
│   │   ├── 060b-event-ticket-price-tbd.sql      # Renumbered from 060
│   │   ├── 061-about-page-cms.sql
│   │   ├── 061b-pay-at-venue-payment-methods.sql # Renumbered from 061
│   │   └── 062-payment-bank-fields.sql
│   │
│   ├── programs-migrations/            # Programs CMS migrations (separate series)
│   │   ├── README.md
│   │   ├── P01-programs-cms-foundation.sql      # Renumbered from 060
│   │   ├── P02-program-assets-storage.sql       # Renumbered from 061
│   │   ├── P03-program-seo-columns.sql          # Renumbered from 062
│   │   ├── P04-fix-program-assets-public-bucket.sql  # Renumbered from 063
│   │   ├── P05-simplify-program-assets-rls.sql  # Renumbered from 064
│   │   ├── P06-programs-phase12-hardening.sql   # Renumbered from 065
│   │   ├── P07-programs-test-fixtures.sql       # Renumbered from 066
│   │   ├── P08-grant-program-versions-insert.sql # Renumbered from 067
│   │   └── P09-add-last-published-revision.sql  # Renumbered from 068
│   │
│   ├── payments-v2/                    # Payment V2 migrations (numbered 020-029)
│   │   ├── README.md
│   │   ├── 020-create-payments-table.sql
│   │   ├── 021-create-receipts-table.sql
│   │   ├── 022-create-payment-jobs-table.sql
│   │   ├── 023-enhance-payment-events.sql
│   │   ├── 024-add-indexes.sql
│   │   ├── 025-atomic-receipt-number.sql
│   │   ├── 026-create-receipt-failures-table.sql
│   │   ├── 027-create-email-failures-table.sql
│   │   ├── 028-add-confirmed-at-to-donations.sql
│   │   └── 029-add-verification-id-to-donations.sql
│   │
│   ├── seeds/                          # Seed data (not migrations)
│   │   ├── seed-default-form-schema.sql
│   │   ├── seed-real-stories.sql       # Moved from root (was numbered 020)
│   │   ├── insert-podcasts.mjs
│   │   └── run-stories-seed.mjs
│   │
│   └── diagnostics/                    # Debug and diagnostic queries
│       ├── check-rate-limit-setup.sql
│       ├── debug-verification.sql
│       ├── diagnose-receipt-issue.sql
│       ├── find-valid-verification.sql
│       └── fix-verification-id.sql
│
├── fixes/                              # Security & RLS fix scripts (archive after execution)
│   ├── README.md
│   ├── 000-pre-execution-verification.sql
│   ├── 001-fix-security-definer-views.sql
│   ├── 002-enable-rls-tables.sql
│   ├── 003-sensitive-columns-protection.sql
│   ├── 004-fix-function-search-paths.sql
│   ├── 005-fix-permissive-rls-policies.sql
│   ├── 006-fix-public-bucket-listing.sql
│   ├── 007-fix-function-execution-perms.sql
│   └── 999-post-execution-verification.sql
│
├── deploy/                             # Deployment and operations scripts
│   ├── README.md
│   ├── deploy-staging.ps1
│   ├── deploy-staging.sh
│   ├── deploy-production.ps1
│   ├── enable-v2-staging.ps1
│   ├── enable-v2-staging.sh
│   ├── monitor-staging.ps1
│   ├── smoke-tests-staging.ps1
│   └── smoke-tests-staging.sh
│
├── ops/                                # Operational utilities
│   ├── README.md
│   ├── generate-secrets.ps1
│   ├── generate-secrets.sh
│   ├── test-credentials.ps1
│   ├── test-credentials.sh
│   ├── check-env-vars.js
│   ├── scan-all-routes.ps1
│   └── validate-payment-config.ts
│
├── cron/                               # Scheduled jobs
│   ├── README.md
│   └── reconcile-payments.ts
│
├── test/                               # Test scripts
│   ├── README.md
│   ├── test-rate-limit.js
│   ├── test-esewa-signature.mjs
│   ├── test-gmail.mjs
│   └── test-khalti-connection.mjs
│
└── archive/                            # One-time fix scripts (kept for reference)
    ├── README.md
    ├── backfill-stripe-payment-intents.ts
    ├── migrate-programs.ts
    ├── fix-initiative-images.mjs
    └── run-stories-seed.mjs
```

### Why This Structure

| Folder | Purpose | Why It Exists |
|--------|---------|---------------|
| `db/` | All database-related scripts | Separates database concerns from everything else |
| `db/migrations/` | Production schema changes | The core of the database — must be clearly ordered |
| `db/programs-migrations/` | Programs CMS migrations | Separate series with P-prefix to avoid numbering conflicts |
| `db/payments-v2/` | Payment V2 migrations | Separate numbering scheme, self-contained |
| `db/seeds/` | Seed data | Distinct from schema migrations |
| `db/diagnostics/` | Debug and diagnostic queries | Should never be run in production |
| `fixes/` | Security & RLS fixes | One-time hardening scripts, archive after execution |
| `deploy/` | Deployment scripts | Cross-platform deployment automation |
| `ops/` | Operational utilities | Secret generation, config validation, env checking |
| `cron/` | Scheduled jobs | Background tasks that run on a schedule |
| `test/` | Test scripts | Manual testing utilities |
| `archive/` | One-time fix scripts | Historical, kept for reference |

### What Changed from Previous Structure

| Previous | New | Reason |
|----------|-----|--------|
| Flat root with 70+ files | 7 organized subfolders | Findability and maintainability |
| `payments-v2/` at root | `db/payments-v2/` | It's a database concern |
| `migrations/` at root (mixed numbering) | `db/programs-migrations/` (P-prefix) | Separate series with clear naming |
| `fixes/` at root | `fixes/` kept at root | Security fixes are a distinct concern |
| Debug scripts mixed with migrations | `db/diagnostics/` | Debug scripts should never run in production |
| No clear deployment section | `deploy/` | Deployment scripts deserve their own home |
| Documentation in `payments-v2/` | Moved to `docs/` | Docs don't belong with scripts |
| No entry point | `README.md` at every level | Navigation and discoverability |

---

## 4. Naming Standard

### Rules

| Rule | Standard | Example | Reasoning |
|------|----------|---------|-----------|
| **SQL migrations** | `NNN-kebab-case.sql` | `001-create-tables.sql` | Numbered for execution order |
| **Shell scripts** | `kebab-case.{ps1,sh}` | `deploy-staging.ps1` | Consistent with codebase |
| **JS/TS scripts** | `kebab-case.{js,ts,mjs}` | `validate-payment-config.ts` | Consistent with codebase |
| **Numbering** | Sequential, no gaps | 001, 002, 003 | Execution order matters |
| **No snake_case** | Always kebab-case | `create-podcasts-table.sql` | Not `create_podcasts_table.sql` |
| **No status words** | Never COMPLETE, FIXED | ~~`receipt-system-complete.sql`~~ | Status changes; filenames shouldn't |
| **README.md** | One per folder | `db/README.md` | Navigation |

### Numbering Rules for Migrations

- Each migration gets a unique number
- Numbers are sequential within their context (root migrations, payments-v2, programs-migrations)
- Once assigned, a number is never reused
- Gaps are allowed but should be documented
- Duplicate numbers are never allowed (fix all 12+ conflicts)
- Programs CMS migrations use P-prefix (`P01-P09`) to avoid conflicts with root numbering

### Fixing Duplicate Numbers

| Number | Files | Resolution |
|--------|-------|------------|
| 012 | `012-create_podcasts_table.sql`, `012-receipt-sequence.sql` | Receipt sequence becomes `011b-receipt-sequence.sql` |
| 018 | `018-rate-limit-function.sql`, `018-rate-limits.sql` | Rate limits becomes `018b-rate-limits.sql` |
| 025 | `025-atomic-receipt-number.sql`, `025-create-payment-logs-table.sql` | Payment logs becomes `025b` in payments-v2 |
| 030 | `030-admin-transaction-detail-schema.sql`, `030-cleanup-constraint.sql` | DELETE cleanup (one-time) |
| 039 | `039-homepage-cms-story-whatwedo.sql`, `039-testimonials-storage-bucket.sql` | Testimonials becomes `039b` |
| 040 | `040-conference-form-schema.sql`, `040-restrict-donations-insert-policy.sql` | Donations policy becomes `040b` |
| 041 | `041-conference-file-upload-bucket.sql`, `041-bank-transfer-donations.sql` | Bank transfer becomes `041b` |
| 056 | `056-event-payment-integration.sql`, `056-event-uploads-storage-bucket.sql` | Storage bucket becomes `056b` |
| 057 | `057-event-qr-payment.sql`, `057-extend-payments-for-registrations.sql`, `057-ticket-sold-count-rpc.sql` | Keep QR payment as 057, others become 057b, 057c |
| 060 | `060-add-team-social-links.sql`, `060-event-ticket-price-tbd.sql` | Event price becomes `060b` |
| 061 | `061-about-page-cms.sql`, `061-pay-at-venue-payment-methods.sql` | Pay at venue becomes `061b` |
| 062 | Root `062-payment-bank-fields.sql` vs `migrations/062-program-seo-columns.sql` | Programs uses P-prefix (P03) |

---

## 5. Migration Mapping Table

### Root-Level SQL Scripts → `db/migrations/`

| Current Path | New Path | Action | Notes |
|-------------|----------|--------|-------|
| `001-create-tables.sql` | `db/migrations/001-create-tables.sql` | MOVE | |
| `002-admin-schema.sql` | `db/migrations/002-admin-schema.sql` | MOVE | |
| `003-storage-setup.sql` | `db/migrations/003-storage-setup.sql` | MOVE | |
| `004-site-assets-storage.sql` | `db/migrations/004-site-assets-storage.sql` | MOVE | |
| `005-expand-site-settings.sql` | `db/migrations/005-expand-site-settings.sql` | MOVE | |
| `006-media-assets.sql` | `db/migrations/006-media-assets.sql` | MOVE | |
| `007-sync-existing-media.sql` | `db/migrations/007-sync-existing-media.sql` | MOVE | |
| `008-currency-support.sql` | `db/migrations/008-currency-support.sql` | MOVE | |
| `009-payment-security-hardening.sql` | `db/migrations/009-payment-security-hardening.sql` | MOVE | |
| `010-receipt-system.sql` | `db/migrations/010-receipt-system.sql` | MOVE | |
| `011-receipt-system-complete.sql` | — | DELETE | Superseded by 010 |
| `012-create_podcasts_table.sql` | `db/migrations/012-create-podcasts-table.sql` | MOVE + rename | Fix snake_case |
| `012-receipt-sequence.sql` | `db/migrations/011b-receipt-sequence.sql` | MOVE + renumber | Resolve 012 conflict |
| `013-seed_podcasts.sql` | `db/migrations/013-seed-podcasts.sql` | MOVE + rename | Fix snake_case |
| `014-add_key_topics_and_structured_notes.sql` | `db/migrations/014-add-key-topics-and-structured-notes.sql` | MOVE + rename | Fix snake_case |
| `015-add_guest_roles_and_enhance_social.sql` | `db/migrations/015-add-guest-roles-and-enhance-social.sql` | MOVE + rename | Fix snake_case |
| `016-add_podcast_highlights.sql` | `db/migrations/016-add-podcast-highlights.sql` | MOVE + rename | Fix snake_case |
| `018-rate-limit-function.sql` | `db/migrations/018-rate-limit-function.sql` | MOVE | |
| `018-rate-limits.sql` | `db/migrations/018b-rate-limits.sql` | MOVE + renumber | Resolve 018 conflict |
| `019-conference-email-timestamps.sql` | `db/migrations/019-conference-email-timestamps.sql` | MOVE | |
| `020-seed-real-stories.sql` | `db/seeds/seed-real-stories.sql` | MOVE + rename | This is seed data, not migration |
| `030-admin-transaction-detail-schema.sql` | `db/migrations/030-admin-transaction-detail-schema.sql` | MOVE | |
| `030-cleanup-constraint.sql` | — | DELETE | One-time cleanup, no longer needed |
| `031-enhance-payments-stripe-references.sql` | `db/migrations/031-enhance-payments-stripe-references.sql` | MOVE | |
| `032-add-provider-and-message-to-donations.sql` | `db/migrations/032-add-provider-and-message-to-donations.sql` | MOVE | |
| `034-support-feedback.sql` | `db/migrations/034-support-feedback.sql` | MOVE | |
| `035-support-admin-actions.sql` | `db/migrations/035-support-admin-actions.sql` | MOVE | |
| `036-admin-notifications.sql` | `db/migrations/036-admin-notifications.sql` | MOVE | |
| `037-homepage-cms-schema.sql` | `db/migrations/037-homepage-cms-schema.sql` | MOVE | |
| `038-homepage-cms-additional-keys.sql` | `db/migrations/038-homepage-cms-additional-keys.sql` | MOVE | |
| `039-homepage-cms-story-whatwedo.sql` | `db/migrations/039-homepage-cms-story-whatwedo.sql` | MOVE | |
| `039-testimonials-storage-bucket.sql` | `db/migrations/039b-testimonials-storage-bucket.sql` | MOVE + renumber | Resolve 039 conflict |
| `040-conference-form-schema.sql` | `db/migrations/040-conference-form-schema.sql` | MOVE | |
| `040-restrict-donations-insert-policy.sql` | `db/migrations/040b-restrict-donations-insert-policy.sql` | MOVE + renumber | Resolve 040 conflict |
| `041-conference-file-upload-bucket.sql` | `db/migrations/041-conference-file-upload-bucket.sql` | MOVE | |
| `041-bank-transfer-donations.sql` | `db/migrations/041b-bank-transfer-donations.sql` | MOVE + renumber | Resolve 041 conflict |
| `042-conference-form-templates.sql` | `db/migrations/042-conference-form-templates.sql` | MOVE | |
| `043-multi-event-support.sql` | `db/migrations/043-multi-event-support.sql` | MOVE | |
| `050-events-module-schema.sql` | `db/migrations/050-events-module-schema.sql` | MOVE | |
| `051-event-registration-enhancements.sql` | `db/migrations/051-event-registration-enhancements.sql` | MOVE | |
| `052-agenda-highlighted.sql` | `db/migrations/052-agenda-highlighted.sql` | MOVE | |
| `053-ticket-sold-count.sql` | `db/migrations/053-ticket-sold-count.sql` | MOVE | |
| `054-add-custom-email-template-type.sql` | `db/migrations/054-add-custom-email-template-type.sql` | MOVE | |
| `055-event-form-template-seeds.sql` | `db/migrations/055-event-form-template-seeds.sql` | MOVE | |
| `056-event-payment-integration.sql` | `db/migrations/056-event-payment-integration.sql` | MOVE | |
| `056-event-uploads-storage-bucket.sql` | `db/migrations/056b-event-uploads-storage-bucket.sql` | MOVE + renumber | Resolve 056 conflict |
| `057-event-qr-payment.sql` | `db/migrations/057-event-qr-payment.sql` | MOVE | |
| `057-extend-payments-for-registrations.sql` | `db/migrations/057b-extend-payments-for-registrations.sql` | MOVE + renumber | Resolve 057 conflict |
| `057-ticket-sold-count-rpc.sql` | `db/migrations/057c-ticket-sold-count-rpc.sql` | MOVE + renumber | Resolve 057 conflict |
| `058-add-archived-at.sql` | `db/migrations/058-add-archived-at.sql` | MOVE | |
| `059-extend-review-tracking-to-events.sql` | `db/migrations/059-extend-review-tracking-to-events.sql` | MOVE | |
| `060-add-team-social-links.sql` | `db/migrations/060-add-team-social-links.sql` | MOVE | |
| `060-event-ticket-price-tbd.sql` | `db/migrations/060b-event-ticket-price-tbd.sql` | MOVE + renumber | Resolve 060 conflict |
| `061-about-page-cms.sql` | `db/migrations/061-about-page-cms.sql` | MOVE | |
| `061-pay-at-venue-payment-methods.sql` | `db/migrations/061b-pay-at-venue-payment-methods.sql` | MOVE + renumber | Resolve 061 conflict |
| `062-payment-bank-fields.sql` | `db/migrations/062-payment-bank-fields.sql` | MOVE | |

### `migrations/` → `db/migrations/` and `db/programs-migrations/`

| Current Path | New Path | Action | Notes |
|-------------|----------|--------|-------|
| `migrations/017-conference-payment-columns.sql` | `db/migrations/017-conference-payment-columns.sql` | MOVE | Consolidate with main migrations |
| `migrations/conference_registrations.sql` | `db/migrations/017b-conference-registrations.sql` | MOVE + rename | Initial table, snake_case fix |
| `migrations/060-programs-cms-foundation.sql` | `db/programs-migrations/P01-programs-cms-foundation.sql` | MOVE + rename | P-prefix series |
| `migrations/061-program-assets-storage.sql` | `db/programs-migrations/P02-program-assets-storage.sql` | MOVE + rename | P-prefix series |
| `migrations/062-program-seo-columns.sql` | `db/programs-migrations/P03-program-seo-columns.sql` | MOVE + rename | P-prefix series |
| `migrations/063-fix-program-assets-public-bucket.sql` | `db/programs-migrations/P04-fix-program-assets-public-bucket.sql` | MOVE + rename | P-prefix series |
| `migrations/064-simplify-program-assets-rls.sql` | `db/programs-migrations/P05-simplify-program-assets-rls.sql` | MOVE + rename | P-prefix series |
| `migrations/065-programs-phase12-hardening.sql` | `db/programs-migrations/P06-programs-phase12-hardening.sql` | MOVE + rename | P-prefix series |
| `migrations/066-programs-test-fixtures.sql` | `db/programs-migrations/P07-programs-test-fixtures.sql` | MOVE + rename | P-prefix series |
| `migrations/067-grant-program-versions-insert.sql` | `db/programs-migrations/P08-grant-program-versions-insert.sql` | MOVE + rename | P-prefix series |
| `migrations/068-add-last-published-revision.sql` | `db/programs-migrations/P09-add-last-published-revision.sql` | MOVE + rename | P-prefix series |
| `migrations/060-REVIEW.md` | `docs/features/programs/060-review.md` | MOVE to docs | Documentation |

### `payments-v2/` → `db/payments-v2/`

| Current Path | New Path | Action | Notes |
|-------------|----------|--------|-------|
| `payments-v2/020-create-payments-table.sql` | `db/payments-v2/020-create-payments-table.sql` | MOVE | |
| `payments-v2/021-create-receipts-table.sql` | `db/payments-v2/021-create-receipts-table.sql` | MOVE | |
| `payments-v2/022-create-payment-jobs-table.sql` | `db/payments-v2/022-create-payment-jobs-table.sql` | MOVE | |
| `payments-v2/023-enhance-payment-events.sql` | `db/payments-v2/023-enhance-payment-events.sql` | MOVE | |
| `payments-v2/024-add-indexes.sql` | `db/payments-v2/024-add-indexes.sql` | MOVE | |
| `payments-v2/025-atomic-receipt-number.sql` | `db/payments-v2/025-atomic-receipt-number.sql` | MOVE | |
| `payments-v2/025-create-payment-logs-table.sql` | `db/payments-v2/025b-create-payment-logs-table.sql` | MOVE + renumber | Resolve 025 conflict |
| `payments-v2/026-create-receipt-failures-table.sql` | `db/payments-v2/026-create-receipt-failures-table.sql` | MOVE | |
| `payments-v2/027-create-email-failures-table.sql` | `db/payments-v2/027-create-email-failures-table.sql` | MOVE | |
| `payments-v2/028-add-confirmed-at-to-donations.sql` | `db/payments-v2/028-add-confirmed-at-to-donations.sql` | MOVE | |
| `payments-v2/029-add-verification-id-to-donations.sql` | `db/payments-v2/029-add-verification-id-to-donations.sql` | MOVE | |
| `payments-v2/README.md` | `db/payments-v2/README.md` | MOVE | |
| `payments-v2/COMPATIBILITY_SUMMARY.md` | `docs/features/payments/compatibility-summary.md` | MOVE to docs | Documentation, not script |
| `payments-v2/ERROR_TRACKING_GUIDE.md` | `docs/features/payments/error-tracking-guide.md` | MOVE to docs | Documentation |
| `payments-v2/MIGRATION_ANALYSIS.md` | `docs/features/payments/migration-analysis.md` | MOVE to docs | Documentation |
| `payments-v2/MIGRATION_ORDER.md` | `docs/features/payments/migration-order.md` | MOVE to docs | Documentation |
| `payments-v2/QUICK_START.md` | `docs/features/payments/quick-start.md` | MOVE to docs | Documentation |
| `payments-v2/RECEIPT_NUMBER_IMPROVEMENTS.md` | `docs/features/payments/receipt-number-improvements.md` | MOVE to docs | Documentation |
| `payments-v2/WHATS_NEW.md` | `docs/features/payments/whats-new.md` | MOVE to docs | Documentation |

### Diagnostic SQL → `db/diagnostics/`

| Current Path | New Path | Action | Notes |
|-------------|----------|--------|-------|
| `check-rate-limit-setup.sql` | `db/diagnostics/check-rate-limit-setup.sql` | MOVE | |
| `debug-verification.sql` | `db/diagnostics/debug-verification.sql` | MOVE | Contains hardcoded UUID |
| `diagnose-receipt-issue.sql` | `db/diagnostics/diagnose-receipt-issue.sql` | MOVE | |
| `find-valid-verification.sql` | `db/diagnostics/find-valid-verification.sql` | MOVE | |
| `fix-verification-id.sql` | `db/diagnostics/fix-verification-id.sql` | MOVE | One-time fix |

### Seed Scripts → `db/seeds/`

| Current Path | New Path | Action | Notes |
|-------------|----------|--------|-------|
| `seed-default-form-schema.sql` | `db/seeds/seed-default-form-schema.sql` | MOVE | |
| `020-seed-real-stories.sql` | `db/seeds/seed-real-stories.sql` | MOVE + rename | Remove number prefix |
| `insert-podcasts.mjs` | `db/seeds/insert-podcasts.mjs` | MOVE | |
| `run-stories-seed.mjs` | `db/seeds/run-stories-seed.mjs` | MOVE | |

### Deployment Scripts → `deploy/`

| Current Path | New Path | Action | Notes |
|-------------|----------|--------|-------|
| `deploy-staging.ps1` | `deploy/deploy-staging.ps1` | MOVE | |
| `deploy-staging.sh` | `deploy/deploy-staging.sh` | MOVE | |
| `deploy-production.ps1` | `deploy/deploy-production.ps1` | MOVE | |
| `enable-v2-staging.ps1` | `deploy/enable-v2-staging.ps1` | MOVE | |
| `enable-v2-staging.sh` | `deploy/enable-v2-staging.sh` | MOVE | |
| `monitor-staging.ps1` | `deploy/monitor-staging.ps1` | MOVE | |
| `smoke-tests-staging.ps1` | `deploy/smoke-tests-staging.ps1` | MOVE | |
| `smoke-tests-staging.sh` | `deploy/smoke-tests-staging.sh` | MOVE | |

### Operational Scripts → `ops/`

| Current Path | New Path | Action | Notes |
|-------------|----------|--------|-------|
| `generate-secrets.ps1` | `ops/generate-secrets.ps1` | MOVE | |
| `generate-secrets.sh` | `ops/generate-secrets.sh` | MOVE | |
| `test-credentials.ps1` | `ops/test-credentials.ps1` | MOVE | |
| `test-credentials.sh` | `ops/test-credentials.sh` | MOVE | |
| `check-env-vars.js` | `ops/check-env-vars.js` | MOVE | |
| `validate-payment-config.ts` | `ops/validate-payment-config.ts` | MOVE | |

### Cron Jobs → `cron/`

| Current Path | New Path | Action | Notes |
|-------------|----------|--------|-------|
| `cron/reconcile-payments.ts` | `cron/reconcile-payments.ts` | KEEP | Already in correct location |

### Test Scripts → `test/`

| Current Path | New Path | Action | Notes |
|-------------|----------|--------|-------|
| `test-rate-limit.js` | `test/test-rate-limit.js` | MOVE | |
| `test-esewa-signature.mjs` | `test/test-esewa-signature.mjs` | MOVE | |
| `test-gmail.mjs` | `test/test-gmail.mjs` | MOVE | NEW — email testing |
| `test-khalti-connection.mjs` | `test/test-khalti-connection.mjs` | MOVE | |

### Archive Candidates

| Current Path | New Path | Action | Notes |
|-------------|----------|--------|-------|
| `backfill-stripe-payment-intents.ts` | `archive/backfill-stripe-payment-intents.ts` | MOVE | One-time backfill |
| `migrate-programs.ts` | `archive/migrate-programs.ts` | MOVE | One-time data migration |
| `fix-initiative-images.mjs` | `archive/fix-initiative-images.mjs` | MOVE | One-time fix |

### Operational Scripts → `ops/`

| Current Path | New Path | Action | Notes |
|-------------|----------|--------|-------|
| `generate-secrets.ps1` | `ops/generate-secrets.ps1` | MOVE | |
| `generate-secrets.sh` | `ops/generate-secrets.sh` | MOVE | |
| `test-credentials.ps1` | `ops/test-credentials.ps1` | MOVE | |
| `test-credentials.sh` | `ops/test-credentials.sh` | MOVE | |
| `check-env-vars.js` | `ops/check-env-vars.js` | MOVE | |
| `scan-all-routes.ps1` | `ops/scan-all-routes.ps1` | MOVE | NEW — route scanning |
| `validate-payment-config.ts` | `ops/validate-payment-config.ts` | MOVE | |

### Files to DELETE

| File | Reason |
|------|--------|
| `011-receipt-system-complete.sql` | Superseded by 010-receipt-system.sql |
| `030-cleanup-constraint.sql` | One-time cleanup, schema already cleaned |

---

## 6. Duplicate & Dead Script Analysis

### Duplicate Number Conflicts (12 conflicts total)

| Number | Files | Resolution |
|--------|-------|------------|
| **012** | `012-create_podcasts_table.sql` (podcasts) | Keep as 012 |
| | `012-receipt-sequence.sql` (receipt sequence) | Renumber to 011b |
| **018** | `018-rate-limit-function.sql` (function) | Keep as 018 |
| | `018-rate-limits.sql` (table) | Renumber to 018b |
| **025** | `025-atomic-receipt-number.sql` (receipt numbers) | Keep as 025 |
| | `025-create-payment-logs-table.sql` (logs) | Renumber to 025b (in payments-v2) |
| **030** | `030-admin-transaction-detail-schema.sql` (schema) | Keep as 030 |
| | `030-cleanup-constraint.sql` (cleanup) | DELETE |
| **039** | `039-homepage-cms-story-whatwedo.sql` (CMS) | Keep as 039 |
| | `039-testimonials-storage-bucket.sql` (storage) | Renumber to 039b |
| **040** | `040-conference-form-schema.sql` (conference) | Keep as 040 |
| | `040-restrict-donations-insert-policy.sql` (donations) | Renumber to 040b |
| **041** | `041-conference-file-upload-bucket.sql` (conference) | Keep as 041 |
| | `041-bank-transfer-donations.sql` (donations) | Renumber to 041b |
| **056** | `056-event-payment-integration.sql` (payment) | Keep as 056 |
| | `056-event-uploads-storage-bucket.sql` (storage) | Renumber to 056b |
| **057** | `057-event-qr-payment.sql` (QR payment) | Keep as 057 |
| | `057-extend-payments-for-registrations.sql` | Renumber to 057b |
| | `057-ticket-sold-count-rpc.sql` | Renumber to 057c |
| **060** | `060-add-team-social-links.sql` (team) | Keep as 060 |
| | `060-event-ticket-price-tbd.sql` (events) | Renumber to 060b |
| **061** | `061-about-page-cms.sql` (about page) | Keep as 061 |
| | `061-pay-at-venue-payment-methods.sql` (payments) | Renumber to 061b |

### Superseded Scripts

| Script | Superseded By | Action |
|--------|---------------|--------|
| `011-receipt-system-complete.sql` | `010-receipt-system.sql` | DELETE |
| `030-cleanup-constraint.sql` | (schema already clean) | DELETE |

### One-Time Fix Scripts (Archive)

| Script | Purpose | Action |
|--------|---------|--------|
| `debug-verification.sql` | Debug hardcoded UUID | Archive to db/diagnostics/ |
| `find-valid-verification.sql` | Find test data | Archive to db/diagnostics/ |
| `fix-verification-id.sql` | Fix missing verification IDs | Archive to db/diagnostics/ |
| `backfill-stripe-payment-intents.ts` | Backfill historical data | Archive |
| `migrate-programs.ts` | Data migration for programs | Archive |
| `fix-initiative-images.mjs` | Fix image references | Archive |

### Documentation in Wrong Place

| File | Current Location | Correct Location |
|------|-----------------|------------------|
| `payments-v2/COMPATIBILITY_SUMMARY.md` | scripts/ | docs/features/payments/ |
| `payments-v2/ERROR_TRACKING_GUIDE.md` | scripts/ | docs/features/payments/ |
| `payments-v2/MIGRATION_ANALYSIS.md` | scripts/ | docs/features/payments/ |
| `payments-v2/MIGRATION_ORDER.md` | scripts/ | docs/features/payments/ |
| `payments-v2/QUICK_START.md` | scripts/ | docs/features/payments/ |
| `payments-v2/RECEIPT_NUMBER_IMPROVEMENTS.md` | scripts/ | docs/features/payments/ |
| `payments-v2/WHATS_NEW.md` | scripts/ | docs/features/payments/ |
| `fixes/README.md` | scripts/ | Keep (operational guide) |
| `fixes/DATABASE_ISSUES_ANALYSIS.md` | scripts/ | docs/operations/ |
| `fixes/EXECUTION_GUIDE.md` | scripts/ | docs/operations/ |
| `fixes/FIXES_APPLIED.md` | scripts/ | docs/operations/ |
| `fixes/ROLLBACK_PLAN.md` | scripts/ | docs/operations/ |
| `fixes/errors.md` | scripts/ | docs/operations/ |
| `fixes/warning-errors.md` | scripts/ | docs/operations/ |
| `migrations/060-REVIEW.md` | scripts/ | docs/features/programs/ |

---

## 7. Execution Plan

> **Note:** All migrations are already applied to the database. This plan is purely about reorganizing files into a clean structure. No database changes needed.

### Phase 1: Create Structure + Fix References (1-2 hours)

**Goal:** Create the target directory structure, fix npm script references, and create READMEs.

**Scope:**
- Create all target directories (db/, db/migrations/, db/programs-migrations/, db/payments-v2/, db/seeds/, db/diagnostics/, deploy/, ops/, test/, archive/)
- Create `scripts/README.md` (navigation hub)
- Create subfolder README.md files
- Update `package.json` npm scripts to point to new paths
- Update `README.md` references to scripts/
- Fix all 12 duplicate numbers by renaming files (012, 018, 025, 039, 040, 041, 056, 057, 060, 061)

**Effort:** ~2 hours

**Why first:** Everything depends on the structure being in place. npm scripts must be updated atomically with file moves.

### Phase 2: Move + Rename SQL Migrations (2-3 hours)

**Goal:** Move all migration files to `db/migrations/` and fix naming.

**Scope:**
- Move 55+ root-level SQL scripts → `db/migrations/`
- Rename snake_case files to kebab-case (5 files)
- Rename duplicate-numbered files with b/c suffixes (039b, 040b, 041b, 056b, 057b, 057c, 060b, 061b)
- Move `migrations/017-*.sql` and `conference_registrations.sql` → `db/migrations/`
- Move `migrations/060-068` → `db/programs-migrations/` (rename to P01-P09)
- Delete superseded scripts (011-receipt-system-complete.sql, 030-cleanup-constraint.sql)

**Effort:** ~2.5 hours

### Phase 3: Move payments-v2 + Documentation (1 hour)

**Goal:** Move payments-v2 SQL to db/payments-v2/ and documentation to docs/.

**Scope:**
- Move `payments-v2/*.sql` → `db/payments-v2/`
- Move `payments-v2/*.md` → `docs/features/payments/` (7 docs)
- Keep `payments-v2/README.md` in `db/payments-v2/`
- Rename 025b in payments-v2

**Effort:** ~1 hour

### Phase 4: Move Fixes + Diagnostic + Seed + Test Scripts (1.5 hours)

**Goal:** Move debug, seed, and test scripts to their proper locations.

**Scope:**
- Move diagnostic SQL → `db/diagnostics/`
- Move seed scripts → `db/seeds/`
- Move test scripts → `test/`
- Move one-time fix scripts → `archive/`
- Keep `fixes/` as-is (already well-organized)

**Effort:** ~1.5 hours

### Phase 5: Move Deployment + Ops Scripts (1 hour)

**Goal:** Move deployment and operational scripts to their folders.

**Scope:**
- Move deployment scripts → `deploy/`
- Move operational scripts → `ops/`
- Verify all cross-platform pairs are together (ps1 + sh)

**Effort:** ~1 hour

### Phase 6: Reference Updates + Verification (2-3 hours)

**Goal:** Update all references and verify nothing is broken.

**Scope:**
- Update `package.json` npm scripts (6 references)
- Update `README.md` script references (4 references)
- Update `docs/` references to script paths (400+ references across 60+ files)
- Update `app/test-cms/page.tsx` reference
- Grep for all remaining `scripts/` references
- Verify no broken references remain

**Effort:** ~3 hours

### Phase 7: Documentation + Polish (1-2 hours)

**Goal:** Create comprehensive documentation and final verification.

**Scope:**
- Create/update READMEs at every level
- Final grep for broken references
- Verify npm scripts all work

**Effort:** ~1.5 hours

### Total Estimated Effort: ~12-15 hours

---

## 8. Reference Update Plan

### package.json (MUST UPDATE)

| npm Script | Current Path | New Path | Phase |
|-----------|-------------|----------|-------|
| `validate-config` | `scripts/validate-payment-config.ts` | `scripts/ops/validate-payment-config.ts` | 1 |
| `deploy:staging` | `scripts/deploy-staging.ps1` | `scripts/deploy/deploy-staging.ps1` | 1 |
| `deploy:production` | `scripts/deploy-production.ps1` | `scripts/deploy/deploy-production.ps1` | 1 |
| `test:staging` | `scripts/smoke-tests-staging.ps1` | `scripts/deploy/smoke-tests-staging.ps1` | 1 |
| `enable:v2` | `scripts/enable-v2-staging.ps1` | `scripts/deploy/enable-v2-staging.ps1` | 1 |
| `monitor:staging` | `scripts/monitor-staging.ps1` | `scripts/deploy/monitor-staging.ps1` | 1 |

### README.md

| Line | Current Reference | New Reference | Phase |
|------|-------------------|---------------|-------|
| 125 | `scripts/` directory | `scripts/db/migrations/` | 6 |
| 239 | `scripts/generate-secrets.ps1` | `scripts/ops/generate-secrets.ps1` | 6 |
| 240 | `scripts/test-credentials.ps1` | `scripts/ops/test-credentials.ps1` | 6 |

### docs/ References (400+ references across 60+ files)

| Referencing File | Current Reference | New Reference |
|-----------------|-------------------|---------------|
| `docs/setup/site-settings.md` | `scripts/004-site-assets-storage.sql` | `scripts/db/migrations/004-site-assets-storage.sql` |
| `docs/architecture/currency-handling.md` | `scripts/008-currency-support.sql` | `scripts/db/migrations/008-currency-support.sql` |
| `docs/operations/database-migration.md` | `scripts/006-media-assets.sql` | `scripts/db/migrations/006-media-assets.sql` |
| `docs/operations/deployment-checklist.md` | `scripts/037-homepage-cms-schema.sql` | `scripts/db/migrations/037-homepage-cms-schema.sql` |
| `docs/operations/deployment-readme.md` | `scripts/deploy-staging.ps1` | `scripts/deploy/deploy-staging.ps1` |
| `docs/features/events/08-DEPLOYMENT.md` | `scripts/050-events-module-schema.sql` | `scripts/db/migrations/050-events-module-schema.sql` |
| `docs/in-progress/programs-cms/RELEASE-RUNBOOK.md` | `scripts/migrations/060-*.sql` | `scripts/db/programs-migrations/P01-*.sql` |
| `docs/features/payments/*.md` | `scripts/payments-v2/*.sql` | `scripts/db/payments-v2/*.sql` |
| `docs/operations/credential-rotation-implementation.md` | `scripts/generate-secrets.ps1` | `scripts/ops/generate-secrets.ps1` |
| All other docs referencing `scripts/` | Update paths | To new locations |

### Code References

| File | Current Reference | New Reference |
|------|-------------------|---------------|
| `app/test-cms/page.tsx:231` | `scripts/037-homepage-cms-schema.sql` | `scripts/db/migrations/037-homepage-cms-schema.sql` |

### Scripts-Internal References (293 references)

| File | Current Reference | New Reference |
|------|-------------------|---------------|
| `scripts/fixes/warning-errors.md` | `scripts/0XX-*.sql` (53 refs) | Update to new paths |
| `scripts/payments-v2/README.md` | `scripts/payments-v2/*.sql` (46 refs) | Update to new paths |
| `scripts/fixes/DATABASE_ISSUES_ANALYSIS.md` | `scripts/0XX-*.sql` (23 refs) | Update to new paths |
| `scripts/fixes/EXECUTION_GUIDE.md` | `scripts/0XX-*.sql` (7 refs) | Update to new paths |

### Verification Commands

```bash
# 1. Find all scripts/ references in non-scripts files
rg "scripts/" --type-add 'code:*.{ts,tsx,js,jsx,json,yml,yaml}' -t code package.json README.md app/ docs/

# 2. Find all references to old script paths
rg "scripts/0[0-9][0-9]-" README.md docs/ app/

# 3. Find references to payments-v2
rg "scripts/payments-v2/" README.md docs/

# 4. Find references to migrations/ subfolder
rg "scripts/migrations/" docs/

# 5. Verify npm scripts work
npm run validate-config --dry-run
npm run deploy:staging --dry-run
npm run test:staging --dry-run

# 6. Verify no files left in root scripts/
ls scripts/*.sql scripts/*.ps1 scripts/*.sh scripts/*.js scripts/*.ts scripts/*.mjs
# Should return 0 files after Phase 5
```

---

## 9. Checklists

### Phase 1: Create Structure + Fix References

- [ ] Create `scripts/db/` directory
- [ ] Create `scripts/db/migrations/` directory
- [ ] Create `scripts/db/programs-migrations/` directory
- [ ] Create `scripts/db/payments-v2/` directory
- [ ] Create `scripts/db/seeds/` directory
- [ ] Create `scripts/db/diagnostics/` directory
- [ ] Create `scripts/deploy/` directory
- [ ] Create `scripts/ops/` directory
- [ ] Create `scripts/test/` directory
- [ ] Create `scripts/archive/` directory
- [ ] Create `scripts/README.md` (navigation hub)
- [ ] Create `scripts/db/README.md`
- [ ] Create `scripts/db/migrations/README.md`
- [ ] Create `scripts/db/programs-migrations/README.md`
- [ ] Create `scripts/deploy/README.md`
- [ ] Create `scripts/ops/README.md`
- [ ] Create `scripts/test/README.md`
- [ ] Create `scripts/archive/README.md`
- [ ] Update `package.json` npm scripts (6 references)
- [ ] Update `README.md` script references
- [ ] Fix duplicate number 012 (renumber receipt-sequence)
- [ ] Fix duplicate number 018 (renumber rate-limits)
- [ ] Fix duplicate number 025 (renumber payment-logs)
- [ ] Fix duplicate number 030 (delete cleanup script)
- [ ] Fix duplicate number 039 (renumber testimonials)
- [ ] Fix duplicate number 040 (renumber donations policy)
- [ ] Fix duplicate number 041 (renumber bank transfer)
- [ ] Fix duplicate number 056 (renumber storage bucket)
- [ ] Fix duplicate number 057 (renumber 2 of 3 variants)
- [ ] Fix duplicate number 060 (renumber event price)
- [ ] Fix duplicate number 061 (renumber pay at venue)

### Phase 2: Move SQL Migrations

- [ ] Move `001-create-tables.sql` → `db/migrations/`
- [ ] Move `002-admin-schema.sql` → `db/migrations/`
- [ ] Move `003-storage-setup.sql` → `db/migrations/`
- [ ] Move `004-site-assets-storage.sql` → `db/migrations/`
- [ ] Move `005-expand-site-settings.sql` → `db/migrations/`
- [ ] Move `006-media-assets.sql` → `db/migrations/`
- [ ] Move `007-sync-existing-media.sql` → `db/migrations/`
- [ ] Move `008-currency-support.sql` → `db/migrations/`
- [ ] Move `009-payment-security-hardening.sql` → `db/migrations/`
- [ ] Move `010-receipt-system.sql` → `db/migrations/`
- [ ] Delete `011-receipt-system-complete.sql` (superseded)
- [ ] Move `012-create_podcasts_table.sql` → `db/migrations/012-create-podcasts-table.sql` (rename)
- [ ] Move `012-receipt-sequence.sql` → `db/migrations/011b-receipt-sequence.sql` (renumber)
- [ ] Move `013-seed_podcasts.sql` → `db/migrations/013-seed-podcasts.sql` (rename)
- [ ] Move `014-add_key_topics_and_structured_notes.sql` → `db/migrations/014-add-key-topics-and-structured-notes.sql` (rename)
- [ ] Move `015-add_guest_roles_and_enhance_social.sql` → `db/migrations/015-add-guest-roles-and-enhance-social.sql` (rename)
- [ ] Move `016-add_podcast_highlights.sql` → `db/migrations/016-add-podcast-highlights.sql` (rename)
- [ ] Move `migrations/017-conference-payment-columns.sql` → `db/migrations/`
- [ ] Move `migrations/conference_registrations.sql` → `db/migrations/017b-conference-registrations.sql`
- [ ] Move `018-rate-limit-function.sql` → `db/migrations/`
- [ ] Move `018-rate-limits.sql` → `db/migrations/018b-rate-limits.sql` (renumber)
- [ ] Move `019-conference-email-timestamps.sql` → `db/migrations/`
- [ ] Move `030-admin-transaction-detail-schema.sql` → `db/migrations/`
- [ ] Delete `030-cleanup-constraint.sql` (one-time cleanup)
- [ ] Move `031-enhance-payments-stripe-references.sql` → `db/migrations/`
- [ ] Move `032-add-provider-and-message-to-donations.sql` → `db/migrations/`
- [ ] Move `034-support-feedback.sql` → `db/migrations/`
- [ ] Move `035-support-admin-actions.sql` → `db/migrations/`
- [ ] Move `036-admin-notifications.sql` → `db/migrations/`
- [ ] Move `037-homepage-cms-schema.sql` → `db/migrations/`
- [ ] Move `038-homepage-cms-additional-keys.sql` → `db/migrations/`
- [ ] Move `039-homepage-cms-story-whatwedo.sql` → `db/migrations/`
- [ ] Move `039-testimonials-storage-bucket.sql` → `db/migrations/039b-testimonials-storage-bucket.sql` (renumber)
- [ ] Move `040-conference-form-schema.sql` → `db/migrations/`
- [ ] Move `040-restrict-donations-insert-policy.sql` → `db/migrations/040b-restrict-donations-insert-policy.sql` (renumber)
- [ ] Move `041-conference-file-upload-bucket.sql` → `db/migrations/`
- [ ] Move `041-bank-transfer-donations.sql` → `db/migrations/041b-bank-transfer-donations.sql` (renumber)
- [ ] Move `042-conference-form-templates.sql` → `db/migrations/`
- [ ] Move `043-multi-event-support.sql` → `db/migrations/`
- [ ] Move `050-events-module-schema.sql` → `db/migrations/`
- [ ] Move `051-event-registration-enhancements.sql` → `db/migrations/`
- [ ] Move `052-agenda-highlighted.sql` → `db/migrations/`
- [ ] Move `053-ticket-sold-count.sql` → `db/migrations/`
- [ ] Move `054-add-custom-email-template-type.sql` → `db/migrations/`
- [ ] Move `055-event-form-template-seeds.sql` → `db/migrations/`
- [ ] Move `056-event-payment-integration.sql` → `db/migrations/`
- [ ] Move `056-event-uploads-storage-bucket.sql` → `db/migrations/056b-event-uploads-storage-bucket.sql` (renumber)
- [ ] Move `057-event-qr-payment.sql` → `db/migrations/`
- [ ] Move `057-extend-payments-for-registrations.sql` → `db/migrations/057b-extend-payments-for-registrations.sql` (renumber)
- [ ] Move `057-ticket-sold-count-rpc.sql` → `db/migrations/057c-ticket-sold-count-rpc.sql` (renumber)
- [ ] Move `058-add-archived-at.sql` → `db/migrations/`
- [ ] Move `059-extend-review-tracking-to-events.sql` → `db/migrations/`
- [ ] Move `060-add-team-social-links.sql` → `db/migrations/`
- [ ] Move `060-event-ticket-price-tbd.sql` → `db/migrations/060b-event-ticket-price-tbd.sql` (renumber)
- [ ] Move `061-about-page-cms.sql` → `db/migrations/`
- [ ] Move `061-pay-at-venue-payment-methods.sql` → `db/migrations/061b-pay-at-venue-payment-methods.sql` (renumber)
- [ ] Move `062-payment-bank-fields.sql` → `db/migrations/`
- [ ] Move `migrations/060-programs-cms-foundation.sql` → `db/programs-migrations/P01-programs-cms-foundation.sql` (rename)
- [ ] Move `migrations/061-program-assets-storage.sql` → `db/programs-migrations/P02-program-assets-storage.sql` (rename)
- [ ] Move `migrations/062-program-seo-columns.sql` → `db/programs-migrations/P03-program-seo-columns.sql` (rename)
- [ ] Move `migrations/063-fix-program-assets-public-bucket.sql` → `db/programs-migrations/P04-fix-program-assets-public-bucket.sql` (rename)
- [ ] Move `migrations/064-simplify-program-assets-rls.sql` → `db/programs-migrations/P05-simplify-program-assets-rls.sql` (rename)
- [ ] Move `migrations/065-programs-phase12-hardening.sql` → `db/programs-migrations/P06-programs-phase12-hardening.sql` (rename)
- [ ] Move `migrations/066-programs-test-fixtures.sql` → `db/programs-migrations/P07-programs-test-fixtures.sql` (rename)
- [ ] Move `migrations/067-grant-program-versions-insert.sql` → `db/programs-migrations/P08-grant-program-versions-insert.sql` (rename)
- [ ] Move `migrations/068-add-last-published-revision.sql` → `db/programs-migrations/P09-add-last-published-revision.sql` (rename)
- [ ] Move `migrations/060-REVIEW.md` → `docs/features/programs/060-review.md`

### Phase 3: Move payments-v2 + Documentation

- [ ] Move `payments-v2/020-*.sql` → `db/payments-v2/`
- [ ] Move `payments-v2/021-*.sql` → `db/payments-v2/`
- [ ] Move `payments-v2/022-*.sql` → `db/payments-v2/`
- [ ] Move `payments-v2/023-*.sql` → `db/payments-v2/`
- [ ] Move `payments-v2/024-*.sql` → `db/payments-v2/`
- [ ] Move `payments-v2/025-atomic-receipt-number.sql` → `db/payments-v2/`
- [ ] Move `payments-v2/025-create-payment-logs-table.sql` → `db/payments-v2/025b-create-payment-logs-table.sql`
- [ ] Move `payments-v2/026-*.sql` → `db/payments-v2/`
- [ ] Move `payments-v2/027-*.sql` → `db/payments-v2/`
- [ ] Move `payments-v2/028-*.sql` → `db/payments-v2/`
- [ ] Move `payments-v2/029-*.sql` → `db/payments-v2/`
- [ ] Move `payments-v2/README.md` → `db/payments-v2/`
- [ ] Move `payments-v2/COMPATIBILITY_SUMMARY.md` → `docs/features/payments/`
- [ ] Move `payments-v2/ERROR_TRACKING_GUIDE.md` → `docs/features/payments/`
- [ ] Move `payments-v2/MIGRATION_ANALYSIS.md` → `docs/features/payments/`
- [ ] Move `payments-v2/MIGRATION_ORDER.md` → `docs/features/payments/`
- [ ] Move `payments-v2/QUICK_START.md` → `docs/features/payments/`
- [ ] Move `payments-v2/RECEIPT_NUMBER_IMPROVEMENTS.md` → `docs/features/payments/`
- [ ] Move `payments-v2/WHATS_NEW.md` → `docs/features/payments/`

### Phase 4: Move Fixes + Diagnostic + Seed + Test Scripts

- [ ] Move `fixes/DATABASE_ISSUES_ANALYSIS.md` → `docs/operations/`
- [ ] Move `fixes/EXECUTION_GUIDE.md` → `docs/operations/`
- [ ] Move `fixes/FIXES_APPLIED.md` → `docs/operations/`
- [ ] Move `fixes/ROLLBACK_PLAN.md` → `docs/operations/`
- [ ] Move `fixes/errors.md` → `docs/operations/`
- [ ] Move `fixes/warning-errors.md` → `docs/operations/`
- [ ] Keep `fixes/*.sql` in `fixes/` (or archive if already executed)
- [ ] Move `check-rate-limit-setup.sql` → `db/diagnostics/`
- [ ] Move `debug-verification.sql` → `db/diagnostics/`
- [ ] Move `diagnose-receipt-issue.sql` → `db/diagnostics/`
- [ ] Move `find-valid-verification.sql` → `db/diagnostics/`
- [ ] Move `fix-verification-id.sql` → `db/diagnostics/`
- [ ] Move `seed-default-form-schema.sql` → `db/seeds/`
- [ ] Move `020-seed-real-stories.sql` → `db/seeds/seed-real-stories.sql`
- [ ] Move `insert-podcasts.mjs` → `db/seeds/`
- [ ] Move `run-stories-seed.mjs` → `db/seeds/`
- [ ] Move `test-rate-limit.js` → `test/`
- [ ] Move `test-esewa-signature.mjs` → `test/`
- [ ] Move `test-gmail.mjs` → `test/`
- [ ] Move `test-khalti-connection.mjs` → `test/`
- [ ] Move `backfill-stripe-payment-intents.ts` → `archive/`
- [ ] Move `migrate-programs.ts` → `archive/`
- [ ] Move `fix-initiative-images.mjs` → `archive/`

### Phase 5: Move Deployment + Ops Scripts

- [ ] Move `deploy-staging.ps1` → `deploy/`
- [ ] Move `deploy-staging.sh` → `deploy/`
- [ ] Move `deploy-production.ps1` → `deploy/`
- [ ] Move `enable-v2-staging.ps1` → `deploy/`
- [ ] Move `enable-v2-staging.sh` → `deploy/`
- [ ] Move `monitor-staging.ps1` → `deploy/`
- [ ] Move `smoke-tests-staging.ps1` → `deploy/`
- [ ] Move `smoke-tests-staging.sh` → `deploy/`
- [ ] Move `generate-secrets.ps1` → `ops/`
- [ ] Move `generate-secrets.sh` → `ops/`
- [ ] Move `test-credentials.ps1` → `ops/`
- [ ] Move `test-credentials.sh` → `ops/`
- [ ] Move `check-env-vars.js` → `ops/`
- [ ] Move `scan-all-routes.ps1` → `ops/`
- [ ] Move `validate-payment-config.ts` → `ops/`

### Phase 6: Reference Updates + Verification

- [ ] Update `package.json` npm scripts (6 references)
- [ ] Update `README.md` script references (3 references)
- [ ] Update `docs/` references to migration scripts (400+ references across 60+ files)
- [ ] Update `docs/operations/deployment-checklist.md` references
- [ ] Update `docs/in-progress/programs-cms/RELEASE-RUNBOOK.md` references (12 references)
- [ ] Update `app/test-cms/page.tsx` reference
- [ ] Update `docs/features/payments/*.md` references
- [ ] Update `docs/operations/credential-rotation-implementation.md` references
- [ ] Grep for all remaining `scripts/` references in non-scripts files
- [ ] Grep for references to old script paths (001-062 pattern)
- [ ] Grep for references to `scripts/migrations/` (programs CMS)
- [ ] Verify no broken references remain

### Phase 7: Documentation + Polish

- [ ] Update `scripts/README.md` (final navigation hub)
- [ ] Update `scripts/db/README.md` with migration guide
- [ ] Update `scripts/db/migrations/README.md` with execution order
- [ ] Update `scripts/db/programs-migrations/README.md` with programs CMS guide
- [ ] Create `scripts/deploy/README.md` with deployment procedures
- [ ] Create `scripts/ops/README.md` with utilities guide
- [ ] Create `scripts/test/README.md` with testing guide
- [ ] Create `scripts/archive/README.md` with archive manifest
- [ ] Final grep for broken references
- [ ] Test npm scripts (dry run)
- [ ] Verify all cross-platform pairs are documented

---

## 10. Risk Section

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Breaking npm scripts** | High (6 scripts reference old paths) | High — `npm run deploy:staging` etc. would fail | Update package.json atomically with file moves in Phase 1 |
| **Breaking doc references** | High (400+ references across 60+ files) | Medium — docs would have broken links | Update all doc references in Phase 6 |
| **Confusing migration order** | Low (all migrations already applied) | Low — no execution risk | Document numbering scheme in README for reference |
| **Parallel migration series** | Low (already applied) | Low — just organizing files | Use P-prefix for programs; document naming convention |
| **One-time scripts needed again** | Low | Low — can recover from git history | Archive instead of delete; document in archive/README.md |
| **Team confusion during migration** | Medium | Medium — concurrent work could conflict | Communicate plan; do reorg in one session |

### Pre-flight Checks

1. `git status` — ensure clean working tree
2. Verify all npm scripts work currently
3. Grep for all `scripts/` references to understand full blast radius
4. Communicate plan to team

---

## 11. Script Standards Guide

### When to Create a Script

- Repetitive task (done more than twice)
- Deployment procedure (should be automated)
- Migration (schema change)
- Diagnostic (troubleshooting)
- Test (manual verification)

### Script Naming

| Type | Pattern | Example |
|------|---------|---------|
| SQL migration (main) | `NNN-kebab-case.sql` | `063-add-new-column.sql` |
| SQL migration (programs) | `PNN-kebab-case.sql` | `P10-add-new-feature.sql` |
| Deployment | `kebab-case.{ps1,sh}` | `deploy-staging.ps1` |
| Operational | `kebab-case.{ps1,sh,js,ts}` | `generate-secrets.ps1` |
| Test | `test-kebab-case.{js,mjs}` | `test-rate-limit.js` |
| Diagnostic | `diagnose-kebab-case.sql` | `diagnose-receipt-issue.sql` |
| Seed | `seed-kebab-case.{sql,mjs}` | `seed-default-form-schema.sql` |
| Security fix | `NNN-fix-kebab-case.sql` | `001-fix-security-definer-views.sql` |

### Script Header Template

```typescript
#!/usr/bin/env tsx
/**
 * Script Title
 * 
 * Brief description of what this script does.
 * 
 * Usage:
 *   npx tsx scripts/path/to/script.ts [options]
 * 
 * Options:
 *   --flag <value>    Description (default: value)
 *   --dry-run         Run without making changes
 *   --help            Show help message
 * 
 * Environment Variables:
 *   VAR_NAME          - Description (required/optional)
 * 
 * Exit Codes:
 *   0 - Success
 *   1 - Error
 * 
 * Examples:
 *   npx tsx scripts/path/to/script.ts --dry-run
 */
```

```powershell
# Script Title
# Brief description
# Usage: .\scripts\path\script.ps1 [options]
# Options:
#   -SkipMigrations    Skip migration step
#   -DryRun            Run without making changes
# Requirements:
#   - Environment variable X must be set
```

```sql
-- ============================================================================
-- SCRIPT TITLE
-- ============================================================================
-- Description of what this script does
-- Usage: Run in Supabase SQL Editor or via psql
-- ============================================================================

-- Content here
```

### Script Documentation

Every script should have:
1. Header comment with usage, options, env vars
2. Error handling (exit codes, try/catch)
3. Output formatting (colored for terminal, structured for logs)
4. `--dry-run` option for destructive scripts
5. `--help` option for complex scripts

### Cross-Platform Scripts

When providing both PowerShell and Bash versions:
- Keep logic identical
- Use same filename with different extension
- Document both in README
- Test both platforms

---

## 12. Open Decisions

### D1: Should `020-seed-real-stories.sql` Keep Its Number?

**Question:** This script is numbered 020 but it's seed data, not a migration. Should it keep the number?

**Options:**
- **A) Remove number** → `seed-real-stories.sql` in db/seeds/
- **B) Keep number** → `020-seed-real-stories.sql` in db/seeds/

**My recommendation:** Option A. Seed data should not be numbered with migrations. The number implies it's part of the migration sequence.

### D2: Should Diagnostic Scripts Stay in the Repo?

**Question:** Debug scripts with hardcoded UUIDs (`debug-verification.sql`) are useful for debugging but clutter the repo. Should they stay?

**Options:**
- **A) Keep in db/diagnostics/** — Useful for troubleshooting
- **B) Move to archive/** — One-time use
- **C) Delete** — Recoverable from git history

**My recommendation:** Option A. Diagnostic scripts are useful for ongoing troubleshooting. The hardcoded UUID is a minor issue — it can be parameterized later.

### D3: Should We Consolidate Cross-Platform Scripts?

**Question:** `generate-secrets.ps1` and `generate-secrets.sh` do the same thing. Should we consolidate into one script that detects the platform?

**Options:**
- **A) Keep separate** — Simple, no platform detection needed
- **B) Consolidate** — Single script with platform detection

**My recommendation:** Option A. Separate scripts are simpler and more reliable. Platform detection adds complexity without clear benefit.

### D4: Should `payments-v2/` Documentation Move to docs/?

**Question:** The payments-v2/ folder has 8 markdown files alongside SQL scripts. Should these move to docs/?

**Options:**
- **A) Move to docs/** — Separation of concerns
- **B) Keep in scripts/** — Documentation about scripts should be near the scripts

**My recommendation:** Option A. Documentation about the payment system belongs in docs/, not mixed with scripts. The scripts folder should contain only executable files.

### D5: How to Handle the Numbering Gap (033)?

**Question:** There's no migration 033 (goes from 032 to 034). Should we renumber or document the gap?

**Options:**
- **A) Document the gap** — Explain in README that 033 was removed
- **B) Renumber** — Shift 034+ down to fill the gap
- **C) Leave as-is** — Gaps are normal in migration numbering

**My recommendation:** Option C. Gaps in migration numbering are normal and expected. Renumbering would break all existing references.

### D6: How to Handle the `fixes/` Folder?

**Question:** The `fixes/` folder contains security/RLS fix scripts plus documentation. Since all migrations are applied, should we keep fixes/ as-is or move the docs to docs/operations/?

**Options:**
- **A) Keep in `fixes/`** — Already well-organized with its own README
- **B) Move docs to `docs/operations/`** — Separate SQL from documentation

**My recommendation:** Option A. The fixes/ folder is self-contained. Moving docs would break the 50+ references in warning-errors.md. Keep as-is.

### D7: How to Handle Programs CMS Migrations (060-068)?

**Question:** The `migrations/` folder has 060-068 (programs CMS) that conflict with root-level 060-062. Should we use P-prefix or merge into main numbering?

**Options:**
- **A) P-prefix in `db/programs-migrations/`** — Separate series, clear naming
- **B) Merge into main numbering** — Renumber to 063-071 (after existing root)
- **C) Keep in separate folder with same numbers** — Different folder = different context

**My recommendation:** Option A. P-prefix makes it immediately clear these are programs CMS migrations. It avoids renumbering and eliminates confusion with root numbering.

### D8: Should `scan-all-routes.ps1` Go to `ops/` or `test/`?

**Question:** This script scans routes — is it an operational utility or a test script?

**Options:**
- **A) `ops/`** — It's a utility for development/operations
- **B) `test/`** — It's used for testing/verification

**My recommendation:** Option A. Route scanning is a development utility, not a test script. It's used during development to verify route configuration.

---

*This plan is updated as of 2026-09-21. All migrations are already applied to the database. This is purely a file organization task — moving 135+ files into a clean folder structure with consistent naming. Total estimated effort is 12-15 hours across 7 phases.*
