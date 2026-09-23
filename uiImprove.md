# Deessa Foundation — nine full-page UI redesign prompts

Repository review: 20 September 2026. Deliverable: design prompts only; no website changes or image generation.

## Scope and evidence

The six primary links and three secondary links in `components/navbar.tsx` define these nine pages:

| # | Navbar label | Route |
|---|---|---|
| 1 | Home | `/` |
| 2 | Who We Are | `/about` |
| 3 | Our Story | `/our-story` |
| 4 | What We Do | `/whatwedo` |
| 5 | Stories | `/stories` |
| 6 | Events | `/events` |
| 7 | Podcasts | `/podcasts` |
| 8 | Support | `/support` |
| 9 | Contact | `/contact` |

Support is conditional on a setting; its enabled state is included to cover all nine configured links. Donate (`/donate`) and Register (a configurable destination, falling back to `/events`) are navbar action buttons, not additional pages in this requested nine-prompt set. Both remain in every header. Impact is commented out of the navbar. Footer-only destinations, detail pages, registration, and payment flows are outside this set.

This is a source-based examination of rendered page structure, child components, local assets, styles, and fallback content. Live database records and browser-rendered pages were not verified. A content type or unused component existing in the repository does not mean it appears on the page. For example, Home does **not** currently mount the impact statistics, timeline, or partner sections exported by `homepage-sections.tsx`; those are intentionally not added to its prompt.

Each fenced block below is one complete prompt for one continuous desktop page image. Use the whole block, with the actual referenced assets attached to the image model. Repository paths alone do not give an external image model access to images. Supply available CMS text/records as a content attachment; unresolved fields must remain visibly labeled placeholders, not invented records. The height should grow to fit the supplied content, rather than cropping the footer or shrinking text to fit a fixed poster ratio. Responsive instructions describe the intended behavior; do not render separate phone/tablet screens in the same image.

## Existing brand palette — mandatory across all nine pages

The authoritative palette is the Ocean Blue theme in `app/globals.css`, not an assortment of page-local hex values.

| Role | Existing color | Redesign use |
|---|---|---|
| Primary | Ocean Blue `#3FABDE` | Brand emphasis, selection, icons, decorative rules |
| Dark primary | Deep Ocean `#0B5F8A` | Readable links, primary button backgrounds with white text, dark callouts |
| Light primary | `#E8F6FC` | Section backgrounds, selected surfaces |
| Logo purple | `#6F3E96` | Small secondary accents, never a competing page theme |
| Logo yellow | `#F7C52B` | Small highlights with dark text |
| Empowerment | `#D6336C` | Relevant community accents |
| Environment | `#95C11F` | Relevant sustainability accents |
| Education | `#F59E0B` | Relevant learning accents |
| White / soft background | `#FFFFFF` / `#F8F9FA` | Main surfaces |
| Main / muted text | `#212529` / `#6C757D` | Text hierarchy; retain readable contrast |
| Semantic only | Success `#16A34A`, warning `#F59E0B`, danger `#DC2626`, info `#2563EB` | Real status and validation feedback |

Keep the supplied multicolor logo unchanged. Do not recolor its artwork to match approximate CSS tokens. Tints and opacity of the existing palette are allowed. Normalize page-local teal, unrelated pastel gradients, and navy panels to the existing Ocean Blue system; do not introduce a new brand palette. Ocean Blue with white small text should not be assumed accessible: use the existing Deep Ocean token for that pairing. Contrast and responsive behavior still need verification during implementation; an image cannot prove accessibility.

Retain the project's typographic personality: bundled **Marissa Font** for short expressive headings, **Comic Neue** for heading numerals/ampersands and compact friendly labels, and the already-used **DM Sans** for readable body copy and form controls. Plus Jakarta Sans is the root font; choosing DM Sans consistently for public-page body copy is a proposed consolidation of existing fonts, not a new font introduction. Preserve a restrained brush-stroke motif and human photography while reducing glow, decorative clutter, oversized heroes, hidden-on-hover content, and inconsistent component treatments.

Shared public shell: `app/(public)/layout.tsx`, `components/navbar.tsx`, `components/footer.tsx`, and `components/accessibility/*`. Every inventory below starts with the navbar and ends with the shared newsletter and footer. Intro/development notices and modal players are overlays, not extra page sections; prompts show the settled, unobscured page with overlays closed. Keep the accessibility launcher clear of controls.

## 1. Home — `/`

### Existing sections, top to bottom

1. Shared navbar.
2. CMS hero carousel: visible slides sorted by configured order.
3. Our Story: origin image, narrative, foundation badge, full-story link.
4. Our Direction: Mission, Vision & Objectives, accompanying image and three content cards.
5. What We Do: introduction and four pillars.
6. Living With Autism podcast feature, two hosts, podcast link.
7. Global Voices: Inclusion Begins with Acceptance testimonial/video carousel.
8. Find Us: Visit Our Office, four contact details and embedded map.
9. Shared Stay Connected newsletter and footer; back-to-top utility.

Sources: `app/(public)/page.tsx`, `components/hero-carousel.tsx`, `components/homepage-sections.tsx`, `lib/types/homepage-settings.ts`, `lib/data/homepage-settings.ts`.

### Assumptions and content cautions

Use repository defaults when CMS values are not supplied. A single image shows one active carousel slide, not all slides as separate sections. The default hero has three slides: “Understanding Begins with Lived Experience,” “Parents Turning Experience into Support,” and “Confidence and Belonging on the Field.” The default story says Founded 2022. Mission objectives contain numerical **targets**, not achieved impact. Home's office is Dhobighat Nayabato, Sanepa, Lalitpur 44600; its phone is explicitly `+977-1-XXXXXXX`. Contact contains different details; preserve and flag the discrepancy rather than silently reconciling it.

### Master prompt 1

```text
Create one continuous, high-resolution, full-page desktop website mockup of Deessa Foundation's Home page. Show every section below, from navigation to the complete footer, in this exact order. Use a 1440px-wide design canvas with enough vertical height for readable content. No collage of screens, device frames, cropped bottom, or separate section mockups.

DESIGN SYSTEM AND HEADER — mandatory, identical across all nine Deessa pages. Preserve the supplied /logo.png artwork, proportions and colors. Use the existing Ocean Blue #3FABDE, Deep Ocean #0B5F8A, light blue #E8F6FC, white #FFFFFF, soft neutral #F8F9FA, main text #212529 and muted text #6C757D. Small supporting accents may use only existing logo purple #6F3E96, logo yellow #F7C52B, empowerment pink #D6336C, environment green #95C11F and education amber #F59E0B. No new teal, navy, beige or lavender theme; tints of existing tokens are allowed. Keep photography and original brand artwork in their natural colors. Use Deep Ocean behind white small button text and for readable links; Ocean Blue remains the dominant brand accent. Use Marissa Font for short expressive headings, Comic Neue for heading numerals/ampersands and compact labels, and DM Sans for readable body copy, forms and long card titles. Aim for 48–60px hero headings, 32–40px section headings, 22–26px card titles, 17–18px body text, 1.6–1.75 body line height, and 60–70 characters per text line. Use a centered 1200px content width, a 12-column desktop grid, 24–32px gutters, an 8px spacing rhythm, 80–96px section padding, 24–32px card padding, 12–20px radii, delicate borders and minimal shadows. Retain occasional quiet brush strokes; remove glowing decoration and arbitrary overlapping cards. Preserve all supplied content without invented statistics or identities. Render text and images fully visible after entrance effects, with intro, development-notice and video overlays closed.

Begin with one tidy shared two-row navigation: a proportionate logo on the left; Home, Who We Are, Our Story, What We Do, Stories and Events in the main row; Podcasts, Support and Contact in a slim light-blue secondary row. Keep Register outlined and Donate emphasized, respect their existing destinations, mark the current page with a simple underline and readable label, and keep all nine links discoverable when scrolling. Do not shrink the text to force everything into one crowded row. Include an unobtrusive accessibility launcher clear of content. On mobile the same links belong in a keyboard-accessible menu with Donate easy to find. Across all responsive layouts use at least 44px tap targets, logical reading order, visible labels and sufficient focus contrast; reduced-motion intent replaces continuous auto-animation. The output image itself shows only the full desktop page.

1. HERO CAROUSEL. Make the opening welcoming and legible, roughly 560px tall rather than a full-screen obstacle. Use a balanced text-and-photo composition: the exact headline “Understanding Begins with Lived Experience,” the existing subtitle “Children, parents, and advocates shared real experiences of autism, building empathy, breaking stigma, and creating space for acceptance,” and “Learn About deessa.” Use the supplied /home/hero/real-voices-young-speaker.jpg prominently, preserving faces. Include previous/next controls, a pause control as a usability improvement, and three quiet position indicators. Other slides remain carousel states, not extra bands; their supplied assets are inclusion-begins-at-home-v2.jpg and girls-leadership-football.jpg. Prefer a clean light-blue text panel to text obscuring the speaker.

2. OUR STORY. Use a generous two-column editorial section with /home/story/deessa-foundation-origin-story.jpg, “How deessa Started,” a small “Founded 2022” badge, and the two existing narrative paragraphs about Deetya's bilateral clubfoot, Marissa's autism, family experience, and the origin of the name. Keep the supplied wording and “Read Our Full Story.” Set text on white, not over an image; let the photograph and paragraph widths feel balanced.

3. MISSION, VISION & OBJECTIVES. Keep “Our Direction,” “Mission, Vision & Objectives,” and “Guided by clear values and a bold vision for Nepal's future.” Pair /missionVisionObjectives.png with three vertically aligned cards for Our Mission, Our Vision, and Our Objectives. Preserve their existing copy: community empowerment through education, healthcare and sustainable development; a Nepal where communities thrive; and the targets of 100+ schools, 50,000+ lives through healthcare, and 10,000+ women through skills. Present those numbers within the Objectives copy, never as completed impact statistics. Use a pale-blue section and white cards with one consistent icon treatment.

4. WHAT WE DO. Use the heading “We turn understanding into action for children, families, and communities.” Preserve the four areas in order: Awareness & Community Engagement; Training; Resources; Advocacy. Keep their existing descriptions about challenging myths, equipping parents/teachers/health workers, providing accessible guides, and pushing for inclusive schools and rights. Render a readable two-by-two grid of icon-and-text cards with equal padding and consistent Explore this area links. Keep the existing small labels Communities, Trained, Resources and Policies, but do not display the unused numerical statEnd fields as achievement counters. These Home cards do not render pillar videos; do not add them.

5. PODCAST FEATURE. Create one clear horizontal feature using /podcast_banner.png, “Living With Autism,” “Real voices and real stories,” and the current explanatory copy. Show the actual supplied portraits of Merina Panthii, President & Host, and Sarita Sapkota, Parent & Host. Preserve “Explore the podcast.” Use Deep Ocean for a restrained feature panel and white text, keeping the banner itself intact.

6. GLOBAL VOICES. Preserve “Inclusion Begins with Acceptance” and the supplied testimonial/video records. Show one active quote with its correct name, role, media poster/play button, and obvious manual navigation. Default records include Soyun Kim, Chris Liu, Blair Chen, and Marcus Brand; do not invent quotes or portraits. With the default first record use Soyun Kim, Seoul National University, and “Understanding autism begins with listening, learning, and accepting every child as they are.” Give the quote comfortable reading width and avoid overlapping image stacks.

7. VISIT OUR OFFICE. Keep “Find Us,” “Visit Our Office,” and an aligned two-column contact-and-map layout. Display the Home source details: Dhobighat Nayabato, Sanepa, Lalitpur 44600, Nepal; +977-1-XXXXXXX; deessa.social@gmail.com; Sun–Fri 10:00 AM–5:00 PM, Saturday closed. Keep the placeholder phone visibly unchanged. Use a map panel corresponding to the supplied office location, without inventing a precise verified pin. Provide balanced height and rounded corners rather than an excessively tall map.

SHARED NEWSLETTER AND COMPLETE FOOTER — finish the page with the same treatment used across the other eight designs. Preserve the newsletter heading “Stay Connected,” its update invitation, the three benefits Monthly impact reports / Upcoming events & programs / Stories from the field, the source “Join 2,400+ supporters” line, an email field with a visible label, Subscribe, and “No spam. Unsubscribe anytime.” Keep the existing “100% Transparent” message, its financial-transparency paragraph and “Explore our financials” link as source content, without inventing new proof or metrics. Use a compact but complete two-column newsletter area, then a structured Deep Ocean footer with white text, readable light text for secondary links, and Ocean Blue accents. Retain the logo, “Our Mission” copy about rural Nepal, education, healthcare and livelihoods since 2022; and Get in Touch: Dhobighat Nayabato, Sanepa, Lalitpur 44600, Nepal / deessa.social@gmail.com / +977 1-4123456. These are source values, not newly verified claims.

Preserve all four footer link groups in aligned columns. About: Our Mission, Our Story, Our Team, Partners, Press & Media, Annual Reports, Autism Programs, Careers. Programs: Education, Healthcare, Women Empowerment, Disaster Relief, Art Workshop, Training Programs. Get Involved: Donate, Volunteer, Become a Member, Events, Sponsor a Child, Corporate Partnership. Resources: Brand Guidelines, Organization Bio, SWC Certificate, Contact Us, Photo Gallery, Newsletter Archive. Retain Facebook, Instagram and YouTube actions, and the existing Twitter coming-soon affordance rather than inventing a live Twitter account. Finish with the source copyright line, Privacy Policy, Terms of Use, Sitemap and the discreet existing admin access. Keep real link/download destinations from the project. Make footer text readable, allow adequate vertical height, and never crop the bottom. On small screens these groups stack or become accessible disclosures while preserving every link.

Responsive intent: stack hero copy before image, then editorial copy and media in logical reading order; four pillars become two columns then one; podcast hosts wrap without truncating names; contact details precede the map. Keep carousel controls reachable and the back-to-top control separate from the accessibility launcher. Do not add impact-statistic, timeline, or partner sections that are not mounted on this Home page.
```

