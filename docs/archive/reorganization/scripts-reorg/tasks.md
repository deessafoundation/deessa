---
title: "Scripts Folder Reorganization Plan"
description: " Status: Planning only â€” no files moved or renamed yet."
owner: "Deessa Team"
status: archived
category: archived
audience: admin
last_updated: 2026-09-12
---
# Scripts Folder Reorganization Plan

> **Status:** Planning only â€” no files moved or renamed yet.
> **Created:** 2026-07-22
> **Goal:** Transform a messy, inconsistently organized scripts folder into a clean, professional structure with clear categories, consistent naming, and proper documentation.

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Architecture Review â€” What's Wrong](#2-architecture-review--whats-wrong)
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
| SQL migrations (numbered) | 34 | 001-042 (with gaps and duplicates) |
| SQL diagnostic/debug | 5 | check-rate-limit, debug-verification, diagnose-receipt, find-valid-verification, fix-verification-id |
| SQL seed | 2 | seed-default-form-schema, seed-real-stories |
| PowerShell deployment | 4 | deploy-staging, deploy-production, enable-v2-staging, monitor-staging |
| PowerShell smoke tests | 1 | smoke-tests-staging |
| PowerShell secrets/creds | 2 | generate-secrets, test-credentials |
| Shell (bash) equivalents | 4 | deploy-staging.sh, enable-v2-staging.sh, generate-secrets.sh, smoke-tests-staging.sh, test-credentials.sh |
| JavaScript/Node scripts | 3 | check-env-vars, test-rate-limit, fix-initiative-images |
| TypeScript scripts | 2 | validate-payment-config, backfill-stripe-payment-intents |
| MJS scripts | 3 | insert-podcasts, run-stories-seed, test-esewa-signature, test-khalti-connection |
| Cron jobs | 1 | reconcile-payments.ts |
| payments-v2/ subfolder | 19 | 10 SQL migrations + 8 docs + README |
| migrations/ subfolder | 2 | conference_registrations, 017-conference-payment-columns |
| **Total** | **~80 files** | |

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

#### Duplicate Numbers
- **012** appears 3 times: `012-create_podcasts_table.sql`, `012-receipt-sequence.sql`
- **025** appears 2 times: `025-atomic-receipt-number.sql`, `025-create-payment-logs-table.sql`
- **030** appears 2 times: `030-admin-transaction-detail-schema.sql`, `030-cleanup-constraint.sql`

