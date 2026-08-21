---
title: "Receipts API"
description: "The Receipts API handles receipt downloading and resending for confirmed donations."
owner: "Deesha Team"
status: reference
category: reference
audience: admin
last_updated: 2026-09-12
---
# Receipts API

## Overview

The Receipts API handles receipt downloading and resending for confirmed donations.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/receipts/download` | Download receipt |
| POST | `/api/receipts/resend` | Resend receipt email |

---

## Download Receipt

### Endpoint

```
GET /api/receipts/download
```

### Description

Downloads a receipt as PDF or HTML. Requires a valid JWT token.

### Authentication

Required: Yes (via query token)

### Rate Limiting

10 requests per minute per IP

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `token` | string | Yes | - | JWT authentication token |
| `format` | string | No | `pdf` | Output format: `pdf` or `html` |

### Token Payload

```json
{
  "donationId": "uuid",
  "email": "donor@example.com",
  "exp": 1691234567
}
```

### Success Response

**200 OK**

Content-Type: `application/pdf` or `text/html`

```http
Content-Disposition: attachment; filename="receipt-RCP-2026-00001.pdf"
```

Body: PDF or HTML content

### Error Responses

**401 Unauthorized**

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**404 Not Found**

```json
{
  "success": false,
  "message": "Receipt not found"
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

## Resend Receipt

### Endpoint

```
POST /api/receipts/resend
```

### Description

Resends the receipt email to the donor.

### Authentication

Required: Yes

### Rate Limiting

5 requests per minute per user

### Request Headers

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `donationId` | string | Yes | Donation UUID |
| `email` | string | Yes | Donor email address |

### Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Receipt email sent successfully"
}
```

### Error Responses

**401 Unauthorized**

```json
{
  "success": false,
  "message": "Authentication required"
}
```

**403 Forbidden**

```json
{
  "success": false,
  "message": "Email does not match donation"
}
```

**404 Not Found**

```json
{
  "success": false,
  "message": "Donation not found"
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

## Receipt Number Format

Receipt numbers follow the format: `RCP-YYYY-NNNNN`

- `YYYY` - Year (resets annually)
- `NNNNN` - 5-digit zero-padded sequence

Example: `RCP-2026-00001`

---

## Security

- JWT tokens expire after 7 days
- Tokens are single-use (consumed on download)
- No sequential receipt enumeration possible
- Rate limiting prevents brute force attacks

---

## Notes

- PDF generation uses server-side rendering
- HTML format available for preview
- Receipts include donation details and payment verification
- Admin can resend receipts via admin panel
