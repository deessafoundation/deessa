---
title: "Support API"
description: "The Support API handles public support ticket submissions from the website's contact/support page."
owner: "deessa Team"
status: reference
category: reference
audience: admin
last_updated: 2026-09-12
---
# Support API

## Overview

The Support API handles public support ticket submissions from the website's contact/support page.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/support/submit` | Submit support ticket |

---

## Submit Support Ticket

### Endpoint

```
POST /api/support/submit
```

### Description

Submits a new support ticket from the public support form.

### Authentication

Required: No

### Rate Limiting

5 requests per minute per IP

### Request Headers

```http
Content-Type: multipart/form-data
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject` | string | Yes | Ticket subject |
| `email` | string | Yes | Contact email |
| `phone` | string | No | Contact phone |
| `category` | string | Yes | `payment`, `registration`, `general`, `other` |
| `priority` | string | No | `low`, `medium`, `high` (default: `medium`) |
| `message` | string | Yes | Detailed message |
| `attachments` | file[] | No | Up to 3 files (max 5MB each) |

### Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Support ticket submitted successfully",
  "data": {
    "ticketId": "uuid",
    "referenceNumber": "TKT-2026-00001"
  }
}
```

### Error Responses

**400 Bad Request**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
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

**500 Internal Server Error**

```json
{
  "success": false,
  "message": "An unexpected error occurred. Please try again."
}
```

---

## Ticket Number Format

Ticket numbers follow the format: `TKT-YYYY-NNNNN`

- `YYYY` - Year
- `NNNNN` - 5-digit zero-padded sequence

Example: `TKT-2026-00001`

---

## File Upload

### Supported Formats

- Images: JPG, PNG, GIF, WebP
- Documents: PDF, DOC, DOCX
- Maximum size: 5MB per file
- Maximum files: 3

### Storage

Files are stored in Supabase Storage with the following structure:

```
support-attachments/
â””â”€â”€ {ticket-id}/
    â”œâ”€â”€ file1.pdf
    â”œâ”€â”€ screenshot.png
    â””â”€â”€ document.docx
```

---

## Categories

| Category | Description |
|----------|-------------|
| `payment` | Payment issues, refunds, failed transactions |
| `registration` | Event/conference registration problems |
| `general` | General inquiries |
| `other` | Other topics |

---

## Notifications

When a ticket is submitted:

1. Confirmation email sent to submitter
2. Admin notification created
4. Ticket added to admin dashboard

---

## Notes

- Tickets are public submissions (no auth required)
- Rate limited to 5 requests per minute per IP
- File uploads are virus-scanned
- Auto-confirmation email sent to submitter
- Admin can manage tickets via admin panel
