# Payment journey, security and regression review

Reviewed 2026-10-12. Companion to plan.md, schema-review.md and todo.md. Planning only: no application/schema changes, data deletion, payment submissions or test-suite runs.

## Evidence and scope

Reviewed donation entry/form/bank/success/cancel flows, provider/status/receipt entry points, event registration/confirmation methods, financial admin actions, conference retirement dependencies and existing plan contracts.

Local `GET http://localhost:3000/donate` returned 200 and contained the donation form. The computer-use tool failed to initialize (`failed to write kernel assets`), so this is NOT a rendered visual, keyboard, screen-reader or interaction audit. CSS/DOM source findings require browser verification. Live Supabase definitions, provider dashboards and actual schedules remain unverified.

Effective owner instructions: real payments are not enabled; donation/event records are test data and may be cleared; conference is retired and its exclusive tables may be removed. Keep active event features, definitions, configuration, ticket types/templates and unrelated site content. Reset records and retire code only during approved implementation, not this review.

## What needed changing in the plan

1. Define donor-facing states and safe next actions, not only database correctness. A lookup outage must not look like a failed payment or invite another charge.
2. Separate registration state from payment state. Free, QR/manual, venue and online events have distinct legitimate behavior.
3. Include all alternate mutation paths. `app/api/events/confirm-stripe-session/route.ts` is not using the central service; it needs the same ownership/currency/idempotency/ledger guarantees.
4. Guest security must preserve legitimate recovery. Scoped receipt/status access must work after a provider redirect, refresh, delayed confirmation and emailed receipt without requiring donor accounts.
5. Retirement must precede table removal. Remove conference backend/cron/admin dependencies while preserving modern event-owned form components and useful URL redirects.
6. Agree on capacity semantics before changing it. Existing count checks and sold_count updates are not a complete atomic reservation policy. Do not silently change venue/QR seat entitlement while refactoring payments.
7. Add a concrete regression inventory and evidence gates. “No other feature affected” is a goal to verify, not something source inspection proves.

## Source findings affecting UX or flow

Terse locations below follow the web-interface review convention; runtime findings are explicitly not claimed.

- `components/donations/giving-options.tsx:20` — testing notice is unconditional and says only bank works; mode/method availability must drive copy and default selection.
- `components/donations/giving-options.tsx:14` — online defaults when providers are configured, even while copy directs visitors to bank; clarify sandbox versus available real method.
- `components/donations/donation-form.tsx:198` — monthly option ignores allowRecurring and is offered for nonrecurring gateways; only show supported frequency.
- `components/donations/donation-form.tsx:76` — switching provider preserves the numerical amount without confirming currency; prevent unintended USD/NPR reinterpretation.
- `components/donations/donation-form.tsx:221` — Stripe symbol is always `$` even if defaultCurrency is NPR; derive labels, presets and summary from currency, not provider name.
- `components/donations/donation-form.tsx:94` — validation mainly uses toasts; plan inline errors, associated descriptions and focus recovery without losing input.
- `components/donations/donation-form.tsx:226` — custom amount lacks a name; align field semantics and server precision rules rather than silently rounding donor input.
- `components/donations/bank-transfer-panel.tsx:81` — submitted screen lacks visible tracking reference/status recovery; add scoped confirmation reference without calling the payment verified.
- `app/(public)/donate/success/success-content.tsx:484` — verification errors invite Try Again, which starts a fresh donation; unknown payment status should offer checking the existing attempt first.
- `app/(public)/donate/success/success-content.tsx:525` — every non-completed donation is described as processing for a few seconds; review/failed/refunded need distinct messages and actions.
- `app/(public)/donate/success/success-content.tsx:302` — payment polling interval lacks effect cleanup; cap and cancel requests on navigation, changes and unmount. Receipt polling already has cleanup and should be preserved.
- `app/(public)/donate/cancel/page.tsx:25` — claims no charges were made without authoritative verification; describe checkout closure and allow checking the existing attempt.
- `app/api/events/confirm-stripe-session/route.ts:199` — currency mismatch rewrites expected currency and continues confirmation; this contradicts fail-closed verification.
- `app/api/events/confirm-stripe-session/route.ts:220` — direct confirmation skips shared ledger contract; current guard excludes cancelled/expired but not a concurrently confirmed row, so two callers can proceed and increment sold_count.
- `app/api/events/confirm-stripe-session/route.ts:129` — missing stored session binding falls back to email match, not a uniquely persisted attempt. Same email is not proof the session belongs to this particular registration/ticket.
- `lib/actions/events-module/event-registration.ts:239` — capacity check counts paid records but some valid confirmed free/QR/venue records are unpaid/review; document and test business policy before changing counts.

