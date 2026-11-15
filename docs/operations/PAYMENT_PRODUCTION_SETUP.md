# Payment & Donation System — Production Setup & Operations Guide

This document is the authoritative operations guide for deploying, configuring, and verifying the deessa Foundation payment and donation system in production.

---

## 1. Quick Reference: Environment Variables

Configure these variables in **Vercel Dashboard → Project Settings → Environment Variables**:

| Variable | Environment | Format / Example | Description |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Production | `https://deessafoundation.com` | Base production URL used for callback redirects, emails, and webhooks. |
| `NEXT_PUBLIC_SUPABASE_URL` | All | `https://[id].supabase.co` | Supabase API URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | `eyJ...` | Supabase publishable key for client SDK. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only | `eyJ...` | Supabase service-role key for backend mutations and RLS bypass. |
| `DONATION_ONLINE_CHECKOUT_ENABLED` | Production | `true` | Master release switch. When `false`, public checkout displays testing notice. |
| `PAYMENT_MODE` | All | `live` | Enables real provider calls (use test keys in staging, live in production). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Production | `pk_live_...` | Stripe public key for frontend checkout. |
| `STRIPE_SECRET_KEY` | Server-only | `sk_live_...` | Stripe private key for session creation and lookup. |
| `STRIPE_WEBHOOK_SECRET` | Server-only | `whsec_...` | Signing secret from your registered Stripe Dashboard webhook endpoint. |
| `RECEIPT_TOKEN_SECRET` | Server-only | `[32+ random chars]` | Secret used to sign time-limited JWT URLs for PDF receipt downloads. |
| `CRON_SECRET` | Server-only | `[random hex string]` | Bearer token authenticating Vercel Cron on `/api/cron/reconcile-payments`. |
| `GOOGLE_EMAIL` | Server-only | `foundation@gmail.com` | Gmail account used to dispatch donor receipts and notifications. |
| `GOOGLE_APP_PASSWORD` | Server-only | `[16-char app pass]` | Google Account 2FA App Password. |
| `ESEWA_MERCHANT_ID` | Optional | `EPAYTEST` / `[Merchant]` | eSewa merchant ID (eSewa hidden if unset). |
| `ESEWA_SECRET_KEY` | Optional | `[eSewa Secret Key]` | HMAC-SHA256 signature key for eSewa v2. |
| `ESEWA_BASE_URL` | Optional | `https://epay.esewa.com.np` | eSewa API endpoint. |
| `KHALTI_SECRET_KEY` | Optional | `live_secret_key_...` | Khalti merchant private key (Khalti hidden if unset). |
| `KHALTI_BASE_URL` | Optional | `https://khalti.com/api/v2` | Khalti API endpoint. |

---

## 2. Gateway Setup Walkthroughs

### 2.1 Stripe (International Cards, Apple Pay, Google Pay)

