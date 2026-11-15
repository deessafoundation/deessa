"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { getCurrentAdmin } from "./admin-auth"
import { sendAdminPasswordResetEmail } from "@/lib/email/auth-mailer"
import { checkRateLimit } from "@/lib/rate-limit"
import { logAdminActivity } from "@/lib/audit/audit-logger"

async function getSiteOrigin(): Promise<string> {
  try {
    const headerList = await headers()
    const host = headerList.get("x-forwarded-host") || headerList.get("host")
    const proto = headerList.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https")
    if (host) {
      return `${proto}://${host}`
    }
  } catch {
    // Fallback if called outside HTTP context
  }
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}
import {
  createAdminUserSchema,
  updateAdminUserSchema,
  type CreateAdminUserInput,
  type UpdateAdminUserInput,
} from "@/lib/validations/admin-users"
import type { AdminRole } from "@/lib/types/admin"

/**
 * Creates a new administrator account in Supabase Auth and admin_users table.
 * Requires SUPER_ADMIN permissions.
 */
export async function createAdminUser(
  input: CreateAdminUserInput | FormData
): Promise<{ success?: boolean; error?: string; userId?: string }> {
  try {
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin || currentAdmin.role !== "SUPER_ADMIN") {
      return { error: "Only super administrators can create new admin accounts." }
    }

    // Parse input from FormData or plain object
    let rawPayload: unknown
    if (input instanceof FormData) {
      rawPayload = {
        fullName: input.get("fullName") || input.get("full_name"),
        email: input.get("email"),
        password: input.get("password"),
        role: input.get("role"),
      }
    } else {
      rawPayload = input
    }

    const validation = createAdminUserSchema.safeParse(rawPayload)
    if (!validation.success) {
      const message = validation.error.issues.map((e: { message: string }) => e.message).join(", ")
      return { error: message }
    }

    const { fullName, email, password, role } = validation.data
    const supabase = await createClient()
    const supabaseAdmin = createServiceRoleClient()

    // 1. Check if email already registered in admin_users
    const { data: existingAdmin } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (existingAdmin) {
      return { error: `An administrator account with email ${email} already exists.` }
    }

    // 2. Create Auth user via service role
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    })

    if (authError || !authData.user) {
      return { error: authError?.message || "Failed to create authentication credentials." }
    }

    // 3. Insert record into admin_users table
    const { data: insertedAdmin, error: insertError } = await supabase
      .from("admin_users")
      .insert({
        user_id: authData.user.id,
        email,
        full_name: fullName,
        role,
        is_active: true,
      })
      .select("id")
      .single()

    if (insertError) {
      // Rollback auth user creation if admin_users insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return { error: insertError.message }
    }

    // 4. Audit logging
    void logAdminActivity({
      action: "ADMIN_USER_CREATED",
      domain: "SECURITY",
      entityType: "admin_users",
      entityId: insertedAdmin?.id,
      description: `Created administrator account for ${fullName} (${email}) with role ${role}`,
      newData: { email, full_name: fullName, role, is_active: true },
    })

    revalidatePath("/admin/users")
    return { success: true, userId: insertedAdmin?.id }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "An unexpected server error occurred.",
    }
  }
}

/**
 * Updates administrator metadata, system role, or active status.
 * Requires SUPER_ADMIN permissions. Prevents self-deactivation.
 */
