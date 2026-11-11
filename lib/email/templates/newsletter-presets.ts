/**
 * Curated Newsletter Templates & Email-Safe Layout Block Generators
 * Compatible with Outlook, Gmail, Apple Mail, Yahoo, and mobile email clients.
 */

export interface NewsletterTemplatePreset {
  id: string
  name: string
  description: string
  category: "story" | "digest" | "event" | "letter" | "minimal"
  badge: string
  defaultSubject: string
  defaultPreviewText: string
  htmlContent: string
}

/**
 * Generate email-safe Full-Width Hero Image Block
 */
export function generateHeroImageHtml({
  imageUrl,
  caption,
  linkUrl,
  alt = "Campaign Banner",
}: {
  imageUrl: string
  caption?: string
  linkUrl?: string
  alt?: string
}): string {
  const imgTag = `<img src="${imageUrl}" alt="${alt}" width="536" style="display: block; width: 100%; max-width: 536px; height: auto; border-radius: 8px; border: 0;" />`
  const wrappedImg = linkUrl
    ? `<a href="${linkUrl}" target="_blank" style="text-decoration: none; display: block;">${imgTag}</a>`
    : imgTag

  return `
<!-- Hero Image Block -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; border-collapse: collapse;">
  <tr>
    <td align="center">
      ${wrappedImg}
      ${
        caption
          ? `<p style="margin: 8px 0 0 0; font-size: 13px; color: #64748b; font-style: italic; text-align: center;">${caption}</p>`
          : ""
      }
    </td>
  </tr>
</table>
`.trim()
}

/**
 * Generate email-safe 2-Column Split: Image on Left, Text on Right
 */
export function generateImageLeftTextRightHtml({
  imageUrl,
  headline,
  body,
  buttonLabel,
  buttonUrl,
  alt = "Story Highlight",
}: {
  imageUrl: string
  headline: string
  body: string
  buttonLabel?: string
  buttonUrl?: string
  alt?: string
}): string {
  const buttonHtml =
    buttonLabel && buttonUrl
      ? `<p style="margin: 14px 0 0 0;"><a href="${buttonUrl}" target="_blank" style="display: inline-block; background-color: #0B5F8A; color: #ffffff; padding: 8px 18px; border-radius: 6px; font-weight: 600; text-decoration: none; font-size: 13px;">${buttonLabel} →</a></p>`
      : ""

  return `
<!-- 2-Column: Image Left / Text Right -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; border-collapse: collapse;">
  <tr>
    <td width="38%" valign="top" style="padding-right: 16px;">
      <img src="${imageUrl}" alt="${alt}" width="200" style="display: block; width: 100%; max-width: 200px; height: auto; border-radius: 8px; border: 1px solid #e2e8f0;" />
    </td>
    <td width="62%" valign="top" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.6; color: #334155;">
      <h3 style="margin: 0 0 8px 0; font-size: 17px; font-weight: 700; color: #0f172a; line-height: 1.3;">${headline}</h3>
      <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">${body}</p>
      ${buttonHtml}
    </td>
  </tr>
</table>
`.trim()
}

/**
 * Generate email-safe 2-Column Split: Text on Left, Image on Right
 */
export function generateTextLeftImageRightHtml({
  imageUrl,
  headline,
  body,
  buttonLabel,
  buttonUrl,
  alt = "Story Highlight",
}: {
  imageUrl: string
  headline: string
  body: string
  buttonLabel?: string
  buttonUrl?: string
  alt?: string
}): string {
  const buttonHtml =
    buttonLabel && buttonUrl
      ? `<p style="margin: 14px 0 0 0;"><a href="${buttonUrl}" target="_blank" style="display: inline-block; background-color: #0B5F8A; color: #ffffff; padding: 8px 18px; border-radius: 6px; font-weight: 600; text-decoration: none; font-size: 13px;">${buttonLabel} →</a></p>`
      : ""

  return `
<!-- 2-Column: Text Left / Image Right -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; border-collapse: collapse;">
  <tr>
    <td width="62%" valign="top" style="padding-right: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.6; color: #334155;">
      <h3 style="margin: 0 0 8px 0; font-size: 17px; font-weight: 700; color: #0f172a; line-height: 1.3;">${headline}</h3>
      <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">${body}</p>
      ${buttonHtml}
    </td>
    <td width="38%" valign="top">
      <img src="${imageUrl}" alt="${alt}" width="200" style="display: block; width: 100%; max-width: 200px; height: auto; border-radius: 8px; border: 1px solid #e2e8f0;" />
    </td>
  </tr>
</table>
`.trim()
}

