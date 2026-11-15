"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import {
  SITE_TYPOGRAPHY_KEY,
  type TypographyConfig,
} from "@/lib/typography/types"
import { logAdminActivity } from "@/lib/audit/audit-logger"

/**
 * Server Action to update the typography configuration in `site_settings`.
 * Logs changes to `activity_logs` and revalidates public and admin paths.
 */
export async function updateTypographyConfig(config: TypographyConfig) {
  const admin = await getCurrentAdmin()
  if (!admin) return { error: "Unauthorized" }
  if (admin.role !== "SUPER_ADMIN" && admin.role !== "ADMIN") {
    return { error: "Only admins can update typography settings" }
  }

  const supabase = await createClient()

  // Check if setting row exists
  const { data: existing } = await supabase
    .from("site_settings")
    .select("id")
    .eq("key", SITE_TYPOGRAPHY_KEY)
    .maybeSingle()

  let error
  if (existing) {
    const result = await supabase
      .from("site_settings")
      .update({
        value: config as unknown as Record<string, unknown>,
        updated_by: admin.id,
        updated_at: new Date().toISOString(),
      })
      .eq("key", SITE_TYPOGRAPHY_KEY)
    error = result.error
  } else {
    const result = await supabase.from("site_settings").insert({
      key: SITE_TYPOGRAPHY_KEY,
      value: config as unknown as Record<string, unknown>,
      updated_by: admin.id,
      updated_at: new Date().toISOString(),
    })
    error = result.error
  }

  if (error) {
    return { error: error.message }
  }

  // Audit trail entry
  void logAdminActivity({
    action: "TYPOGRAPHY_SETTINGS_UPDATED",
    domain: "SETTINGS",
    entityType: "site_settings",
    entityId: SITE_TYPOGRAPHY_KEY,
    description: "Updated typography settings",
    newData: { key: SITE_TYPOGRAPHY_KEY, value: config },
  })

  // Purge relevant route caches
  revalidatePath("/")
  revalidatePath("/admin/settings")
  revalidatePath("/(public)", "layout")

  return { success: true }
}
