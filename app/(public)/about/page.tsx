import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { AboutHero } from "@/components/about-hero"
import { AboutSections } from "./AboutSections"
import { getAboutPageSettings } from "@/lib/data/about-settings"

export const metadata: Metadata = {
  title: "Who We Are - deessa Foundation",
  description:
    "deessa Foundation is a non-profit working for and with children with disabilities, with a special focus on autism — building a Nepal where every child is seen, heard, and included.",
}

async function getTeamMembers() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("team_members")
    .select("name, role, bio, image, social_links")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
  return data || []
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
      />
    </>
  )
}
