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

    const { data } = await supabase
      .from("event_agenda_items")
      .select("*")
      .eq("event_id", id)
      .order("day_number")
      .order("sort_order")

    return NextResponse.json({ items: data || [] })
  } catch (error) {
    console.error("Error fetching agenda:", error)
    return NextResponse.json({ items: [] })
  }
}
