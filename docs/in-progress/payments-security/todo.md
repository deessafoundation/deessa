# Payment security implementation tasks

Status: proposed 2026-10-11. No implementation tasks completed. Companion: `plan.md`.

Clarification 2026-10-12: user permits discarding all sandbox donation data and reports all scripts run sequentially in Supabase. T01 should verify resulting definitions and map reset dependencies; T08 may use a scoped donation-data reset instead of legacy donation backfills. Do not reset event/conference or unrelated site data. No deletion has been performed.

Latest clarification supersedes earlier preservation assumptions: conference records/tables may be removed; event records are also test-only. Keep the active events functionality/configuration and unrelated site data. T01a below precedes T08. Future shared-schema checks target donations/events; verify retired conference callbacks exit safely instead of rebuilding conference support.

User chose this task location; unrelated `tasks/plan.md` and `tasks/todo.md` remain intact. Verification below describes future evidence; commands are not authorized by this document. Follow AGENTS.md opt-in verification requirements.

## Phase A: Establish facts and close exposure

Journey review 2026-10-12: use `journey-and-regression-review.md` as the UI/state and regression contract. T01 includes current free/online/QR/venue event baselines and the shared-feature map. T03 must preserve guest redirect/refresh/email recovery. T05/T10 must include the alternate event Stripe confirmation path (currency, unique attempt binding, replay/capacity). T15 requires browser/a11y and protected-feature evidence, not only payment unit tests.

### T01: Live baseline and recovery snapshot
- [ ] Inspect schema-only metadata for the objects listed in plan.md: applied migrations, grants/RLS, functions, storage and constraints. Report deviations from repository SQL.
- [ ] Record mode/readiness booleans, webhook/scheduler configuration, pending-attempt counts and aggregate data inconsistencies without printing secrets or donor records.
- [ ] Define staging isolation, backup/restore procedure and provider launch scope.

Prepared artifact: `scripts/db/diagnostics/payment-security-baseline.sql` and the restricted-results template `baseline-report.md`. The script is read-only and awaits execution against the intended Supabase environment; T01 is not complete until its metadata evidence is recorded.

Dependencies: none. Likely files: metadata inspection SQL and baseline report here (2 files). Verification: read-only metadata evidence; restoration rehearsed in isolation before migrations.

### T01a: Retire conference backend and scope sandbox reset
- [ ] Inventory active imports/routes and live FKs, functions, policies, storage and settings. Preserve modern-event components, schema contracts and any reused templates. Conference UI is already archived; archival deletion remains a separate usage review.
- [ ] Remove conference API/action consumers and payment/admin branches in small slices; remove scheduled conference expiration. Ensure late legacy callbacks cannot query dropped tables or prevent valid event/donation processing.
- [ ] Prepare explicit removal of conference-only tables/dependencies and reset of donation/event test records and their scoped dependent rows/files. Preserve event definitions/configuration/templates and unrelated site content; no blanket CASCADE/TRUNCATE.

Dependencies: T01. Split into runtime callers (<=5 files per slice), payment/admin consumers (<=5), and retirement migration/reset manifest (<=5). Verification when authorized: no active conference-table dependencies, expected redirects retained, events registration/form-builder/admin flows intact, donation/event payment callbacks still work. Use `docs/in-progress/conference-retirement/` and archive README as prior retirement evidence, not as proof backend is gone.

Progress: the first runtime slice removes conference reads/writes from Stripe, eSewa and Khalti callback paths; Stripe safely acknowledges delayed legacy checkout events without retrying them. The old conference API endpoints, eSewa helper, expiry cron, and its Vercel schedule are removed. Public `/conference` and `/admin/conference` redirects remain. Internal payment/admin/monitoring callers and the database retirement migration are next.

