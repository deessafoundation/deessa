import type { Metadata } from "next"
import { AboutHero } from "@/components/about/about-hero"
import { AboutSections } from "./AboutSections"
import { getPublicAboutPageSettings } from "@/lib/data/about-settings"
import { getAboutTeamMembers } from "@/lib/data/about-team"
import { generateSEOMetadata } from "@/lib/seo/metadata-utils"

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getPublicAboutPageSettings()
  return generateSEOMetadata({ ...seo, path: "/about", image: seo.image || undefined, imageAlt: seo.imageAlt || undefined })
}

export default async function AboutPage() {
  const [team, aboutSettings] = await Promise.all([
    getAboutTeamMembers(),
    getPublicAboutPageSettings(),
  ])

  return (
    <>
      <AboutHero settings={aboutSettings.hero} teamMembers={team.members} />
      <AboutSections
        settings={aboutSettings}
        teamUnavailable={team.unavailable}
        teamMembers={team.members}
        intro={aboutSettings.intro}
        howWeDoIt={aboutSettings.howWeDoIt}
        journey={aboutSettings.journey}
      />
    </>
  )
}
