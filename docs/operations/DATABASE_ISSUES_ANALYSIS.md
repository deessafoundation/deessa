# Supabase Database Security Issues — Full Analysis

**Date:** 2026-09-12
**Source:** Supabase Database Linter (external-facing scan)
**Status:** 16 errors identified across 3 categories

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Issue Category 1: SECURITY DEFINER Views](#issue-1-security-definer-views)
3. [Issue Category 2: RLS Disabled on Public Tables](#issue-2-rls-disabled-on-public-tables)
4. [Issue Category 3: Sensitive Columns Exposed](#issue-3-sensitive-columns-exposed)
5. [Impact Assessment](#impact-assessment)
6. [Fix Strategy](#fix-strategy)
7. [Files Reference](#files-reference)

---

## Executive Summary

The Supabase database linter flagged **16 security errors** across three categories. None of these issues currently cause runtime failures, but they represent security vulnerabilities that could be exploited if the service-role key is ever compromised or if the anon key is used incorrectly.

**Key finding:** All affected tables are accessed exclusively via the **service-role client** (`createServiceClient`), which bypasses RLS entirely. This means enabling RLS with appropriate policies will **not break any existing functionality**.

---

## Issue 1: SECURITY DEFINER Views

### What it means

A `SECURITY DEFINER` view runs with the permissions of the user who **created** it (typically the `postgres` superuser), not the user who is **querying** it. This means any user querying the view can see all rows regardless of their actual permissions.

### Affected Views

| View | Defined In | App Usage | Risk |
|------|-----------|-----------|------|
| `donation_stats_by_currency` | `scripts/db/migrations/008-currency-support.sql:22` | Docs only, no TS references | Low — aggregate stats |
| `recent_payment_errors` | `scripts/db/payments-v2/025b-create-payment-logs-table.sql:118` | No TS references | Medium — error details |
| `payment_mismatches` | `scripts/db/payments-v2/025b-create-payment-logs-table.sql:137` | No TS references | Medium — mismatch data |
| `event_registrations_with_event` | `scripts/db/migrations/056-event-payment-integration.sql:110` | Admin dashboards | High — PII + payment data |

### Why they have SECURITY DEFINER

The views were likely created via the Supabase SQL Editor while logged in as the `postgres` superuser. When a superuser creates a view, PostgreSQL may automatically apply `SECURITY DEFINER`. The migration scripts themselves do **not** explicitly set `SECURITY DEFINER`.

### Fix

Recreate each view with `SECURITY INVOKER` (the default) using `CREATE OR REPLACE VIEW`. This ensures the view respects the querying user's permissions.

**See:** `scripts/fixes/001-fix-security-definer-views.sql`

---

## Issue 2: RLS Disabled on Public Tables

### What it means

Tables in the `public` schema are exposed via PostgREST (the Supabase REST API). Without Row Level Security (RLS) enabled, any API caller with the `anon` key can read/modify all rows.

### Affected Tables

| Table | Defined In | App Usage | Sensitivity |
|-------|-----------|-----------|-------------|
| `payments` | `scripts/db/payments-v2/020-create-payments-table.sql` | PaymentService, admin-actions, backfill | **High** — payment data + session_id |
| `receipts` | `scripts/db/payments-v2/021-create-receipts-table.sql` | validation.ts | Medium — receipt metadata |
| `payment_jobs` | `scripts/db/payments-v2/022-create-payment-jobs-table.sql` | Placeholder only | Low — not yet active |
| `email_failures` | `scripts/db/payments-v2/027-create-email-failures-table.sql` | metrics.ts, admin emails | Medium — failure details |
| `payment_events` | `scripts/db/migrations/009-payment-security-hardening.sql` | PaymentService, webhooks, admin (heavy) | **High** — idempotency + audit |
| `receipt_sequences` | `scripts/db/payments-v2/025-atomic-receipt-number.sql` | generator.ts via RPC | Medium — sequence data |
| `payment_logs` | `scripts/db/payments-v2/025b-create-payment-logs-table.sql` | logging.ts | Medium — structured logs |
| `review_notes` | `scripts/db/migrations/030-admin-transaction-detail-schema.sql` | admin-payment-actions | Medium — admin notes |
| `status_change_log` | `scripts/db/migrations/030-admin-transaction-detail-schema.sql` | admin-payment-actions | Medium — audit trail |
| `payments_with_session` | **Not in migrations** (phantom table) | None | Unknown |

### Why RLS is not enabled

These tables were designed to be **admin/system-only** — accessed exclusively via the service-role client. RLS was not enabled because the service-role bypasses it anyway. The linter flags this because the tables are in `public` and technically accessible via the REST API.

### Fix

Enable RLS on each table with a **service-role-only** policy. Since all application code uses `createServiceClient`, this will not break anything. Optionally add read policies for authenticated admin users.

**See:** `scripts/fixes/002-enable-rls-tables.sql`

---

## Issue 3: Sensitive Columns Exposed

### What it means

The `payments` table is exposed via API without RLS and contains `session_id` — a Stripe Checkout Session ID that could be used to link to payment data.

### Affected Column

- **Table:** `payments`
- **Column:** `session_id` (Stripe Checkout Session ID)
- **Defined in:** `scripts/db/migrations/031-enhance-payments-stripe-references.sql`

### Fix

Covered by the RLS fix in Issue 2. Enabling RLS on the `payments` table with a service-role-only policy prevents API access to this column.

**See:** `scripts/fixes/003-sensitive-columns-protection.sql`

---

## Impact Assessment

| Fix | Breaks App? | Breaks Webhooks? | Breaks Admin? | Breaks RPC? |
|-----|-------------|------------------|---------------|-------------|
| Recreate views without SECURITY DEFINER | No | No | No | No |
| Enable RLS with service-role policy | No | No | No | No |
| Enable RLS on payments table | No | No | No | No |

**Reason:** All application code uses `createServiceClient()` which bypasses RLS. The views are not queried from TypeScript code — they're used for manual SQL queries and admin dashboards.

---

## Fix Strategy

### Phase 1: Low-Risk View Fixes (001)
Recreate the 4 views without `SECURITY DEFINER`. Test by querying each view from the Supabase dashboard.

### Phase 2: RLS Enablement (002)
Enable RLS on all 11 tables with service-role-only policies. This is safe because:
- All app code uses service-role client
- Webhooks use service-role client
- The `payments_with_session` phantom table should be investigated/dropped

### Phase 3: Column Protection (003)
Verify the `payments.session_id` column is protected by the RLS policy from Phase 2.

### Verification
After applying fixes, re-run the Supabase database linter to confirm all 16 errors are resolved.

---

## Files Reference

| File | Purpose |
|------|---------|
| `docs/operations/DATABASE_ISSUES_ANALYSIS.md` | This document |
| `scripts/fixes/001-fix-security-definer-views.sql` | SQL to fix SECURITY DEFINER views |
| `scripts/fixes/002-enable-rls-tables.sql` | SQL to enable RLS on tables |
| `scripts/fixes/003-sensitive-columns-protection.sql` | SQL to protect sensitive columns |
| `docs/operations/ROLLBACK_PLAN.md` | Rollback procedures |
| `docs/operations/fixes-errors.md` | Original linter output |
