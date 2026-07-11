import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching events:", error)
      return NextResponse.json({ events: [] }, { status: 500 })
    }

    return NextResponse.json({ events: events || [] })
  } catch (error) {
    console.error("Error in events API:", error)
    return NextResponse.json({ events: [] }, { status: 500 })
  }
}
