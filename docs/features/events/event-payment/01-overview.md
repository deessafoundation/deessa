---
title: "Event Payment Integration — Overview"
description: "The Event Payment System enables paid event registrations on the deessa Foundation platform. It supports three paymen..."
owner: "deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Event Payment Integration — Overview

## Purpose

The Event Payment System enables paid event registrations on the deessa Foundation platform. It supports three payment providers — **Stripe** (international cards), **Khalti** (Nepal mobile wallets/banks), and **eSewa** (Nepal digital wallet) — with a unified flow that handles session creation, verification, webhook processing, and confirmation emails.

This system is **self-contained within the events module**. It shares only the low-level payment libraries (`lib/payments/`) with the donation and conference modules. No payment logic is borrowed from or coupled to other modules.

## Key Design Principles

1. **Fail-closed verification** — Amount mismatches flag for admin review (`payment_status = "review"`) rather than auto-confirming
2. **Dual-path confirmation** — Client-side verification (immediate) + server-side webhook (reliable) ensure payments are confirmed even if one path fails
3. **Idempotent operations** — Every endpoint and webhook handler is safe to call multiple times
4. **PII minimization** — Public endpoints return no personally identifiable information; the registrant name is stored in `sessionStorage`
5. **Optimistic concurrency** — Race conditions on `sold_count` and double-payment are prevented via atomic conditional UPDATEs

## Supported Payment Methods

| Provider | Currency | Min Amount | Max Amount | Use Case |
|----------|----------|------------|------------|----------|
| Stripe | USD/EUR/GBP/NPR | $1.00 | $999,999.99 | International credit/debit cards |
| Khalti | NPR | Rs. 10 | No hard limit | Nepali mobile wallets, bank transfers |
| eSewa | NPR | Rs. 10 | Rs. 1,000,000 | Nepali digital wallet |

## User Journey

```
1. User fills registration form
        ↓
2. Registration created (status: "pending", payment_status: "unpaid")
        ↓
3. Payment Options page shown (Pay Now / Pay Later)
        ↓
4a. Pay Now → Pending Payment page (provider selector + countdown)
4b. Pay Later → Later receives email link → Pending Payment page
        ↓
5. User selects provider → Redirected to provider checkout
        ↓
6. User completes payment on provider site
        ↓
7. Provider redirects back → Payment Success page
        ↓
8. Dual-path verification:
   - Client-side: POST /api/events/confirm-stripe-session (Stripe) or eSewa callback
   - Server-side: POST /api/webhooks/stripe (Stripe) or Khalti/eSewa verify
        ↓
9. Registration confirmed → Confirmation email sent
```

## Quick Start

### Prerequisites

- Supabase project with `event_registrations`, `event_ticket_types`, `events`, and `payment_events` tables
- At least one payment provider configured (Stripe, Khalti, or eSewa)
- Migration `056-event-payment-integration.sql` executed

### Minimal Configuration

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...

# Khalti
KHALTI_SECRET_KEY=...
KHALTI_BASE_URL=https://dev.khalti.com/api/v2

# eSewa
ESEWA_MERCHANT_ID=EPAYTEST
ESEWA_SECRET_KEY=...

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Verify Installation

1. Run `056-event-payment-integration.sql` in Supabase SQL Editor
2. Check that `event_registrations` has columns: `stripe_session_id`, `khalti_pidx`, `esewa_transaction_uuid`
3. Register for a free event — should succeed without payment
4. Register for a paid event — should redirect to payment options

## File Structure

```
lib/
  payments/
    config.ts          — Provider configuration, settings
    stripe.ts          — Stripe session creation/verification
    khalti.ts          — Khalti payment initiation
    esewa.ts           — eSewa payment initiation + signature
    security.ts        — Validation, sanitization, amount matching
  actions/events-module/
    event-registration.ts  — All server actions (register, pay, cancel, etc.)
  rate-limit.ts        — Distributed rate limiting

app/
  api/events/
    start-payment/route.ts         — POST: Create payment session
    confirm-stripe-session/route.ts — POST: Verify Stripe session directly
    status/route.ts                — GET: Poll registration status
    verify-registration/route.ts   — POST: Verify registration (dual-key)
    resend-payment-link/route.ts   — POST: Resend payment email
  api/webhooks/
    stripe/route.ts                — POST: Stripe webhook handler
  api/payments/
    khalti/verify/route.ts         — POST: Khalti verification
    esewa/success/route.ts         — GET: eSewa callback
    esewa/success/event-handler.ts — Helper: Event-specific eSewa handler

app/(public)/events/[slug]/register/
  page.tsx                 — Registration form (server component)
  payment-options/page.tsx — Pay Now / Pay Later choice
  pending-payment/page.tsx — Provider selector + countdown timer
  payment-success/page.tsx — Verification + confirmation display
  failure/page.tsx         — Payment failure page

scripts/
  056-event-payment-integration.sql — Database migration
```

## State Machine

### Registration Status
```
pending → confirmed (payment succeeds or free event)
pending → cancelled (admin cancels or user cancels)
pending → expired (24h payment window closes)
```

### Payment Status
```
unpaid → paid (payment confirmed)
unpaid → failed (payment failed)
unpaid → review (amount mismatch — requires admin resolution)
unpaid → refunded (admin refunds)
```

## Admin Capabilities

- **Manual confirmation** — `markEventPaymentManual()` sets `payment_status = "paid"` without provider verification
- **Bulk operations** — `bulkConfirmEventRegistrations()` and `bulkCancelEventRegistrations()` with sold_count management
- **Extend expiry** — `extendEventRegistrationExpiry()` adds time to the payment window
- **Review payments** — Registrations in `payment_status = "review"` appear in admin for investigation
- **Custom emails** — `sendEventRegistrationEmail()` sends templated or custom emails
