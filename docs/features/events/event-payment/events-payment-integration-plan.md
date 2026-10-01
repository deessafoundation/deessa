---
title: "Events Module — Payment Integration Plan"
description: " Status: Approved, pending implementation"
owner: "deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Events Module — Payment Integration Plan

> **Status:** Approved, pending implementation
> **Date:** 2025-07-26
> **Scope:** Integrate Stripe, Khalti, eSewa payments into the events management module
> **Approach:** Copy conference payment flow → adapt for events (self-contained, no conference dependency)

---

## Table of Contents

1. [Schema Gaps Found](#1-schema-gaps-found)
2. [Vulnerabilities to Fix](#2-vulnerabilities-to-fix)
3. [Phase 0: Database Migration](#3-phase-0-database-migration)
4. [Phase 1: Server Actions](#4-phase-1-server-actions)
5. [Phase 2: API Routes](#5-phase-2-api-routes)
6. [Phase 3: Webhook Updates](#6-phase-3-webhook-updates)
7. [Phase 4: eSewa Handler (H1 Fix)](#7-phase-4-esewa-handler-h1-fix)
8. [Phase 5: Frontend Pages](#8-phase-5-frontend-pages)
9. [Phase 6: Supporting Routes](#9-phase-6-supporting-routes)
10. [Complete File Map](#10-complete-file-map)
11. [Security Checklist](#11-security-checklist)
12. [Execution Order](#12-execution-order)

---

## 1. Schema Gaps Found

Critical differences between `conference_registrations` and `event_registrations`:

| Gap | Conference | Events (Current) | Risk |
|-----|-----------|------------------|------|
| Provider session columns | `stripe_session_id`, `khalti_pidx`, `esewa_transaction_uuid` (separate) | Only `provider_session_ref` (generic) | No unique constraints per provider — can't detect duplicate session references |
| Unique constraints | `uq_conf_reg_stripe_session_id`, `uq_conf_reg_khalti_pidx`, `uq_conf_reg_esewa_uuid` | **None** | Can't enforce one-session-per-registration at DB level |
| `payment_events` linkage | `conference_registration_id` column exists | **No `event_registration_id` column** | Webhooks can't link to event registrations for idempotency |
| `PaymentStatus` type | Includes `"review"` | Only `"unpaid" \| "paid" \| "refunded" \| "failed"` | No way to flag amount mismatches for admin review |

---

## 2. Vulnerabilities to Fix

From the conference payment security audit:

| ID | Severity | Issue | Fix for Events |
|----|----------|-------|----------------|
| H1 | HIGH | eSewa mock mode bypasses HMAC in production (`?mock=1` skips signature) | Block `?mock=1` when `NODE_ENV=production` |
| M1 | MED | In-memory rate limiter on start-payment (not distributed across serverless instances) | Use distributed `checkRateLimit` instead |
| M2 | MED | No rate limiting on confirm-stripe-session | Add distributed rate limit |
| M3 | MED | payment_events insert failure silently continues — could allow duplicate confirmation | Make idempotency check atomic with status update |
| M4 | MED | No proactive expiry cron — expired registrations stay in pending_payment | Add SQL function + cron suggestion |
| M5 | MED | Status endpoint accessible by rid only (no email required) | Accept rid-only (UUID not guessable) but add rate limiting |
| M7 | MED | Double-payment race on concurrent startConferencePayment calls | Add distributed advisory lock |

---

## 3. Phase 0: Database Migration

**New file: `scripts/XX-event-payment-integration.sql`**

```sql
-- 1. Add provider-specific session columns to event_registrations
ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS khalti_pidx TEXT,
  ADD COLUMN IF NOT EXISTS esewa_transaction_uuid TEXT;

-- 2. Add unique constraints (prevents duplicate session references)
CREATE UNIQUE INDEX IF NOT EXISTS uq_event_reg_stripe_session_id
  ON event_registrations(stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_event_reg_khalti_pidx
  ON event_registrations(khalti_pidx) WHERE khalti_pidx IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_event_reg_esewa_uuid
  ON event_registrations(esewa_transaction_uuid) WHERE esewa_transaction_uuid IS NOT NULL;

-- 3. Add "review" to payment_status CHECK constraint
ALTER TABLE event_registrations
  DROP CONSTRAINT IF EXISTS event_registrations_payment_status_check;
ALTER TABLE event_registrations
  ADD CONSTRAINT event_registrations_payment_status_check
  CHECK (payment_status IN ('unpaid','paid','refunded','failed','review'));

-- 4. Add event_registration_id to payment_events for webhook linkage
ALTER TABLE payment_events
  ADD COLUMN IF NOT EXISTS event_registration_id UUID
    REFERENCES event_registrations(id) ON DELETE SET NULL;

-- 5. Add indexes for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_event_reg_stripe_session
  ON event_registrations(stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_reg_khalti_pidx
  ON event_registrations(khalti_pidx) WHERE khalti_pidx IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_event_reg_esewa_uuid
  ON event_registrations(esewa_transaction_uuid) WHERE esewa_transaction_uuid IS NOT NULL;
```

---

## 4. Phase 1: Server Actions

**File: `lib/actions/events-module/event-registration.ts`** — Add 3 new functions

### 1a. `getEventRegistrationForPayment(registrationId, email)`

- Dual-key lookup (id + email) — same pattern as `getConferenceRegistrationByToken`
- Returns minimal public shape (no full PII beyond name)
- Uses service-role client for integrity
- Returns: `{ id, fullName, status, paymentStatus, paymentAmount, paymentCurrency, expiresAt, eventName }`

### 1b. `startEventPayment(registrationId, email, provider)`

Security measures (copied from conference, hardened):

| Check | Implementation |
|-------|---------------|
| Dual-key identity | `(id + email)` pair, email lowercased/trimmed |
| State guards | Reject if `paid`, `confirmed`, `cancelled`, `expired` |
| Inline expiry check | If `expires_at < now`, mark expired and reject |
| Fee resolution | Read from `payment_amount` already stored on registration |
| Provider validation | Check against `getSupportedProviders()` |
| Currency forcing | Khalti/eSewa → NPR only |
| **Distributed lock** (NEW) | Use `checkRateLimit` with key `event-pay-start:{registrationId}` to prevent concurrent session creation |
| Provider session storage | Store in provider-specific columns (`stripe_session_id`, `khalti_pidx`, `esewa_transaction_uuid`) + `provider_session_ref` |
| Idempotency | If `stripe_session_id` already set and registration unpaid, return existing session instead of creating new one |

**Return type:** `{ ok, redirectUrl?, formData?, requiresFormSubmit?, message }`

### 1c. `getEventRegistrationStatus(registrationId)`

- Read-only status fetch for polling endpoint
- Returns: `status`, `paymentStatus`, `fullName`, `eventName`, `expiresAt`
- rid-only access (low risk — UUID v4 not guessable)

---

## 5. Phase 2: API Routes

### 2a. `app/api/events/start-payment/route.ts` (NEW)

Copy from `app/api/conference/start-payment/route.ts`, adapt:

| Aspect | Conference | Events |
|--------|-----------|--------|
| Action function | `startConferencePayment` | `startEventPayment` |
| Verify function | `getConferenceRegistrationByToken` | `getEventRegistrationForPayment` |
| Rate limiter | In-memory (M1 vulnerability) | **Distributed** via `checkRateLimit` — 10/min per IP |
| Input validation | Same | Same |

### 2b. `app/api/events/confirm-stripe-session/route.ts` (NEW)

Copy from `app/api/conference/confirm-stripe-session/route.ts`, adapt:

| Aspect | Conference | Events |
|--------|-----------|--------|
| Table | `conference_registrations` | `event_registrations` |
| Session column | `stripe_session_id` | `stripe_session_id` (new) |
| Amount verification | Same | Same — fail-closed |
| **Rate limiting** (NEW) | None (M2 vulnerability) | **Distributed** — 20/min per IP |
| Email ownership | Same pattern | Same pattern |
| Confirmation email | `sendConferenceConfirmationEmail` | `sendEventConfirmationEmail` (from event-mailer.ts) |

### 2c. `app/api/events/status/route.ts` (NEW)

Copy from `app/api/conference/status/route.ts`, adapt:

| Aspect | Conference | Events |
|--------|-----------|--------|
| Table | `conference_registrations` | `event_registrations` |
| Returns | `fullName`, `attendanceMode` | `fullName`, `eventName` (from JOIN with events table) |
| **Rate limiting** (NEW) | None (M5 vulnerability) | **Distributed** — 60/min per IP |

---

## 6. Phase 3: Webhook Updates

**File: `app/api/webhooks/stripe/route.ts`** — Add event routing

In the `checkout.session.completed` handler, after the existing `conference_registration_id` check, add:

```ts
const eventRegistrationId = session.metadata?.event_registration_id;
if (eventRegistrationId) {
  await confirmEventRegistrationFromWebhook(supabase, eventRegistrationId, session, eventId);
  return;
}
```

New function `confirmEventRegistrationFromWebhook()`:

| Check | Implementation |
|-------|---------------|
| Idempotency | Insert into `payment_events` with `event_registration_id` — catch `23505` duplicate |
| State guard | Skip if `payment_status === "paid"` or `status === "confirmed"` |
| Payment status | Only proceed if `session.payment_status === "paid"` |
| Amount verification | `reg.payment_amount * 100` vs `session.amount_total` — fail-closed |
| Currency mismatch | Non-fatal sync (same as conference) |
| Confirmation | Update to `status: "confirmed"`, `payment_status: "paid"`, set `payment_paid_at`, `confirmed_at` |
| Email | Fire-and-forget `sendEventConfirmationEmail()` |

---

## 7. Phase 4: eSewa Handler (H1 Fix)

**File: `app/api/payments/esewa/success/event-handler.ts`** (NEW — adapted from `conference-handler.ts`)

**Critical fix — Block mock mode in production:**

```ts
if (process.env.NODE_ENV === "production" && searchParams.get("mock") === "1") {
  return NextResponse.json({ ok: false, error: "Mock mode disabled in production" }, { status: 400 });
}
```

Handler flow:
1. Rate limited: 20/min per IP (distributed)
2. Parse eSewa callback data (base64 response)
3. Verify HMAC-SHA256 signature using `crypto.timingSafeEqual()`
4. Look up `event_registrations` by `esewa_transaction_uuid`
5. Verify amount with `verifyAmountMatch(expected, actual, "NPR", 0.01)` — 1 paisa tolerance
6. Amount mismatch → set `payment_status: "review"`, return
7. Confirm: `status: "confirmed"`, `payment_status: "paid"`, set timestamps
8. Send confirmation email via event-mailer (fire-and-forget)

---

## 8. Phase 5: Frontend Pages

### 5a. `events/[slug]/register/payment-options/page.tsx` (REWRITE)

Copy from `conference/register/payment-options/page.tsx`, adapt:

| Aspect | Conference | Events |
|--------|-----------|--------|
| Back link | `/conference` | `/events/${slug}` |
| Resend email API | `/api/conference/resend-payment-link` | `/api/events/resend-payment-link` |
| Pending payment URL | `/conference/register/pending-payment?...` | `/events/${slug}/register/pending-payment?...` |
| Event name | Hardcoded "deessa National Conference 2026" | Dynamic from `eventName` search param |
| Short ID format | `deessa-2026-{rid.slice(0,6)}` | `{eventName} - {rid.slice(0,6)}` |

### 5b. `events/[slug]/register/pending-payment/page.tsx` (REWRITE)

Copy from `conference/register/pending-payment/page.tsx`, adapt:

| Aspect | Conference | Events |
|--------|-----------|--------|
| Registration verify API | `/api/conference/verify-registration` | `/api/events/verify-registration` |
| Start payment API | `/api/conference/start-payment` | `/api/events/start-payment` |
| Back link | `/conference/register` | `/events/${slug}/register` |
| Success redirect | `/conference/register/payment-success?...` | `/events/${slug}/register/payment-success?...` |
| Event name | Hardcoded | Dynamic from registration data |
| Registration summary | `attendanceMode` | `eventName` + `ticketName` |

### 5c. `events/[slug]/register/payment-success/page.tsx` (REWRITE)

Copy from `conference/register/payment-success/page.tsx`, adapt:

| Aspect | Conference | Events |
|--------|-----------|--------|
| Stripe verify API | `/api/conference/confirm-stripe-session` | `/api/events/confirm-stripe-session` |
| Khalti verify API | `/api/payments/khalti/verify` | `/api/payments/khalti/verify` (shared — already handles events) |
| Status polling API | `/api/conference/status` | `/api/events/status` |
| Back link | `/conference` | `/events/${slug}` |
| Confirmation display | `attendanceMode` | `eventName` + `ticketName` |
| Registration ID format | `deessa-2026-{rid.slice(0,6)}` | Dynamic event prefix |

### 5d. `events/[slug]/register/failure/page.tsx` (MINOR EDIT)

- Add `rid` and `email` to retry link URL
- Link back to `/events/${slug}/register/pending-payment?rid=...&email=...` instead of generic `/events`
- Add countdown/expiration messaging

---

## 9. Phase 6: Supporting Routes

### 6a. `app/api/events/verify-registration/route.ts` (NEW)

- POST endpoint, dual-key `(rid, email)`
- Uses `getEventRegistrationForPayment()`
- Returns: `id`, `fullName`, `paymentAmount`, `paymentCurrency`, `expiresAt`, `status`, `paymentStatus`, `eventName`, `expired`
- Rate limited: 60/min per IP (distributed)
- Generic error messages (no enumeration)

### 6b. `app/api/events/resend-payment-link/route.ts` (NEW)

- POST endpoint, dual-key `(registrationId, email)`
- Rate limited: 5 IP/min + 3 registration/min (distributed)
- Won't resend if `payment_status === "paid"` or `status === "expired"`
- Sends payment link email via event-mailer
- Returns: `{ ok, message }`

---

## 10. Complete File Map

| # | File | Action | Source |
|---|------|--------|--------|
| 0 | `scripts/XX-event-payment-integration.sql` | **CREATE** | New migration |
| 1 | `lib/actions/events-module/event-registration.ts` | **EDIT** — add 3 functions | Adapted from conference-registration.ts |
| 2 | `app/api/events/start-payment/route.ts` | **CREATE** | Copied from conference/start-payment |
| 3 | `app/api/events/confirm-stripe-session/route.ts` | **CREATE** | Copied from conference/confirm-stripe-session |
| 4 | `app/api/events/status/route.ts` | **CREATE** | Copied from conference/status |
| 5 | `app/api/events/verify-registration/route.ts` | **CREATE** | Copied from conference/verify-registration |
| 6 | `app/api/events/resend-payment-link/route.ts` | **CREATE** | Copied from conference/resend-payment-link |
| 7 | `app/api/webhooks/stripe/route.ts` | **EDIT** — add event routing | New `confirmEventRegistrationFromWebhook` |
| 8 | `app/api/payments/esewa/success/event-handler.ts` | **CREATE** | Adapted from conference-handler.ts + H1 fix |
| 9 | `events/[slug]/register/payment-options/page.tsx` | **REWRITE** | Copied from conference/payment-options |
| 10 | `events/[slug]/register/pending-payment/page.tsx` | **REWRITE** | Copied from conference/pending-payment |
| 11 | `events/[slug]/register/payment-success/page.tsx` | **REWRITE** | Copied from conference/payment-success |
| 12 | `events/[slug]/register/failure/page.tsx` | **EDIT** | Minor fixes |
| 13 | `lib/types/events-module.ts` | **EDIT** — add `"review"` to PaymentStatus | Type fix |

**Total: 8 new files, 5 edits, 1 migration**

---

## 11. Security Checklist

- [x] Dual-key identity verification (rid + email) on all write endpoints
- [x] Distributed rate limiting on all public endpoints (fixes M1)
- [x] Rate limiting on confirm-stripe-session (fixes M2)
- [x] Atomic idempotency via `payment_events` table (fixes M3)
- [x] Fail-closed amount verification in minor units (cents/paisa)
- [x] Timing-safe HMAC comparison for eSewa
- [x] Mock mode blocked in production (fixes H1)
- [x] Provider session columns with unique constraints (prevents duplicates)
- [x] State machine guards on all transitions
- [x] Generic error messages (no enumeration)
- [x] Non-blocking email sending (never delays payment)
- [x] `payment_status: "review"` for amount mismatches (admin investigation)
- [x] Distributed advisory lock to prevent double-payment race (fixes M7)

---

## 12. Execution Order

1. **Phase 0** — Migration first (schema must be ready before any code)
2. **Phase 1** — Server actions (backend logic foundation)
3. **Phase 2** — API routes (expose backend to frontend)
4. **Phase 3** — Webhook (production reliability)
5. **Phase 4** — eSewa handler (security fix)
6. **Phase 5** — Frontend pages (user-facing)
7. **Phase 6** — Supporting routes (verify, resend)

---

## Conference vs Events — Key Adaptation Reference

| Aspect | Conference | Events |
|--------|-----------|--------|
| Table | `conference_registrations` | `event_registrations` |
| Fee source | `getConferenceSettings()` → `registrationFeeByMode` | `event_ticket_types.price` (already in `payment_amount`) |
| Name format | `deessa-2026-{rid.slice(0,6)}` | Dynamic from event title |
| URL pattern | `/conference/register/...` | `/events/[slug]/register/...` |
| Metadata key | `conference_registration_id` | `event_registration_id` |
| Webhook function | `confirmConferenceRegistrationFromWebhook()` | `confirmEventRegistrationFromWebhook()` |
| Email service | `conference-mailer.ts` | `event-mailer.ts` |
| Session columns | `stripe_session_id`, `khalti_pidx`, `esewa_transaction_uuid` | Same (added by migration) |

---

## Shared Libraries (No Changes Needed)

These are reused directly — no copying needed:

- `lib/payments/stripe.ts` — `startStripeCheckout()`, `verifyStripeSession()`
- `lib/payments/khalti.ts` — `startKhaltiPayment()`
- `lib/payments/esewa.ts` — `startEsewaPayment()`
- `lib/payments/config.ts` — `getPaymentSettings()`, `getSupportedProviders()`
- `lib/payments/security.ts` — `validateAmount()`, `verifyAmountMatch()`, `maskSensitiveData()`, `logPaymentEvent()`
- `lib/payments/errors.ts` — `KhaltiError`, `EsewaError`
- `lib/rate-limit.ts` — `checkRateLimit()` (distributed)
- `lib/utils.ts` — `getAppBaseUrl()`