## 2. Who We Are — `/about`

### Existing sections, top to bottom

1. Shared navbar.
2. About hero: headline, campaign background, two actions, trust badges.
3. Who We Are: looping video, Since badge, introduction, quote, four-step inclusion flow.
4. How We Do It: four steps and closing statement.
5. Our Journey: CMS milestone timeline.
6. Governance: organization structure and operational teams.
7. Meet the Changemakers: published team or local fallback cards.
8. Our Partners & Supporters: six sector/category cards.
9. Ready to Make a Difference? CTA.
10. Shared newsletter and footer.

Sources: `app/(public)/about/page.tsx`, `AboutSections.tsx`, `OrgStructure.tsx`, `components/about-hero.tsx`, `lib/types/about-settings.ts`, `data/team.ts`.

### Assumptions and content cautions

CMS text/team records may override defaults. The rendered partners section is six **categories**, not actual partner logos; do not invent organizations. The default timeline is 2022, 2024, 2025, 2026, different from Our Story's 2021–2023 narrative. Keep each source's text pending editorial reconciliation. The hero's “Read Our Story” currently goes to `#journey`, while Annual Reports goes to `/impact#reports`; preserve destinations. Governance describes General Assembly as the highest authority even though the source visual places it fourth: preserve those words and use a neutral sequence rather than implying a new legal reporting hierarchy.

### Master prompt 2

```text
Create one continuous full-page desktop UI mockup for Deessa Foundation's “Who We Are” page, 1440px wide and tall enough for all sections in the following order. Render a finished page, with no device mockups, separate screen collection, cropped sections, or new organization claims.

DESIGN SYSTEM AND HEADER — mandatory, identical across all nine Deessa pages. Preserve the supplied /logo.png artwork, proportions and colors. Use the existing Ocean Blue #3FABDE, Deep Ocean #0B5F8A, light blue #E8F6FC, white #FFFFFF, soft neutral #F8F9FA, main text #212529 and muted text #6C757D. Small supporting accents may use only existing logo purple #6F3E96, logo yellow #F7C52B, empowerment pink #D6336C, environment green #95C11F and education amber #F59E0B. No new teal, navy, beige or lavender theme; tints of existing tokens are allowed. Keep photography and original brand artwork in their natural colors. Use Deep Ocean behind white small button text and for readable links; Ocean Blue remains the dominant brand accent. Use Marissa Font for short expressive headings, Comic Neue for heading numerals/ampersands and compact labels, and DM Sans for readable body copy, forms and long card titles. Aim for 48–60px hero headings, 32–40px section headings, 22–26px card titles, 17–18px body text, 1.6–1.75 body line height, and 60–70 characters per text line. Use a centered 1200px content width, a 12-column desktop grid, 24–32px gutters, an 8px spacing rhythm, 80–96px section padding, 24–32px card padding, 12–20px radii, delicate borders and minimal shadows. Retain occasional quiet brush strokes; remove glowing decoration and arbitrary overlapping cards. Preserve all supplied content without invented statistics or identities. Render text and images fully visible after entrance effects, with intro, development-notice and video overlays closed.

Begin with one tidy shared two-row navigation: a proportionate logo on the left; Home, Who We Are, Our Story, What We Do, Stories and Events in the main row; Podcasts, Support and Contact in a slim light-blue secondary row. Keep Register outlined and Donate emphasized, respect their existing destinations, mark the current page with a simple underline and readable label, and keep all nine links discoverable when scrolling. Do not shrink the text to force everything into one crowded row. Include an unobtrusive accessibility launcher clear of content. On mobile the same links belong in a keyboard-accessible menu with Donate easy to find. Across all responsive layouts use at least 44px tap targets, logical reading order, visible labels and sufficient focus contrast; reduced-motion intent replaces continuous auto-animation. The output image itself shows only the full desktop page.

1. HERO. Use “Our Team & Mission,” “The People Behind Nepal's Change,” and the existing subtitle identifying parents, educators, professionals, and advocates working with children with disabilities, especially autism. Place readable copy beside the supplied /deessa_img.jpg campaign artwork; retain its neurodiversity message and avoid cropping its embedded lettering. Preserve “Read Our Story,” “View Annual Reports,” “Govt Registered,” and “SWC Affiliated.” Keep trust badges modest, with no new accreditation seals. Use a 520–580px opening with white/light-blue surfaces.

2. WHO WE ARE. A two-column section pairs a paused poster frame from /every_child.mp4 and accessible playback controls with “Since 2022,” “Every child has potential. Every child belongs,” and the three supplied paragraphs about neurodiversity, inclusion, and participation. Keep the quote “When we embrace neurodiversity, we unlock potential in every child.” Finish with four orderly connected labels: Seen → Heard → Supported → Thrive. Use the source defaults, not obsolete labels from source comments.

3. HOW WE DO IT. Preserve “Change doesn't start with programmes. It starts with people,” its introduction, and four readable steps: We Listen First; We Train the People Who Show Up; We Work Through Partnership; We Build Change That Lasts. Include each supplied paragraph and the closing statement about people building lasting inclusion together. Use four aligned cards on a light-blue band, small numbered markers and quiet connecting rules. Do not turn paragraphs into tiny captions.

4. OUR JOURNEY. “Milestones that define our path.” Show all four default milestones: 2022 deessa Foundation begins; 2024 Building understanding; 2025 Belonging through participation; 2026 Advocacy for inclusive support. Include their original descriptions and supplied /about/journey/ images. Design a single clear vertical chronological spine with uniformly proportioned image-and-text entries. Keep years visually dominant and all content visible without hover or sideways scrolling.

5. GOVERNANCE. Preserve “How the Foundation Is Organized,” its introduction, and the source's four groups in order: Founding Vision — Concept Designer & Co-Founders; Governing Board — Executive Board; Advisory Circle — Advisory Board & Thematic Advisors; General Assembly — General Members. Keep all descriptions, including General Assembly's highest-authority wording. Design a legible ordered organizational overview with subtle separators, avoiding invented supervisory arrows. Follow with an “Operational Level” row containing Working Team and Technical Team and their respective day-to-day operations and expertise descriptions.

6. MEET THE CHANGEMAKERS. Present supplied published team records with actual portraits, name, role, bio, and available social links. If no CMS attachment is supplied, use only the repository fallback: Bikram Thapa, Program Director, “Leading education initiatives across rural Nepal”; Rejina Gharti Magar, Community Lead, “Building sustainable communities through grassroots engagement”; Deepak Bashyal, Health Coordinator, “Bringing healthcare access to remote villages.” Use their changeMaker1/2/3.jpeg assets. Make names and bios visible beneath portraits rather than revealing essential text only on hover.

7. PARTNERS & SUPPORTERS. Keep the introduction about working across sectors and six icon cards: Partnerships, Global NGOs, Education, Healthcare, Water, Environment. Render these as categories in a tidy three-by-two grid, not as a fabricated sponsor-logo wall.

8. FINAL CTA. “Ready to Make a Difference?” with existing involvement copy, “Donate Now,” and “Join Our Team.” Use a Deep Ocean panel, one restrained brush edge, and balanced buttons. No pulsing call to action.

SHARED NEWSLETTER AND COMPLETE FOOTER — finish the page with the same treatment used across the other eight designs. Preserve the newsletter heading “Stay Connected,” its update invitation, the three benefits Monthly impact reports / Upcoming events & programs / Stories from the field, the source “Join 2,400+ supporters” line, an email field with a visible label, Subscribe, and “No spam. Unsubscribe anytime.” Keep the existing “100% Transparent” message, its financial-transparency paragraph and “Explore our financials” link as source content, without inventing new proof or metrics. Use a compact but complete two-column newsletter area, then a structured Deep Ocean footer with white text, readable light text for secondary links, and Ocean Blue accents. Retain the logo, “Our Mission” copy about rural Nepal, education, healthcare and livelihoods since 2022; and Get in Touch: Dhobighat Nayabato, Sanepa, Lalitpur 44600, Nepal / deessa.social@gmail.com / +977 1-4123456. These are source values, not newly verified claims.

Preserve all four footer link groups in aligned columns. About: Our Mission, Our Story, Our Team, Partners, Press & Media, Annual Reports, Autism Programs, Careers. Programs: Education, Healthcare, Women Empowerment, Disaster Relief, Art Workshop, Training Programs. Get Involved: Donate, Volunteer, Become a Member, Events, Sponsor a Child, Corporate Partnership. Resources: Brand Guidelines, Organization Bio, SWC Certificate, Contact Us, Photo Gallery, Newsletter Archive. Retain Facebook, Instagram and YouTube actions, and the existing Twitter coming-soon affordance rather than inventing a live Twitter account. Finish with the source copyright line, Privacy Policy, Terms of Use, Sitemap and the discreet existing admin access. Keep real link/download destinations from the project. Make footer text readable, allow adequate vertical height, and never crop the bottom. On small screens these groups stack or become accessible disclosures while preserving every link.

Responsive intent: all editorial pairs stack, process cards become a vertical sequence, the timeline remains chronological, and operational/team/category grids reduce to one or two columns. Keep long roles, all governance descriptions, and full names readable. Maintain the same Ocean Blue identity as every other Deessa page.
```