Security findings F01-F15 and schema findings S01-S07 remain relevant. In addition to fixing visible text, the authoritative server state must prevent unauthorized approval, reference rebinding, double confirmation and loss of financial history. Do not hide a backend error behind reassuring UI copy.

## Desired donor journeys

### Online one-time donation

1. Visitor sees accurate sandbox/live availability and chooses a supported provider/currency and amount. No silent conversion when switching currency.
2. Review summary clearly shows total, currency, frequency and destination provider. Required fields have inline recoverable errors.
3. One submit creates or resumes one persisted attempt. Duplicate clicks, refreshes and network timeouts do not create additional charges.
4. Provider redirect carries attempt binding, not payment authority. Return page checks a scoped status endpoint.
5. Confirmed payment shows amount/reference and receipt state. Receipt generation or email delay is separate from successful payment.
6. Pending/unknown offers Check status and a support reference. Actual provider failure offers retry after confirming no successful collection; never a blind new charge.

### Manual bank donation

1. Choose account; copy/read exact account details and currency. Transfer money through the user's bank.
2. Record amount/reference/date/proof with clear accepted file types/limit. Upload failure preserves text fields and a safe retry path.
3. Submission says Details received, awaiting bank verification; show a tracking reference and next steps. The two-working-day promise needs an operational owner, not hardcoded certainty.
4. Authorized admin matches statement/account/reference/money and checks reuse. Confirm/reject with recorded reason; receipt only after confirmed funds.
5. Donor can recover a scoped status/receipt through a verified delivery link; knowing another email/reference cannot grant access.

### Monthly donation

Offer only when admin settings and the provider support it. Display recurring amount/currency, schedule and cancellation route before redirect. Store subscription lifecycle separately from each collection. Every paid invoice gets its own payment/receipt; renewal failure does not erase prior gifts. Avoid initial checkout/invoice double issuance.

### Closing checkout or losing connectivity

Closing a tab, visiting cancel or losing a response does not prove payment failed. Keep server state pending/unknown until verified. Recover/check the existing attempt; do not reuse the cancel URL to mutate it. Poll with a deadline, cleanup and a manual recheck. Never keep a browser spinning indefinitely or equate a fetch error with a declined charge.

## Donor-visible state contract

| Authoritative result | Message / permitted action | Financial effect |
|---|---|---|
| Attempt created, provider pending | Awaiting payment; resume/check original attempt | No credited collection |
| Lookup unavailable / timeout | Unable to check yet; check again or contact with reference | No new inferred financial transition |
| Verified paid | Donation confirmed; receipt ready or being prepared | Exactly one collection |
| Amount/currency mismatch / uncertain evidence | Needs review; contact support, avoid paying again | No automatic credit |
| Verified failed/expired with no paid collection | Payment unsuccessful; safe retry | New attempt allowed with same intent |
| Checkout closed | Checkout closed; check payment status | No failure inferred from navigation |
| Bank submission awaiting statement | Details received; awaiting verification | No paid claim |
| Full/partial refund or dispute | Original payment plus adjustment/support route | Preserve original collection and adjustments |

Internal statuses can differ between donations and registrations. Use explicit adapters to this user-facing contract, not one blanket rename of every `confirmed` or `unpaid` string.

## Event journeys that must survive

| Method | Current source behavior | Preservation / regression requirement |
|---|---|---|
| Free | Registration confirmed, payment unpaid | No gateway or payment receipt required; confirmation email/custom fields still work. |
| Online | Registration pending, payment unpaid until verified | Safe session recovery, exact ticket amount/currency, no duplicate confirmation/email/capacity changes. |
| QR / manual bank | Registration confirmed, payment review | Preserve instructions, screenshot/bank alternatives and manual review; no false paid claim. Resolve seat policy separately. |
| Pay at venue | Registration confirmed, payment unpaid | Preserve admission/payment-due messaging; allow authorized on-site reconciliation without online checkout. |

Test enabled/disabled method settings, ticket sales windows, capacity, registration close dates, duplicate-email policy, waitlist/cancellation/expiry, dynamic schema versions, repeating/file fields, custom responses, consent and email templates. Not every ticket-like state requires a verified monetary payment; free registration is a legitimate confirmed/unpaid combination.

