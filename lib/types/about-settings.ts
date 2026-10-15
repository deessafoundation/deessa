/**
 * About Page ("Who We Are") CMS Settings Types
 *
 * Corresponds to the `about_page_content` site_settings key.
 * Team members and partner logos are managed separately via
 * /admin/team and /admin/partners (DB-backed tables) — not covered here.
 *
 * @module lib/types/about-settings
 */

import { z } from "zod"
import { additionalAboutSchemas, aboutIntroMediaSchema, aboutFlowAppearanceSchema, DEFAULT_ABOUT_MEDIA, DEFAULT_ADDITIONAL_ABOUT_SETTINGS, type AdditionalAboutSettings } from "./about-sections"

export interface AboutHeroSettings {
  breadcrumbLabel: string
  badge: string
  headlineLine1: string
  headlineLine2: string
  subtitle: string
  primaryCtaLabel: string
  primaryCtaUrl: string
  secondaryCtaLabel: string
  secondaryCtaUrl: string
  trustBadges: string[]
}

export interface AboutIntroSettings {
  media: z.infer<typeof aboutIntroMediaSchema>
  flowAppearance: z.infer<typeof aboutFlowAppearanceSchema>
  sinceBadge: string
  label: string
  headline: string
  paragraphs: string[]
  quote: string
  flowSteps: string[]
}

export interface AboutHowWeDoItStep {
  id: string
  title: string
  body: string
  color: string
}

export interface AboutHowWeDoItSettings {
  label: string
  title: string
  subtitle: string
  steps: AboutHowWeDoItStep[]
  closingLine: string
}

export interface AboutJourneyMilestone {
  id: string
  year: string
  title: string
  description: string
  image?: string
  imageAlt?: string
  sourceUrl?: string
}

export interface AboutJourneySettings {
  label: string
  title: string
  subtitle: string
  milestones: AboutJourneyMilestone[]
}

export interface AboutPageSettings extends AdditionalAboutSettings {
  hero: AboutHeroSettings
  intro: AboutIntroSettings
  howWeDoIt: AboutHowWeDoItSettings
  journey: AboutJourneySettings
}

export const ABOUT_PAGE_SETTINGS_KEY = "about_page_content"

export function isSafeAboutContentUrl(value: string) {
  if (/[\u0000-\u001f\u007f\\]/.test(value)) return false
  if (/^\/(?!\/)/.test(value) || /^#[a-zA-Z0-9_-]+$/.test(value)) return true
  try {
    const url = new URL(value)
    return url.protocol === "https:" && !url.username && !url.password
  } catch { return false }
}

const copy = z.string().max(10000)
const requiredCopy = copy.refine(value => value.trim().length > 0, "Enter text for this field.")
const contentUrl = requiredCopy.refine(isSafeAboutContentUrl, "Use a local path, an anchor, or a secure HTTPS URL.")
const optionalMediaUrl = copy.refine(value => value === "" || (isSafeAboutContentUrl(value) && !value.startsWith("#")), "Use a local path or a secure HTTPS URL.").optional()
const optionalSourceUrl = copy.refine(value => value === "" || isSafeAboutContentUrl(value), "Use a local path, an anchor, or a secure HTTPS URL.").optional()
const identity = z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/, "Use a stable identifier without spaces.")
const uniqueIds = (items: { id: string }[], context: z.core.$RefinementCtx) => {
  const seen = new Set<string>()
  items.forEach((item, index) => {
    if (seen.has(item.id)) context.addIssue({ code: "custom", path: [index, "id"], message: "Each item must have a unique identifier." })
    seen.add(item.id)
  })
}

// Retain legacy keys (including the old whatWeDo section); validation must not silently erase them.
export const aboutPageSettingsSchema = z.looseObject({
  ...additionalAboutSchemas,
  getInvolved: additionalAboutSchemas.getInvolved.extend({ primaryHref: contentUrl, secondaryHref: contentUrl }),
  hero: z.looseObject({
    breadcrumbLabel: requiredCopy,
    badge: copy, headlineLine1: requiredCopy, headlineLine2: copy, subtitle: copy,
    primaryCtaLabel: requiredCopy, primaryCtaUrl: contentUrl,
    secondaryCtaLabel: requiredCopy, secondaryCtaUrl: contentUrl,
    trustBadges: z.array(requiredCopy).max(100),
  }),
  intro: z.looseObject({
    media: aboutIntroMediaSchema, flowAppearance: aboutFlowAppearanceSchema,
    sinceBadge: copy, label: copy, headline: requiredCopy,
    paragraphs: z.array(requiredCopy).max(100), quote: copy,
    flowSteps: z.array(requiredCopy).max(100),
  }),
  howWeDoIt: z.looseObject({
    label: copy,
    title: requiredCopy, subtitle: copy, closingLine: copy,
    steps: z.array(z.looseObject({
      id: identity, title: requiredCopy, body: requiredCopy,
      color: z.string().regex(/^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/, "Use a three- or six-digit hex color."),
    })).max(100).superRefine(uniqueIds),
  }),
  journey: z.looseObject({
    label: copy, title: copy, subtitle: copy,
    milestones: z.array(z.looseObject({
      id: identity, year: requiredCopy, title: requiredCopy, description: requiredCopy,
      image: optionalMediaUrl, imageAlt: copy.optional(), sourceUrl: optionalSourceUrl,
    }).superRefine((item, context) => {
      if (item.image && !item.imageAlt?.trim()) context.addIssue({ code: "custom", path: ["imageAlt"], message: "Describe this image for visitors using screen readers." })
    })).max(100).superRefine(uniqueIds),
  }).superRefine((journey, context) => {
    if (["hero", "intro", "howWeDoIt", "journey"].some(key => Object.hasOwn(journey, key))) {
      context.addIssue({ code: "custom", message: "Journey contains a nested page document. Restore or repair the saved record before editing." })
    }
  }),
})