1. **Activate Your Account**: Log in to [Stripe Dashboard](https://dashboard.stripe.com) and complete business and bank verification.
2. **Obtain API Keys**:
   - Navigate to **Developers → API Keys**.
   - Copy `Publishable key` (`pk_live_...`) to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
   - Copy `Secret key` (`sk_live_...`) to `STRIPE_SECRET_KEY`.
3. **Register the Webhook Endpoint**:
   - Navigate to **Developers → Webhooks → Add an endpoint**.
   - **Endpoint URL**: `https://deessafoundation.com/api/webhooks/stripe`
   - **Select Events to Listen to**:
     - `checkout.session.completed` (Online donations & event ticket payments)
     - `checkout.session.expired` (Expired checkout abandonment)
     - `payment_intent.payment_failed` (Card declines, insufficient funds)
     - `charge.refunded` (Full & partial refunds)
     - `charge.dispute.created` (Chargebacks / disputes)
     - `invoice.payment_succeeded` (Recurring monthly collections)
     - `invoice.payment_failed` (Recurring payment failure)
   - Click **Add endpoint**.
   - On the created endpoint page, click **Reveal signing secret** (`whsec_...`) and copy it into `STRIPE_WEBHOOK_SECRET`.

---

### 2.2 eSewa v2 (Nepal)

1. Register a merchant account at [eSewa Developer Portal](https://developer.esewa.com.np/).
2. Obtain your `Merchant Code` and `Secret Key`.
3. Configure in Vercel:
   ```env
   ESEWA_MERCHANT_ID=your_merchant_id
   ESEWA_SECRET_KEY=your_secret_key
   ESEWA_BASE_URL=https://epay.esewa.com.np
   ESEWA_SUCCESS_URL=https://deessafoundation.com/api/payments/esewa/success
   ESEWA_FAILURE_URL=https://deessafoundation.com/api/payments/esewa/failure
   ```
4. If eSewa keys are omitted, eSewa is automatically hidden from the donation form.

---

### 2.3 Khalti (Nepal)

1. Register at [Khalti Merchant Portal](https://admin.khalti.com/).
2. Obtain your `Live Secret Key`.
3. Configure in Vercel:
   ```env
   KHALTI_SECRET_KEY=live_secret_key_...
   KHALTI_BASE_URL=https://khalti.com/api/v2
   KHALTI_RETURN_URL=https://deessafoundation.com/api/payments/khalti/verify
   KHALTI_SANDBOX_MODE=false
   ```
4. If Khalti keys are omitted, Khalti is automatically hidden from the donation form.

---

### 2.4 Bank Transfer (Direct Wire / QR)

- Bank accounts displayed to donors are configured in [`lib/payments/bank-details.ts`](file:///d:/Web%20Codes/Projects/Deesha%20Foundation/lib/payments/bank-details.ts).
- Uploaded deposit slips / screenshots are stored privately in the Supabase Storage bucket `bank-transfer-proofs`.
- Admins verify the bank statement and confirm transactions at `/admin/donations/review`.

---

## 3. Email Delivery Setup (Gmail SMTP)

The foundation uses Gmail SMTP to dispatch automated donation receipts and alerts.

1. Ensure the Google account has **2-Step Verification** turned on.
2. Visit [Google App Passwords](https://myaccount.google.com/apppasswords).
3. Create a new App Password (e.g., name it `deessa Foundation Website`).
4. Copy the generated 16-character code (spaces can be omitted) into `GOOGLE_APP_PASSWORD`.
5. Set `GOOGLE_EMAIL=your_foundation_address@gmail.com`.

---

## 4. Background Reconciliation & Crons

Stuck donations (e.g., if a donor closed their browser before redirecting back) are automatically recovered by an hourly reconciliation task.

1. `vercel.json` contains:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/reconcile-payments",
         "schedule": "0 * * * *"
       }
     ]
   }
   ```
2. When deploying to Vercel, Vercel automatically creates the cron job.
3. In Vercel, set `CRON_SECRET=some_strong_random_secret`. Vercel automatically includes this as a Bearer token when triggering the cron.

---

## 5. Database Schema Migrations

Run scripts `001` through `008` in [`scripts/db/payments-v3/`](file:///d:/Web%20Codes/Projects/Deesha%20Foundation/scripts/db/payments-v3/) inside your **Supabase Dashboard → SQL Editor**:

1. `001-fix-payments-owner-constraint.sql` (Polymorphic owner support for donations and events)
2. `002-fix-payment-uniqueness.sql` (Global transaction uniqueness on provider, environment, transaction_id)
3. `003-fix-receipt-numbering.sql` (Atomic annual receipt generator: `RCP-YYYY-NNNNN`)
4. `004-fix-financial-constraints.sql` (Check constraints for amounts, currency, and statuses)
5. `005-fix-rls-and-grants.sql` (Revokes mutation permissions from public/anon on all payment tables)
6. `006-fix-payment-jobs-schema.sql` (Queue deduplication and worker leases)
7. `007-fix-event-audit-owner.sql` (Audit log integrity and foreign key restrictions)
8. `008-fix-receipt-audit-rls.sql` (Service-role enforcement on receipt audit log)

---

## 6. Pre-Launch Smoke Test Checklist

Execute this 5-minute test before announcing live donation availability:

- [ ] **Live Test Transaction**:
  - Visit `/donate` and make a **$1.00 USD** donation using a real credit card.
  - Complete payment on the Stripe checkout page.
  - Verify redirection to `/donate/success`.
  - Confirm page displays **Payment Confirmed** with correct amount and reference.
- [ ] **Receipt Delivery**:
  - Check your inbox for the receipt email.
  - Click the **Download Receipt (PDF)** link in the email and ensure the document renders properly.
- [ ] **Database Inspection (Supabase)**:
  - Check `donations`: Status should be `completed`, `receipt_number` populated.
  - Check `payments`: Record exists with `provider = 'stripe'`, matching `transaction_id`.
  - Check `payment_events`: Event `checkout.session.completed` recorded.
  - Check `payment_jobs`: Job status `completed`.
- [ ] **Refund Verification (Optional)**:
  - In Stripe Dashboard, issue a refund for the $1.00 test charge.
  - Verify that the donation status flips off `completed` and logs the refund event.
