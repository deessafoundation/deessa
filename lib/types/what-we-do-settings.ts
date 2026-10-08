import { z } from "zod"
import { WHAT_WE_DO_AREAS } from "@/lib/data/what-we-do-areas"

export const WHAT_WE_DO_SETTINGS_KEY = "what_we_do_content"
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
export type WhatWeDoSettings = typeof DEFAULT_WHAT_WE_DO_SETTINGS

export function isSafeContentUrl(value: string) {
  if (/[\u0000-\u001f\\]/.test(value)) return false
  if (/^\/(?!\/)/.test(value) || /^#[a-zA-Z0-9_-]+$/.test(value)) return true
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password } catch { return false }
}

// The default document defines the editable shape. Layout classes and route identities
// remain immutable; every content field is validated before reaching the database.
function schemaFor(value: unknown, key = ""): z.ZodTypeAny {
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