## 3. Our Story — `/our-story`

### Existing sections, top to bottom

1. Shared navbar.
2. Why We Were Founded hero.
3. The Sisters who Sparked a Movement.
4. Facing the Invisible Walls: three challenge cards and brush-stroke quote.
5. Founding-question statement, four lines describing rural barriers, purpose paragraph.
6. The Birth of a Vision: 2021–2023 timeline.
7. More Than a Name: name explanation, Direction card, family-photo carousel.
8. Our Mission and Our Vision.
9. The Evolution of Impact: three qualitative transitions.
10. Every child deserves understanding / Every family deserves support CTA.
11. Shared newsletter and footer.

Sources: `app/(public)/our-story/page.tsx`, `AnimatedBrushQuote.tsx`, `components/circular-testimonials.tsx`.

### Assumptions and content cautions

This page is largely hardcoded. Preserve its stated 2023 official launch without rewriting About's 2022 foundation date. “Dee” + “Ssa” here differs from Home's “Dee” + “essa”; retain page-specific wording. The Evolution of Impact is qualitative, not a data dashboard. Existing family photos are references of identifiable people: preserve them, rather than generating substitute identities or fictional documentary scenes.

### Master prompt 3

```text
Design one complete vertically scrolling desktop mockup of Deessa Foundation's Our Story page, from the shared navbar through the entire footer. Use a 1440px-wide high-resolution canvas with ample height for this long narrative. All sections must be present in the order below; no separate poster panels or shortened landing-page substitute.

DESIGN SYSTEM AND HEADER — mandatory, identical across all nine Deessa pages. Preserve the supplied /logo.png artwork, proportions and colors. Use the existing Ocean Blue #3FABDE, Deep Ocean #0B5F8A, light blue #E8F6FC, white #FFFFFF, soft neutral #F8F9FA, main text #212529 and muted text #6C757D. Small supporting accents may use only existing logo purple #6F3E96, logo yellow #F7C52B, empowerment pink #D6336C, environment green #95C11F and education amber #F59E0B. No new teal, navy, beige or lavender theme; tints of existing tokens are allowed. Keep photography and original brand artwork in their natural colors. Use Deep Ocean behind white small button text and for readable links; Ocean Blue remains the dominant brand accent. Use Marissa Font for short expressive headings, Comic Neue for heading numerals/ampersands and compact labels, and DM Sans for readable body copy, forms and long card titles. Aim for 48–60px hero headings, 32–40px section headings, 22–26px card titles, 17–18px body text, 1.6–1.75 body line height, and 60–70 characters per text line. Use a centered 1200px content width, a 12-column desktop grid, 24–32px gutters, an 8px spacing rhythm, 80–96px section padding, 24–32px card padding, 12–20px radii, delicate borders and minimal shadows. Retain occasional quiet brush strokes; remove glowing decoration and arbitrary overlapping cards. Preserve all supplied content without invented statistics or identities. Render text and images fully visible after entrance effects, with intro, development-notice and video overlays closed.

Begin with one tidy shared two-row navigation: a proportionate logo on the left; Home, Who We Are, Our Story, What We Do, Stories and Events in the main row; Podcasts, Support and Contact in a slim light-blue secondary row. Keep Register outlined and Donate emphasized, respect their existing destinations, mark the current page with a simple underline and readable label, and keep all nine links discoverable when scrolling. Do not shrink the text to force everything into one crowded row. Include an unobtrusive accessibility launcher clear of content. On mobile the same links belong in a keyboard-accessible menu with Donate easy to find. Across all responsive layouts use at least 44px tap targets, logical reading order, visible labels and sufficient focus contrast; reduced-motion intent replaces continuous auto-animation. The output image itself shows only the full desktop page.

1. HERO. Use /OurStoryHeroImage.png, “Our Story,” “Why We Were Founded,” and “Every movement begins with a story. Ours began with two little girls.” Preserve the photo composition and create a calm Deep Ocean overlay only where needed for legibility. Keep the hero around 540px tall with a restrained brush transition, not an 82vh barrier to the story.

2. THE SISTERS WHO SPARKED A MOVEMENT. Place /twins-hug.jpg beside the existing three paragraphs introducing twin daughters Deetya and Marissa, Deetya's bilateral clubfoot and continuing support, and Marissa's autism diagnosis. Keep the respectful language and both D/Deetya and M/Marissa identity tiles. Use a comfortable editorial reading width, a straight image frame, generous paragraph spacing, and no decorative overlap across faces.

3. FACING THE INVISIBLE WALLS. Preserve the introduction and all three challenge cards: Limited & Distant Care, including travel to India for therapy; Stigma & Misunderstanding, including dismissive advice and isolation; A Search for Belonging, including five schools before age seven. Give cards equal visual treatment but enough height for unequal copy. Below, retain the diagnosis quote in a Deep Ocean callout with white text: “The diagnosis brought fear, uncertainty, and countless questions… We wanted to do everything for her, but didn't know where to start.” Avoid repeating it as decorative background typography.

4. THE FOUNDING QUESTION. Preserve the full question beginning “If it was this hard for our family” and ending “what must it be like for a family in rural Nepal?” Set it as a readable large quotation, not oversized text that dominates several screenfuls. Below it retain: No specialist nearby. No information. No guidance. No one to tell them they are not alone. Include the complete purpose paragraph about no parent walking alone and no child being left behind.

5. THE BIRTH OF A VISION. A compact vertical timeline shows 2021: The Realization; 2022: Building Community; 2023: Official Launch. Preserve each source description: discussions about inaccessible resources, connecting specialists and parents, and establishment focused on education, health equity and social inclusion. Use consistent year markers and aligned text cards; do not invent later milestones.

6. MORE THAN A NAME. Pair the explanation of “Dee” from Deetya and “Ssa” from Marissa with the Nepali-context “Direction” card and its guidance/dignity message. Beside it show the supplied family-photo carousel as one active image with a small thumbnail strip and manual previous/next controls. Assets include twins-newborn, twins-together, twins-dino, twins-cheer, twins-curious and the two twin-solo photos. Keep photographs intact and the name explanation typographically clear.

7. MISSION AND VISION. Two equally weighted cards preserve the complete existing statements about breaking barriers through accessible healthcare, educational resources and support, and every child being seen, heard and able to live with dignity and purpose. Use light-blue surfaces, Deep Ocean headings and small existing brand accents.

8. THE EVOLUTION OF IMPACT. Three cards show “From confusion / to clarity,” “From stigma / to acceptance,” and “From isolation / to support,” with the source's knowledge/diagnosis, awareness, and family-network descriptions. These are qualitative changes: include no counters, invented metrics or charts.

9. FINAL INVITATION. Preserve “Every child deserves understanding. Every family deserves support,” the existing shared-journey paragraph, and “Join Us” / “Support Our Mission.” Use a Deep Ocean rounded panel with the existing seedling background only if supplied, subdued behind readable text; otherwise keep the same panel without fabricated documentary imagery.

SHARED NEWSLETTER AND COMPLETE FOOTER — finish the page with the same treatment used across the other eight designs. Preserve the newsletter heading “Stay Connected,” its update invitation, the three benefits Monthly impact reports / Upcoming events & programs / Stories from the field, the source “Join 2,400+ supporters” line, an email field with a visible label, Subscribe, and “No spam. Unsubscribe anytime.” Keep the existing “100% Transparent” message, its financial-transparency paragraph and “Explore our financials” link as source content, without inventing new proof or metrics. Use a compact but complete two-column newsletter area, then a structured Deep Ocean footer with white text, readable light text for secondary links, and Ocean Blue accents. Retain the logo, “Our Mission” copy about rural Nepal, education, healthcare and livelihoods since 2022; and Get in Touch: Dhobighat Nayabato, Sanepa, Lalitpur 44600, Nepal / deessa.social@gmail.com / +977 1-4123456. These are source values, not newly verified claims.

Preserve all four footer link groups in aligned columns. About: Our Mission, Our Story, Our Team, Partners, Press & Media, Annual Reports, Autism Programs, Careers. Programs: Education, Healthcare, Women Empowerment, Disaster Relief, Art Workshop, Training Programs. Get Involved: Donate, Volunteer, Become a Member, Events, Sponsor a Child, Corporate Partnership. Resources: Brand Guidelines, Organization Bio, SWC Certificate, Contact Us, Photo Gallery, Newsletter Archive. Retain Facebook, Instagram and YouTube actions, and the existing Twitter coming-soon affordance rather than inventing a live Twitter account. Finish with the source copyright line, Privacy Policy, Terms of Use, Sitemap and the discreet existing admin access. Keep real link/download destinations from the project. Make footer text readable, allow adequate vertical height, and never crop the bottom. On small screens these groups stack or become accessible disclosures while preserving every link.

Responsive intent: narrative copy stays readable at 16–18px; image/text pairs stack; challenge and impact cards become one column; timeline stays left-aligned; the name tiles can remain a compact pair. Keep the long quotation and CTA naturally wrapped without forced desktop line breaks. Retain all narrative sections and paragraphs.
```

