---
title: "Donations API"
description: "The Donations API handles payment verification, status checking, and receipt generation for donations."
owner: "deessa Team"
status: reference
category: reference
audience: developer
last_updated: 2026-09-12
---
# Donations API

## Overview

The Donations API handles payment verification, status checking, and receipt generation for donations.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments/stripe/verify` | Verify Stripe payment |
| GET | `/api/payments/stripe/status` | Check Stripe status |
| GET | `/api/payments/khalti/verify` | Verify Khalti payment |
| GET | `/api/payments/khalti/status` | Check Khalti status |
| GET | `/api/payments/esewa/success` | eSewa success callback |
| GET | `/api/payments/esewa/failure` | eSewa failure callback |
| GET | `/api/payments/esewa/status` | Check eSewa status |

---

## Stripe Verify

### Endpoint

```
GET /api/payments/stripe/verify
```

### Description

Verifies a Stripe payment and confirms the donation.

### Authentication

Required: No

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `session_id` | string | Yes | Stripe checkout session ID |

### Success Response

**200 OK**

```json
{
  "success": true,
  "status": "confirmed",
  "donation": {
    "id": "uuid",
    "amount": 100,
    "currency": "USD",
    "payment_status": "confirmed",
    "receipt_number": "RCP-2026-00001",
    "receipt_url": "https://..."
  }
}
```

### Error Responses

**400 Bad Request**

```json
{
  "success": false,
  "message": "Invalid session ID"
}
```

**404 Not Found**

```json
{
  "success": false,
  "message": "Donation not found"
}
```

---

## Stripe Status

### Endpoint

```
GET /api/payments/stripe/status
```

### Description

Checks the current status of a Stripe payment.

### Authentication

Required: No

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `session_id` | string | Yes | Stripe checkout session ID |

### Success Response

**200 OK**

```json
{
  "success": true,
  "status": "confirmed",
  "donation": {
    "id": "uuid",
    "amount": 100,
    "currency": "USD",
    "payment_status": "confirmed",
    "receipt_number": "RCP-2026-00001",
    "receipt_url": "https://..."
  }
}
```

---

## Khalti Verify

### Endpoint

```
GET /api/payments/khalti/verify
```

### Description

Verifies a Khalti payment via server-side API call.

### Authentication

Required: No

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pidx` | string | Yes | Khalti payment identifier |

### Success Response

**200 OK**

```json
{
  "success": true,
  "status": "confirmed",
  "donation": {
    "id": "uuid",
    "amount": 5000,
    "currency": "NPR",
    "payment_status": "confirmed",
    "receipt_number": "RCP-2026-00002"
  }
}
```

---

## Khalti Status

### Endpoint

```
GET /api/payments/khalti/status
```

### Description

Checks the current status of a Khalti payment.

### Authentication

Required: No

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pidx` | string | Yes | Khalti payment identifier |

---

## eSewa Success Callback

### Endpoint

```
GET /api/payments/esewa/success
```

### Description

Handles eSewa payment success callback. Redirects to donation success page.

### Authentication

Required: No

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `data` | string | Yes | Base64-encoded callback data |

### Decoded Data Structure

```json
{
  "transaction_code": "000ABC123",
  "status": "COMPLETE",
  "total_amount": 1000,
  "transaction_uuid": "timestamp-donation-uuid",
  "product_code": "MERCHANT_ID",
  "signed_field_names": "total_amount,transaction_uuid,product_code",
  "signature": "base64-hmac-signature"
}
```

### Success Response

**302 Redirect**

```
/donate/success?donation_id={id}&status=confirmed
```

### Error Response

**302 Redirect**

```
/donate/success?donation_id={id}&status=failed&error={message}
```

---

## eSewa Failure Callback

### Endpoint

```
GET /api/payments/esewa/failure
```

### Description

Handles eSewa payment failure callback. Redirects to donation failure page.

### Query Parameters

Same as success callback.

### Response

**302 Redirect**

```
/donate/success?donation_id={id}&status=failed
```

---

## eSewa Status

### Endpoint

```
GET /api/payments/esewa/status
```

### Description

Checks the current status of an eSewa payment.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `transaction_uuid` | string | Yes | eSewa transaction UUID |

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_SIGNATURE` | 401 | Webhook signature verification failed |
| `AMOUNT_MISMATCH` | 400 | Payment amount does not match |
| `CURRENCY_MISMATCH` | 400 | Payment currency does not match |
| `NOT_FOUND` | 404 | Donation not found |
| `ALREADY_PROCESSED` | 200 | Payment already confirmed (idempotent) |

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Verify | 20 req | 1 min |
| Status | 30 req | 1 min |

---

## Notes

- Status endpoints are public (no auth required)
- Verify endpoints handle idempotency via event IDs
- eSewa uses server-side signature verification
- All providers support mock mode for testing
