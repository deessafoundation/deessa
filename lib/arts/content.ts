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
    heading: "Art that speaks",
    headingAccent: "without words",
    intro:
      "Step into the colourful worlds of Deetya and Marissa. Each piece is a glimpse of imagination, feeling, and the joy of creating.",
    ctaLabel: "Explore their art",
    creditLine: "Original works by Deetya & Marissa",
    badge: "Made with imagination and heart",
  },
  gallery: {
    eyebrow: "Art by Deetya & Marissa",
    heading: "A world of colour,",
    headingAccent: "through their eyes",
    intro:
      "A collection of paintings, playful details, and moments of expression. Take your time and see what each piece invites you to notice.",
    heroBadge: "A space for every expression",
    collectionHeading: "Little worlds,",
    collectionAccent: "big imagination",
    collectionIntro: "Original artworks from Deetya and Marissa's creative space.",
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
  return result as unknown as ArtsContent
}
