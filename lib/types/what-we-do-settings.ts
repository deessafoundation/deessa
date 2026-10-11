import { z } from "zod"
import { WHAT_WE_DO_AREAS } from "@/lib/data/what-we-do-areas"

export const WHAT_WE_DO_SETTINGS_KEY = "what_we_do_content"
export const MAX_WHAT_WE_DO_CARDS = 20
export const PILLAR_ICON_NAMES = ["megaphone", "book-open", "file-text", "scale", "users", "heart", "graduation-cap", "handshake", "lightbulb", "globe"] as const
export const PILLAR_ACCENTS = ["sky", "mint", "sunny", "lavender"] as const
export const PILLAR_ARROW_NAMES = ["arrow-right", "chevron-right", "arrow-up-right"] as const
export const DEFAULT_PILLAR_LAYOUT = { columns: "4" as const, spacing: "comfortable" as const }
const pillarLayoutSchema = z.object({
  columns: z.enum(["1", "2", "3", "4"]),
  spacing: z.enum(["compact", "comfortable"]),
}).strict().default(DEFAULT_PILLAR_LAYOUT)
export type PillarLayout = z.infer<typeof pillarLayoutSchema>

const cardText = z.string().trim().min(1).max(10000)
export const whatWeDoCardSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens").max(80),
  title: cardText,
  description: cardText,
  buttonLabel: cardText,
  href: cardText.refine(isSafeContentUrl, "Use a local path or a secure https URL"),
  tag: z.string().trim().max(80),
  icon: z.enum(PILLAR_ICON_NAMES),
  accent: z.enum(PILLAR_ACCENTS),
  arrow: z.enum(PILLAR_ARROW_NAMES),
  enabled: z.boolean(),
  showIcon: z.boolean(),
  showArrow: z.boolean(),
  showDecoration: z.boolean(),
}).strict()
export type WhatWeDoCard = z.infer<typeof whatWeDoCardSchema>

