import { z } from "zod"

export const programCategorySchema = z.enum(["service", "outreach", "research", "campaign"])
export type ProgramCategory = z.infer<typeof programCategorySchema>

const internalPath = z.string().min(1).max(500).refine((value) => value.startsWith("/") && !value.startsWith("//") && !/[\\\u0000-\u0020]/.test(value), "Use an internal path")
const actionPath = z.string().min(1).max(500).refine((value) => /^(?:\/(?!\/)|#[a-z0-9])/i.test(value) && !/[\\\u0000-\u0020]/.test(value), "Use an internal path or section anchor")
const actionSchema = z.object({ label: z.string().trim().min(1).max(80), url: actionPath, variant: z.enum(["primary", "secondary", "outline"]).default("primary"), eyebrow: z.string().max(120).optional(), title: z.string().max(160).optional(), description: z.string().max(800).optional() })
export const imageRefSchema = z.object({ assetId: z.string().uuid().optional(), url: z.union([z.string().url().refine(value => /^https?:\/\//i.test(value), "Use an HTTP or HTTPS image URL"), z.string().regex(/^\/(?!\/)[^\\\u0000-\u0020]+$/)]).optional(), alt: z.string().trim().min(1).max(180), caption: z.string().max(300).optional(), focalPoint: z.string().max(40).optional() })

const richTextSchema = z.object({ type: z.literal("rich_text"), body: z.string().max(100_000) })
const statsSchema = z.object({ type: z.literal("stats"), stats: z.array(z.object({ value: z.string().max(40).default(""), label: z.string().max(120).default(""), period: z.string().max(80).optional(), source: z.string().max(240).optional() })).min(1).max(12) })
const gallerySchema = z.object({ type: z.literal("gallery"), layout: z.enum(["grid", "story"]).default("grid"), images: z.array(imageRefSchema).min(1).max(8) })
const featuresSchema = z.object({ type: z.literal("features"), layout: z.enum(["grid", "list"]).default("grid"), features: z.array(z.object({ title: z.string().max(120).default(""), description: z.string().max(800).default(""), icon: z.string().max(40).optional(), number: z.string().max(10).optional() })).min(1).max(12) })
const stepsSchema = z.object({ type: z.enum(["how_it_works", "timeline"]), items: z.array(z.object({ title: z.string().max(120).default(""), description: z.string().max(800).default(""), date: z.string().max(80).optional(), status: z.enum(["completed", "active", "upcoming"]).optional() })).min(1).max(20), handwrittenNote: z.string().max(200).optional() })
const quoteSchema = z.object({ type: z.literal("quote"), quote: z.string().max(1_200).default(""), person: z.string().max(120).default(""), role: z.string().max(120).optional(), location: z.string().max(120).optional(), image: imageRefSchema.optional() })
const faqSchema = z.object({ type: z.literal("faq"), items: z.array(z.object({ question: z.string().max(240).default(""), answer: z.string().max(2_000).default("") })).min(1).max(20) })
const progressSchema = z.object({ type: z.literal("progress_tracker"), current: z.number().finite().min(0), goal: z.number().finite().positive(), unit: z.string().trim().min(1).max(60), asOf: z.string().datetime().optional(), startDate: z.string().datetime().optional(), endDate: z.string().datetime().optional() }).superRefine((value, ctx) => { if (value.endDate && value.startDate && value.endDate < value.startDate) ctx.addIssue({ code: "custom", path: ["endDate"], message: "End date must be after start date" }) })
const ctaSchema = z.object({ type: z.literal("cta"), title: z.string().max(160).default(""), description: z.string().max(800).default(""), buttons: z.array(actionSchema).min(1).max(3) })
const activitiesSchema = z.object({ type: z.literal("activities"), activities: z.array(z.object({ place: z.string().max(120).default(""), date: z.string().max(80).default(""), title: z.string().max(160).default(""), description: z.string().max(800).default(""), count: z.string().max(80).optional() })).min(1).max(20) })
const resourcesSchema = z.object({ type: z.literal("resources"), resources: z.array(z.object({ label: z.string().max(160).default(""), description: z.string().max(500).default(""), url: internalPath })).min(1).max(20) })
const audienceSchema = z.object({ type: z.literal("who_we_support"), groups: z.array(z.object({ title: z.string().max(120).default(""), description: z.string().max(800).default(""), ageRange: z.string().max(80).optional() })).min(1).max(12) })
const factsBarSchema = z.object({ type: z.literal("facts_bar"), facts: z.array(z.object({ label: z.string().max(80).default(""), value: z.string().max(120).default("") })).min(1).max(6) })
const storySchema = z.object({ type: z.literal("story"), quote: z.string().max(1_200).default(""), description: z.string().max(800).optional(), person: z.string().max(120).default(""), role: z.string().max(120).optional(), location: z.string().max(120).optional(), image: imageRefSchema.optional(), stats: z.array(z.object({ value: z.string().max(40).default(""), label: z.string().max(120).default("") })).max(4).default([]) })
const builtInDemoSchema = z.object({ type: z.literal("built_in_demo"), component: z.enum(["communication_board"]), checklist: z.array(z.string().max(200)).max(8).optional(), footnote: z.string().max(300).optional() })

export const sectionSchema = z.object({ id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80), heading: z.string().max(180).optional(), intro: z.string().max(800).optional(), description: z.string().max(800).optional(), presentation: z.enum(["auto", "ribbon", "essay", "question", "insights"]).optional(), footnote: z.string().max(300).optional(), detailLabel: z.string().max(120).optional(), detailText: z.string().max(4000).optional(), enabled: z.boolean().default(true), content: z.discriminatedUnion("type", [richTextSchema, statsSchema, gallerySchema, featuresSchema, stepsSchema, quoteSchema, faqSchema, progressSchema, ctaSchema, activitiesSchema, resourcesSchema, audienceSchema, factsBarSchema, storySchema, builtInDemoSchema]) })
export type ProgramSection = z.infer<typeof sectionSchema>

export const editorialHeroSchema = z.object({
  stamp: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  captionLeft: z.string().max(200).optional(),
  captionRight: z.string().max(200).optional(),
  status: z.string().max(120).optional(),
  conceptLabel: z.string().max(120).optional(),
  conceptTitle: z.string().max(200).optional(),
  conceptRoutine1: z.string().max(200).optional(),
  conceptRoutine2: z.string().max(200).optional(),
  conceptBrand: z.string().max(80).optional(),
  conceptCredit: z.string().max(80).optional(),
  figureLabel: z.string().max(200).optional(),
})
const heroIconSchema = z.object({ icon: z.string().max(40).optional(), text: z.string().max(200).optional() })

const programDocumentBaseSchema = z.object({ schemaVersion: z.literal(1), title: z.string().trim().min(1).max(120), shortDescription: z.string().trim().min(1).max(400), eyebrow: z.string().max(120).optional(), category: programCategorySchema, tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]), hero: z.object({ title: z.string().trim().min(1).max(180), description: z.string().trim().min(1).max(800), image: imageRefSchema.optional(), actions: z.array(actionSchema).max(2).default([]), note: heroIconSchema.optional(), sticker: heroIconSchema.optional(), photoNote: z.string().max(200).optional(), editorial: editorialHeroSchema.optional() }), seo: z.object({ title: z.string().max(160).optional(), description: z.string().max(320).optional(), imageAssetId: z.string().uuid().optional() }).default({}), sections: z.array(sectionSchema).max(30), relatedProgramIds: z.array(z.string().uuid()).max(6).default([]) })
export const programDocumentSchema = programDocumentBaseSchema.superRefine((doc, ctx) => {
  const ids = new Set<string>()
  for (const [index, section] of doc.sections.entries()) {
    if (ids.has(section.id)) ctx.addIssue({ code: 'custom', path: ['sections', index, 'id'], message: 'Section IDs must be unique' })
    ids.add(section.id)
    if (!section.enabled) continue
    const content = section.content
    const images = content.type === 'gallery' ? content.images : content.type === 'story' || content.type === 'quote' ? (content.image ? [content.image] : []) : []
    for (const image of images) if (!image.assetId && !image.url) ctx.addIssue({ code: 'custom', path: ['sections', index, 'content'], message: 'Choose an image or remove the empty image slot' })
  }
  if (doc.hero.image && !doc.hero.image.assetId && !doc.hero.image.url) ctx.addIssue({ code: 'custom', path: ['hero', 'image'], message: 'Choose or remove the hero image' })
})
export type ProgramDocument = z.infer<typeof programDocumentSchema>

// Drafts may contain unfinished galleries and buttons; publication remains strict.
const draftSectionSchema = sectionSchema.extend({ content: z.union([
  gallerySchema.extend({ images: z.array(imageRefSchema.extend({ alt: z.string().max(180) })).max(8) }),
  ctaSchema.extend({ buttons: z.array(actionSchema.extend({ label: z.string().max(80) })).max(3) }),
  sectionSchema.shape.content,
]) })
export const programDraftSchema = programDocumentBaseSchema.extend({ sections: z.array(draftSectionSchema).max(30) })
