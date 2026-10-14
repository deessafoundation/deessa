import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const eventId = params.id

    // Use the database function to get available partners
    // This returns: global partners (created_context_type IS NULL)
    //            + partners created in this specific event
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
