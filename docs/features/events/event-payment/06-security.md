---
title: "Event Payment Integration â€” Security"
description: "| Threat | Mitigation |"
owner: "Deesha Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Event Payment Integration â€” Security

## Threat Model

| Threat | Mitigation |
|--------|------------|
| **Double payment** â€” User clicks "Pay" twice, creating two Stripe sessions | Optimistic lock via `payment_initiated_at IS NULL` conditional UPDATE |
| **Overselling** â€” Two concurrent registrations exceed ticket capacity | Atomic `sold_count` increment with `WHERE sold_count = X` optimistic lock |
| **Forged eSewa callback** â€” Attacker sends fake success callback | HMAC-SHA256 signature verification (timing-safe comparison) |
| **Amount tampering** â€” Attacker modifies payment amount | Fail-closed amount verification across all providers; mismatch â†’ `payment_status = "review"` |
| **Email enumeration** â€” Attacker probes for registered emails | Dual-key verification (rid + email); generic error messages |
| **Rate abuse** â€” Attacker floods endpoints | Distributed rate limiting (Supabase `rate_limits` table) |
| **Session hijacking** â€” Attacker uses stolen session ID | Stripe ownership verification (email match or stored session ID match) |
| **PII leakage** â€” Public endpoints expose personal data | Status endpoint returns no PII; name stored in `sessionStorage` |
| **XSS via template injection** â€” Attacker crafts name containing `<script>` | HTML escaping applied to all template body interpolations |
| **Race condition: webhook vs confirm** â€” Webhook cancels while confirm is in-flight | Status guard: `WHERE status NOT IN ('cancelled','expired')` on all UPDATEs |
| **Stuck registration** â€” Lock acquired but provider update fails | Lock released (`payment_initiated_at = null`) on provider update failure |

## Authentication & Authorization

### Dual-Key Identity Check

All public endpoints use a **dual-key verification** pattern: the user must provide both a `registrationId` (UUID) AND the associated `email`. This prevents:

- **ID guessing**: UUIDs are not guessable (128-bit random)
- **Email enumeration**: Error message is identical whether the ID exists with wrong email, or doesn't exist at all

```typescript
// Generic error â€” never reveals which key was wrong
"Registration not found or email does not match."
```

### No Auth Required

Payment endpoints are intentionally unauthenticated because:
- Users may not have an account (event registration is open to all)
- The registration UUID + email pair provides sufficient identity verification
- Provider webhooks use provider-specific signature verification instead

### Provider Signature Verification

| Provider | Verification Method |
|----------|-------------------|
| Stripe | HMAC webhook signature via `stripe.webhooks.constructEvent()` |
| Khalti | Server-side API lookup (`POST /epayment/lookup/`) |
| eSewa | HMAC-SHA256 signature with timing-safe comparison |

## Rate Limiting

### Architecture

- **Storage**: Supabase PostgreSQL `rate_limits` table
- **Algorithm**: Sliding window with atomic increment via RPC `increment_rate_limit`
- **Strategy**: **Fail-open** â€” if rate limiter errors, requests are allowed

### Endpoint Limits

| Endpoint | Identifier | Limit | Window |
|----------|-----------|-------|--------|
| `POST /start-payment` | `event-start-payment:ip:{ip}` | 10 | 1 min |
| `POST /confirm-stripe-session` | `event-confirm-stripe:ip:{ip}` | 20 | 1 min |
| `GET /status` | `event-status:ip:{ip}` | 60 | 1 min |
| `POST /verify-registration` | `event-verify-reg:ip:{ip}` | 60 | 1 min |
| `POST /resend-payment-link` (IP) | `event-resend-payment:ip:{ip}` | 5 | 60 min |
| `POST /resend-payment-link` (rid) | `event-resend-payment:rid:{rid}` | 3 | 60 min |
| `POST /khalti/verify` | `khalti-verify:ip:{ip}` | 10 | 1 min |
| `GET /esewa/success` | `esewa-success:ip:{ip}` | 20 | 1 min |
| `POST /webhooks/stripe` | None | Unlimited | â€” |

### Resend Dual-Scope Rate Limiting

The resend endpoint uses **two** rate limits simultaneously:
1. **IP-based**: Prevents a single IP from spamming across registrations
2. **Registration-based**: Prevents a single registration from being spammed

Both must pass for the request to proceed.

## Input Validation

All validation functions are in `lib/payments/security.ts`.