export async function updateAdminUser(
  userId: string,
  data: UpdateAdminUserInput
): Promise<{ success?: boolean; error?: string }> {
  try {
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin || currentAdmin.role !== "SUPER_ADMIN") {
      return { error: "Only super administrators can modify user permissions." }
    }

    // Validate payload
    const validation = updateAdminUserSchema.safeParse(data)
    if (!validation.success) {
      const message = validation.error.issues.map((e: { message: string }) => e.message).join(", ")
      return { error: message }
    }

    const { role, is_active, fullName } = validation.data

    // Self-protection: Current admin cannot deactivate or demote themselves
    if (userId === currentAdmin.id) {
      if (is_active === false) {
        return { error: "You cannot deactivate your own administrator account." }
      }
      if (role && role !== "SUPER_ADMIN") {
        return { error: "You cannot remove your own Super Admin access level." }
      }
    }

    const supabase = await createClient()

    // Fetch existing user to build audit diff
    const { data: existingUser } = await supabase
      .from("admin_users")
      .select("id, user_id, email, full_name, role, is_active")
      .eq("id", userId)
      .single()

    if (!existingUser) {
      return { error: "Administrator account not found." }
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }
    if (role !== undefined) updates.role = role
    if (is_active !== undefined) updates.is_active = is_active
    if (fullName !== undefined) updates.full_name = fullName

    // Extinction Guard: Prevent demoting or deactivating the last active Super Admin
    if (
      existingUser.role === "SUPER_ADMIN" &&
      (is_active === false || (role !== undefined && role !== "SUPER_ADMIN"))
    ) {
      const { count: activeSuperAdminCount } = await supabase
        .from("admin_users")
        .select("id", { count: "exact", head: true })
        .eq("role", "SUPER_ADMIN")
        .eq("is_active", true)

      if ((activeSuperAdminCount ?? 0) <= 1) {
        return {
          error: "Operation denied: At least one active Super Administrator must remain in the system.",
        }
      }
    }

    const { error: updateError } = await supabase
      .from("admin_users")
      .update(updates)
      .eq("id", userId)

    if (updateError) {
      return { error: updateError.message }
    }

    // Immediately revoke active sessions if account was suspended
    if (is_active === false && existingUser.user_id) {
      try {
        const supabaseAdmin = createServiceRoleClient()
        await supabaseAdmin.auth.admin.signOut(existingUser.user_id)
      } catch (signOutErr) {
        console.warn("Failed to immediately revoke auth session:", signOutErr)
      }
    }

    // Sync role with Supabase Auth user metadata if service role client available
    if (role && existingUser.user_id) {
      try {
        const supabaseAdmin = createServiceRoleClient()
        await supabaseAdmin.auth.admin.updateUserById(existingUser.user_id, {
          user_metadata: { role, full_name: fullName || existingUser.full_name },
        })
      } catch (authErr) {
        console.warn("Failed to sync auth user metadata:", authErr)
      }
    }

    // Audit logging
    void logAdminActivity({
      action: "ADMIN_USER_UPDATED",
      domain: "SECURITY",
      entityType: "admin_users",
      entityId: userId,
      description: `Updated administrator account for ${existingUser.full_name} (${existingUser.email})`,
      oldData: {
        role: existingUser.role,
        is_active: existingUser.is_active,
        full_name: existingUser.full_name,
      },
      newData: updates,
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "An unexpected server error occurred.",
    }
  }
}

/**
 * Toggles an administrator account between active and suspended.
 */
export async function toggleAdminUserStatus(
  userId: string,
  isActive: boolean
): Promise<{ success?: boolean; error?: string }> {
  return updateAdminUser(userId, { is_active: isActive })
}

/**
 * Permanently deletes an administrator account from both database and Supabase Auth.
 * Requires SUPER_ADMIN permissions. Prevents self-deletion.
 */
export async function deleteAdminUser(
  userId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin || currentAdmin.role !== "SUPER_ADMIN") {
      return { error: "Only super administrators can delete admin accounts." }
    }

    // Cannot delete your own account
    if (userId === currentAdmin.id) {
      return { error: "You cannot delete your own account." }
    }

    const supabase = await createClient()

    // Fetch user details first
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id, user_id, email, full_name, role")
      .eq("id", userId)
      .single()

    if (!adminUser) {
      return { error: "Administrator account not found." }
    }

    // Extinction Guard: Prevent deleting the last active Super Admin
    if (adminUser.role === "SUPER_ADMIN") {
      const { count: activeSuperAdminCount } = await supabase
        .from("admin_users")
        .select("id", { count: "exact", head: true })
        .eq("role", "SUPER_ADMIN")
        .eq("is_active", true)

      if ((activeSuperAdminCount ?? 0) <= 1) {
        return {
          error: "Operation denied: Cannot delete the last active Super Administrator in the system.",
        }
      }
    }

    // 1. Delete from admin_users table
    const { error: dbError } = await supabase.from("admin_users").delete().eq("id", userId)
    if (dbError) {
      return { error: dbError.message }
    }

    // 2. Delete from Supabase Auth
    if (adminUser.user_id) {
      try {
        const supabaseAdmin = createServiceRoleClient()
        await supabaseAdmin.auth.admin.deleteUser(adminUser.user_id)
      } catch (authErr) {
        console.warn("Could not delete auth user:", authErr)
      }
    }

    // 3. Audit logging
    void logAdminActivity({
      action: "ADMIN_USER_DELETED",
      domain: "SECURITY",
      entityType: "admin_users",
      entityId: userId,
      description: `Permanently deleted administrator account for ${adminUser.full_name} (${adminUser.email})`,
      oldData: {
        email: adminUser.email,
        full_name: adminUser.full_name,
        role: adminUser.role,
      },
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "An unexpected server error occurred.",
    }
  }
}

