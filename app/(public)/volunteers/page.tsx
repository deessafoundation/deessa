import type { Metadata } from "next"
import { getPageMetadata } from "@/lib/seo/page-metadata"
import { VolunteersPageClient } from "@/components/volunteer/volunteers-page-client"

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getPageMetadata("/volunteers")
  return {
    ...metadata,
    title: metadata.title || "Volunteer With Us | Deesha Foundation Nepal",
    description:
      metadata.description ||
      "Join the Deesha Foundation volunteer community in Nepal. Explore opportunities in education, healthcare, community programs, and remote support.",
  }
}

export default function VolunteersPage() {
  return <VolunteersPageClient />
}
