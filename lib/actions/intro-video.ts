"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import {
  INTRO_VIDEO_SETTINGS_KEY,
  type IntroVideoConfig,
} from "@/lib/types/intro-video"

/**
 * Server Action to update the intro video configuration in `site_settings`.
 * Logs changes to `activity_logs` and revalidates public and admin paths.
 */
export async function updateIntroVideoConfig(config: IntroVideoConfig) {
  const admin = await getCurrentAdmin()
  if (!admin) return { error: "Unauthorized" }
  if (admin.role !== "SUPER_ADMIN" && admin.role !== "ADMIN") {
    return { error: "Only admins can update intro video settings" }
  }

  const supabase = await createClient()

  // Check if setting row exists
  const { data: existing } = await supabase
    .from("site_settings")
    .select("id")
    .eq("key", INTRO_VIDEO_SETTINGS_KEY)
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
      .eq("key", INTRO_VIDEO_SETTINGS_KEY)
    error = result.error
  } else {
    const result = await supabase.from("site_settings").insert({
      key: INTRO_VIDEO_SETTINGS_KEY,
      value: config as unknown as Record<string, unknown>,
      updated_by: admin.id,
      updated_at: new Date().toISOString(),
    })
    error = result.error
  }

  if (error) {
    return { error: error.message }
  }

  // Audit trail
  await supabase.from("activity_logs").insert({
    user_id: admin.id,
    action: "UPDATE",
    entity_type: "site_setting",
    new_data: { key: INTRO_VIDEO_SETTINGS_KEY, config },
  })

  // Invalidate cache so changes reflect instantly
  revalidatePath("/")
  revalidatePath("/admin/settings")

  return { success: true }
}
