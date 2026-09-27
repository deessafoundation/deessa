---
title: "Event Payment Integration â€” Troubleshooting"
description: "Cause: No payment providers are configured or their env vars are missing."
owner: "Deessa Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Event Payment Integration â€” Troubleshooting

## Common Issues

### 1. "No payment methods are currently available"

**Cause**: No payment providers are configured or their env vars are missing.

**Fix**:
1. Check that at least one provider's env vars are set (see [07-configuration.md](./07-configuration.md))
2. Verify in Supabase: `SELECT * FROM site_settings WHERE key = 'payments'`
3. Check server logs for `"Payment settings load failed"` warnings

---

### 2. "Payment is already being processed"

**Cause**: The registration's `payment_initiated_at` is already set (another request claimed the lock).

**Fix**:
- Wait 30 seconds and try again (the lock may have been from a previous attempt)
- If persistent, the registration may be stuck. Admin can reset:
  ```sql
  UPDATE event_registrations
  SET payment_initiated_at = NULL
  WHERE id = 'registration-id'
    AND payment_status = 'unpaid';
  ```

---

### 3. Registration stuck in `payment_status = "review"`

**Cause**: Amount mismatch detected between expected and paid amounts.

**Fix**:
1. Check `payment_review_at` timestamp
2. Compare `payment_amount` with the provider's actual charge
3. If legitimate:
   ```sql
   UPDATE event_registrations
   SET payment_status = 'paid', payment_paid_at = NOW()
   WHERE id = 'registration-id';
   ```
4. If fraudulent, cancel:
   ```sql
   UPDATE event_registrations
   SET payment_status = 'failed', status = 'cancelled'
   WHERE id = 'registration-id';
   ```

---

### 4. sold_count is wrong (too high or too low)

**Cause**: Race condition during registration or cancellation.

**Fix**:
```sql
-- Recalculate sold_count from actual registrations
UPDATE event_ticket_types tt
SET sold_count = (
  SELECT COUNT(*)
  FROM event_registrations er
  WHERE er.ticket_type_id = tt.id
    AND er.status != 'cancelled'
    AND er.payment_status = 'paid'
);
```

---

### 5. Stripe webhook not received

**Cause**: Webhook URL not configured in Stripe dashboard, or webhook secret mismatch.

**Fix**:
1. Check Stripe dashboard â†’ Developers â†’ Webhooks
2. Verify URL: `https://your-domain.com/api/webhooks/stripe`
3. Verify `STRIPE_WEBHOOK_SECRET` matches the signing secret
4. Check Stripe webhook logs for delivery failures
5. Check server logs for `"Invalid signature"` errors

---

### 6. eSewa callback shows "Invalid response data"

**Cause**: Base64 decode failure on the `data` query parameter.

**Fix**:
1. Check that `ESEWA_BASE_URL` matches the merchant environment
2. Sandbox: `https://rc-epay.esewa.com.np`
3. Production: `https://epay.esewa.com.np`
4. Verify the full URL in browser network tab

---

### 7. Khalti verification returns "Payment record not found"

**Cause**: Registration's `khalti_pidx` doesn't match the callback `pidx`.

**Fix**:
1. Check if the registration was created with the correct ticket type
2. Verify `khalti_pidx` is set:
   ```sql
   SELECT id, khalti_pidx, payment_status
   FROM event_registrations
   WHERE id = 'registration-id';
   ```
3. If `khalti_pidx` is NULL, the payment session was never created

---

### 8. Confirmation email not sent

**Cause**: Gmail SMTP not configured or template not found.

**Fix**:
1. Check env vars: `GOOGLE_EMAIL` and `GOOGLE_APP_PASSWORD`
2. Check `event_email_templates` table for the event:
   ```sql
   SELECT * FROM event_email_templates
   WHERE event_id = 'event-id'
     AND template_type = 'payment_receipt'
     AND is_active = true;
   ```
3. Check server logs for `"Non-fatal: payment link email failed"` warnings
4. Emails are fire-and-forget â€” a failure doesn't affect the payment flow

