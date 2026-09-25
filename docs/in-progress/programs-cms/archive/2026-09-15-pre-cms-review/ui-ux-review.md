# Program prototype UI and UX review

Reviewed September 14, 2026. Scope: the Service and Campaign static demos, their content/components, and the CMS planning documents. This is an assessment and refinement proposal; application code has not been changed.

## Clarified design brief

The user confirmed that all prototype content is dummy content drawn from the planning documents. Dates, figures, testimonials and program wording are not being proposed as publishable facts. The content-accuracy observations below are future publishing considerations, not blockers or priorities for this design phase. The initial review placed too much emphasis on them.

The current objective is to establish four distinct category templates on a shared DEESSA foundation. Evaluate visual hierarchy, composition, section treatments, responsive behavior and visitor journeys with sample content. Service and Campaign are the first two experiments; Outreach and Research remain part of the intended system.

| Category | Intended visitor experience | Distinct composition |
| --- | --- | --- |
| Service | Understand the support and how to access it | Warm split hero, audience/benefit sections, process steps, family stories |
| Outreach | See what happened and who participated | Photo-led hero, documentary galleries, activity/location sections, community voices |
| Research | Understand a challenge, approach and results | Editorial hero, diagrams or product imagery, findings, methodology and resources |
| Campaign | Understand a shared goal and participate | Bold campaign hero, prominent message/action, optional progress, updates and involvement |

Shared foundations should include navigation, brand typography rules, spacing tokens, accessibility, content contracts and interaction primitives. Category templates should vary hero composition, page rhythm, image scale, statistics presentation, story/gallery treatments and action emphasis. Changing accent colors alone does not satisfy the brief.

Categories describe the format and purpose of the work; tags describe subjects such as autism, education or communication. For overlapping cases, select the template that fits the page's primary purpose. Campaigns can seek awareness or participation as well as donations, so fundraising progress and donation actions must remain optional. Likewise, a service template should support information-led programs without requiring an enrollment flow.

Next design priority: make Service and Campaign visibly distinct across the whole page, using the existing dummy datasets. Then test short/long content and omitted optional sections before extending the system to Outreach and Research. Finalize the content contract from those designs before database implementation.

## Actual routes and review coverage

- Service: `/demo/aac-support` (`app/(public)/demo/aac-support/page.tsx`).
- Campaign: `/demo/1000-families` (`app/(public)/demo/1000-families/page.tsx`).
- `/programs` exists, but its cards link to `/programs/[slug]`; the two detail pages currently live under `/demo`.
- Browser checked both heroes at desktop and 390 × 844 mobile, and read the rendered page content. Remaining sections were reviewed in source; this was not a complete keyboard, screen-reader, contrast, or device audit.
- Review reference: [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).

## Overall assessment

The reusable sections and separate category templates are a useful foundation. The service page has a clear support action, audience descriptions, a four-step process, and a family story. Mobile hero buttons stack into generous touch targets and body text is readable.

The biggest opportunity is to put visitor decisions earlier. Both pages currently lead with a large, similar blue split hero followed by long explanatory content. Families need to establish eligibility and access; campaign supporters need to understand the goal, current status, and what their contribution enables. Visual variation should reinforce those different tasks.

## Priority findings

### First: trust and working journeys

1. **Campaign status contradicts its dates.** `data/programs/1000-families.ts:6` and `:98` describe a 2024 campaign as active with 87 days remaining. Mark this explicitly as sample content during review. Before publishing, use verified dates, progress and lifecycle states; an ended campaign should show results and a relevant next action. Do not simply change the year to make it look current.
2. **Photography does not match its description.** `data/programs/aac-support.ts:18`: the rendered hero is a brain model, not a child using AAC. The campaign hero shows painted hands, not a training session. Use appropriate, consented program imagery and accurate alt text; identify illustrative stock photos as such. Audit gallery captions before using them as evidence of actual activities.
3. **Hero anchor links have no targets.** Both templates use section IDs as React keys without passing them into rendered sections. `components/programs/sections/RichTextSection.tsx:15` renders no ID. The campaign DOM confirms `#why-it-matters` has no matching element. Add stable IDs and a header-aware scroll offset for both pages.
4. **Some advertised destinations are missing.** `app/(public)/programs/page.tsx:45` points to the old detail route. `data/programs/aac-support.ts:282` offers a brochure absent from `public/resources`. Correct the demo links and provide an actual brochure or remove its action.
5. **The global intro blocks direct access.** `app/(public)/layout.tsx:19` mounts the intro on these pages. A full-screen animation appeared on the first visit; even skipping included an exit animation. Exclude service/campaign detail pages from the intro so visitors can immediately read and act.
6. **Claims look like verified facts.** `data/programs/1000-families.ts:39` contains precise prevalence/access percentages without citations; both datasets contain impact figures and attributed testimonials. Treat these as unverified demo content until the organization supplies sources, reporting periods, and approved stories. This review does not validate the medical or statistical claims.

### Second: make each category useful

**Service visitor: “Can this help my child, and how do I start?”**

- `data/programs/aac-support.ts:15`: replace the vague primary title with “AAC communication support”; keep “Every mind is a gift” as supporting brand copy if desired.
- Explain AAC in one short sentence near the title: communication tools and strategies for children who need support expressing themselves.
- Place a compact practical-details block near the hero: who it is for, location/remote availability, cost or subsidy, languages, current availability, and referral requirements. Unknown details need organization input, not invented answers.
- Put “Who this is for” and “How to get support” before the long AAC explanation. The current process begins at assessment and omits the first contact step.
- Use one consistent primary action such as “Ask about AAC support”; preserve the program context in the contact journey and explain what happens next. Only promise response times that the team can meet.
- Add FAQs for cost, diagnosis/referral requirements, travel/online options, device access, and first-visit expectations.

