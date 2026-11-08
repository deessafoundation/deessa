import { NextResponse } from "next/server"
import { createClient } from "./server"
import type { AdminRole, AdminUser } from "@/lib/types/admin"

export type AdminAuthGuardResult =
  | { success: true; adminUser: AdminUser; supabase: Awaited<ReturnType<typeof createClient>>; user: NonNullable<Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>["auth"]["getUser"]>>["data"]["user"]> }
  | { success: false; response: NextResponse }

/**
 * Robust, centralized security guard for administrative API route handlers.
 * Verifies that:
 * 1. An authenticated Supabase session exists.
 * 2. The user has an entry in admin_users.
 * 3. The account is active (is_active === true).
 * 4. (Optional) The admin has one of the allowed roles.
 */
export async function verifyAdminApiRequest(allowedRoles?: AdminRole[]): Promise<AdminAuthGuardResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      response: NextResponse.json({ error: "Unauthorized - Authentication required" }, { status: 401 }),
    }
  }

  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error || !adminUser || !adminUser.is_active) {
    return {
      success: false,
      response: NextResponse.json({ error: "Forbidden - Inactive or unauthorized admin account" }, { status: 403 }),
    }
  }

  if (allowedRoles && !allowedRoles.includes(adminUser.role as AdminRole)) {
    return {
      success: false,
      response: NextResponse.json({ error: "Forbidden - Insufficient role permissions" }, { status: 403 }),
    }
  }

  return {
    success: true,
    adminUser: adminUser as AdminUser,
    supabase,
    user,
  }
}
