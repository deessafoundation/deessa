"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getCurrentAdmin } from "./admin-auth"
import { hasPermission } from "@/lib/types/admin"
import { partnerInputSchema } from "@/lib/types/partner-input"
import type { Partner, PartnerType, ContextType } from "@/lib/types/partners"
import { logAdminActivity } from "@/lib/audit/audit-logger"

export interface PartnerEventLink {
  event_id: string
  event_title: string
  event_slug: string
  category_key: string
  category_label: string
}

export interface EventOption {
  id: string
  title: string
  slug: string
  partner_count: number
}

export interface PartnerWithUsage extends Partner {
  usage_count?: number
  context_types?: string[]
  event_links?: PartnerEventLink[]
}

export interface SavePartnerInput {
  id?: string
  name: string
  type: PartnerType
  logo?: string | null
  logo_storage_path?: string | null
  website?: string | null
  description?: string | null
  is_published?: boolean
  sort_order?: number
  created_context_type?: ContextType | null
  created_context_id?: string | null
  category_key?: string | null
}

function partnerValues(formData: FormData) {
  const isPublishedRaw = formData.get("isPublished") ?? formData.get("is_published")
  const parsed = partnerInputSchema.safeParse({
    name: formData.get("name") ?? "",
    type: formData.get("type") ?? "",
    logo: formData.get("logo") ?? "",
    website: formData.get("website") ?? "",
    description: formData.get("description") ?? "",
    is_published: isPublishedRaw === "true" || isPublishedRaw === "on",
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message } as const
  const logoStoragePath = (formData.get("logo_storage_path") as string) || null
  return {
    data: {
      ...parsed.data,
      logo: parsed.data.logo || null,
      website: parsed.data.website || null,
      description: parsed.data.description || null,
      ...(logoStoragePath ? { logo_storage_path: logoStoragePath } : {}),
    },
  } as const
}

async function logPartner(supabase: Awaited<ReturnType<typeof createClient>>, row: Record<string, unknown>) {
  try {
    await logAdminActivity({
      action: `PARTNER_${String(row.action || "MUTATION").toUpperCase()}`,
      domain: "CONTENT",
      entityType: "partner",
      entityId: String(row.entity_id || "partner"),
      description: `Partner ${String(row.action)}: ${row.entity_id}`,
      newData: (row.new_data as Record<string, unknown>) || undefined,
    })
  } catch (error) {
    console.error("Partner saved; activity log failed", error)
    return "The partner change was saved, but its activity log could not be recorded."
  }
}

function partnerFailure(error: { message: string; code?: string }, action: string) {
  console.error(`Partner ${action} failed`, error)
  return {
    error:
      error.code === "PGRST116"
        ? "This partner no longer exists. Refresh the list."
        : `Could not ${action} the partner. Please try again.`,
  }
}

function refreshPartnerPages() {
  try {
    revalidatePath("/admin/about")
    revalidatePath("/admin/partners")
    revalidatePath("/admin/events")
    revalidatePath("/")
  } catch {
    return "Your change was saved. Refresh the page to see the latest partners."
  }
}

export async function getPartners(): Promise<PartnerWithUsage[]> {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "partners")) throw new Error("Unauthorized")
  const supabase = await createClient()

  const [partnersRes, linksRes, eventsRes, categoriesRes] = await Promise.all([
    supabase.from("partners").select("*").order("sort_order", { ascending: true }),
    supabase.from("context_partners").select("id, partner_id, context_type, context_id, category_key"),
    supabase.from("events").select("id, title, slug"),
    supabase.from("partner_categories").select("context_id, category_key, category_label"),
  ])

  if (partnersRes.error) {
    console.error("Partner list load failed", partnersRes.error)
    throw new Error("Could not load partners. Please try again.")
  }

  // Lookup maps
  const eventsMap = new Map<string, { title: string; slug: string }>()
  if (eventsRes.data) {
    eventsRes.data.forEach((ev) => {
      eventsMap.set(ev.id, { title: ev.title, slug: ev.slug })
    })
  }

  const categoryLabelsMap = new Map<string, string>()
  if (categoriesRes.data) {
    categoriesRes.data.forEach((cat) => {
      if (cat.context_id) {
        categoryLabelsMap.set(`${cat.context_id}:${cat.category_key}`, cat.category_label)
      }
      categoryLabelsMap.set(cat.category_key, cat.category_label)
    })
  }

  const linksByPartner: Record<string, { contextTypes: string[]; eventLinks: PartnerEventLink[] }> = {}

  if (linksRes.data) {
    linksRes.data.forEach((link) => {
      if (!linksByPartner[link.partner_id]) {
        linksByPartner[link.partner_id] = { contextTypes: [], eventLinks: [] }
      }
      const entry = linksByPartner[link.partner_id]
      if (link.context_type && !entry.contextTypes.includes(link.context_type)) {
        entry.contextTypes.push(link.context_type)
      }

      if (link.context_type === "event" && link.context_id) {
        const ev = eventsMap.get(link.context_id)
        const catLabel =
          categoryLabelsMap.get(`${link.context_id}:${link.category_key}`) ||
          categoryLabelsMap.get(link.category_key) ||
          (link.category_key
            ? link.category_key.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
            : "")

        // Avoid duplicate event entries for the same partner
        const alreadyLinked = entry.eventLinks.some(
          (l) => l.event_id === link.context_id && l.category_key === link.category_key
        )
        if (!alreadyLinked) {
          entry.eventLinks.push({
            event_id: link.context_id,
            event_title: ev?.title || "Event",
            event_slug: ev?.slug || "",
            category_key: link.category_key,
            category_label: catLabel,
          })
        }
      }
    })
  }

  return (partnersRes.data || []).map((p) => {
    const entry = linksByPartner[p.id] || { contextTypes: [], eventLinks: [] }
    const eventLinks = [...entry.eventLinks]

    // If partner was created specifically for an event but has no link row yet, attach its origin event
    if (p.created_context_type === "event" && p.created_context_id) {
      const alreadyLinked = eventLinks.some((l) => l.event_id === p.created_context_id)
      if (!alreadyLinked) {
        const ev = eventsMap.get(p.created_context_id)
        eventLinks.push({
          event_id: p.created_context_id,
          event_title: ev?.title || "Event",
          event_slug: ev?.slug || "",
          category_key: "partner",
          category_label: "Event Partner",
        })
      }
    }

    return {
      ...p,
      usage_count: entry.contextTypes.length + eventLinks.length,
      context_types: entry.contextTypes,
      event_links: eventLinks,
    }
  }) as PartnerWithUsage[]
}

