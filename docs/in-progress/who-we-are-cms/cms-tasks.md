# Who We Are CMS tasks

Updated 2026-10-14. [Current evidence and limits](./implementation-status-2026-10-14.md).
The implementation checklist below is complete in source and focused tests.
Live acceptance is tracked separately; it is not inferred from code review.

## Implemented

- [x] Trace public sections, shared owners, stored/retained fields, and routes.
- [x] Add shared bounded validation and additive defaults; preserve saved lists,
  stable IDs, unknown legacy keys, and explicit empty values.
- [x] Separate strict admin loading from non-persisting public recovery.
- [x] Fix publishing validation, origin/permission checks, saved baseline,
  failure preservation, discard, and post-write refresh status.
- [x] Match the established brand tabs and follow public page order.
- [x] Use associated field labels, named controls, focused validation,
  selected-item editors, and structured lists.
- [x] Complete Hero copy/breadcrumb/actions/trust/caption controls and Team links.
- [x] Complete intro copy, flow appearances, video/accessibility settings, and
  text-only rendering after media removal.
- [x] Manage process label and every saved step's copy/color without truncation.
- [x] Manage Governance heading, four tiers, and two operational teams.
- [x] Manage Our People section copy and distinct empty/unavailable messages.
- [x] Preserve Team record ownership and publication; repair profile/social
  keyboard behavior and empty/fewer-than-three Hero layouts.
- [x] Manage all six Partner category tiles and embed existing record CRUD.
- [x] Manage Get Involved copy and both validated action pairs.
- [x] Manage SEO, section visibility, and clearly retained Journey/sinceBadge.
- [x] Make draft media removal non-destructive; report upload/error states and
  block competing saves/closure. Provide retry/current-media recovery.
- [x] Add dirty/busy navigation guards to the admin shell and Team forms.
- [x] Harden Team/Partner roles, active-admin checks, input limits, media/social
  URL validation, missing-row handling, and saved-with-warning outcomes.
- [x] Prepare storage role/ownership guard migration 069.
- [x] Run user-authorized focused coverage: seven suites, 87 passing tests.
- [x] Inspect public desktop/mobile fallback rendering and correct empty portrait
  spacing; record browser and database limits.
- [x] Review tracked/untracked feature sources and document field consumers,
  ownership, safe rollback, and remaining acceptance.

## Live acceptance — pending

- [ ] Identify/confirm the target database and snapshot actual saved About JSON
  and Team/Partner data.
- [ ] Inspect deployed policies and grants, including Team contact-column
  exposure; apply and validate storage migration 069.
- [ ] Confirm existing migration 060 for Team social links is deployed.
- [ ] Verify authenticated edit → publish → reload and edit → discard flows
  for every section with a working Supabase connection.
- [ ] Verify real Team/Partner create/edit/delete, slow/failed uploads, session
  expiry, navigation cancellation, and missing-record recovery in an approved
  test environment.
- [ ] Complete authenticated desktop/mobile keyboard, focus, high/inverted
  contrast, forced-colors, large-text, and reduced-motion acceptance.
- [ ] Review/provide accurate caption and transcript assets for the existing clip.

The actual protected editor reached login on local port 3005; Supabase requests
failed. No live content test writes or storage deletion occurred. Automated
format/lint/typecheck/build checks remain opt-in under AGENTS.md.