## 4. What We Do — `/whatwedo`

### Existing sections, top to bottom

1. Shared navbar.
2. Programs That Change Lives hero: photo collage, breadcrumb, two CTAs.
3. What We Do: introduction and four linked pillars.
4. Our Programs in Action: four category filters and three program cards.
5. Want to Support a Specific Program? with donation, partnership, volunteering cards.
6. Shared newsletter and footer.

Sources: `app/(public)/whatwedo/page.tsx`, `whatwedo-client.tsx`.

### Assumptions and content cautions

The four strategic pillars and three program cards are distinct existing content groups; preserve both. Program content is hardcoded, including “25 districts” in the empowerment description; this is source copy, not independently verified impact. Images on this page are external stock references. Do not label newly generated imagery as real Deessa field documentation. Use supplied project photos only where they accurately match the topic; otherwise retain the existing supplied stock reference or a neutral media placeholder.

### Master prompt 4

```text
Create a single full-page 1440px-wide desktop website mockup for Deessa Foundation's What We Do page. Include every section below in source order, the navbar, newsletter and full footer, in one continuous tall image. Preserve all existing groups and their copy; do not merge strategic pillars with program offerings.

DESIGN SYSTEM AND HEADER — mandatory, identical across all nine Deessa pages. Preserve the supplied /logo.png artwork, proportions and colors. Use the existing Ocean Blue #3FABDE, Deep Ocean #0B5F8A, light blue #E8F6FC, white #FFFFFF, soft neutral #F8F9FA, main text #212529 and muted text #6C757D. Small supporting accents may use only existing logo purple #6F3E96, logo yellow #F7C52B, empowerment pink #D6336C, environment green #95C11F and education amber #F59E0B. No new teal, navy, beige or lavender theme; tints of existing tokens are allowed. Keep photography and original brand artwork in their natural colors. Use Deep Ocean behind white small button text and for readable links; Ocean Blue remains the dominant brand accent. Use Marissa Font for short expressive headings, Comic Neue for heading numerals/ampersands and compact labels, and DM Sans for readable body copy, forms and long card titles. Aim for 48–60px hero headings, 32–40px section headings, 22–26px card titles, 17–18px body text, 1.6–1.75 body line height, and 60–70 characters per text line. Use a centered 1200px content width, a 12-column desktop grid, 24–32px gutters, an 8px spacing rhythm, 80–96px section padding, 24–32px card padding, 12–20px radii, delicate borders and minimal shadows. Retain occasional quiet brush strokes; remove glowing decoration and arbitrary overlapping cards. Preserve all supplied content without invented statistics or identities. Render text and images fully visible after entrance effects, with intro, development-notice and video overlays closed.

Begin with one tidy shared two-row navigation: a proportionate logo on the left; Home, Who We Are, Our Story, What We Do, Stories and Events in the main row; Podcasts, Support and Contact in a slim light-blue secondary row. Keep Register outlined and Donate emphasized, respect their existing destinations, mark the current page with a simple underline and readable label, and keep all nine links discoverable when scrolling. Do not shrink the text to force everything into one crowded row. Include an unobtrusive accessibility launcher clear of content. On mobile the same links belong in a keyboard-accessible menu with Donate easy to find. Across all responsive layouts use at least 44px tap targets, logical reading order, visible labels and sufficient focus contrast; reduced-motion intent replaces continuous auto-animation. The output image itself shows only the full desktop page.

1. HERO. Keep the breadcrumb “Home › Programs,” “Making a difference across Nepal,” “Programs That Change Lives,” and the existing subtitle about classrooms in Karnali, clinics in the Terai, and education, healthcare and empowerment in remote communities. Replace the current oversized dark full-viewport collage treatment with a balanced 560px text-and-media composition: clean light-blue copy area on the left, the existing classroom, healthcare, women and learning image references in an orderly four-image mosaic on the right. Preserve “Explore Programs” and “Donate to a Program.” Keep Ocean Blue dominant and image gaps consistent.

2. FOUR CORE AREAS. Preserve “What We Do,” “We turn understanding into action for children, families, and communities,” and the introduction about children with disabilities, families, educators and communities. Create four substantial, equally styled cards in a two-by-two grid: Awareness & Community Engagement — community campaigns, social media, podcasts and public conversations challenging myths; Training — skills for parents, teachers, health workers and caregivers to recognize autism early and support children; Resources — simple accessible guides and tools; Advocacy — inclusive schools and policies protecting children's rights. Keep the full source paragraphs and “Explore this area” on each. Use the actual awareness/training/resources/advocacy destinations. Use one icon family and predominantly blue surfaces, with small existing secondary-token accents rather than four competing themes.

3. OUR PROGRAMS IN ACTION. Keep the existing section title and introduction. Above a three-column card grid, place the four real filters: All Programs, Autism Support, Empowerment, Training. Show All Programs selected with a strong shape-and-color cue. Each card has an evenly cropped existing image, a clearly readable category label, title, complete description and “Learn More.” Include exactly these three source programs: “Every Mind Is a Gift” — therapy, family counseling and inclusive education for children with autism across Nepal; “Women Who Lead, Communities That Thrive” — skill development, microfinance access and leadership training for women across 25 districts; “Creative Expression, Lasting Skills” — art workshops and vocational training supporting sustainable livelihoods. Preserve their actual detail links and avoid inventing program statistics, progress bars, additional categories or new projects.

4. SUPPORT A SPECIFIC PROGRAM. Use a Deep Ocean section with “Want to Support a Specific Program?” and the existing targeted-donation introduction. Present three aligned action cards: Make a Donation, with “Fund education, healthcare, or autism support directly” and “Donate Now”; Become a Partner, with the existing organization-partnership explanation and “Partner With Us”; Volunteer Your Skills, with the on-the-ground/remote-support explanation and “Get Involved.” Use a consistent line-icon family in place of mismatched emoji styling, keep button baselines aligned, and retain all content.

SHARED NEWSLETTER AND COMPLETE FOOTER — finish the page with the same treatment used across the other eight designs. Preserve the newsletter heading “Stay Connected,” its update invitation, the three benefits Monthly impact reports / Upcoming events & programs / Stories from the field, the source “Join 2,400+ supporters” line, an email field with a visible label, Subscribe, and “No spam. Unsubscribe anytime.” Keep the existing “100% Transparent” message, its financial-transparency paragraph and “Explore our financials” link as source content, without inventing new proof or metrics. Use a compact but complete two-column newsletter area, then a structured Deep Ocean footer with white text, readable light text for secondary links, and Ocean Blue accents. Retain the logo, “Our Mission” copy about rural Nepal, education, healthcare and livelihoods since 2022; and Get in Touch: Dhobighat Nayabato, Sanepa, Lalitpur 44600, Nepal / deessa.social@gmail.com / +977 1-4123456. These are source values, not newly verified claims.

Preserve all four footer link groups in aligned columns. About: Our Mission, Our Story, Our Team, Partners, Press & Media, Annual Reports, Autism Programs, Careers. Programs: Education, Healthcare, Women Empowerment, Disaster Relief, Art Workshop, Training Programs. Get Involved: Donate, Volunteer, Become a Member, Events, Sponsor a Child, Corporate Partnership. Resources: Brand Guidelines, Organization Bio, SWC Certificate, Contact Us, Photo Gallery, Newsletter Archive. Retain Facebook, Instagram and YouTube actions, and the existing Twitter coming-soon affordance rather than inventing a live Twitter account. Finish with the source copyright line, Privacy Policy, Terms of Use, Sitemap and the discreet existing admin access. Keep real link/download destinations from the project. Make footer text readable, allow adequate vertical height, and never crop the bottom. On small screens these groups stack or become accessible disclosures while preserving every link.

Responsive intent: reduce the mosaic to an orderly compact block; core-area and program grids become two then one column; filter buttons wrap with 44px touch targets; action cards stack. Do not require horizontal scrolling to discover a program category. All sections retain the same exact Deessa Ocean Blue palette as Home and About.
```

## 5. Stories — `/stories`

### Existing sections, top to bottom

1. Shared navbar.
2. Stories of care and change hero, actions and Stories overview.
3. Featured story, or its existing empty state.
4. Written Stories / Narratives of Unfolding Potential: All Stories, Latest, Featured filters; main spotlight and up to two side stories; remaining two-column then additional three-column cards, according to record count.
5. Be part of someone's story CTA.
6. Shared newsletter and footer.