/**
 * Generate email-safe Call-to-Action (CTA) Button
 */
export function generateCtaButtonHtml({
  label,
  url,
  align = "center",
  theme = "ocean",
}: {
  label: string
  url: string
  align?: "center" | "left" | "right"
  theme?: "ocean" | "amber" | "emerald"
}): string {
  const bgColors = {
    ocean: "#0B5F8A",
    amber: "#d97706",
    emerald: "#059669",
  }
  const bg = bgColors[theme] || bgColors.ocean

  return `
<!-- CTA Button Block -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0; border-collapse: collapse;">
  <tr>
    <td align="${align}">
      <table role="presentation" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="border-radius: 8px; background-color: ${bg};">
            <a href="${url}" target="_blank" style="display: inline-block; padding: 13px 30px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 8px; letter-spacing: 0.2px;">
              ${label} →
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`.trim()
}

/**
 * Generate email-safe Callout / Impact Quote Block
 */
export function generateQuoteBoxHtml({
  quote,
  author,
}: {
  quote: string
  author?: string
}): string {
  return `
<!-- Quote / Callout Block -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; border-collapse: collapse;">
  <tr>
    <td style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 18px 22px; border-radius: 0 10px 10px 0;">
      <p style="margin: 0 0 8px 0; font-size: 16px; font-style: italic; color: #0f172a; line-height: 1.6;">
        &ldquo;${quote}&rdquo;
      </p>
      ${
        author
          ? `<p style="margin: 0; font-size: 13px; font-weight: 600; color: #166534;">— ${author}</p>`
          : ""
      }
    </td>
  </tr>
</table>
`.trim()
}

/**
 * Generate email-safe 2-Column Stats Grid
 */
export function generateStatsGridHtml({
  stat1Value,
  stat1Label,
  stat2Value,
  stat2Label,
}: {
  stat1Value: string
  stat1Label: string
  stat2Value: string
  stat2Label: string
}): string {
  return `
<!-- 2-Column Stats Block -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; border-collapse: collapse;">
  <tr>
    <td width="48%" align="center" style="padding: 16px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
      <div style="font-size: 30px; font-weight: 800; color: #0B5F8A; line-height: 1.1;">${stat1Value}</div>
      <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-top: 6px; letter-spacing: 0.5px;">${stat1Label}</div>
    </td>
    <td width="4%">&nbsp;</td>
    <td width="48%" align="center" style="padding: 16px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
      <div style="font-size: 30px; font-weight: 800; color: #059669; line-height: 1.1;">${stat2Value}</div>
      <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-top: 6px; letter-spacing: 0.5px;">${stat2Label}</div>
    </td>
  </tr>
</table>
`.trim()
}

/**
 * Curated Presets
 */
