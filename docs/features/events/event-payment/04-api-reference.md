---
title: "Event Payment Integration — API Reference"
description: "All endpoints return JSON with { ok: boolean } shape. Errors include error: string."
owner: "deessa Team"
status: active
category: feature
audience: developer
last_updated: 2026-09-12
---
# Event Payment Integration — API Reference

All endpoints return JSON with `{ ok: boolean }` shape. Errors include `error: string`.

---

## POST `/api/events/start-payment`

Creates a payment session with the chosen provider.

**Rate Limit:** 10 requests/minute/IP  
**Auth:** Dual-key (registrationId + email)

### Request Body

```json
{
  "registrationId": "uuid",
  "email": "user@example.com",
  "provider": "stripe" | "khalti" | "esewa"
}
```

### Success Response (200)

```json
{
  "ok": true,
  "redirectUrl": "https://checkout.stripe.com/...",
  "formData": null,
  "requiresFormSubmit": false
}
```

For eSewa, `formData` contains the form fields and `requiresFormSubmit: true`.

### Error Responses

| Status | Error |
|--------|-------|
| 400 | `"registrationId, email, and provider are required"` |
| 400 | `"Invalid email format"` |
| 400 | `"Payment is already being processed for this registration."` |
| 400 | `"This registration has already been paid."` |
| 400 | `"This registration has expired."` |
| 400 | `"This payment is under review."` |
| 400 | `"No payment methods are currently available."` |
| 400 | `"Payment could not be initiated."` |
| 404 | `"Registration not found or email does not match."` |
| 429 | `"Too many requests. Please wait before trying again."` |
| 500 | `"Internal server error"` |

---

## POST `/api/events/confirm-stripe-session`

Verifies a Stripe checkout session directly and confirms the registration.

**Rate Limit:** 20 requests/minute/IP  
**Auth:** Registration ID + Stripe session ownership

### Request Body

```json
{
  "rid": "uuid",
  "sessionId": "cs_test_..."
}
```

### Success Responses

| Status | Scenario | Body |
|--------|----------|------|
| 200 | Already confirmed | `{ok: true, status: "confirmed", alreadyConfirmed: true}` |
| 200 | Newly confirmed | `{ok: true, status: "confirmed"}` |
| 200 | Processing | `{ok: true, status: "processing", paymentStatus: "unpaid"}` |
| 200 | Amount mismatch | `{ok: true, status: "review"}` |

### Error Responses

| Status | Error |
|--------|-------|
| 400 | `"rid and sessionId are required"` |
| 400 | `"Invalid session type"` (non-payment mode) |
| 400 | `"This registration has been cancelled."` |
| 400 | `"This registration has expired."` |
| 403 | `"Session ID mismatch"` |
| 403 | `"Session ownership verification failed"` |
| 404 | `"Registration not found"` |
| 409 | `"Registration is no longer in a confirmable state"` |
| 429 | `"Too many requests"` |
| 500 | `"Failed to confirm registration"` |

---

## GET `/api/events/status?rid={rid}`

Public status-polling endpoint. Returns minimal data — no PII.

**Rate Limit:** 60 requests/minute/IP  
**Auth:** Registration UUID (not guessable)

### Query Parameters

| Param | Required | Description |
|-------|----------|-------------|
| `rid` | Yes | Registration UUID |

### Success Response (200)

```json
{
  "ok": true,
  "status": "confirmed",
  "paymentStatus": "paid",
  "eventName": "Annual Conference 2026",
  "expiresAt": "2026-07-27T12:00:00Z"
}
```

### Error Responses

| Status | Error |
|--------|-------|
| 400 | `"rid is required"` |
| 404 | `"Registration not found"` |
| 429 | `"Too many requests"` |

---

## POST `/api/events/verify-registration`

Verifies a registration by dual-key (rid + email) for the pending-payment page.

**Rate Limit:** 60 requests/minute/IP  
**Auth:** Dual-key (rid + email)

### Request Body

```json
{
  "rid": "uuid",
  "email": "user@example.com"
}
```

### Success Response (200)

```json
{
  "ok": true,
  "id": "uuid",
  "fullName": "John Doe",
  "paymentAmount": 500,
  "paymentCurrency": "NPR",
  "expiresAt": "2026-07-27T12:00:00Z",
  "status": "pending",
  "paymentStatus": "unpaid",
  "eventName": "Annual Conference 2026",
  "eventSlug": "annual-conference-2026",
  "ticketName": "Regular",
  "expired": false
}
```

### Error Responses

