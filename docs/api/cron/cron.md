---
title: "Cron Jobs API"
description: "Cron endpoints are internal API routes that run scheduled background jobs. These should only be called by your applic..."
owner: "Deesha Team"
status: reference
category: reference
audience: developer
last_updated: 2026-09-12
---
# Cron Jobs API

## Overview

Cron endpoints are internal API routes that run scheduled background jobs. These should only be called by your application's scheduler or monitoring system.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cron/reconcile-payments` | Reconcile payment status |
| GET | `/api/cron/expire-conference-registrations` | Expire unpaid registrations |
| GET | `/api/cron/check-stuck-donations` | Check stuck donations |
| GET | `/api/cron/check-failure-rates` | Check receipt/email failure rates |
| GET | `/api/cron/check-review-escalations` | Check review escalations |

---

## Authentication

All cron endpoints require service role authentication:

```http
X-API-Key: <supabase_service_role_key>
```

---

## Reconcile Payments

### Endpoint

```
GET /api/cron/reconcile-payments
```

### Description

Reconciles payment status with payment providers. Checks pending payments and updates status.

### Schedule

Run every 5 minutes

### Success Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "checked": 12,
    "confirmed": 10,
    "failed": 1,
    "pending": 1
  }
}
```

---

## Expire Conference Registrations

### Endpoint

```
GET /api/cron/expire-conference-registrations
```

### Description

Expires unpaid conference registrations past their expiration time.

### Schedule

Run every 15 minutes

### Success Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "expired": 5
  }
}
```

---

## Check Stuck Donations

### Endpoint

```
GET /api/cron/check-stuck-donations
```

### Description

Identifies donations stuck in `pending` status for too long.

### Schedule

Run every hour

### Success Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "stuckCount": 2,
    "donations": [
      {
        "id": "uuid",
        "created_at": "2026-08-05T10:00:00Z",
        "hoursStuck": 3
      }
    ]
  }
}
```

---

## Check Failure Rates

### Endpoint

```
GET /api/cron/check-failure-rates
```

### Description

Monitors receipt generation and email sending failure rates.

### Schedule

Run every hour

### Success Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "receiptFailures": 3,
    "emailFailures": 1,
    "alertThreshold": 5,
    "shouldAlert": false
  }
}
```

---

## Check Review Escalations

### Endpoint

```
GET /api/cron/check-review-escalations
```

### Description

Identifies donations in review status that need escalation.

### Schedule

Run every 30 minutes

### Success Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "escalated": 2,
    "donations": [
      {
        "id": "uuid",
        "hoursInReview": 24,
        "escalatedTo": "super_admin"
      }
    ]
  }
}
```

---

## Scheduling

### Vercel Cron

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/reconcile-payments",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/expire-conference-registrations",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/check-stuck-donations",
      "schedule": "0 * * * *"
    }
  ]
}
```

### External Scheduler

Use a service like GitHub Actions, cron-job.org, or Upstash QStash.

---

## Notes

- Cron endpoints use service role authentication
- They bypass RLS for database access
- Return 200 OK even on partial failures
- Log all operations for monitoring
- Set up alerts for repeated failures
