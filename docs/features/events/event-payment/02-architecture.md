---
title: "Event Payment Integration — Architecture"
description: "Documentation for event payment integration — architecture"
owner: "deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Event Payment Integration — Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                               │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ Registration │  │   Payment    │  │   Pending    │  │  Payment   │  │
│  │    Form      │  │   Options    │  │   Payment    │  │  Success   │  │
│  │              │  │              │  │              │  │            │  │
│  │ POST         │  │ redirect     │  │ POST         │  │ polling    │  │
│  │ /register    │  │ to options   │  │ /start-      │  │ GET        │  │
│  │              │  │              │  │   payment    │  │ /status    │  │
│  └──────────────┘  └──────────────┘  └──────┬───────┘  └────────────┘  │
│                                              │                          │
│                                              ▼                          │
│                                    ┌─────────────────┐                  │
│                                    │  Provider       │                  │
│                                    │  Checkout       │                  │
│                                    │  (Stripe/Khalti │                  │
│                                    │   /eSewa)       │                  │
│                                    └────────┬────────┘                  │
│                                              │ redirect back            │
│                                              ▼                          │
│                                    ┌─────────────────┐                  │
│                                    │ Payment Success │                  │
│                                    │ + Verification  │                  │
│                                    └─────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
         │                                │
         │ HTTP                           │ HTTP
         ▼                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS API ROUTES                               │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Event Payment Endpoints                                        │   │
│  │                                                                  │   │
│  │  POST /api/events/start-payment        (rate: 10/min/IP)        │   │
│  │  POST /api/events/confirm-stripe-session (rate: 20/min/IP)      │   │
│  │  GET  /api/events/status?rid=          (rate: 60/min/IP)        │   │
│  │  POST /api/events/verify-registration  (rate: 60/min/IP)        │   │
│  │  POST /api/events/resend-payment-link  (rate: 5/min/IP)         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Provider Callbacks / Webhooks                                  │   │
│  │                                                                  │   │
│  │  POST /api/webhooks/stripe              (no rate limit)          │   │
│  │  POST /api/payments/khalti/verify       (rate: 10/min/IP)       │   │
│  │  GET  /api/payments/esewa/success       (rate: 20/min/IP)       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Server Actions (lib/actions/events-module/)                     │   │
│  │                                                                  │   │
│  │  registerForEvent()           — Create registration              │   │
│  │  startEventPayment()          — Initiate provider session        │   │
│  │  getEventRegistrationStatus() — Read-only status                 │   │
│  │  confirmEventRegistration()   — Mark as paid                     │   │
│  │  cancelEventRegistration()    — Cancel + decrement sold_count    │   │
│  │  markEventPaymentManual()     — Admin manual confirmation        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
         │                                │
         │ Service Role                   │ Service Role
         ▼                                ▼
┌─────────────────────┐    ┌─────────────────────────────────────────────┐
│    Supabase DB       │    │         Payment Providers                   │
│                      │    │                                             │
│  event_registrations │    │  ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  event_ticket_types  │    │  │ Stripe  │ │ Khalti  │ │ eSewa   │      │
│  payment_events      │    │  │ API     │ │ API     │ │ API     │      │
│  events              │    │  └─────────┘ └─────────┘ └─────────┘      │
│  rate_limits         │    │                                             │
│  event_email_templates│   └─────────────────────────────────────────────┘
└─────────────────────┘
```

## Data Flow: Stripe Payment

```
Browser                    Next.js API                 Stripe              Supabase
  │                           │                          │                    │
  │  POST /start-payment      │                          │                    │
  │  {rid, email, "stripe"}   │                          │                    │
  │ ─────────────────────────>│                          │                    │
  │                           │  checkout.sessions.create │                    │
  │                           │ ────────────────────────>│                    │
  │                           │  { session_id, url }     │                    │
  │                           │ <────────────────────────│                    │
  │  { redirectUrl, sessionId}│                          │                    │
  │ <─────────────────────────│                          │                    │
  │                           │                          │                    │
  │  redirect to Stripe ─────────────────────────────>  │                    │
  │                           │                          │                    │
  │  user completes payment   │                          │                    │
  │                           │                          │                    │
  │  redirect back ─────────────────────────────────>   │                    │
  │  ?rid=xxx&session_id=yyy  │                          │                    │
  │                           │                          │                    │
  │  POST /confirm-stripe     │                          │                    │
  │  {rid, sessionId}         │                          │                    │
  │ ─────────────────────────>│  sessions.retrieve        │                    │
  │                           │ ────────────────────────>│                    │
  │                           │  {status, amount, ...}   │                    │
  │                           │ <────────────────────────│                    │
  │                           │  UPDATE SET status=confirmed               │
  │                           │ ──────────────────────────────────────────>│
  │  {ok: true, status: confirmed}                        │                    │
  │ <─────────────────────────│                          │                    │
  │                           │                          │                    │
  │                           │  POST /webhooks/stripe (async, seconds later)│
  │                           │ <─────────────────────────────────────────────│
  │                           │  idempotent check → skip (already confirmed) │
  │                           │  { received: true }      │                    │
  │                           │ ────────────────────────>│                    │