## Guest access design checks

- Scoped capability is bound to one intent/attempt or receipt and permitted operation. Valid provider proof establishes binding; email/UUID alone does not.
- Return navigation, guest refresh, cross-tab behavior and email receipt links have an explicit recovery path. Do not introduce a donor login requirement unintentionally.
- No reusable bearer secret in analytics, logs, referrer headers or unsanitized support links. Use private/no-store responses for donor data and deliberate token lifetime/renewal.
- Receipt token expiry does not erase payment; secure renewed access comes from verified ownership/delivery. Logout/access revocation works for admin proof links.
- Do not store provider secrets in browser state or request donor card details on this site. Keep hosted checkout.

## Regression boundary map

| Shared area | Risk from payment work | Required scope control/evidence |
|---|---|---|
| Events form builder and field registry | Conference cleanup deletes reused components/types/templates | Read retirement manifest and active imports; preserve modern event files and all field keys, schema/version behavior. |
| Registration/payment admin | Removing conference changes polymorphic selectors/exports/status actions | Donation/events lists, filters, pagination, details, archive, review, export and empty states still work. |
| Ticket capacity | Payment callback, manual confirmation, cancellation increment/decrement inconsistently | Atomic transition and explicit reservation policy; concurrent last-seat and replay cases tested. |
| Email/templates | New queue or authorization affects other notifications | Isolate payment jobs; preserve event registration/confirmation/cancellation and contact/support mail. |
| Auth/admin helpers | Global role restriction affects CMS and other admin features | Finance-specific authorization changes unless wider behavior explicitly intended; verify authorized nonfinance workflows remain usable. |
| Site settings | Overwriting payments/settings JSON removes unrelated keys | Update owned keys only; preserve CMS, event settings and organization details. |
| Storage | Cleanup/private policy affects event uploads or shared assets | Exact buckets/object prefixes; preserve event screenshots/form uploads, CMS images and media downloads. |
| Public layout/CSS/a11y | Broad contrast/CSP changes break other pages or receipt preview | Scoped CSS; verify navbar/footer/home/events, receipt blob preview, contrast settings and reduced motion. |
| Cron/monitoring | Retired conference cron persists or new jobs exceed hosting limits | Remove old scheduler target; explicitly configure supported cadence and observe runs. |
| Routes/links | Conference retirement or token changes break emailed links | Keep intentional redirects; test expired/invalid new links and legitimate donation/event recovery. |
| Analytics/verification page | New status/token fields leak donor data or removal breaks receipt QR | Preserve privacy-safe measurement and public receipt-verification purpose; never expose full donor details publicly. |

“Entire plan” here covers payment journeys and their dependency boundaries. It is not an audit of every unrelated site feature. Discover additional consumers through imports, table/function usage and runtime evidence before widening implementation scope.

## Verification gates

1. Before code: capture current flow fixtures/contracts; inspect live metadata; identify exclusive conference objects and exact reset manifest. Keep checkout dummy.
2. Before schema removal: all conference runtime consumers retired, modern event components/templates and useful redirects preserved.
3. Before central confirmation migration: test each event method's independent registration/payment state, ownership, exact currency, duplicate/concurrent events and capacity behavior.
4. Before guest-access rollout: authorized recovery/receipt cases plus wrong owner, expired token, leaked UUID/email, unavailable provider and manual bank flows pass.
5. Before release: keyboard/focus/screen-reader, mobile/desktop/200% zoom, normal/dark/high/inverted contrast and reduced motion; all money/recovery/security tests and unrelated-feature smoke checks appropriate to shared changes pass.

Tests are future acceptance requirements, not results. Under AGENTS.md no lint/typecheck/formatter/test suites run until explicitly requested. Require actual evidence before claiming other features unaffected. A read-only HTTP 200 is not an end-to-end pass.

## Decisions still needed before dependent implementation

- Exact capacity reservation policy for online pending, QR review and pay-at-venue; default preserves visible method behavior until agreed.
- Whether FINANCE may approve versus view; current proposal keeps ADMIN/SUPER_ADMIN approval.
- Guest capability lifetime/recovery channel, provider scope, cancellation/refund policy and manual review turnaround owner.
- Explicit automated verification authorization and live schema inspection access. No new paid integration or donor account requirement assumed.

Reference used for source-level UI review: https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md. Site-specific accessibility requirements take precedence over generic formatting preferences.
