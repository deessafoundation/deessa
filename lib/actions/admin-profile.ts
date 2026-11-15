"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { getCurrentAdmin } from "./admin-auth"
import { checkRateLimit } from "@/lib/rate-limit"
import { logAdminActivity } from "@/lib/audit/audit-logger"
import {
  updateProfileSchema,
  updatePreferencesSchema,
  changePasswordSchema,
  type UpdateProfileInput,
  type UpdatePreferencesInput,
  type ChangePasswordInput,
} from "@/lib/validations/admin-profile"

export interface AdminActivityHistoryItem {
  id: string
  action: string
  entity_type: string
  entity_id?: string
  new_data?: Record<string, unknown>
  created_at: string
}

/**
 * Updates the current administrator's display name and avatar.
 * Synchronizes with Supabase Auth metadata and logs the audit diff.
 */
export async function updateProfile(
  input: FormData | UpdateProfileInput
): Promise<{ success?: boolean; error?: string }> {
  try {
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin) {
      return { error: "Authentication required to update profile." }
    }

    let rawPayload: unknown
    if (input instanceof FormData) {
      rawPayload = {
        fullName: input.get("fullName"),
        avatarUrl: input.get("avatarUrl") || "",
        designation: input.get("designation") || "",
        phone: input.get("phone") || "",
      }
    } else {
      rawPayload = input
    }

    const validation = updateProfileSchema.safeParse(rawPayload)
    if (!validation.success) {
      const message = validation.error.issues.map((e: { message: string }) => e.message).join(", ")
      return { error: message }
    }

    const { fullName, avatarUrl, designation, phone } = validation.data
    const supabase = await createClient()

    // 1. Update admin_users record with resilience for schema variations
    const updatePayload: Record<string, unknown> = {
      full_name: fullName,
      avatar_url: avatarUrl || null,
      updated_at: new Date().toISOString(),
    }
    if (designation !== undefined) updatePayload.designation = designation || null
    if (phone !== undefined) updatePayload.phone = phone || null

    const { error: updateError } = await supabase
      .from("admin_users")
      .update(updatePayload)
      .eq("id", currentAdmin.id)

    if (updateError) {
      // Fallback if extended columns are not yet present in target database
      if (updateError.message.includes("column") || updateError.code === "42703") {
        const { error: fallbackError } = await supabase
          .from("admin_users")
          .update({
            full_name: fullName,
            avatar_url: avatarUrl || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentAdmin.id)
        if (fallbackError) return { error: fallbackError.message }
      } else {
        return { error: updateError.message }
      }
    }

    // 2. Synchronize Supabase Auth user metadata
    try {
      const supabaseAdmin = createServiceRoleClient()
      if (currentAdmin.user_id) {
        await supabaseAdmin.auth.admin.updateUserById(currentAdmin.user_id, {
          user_metadata: {
            full_name: fullName,
            avatar_url: avatarUrl || null,
            designation: designation || null,
            phone: phone || null,
          },
        })
      }
    } catch (authErr) {
      console.warn("Could not synchronize auth user metadata:", authErr)
    }

    // 3. Log audit event with previous vs new diff
    void logAdminActivity({
      action: "ADMIN_PROFILE_UPDATED",
      domain: "SECURITY",
      entityType: "admin_users",
      entityId: currentAdmin.id,
      description: `Updated profile details for administrator ${currentAdmin.email}`,
      oldData: {
        full_name: currentAdmin.full_name,
        avatar_url: currentAdmin.avatar_url,
        designation: currentAdmin.designation,
        phone: currentAdmin.phone,
      },
      newData: {
        full_name: fullName,
        avatar_url: avatarUrl || null,
        designation: designation || null,
        phone: phone || null,
      },
    })

    revalidatePath("/admin/profile")
    revalidatePath("/admin", "layout")
    revalidatePath("/admin")
    revalidatePath("/admin/users")

    return { success: true }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to update profile.",
    }
  }
}

/**
 * Changes administrator password with distributed rate limiting
 * and strict password entropy validation.
 */
