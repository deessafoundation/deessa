# Payment Systems Security Audit — deessa Foundation

**Auditor role:** Senior payment systems / application security engineer, pre-launch review.
**Scope:** Every payment-related file, trigger point, and state transition in the actual codebase.
**Date:** 2026-07-24

> **Correction to the request template:** the analysis prompt this audit was requested
> from describes a Django/Java stack. The actual codebase is **Next.js 16 (App Router,
> TypeScript) + Supabase (Postgres/Auth/Storage)**, deployed on Vercel. This audit is
> against the real code, file paths and function names cited throughout.

---

## 1. Architecture Map

### 1.1 Flow — donation, from click to "completed"

```
DONOR                                    YOUR SERVER                              PROVIDER
─────                                    ───────────                              ────────

DonationForm.tsx
  "Donate $50"
       │
       ▼
startDonation()  ───────────────────►  lib/actions/donation.ts
 (server action)                       ├─ validate amount, email, name
                                        ├─ getSupportedProviders(settings) ◄── provider is
                                        │   filters client's requested        RE-VALIDATED
                                        │   provider against env+settings     server-side,
                                        │   (client cannot force an           not trusted
                                        │   unconfigured/cheaper path)
                                        ├─ INSERT donations
                                        │    (payment_status='pending',
                                        │     amount from FORM, not yet
                                        │     provider-verified)
                                        │
                                        ├─ if stripe → lib/payments/stripe.ts
                                        │    stripe.checkout.sessions.create()
                                        │    ── redirectUrl ──────────────────►  Stripe
                                        │                                       Checkout
                                        ├─ if esewa  → lib/payments/esewa.ts
                                        │    HMAC-signs form, POSTs ───────────► eSewa
                                        │
                                        └─ if khalti → lib/payments/khalti.ts
                                             /epayment/initiate/ ─────────────► Khalti
                                                                                    │
  ◄─────────────────────────────────────────────────────────────────────  redirect
  donor pays on PROVIDER'S page (never touches deessa's server with card data)
                                                                                    │
       ┌────────────────────────────────────────────────────────────────────────┘
       │ (browser redirect — UNTRUSTED, only used to send donor back)
       ▼
/donate/success?session_id=...
   (client polls, read-only)
       │
       ├─ GET /api/payments/stripe/status   ─┐
       │                                      │  read-only status checks;
       │                                      │  NEVER writes 'completed'
       └─ if still pending, GET /verify ─────►│
                                               │
                                               ▼
                                    app/api/payments/stripe/verify/route.ts
                                    ├─ re-fetches session FROM STRIPE (server-side)
                                    ├─ requires session.payment_status === "paid"
                                    └─ routes through PaymentService (same path as webhook)

  ═══════════════════ THE ONLY PATH THAT WRITES "completed" ═══════════════════

  PROVIDER ──(signed/verified event)──► webhook / callback route
                                             │
                                             ▼
                          app/api/webhooks/stripe/route.ts       (signature verified)
                          app/api/payments/esewa/success/route.ts (HMAC verified + status lookup)
                          app/api/webhooks/khalti/route.ts        (pidx → lookup API, no signed
                                                                    webhook exists from Khalti;
                                                                    see §5 Khalti)
                                             │
                                             ▼
                          lib/payments/core/PaymentService.confirmDonation()
                          ├─ checkIdempotency(provider, eventId)     → payment_events table
                          ├─ validateStateTransition(pending→confirmed)
                          ├─ verifyAmount()   fail-closed, minor units
                          ├─ verifyCurrency() fail-closed
                          ├─ UPDATE donations
                          │    SET payment_status='completed'
                          │    WHERE id=? AND payment_status='pending'  ← race-safe
                          ├─ INSERT payments (audit row: all provider IDs)
                          ├─ INSERT payment_events (idempotency ledger)
                          └─ generateReceiptForDonation()  (fire-and-forget, non-blocking)
```

### 1.2 Where payments are triggered from

