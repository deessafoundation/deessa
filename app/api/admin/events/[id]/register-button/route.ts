import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Fetch current register button config
    const { data: setting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "register_button")
      .single()

    const value = (setting?.value as Record<string, unknown>) || {}
    const config = {
      enabled: value.enabled === true,
      label: (value.label as string) || "Register",
      href: (value.href as string) || "/events",
      eventId: (value.eventId as string) || null,
      eventTitle: (value.eventTitle as string) || null,
    }

    // If there's an assigned event, verify it still exists and update href
    if (config.eventId) {
      const { data: event } = await supabase
        .from("events")
        .select("id, title, slug")
        .eq("id", config.eventId)
        .single()

      if (!event) {
        // Event was deleted, clear the config
        config.eventId = null
        config.eventTitle = null
        config.enabled = false
      } else {
        config.eventTitle = event.title
        config.href = `/events/${event.slug}`
      }
    }

    return NextResponse.json({ config })
  } catch (error) {
    console.error("Error fetching register button config:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
