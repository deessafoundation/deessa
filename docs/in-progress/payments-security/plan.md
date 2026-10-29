# Payment security and reliability plan

Status: proposed; analysis completed against repository source on 2026-10-11. Implementation, live database inspection and verification are pending.

Update 2026-10-12: user confirms current payments are dummy/test payments and real payments have not been allowed. Script-to-code architecture review is recorded in `schema-review.md`. In particular, ledger owner constraints do not support the event/conference callers as written, the SQL receipts table is not the active metadata path, and receipt numbering migrations have incompatible contracts. Resolve these contracts during T01/T08 before implementation. No SQL or application changes made.

User requested a fresh review and a plan first. Save this work here by user choice; leave the existing Facebook-post task files intact. Tasks are tracked in `todo.md` in this directory.

User clarification 2026-10-12: all donation data is sandbox data and may be discarded; user reports all scripts have been run sequentially in Supabase. Prefer a scoped reset of disposable donation records over complex legacy donation backfills where it simplifies implementation. This is permission to tolerate donation-data loss during the planned migration, not a request to delete data now. It does not authorize deleting event/conference records, shared settings, admin users or unrelated storage. Verify deployed definitions and foreign-key/storage dependencies before preparing the exact reset; script execution order alone does not resolve contradictory schema contracts.

Latest scope clarification 2026-10-12 supersedes the event/conference preservation assumptions below: user confirms conference is retired and permits deleting its records/tables; event records also contain no real data. Donation and event test transaction/registration data may be reset. Preserve the active events module, event definitions/configuration/templates, admin users and unrelated site content unless separately authorized. Target payment ownership is donation or event_registration only; do not add conference ownership merely to support retired code. Retire conference API/actions, callback branches, admin selectors and scheduled expiry callers before dropping their exclusive tables/FKs/settings/storage. Keep harmless old URL redirects where useful. Inspect modern-event dependencies before classifying conference-named schemas/templates/files as exclusive. No removal or database reset performed in planning.

## Goal in plain language

Full journey review 2026-10-12: `journey-and-regression-review.md` defines donor-visible status/recovery contracts, separate free/QR/venue/online event semantics, guest access requirements and a shared-feature regression matrix. It adds event Stripe fallback currency/identity/concurrency risks that must be addressed alongside the central service. Visual/interaction verification is pending; only the local Donate route's HTTP availability was checked.

Only the right people can see donor information or approve money. Every real payment is recorded once, with a reliable receipt. A fake callback, a repeated callback, an outage or a failed email must not produce a false payment record or lose a real payment.

Keep the current donation design and working bank-transfer workflow. Reuse the existing provider adapters and Supabase infrastructure. No security guarantee is implied by completing a checklist; production requires tested controls and continuing monitoring.

## Scope and limits

- Primary scope: donations, bank transfers, payment settings, provider callbacks, status polling, receipts, financial admin actions, database/storage access, recovery and deployment controls.
- Events and residual conference backend share adapters, callbacks, payment tables and admin actions. Retire conference consumers first; preserve active event functionality while resetting authorized test registration/payment records. Do not redesign unrelated UI or delete event configuration.
- No application code, schema, settings, credentials or deployed services changed in this review. No lint, formatting, typecheck, build, test suites, exploit requests or real transactions ran.
- Findings below are source-confirmed weaknesses or conditional deployment risks, not evidence of a successful attack. Live database grants, RLS policies, functions, applied migrations, credentials, provider dashboards and external schedulers have not been inspected.
- Follow repository rules: read local Next.js documentation before code; accessibility standards before UI edits; components ownership guide before structural component changes. Verification commands remain opt-in until explicitly requested.

## Current flow and trust boundaries

1. A visitor submits amount and donor details to a public server action.
2. Online creation checks enabled providers, inserts a pending donation with elevated database access, creates provider checkout, then stores its reference separately.
3. Provider webhook/callback or success-page verification retrieves provider evidence. Adapters normalize that evidence.
4. PaymentService compares amount and currency and conditionally updates a pending donation. Payment and event ledger inserts follow as separate database requests.
5. Receipt generation/email runs inline or through promises. The job-queue helper is only a placeholder.
6. Bank submission uploads a proof to private storage, inserts a pending donation and separately attaches bank metadata. An admin confirms against a statement.

Untrusted inputs include browser form values, URL parameters, callback bodies, file names/types, donation IDs and receipt numbers. Trusted authority must come from provider verification or an authorized bank reconciliation, never from a success URL or a screenshot. Service-role access bypasses RLS, so each server entry point needs its own authorization.