| Status | Error |
|--------|-------|
| 400 | `"rid and email are required"` |
| 400 | `"Valid email is required"` |
| 404 | `"Registration not found or email does not match."` |
| 429 | `"Too many requests"` |

---

## POST `/api/events/resend-payment-link`

Resends the payment link email. Returns the link in the response even if email fails.

**Rate Limit:** 5 requests/60min/IP **AND** 3 requests/60min/registration  
**Auth:** Dual-key (registrationId + email)

### Request Body

```json
{
  "registrationId": "uuid",
  "email": "user@example.com"
}
```

### Success Response (200)

```json
{
  "ok": true,
  "message": "Payment link has been sent to user@example.com.",
  "paymentLink": "https://deessafoundation.com/events/my-event/register/pending-payment?rid=xxx&email=xxx"
}
```

When no email template is configured:
```json
{
  "ok": true,
  "message": "Payment link generated. Please use the link directly (email template not configured).",
  "paymentLink": "https://..."
}
```

### Error Responses

| Status | Error |
|--------|-------|
| 400 | `"registrationId and email are required."` |
| 400 | `"This registration has expired."` |
| 404 | `"Registration not found or email does not match."` |
| 429 | `"Too many requests"` or `"Too many resend attempts for this registration."` |

---

## POST `/api/webhooks/stripe`

Stripe webhook handler. Processes events for donations, conference registrations, and event registrations.

**Rate Limit:** None (Stripe manages retries)  
**Auth:** Stripe HMAC signature verification

### Headers

| Header | Required |
|--------|----------|
| `stripe-signature` | Yes |

### Handled Events

| Event | Behavior |
|-------|----------|
| `checkout.session.completed` | Confirms donation/conference/event registration |
| `checkout.session.expired` | Marks donation as failed |
| `payment_intent.payment_failed` | Marks donation as failed |
| `invoice.payment_succeeded` | Confirms subscription donation |
| `invoice.payment_failed` | Marks subscription donation as failed |

### Response (always 200 on success)

```json
{ "received": true }
```

---

## POST `/api/payments/khalti/verify`

Verifies a Khalti payment callback.

**Rate Limit:** 10 requests/minute/IP  
**Auth:** Khalti API verification

### Request Body

```json
{
  "pidx": "H3gdN3V3w9e7Bf",
  "purchase_order_id": "optional-donation-id"
}
```

### Success Responses

| Status | Scenario | Body |
|--------|----------|------|
| 200 | Confirmed | `{ok: true, status: "completed", khaltiStatus: "Completed", amount: 500}` |
| 200 | Already processed | `{ok: true, status: "completed", message: "Transaction already processed"}` |
| 200 | Processing | `{ok: true, status: "processing", message: "Payment is still pending"}` |
| 200 | Failed | `{ok: false, status: "failed", message: "Payment previously failed"}` |

### Error Responses

| Status | Error |
|--------|-------|
| 400 | `"Missing or invalid pidx"` |
| 400 | Khalti API error |
| 404 | `"Payment record not found"` |
| 429 | `"Rate limit exceeded"` |
| 500 | `"Server configuration error"` |
| 502 | `"Failed to connect to Khalti"` |

---

## GET `/api/payments/esewa/success?data={base64}`

eSewa callback handler. Decodes, verifies, and redirects.

**Rate Limit:** 20 requests/minute/IP  
**Auth:** HMAC-SHA256 signature verification

### Query Parameters

| Param | Required | Description |
|-------|----------|-------------|
| `data` | Yes | Base64-encoded eSewa response JSON |
| `mock` | No | `"1"` for test mode (blocked in production) |

### Redirect Targets

| Scenario | Redirect |
|----------|----------|
| Event success | `/events/{slug}/register/payment-success?rid={rid}&paid=1` |
| Event amount mismatch | `/events/{slug}/register/payment-success?rid={rid}&status=review` |
| Event signature invalid | `/events/{slug}/register/failure?rid={rid}&reason=invalid_signature` |
| Event status incomplete | `/events/{slug}/register/payment-success?rid={rid}&status=failed` |
| Donation success | `/donate/success?provider=esewa&...` |
| Donation failure | `/donate/cancel?provider=esewa&reason=...` |

### Error Responses (non-redirect)

| Status | Error |
|--------|-------|
| 400 | `"Missing response data"` |
| 400 | `"Invalid response data"` |
| 400 | `"Mock mode disabled in production"` |
| 404 | `"Donation not found"` |
| 429 | `"Rate limit exceeded"` |
