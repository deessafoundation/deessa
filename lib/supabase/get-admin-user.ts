import { cache } from "react"
import { createClient } from "./server"
import type { AdminUser } from "@/lib/types/admin"

/**
 * Request-scoped cached admin user lookup.
 * Calling this multiple times in the same server request (e.g. in layout and page)
 * executes only a single roundtrip to Supabase.
 * Returns null if the user is unauthenticated, not an admin, or deactivated.
 */
export const getCachedAdminUser = cache(async (): Promise<AdminUser | null> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!adminUser || !adminUser.is_active) {
    return null
  }

  return adminUser as AdminUser
})
