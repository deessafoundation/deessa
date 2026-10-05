// Editable copy for the art feature, stored in site_settings under ARTS_CONTENT_KEY.
// Artworks themselves live in public.artworks; this only holds section text.

export const ARTS_CONTENT_KEY = "arts_content"

export type ArtsContent = {
  home: {
    eyebrow: string
    heading: string
    headingAccent: string
    intro: string
    ctaLabel: string
    creditLine: string
    badge: string
  }
  gallery: {
    eyebrow: string
    heading: string
    headingAccent: string
    intro: string
    heroBadge: string
    collectionHeading: string
    collectionAccent: string
    collectionIntro: string
  }
}

export const DEFAULT_ARTS_CONTENT: ArtsContent = {
  home: {
    eyebrow: "Art & Expression",
    heading: "Every child has a story.",
    headingAccent: "Art gives it a voice.",
    intro:
      "Art can be a way for children to communicate, explore emotions, build confidence, and express ideas when words may not always come easily. Let’s create spaces where all children, including children with autism and other disabilities can explore their creativity freely, without judgment or pressure.",
    ctaLabel: "Explore Art",
    creditLine: "A space for every artist and every expression",
    badge: "Made with imagination and heart",
  },
  gallery: {
    eyebrow: "Art & Expression",
    heading: "A world of colour,",
    headingAccent: "through their eyes",
    intro:
      "A growing collection celebrating the creativity of children and artists in our community. Every piece offers a different way of seeing, feeling, and sharing a story.",
    heroBadge: "A space for every expression",
    collectionHeading: "Little worlds,",
    collectionAccent: "big imagination",
    collectionIntro: "Explore original artworks from our community, with room for new artists, stories, and perspectives.",
  },
}

/** Max lengths enforced on save (server) and in the admin form. */
export const ARTS_CONTENT_LIMITS: { [G in keyof ArtsContent]: { [K in keyof ArtsContent[G]]: number } } = {
  home: { eyebrow: 60, heading: 80, headingAccent: 60, intro: 400, ctaLabel: 40, creditLine: 80, badge: 60 },
  gallery: {
    eyebrow: 60,
    heading: 80,
    headingAccent: 60,
    intro: 400,
    heroBadge: 60,
    collectionHeading: 80,
    collectionAccent: 60,
    collectionIntro: 300,
  },
}

/** Merge stored JSON over defaults, dropping unknown keys and non-strings. */
export function normalizeArtsContent(value: unknown): ArtsContent {
  const source = (value && typeof value === "object" ? value : {}) as Record<string, Record<string, unknown>>
  const result = structuredClone(DEFAULT_ARTS_CONTENT) as Record<string, Record<string, string>>
  for (const group of Object.keys(DEFAULT_ARTS_CONTENT) as (keyof ArtsContent)[]) {
    for (const key of Object.keys(DEFAULT_ARTS_CONTENT[group])) {
      const v = source[group]?.[key]
      if (typeof v === "string" && v.trim()) result[group][key] = v.trim()
    }
  }
  // Adopt the revised homepage copy for the original preset; retain custom CMS edits.
  if (source.home?.heading === "Art that speaks" && source.home?.headingAccent === "without words") {
    for (const key of ["heading", "headingAccent", "intro", "ctaLabel"] as const) {
      result.home[key] = DEFAULT_ARTS_CONTENT.home[key]
    }
  }
  // Broaden the original collection copy without replacing custom admin wording.
  if (result.home.creditLine === "Original works by Deetya & Marissa") {
    result.home.creditLine = DEFAULT_ARTS_CONTENT.home.creditLine
  }
  if (result.home.ctaLabel === "Explore their art") result.home.ctaLabel = DEFAULT_ARTS_CONTENT.home.ctaLabel
  if (result.gallery.eyebrow === "Art by Deetya & Marissa") result.gallery.eyebrow = DEFAULT_ARTS_CONTENT.gallery.eyebrow
  if (result.gallery.intro === "A collection of paintings, playful details, and moments of expression. Take your time and see what each piece invites you to notice.") {
    result.gallery.intro = DEFAULT_ARTS_CONTENT.gallery.intro
  }
  if (result.gallery.collectionIntro === "Original artworks from Deetya and Marissa's creative space.") {
    result.gallery.collectionIntro = DEFAULT_ARTS_CONTENT.gallery.collectionIntro
  }
  return result as unknown as ArtsContent
}