```

## Data Flow: Khalti Payment

```
Browser                    Next.js API                 Khalti              Supabase
  │                           │                          │                    │
  │  POST /start-payment      │                          │                    │
  │  {rid, email, "khalti"}   │                          │                    │
  │ ─────────────────────────>│                          │                    │
  │                           │  POST /epayment/initiate  │                    │
  │                           │ ────────────────────────>│                    │
  │                           │  { payment_url, pidx }   │                    │
  │                           │ <────────────────────────│                    │
  │  { redirectUrl, pidx }    │                          │                    │
  │ <─────────────────────────│                          │                    │
  │                           │                          │                    │
  │  redirect to Khalti ─────────────────────────────>  │                    │
  │                           │                          │                    │
  │  user completes payment   │                          │                    │
  │                           │                          │                    │
  │  redirect back ─────────────────────────────────>   │                    │
  │  ?pidx=xxx                │                          │                    │
  │                           │                          │                    │
  │  POST /payments/khalti/verify                         │                    │
  │  {pidx}                   │                          │                    │
  │ ─────────────────────────>│  POST /epayment/lookup    │                    │
  │                           │ ────────────────────────>│                    │
  │                           │  {status, amount, ...}   │                    │
  │                           │ <────────────────────────│                    │
  │                           │  UPDATE SET status=confirmed               │
  │                           │ ──────────────────────────────────────────>│
  │  {ok: true, status: "completed"}                     │                    │
  │ <─────────────────────────│                          │                    │
```

## Data Flow: eSewa Payment

```
Browser                    Next.js API                 eSewa               Supabase
  │                           │                          │                    │
  │  POST /start-payment      │                          │                    │
  │  {rid, email, "esewa"}    │                          │                    │
  │ ─────────────────────────>│                          │                    │
  │                           │  generate HMAC signature  │                    │
  │                           │  build form data          │                    │
  │  {redirectUrl, formData,  │                          │                    │
  │   requiresFormSubmit:true}│                          │                    │
  │ <─────────────────────────│                          │                    │
  │                           │                          │                    │
  │  browser auto-submits ──────────────────────────>   │                    │
  │  form POST to eSewa       │                          │                    │
  │                           │                          │                    │
  │  user completes payment   │                          │                    │
  │                           │                          │                    │
  │  eSewa redirects ───────────────────────────────>   │                    │
  │  GET /esewa/success?data=base64encoded               │                    │
  │                           │                          │                    │
  │                           │  decode base64            │                    │
  │                           │  verify HMAC signature    │                    │
  │                           │  verify amount            │                    │
  │                           │  UPDATE SET status=confirmed               │
  │                           │ ──────────────────────────────────────────>│
  │  redirect to /payment-success?rid=xxx&paid=1         │                    │
  │ <─────────────────────────│                          │                    │
```

## Dual-Path Confirmation Strategy

The system uses a **dual-path confirmation** strategy to ensure reliability:

### Path 1: Client-Side Verification (Immediate)
- Triggered when the user is redirected back from the provider
- Calls `/api/events/confirm-stripe-session` (Stripe) or handled by eSewa callback
- Verifies the session directly with the provider API
- Confirms the registration immediately (within seconds)
- User sees confirmation right away

### Path 2: Server-Side Webhook (Reliable)
- Triggered by the provider's server-to-server notification
- Calls `/api/webhooks/stripe` (Stripe) or `/api/payments/khalti/verify` (Khalti)
- Processes the event asynchronously (may arrive seconds or minutes later)
- **Idempotent**: If Path 1 already confirmed, the webhook is a no-op
- Acts as a safety net if Path 1 fails (user closes browser, network error, etc.)

### Why Both?

| Scenario | Path 1 | Path 2 | Result |
|----------|--------|--------|--------|
| Normal flow | Confirms | Arrives later, idempotent skip | Confirmed |
| User closes browser before redirect | Fails | Confirms | Confirmed |
| Network error on redirect | Fails | Confirms | Confirmed |
| Webhook arrives before redirect | — | Confirms | Confirmed |
| Both arrive simultaneously | Both try UPDATE | One wins, other sees already confirmed | Confirmed |

## Concurrency Control

### Optimistic Lock: Double-Payment Prevention
```sql
UPDATE event_registrations
SET payment_initiated_at = NOW()
WHERE id = $1
  AND payment_status = 'unpaid'
  AND payment_initiated_at IS NULL
```
Only the first request to reach this UPDATE will affect a row. Concurrent requests see 0 rows affected and receive "Payment is already being processed."

### Optimistic Lock: sold_count Oversell Prevention
```sql
UPDATE event_ticket_types
SET sold_count = sold_count + 1
WHERE id = $1
  AND sold_count = $expected_count  -- read at application level
```
If two concurrent registrations both read `sold_count = 99` (capacity = 100), only one UPDATE will match. The other detects zero-row update and rolls back the registration.

### Webhook Race Protection
```sql
UPDATE event_registrations
SET status = 'confirmed', payment_status = 'paid', ...
WHERE id = $1
  AND status NOT IN ('cancelled', 'expired')
```
Prevents the webhook/confirm endpoint from overwriting a cancellation that occurred during the verification window.
