import { NextResponse } from "next/server"
import { verifyAdminApiRequest } from "@/lib/supabase/admin-auth-guard"
import { createServiceRoleClient } from "@/lib/supabase/service"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminApiRequest(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params
    const supabase = createServiceRoleClient()

    // Get ALL schemas for this event, ordered by version descending
    const { data: allSchemas, error } = await supabase
      .from("event_form_schemas")
      .select("form_config, version, is_active")
      .eq("event_id", id)
      .order("version", { ascending: false })

    if (error) {
      console.error("Error fetching form schemas:", error)
      return NextResponse.json({ schema: null })
    }

    if (!allSchemas || allSchemas.length === 0) {
      return NextResponse.json({ schema: null })
    }

    // Find the latest schema with valid form_config
    // Prefer active schemas, but fall back to any schema with data
    const activeWithConfig = allSchemas.find((s) => s.is_active && s.form_config)
    const anyWithConfig = allSchemas.find((s) => s.form_config)

    const result = activeWithConfig || anyWithConfig

    return NextResponse.json({ schema: result?.form_config || null })
  } catch (error) {
    console.error("Error fetching form schema:", error)
    return NextResponse.json({ schema: null })
  }
}
