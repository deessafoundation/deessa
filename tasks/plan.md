# Plan: Admin-managed Facebook post embeds

Status: implementation added locally following user authorization; activation and runtime verification pending. Updated 2026-10-10.

## Implementation update

Follow-up: Admin list moved to `/admin/community-posts`, with separate `/new` and `/[id]` pages. Existing `/admin/facebook-posts` links redirect. Added paginated list, explicit draft/publish labels, specific database save errors, and repair migration 066 for a rich-text-corrupted URL constraint. User supplied `https://www.facebook.com/share/p/1DqLmQT9tC/`; the former validator rejected this supported-by-our-card-workflow format. It now accepts post share links with strict host validation; embedded previews remain best-effort and may require a full permalink. No database repair, live save, or runtime checks performed.

User approved homepage placement inspired by the supplied community-card reference. Added optional manually selected cover photos and card titles; linked posts can be previewed in official Facebook iframes on demand. Implemented dedicated storage migration, settings-authorized admin management, a published-only public reader, homepage integration, narrow CSP frame allowance, URL parser tests, and operating instructions in `docs/features/facebook-posts.md`. No tokens or polling needed.

Migration 065 has not been applied to the connected database. No real post link was provided and live embedding has not been verified. No automated verification commands ran, per repository instructions. The feature hides safely until storage is available and a post is published.

## Goal and workflow

A person publishes a public Facebook post. A website admin copies its permalink into the admin panel, previews it, and publishes it. The selected post appears on the website through Facebook's official embed. Each new post needs its own link added; this is not automatic Page syncing.

## Decisions

- Use official post embeds, not scraping or the Graph API sync discussed earlier. No Page token or scheduled polling in this design. Verify the current official embed mechanism with a real public post before implementation.
- Use existing Supabase infrastructure for a dedicated `facebook_posts` table: id, post_url, optional admin-written title, display_order, is_published, created_at, updated_at. Do not copy the post's caption, photos, comments, or likes into the database.
- Public reads use explicit published filters and RLS. Writes require the existing authorized admin flow; inspect its permission helper before choosing the exact policy. Public users cannot submit posts in this first version.
- Proposed public placement: a homepage Latest from Facebook section showing up to three published posts. Confirm placement before UI implementation. Keep embeds in `components/facebook-posts/` and management UI in `components/admin/facebook-posts/`.
- Admin controls: add a permalink, preview, publish/hide, reorder, delete the website entry. Deleting an entry never deletes the Facebook post.
- Accept supported HTTPS Facebook post permalinks only. Reject arbitrary HTML, iframe code, non-Facebook URLs, lookalike hosts, and unsupported link formats. Construct the embed from a validated URL; never insert submitted HTML or fetch arbitrary URLs server-side. Shared/short links may need replacement with the canonical permalink.
- Load a small number of embeds lazily and provide an always-visible View on Facebook link. Account for third-party cookie/privacy behavior using the site's existing consent approach if present.
- Official embeds retain Facebook's appearance. Matching site cards containing automatically extracted images/captions would reintroduce API requirements.

## Repository findings

- Next.js 16.3.4 App Router; homepage `app/(public)/page.tsx` already reads CMS data server-side.
- Existing Supabase clients in `lib/supabase/`; public artwork reads offer an example of published-row RLS.
- Footer currently points to https://www.facebook.com/deessaFoundation; confirm that it is the intended Page.
- Many unrelated tracked and untracked changes are present. Preserve them.
- Read local Next.js guides and the full accessibility standards before implementing UI. Follow `components/README.md` ownership rules.

## Limitations and costs

No paid feed widget or scheduler is planned. Database and hosting usage still count toward existing plan allowances. Do not promise zero cost without checking actual plans. Only embeddable public content works; deleted/private/restricted posts, blockers, consent settings, or Facebook outages can prevent rendering. Keep the source link available. No automatic deletion detection or guaranteed offline copy. Accessibility inside Facebook's embed is controlled by Facebook; surrounding UI must meet site standards.

## Ordered work

1. Prove that one real public post can render using the supported official embed; confirm homepage placement and applicable consent behavior.
2. Add dedicated storage and RLS, then a public published-post reader.
3. Add authorized admin link management with URL validation and preview.
4. Add the public section, accessible controls, mobile layout, fallback links, and lazy loading.
5. Review operational behavior and document adding/removing posts and unsupported link formats.

See `tasks/todo.md` for acceptance criteria and dependencies. No lint, formatting, typecheck, or test suite runs unless explicitly requested, per AGENTS.md.

## Research

- Meta public-post embedding overview: https://about.fb.com/news/2013/07/introducing-embedded-posts/ (historical primary source, not sufficient to confirm current implementation details).
- Current official embed guide: https://developers.facebook.com/docs/plugins/embedded-posts/ (fetch blocked during research; confirm before coding).
- Vercel scheduler pricing: https://vercel.com/docs/cron-jobs/usage-and-pricing (Hobby daily limit; irrelevant after switching to manually selected embeds).

## Inputs before implementation

- One real public Facebook post permalink for the feasibility check.
- Confirm the proposed homepage placement; default is three latest admin-selected posts.
- Decide whether videos/Reels must be supported in v1; default is ordinary text/photo post embeds, with unsupported types rejected clearly.
