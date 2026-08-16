import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { AboutHero } from "@/components/about-hero"
import { AboutSections } from "./AboutSections"
import { generateSEOMetadata } from "@/lib/seo/metadata-utils"

export const metadata: Metadata = generateSEOMetadata({
  title: "Who We Are - About Deesha Foundation",
  description:
    "Learn about Deesha Foundation, a non-profit working for and with children with disabilities in Nepal, with a special focus on autism. Building a Nepal where every child is seen, heard, and included.",
  path: "/about",
  keywords: [
    "about Deesha Foundation",
    "Nepal disability NGO",
    "autism organization Nepal",
    "child disability support",
    "inclusive education Nepal",
    "our mission",
    "our team",
  ],
})

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
  const teamMembers = await getTeamMembers()

  return (
    <>
      <AboutHero />
      <AboutSections teamMembers={teamMembers} />
    </>
  )
}
