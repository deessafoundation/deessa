---
title: "Health API"
description: "The Health API provides system health status including database connectivity, payment configuration, and provider ava..."
owner: "deessa Team"
status: reference
category: reference
audience: admin
last_updated: 2026-09-12
---
# Health API

## Overview

The Health API provides system health status including database connectivity, payment configuration, and provider availability. Used for uptime monitoring and operational visibility.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | System health status |

---

## Health Check

### Endpoint

```
GET /api/health
```

### Description

Returns the current health status of the payment system and connected services.

### Authentication

Required: No (public)

### Request Headers

```http
Cache-Control: no-cache, no-store, must-revalidate
```

### Success Response

**200 OK** (healthy/degraded)

```json
{
  "status": "healthy",
  "timestamp": "2026-08-05T10:30:00Z",
  "checks": {
    "database": {
      "status": "pass",
      "message": "Database connection successful",
      "responseTime": 45
    },
    "paymentConfig": {
      "status": "pass",
      "message": "Payment configuration valid",
      "responseTime": 12
    },
    "providers": {
      "status": "pass",
      "message": "Stripe: available; Khalti: available; eSewa: configured",
      "responseTime": 150
    }
  },
  "responseTime": "207ms"
}
```

### Error Response

**503 Service Unavailable** (unhealthy)

```json
{
  "status": "unhealthy",
  "timestamp": "2026-08-05T10:30:00Z",
  "checks": {
    "database": {
      "status": "fail",
      "message": "Database connection failed",
      "responseTime": 5000
    },
    "paymentConfig": {
      "status": "warn",
      "message": "Payment configuration has 1 warning(s)",
      "responseTime": 10
    },
    "providers": {
      "status": "warn",
      "message": "Stripe: unavailable (timeout)",
      "responseTime": 5000
    }
  },
  "responseTime": "5010ms"
}
```

---

## Health Status Values

| Status | Description |
|--------|-------------|
| `healthy` | All checks passing |
| `degraded` | One or more checks warning |
| `unhealthy` | One or more checks failing |

## Check Results

| Check | Description |
|-------|-------------|
| `database` | Supabase database connectivity |
| `paymentConfig` | Payment environment variables |
| `providers` | Stripe, Khalti, eSewa availability |

## Check Status Values

| Status | Description |
|--------|-------------|
| `pass` | Check passed |
| `warn` | Check has warnings |
| `fail` | Check failed |

---

## Response Headers

```http
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

---

## Admin vs Public Response

| Caller | Response |
|--------|----------|
| Public | Status + timestamp only |
| Admin | Full details (checks, response times) |

---

## Monitoring

### Uptime Monitoring

Configure your uptime monitor to:

- Check `GET /api/health`
- Expect HTTP 200
- Alert on HTTP 503

### Example Monitors

- [UptimeRobot](https://uptimerobot.com/)
- [Better Stack](https://betterstack.com/)
- [Checkly](https://checklyhq.com/)

---

## Notes

- Health endpoint is public (no auth required)
- Response times included for admin users
- Cache disabled for real-time monitoring
- Checks run in parallel for fast response
- Provider checks verify configuration, not API connectivity
