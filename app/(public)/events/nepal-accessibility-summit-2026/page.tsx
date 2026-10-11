import { AccessibilitySummit } from "@/components/events/accessibility-summit"
import { accessibilitySummit } from "@/lib/data/accessibility-summit"
import { generateSEOMetadata } from "@/lib/seo/metadata-utils"

export const metadata = generateSEOMetadata({
  title: accessibilitySummit.title,
  description: "Join the Nepal Accessibility Summit in Pokhara, November 30–December 1, 2026. Explore inclusive education, health, social protection and urban futures.",
  path: `/events/${accessibilitySummit.slug}`,
  image: accessibilitySummit.image,
  imageAlt: "Nepal Accessibility Summit 2026 poster",
})

export default function AccessibilitySummitPage() {
  return <AccessibilitySummit />
}