export async function getPartnerEvents(): Promise<EventOption[]> {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "partners")) throw new Error("Unauthorized")
  const supabase = await createClient()

  const [eventsRes, linksRes, partnersRes] = await Promise.all([
    supabase.from("events").select("id, title, slug").order("created_at", { ascending: false }),
    supabase.from("context_partners").select("context_id, partner_id").eq("context_type", "event"),
    supabase.from("partners").select("id, created_context_id").eq("created_context_type", "event"),
  ])

  if (eventsRes.error) {
    console.error("Failed to load events for partners directory", eventsRes.error)
    return []
  }

  const partnerSetByEvent: Record<string, Set<string>> = {}
  eventsRes.data.forEach((ev) => {
    partnerSetByEvent[ev.id] = new Set()
  })

  linksRes.data?.forEach((link) => {
    if (link.context_id && partnerSetByEvent[link.context_id]) {
      partnerSetByEvent[link.context_id].add(link.partner_id)
    }
  })

  partnersRes.data?.forEach((p) => {
    if (p.created_context_id && partnerSetByEvent[p.created_context_id]) {
      partnerSetByEvent[p.created_context_id].add(p.id)
    }
  })

  return eventsRes.data.map((ev) => ({
    id: ev.id,
    title: ev.title,
    slug: ev.slug,
    partner_count: partnerSetByEvent[ev.id]?.size || 0,
  }))
}

export async function getPartner(id: string): Promise<Partner | null> {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "partners")) throw new Error("Unauthorized")
  const supabase = await createClient()
  const { data, error } = await supabase.from("partners").select("*").eq("id", id).single()

  if (error) {
    console.error("Partner load failed", error)
    throw new Error("Could not load this partner. Please try again.")
  }
  return data as Partner
}