---

### 9. TypeScript build errors

**Cause**: Pre-existing errors in test files or admin pages.

**Check only our files**:
```bash
npx tsc --noEmit 2>&1 | Select-String -Pattern "event-registration|confirm-stripe|event-handler|resend-payment|status/route|pending-payment|payment-success|payment-options|security\.ts"
```

If this returns no output, our code is clean. Other errors are pre-existing and unrelated.

---

## Admin Tools

### Reset Stuck Lock

```sql
-- Reset payment_initiated_at for stuck registrations
UPDATE event_registrations
SET payment_initiated_at = NULL
WHERE payment_initiated_at IS NOT NULL
  AND payment_status = 'unpaid'
  AND payment_initiated_at < NOW() - INTERVAL '1 hour';
```

### Manual Confirmation

```sql
-- Manually confirm a payment
UPDATE event_registrations
SET
  status = 'confirmed',
  payment_status = 'paid',
  payment_paid_at = NOW(),
  payment_override_by = 'admin-email'
WHERE id = 'registration-id'
  AND payment_status = 'unpaid';
```

### Recalculate sold_count

```sql
-- Fix all ticket types for an event
UPDATE event_ticket_types tt
SET sold_count = (
  SELECT COUNT(*)
  FROM event_registrations er
  WHERE er.ticket_type_id = tt.id
    AND er.status != 'cancelled'
    AND er.payment_status = 'paid'
)
WHERE tt.event_id = 'event-id';
```

### View All Pending Payments

```sql
-- Find registrations stuck in unpaid
SELECT
  er.id,
  er.full_name,
  er.email,
  er.payment_amount,
  er.payment_currency,
  er.payment_provider,
  er.payment_initiated_at,
  er.expires_at,
  e.title AS event_title
FROM event_registrations er
JOIN events e ON er.event_id = e.id
WHERE er.payment_status = 'unpaid'
  AND er.status = 'pending'
ORDER BY er.created_at DESC;
```

### View All Under Review

```sql
-- Find registrations needing admin review
SELECT
  er.id,
  er.full_name,
  er.email,
  er.payment_amount,
  er.payment_currency,
  er.payment_provider,
  er.payment_review_at,
  er.stripe_session_id,
  er.khalti_pidx,
  er.esewa_transaction_uuid,
  e.title AS event_title
FROM event_registrations er
JOIN events e ON er.event_id = e.id
WHERE er.payment_status = 'review'
ORDER BY er.payment_review_at DESC;
```

### Cancel All Expired

```sql
-- Expire registrations past their window
UPDATE event_registrations
SET status = 'expired'
WHERE status = 'pending'
  AND payment_status = 'unpaid'
  AND expires_at < NOW();
```

## Debug Logging

All payment operations log with `[Payment info]`, `[Payment warn]`, or `[Payment error]` prefixes.

Sensitive fields are automatically masked in logs:
- `secret`, `key`, `password`, `token`, `authorization`, `card`, `cvv`, `pin`
- Strings > 100 chars are truncated
- Emails show first 2 + last 2 chars with `***` in between

### Check Server Logs

```bash
# Vercel
vercel logs --follow

# Local development
# Logs appear in terminal where `npm run dev` is running
```

### Filter for Payment Events

```bash
# Look for payment-related logs
vercel logs | grep "\[Payment"
```

## Performance Notes

### Rate Limiting Scale

- Current: Supabase PostgreSQL (handles ~500 req/s)
- For >1000 req/s: migrate to Redis/Upstash

### Index Usage

The following indexes are critical for performance:
- `idx_event_reg_stripe_session` â€” webhook lookups
- `idx_event_reg_khalti_pidx` â€” Khalti verification lookups
- `idx_event_reg_esewa_uuid` â€” eSewa callback lookups
- `idx_event_reg_expires` â€” scheduled expiry scans
- `idx_payment_events_event_reg` â€” idempotency checks
