# Tasks: Admin-managed Facebook post embeds

Implementation added locally on 2026-10-10 after user approval. No verification commands ran. Unchecked items below remain acceptance checks, not claims of missing source code; automated checks remain opt-in under AGENTS.md.

## Delivered source
- [x] Dedicated table migration and published-only public read policy.
- [x] Settings-authorized add/edit/publish/hide/order/remove actions and admin page.
- [x] Homepage community cards, optional media-library cover photos, opt-in embedded preview and source links.
- [x] Narrow Facebook iframe CSP allowance, parser tests, and operating documentation.
- [ ] Apply migration 065 to the deployment database.
- [ ] Verify a real public post, authenticated CRUD, mobile/contrast modes, and existing homepage interactions when authorized.

## 1. Confirm embedding feasibility (small)
- [ ] Confirm current Meta embed mechanism using a real public permalink and review supported URL formats.
- [ ] Confirm placement, consent handling, and v1 media scope.
- [ ] Verify the example renders while signed out; document any restrictions.
Dependencies: none. Likely files: planning documentation only.

## 2. Store published selections (medium)
- [ ] Add `facebook_posts` migration with publication state, ordering, timestamps, and duplicate handling.
- [ ] Public reads expose published records only; unauthorized writes are denied.
- [ ] Add a bounded public reader that degrades safely on database failure.
Dependencies: 1. Likely files: new migration under `scripts/db/migrations/`, `lib/facebook-posts/`, public data reader.
Verification: inspect policies and permissions; exercise public/admin behavior when implementation verification is authorized.

## Checkpoint: Foundation
- [ ] Real embed is feasible and storage boundaries are reviewed before building the UI.

## 3. Admin management (medium)
- [ ] Authorized admins can add, preview, publish/hide, reorder, and remove entries using existing admin conventions.
- [ ] Server validation rejects non-Facebook links, malformed URLs, submitted HTML, and duplicate entries with useful errors.
- [ ] Changes preserve existing admin roles and only affect website entries.
Dependencies: 2. Likely files: `app/admin/facebook-posts/page.tsx`, `components/admin/facebook-posts/`, feature admin actions, admin navigation.
Verification: manually check authorized and unauthorized behavior, valid/invalid URLs, preview and publication flow when authorized.

## 4. Public display (medium)
- [ ] Show up to three published entries in the agreed location, with source links and sensible empty/unavailable behavior.
- [ ] Lazy-load official embeds without exposing credentials or injecting submitted HTML.
- [ ] Surrounding UI works on mobile, with keyboard navigation and the site's contrast modes.
Dependencies: 3. Likely files: `components/facebook-posts/`, co-located CSS Module, `app/(public)/page.tsx`.
Verification: read full accessibility standards and local Next.js guides first; manually inspect rendering, blocked embeds, mobile and contrast modes when authorized.

## 5. Handoff (small)
- [ ] Document permalink requirements, publish/hide flow, external content restrictions, privacy behavior, and removal.
- [ ] Review secret-free design and preserve unrelated working-tree changes.
Dependencies: 4. Likely files: feature documentation and plan status.
Verification: review final diff; run automated checks only if explicitly requested.

## Checkpoint: Complete
- [ ] An admin-selected real public post appears on the website; hidden entries disappear and no arbitrary HTML is accepted.
- [ ] Known limitations and any unperformed checks are recorded.