export async function changePassword(
  input: FormData | ChangePasswordInput
): Promise<{ success?: boolean; error?: string }> {
  try {
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin) {
      return { error: "Authentication required to change password." }
    }

    // 1. Distributed Rate Limiting (Defense against credential brute-forcing)
    const headerList = await headers()
    const forwarded = headerList.get("x-forwarded-for")
    const clientIp = (forwarded ? forwarded.split(",")[0].trim() : headerList.get("x-real-ip")) || "127.0.0.1"

    const [adminLimit, ipLimit] = await Promise.all([
      checkRateLimit({
        identifier: `password-change:admin:${currentAdmin.id}`,
        maxAttempts: 5,
        windowMinutes: 15,
      }),
      checkRateLimit({
        identifier: `password-change:ip:${clientIp}`,
        maxAttempts: 10,
        windowMinutes: 15,
      }),
    ])

    if (!adminLimit.allowed || !ipLimit.allowed) {
      return {
        error: "Too many password change attempts. Please wait 15 minutes before trying again.",
      }
    }

    // 2. Validate payload
    let rawPayload: unknown
    if (input instanceof FormData) {
      rawPayload = {
        currentPassword: input.get("currentPassword"),
        newPassword: input.get("newPassword"),
        confirmPassword: input.get("confirmPassword"),
      }
    } else {
      rawPayload = input
    }

    const validation = changePasswordSchema.safeParse(rawPayload)
    if (!validation.success) {
      const message = validation.error.issues.map((e: { message: string }) => e.message).join(", ")
      return { error: message }
    }

    const { currentPassword, newPassword } = validation.data
    const supabase = await createClient()

    // 3. Verify current password by attempting sign-in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: currentAdmin.email,
      password: currentPassword,
    })

    if (signInError) {
      return { error: "Current password is incorrect." }
    }

    // 4. Update password in Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      return { error: updateError.message }
    }

    // 5. Update password_changed_at in admin_users for hygiene tracking
    try {
      await supabase
        .from("admin_users")
        .update({
          password_changed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentAdmin.id)
    } catch {
      // Non-blocking if column not yet migrated
    }

    // 6. Log security audit event (Note: NEVER log passwords or plaintext tokens)
    void logAdminActivity({
      action: "ADMIN_PASSWORD_CHANGED",
      domain: "SECURITY",
      entityType: "admin_users",
      entityId: currentAdmin.id,
      description: `Password changed for administrator ${currentAdmin.email}`,
      newData: { ip: clientIp },
    })

    revalidatePath("/admin/profile")
    return { success: true }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to change password.",
    }
  }
}

/**
 * Updates administrator UI and personal workflow preferences.
 */
export async function updatePreferences(
  input: UpdatePreferencesInput
): Promise<{ success?: boolean; error?: string }> {
  try {
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin) {
      return { error: "Authentication required to update preferences." }
    }

    const validation = updatePreferencesSchema.safeParse(input)
    if (!validation.success) {
      const message = validation.error.issues.map((e: { message: string }) => e.message).join(", ")
      return { error: message }
    }

    const preferences = validation.data
    const supabase = await createClient()

    // 1. Update preferences column in admin_users
    try {
      await supabase
        .from("admin_users")
        .update({
          preferences,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentAdmin.id)
    } catch (dbErr) {
      console.warn("Preferences column update skipped:", dbErr)
    }

    // 2. Synchronize Supabase Auth user_metadata
    try {
      const supabaseAdmin = createServiceRoleClient()
      if (currentAdmin.user_id) {
        await supabaseAdmin.auth.admin.updateUserById(currentAdmin.user_id, {
          user_metadata: {
            preferences,
          },
        })
      }
    } catch (authErr) {
      console.warn("Could not sync user_metadata preferences:", authErr)
    }

    // 3. Log audit event
    void logAdminActivity({
      action: "ADMIN_PREFERENCES_UPDATED",
      domain: "SECURITY",
      entityType: "admin_users",
      entityId: currentAdmin.id,
      description: `Preferences updated for administrator ${currentAdmin.email}`,
      newData: { preferences },
    })

    revalidatePath("/admin/profile")
    return { success: true }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to update preferences.",
    }
  }
}

/**
 * Invalidates all active sessions for this administrator except the current browser session.
 */
export async function revokeOtherSessions(): Promise<{ success?: boolean; error?: string }> {
  try {
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin) {
      return { error: "Authentication required to revoke sessions." }
    }

    const supabase = await createClient()
    const { error: signOutError } = await supabase.auth.signOut({ scope: "others" })

    if (signOutError) {
      return { error: signOutError.message }
    }

    // Extract client IP for security telemetry
    const headerList = await headers()
    const forwarded = headerList.get("x-forwarded-for")
    const clientIp = (forwarded ? forwarded.split(",")[0].trim() : headerList.get("x-real-ip")) || "127.0.0.1"

    // Log security audit event
    void logAdminActivity({
      action: "ADMIN_SESSIONS_REVOKED",
      domain: "SECURITY",
      entityType: "admin_users",
      entityId: currentAdmin.id,
      description: `Revoked other active sessions for administrator ${currentAdmin.email}`,
      newData: {
        scope: "others",
        ip: clientIp,
      },
    })

    revalidatePath("/admin/profile")
    return { success: true }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to revoke sessions.",
    }
  }
}