| Trigger | Shared or duplicated? |
|---|---|
| Donation form (`/donate`) | Shared — `lib/actions/donation.ts` → provider-specific `lib/payments/{stripe,esewa,khalti}.ts` |
| Conference registration | **Partially duplicated.** Confirmed via code comment in `app/api/webhooks/stripe/route.ts`: *"Conference payments use a separate flow from donations and have not yet been migrated to use PaymentService. Future work: Refactor conference payments to use PaymentService for consistency."* This is a known, self-documented gap, not a hidden one. |
| Admin manual status change | `lib/actions/admin-donation-actions.ts` → `changePaymentStatus()` — separate code path, gated by role, **does** write to the same `status_change_log` + `payment_events` audit trail |
| Bank transfer confirmation | `lib/actions/admin-donation-actions.ts` (same `changePaymentStatus`) — the only "gateway" that is inherently manual, by design (no API to verify against) |
| Reconciliation cron | `lib/payments/reconciliation.ts` — shares `PaymentService.confirmDonation()`, so it goes through the same idempotency/verification path as a live webhook |

**Verdict on §4 (Architecture & Design) questions:**
- **Single abstraction layer exists**: `BaseProviderAdapter` (`lib/payments/adapters/ProviderAdapter.ts`) with `StripeAdapter`, `EsewaAdapter`, `KhaltiAdapter` implementations, all normalized into one `VerificationResult` shape consumed by one `PaymentService`. This is a genuine strategy pattern, not gateway logic leaking into views.
- **Adding a 4th gateway**: implement one adapter class (`verify()`, `extractMetadata()`, `normalizePayload()`) + one thin route to receive its callback. `PaymentService` needs zero changes. This is a well-designed extension point.
- **Reusing for a 3rd use case**: the donation path is fully on `PaymentService`; conference is not (see gap above) — reusing for a genuinely new use case today means repeating the conference pattern (bad) unless conference is migrated first (recommended, see Next Steps).
- **Gateway selection tamper-check**: client sends `provider` string in the form payload, but `startDonation()` immediately re-validates it against `getSupportedProviders(settings)` — server-computed from env vars + DB settings, not client-controlled. A request for an unconfigured/disabled provider silently falls back to the first *available* one; it cannot force a "cheaper/unverified" path because no such path exists — all three providers go through the identical `PaymentService.confirmDonation()`.
- **Amount/currency ever trusted from client?** No. `startDonation()` computes `unit_amount` server-side from the donation row; `PaymentService.verifyAmount()`/`verifyCurrency()` re-checks the *provider's own reported amount* against that row in integer minor units, fail-closed to `review` on any mismatch (`PaymentService.ts:540`).
- **Single source of truth table?** Yes — `donations` (state) + `payments` (provider IDs, supplementary) + `payment_events` (idempotency ledger). All three gateways and bank-transfer write into the same tables.

### 1.3 State transitions

```
pending ──► completed   (only via PaymentService.confirmDonation, WHERE payment_status='pending')
pending ──► review      (amount or currency mismatch — never silently accepted)
pending ──► failed      (payment_intent.payment_failed / decline / expiry)
completed ──► completed (charge.refunded, charge.dispute.created — see gap in §3 below)
```
Enforced in `PaymentService.validateStateTransition()` (`PaymentService.ts:622`): `confirmed→pending`, `confirmed→failed`, `failed→confirmed` are all explicitly rejected, not just "not implemented."

---

## 2. Critical Issues (severity-ranked)

### 🔴 CRITICAL — Supabase service_role key committed to git history
The project's own `README.md` already discloses this: the service_role key was hardcoded in `scripts/run-stories-seed.mjs`, `scripts/fix-initiative-images.mjs`, `scripts/insert-podcasts.mjs`. I verified directly:
```
git log --all -S "eyJhbGciOiJ" -- scripts/   →  4 matching commits
grep "eyJ" scripts/run-stories-seed.mjs      →  0 matches (removed from working tree)
```
**The key is gone from the working tree but still fully recoverable from git history** by anyone with clone access. This key bypasses Row Level Security entirely — it can read/write every donation, every donor email, every payment record.
**Fix:** Rotate the service_role key in Supabase Dashboard → Settings → API *today*, regardless of anything else in this report. Removing it from history (`git filter-repo` / BFG) is good hygiene but does not un-leak an already-rotatable secret — rotation is the actual fix.

### 🔴 CRITICAL (until fixed) — Gmail app password currently invalid
Confirmed from your own server log this session: `Invalid login: 535-5.7.8 Username and Password not accepted`. Every donor is currently receiving **no receipt email** and every Resend attempt fails. This happened because 2-Step Verification was toggled off at some point, which Google uses to auto-revoke every existing app password.
**Fix:** `node scripts/test-gmail.mjs` (added this session) isolates the credential test — confirm 2FA is on, generate a fresh app password, update `.env.local`/Vercel, re-run until it passes.

