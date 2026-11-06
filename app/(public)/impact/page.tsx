import type { Metadata } from "next"
import ImpactClientPage from "./ImpactClientPage"
import { getHomepageStats, getHomepagePrograms } from "@/lib/data/homepage-settings"
import { getPageMetadata } from "@/lib/seo/page-metadata"

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("/impact")
}

export default async function ImpactPage() {
  // Fetch homepage content from CMS (with fallbacks to hard-coded defaults)
  const statsSettings = await getHomepageStats()
  const programsSettings = await getHomepagePrograms()

  return (
    <ImpactClientPage 
      statsFromCMS={statsSettings.stats}
      programsFromCMS={programsSettings.programs}
    />
  )
}



