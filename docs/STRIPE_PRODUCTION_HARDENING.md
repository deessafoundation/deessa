# Stripe Production Hardening — Status & Answers

Audit + fixes, verified against the actual code on 2026-07-24. TL;DR: the payment
core was already built to a high standard. Only two real gaps existed — a missing
idempotency key on session creation, and the receipt-email error being swallowed.
Both are now fixed. Everything else below is confirmation with file/line evidence.

---

## Receipt email 500 — fixed

**Root cause:** not a code bug in the route — Gmail is **rejecting the app
password**. Your own server log showed it:

```
Receipt email error: Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

`535-5.7.8` = wrong/expired Gmail app password. This happened because 2-Step
Verification was toggled off at some point, which **revokes every existing app
password**. The value in `.env.local` is stale.

**What I fixed in code (so failures are diagnosable, not silent):**

1. [lib/email/receipt-mailer.ts](../lib/email/receipt-mailer.ts) — the catch block now
   includes the real SMTP error text in its return message instead of a generic string.
2. [lib/receipts/service.ts](../lib/receipts/service.ts) — `sendReceiptToDonor` was
   flattening that detail back to `"Failed to send receipt email"`; it now propagates
   the real reason.
3. [app/api/receipts/resend/route.ts](../app/api/receipts/resend/route.ts) — returns a
   meaningful status (409 for "receipt not generated", **502** for an upstream
   email-provider failure) instead of a bare 500, and logs the reason server-side.
4. [components/receipt-preview.tsx](../components/receipt-preview.tsx) — reads `data.error`
   (the field the API actually returns) and shows it in the toast.

**What you must do (only you can — it's a credential):**

```bash
node scripts/test-gmail.mjs
```

That isolates the Gmail auth. If it prints `535`, generate a **fresh** app password
at myaccount.google.com/apppasswords (2FA must be ON first), put it in `.env.local`,
restart the dev server, and re-run until it prints ✅. Then Resend Email works.

---

## 1. Sandbox → live keys: exactly what changes

| Thing | Test / sandbox | Live |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_…` | `sk_live_…` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` | `pk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | from `stripe listen` (ephemeral, local only) | from the **Dashboard webhook endpoint** you register (different value) |
| Account state | works instantly | requires **activation** (business + bank details verified) |

**The webhook secret is the #1 thing people get wrong.** The `whsec_…` that
`stripe listen` prints only exists while that terminal is running and is **not** the
production secret. In production you register `https://deessafoundation.com/api/webhooks/stripe`
in Dashboard → Webhooks, select the 9 events this code handles (see §4), and copy
*that endpoint's* signing secret into Vercel.

**What typically breaks in the transition:**
- Live webhook not registered → money is taken but donations stay `pending` forever
  (no confirmation event ever arrives).
- Wrong/ephemeral webhook secret → every event fails signature verification (400).
- `NEXT_PUBLIC_APP_URL` still `localhost` → receipt links and success/cancel URLs
  break. `NEXT_PUBLIC_*` is baked at build time — set it in Vercel and **redeploy**.
- Account not activated → live charges are refused outright.
- Test-mode event hitting a prod deploy → explicitly rejected at
  [route.ts:447](../app/api/webhooks/stripe/route.ts) (`livemode === false` guard).

Full click-by-click steps: [stripe_production_guide.md](../stripe_production_guide.md).

---

## 2. Insufficient funds & other declines

**Confirmed: when a card is declined, Stripe never captures money.** The
PaymentIntent stays in a non-succeeded state, no funds move, and — because this app
uses **Stripe-hosted Checkout** — the donor stays on Stripe's page and sees the
decline reason. They never reach `/donate/success`, so no donation is ever marked
complete. Our `payment_intent.payment_failed` webhook records the failed attempt
([route.ts:582](../app/api/webhooks/stripe/route.ts)).

**Important architectural point:** with hosted Checkout you do **not** write
decline-code handling yourself — Stripe's page renders the correct localized message
per decline reason automatically. The table below is what Stripe shows / what you'd
map **if you later switch to embedded Payment Element** (where declines surface in
your own `stripe.confirmPayment()` result as `error.decline_code`):

| Case | `code` / `decline_code` | Money moved? | Message to show |
|---|---|---|---|
| Insufficient funds | `card_declined` / `insufficient_funds` | No | "Your card was declined for insufficient funds. Try another card." |
| Expired card | `expired_card` | No | "Your card has expired. Please use a different card." |
| Wrong CVC | `incorrect_cvc` | No | "The security code (CVC) is incorrect." |
| Transient processor error | `processing_error` | No | "A temporary error occurred. Please try again." |
| 3DS/SCA required | `authentication_required` | No (until authenticated) | "Your bank needs to verify this payment." (Checkout handles the 3DS step) |
| Generic decline | `card_declined` (other) | No | "Your card was declined. Please try another payment method." |

Test these with Stripe's decline cards: `4000000000009995` (insufficient funds),
`4000000000000069` (expired), `4000000000000127` (wrong CVC),
`4000002500003155` (3DS required). Use `stripe listen` locally and watch
`payment_intent.payment_failed` land.

---

## 3. No double or partial charges

- **Idempotency key on creation (added this pass):**
  [stripe.ts:277](../lib/payments/stripe.ts) — both `checkout.sessions.create` calls now
  pass `{ idempotencyKey: checkout_<donationId>_<mode> }`. A retried create (SDK
  retry, network blip, double-invoked action) returns the **same** session instead
  of a second one → no duplicate checkout.