export interface PasswordHygieneMetrics {
  lastChangedAt: string
  diffDays: number
  status: "optimal" | "healthy" | "warning" | "stale"
  statusLabel: string
}

/**
 * Computes credential age and compliance metrics for the current administrator.
 */
export async function getPasswordHygiene(): Promise<PasswordHygieneMetrics> {
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin) {
    return {
      lastChangedAt: new Date().toISOString(),
      diffDays: 0,
      status: "optimal",
      statusLabel: "Optimal",
    }
  }

  const supabase = await createClient()

  let lastChanged = currentAdmin.password_changed_at

  if (!lastChanged) {
    const { data: logs } = await supabase
      .from("activity_logs")
      .select("created_at")
      .eq("user_id", currentAdmin.id)
      .eq("entity_type", "password")
      .order("created_at", { ascending: false })
      .limit(1)

    if (logs && logs.length > 0 && logs[0].created_at) {
      lastChanged = logs[0].created_at
    } else {
      lastChanged = currentAdmin.created_at
    }
  }

  const lastChangedDate = new Date(lastChanged || currentAdmin.created_at)
  const diffDays = Math.max(0, Math.floor((Date.now() - lastChangedDate.getTime()) / (1000 * 60 * 60 * 24)))

  let status: "optimal" | "healthy" | "warning" | "stale" = "optimal"
  let statusLabel = "Optimal"

  if (diffDays <= 60) {
    status = "optimal"
    statusLabel = "Optimal"
  } else if (diffDays <= 90) {
    status = "healthy"
    statusLabel = "Healthy"
  } else if (diffDays <= 180) {
    status = "warning"
    statusLabel = "Rotation Recommended"
  } else {
    status = "stale"
    statusLabel = "Stale Credentials"
  }

  return {
    lastChangedAt: lastChangedDate.toISOString(),
    diffDays,
    status,
    statusLabel,
  }
}

/**
 * Uploads an avatar image directly to Supabase Storage and returns the public URL.
 */
export async function uploadAdminAvatar(
  formData: FormData
): Promise<{ success?: boolean; url?: string; error?: string }> {
  try {
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin) {
      return { error: "Authentication required to upload an avatar." }
    }

    const file = formData.get("file") as File | null
    if (!file) {
      return { error: "No image file provided." }
    }

    const validMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!validMimeTypes.includes(file.type)) {
      return { error: "Please upload a valid image file (JPEG, PNG, WebP, or GIF)." }
    }

    if (file.size > 3 * 1024 * 1024) {
      return { error: "Image size must be under 3MB." }
    }

    const supabaseAdmin = createServiceRoleClient()

    // Ensure 'avatars' storage bucket exists and is public
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets()
      const bucketExists = (buckets || []).some((b) => b.name === "avatars")
      if (!bucketExists) {
        await supabaseAdmin.storage.createBucket("avatars", {
          public: true,
          fileSizeLimit: 3145728, // 3MB
          allowedMimeTypes: validMimeTypes,
        })
      }
    } catch (bucketErr) {
      console.warn("Could not check/create bucket:", bucketErr)
    }

    const extension = file.name.split(".").pop() || "jpg"
    const storagePath = `admin-${currentAdmin.id}-${Date.now()}.${extension}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabaseAdmin.storage
      .from("avatars")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      return { error: uploadError.message || "Failed to upload image to storage." }
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from("avatars").getPublicUrl(storagePath)

    return { success: true, url: publicUrlData.publicUrl }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to upload avatar.",
    }
  }
}

/**
 * Retrieves the logged-in administrator's recent activity history.
 */
export async function getActivityHistory(
  limit = 25
): Promise<AdminActivityHistoryItem[]> {
  try {
    const supabase = await createClient()
    const currentAdmin = await getCurrentAdmin()

    if (!currentAdmin) {
      return []
    }

    const { data, error } = await supabase
      .from("activity_logs")
      .select("id, action, entity_type, entity_id, new_data, created_at")
      .eq("user_id", currentAdmin.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error || !data) {
      return []
    }

    return data as AdminActivityHistoryItem[]
  } catch (err) {
    console.error("Failed to fetch activity history:", err)
    return []
  }
}
