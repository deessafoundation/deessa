"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getCurrentAdmin } from "./admin-auth"
import { hasPermission } from "@/lib/types/admin"
import { teamInputSchema, TEAM_SOCIAL_FIELDS } from "@/lib/types/team-input"

async function teamAdmin() {
  const admin = await getCurrentAdmin()
  return admin && hasPermission(admin.role, "team") ? admin : null
}

function teamValues(formData: FormData) {
  const parsed = teamInputSchema.safeParse({
    ...Object.fromEntries(["name", "role", "bio", "image", "email", "phone"].map(key => [key, formData.get(key) ?? ""])),
    tier: formData.get("tier") || "vision",
    is_published: formData.get("isPublished") === "true",
    is_featured: formData.get("isFeatured") === "true",
    social_links: Object.fromEntries(TEAM_SOCIAL_FIELDS.map(key => [key, formData.get(key) ?? ""])),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message } as const
  const { social_links, ...fields } = parsed.data
  return { data: {
    ...fields, bio: fields.bio || null, image: fields.image || null, email: fields.email || null, phone: fields.phone || null,
    social_links: Object.values(social_links).some(Boolean) ? Object.fromEntries(Object.entries(social_links).map(([key, value]) => [key, value || null])) : null,
  } } as const
}

function teamFailure(error: { message: string; code?: string }, action: string) {
  console.error(`Team member ${action} failed`, error)
  if (error.message?.includes("is_featured")) {
    return { error: "Database migration required: 'is_featured' column is missing on team_members. Please run migration 077 in Supabase." }
  }
  return { error: error.code === "PGRST116" ? "This member no longer exists. Refresh the list." : `Could not ${action} the team member. Please try again.` }
}

async function finishTeamChange(supabase: Awaited<ReturnType<typeof createClient>>, log: Record<string, unknown>) {
  const warnings: string[] = []
  try {
    const { error } = await supabase.from("activity_logs").insert(log)
    if (error) throw error
  } catch (error) {
    console.error("Team change saved; activity log failed", error)
    warnings.push("The change was saved, but its activity log could not be recorded.")
  }
  try {
    revalidatePath("/admin/team")
    revalidatePath("/about")
  } catch {
    warnings.push("The change was saved. Refresh the page to see the latest team.")
  }
  return warnings.join(" ") || undefined
}

export async function getTeamMembers() {
  if (!await teamAdmin()) throw new Error("Unauthorized")
  const supabase = await createClient()
  const { data, error } = await supabase.from("team_members").select("*").order("sort_order", { ascending: true })
  if (error) { console.error("Team list load failed", error); throw new Error("Could not load team members.") }
  return data
}

export async function getTeamMember(id: string) {
  if (!await teamAdmin()) throw new Error("Unauthorized")
  const supabase = await createClient()
  const { data, error } = await supabase.from("team_members").select("*").eq("id", id).single()
  if (error?.code === "PGRST116") return null
  if (error) { console.error("Team member load failed", error); throw new Error("Could not load this team member.") }
  return data
}

export async function createTeamMember(formData: FormData) {
  const admin = await teamAdmin()
  if (!admin) return { error: "Unauthorized" }
  const values = teamValues(formData)
  if ("error" in values) return values
  const supabase = await createClient()
  const { data: maxOrder, error: orderError } = await supabase.from("team_members")
    .select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle()
  if (orderError) return teamFailure(orderError, "create")
  const { data, error } = await supabase.from("team_members")
    .insert({ ...values.data, sort_order: (maxOrder?.sort_order ?? -1) + 1 }).select().single()
  // Never silently drop social links when migration 060 is missing.
  if (error) return teamFailure(error, "create")
  const warning = await finishTeamChange(supabase, { user_id: admin.id, action: "CREATE", entity_type: "team_member", entity_id: data.id, new_data: { name: values.data.name, role: values.data.role } })
  return { success: true, data, warning }
}

export async function updateTeamMember(id: string, formData: FormData) {
  const admin = await teamAdmin()
  if (!admin) return { error: "Unauthorized" }
  const values = teamValues(formData)
  if ("error" in values) return values
  const supabase = await createClient()
  const { error } = await supabase.from("team_members").update(values.data).eq("id", id).select("id").single()
  if (error) return teamFailure(error, "update")
  const warning = await finishTeamChange(supabase, { user_id: admin.id, action: "UPDATE", entity_type: "team_member", entity_id: id })
  return { success: true, warning }
}

export async function toggleTeamMemberFeatured(id: string, isFeatured: boolean) {
  const admin = await teamAdmin()
  if (!admin) return { error: "Unauthorized" }
  const supabase = await createClient()

  if (isFeatured) {
    const { count, error: countError } = await supabase
      .from("team_members")
      .select("id", { count: "exact", head: true })
      .eq("is_featured", true)
      .neq("id", id)

    if (!countError && count !== null && count >= 3) {
      return { error: "Maximum 3 members can be featured in the Hero collage. Please unfeature another member first." }
    }
  }

  const { error } = await supabase.from("team_members").update({ is_featured: isFeatured }).eq("id", id).select("id").single()
  if (error) return teamFailure(error, "update")
  const warning = await finishTeamChange(supabase, { user_id: admin.id, action: "UPDATE", entity_type: "team_member", entity_id: id, new_data: { is_featured: isFeatured } })
  return { success: true, warning }
}

export async function toggleTeamMemberPublish(id: string, isPublished: boolean) {
  const admin = await teamAdmin()
  if (!admin) return { error: "Unauthorized" }
  const supabase = await createClient()
  const { error } = await supabase.from("team_members").update({ is_published: isPublished }).eq("id", id).select("id").single()
  if (error) return teamFailure(error, "update")
  const warning = await finishTeamChange(supabase, { user_id: admin.id, action: "UPDATE", entity_type: "team_member", entity_id: id, new_data: { is_published: isPublished } })
  return { success: true, warning }
}

export async function deleteTeamMember(id: string) {
  const admin = await teamAdmin()
  if (!admin) return { error: "Unauthorized" }
  const supabase = await createClient()
  const { error } = await supabase.from("team_members").delete().eq("id", id).select("id").single()
  if (error) return teamFailure(error, "delete")
  const warning = await finishTeamChange(supabase, { user_id: admin.id, action: "DELETE", entity_type: "team_member", entity_id: id })
  return { success: true, warning }
}

export async function reorderTeamMembers(orderedIds: string[]) {
  const admin = await teamAdmin()
  if (!admin) return { error: "Unauthorized" }
  const parsed = z.array(z.uuid()).min(1).max(1000).refine(ids => new Set(ids).size === ids.length).safeParse(orderedIds)
  if (!parsed.success) return { error: "Provide a valid list of unique team members." }
  const supabase = await createClient()
  // These writes are not transactional: report partial failure so a caller can reload the actual order.
  const results = await Promise.allSettled(parsed.data.map((id, index) =>
    supabase.from("team_members").update({ sort_order: index }).eq("id", id).select("id").single(),
  ))
  const failed = results.some(result => result.status === "rejected" || result.value.error)
  const warning = await finishTeamChange(supabase, { user_id: admin.id, action: "UPDATE", entity_type: "team_member", new_data: { orderedIds: parsed.data, complete: !failed } })
  return failed ? { error: "Some positions could not be saved. Reload the team before trying again." } : { success: true, warning }
}