#### Numbering Gaps
- No 013, 014, 015, 016 in root (but 013, 014, 015, 016 exist)
- No 017 in root (it's in migrations/)
- No 020-029 in root (they're in payments-v2/)
- No 033 (gap between 032 and 034)

#### Inconsistent Naming
- `012-create_podcasts_table.sql` uses snake_case
- `012-receipt-sequence.sql` uses kebab-case
- Both claim number 012

#### Mixed Concerns
- Diagnostic SQL scripts (`debug-verification.sql`) mixed with production migrations
- Seed scripts mixed with migrations
- Documentation files (`.md`) inside `payments-v2/` alongside SQL scripts
- Deployment scripts (`.ps1`) mixed with database scripts

#### Dead/Obsolete Scripts
- `011-receipt-system-complete.sql` â€” Superseded by `010-receipt-system.sql` (the "complete" version is a duplicate)
- `030-cleanup-constraint.sql` â€” One-time cleanup, no longer needed
- `debug-verification.sql` â€” Debug script with hardcoded UUID
- `find-valid-verification.sql` â€” Debug script
- `fix-verification-id.sql` â€” One-time fix script
- `fix-initiative-images.mjs` â€” One-time fix script

### 1.4 Reference Analysis

**References from package.json (MUST NOT BREAK):**
- `scripts/validate-payment-config.ts` â†’ npm script `validate-config`
- `scripts/deploy-staging.ps1` â†’ npm script `deploy:staging`
- `scripts/deploy-production.ps1` â†’ npm script `deploy:production`
- `scripts/smoke-tests-staging.ps1` â†’ npm script `test:staging`
- `scripts/enable-v2-staging.ps1` â†’ npm script `enable:v2`
- `scripts/monitor-staging.ps1` â†’ npm script `monitor:staging`

**References from README.md:**
- `scripts/generate-secrets.ps1` / `.sh`
- `scripts/test-credentials.ps1` / `.sh`
- `scripts/` directory mentioned for SQL scripts

**References from docs/:**
- `scripts/037-homepage-cms-schema.sql` (15+ references across docs)
- `scripts/039-testimonials-storage-bucket.sql` (3 references)
- `scripts/040-conference-form-schema.sql` (5 references)
- `scripts/payments-v2/*.sql` (10+ references)
- Various other migration scripts referenced in docs

**References from code:**
- `app/test-cms/page.tsx` references `scripts/037-homepage-cms-schema.sql`

---

## 2. Architecture Review â€” What's Wrong

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

There's no obvious "start here" for someone new to the project. The README.md in payments-v2/ is good, but the root scripts/ has no navigation.

### Flaw 6: Duplicate Shell/PowerShell Scripts

`generate-secrets.ps1` and `generate-secrets.sh` do the same thing for different platforms. Same for `test-credentials`, `deploy-staging`, `enable-v2-staging`, `smoke-tests-staging`. This is fine (cross-platform support), but should be documented.

---

## 3. Refined Folder Structure

```
scripts/
â”œâ”€â”€ README.md                           # Navigation hub â€” start here
â”‚
â”œâ”€â”€ db/                                 # All database scripts
â”‚   â”œâ”€â”€ README.md                       # Migration guide and execution order
â”‚   â”œâ”€â”€ migrations/                     # Production migrations (run in order)
â”‚   â”‚   â”œâ”€â”€ README.md                   # Execution order, dependency graph
â”‚   â”‚   â”œâ”€â”€ 001-create-tables.sql
â”‚   â”‚   â”œâ”€â”€ 002-admin-schema.sql
â”‚   â”‚   â”œâ”€â”€ 003-storage-setup.sql
â”‚   â”‚   â”œâ”€â”€ 004-site-assets-storage.sql
â”‚   â”‚   â”œâ”€â”€ 005-expand-site-settings.sql
â”‚   â”‚   â”œâ”€â”€ 006-media-assets.sql
â”‚   â”‚   â”œâ”€â”€ 007-sync-existing-media.sql
â”‚   â”‚   â”œâ”€â”€ 008-currency-support.sql
â”‚   â”‚   â”œâ”€â”€ 009-payment-security-hardening.sql
â”‚   â”‚   â”œâ”€â”€ 010-receipt-system.sql
â”‚   â”‚   â”œâ”€â”€ 012-create-podcasts-table.sql        # Renamed from snake_case
â”‚   â”‚   â”œâ”€â”€ 013-seed-podcasts.sql
â”‚   â”‚   â”œâ”€â”€ 014-add-key-topics-and-structured-notes.sql
â”‚   â”‚   â”œâ”€â”€ 015-add-guest-roles-and-enhance-social.sql
â”‚   â”‚   â”œâ”€â”€ 016-add-podcast-highlights.sql
â”‚   â”‚   â”œâ”€â”€ 017-conference-payment-columns.sql   # Moved from migrations/
â”‚   â”‚   â”œâ”€â”€ 018-rate-limits.sql
â”‚   â”‚   â”œâ”€â”€ 019-conference-email-timestamps.sql
â”‚   â”‚   â”œâ”€â”€ 020-seed-real-stories.sql
â”‚   â”‚   â”œâ”€â”€ 030-admin-transaction-detail-schema.sql
â”‚   â”‚   â”œâ”€â”€ 031-enhance-payments-stripe-references.sql
â”‚   â”‚   â”œâ”€â”€ 032-add-provider-and-message-to-donations.sql
â”‚   â”‚   â”œâ”€â”€ 034-support-feedback.sql
â”‚   â”‚   â”œâ”€â”€ 035-support-admin-actions.sql
â”‚   â”‚   â”œâ”€â”€ 036-admin-notifications.sql
â”‚   â”‚   â”œâ”€â”€ 037-homepage-cms-schema.sql
â”‚   â”‚   â”œâ”€â”€ 038-homepage-cms-additional-keys.sql
â”‚   â”‚   â”œâ”€â”€ 039-testimonials-storage-bucket.sql
â”‚   â”‚   â”œâ”€â”€ 040-conference-form-schema.sql
â”‚   â”‚   â”œâ”€â”€ 041-conference-file-upload-bucket.sql
â”‚   â”‚   â””â”€â”€ 042-conference-form-templates.sql
â”‚   â”‚
â”‚   â”œâ”€â”€ payments-v2/                    # Payment V2 migrations (numbered 020-029)
â”‚   â”‚   â”œâ”€â”€ README.md
â”‚   â”‚   â”œâ”€â”€ 020-create-payments-table.sql
â”‚   â”‚   â”œâ”€â”€ 021-create-receipts-table.sql
â”‚   â”‚   â”œâ”€â”€ 022-create-payment-jobs-table.sql
â”‚   â”‚   â”œâ”€â”€ 023-enhance-payment-events.sql
â”‚   â”‚   â”œâ”€â”€ 024-add-indexes.sql
â”‚   â”‚   â”œâ”€â”€ 025-atomic-receipt-number.sql
â”‚   â”‚   â”œâ”€â”€ 026-create-receipt-failures-table.sql
â”‚   â”‚   â”œâ”€â”€ 027-create-email-failures-table.sql
â”‚   â”‚   â”œâ”€â”€ 028-add-confirmed-at-to-donations.sql
â”‚   â”‚   â””â”€â”€ 029-add-verification-id-to-donations.sql
â”‚   â”‚
â”‚   â”œâ”€â”€ seeds/                          # Seed data (not migrations)
â”‚   â”‚   â”œâ”€â”€ seed-default-form-schema.sql
â”‚   â”‚   â”œâ”€â”€ seed-real-stories.sql       # Wait â€” this is numbered 020 in root
â”‚   â”‚   â””â”€â”€ insert-podcasts.mjs
â”‚   â”‚
â”‚   â””â”€â”€ diagnostics/                    # Debug and diagnostic queries
â”‚       â”œâ”€â”€ check-rate-limit-setup.sql
â”‚       â”œâ”€â”€ debug-verification.sql
â”‚       â”œâ”€â”€ diagnose-receipt-issue.sql
â”‚       â”œâ”€â”€ find-valid-verification.sql
â”‚       â””â”€â”€ fix-verification-id.sql
â”‚
â”œâ”€â”€ deploy/                             # Deployment and operations scripts
â”‚   â”œâ”€â”€ README.md
â”‚   â”œâ”€â”€ deploy-staging.ps1
â”‚   â”œâ”€â”€ deploy-staging.sh
â”‚   â”œâ”€â”€ deploy-production.ps1
â”‚   â”œâ”€â”€ enable-v2-staging.ps1
â”‚   â”œâ”€â”€ enable-v2-staging.sh
â”‚   â”œâ”€â”€ monitor-staging.ps1
â”‚   â””â”€â”€ smoke-tests-staging.ps1
â”‚   â””â”€â”€ smoke-tests-staging.sh
â”‚
â”œâ”€â”€ ops/                                # Operational utilities
â”‚   â”œâ”€â”€ README.md
â”‚   â”œâ”€â”€ generate-secrets.ps1
â”‚   â”œâ”€â”€ generate-secrets.sh
â”‚   â”œâ”€â”€ test-credentials.ps1
â”‚   â”œâ”€â”€ test-credentials.sh
â”‚   â”œâ”€â”€ check-env-vars.js
â”‚   â””â”€â”€ validate-payment-config.ts
â”‚
â”œâ”€â”€ cron/                               # Scheduled jobs
â”‚   â”œâ”€â”€ README.md
â”‚   â””â”€â”€ reconcile-payments.ts
â”‚
â”œâ”€â”€ test/                               # Test scripts
â”‚   â”œâ”€â”€ README.md
â”‚   â”œâ”€â”€ test-rate-limit.js
â”‚   â”œâ”€â”€ test-esewa-signature.mjs
â”‚   â””â”€â”€ test-khalti-connection.mjs
â”‚
â””â”€â”€ archive/                            # One-time fix scripts (kept for reference)
    â”œâ”€â”€ README.md
    â”œâ”€â”€ backfill-stripe-payment-intents.ts
    â”œâ”€â”€ fix-initiative-images.mjs
    â””â”€â”€ run-stories-seed.mjs
```

### Why This Structure

| Folder | Purpose | Why It Exists |
|--------|---------|---------------|
| `db/` | All database-related scripts | Separates database concerns from everything else |
| `db/migrations/` | Production schema changes | The core of the database â€” must be clearly ordered |
| `db/payments-v2/` | Payment V2 migrations | Separate numbering scheme, self-contained |
| `db/seeds/` | Seed data | Distinct from schema migrations |
| `db/diagnostics/` | Debug and diagnostic queries | Should never be run in production |
| `deploy/` | Deployment scripts | Cross-platform deployment automation |
| `ops/` | Operational utilities | Secret generation, config validation, env checking |
| `cron/` | Scheduled jobs | Background tasks that run on a schedule |
| `test/` | Test scripts | Manual testing utilities |
| `archive/` | One-time fix scripts | Historical, kept for reference |

### What Changed from Previous Structure

| Previous | New | Reason |
|----------|-----|--------|
| Flat root with 40+ files | 6 organized subfolders | Findability and maintainability |
| `payments-v2/` at root | `db/payments-v2/` | It's a database concern |
| `migrations/` at root | `db/migrations/` consolidated | All migrations in one place |
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
- Numbers are sequential within their context (root migrations, payments-v2)
- Once assigned, a number is never reused
- Gaps are allowed but should be documented
- Duplicate numbers are never allowed (fix the existing 012, 025, 030 conflicts)

### Fixing Duplicate Numbers

| Number | Files | Resolution |
|--------|-------|------------|
| 012 | `012-create_podcasts_table.sql`, `012-receipt-sequence.sql` | Receipt sequence becomes `011b-receipt-sequence.sql` or renumber |
| 025 | `025-atomic-receipt-number.sql`, `025-create-payment-logs-table.sql` | Payment logs becomes `025b` or renumber |
| 030 | `030-admin-transaction-detail-schema.sql`, `030-cleanup-constraint.sql` | Cleanup becomes `030b` or deleted |

---

## 5. Migration Mapping Table

### Root-Level SQL Scripts â†’ `db/migrations/`

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
| `011-receipt-system-complete.sql` | â€” | DELETE | Superseded by 010 |
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
| `030-cleanup-constraint.sql` | â€” | DELETE | One-time cleanup, no longer needed |
| `031-enhance-payments-stripe-references.sql` | `db/migrations/031-enhance-payments-stripe-references.sql` | MOVE | |
| `032-add-provider-and-message-to-donations.sql` | `db/migrations/032-add-provider-and-message-to-donations.sql` | MOVE | |
| `034-support-feedback.sql` | `db/migrations/034-support-feedback.sql` | MOVE | |
| `035-support-admin-actions.sql` | `db/migrations/035-support-admin-actions.sql` | MOVE | |
| `036-admin-notifications.sql` | `db/migrations/036-admin-notifications.sql` | MOVE | |
| `037-homepage-cms-schema.sql` | `db/migrations/037-homepage-cms-schema.sql` | MOVE | |
| `038-homepage-cms-additional-keys.sql` | `db/migrations/038-homepage-cms-additional-keys.sql` | MOVE | |
| `039-testimonials-storage-bucket.sql` | `db/migrations/039-testimonials-storage-bucket.sql` | MOVE | |
| `040-conference-form-schema.sql` | `db/migrations/040-conference-form-schema.sql` | MOVE | |
| `041-conference-file-upload-bucket.sql` | `db/migrations/041-conference-file-upload-bucket.sql` | MOVE | |
| `042-conference-form-templates.sql` | `db/migrations/042-conference-form-templates.sql` | MOVE | |

### `migrations/` â†’ `db/migrations/`

| Current Path | New Path | Action | Notes |
|-------------|----------|--------|-------|
| `migrations/017-conference-payment-columns.sql` | `db/migrations/017-conference-payment-columns.sql` | MOVE | Consolidate with main migrations |
| `migrations/conference_registrations.sql` | `db/migrations/017b-conference-registrations.sql` | MOVE + rename | Initial table, snake_case fix |

### `payments-v2/` â†’ `db/payments-v2/`

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

### Diagnostic SQL â†’ `db/diagnostics/`

| Current Path | New Path | Action | Notes |
|-------------|----------|--------|-------|
| `check-rate-limit-setup.sql` | `db/diagnostics/check-rate-limit-setup.sql` | MOVE | |
| `debug-verification.sql` | `db/diagnostics/debug-verification.sql` | MOVE | Contains hardcoded UUID |
| `diagnose-receipt-issue.sql` | `db/diagnostics/diagnose-receipt-issue.sql` | MOVE | |
| `find-valid-verification.sql` | `db/diagnostics/find-valid-verification.sql` | MOVE | |
| `fix-verification-id.sql` | `db/diagnostics/fix-verification-id.sql` | MOVE | One-time fix |

### Seed Scripts â†’ `db/seeds/`

| Current Path | New Path | Action | Notes |
|-------------|----------|--------|-------|
| `seed-default-form-schema.sql` | `db/seeds/seed-default-form-schema.sql` | MOVE | |
| `020-seed-real-stories.sql` | `db/seeds/seed-real-stories.sql` | MOVE + rename | Remove number prefix |
| `insert-podcasts.mjs` | `db/seeds/insert-podcasts.mjs` | MOVE | |
| `run-stories-seed.mjs` | `db/seeds/run-stories-seed.mjs` | MOVE | |

### Deployment Scripts â†’ `deploy/`

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

### Operational Scripts â†’ `ops/`

| Current Path | New Path | Action | Notes |
|-------------|----------|--------|-------|
| `generate-secrets.ps1` | `ops/generate-secrets.ps1` | MOVE | |
| `generate-secrets.sh` | `ops/generate-secrets.sh` | MOVE | |
| `test-credentials.ps1` | `ops/test-credentials.ps1` | MOVE | |
| `test-credentials.sh` | `ops/test-credentials.sh` | MOVE | |
| `check-env-vars.js` | `ops/check-env-vars.js` | MOVE | |
| `validate-payment-config.ts` | `ops/validate-payment-config.ts` | MOVE | |

### Cron Jobs â†’ `cron/`

| Current Path | New Path | Action | Notes |
|-------------|----------|--------|-------|
| `cron/reconcile-payments.ts` | `cron/reconcile-payments.ts` | KEEP | Already in correct location |

### Test Scripts â†’ `test/`

| Current Path | New Path | Action | Notes |
|-------------|----------|--------|-------|
| `test-rate-limit.js` | `test/test-rate-limit.js` | MOVE | |
| `test-esewa-signature.mjs` | `test/test-esewa-signature.mjs` | MOVE | |
| `test-khalti-connection.mjs` | `test/test-khalti-connection.mjs` | MOVE | |

### Archive Candidates

| Current Path | New Path | Action | Notes |
|-------------|----------|--------|-------|
| `backfill-stripe-payment-intents.ts` | `archive/backfill-stripe-payment-intents.ts` | MOVE | One-time backfill |
| `fix-initiative-images.mjs` | `archive/fix-initiative-images.mjs` | MOVE | One-time fix |

### Files to DELETE

| File | Reason |
|------|--------|
| `011-receipt-system-complete.sql` | Superseded by 010-receipt-system.sql |
| `030-cleanup-constraint.sql` | One-time cleanup, schema already cleaned |

---

## 6. Duplicate & Dead Script Analysis

### Duplicate Number Conflicts

| Number | Files | Resolution |
|--------|-------|------------|
| **012** | `012-create_podcasts_table.sql` (podcasts) | Keep as 012 |
| | `012-receipt-sequence.sql` (receipt sequence) | Renumber to 011b |
| **018** | `018-rate-limit-function.sql` (function) | Keep as 018 |
| | `018-rate-limits.sql` (table) | Renumber to 018b |
| **025** | `025-atomic-receipt-number.sql` (receipt numbers) | Keep as 025 |
| | `025-create-payment-logs-table.sql` (logs) | Renumber to 025b |
| **030** | `030-admin-transaction-detail-schema.sql` (schema) | Keep as 030 |
| | `030-cleanup-constraint.sql` (cleanup) | DELETE |

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

---

## 7. Execution Plan

### Phase 1: Create Structure + Fix References (1-2 hours)

**Goal:** Create the target directory structure, fix npm script references, and create READMEs.

**Scope:**
- Create all target directories (db/, db/migrations/, db/payments-v2/, db/seeds/, db/diagnostics/, deploy/, ops/, test/, archive/)
- Create `scripts/README.md` (navigation hub)
- Create subfolder README.md files
- Update `package.json` npm scripts to point to new paths
- Update `README.md` references to scripts/
- Fix duplicate numbers (012, 018, 025, 030)

**Effort:** ~2 hours

**Why first:** Everything depends on the structure being in place. npm scripts must be updated atomically with file moves.

### Phase 2: Move SQL Migrations (1-2 hours)

**Goal:** Consolidate all database migrations into `db/migrations/`.

**Scope:**
- Move root-level numbered SQL scripts â†’ `db/migrations/`
- Move `migrations/` contents â†’ `db/migrations/`
- Fix snake_case filenames to kebab-case
- Handle duplicate numbers (renumber or delete)
- Delete superseded scripts (011, 030-cleanup)
- Create `db/migrations/README.md` with execution order

**Effort:** ~1.5 hours

### Phase 3: Move payments-v2 + Documentation (1 hour)

**Goal:** Move payments-v2 SQL to db/payments-v2/ and documentation to docs/.

**Scope:**
- Move `payments-v2/*.sql` â†’ `db/payments-v2/`
- Move `payments-v2/*.md` â†’ `docs/features/payments/` (7 docs)
- Keep `payments-v2/README.md` in `db/payments-v2/`
- Fix 025 duplicate
- Update all references to `scripts/payments-v2/` paths

**Effort:** ~1 hour

### Phase 4: Move Diagnostic + Seed + Test Scripts (1 hour)

**Goal:** Move debug, seed, and test scripts to their proper locations.

**Scope:**
- Move diagnostic SQL â†’ `db/diagnostics/`
- Move seed scripts â†’ `db/seeds/`
- Move test scripts â†’ `test/`
- Move one-time fix scripts â†’ `archive/`

**Effort:** ~1 hour

### Phase 5: Move Deployment + Ops Scripts (1 hour)

**Goal:** Move deployment and operational scripts to their folders.

**Scope:**
- Move deployment scripts â†’ `deploy/`
- Move operational scripts â†’ `ops/`
- Verify all cross-platform pairs are together (ps1 + sh)

**Effort:** ~1 hour

### Phase 6: Reference Updates + Verification (1-2 hours)

**Goal:** Update all references and verify nothing is broken.

**Scope:**
- Update `package.json` npm scripts (6 references)
- Update `README.md` script references (4 references)
- Update `docs/` references to script paths (30+ references)
- Update `app/test-cms/page.tsx` reference
- Update `DEPLOYMENT_CHECKLIST.md` references
- Grep for all remaining `scripts/` references
- Verify no broken references remain

**Effort:** ~2 hours

### Phase 7: Documentation + Polish (1 hour)

**Goal:** Create comprehensive documentation and final verification.

**Scope:**
- Create `scripts/README.md` (final navigation hub)
- Create `db/README.md` with migration guide
- Create `db/migrations/README.md` with execution order and dependency graph
- Create `deploy/README.md` with deployment procedures
- Create `ops/README.md` with operational utilities guide
- Create `test/README.md` with testing guide
- Final grep for broken references
- Verify npm scripts all work

**Effort:** ~1 hour

### Total Estimated Effort: ~8-10 hours

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

### docs/ References (30+ references to update)

| Referencing File | Current Reference | New Reference |
|-----------------|-------------------|---------------|
| `docs/MANUAL_BUCKET_SETUP.md` | `scripts/039-testimonials-storage-bucket.sql` | `scripts/db/migrations/039-testimonials-storage-bucket.sql` |
| `docs/TESTIMONIALS_IMAGE_UPLOAD.md` | `scripts/039-testimonials-storage-bucket.sql` | `scripts/db/migrations/039-testimonials-storage-bucket.sql` |
| `docs/homepage-cms-integrations/README_HOMEPAGE_CMS.md` | `scripts/037-homepage-cms-schema.sql` | `scripts/db/migrations/037-homepage-cms-schema.sql` |
| `docs/HOMEPAGE_CMS_COMPLETE_SUMMARY.md` | `scripts/037-homepage-cms-schema.sql` | `scripts/db/migrations/037-homepage-cms-schema.sql` |
| `DEPLOYMENT_CHECKLIST.md` | `scripts/037-homepage-cms-schema.sql` | `scripts/db/migrations/037-homepage-cms-schema.sql` |
| `docs/payments-v2/README.md` | `scripts/payments-v2/*.sql` | `scripts/db/payments-v2/*.sql` |
| All other docs referencing `scripts/` | Update paths | To new locations |

### Code References

| File | Current Reference | New Reference |
|------|-------------------|---------------|
| `app/test-cms/page.tsx:231` | `scripts/037-homepage-cms-schema.sql` | `scripts/db/migrations/037-homepage-cms-schema.sql` |

### Verification Commands

```bash
# 1. Find all scripts/ references in non-scripts files
rg "scripts/" --type-add 'code:*.{ts,tsx,js,jsx,json,yml,yaml}' -t code package.json README.md app/ docs/ DEPLOYMENT_CHECKLIST.md

# 2. Find all references to old script paths
rg "scripts/0[0-9][0-9]-" README.md docs/ DEPLOYMENT_CHECKLIST.md app/

# 3. Find references to payments-v2
rg "scripts/payments-v2/" README.md docs/ DEPLOYMENT_CHECKLIST.md

# 4. Verify npm scripts work
npm run validate-config --dry-run
npm run deploy:staging --dry-run
npm run test:staging --dry-run

# 5. Verify no files left in root scripts/
ls scripts/*.sql scripts/*.ps1 scripts/*.sh scripts/*.js scripts/*.ts scripts/*.mjs
# Should return 0 files after Phase 5
```

---

## 9. Checklists

### Phase 1: Create Structure + Fix References

- [ ] Create `scripts/db/` directory
- [ ] Create `scripts/db/migrations/` directory
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

### Phase 2: Move SQL Migrations

- [ ] Move `001-create-tables.sql` â†’ `db/migrations/`
- [ ] Move `002-admin-schema.sql` â†’ `db/migrations/`
- [ ] Move `003-storage-setup.sql` â†’ `db/migrations/`
- [ ] Move `004-site-assets-storage.sql` â†’ `db/migrations/`
- [ ] Move `005-expand-site-settings.sql` â†’ `db/migrations/`
- [ ] Move `006-media-assets.sql` â†’ `db/migrations/`
- [ ] Move `007-sync-existing-media.sql` â†’ `db/migrations/`
- [ ] Move `008-currency-support.sql` â†’ `db/migrations/`
- [ ] Move `009-payment-security-hardening.sql` â†’ `db/migrations/`
- [ ] Move `010-receipt-system.sql` â†’ `db/migrations/`
- [ ] Delete `011-receipt-system-complete.sql` (superseded)
- [ ] Move `012-create_podcasts_table.sql` â†’ `db/migrations/012-create-podcasts-table.sql` (rename)
- [ ] Move `012-receipt-sequence.sql` â†’ `db/migrations/011b-receipt-sequence.sql` (renumber)
- [ ] Move `013-seed_podcasts.sql` â†’ `db/migrations/013-seed-podcasts.sql` (rename)
- [ ] Move `014-add_key_topics_and_structured_notes.sql` â†’ `db/migrations/014-add-key-topics-and-structured-notes.sql` (rename)
- [ ] Move `015-add_guest_roles_and_enhance_social.sql` â†’ `db/migrations/015-add-guest-roles-and-enhance-social.sql` (rename)
- [ ] Move `016-add_podcast_highlights.sql` â†’ `db/migrations/016-add-podcast-highlights.sql` (rename)
- [ ] Move `migrations/017-conference-payment-columns.sql` â†’ `db/migrations/`
- [ ] Move `migrations/conference_registrations.sql` â†’ `db/migrations/017b-conference-registrations.sql`
- [ ] Move `018-rate-limit-function.sql` â†’ `db/migrations/`
- [ ] Move `018-rate-limits.sql` â†’ `db/migrations/018b-rate-limits.sql` (renumber)
- [ ] Move `019-conference-email-timestamps.sql` â†’ `db/migrations/`
- [ ] Move `030-admin-transaction-detail-schema.sql` â†’ `db/migrations/`
- [ ] Delete `030-cleanup-constraint.sql` (one-time cleanup)
- [ ] Move `031-enhance-payments-stripe-references.sql` â†’ `db/migrations/`
- [ ] Move `032-add-provider-and-message-to-donations.sql` â†’ `db/migrations/`
- [ ] Move `034-support-feedback.sql` â†’ `db/migrations/`
- [ ] Move `035-support-admin-actions.sql` â†’ `db/migrations/`
- [ ] Move `036-admin-notifications.sql` â†’ `db/migrations/`
- [ ] Move `037-homepage-cms-schema.sql` â†’ `db/migrations/`
- [ ] Move `038-homepage-cms-additional-keys.sql` â†’ `db/migrations/`
- [ ] Move `039-testimonials-storage-bucket.sql` â†’ `db/migrations/`
- [ ] Move `040-conference-form-schema.sql` â†’ `db/migrations/`
- [ ] Move `041-conference-file-upload-bucket.sql` â†’ `db/migrations/`
- [ ] Move `042-conference-form-templates.sql` â†’ `db/migrations/`

### Phase 3: Move payments-v2 + Documentation

- [ ] Move `payments-v2/020-*.sql` â†’ `db/payments-v2/`
- [ ] Move `payments-v2/021-*.sql` â†’ `db/payments-v2/`
- [ ] Move `payments-v2/022-*.sql` â†’ `db/payments-v2/`
- [ ] Move `payments-v2/023-*.sql` â†’ `db/payments-v2/`
- [ ] Move `payments-v2/024-*.sql` â†’ `db/payments-v2/`
- [ ] Move `payments-v2/025-atomic-receipt-number.sql` â†’ `db/payments-v2/`
- [ ] Move `payments-v2/025-create-payment-logs-table.sql` â†’ `db/payments-v2/025b-create-payment-logs-table.sql`
- [ ] Move `payments-v2/026-*.sql` â†’ `db/payments-v2/`
- [ ] Move `payments-v2/027-*.sql` â†’ `db/payments-v2/`
- [ ] Move `payments-v2/028-*.sql` â†’ `db/payments-v2/`
- [ ] Move `payments-v2/029-*.sql` â†’ `db/payments-v2/`
- [ ] Move `payments-v2/README.md` â†’ `db/payments-v2/`
- [ ] Move `payments-v2/COMPATIBILITY_SUMMARY.md` â†’ `docs/features/payments/`
- [ ] Move `payments-v2/ERROR_TRACKING_GUIDE.md` â†’ `docs/features/payments/`
- [ ] Move `payments-v2/MIGRATION_ANALYSIS.md` â†’ `docs/features/payments/`
- [ ] Move `payments-v2/MIGRATION_ORDER.md` â†’ `docs/features/payments/`
- [ ] Move `payments-v2/QUICK_START.md` â†’ `docs/features/payments/`
- [ ] Move `payments-v2/RECEIPT_NUMBER_IMPROVEMENTS.md` â†’ `docs/features/payments/`
- [ ] Move `payments-v2/WHATS_NEW.md` â†’ `docs/features/payments/`

### Phase 4: Move Diagnostic + Seed + Test Scripts

- [ ] Move `check-rate-limit-setup.sql` â†’ `db/diagnostics/`
- [ ] Move `debug-verification.sql` â†’ `db/diagnostics/`
- [ ] Move `diagnose-receipt-issue.sql` â†’ `db/diagnostics/`
- [ ] Move `find-valid-verification.sql` â†’ `db/diagnostics/`
- [ ] Move `fix-verification-id.sql` â†’ `db/diagnostics/`
- [ ] Move `seed-default-form-schema.sql` â†’ `db/seeds/`
- [ ] Move `020-seed-real-stories.sql` â†’ `db/seeds/seed-real-stories.sql`
- [ ] Move `insert-podcasts.mjs` â†’ `db/seeds/`
- [ ] Move `run-stories-seed.mjs` â†’ `db/seeds/`
- [ ] Move `test-rate-limit.js` â†’ `test/`
- [ ] Move `test-esewa-signature.mjs` â†’ `test/`
- [ ] Move `test-khalti-connection.mjs` â†’ `test/`
- [ ] Move `backfill-stripe-payment-intents.ts` â†’ `archive/`
- [ ] Move `fix-initiate-images.mjs` â†’ `archive/`

### Phase 5: Move Deployment + Ops Scripts

- [ ] Move `deploy-staging.ps1` â†’ `deploy/`
- [ ] Move `deploy-staging.sh` â†’ `deploy/`
- [ ] Move `deploy-production.ps1` â†’ `deploy/`
- [ ] Move `enable-v2-staging.ps1` â†’ `deploy/`
- [ ] Move `enable-v2-staging.sh` â†’ `deploy/`
- [ ] Move `monitor-staging.ps1` â†’ `deploy/`
- [ ] Move `smoke-tests-staging.ps1` â†’ `deploy/`
- [ ] Move `smoke-tests-staging.sh` â†’ `deploy/`
- [ ] Move `generate-secrets.ps1` â†’ `ops/`
- [ ] Move `generate-secrets.sh` â†’ `ops/`
- [ ] Move `test-credentials.ps1` â†’ `ops/`
- [ ] Move `test-credentials.sh` â†’ `ops/`
- [ ] Move `check-env-vars.js` â†’ `ops/`
- [ ] Move `validate-payment-config.ts` â†’ `ops/`

### Phase 6: Reference Updates + Verification

- [ ] Update `package.json` npm scripts (6 references)
- [ ] Update `README.md` script references (3 references)
- [ ] Update `docs/MANUAL_BUCKET_SETUP.md` reference
- [ ] Update `docs/TESTIMONIALS_IMAGE_UPLOAD.md` reference
- [ ] Update `docs/homepage-cms-integrations/` references (15+ files)
- [ ] Update `DEPLOYMENT_CHECKLIST.md` references
- [ ] Update `app/test-cms/page.tsx` reference
- [ ] Update `docs/payments-v2/README.md` references
- [ ] Grep for all remaining `scripts/` references in non-scripts files
- [ ] Grep for references to old script paths (001-042 pattern)
- [ ] Verify no broken references remain

### Phase 7: Documentation + Polish

- [ ] Update `scripts/README.md` (final navigation hub)
- [ ] Update `scripts/db/README.md` with migration guide
- [ ] Update `scripts/db/migrations/README.md` with execution order
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
| **Breaking npm scripts** | High (6 scripts reference old paths) | High â€” `npm run deploy:staging` etc. would fail | Update package.json atomically with file moves in Phase 1 |
| **Breaking doc references** | High (30+ references) | Medium â€” docs would have broken links | Update all doc references in Phase 6 |
| **Confusing migration order** | Medium | High â€” could run migrations out of order | Create comprehensive README with execution order |
| **Losing track of numbering** | Medium | Medium â€” future migrations could conflict | Document numbering scheme; use unique numbers |
| **One-time scripts needed again** | Low | Low â€” can recover from git history | Archive instead of delete; document in archive/README.md |
| **Team confusion during migration** | Medium | Medium â€” concurrent work could conflict | Communicate plan; do migration in one session |

### Pre-flight Checks

1. `git status` â€” ensure clean working tree
2. `npm test` â€” ensure tests pass before changes
3. Verify all npm scripts work currently
4. Grep for all `scripts/` references to understand full blast radius
5. Communicate plan to team

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
| SQL migration | `NNN-kebab-case.sql` | `043-add-new-column.sql` |
| Deployment | `kebab-case.{ps1,sh}` | `deploy-staging.ps1` |
| Operational | `kebab-case.{ps1,sh,js,ts}` | `generate-secrets.ps1` |
| Test | `test-kebab-case.{js,mjs}` | `test-rate-limit.js` |
| Diagnostic | `diagnose-kebab-case.sql` | `diagnose-receipt-issue.sql` |
| Seed | `seed-kebab-case.{sql,mjs}` | `seed-default-form-schema.sql` |

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
- **A) Remove number** â†’ `seed-real-stories.sql` in db/seeds/
- **B) Keep number** â†’ `020-seed-real-stories.sql` in db/seeds/

