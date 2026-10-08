import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { hasPermission } from "@/lib/types/admin"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { WHAT_WE_DO_SETTINGS_KEY, whatWeDoSettingsSchema } from "@/lib/types/what-we-do-settings"

export async function POST(request: NextRequest) {
  try {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: "Please sign in." }, { status: 401 })
  if (!hasPermission(admin.role, "settings")) return NextResponse.json({ error: "You cannot edit site settings." }, { status: 403 })
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 })
  let body
  try { body = await request.json() } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }) }
  const parsed = whatWeDoSettingsSchema.safeParse(body?.settings)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues.map(issue => `${issue.path.join(" → ")}: ${issue.message}`).join("; ") }, { status: 400 })
  const { error } = await createServiceRoleClient().from("site_settings").upsert({
    key: WHAT_WE_DO_SETTINGS_KEY, value: parsed.data, updated_by: admin.id, updated_at: new Date().toISOString(),
  }, { onConflict: "key" })
  if (error) return NextResponse.json({ error: "Could not save content. Your changes are still in the editor." }, { status: 500 })
  revalidatePath("/whatwedo")
  for (const slug of Object.keys(parsed.data.areas)) revalidatePath(`/whatwedo/${slug}`)
  revalidatePath("/admin/what-we-do")
  return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Could not save content. Please try again." }, { status: 500 })
  }
}
