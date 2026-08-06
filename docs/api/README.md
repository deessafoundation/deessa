# Deesha Foundation API Reference

## Overview

The Deesha Foundation API provides programmatic access to the donation management, event registration, payment processing, and admin systems. All endpoints follow RESTful conventions and return JSON responses.

## Base URL

```
Production:  https://deesha.org/api
Staging:     https://staging.deesha.org/api
Development: http://localhost:3000/api
```

## Quick Start

### 1. Authentication

Most endpoints require authentication via Supabase Auth. Include the session token in requests:

```http
Authorization: Bearer <session_token>
```

See [Authentication](./auth.md) for details.

### 2. Response Format

All endpoints return responses in a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

See [Conventions](./conventions.md) for the complete response specification.

### 3. Error Handling

Errors follow a standard format:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

## API Modules

| Module | Description | Auth Required |
|--------|-------------|---------------|
| [Auth](./auth.md) | User authentication & session management | Varies |
| [Donations](./donations/donations.md) | Payment verification & status | No (public) |
| [Receipts](./receipts/receipts.md) | Receipt download & resend | Yes |
| [Events](./events/registrations.md) | Event registration & payment | No (public) |
| [Conference](./conference/conference.md) | Conference registration flow | No (public) |
| [Webhooks](./webhooks/webhooks.md) | Payment provider webhooks | Provider auth |
| [Upload](./upload/upload.md) | File upload to storage | Admin |
| [Admin - Donations](./admin/donations.md) | Donation management | Admin |
| [Admin - Events](./admin/events.md) | Event management | Admin |
| [Admin - Notifications](./admin/notifications.md) | Notification system | Admin |
| [Admin - Support](./admin/support.md) | Support ticket management | Admin |
| [Admin - Settings](./admin/settings.md) | System configuration | Admin |
| [Admin - Content](./admin/content.md) | Stories & podcasts | Admin |
| [Cron](./cron/cron.md) | Scheduled background jobs | Service role |
| [Support](./support/support.md) | Public support submission | No |
| [Health](./health/health.md) | System health status | No (public) |

## Rate Limiting

Public endpoints are rate-limited to prevent abuse:

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Payment verification | 20 req | 1 min |
| Receipt download | 10 req | 1 min |
| Receipt resend | 5 req | 1 min |
| Status checks | 30 req | 1 min |
| Support submission | 5 req | 1 min |

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1691234567
Retry-After: 30
```

## Versioning

The API uses URL-based versioning:

```
/api/v1/...
/api/v2/...
```

Current version: **v1** (no prefix required)

## OpenAPI Specification

The complete API specification is available in [openapi.yaml](./openapi.yaml). Import this file into:

- [Swagger UI](https://editor.swagger.io/) for interactive documentation
- [Postman](https://www.postman.com/) for API testing
- Code generators for client SDKs

## Further Reading

- [Conventions](./conventions.md) - Response formats, pagination, sorting
- [Authentication](./auth.md) - Auth flows, tokens, roles
- [Error Codes](./conventions.md#error-codes) - Complete error code reference
