---
title: "Conference API"
description: "The Conference API handles conference registration, payment, and status checking. This is separate from the Events mo..."
owner: "Deesha Team"
status: reference
category: reference
audience: developer
last_updated: 2026-09-12
---
# Conference API

## Overview

The Conference API handles conference registration, payment, and status checking. This is separate from the Events module and uses its own database tables.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/conference/start-payment` | Initiate payment |
| POST | `/api/conference/verify-registration` | Verify registration |
| POST | `/api/conference/confirm-stripe-session` | Confirm Stripe payment |
| GET | `/api/conference/status` | Check registration status |
| POST | `/api/conference/resend-payment-link` | Resend payment link |

---

## Start Payment

### Endpoint

```
POST /api/conference/start-payment
```

### Description

Creates a payment session for conference registration.

### Authentication

Required: No

### Rate Limiting

10 requests per minute per IP

### Request Headers

```http
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `registrationId` | string | Yes | Registration UUID |
| `email` | string | Yes | Registrant email |
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

---

## Verify Registration

### Endpoint

```
POST /api/conference/verify-registration
```

### Description

Verifies a conference registration exists.

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
  "data": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "status": "pending",
    "paymentStatus": "unpaid",
    "paymentAmount": 10000,
    "paymentCurrency": "NPR"
  }
}
```

---

## Confirm Stripe Session

### Endpoint

```
POST /api/conference/confirm-stripe-session
```

### Description

Confirms a Stripe payment for conference registration.

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

## Check Status

### Endpoint

```
GET /api/conference/status
```

### Description

Checks conference registration status.

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
    "paymentStatus": "paid"
  }
}
```

---

## Resend Payment Link

### Endpoint

```
POST /api/conference/resend-payment-link
```

### Description

Resends payment link to registrant.

### Authentication

Required: No

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

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `REGISTRATION_NOT_FOUND` | 404 | Registration does not exist |
| `EMAIL_MISMATCH` | 403 | Email does not match |
| `PAYMENT_FAILED` | 400 | Payment session creation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

---

## Notes

- Conference uses separate `conference_registrations` table
- Same payment providers as Events module
- Dual-key identity check for security
- Rate limited to 10 requests per minute per IP
