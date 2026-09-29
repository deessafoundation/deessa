---
title: "Event Payment Integration â€” Overview"
description: "The Event Payment System enables paid event registrations on the deessa Foundation platform. It supports three paymen..."
owner: "deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Event Payment Integration â€” Overview

## Purpose

The Event Payment System enables paid event registrations on the deessa Foundation platform. It supports three payment providers â€” **Stripe** (international cards), **Khalti** (Nepal mobile wallets/banks), and **eSewa** (Nepal digital wallet) â€” with a unified flow that handles session creation, verification, webhook processing, and confirmation emails.

This system is **self-contained within the events module**. It shares only the low-level payment libraries (`lib/payments/`) with the donation and conference modules. No payment logic is borrowed from or coupled to other modules.

## Key Design Principles

1. **Fail-closed verification** â€” Amount mismatches flag for admin review (`payment_status = "review"`) rather than auto-confirming
2. **Dual-path confirmation** â€” Client-side verification (immediate) + server-side webhook (reliable) ensure payments are confirmed even if one path fails
3. **Idempotent operations** â€” Every endpoint and webhook handler is safe to call multiple times
4. **PII minimization** â€” Public endpoints return no personally identifiable information; the registrant name is stored in `sessionStorage`
5. **Optimistic concurrency** â€” Race conditions on `sold_count` and double-payment are prevented via atomic conditional UPDATEs

## Supported Payment Methods

| Provider | Currency | Min Amount | Max Amount | Use Case |
|----------|----------|------------|------------|----------|
| Stripe | USD/EUR/GBP/NPR | $1.00 | $999,999.99 | International credit/debit cards |
| Khalti | NPR | Rs. 10 | No hard limit | Nepali mobile wallets, bank transfers |
| eSewa | NPR | Rs. 10 | Rs. 1,000,000 | Nepali digital wallet |

## User Journey

```
1. User fills registration form
        â†“
2. Registration created (status: "pending", payment_status: "unpaid")
        â†“
3. Payment Options page shown (Pay Now / Pay Later)
        â†“
4a. Pay Now â†’ Pending Payment page (provider selector + countdown)
4b. Pay Later â†’ Later receives email link â†’ Pending Payment page
        â†“
5. User selects provider â†’ Redirected to provider checkout
        â†“
6. User completes payment on provider site
        â†“
7. Provider redirects back â†’ Payment Success page
        â†“
8. Dual-path verification:
   - Client-side: POST /api/events/confirm-stripe-session (Stripe) or eSewa callback
   - Server-side: POST /api/webhooks/stripe (Stripe) or Khalti/eSewa verify
        â†“
9. Registration confirmed â†’ Confirmation email sent
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
3. Register for a free event â€” should succeed without payment
4. Register for a paid event â€” should redirect to payment options

## File Structure

```
lib/
  payments/
    config.ts          â€” Provider configuration, settings
    stripe.ts          â€” Stripe session creation/verification
    khalti.ts          â€” Khalti payment initiation
    esewa.ts           â€” eSewa payment initiation + signature
    security.ts        â€” Validation, sanitization, amount matching
  actions/events-module/
    event-registration.ts  â€” All server actions (register, pay, cancel, etc.)
  rate-limit.ts        â€” Distributed rate limiting

app/
  api/events/
    start-payment/route.ts         â€” POST: Create payment session
    confirm-stripe-session/route.ts â€” POST: Verify Stripe session directly
    status/route.ts                â€” GET: Poll registration status
    verify-registration/route.ts   â€” POST: Verify registration (dual-key)
    resend-payment-link/route.ts   â€” POST: Resend payment email
  api/webhooks/
    stripe/route.ts                â€” POST: Stripe webhook handler
  api/payments/
    khalti/verify/route.ts         â€” POST: Khalti verification
    esewa/success/route.ts         â€” GET: eSewa callback
    esewa/success/event-handler.ts â€” Helper: Event-specific eSewa handler

app/(public)/events/[slug]/register/
  page.tsx                 â€” Registration form (server component)
  payment-options/page.tsx â€” Pay Now / Pay Later choice
  pending-payment/page.tsx â€” Provider selector + countdown timer
  payment-success/page.tsx â€” Verification + confirmation display
  failure/page.tsx         â€” Payment failure page

scripts/
  056-event-payment-integration.sql â€” Database migration
```

## State Machine

### Registration Status
```
pending â†’ confirmed (payment succeeds or free event)
pending â†’ cancelled (admin cancels or user cancels)
pending â†’ expired (24h payment window closes)
```

### Payment Status
```
unpaid â†’ paid (payment confirmed)
unpaid â†’ failed (payment failed)
unpaid â†’ review (amount mismatch â€” requires admin resolution)
unpaid â†’ refunded (admin refunds)
```

## Admin Capabilities

- **Manual confirmation** â€” `markEventPaymentManual()` sets `payment_status = "paid"` without provider verification
- **Bulk operations** â€” `bulkConfirmEventRegistrations()` and `bulkCancelEventRegistrations()` with sold_count management
- **Extend expiry** â€” `extendEventRegistrationExpiry()` adds time to the payment window
- **Review payments** â€” Registrations in `payment_status = "review"` appear in admin for investigation
- **Custom emails** â€” `sendEventRegistrationEmail()` sends templated or custom emails
