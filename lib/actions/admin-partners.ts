"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getCurrentAdmin } from "./admin-auth"
import { hasPermission } from "@/lib/types/admin"
import { partnerInputSchema } from "@/lib/types/partner-input"

function partnerValues(formData: FormData) {
  const parsed = partnerInputSchema.safeParse({
    name: formData.get("name") ?? "", type: formData.get("type") ?? "", logo: formData.get("logo") ?? "",
    website: formData.get("website") ?? "", description: formData.get("description") ?? "", is_published: formData.get("isPublished") === "true",
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message } as const
  return { data: { ...parsed.data, logo: parsed.data.logo || null, website: parsed.data.website || null, description: parsed.data.description || null } } as const
}

async function logPartner(supabase: Awaited<ReturnType<typeof createClient>>, row: Record<string, unknown>) {
  try {
    const { error } = await supabase.from("activity_logs").insert(row)
    if (error) throw error
  } catch (error) {
    console.error("Partner saved; activity log failed", error)
    return "The partner change was saved, but its activity log could not be recorded."
  }
}

function partnerFailure(error: { message: string; code?: string }, action: string) {
  console.error(`Partner ${action} failed`, error)
  return { error: error.code === "PGRST116" ? "This partner no longer exists. Refresh the list." : `Could not ${action} the partner. Please try again.` }
}

function refreshPartnerPages() {
  try {
    revalidatePath("/admin/about")
    revalidatePath("/admin/partners")
    revalidatePath("/")
  } catch {
    return "Your change was saved. Refresh the page to see the latest partners."
  }
}

export async function getPartners() {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "partners")) throw new Error("Unauthorized")
  const supabase = await createClient()
  const { data, error } = await supabase.from("partners").select("*").order("sort_order", { ascending: true })

  if (error) { console.error("Partner list load failed", error); throw new Error("Could not load partners. Please try again.") }
  return data
}

export async function getPartner(id: string) {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "partners")) throw new Error("Unauthorized")
  const supabase = await createClient()
  const { data, error } = await supabase.from("partners").select("*").eq("id", id).single()

  if (error) { console.error("Partner load failed", error); throw new Error("Could not load this partner. Please try again.") }
  return data
}

export async function createPartner(formData: FormData) {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "partners")) return { error: "Unauthorized" }

  const supabase = await createClient()

  const values = partnerValues(formData)
  if ("error" in values) return { error: values.error }
  const { name, type } = values.data

  // Get max sort order
  const { data: maxOrder, error: orderError } = await supabase
    .from("partners")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (orderError) return partnerFailure(orderError, "create")

  const sortOrder = (maxOrder?.sort_order || 0) + 1

  const { data, error } = await supabase
    .from("partners")
    .insert({
      ...values.data,
      sort_order: sortOrder,
    })
    .select()
    .single()

  if (error) return partnerFailure(error, "create")

  const logWarning = await logPartner(supabase, {
    user_id: admin.id,
    action: "CREATE",
    entity_type: "partner",
    entity_id: data.id,
    new_data: { name, type },
  })

  return { success: true, data, warning: [logWarning, refreshPartnerPages()].filter(Boolean).join(" ") || undefined }
}

export async function updatePartner(id: string, formData: FormData) {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "partners")) return { error: "Unauthorized" }

  const supabase = await createClient()

  const values = partnerValues(formData)
  if ("error" in values) return { error: values.error }

  const { error } = await supabase
    .from("partners")
    .update(values.data)
    .eq("id", id)
    .select("id")
    .single()

  if (error) return partnerFailure(error, "update")

  const logWarning = await logPartner(supabase, {
    user_id: admin.id,
    action: "UPDATE",
    entity_type: "partner",
    entity_id: id,
  })

  return { success: true, warning: [logWarning, refreshPartnerPages()].filter(Boolean).join(" ") || undefined }
}

export async function deletePartner(id: string) {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "partners")) return { error: "Unauthorized" }

  const supabase = await createClient()
  const { error } = await supabase.from("partners").delete().eq("id", id).select("id").single()

  if (error) return partnerFailure(error, "delete")

  const logWarning = await logPartner(supabase, {
    user_id: admin.id,
    action: "DELETE",
    entity_type: "partner",
    entity_id: id,
  })

  return { success: true, warning: [logWarning, refreshPartnerPages()].filter(Boolean).join(" ") || undefined }
}
