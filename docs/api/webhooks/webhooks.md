# Webhooks API

## Overview

Webhook endpoints receive notifications from payment providers (Stripe, Khalti, eSewa). These endpoints are called by the providers, not by your application.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/stripe` | Stripe webhook handler |
| GET | `/api/webhooks/stripe/test` | Test Stripe diagnostics |
| POST | `/api/webhooks/khalti` | Khalti webhook handler |

---

## Stripe Webhook

### Endpoint

```
POST /api/webhooks/stripe
```

### Description

Handles Stripe webhook events for payment confirmation.

### Authentication

Required: Yes (Stripe signature)

### Headers

```http
Stripe-Signature: t=1691234567,v1=abc123...
Content-Type: application/json
```

### Supported Events

| Event | Description |
|-------|-------------|
| `checkout.session.completed` | One-time payment completed |
| `invoice.payment_succeeded` | Subscription payment succeeded |

### Request Body

Stripe event JSON (automatically parsed by Stripe SDK)

### Success Response

**200 OK**

```json
{
  "received": true
}
```

### Error Responses

**400 Bad Request**

```json
{
  "error": "Invalid signature"
}
```

**500 Internal Server Error**

```json
{
  "error": "Internal server error"
}
```

### Processing Flow

1. Verify webhook signature
2. Extract donation ID from session
3. Check idempotency (event already processed?)
4. Verify amount and currency
5. Update donation status
6. Generate receipt (async)
7. Send confirmation email

---

## Stripe Test Diagnostics

### Endpoint

```
GET /api/webhooks/stripe/test
```

### Description

Diagnostic endpoint for verifying Stripe webhook configuration. Returns boolean flags indicating which environment variables are configured.

### Authentication

Required: Yes (Admin)

### Request Headers

```http
Authorization: Bearer <token>
```

### Success Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "stripeSecretKey": true,
    "webhookSecret": true,
    "paymentMode": "live",
    "nodeEnv": "production"
  }
}
```

---

## Khalti Webhook

### Endpoint

```
POST /api/webhooks/khalti
```

### Description

Handles Khalti webhook events for payment confirmation.

### Authentication

Required: Yes (Khalti API key)

### Headers

```http
Authorization: <khalti_api_key>
Content-Type: application/json
```

### Request Body

```json
{
  "pidx": "abc123",
  "total_amount": 100000,
  "status": "Completed",
  "transaction_id": "tx_123",
  "purchase_order_id": "donation-uuid",
  "purchase_order_name": "Donation",
  "fee": 1000,
  "refunded": false
}
```

### Success Response

**200 OK**

```json
{
  "received": true
}
```

### Processing Flow

1. Verify API key
2. Look up transaction via Khalti API
3. Verify transaction status is `Completed`
4. Extract donation ID from `purchase_order_id`
5. Process payment (same as Stripe flow)

---

## eSewa Callback

eSewa uses redirect-based callbacks (not webhooks):

- **Success:** `GET /api/payments/esewa/success?data=<base64>`
- **Failure:** `GET /api/payments/esewa/failure?data=<base64>`

See [Donations API](../donations/donations.md) for details.

---

## Idempotency

All webhook handlers implement idempotency:

- Event IDs are stored in `payment_events` table
- Duplicate events return `200 OK` without reprocessing
- Prevents duplicate donations from webhook retries

## Retry Behavior

Payment providers retry failed webhooks:

| Provider | Retry Period | Max Retries |
|----------|--------------|-------------|
| Stripe | 3 days | ~15 |
| Khalti | 24 hours | 3 |

## Security

- Stripe: Signature verification using `stripe-signature` header
- Khalti: API key authentication
- eSewa: HMAC-SHA256 signature with timing-safe comparison

## Notes

- Webhook endpoints use service role client (bypasses RLS)
- Return `200 OK` quickly to prevent provider retries
- Process payment confirmation asynchronously
- Log all webhook events for debugging
