"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getCurrentAdmin } from "./admin-auth"
import { hasPermission, type ImpactStat } from "@/lib/types/admin"

export interface SaveImpactStatInput {
  id?: string
  label: string
  value: string
  icon?: string | null
  color?: string | null
  progress?: number | null
  category: "home" | "impact"
  is_published?: boolean
  sort_order?: number
}

export async function getImpactStats(): Promise<ImpactStat[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("impact_stats")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) throw error
  return (data || []) as ImpactStat[]
}

export async function getImpactStat(id: string): Promise<ImpactStat | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("impact_stats")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }
  return data as ImpactStat
}

export async function saveImpactStatAction(
  input: SaveImpactStatInput
): Promise<{ success: boolean; data?: ImpactStat; error?: string }> {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "stats")) {
    return { success: false, error: "Unauthorized" }
  }

  const label = input.label?.trim()
  const value = input.value?.trim()

  if (!label) return { success: false, error: "Statistic label is required" }
  if (!value) return { success: false, error: "Statistic value is required" }

  const supabase = await createClient()

  let savedStat: ImpactStat

  if (input.id) {
    // Update existing stat
    const { data, error } = await supabase
      .from("impact_stats")
      .update({
        label,
        value,
        icon: input.icon || null,
        color: input.color || null,
        progress: typeof input.progress === "number" && !isNaN(input.progress) ? input.progress : null,
        category: input.category || "home",
        is_published: input.is_published ?? true,
        sort_order: input.sort_order ?? 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.id)
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    savedStat = data as ImpactStat

    await supabase.from("activity_logs").insert({
      user_id: admin.id,
      action: "UPDATE",
      entity_type: "impact_stat",
      entity_id: input.id,
      new_data: { label, value, category: input.category },
    })
  } else {
    // Create new stat
    let sortOrder = input.sort_order
    if (sortOrder === undefined || sortOrder === null) {
      const { data: maxOrder } = await supabase
        .from("impact_stats")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle()

      sortOrder = (maxOrder?.sort_order ?? 0) + 1
    }

    const { data, error } = await supabase
      .from("impact_stats")
      .insert({
        label,
        value,
        icon: input.icon || null,
        color: input.color || null,
        progress: typeof input.progress === "number" && !isNaN(input.progress) ? input.progress : null,
        category: input.category || "home",
        is_published: input.is_published ?? true,
        sort_order: sortOrder,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    savedStat = data as ImpactStat

    await supabase.from("activity_logs").insert({
      user_id: admin.id,
      action: "CREATE",
      entity_type: "impact_stat",
      entity_id: savedStat.id,
      new_data: { label, value, category: input.category },
    })
  }

  revalidatePath("/admin/stats")
  revalidatePath("/")
  revalidatePath("/impact")

  return { success: true, data: savedStat }
}

export async function toggleStatPublishedAction(
  id: string,
  is_published: boolean
): Promise<{ success: boolean; error?: string }> {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "stats")) {
    return { success: false, error: "Unauthorized" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("impact_stats")
    .update({
      is_published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) return { success: false, error: error.message }

  await supabase.from("activity_logs").insert({
    user_id: admin.id,
    action: "UPDATE",
    entity_type: "impact_stat",
    entity_id: id,
    new_data: { is_published },
  })

  revalidatePath("/admin/stats")
  revalidatePath("/")
  revalidatePath("/impact")

  return { success: true }
}

export async function reorderStatsAction(
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "stats")) {
    return { success: false, error: "Unauthorized" }
  }

  const supabase = await createClient()

  for (let index = 0; index < orderedIds.length; index++) {
    const id = orderedIds[index]
    await supabase
      .from("impact_stats")
      .update({
        sort_order: index + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
  }

  revalidatePath("/admin/stats")
  revalidatePath("/")
  revalidatePath("/impact")

  return { success: true }
}

export async function seedDefaultStatsAction(): Promise<{
  success: boolean
  count?: number
  error?: string
}> {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "stats")) {
    return { success: false, error: "Unauthorized" }
  }

  const supabase = await createClient()

  const defaultStats = [
    {
      label: "Lives Impacted",
      value: "10,000+",
      icon: "heart",
      color: "#3FABDE",
      progress: 95,
      category: "home" as const,
      sort_order: 1,
      is_published: true,
    },
    {
      label: "Schools Built",
      value: "50+",
      icon: "school",
      color: "#10B981",
      progress: 80,
      category: "impact" as const,
      sort_order: 2,
      is_published: true,
    },
    {
      label: "Districts Reached",
      value: "25+",
      icon: "map-pin",
      color: "#F59E0B",
      progress: 32,
      category: "home" as const,
      sort_order: 3,
      is_published: true,
    },
    {
      label: "Teachers Trained",
      value: "500+",
      icon: "graduation-cap",
      color: "#8B5CF6",
      progress: 75,
      category: "impact" as const,
      sort_order: 4,
      is_published: true,
    },
    {
      label: "Villages Served",
      value: "120+",
      icon: "users",
      color: "#06B6D4",
      progress: 60,
      category: "home" as const,
      sort_order: 5,
      is_published: true,
    },
    {
      label: "Scholarships Awarded",
      value: "3,000+",
      icon: "book-open",
      color: "#0B5F8A",
      progress: 88,
      category: "impact" as const,
      sort_order: 6,
      is_published: true,
    },
    {
      label: "Autism Children Supported",
      value: "847+",
      icon: "smile",
      color: "#EC4899",
      progress: 85,
      category: "home" as const,
      sort_order: 7,
      is_published: true,
    },
    {
      label: "Free Health Camps",
      value: "200+",
      icon: "stethoscope",
      color: "#10B981",
      progress: 90,
      category: "impact" as const,
      sort_order: 8,
      is_published: true,
    },
  ]

  const { data, error } = await supabase
    .from("impact_stats")
    .insert(defaultStats)
    .select()

  if (error) return { success: false, error: error.message }

  await supabase.from("activity_logs").insert({
    user_id: admin.id,
    action: "CREATE",
    entity_type: "impact_stat",
    new_data: { action: "SEED_DEFAULT_STATS", count: data.length },
  })

  revalidatePath("/admin/stats")
  revalidatePath("/")
  revalidatePath("/impact")

  return { success: true, count: data.length }
}

export async function createImpactStat(formData: FormData) {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "stats")) return { error: "Unauthorized" }

  const supabase = await createClient()

  const label = formData.get("label") as string
  const value = formData.get("value") as string
  const icon = formData.get("icon") as string
  const color = formData.get("color") as string
  const progress = Number.parseInt(formData.get("progress") as string) || null
  const category = (formData.get("category") as "home" | "impact") || "home"
  const isPublished = formData.get("isPublished") === "true"

  const { data: maxOrder } = await supabase
    .from("impact_stats")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()

  const sortOrder = (maxOrder?.sort_order || 0) + 1

  const { data, error } = await supabase
    .from("impact_stats")
    .insert({
      label,
      value,
      icon: icon || null,
      color: color || null,
      progress,
      category,
      is_published: isPublished,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return { error: error.message }

  await supabase.from("activity_logs").insert({
    user_id: admin.id,
    action: "CREATE",
    entity_type: "impact_stat",
    entity_id: data.id,
    new_data: { label, value },
  })

  revalidatePath("/admin/stats")
  revalidatePath("/")
  revalidatePath("/impact")
  return { success: true, data }
}

export async function updateImpactStat(id: string, formData: FormData) {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "stats")) return { error: "Unauthorized" }

  const supabase = await createClient()

  const label = formData.get("label") as string
  const value = formData.get("value") as string
  const icon = formData.get("icon") as string
  const color = formData.get("color") as string
  const progress = Number.parseInt(formData.get("progress") as string) || null
  const category = (formData.get("category") as "home" | "impact") || "home"
  const isPublished = formData.get("isPublished") === "true"

  const { error } = await supabase
    .from("impact_stats")
    .update({
      label,
      value,
      icon: icon || null,
      color: color || null,
      progress,
      category,
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) return { error: error.message }

  await supabase.from("activity_logs").insert({
    user_id: admin.id,
    action: "UPDATE",
    entity_type: "impact_stat",
    entity_id: id,
  })

  revalidatePath("/admin/stats")
  revalidatePath("/")
  revalidatePath("/impact")
  return { success: true }
}

export async function deleteImpactStat(id: string) {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "stats")) return { error: "Unauthorized" }

  const supabase = await createClient()
  const { error } = await supabase.from("impact_stats").delete().eq("id", id)

  if (error) return { error: error.message }

  await supabase.from("activity_logs").insert({
    user_id: admin.id,
    action: "DELETE",
    entity_type: "impact_stat",
    entity_id: id,
  })

  revalidatePath("/admin/stats")
  revalidatePath("/")
  revalidatePath("/impact")
  return { success: true }
}

