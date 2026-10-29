import { aboutPageSettingsSchema, DEFAULT_ABOUT_PAGE_SETTINGS, type AboutPageSettings } from "@/lib/types/about-settings"

const legacyHeadlines = new Set([
  "Every child deserves to be understood, accepted, and valued, just as they are.",
  "Every child deserves to be understood, accepted, and valued — just as they are.",
])
const legacyParagraphs = [
  "deessa Foundation is a non-profit working for and with children with disabilities, with a special focus on autism. Born from one family's story, we've grown into a community of parents, educators, professionals, advocates, and changemakers who share one purpose: to build a society where every child belongs.",
  "We believe lasting inclusion begins with understanding. When children are understood, they are accepted. When they are accepted, they are valued. And when they are valued, they are given the chance to learn, grow, and thrive.",
  "Our vision is a Nepal where disability is never seen as a limit. Every child is known for their strengths, abilities, and potential. Being different is never seen as being less.",
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function fillMissing(value: unknown, defaults: unknown): unknown {
  if (value === undefined) return structuredClone(defaults)
  if (!isRecord(value) || !isRecord(defaults)) return value
  return {
    ...value,
    ...Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [key, fillMissing(value[key], fallback)])),
  }
}

// Public recovery never writes defaults back to the stored document or unlocks the admin editor.
export function resolvePublicAboutSettings(value: unknown): AboutPageSettings {
  const completed = fillMissing(isRecord(value) ? value : {}, DEFAULT_ABOUT_PAGE_SETTINGS) as Record<string, unknown>
  const recovered = Object.fromEntries(Object.entries(aboutPageSettingsSchema.shape).map(([key, schema]) => {
    const parsed = schema.safeParse(completed[key])
    return [key, parsed.success ? parsed.data : DEFAULT_ABOUT_PAGE_SETTINGS[key as keyof AboutPageSettings]]
  }))
  return normalizeAboutPageSettings(recovered)
}

function completeItems(value: unknown, defaults: { id: string }[]) {
  if (!Array.isArray(value)) return value
  return value.map(item => {
    if (!isRecord(item)) return item
    const fallback = defaults.find(entry => entry.id === item.id)
    if (!fallback) return item
    // Only the known old record receives the corrected year; explicit edits/empty images survive.
    const legacyYear = item.id === "building-understanding" && item.year === "2023" && !Object.hasOwn(item, "image")
    return fillMissing(legacyYear ? { ...item, year: "2024" } : item, fallback)
  })
}

export function normalizeAboutPageSettings(value: unknown): AboutPageSettings {
  if (!isRecord(value) || !["hero", "intro", "howWeDoIt", "journey"].some(key => Object.hasOwn(value, key))) return aboutPageSettingsSchema.parse(value)
  const completed = fillMissing(value, DEFAULT_ABOUT_PAGE_SETTINGS)
  if (isRecord(completed)) {
    if (isRecord(completed.howWeDoIt)) completed.howWeDoIt.steps = completeItems(completed.howWeDoIt.steps, DEFAULT_ABOUT_PAGE_SETTINGS.howWeDoIt.steps)
    if (isRecord(completed.journey)) completed.journey.milestones = completeItems(completed.journey.milestones, DEFAULT_ABOUT_PAGE_SETTINGS.journey.milestones)
  }
  const settings = aboutPageSettingsSchema.parse(completed)
  const defaults = DEFAULT_ABOUT_PAGE_SETTINGS
  if (settings.hero.secondaryCtaLabel === "View Annual Reports" && settings.hero.secondaryCtaUrl === "/impact#reports") {
    settings.hero.secondaryCtaLabel = defaults.hero.secondaryCtaLabel
    settings.hero.secondaryCtaUrl = defaults.hero.secondaryCtaUrl
  }
  const usesLegacyIntro = legacyHeadlines.has(settings.intro.headline)

  if (settings.hero.subtitle === "We are parents, educators, professionals, and advocates working for and with children with disabilities — with a special focus on autism — to build a society where every child belongs.") settings.hero.subtitle = defaults.hero.subtitle
  settings.intro.paragraphs = settings.intro.paragraphs.map(paragraph => paragraph.replace(
    "disability is never seen as a limit — where every child is known for their strengths, abilities, and potential. Where being different is never seen as being less.",
    "disability is never seen as a limit. Every child is known for their strengths, abilities, and potential. Being different is never seen as being less."
  ))
  if (usesLegacyIntro) {
    settings.intro.headline = "Every child deserves to be understood, accepted, and valued just as they are."
    settings.intro.paragraphs = settings.intro.paragraphs.map(paragraph => {
      const index = legacyParagraphs.indexOf(paragraph)
      return index < 0 ? paragraph : defaults.intro.paragraphs[index]
    })
    if (settings.intro.quote === "At deessa Foundation, we stand for a world where every child is seen, heard, and included.") settings.intro.quote = defaults.intro.quote
    if (JSON.stringify(settings.intro.flowSteps) === JSON.stringify(["Understood", "Accepted", "Valued", "Thrive"])) settings.intro.flowSteps = [...defaults.intro.flowSteps]
  }
  settings.intro.sinceBadge = settings.intro.sinceBadge.replace(/\b2015\b/g, "2022")
  settings.howWeDoIt.steps = settings.howWeDoIt.steps.map(step => ({
    ...step,
    body: step.body.replace("We listen first — to their needs, their challenges, their hopes — before we design any solution.", "We listen to their needs, their challenges, and their hopes before we design any solution."),
  }))
  return settings
}
