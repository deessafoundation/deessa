"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { getCurrentAdmin } from "./admin-auth"
import { sendAdminPasswordResetEmail } from "@/lib/email/auth-mailer"
import { checkRateLimit } from "@/lib/rate-limit"

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
      const message = validation.error.errors.map((e) => e.message).join(", ")
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
    await supabase.from("activity_logs").insert({
      user_id: currentAdmin.id,
      action: "CREATE",
      entity_type: "admin_user",
      entity_id: insertedAdmin?.id,
      new_data: { email, full_name: fullName, role, is_active: true },
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
      const message = validation.error.errors.map((e) => e.message).join(", ")
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
    await supabase.from("activity_logs").insert({
      user_id: currentAdmin.id,
      action: "UPDATE",
      entity_type: "admin_user",
      entity_id: userId,
      new_data: {
        updates,
        previous_data: {
          role: existingUser.role,
          is_active: existingUser.is_active,
          full_name: existingUser.full_name,
        },
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
    await supabase.from("activity_logs").insert({
      user_id: currentAdmin.id,
      action: "DELETE",
      entity_type: "admin_user",
      entity_id: userId,
      new_data: {
        deleted_user: {
          email: adminUser.email,
          full_name: adminUser.full_name,
          role: adminUser.role,
        },
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

    await supabase.from("activity_logs").insert({
      user_id: currentAdmin.id,
      action: "UPDATE",
      entity_type: "admin_user",
      entity_id: userId,
      new_data: { action: "PASSWORD_RESET", email: adminUser.email },
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

    await supabase.from("activity_logs").insert({
      user_id: currentAdmin.id,
      action: "GENERATE_RESET_LINK",
      entity_type: "admin_user",
      entity_id: userId,
      new_data: { target_email: adminUser.email },
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
    await supabase.from("activity_logs").insert({
      user_id: currentAdmin.id,
      action: "SEND_RESET_EMAIL",
      entity_type: "admin_user",
      entity_id: userId,
      new_data: { target_email: adminUser.email, recipient_name: adminUser.full_name },
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
    await supabase.from("activity_logs").insert({
      user_id: currentAdmin.id,
      action: `BULK_${action.toUpperCase()}`,
      entity_type: "admin_user",
      new_data: {
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
  new_data?: Record<string, unknown>
  created_at: string
}

/**
 * Retrieves system-wide security and administrative audit logs across all admin users.
 */
export async function getSystemAuditLogs(params?: {
  limit?: number
  action?: string
  search?: string
}): Promise<{ logs: SystemAuditLogItem[]; error?: string }> {
  try {
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin) {
      return { logs: [], error: "Unauthorized." }
    }

    const limit = params?.limit || 50
    const supabase = await createClient()

    let query = supabase
      .from("activity_logs")
      .select("id, action, entity_type, entity_id, user_id, new_data, created_at")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (params?.action && params.action !== "ALL") {
      query = query.ilike("action", `%${params.action}%`)
    }

    const { data: logsData, error } = await query

    if (error) {
      return { logs: [], error: error.message }
    }

    // Look up actor profiles from admin_users
    const actorIds = Array.from(
      new Set((logsData || []).map((l) => l.user_id).filter(Boolean))
    )

    let actorsMap = new Map<string, { full_name: string; email: string }>()
    if (actorIds.length > 0) {
      const { data: actors } = await supabase
        .from("admin_users")
        .select("id, full_name, email")
        .in("id", actorIds)

      if (actors) {
        actorsMap = new Map(actors.map((a) => [a.id, { full_name: a.full_name, email: a.email }]))
      }
    }

    const mappedLogs: SystemAuditLogItem[] = (logsData || []).map((l) => {
      const actor = l.user_id ? actorsMap.get(l.user_id) : undefined
      return {
        id: l.id,
        action: l.action,
        entity_type: l.entity_type,
        entity_id: l.entity_id || undefined,
        actor_id: l.user_id || undefined,
        actor_name: actor?.full_name || undefined,
        actor_email: actor?.email || undefined,
        new_data: (l.new_data as Record<string, unknown>) || undefined,
        created_at: l.created_at,
      }
    })

    // Filter by search if specified
    if (params?.search) {
      const q = params.search.toLowerCase().trim()
      return {
        logs: mappedLogs.filter(
          (l) =>
            l.action.toLowerCase().includes(q) ||
            l.entity_type.toLowerCase().includes(q) ||
            l.actor_name?.toLowerCase().includes(q) ||
            l.actor_email?.toLowerCase().includes(q) ||
            (l.new_data && JSON.stringify(l.new_data).toLowerCase().includes(q))
        ),
      }
    }

    return { logs: mappedLogs }
  } catch (err) {
    return {
      logs: [],
      error: err instanceof Error ? err.message : "Failed to load audit logs.",
    }
  }
}


