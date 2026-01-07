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
