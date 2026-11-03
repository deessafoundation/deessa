import { NextRequest, NextResponse } from "next/server"
import { verifyAdminApiRequest } from "@/lib/supabase/admin-auth-guard"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminApiRequest(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  if (!auth.success) return auth.response

  try {
    const params = await context.params
    const eventId = params.id
    const supabase = auth.supabase

    const { data: partners, error } = await supabase.rpc("get_available_partners_for_context", {
      p_context_type: "event",
      p_context_id: eventId,
    })

    if (error) {
      console.error("Error fetching available partners:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ partners: partners || [] })
  } catch (error) {
    console.error("Error fetching partners:", error)
    return NextResponse.json({ error: "Failed to fetch partners" }, { status: 500 })
  }
}