## Findings from the fresh review

| ID | Priority / confidence | Finding and practical effect | Source |
|---|---|---|---|
| F01 | P0 / confirmed | Public `getReceiptForDisplay` and `ensureReceiptSent` accept a donation ID without proving ownership; service-role queries return donor information or receipt links. IDs can leak even if hard to guess. | `lib/actions/donation-receipt.ts`; client calls in `app/(public)/donate/success/success-content.tsx` |
| F02 | P0 / confirmed | `reviewDonation` checks admin existence, not a permitted role or active status. Other financial actions enforce roles inconsistently and often omit active status. | `lib/actions/admin-donation-review.ts`; `admin-donation-actions.ts`; `admin-payment-actions.ts`; `archive-payment.ts` |
| F03 | P0 / confirmed | eSewa failure endpoint decodes untrusted data and marks a matched donation failed without signature/status verification. Its update lacks an expected-current-status guard, creating a race with successful confirmation. | `app/api/payments/esewa/failure/route.ts` |
| F04 | P0 / confirmed design gap; exploit not tested | Khalti verification can bind a supplied pidx to a supplied purchase_order_id before provider verification. The adapter derives donation identity from input rather than comparing the provider lookup's purchase_order_id. Equal amount/currency alone is not proof that the payment belongs to that donation. | `app/api/payments/khalti/verify/route.ts`; `lib/payments/adapters/KhaltiAdapter.ts` |
| F05 | P0 / conditional exposure | Multiple financial table migrations lack explicit RLS/grant restrictions; receipt audit insertion uses `WITH CHECK (true)`. Actual public exposure depends on live grants and policies. | `scripts/db/payments-v2/020` through `027`; migrations `009`, `010`, `030` |
| F06 | P1 / confirmed | The testing notice does not block checkout. Creation checks provider enablement but does not enforce recurring settings. Provider availability checks can pass without complete verification credentials; config validation is used by health/examples, not the donation creation gate. | `components/donations/giving-options.tsx`; `lib/actions/donation.ts`; `lib/payments/config.ts`; `validation.ts` |
| F07 | P1 / confirmed | Online input validation is incomplete and submission has no shared throttle. Bank limits use an arbitrary email address, and the shared limiter allows requests on errors. File MIME is supplied by the uploader rather than verified from content. | `lib/actions/donation.ts`; `bank-donation.ts`; `lib/rate-limit.ts` |
| F08 | P1 / confirmed | Donation state, ledger entries and event deduplication are not one transaction. A normal SELECT is described as locking but does not lock across the separate requests. Ledger failures are tolerated after the donation update. | `lib/payments/core/PaymentService.ts` |
| F09 | P1 / confirmed | Review approval writes `confirmed`; receipt generation requires `completed`. It writes `user.id` into `reviewed_by`, whose migration references `admin_users.id`. This can prevent approval or receipt generation depending on deployed schema/data. | `lib/actions/admin-donation-review.ts`; `donation-receipt.ts`; migration `030` |
| F10 | P1 / confirmed | Recurring verification uses a subscription as transaction identity and completed donations short-circuit later invoices. One-receipt-per-donation design cannot represent every monthly collection correctly. | `lib/payments/adapters/StripeAdapter.ts`; `PaymentService.ts`; `payments-v2/021` |
| F11 | P1 / confirmed | No durable queue implementation; receipt/email promises can be lost on termination. Reconciliation and monitoring routes exist but are not scheduled in checked-in `vercel.json`; external scheduling is unknown. Reconciliation labels confirmation outcomes without checking `confirmResult.success`. | `lib/payments/workers/JobQueue.ts`; `reconciliation.ts`; `vercel.json` |
| F12 | P1 / conditional runtime failure | Bank action uses anonymous insert plus RETURNING, while repository SELECT policy permits financial admins only. This may reject bank submission under deployed RLS. Metadata attachment failure still returns success; no safe request deduplication is present. | `lib/actions/bank-donation.ts`; migrations `002`, `041b` |
| F13 | P1 / confirmed | Status endpoints return more donor data than needed to holders of provider references. Resend API treats knowing the donor email as ownership and allows any authenticated user past its initial ownership gate. Emails and reference IDs are not a sufficient access model. | `app/api/payments/*/status/route.ts`; `app/api/receipts/resend/route.ts` |
| F14 | P1 / schema gap | Payment uniqueness is scoped to donation plus transaction; no global provider/environment transaction ownership constraint is defined there. Many status/provider fields lack checks; financial/audit foreign keys cascade on deletion. | `payments-v2/020`, `021`, `023`; migrations `001`, `009`, `057b` |
| F15 | P2 / confirmed or pending reachability | Rate-limit SECURITY DEFINER RPC migration grants service access without explicit public revocation or pinned search_path. Internal payment helpers carry `use server`; audit their action reachability. Stripe redirect helper accepts protocol-relative paths. Health responses expose diagnostics. Review email interpolates unescaped values. | migration `018`; `lib/payments/stripe.ts`; `app/api/health/route.ts`; `admin-donation-review.ts` |
| F16 | P0 / source-confirmed; exploit not tested | Event Stripe fallback synchronizes a mismatched expected currency to the session, falls back to email for missing attempt ownership, and mutates outside the central ledger path. Same email/amount does not establish registration identity. | `app/api/events/confirm-stripe-session/route.ts` |
| F17 | P1 / source-confirmed race risk | Event direct-confirm update does not exclude concurrently confirmed registrations; sold_count is updated afterward. Capacity checks count paid registrations while free/QR/venue can be confirmed unpaid/review. Define reservation policy and atomic replay behavior before changing counters. | event confirm route; `lib/actions/events-module/event-registration.ts` |