/**
 * Resets an administrator's password.
 * Requires SUPER_ADMIN permissions.
 */
export async function resetAdminUserPassword(
  userId: string,
  newPassword: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin || currentAdmin.role !== "SUPER_ADMIN") {
      return { error: "Only super administrators can reset passwords." }
    }

    if (!newPassword || newPassword.length < 8) {
      return { error: "New password must be at least 8 characters long." }
    }

    const supabase = await createClient()
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("user_id, email, full_name")
      .eq("id", userId)
      .single()

    if (!adminUser || !adminUser.user_id) {
      return { error: "User authentication record not found." }
    }

    const supabaseAdmin = createServiceRoleClient()
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      adminUser.user_id,
      { password: newPassword }
    )

    if (updateError) {
      return { error: updateError.message }
    }

    void logAdminActivity({
      action: "ADMIN_PASSWORD_RESET",
      domain: "SECURITY",
      entityType: "admin_users",
      entityId: userId,
      description: `Reset password for administrator ${adminUser.email}`,
      newData: { email: adminUser.email },
    })

    return { success: true }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to reset password.",
    }
  }
}

export interface AdminActivityLogItem {
  id: string
  action: string
  entity_type: string
  entity_id?: string
  new_data?: Record<string, unknown>
  created_at: string
}

/**
 * Retrieves recent audit/activity log events related to a specific admin user.
 */
