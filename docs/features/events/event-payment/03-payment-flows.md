---
title: "Event Payment Integration â€” Payment Flows"
description: "- Frontend sends POST /api/events/start-payment with {registrationId, email, provider: \"stripe\"}"
owner: "Deesha Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Event Payment Integration â€” Payment Flows

## Flow 1: Stripe Payment

### Step-by-Step

#### 1. User Clicks "Pay Now" (pending-payment page)
- Frontend sends `POST /api/events/start-payment` with `{registrationId, email, provider: "stripe"}`
- Rate limit: 10 requests/minute/IP

#### 2. start-payment Creates Stripe Session
- Server validates registration (must be `unpaid`, not expired, not cancelled)
- Acquires optimistic lock (`payment_initiated_at IS NULL`)
- Calls `startStripeCheckout()` which creates a Stripe Checkout Session:
  - `mode: "payment"` (one-time)
  - `customer_email` set to registrant's email
  - `success_url` includes `session_id` for client-side verification
  - `cancel_url` redirects back to pending-payment page
  - `metadata.event_registration_id` links session to registration
- Stores `stripe_session_id` on the registration record
- Returns `redirectUrl` to the browser

#### 3. User Completes Payment on Stripe
- Stripe-hosted checkout page collects card details
- Stripe processes the payment
- Stripe redirects browser to `success_url` with `session_id` query param

#### 4. Client-Side Verification (payment-success page)
- Payment-success page extracts `session_id` from URL
- Sends `POST /api/events/confirm-stripe-session` with `{rid, sessionId}`
- Server:
  1. Fetches registration from DB
  2. Checks idempotency (already `paid` + `confirmed` â†’ return early)
  3. Checks guards (cancelled â†’ 400, expired â†’ 400)
  4. Calls `verifyStripeSession(sessionId)` â€” retrieves session from Stripe API
  5. Verifies `session.mode === "payment"` (rejects subscription sessions)
  6. Verifies ownership (email match or stored session ID match)
  7. Verifies amount: `reg.payment_amount Ã— 100 === session.amount_total`
     - Mismatch â†’ sets `payment_status = "review"`, returns `{status: "review"}`
  8. Syncs currency if different from DB
  9. Updates registration: `status = "confirmed"`, `payment_status = "paid"`
  10. Sends confirmation email (fire-and-forget)
  11. Returns `{ok: true, status: "confirmed"}`

#### 5. Webhook (Asynchronous, seconds later)
- Stripe sends `checkout.session.completed` to `/api/webhooks/stripe`
- Webhook handler:
  1. Verifies Stripe signature
  2. Identifies it as an event registration (via `metadata.event_registration_id`)
  3. Idempotency check via `payment_events` table
  4. Skips if already `paid` or `confirmed`
  5. Verifies amount (same logic as Path 1)
  6. Updates registration (same fields)
  7. Sends confirmation email (fire-and-forget)
  8. Returns `{received: true}`

### Error Scenarios

| Error | Handling |
|-------|----------|
| User closes browser before redirect | Webhook confirms later |
| Stripe session expires (24h) | `checkout.session.expired` webhook fires; registration stays `unpaid` |
| Amount mismatch | `payment_status = "review"`, admin investigates |
| Duplicate webhook | Idempotent â€” skipped via `payment_events` |
| Registration cancelled before webhook | Status guard: `WHERE status NOT IN ('cancelled','expired')` |

---

## Flow 2: Khalti Payment

### Step-by-Step

#### 1. User Clicks "Pay Now"
- Same as Stripe: `POST /api/events/start-payment` with `provider: "khalti"`

#### 2. start-payment Creates Khalti Payment
- Validates registration + acquires optimistic lock
- Calls `startKhaltiPayment()`:
  - Validates amount â‰¥ Rs. 10 (1000 paisa)
  - Validates email and name
  - Detects sandbox/production key mismatch
  - POSTs to `{KHALTI_BASE_URL}/epayment/initiate/` with:
    - `amount` in paisa
    - `product_identity`: registration ID
    - `product_name`: event title
    - `return_url`: `{siteUrl}/events/{slug}/register/payment-success?rid={rid}`
  - 30-second timeout
- Stores `khalti_pidx` on registration
- Returns `redirectUrl` (Khalti payment page)

#### 3. User Completes Payment on Khalti
- Khalti-hosted page collects payment
- User selects bank/wallet and authorizes
- Khalti redirects browser to `return_url` with `pidx` query param

#### 4. Client-Side Verification (payment-success page)
- Payment-success page extracts `pidx` from URL
- Sends `POST /api/payments/khalti/verify` with `{pidx}`
- Server:
  1. Fetches registration by `khalti_pidx`
  2. Calls Khalti lookup API: `POST /epayment/lookup/` with `{pidx}`
  3. Verifies Khalti response status is `"Completed"`
  4. Verifies amount: `reg.payment_amount Ã— 100 === lookupData.total_amount`
     - Mismatch â†’ `payment_status = "review"`
  5. Updates registration
  6. Returns `{ok: true, status: "completed"}`