Existing protections to preserve: disabled providers fail closed on donation creation; Stripe signature verification; eSewa signature plus provider lookup on success; Khalti server lookup; amount/currency comparisons; unique provider references; conditional pending-state updates; token-based receipt download; private bank-proof bucket declaration; atomic receipt numbering. These controls do not cover all entry points or guarantee deployed policy correctness.

## Database review inventory

Inspect live definitions, not just filenames. Record applied migrations, columns/defaults/nullability, constraints and validation state, indexes, triggers, RLS, role grants, policies, function ownership/EXECUTE rights/search_path and storage policies. Export schema metadata only; avoid exporting donor rows or secrets.

| Area | Objects to inspect | Planned rule |
|---|---|---|
| Donation intent | `donations`, payment settings in `site_settings` | Valid fixed-precision positive amounts, bounded inputs, currency/provider allowlists, explicit allowed status transitions. Server-managed confirmation fields. |
| Payment attempts/collections | `payments`, provider refs on donations | Store an attempt before redirect; bind provider/environment/reference to exactly one entity. Separate attempts from actual successful collections if existing schema cannot represent both. |
| Callback inbox | `payment_events` | Unique provider/environment/event; received/processing/processed/failed state; durable processing evidence and retry metadata. |
| Receipt issuance | `receipts`, donation receipt columns, `receipt_sequences`, `receipt_audit_log` | Choose one authoritative model. One receipt per successful collection, not per subscription. Preserve existing numbers and URLs. Restrict sequence RPC access. |
| Work queue | `payment_jobs`, `receipt_failures`, `email_failures` | Durable deduplicated tasks, leases, retry count/time and dead-letter visibility. Never claim a logged message is a queued job. |
| Admin history | `review_notes`, `status_change_log`, `admin_users`, `payment_logs` | Active role permissions; append-only financial history via trusted server paths; correct admin FK. Redact diagnostic payloads. |
| Abuse controls | `rate_limits`, `increment_rate_limit` | Service-only mutation, fixed search_path, bounded arguments, documented outage behavior. |
| Storage | `bank-transfer-proofs`, `receipts` buckets and object policies | Private files, scoped expiring download authority; content/size validation and orphan cleanup. |
| Shared consumers | Event/conference registration tables; migration `057b` | Preserve entity binding, foreign keys, provider references, ticket/registration behavior and existing admin pages. |

Do not add blanket public SELECT to solve bank RETURNING. Use a restricted server write path. Donation/event sandbox transaction and registration records may be reset, and conference-exclusive tables may be removed under the user's clarification. Map dependent rows/files first; avoid blanket CASCADE/TRUNCATE reaching active configuration or unrelated data. Legacy transaction backfills are optional when the scoped reset is simpler. Do not blindly rerun historical scripts.

## Design decisions for implementation