### T02: Block new real checkout until ready
- [ ] Enforce server mode, admin enablement, complete provider readiness and recurring permission before donation creation; UI reflects that policy.
- [ ] Reject direct helper bypasses; keep verified callbacks for existing attempts operational when new checkout is disabled.
- [ ] Invalid/missing configuration fails safely; no private configuration reaches public diagnostics.

Dependencies: T01. Likely files: config, donation action, donation form, validation/health gate and focused test (about 5). Verification: direct requests cannot create live checkout while blocked; existing verified callback still processes. Read Next.js/accessibility instructions before relevant edits.

Progress: the donation-specific release gate now defaults closed through `DONATION_ONLINE_CHECKOUT_ENABLED`; the public Donate page mirrors it, and `startDonation` rejects direct calls before it reads settings or writes a donation. When the switch is later opened, checkout still requires a provider callback secret and honors the recurring setting on both the form and server. Provider callbacks, bank transfers, and event payment paths are intentionally outside this first slice.

### T03: Authorize donor receipt and status access
- [ ] Replace UUID/email/reference-only access with scoped guest authorization; status responses contain only necessary fields.
- [ ] Cover display, ensure/send, download, resend and payment-reference lookup callers, including success-page refresh and expired access.
- [ ] Audit server-action exports and legacy receipt access; no alternative route bypasses authorization.

Dependencies: T01. Split into T03a receipt actions/token/callers (<=5 files) and T03b status/resend endpoints with focused tests (<=5 files per slice). Verification: donor A cannot access donor B; leaked UUID/email alone is insufficient; authorized guest flow still works.

### T04: Enforce financial admin permissions
- [ ] All financial mutations and proof access require active approved roles; use the existing authorization helper where suitable.
- [ ] Validate enums/transitions and correct reviewer FK/status handling; a stale approval cannot overwrite a newer result.
- [ ] Receipt resend authorization uses the site's real admin model; audit entries accompany successful mutations.

Dependencies: T01. Split donation/review actions from polymorphic/archive/proof actions (<=5 files each). Verification: unauthenticated, EDITOR and inactive admins denied; allowed admins produce consistent records and receipts.

### T05: Secure callback identity and failure handling
- [ ] eSewa browser failure URL cannot mutate payment truth without authoritative verification; conditional transition prevents races with success.
- [ ] Khalti verifies provider-side order/reference binding before any backfill; known pidx cannot be attached to another donation.
- [ ] Audit Stripe/eSewa/Khalti success, failure and webhook paths plus shared event/conference handlers for equivalent bypasses.

Dependencies: T01. Split provider-specific slices (route, adapter, focused tests, <=5 files each). Verification: forged data, mismatched equal-value payments, duplicates and success/failure races cannot corrupt payment ownership or status.

### Checkpoint A
- [ ] Live exposure baseline recorded; F01-F05 have fixes plus focused evidence.
- [ ] Donor UI and authorized admin/bank workflows work with checkout blocked.
- [ ] Review completed before financial schema changes; no blanket public grants added.

## Phase B: Reliable one-time donations

### T06: Validate and throttle submissions
- [ ] Parse strict server schemas and reject nonfinite/invalid amounts, excess precision, oversized fields and unsupported modes before writes.
- [ ] Shared request limits do not rely only on caller email; trusted proxy handling and limiter-outage behavior documented.
- [ ] Escape donor/admin values in email HTML and return generic public errors.

Dependencies: T02, T04. Likely files: donation/bank actions, rate limiter, review email and test (about 5). Verification: malformed and repeated submissions rejected without accidental blocking of legitimate callbacks.

### T07: Make bank submission and approval recoverable
- [ ] Fix server insert/RETURNING behavior under actual RLS; save required bank metadata consistently and never report full success after silent attachment failure.
- [ ] Verify proof content/size, use server-derived object paths, and clean orphan uploads; retain private access.
- [ ] Stable submission identity prevents double-click/retry duplicates; statement-based approval records account/reference/evidence and handles reference reuse conservatively.

