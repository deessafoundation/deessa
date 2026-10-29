import { z } from "zod"
import { isSafeMediaUrl } from "@/lib/media-validation"

const copy = z.string().max(10000)
const required = copy.refine(value => !!value.trim(), "Enter text for this field.")
const mediaUrl = z.string().max(2048).refine(value => value === "" || isSafeMediaUrl(value), "Use a local path or secure HTTPS media URL.")
const header = z.looseObject({ label: copy, title: required, accent: copy, description: copy })
const id = z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/)
function uniqueItems(items: { id: string }[], context: z.core.$RefinementCtx) {
  const seen = new Set<string>()
  items.forEach((item, index) => {
    if (seen.has(item.id)) context.addIssue({ code: "custom", path: [index, "id"], message: "Each item must have a unique identifier." })
    seen.add(item.id)
  })
}
export const ABOUT_CATEGORY_ICONS = ["handshake", "globe", "graduation-cap", "heart-pulse", "droplet", "trees"] as const
export const ABOUT_CATEGORY_TONES = ["blue", "green", "purple", "rose", "cyan", "emerald"] as const
export const ABOUT_FLOW_ICONS = ["eye", "message-circle", "heart", "sprout"] as const
export const ABOUT_FLOW_TONES = ["blue", "pink", "green"] as const

export const aboutIntroMediaSchema = z.looseObject({
  src: mediaUrl, title: required,
  poster: mediaUrl, captionsSrc: mediaUrl, captionsLanguage: z.string().min(2).max(20).regex(/^[a-zA-Z-]+$/),
  captionsLabel: required, transcript: copy, autoPlay: z.boolean(), hasSpeech: z.boolean(),
}).superRefine((value, context) => {
  if (value.src && value.hasSpeech && !value.captionsSrc) context.addIssue({ code: "custom", path: ["captionsSrc"], message: "Add captions for a video with speech." })
})

export const aboutFlowAppearanceSchema = z.array(z.looseObject({ icon: z.enum(ABOUT_FLOW_ICONS), tone: z.enum(ABOUT_FLOW_TONES) })).max(100)

export const additionalAboutSchemas = {
  governance: z.looseObject({
    ...header.shape,
    tiers: z.array(z.looseObject({ id, title: required, subtitle: copy, description: copy, accent: z.enum(["vision", "board", "advisory", "assembly"]) })).length(4).superRefine(uniqueItems),
    operationalTitle: required,
    teams: z.array(z.looseObject({ id, title: required, description: copy })).length(2).superRefine(uniqueItems),
  }),
  people: z.looseObject({ ...header.shape, emptyMessage: required, unavailableMessage: required }),
  partnerSection: z.looseObject({ ...header.shape,
    categories: z.array(z.looseObject({ id, label: required, icon: z.enum(ABOUT_CATEGORY_ICONS), tone: z.enum(ABOUT_CATEGORY_TONES) })).length(6).superRefine(uniqueItems),
  }),
  getInvolved: z.looseObject({ title: required, description: copy, primaryLabel: required, primaryHref: required, secondaryLabel: required, secondaryHref: required }),
  seo: z.looseObject({ title: z.string().min(1).max(200), description: z.string().min(1).max(10000), keywords: z.array(required).max(100), image: mediaUrl, imageAlt: copy, noIndex: z.boolean() }).superRefine((value, context) => {
    if (value.image && !value.imageAlt.trim()) context.addIssue({ code: "custom", path: ["imageAlt"], message: "Describe the social sharing image." })
  }),
  visibility: z.looseObject({ intro: z.boolean(), process: z.boolean(), governance: z.boolean(), people: z.boolean(), partners: z.boolean(), getInvolved: z.boolean() }),
}