**My recommendation:** Option A. Seed data should not be numbered with migrations. The number implies it's part of the migration sequence.

### D2: Should Diagnostic Scripts Stay in the Repo?

**Question:** Debug scripts with hardcoded UUIDs (`debug-verification.sql`) are useful for debugging but clutter the repo. Should they stay?

**Options:**
- **A) Keep in db/diagnostics/** â€” Useful for troubleshooting
- **B) Move to archive/** â€” One-time use
- **C) Delete** â€” Recoverable from git history

**My recommendation:** Option A. Diagnostic scripts are useful for ongoing troubleshooting. The hardcoded UUID is a minor issue â€” it can be parameterized later.

### D3: Should We Consolidate Cross-Platform Scripts?

**Question:** `generate-secrets.ps1` and `generate-secrets.sh` do the same thing. Should we consolidate into one script that detects the platform?

**Options:**
- **A) Keep separate** â€” Simple, no platform detection needed
- **B) Consolidate** â€” Single script with platform detection

**My recommendation:** Option A. Separate scripts are simpler and more reliable. Platform detection adds complexity without clear benefit.

### D4: Should `payments-v2/` Documentation Move to docs/?

**Question:** The payments-v2/ folder has 8 markdown files alongside SQL scripts. Should these move to docs/?

**Options:**
- **A) Move to docs/** â€” Separation of concerns
- **B) Keep in scripts/** â€” Documentation about scripts should be near the scripts

**My recommendation:** Option A. Documentation about the payment system belongs in docs/, not mixed with scripts. The scripts folder should contain only executable files.

### D5: How to Handle the Numbering Gap (033)?

**Question:** There's no migration 033 (goes from 032 to 034). Should we renumber or document the gap?

**Options:**
- **A) Document the gap** â€” Explain in README that 033 was removed
- **B) Renumber** â€” Shift 034+ down to fill the gap
- **C) Leave as-is** â€” Gaps are normal in migration numbering

**My recommendation:** Option C. Gaps in migration numbering are normal and expected. Renumbering would break all existing references.

---

*This plan is ready for review. The scripts reorganization is lower-risk than the docs reorganization since scripts are referenced primarily from package.json (6 references) and docs (30+ references), rather than from application code. The main risk is breaking npm scripts, which must be updated atomically with file moves.*
