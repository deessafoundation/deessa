import { NextResponse } from "next/server"
import { verifyAdminApiRequest } from "@/lib/supabase/admin-auth-guard"

export async function GET() {
  const auth = await verifyAdminApiRequest(["SUPER_ADMIN", "ADMIN"])
  if (!auth.success) return auth.response

  try {
    const { data, error } = await auth.supabase
      .from("site_settings")
      .select("value")
      .eq("key", "support_enabled")
      .single()

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Default to true if not set
    const isEnabled = data?.value === true || data?.value === "true" || !data

    return NextResponse.json({ enabled: isEnabled })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch support status" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await verifyAdminApiRequest(["SUPER_ADMIN", "ADMIN"])
  if (!auth.success) return auth.response

  try {
    const supabase = auth.supabase
    const { enabled } = await request.json()

    // Check if setting exists
    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .eq("key", "support_enabled")
      .single()

    if (existing) {
      // Update existing setting - only include value
      const { error } = await supabase
        .from("site_settings")
        .update({ value: enabled })
        .eq("key", "support_enabled")

      if (error) {
        console.error("Update error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      // Insert new setting - only include key and value
      const { error } = await supabase
        .from("site_settings")
        .insert({ key: "support_enabled", value: enabled })

      if (error) {
        console.error("Insert error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, enabled })
  } catch (error) {
    console.error("POST error:", error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to update support status"
    }, { status: 500 })
  }
}
