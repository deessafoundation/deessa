---
title: "Authentication"
description: "Deessa Foundation uses Supabase Auth for user authentication and session management. The API supports multiple authen..."
owner: "Deessa Team"
status: reference
category: reference
audience: admin
last_updated: 2026-09-12
---
# Authentication

## Overview

Deessa Foundation uses Supabase Auth for user authentication and session management. The API supports multiple authentication methods depending on the endpoint.

## Authentication Methods

### 1. Supabase JWT Token (Primary)

Used for user-facing and admin endpoints.

```http
Authorization: Bearer <supabase_jwt>
```

**Token Source:**
- Browser: Supabase JS client manages tokens automatically
- Mobile/External: Obtain via `/auth/v1/token?grant_type=password`

**Token Lifecycle:**
- Access token: 1 hour expiry
- Refresh token: 30 days expiry
- Tokens auto-refresh via Supabase client

### 2. Service Role Key (Internal)

Used for webhook handlers and background jobs. Bypasses RLS.

```http
X-API-Key: <supabase_service_role_key>
```

**Usage:**
- Webhook endpoints (Stripe, Khalti, eSewa)
- Cron jobs
- Server-to-server calls

### 3. Provider Signatures (Webhooks)

Used for payment provider webhooks. Verified via provider SDK.

| Provider | Header | Verification |
|----------|--------|--------------|
| Stripe | `Stripe-Signature` | Stripe SDK signature verification |
| Khalti | `Authorization` | API key validation |
| eSewa | Query param `data` | HMAC-SHA256 signature |

### 4. Token-based (Receipts)

Used for public receipt access. Stateless JWT tokens.

```http
GET /api/receipts/download?token=<jwt_token>
```

**Token Properties:**
- 7-day expiry
- Contains `donationId` and `email`
- Signed with application secret

## Auth Flows

### User Registration

```
POST /auth/v1/signup
Body: { email, password, ... }
Response: { user, session }
```

### User Login

```
POST /auth/v1/token?grant_type=password
Body: { email, password }
Response: { access_token, refresh_token, ... }
```

### Token Refresh

```
POST /auth/v1/token?grant_type=refresh_token
Body: { refresh_token }
Response: { access_token, refresh_token, ... }
```

### Logout

```
POST /auth/v1/logout
Header: Authorization: Bearer <token>
```

## Admin Authentication

Admin endpoints require additional role verification:

1. User must be authenticated (valid JWT)
2. User must exist in `admin_users` table
3. Admin account must be active (`is_active = true`)
4. Role must have required permissions

### Admin Roles

| Role | Permissions |
|------|-------------|
| `SUPER_ADMIN` | Full access to all endpoints |
| `ADMIN` | Standard admin operations |
| `VIEWER` | Read-only access |

### Role Check Flow

```
Request â†’ Validate JWT â†’ Check admin_users â†’ Verify role â†’ Allow/Deny
```

## Endpoint Auth Requirements

| Endpoint | Auth Required | Role Required |
|----------|---------------|---------------|
| `GET /api/health` | No | - |
| `POST /api/support/submit` | No | - |
| `GET /api/events/*` | No | - |
| `POST /api/events/*` | No | - |
| `GET /api/payments/*/status` | No | - |
| `POST /api/webhooks/*` | Provider auth | - |
| `GET /api/admin/*` | Yes | Admin |
| `POST /api/admin/*` | Yes | Admin |
| `GET /api/receipts/*` | Token | - |
| `POST /api/receipts/resend` | Yes | - |

## Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "MISSING_AUTH_TOKEN"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Forbidden",
  "error": "INSUFFICIENT_PERMISSIONS"
}
```

### 401 Invalid Token

```json
{
  "success": false,
  "message": "Invalid or expired token",
  "error": "INVALID_TOKEN"
}
```

## Security Best Practices

1. **Never expose tokens in URLs** - Use Authorization header
2. **Use HTTPS** - All production requests must use TLS
3. **Validate tokens server-side** - Never trust client-decoded tokens
4. **Implement token refresh** - Handle expired tokens gracefully
5. **Log auth failures** - Monitor for brute force attempts
6. **Use RLS** - Row Level Security enforced at database level
