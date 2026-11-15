import { NextResponse } from "next/server"
import { verifyAdminApiRequest } from "@/lib/supabase/admin-auth-guard"
import { logAdminActivity } from "@/lib/audit/audit-logger"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminApiRequest(["SUPER_ADMIN", "ADMIN"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params
    const supabase = auth.supabase

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminApiRequest(["SUPER_ADMIN", "ADMIN"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params
    const body = await request.json()
    const { enabled, label } = body

    const supabase = auth.supabase

    // 1. If enabling, verify this event exists
    let eventTitle: string | null = null
    let eventHref = "/events"
    if (enabled) {
      const { data: event, error: eventErr } = await supabase
        .from("events")
        .select("id, title, slug, status")
        .eq("id", id)
        .single()

      if (eventErr || !event) {
        return NextResponse.json({ error: "Target event does not exist" }, { status: 404 })
      }
      eventTitle = event.title
      eventHref = `/events/${event.slug || event.id}`
    }

    // 2. Fetch current setting
    const { data: currentSetting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "register_button")
      .maybeSingle()

    const currentVal = (currentSetting?.value as Record<string, unknown>) || {}

    // Conflict check: if another event is assigned and still enabled
    if (enabled && currentVal.enabled && currentVal.eventId && currentVal.eventId !== id) {
      return NextResponse.json(
        { error: `Register button is already assigned to "${currentVal.eventTitle}". Disable it first.` },
        { status: 409 }
      )
    }

    const newConfig = {
      enabled: Boolean(enabled),
      label: typeof label === "string" && label.trim() ? label.trim() : (currentVal.label as string) || "Register",
      href: enabled ? eventHref : (currentVal.href as string) || "/events",
      eventId: enabled ? id : null,
      eventTitle: enabled ? eventTitle : null,
      updated_at: new Date().toISOString(),
    }

    // 3. Upsert into site_settings
    const { error: upsertErr } = await supabase
      .from("site_settings")
      .upsert(
        {
          key: "register_button",
          value: newConfig,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      )

    if (upsertErr) {
      return NextResponse.json({ error: upsertErr.message }, { status: 500 })
    }

    // 4. Audit log
    await logAdminActivity({
      actorId: auth.adminUser.id,
      actorEmail: auth.adminUser.email,
      action: "EVENT_REGISTER_BUTTON_CONFIG_SAVED",
      domain: "EVENT",
      entityType: "site_settings",
      entityId: "register_button",
      summary: `Admin ${enabled ? "assigned" : "cleared"} navbar register button for event ${id}`,
      oldData: currentVal,
      newData: newConfig,
    })

    return NextResponse.json({ success: true, config: newConfig })
  } catch (error) {
    console.error("Error updating register button config:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
