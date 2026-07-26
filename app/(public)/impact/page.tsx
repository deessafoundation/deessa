import type { Metadata } from "next"
import ImpactClientPage from "./ImpactClientPage"
import { getHomepageStats, getHomepagePrograms } from "@/lib/data/homepage-settings"

export const metadata: Metadata = {
  title: "Our Impact | deessa Foundation — 10 Years of Change in Nepal",
  description:
    "From the Himalayas to the Terai plains — explore how deessa Foundation has touched 10,000+ lives across education, healthcare, autism support, and women's empowerment in Nepal since 2015.",
  openGraph: {
    title: "Our Impact | deessa Foundation",
    description: "10,000+ lives transformed across 25+ districts in Nepal. Explore a decade of impact.",
    type: "website",
  },
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