**Campaign visitor: “Is this current, what will my support do, and can I trust the progress?”**

- `data/programs/1000-families.ts:8` selects `warm`, and the hero uses `split`. Most shared sections also hardcode blue styling. A theme-label change alone will not produce the purple campaign design described in the docs.
- Put a compact progress summary beside or immediately below the headline: current/goal/unit, reporting date, actual campaign state, and one primary donation action. Currently the visitor must pass the long problem statement to reach progress.
- Prefer a bold, readable heading and restrained purple/yellow accents. A full-bleed image is optional; clarity and contrast matter more than matching the mockup literally.
- Explain how contributions are used, who delivers the support, and how progress is counted. Add suggested amounts only when their impact claims are verified.
- Keep volunteering secondary and sharing tertiary. Preserve campaign context when entering the donation flow; the current URL is only `/donate`.
- Lead with a short, respectful account of the need and a concrete response. Avoid relying on repeated urgency or unverified percentages.

### Third: simplify presentation and interaction

- **Reduce repeated visual weight.** Most sections use 80–112 px vertical padding, large centered headings, shadows, rounded cards, and gradients. Use tighter spacing for related information, fewer decorative containers, and a mix of short text, lists, and real photography. On mobile, shorten hero copy and reduce the gap before the image so practical information appears sooner.
- **Use the handwritten type selectively.** It adds warmth to a short service tagline but makes a long campaign name harder to scan. Use a clearer display/body family for long titles, numbers, dates, and operational details.
- **Make gallery captions visible.** `components/programs/sections/GallerySection.tsx:60` hides captions until hover on a non-focusable container. Show captions beneath images, especially on touch devices. Do not suggest a zoom action unless an accessible image viewer exists.
- **Simplify progress.** `components/programs/sections/ProgressTrackerSection.tsx` repeats the same result in a ring, count card, bar, and remaining card. One labeled progress bar with a numeric summary is enough; put dated updates beneath it.
- **Correct the ring if retained.** Its percentage-based radius changes with its container, but `strokeDasharray` is fixed at 1000. Normalize with `pathLength` or calculate circumference so the arc represents the same percentage at every size. Provide native progress semantics or equivalent accessible values.
- **Check narrow progress layouts.** The large current/goal numerals share a non-wrapping row inside a heavily padded card; dates always use three columns. These are source-identified mobile risks requiring section-level rendering checks at 320–390 px. Allow wrapping, smaller numerals and stacked dates.
- **Respect reduced motion in JavaScript.** Global CSS already reduces CSS animation and supplies focus outlines. The Framer Motion entrance animations and timer-based counter still need reduced-motion handling. Avoid initially displaying zero as if it were real campaign progress.
- **Handle failed images.** Hero/gallery loaders clear on load only. An image failure can leave an indefinite skeleton. Add a useful fallback and ensure text remains immediately available.

## Proposed page order

| Service | Campaign |
| --- | --- |
| Clear service title, short benefit, support action | Campaign title, current status, concise goal |
| Eligibility, delivery, cost, availability | Progress and last-updated date, donate action |
| What support includes | What contributions enable |
| How to get started | Brief need and response |
| Family story and verified outcomes | Latest dated update and verified outcomes |
| Optional deeper AAC explanation | Family story and relevant photographs |
| Practical FAQs | Delivery/accountability and FAQs |
| Small captioned gallery | Timeline or past updates if useful |
| Consistent support action | Donate, volunteer, share |

Add a simple “All programs” return link and section navigation for longer pages. A mobile sticky action can be evaluated after the page is shortened; it must not cover content or focused controls.

## Implications for the CMS plan

- Keep the central principle: content in the CMS, presentation in the frontend. Embedded global `<style>` blocks in both data files currently break that separation and can restyle headings/lists outside their section. Move styling into scoped components and sanitize future editor HTML.
- Add structured service access fields and an FAQ section to the prototype contract. FAQs appear in the architecture plan but not the current section-type union.
- Add campaign lifecycle, ISO dates, reporting timestamp, progress unit/definition, and appropriate action destinations. Calculate days remaining; do not ask editors to maintain a second countdown field.
- Store photo descriptions/captions separately and support attribution/consent records, plus sources/reporting periods for statistics.
- Reconcile the older relational architecture with the newer category-specific JSON section design before migrations. They are alternative contracts, not a single finalized schema.
- Update `PROTOTYPE-TESTING.md`: it still describes `/programs/[slug]`, a full-bleed campaign hero, and a share action that the current demos do not implement. README phase checklists also lag behind the existing components.
- For editors, favor category defaults, practical-details fields, section reordering and preview. Avoid exposing color/layout choices before the two visitor journeys are settled.

## Recommended implementation sequence

1. Fix links/anchors, label sample content, remove the detail-page intro interruption, and correct image descriptions/assets.
2. Restructure the service hero/access information and campaign hero/progress summary.
3. Add FAQs, visible gallery captions, responsive progress layout, and reduced-motion behavior.
4. Verify full-page mobile layouts, keyboard navigation, contrast, image failures and actual CTA destinations.
5. Reconcile the approved content contract and documentation, then proceed with CMS storage/admin work.

Completion criteria: a new visitor can identify the program, decide whether it applies to them, understand its current status, and take the correct next step without reading the entire page.
