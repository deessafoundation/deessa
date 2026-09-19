import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { AboutHero } from "@/components/about-hero"
import { AboutSections } from "./AboutSections"
import { getAboutPageSettings } from "@/lib/data/about-settings"
import { teamMembers as fallbackTeamMembers } from "@/data/team"
import { generateSEOMetadata } from "@/lib/seo/metadata-utils"

export const metadata: Metadata = generateSEOMetadata({
  title: "Who We Are - About Deessa Foundation",
  description:
    "Learn about Deessa Foundation, a non-profit working for and with children with disabilities in Nepal, with a special focus on autism. Building a Nepal where every child is seen, heard, and included.",
  path: "/about",
  keywords: [
    "about Deessa Foundation",
    "Nepal disability NGO",
    "autism organization Nepal",
    "child disability support",
    "inclusive education Nepal",
    "our mission",
    "our team",
  ],
})

async function getTeamMembers() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("team_members")
      .select("name, role, bio, image, social_links")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })

    if (error) {
      // Team members are managed in the CMS when available. Keep the public
      // page useful when the optional table cannot be reached.
      return fallbackTeamMembers
    }

    return data?.length ? data : fallbackTeamMembers
  } catch {
    return fallbackTeamMembers
  }
}

export default async function AboutPage() {
  const [teamMembers, aboutSettings] = await Promise.all([
    getTeamMembers(),
    getAboutPageSettings(),
  ])

  return (
    <>
      <AboutHero settings={aboutSettings.hero} />
      <AboutSections
        teamMembers={teamMembers}
        intro={aboutSettings.intro}
        howWeDoIt={aboutSettings.howWeDoIt}
        journey={aboutSettings.journey}
      />
    </>
  )
}