- No donor account requirement by default. Give guests a short-lived scoped capability for their own status/receipt operations. Verify provider evidence before issuing post-payment access; do not authorize by email, UUID or provider reference alone.
- Keep new checkout disabled until its provider passes configuration and staging gates. Disabling new checkout must NOT discard valid callbacks for payments already initiated. Testing UI and server mode must agree.
- Keep USD/NPR fixed-precision accounting; normalize provider minor units centrally. Preserve amounts exactly during migration. Reject nonfinite, zero, negative, over-limit and over-precision input before inserts.
- Create immutable attempt identity before contacting the provider; use stable provider idempotency when supported. If a network timeout leaves creation uncertain, recover the same attempt rather than blindly making another charge.
- Verified confirmation uses a restricted transaction/RPC: claim event, lock/bind attempt, compare amount/currency/provider/environment, record collection, update state, append audit and enqueue post-payment work together. Only mark event processed after successful commit.
- A repeated event and different events about the same charge must not create two collections, receipts or emails. Stable event and transaction identities serve different purposes.
- Keep the donor intent, subscription lifecycle, individual collections and refunds distinct. No local status change should pretend money moved at the provider.
- Manual bank approval needs statement evidence and duplicate-reference review. A receipt must represent the confirmed amount/currency/account. Uploaded screenshots remain untrusted evidence.
- Use the existing database-backed queue/scheduled infrastructure if adequate; do not introduce another paid service by default. Workers claim jobs atomically with bounded leases and retry backoff.
- No public financial raw payloads, reusable receipt capabilities or donor PII in logs. Define retention for proofs and diagnostics while preserving required financial history; retention policy requires owner input.

## Implementation order and gates

Tasks are detailed in `todo.md` and are intentionally sequential where they change shared financial contracts.

1. Baseline live schema and configuration; contain public access and new online checkout. Retire remaining conference backend through T01a, then scope the donation/event sandbox reset.
2. Fix guest receipt/status access, active-admin authorization, and untrusted callback mutation/binding.
3. Validate submission and make manual bank recording reliable.
4. Add schema guarantees and a transaction-based confirmation path; migrate one-time donations first, then shared consumers.
5. Implement durable receipt/email jobs, recurring collections, refund/dispute handling and reconciliation.
6. Run staged abuse/failure tests, verify operations and obtain explicit launch approval.

No live rollout before security tests for F01-F05 pass. No gateway enabled before its own provider contract, failure/replay and recovery scenarios pass. No monthly option enabled before at least two successive invoices and first-payment event overlap are correctly recorded.

## Verification and launch definition

Commands must be explicitly authorized under AGENTS.md before running. Build success alone is insufficient because the repository skips TypeScript errors during build. Separate pre-existing failures from new failures without weakening tests.

Required evidence: unauthorized guest/editor/inactive-admin denied; anon/authenticated direct database attacks denied; forged failure/success rejected; payment reference cannot be rebound; wrong amount/currency/environment rejected; duplicate/concurrent/out-of-order events safe; DB failure rolls back; termination leaves recoverable work; provider timeout does not double-charge; email failure retries; two monthly collections create two ledger records/receipts; partial refunds retain original history; bank duplicate submissions and orphan uploads recover; free/online/QR/venue event behavior preserved, conference consumers safely retired; guest recovery and donor-visible states correct; shared-feature matrix passes appropriate checks.

Use isolated staging data and sandbox credentials. Do not probe production, charge real donors, resend real receipts or mutate live records to prove a finding. Dependency audit, secret scanning, HTTPS/headers/cookie verification, provider dashboard configuration, backups/restore, scheduled-job runs and alert delivery are launch evidence, not assumed controls.

Rollout: backup and schema snapshot -> staging migrations/backfill -> authorization and concurrency checks -> deploy additive changes with checkout blocked -> live metadata/health verification -> enable one verified provider -> monitor and reconcile. Rollback disables new checkout but preserves callback intake and durable work. Never roll back by deleting payment history.

## Unknowns to resolve before dependent work

- Live database access and deployed definitions; user reports all scripts applied sequentially. Inspect actual metadata without exposing credentials, particularly contradictory owner constraints and RPC return types.
- Which gateways will actually be supported (Stripe/eSewa/bank; Khalti is currently intentionally hidden). Disabled provider routes require secure binding or retirement; conference consumers are explicitly planned for retirement.
- Whether FINANCE may approve bank transfers or only view records. Default plan retains ADMIN/SUPER_ADMIN approval and denies EDITOR/inactive accounts.
- Production host/plan, external schedulers, provider merchant verification, webhook URLs/secrets and test/live separation.
- Retention/financial record requirements, refund policy, expected volume and operational owners.
- Explicit authorization for the focused automated verification commands when implementation begins.

## References

- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Stripe resilient webhook handling: https://stripe.dev/blog/building-resilient-webhook-handlers-aws-dlqs-stripe-events
- Verify current official provider contracts and local Next.js guidance before implementing each provider/route change. Existing comments and architecture documents are not proof that the described behavior is implemented.