Dependencies: T03, T04, T06. Split submission/storage (<=5 files) from approval/audit/schema (<=5 files). Verification: anonymous legitimate bank submission works; invalid content rejected; retry and update failure recover; proof is private; approval requires statement matching.

### T07a: Align donor UI with verified state and recovery
- [ ] Accurate mode/method/frequency/currency and review summary; no silent USD/NPR reinterpretation; inline associated errors/focus and input preservation.
- [ ] Distinct pending/unknown/review/paid/failed/refund messages; closing checkout never claims no charge without evidence; recover existing attempt before inviting a new payment. Bank acknowledgment includes scoped tracking and review next steps.
- [ ] Bounded polling with cleanup; receipt delay separate from payment state; keyboard/mobile/contrast/reduced-motion and legitimate guest refresh/email recovery verified when authorized.

Dependencies: T02, T03, T06 and agreed state contract; final integration depends on T09/T11. Split form/method slice from result/cancel/receipt slice (<=5 files each). Likely files: giving-options, donation-form, bank panel, success/cancel pages and scoped CSS/tests. Verification: journey matrix in companion review; preserve approved hero/brush design and existing anchors. Read full accessibility standards and relevant local Next.js guides before UI edits.

### T08: Add financial schema guarantees
- [ ] Review bad/duplicate legacy rows first; add positive money, allowed state/provider/currency and transaction-ownership constraints safely.
- [ ] Explicitly restrict table/RPC grants and RLS; pin SECURITY DEFINER search_path and execute rights. Preserve shared registration FK contracts.
- [ ] Define retention/deletion rules and protect ledger/audit history from accidental cascading removal.

Dependencies: T01, Checkpoint A. Likely files: additive migrations and data profiling/rollback documentation (<=5). Verification: staging legacy backfill plus constraint/grant checks; direct anon/authenticated mutation denied; no destructive data cleanup.

Updated scope: also depends on T01a. Implement donation/event ownership only after conference retirement; sandbox reset is authorized within the explicit manifest. Remove remaining conference FKs rather than add support for the retired entity. Backfill of disposable donation/event transaction data is optional.

Script review 2026-10-12: use `schema-review.md` S01-S07 as the contract checklist. Split T08 into owner integrity (donation/event/conference), permissions/money/status constraints, and receipt number/failure/job guarantees. Verify receipt metadata authority and bigint/TEXT RPC compatibility before changing callers. User confirms current payments are dummy; do not delete shared records or assume all stored personal data is dummy.

### T09: Persist checkout attempts before redirects
- [ ] Assign a stable attempt and provider/environment identity before contacting provider; store exact expected amount/currency.
- [ ] Retries reuse or recover the same attempt; uncertain provider responses do not blindly create another charge.
- [ ] Reference storage failure has a recoverable state rather than returning an untracked checkout.

Dependencies: T06, T08. Implement one provider per slice (action, provider helper, schema/query helper and tests, <=5 files). Verification: double submission and simulated provider timeout have one recoverable attempt and correct binding.

### T10: Commit payment confirmation atomically
- [ ] Restricted database transaction validates attempt identity/evidence, claims event, records payment, transitions state, writes audit and saves post-payment job together.
- [ ] Same event or same charge cannot credit two entities; wrong amount/currency/provider/environment cannot confirm.
- [ ] Shared webhook, verification and reconciliation paths use this contract without old mutation shortcuts.

Dependencies: T05, T08, T09. Split SQL/RPC (<=5 files), donation service/routes (<=5), and registration consumers (<=5 per slice). Verification: concurrency, different events for one charge, rollback injection and out-of-order callbacks; old event/conference behavior remains valid.

### Checkpoint B
- [ ] One-time online and bank flows preserve correct payment/audit records under retries and failure.
- [ ] Database permissions and shared registration regression evidence recorded.
- [ ] No silent financial-ledger errors; no provider enabled for real checkout yet.

## Phase C: Receipts, recurring money and recovery