Sources: `app/(public)/stories/page.tsx`, `StoriesSections.tsx`, `lib/data/stories.ts`.

### Assumptions and content cautions

Story titles, excerpts, photos, dates, read times and categories are database content and have not been retrieved. The prompt describes a populated layout **template** using visibly labeled fields; replace these only with supplied published records. Do not invent beneficiaries, quotes or counts. The hero statistics are library metadata, not social-impact statistics. If actual content is unavailable at rendering time, use the real empty-state language rather than convincing fictional stories.

### Master prompt 5

```text
Render one complete, continuous desktop Stories page mockup for Deessa Foundation at 1440px wide, with sufficient height for all supplied stories and the full footer. This is an editorial story library using actual content records or explicitly labeled content placeholders. Show all source sections below, not just a hero and a few cards.

DESIGN SYSTEM AND HEADER — mandatory, identical across all nine Deessa pages. Preserve the supplied /logo.png artwork, proportions and colors. Use the existing Ocean Blue #3FABDE, Deep Ocean #0B5F8A, light blue #E8F6FC, white #FFFFFF, soft neutral #F8F9FA, main text #212529 and muted text #6C757D. Small supporting accents may use only existing logo purple #6F3E96, logo yellow #F7C52B, empowerment pink #D6336C, environment green #95C11F and education amber #F59E0B. No new teal, navy, beige or lavender theme; tints of existing tokens are allowed. Keep photography and original brand artwork in their natural colors. Use Deep Ocean behind white small button text and for readable links; Ocean Blue remains the dominant brand accent. Use Marissa Font for short expressive headings, Comic Neue for heading numerals/ampersands and compact labels, and DM Sans for readable body copy, forms and long card titles. Aim for 48–60px hero headings, 32–40px section headings, 22–26px card titles, 17–18px body text, 1.6–1.75 body line height, and 60–70 characters per text line. Use a centered 1200px content width, a 12-column desktop grid, 24–32px gutters, an 8px spacing rhythm, 80–96px section padding, 24–32px card padding, 12–20px radii, delicate borders and minimal shadows. Retain occasional quiet brush strokes; remove glowing decoration and arbitrary overlapping cards. Preserve all supplied content without invented statistics or identities. Render text and images fully visible after entrance effects, with intro, development-notice and video overlays closed.

Begin with one tidy shared two-row navigation: a proportionate logo on the left; Home, Who We Are, Our Story, What We Do, Stories and Events in the main row; Podcasts, Support and Contact in a slim light-blue secondary row. Keep Register outlined and Donate emphasized, respect their existing destinations, mark the current page with a simple underline and readable label, and keep all nine links discoverable when scrolling. Do not shrink the text to force everything into one crowded row. Include an unobtrusive accessibility launcher clear of content. On mobile the same links belong in a keyboard-accessible menu with Donate easy to find. Across all responsive layouts use at least 44px tap targets, logical reading order, visible labels and sufficient focus contrast; reduced-motion intent replaces continuous auto-animation. The output image itself shows only the full desktop page.

1. HERO AND OVERVIEW. Keep “Stories of care and change,” “Every child sees the world differently,” the existing paragraph about small victories, careful routines, hope and autism care, and “Browse stories” / “Support a child.” Use the supplied /StoriesSectionImage.png in a quiet right-side crop or low-emphasis background rather than layered beige gradients behind text. Pair the introduction with a smaller white Stories overview card: “Explore the latest journeys and milestones,” its existing description, Stories count, Categories count and Latest date, plus “Go to featured” and “View all stories.” Use real supplied counts; otherwise label them [Story count], [Category count], [Latest publication date]. Give every value sufficient contrast; do not use near-white text for Categories.

2. FEATURED STORY. Make this the strongest editorial content block after the hero. Use a balanced large image and text pair with category, the actual featured title, excerpt, existing metadata and “Read Full Story.” Keep the image readable without stacked rotated shadow cards. If content has not been supplied, identify the fields explicitly as [Featured story image], [Featured story title], [Published excerpt], [Category], [Read time] rather than inventing an account or quotation. Preserve the source empty-state wording “This section is ready for the next published story” when rendering an empty library.

3. WRITTEN STORIES. Preserve “Narratives of Unfolding Potential” and “The strongest stories here combine quiet confidence, family support, and visible progress.” Add a clear filter row with exactly All Stories, Latest and Featured; show All Stories selected. Retain the source's hierarchy: one larger spotlight story beside up to two compact stories, followed by remaining stories in an aligned two-column group and additional stories in a three-column group when records exist. Use consistent image ratios, readable titles without single-line truncation, categories, supplied dates/read times, excerpts and “Read story” links. Clearly label any unresolved fields. No fabricated records to fill the grid, duplicate stories for visual padding, new pagination, invented search controls or new filters. Grow the canvas when supplied records require more rows.

4. TAKE ACTION. “Be part of someone's story.” Preserve the paragraph about therapy, inclusive education and guidance for children and caregivers, with “Support a child” and “Share a story.” Use a Deep Ocean rounded panel with white text, a white primary button and a restrained outlined companion. Keep it separate from the newsletter so these two actions do not compete visually.

SHARED NEWSLETTER AND COMPLETE FOOTER — finish the page with the same treatment used across the other eight designs. Preserve the newsletter heading “Stay Connected,” its update invitation, the three benefits Monthly impact reports / Upcoming events & programs / Stories from the field, the source “Join 2,400+ supporters” line, an email field with a visible label, Subscribe, and “No spam. Unsubscribe anytime.” Keep the existing “100% Transparent” message, its financial-transparency paragraph and “Explore our financials” link as source content, without inventing new proof or metrics. Use a compact but complete two-column newsletter area, then a structured Deep Ocean footer with white text, readable light text for secondary links, and Ocean Blue accents. Retain the logo, “Our Mission” copy about rural Nepal, education, healthcare and livelihoods since 2022; and Get in Touch: Dhobighat Nayabato, Sanepa, Lalitpur 44600, Nepal / deessa.social@gmail.com / +977 1-4123456. These are source values, not newly verified claims.

Preserve all four footer link groups in aligned columns. About: Our Mission, Our Story, Our Team, Partners, Press & Media, Annual Reports, Autism Programs, Careers. Programs: Education, Healthcare, Women Empowerment, Disaster Relief, Art Workshop, Training Programs. Get Involved: Donate, Volunteer, Become a Member, Events, Sponsor a Child, Corporate Partnership. Resources: Brand Guidelines, Organization Bio, SWC Certificate, Contact Us, Photo Gallery, Newsletter Archive. Retain Facebook, Instagram and YouTube actions, and the existing Twitter coming-soon affordance rather than inventing a live Twitter account. Finish with the source copyright line, Privacy Policy, Terms of Use, Sitemap and the discreet existing admin access. Keep real link/download destinations from the project. Make footer text readable, allow adequate vertical height, and never crop the bottom. On small screens these groups stack or become accessible disclosures while preserving every link.

Responsive intent: overview follows hero copy; featured image precedes article text; spotlight and all subsequent cards flow into a single reading column; filters wrap and retain selected-state labels. Preserve full titles and correct article destinations. The finished design should feel like the same Deessa site, with its existing blue and logo accents, not a newly branded magazine.
```

## 6. Events — `/events`

### Existing sections, top to bottom

1. Shared navbar.
2. Community gatherings hero and Events overview.
3. Upcoming / Don't miss what's next: first upcoming event featured, followed by More upcoming; or No upcoming events yet state.
4. Our journey / Moments we shared: past events, when available.
5. Ready to gather with us? CTA.
6. Shared newsletter and footer.

Sources: `app/(public)/events/page.tsx`, including its FeaturedEventCard, EventCard and EmptyUpcoming components.

### Assumptions and content cautions

Published events come from the database and are divided by event date. No current event names, dates, venues, prices or counts have been verified. The populated design is a conditional content template; do not fabricate a conference schedule. The actual page has no calendar widget, event search or category filter toolbar. “Free,” urgency labels, and registration actions are conditional data, not decorative badges.

### Master prompt 6

