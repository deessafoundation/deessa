# Supabase Database Linter Errors

**Scan Date:** 2026-09-12
**Total Errors:** 16

---

## Error 1–4: SECURITY DEFINER Views

**Lint Rule:** [0010_security_definer_view](https://supabase.com/docs/guides/database/database-linter?lint=0010_security_definer_view)
**Severity:** ERROR | **Faces:** External (any API caller)

### What's wrong?

Four database views were created with a property called `SECURITY DEFINER`. This means when someone queries the view, PostgreSQL runs it with the permissions of the person who **created** it (in this case, the `postgres` superuser), not the person who is **querying** it.

### Why is that bad?

It bypasses all Row Level Security (RLS) policies. Even if you have RLS set up on the underlying tables, a `SECURITY DEFINER` view ignores those rules and returns everything. Anyone with the `anon` key — or any authenticated user — could potentially see data they shouldn't.

### Which views are affected?

**1. `donation_stats_by_currency`**
- **What it does:** Shows aggregated donation stats grouped by currency (total donations, total amount, monthly count, completed count).
- **Is it used in the app?** No. It's only referenced in documentation files. No TypeScript code queries it.
- **Impact:** Low. It only contains aggregate numbers, not individual donor data. But it should still be fixed.

**2. `recent_payment_errors`**
- **What it does:** Shows error and critical-level payment logs from the last 24 hours — error messages, error codes, donation IDs, provider info.
- **Is it used in the app?** No. No TypeScript code queries it. It's a convenience view for manual SQL queries.
- **Impact:** Medium. Exposes internal error details that could help an attacker understand your payment infrastructure.

**3. `payment_mismatches`**
- **What it does:** Shows rows where the expected amount/currency didn't match the actual amount/currency from a payment provider.
- **Is it used in the app?** No. No TypeScript code queries it. Manual use only.
- **Impact:** Medium. Exposes payment discrepancy data that could reveal fraud detection patterns.

**4. `event_registrations_with_event`**
- **What it does:** A JOIN view combining `event_registrations` with `events` — shows registrant name, email, phone, payment status, Stripe session IDs, event title, date, location, etc.
- **Is it used in the app?** Yes — designed for admin dashboards.
- **Impact:** High. This contains PII (names, emails, phone numbers) and payment session references. Without SECURITY INVOKER, any authenticated user could read all registration data.

### How to fix

Recreate each view without `SECURITY DEFINER`. The default behavior (`SECURITY INVOKER`) respects the querying user's permissions.

**Fix script:** `001-fix-security-definer-views.sql`

---

## Error 5–15: RLS Disabled on Public Tables

**Lint Rule:** [0013_rls_disabled_in_public](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public)
**Severity:** ERROR | **Faces:** External (any API caller)

### What's wrong?

Eleven tables in the `public` schema have Row Level Security (RLS) turned off. Since these tables are in `public`, they're automatically exposed through the Supabase REST API (PostgREST). Anyone with the `anon` key can `SELECT`, `INSERT`, `UPDATE`, or `DELETE` from these tables without any restrictions.

### Why is that bad?

If your `anon` key leaks (it's a public client-side key), or if someone figures out the API endpoints, they could read or modify payment data, audit logs, receipt sequences, and more. RLS is your last line of defense — without it, the database trusts every request equally.

### Why wasn't RLS enabled before?

These tables were designed as **admin/system-only** tables. The application code accesses them exclusively through the `service-role` client (`createServiceClient()`), which bypasses RLS entirely. The original developers likely skipped RLS because the service-role key was the only way to reach these tables. The linter flags this because the tables are technically *exposed* even if the app doesn't use them that way.

### Which tables are affected?

**1. `payments`** — **HIGH RISK**
- **What it stores:** Provider-specific payment transaction details — Stripe payment intent IDs, session IDs, subscription IDs, raw payloads. One row per payment attempt.
- **Who uses it:** `PaymentService.ts`, admin export actions, backfill scripts. All via service-role.
- **Impact:** If exposed, an attacker could see Stripe session IDs, payment intent IDs, and raw provider payloads. This is financial data.

**2. `payment_events`** — **HIGH RISK**
- **What it stores:** Idempotency ledger — every webhook event from Stripe/Khalti/eSewa, plus admin actions (status changes, receipt resends, PDF exports). Unique constraint on `(provider, event_id)`.
- **Who uses it:** `PaymentService.ts`, Stripe webhook handler, admin actions. Heavy usage — this is the most accessed table in the payment system.
- **Impact:** If exposed, an attacker could see all webhook events, admin audit trails, and payment flow details.

**3. `receipts`**
- **What it stores:** Receipt metadata — receipt number, receipt URL, download count, unique constraint on `donation_id`.
- **Who uses it:** `validation.ts` only (startup check). Actual receipt files are in Supabase Storage.
- **Impact:** Medium. Exposes receipt numbers and download patterns.

**4. `receipt_failures`**
- **What it stores:** Receipt generation failures.
- **Who uses it:** Monitoring/admin workflows.
- **Impact:** Medium. Exposes internal error details.

**5. `payment_jobs`**
- **What it stores:** Async job queue for post-payment processing (receipt generation, email sending). Has retry support with exponential backoff.
- **Who uses it:** `JobQueue.ts` (placeholder only — not yet active).
- **Impact:** Low. The table exists but isn't actively written to yet. Still should be locked down.

**6. `email_failures`**
- **What it stores:** Email send failures — SMTP errors, timeouts, auth failures, network errors. Tracks attempt count and resolution status.
- **Who uses it:** `metrics.ts` (dashboard calculations), admin failed emails page (mark as resolved).
- **Impact:** Medium. Exposes email infrastructure details and failure patterns.

**7. `receipt_sequences`**
- **What it stores:** Receipt number sequences per year — used by the `get_next_receipt_number()` RPC function for atomic, collision-free receipt numbering.
- **Who uses it:** `generator.ts` via the RPC function. The RPC is `SECURITY DEFINER`, so RLS won't block it.
- **Impact:** Medium. Could let someone predict receipt numbers or cause sequence gaps.

**8. `payment_logs`**
- **What it stores:** Structured audit log for payment system events — errors, state transitions, amount/currency mismatches, race conditions, performance metrics.
- **Who uses it:** `logging.ts` inserts critical/error events. The views `recent_payment_errors` and `payment_mismatches` read from it.
- **Impact:** Medium. Exposes internal payment system behavior and error patterns.

**9. `review_notes`**
- **What it stores:** Timestamped admin review notes for donations, event registrations, and conference registrations. Supports markdown.
- **Who uses it:** `admin-payment-actions.ts`, `admin-donation-actions.ts` (insert notes, read for PDF export).
- **Impact:** Medium. Exposes admin internal notes and review decisions.

**10. `status_change_log`**
- **What it stores:** Audit log of all admin-initiated payment status changes. Mandatory reason field (min 10 characters).
- **Who uses it:** `admin-payment-actions.ts`, `admin-donation-actions.ts` (log changes, read for PDF export).
- **Impact:** Medium. Exposes admin audit trail and change reasons.

**11. `payments_with_session`** — **PHANTOM TABLE**
- **What it stores:** Unknown. This table does NOT exist in any migration script in the codebase.
- **Who uses it:** Nobody. No TypeScript code references it.
- **Impact:** Unknown. It was likely created manually in the Supabase dashboard and never cleaned up. It should be investigated — query it to see what's in it, then either drop it or add it to the migration history.

### How to fix

Enable RLS on each table with a service-role-only policy. Since all application code uses `createServiceClient()` (which bypasses RLS), nothing will break.

**Fix script:** `002-enable-rls-tables.sql`

---

## Error 16: Sensitive Columns Exposed

**Lint Rule:** [0023_sensitive_columns_exposed](https://supabase.com/docs/guides/database/database-linter?lint=0023_sensitive_columns_exposed)
**Severity:** ERROR | **Faces:** External (any API caller)

### What's wrong?

The `payments` table is exposed via the API without RLS, and it contains a column called `session_id` which holds Stripe Checkout Session IDs.

### Why is that bad?

A Stripe Session ID can be used to look up checkout session details via the Stripe API. If an attacker gets this value, they could potentially link it to a specific donation, understand the payment flow, or probe for vulnerabilities in the checkout process.

### Is this a separate fix?

No. This error is automatically resolved by enabling RLS on the `payments` table (Error 5 in the list above). Once RLS is enabled with a service-role-only policy, the `anon` key can't read `session_id` or any other column.

### How to fix

Run the RLS fix for the `payments` table, then verify that the anon key returns 0 rows when querying `session_id`.

**Fix script:** `003-sensitive-columns-protection.sql` (verification only — the actual fix is in `002`)

---

## Why None of This Breaks Your App

Every table access in the application code uses `createServiceClient()`:

```
lib/payments/core/PaymentService.ts       → createServiceClient
lib/actions/admin-donation-actions.ts     → createServiceClient
lib/actions/admin-payment-actions.ts      → createServiceClient
app/api/webhooks/stripe/route.ts          → createServiceClient
lib/monitoring/logging.ts                 → createServiceClient
```

The service-role key **bypasses RLS entirely**. Enabling RLS with a `service_role` policy means:
- ✅ Service-role client: works exactly as before
- ✅ Webhook handlers: work exactly as before
- ✅ RPC functions (SECURITY DEFINER): work exactly as before
- ❌ Anon key: now blocked from these tables (this is the fix)
