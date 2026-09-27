# Dictionary: Wiktionary research and implementation plan

**Date:** 2026-09-25  
**Status:** Proposed; research and planning complete, implementation not started.  
**Scope:** E8 dictionary support on public pages, enabled from the accessibility panel.  
**Execution checklist:** [Dictionary tasks](../tasks/dictionary-wiktionary.md)

## Recommendation

Use English Wiktionary's structured definition endpoint through a small same-origin Next.js route. Start with selected-word lookup and a keyboard-accessible lookup form, then add optional delayed desktop hover. Keep the feature off by default. No paid dictionary subscription, AI service, new database, or separate server is required.

The existing hosting plan still bears function, cache and bandwidth usage. Staying within its included allowances can mean no additional bill; unlimited free hosting or guaranteed upstream availability is not promised. Wikimedia also applies rate limits.

This is an English-to-English dictionary proposal. Nepali translation, sentence explanation, speech/audio, full offline dictionaries and editorial glossary management are outside this first implementation. Public dictionary entries are not necessarily plain language or clinically reviewed.

## Verified research and corrections

The actual endpoint is:

```text
https://en.wiktionary.org/api/rest_v1/page/definition/{encodedTerm}
```

The pasted `https://wiktionary.org<word>` URL is not an API route. The JavaScript string `https://wiktionary.org{cleanWord}` also lacks `${...}` interpolation. Construct the URL from a fixed trusted base and `encodeURIComponent(normalizedTerm)`.

| Question | Finding |
|---|---|
| Is anonymous access possible? | Yes. The live definition request below succeeded without registration, credentials or an API key. |
| Is the structured endpoint stable? | Official documentation explicitly labels it **experimental**. Keep its response parsing in one small module and fail gracefully when its contract changes. [S1] |
| Can browser JavaScript set User-Agent? | Do not rely on that. Wikimedia recommends `Api-User-Agent` for browser clients; a server route can set an ordinary descriptive `User-Agent`. [S2] |
| Is access unlimited? | No. The current policy lists 200 requests/minute for unauthenticated clients with a compliant User-Agent, subject to caveats and changes. It recommends at most three concurrent requests and respecting `Retry-After`. These are upstream policies, not a per-visitor allocation for our proxy. [S3] |
| Can we strip HTML using the supplied regex? | It is insufficient for entity decoding, malformed markup and separating nested content. Parse in an inert server-side document, remove unwanted elements, extract text and normalize whitespace; render only escaped text in React. |
| Should every term be lowercased? | No. Preserve original case first so proper nouns and case-sensitive entries are not silently changed. Allow one lowercase retry only after a genuine not-found result. |
| Can the first definition be treated as the intended meaning? | No. Show part of speech and up to three concise senses, preserving usage labels. Link to the complete entry for ambiguity. |
| Is attribution needed? | Yes. Include the entry link and applicable license link; identify excerpts/formatting changes. Check entry-specific notices. [S4, S5] |

### Live check and limits of evidence

On 2026-09-25, a read-only command-line GET to the endpoint for `neurodiversity` returned **HTTP 200** with an `en` array, a `Noun` entry and HTML inside `definitions[].definition`. No authorization header or key was used. The request completed in approximately three seconds including command overhead; this is one observation, not a latency benchmark or uptime guarantee.

The web research tool could not retrieve that JSON URL. A shell request inside the network sandbox failed to connect; the approved request outside the sandbox succeeded. These tool failures are not evidence that Wiktionary is down. Browser and deployment-host connectivity remain to be tested.

The user reports repeated Free Dictionary API timeouts. The root cause was not diagnosed here, and switching providers cannot guarantee resolution of network restrictions. Separately, the repository's current `next.config.mjs` CSP allows browser connections only to self, Supabase and Stripe; direct calls to either dictionary service would be blocked when that policy is delivered. A same-origin route avoids this issue without broadening CSP.

## Architecture decision: existing Next.js route

```text
Accessibility setting -> selection / lookup form / optional hover
                      -> browser cache and duplicate suppression
                      -> GET /api/dictionary?term=...
                      -> validate, rate limit, cache, identify client
                      -> Wiktionary -> normalize to plain text
                      -> accessible definition card + source/license
```

Prefer this over direct browser fetching because it centralizes timeouts, content parsing and source metadata, allows a correct User-Agent, and avoids cross-origin/CSP configuration. It also prevents forwarding the visitor's IP or cookies to Wiktionary through the lookup request. Our host and Wikimedia still see request metadata; do not claim anonymous or zero-data processing.

The tradeoff is that hosting compute is used and upstream limits apply to the server identity/shared egress. Before release, verify the deployment's cache and abuse controls. Existing `lib/rate-limit.ts` uses Supabase; `lib/utils/rate-limit.ts` is process-local. A process-local limiter cannot enforce a deployment-wide cap. Reuse an appropriate existing mechanism rather than purchasing a new service; document any shared-cache/limiter limitations and keep a server kill switch.

