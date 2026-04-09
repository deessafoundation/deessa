/**
 * Homepage Manager - Comprehensive Admin UI
 * 
 * This page allows admins to edit all homepage content through a visual interface.
 * Includes 14 managers: Hero Carousel, Stats, Programs, Timeline, Testimonials, and more.
 * All changes are saved to the database and reflected immediately on the homepage.
 */

import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { hasPermission, type AdminRole } from "@/lib/types/admin"
import { getAllHomepageSettings } from "@/lib/data/homepage-settings"
import { getHomeHeroSettings } from "@/lib/data/site-settings"
import { 
  getHomepageHeroCarousel, 
  getHomepageTestimonials, 
  getHomepageTimeline 
} from "@/lib/data/homepage-settings"
import HomepageManagerClient from "@/components/admin/homepage-manager/HomepageManagerClient"

export const metadata = {
  title: "Homepage Manager | Admin",
  description: "Manage homepage content and settings",
}

export default async function HomepageManagerPage() {
  // Check authentication using existing pattern
  const admin = await getCurrentAdmin()
  if (!admin) redirect("/admin/login")

  if (!hasPermission(admin.role as AdminRole, "settings")) {
    redirect("/admin")
  }

  // Fetch all homepage settings
  const settings = await getAllHomepageSettings()
  const heroSettings = await getHomeHeroSettings()
  const heroCarouselSettings = await getHomepageHeroCarousel()
  const testimonialsSettings = await getHomepageTestimonials()
  const timelineSettings = await getHomepageTimeline()

  return (
    <div className="space-y-6">
      <Suspense fallback={<LoadingState />}>
        <HomepageManagerClient 
          initialSettings={settings}
          initialHero={heroSettings}
          initialHeroCarousel={heroCarouselSettings}
          initialTestimonials={testimonialsSettings}
          initialTimeline={timelineSettings}
          userId={admin.user_id}
        />
      </Suspense>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading homepage manager...</p>
      </div>
    </div>
  )
}
