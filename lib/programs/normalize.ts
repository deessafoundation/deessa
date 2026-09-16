import type { ProgramDocument, ProgramSection as ZodSection } from "./content"
import type {
  Program,
  ProgramHero,
  ProgramSection as LegacySection,
  ProgramTheme,
  SectionType,
} from "@/lib/types/program-prototype"

function resolveTheme(category: ProgramDocument["category"]): ProgramTheme {
  const map: Record<ProgramDocument["category"], ProgramTheme> = {
    service: "warm",
    campaign: "campaign",
    outreach: "energetic",
    research: "editorial",
  }
  return map[category]
}

function resolveImageUrl(img: { assetId?: string; url?: string } | undefined): string {
  if (!img) return ""
  if (img.assetId) return `/api/assets/${img.assetId}`
  if (img.url) return img.url
  return ""
}

function normalizeHero(doc: ProgramDocument): ProgramHero {
  const img = doc.hero.image
  const imageUrl = resolveImageUrl(img)
  const imageAlt = img?.alt || doc.hero.title

  const actions = doc.hero.actions || []
  const cta = actions[0]
    ? { label: actions[0].label, url: actions[0].url, variant: actions[0].variant as "primary" | "secondary" }
    : undefined
  const secondaryCta = actions[1]
    ? { label: actions[1].label, url: actions[1].url }
    : undefined

  return {
    eyebrow: doc.eyebrow,
    title: doc.hero.title,
    description: doc.hero.description,
    image: imageUrl,
    imageAlt,
    layout: "full_bleed",
    cta,
    secondaryCta,
    sticker: doc.hero.sticker,
    note: doc.hero.note,
    photoNote: doc.hero.photoNote,
  }
}

function normalizeSection(section: ZodSection): LegacySection | null {
  if (!section.enabled) return null
  const base = { id: section.id, heading: section.heading, subheading: section.intro, description: section.description }
  const c = section.content

  switch (c.type) {
    case "rich_text":
      return { ...base, type: "rich_text", content: { type: "rich_text", body: c.body } }

    case "stats":
      return {
        ...base,
        type: "stats",
        content: {
          type: "stats",
          stats: c.stats.map((s) => ({
            value: s.value,
            label: s.label,
            sublabel: [s.period, s.source].filter(Boolean).join(" · ") || undefined,
          })),
        },
      }

    case "gallery":
      return {
        ...base,
        type: "gallery",
        content: {
          type: "gallery",
          layout: c.layout === "story" ? "masonry" : c.layout,
          images: c.images.map((img) => ({
            url: resolveImageUrl(img),
            alt: img.alt,
            caption: img.caption,
          })),
        },
      }

    case "features":
      return {
        ...base,
        type: "features",
        content: {
          type: "features",
          layout: c.layout,
          features: c.features.map((f) => ({
            title: f.title,
            description: f.description,
            icon: f.icon,
          })),
        },
      }

    case "how_it_works":
      return {
        ...base,
        type: "how_it_works",
        content: {
          type: "how_it_works",
          steps: c.items.map((item, i) => ({
            number: i + 1,
            title: item.title,
            description: item.description,
          })),
          handwrittenNote: c.handwrittenNote,
        },
      }

    case "timeline":
      return {
        ...base,
        type: "timeline",
        content: {
          type: "timeline",
          items: c.items.map((item) => ({
            date: item.date || "",
            title: item.title,
            description: item.description,
            status: item.status,
          })),
        },
      }

    case "quote":
      return {
        ...base,
        type: "quote",
        content: {
          type: "quote",
          quote: c.quote,
          person: c.person,
          role: c.role,
          location: c.location,
          photo: resolveImageUrl(c.image) || undefined,
        },
      }

    case "progress_tracker":
      return {
        ...base,
        type: "progress_tracker",
        content: {
          type: "progress_tracker",
          goal: c.goal,
          current: c.current,
          unit: c.unit,
          startDate: c.startDate,
          endDate: c.endDate,
        },
      }

    case "cta":
      return {
        ...base,
        type: "cta",
        content: {
          type: "cta",
          title: c.title,
          description: c.description,
          buttons: c.buttons.map((b) => ({
            label: b.label,
            url: b.url,
            variant: b.variant as "primary" | "secondary" | "outline",
          })),
        },
      }

    case "who_we_support":
      return {
        ...base,
        type: "who_we_support",
        content: {
          type: "who_we_support",
          targetGroups: c.groups.map((g) => ({
            title: g.title,
            description: g.description,
            ageRange: g.ageRange,
          })),
        },
      }

    case "faq":
      return {
        ...base,
        type: "faq",
        content: {
          type: "faq",
          items: c.items.map((item) => ({
            question: item.question,
            answer: item.answer,
          })),
        },
      }

    case "activities":
      return {
        ...base,
        type: "activities",
        content: {
          type: "activities",
          activities: c.activities.map((a) => ({
            time: [a.place, a.date].filter(Boolean).join(" · "),
            title: a.title,
            description: a.description,
            icon: a.count,
          })),
        },
      }

    case "resources":
      return {
        ...base,
        type: "resources",
        content: {
          type: "resources",
          resources: c.resources.map((r) => ({
            label: r.label,
            description: r.description,
            url: r.url,
          })),
        },
      }

    case "facts_bar":
      return {
        ...base,
        type: "facts_bar",
        content: {
          type: "facts_bar",
          facts: c.facts.map((f) => ({
            value: f.value,
            label: f.label,
          })),
        },
      }

    case "story":
      return {
        ...base,
        type: "story",
        content: {
          type: "story",
          title: c.person || "",
          context: c.description || "",
          challenge: "",
          approach: "",
          outcome: c.quote || "",
          image: resolveImageUrl(c.image) || undefined,
          quote: c.quote,
          person: c.person,
          role: c.role,
          location: c.location,
          stats: c.stats,
        },
      }

    case "built_in_demo":
      return null

    default:
      return null
  }
}

export function normalizeDocument(doc: ProgramDocument): Program {
  const theme = resolveTheme(doc.category)
  const sections: LegacySection[] = []
  for (const s of doc.sections) {
    const normalized = normalizeSection(s)
    if (normalized) sections.push(normalized)
  }

  return {
    id: "",
    slug: "",
    title: doc.title,
    category: doc.category,
    theme,
    eyebrow: doc.eyebrow,
    shortDescription: doc.shortDescription,
    tags: doc.tags,
    hero: normalizeHero(doc),
    sections,
  }
}
