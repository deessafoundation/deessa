import { createClient } from "@/lib/supabase/server"

export async function isSupportEnabled(): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "support_enabled")
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching support status:", error)
      return true // Default to enabled on error
    }

    // Default to true if not set
    return data?.value === true || data?.value === "true" || !data
  } catch (error) {
    console.error("Error checking support status:", error)
    return true // Default to enabled on error
  }
}

export interface RegisterButtonConfig {
  enabled: boolean
  label: string
  href: string
  eventId: string | null
  eventTitle: string | null
}

export async function getRegisterButtonConfig(): Promise<RegisterButtonConfig> {
  const defaultConfig: RegisterButtonConfig = {
    enabled: true,
    label: "Register",
    href: "/conference/register",
    eventId: null,
    eventTitle: null,
  }

  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "register_button")
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching register button config:", error)
      return defaultConfig
    }

    if (!data?.value) return defaultConfig

    const value = data.value as Record<string, unknown>
    const config: RegisterButtonConfig = {
      enabled: value.enabled !== false,
      label: (value.label as string) || "Register",
      href: (value.href as string) || "/conference/register",
      eventId: (value.eventId as string) || null,
      eventTitle: (value.eventTitle as string) || null,
    }

    // If an event is assigned, fetch its slug to build the correct href
    if (config.eventId) {
      const { data: event } = await supabase
        .from("events")
        .select("id, title, slug")
        .eq("id", config.eventId)
        .single()

      if (!event) {
        // Event was deleted, clear the config
        return { ...defaultConfig, enabled: false, eventId: null, eventTitle: null }
      }

      config.eventTitle = event.title
      config.href = `/events/${event.slug}`
    }

    return config
  } catch (error) {
    console.error("Error fetching register button config:", error)
    return defaultConfig
  }
}