Do not implement automatic fallback to another dictionary or scrape whole Wiktionary pages in v1. On failure, offer a user-activated link to the Wiktionary entry/search and manual retry. The newer general MediaWiki page APIs must not be assumed to return this endpoint's definition schema.

## Proposed contract and request controls

New route: `app/api/dictionary/route.ts`; provider/parser: `lib/dictionary/wiktionary.ts`.

Success returns `term`, `language: "en"`, `senses` (part of speech and plain-text definition), `sourceUrl`, `licenseName`, `licenseUrl`, and a formatting/excerpt notice. Never return arbitrary upstream HTML or trust upstream links as UI navigation destinations. Construct source URLs on the fixed Wiktionary host.

Failures return a stable code and safe message: invalid term (400), not found/no English definition (404 with distinct codes), rate limited (429), invalid upstream response (502), unavailable/disabled (503), upstream timeout (504). Offline is a client state. Do not report all failures as missing words.

Proposed initial limits, to validate in implementation:

- Accept one English word, 1–64 Unicode code points after NFC normalization and trimming boundary punctuation. Permit Latin letters/marks with internal apostrophes/hyphens; reject URLs, controls, digits-only inputs, spaces/sentences and unsupported scripts before network access. Retain accents and meaningful case.
- Fixed upstream host and path; do not accept a URL parameter. Reject unexpected redirects. Send `Accept: application/json` and `DeeshaFoundationDictionary/1.0 (<verified public contact URL>)`; resolve a real contact URL from site configuration before launch.
- Eight-second total server lookup deadline, including any case fallback; ten-second client deadline. Abort obsolete requests and use a request ID so a late response cannot replace the current word.
- Bound upstream response size to 512 KiB, inspect the shape, and return at most three senses with at most 600 characters each. Remove script/style and reference clutter, decode entities and preserve spacing/usage labels. Mark truncated excerpts; provide the full-entry link. Reuse the existing server HTML tooling if its runtime cost is acceptable; do not add a parser dependency by default.
- Cache successful normalized responses for 24 hours and genuine misses for five minutes. Do not cache operational errors as missing definitions. Use explicit cache settings supported by the installed Next.js version, verified on the actual host rather than assumed from development.
- Use a bounded in-memory browser cache (100 terms, no persistent lookup history), deduplicate in-flight requests, and make at most one browser lookup at a time. Do not prefetch every word or call the API on every pointer movement.
- Apply a proposed local abuse limit of 30 requests/minute per trusted client identity through an existing suitable limiter. At the upstream boundary constrain concurrency and honor provider cooldowns; account for multiple server instances/shared egress in the deployment check. Never represent a per-instance semaphore as a global limit.
- Respect `Retry-After` for 429/503. Without it, wait at least five seconds; no automatic retry loop. Manual retry remains disabled during cooldown. Rate limits and timeouts must not block ordinary page reading.

## Interaction and accessibility requirements

Use `dictionaryMode: 'off' | 'selection' | 'hover'` in the existing preference system. Labels: **Off**, **Select words**, **Hover + select**. Selecting either enabled mode also exposes an ordinary labeled lookup form with a submit button. Saving the setting must not send a lookup request.

Selection mode waits for a completed, stable single-word selection in eligible public text, then displays the definition card. Do not open while selection handles are moving, while dragging, or on each `selectionchange`. Preserve native copy and mobile selection menus. Mobile uses selection/manual lookup even if the saved mode is hover.

Hover mode uses a 600 ms dwell on the same word and only runs for fine pointers with hover support. Use caret hit-testing plus word boundaries and a checked text range; no wrapping every word in spans, replacing CMS HTML, or adding a tab stop per word. Feature-detect `caretPositionFromPoint`, use a tested browser fallback where available, and otherwise retain selection/manual lookup. [S7]

Only inspect visible text inside `#main-content`. Exclude links/buttons and other controls, forms, inputs, textareas, password fields, editable content, hidden/inert regions, dialogs, the accessibility panel, dictionary UI, embedded frames, and elements marked `data-dictionary-exclude`. Inspect the entire selected range, not only its first node. Explicitly disable lookup on payment/receipt/verification, registration confirmation and other sensitive views even where they share the public layout; inventory those routes before implementation.

The card is a non-modal interactive popover/region, not `role="tooltip"` with interactive children. It includes the word, language, part of speech, senses, source/license, close button and actionable error states. Do not move focus on automatic hover or selection. Offer a keyboard-accessible action to reach the result; deliberate manual form submission may move focus to its heading, with a clear return path. Announce concise status changes politely, without reading every hovered definition aloud. Screen-reader users must be able to complete lookup through the ordinary form.

