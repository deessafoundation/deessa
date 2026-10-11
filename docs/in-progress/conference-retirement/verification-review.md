# Conference archival and Events verification — 2026-10-10

## Conclusion

The relocation introduced no detected source lint/type regressions, and the production build completes. A complete Events/security sign-off is blocked by existing event authorization/validation problems and a live database policy mismatch. Structural preservation is not proof that those existing workflows are correct.

## Executed checks

| Check | Result |
|---|---|
| Production build | Passed; project configuration explicitly skips TypeScript validation |
| Repository lint | Failed: 517 errors and 524 warnings |
| Lint before/after comparison | All 94 affected source files: 60 errors and 65 warnings both before and after; zero new findings after normalizing moved filenames |
| TypeScript source comparison | 318 diagnostics before and after; zero added diagnostics |
| Generated Next.js route types | Refreshed; stale references to archived conference routes no longer appear |
| Selected payment/security suites | 3 passed, 1 failed; 151 tests passed, 4 failed |
| Accessibility suites | 4 passed, 1 failed to load; all 17 executed tests passed |
| Structural relocation checks | 58 moves and import transformations accounted for; no production archive imports |
| Production redirects | Conference/public payment routes return 307 to Events; admin conference routes return 307 to admin Events |
| Anonymous admin page | `/admin/events` redirects to `/admin/login` |
| Desktop/mobile Events UI | Visible after using the actual `Skip intro` control; no horizontal overflow; mobile menu opens |
| Dependency advisory audit | Not run: automatic approval review blocked metadata export, and the user chose to keep the review local |

The four conference signature tests import an unexported `verifyEsewaSignature` helper. Both the test and handler predate this cleanup and are unchanged. The accessibility suite fails to load `dictionary-selection.test.ts` because `jsdom` is unavailable; that test/configuration also predates this cleanup.

Existing event source type errors include the email-template editor's icon contract and the select field's `disabled` property. Their diagnostics are unchanged after relocation.

## Confirmed findings

### P1 — Public event queries are rejected by the database

The live database contains published events, but public queries fail with `42501: permission denied for function is_admin_user`. The UI catches the error and renders an empty list. Live read-only inspection confirmed that nine event admin policies apply to PUBLIC while anon EXECUTE on their helper is revoked.

The prepared remediation and application status are recorded in [events-permission-fix.md](events-permission-fix.md). This database state predates the component moves. Its remediation changes policy roles rather than granting anonymous helper execution or bypassing RLS in the public page.

### P1 — Schema publishing omits authorization before privileged writes

`lib/actions/events-module/event-form-schema.ts:106` exports `createFormSchema` as a server action. It creates a service-role client without calling its existing `requireAdmin` guard. The production form builder invokes this action. In isolated mocks, a call with no authenticated user reached three privileged mutations and returned success with zero authentication checks.

Remedy: authorize an active admin with event-management permission before using privileged database access, validate the schema on the server, and test anonymous/non-admin/disabled-admin rejection. The implementation is unchanged except for its schema type import.

### P1 — QR registration skips ticket binding and accepts unverified evidence

`lib/actions/events-module/event-registration.ts:208` validates ticket ownership, activity, sales windows and price only for online/venue payment. The QR branch bypasses those checks, stores the submitted ticket ID, stores no payment amount, and accepts any truthy screenshot path. A mock QR request using a ticket from another event and an unverified storage path returned success.

Remedy: apply a shared server-side ticket validation path to every paid registration method, record its price snapshot, and verify screenshot ownership/path against uploaded evidence. Also review capacity accounting: current paid-registration counts exclude venue/QR reservations. No live registration was created during this review.

### P1 — Current CSP conflicts with the eSewa form flow

`next.config.mjs:116` serves `form-action 'self'`. The pending-payment page submits a POST form to the provider URL supplied by the server, and `lib/payments/esewa.ts` resolves that URL to an external eSewa host. The configured policy does not permit that form destination. The CSP itself predates the retirement redirects.

Remedy: allow only the configured, trusted eSewa form origin and validate the server-supplied form destination. A local browser fixture using the actual production CSP recorded a `form-action` violation for the eSewa form URL, with zero external provider requests. No real provider session or payment was initiated; this verifies the policy conflict rather than a completed checkout.

### P1 — Admin schema API bypasses session checks

`app/api/admin/events/[id]/form-schema/route.ts:10` creates a service-role client without an admin authorization check. It can fall back to a draft schema. The proxy matches `/admin/:path*`, so it does not protect `/api/admin/...`. An anonymous request for an absent event returned HTTP 200 rather than an authentication error; no confidential schema was fetched during testing.

Remedy: enforce active-admin/event permission checks inside the route before creating privileged clients. Also review `getEventPaymentEvents`, which reads payment-event data with service credentials without an admin guard. These implementations were unchanged by the cleanup.

### P2 — Hidden required fields can block advancing the form

The moved `DynamicStep` validates visible fields, but its parent `EventRegistrationForm.handleNext` loops over all fields in the step. An isolated conditional-field example hid a required field correctly, then the parent's validation still produced `Hidden field is required.`

Remedy: use the same visible-field calculation for rendering and step validation, and verify conditional step transitions and review rows. This mismatch predates the relocation.

Status: fixed after the user's subsequent registration-flow request. `EventRegistrationForm` now derives visible fields before calculating navigation, validation and review, and omits steps with no visible fields. Real browser checks against the active summit schema confirmed participant → Themes → Select Ticket; presenter → Details → Select Ticket; both → Themes → Details → Select Ticket. Required presenter details remain enforced. No registrations were submitted. Targeted lint reports zero errors and two pre-existing warnings. This is an authorized behavior fix after the import-only relocation, not part of that original structural comparison.

## Limits and remaining checks

Public registration completion, real provider callbacks and authenticated admin mutations were not exercised against live data. No registrations, screenshots, payments or outbound emails were created. The public event query failure must be resolved before a real event's UI can be inspected. Production localhost also reports unavailable Vercel analytics scripts; these are local hosting limitations, not relocated event imports.

No application implementation changes were made during this verification pass. Existing security/flow findings need a separate authorized fix beyond the originally requested move/import-only cleanup. Do not permanently delete the archive or treat build success as complete workflow/security approval.
