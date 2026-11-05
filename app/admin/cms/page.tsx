import { redirect } from "next/navigation"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { hasPermission } from "@/lib/types/admin"
import { createClient } from "@/lib/supabase/server"
import CMSLaunchpadClient, { type CMSLiveCounts } from "@/components/admin/cms/cms-launchpad-client"

export const metadata = {
  title: "CMS Launchpad | Admin",
  description: "Operational content management system launchpad",
}

// Module permission requirements
const MODULE_PERMISSIONS: Record<string, string> = {
  homepage: "settings",
  about: "settings",
  "what-we-do": "settings",
  settings: "settings",
  events: "events",
  programs: "programs",
  projects: "projects",
  stories: "stories",
  podcasts: "stories",
  media: "settings",
  artworks: "settings",
  team: "team",
  partners: "partners",
  "community-posts": "settings",
  newsletter: "newsletters",
  stats: "stats",
}

async function getCMSCounts(): Promise<CMSLiveCounts> {
  try {
    const supabase = await createClient()

    // Parallel head-only queries for instant response and zero payload
    const [
      eventsRes,
      projectsRes,
      programsRes,
      storiesRes,
      podcastsRes,
      teamRes,
      partnersRes,
      mediaRes,
      artworksRes,
      fbPostsRes,
      newsletterRes,
      statsRes,
    ] = await Promise.allSettled([
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase.from("programs").select("*", { count: "exact", head: true }),
      supabase.from("stories").select("*", { count: "exact", head: true }),
      supabase.from("podcasts").select("*", { count: "exact", head: true }),
      supabase.from("team_members").select("*", { count: "exact", head: true }),
      supabase.from("partners").select("*", { count: "exact", head: true }),
      supabase.from("media_assets").select("*", { count: "exact", head: true }),
      supabase.from("artworks").select("*", { count: "exact", head: true }),
      supabase.from("facebook_posts").select("*", { count: "exact", head: true }),
      supabase.from("newsletter_subscriptions").select("*", { count: "exact", head: true }),
      supabase.from("impact_stats").select("*", { count: "exact", head: true }),
    ])

    return {
      events: eventsRes.status === "fulfilled" ? eventsRes.value.count || 0 : 0,
      projects: projectsRes.status === "fulfilled" ? projectsRes.value.count || 0 : 0,
      programs: programsRes.status === "fulfilled" ? programsRes.value.count || 0 : 0,
      stories: storiesRes.status === "fulfilled" ? storiesRes.value.count || 0 : 0,
      podcasts: podcastsRes.status === "fulfilled" ? podcastsRes.value.count || 0 : 0,
      team: teamRes.status === "fulfilled" ? teamRes.value.count || 0 : 0,
      partners: partnersRes.status === "fulfilled" ? partnersRes.value.count || 0 : 0,
      media: mediaRes.status === "fulfilled" ? mediaRes.value.count || 0 : 0,
      artworks: artworksRes.status === "fulfilled" ? artworksRes.value.count || 0 : 0,
      facebook_posts: fbPostsRes.status === "fulfilled" ? fbPostsRes.value.count || 0 : 0,
      newsletter: newsletterRes.status === "fulfilled" ? newsletterRes.value.count || 0 : 0,
      stats: statsRes.status === "fulfilled" ? statsRes.value.count || 0 : 0,
    }
  } catch (error) {
    console.error("Error fetching CMS live counts:", error)
    return {}
  }
}

export default async function CMSPage() {
  const adminUser = await getCurrentAdmin()

  if (!adminUser) {
    redirect("/admin/login")
  }

  // Filter accessible module IDs based on the admin role
  const accessibleModuleIds = Object.entries(MODULE_PERMISSIONS)
    .filter(([_, permission]) => hasPermission(adminUser.role, permission))
    .map(([id]) => id)

  // Fetch live counts
  const counts = await getCMSCounts()

  return (
    <CMSLaunchpadClient
      adminRole={adminUser.role}
      initialCounts={counts}
      accessibleModuleIds={accessibleModuleIds}
    />
  )
}
