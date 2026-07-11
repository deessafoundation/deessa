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
      .from("event_email_templates")
      .select("*")
      .eq("event_id", id)
      .order("template_type")

    return NextResponse.json({ templates: data || [] })
  } catch (error) {
    console.error("Error fetching email templates:", error)
    return NextResponse.json({ templates: [] })
  }
}