```text
Create one full-length desktop UI mockup of Deessa Foundation's Events page on a 1440px-wide canvas. Render the complete page in one tall image with all applicable sections and footer. Use provided published event records; mark unresolved content explicitly rather than inventing events.

DESIGN SYSTEM AND HEADER — mandatory, identical across all nine Deessa pages. Preserve the supplied /logo.png artwork, proportions and colors. Use the existing Ocean Blue #3FABDE, Deep Ocean #0B5F8A, light blue #E8F6FC, white #FFFFFF, soft neutral #F8F9FA, main text #212529 and muted text #6C757D. Small supporting accents may use only existing logo purple #6F3E96, logo yellow #F7C52B, empowerment pink #D6336C, environment green #95C11F and education amber #F59E0B. No new teal, navy, beige or lavender theme; tints of existing tokens are allowed. Keep photography and original brand artwork in their natural colors. Use Deep Ocean behind white small button text and for readable links; Ocean Blue remains the dominant brand accent. Use Marissa Font for short expressive headings, Comic Neue for heading numerals/ampersands and compact labels, and DM Sans for readable body copy, forms and long card titles. Aim for 48–60px hero headings, 32–40px section headings, 22–26px card titles, 17–18px body text, 1.6–1.75 body line height, and 60–70 characters per text line. Use a centered 1200px content width, a 12-column desktop grid, 24–32px gutters, an 8px spacing rhythm, 80–96px section padding, 24–32px card padding, 12–20px radii, delicate borders and minimal shadows. Retain occasional quiet brush strokes; remove glowing decoration and arbitrary overlapping cards. Preserve all supplied content without invented statistics or identities. Render text and images fully visible after entrance effects, with intro, development-notice and video overlays closed.

Begin with one tidy shared two-row navigation: a proportionate logo on the left; Home, Who We Are, Our Story, What We Do, Stories and Events in the main row; Podcasts, Support and Contact in a slim light-blue secondary row. Keep Register outlined and Donate emphasized, respect their existing destinations, mark the current page with a simple underline and readable label, and keep all nine links discoverable when scrolling. Do not shrink the text to force everything into one crowded row. Include an unobtrusive accessibility launcher clear of content. On mobile the same links belong in a keyboard-accessible menu with Donate easy to find. Across all responsive layouts use at least 44px tap targets, logical reading order, visible labels and sufficient focus contrast; reduced-motion intent replaces continuous auto-animation. The output image itself shows only the full desktop page.

1. HERO. Preserve “Community gatherings,” “Come together. Grow together,” and the paragraph about workshops, conferences and community gatherings across Nepal. Use a clean pale-blue opening, around 460–520px, with “Browse events” and “Host an event” to the left and an Events overview card to the right. Keep “Find your next moment of connection,” its introduction, Upcoming and Past counts, and the source's conditional Free Entry or Next up value. Use labeled placeholders if values are unknown. Include “See upcoming” and “Past events,” or the source's “Get involved” alternative when there are no past records. Avoid decorative grids and multicolor glowing blobs.

2. UPCOMING EVENTS. Preserve “Don't miss what's next” and the source's appropriate supporting sentence. Feature the earliest upcoming event in one substantial photo-and-details card: [Event image], [Event title], [Description], category, readable day/month/year, time, venue and location. Keep imagery free of dense text overlays. Add “Register now” only when registration is enabled; otherwise use “View details.” Show Free entry and urgency only when the supplied data supports them. Do not invent ticket prices, remaining seats or countdown timers.

3. MORE UPCOMING. If additional upcoming records exist, retain the subsection and real count with a balanced three-column grid. Match the featured card's component language: fixed-ratio image, small category label, prominent title, short supplied description, time and location, complete date, and data-appropriate Register or Learn more. The categories already supported are Conference, Workshop, Seminar, Meetup and Event; preserve labels and use existing blue/purple/pink token accents sparingly. Do not add a filtering system that is not currently present. If no upcoming data exists, instead show the original “No upcoming events yet” state with its preparation message, “Get updates,” and conditional “View past events.” Do not display an empty state and populated cards at the same time.

4. PAST EVENTS. When records exist, show “Our journey,” “Moments we shared,” and the original invitation to relive community gatherings. Use the source's most-recent-first order and the same coherent card grid with a clear “Past event” badge and “View details,” without registration urgency. Do not fade past-event body copy below readable contrast. If no records are supplied for this layout template, label the card content fields visibly; actual empty production data should omit this conditional section.

5. TAKE ACTION. Preserve “Ready to gather with us?” and the invitation to host a workshop, volunteer at a conference or attend. Include “Host an event” and “Get involved” in the shared Deep Ocean CTA treatment.

SHARED NEWSLETTER AND COMPLETE FOOTER — finish the page with the same treatment used across the other eight designs. Preserve the newsletter heading “Stay Connected,” its update invitation, the three benefits Monthly impact reports / Upcoming events & programs / Stories from the field, the source “Join 2,400+ supporters” line, an email field with a visible label, Subscribe, and “No spam. Unsubscribe anytime.” Keep the existing “100% Transparent” message, its financial-transparency paragraph and “Explore our financials” link as source content, without inventing new proof or metrics. Use a compact but complete two-column newsletter area, then a structured Deep Ocean footer with white text, readable light text for secondary links, and Ocean Blue accents. Retain the logo, “Our Mission” copy about rural Nepal, education, healthcare and livelihoods since 2022; and Get in Touch: Dhobighat Nayabato, Sanepa, Lalitpur 44600, Nepal / deessa.social@gmail.com / +977 1-4123456. These are source values, not newly verified claims.

Preserve all four footer link groups in aligned columns. About: Our Mission, Our Story, Our Team, Partners, Press & Media, Annual Reports, Autism Programs, Careers. Programs: Education, Healthcare, Women Empowerment, Disaster Relief, Art Workshop, Training Programs. Get Involved: Donate, Volunteer, Become a Member, Events, Sponsor a Child, Corporate Partnership. Resources: Brand Guidelines, Organization Bio, SWC Certificate, Contact Us, Photo Gallery, Newsletter Archive. Retain Facebook, Instagram and YouTube actions, and the existing Twitter coming-soon affordance rather than inventing a live Twitter account. Finish with the source copyright line, Privacy Policy, Terms of Use, Sitemap and the discreet existing admin access. Keep real link/download destinations from the project. Make footer text readable, allow adequate vertical height, and never crop the bottom. On small screens these groups stack or become accessible disclosures while preserving every link.

Responsive intent: overview stacks beneath hero text; featured image sits above details; card grids become two then one column; date/time/venue wrap without loss. Maintain predictable card heights and button positions while allowing full titles. No separate calendar screen or mobile mockup inside this single image.
```

## 7. Podcasts — `/podcasts`

### Existing sections, top to bottom

1. Shared navbar.
2. Parent-led video-podcast hero: series introduction, banner, latest-episode action or YouTube fallback, credits and topic descriptors.
3. More than a conversation: series explanation and YouTube link.
4. Meet the hosts: two named host cards and shared-commitment statement.
5. Episode Archive: browse-all link, topic filters, support CTA, count, episode grid and conditional load-more/no-results state.
6. Podcast Highlights carousel and all-highlights link, when records exist.
7. Conditional library-unavailable fallback, or more-episodes message when exactly one episode exists.
8. Shared newsletter and footer.

Sources: `app/(public)/podcasts/page.tsx`, `components/podcasts/podcast-series-intro.tsx`, `podcast-archive-section.tsx`, `all-highlights-section.tsx`, `lib/data/podcasts.ts`.

### Assumptions and content cautions

Series and host copy are in the repository. Episode and highlight records are database-driven and unverified. The main archive initially displays up to 12 episodes; the page fetches up to 10 highlights. This is a **video** podcast with YouTube/modal playback, not an audio streaming app. Its load-more button currently says “Load More Stories”; retain that existing label in the content-preserving mockup, with “Load more episodes” noted as a future optional copy correction rather than silently treating it as current copy.

### Master prompt 7

```text
Render a complete Deessa Foundation Podcasts page as one tall, continuous 1440px-wide desktop website mockup. Include every applicable section, including the series explanation and host section before the episode library. Do not render a music app, fabricated audio-player dashboard or separate screen collage.

DESIGN SYSTEM AND HEADER — mandatory, identical across all nine Deessa pages. Preserve the supplied /logo.png artwork, proportions and colors. Use the existing Ocean Blue #3FABDE, Deep Ocean #0B5F8A, light blue #E8F6FC, white #FFFFFF, soft neutral #F8F9FA, main text #212529 and muted text #6C757D. Small supporting accents may use only existing logo purple #6F3E96, logo yellow #F7C52B, empowerment pink #D6336C, environment green #95C11F and education amber #F59E0B. No new teal, navy, beige or lavender theme; tints of existing tokens are allowed. Keep photography and original brand artwork in their natural colors. Use Deep Ocean behind white small button text and for readable links; Ocean Blue remains the dominant brand accent. Use Marissa Font for short expressive headings, Comic Neue for heading numerals/ampersands and compact labels, and DM Sans for readable body copy, forms and long card titles. Aim for 48–60px hero headings, 32–40px section headings, 22–26px card titles, 17–18px body text, 1.6–1.75 body line height, and 60–70 characters per text line. Use a centered 1200px content width, a 12-column desktop grid, 24–32px gutters, an 8px spacing rhythm, 80–96px section padding, 24–32px card padding, 12–20px radii, delicate borders and minimal shadows. Retain occasional quiet brush strokes; remove glowing decoration and arbitrary overlapping cards. Preserve all supplied content without invented statistics or identities. Render text and images fully visible after entrance effects, with intro, development-notice and video overlays closed.

Begin with one tidy shared two-row navigation: a proportionate logo on the left; Home, Who We Are, Our Story, What We Do, Stories and Events in the main row; Podcasts, Support and Contact in a slim light-blue secondary row. Keep Register outlined and Donate emphasized, respect their existing destinations, mark the current page with a simple underline and readable label, and keep all nine links discoverable when scrolling. Do not shrink the text to force everything into one crowded row. Include an unobtrusive accessibility launcher clear of content. On mobile the same links belong in a keyboard-accessible menu with Donate easy to find. Across all responsive layouts use at least 44px tap targets, logical reading order, visible labels and sufficient focus contrast; reduced-motion intent replaces continuous auto-animation. The output image itself shows only the full desktop page.

1. SERIES HERO. Preserve “A parent-led video podcast,” “Living with Autism: Real Voices. Real Stories,” and “Honest conversations about raising children with autism. The joy, the questions, and the hope that bring us together.” On a light-blue panel, balance text on the left with the exact /podcast_banner.png on the right at its full 16:9 composition, without clipping embedded words or host portraits. Include Watch latest episode when an episode exists, otherwise Watch on YouTube, and Browse episodes. Preserve “By deessa Foundation” and “With technical support from SDG Studio.” Below the banner retain the latest-conversation strip with supplied episode number/title, or the source fallback message, plus Parents' experiences, Expert perspectives and Shared understanding. Keep episode fields visibly labeled if unresolved.

2. MORE THAN A CONVERSATION. Use “Listening is the first step towards understanding” as a clear editorial heading beside both original paragraphs about family journeys, love, joy, challenges, expert insights and inclusion. Preserve “Visit our YouTube channel.” Use a quiet white section with a comfortable paragraph measure.

3. MEET THE HOSTS. “Parents leading the conversation.” Present two equal white portrait-and-biography cards on light blue, with a small logo-purple accent only. Merina Panthii: President, deessa Foundation; parent and host sharing stories of raising children with autism. Sarita Sapkota: Parent & Host; mother bringing lived experiences to conversations. Use /Merina Panthii.jpg and /Sarita Sapkota.jpg without substituting faces. Retain “Two mothers. Two journeys. One shared commitment to acceptance, understanding, and inclusion.” Keep every name and role permanently visible.

4. EPISODE ARCHIVE. Use one clear primary section heading rather than visually duplicating the current two archive headings. Preserve Browse All Episodes. Create a 260px sidebar with “Filter Library,” only the topics present in the supplied records as checkboxes, and “Support Our Mission” with its existing message and donation action. The wider content area shows the actual result count and orderly two-column video cards, up to the initial 12 source records. Each includes supplied thumbnail, play cue, episode number, duration, publication metadata, title, description, Watch Episode and a labeled share control. Use explicit [Episode title], [Duration], [Publication date] and [Topic] fields when data is missing; no invented guests, topics or episode numbers. Preserve conditional Load More Stories and no-results behavior. This is a website linking to video content, so do not add invented playback timelines, download controls or listening statistics.

5. PODCAST HIGHLIGHTS. When available, retain the existing highlights carousel with “Watch All Highlights,” visible previous/next controls, and the existing portrait 9:16 highlight cards with supplied thumbnails/titles and episode association. Show a few complete cards and a clear continuation cue without clipping text. The source provides up to ten highlights, not ten new invented clips. If the archive is unavailable, preserve the source “Explore the conversations” fallback and YouTube action instead of fabricating a full library. If exactly one episode exists, retain the “More episodes coming soon!” message in its existing lower-page position.

SHARED NEWSLETTER AND COMPLETE FOOTER — finish the page with the same treatment used across the other eight designs. Preserve the newsletter heading “Stay Connected,” its update invitation, the three benefits Monthly impact reports / Upcoming events & programs / Stories from the field, the source “Join 2,400+ supporters” line, an email field with a visible label, Subscribe, and “No spam. Unsubscribe anytime.” Keep the existing “100% Transparent” message, its financial-transparency paragraph and “Explore our financials” link as source content, without inventing new proof or metrics. Use a compact but complete two-column newsletter area, then a structured Deep Ocean footer with white text, readable light text for secondary links, and Ocean Blue accents. Retain the logo, “Our Mission” copy about rural Nepal, education, healthcare and livelihoods since 2022; and Get in Touch: Dhobighat Nayabato, Sanepa, Lalitpur 44600, Nepal / deessa.social@gmail.com / +977 1-4123456. These are source values, not newly verified claims.

Preserve all four footer link groups in aligned columns. About: Our Mission, Our Story, Our Team, Partners, Press & Media, Annual Reports, Autism Programs, Careers. Programs: Education, Healthcare, Women Empowerment, Disaster Relief, Art Workshop, Training Programs. Get Involved: Donate, Volunteer, Become a Member, Events, Sponsor a Child, Corporate Partnership. Resources: Brand Guidelines, Organization Bio, SWC Certificate, Contact Us, Photo Gallery, Newsletter Archive. Retain Facebook, Instagram and YouTube actions, and the existing Twitter coming-soon affordance rather than inventing a live Twitter account. Finish with the source copyright line, Privacy Policy, Terms of Use, Sitemap and the discreet existing admin access. Keep real link/download destinations from the project. Make footer text readable, allow adequate vertical height, and never crop the bottom. On small screens these groups stack or become accessible disclosures while preserving every link.

Responsive intent: hero becomes text then banner, host cards stack, filters collapse into an accessible disclosure above results, episode cards become one column and highlight controls remain touch-friendly. Preserve every section's content and the same blue theme used across the other eight pages.
```