export async function togglePartnerPublishedAction(id: string, is_published: boolean) {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "partners")) return { success: false, error: "Unauthorized" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("partners")
    .update({ is_published, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  await logPartner(supabase, {
    user_id: admin.id,
    action: "UPDATE",
    entity_type: "partner",
    entity_id: id,
    new_data: { is_published },
  })

  refreshPartnerPages()
  return { success: true }
}

export async function promotePartnerToGlobalAction(id: string) {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "partners")) return { success: false, error: "Unauthorized" }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("partners")
    .update({
      created_context_type: null,
      created_context_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Promote partner to global failed", error)
    return { success: false, error: error.message }
  }

  await logPartner(supabase, {
    user_id: admin.id,
    action: "UPDATE",
    entity_type: "partner",
    entity_id: id,
    new_data: { promoted_to_global: true, name: data.name },
  })

  refreshPartnerPages()
  return { success: true, data: data as Partner }
}

export async function savePartnerAction(input: SavePartnerInput) {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "partners")) return { success: false, error: "Unauthorized" }

  const supabase = await createClient()

  // Validate using schema
  const parsed = partnerInputSchema.safeParse({
    name: input.name,
    type: input.type,
    logo: input.logo ?? "",
    website: input.website ?? "",
    description: input.description ?? "",
    is_published: input.is_published ?? true,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed" }
  }

  const payload: Record<string, unknown> = {
    name: parsed.data.name,
    type: parsed.data.type,
    logo: parsed.data.logo || null,
    website: parsed.data.website || null,
    description: parsed.data.description || null,
    is_published: parsed.data.is_published,
    ...(input.logo_storage_path ? { logo_storage_path: input.logo_storage_path } : {}),
    updated_at: new Date().toISOString(),
  }

  if (input.created_context_type !== undefined) {
    payload.created_context_type = input.created_context_type
  }
  if (input.created_context_id !== undefined) {
    payload.created_context_id = input.created_context_id
  }

  let savedPartner: Partner

  if (input.id) {
    // Update existing partner
    const { data, error } = await supabase
      .from("partners")
      .update(payload)
      .eq("id", input.id)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    await logPartner(supabase, {
      user_id: admin.id,
      action: "UPDATE",
      entity_type: "partner",
      entity_id: input.id,
      new_data: { name: payload.name, type: payload.type },
    })

    savedPartner = data as Partner
  } else {
    // Insert new partner
    const { data: maxOrder } = await supabase
      .from("partners")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle()

    const sortOrder = (maxOrder?.sort_order || 0) + 1

    const { data, error } = await supabase
      .from("partners")
      .insert({
        ...payload,
        sort_order: sortOrder,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    await logPartner(supabase, {
      user_id: admin.id,
      action: "CREATE",
      entity_type: "partner",
      entity_id: data.id,
      new_data: { name: payload.name, type: payload.type },
    })

    savedPartner = data as Partner
  }

  // Synchronize with context_partners table if attached to an event
  if (input.created_context_type === "event" && input.created_context_id && input.category_key) {
    try {
      const { data: existingLink } = await supabase
        .from("context_partners")
        .select("id, category_key")
        .eq("partner_id", savedPartner.id)
        .eq("context_type", "event")
        .eq("context_id", input.created_context_id)
        .maybeSingle()

      if (existingLink) {
        if (existingLink.category_key !== input.category_key) {
          await supabase
            .from("context_partners")
            .update({
              category_key: input.category_key,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingLink.id)
        }
      } else {
        const { count } = await supabase
          .from("context_partners")
          .select("id", { count: "exact", head: true })
          .eq("context_id", input.created_context_id)
          .eq("category_key", input.category_key)

        await supabase.from("context_partners").insert({
          context_type: "event",
          context_id: input.created_context_id,
          partner_id: savedPartner.id,
          category_key: input.category_key,
          display_order: count || 0,
          is_visible: input.is_published ?? true,
        })
      }
    } catch (syncErr) {
      console.warn("Context partner link sync warning:", syncErr)
    }
  }

  refreshPartnerPages()
  return { success: true, data: savedPartner }
}

export async function getEventCategoriesAction(eventId?: string) {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "partners")) return []
  const supabase = await createClient()

  let query = supabase.from("partner_categories").select("*").eq("context_type", "event")
  if (eventId) {
    query = query.eq("context_id", eventId)
  }
  const { data } = await query.order("display_order", { ascending: true })
  return data || []
}

export async function createPartner(formData: FormData) {
  const admin = await getCurrentAdmin()
  if (!admin || !hasPermission(admin.role, "partners")) return { error: "Unauthorized" }

  const supabase = await createClient()

  const values = partnerValues(formData)
  if ("error" in values) return { error: values.error }
  const { name, type } = values.data

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
