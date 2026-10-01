# OpenDyslexic and Reading Font Integration

**Version:** 3.0  
**Updated:** 2026-09-15  
**Status:** Implementation reference; assets have not been acquired or verified by this documentation update.  
**Related:** [Plan](./README.md), [Checklist](./CHECKLIST.md), [Validation](./VALIDATION.md)

## 1. Product behavior

Offer three choices: Site default, System sans-serif and OpenDyslexic. Describe them as reading preferences. Do not claim a font treats dyslexia, prevents letter reversal or improves reading for everyone.

System sans-serif is available without downloading an asset. OpenDyslexic is optional and failure must leave readable text. The font choice does not silently change the user's line/letter spacing.

## 2. Asset provenance and licensing

Use verified files from the [upstream repository](https://github.com/antijingoist/opendyslexic). The current upstream [OFL.txt](https://raw.githubusercontent.com/antijingoist/opendyslexic/main/OFL.txt) identifies SIL Open Font License 1.1. Verify the exact chosen release and its included license rather than applying that statement to all historical downloads.

Before integration, record:

| Field | Required evidence |
| --- | --- |
| Upstream release/tag or commit | Exact immutable revision |
| Download source | Verified URL for that release's actual files |
| Original file names and formats | Actual archive contents, not assumed paths |
| Selected weights/styles | Regular, bold, italic, bold italic where available |
| SHA-256 | Per shipped asset |
| License/copyright | Exact notices supplied with chosen assets |
| Local file names | Mapping from original files to public assets |
| Size and glyph coverage | Actual bytes and tested scripts |
| Modifications/conversion | Tool/version and license/name implications, if any |

Keep the supplied copyright and license with redistributed fonts. Do not combine Bitstream Vera, Creative Commons and OFL notices or invent a new LICENSE.txt. Website credit can be provided, but distinguish optional attribution copy from the selected license's actual conditions.

Prefer upstream web-font files. If suitable WOFF2 files are unavailable, document format choice/conversion and verify licensing before modifying assets. Do not paste an unverified historical ZIP URL or assume an npm package exists.

## 3. Chosen loading strategy

For this implementation use explicit same-origin @font-face definitions, not a mixture of next/font, CSS overrides and a package import.

Proposed location: public/fonts/opendyslexic/. The exact file names are chosen only after asset verification. Register each available face with correct weight and style and font-display: swap.

Illustrative structure only; replace paths with verified assets:

~~~css
@font-face {
  font-family: "deessa OpenDyslexic";
  src: url("/fonts/opendyslexic/VERIFIED-REGULAR.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
~~~

- Do not preload the optional font or apply its family on default pages.
- Merely registering a face should not request it until selected; verify this with a fresh-cache browser test.
- Keep the CSS family name identical in font-face rules, applied styles and document.fonts checks.
- Define regular/bold/italic/bold-italic separately if supplied. If a face is unavailable, decide and test its fallback rather than silently promising it exists.
- Do not overwrite a generated next/font variable with an unrelated hard-coded family.
- Do not use external CDNs for this feature.

## 4. Applying a choice

The provider stores fontFamily as default, system or opendyslexic. The DOM adapter applies a namespaced marker; scoped CSS maps the marker to the selected stack.

- Default restores the site's original heading/body font behavior.
- System uses a tested system-ui/sans-serif stack.
- OpenDyslexic uses "deessa OpenDyslexic" followed by tested system/script fallbacks.
- Audit headings, .font-comic-num, buttons, labels, rich text and existing explicit !important font rules.
- Use explicit scoped text selectors or tokens. Do not blindly override every descendant, including icons and code.
- Portals/toasts must inherit the selected presentation while the public scope is active.
- Cleanup restores unrelated fonts when leaving that scope.

Test Latin, Nepali/Devanagari, digits, punctuation and mixed-script lines. A Latin font does not supply missing Devanagari glyphs. Verify fallback combining marks and line-box height; avoid inappropriate letter-spacing overrides for scripts where they harm shaping.

## 5. Loading and failure flow

~~~text
User selects font
  -> save intended choice
  -> apply selected stack with readable fallback
  -> request available required faces
  -> loaded: use font
  -> failed/slow: keep fallback; expose concise status if needed

User resets or chooses another font during load
  -> invalidate earlier request token
  -> ignore stale completion
~~~

Do not block the panel or page while loading. Use request/generation identity so a late promise cannot restore an old font. Respect the latest user choice and persisted initialization.

If using document.fonts.load for verification, target the actual registered CSS family and inspect loaded faces; do not treat a font check alone as proof that the expected downloaded asset rendered. Confirm network requests and browser rendered-font information.

## 6. Verification tasks

- [ ] Exact asset revision, notices, license and checksums recorded.
- [ ] Default and system choices issue no OpenDyslexic network request.
- [ ] Selecting OpenDyslexic loads only required same-origin faces.
- [ ] Regular, bold, italic and bold-italic behavior matches available assets.
- [ ] Font applies to intended text including headings/controls and public portals.
- [ ] Icons, code and script-specific exceptions remain correct.
- [ ] English/Nepali/mixed-script fallback displays correctly.
- [ ] Reset/new choice during loading wins over stale completion.
- [ ] Failed/blocked/slow requests leave readable content and working controls.
- [ ] Saved choice restores without hydration errors.
- [ ] Enlarged text, spacing, reading mode and high contrast remain usable.
- [ ] CLS and transfer sizes measured on cold/warm loads.
- [ ] Print output and scope cleanup preserve readable fallback.
- [ ] Actual license credit in user-facing docs matches shipped assets.

Do not promise a universal sub-500ms download or zero layout shift. Record measured behavior under agreed network/device conditions.