const TEAL = "#29b6c8"

export const DEFAULT_ABOUT_PAGE_SETTINGS: AboutPageSettings = {
  ...DEFAULT_ADDITIONAL_ABOUT_SETTINGS,
  hero: {
    breadcrumbLabel: "Who We Are",
    badge: "✦ OUR TEAM & MISSION",
    headlineLine1: "The People",
    headlineLine2: "Behind Nepal's Change.",
    subtitle:
      "We are parents, educators, professionals, and advocates working for and with children with disabilities. With a special focus on autism, we are building a society where every child belongs.",
    primaryCtaLabel: "Read Our Story",
    primaryCtaUrl: "#journey",
    secondaryCtaLabel: "View Our Impact",
    secondaryCtaUrl: "/impact",
    trustBadges: ["Govt Registered", "SWC Affiliated"],
  },
  intro: {
    media: DEFAULT_ABOUT_MEDIA,
    flowAppearance: [{ icon: "eye", tone: "blue" }, { icon: "message-circle", tone: "pink" }, { icon: "heart", tone: "blue" }, { icon: "sprout", tone: "blue" }],
    sinceBadge: "✦ Since 2022",
    label: "Who We Are",
    headline: "Every child has potential. Every child belongs.",
    paragraphs: [
      "At deessa Foundation, we celebrate neurodiversity and work alongside children with disabilities, their families, educators, and communities. We see each child for their strengths, abilities, and unique potential.",
      "Inclusion begins when children are seen, heard, and supported. Through awareness, family support, training, and advocacy, we help create spaces where every child can learn, grow, and thrive.",
      "Our vision is a Nepal where being different is valued and every child has the opportunity to participate fully in family life, school, and community.",
    ],
    quote: "When we embrace neurodiversity, we unlock potential in every child.",
    flowSteps: ["Seen", "Heard", "Supported", "Thrive"],
  },
  howWeDoIt: {
    label: "How We Do It",
    title: "Change doesn't start with programmes. It starts with people.",
    subtitle:
      "Every child, every family, and every community has a different journey. Our role is to walk alongside them, with understanding and hope.",
    steps: [
      {
        id: "listen",
        title: "We Listen First",
        body: "Every family's journey is different. We listen first, to their needs, their challenges, and their hopes, before we design any solution.",
        color: TEAL,
      },
      {
        id: "train",
        title: "We Train the People Who Show Up",
        body: "Children thrive when the people around them know how to help. We train parents, teachers, health workers, and local leaders to build places where every child can succeed.",
        color: "#d97706",
      },
      {
        id: "partner",
        title: "We Work Through Partnership",
        body: "Inclusion takes a village. We bring together families, schools, health workers, and government to build one network of support for every child.",
        color: "#db2777",
      },
      {
        id: "build",
        title: "We Build Change That Lasts",
        body: "We focus on what outlasts us. By growing local leaders and shaping better policy, we help create change that improves children's lives across Nepal.",
        color: TEAL,
      },
    ],
    closingLine:
      "Because lasting inclusion isn't built by one organization. It's built by people, together, one step at a time.",
  },
  journey: {
    label: "Our Journey",
    title: "Milestones that define our path.",
    subtitle:
      "A growing movement for a Nepal where neurodiversity is understood, celebrated, and supported.",
    milestones: [
      {
        id: "foundation-begins",
        year: "2022",
        title: "deessa Foundation begins",
        description:
          "deessa began with a commitment to help every child be understood, accepted, and valued.",
        image: "/about/journey/2022-foundation-begins.jpg",
        imageAlt: "deessa Foundation story graphic about the experiences that led to the foundation",
        sourceUrl: "https://www.facebook.com/photo.php?fbid=920685784073967&set=pb.100083976611660.-2207520000&type=3",
      },
      {
        id: "building-understanding",
        year: "2024",
        title: "Building understanding",
        description:
          "We brought autism and neurodiversity into conversations with families, educators, and communities.",
        image: "/about/journey/2024-building-understanding.jpg",
        imageAlt: "deessa Foundation speaker sharing an inclusion message at a community event",
        sourceUrl: "https://www.facebook.com/photo.php?fbid=438651608944056&set=pb.100083976611660.-2207520000&type=3",
      },
      {
        id: "belonging-through-participation",
        year: "2025",
        title: "Belonging through participation",
        description:
          "Sport and youth-centred activities celebrated confidence, teamwork, and the belief that every child belongs.",
        image: "/about/journey/2025-belonging-participation.jpg",
        imageAlt: "Girls celebrating together with a trophy at an inter-school football tournament",
        sourceUrl: "https://www.facebook.com/photo.php?fbid=831062599702953&set=pb.100083976611660.-2207520000&type=3",
      },
      {
        id: "advocacy-for-inclusion",
        year: "2026",
        title: "Advocacy for inclusive support",
        description:
          "We called for accessible services, inclusive education, and disability-inclusive support during crises.",
        image: "/about/journey/2026-inclusive-advocacy.jpg",
        imageAlt: "Policy graphic outlining targeted programs for autistic and neurodivergent children",
        sourceUrl: "https://www.facebook.com/photo.php?fbid=952035330939012&set=pb.100083976611660.-2207520000&type=3",
      },
    ],
  },
}