## 8. Support — `/support`

### Existing sections, top to bottom

1. Shared navbar.
2. Development Feedback hero with Report an Issue and General Contact.
3. Within hero: Bug reports / Suggestions / Safe by default highlights and Response Promise (Fast Triage / Useful Context / Manual Review).
4. Support Inbox: report introduction and form, alongside What to Include, Good Reports Are, Privacy Note.
5. Shared newsletter and footer.

Sources: `app/(public)/support/page.tsx`, `components/support-form.tsx`, `lib/support/settings.ts`.

### Assumptions and content cautions

Assume Support is enabled. It is specifically a pre-launch website feedback inbox, **not** family assistance, counseling, donor support or emergency response. Screenshot uploads support PNG/JPG/WEBP up to 2MB; despite guidance mentioning a screen recording, the form does not support video upload. Do not show a video uploader or claim a response-time guarantee. Render the initial form state, not a success message simultaneously.

### Master prompt 8

```text
Create one complete desktop mockup of Deessa Foundation's Support & Feedback page, 1440px wide with all content from navbar through footer in one continuous image. Treat this as a website feedback page and preserve the pre-launch context. The design should belong to the same Deessa nonprofit website, not a separate dark technology product.

DESIGN SYSTEM AND HEADER — mandatory, identical across all nine Deessa pages. Preserve the supplied /logo.png artwork, proportions and colors. Use the existing Ocean Blue #3FABDE, Deep Ocean #0B5F8A, light blue #E8F6FC, white #FFFFFF, soft neutral #F8F9FA, main text #212529 and muted text #6C757D. Small supporting accents may use only existing logo purple #6F3E96, logo yellow #F7C52B, empowerment pink #D6336C, environment green #95C11F and education amber #F59E0B. No new teal, navy, beige or lavender theme; tints of existing tokens are allowed. Keep photography and original brand artwork in their natural colors. Use Deep Ocean behind white small button text and for readable links; Ocean Blue remains the dominant brand accent. Use Marissa Font for short expressive headings, Comic Neue for heading numerals/ampersands and compact labels, and DM Sans for readable body copy, forms and long card titles. Aim for 48–60px hero headings, 32–40px section headings, 22–26px card titles, 17–18px body text, 1.6–1.75 body line height, and 60–70 characters per text line. Use a centered 1200px content width, a 12-column desktop grid, 24–32px gutters, an 8px spacing rhythm, 80–96px section padding, 24–32px card padding, 12–20px radii, delicate borders and minimal shadows. Retain occasional quiet brush strokes; remove glowing decoration and arbitrary overlapping cards. Preserve all supplied content without invented statistics or identities. Render text and images fully visible after entrance effects, with intro, development-notice and video overlays closed.

Begin with one tidy shared two-row navigation: a proportionate logo on the left; Home, Who We Are, Our Story, What We Do, Stories and Events in the main row; Podcasts, Support and Contact in a slim light-blue secondary row. Keep Register outlined and Donate emphasized, respect their existing destinations, mark the current page with a simple underline and readable label, and keep all nine links discoverable when scrolling. Do not shrink the text to force everything into one crowded row. Include an unobtrusive accessibility launcher clear of content. On mobile the same links belong in a keyboard-accessible menu with Donate easy to find. Across all responsive layouts use at least 44px tap targets, logical reading order, visible labels and sufficient focus contrast; reduced-motion intent replaces continuous auto-animation. The output image itself shows only the full desktop page.

1. FEEDBACK HERO. Preserve “Development Feedback,” “Help us catch issues before launch,” the existing explanation about confusing or broken website experiences and manual review, and the two actions Report an Issue / General Contact. Replace the current near-black cyber-style grid and cyan glow with a compact light-blue section and Deep Ocean heading. Aim for a roughly 440–500px opening so the report form is easy to reach. Use a simple feedback icon, not invented staff photography or a customer-service illustration suggesting clinical support.

2. HERO INFORMATION. Keep the three original highlights: Bug reports, with broken layouts/buttons/task blockers; Suggestions, with easier and clearer website use; Safe by default, with validated inputs and secure screenshot handling. On desktop place the Response Promise card alongside the opening copy, containing Fast Triage, Useful Context and Manual Review with their source explanations. Place the three highlights immediately below the main copy as a coherent row. Use consistent white cards and restrained blue line icons, not glass effects. Do not add a guaranteed response time or 24/7 claim.

3. SUPPORT INBOX. Preserve “Send a report to the admin team” and the original reproduction/screenshot guidance. Create a clear approximately 60/40 form-and-help layout. Inside the form retain “Quick Report,” “Tell us what happened,” and its guidance. Show permanent labels: Your Name (required), Email Address (required), What Best Describes It?, Page URL, Short Summary (required), Describe the Issue (required), Screenshot (optional). The issue-type options are exactly Bug Report, Feature Request, Content Issue, Accessibility Issue and Other. Show Bug Report as the default selection. Use name/email side by side, issue type/page URL side by side, followed by full-width summary, multi-line description and the upload area. Fields are at least 48px high with readable neutral borders and room for inline validation. The screenshot control clearly says “PNG, JPG, or WEBP up to 2MB.” Preserve the information-use note and “Send Report.” Do not display browser user-agent capture as a new editable user-facing field. Do not add login, ticket tracking, live chat, severity selectors or video upload.

4. HELP SIDEBAR. Preserve What to Include as a numbered three-item list: where the problem happened, what was expected, and a screenshot or recording if useful. Preserve that source guidance without drawing a video upload capability. Follow with Good Reports Are: Specific, Reproducible, Visual when possible. Then retain the Privacy Note about diagnostic information, private screenshot storage and admin review. Use one calm visual hierarchy and modest borders; allow the sidebar to stay visible during scrolling only while it fits, without overlapping the form or footer. Show the unsubmitted form, not a simultaneous success/error state.

SHARED NEWSLETTER AND COMPLETE FOOTER — finish the page with the same treatment used across the other eight designs. Preserve the newsletter heading “Stay Connected,” its update invitation, the three benefits Monthly impact reports / Upcoming events & programs / Stories from the field, the source “Join 2,400+ supporters” line, an email field with a visible label, Subscribe, and “No spam. Unsubscribe anytime.” Keep the existing “100% Transparent” message, its financial-transparency paragraph and “Explore our financials” link as source content, without inventing new proof or metrics. Use a compact but complete two-column newsletter area, then a structured Deep Ocean footer with white text, readable light text for secondary links, and Ocean Blue accents. Retain the logo, “Our Mission” copy about rural Nepal, education, healthcare and livelihoods since 2022; and Get in Touch: Dhobighat Nayabato, Sanepa, Lalitpur 44600, Nepal / deessa.social@gmail.com / +977 1-4123456. These are source values, not newly verified claims.

Preserve all four footer link groups in aligned columns. About: Our Mission, Our Story, Our Team, Partners, Press & Media, Annual Reports, Autism Programs, Careers. Programs: Education, Healthcare, Women Empowerment, Disaster Relief, Art Workshop, Training Programs. Get Involved: Donate, Volunteer, Become a Member, Events, Sponsor a Child, Corporate Partnership. Resources: Brand Guidelines, Organization Bio, SWC Certificate, Contact Us, Photo Gallery, Newsletter Archive. Retain Facebook, Instagram and YouTube actions, and the existing Twitter coming-soon affordance rather than inventing a live Twitter account. Finish with the source copyright line, Privacy Policy, Terms of Use, Sitemap and the discreet existing admin access. Keep real link/download destinations from the project. Make footer text readable, allow adequate vertical height, and never crop the bottom. On small screens these groups stack or become accessible disclosures while preserving every link.

Responsive intent: the response promise and highlights follow the hero text; the form becomes one column and help cards follow it; every input has a visible label and touch-sized controls. Keep keyboard focus and error placement part of the intended implementation. Use only existing Deessa colors, with semantic red/green reserved for actual validation states outside this initial mockup.
```