- **Client double-submit:** the Donate button is `disabled` while `isLoading`
  ([donation-form.tsx:425](../components/donation/donation-form.tsx)), so a second click
  can't fire a second submit.
- **Webhook idempotency:** every handler inserts into `payment_events` keyed on the
  unique Stripe `event_id`; a duplicate insert hits `23505` and the event is skipped
  ([PaymentService.ts:352](../lib/payments/core/PaymentService.ts),
  [route.ts:521](../app/api/webhooks/stripe/route.ts)). A replayed event can't
  double-credit.
- **Race protection:** confirmation is a conditional
  `UPDATE … WHERE payment_status = 'pending'`
  ([PaymentService.ts:264](../lib/payments/core/PaymentService.ts)) — if two paths race
  (webhook + success-page fallback), only the first matches; the second re-reads and
  returns `already_processed`.

Partial charges aren't possible here: Checkout captures the full `unit_amount` or
nothing.

---

## 4. Trust the webhook, not the browser — confirmed

- A donation is only marked complete inside `PaymentService.confirmDonation`, reached
  **only** from a signature-verified webhook
  ([route.ts:433](../app/api/webhooks/stripe/route.ts), `constructEvent`) or from the
  success-page `/verify` fallback — and that fallback **re-retrieves the session from
  Stripe server-side** and requires `session.payment_status === "paid"` before
  confirming ([verify/route.ts:99](../app/api/payments/stripe/verify/route.ts)). Neither
  path trusts a browser claim.
- The success page itself only **polls read-only** for status
  ([success-content.tsx:274](../app/(public)/donate/success/success-content.tsx)); it never
  writes `completed`.
- Handled events: `checkout.session.completed`, `checkout.session.expired`,
  `payment_intent.payment_failed`, `customer.subscription.created`,
  `invoice.payment_succeeded`, `invoice.payment_failed`, `charge.refunded`,
  `charge.dispute.created`. Refund/dispute flip the donation off `completed`
  ([route.ts:872](../app/api/webhooks/stripe/route.ts)) so totals and receipts stay honest.

---

## 5. Amount integrity — confirmed

- The charge amount is computed **server-side** from the donation row, never from a
  client-supplied amount. `unit_amount` is integer minor units via
  `Math.round(amount * 100)` after 2-dp validation
  ([stripe.ts:262](../lib/payments/stripe.ts)); min > 0 and max `999,999.99` enforced.
- On confirmation, the amount from Stripe is re-verified against the stored donation
  in **minor units, fail-closed** — any mismatch routes to `review` (never silently
  accepted) and fires an admin alert
  ([PaymentService.ts:540](../lib/payments/core/PaymentService.ts)). Currency is verified
  the same way.

---

## 6. Reliability

- **Fast webhook ack:** confirmation runs, then a 2xx is returned; receipt generation
  is fire-and-forget and never blocks or fails the webhook response
  ([route.ts:108](../app/api/webhooks/stripe/route.ts)). A genuine confirmation failure
  returns 500 so **Stripe retries** (its built-in backoff) rather than dropping the event.
- **Stripe IDs stored for reconciliation:** `payment_id`, `provider_ref`,
  `stripe_session_id`, `stripe_subscription_id`, plus a `payments` row with
  payment-intent / session / customer / invoice IDs
  ([PaymentService.ts:244](../lib/payments/core/PaymentService.ts)).
- **Every transition logged:** `logStateTransition`, `logConfirmationSuccess/Failure`,
  `logAmountMismatch`, etc. ([PaymentService.ts](../lib/payments/core/PaymentService.ts)).
- **3DS/SCA:** hosted Checkout runs the 3DS challenge on Stripe's page, so European
  SCA cards complete normally; the `authentication_required` case never silently fails.
- **Orphan safety net:** `/api/cron/reconcile-payments` exists to catch payments whose
  browser never returned — **schedule it in `vercel.json`** before going live (it's
  written but not yet scheduled). See the go-live guide.

---

## 7. Security — confirmed

- **Secret key server-only:** `STRIPE_SECRET_KEY` is read only in server files
  (`lib/payments/stripe.ts`, webhook route) — never in a `NEXT_PUBLIC_*` var, never
  shipped to the browser.
- **Publishable key** is the only client-exposed key (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`),
  and hosted Checkout doesn't even require it in the redirect flow.
- **Webhook signature verified on every event** before any processing
  ([route.ts:433](../app/api/webhooks/stripe/route.ts)); missing/invalid signature → 400.
- **PCI scope minimized:** raw card data is entered on Stripe's hosted Checkout page and
  **never touches our server or database** — this keeps you in the lowest PCI tier
  (SAQ A). Don't switch to raw-card collection.
- **No secrets logged:** logs carry donation IDs, Stripe IDs, and amounts — never card
  data or secret keys. Rate limiting guards `/verify`, `/receipts/download`,
  `/receipts/resend`.

---

## Remaining go-live checklist (not code — config only)

- [ ] Fresh Gmail app password → `node scripts/test-gmail.mjs` prints ✅
- [ ] Stripe account activated (business + bank account)
- [ ] Live keys in Vercel (`sk_live_`, `pk_live_`)
- [ ] Live webhook endpoint registered + its signing secret in Vercel
- [ ] `NEXT_PUBLIC_APP_URL=https://deessafoundation.com` in Vercel, redeployed
- [ ] `reconcile-payments` cron added to `vercel.json`
- [ ] One real small live donation, end-to-end, verified in DB + inbox

Note (unrelated to Stripe, from earlier in this project): Stripe does not operate in
Nepal — activating a **live** account requires a legal entity in a Stripe-supported
country. Confirm which entity owns the Stripe account before live keys.