// Only new presentation fields receive defaults; saved copy and URLs are never replaced.
const legacyCardPresentation = {
  awareness: { tag: "Communities", icon: "megaphone", accent: "sky" },
  training: { tag: "Trained", icon: "book-open", accent: "mint" },
  resources: { tag: "Resources", icon: "file-text", accent: "sunny" },
  advocacy: { tag: "Policies", icon: "scale", accent: "lavender" },
} as const
const cardsSchema = z.array(z.preprocess(value => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value
  const card = value as Record<string, unknown>
  const presentation = legacyCardPresentation[card.slug as keyof typeof legacyCardPresentation]
  return { tag: "", icon: "megaphone", accent: "sky", ...presentation, arrow: "arrow-right", enabled: true, showIcon: true, showArrow: true, showDecoration: true, ...card }
}, whatWeDoCardSchema)).max(MAX_WHAT_WE_DO_CARDS).superRefine((cards, context) => {
  const slugs = new Set<string>()
  cards.forEach((card, index) => {
    if (slugs.has(card.slug)) context.addIssue({ code: "custom", path: [index, "slug"], message: "Each card must have a unique identifier" })
    slugs.add(card.slug)
  })
})
export const DEFAULT_WHAT_WE_DO_SETTINGS = {
  hero: {
    breadcrumb: "Programs", eyebrow: "MAKING A DIFFERENCE ACROSS NEPAL",
    headingStart: "Programs", headingEmphasis: "That", headingEnd: "Change", headingAccent: "Lives.",
    description: "From classrooms in Karnali to clinics in the Terai, our work brings sustainable education, healthcare, and empowerment reaching Nepal's most remote communities.",
    primaryLabel: "Explore Programs", primaryHref: "#programs", secondaryLabel: "Donate to a Program", secondaryHref: "/donate",
    photos: [
      { src: "/WhatWeDo/community_learning.jpg", alt: "Two women reviewing notes together during an inclusive education workshop." },
      { src: "/WhatWeDo/football_program.jpg", alt: "A girls' football team celebrating with a trophy and medals." },
      { src: "/WhatWeDo/speaker.jpg", alt: "A woman speaking into a microphone while addressing an audience." },
    ],
  },
  introduction: { label: "What We Do", title: "We turn understanding into action for", titleAccent: "children, families, and communities.", description: "Our work supports children with disabilities, their families, educators, and communities through four core areas." },
  cards: [
    { slug: "awareness", title: "Awareness & Community Engagement", description: "We break the silence. Through community campaigns, social media, podcasts, and public conversations, we challenge myths and replace stigma with understanding.", buttonLabel: "Explore this area", href: "/whatwedo/awareness" },
    { slug: "training", title: "Training", description: "We equip parents, teachers, health workers, and caregivers with the skills to spot autism early and support every child, the right way.", buttonLabel: "Explore this area", href: "/whatwedo/training" },
    { slug: "resources", title: "Resources", description: "No family should have to navigate this journey alone. We build simple, accessible guides and tools for parents, educators, and professionals.", buttonLabel: "Explore this area", href: "/whatwedo/resources" },
    { slug: "advocacy", title: "Advocacy", description: "We push for inclusive schools and stronger policies that protect every child's rights, so inclusion becomes a right, not a privilege.", buttonLabel: "Explore this area", href: "/whatwedo/advocacy" },
  ],
  cardsLayout: DEFAULT_PILLAR_LAYOUT,
  support: {
    label: "Ways to Help", title: "Want to Support a", titleAccent: "Specific Program?", description: "Your targeted donation ensures maximum impact in the area you care about most.",
    actions: [
      { title: "Make a Donation", description: "Fund education, healthcare, or autism support directly.", cta: "Donate Now", href: "/donate" },
      { title: "Become a Partner", description: "Organizations partnering with us multiply impact across Nepal.", cta: "Partner With Us", href: "/contact" },
      { title: "Volunteer Your Skills", description: "Join our team on the ground or offer remote support to our programs.", cta: "Get Involved", href: "/get-involved" },
    ],
  },
  areas: Object.fromEntries(Object.entries(WHAT_WE_DO_AREAS).map(([id, area]) => [id, {
    ...area, audienceTitle: "Who this is for", closingButtonLabel: "Explore our work", closingButtonHref: "/whatwedo#programs", playButtonLabel: "Watch video",
  }])) as Record<keyof typeof WHAT_WE_DO_AREAS, (typeof WHAT_WE_DO_AREAS)[keyof typeof WHAT_WE_DO_AREAS] & { audienceTitle: string; closingButtonLabel: string; closingButtonHref: string; playButtonLabel: string }>,
  animatedStory: {
    enabled: true, videoSrc: "/what-we-do/understanding-a-new-friend.mp4", posterSrc: "/what-we-do/understanding-a-new-friend.jpg",
    videoLabel: "Understanding a new friend", areaLabel: "Animated story", playButtonLabel: "Watch video", eyebrow: "Watch, understand, include", title: "Understanding a new friend",
    description: "A curious student wonders about her new classmate with autism. This animated story opens a conversation about understanding differences, showing kindness, and helping every child feel welcome.",
    listTitle: "Start a conversation together", items: ["How can we help a new classmate feel included?", "What can we do when someone communicates or learns differently?", "What is one kind action we can take today?"],
  },
  inclusiveSchool: {
    enabled: true, imageSrc: "/Advocacyforinclusiveschool.jpeg", imageAlt: "Illustration of a teacher welcoming children, including children using a wheelchair, headphones, and a crutch, outside a school in Nepal.",
    eyebrow: "Advocacy for inclusive schools", title: "A school where every child belongs",
    introduction: "We advocate for inclusive schools that welcome every child, regardless of their background, ability, or identity.",
    description: "Belonging means more than being present in a classroom. It means being respected, having the support to participate, and being given opportunities to learn alongside others.",
    items: ["Accessible classrooms and learning materials that respond to different needs.", "Teaching that recognises each child’s strengths and ways of learning.", "A welcoming school culture built on respect, participation, and equal opportunity."],
  },
  inclusiveLearning: {
    enabled: true, imageSrc: "/WhatWeDo/inclusive-learning.png", imageAlt: "Rainbow-coloured sensory tubes forming an infinity symbol. The inclusive-learning message is reproduced alongside this image.",
    eyebrow: "Inclusive teaching", title: "Different ways to learn",
    quote: "A child who learns differently is still a child who wants to learn. Adjust the system, not the child.",
    description: "Train teachers, diversify teaching methods, and avoid labeling. Inclusion starts with curriculum and culture.",
    listTitle: "Make room for every learner", items: ["Offer different ways to explore ideas, communicate, and take part.", "Adapt learning materials, classroom routines, and support to each child’s needs.", "Recognise strengths and build a culture of patience, respect, and belonging."],
  },
}
export type WhatWeDoSettings = Omit<typeof DEFAULT_WHAT_WE_DO_SETTINGS, "cards" | "cardsLayout"> & { cards: WhatWeDoCard[]; cardsLayout: PillarLayout }

export function isSafeContentUrl(value: string) {
  if (/[\u0000-\u001f\\]/.test(value)) return false
  if (/^\/(?!\/)/.test(value) || /^#[a-zA-Z0-9_-]+$/.test(value)) return true
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password } catch { return false }
}

// The rest of the document retains its existing shape; cards use an extensible schema.
function schemaFor(value: unknown, key = ""): z.ZodTypeAny {
  if (key === "cards") return cardsSchema
  if (key === "cardsLayout") return pillarLayoutSchema
  if (typeof value === "boolean") return z.boolean()
  if (typeof value === "string") {
    if (["id", "slug", "labelClass", "icon", "color"].includes(key)) return z.literal(value)
    const text = z.string().trim().min(1).max(10000)
    return /(?:src|href)$/i.test(key) ? text.refine(value => isSafeContentUrl(value) && (!/src$/i.test(key) || !value.startsWith("#")), "Use a local path or a secure https URL") : text
  }
  if (Array.isArray(value)) {
    if (value.every(item => typeof item === "string")) return z.array(z.string().trim().min(1).max(10000)).min(1).max(20)
    return z.tuple(value.map(item => schemaFor(item)) as [z.ZodTypeAny, ...z.ZodTypeAny[]])
  }
  return z.object(Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, schemaFor(v, k)]))).strict()
}
export const whatWeDoSettingsSchema = schemaFor(DEFAULT_WHAT_WE_DO_SETTINGS) as z.ZodType<WhatWeDoSettings>
