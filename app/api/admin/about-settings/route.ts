/**
 * API Route: Save About Page Settings
 *
 * POST /api/admin/about-settings
 * Saves the About page's Hero, Who We Are intro, and How We Do It content.
 */

import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { ABOUT_PAGE_SETTINGS_KEY } from "@/lib/types/about-settings"

export async function POST(request: NextRequest) {
  try {
    const currentAdmin = await getCurrentAdmin()

    if (!currentAdmin) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 })
    }

    if (!["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(currentAdmin.role)) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    const { settings } = await request.json()

    if (!settings) {
      return NextResponse.json({ error: "Settings are required" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    const { error } = await supabase
      .from("site_settings")
      .update({
        value: settings,
        updated_by: currentAdmin.id,
        updated_at: new Date().toISOString(),
      })
      .eq("key", ABOUT_PAGE_SETTINGS_KEY)

    if (error) {
      console.error("Error updating about_page_content:", error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving about settings:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save settings" },
      { status: 500 }
    )
  }
}