export const NEWSLETTER_PRESETS: NewsletterTemplatePreset[] = [
  {
    id: "impact_story",
    name: "Impact Story & Breakthrough",
    description: "Hero banner image, narrative journalism story, parent quote, and full story link.",
    category: "story",
    badge: "Popular",
    defaultSubject: "✨ Inspiring Breakthrough: How Aarav Found His Voice at deessa",
    defaultPreviewText: "Discover how specialized speech and sensory therapy transformed one young boy's everyday life.",
    htmlContent: `
<!-- Hero Image -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0; border-collapse: collapse;">
  <tr>
    <td align="center">
      <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&auto=format&fit=crop&q=80" alt="Inclusive Education at deessa Foundation" width="536" style="display: block; width: 100%; max-width: 536px; height: auto; border-radius: 10px; border: 0;" />
    </td>
  </tr>
</table>

<h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; line-height: 1.3;">
  A Mother's Journey from Solitude to Community Support
</h1>

<p style="font-size: 16px; line-height: 1.65; color: #334155; margin: 0 0 16px 0;">
  When seven-year-old Aarav first joined our community learning center in Kathmandu, everyday sounds like honking buses and ringing school bells felt overwhelming. His family often felt isolated, navigating diagnosis and daily routines without access to specialized tools.
</p>

<p style="font-size: 16px; line-height: 1.65; color: #334155; margin: 0 0 16px 0;">
  Through your continued encouragement and our dedicated sensory therapy therapists, Aarav found a calm, structured space tailored to his unique sensory profile. Within six months, he began engaging with color-based communication boards and making friends in the art circle.
</p>

<!-- Quote Block -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; border-collapse: collapse;">
  <tr>
    <td style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 18px 22px; border-radius: 0 10px 10px 0;">
      <p style="margin: 0 0 8px 0; font-size: 16px; font-style: italic; color: #0f172a; line-height: 1.6;">
        &ldquo;For the first time, we didn&apos;t feel alone. The deessa Foundation provided our son with patience, dignity, and a real chance to thrive.&rdquo;
      </p>
      <p style="margin: 0; font-size: 13px; font-weight: 600; color: #166534;">
        — Sunita Sharma, Aarav&apos;s Mother
      </p>
    </td>
  </tr>
</table>

<p style="font-size: 16px; line-height: 1.65; color: #334155; margin: 0 0 20px 0;">
  Stories like Aarav&apos;s are only possible through our shared commitment to dignity and community-centered neurodiversity care. Read the full photo story on our website to see pictures from our classroom and hear from our lead occupational therapist.
</p>

<!-- CTA Button -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0; border-collapse: collapse;">
  <tr>
    <td align="center">
      <a href="https://deessafoundation.com/stories" target="_blank" style="display: inline-block; background-color: #0B5F8A; color: #ffffff; padding: 13px 30px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px;">
        Read the Complete Story →
      </a>
    </td>
  </tr>
</table>
`.trim(),
  },
  {
    id: "monthly_digest",
    name: "Monthly Community Digest",
    description: "Multi-section digest featuring 2-column image/text layouts, impact numbers, and upcoming events.",
    category: "digest",
    badge: "Versatile",
    defaultSubject: "🌱 deessa Community Digest: Milestones, Workshops & What's Ahead",
    defaultPreviewText: "Catch up on our ground-level initiatives, newly launched sensory spaces, and upcoming dates.",
    htmlContent: `
<h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 14px 0; line-height: 1.3;">
  This Month in Inclusive Action
</h1>

<p style="font-size: 16px; line-height: 1.65; color: #334155; margin: 0 0 20px 0;">
  Dear {{name}}, this past month has been filled with meaningful milestones. Here is a curated look at what our therapists, volunteers, and partner families achieved together across Nepal.
</p>

<!-- 2-Column: Image Left / Text Right -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; border-collapse: collapse;">
  <tr>
    <td width="38%" valign="top" style="padding-right: 16px;">
      <img src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&auto=format&fit=crop&q=80" alt="Sensory Exploration Corner" width="200" style="display: block; width: 100%; max-width: 200px; height: auto; border-radius: 8px; border: 1px solid #e2e8f0;" />
    </td>
    <td width="62%" valign="top" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.6; color: #334155;">
      <h3 style="margin: 0 0 8px 0; font-size: 17px; font-weight: 700; color: #0f172a; line-height: 1.3;">
        New Sensory Corner Launched in Pokhara
      </h3>
      <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
        Our mobile community outreach team set up a dedicated tactile learning and calming corner at our partner school, serving 35 children weekly.
      </p>
    </td>
  </tr>
</table>

<!-- 2-Column Stats Counter -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; border-collapse: collapse;">
  <tr>
    <td width="48%" align="center" style="padding: 16px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
      <div style="font-size: 28px; font-weight: 800; color: #0B5F8A;">142</div>
      <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-top: 4px;">Families Supported</div>
    </td>
    <td width="4%">&nbsp;</td>
    <td width="48%" align="center" style="padding: 16px; background-color: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
      <div style="font-size: 28px; font-weight: 800; color: #059669;">56</div>
      <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-top: 4px;">Therapy Sessions</div>
    </td>
  </tr>
</table>

<!-- 2-Column: Text Left / Image Right -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; border-collapse: collapse;">
  <tr>
    <td width="62%" valign="top" style="padding-right: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.6; color: #334155;">
      <h3 style="margin: 0 0 8px 0; font-size: 17px; font-weight: 700; color: #0f172a; line-height: 1.3;">
        Caregiver Advocacy & Support Circles
      </h3>
      <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
        Over 40 mothers and fathers joined our monthly peer mental health session, sharing strategies for early childhood neurodevelopment and stress mitigation.
      </p>
    </td>
    <td width="38%" valign="top">
      <img src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=600&auto=format&fit=crop&q=80" alt="Caregiver Support Circle" width="200" style="display: block; width: 100%; max-width: 200px; height: auto; border-radius: 8px; border: 1px solid #e2e8f0;" />
    </td>
  </tr>
</table>

<h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 24px 0 12px 0;">
  📅 Upcoming Community Calendar
</h2>

<ul style="margin: 0 0 20px 0; padding-left: 20px; font-size: 15px; line-height: 1.7; color: #334155;">
  <li><strong>Nov 18:</strong> Inclusive Art & Painting Afternoon for Children (Lalitpur Hub)</li>
  <li><strong>Nov 25:</strong> Online Q&A with Pediatric Neurologists on Sensory Processing</li>
  <li><strong>Dec 03:</strong> International Day of Persons with Disabilities Community Fair</li>
</ul>

<!-- CTA Button -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0; border-collapse: collapse;">
  <tr>
    <td align="center">
      <a href="https://deessafoundation.com/events" target="_blank" style="display: inline-block; background-color: #0B5F8A; color: #ffffff; padding: 13px 30px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px;">
        View All Upcoming Events →
      </a>
    </td>
  </tr>
</table>
`.trim(),
  },
  {
    id: "event_invitation",
    name: "Event Invitation & RSVP",
    description: "Event banner, date/venue card, highlighted agenda, and direct registration button.",
    category: "event",
    badge: "High Conversion",
    defaultSubject: "🎟️ You're Invited: Inclusive Arts & Neurodiversity Summit 2026",
    defaultPreviewText: "Reserve your seat for an inspirational morning of art, music, and neurodivergent empowerment.",
    htmlContent: `
<!-- Event Hero Image -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0; border-collapse: collapse;">
  <tr>
    <td align="center">
      <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80" alt="Inclusive Arts Summit" width="536" style="display: block; width: 100%; max-width: 536px; height: auto; border-radius: 10px; border: 0;" />
    </td>
  </tr>
</table>

<h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; line-height: 1.3; text-align: center;">
  Inclusive Arts & Neurodiversity Summit
</h1>

<p style="font-size: 16px; line-height: 1.6; color: #475569; margin: 0 0 24px 0; text-align: center;">
  Celebrate the incredible creative expressions of autistic youth and neurodivergent artists across Nepal.
</p>

<!-- Event Logistics Card -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; border-collapse: collapse;">
  <tr>
    <td style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 20px 24px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td width="33%" valign="top">
            <div style="font-size: 11px; font-weight: 700; color: #0B5F8A; text-transform: uppercase; letter-spacing: 0.5px;">Date</div>
            <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px;">Saturday, Dec 5</div>
          </td>
          <td width="33%" valign="top">
            <div style="font-size: 11px; font-weight: 700; color: #0B5F8A; text-transform: uppercase; letter-spacing: 0.5px;">Time</div>
            <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px;">10:00 AM – 3:00 PM</div>
          </td>
          <td width="34%" valign="top">
            <div style="font-size: 11px; font-weight: 700; color: #0B5F8A; text-transform: uppercase; letter-spacing: 0.5px;">Venue</div>
            <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 2px;">Kathmandu & Virtual</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 24px 0 10px 0;">
  What to Expect:
</h2>

<ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 15px; line-height: 1.7; color: #334155;">
  <li>Gallery showcase featuring 40+ original paintings created by autistic children.</li>
  <li>Interactive sensory-friendly music and rhythm workshops.</li>
  <li>Panel discussions featuring autistic self-advocates, educators, and pediatric psychologists.</li>
  <li>Free lunch and sensory relaxation booths for attendees and families.</li>
</ul>

<!-- RSVP CTA Button -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0; border-collapse: collapse;">
  <tr>
    <td align="center">
      <a href="https://deessafoundation.com/events/summit" target="_blank" style="display: inline-block; background-color: #059669; color: #ffffff; padding: 14px 34px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px;">
        Reserve Your Free Seat Now →
      </a>
    </td>
  </tr>
</table>
`.trim(),
  },
  {
    id: "director_letter",
    name: "Executive Director's Letter",
    description: "Thoughtful, personal letter format for reflections, annual milestones, or urgent appeals.",
    category: "letter",
    badge: "Personal",
    defaultSubject: "A personal reflection on hope and community resilience",
    defaultPreviewText: "A note from the desk of our Executive Director on our shared path forward.",
    htmlContent: `
<h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 18px 0; line-height: 1.35;">
  Reflections on Community, Patience & Groundbreaking Growth
</h1>

<p style="font-size: 16px; line-height: 1.7; color: #334155; margin: 0 0 16px 0;">
  Dear {{name}},
</p>

<p style="font-size: 16px; line-height: 1.7; color: #334155; margin: 0 0 16px 0;">
  As we approach the final months of this year, I find myself pausing to reflect on how far our community has come. When deessa Foundation began, our dream was simple yet ambitious: to ensure that no neurodivergent child in Nepal is sidelined by misunderstanding or lack of resources.
</p>

<p style="font-size: 16px; line-height: 1.7; color: #334155; margin: 0 0 16px 0;">
  Today, seeing our therapy rooms buzzing with laughter, observing children express themselves through art, and watching parents find solace in one another is the most humbling reward our team could ask for.
</p>

<!-- Highlighted Takeaway -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 22px 0; border-collapse: collapse;">
  <tr>
    <td style="background-color: #f1f5f9; border-left: 4px solid #0B5F8A; padding: 16px 20px; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-size: 15px; color: #1e293b; line-height: 1.6; font-weight: 500;">
        &ldquo;Inclusion isn&apos;t a favor we grant to others. It is the fundamental measure of our collective humanity.&rdquo;
      </p>
    </td>
  </tr>
</table>

<p style="font-size: 16px; line-height: 1.7; color: #334155; margin: 0 0 20px 0;">
  Thank you for walking alongside us with your time, your subscriptions, your shares, and your heartfelt encouragement. We cannot wait to share the next chapter with you.
</p>

<p style="font-size: 16px; line-height: 1.7; color: #334155; margin: 0;">
  With deepest gratitude,
</p>
<p style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 6px 0 0 0;">
  The Leadership Team at deessa Foundation
</p>
`.trim(),
  },
  {
    id: "minimal_announcement",
    name: "Minimalist Announcement",
    description: "Clean, uncluttered layout suitable for quick updates, policy notices, or brief messages.",
    category: "minimal",
    badge: "Clean",
    defaultSubject: "Important Community Announcement from deessa Foundation",
    defaultPreviewText: "Please read this brief update regarding our upcoming community hours.",
    htmlContent: `
<h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0;">
  Community Update & Operating Hours
</h1>

<p style="font-size: 16px; line-height: 1.65; color: #334155; margin: 0 0 16px 0;">
  We are writing to inform our community members and visitors of an update to our center schedules and online support channels.
</p>

<p style="font-size: 16px; line-height: 1.65; color: #334155; margin: 0 0 20px 0;">
  Beginning next Monday, our Lalitpur support center will expand weekend drop-in hours for parent consultations and peer play groups. All pre-scheduled weekday sessions remain unchanged.
</p>

<!-- CTA Button -->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; border-collapse: collapse;">
  <tr>
    <td align="left">
      <a href="https://deessafoundation.com/contact" target="_blank" style="display: inline-block; background-color: #0B5F8A; color: #ffffff; padding: 11px 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px;">
        View Updated Center Schedule →
      </a>
    </td>
  </tr>
</table>
`.trim(),
  },
]
