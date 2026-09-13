---
title: "API Conventions"
description: "This document defines the standard patterns used across all Deesha Foundation API endpoints."
owner: "Deesha Team"
status: reference
category: reference
audience: admin
last_updated: 2026-09-12
---
# API Conventions

This document defines the standard patterns used across all Deesha Foundation API endpoints.

## Response Format

### Success Response

All successful responses follow this structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error Response

All error responses follow this structure:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists"
    }
  ]
}
```

## HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PATCH, or DELETE with response body |
| 201 | Created | Successful POST that creates a resource |
| 204 | No Content | Successful DELETE with no response body |
| 400 | Bad Request | Validation error, invalid input |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Resource already exists (duplicate) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | System unhealthy or maintenance |

## Pagination

List endpoints support offset-based pagination:

```
GET /api/donations?page=0&limit=25
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 0 | Page number (0-indexed) |
| `limit` | number | 25 | Items per page (max 100) |

### Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 0,
    "limit": 25,
    "total": 140,
    "totalPages": 6
  }
}
```

## Sorting

```
GET /api/donations?sort=created_at
GET /api/donations?sort=-created_at
```

- Prefix `-` for descending order
- Default: `created_at` descending

## Filtering

```
GET /api/donations?status=completed&currency=NPR
GET /api/events?status=published&category=conference
```

Filter parameters are endpoint-specific. See individual endpoint documentation for available filters.

## Naming Conventions

### URLs

- Use nouns, not verbs
- Use lowercase with hyphens for multi-word paths
- Use plural nouns for collections

| Good | Bad |
|------|-----|
| `GET /api/events` | `GET /api/getEvents` |
| `GET /api/events/:id` | `GET /api/fetchEvent` |
| `POST /api/events` | `POST /api/createEvent` |
| `DELETE /api/events/:id` | `POST /api/deleteEvent` |

### Request/Response Fields

- Use camelCase for JSON field names
- Use snake_case for database column names
- Dates in ISO 8601 format: `2026-08-05T14:30:00Z`

## Authentication

### Supabase Auth (Session-based)

Most endpoints use Supabase Auth with JWT tokens:

```http
Authorization: Bearer <supabase_jwt_token>
```

### API Key (Service-to-service)

Internal endpoints use API keys:

```http
X-API-Key: <api_key>
```

### Webhook Signatures

Payment webhooks verify signatures:

```http
Stripe-Signature: t=...,v1=...
```

## Roles & Permissions

| Role | Description | Access Level |
|------|-------------|--------------|
| `SUPER_ADMIN` | Full system access | All endpoints |
| `ADMIN` | Standard admin access | Most admin endpoints |
| `VIEWER` | Read-only admin access | GET requests only |
| `authenticated` | Logged-in user | User-specific endpoints |
| `anon` | Unauthenticated | Public endpoints only |

## Request Headers

### Required

```http
Content-Type: application/json
```

### Optional

```http
Authorization: Bearer <token>
X-Request-ID: <uuid>         # For request tracing
X-Forwarded-For: <ip>        # Rate limiting
```

## Rate Limiting

Rate limits are applied per IP address for public endpoints.

### Headers

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed in window |
| `X-RateLimit-Remaining` | Requests remaining in window |
| `X-RateLimit-Reset` | Unix timestamp when window resets |
| `Retry-After` | Seconds to wait (on 429 response) |

### Rate Limit Tiers

| Tier | Limit | Window | Endpoints |
|------|-------|--------|-----------|
| High | 60 req | 1 min | Health, status checks |
| Medium | 30 req | 1 min | Public data reads |
| Low | 10 req | 1 min | Payment operations |
| Strict | 5 req | 1 min | Receipt operations |

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `DUPLICATE_RESOURCE` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `PAYMENT_FAILED` | 400 | Payment processing failed |
| `AMOUNT_MISMATCH` | 400 | Payment amount mismatch |
| `CURRENCY_MISMATCH` | 400 | Payment currency mismatch |
| `INVALID_SIGNATURE` | 401 | Webhook signature invalid |
| `PROVIDER_ERROR` | 502 | Payment provider error |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Idempotency

Payment endpoints support idempotency via event IDs:

```
POST /api/webhooks/stripe
Body includes: { "id": "evt_xxx" }
```

Duplicate event IDs are detected and return `200 OK` without reprocessing.

## CORS

Cross-origin requests are allowed for:

- `https://deesha.org`
- `https://*.deesha.org`
- `http://localhost:3000` (development)

## Content Types

| Content Type | Usage |
|--------------|-------|
| `application/json` | Request and response bodies |
| `multipart/form-data` | File uploads |
| `application/pdf` | Receipt downloads |
| `text/html` | Receipt HTML preview |