### 🟠 HIGH — Reconciliation cron exists but is not scheduled
`lib/payments/reconciliation.ts` and `app/api/cron/reconcile-payments/route.ts` are fully implemented, `CRON_SECRET`-gated, and safe to call. `vercel.json` only schedules `expire-conference-registrations`. **This directly answers your own §7 question** ("does the order sit as pending forever, or is there a reconciliation job") — the job exists but currently never runs. A donor who closes their tab mid-Khalti/eSewa flow (no signed webhook for either — see below) stays `pending` forever with real money already moved, until someone manually notices.
**Fix:** add to `vercel.json`:
```json
{ "path": "/api/cron/reconcile-payments", "schedule": "0 * * * *" }
```

### 🟠 HIGH — Khalti has no webhook at all; confirmation depends on the donor's browser returning
This is architecturally different from Stripe/eSewa and worth stating plainly: Khalti (as of this integration) does not push a signed server-to-server event. `app/api/webhooks/khalti/route.ts` exists and is wired through `PaymentService`, but nothing ever calls it — Khalti has no signature to verify in the first place (confirmed: `KhaltiAdapter.ts` has no signature-verification method, only `lookupTransactionInternal()`, a pull-based check). Confirmation only happens when the donor's browser returns to `/api/payments/khalti/verify`, which **is** implemented correctly (re-queries Khalti's `/epayment/lookup/` server-side, doesn't trust the query string) — but if the donor never returns, nothing confirms the payment until reconciliation runs. Combined with the previous issue (cron not scheduled), Khalti donations that don't complete the browser round-trip are currently **invisible indefinitely**.
**Fix:** schedule the reconciliation cron (above) — it's the actual mitigation for this, since Khalti offers no better alternative. Not a bug in your code; a real limitation of Khalti's API that your code already correctly compensates for, once the cron runs.

### 🟡 MEDIUM — Conference payments bypass the centralized state machine
Already self-documented in code (see §1.2). Means: whatever protections `PaymentService` gives donations (fail-closed amount/currency check, `payment_events` idempotency) are **not automatically guaranteed** for conference payments unless independently re-implemented in that path. I did not find evidence of a *duplicate* amount-mismatch check in the conference branch — worth explicit verification before conference goes live with real registration fees, not just donations.

### 🟡 MEDIUM — Refund/dispute webhook exists but wasn't in your original 9-event list until this session
`charge.refunded` / `charge.dispute.created` handlers exist in `app/api/webhooks/stripe/route.ts` and correctly resolve the donation via `payment_id` fallback lookup if metadata is absent. Confirmed present and wired to flip status off `completed`. Listed as MEDIUM only because it depends on you having actually registered these two events in the **live** Stripe Dashboard webhook config (a deploy-config step, not a code gap) — verify this explicitly when you set up the live endpoint.

---

## 3. Important, Non-Critical Issues

1. **Rate limiting is fail-open by design** (`lib/rate-limit.ts` header comment: *"fail-open strategy (allows requests if rate limiting system fails)"*). Reasonable tradeoff for a nonprofit at this scale — flagging so it's a conscious choice, not a surprise. If the `rate_limits` table or its RPC ever breaks, abuse protection silently disappears rather than blocking legitimate donors. Fine to leave as-is; just know it.
2. **`payments` table insert is non-fatal on failure** (`PaymentService.ts:341`, `console.warn` only). This is your richest reconciliation record (payment_intent_id, session_id, customer_id, invoice_id). If this insert silently fails repeatedly, you lose reconciliation detail while the donation itself still correctly shows `completed`. Not urgent, but worth an occasional log-grep.
3. **eSewa signature check trusts `signed_field_names` from the payload itself** to decide which fields to verify (`EsewaAdapter.ts:299`), rather than a hardcoded field list. It does separately enforce that the three required fields are present in that list (`EsewaAdapter.ts:302`), which closes the obvious "sign nothing" bypass. Still, a stricter version would hardcode the expected field set entirely rather than reading it from attacker-influenced input. Low priority given the required-fields check already exists.
4. **Donation form's provider fallback is silent** (`donation.ts:56-59`): if the client requests a disabled provider, the code substitutes another one and only `console.warn`s server-side — the donor isn't told their chosen method changed. Not a security issue (server-side re-validation is correct), but a UX/trust issue worth a user-facing message.

