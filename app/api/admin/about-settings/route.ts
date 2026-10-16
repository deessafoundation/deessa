/**
 * API Route: Save About Page Settings
 *
 * POST /api/admin/about-settings
 * Saves the complete About page document, including retained legacy content.
 */

import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { hasPermission } from "@/lib/types/admin"
import { ABOUT_PAGE_SETTINGS_KEY, aboutPageSettingsSchema } from "@/lib/types/about-settings"

export async function POST(request: NextRequest) {
  try {
    const currentAdmin = await getCurrentAdmin()

    if (!currentAdmin) {
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 })
    }

    if (!hasPermission(currentAdmin.role, "settings")) {
      return NextResponse.json({ error: "You cannot edit site settings." }, { status: 403 })
    }
    if (request.headers.get("origin") !== request.nextUrl.origin) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 })
    }
    let body
    try {
      const text = await request.text()
      if (new TextEncoder().encode(text).byteLength > 1_000_000) return NextResponse.json({ error: "Content is too large to save." }, { status: 413 })
      body = JSON.parse(text)
    } catch {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 })
    }
    const parsed = aboutPageSettingsSchema.safeParse(body?.settings)
    if (!parsed.success) {
      return NextResponse.json({ error: "Please correct the content before saving.", issues: parsed.error.issues.map(issue => ({ path: issue.path.map(String), message: issue.message })) }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    const { error } = await supabase
      .from("site_settings")
      .upsert({
        key: ABOUT_PAGE_SETTINGS_KEY,
        value: parsed.data,
        updated_by: currentAdmin.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: "key" })

    if (error) {
      console.error("Error updating about_page_content:", error)
      return NextResponse.json({ error: "Could not save content. Your edits are still in the editor." }, { status: 500 })
    }
    // Persistence already succeeded: a refresh failure must not tell editors their save failed.
    try {
      revalidatePath("/about")
      revalidatePath("/admin/about")
    } catch (error) {
      console.error("About content saved, but refresh failed:", error)
      return NextResponse.json({ success: true, warning: "Saved, but the page refresh could not be requested. Reload the public page to check your changes." })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving about settings:", error)
    return NextResponse.json(
      { error: "Could not save content. Please try again." },
      { status: 500 }
    )
  }
}
