import "server-only"
import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export const getAboutTeamMembers = cache(async () => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("team_members")
      .select("id, name, role, bio, image, social_links, tier, is_featured")
      .eq("is_published", true).order("sort_order", { ascending: true })

    if (error) {
      // Fallback if tier or is_featured column does not exist yet before migration
      const fallback = await supabase.from("team_members")
        .select("id, name, role, bio, image, social_links")
        .eq("is_published", true).order("sort_order", { ascending: true })
      if (fallback.error) throw fallback.error
      const members = (fallback.data ?? []).map((m, index) => ({
        ...m,
        tier: "vision",
        is_featured: index < 3,
      }))
      return { members, unavailable: false }
    }
    return { members: data ?? [], unavailable: false }
  } catch (error) {
    console.error("Published About team unavailable", error)
    return { members: [], unavailable: true }
  }
})