---

## 4. What's Already Done Well (don't break this while fixing the rest)

- **Real strategy pattern**, not gateway-specific spaghetti in route handlers — `BaseProviderAdapter` + three adapters + one `PaymentService`.
- **Fail-closed amount/currency verification** on every single confirmation path (webhook AND success-page fallback), in integer minor units to avoid float comparison bugs.
- **Idempotency via a dedicated `payment_events` ledger** keyed on unique provider event IDs, checked *before* any state-changing logic runs — correctly handles Stripe's documented at-least-once webhook delivery.
- **Race-condition-safe confirmation**: conditional `UPDATE ... WHERE payment_status='pending'` means two simultaneous confirmation attempts (webhook + success-page fallback both firing) cannot double-process; the loser correctly re-reads and returns `already_processed`.
- **eSewa HMAC verification uses `crypto.timingSafeEqual`** — correctly resistant to timing attacks, not a naive `===` string compare.
- **PCI scope is correctly minimal**: card data is entered on Stripe's own hosted Checkout page. Your server never receives, logs, or stores card numbers/CVV — you're in SAQ A, the simplest PCI tier, and nothing in the code moves you out of it.
- **Webhook signature verification is present and actually checked before parsing** (`stripe.webhooks.constructEvent`), with a defense-in-depth guard rejecting test-mode events if a prod deploy is accidentally pointed at test keys.
- **Idempotency key added on Stripe session creation this session** (`lib/payments/stripe.ts`) — a retried create-session call can no longer produce two checkout sessions for one donation.
- **Manual admin state changes are properly gated and audited**: `changePaymentStatus()` requires ADMIN/SUPER_ADMIN role, requires a written reason ≥10 characters, and logs to both `status_change_log` (who/when/why) and `payment_events` (system-wide event trail). This directly satisfies your §8 audit-trail question for the manual path.
- **Rate limiting is DB-backed, not in-memory** — correctly designed for a serverless multi-instance deployment (Vercel functions don't share memory between invocations; an in-memory rate limiter would silently do nothing).

---

## 5. Concrete Next Steps (priority order)

1. **Rotate the Supabase service_role key now.** Not code — a dashboard action. Do this before anything else in this list.
2. **Fix the Gmail app password.** Run `node scripts/test-gmail.mjs`, regenerate if it fails, confirm ✅ before considering receipts "working."
3. **Schedule the reconciliation cron** in `vercel.json` (one JSON block, shown above). This is the single highest-leverage code-adjacent fix — it's the actual safety net for Khalti's missing webhook and any donor who abandons a tab mid-payment on any provider.
4. **Verify the live Stripe webhook endpoint has all 9 events selected**, especially `charge.refunded` and `charge.dispute.created`, when you register the production endpoint (this is a Dashboard config step covered in `stripe_production_guide.md`).
5. **Decide on conference payments**: either explicitly accept they're out of `PaymentService`'s protections for launch (document that decision), or spend the migration effort before conference goes live with real registration fees.
6. **Add a review-alert / stuck-transaction notification** if one doesn't already reach a human inbox for `status='review'` — `PaymentService.ts` already calls `sendReviewAlert()` on mismatch; confirm that alert path is actually configured (email/Slack) and not silently going nowhere.

---

## 6. Direct Answer

> *"Given this is a 3-person student team on a nonprofit budget, is it safe to go live after addressing the critical issues, or is there a fundamental architectural problem that needs a rebuild first?"*

**No rebuild needed. This is genuinely above the bar for a student project** — the adapter pattern, fail-closed verification, idempotency ledger, and race-safe conditional updates are the same primitives a professional payments team would build. That's not faint praise: most first payment integrations *do* trust the client redirect, *do* skip idempotency, and *do* let two webhooks double-credit an order. This one doesn't.

What stands between this and safe-to-launch is **not architecture** — it's two credentials (service_role key rotation, Gmail app password) and **one missing cron schedule line**. Fix those three things, verify the live Stripe webhook registers all 9 events, and this is safe to take real donations with. The one open design question — conference payments sitting outside `PaymentService` — is worth a decision, not a rebuild: it's an isolated, already-documented gap in one use case, not a flaw in the payment core.