export interface AdditionalAboutSettings {
  governance: z.infer<typeof additionalAboutSchemas.governance>
  people: z.infer<typeof additionalAboutSchemas.people>
  partnerSection: z.infer<typeof additionalAboutSchemas.partnerSection>
  getInvolved: z.infer<typeof additionalAboutSchemas.getInvolved>
  seo: z.infer<typeof additionalAboutSchemas.seo>
  visibility: z.infer<typeof additionalAboutSchemas.visibility>
}

export const DEFAULT_ABOUT_MEDIA: z.infer<typeof aboutIntroMediaSchema> = {
  src: "/every_child.mp4", title: "Every child has potential", poster: "", captionsSrc: "",
  captionsLanguage: "en", captionsLabel: "English", transcript: "", autoPlay: true, hasSpeech: false,
}

export const DEFAULT_ADDITIONAL_ABOUT_SETTINGS: AdditionalAboutSettings = {
  governance: {
    label: "Governance", title: "How the Foundation Is", accent: "Organized",
    description: "Born from experience. United by purpose. The Foundation brings like-minded people together to build an inclusive society through strong governance.",
    tiers: [
      { id: "vision", title: "Founding Vision", subtitle: "Concept Designer & Co-Founders", description: "The minds behind the Foundation shape its idea, mission, and direction from the start.", accent: "vision" },
      { id: "board", title: "Governing Board", subtitle: "Executive Board", description: "The Executive Board leads the Foundation's strategic direction, legal oversight, governance, accountability, and management.", accent: "board" },
      { id: "advisory", title: "Advisory Circle", subtitle: "Advisory Board & Thematic Advisors", description: "Senior advisors and thematic experts guide the Foundation's strategy, credibility, and direction through institutional oversight and program expertise.", accent: "advisory" },
      { id: "assembly", title: "General Assembly", subtitle: "General Members", description: "The General Assembly is the Foundation's highest authority. Its members elect the Executive Board and hold it accountable.", accent: "assembly" },
    ],
    operationalTitle: "Operational Level", teams: [
      { id: "working", title: "Working Team", description: "Handles the Foundation's day-to-day operations and management." },
      { id: "technical", title: "Technical Team", description: "Experts who serve the Foundation, each in their own area of expertise." },
    ],
  },
  people: { label: "Our People", title: "Meet the", accent: "Changemakers", description: "Our diverse team of passionate individuals working tirelessly on the ground and behind the scenes.", emptyMessage: "Team members coming soon.", unavailableMessage: "Team profiles are temporarily unavailable. Please check back soon." },
  partnerSection: {
    label: "Collaboration", title: "Our Partners &", accent: "Supporters", description: "Working across sectors with organizations who share our vision.",
    categories: [
      { id: "partnerships", label: "Partnerships", icon: "handshake", tone: "blue" },
      { id: "global-ngos", label: "Global NGOs", icon: "globe", tone: "green" },
      { id: "education", label: "Education", icon: "graduation-cap", tone: "purple" },
      { id: "healthcare", label: "Healthcare", icon: "heart-pulse", tone: "rose" },
      { id: "water", label: "Water", icon: "droplet", tone: "cyan" },
      { id: "environment", label: "Environment", icon: "trees", tone: "emerald" },
    ],
  },
  getInvolved: { title: "Ready to Make a Difference?", description: "Whether through volunteering, donating, or simply spreading the word, your involvement is crucial to our mission.", primaryLabel: "Donate Now", primaryHref: "/donate", secondaryLabel: "Join Our Team", secondaryHref: "/get-involved" },
  seo: { title: "Who We Are - About deessa Foundation", description: "Learn about deessa Foundation, a non-profit working for and with children with disabilities in Nepal, with a special focus on autism. Building a Nepal where every child is seen, heard, and included.", keywords: ["about deessa Foundation", "Nepal disability NGO", "autism organization Nepal", "child disability support", "inclusive education Nepal", "our mission", "our team"], image: "", imageAlt: "", noIndex: false },
  visibility: { intro: true, process: true, governance: true, people: true, partners: true, getInvolved: true },
}
