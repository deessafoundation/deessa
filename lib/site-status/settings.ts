import { createClient } from "@/lib/supabase/server"
import { DEFAULT_SITE_UI_FLAGS, SITE_UI_FLAGS_KEY, type SiteUiFlags } from "./types"

/**
 * Site-wide UI visibility flags, read at request time from `site_settings`.
 *
 * These replaced the build-time `NEXT_PUBLIC_SITE_STATUS` env var, which was
 * inlined at build time — hiding the development notice or the Beta badge used
 * to require an env edit plus a redeploy. The flags below are the single
 * source of truth; admin controls live in Site Settings → Site tab
 * (`components/admin/settings/site-status-card.tsx`).
 *
 * Types and key constants live in `./types` so admin client components never
 * import this server-only module.
 */

export async function getSiteUiFlags(): Promise<SiteUiFlags> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", SITE_UI_FLAGS_KEY)
      .maybeSingle()

    if (error || !data?.value) {
      return DEFAULT_SITE_UI_FLAGS
    }

    const value = data.value as Record<string, unknown>
    return {
      devNotice: value.devNotice !== false,
      betaBadge: value.betaBadge !== false,
    }
  } catch {
    return DEFAULT_SITE_UI_FLAGS
  }
}
