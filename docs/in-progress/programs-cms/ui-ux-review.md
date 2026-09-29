# Programs CMS UI/UX implementation review

Updated September 15, 2026. This supersedes the early two-page review.

## Accepted direction

The current Service, Outreach, Research and redesigned Campaign demos are the design baseline. The user accepted the lighter campaign and requested pill-shaped action buttons across all four previews.

Keep the distinct compositions documented in [category-specific-design-system.md](category-specific-design-system.md). Copy, metrics and images remain illustrative.

## Remaining production work

1. Replace implementation-facing copy such as “the CMS can…” with visitor-facing content. Keep demo labeling only in /demo.
2. Ensure a user can identify the program, who it serves, its current status and the next step without reading the entire page.
3. Move appended evidence sections before the final CTA where appropriate. Preserve visual treatments; do not treat the current append order as a content requirement.
4. Avoid repeated statistics, reused photos and unsupported research percentages. Use source-backed content and approved assets at launch.
5. Generate local navigation from visible sections; validate anchors and keep headings meaningful for screen-reader users.
6. Replace DemoAction notifications with working contact/resource/volunteer/share destinations. No campaign donation controls.
7. Keep gallery captions visible on touch screens. Add a lightbox only if zoom is offered, with keyboard control, Escape and focus return.
8. Verify full pages at narrow widths, 200% zoom and keyboard-only use. Test long labels in pill buttons and avoid clipping.
9. Review ocean-blue text/button contrast on every surface. Preserve brand color as a surface/accent while using readable foregrounds.
10. Add image-error, slow-loading, missing-section and unavailable-related-content states.
11. Keep public pages free of editor controls, preview tokens and private notes.
12. Give staff field-level errors, save status, conflict recovery, accessible reorder controls and a clear distinction between Save draft and Publish.

## Evidence boundary

Previous screenshot checks were partial and do not prove full accessibility, performance or responsive correctness. [PROTOTYPE-TESTING.md](PROTOTYPE-TESTING.md) defines the required new verification. The task list keeps these checks open.
