/**
 * About Page ("Who We Are") CMS Data Access
 *
 * @module lib/data/about-settings
 */

import { createClient } from "@/lib/supabase/server"
import {
  ABOUT_PAGE_SETTINGS_KEY,
  DEFAULT_ABOUT_PAGE_SETTINGS,
  type AboutPageSettings,
} from "@/lib/types/about-settings"

const LEGACY_INTRO_HEADLINES = new Set([
  "Every child deserves to be understood, accepted, and valued, just as they are.",
  "Every child deserves to be understood, accepted, and valued — just as they are.",
])
const UPDATED_INTRO_HEADLINE = "Every child deserves to be understood, accepted, and valued just as they are."

async function getAboutSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .single()

    if (error || !data?.value) {
      return defaultValue
    }

    return {
      ...defaultValue,
      ...data.value,
    } as T
  } catch (error) {
    console.error(`Exception fetching ${key}:`, error)
    return defaultValue
  }
}

/**
 * Get the full About page CMS content with fallback to defaults.
 */
export async function getAboutPageSettings(): Promise<AboutPageSettings> {
  const settings = await getAboutSetting<AboutPageSettings>(ABOUT_PAGE_SETTINGS_KEY, DEFAULT_ABOUT_PAGE_SETTINGS)
  const usesLegacyIntro = LEGACY_INTRO_HEADLINES.has(settings.intro.headline)
  const journey = settings.journey || DEFAULT_ABOUT_PAGE_SETTINGS.journey
  const milestones = Array.isArray(journey.milestones)
    ? journey.milestones.map((milestone, index) => ({
        ...(DEFAULT_ABOUT_PAGE_SETTINGS.journey.milestones[index] || {}),
        ...milestone,
        // The original CMS record predates the verified Facebook image set and
        // used 2023 for this milestone. Keep the displayed year aligned with
        // the source event until that record is saved from the admin editor.
        ...(milestone.id === "building-understanding" && !milestone.image
          ? { year: DEFAULT_ABOUT_PAGE_SETTINGS.journey.milestones[index]?.year || milestone.year }
          : {}),
      }))
    : DEFAULT_ABOUT_PAGE_SETTINGS.journey.milestones

  return {
    ...settings,
    hero: {
      ...settings.hero,
      subtitle: settings.hero.subtitle ===
        "We are parents, educators, professionals, and advocates working for and with children with disabilities — with a special focus on autism — to build a society where every child belongs."
        ? DEFAULT_ABOUT_PAGE_SETTINGS.hero.subtitle
        : settings.hero.subtitle,
    },
    intro: {
      ...(usesLegacyIntro
        ? { ...DEFAULT_ABOUT_PAGE_SETTINGS.intro, headline: UPDATED_INTRO_HEADLINE }
      : settings.intro),
      paragraphs: (usesLegacyIntro
        ? DEFAULT_ABOUT_PAGE_SETTINGS.intro.paragraphs
        : settings.intro.paragraphs
      ).map((paragraph) =>
        paragraph.replace(
          "disability is never seen as a limit — where every child is known for their strengths, abilities, and potential. Where being different is never seen as being less.",
          "disability is never seen as a limit. Every child is known for their strengths, abilities, and potential. Being different is never seen as being less."
        )
      ),
      sinceBadge: settings.intro.sinceBadge.replace(/\b2015\b/g, "2022"),
    },
    howWeDoIt: {
      ...settings.howWeDoIt,
      steps: settings.howWeDoIt.steps.map((step) => ({
        ...step,
        body: step.body.replace(
          "We listen first — to their needs, their challenges, their hopes — before we design any solution.",
          "We listen to their needs, their challenges, and their hopes before we design any solution."
        ),
      })),
    },
    journey: {
      ...DEFAULT_ABOUT_PAGE_SETTINGS.journey,
      ...journey,
      milestones,
    },
  }
}