Escape and Close dismiss; suppress reopening for the same unchanged hover/selection. The card remains present while its content is hovered or focused, and gives users enough time to read. Route exit, reset or disabling dictionary cancels requests and removes its listeners. New selection supersedes hover. Suspend while another modal is active. Keep focus restoration specific to deliberate keyboard entry; never steal focus on a passive close. [S6]

Render in a portal to avoid clipping, with viewport-aware placement and an internal scroll region for long content. Integrate the reading mask/guide stacking explicitly so definitions remain visible. Verify all contrast modes, dyslexic font, increased spacing, sensory mode, 200% text size, browser zoom and narrow mobile widths.

## Existing integration points

| File | Planned responsibility |
|---|---|
| `lib/types/accessibility.ts` | Mode type, defaults, validation, decoding, equality and migration. |
| `contexts/accessibility-provider.tsx` | Persistence, setting/reset announcements and typed label maps. |
| `components/home-accessibility-button.tsx` | Public Dictionary mode control and discoverable manual lookup. |
| `app/(public)/layout.tsx` | Mount the public dictionary controller under the existing provider. |
| `components/accessibility-reading-aids.tsx` | Coordinate only if necessary for popup visibility and focus behaviour. |
| New `components/accessibility/dictionary.tsx` and CSS module | Selection/manual/hover interactions and result UI. |
| New `lib/dictionary/selection.ts` | Small testable term/range eligibility helpers. |
| `__tests__/accessibility/` | Provider/parser, preference migration and selection regressions. |

The current stored schema is V3 and validates required fields before decoding. Simply adding a required field would reject existing preferences. Plan an explicit V4 migration from V3 that preserves all current preferences and defaults dictionary to off; retain V1/V2 compatibility and update hardcoded migration/backup labels. Reset All and modified-state detection must include dictionary mode.

The working tree contains substantial unrelated in-progress changes. Re-read current files when implementation starts and preserve those changes. The public button is the integration target; the separate toolbar does not automatically need a redesign.

## Source attribution and maintenance

Show **Wiktionary contributors** linked to the exact entry and **CC BY-SA 4.0** linked to its license for applicable definition text. Include a compact note that formatting was removed and an excerpt may be shown; preserve any additional attribution notices discovered during provider verification. Keep source/license metadata with cached text. V1 omits audio and quoted usage examples because their rights can differ. [S4, S5]

Wiktionary volunteers maintain upstream entries. The site's maintainer owns the adapter, release checks and error monitoring. Link readers to the source for corrections. Do not silently rewrite definitions into medical guidance or present community entries as foundation-reviewed explanations. Curated foundation definitions can be a later, separately reviewed feature.

## Verification and rollout

Execute the linked tasks in order. Run focused deterministic tests with upstream requests mocked; live connectivity checks are separate and must not make CI flaky. Test a small representative set including `neurodiversity`, an ambiguous common word, a capitalized word, an inflection and a nonexistent word. Verify live access from the deployment host, not just this computer.

Record HTTP outcome categories and timing without logging selected words, surrounding content or lookup history at application level. Review hosting access logs because GET query strings can contain lookup terms. Monitor operational failures using existing logging only; no new analytics service is required.

Release only after preference migration, disabled-state network checks, HTML safety, keyboard/screen-reader use, mobile selection and outage behaviour pass. Default remains off. A server kill switch returns a non-cacheable disabled result; UI must clear the active lookup gracefully. Rollback removes/disables the dictionary controller without resetting unrelated accessibility preferences.

## References

Sources checked on 2026-09-25; policies and endpoint status can change.

- **S1:** [Wikimedia REST API: experimental Wiktionary definition endpoint](https://www.mediawiki.org/wiki/Wikimedia_REST_API).
- **S2:** [Wikimedia User-Agent policy](https://foundation.wikimedia.org/wiki/Policy:Wikimedia_Foundation_User-Agent_Policy).
- **S3:** [Wikimedia API rate limits](https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits) and [access policy](https://www.mediawiki.org/wiki/Wikimedia_APIs/Access_policy).
- **S4:** [Wikimedia Terms of Use, section 7](https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use#7._Licensing_of_Content).
- **S5:** [Wiktionary copyright information](https://en.wiktionary.org/wiki/Wiktionary:Copyrights) and [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- **S6:** [W3C: Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus).
- **S7:** [MDN: caretPositionFromPoint](https://developer.mozilla.org/en-US/docs/Web/API/Document/caretPositionFromPoint) and [getSelection](https://developer.mozilla.org/en-US/docs/Web/API/Window/getSelection).
- **Live probe:** [Wiktionary definition endpoint: neurodiversity](https://en.wiktionary.org/api/rest_v1/page/definition/neurodiversity).
