import { NextResponse } from "next/server"
import { verifyAdminApiRequest } from "@/lib/supabase/admin-auth-guard"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminApiRequest(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params
    const supabase = auth.supabase

    const { data: ticketTypes, error } = await supabase
      .from("event_ticket_types")
      .select("*")
      .eq("event_id", id)
      .order("sort_order")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ticketTypes: ticketTypes || [] })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}
