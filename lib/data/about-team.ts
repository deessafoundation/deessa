import "server-only"
import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export const getAboutTeamMembers = cache(async () => {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("team_members")
      .select("id, name, role, bio, image, social_links")
      .eq("is_published", true).order("sort_order", { ascending: true })
    if (error) throw error
    return { members: data ?? [], unavailable: false }
  } catch (error) {
    console.error("Published About team unavailable", error)
    return { members: [], unavailable: true }
  }
})