export async function getAdminUserActivityLogs(
  userId: string,
  limit = 8
): Promise<{ logs: AdminActivityLogItem[]; error?: string }> {
  try {
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin) {
      return { logs: [], error: "Unauthorized." }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("activity_logs")
      .select("id, action, entity_type, entity_id, new_data, created_at")
      .or(`user_id.eq.${userId},entity_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      return { logs: [], error: error.message }
    }

    return { logs: (data || []) as AdminActivityLogItem[] }
  } catch (err) {
    return {
      logs: [],
      error: err instanceof Error ? err.message : "Failed to load activity logs.",
    }
  }
}

/**
 * Generates a 1-click cryptographically signed password reset / recovery link via Supabase Auth Admin.
 * Requires SUPER_ADMIN permissions.
 */
export async function generateAdminPasswordResetLink(
  userId: string
): Promise<{ success?: boolean; link?: string; error?: string }> {
  try {
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin || currentAdmin.role !== "SUPER_ADMIN") {
      return { error: "Only super administrators can generate recovery links." }
    }

    const supabase = await createClient()
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id, email, full_name")
      .eq("id", userId)
      .single()

    if (!adminUser || !adminUser.email) {
      return { error: "Administrator account or email not found." }
    }

    const origin = await getSiteOrigin()
    const redirectTo = `${origin}/admin/reset-password`

    const supabaseAdmin = createServiceRoleClient()
    const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: adminUser.email,
      options: { redirectTo },
    })

    if (linkError || !data?.properties?.action_link) {
      return { error: linkError?.message || "Failed to generate recovery link." }
    }

    void logAdminActivity({
      action: "ADMIN_RESET_LINK_GENERATED",
      domain: "SECURITY",
      entityType: "admin_users",
      entityId: userId,
      description: `Generated password recovery link for ${adminUser.email}`,
      newData: { target_email: adminUser.email },
    })

    return { success: true, link: data.properties.action_link }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to generate recovery link.",
    }
  }
}

/**
 * Dispatches an automated, branded password reset email directly to an administrator.
 * Requires SUPER_ADMIN permissions.
 */
export async function sendAdminPasswordResetEmailAction(
  userId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin || currentAdmin.role !== "SUPER_ADMIN") {
      return { error: "Only super administrators can dispatch password reset emails." }
    }

    const supabase = await createClient()
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id, email, full_name")
      .eq("id", userId)
      .single()

    if (!adminUser || !adminUser.email) {
      return { error: "Administrator account or email not found." }
    }

    // Rate limiting: max 3 reset emails per target user per 15 minutes
    const rateLimit = await checkRateLimit({
      identifier: `admin-reset-email:${userId}`,
      maxAttempts: 3,
      windowMinutes: 15,
    })

    if (!rateLimit.allowed) {
      return {
        error: "Too many reset emails sent recently. Please wait a few minutes before trying again.",
      }
    }

    const origin = await getSiteOrigin()
    const redirectTo = `${origin}/admin/reset-password`

    const supabaseAdmin = createServiceRoleClient()
    const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: adminUser.email,
      options: { redirectTo },
    })

    if (linkError || !data?.properties?.action_link) {
      return { error: linkError?.message || "Failed to generate password reset link." }
    }

    // Dispatch branded email via nodemailer
    const emailResult = await sendAdminPasswordResetEmail({
      toEmail: adminUser.email,
      recipientName: adminUser.full_name || "Administrator",
      resetUrl: data.properties.action_link,
      requestedByAdminName: currentAdmin.full_name || undefined,
    })

    if (!emailResult.success) {
      return { error: `Failed to deliver email: ${emailResult.message}` }
    }

    // Audit logging
    void logAdminActivity({
      action: "ADMIN_RESET_EMAIL_DISPATCHED",
      domain: "SECURITY",
      entityType: "admin_users",
      entityId: userId,
      description: `Dispatched password reset email to ${adminUser.email}`,
      newData: { target_email: adminUser.email, recipient_name: adminUser.full_name },
    })

    return { success: true }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "An unexpected error occurred while dispatching reset email.",
    }
  }
}

/**
 * Performs batch operations across multiple administrator accounts.
 * Prevents self-modification on the active administrator's account.
 */
export async function bulkUpdateAdminUsers(
  userIds: string[],
  action: "activate" | "suspend" | "set_role",
  role?: AdminRole
): Promise<{ success?: boolean; count?: number; error?: string }> {
  try {
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin || currentAdmin.role !== "SUPER_ADMIN") {
      return { error: "Only super administrators can perform bulk user modifications." }
    }

    // Self-lockout prevention: filter out current logged-in admin
    const targetIds = userIds.filter((id) => id !== currentAdmin.id)
    if (targetIds.length === 0) {
      return { error: "No eligible user accounts selected for bulk action." }
    }

    const supabase = await createClient()

    // Fetch target user profiles to verify current roles and fetch auth user_ids
    const { data: targetAdmins } = await supabase
      .from("admin_users")
      .select("id, user_id, role, is_active")
      .in("id", targetIds)

    // Extinction Guard: Prevent suspending or demoting all active Super Admins
    if (action === "suspend" || (action === "set_role" && role !== "SUPER_ADMIN")) {
      const affectedSuperAdmins = (targetAdmins || []).filter(
        (u) => u.role === "SUPER_ADMIN" && u.is_active
      ).length

      if (affectedSuperAdmins > 0) {
        const { count: totalActiveSuperAdmins } = await supabase
          .from("admin_users")
          .select("id", { count: "exact", head: true })
          .eq("role", "SUPER_ADMIN")
          .eq("is_active", true)

        if ((totalActiveSuperAdmins ?? 0) - affectedSuperAdmins < 1) {
          return {
            error:
              "Operation denied: Bulk action would leave the system without an active Super Administrator.",
          }
        }
      }
    }

    if (action === "activate") {
      const { error } = await supabase
        .from("admin_users")
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .in("id", targetIds)

      if (error) return { error: error.message }
    } else if (action === "suspend") {
      const { error } = await supabase
        .from("admin_users")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .in("id", targetIds)

      if (error) return { error: error.message }

      // Immediately terminate active sessions for suspended users
      try {
        const supabaseAdmin = createServiceRoleClient()
        await Promise.all(
          (targetAdmins || [])
            .filter((u) => u.user_id)
            .map((u) => supabaseAdmin.auth.admin.signOut(u.user_id))
        )
      } catch (signOutErr) {
        console.warn("Failed to revoke sessions during bulk suspend:", signOutErr)
      }
    } else if (action === "set_role") {
      if (!role) {
        return { error: "A valid system role must be specified for bulk role assignment." }
      }
      const { error } = await supabase
        .from("admin_users")
        .update({ role, updated_at: new Date().toISOString() })
        .in("id", targetIds)

      if (error) return { error: error.message }

      // Synchronize assigned role into Supabase Auth user_metadata
      try {
        const supabaseAdmin = createServiceRoleClient()
        await Promise.all(
          (targetAdmins || [])
            .filter((u) => u.user_id)
            .map((u) =>
              supabaseAdmin.auth.admin.updateUserById(u.user_id, {
                user_metadata: { role },
              })
            )
        )
      } catch (metaErr) {
        console.warn("Failed to sync auth user metadata during bulk role update:", metaErr)
      }
    } else {
      return { error: "Invalid bulk action specified." }
    }

    // Record bulk action in activity logs
    void logAdminActivity({
      action: `ADMIN_USER_BULK_${action.toUpperCase()}`,
      domain: "SECURITY",
      entityType: "admin_users",
      entityId: "bulk",
      description: `Bulk ${action} executed on ${targetIds.length} administrator account(s)`,
      newData: {
        affected_count: targetIds.length,
        user_ids: targetIds,
        assigned_role: role || null,
      },
    })

    revalidatePath("/admin/users")
    return { success: true, count: targetIds.length }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to execute bulk operation.",
    }
  }
}

export interface SystemAuditLogItem {
  id: string
  action: string
  entity_type: string
  entity_id?: string
  actor_id?: string
  actor_name?: string
  actor_email?: string
  actor_role?: string
  domain?: string
  summary?: string
  diff?: Record<string, unknown>
  status?: string
  ip_address?: string
  user_agent?: string
  duration_ms?: number
  new_data?: Record<string, unknown>
  created_at: string
}

/**
 * Retrieves system-wide security and administrative audit logs across all admin users.
 */
function maskIpAddress(ip?: string): string | undefined {
  if (!ip) return undefined
  if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") return ip
  const parts = ip.split(".")
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`
  }
  return ip.slice(0, 8) + "..."
}

export async function getSystemAuditLogs(params?: {
  limit?: number
  action?: string
  search?: string
  domain?: string
}): Promise<{ logs: SystemAuditLogItem[]; error?: string }> {
  try {
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin) {
      return { logs: [], error: "Unauthorized." }
    }

    const currentRole = currentAdmin.role as AdminRole
    const isSuperAdmin = currentRole === "SUPER_ADMIN"
    const isAdmin = currentRole === "ADMIN"
    const isFinance = currentRole === "FINANCE"
    const isEditor = currentRole === "EDITOR"

    const currentUserId = currentAdmin.id
    const currentAuthUserId = currentAdmin.user_id

    const limit = params?.limit || 50
    const supabase = await createClient()

    let query = supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    // Approach 3: Database query scoping by role
    if (isEditor) {
      // Editor can only query their own actions
      query = query.or(`user_id.eq.${currentUserId},user_id.eq.${currentAuthUserId}`)
    } else if (isFinance) {
      // Finance can query DONATION domain or their own actions
      query = query.or(`domain.eq.DONATION,user_id.eq.${currentUserId},user_id.eq.${currentAuthUserId}`)
    }

    if (params?.action && params.action !== "ALL") {
      query = query.ilike("action", `%${params.action}%`)
    }

    const { data: logsData, error } = await query

    if (error) {
      return { logs: [], error: error.message }
    }

    // Look up actor profiles from admin_users
    const actorIds = Array.from(
      new Set((logsData || []).map((l: { user_id?: string }) => l.user_id).filter(Boolean))
    )

    let actorsMap = new Map<string, { full_name: string; email: string }>()
    if (actorIds.length > 0) {
      const { data: actors } = await supabase
        .from("admin_users")
        .select("id, full_name, email")
        .in("id", actorIds as string[])

      if (actors) {
        actorsMap = new Map(actors.map((a) => [a.id, { full_name: a.full_name, email: a.email }]))
      }
    }

    const mappedLogs: SystemAuditLogItem[] = (logsData || []).map((l: Record<string, unknown>) => {
      const userId = (l.user_id as string) || undefined
      const actor = userId ? actorsMap.get(userId) : undefined
      const meta = (l.new_data as Record<string, unknown>)?._audit_meta as Record<string, unknown> | undefined

      const isOwnLog =
        userId === currentUserId ||
        userId === currentAuthUserId ||
        (Boolean(l.actor_email) && l.actor_email === currentAdmin.email)

      const rawIp = (l.ip_address as string) || (meta?.ip_address as string) || undefined
      const ipAddress = isSuperAdmin || isOwnLog ? rawIp : maskIpAddress(rawIp)

      const rawUa = (l.user_agent as string) || (meta?.user_agent as string) || undefined
      const userAgent = isSuperAdmin || isOwnLog ? rawUa : rawUa ? "Redacted for privacy" : undefined

      return {
        id: String(l.id),
        action: String(l.action),
        entity_type: String(l.entity_type),
        entity_id: l.entity_id ? String(l.entity_id) : undefined,
        actor_id: userId,
        actor_name: actor?.full_name || undefined,
        actor_email: (l.actor_email as string) || (meta?.actor_email as string) || actor?.email || undefined,
        actor_role: (l.actor_role as string) || (meta?.actor_role as string) || undefined,
        domain: (l.domain as string) || (meta?.domain as string) || undefined,
        summary: (l.summary as string) || (meta?.summary as string) || undefined,
        diff: ((l.diff || meta?.diff) as Record<string, unknown>) || undefined,
        status: (l.status as string) || (meta?.status as string) || "SUCCESS",
        ip_address: ipAddress,
        user_agent: userAgent,
        duration_ms: typeof l.duration_ms === "number" ? l.duration_ms : typeof meta?.duration_ms === "number" ? meta.duration_ms : undefined,
        new_data: (l.new_data as Record<string, unknown>) || undefined,
        created_at: String(l.created_at),
      }
    })

    // Approach 3: Post-mapping filtering for sensitive peer events
    let filtered = mappedLogs.filter((l) => {
      if (isSuperAdmin) return true

      const isOwnLog =
        l.actor_id === currentUserId ||
        l.actor_id === currentAuthUserId ||
        (Boolean(l.actor_email) && l.actor_email === currentAdmin.email)

      if (isOwnLog) return true

      // If ADMIN: hide raw brute-force attacks / failed login investigations on peers
      if (isAdmin) {
        if (l.action === "ADMIN_LOGIN_FAILED" || l.action === "ADMIN_PASSWORD_RESET_REQUESTED") {
          return false
        }
        if (
          l.action === "ADMIN_USER_ROLE_CHANGED" ||
          l.action === "ADMIN_USER_DELETED" ||
          l.action === "INITIAL_SUPER_ADMIN_CREATED"
        ) {
          return false
        }
      }

      return true
    })

    if (params?.domain && params.domain !== "ALL") {
      const d = params.domain.toLowerCase()
      filtered = filtered.filter((l) => (l.domain || "").toLowerCase() === d)
    }

    // Filter by search if specified
    if (params?.search) {
      const q = params.search.toLowerCase().trim()
      filtered = filtered.filter(
        (l) =>
          l.action.toLowerCase().includes(q) ||
          l.entity_type.toLowerCase().includes(q) ||
          (l.summary && l.summary.toLowerCase().includes(q)) ||
          l.actor_name?.toLowerCase().includes(q) ||
          l.actor_email?.toLowerCase().includes(q) ||
          (l.new_data && JSON.stringify(l.new_data).toLowerCase().includes(q))
      )
    }

    return { logs: filtered }
  } catch (err) {
    return {
      logs: [],
      error: err instanceof Error ? err.message : "Failed to load audit logs.",
    }
  }
}


