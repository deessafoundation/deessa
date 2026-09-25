# Programs CMS verification plan

Updated September 15, 2026. This is a test plan, not a record of passing tests.

## Baseline

Record package manager, lockfile, runtime and local environment. Regenerate Next build artifacts using the supported workflow if needed. A prior tsc run encountered a generated .next/dev/types/routes.d.ts error; diagnose it separately from feature changes.

Capture each current /demo page at desktop and mobile before extracting components. Preserve those fixtures for comparison. Do not mark existing code WCAG compliant without testing.

## Test matrix

| Area | Required cases | Evidence |
| --- | --- | --- |
| Contract | All four categories; every section; malformed/oversized content; unsafe links; unknown version/type | Unit/contract suite |
| Database | Clean migration, existing-schema upgrade, duplicate slug, wrong parent, invalid payload, transaction rollback | Integration suite and migration log |
| Authorization | anon, ordinary authenticated, inactive admin, EDITOR, ADMIN, SUPER_ADMIN, FINANCE | Direct database/API allow-deny matrix |
| Publication | First publish, edit live draft, stale save, simultaneous publish, retry same request, restore, archive, unpublish | Integration/E2E |
| Isolation | Draft text/assets/notes absent from public JSON, HTML, metadata, RSC, sitemap, related cards and caches | Automated assertions and network inspection |
| Media | MIME spoof, size/dimension limit, unauthorized object path, expired signed URL, referenced deletion, failed processing | Upload/storage tests |
| Public UI | Four templates, minimum/full/long content, hidden sections, valid anchors, failed images | Screenshots and browser checks |
| Admin UI | Create/edit/upload/reorder/preview/publish per category; unsaved edits, expired session, concurrent edit | E2E and staff walkthrough |
| Navigation | /whatwedo filters/pagination, card URLs, known redirects, slug changes, no redirect loops | Route tests |
| Actions | Real destination/submission, preserved program context, successful share fallback | Browser E2E |
| Resilience | DB outage, storage failure, failed cache invalidation, client retry, permission revoked mid-session | Fault-injection record |
| SEO | Canonical/OG/breadcrumb consistency, robots, sitemap excludes draft/archive/demo, escaped JSON-LD | HTTP/metadata assertions |
| Accessibility | Keyboard, focus order, labels/errors, heading order, alt, contrast, zoom/reflow, reduced motion | Automated scan + manual checklist |
| Performance | Optimized hero, lazy galleries, image dimensions, minimal client JS, no N+1 queries | Repeated staging measurements |
| Recovery | Backup restoration, route-flag rollback, prior-publication restore, media availability | Rehearsal record |

## Browser review

Test at 320, 390, 768 and 1440px. Include real mobile Safari and Chromium when available; record actual coverage rather than assuming it. Exercise keyboard navigation, 200% zoom and reduced motion. Long CTA labels must fit pill buttons. Section links must not hide targets under navigation.

For gallery zoom, if implemented, verify focus trapping, Escape, focus return, captions and image alternatives. Otherwise do not imply zoom with nonfunctional controls.

## Critical scenarios

1. Publish version A. Edit draft B. Anonymous visitors still see A everywhere.
2. Preview B as editor. Anonymous requests to the same route/UUID are rejected; signed media expires.
3. Publish B twice with the same request ID. Exactly one publication result and one logical audit event.
4. Two editors save from the same revision. One succeeds; the other receives a conflict without losing entered text.
5. Unpublish while the page is cached. Fresh requests and listing/metadata reads stop serving it immediately.
6. A publication media job fails. A stays public; staff receive retryable status; no partial page.
7. A public database request fails. An error boundary appears; the app does not pretend all programs were deleted.
8. Restore an old revision. It opens as a draft; retained assets are present; live content changes only after Publish.
9. An EDITOR calls the publish RPC directly. Database rejects it.
10. An admin becomes inactive after login. Their next write/preview is rejected.

## Release gates

All security/isolation tests pass. No unresolved blocker affecting data loss, unauthorized access, migration or core authoring. All four categories complete end-to-end journeys. Staff approve actual content, rights and working actions. Record build/type/lint results and any pre-existing exceptions with owner and impact; exceptions cannot waive security or production build correctness.

Use measurable targets from the implementation plan and document test conditions. No blanket “under three seconds” or “WCAG compliant” claim without supporting evidence.
