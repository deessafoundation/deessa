import type { Metadata } from "next"
import { getPageMetadata } from "@/lib/seo/page-metadata"
import { fetchPublicNewsletterArchive } from "@/lib/data/newsletter"
import { NewsletterArchiveClient } from "@/components/newsletter/newsletter-archive-client"

export async function generateMetadata(): Promise<Metadata> {
  const base = await getPageMetadata("/newsletter-archive")
  return {
    ...base,
    title: "Newsletter Archive | deessa Foundation",
    description: "Browse past community bulletins, changemaker stories, and milestone updates from deessa Foundation.",
  }
}

export const dynamic = "force-dynamic"
export const revalidate = 3600 // Cache for 1 hour

export default async function NewsletterArchivePage() {
  const campaigns = await fetchPublicNewsletterArchive(30)

  return (
    <main className="min-h-screen py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <NewsletterArchiveClient campaigns={campaigns} />
    </main>
  )
}
