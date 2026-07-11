import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

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
