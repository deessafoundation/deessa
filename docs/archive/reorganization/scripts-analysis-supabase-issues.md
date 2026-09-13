---
title: "Scripts Analysis & Supabase Issues Report"
description: "Generated: August 5, 2026"
owner: "Deesha Team"
status: archived
category: archived
audience: admin
last_updated: 2026-09-12
---
# Scripts Analysis & Supabase Issues Report

**Generated:** August 5, 2026  
**Scope:** All SQL scripts in `scripts/` folder  
**Issues Source:** Supabase Database Linter

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Issue Categories](#issue-categories)
3. [SECURITY DEFINER Views Analysis](#security-definer-views-analysis)
4. [RLS Disabled in Public Tables](#rls-disabled-in-public-tables)
5. [Sensitive Columns Exposed](#sensitive-columns-exposed)
6. [Complete Script Inventory](#complete-script-inventory)
7. [Recommended Fixes](#recommended-fixes)
8. [Migration Order & Dependencies](#migration-order--dependencies)

---

## Executive Summary

The Supabase Database Linter has identified **16 issues** across two severity categories:

| Issue Type | Count | Severity | Impact |
|------------|-------|----------|--------|
| `security_definer_view` | 4 | ERROR | Views bypass RLS, enforcing creator's permissions |
| `rls_disabled_in_public` | 11 | ERROR | Tables exposed via API without row-level security |
| `sensitive_columns_exposed` | 1 | ERROR | PII/financial data accessible without RLS |

**Root Cause:** The Payment V2 architecture (`payments-v2/`) and several admin-focused tables were created without enabling RLS, assuming service-role-only access. The views were created without explicit `SECURITY INVOKER` (Postgres defaults to `SECURITY DEFINER` when views are created by superusers in some configurations).

---

## Issue Categories

### 1. SECURITY DEFINER View Errors (4 issues)

These views enforce the permissions of the **view creator** (typically the `postgres` superuser) rather than the querying user. This means:
- Any authenticated user can read all data in the view
- RLS policies on underlying tables are bypassed
- Potential data leakage if views expose sensitive information

| View Name | Created In | Underlying Tables |
|-----------|------------|-------------------|
| `donation_stats_by_currency` | `008-currency-support.sql:22` | `donations` |
| `recent_payment_errors` | `payments-v2/025-create-payment-logs-table.sql:118` | `payment_logs` |
| `payment_mismatches` | `payments-v2/025-create-payment-logs-table.sql:137` | `payment_logs` |
| `event_registrations_with_event` | `050`, `051`, `056` (recreated) | `event_registrations`, `events` |

### 2. RLS Disabled in Public Tables (11 issues)

These tables are in the `public` schema and exposed via PostgREST API, but have no Row Level Security enabled. Any authenticated user can read/write all rows.

| Table | Created In | Purpose |
|-------|------------|---------|
| `payments` | `payments-v2/020-create-payments-table.sql` | Payment transaction records |
| `payment_events` | `009-payment-security-hardening.sql:35` | Webhook event ledger |
| `receipts` | `payments-v2/021-create-receipts-table.sql` | Receipt metadata |
| `receipt_failures` | `payments-v2/026-create-receipt-failures-table.sql` | Receipt generation errors |
| `email_failures` | `payments-v2/027-create-email-failures-table.sql` | Email send errors |
| `receipt_sequences` | `payments-v2/025-atomic-receipt-number.sql:11` | Receipt number sequences |
| `payment_jobs` | `payments-v2/022-create-payment-jobs-table.sql` | Async job queue |
| `payment_logs` | `payments-v2/025-create-payment-logs-table.sql:14` | Payment audit logs |
| `review_notes` | `030-admin-transaction-detail-schema.sql:8` | Admin review notes |
| `status_change_log` | `030-admin-transaction-detail-schema.sql:28` | Status change audit |
| `payments_with_session` | Not found in scripts | Likely a view (not a table) |

### 3. Sensitive Columns Exposed (1 issue)

| Table | Column | Risk |
|-------|--------|------|
| `payments` | `session_id` | Stripe Checkout Session ID - financial identifier |

---

## SECURITY DEFINER Views Analysis

### View 1: `donation_stats_by_currency`

**File:** `scripts/008-currency-support.sql:22-31`

```sql
CREATE OR REPLACE VIEW donation_stats_by_currency AS
SELECT 
  currency,
  COUNT(*) as total_donations,
  SUM(amount) as total_amount,
  COUNT(CASE WHEN is_monthly THEN 1 END) as monthly_donations,
  COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_donations,
  SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as completed_amount
FROM donations
GROUP BY currency;
```

**Usage:** Dashboard statistics showing donation totals by currency.  
**Risk Level:** MEDIUM - Exposes aggregate financial data.  
**Fix:** Remove `SECURITY DEFINER` or recreate with `SECURITY INVOKER`.

### View 2: `recent_payment_errors`

**File:** `scripts/payments-v2/025-create-payment-logs-table.sql:118-134`

```sql
CREATE OR REPLACE VIEW recent_payment_errors AS
SELECT 
  id, level, event_type, message, donation_id, provider,
  transaction_id, error_message, error_code, created_at
FROM payment_logs
WHERE 
  level IN ('error', 'critical')
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

**Usage:** Admin monitoring of recent payment errors.  
**Risk Level:** HIGH - Exposes error details and transaction IDs.  
**Fix:** Add RLS to `payment_logs` table or restrict view access.

### View 3: `payment_mismatches`

**File:** `scripts/payments-v2/025-create-payment-logs-table.sql:137-153`

```sql
CREATE OR REPLACE VIEW payment_mismatches AS
SELECT 
  id, event_type, donation_id, provider, transaction_id,
  expected_amount, actual_amount, expected_currency,
  actual_currency, metadata, created_at
FROM payment_logs
WHERE 
  event_type IN ('amount_mismatch', 'currency_mismatch')
ORDER BY created_at DESC;
```

**Usage:** Admin detection of payment amount/currency discrepancies.  
**Risk Level:** HIGH - Exposes financial mismatch data.  
**Fix:** Add RLS to `payment_logs` table or restrict view access.

### View 4: `event_registrations_with_event`

**File:** `scripts/056-event-payment-integration.sql:110-161` (latest version)

```sql
CREATE OR REPLACE VIEW event_registrations_with_event AS
SELECT
  r.id, r.event_id, r.full_name, r.email, r.phone, ...
  e.title AS event_title, e.slug AS event_slug, ...
FROM event_registrations r
JOIN events e ON r.event_id = e.id;
```

**Usage:** Admin dashboard combining registration and event data.  
**Risk Level:** MEDIUM - Exposes PII (names, emails) and registration details.  
**Fix:** Add RLS policies or recreate with `SECURITY INVOKER`.

---

## RLS Disabled in Public Tables

### Table 1: `payments`

**File:** `scripts/payments-v2/020-create-payments-table.sql`

```sql
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL,
  verified_amount DECIMAL(10, 2),
  verified_currency TEXT,
  status TEXT NOT NULL,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_donation_transaction UNIQUE (donation_id, transaction_id)
);
-- âŒ NO: ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
```

**Columns Added Later:**
- `payment_intent_id`, `session_id`, `subscription_id`, `customer_id`, `invoice_id` (from `031`)
- `event_registration_id`, `entity_type` (from `057`)

**Usage:** Stores provider-specific payment transaction details.  
**Risk Level:** HIGH - Contains financial transaction data, session IDs.  
**Fix:** Enable RLS with admin-only policies (service role bypasses RLS).

### Table 2: `payment_events`

**File:** `scripts/009-payment-security-hardening.sql:35-41`

```sql
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- âŒ NO: ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
```

**Usage:** Idempotency ledger for webhook events (prevents duplicate processing).  
**Risk Level:** MEDIUM - Contains provider event IDs and donation references.  
**Fix:** Enable RLS with admin-only policies.

### Table 3: `receipts`

**File:** `scripts/payments-v2/021-create-receipts-table.sql`

```sql
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL UNIQUE,
  receipt_url TEXT NOT NULL,
  pdf_url TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  download_count INT NOT NULL DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_donation_receipt UNIQUE (donation_id)
);
-- âŒ NO: ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
```

**Usage:** Receipt metadata and tracking.  
**Risk Level:** HIGH - Contains receipt URLs and download tracking.  
**Fix:** Enable RLS with admin + donor policies.

### Table 4: `receipt_failures`

**File:** `scripts/payments-v2/026-create-receipt-failures-table.sql`

```sql
CREATE TABLE IF NOT EXISTS receipt_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  attempt_count INT NOT NULL DEFAULT 1,
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- âŒ NO: ALTER TABLE receipt_failures ENABLE ROW LEVEL SECURITY;
```

**Usage:** Tracks receipt generation failures for admin review.  
**Risk Level:** LOW - Internal error tracking.  
**Fix:** Enable RLS with admin-only policies.

### Table 5: `email_failures`

**File:** `scripts/payments-v2/027-create-email-failures-table.sql`

```sql
CREATE TABLE IF NOT EXISTS email_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  recipient_email TEXT,
  attempt_count INT NOT NULL DEFAULT 1,
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- âŒ NO: ALTER TABLE email_failures ENABLE ROW LEVEL SECURITY;
```

**Usage:** Tracks email send failures for admin review.  
**Risk Level:** LOW - Internal error tracking (contains recipient emails).  
**Fix:** Enable RLS with admin-only policies.

### Table 6: `receipt_sequences`

**File:** `scripts/payments-v2/025-atomic-receipt-number.sql:11-14`

```sql
CREATE TABLE IF NOT EXISTS receipt_sequences (
  year INT PRIMARY KEY,
  last_number INT NOT NULL DEFAULT 0
);
-- âŒ NO: ALTER TABLE receipt_sequences ENABLE ROW LEVEL SECURITY;
```

**Usage:** Tracks receipt number sequences for yearly reset.  
**Risk Level:** LOW - Internal sequence tracking.  
**Fix:** Enable RLS with admin-only policies.

### Table 7: `payment_jobs`

**File:** `scripts/payments-v2/022-create-payment-jobs-table.sql`

```sql
CREATE TABLE IF NOT EXISTS payment_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  payload JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ
);
-- âŒ NO: ALTER TABLE payment_jobs ENABLE ROW LEVEL SECURITY;
```

**Usage:** Async job queue for post-payment processing.  
**Risk Level:** LOW - Internal job queue.  
**Fix:** Enable RLS with admin-only policies.

### Table 8: `payment_logs`

**File:** `scripts/payments-v2/025-create-payment-logs-table.sql:14-49`

```sql
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'critical')),
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  donation_id UUID REFERENCES donations(id) ON DELETE SET NULL,
  provider TEXT,
  transaction_id TEXT,
  event_id TEXT,
  current_status TEXT,
  new_status TEXT,
  expected_amount DECIMAL(10, 2),
  actual_amount DECIMAL(10, 2),
  expected_currency TEXT,
  actual_currency TEXT,
  error_message TEXT,
  error_code TEXT,
  error_stack TEXT,
  metadata JSONB,
  duration_ms INTEGER
);
-- âŒ RLS is COMMENTED OUT at line 103:
-- ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
```

**Usage:** Audit log for payment system events and errors.  
**Risk Level:** HIGH - Contains detailed payment error data, amounts, transaction IDs.  
**Fix:** Enable RLS with admin-only policies.

### Table 9: `review_notes`

**File:** `scripts/030-admin-transaction-detail-schema.sql:8-14`

```sql
CREATE TABLE IF NOT EXISTS review_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL REFERENCES admin_users(id),
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- âŒ NO: ALTER TABLE review_notes ENABLE ROW LEVEL SECURITY;
```

**Usage:** Stores admin review notes for donations/registrations.  
**Risk Level:** MEDIUM - Contains admin notes and user references.  
**Fix:** Enable RLS with admin-only policies.

### Table 10: `status_change_log`

**File:** `scripts/030-admin-transaction-detail-schema.sql:28-36`

```sql
CREATE TABLE IF NOT EXISTS status_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL REFERENCES admin_users(id),
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- âŒ NO: ALTER TABLE status_change_log ENABLE ROW LEVEL SECURITY;
```

**Usage:** Audit log for all payment status changes.  
**Risk Level:** MEDIUM - Contains admin action audit trail.  
**Fix:** Enable RLS with admin-only policies.

### Table 11: `payments_with_session`

**Note:** This table was not found in any script. It may be:
- A view (not a table) created directly in Supabase
- Created via Supabase Dashboard UI
- Part of a manual migration not in the scripts folder

**Fix:** Check Supabase database directly to identify and fix.

---

## Sensitive Columns Exposed

### `payments.session_id`

**File:** `scripts/031-enhance-payments-stripe-references.sql:10`

```sql
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS session_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS customer_id TEXT,
  ADD COLUMN IF NOT EXISTS invoice_id TEXT;
```

**Risk:** Stripe Checkout Session IDs are financial identifiers that could be used for:
- Payment tracking
- Potential session hijacking attempts
- Financial data correlation

**Fix:** Enable RLS on `payments` table with appropriate policies.

---

## Complete Script Inventory

### Core Tables (001-010)

| Script | Purpose | RLS Status |
|--------|---------|------------|
| `001-create-tables.sql` | Core public tables (contacts, donations, registrations, volunteers) | âœ… ENABLED |
| `002-admin-schema.sql` | Admin users, settings, roles | âœ… ENABLED |
| `003-storage-setup.sql` | Storage buckets for file uploads | N/A |
| `004-site-assets-storage.sql` | Site assets storage bucket | N/A |
| `005-expand-site-settings.sql` | Extended site settings | âœ… ENABLED |
| `006-media-assets.sql` | Media asset management | âœ… ENABLED |
| `007-sync-existing-media.sql` | Sync existing media data | N/A |
| `008-currency-support.sql` | Multi-currency support + `donation_stats_by_currency` view | âœ… (table) / âŒ (view) |
| `009-payment-security-hardening.sql` | Provider references + `payment_events` table | âŒ (payment_events) |
| `010-receipt-system.sql` | Receipt columns + `receipt_audit_log` | âœ… ENABLED |

### Receipt System (011-012)

| Script | Purpose | RLS Status |
|--------|---------|------------|
| `011-receipt-system-complete.sql` | Idempotent receipt setup + storage | âœ… ENABLED |
| `012-receipt-sequence.sql` | Receipt number sequence + `get_next_receipt_number()` function | N/A (function) |

### Podcasts (012-016)

| Script | Purpose | RLS Status |
|--------|---------|------------|
| `012-create_podcasts_table.sql` | Podcasts table | âœ… ENABLED |
| `013-seed_podcasts.sql` | Seed podcast data | N/A |
| `014-add_key_topics_and_structured_notes.sql` | Podcast key topics | âœ… ENABLED |
| `015-add_guest_roles_and_enhance_social.sql` | Guest roles | âœ… ENABLED |
| `016-add_podcast_highlights.sql` | Podcast highlights | âœ… ENABLED |

### Rate Limiting (018)

| Script | Purpose | RLS Status |
|--------|---------|------------|
| `018-rate-limit-function.sql` | `increment_rate_limit()` function | N/A (function) |
| `018-rate-limits.sql` | `rate_limits` table | âœ… ENABLED |

### Conference & Forms (019-043)

| Script | Purpose | RLS Status |
|--------|---------|------------|
| `019-conference-email-timestamps.sql` | Conference email tracking | âœ… ENABLED |
| `020-seed-real-stories.sql` | Seed success stories | N/A |
| `030-admin-transaction-detail-schema.sql` | `review_notes`, `status_change_log` tables | âŒ DISABLED |
| `030-cleanup-constraint.sql` | Cleanup constraints | N/A |
| `031-enhance-payments-stripe-references.sql` | Add Stripe columns to payments | âŒ (payments) |
| `032-add-provider-and-message-to-donations.sql` | Provider columns | âœ… ENABLED |
| `034-support-feedback.sql` | Support feedback | âœ… ENABLED |
| `035-support-admin-actions.sql` | Admin support actions | âœ… ENABLED |
| `036-admin-notifications.sql` | Admin notifications | âœ… ENABLED |
| `037-homepage-cms-schema.sql` | Homepage CMS | âœ… ENABLED |
| `038-homepage-cms-additional-keys.sql` | CMS additional keys | âœ… ENABLED |
| `039-homepage-cms-story-whatwedo.sql` | CMS story sections | âœ… ENABLED |
| `039-testimonials-storage-bucket.sql` | Testimonials storage | N/A |
| `040-conference-form-schema.sql` | Conference forms | âœ… ENABLED |
| `040-restrict-donations-insert-policy.sql` | Restrict donations insert | âœ… ENABLED |
| `041-bank-transfer-donations.sql` | Bank transfer support | âœ… ENABLED |
| `041-conference-file-upload-bucket.sql` | Conference file uploads | N/A |
| `042-conference-form-templates.sql` | Form templates | âœ… ENABLED |
| `043-multi-event-support.sql` | Multi-event support | âœ… ENABLED |

### Events Module (050-059)

| Script | Purpose | RLS Status |
|--------|---------|------------|
| `050-events-module-schema.sql` | Complete events module (7 tables + view) | âœ… ENABLED (tables) / âŒ (view) |
| `051-event-registration-enhancements.sql` | Registration enhancements + emails/notes tables | âœ… ENABLED |
| `052-agenda-highlighted.sql` | Agenda highlights | âœ… ENABLED |
| `053-ticket-sold-count.sql` | Ticket sold count | âœ… ENABLED |
| `054-add-custom-email-template-type.sql` | Custom email templates | âœ… ENABLED |
| `055-event-form-template-seeds.sql` | Form template seeds | N/A |
| `056-event-payment-integration.sql` | Event payment integration + view update | âŒ (view) |
| `056-event-uploads-storage-bucket.sql` | Event uploads storage | N/A |
| `057-extend-payments-for-registrations.sql` | Extend payments for registrations | âŒ (payments) |
| `057-event-qr-payment.sql` | QR payment support | âœ… ENABLED |
| `057-ticket-sold-count-rpc.sql` | Ticket count RPC | N/A (function) |
| `058-add-archived-at.sql` | Archive support | âœ… ENABLED |
| `059-extend-review-tracking-to-events.sql` | Review tracking for events | âŒ (review_notes, status_change_log) |

### Payment V2 (payments-v2/)

| Script | Purpose | RLS Status |
|--------|---------|------------|
| `020-create-payments-table.sql` | Base payments table | âŒ DISABLED |
| `021-create-receipts-table.sql` | Receipts table | âŒ DISABLED |
| `022-create-payment-jobs-table.sql` | Payment jobs queue | âŒ DISABLED |
| `023-enhance-payment-events.sql` | Enhance payment events | âŒ DISABLED |
| `024-add-indexes.sql` | Performance indexes | N/A |
| `025-atomic-receipt-number.sql` | Receipt sequences + function | âŒ DISABLED (table) |
| `025-create-payment-logs-table.sql` | Payment logs + views | âŒ DISABLED |
| `026-create-receipt-failures-table.sql` | Receipt failures | âŒ DISABLED |
| `027-create-email-failures-table.sql` | Email failures | âŒ DISABLED |
| `028-add-confirmed-at-to-donations.sql` | Add confirmed_at | âœ… ENABLED |
| `029-add-verification-id-to-donations.sql` | Add verification_id | âœ… ENABLED |

---

## Recommended Fixes

### Fix 1: Enable RLS on All Payment V2 Tables

```sql
-- Run in Supabase SQL Editor

-- payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- payment_events table
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

-- receipts table
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- receipt_failures table
ALTER TABLE receipt_failures ENABLE ROW LEVEL SECURITY;

-- email_failures table
ALTER TABLE email_failures ENABLE ROW LEVEL SECURITY;

-- receipt_sequences table
ALTER TABLE receipt_sequences ENABLE ROW LEVEL SECURITY;

-- payment_jobs table
ALTER TABLE payment_jobs ENABLE ROW LEVEL SECURITY;

-- payment_logs table
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
```

### Fix 2: Add Admin-Only Policies

```sql
-- Admin-only policy for payments
CREATE POLICY "Admins can manage payments"
  ON payments FOR ALL
  USING (is_admin_user());

-- Admin-only policy for payment_events
CREATE POLICY "Admins can manage payment events"
  ON payment_events FOR ALL
  USING (is_admin_user());

-- Admin-only policy for receipts
CREATE POLICY "Admins can manage receipts"
  ON receipts FOR ALL
  USING (is_admin_user());

-- Admin-only policy for receipt_failures
CREATE POLICY "Admins can manage receipt failures"
  ON receipt_failures FOR ALL
  USING (is_admin_user());

-- Admin-only policy for email_failures
CREATE POLICY "Admins can manage email failures"
  ON email_failures FOR ALL
  USING (is_admin_user());

-- Admin-only policy for receipt_sequences
CREATE POLICY "Admins can manage receipt sequences"
  ON receipt_sequences FOR ALL
  USING (is_admin_user());

-- Admin-only policy for payment_jobs
CREATE POLICY "Admins can manage payment jobs"
  ON payment_jobs FOR ALL
  USING (is_admin_user());

-- Admin-only policy for payment_logs
CREATE POLICY "Admins can manage payment logs"
  ON payment_logs FOR ALL
  USING (is_admin_user());
```

### Fix 3: Enable RLS on Admin Tables

```sql
-- review_notes table
ALTER TABLE review_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage review notes"
  ON review_notes FOR ALL
  USING (is_admin_user());

-- status_change_log table
ALTER TABLE status_change_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage status change log"
  ON status_change_log FOR ALL
  USING (is_admin_user());
```

### Fix 4: Fix SECURITY DEFINER Views

```sql
-- Drop and recreate views without SECURITY DEFINER

-- donation_stats_by_currency
DROP VIEW IF EXISTS donation_stats_by_currency;
CREATE VIEW donation_stats_by_currency AS
SELECT 
  currency,
  COUNT(*) as total_donations,
  SUM(amount) as total_amount,
  COUNT(CASE WHEN is_monthly THEN 1 END) as monthly_donations,
  COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_donations,
  SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as completed_amount
FROM donations
GROUP BY currency;

-- recent_payment_errors
DROP VIEW IF EXISTS recent_payment_errors;
CREATE VIEW recent_payment_errors AS
SELECT 
  id, level, event_type, message, donation_id, provider,
  transaction_id, error_message, error_code, created_at
FROM payment_logs
WHERE 
  level IN ('error', 'critical')
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- payment_mismatches
DROP VIEW IF EXISTS payment_mismatches;
CREATE VIEW payment_mismatches AS
SELECT 
  id, event_type, donation_id, provider, transaction_id,
  expected_amount, actual_amount, expected_currency,
  actual_currency, metadata, created_at
FROM payment_logs
WHERE 
  event_type IN ('amount_mismatch', 'currency_mismatch')
ORDER BY created_at DESC;

-- event_registrations_with_event (latest version from 056)
DROP VIEW IF EXISTS event_registrations_with_event;
CREATE VIEW event_registrations_with_event AS
SELECT
  r.id, r.event_id, r.full_name, r.email, r.phone,
  r.organization, r.custom_fields, r.form_schema_version,
  r.status, r.admin_notes, r.confirmed_at, r.cancelled_at,
  r.confirmed_by, r.cancelled_by, r.payment_status,
  r.payment_amount, r.payment_currency, r.payment_provider,
  r.payment_id, r.provider_session_ref, r.stripe_session_id,
  r.khalti_pidx, r.esewa_transaction_uuid,
  r.payment_initiated_at, r.payment_paid_at,
  r.payment_failed_at, r.payment_review_at,
  r.payment_override_by, r.consent_terms, r.consent_marketing,
  r.expires_at, r.checked_in_at, r.checked_in_by,
  r.registration_source, r.ticket_type_id,
  r.last_registration_email_sent_at,
  r.last_confirmation_email_sent_at,
  r.last_cancellation_email_sent_at,
  r.last_custom_email_sent_at,
  r.created_at, r.updated_at,
  e.title AS event_title, e.slug AS event_slug,
  e.event_date, e.event_time, e.location,
  e.is_free, e.status AS event_status
FROM event_registrations r
JOIN events e ON r.event_id = e.id;
```

### Fix 5: Address `payments_with_session`

Check Supabase directly:
```sql
-- Check if it's a view
SELECT * FROM information_schema.views 
WHERE table_name = 'payments_with_session';

-- Check if it's a table
SELECT * FROM information_schema.tables 
WHERE table_name = 'payments_with_session';
```

If it's a view, drop and recreate without `SECURITY DEFINER`.  
If it's a table, enable RLS and add policies.

---

## Migration Order & Dependencies

### Phase 1: Critical Security Fixes (Immediate)

1. Enable RLS on all `payments-v2/` tables
2. Add admin-only policies
3. Fix `SECURITY DEFINER` views

### Phase 2: Admin Tables (Same Day)

4. Enable RLS on `review_notes` and `status_change_log`
5. Add admin-only policies

### Phase 3: Verification (Next Day)

6. Test all admin dashboards
7. Verify service role access still works
8. Check webhook processing
9. Validate receipt generation

### Phase 4: Monitoring (Ongoing)

10. Monitor Supabase linter for new issues
11. Review RLS policies quarterly
12. Audit admin access patterns

---

## Service Role Considerations

**Important:** Supabase service role (`service_role`) bypasses RLS by default. This means:

- Webhook handlers using service role will continue to work
- Background jobs (payment processing, email sending) will work
- Admin API calls using service role will work

**Only client-side queries** (from browser) are affected by RLS policies.

---

## Testing Checklist

After applying fixes:

- [ ] Admin dashboard loads payment data
- [ ] Admin can view receipt failures
- [ ] Admin can view email failures
- [ ] Webhook processing works (Stripe, Khalti, eSewa)
- [ ] Receipt generation works
- [ ] Email sending works
- [ ] Public donation form works
- [ ] Public event registration works
- [ ] Rate limiting works
- [ ] No 403 errors in browser console

---

## Appendix: Quick Reference SQL

### Check RLS Status

```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Check View Security

```sql
SELECT 
  viewname,
  definition
FROM pg_views
WHERE schemaname = 'public'
ORDER BY viewname;
```

### Check Policies

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

**Document Version:** 1.0  
**Last Updated:** August 5, 2026  
**Author:** Automated Analysis