## 9. Contact — `/contact`

### Existing sections, top to bottom

1. Shared navbar.
2. Get in Touch / We'd Love to Hear From You hero, with conditional Support link.
3. Four contact cards: Our Office, Email Us, Call Us, Office Hours.
4. Send Us a Message form alongside Visit Our Office map placeholder and Open in Maps.
5. Registered & Verified: SWC Registered, Tax Registered, Learn More/download bio.
6. Have a Quick Question? email CTA.
7. Shared newsletter and footer.

Sources: `app/(public)/contact/page.tsx`, `components/contact-form-prefilled.tsx`, `components/contact-form.tsx`.

### Assumptions and content cautions

Contact hardcodes Thamel, Kathmandu; `info@dessafoundation.org`, `support@dessafoundation.org`; `+977 1-4123456`, `+977 9841234567`; and 9AM opening. These conflict with Home's Lalitpur address, Gmail contact, placeholder phone and 10AM opening. Preserve the exact Contact values for fidelity, but treat them as requiring owner confirmation before production. The lower quick-question CTA itself uses `deessa.social@gmail.com`. The map is a placeholder, not a verified working embed. “Within 24 hours” is existing copy, not a newly verified service guarantee. The page mentions an FAQ but renders no FAQ list; do not invent one.

### Master prompt 9

```text
Create one continuous, complete desktop website design mockup of Deessa Foundation's Contact page, 1440px wide and tall enough to include all sections through the footer. Preserve the source content and show the initial empty contact form. Do not create extra FAQs, support workflows or invented office details.

DESIGN SYSTEM AND HEADER — mandatory, identical across all nine Deessa pages. Preserve the supplied /logo.png artwork, proportions and colors. Use the existing Ocean Blue #3FABDE, Deep Ocean #0B5F8A, light blue #E8F6FC, white #FFFFFF, soft neutral #F8F9FA, main text #212529 and muted text #6C757D. Small supporting accents may use only existing logo purple #6F3E96, logo yellow #F7C52B, empowerment pink #D6336C, environment green #95C11F and education amber #F59E0B. No new teal, navy, beige or lavender theme; tints of existing tokens are allowed. Keep photography and original brand artwork in their natural colors. Use Deep Ocean behind white small button text and for readable links; Ocean Blue remains the dominant brand accent. Use Marissa Font for short expressive headings, Comic Neue for heading numerals/ampersands and compact labels, and DM Sans for readable body copy, forms and long card titles. Aim for 48–60px hero headings, 32–40px section headings, 22–26px card titles, 17–18px body text, 1.6–1.75 body line height, and 60–70 characters per text line. Use a centered 1200px content width, a 12-column desktop grid, 24–32px gutters, an 8px spacing rhythm, 80–96px section padding, 24–32px card padding, 12–20px radii, delicate borders and minimal shadows. Retain occasional quiet brush strokes; remove glowing decoration and arbitrary overlapping cards. Preserve all supplied content without invented statistics or identities. Render text and images fully visible after entrance effects, with intro, development-notice and video overlays closed.

Begin with one tidy shared two-row navigation: a proportionate logo on the left; Home, Who We Are, Our Story, What We Do, Stories and Events in the main row; Podcasts, Support and Contact in a slim light-blue secondary row. Keep Register outlined and Donate emphasized, respect their existing destinations, mark the current page with a simple underline and readable label, and keep all nine links discoverable when scrolling. Do not shrink the text to force everything into one crowded row. Include an unobtrusive accessibility launcher clear of content. On mobile the same links belong in a keyboard-accessible menu with Donate easy to find. Across all responsive layouts use at least 44px tap targets, logical reading order, visible labels and sufficient focus contrast; reduced-motion intent replaces continuous auto-animation. The output image itself shows only the full desktop page.

1. HERO. Preserve “Get in Touch,” “We'd Love to Hear From You,” and “Have questions, ideas, or want to partner with us? Reach out today.” Use a compact 320–380px pale-blue opening with clearly centered or left-aligned copy, replacing heavy dark overlays with readable space. If the existing hero photograph is supplied, use it in a restrained crop without claiming it is a verified Deessa office. Include “Report a bug or suggest an improvement” as a quieter secondary action to Support when enabled, so general contact remains the main task.

2. CONTACT DETAILS. Four equally styled cards follow the hero: Our Office — Thamel, Kathmandu / Nepal, 44600; Email Us — info@dessafoundation.org / support@dessafoundation.org; Call Us — +977 1-4123456 / +977 9841234567; Office Hours — Sun–Fri 9:00 AM–5:00 PM / Saturday: Closed. Preserve these exact source values, including their spelling, instead of inventing a reconciliation with Home. Use blue line icons, left-aligned details and readable email/phone link styling. Allow long addresses to wrap. These are existing content values pending confirmation, not newly verified information.

3. MESSAGE AND VISIT. On a soft-neutral band, create a wider form column and a complementary Visit Our Office card. Keep “Send Us a Message” and the existing “we'll get back to you within 24 hours” sentence. Form fields are First Name, Last Name, Email Address, Phone (optional), Subject and Message; preserve required states. Use a clear two-column name row, full-width email/phone rows, a Subject select and roomy message textarea, followed by “Send Message.” Keep the real select choices: General Inquiry, Donation Questions, Donation Support, Volunteering, Partnership Opportunities, Media & Press, Other. Use persistent labels, visible focus treatment, 48px controls and space for validation. Preserve prefilled subject/message behavior in the design intent without inventing a new selector. Beside it, show a clearly illustrative location/map placeholder labeled “Visit Our Office,” “Thamel, Kathmandu, Nepal,” and “Open in Maps.” Do not fabricate street-level pin accuracy or pretend the placeholder is a verified live map.

4. REGISTERED & VERIFIED. Preserve “Official documentation and registration certificates.” Use three aligned document cards: SWC Registered with its Social Welfare Council explanation and View Certificate; Tax Registered with its PAN transparency text and View PAN; Learn More with the organization-bio description and Download Bio. Use consistent document icons rather than newly designed official seals. Retain the existing SWC.jpg, PAN.pdf and organization-bio document destinations. Do not invent registration numbers, certificate artwork or government endorsements.

5. QUICK QUESTION. Preserve “Have a Quick Question?” and the existing sentence “Check our FAQ or email us directly at deessa.social@gmail.com,” with the email readable and actionable. Use a compact Deep Ocean band rather than another oversized hero. There is no FAQ accordion in the current page, so do not add questions or answers.

SHARED NEWSLETTER AND COMPLETE FOOTER — finish the page with the same treatment used across the other eight designs. Preserve the newsletter heading “Stay Connected,” its update invitation, the three benefits Monthly impact reports / Upcoming events & programs / Stories from the field, the source “Join 2,400+ supporters” line, an email field with a visible label, Subscribe, and “No spam. Unsubscribe anytime.” Keep the existing “100% Transparent” message, its financial-transparency paragraph and “Explore our financials” link as source content, without inventing new proof or metrics. Use a compact but complete two-column newsletter area, then a structured Deep Ocean footer with white text, readable light text for secondary links, and Ocean Blue accents. Retain the logo, “Our Mission” copy about rural Nepal, education, healthcare and livelihoods since 2022; and Get in Touch: Dhobighat Nayabato, Sanepa, Lalitpur 44600, Nepal / deessa.social@gmail.com / +977 1-4123456. These are source values, not newly verified claims.

Preserve all four footer link groups in aligned columns. About: Our Mission, Our Story, Our Team, Partners, Press & Media, Annual Reports, Autism Programs, Careers. Programs: Education, Healthcare, Women Empowerment, Disaster Relief, Art Workshop, Training Programs. Get Involved: Donate, Volunteer, Become a Member, Events, Sponsor a Child, Corporate Partnership. Resources: Brand Guidelines, Organization Bio, SWC Certificate, Contact Us, Photo Gallery, Newsletter Archive. Retain Facebook, Instagram and YouTube actions, and the existing Twitter coming-soon affordance rather than inventing a live Twitter account. Finish with the source copyright line, Privacy Policy, Terms of Use, Sitemap and the discreet existing admin access. Keep real link/download destinations from the project. Make footer text readable, allow adequate vertical height, and never crop the bottom. On small screens these groups stack or become accessible disclosures while preserving every link.

Responsive intent: contact cards become two then one column; form name fields stack on small screens; the visit card follows the form; certificate cards stack with full-width tap targets. Let emails and telephone numbers wrap without clipping. Make the email CTA, newsletter and contact form visually distinct and preserve the same existing blue palette used throughout the site.
```

## Editorial checks before these mockups become production designs

- Resolve the office/address/phone/email/opening-hour conflicts across Home, Contact and the shared footer; do not choose a winner based on visual preference.
- Confirm foundation and launch dates, the name explanation, team fallbacks, objective numbers, “25 districts,” testimonial attribution, and source claims in the newsletter/footer. Source presence is not independent fact verification.
- Supply current published CMS records for Home/About overrides, stories, events, episodes and highlights. Use actual records and counts, or the real empty states.
- Keep the same palette and component system in all nine images. Preserve original logo and documentary media. Do not invent beneficiaries, partners, statistics, awards, facilities or testimonials.
- During implementation, verify color contrast, keyboard access, reduced motion, actual mobile layouts, working downloads/links and screen-reader behavior. Static image generation communicates intent but cannot validate interactions or guarantee precise typography.
