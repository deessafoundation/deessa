# Event Payment Integration — Configuration

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | `eyJ...` |

### Stripe

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | **Yes** | Stripe API secret key | — |
| `STRIPE_WEBHOOK_SECRET` | For webhooks | Stripe webhook signing secret | — |

**Key format:**
- Test: `sk_test_...`
- Production: `sk_live_...`

**The system auto-detects sandbox vs production** based on the key prefix. No manual toggle needed.

### Khalti

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `KHALTI_SECRET_KEY` | **Yes** | Khalti API secret key (≥ 10 chars) | — |
| `KHALTI_BASE_URL` | **Yes** | Khalti API base URL | — |

**Base URLs:**
- Sandbox: `https://dev.khalti.com/api/v2`
- Production: `https://khalti.com/api/v2`

**Auto-detection:** The system detects sandbox vs production by checking if the key is < 10 chars or if the key prefix doesn't match the URL domain. Mismatches are logged as warnings.

### eSewa

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `ESEWA_MERCHANT_ID` | **Yes** | eSewa merchant ID | `EPAYTEST` |
| `ESEWA_SECRET_KEY` | **Yes** | eSewa HMAC-SHA256 secret key | — |
| `ESEWA_BASE_URL` | No | eSewa API base URL | Sandbox: `https://rc-epay.esewa.com.np` |

**Base URLs:**
- Sandbox: `https://rc-epay.esewa.com.np`
- Production: `https://epay.esewa.com.np`

**Sandbox detection:** Merchant ID = `EPAYTEST` indicates sandbox mode.

### Email (Optional)

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_EMAIL` | For emails | Gmail address for SMTP |
| `GOOGLE_APP_PASSWORD` | For emails | Gmail app password |

If not configured, confirmation emails are silently skipped (non-fatal).

## Supabase Setup

### Required RPC Function: `increment_rate_limit`

Rate limiting depends on a PostgreSQL function. Create it in Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION increment_rate_limit(
  p_identifier TEXT,
  p_window_minutes INT
)
RETURNS TABLE (attempts INT, expires_at TIMESTAMPTZ, allowed BOOLEAN) AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_window_end TIMESTAMPTZ := NOW() + (p_window_minutes || ' minutes')::INTERVAL;
BEGIN
  -- Try to insert or update
  INSERT INTO rate_limits (identifier, attempts, expires_at)
  VALUES (p_identifier, 1, v_window_end)
  ON CONFLICT (identifier) DO UPDATE
    SET
      attempts = CASE
        WHEN rate_limits.expires_at <= v_now THEN 1
        ELSE rate_limits.attempts + 1
      END,
      expires_at = CASE
        WHEN rate_limits.expires_at <= v_now THEN v_window_end
        ELSE rate_limits.expires_at
      END
  RETURNING
    rate_limits.attempts,
    rate_limits.expires_at,
    (rate_limits.attempts <= CASE
      WHEN rate_limits.expires_at <= v_now THEN 1
      ELSE rate_limits.attempts
    END) AS allowed;
END;
$$ LANGUAGE plpgsql;
```

### Required Migration: `056-event-payment-integration.sql`

Run in Supabase SQL Editor before deploying. Adds:
- `stripe_session_id`, `khalti_pidx`, `esewa_transaction_uuid` columns
- Unique constraints on provider columns
- `review` value for `payment_status` CHECK
- `payment_events.event_registration_id` FK
- Performance indexes
- Recreated `event_registrations_with_event` view

**Safe to run multiple times** (uses `IF NOT EXISTS`).

### Table: `rate_limits`

If not already created, run:

```sql
CREATE TABLE IF NOT EXISTS rate_limits (
  identifier TEXT PRIMARY KEY,
  attempts INT NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL
);
```

## Provider Configuration

### Stripe Dashboard Settings

1. **Webhook URL**: `https://your-domain.com/api/webhooks/stripe`
2. **Webhook events**: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`
3. **Checkout settings**: Enable `customer_email` collection
4. **Currency**: Set default currency in Stripe dashboard (used for new sessions)

### Khalti Dashboard Settings

1. **Return URL**: Set to `https://your-domain.com/events/{slug}/register/payment-success?rid={rid}`
   - Note: Khalti return URL is set per-payment, not globally
2. **API keys**: Copy secret key from Khalti dashboard → Settings → API Keys

### eSewa Dashboard Settings

1. **Success URL**: `https://your-domain.com/api/payments/esewa/success`
2. **Failure URL**: `https://your-domain.com/api/payments/esewa/failure`
3. **Merchant ID**: Copy from eSewa merchant dashboard

## Site Settings (Database)

Payment settings can be configured via the `site_settings` table:

```sql
-- Check current settings
SELECT * FROM site_settings WHERE key = 'payments';

-- Update settings
UPDATE site_settings
SET value = '{
  "enabledProviders": ["stripe", "khalti", "esewa"],
  "primaryProvider": "stripe",
  "defaultCurrency": "NPR",
  "allowRecurring": false
}'::jsonb
WHERE key = 'payments';
```

### Settings Schema

```typescript
interface PaymentSettings {
  enabledProviders: ("stripe" | "khalti" | "esewa")[];
  primaryProvider: "stripe" | "khalti" | "esewa";
  defaultCurrency: "USD" | "NPR";
  allowRecurring: boolean;
}
```

**Defaults** (if no row exists):
```json
{
  "enabledProviders": ["stripe", "khalti", "esewa"],
  "primaryProvider": "stripe",
  "defaultCurrency": "USD",
  "allowRecurring": false
}
```

**Provider availability** is determined by:
1. Provider must be in `enabledProviders`
2. Provider's required env vars must be set (`isProviderEnvConfigured()`)

If a user requests a provider that isn't available, they're silently switched to the first available provider.

## Sandbox Testing

### Stripe

1. Use `sk_test_...` key
2. Use Stripe test card numbers:
   - Success: `4242 4242 4242 4242`
   - Failure: `4000 0000 0000 0002`
3. Check Stripe dashboard → Payments → Test mode

### Khalti

1. Use sandbox key and `https://dev.khalti.com/api/v2`
2. Use Khalti test credentials from dashboard
3. Check Khalti dashboard → Transactions → Sandbox

### eSewa

1. Use `EPAYTEST` merchant ID
2. Use `https://rc-epay.esewa.com.np` base URL
3. Check eSewa sandbox dashboard

### Mock Mode (eSewa only)

The eSewa success endpoint supports a `?mock=1` query parameter for testing:
- **Development only**: Mock mode is blocked in production
- Bypasses HMAC signature verification
- Allows testing the full flow without eSewa credentials
