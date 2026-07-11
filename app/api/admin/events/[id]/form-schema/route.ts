import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Debug: log all schemas found
    console.log("API: All schemas for event:", allSchemas.map(s => ({
      version: s.version,
      is_active: s.is_active,
      hasConfig: !!s.form_config,
      configVersion: s.form_config?.version
    })))

    // Find the latest schema with valid form_config
    // Prefer active schemas, but fall back to any schema with data
    const activeWithConfig = allSchemas.find((s) => s.is_active && s.form_config)
    const anyWithConfig = allSchemas.find((s) => s.form_config)

    const result = activeWithConfig || anyWithConfig

    console.log("API: Selected schema:", result ? `v${result.version} active=${result.is_active}` : "none")

    return NextResponse.json({ schema: result?.form_config || null })
  } catch (error) {
    console.error("Error fetching form schema:", error)
    return NextResponse.json({ schema: null })
  }
}
