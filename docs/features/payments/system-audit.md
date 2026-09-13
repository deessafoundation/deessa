---
title: "Payment System Forensic Audit Report"
description: "Project: Deesha Foundation â€” Donation System"
owner: "Deesha Team"
status: active
category: feature
audience: admin
last_updated: 2026-09-12
---
# Payment System Forensic Audit Report

**Project:** Deesha Foundation â€” Donation System  
**Date:** March 2, 2026  
**Scope:** Stripe Â· Khalti Â· eSewa â€” End-to-End Donation Lifecycle  
**Classification:** INTERNAL â€” CTO REVIEW  
**Status:** Pre-Production Hardening Required

---

> **URGENT NOTICE:** Live production secrets (Stripe webhook secret, Khalti secret key, eSewa secret key) were found in the `.env` file during this audit. If this file exists in version control history, those credentials must be rotated immediately â€” before any other fix is made.

---

## Table of Contents

1. [High-Level Architecture Overview](#1-high-level-architecture-overview)
2. [End-to-End Flow Diagram (Textual)](#2-end-to-end-flow-diagram-textual)
3. [Provider-by-Provider Analysis](#3-provider-by-provider-analysis)
4. [Critical Security Risks](#4-critical-security-risks)
5. [Functional Bugs & Logical Gaps](#5-functional-bugs--logical-gaps)
6. [Data Integrity Risks](#6-data-integrity-risks)
7. [Performance Bottlenecks](#7-performance-bottlenecks)
8. [Architectural Inconsistencies](#8-architectural-inconsistencies)
9. [Missing Production Safeguards](#9-missing-production-safeguards)
10. [Recommended Refactor Strategy (Phased Plan)](#10-recommended-refactor-strategy-phased-plan)
11. [Immediate Critical Fixes (Must Fix Before Production)](#11-immediate-critical-fixes-must-fix-before-production)

---

## 1. High-Level Architecture Overview

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                      Next.js Application                          â”‚
â”‚                                                                    â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   Server Actions    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚ DonationForm  â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–º â”‚  startDonation()      â”‚   â”‚
â”‚  â”‚ (client)      â”‚                    â”‚  lib/actions/donation â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                                  â”‚                 â”‚
â”‚                              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚                              â–¼                   â–¼             â–¼  â”‚
â”‚                       stripe.ts          khalti.ts        esewa.ts â”‚
â”‚                              â”‚                   â”‚             â”‚   â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚  â”‚
â”‚  â”‚                       Supabase DB                        â”‚  â”‚  â”‚
â”‚  â”‚   donations Â· payment_events Â· site_settings            â”‚  â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚  â”‚
â”‚                                                                    â”‚
â”‚  API Routes:                                                       â”‚
â”‚   /api/payments/stripe/verify  (GET)                              â”‚
â”‚   /api/payments/khalti/verify  (POST)                             â”‚
â”‚   /api/payments/esewa/success  (GET) â€” redirect callback          â”‚
â”‚   /api/payments/esewa/failure  (GET) â€” redirect callback          â”‚
â”‚   /api/webhooks/stripe         (POST) â€” webhook                   â”‚
â”‚   /api/receipts/download       (GET)  â€” unauthenticated           â”‚
â”‚   /api/receipts/resend         (POST) â€” unauthenticated           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
           â”‚                    â”‚                    â”‚
           â–¼                    â–¼                    â–¼
        Stripe              Khalti API           eSewa v2
     Checkout API          epayment/             rc-epay /
     (Stripe SDK)          lookup/               epay.esewa
```

**Key Technology Stack:**

- Framework: Next.js 14 (App Router) â€” Server Actions + API Routes
- Database: Supabase (PostgreSQL) with Row Level Security
- Email: Nodemailer via Gmail SMTP with App Password
- PDF Generation: Puppeteer Core + `@sparticuz/chromium`
- Receipt Storage: Supabase Storage (HTML source only; PDF generated on-demand)

---

## 2. End-to-End Flow Diagram (Textual)

### Stripe

```
User fills DonationForm
  â†’ startDonation() [Server Action]
    â†’ INSERT donations (status=pending)
    â†’ startStripeCheckout() â†’ Stripe Sessions API
    â†’ UPDATE donations (stripe_session_id, provider_ref)
    â†’ Return redirectUrl

User redirected to Stripe Checkout
  â†“
User completes / cancels payment
  â†“ (two parallel paths)

PATH A â€” Client Return (Success Page polls):
  â†’ /donate/success?session_id=...
    â†’ /api/payments/stripe/verify?session_id=... (GET)
      â†’ Rate-limit check (in-memory â€” ineffective in serverless)
      â†’ stripe.checkout.sessions.retrieve()
      â†’ SELECT donations WHERE id = client_reference_id
      â†’ If pending + payment_status=paid â†’ UPDATE to completed
      â†’ Fire-and-forget: generateReceiptForDonation()
      â†’ Return donation data (including PII) in JSON

PATH B â€” Stripe Webhook:
  â†’ /api/webhooks/stripe (POST)
    â†’ In live mode: stripe.webhooks.constructEvent() (signature verify)
    â†’ In mock mode: JSON.parse() only â€” NO SIGNATURE CHECK
    â†’ recordEventOnce() â†’ INSERT payment_events (idempotency)
    â†’ SELECT donations WHERE id
    â†’ Amount/currency check
    â†’ UPDATE donations (status=completed)
    â†’ await generateReceiptForDonation() â† BLOCKING
      â†’ generateAndStoreReceipt()
        â†’ SELECT donations (idempotency check)
        â†’ generateReceiptNumber() â€” RPC or fallback MAX query
        â†’ generateReceiptHTML()
        â†’ Supabase Storage: upload HTML
        â†’ UPDATE donations (receipt_number, receipt_url, receipt_generated_at)
      â†’ sendReceiptToDonor()
        â†’ sendReceiptEmail() via Gmail SMTP (blocking)
        â†’ UPDATE donations (receipt_sent_at)
    â†’ Return { received: true }
```

### Khalti

```
User fills DonationForm
  â†’ startDonation() [Server Action]
    â†’ INSERT donations (status=pending)
    â†’ startKhaltiPayment() â†’ POST /epayment/initiate/
    â†’ UPDATE donations (khalti_pidx, provider_ref)
    â†’ Return redirectUrl (Khalti payment page)

User redirected to Khalti
  â†“
User completes / cancels payment
  â†“
Khalti redirects to return URL (/payments/khalti/return or configured URL)
  â†’ Client-side code reads pidx from URL
  â†’ Client POSTs to /api/payments/khalti/verify
    â†’ SELECT donations WHERE khalti_pidx = pidx
    â†’ Idempotency check (already completed/failed)
    â†’ In mock mode â†’ UPDATE to completed
    â†’ In live mode â†’ POST /epayment/lookup/ (Khalti API)
      â†’ Amount verification
      â†’ Status switch (Completed/Pending/Refunded/Expired/User canceled)
      â†’ UPDATE donations (new status)
      â†’ INSERT payment_events (idempotency)
      â†’ Fire-and-forget: generateReceiptForDonation()
    â†’ Return { ok, status }

âš  NO Khalti webhook â€” entire verification is client-triggered
```

### eSewa

```
User fills DonationForm
  â†’ startDonation() [Server Action]
    â†’ INSERT donations (status=pending)
    â†’ startEsewaPayment()
      â†’ Generate transactionUuid = `${Date.now()}-${donationId}`
      â†’ Generate HMAC-SHA256 signature
      â†’ Build form data
    â†’ UPDATE donations (esewa_transaction_uuid, provider_ref)
    â†’ Return { redirectUrl, formData, requiresFormSubmit: true }

Client builds hidden HTML form, POSTs to eSewa API

User completes / cancels payment at eSewa
  â†“
eSewa redirects to success_url or failure_url

SUCCESS PATH:
  â†’ /api/payments/esewa/success?data=BASE64 (GET)
    â†’ Decode base64 â†’ parse JSON
    â†’ Select donations WHERE esewa_transaction_uuid
    â†’ In live mode: verifyEsewaSignature() â€” HMAC check
    â†’ Check status === "COMPLETE"
    â†’ Idempotency check (already completed)
    â†’ Amount verification
    â†’ payment_events INSERT (replay protection)
    â†’ UPDATE donations (status=completed)
    â†’ Fire-and-forget: generateReceiptForDonation()
    â†’ Redirect to /donate/success?provider=esewa&transaction_code=...

FAILURE PATH:
  â†’ /api/payments/esewa/failure?data=BASE64 (GET)
    â†’ Decode base64 â†’ parse JSON (errors silently ignored)
    â†’ Select donations WHERE esewa_transaction_uuid
    â†’ UPDATE donations (status=failed)
    â†’ Redirect to /donate/cancel

âš  NO eSewa webhook â€” server-side GET callback with HMAC verification
âš  signature skip via ?mock=1 URL param â€” exploitable in live mode
```

---

## 3. Provider-by-Provider Analysis

### 3.1 Stripe

| Area                   | Status                    | Notes                                                                  |
| ---------------------- | ------------------------- | ---------------------------------------------------------------------- |
| Session creation       | âœ… Correct                | Uses `client_reference_id` for donation linkage                        |
| Signature verification | âœ… Live mode only         | **Mock mode skips entirely** â€” acceptable for dev                      |
| Idempotency            | âœ… `payment_events` table | Falls back gracefully if table missing                                 |
| Amount verification    | âœ… Fail-closed            | Flags as `review` on mismatch                                          |
| Receipt generation     | âš ï¸ BLOCKING in webhook    | `await generateReceiptForDonation()` delays webhook response           |
| Success page           | âš ï¸ Dual-path risk         | Both webhook and GET verify can update the same donation               |
| Subscription support   | âš ï¸ Partial                | `invoice.payment_succeeded` uses `LIKE` query on `payment_id`          |
| PII exposure           | ðŸ”´ Risk                   | `GET /verify` returns full donor PII in JSON; session_id is in the URL |
| Rate limiting          | âš ï¸ Broken in serverless   | In-memory `Map` resets per cold start                                  |
| Cancel / failure       | âœ…                        | `checkout.session.expired` marks as failed                             |

**Stripe-Specific Gaps:**

1. If the Stripe webhook fires and the GET verify endpoint is also polled simultaneously, two separate UPDATE calls race to set `payment_status = "completed"`. No DB-level atomic update guard (e.g., `WHERE payment_status = 'pending'`) is used in either path.
2. The `invoice.payment_succeeded` handler calls `recordEventOnce(null)` â€” passing `null` as `donationId` into `payment_events.insert`. A unique constraint on `event_id` alone would deduplicate this, but the intent is unclear.
3. Subscription `customer.subscription.deleted` is explicitly a no-op with a comment `// Note: We don't change payment_status here`. A cancelled subscription should likely mark the donation or send a notification.

---

### 3.2 Khalti

| Area                   | Status              | Notes                                                                                                   |
| ---------------------- | ------------------- | ------------------------------------------------------------------------------------------------------- |
| Payment initiation     | âœ…                  | Sandbox/live key detection with warning                                                                 |
| Amount verification    | âœ… Fail-closed      | Marks as `review` on mismatch                                                                           |
| Status handling        | âœ… Exhaustive       | All Khalti statuses handled                                                                             |
| Idempotency            | âœ… `payment_events` | Best-effort if table missing                                                                            |
| Webhook support        | ðŸ”´ Missing          | Entirely absent â€” verification is client-initiated only                                                 |
| Rate limiting          | ðŸ”´ None             | No rate limit on `/api/payments/khalti/verify`                                                          |
| PII in response        | â„¹ï¸ Low              | Verify endpoint does not return PII                                                                     |
| Conference branch      | âš ï¸ Duplicated       | Full verification logic is copy-pasted inside the same file                                             |
| Review status response | ðŸ”´ Inconsistent     | Returns `{ ok: false, status: "failed" }` for donation, `{ ok: true, status: "review" }` for conference |

**Khalti-Specific Gaps:**

1. There is no Khalti webhook integration. If the user closes the browser after payment succeeds but before the redirect completes, the donation remains `pending` indefinitely. An admin has no automated way to reconcile.
2. The `pidx` from the URL is the only input required to trigger verification. Any client can call this endpoint with any pidx. The guard is that the pidx must already exist in `donations.khalti_pidx` â€” but an attacker doing reconnaissance could submit a real Khalti payment for Re. 1 to get a valid pidx, then attempt to look up another donation via that pidx if the UUID mapping is predictable.
3. In mock mode, the mock pidx is `khalti_mock_${donation.id}` â€” since `donation.id` is a UUIDv4, this is unpredictable. âœ…

---

### 3.3 eSewa

| Area                               | Status              | Notes                                                         |
| ---------------------------------- | ------------------- | ------------------------------------------------------------- |
| Payment initiation                 | âœ…                  | HMAC-SHA256 signature generated correctly                     |
| Signature verification on callback | âš ï¸                  | Skipped when `?mock=1` URL param is present â€” **exploitable** |
| Status check                       | âœ…                  | Checks `status === "COMPLETE"`                                |
| Amount verification                | âœ…                  | Fail-closed                                                   |
| Idempotency                        | âœ… `payment_events` | Best-effort                                                   |
| Failure callback auth              | ðŸ”´ None             | No signature check on the failure URL callback                |
| Webhook support                    | ðŸ”´ Missing          | Redirect callback only â€” no dedicated webhook                 |
| transactionUuid storage            | âœ…                  | Stored before redirect                                        |
| Conference branch                  | âš ï¸ Duplicated       | Massive if/else branching inside same route                   |
| Mock data trust                    | ðŸ”´ High risk        | `?mock=1` + URL params bypass HMAC even in live mode          |

**eSewa-Specific Gaps:**

1. **`?mock=1` bypass**: The condition `if (!isMock && mode === "live")` means that if an attacker sends the success callback with `?mock=1` appended, signature verification is skipped entirely â€” even when the server's `PAYMENT_MODE=live`. A malicious actor can craft a fake success callback with any `transaction_uuid`, bypassing all cryptographic verification.
2. The failure callback (`/api/payments/esewa/failure`) decodes the base64 payload but catches decode errors silently. The `transaction_uuid` is then used to look up and mark a donation as failed. There is no signature or HMAC verification on the failure path, meaning anyone who can guess or know a donation's `esewa_transaction_uuid` can mark it as failed.
3. The `transactionUuid` is `${Date.now()}-${donationId}`. The donation `id` (a UUID) is passed to eSewa as part of the transaction UUID. This leaks the internal donation ID to the eSewa ecosystem.

---

## 4. Critical Security Risks

### ðŸ”´ HIGH â€” Must Fix Before Production

#### SEC-01: Live Production Credentials in `.env` File

**File:** `.env` (root)  
**Finding:** The `.env` file contains real live credentials:

- `STRIPE_WEBHOOK_SECRET=whsec_f3c2b9a2...`
- `KHALTI_SECRET_KEY=fc7cbaa50d08...`
- `ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q`

**Risk:** If this file has ever been committed to a Git repository â€” even once â€” these secrets are permanently in history and should be treated as compromised. Any developer or attacker with repo access can drain the payment gateway, replay transactions, or verify fraudulent payments.

**Action:** Rotate all three credentials immediately, verify `.gitignore` excludes `.env`, audit Git history.

---

#### SEC-02: eSewa Signature Bypass via `?mock=1` URL Parameter

**File:** `app/api/payments/esewa/success/route.ts` (line ~55)  
**Finding:**

```typescript
const isMock = url.searchParams.get("mock") === "1";
// ...
if (!isMock && mode === "live") {
  // verify HMAC signature
}
```

Any attacker can append `?mock=1` to the eSewa success callback URL to bypass the HMAC-SHA256 signature verification, even in production (`PAYMENT_MODE=live`). Combined with knowing or guessing a valid `transaction_uuid`, this allows arbitrary payment confirmation of any pending donation.

**Risk:** Fraudulent donation confirmations; financial loss.

---

#### SEC-03: Unauthenticated Receipt Download Endpoint

**File:** `app/api/receipts/download/route.ts`  
**Finding:** `GET /api/receipts/download?id=RECEIPT_NUMBER` has zero authentication. It queries the DB by `receipt_number`, fetches HTML from storage, generates PDF, and returns it.

**Risk:** Any person who knows or guesses a receipt number can download it. The receipt contains full donor PII: name, email, phone, amount, date. Receipt numbers follow a predictable sequential format (`RCP-2026-000X`), making enumeration trivial.

---

#### SEC-04: Unauthenticated Receipt Resend Endpoint

**File:** `app/api/receipts/resend/route.ts`  
**Finding:** `POST /api/receipts/resend` accepts `{ receiptNumber }` with no authentication, no rate limiting, and no validation of who is making the request.

**Risk:** An attacker can enumerate receipt numbers and trigger receipt emails to donors at will â€” spam/email bombing, and PII linkage (confirming which receipt number belongs to which donor).

---

#### SEC-05: eSewa Failure Callback Has No Authentication

**File:** `app/api/payments/esewa/failure/route.ts`  
**Finding:** The failure callback decodes `?data=BASE64` but performs no signature verification. The `transaction_uuid` is extracted and used to mark a donation as failed without any proof that the request came from eSewa.

**Risk:** A malicious actor can construct a fake failure callback for any donation whose `esewa_transaction_uuid` they know, converting a `completed` or `pending` donation to `failed`. The `completed` idempotency check prevents downgrading from `completed`, but `pending` â†’ `failed` is unprotected.

---

#### SEC-06: Stripe Verify Endpoint Returns Donor PII in URL-Accessible JSON

**File:** `app/api/payments/stripe/verify/route.ts`  
**Finding:** The endpoint returns `donor_name`, `donor_email`, `donor_phone` in the JSON response. The only gate is possession of the `session_id`, which appears in the browser address bar and is stored in browser history, logs, and proxy caches.

**Risk:** PII leakage to anyone who gains access to browser history, server access logs, or any analytics tools that log full URLs.

---

### ðŸŸ  MEDIUM

#### SEC-07: In-Memory Rate Limiting â€” Ineffective in Serverless

**File:** `app/api/payments/stripe/verify/route.ts`  
**Finding:** Rate limiting uses a module-level `Map<string, { count; resetAt }>`. In serverless/Vercel deployments, each function invocation can be a cold start with an empty Map.

**Risk:** The rate limiter offers zero protection in serverless. Brute-forcing Stripe session IDs (`cs_live_...`) is unconstrained.

---

#### SEC-08: Donor PII Accessible via `getDonationByPaymentRef` Server Action

**File:** `lib/actions/donation-receipt.ts`  
**Finding:** `getDonationByPaymentRef(ref)` is a public server action that returns full donor PII based on a payment reference string from the URL. It makes up to 8 sequential DB queries trying different column lookups. This is called directly from the client-side success page.

**Risk:** Any client that can guess or observe a valid payment reference (`pidx`, `transaction_code`, etc.) can retrieve another donor's PII.

---

#### SEC-09: Mock Mode Skips All Webhook Signature Verification

**File:** `app/api/webhooks/stripe/route.ts`  
**Finding:**

```typescript
if (mode === "mock") {
  event = JSON.parse(body) as Stripe.Event;
} else {
  // verify signature
}
```

In mock mode, any POST request to the webhook endpoint is processed as a legitimate Stripe event â€” no signature required.

**Risk:** Although mock mode should not be active in production (there's a guardrail that throws in production if `PAYMENT_MODE !== "live"`), the guardrail depends purely on the `NODE_ENV=production` check. If `NODE_ENV` is misset on the hosting platform, mock mode runs with no protection.

---

#### SEC-10: Timing Attack on `transaction_uuid` Lookup

**File:** Multiple  
**Finding:** The `esewa_transaction_uuid` follows the pattern `${Date.now()}-${donationId}`. Timestamp prefix is predictable within a time range, and `donationId` is a UUIDv4 â€” but the combined string is stored in the DB and matched in callback handling.

**Risk:** Low, but the timestamp component narrows the entropy of the UUID.

---

### ðŸŸ¡ LOW

#### SEC-11: No CSRF Protection on Donation Form

The donation form submits via a Next.js Server Action. Next.js does include origin checks for server actions, but there is no explicit CSRF token mechanism.

#### SEC-12: `GOOGLE_APP_PASSWORD` in Environment

Gmail App Password grants full Gmail account access. Compromise of this credential allows reading all incoming/outgoing organizational email, not just sending receipts.

#### SEC-13: Supabase Service Role Key Used in Client-Side Accessible Routes

The service role key bypasses all RLS. It is used in multiple API routes. If any route has an injection vulnerability, the service role key can be used for full DB access. The key is correctly kept server-side â€” but the broad usage increases blast radius.

---

## 5. Functional Bugs & Logical Gaps

### BUG-01: Dual-Update Race Condition on Stripe Payments

**Severity:** High  
**Files:** `app/api/webhooks/stripe/route.ts`, `app/api/payments/stripe/verify/route.ts`

Both the Stripe webhook and the `GET /verify` endpoint can independently update a donation from `pending` â†’ `completed`. Neither path uses a conditional update (`WHERE payment_status = 'pending'`). Two simultaneous executions can cause:

- Two receipt generation attempts (partially mitigated by the idempotency check in `generateAndStoreReceipt`)
- Two `payment_events` inserts for different event IDs (webhook's event ID vs. verify's manual flow)
- Inconsistent `payment_id` values: webhook writes `stripe:session_id`, verify writes `stripe:session_id` â€” actually the same, but both paths write differently for subscriptions

**Fix:** Use a conditional DB update: `.update({...}).eq("id", donationId).eq("payment_status", "pending")`

---

### BUG-02: eSewa Payment Events Insert Race Condition

**Severity:** Medium  
**File:** `app/api/payments/esewa/success/route.ts`

The code inserts into `payment_events` BEFORE updating the `donations` record. If the `payment_events` insert succeeds but the donations update fails:

- The event is consumed (idempotency key is spent)
- The donation remains in `pending` status
- All subsequent retries will be rejected as "already processed" by the payment_events check
- The donation is permanently stuck as `pending`

**Fix:** Insert into `payment_events` AFTER the donation update succeeds, or use a DB transaction.

---

### BUG-03: Khalti Review Status Returns Inconsistent Responses

**Severity:** Medium  
**File:** `app/api/payments/khalti/verify/route.ts`

- Donation branch: amount mismatch returns `{ ok: false, status: "failed" }` with HTTP 400
- Conference branch: amount mismatch returns `{ ok: true, status: "review" }` with HTTP 200

The client that receives these responses (success page, complete-payment page) cannot reliably distinguish the states.

---

### BUG-04: Khalti Mock Mode Does Not Save `provider` Field

**Severity:** Low  
**File:** `app/api/payments/khalti/verify/route.ts`

In mock mode:

```typescript
await supabase
  .from("donations")
  .update({
    payment_status: "completed",
    provider: "khalti", // â† this IS included
    provider_ref: pidx,
    payment_id: `khalti:${pidx}`,
  })
  .eq("id", donation.id);
```

This is actually fine. However, in live mode, the update only sets `payment_status` and `payment_id` â€” it does not set `provider`:

```typescript
const updateData: { payment_status: string; payment_id?: string } = {
  payment_status: newStatus,
  payment_id: `khalti:${pidx}`,
};
```

The `provider` column is not updated in live mode for Khalti, only in the mock path. The `provider` was set at donation creation time in `startDonation()`, but this is an inconsistency.

---

### BUG-05: `invoice.payment_succeeded` Webhook Passes `null` as `donationId` to `recordEventOnce`

**Severity:** Medium  
**File:** `app/api/webhooks/stripe/route.ts`

```typescript
const recorded = await recordEventOnce(null);
```

`recordEventOnce` inserts `{ provider: "stripe", event_id: event.id, donation_id: null }` into `payment_events`. If the unique constraint on `payment_events` is on `(provider, event_id)` this deduplicates correctly. But if unique constraint is only on `event_id`, a duplicate key error on a previous insert with `donation_id = someId` would collide. The intent is to deduplicate subscription invoice events before the donation is looked up, but passing `null` creates ambiguity.

---

### BUG-06: Success Page Shows "Confirmed" Even When `payment_status` Is Not "completed"

**Severity:** Low  
**File:** `app/(public)/donate/success/success-content.tsx`

The success page renders a green success UI irrespective of `payment_status`. Only the status badge text changes. If a donation is in `review` status, the user sees the full success screen with "Thank You for Your Generosity" and a green checkmark â€” despite the payment being flagged for manual review and funds not confirmed.

---

### BUG-07: Polling Continues After Payment Status Is Non-Pending

**Severity:** Low  
**File:** `app/(public)/donate/success/success-content.tsx`

The Stripe polling interval (`setInterval`) stops when `pollData.donation.payment_status !== "pending"`. A donation that enters `review` or `failed` status will stop polling correctly, but the success page UI still shows the success state from the initial load. There is no branch to render a warning/error state for `review` or `failed` payments returned after webhook processing.

---

### BUG-08: eSewa Failure Route â€” Silently Swallows Base64 Decode Errors

**Severity:** Medium  
**File:** `app/api/payments/esewa/failure/route.ts`

```typescript
} catch (error) {
  logPaymentEvent("eSewa failure - failed to decode response", {...}, "warn")
  // continues execution with empty responseData
}
```

After a failed decode, `transaction_uuid` is `undefined`. The route then checks `if (!transaction_uuid)` and redirects to `/donate/cancel`. This is technically handled, but the error is classified as `warn` â€” not `error` â€” and no DB write is attempted. A legitimate eSewa failure with a corrupted payload will leave the donation stuck in `pending`.

---

### BUG-09: Receipt Number Fallback Is Non-Atomic (Race Condition)

**Severity:** High  
**File:** `lib/receipts/generator.ts`

When the RPC `get_next_receipt_number` is unavailable, the fallback uses:

```typescript
SELECT receipt_number FROM donations WHERE receipt_number IS NOT NULL
ORDER BY created_at DESC LIMIT 1
```

Two concurrent receipt generations can read the same MAX value and attempt to write the same receipt number. The UNIQUE constraint prevents the second write from succeeding, but the first receipt generation attempt fails silently with `"Failed to update donation record"`, meaning:

- Donation has no receipt
- No retry mechanism
- Donor receives no email

---

### BUG-10: `getDonationByPaymentRef` Makes Sequential Queries Without Batching

**Severity:** Medium (Performance + Logic)  
**File:** `lib/actions/donation-receipt.ts`

The function attempts up to 8 sequential Supabase queries with no timeout. In edge cases, a stale connection could block the success page render for seconds before timing out.

---

## 6. Data Integrity Risks

### DB-01: `payment_events` Table Is Optional â€” Silent Loss of Idempotency

**Severity:** Critical  
**Finding:** All three payment providers and the webhook handler have the pattern:

```typescript
} catch {
  // ignore if ledger table missing
}
```

If the `payment_events` migration has not been applied, the table does not exist, and the catch block silently swallows the error. The system runs with zero replay attack protection or idempotency guarantees. This would not be visible in logs unless specifically monitored.

---

### DB-02: No Database Transaction Across Multi-Step Payment Confirmation

**Severity:** High  
**Finding:** The payment confirmation flow involves multiple sequential DB writes:

1. UPDATE donations (status = completed)
2. INSERT payment_events
3. UPDATE donations (receipt_number, receipt_url)
4. UPDATE donations (receipt_sent_at)

None of these are wrapped in a Postgres transaction. A failure at any step leaves the data in a partial state. For example, if step 3 fails:

- Donation is marked `completed`
- No receipt number stored
- No receipt email sent
- User and admin see "completed" with no receipt
- No automatic retry

---

### DB-03: Subscription LIKE Query Risks False Matches

**Severity:** Medium  
**File:** `app/api/webhooks/stripe/route.ts`

```typescript
.like("payment_id", `%subscription:${invoice.subscription}%`)
```

A full-table sequential LIKE scan. If subscription IDs share prefixes (they don't in Stripe, but depends on the format), this could false-match incorrect donations. The result is limited to 1, but sorting by `created_at DESC` and taking the first is not guaranteed to be the correct donation if multiple donations reference the same subscription.

---

### DB-04: `donations` Table Mixes Concerns

**Severity:** Medium  
**Finding:** The `donations` table stores: payment status, provider references, receipt data, PII, monthly flags, and audit timestamps â€” all in one table. This violates single responsibility. The receipt_number, receipt_url, receipt_generated_at, receipt_sent_at, receipt_download_count fields should be in a separate `receipts` table with a foreign key to `donations`.

---

### DB-05: Missing Indexes Likely on Key Lookup Columns

**Severity:** Medium  
**Finding:** The following columns are used in WHERE clauses across multiple routes but no explicit indexes are confirmed in the codebase:

- `donations.khalti_pidx`
- `donations.esewa_transaction_uuid`
- `donations.esewa_transaction_code`
- `donations.stripe_session_id`
- `donations.receipt_number`
- `donations.payment_id` (used in LIKE scan)

Without indexes, every redirect callback causes a sequential table scan.

---

### DB-06: Nullable `amount` Risk

**Severity:** Medium  
**Finding:** In the webhook and verify handlers, `donation.amount` is used in arithmetic:

```typescript
Math.round(Number(donation.amount) * 100);
```

If `amount` is `null` (possible if a DB insert partially fails or a migration leaves a nullable column), `Number(null) = 0`, and the amount check returns `0 !== actualMinor`, flagging the payment for review. The result is silent: funds are received but the donation is stuck in `review` with no alert.

---

## 7. Performance Bottlenecks

### PERF-01: Blocking PDF Generation via Puppeteer on Every Download

**File:** `app/api/receipts/download/route.ts`  
**Severity:** High

Every call to `/api/receipts/download?id=...` launches a headless Chromium instance, renders HTML, generates a PDF, and destroys the browser. A single download takes 2â€“5 seconds. There is no:

- PDF caching layer
- Rate limiting
- Request deduplication

A malicious actor (or a curious user refreshing) can trigger unbounded Chromium spawns, saturating CPU/memory. In a serverless environment, this also causes extreme cold-start latency.

---

### PERF-02: Receipt Generation Inside Stripe Webhook Is Blocking

**File:** `app/api/webhooks/stripe/route.ts`  
**Severity:** High

```typescript
await generateReceiptForDonation({ donationId });
```

This call is awaited inside the webhook handler. `generateReceiptForDonation` internally calls `generateAndStoreReceipt` (Supabase Storage upload + DB writes) and `sendReceiptToDonor` (Gmail SMTP, synchronous). If Gmail SMTP is slow or down, the webhook response is delayed beyond Stripe's 30-second timeout, causing Stripe to retry the event â€” triggering duplicate receipt generation attempts.

Other providers (Khalti, eSewa, and the Stripe verify GET endpoint) correctly fire this as fire-and-forget. The webhook is inconsistent.

---

### PERF-03: Up to 8 Sequential DB Queries on Success Page Load

**File:** `lib/actions/donation-receipt.ts` â€” `getDonationByPaymentRef()`  
**Severity:** Medium

Called from the success page for Khalti and eSewa, this function fires up to 8 sequential single-row queries. Should be replaced with a single query using `OR`:

```sql
SELECT ... FROM donations WHERE khalti_pidx = $1 OR esewa_transaction_uuid = $1 OR ...
```

---

### PERF-04: Success Page Polls the Stripe Verify Endpoint Every 2 Seconds for Up to 30 Seconds

**File:** `app/(public)/donate/success/success-content.tsx`  
**Severity:** Medium

Up to 15 polling requests per page-view for Stripe donations. Each poll: hits the rate limiter Map â†’ calls `stripe.checkout.sessions.retrieve()` â†’ runs a DB query. For high-traffic periods, this multiplies load significantly. A webhook-driven WebSocket or SSE push would eliminate polling.

---

### PERF-05: Synchronous Email Sending Blocks Receipt Generation

**File:** `lib/actions/donation-receipt.ts` â€” `generateReceiptForDonation()`  
**Severity:** Medium

```typescript
const emailResult = await sendReceiptToDonor(...)
```

Email is sent synchronously within `generateReceiptForDonation`. If Gmail SMTP is slow, the entire receipt action is blocked. In the fire-and-forget paths (Khalti/eSewa), this is acceptable because the main request has already returned â€” but it means receipt email delivery latency adds to the time before the receipt appears on the success page (which polls for it).

---

### PERF-06: Download Counter Uses Read-Modify-Write Without Atomic Increment

**File:** `lib/receipts/service.ts` â€” `trackReceiptDownload()`  
**Severity:** Low

```typescript
const currentCount = donation?.receipt_download_count || 0;
await supabase
  .from("donations")
  .update({ receipt_download_count: currentCount + 1 });
```

Under concurrent downloads, this loses count increments. Should use a Postgres atomic increment: `UPDATE donations SET receipt_download_count = receipt_download_count + 1 WHERE id = $1`.

---

## 8. Architectural Inconsistencies

### ARCH-01: Verification Model Mismatch Across Providers

| Provider | Verification Model                                                     |
| -------- | ---------------------------------------------------------------------- |
| Stripe   | Server-side webhook (primary) + Client-polled GET endpoint (secondary) |
| Khalti   | Client-triggered POST only â€” no webhook                                |
| eSewa    | Server-side GET redirect callback only â€” no webhook                    |

This is architecturally inconsistent. Stripe has a proper server-side trust chain (signature-verified webhook). Khalti and eSewa rely on client-side redirects, which can be:

- Intercepted and replayed
- Skipped if the user closes the browser
- Manipulated via URL parameters (`?mock=1`)

The gold standard for all three should be: webhook-first, with the redirect callback as a UI shortcut (not the source of truth).

---

### ARCH-02: Receipt Generation Is Triggered from Four Different Places

1. `app/api/webhooks/stripe/route.ts` (awaited)
2. `app/api/payments/stripe/verify/route.ts` (fire-and-forget)
3. `app/api/payments/khalti/verify/route.ts` (fire-and-forget)
4. `app/api/payments/esewa/success/route.ts` (fire-and-forget)

The inconsistency in awaiting vs. fire-and-forget means:

- Stripe webhook: slow receipt generation = webhook timeout = retry = potential duplicate
- Others: fast response, but receipt readiness is unpredictable

There is no central orchestrator for post-payment actions (receipt + email). This logic should live in one place.

---

### ARCH-03: Conference Registration Logic Is Duplicated Inside Donation Routes

The Khalti verify route (`route.ts`) starts as a donation handler but contains an entire second branch for conference registrations with nearly identical logic (lookup â†’ status check â†’ amount verify â†’ confirm â†’ email). The eSewa success route has the same pattern. This is 300+ lines of duplicated code between the two branches in each file.

Consequence: any bug fix or enhancement must be applied in 2+ places. At least 3 instances of this divergence already exist (the mock response shape, the review handling, and the amount tolerance).

---

### ARCH-04: `payment_id` Field Overloaded with Multiple Semantics

`payment_id` stores values like:

- `stripe:cs_live_xxx` (Stripe session)
- `stripe:subscription:sub_xxx` (Stripe subscription)
- `khalti:PIDX_xxx` (Khalti pidx)
- `esewa:TX_CODE` or `esewa:uuid` (eSewa transaction code/uuid)

This composite string format requires the `LIKE` scan in the subscription webhook. A proper schema would have provider-specific columns (already partially done with `khalti_pidx`, `esewa_transaction_uuid`, `stripe_session_id`) and `payment_id` should be the deduplicated canonical reference only.

---

### ARCH-05: `getPaymentMode()` Throws in Production If PAYMENT_MODE Is Not "live"

**File:** `lib/payments/config.ts`

```typescript
if (process.env.NODE_ENV === "production" && envMode !== "live") {
  throw new Error('PAYMENT_MODE must be "live" in production.');
}
```

This is a good guardrail, but it means a misconfiguration causes an unhandled exception that surfaces as a 500 error to donors â€” instead of a graceful "payment not available" message. This also means if `PAYMENT_MODE` is accidentally unset in production, the entire payment system throws on every request.

---

### ARCH-06: Currency Is Hardcoded by Provider in `startDonation`

```typescript
const currency =
  input.provider === "stripe" ? settings.defaultCurrency || "USD" : "NPR";
```

Khalti and eSewa are hardcoded to NPR. While currently accurate, this means adding a new provider requires modifying application code, not just configuration. Additionally, the `settings.defaultCurrency` can be set to `"NPR"` via the admin panel, potentially sending NPR amounts to Stripe (which would interpret them as USD cents).

---

## 9. Missing Production Safeguards

| Safeguard                                                             | Status     | Impact                                               |
| --------------------------------------------------------------------- | ---------- | ---------------------------------------------------- |
| Khalti webhook integration                                            | âŒ Missing | Payments lost if user closes browser                 |
| eSewa webhook integration                                             | âŒ Missing | Same as above                                        |
| Automatic reconciliation cron job (donations stuck in `pending`)      | âŒ Missing | Orphaned payments never resolved                     |
| PDF caching (S3/Supabase Storage)                                     | âŒ Missing | CPU/memory DoS vector                                |
| Email retry queue (failed receipt emails)                             | âŒ Missing | Silent email failures, donors never receive receipts |
| Database transactions across multi-step payment confirm               | âŒ Missing | Partial writes, stuck donations                      |
| Conditional DB update (`WHERE status = 'pending'`) on payment confirm | âŒ Missing | Race condition on Stripe dual-path                   |
| Rate limiting on Khalti verify endpoint                               | âŒ Missing | Enumeration / brute force                            |
| Rate limiting effective in serverless (Redis/KV-based)                | âŒ Missing | Stripe verify unprotected                            |
| Authentication on `/api/receipts/download`                            | âŒ Missing | PII leak                                             |
| Authentication on `/api/receipts/resend`                              | âŒ Missing | Email abuse                                          |
| Monitoring/alerting on failed payments                                | âŒ Missing | No visibility                                        |
| Admin notification when payment enters `review` status                | âŒ Missing | Manual review never triggered                        |
| Idempotency on failure callbacks (eSewa failure)                      | âš ï¸ Partial | No HMAC; only status check                           |
| Audit log / immutable ledger of all payment state changes             | âš ï¸ Partial | Only `payment_events`; no full change log            |
| `payment_events` table existence check at startup                     | âŒ Missing | Silent loss of idempotency protection                |

---

## 10. Recommended Refactor Strategy (Phased Plan)

### Phase 0 â€” Emergency (This Week)

**Do not deploy to production until these are done.**

1. **Rotate all credentials** â€” Stripe webhook secret, Khalti secret key, eSewa secret key. Update `.env` and all deployment environments.
2. **Add `.env` to `.gitignore`** and verify it has never been committed. Run `git log --all --full-history -- .env` to check.
3. **Fix eSewa `?mock=1` bypass** â€” Remove the `isMock` check from signature verification in live mode. Decouple mock testing from URL parameters.
4. **Add authentication to receipt endpoints** â€” Require a signed token or a valid session to download or resend a receipt.
5. **Fix the eSewa failure callback signature gap** â€” Add HMAC verification or at minimum a server-side lookup that validates the callback came as expected.

---

### Phase 1 â€” Stability (Weeks 2â€“3)

1. **Fix Stripe dual-update race condition** â€” Add `.eq("payment_status", "pending")` guard on all donation update calls.
2. **Fix eSewa payment_events insert ordering** â€” Move the `payment_events` insert to after the donation update.
3. **Make receipt number generation always atomic** â€” Ensure migration `012-receipt-sequence.sql` is applied; remove the fallback or make it throw rather than silently use a non-atomic path.
4. **Move webhook receipt generation to fire-and-forget** â€” Match the pattern used by Khalti and eSewa to prevent webhook timeouts and Stripe retries.
5. **Add conditional update on all payment confirmations** â€” `WHERE payment_status = 'pending'` to prevent double-processing.
6. **Fix `payment_events` table existence as hard dependency** â€” At startup or on first use, log an error and disable idempotency protection visibly rather than silently.

---

### Phase 2 â€” Reliability (Weeks 3â€“5)

1. **Build a post-payment orchestrator** â€” A single function triggered once a donation is confirmed that handles: receipt generation â†’ email send â†’ admin notification. Remove duplicate trigger points.
2. **Add a reconciliation cron job** â€” Scan donations `WHERE payment_status = 'pending' AND created_at < now() - interval '1 hour'`, call the respective provider's lookup API, and resolve status.
3. **Implement email retry queue** â€” Use a database-backed job queue (e.g., `pg_cron` or a jobs table) for emails. Log failed attempts and retry 3Ã— with backoff.
4. **Restructure success page for Khalti/eSewa** â€” Remove the `getDonationByPaymentRef` multi-query chain. After redirect, the payment handler should store the donation ID in a signed cookie or redirect parameter so the success page can fetch it directly by ID.
5. **Add real rate limiting** â€” Use Upstash Redis or Supabase Edge Functions KV for rate limiting across serverless instances.

---

### Phase 3 â€” Architecture (Weeks 5â€“8)

1. **Separate receipts into a `receipts` table** â€” Foreign key to `donations`. Remove receipt fields from the donations table.
2. **Implement PDF caching** â€” Generate PDF once, store in Supabase Storage, serve from storage. Only regenerate if the source HTML changes.
3. **Consolidate conference registration payment handling** â€” Extract a shared `handlePaymentConfirmation(entity, provider, data)` function used by both donation and conference branches.
4. **Implement Khalti webhook** â€” Use Khalti's IPN (Instant Payment Notification) feature if available, or build a server-cron reconciliation loop as a substitute.
5. **Replace Stripe polling with webhook â†’ SSE push** â€” Eliminate the 15-request polling loop on the success page. Use a Server-Sent Events or WebSocket channel keyed to the donation ID.
6. **Standardize API response shapes** â€” Pick one response schema (`{ ok, status, data, error }` or `{ success, data, error }`) and enforce it across all payment endpoints.

---

## 11. Immediate Critical Fixes (Must Fix Before Production)

The following items represent a minimum viable hardening checklist. No real-money transaction should be processed until all **Phase 0** and at minimum **SEC-01 through SEC-06** items are resolved.

```
[ ] SEC-01  Rotate STRIPE_WEBHOOK_SECRET, KHALTI_SECRET_KEY, ESEWA_SECRET_KEY
[ ] SEC-01  Audit git history for .env; confirm .gitignore excludes it
[ ] SEC-02  Remove ?mock=1 signature bypass in eSewa success route (live mode)
[ ] SEC-03  Add authentication to /api/receipts/download
[ ] SEC-04  Add authentication + rate limiting to /api/receipts/resend
[ ] SEC-05  Add HMAC verification to eSewa failure callback
[ ] BUG-01  Add WHERE payment_status = 'pending' guard on Stripe status updates
[ ] BUG-02  Move eSewa payment_events insert to after donation update
[ ] BUG-09  Ensure receipt number RPC (migration 012) is applied in production
[ ] PERF-02 Convert Stripe webhook receipt generation to fire-and-forget
[ ] ARCH-05 Add startup validation: confirm payment_events table exists
[ ] DB-01   Confirm payment_events table migration is applied; remove silent fallthrough
```

---

## Appendix A: File Map

| File                                              | Role                                              |
| ------------------------------------------------- | ------------------------------------------------- |
| `components/donation-form.tsx`                    | Client-side donation UI                           |
| `lib/actions/donation.ts`                         | Server action: initiate donation + redirect       |
| `lib/payments/stripe.ts`                          | Stripe checkout creation + session verify         |
| `lib/payments/khalti.ts`                          | Khalti payment initiation                         |
| `lib/payments/esewa.ts`                           | eSewa v2 form payment initiation                  |
| `lib/payments/config.ts`                          | Provider config, mode detection                   |
| `lib/payments/security.ts`                        | Validation, masking, logging utilities            |
| `app/api/payments/stripe/verify/route.ts`         | GET: Stripe session verify + donation update      |
| `app/api/payments/khalti/verify/route.ts`         | POST: Khalti lookup + donation update             |
| `app/api/payments/esewa/success/route.ts`         | GET: eSewa success callback (HMAC verify)         |
| `app/api/payments/esewa/failure/route.ts`         | GET: eSewa failure callback                       |
| `app/api/webhooks/stripe/route.ts`                | POST: Stripe webhook handler                      |
| `app/api/receipts/download/route.ts`              | GET: PDF generation + download (unauthenticated)  |
| `app/api/receipts/resend/route.ts`                | POST: Receipt email resend (unauthenticated)      |
| `lib/actions/donation-receipt.ts`                 | Server actions: generate receipt, get for display |
| `lib/receipts/service.ts`                         | Receipt storage, email trigger                    |
| `lib/receipts/generator.ts`                       | Receipt number, HTML generation                   |
| `lib/receipts/pdf-generator.ts`                   | Puppeteer PDF generation                          |
| `lib/email/receipt-mailer.ts`                     | Nodemailer/Gmail SMTP                             |
| `app/(public)/donate/success/success-content.tsx` | Donation success page + polling                   |
| `app/(public)/complete-payment/page.tsx`          | Conference payment completion page                |

---

_Report prepared for internal review. All referenced line numbers are based on the codebase state as of March 2, 2026._