### T11: Durable receipt and email processing
- [ ] Replace placeholder queue with stored jobs, atomic claims/leases, retry backoff and dead-letter visibility.
- [ ] Choose authoritative receipt model; issuance is idempotent and email jobs do not create repeated receipts.
- [ ] Termination between confirmation, receipt generation and delivery remains recoverable; private token access remains scoped.

Dependencies: T03, T10. Split queue/worker (<=5 files) from receipt/email integration (<=5). Verification: kill/restart worker, storage/email outage, duplicate jobs, concurrent claims and expired leases recover. Document email delivery's retry/idempotency limits rather than promise absolute exactly-once delivery.

### T12: Record monthly collections correctly
- [ ] Subscription state is separate from money collected; every paid invoice has a unique collection and receipt.
- [ ] Initial checkout/invoice overlap cannot double-credit; later invoices bypass the original donation's completed short-circuit safely.
- [ ] Failed renewal/cancellation does not erase paid history; recurring UI stays blocked until these checks pass.

Dependencies: T10, T11. Split schema/contract from Stripe lifecycle/receipt integration (<=5 files each). Verification: first payment overlap, two successive invoices, failed renewal/retry, cancellation and out-of-order events.

### T13: Record refunds and disputes
- [ ] Partial/full refunds and disputes are ledger adjustments linked to original collections, not destructive status rewrites.
- [ ] Duplicate or reversed events preserve totals; admin status changes cannot masquerade as provider refunds.
- [ ] Reports/receipts display original and adjusted financial truth consistently.

Dependencies: T10, T12 if subscription refunds are included. Split ledger migration/service from webhook/admin/report consumers (<=5 each). Verification: partial refund, full refund, duplicate delivery and dispute resolution retain original history.

### T14: Schedule reconciliation and monitoring
- [ ] Schedule authenticated reconciliation/worker checks using deployment-supported cadence; exclude manual bank transfers from gateway auto-confirmation.
- [ ] Check result.success before reporting a confirmation; retain pending/uncertain states appropriately and use stable recovery identities.
- [ ] Alert on stuck attempts, ledger discrepancies, failed jobs, signature failures and scheduler silence without logging donor PII.

Dependencies: T10, T11. Likely files: reconciliation, cron routes/config, monitoring and focused test (<=5 per slice). Verification: missing callback recovered, already-paid missing ledger detected, actual scheduled run/alert observed in staging; no false successful summary.

### Checkpoint C
- [ ] One-time payments, monthly collections, receipts and recovery pass failure scenarios.
- [ ] Every collection is reconciled and receipt jobs survive termination.
- [ ] Operational owner and retention policy recorded.

## Phase D: Prove readiness and release deliberately

### T15: Security and failure acceptance evidence
- [ ] Execute authorized focused tests for all acceptance cases in plan.md, including database/RPC/storage access and shared event/conference consumers.
- [ ] Run authorized dependency/secret checks and relevant build/type/lint checks; report pre-existing failures separately. Verify HTTPS/headers/cookies and provider dashboard setup.
- [ ] Rehearse backup restore, migration rollback, payment outage and secret rotation procedures in staging.

Dependencies: T02-T14. Likely files: focused integration tests/fixtures and readiness report (split <=5 per slice). Verification: attach actual results; no weakened assertions or suppressed new errors; never use live donor data for destructive checks.

### T16: Controlled production activation
- [ ] Review readiness evidence, verify live metadata/configuration and obtain explicit launch authorization.
- [ ] Enable one provider at a time; enable monthly only after its independent checks. Observe reconciliation, queues and alerts.
- [ ] Rollback stops new checkout while preserving callbacks, records and recoverable jobs; record support/incident ownership.

Dependencies: T15. Likely files: launch/rollback runbook and configuration (<=3). Verification: approved rollout evidence and observed operations; no declaration of readiness based only on a warning badge or successful build.