| Input | Validation | Limits |
|-------|-----------|--------|
| Amount (NPR) | Numeric, finite, positive | Min: Rs. 10, Max: Rs. 1,000,000 |
| Amount (USD) | Numeric, finite, positive | Min: $1, Max: $10,000 |
| Email | Regex + length check | Max 255 chars |
| Phone | Optional, digits only | 7â€“15 digits |
| Name | Character check | Min 2 chars, Max 255 chars; rejects `<>"'` |
| Registration ID | UUID v4 format | 36-char UUID |
| Strings (general) | Sanitize + truncate | Max 1000 chars; strips `<>"'` |

## Amount Verification

### Fail-Closed Strategy

All providers verify the paid amount matches the expected amount. Mismatches are **fail-closed**: the registration is flagged for admin review rather than auto-confirmed.

```typescript
// verifyAmountMatch(expected, actual, currency, tolerance)
// Default tolerance: 0.01 (1 paisa)
```

| Provider | Expected Source | Actual Source | Tolerance |
|----------|----------------|---------------|-----------|
| Stripe | `reg.payment_amount Ã— 100` (minor units) | `session.amount_total` | Exact (integer comparison) |
| Khalti | `reg.payment_amount Ã— 100` (paisa) | `lookupData.total_amount` | 1 paisa |
| eSewa | `reg.payment_amount` (rupees) | `callback.total_amount` | 0.01 NPR (1 paisa) |

### Review Process

When a mismatch is detected:
1. `payment_status` is set to `"review"`
2. `payment_review_at` is timestamped
3. The provider-specific ID is stored (for investigation)
4. User is redirected to a "review" status page
5. Admin can investigate and manually confirm or cancel

## Race Condition Protection

### 1. Double-Payment Lock

```sql
UPDATE event_registrations
SET payment_initiated_at = NOW()
WHERE id = $1
  AND payment_status = 'unpaid'
  AND payment_initiated_at IS NULL
```

- Only one request can successfully update (Postgres guarantees atomicity)
- Second concurrent request sees 0 rows affected â†’ rejected
- Lock is released if the subsequent provider update fails

### 2. sold_count Optimistic Lock

```sql
UPDATE event_ticket_types
SET sold_count = sold_count + 1
WHERE id = $1
  AND sold_count = $expected
```

- If two concurrent registrations both read `sold_count = 99`, only one UPDATE succeeds
- The loser detects `count === 0` (via Supabase `{ count: "exact" }`) and rolls back

### 3. Webhook Race Guard

```sql
UPDATE event_registrations
SET status = 'confirmed', payment_status = 'paid', ...
WHERE id = $1
  AND status NOT IN ('cancelled', 'expired')
```

- Prevents the confirm endpoint from overwriting a cancellation that happened during verification
- Returns `409 Conflict` if the registration is no longer in a confirmable state

## Security Fixes Applied

The following security issues were identified during audit and fixed:

| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| C1 | CRITICAL | Double-payment race condition | Optimistic lock on `payment_initiated_at IS NULL` |
| C2 | CRITICAL | sold_count oversell race | Atomic increment with row-count detection |
| H1 | HIGH | eSewa amount verified before signature | Reordered: signature FIRST, then amount |
| H2 | HIGH | Cancelled/expired registrations could be confirmed | Added guards in confirm-stripe-session |
| H3 | HIGH | Under-review registrations could start new payment | Added `payment_status === "review"` guard |
| H4 | HIGH | sold_count decrement non-atomic on cancellation | Atomic decrement with optimistic lock |
| M1 | MEDIUM | PII in URL params | Moved name to `sessionStorage` |
| M2 | MEDIUM | XSS via template injection | HTML escaping in email body |
| M3 | MEDIUM | "ok:true" lie when no email template | Returns `paymentLink` URL in response |
| M5 | MEDIUM | PII in public status endpoint | Removed `fullName` from response |
| M6 | MEDIUM | Non-payment Stripe sessions accepted | `mode !== "payment"` rejection |
| NEW-1 | HIGH | `payment_provider` never written to DB | Added to provider update |
| NEW-2 | HIGH | Lock consumed before validation | Moved validation before lock |
| NEW-3 | HIGH | `ticket_type_id` not stored on registration | Added to INSERT |
| NEW-4 | HIGH | eSewa status check before signature | Moved signature check first |
| R1 | MEDIUM | Confirm endpoint overwrites webhook cancellation | Added status filter on UPDATE |
| R2 | LOW | Amount tolerance 100x too large | Fixed tolerance math |