#### 5. No Separate Webhook
Khalti does not have a separate webhook mechanism. The verification endpoint acts as both the callback handler and the verification endpoint.

### Error Scenarios

| Error | Handling |
|-------|----------|
| Khalti lookup returns "Pending" | Returns `{status: "processing"}`, client polls again |
| Khalti lookup returns "Expired" | Sets `payment_status = "failed"` |
| Amount mismatch | `payment_status = "review"` |
| Khalti API unreachable | Returns 502 error, user retries |

---

## Flow 3: eSewa Payment

### Step-by-Step

#### 1. User Clicks "Pay Now"
- Same as others: `POST /api/events/start-payment` with `provider: "esewa"`

#### 2. start-payment Creates eSewa Payment
- Validates registration + acquires optimistic lock
- Calls `startEsewaPayment()`:
  - Validates amount (Rs. 10 â€“ Rs. 1,000,000)
  - Generates `transaction_uuid`: `{Date.now()}-{registrationId}`
  - Generates HMAC-SHA256 signature over `total_amount,transaction_uuid,product_code`
  - Builds form data for browser-side POST
- Stores `esewa_transaction_uuid` on registration
- Returns `{redirectUrl, formData, requiresFormSubmit: true}`

#### 3. Browser Submits Form to eSewa
- Unlike Stripe/Khalti, eSewa requires a **form POST** (not redirect)
- The payment-success page renders a hidden form and auto-submits it
- Form fields include: `amount`, `tax_amount`, `total_amount`, `product_code`, `product_service_charge`, `product_delivery_charge`, `transaction_uuid`, `product_code`, `signature`, `signed_field_names`, `success_url`, `failure_url`

#### 4. User Completes Payment on eSewa
- eSewa-hosted page processes payment
- On success, eSewa redirects browser to `success_url` with base64-encoded `data` param

#### 5. Server-Side Callback (GET /api/payments/esewa/success)
- eSewa redirects to `/api/payments/esewa/success?data={base64_encoded_json}`
- Server:
  1. Decodes base64 `data` parameter
  2. Extracts `transaction_uuid` and looks up registration
  3. **Signature verification (FIRST, before any state changes)**:
     - Constructs message from `signed_field_names` and response data
     - Computes HMAC-SHA256 using `ESEWA_SECRET_KEY`
     - Compares via `crypto.timingSafeEqual()`
     - Invalid signature â†’ redirect to `/failure?reason=invalid_signature` (NO state change)
  4. **Status check** (after signature verified):
     - If `status !== "COMPLETE"` â†’ sets `payment_status = "failed"`, redirects to failure
  5. **Amount verification** (after signature verified):
     - Compares `reg.payment_amount` vs `total_amount` with tolerance 0.01 NPR
     - Mismatch â†’ sets `payment_status = "review"`
  6. **Idempotency**: If already `paid` â†’ redirect to success
  7. Updates registration: `status = "confirmed"`, `payment_status = "paid"`
  8. Sends confirmation email (fire-and-forget)
  9. Redirects to `/events/{slug}/register/payment-success?rid={rid}&paid=1`

#### 6. No Separate Webhook
eSewa's callback IS the verification. There is no separate webhook.

### Error Scenarios

| Error | Handling |
|-------|----------|
| Invalid HMAC signature | Redirect to failure, no state change |
| `status !== "COMPLETE"` | `payment_status = "failed"` |
| Amount mismatch | `payment_status = "review"` |
| Mock mode in production | 400 error, blocked |
| Base64 decode failure | 400 error |
| Registration not found | Falls through to donation/conference handlers |

---

## Provider Comparison

| Aspect | Stripe | Khalti | eSewa |
|--------|--------|--------|-------|
| Redirect type | URL redirect | URL redirect | Form POST |
| Client-side verify | Yes (`confirm-stripe-session`) | Yes (`khalti/verify`) | No (handled by callback) |
| Server-side webhook | Yes (`/webhooks/stripe`) | No | No |
| Signature verification | Stripe SDK (HMAC) | Khalti API lookup | HMAC-SHA256 (manual) |
| Amount tolerance | Exact match (minor units) | Exact match (paisa) | 0.01 NPR tolerance |
| Sandbox detection | Key prefix `sk_test_` | Key < 10 chars or URL mismatch | `EPAYTEST` merchant ID |
| Currency support | Multi-currency | NPR only | NPR only |
| Session timeout | 24 hours | Provider-dependent | Provider-dependent |
| Confirmation email | Fire-and-forget | Fire-and-forget | Fire-and-forget |
