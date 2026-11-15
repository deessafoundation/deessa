"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getCurrentAdmin } from "./admin-auth"
import { validateSetting } from "@/lib/validations/settings"
import { logAdminActivity } from "@/lib/audit/audit-logger"

export async function getSiteSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("site_settings").select("*").order("key", { ascending: true })

  if (error) throw error
  return data
}

export async function getSiteSetting(key: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from("site_settings").select("*").eq("key", key).single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

export async function updateSiteSetting(key: string, value: Record<string, unknown> | unknown) {
  const admin = await getCurrentAdmin()
  if (!admin) return { error: "Unauthorized" }
  if (admin.role !== "SUPER_ADMIN" && admin.role !== "ADMIN") {
    return { error: "Only admins can update site settings" }
  }

  // Validate value against schema if schema exists
  const validation = validateSetting(key, value)
  if (!validation.success) {
    return { error: validation.error }
  }
  const payloadToSave = validation.data

  const supabase = await createClient()

  // Check if setting exists
  const { data: existing } = await supabase.from("site_settings").select("id, value").eq("key", key).single()

  let error
  if (existing) {
    const result = await supabase.from("site_settings").update({ value: payloadToSave, updated_by: admin.id }).eq("key", key)
    error = result.error
  } else {
    const result = await supabase.from("site_settings").insert({ key, value: payloadToSave, updated_by: admin.id })
    error = result.error
  }

  if (error) return { error: error.message }

  await logAdminActivity({
    actorId: admin.id,
    actorEmail: admin.email,
    actorRole: admin.role,
    action: "SETTING_UPDATED",
    domain: "SETTINGS",
    entityType: "site_settings",
    entityId: key,
    summary: `Admin updated site setting "${key}"`,
    oldData: existing?.value ? (existing.value as Record<string, unknown>) : null,
    newData: payloadToSave as Record<string, unknown>,
  })

  revalidatePath("/admin/settings")
  revalidatePath("/")
  return { success: true }
}

export async function deleteSiteSetting(key: string) {
  const admin = await getCurrentAdmin()
  if (!admin) return { error: "Unauthorized" }
  if (admin.role !== "SUPER_ADMIN") {
    return { error: "Only super admins can delete site settings" }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("site_settings").delete().eq("key", key)

  if (error) return { error: error.message }

  await logAdminActivity({
    actorId: admin.id,
    actorEmail: admin.email,
    actorRole: admin.role,
    action: "SETTING_DELETED",
    domain: "SETTINGS",
    entityType: "site_settings",
    entityId: key,
    summary: `Admin deleted site setting "${key}"`,
    oldData: { key },
  })

  revalidatePath("/admin/settings")
  return { success: true }
}

// Helper to get all settings as a key-value object
export async function getAllSettingsAsObject() {
  const settings = await getSiteSettings()
  const obj: Record<string, unknown> = {}
  settings?.forEach((s) => {
    obj[s.key] = s.value
  })
  return obj
}

export interface RegisterButtonSaveInput {
  enabled: boolean
  label: string
  href: string
  eventId: string | null
  eventTitle: string | null
}

export async function saveRegisterButtonConfig(config: RegisterButtonSaveInput) {
  const admin = await getCurrentAdmin()
  if (!admin) return { error: "Unauthorized" }
  if (admin.role !== "SUPER_ADMIN" && admin.role !== "ADMIN") {
    return { error: "Only admins can update register button config" }
  }

  const supabase = await createClient()

  // If enabling, check if another event already has it enabled
  if (config.enabled && config.eventId) {
    const { data: existing } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "register_button")
      .single()

    if (existing?.value) {
      const value = existing.value as Record<string, unknown>
      const currentEventId = value.eventId as string | null
      const currentEnabled = value.enabled as boolean

      // If another event is already assigned and enabled, block
      if (currentEnabled && currentEventId && currentEventId !== config.eventId) {
        // Fetch the title of the currently assigned event
        const { data: currentEvent } = await supabase
          .from("events")
          .select("title")
          .eq("id", currentEventId)
          .single()

        return {
          error: `Another event "${currentEvent?.title || currentEventId}" is already assigned as the register button target. Please disable it first before assigning this event.`,
          conflictingEventId: currentEventId,
          conflictingEventTitle: currentEvent?.title || null,
        }
      }
    }
  }

  const value = {
    enabled: config.enabled,
    label: config.label || "Register",
    href: config.href || "/events",
    eventId: config.eventId,
    eventTitle: config.eventTitle,
  }

  const { data: existing } = await supabase.from("site_settings").select("id").eq("key", "register_button").single()

  let error
  if (existing) {
    const result = await supabase.from("site_settings").update({ value, updated_by: admin.id }).eq("key", "register_button")
    error = result.error
  } else {
    const result = await supabase.from("site_settings").insert({ key: "register_button", value, updated_by: admin.id })
    error = result.error
  }

  if (error) return { error: error.message }

  await logAdminActivity({
    actorId: admin.id,
    actorEmail: admin.email,
    actorRole: admin.role,
    action: "REGISTER_BUTTON_CONFIG_UPDATED",
    domain: "SETTINGS",
    entityType: "site_settings",
    entityId: "register_button",
    summary: `Admin updated registration button config (enabled: ${config.enabled})`,
    newData: value,
  })

  revalidatePath("/admin/events")
  revalidatePath("/")
  return { success: true }
}
