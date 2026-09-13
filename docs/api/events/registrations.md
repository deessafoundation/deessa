---
title: "Events - Registrations API"
description: "The Events Registrations API handles event registration, payment initiation, and status checking."
owner: "Deesha Team"
status: reference
category: reference
audience: admin
last_updated: 2026-09-12
---
# Events - Registrations API

## Overview

The Events Registrations API handles event registration, payment initiation, and status checking.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/events/start-payment` | Initiate payment session |
| POST | `/api/events/verify-registration` | Verify registration |
| POST | `/api/events/confirm-stripe-session` | Confirm Stripe payment |
| GET | `/api/events/status` | Check registration status |
| POST | `/api/events/resend-payment-link` | Resend payment link |
| POST | `/api/events/upload-payment-screenshot` | Upload payment proof |

---

## Start Payment

### Endpoint

```
POST /api/events/start-payment
```

### Description

Creates a payment session with the chosen provider (Stripe/Khalti/eSewa). Called by the pending-payment page when the user clicks "Pay Now".

### Authentication

Required: No

### Rate Limiting

10 requests per minute per IP

### Request Headers

```http
Content-Type: application/json
X-Forwarded-For: <ip>
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `registrationId` | string | Yes | Registration UUID |
| `email` | string | Yes | Registrant email (dual-key verification) |
| `provider` | string | Yes | `stripe`, `khalti`, or `esewa` |

### Success Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://checkout.stripe.com/...",
    "provider": "stripe",
    "sessionId": "cs_xxx"
  }
}
```

### Error Responses

**400 Bad Request**

```json
{
  "success": false,
  "message": "Invalid provider"
}
```

**404 Not Found**

```json
{
  "success": false,
  "message": "Registration not found"
}
```

**429 Too Many Requests**

```json
{
  "success": false,
  "message": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

## Verify Registration

### Endpoint

```
POST /api/events/verify-registration
```

### Description

Verifies a registration exists and returns its details.

### Authentication

Required: No

### Request Headers

```http
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rid` | string | Yes | Registration UUID |
| `email` | string | Yes | Registrant email |

### Success Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "eventId": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "status": "pending",
    "paymentStatus": "unpaid",
    "paymentAmount": 5000,
    "paymentCurrency": "NPR"
  }
}
```

---

## Confirm Stripe Session

### Endpoint

```
POST /api/events/confirm-stripe-session
```

### Description

Confirms a Stripe payment session for event registration. Called by the payment-success page after Stripe redirects back.

### Authentication

Required: No

### Rate Limiting

20 requests per minute per IP

### Request Headers

```http
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rid` | string | Yes | Registration UUID |
| `sessionId` | string | Yes | Stripe session ID |

### Success Response

**200 OK**

```json
{
  "success": true,
  "status": "confirmed",
  "registration": {
    "id": "uuid",
    "status": "confirmed",
    "paymentStatus": "paid"
  }
}
```

---

## Check Registration Status

### Endpoint

```
GET /api/events/status
```

### Description

Checks the current status of an event registration.

### Authentication

Required: No

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `registrationId` | string | Yes | Registration UUID |
| `email` | string | Yes | Registrant email |

### Success Response

**200 OK**

```json
{
  "success": true,
  "status": "confirmed",
  "registration": {
    "id": "uuid",
    "status": "confirmed",
    "paymentStatus": "paid",
    "checkedInAt": null
  }
}
```

---

## Resend Payment Link

### Endpoint

```
POST /api/events/resend-payment-link
```

### Description

Resends the payment link to the registrant's email.

### Authentication

Required: No

### Request Headers

```http
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `registrationId` | string | Yes | Registration UUID |
| `email` | string | Yes | Registrant email |

### Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Payment link resent"
}
```

---

## Upload Payment Screenshot

### Endpoint

```
POST /api/events/upload-payment-screenshot
```

### Description

Uploads a payment screenshot for manual verification (bank transfer).

### Authentication

Required: No

### Request Headers

```http
Content-Type: multipart/form-data
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `registrationId` | string | Yes | Registration UUID |
| `email` | string | Yes | Registrant email |
| `screenshot` | file | Yes | Image file (max 5MB) |

### Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Screenshot uploaded for verification"
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `REGISTRATION_NOT_FOUND` | 404 | Registration does not exist |
| `EMAIL_MISMATCH` | 403 | Email does not match registration |
| `PAYMENT_FAILED` | 400 | Payment session creation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INVALID_PROVIDER` | 400 | Payment provider not supported |

---

## Notes

- Dual-key identity check (registrationId + email) for security
- In-memory rate limiting (10 requests per minute per IP)
- Payment sessions expire after 15 minutes
- Bank transfer screenshots require manual admin verification
