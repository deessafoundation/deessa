"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { checkRateLimit } from "@/lib/rate-limit"
import { sendAdminPasswordResetEmail } from "@/lib/email/auth-mailer"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function adminLogin(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const password = formData.get("password") as string
  const rawRedirect = formData.get("redirectTo") as string | null

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  // ── 1. Extract Client IP & Check Rate Limits ──────────────────────────────
  const headerList = await headers()
  const forwarded = headerList.get("x-forwarded-for")
  const clientIp = (forwarded ? forwarded.split(",")[0].trim() : headerList.get("x-real-ip")) || "127.0.0.1"

  const [ipLimit, emailLimit] = await Promise.all([
    checkRateLimit({
      identifier: `admin-login:ip:${clientIp}`,
      maxAttempts: 5,
      windowMinutes: 15,
    }),
    checkRateLimit({
      identifier: `admin-login:email:${email}`,
      maxAttempts: 5,
      windowMinutes: 15,
    }),
  ])

  if (!ipLimit.allowed || !emailLimit.allowed) {
    return { error: "Too many sign-in attempts. Please try again in 15 minutes." }
  }

  // ── 2. Authenticate with Supabase Auth ────────────────────────────────────
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // Helper to log failed attempts to activity_logs via service role (bypasses RLS)
  const logFailedAttempt = async (reason: string, adminUserId?: string) => {
    try {
      const serviceClient = createServiceRoleClient()
      await serviceClient.from("activity_logs").insert({
        user_id: adminUserId || null,
        action: "LOGIN_FAILED",
        entity_type: "auth",
        new_data: { email, ip: clientIp, reason },
      })
    } catch (logErr) {
      console.error("Failed to record failed login log:", logErr)
    }
  }

  if (error) {
    await logFailedAttempt("invalid_credentials")
    return { error: "Invalid email or password" }
  }

  // ── 3. Authorize Active Admin Account ─────────────────────────────────────
  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("*")
    .eq("user_id", data.user.id)
    .single()

  if (adminError || !adminUser) {
    await supabase.auth.signOut()
    await logFailedAttempt("not_admin")
    return { error: "Invalid email or password" }
  }

  if (!adminUser.is_active) {
    await supabase.auth.signOut()
    await logFailedAttempt("deactivated_account", adminUser.id)
    return { error: "This administrator account is deactivated. Contact a super admin." }
  }

  // ── 4. Log Successful Login & Redirect ────────────────────────────────────
  await supabase.from("activity_logs").insert({
    user_id: adminUser.id,
    action: "LOGIN",
    entity_type: "auth",
    new_data: { ip: clientIp },
  })

  // Validate target redirect against open redirects & personal preferences
  const defaultPage =
    (adminUser as { preferences?: { defaultLandingPage?: string } })?.preferences?.defaultLandingPage || "/admin"
  const safeDefault =
    typeof defaultPage === "string" && defaultPage.startsWith("/admin") && !defaultPage.startsWith("/admin/login")
      ? defaultPage
      : "/admin"

  const target =
    rawRedirect && rawRedirect.startsWith("/admin") && !rawRedirect.startsWith("/admin/login")
      ? rawRedirect
      : safeDefault

  revalidatePath(target)
  redirect(target)
}

export async function adminLogout() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (adminUser) {
      await supabase.from("activity_logs").insert({
        user_id: adminUser.id,
        action: "LOGOUT",
        entity_type: "auth",
      })
    }
  }

  await supabase.auth.signOut()
  redirect("/admin/login")
}

export async function getCurrentAdmin() {
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

  return adminUser?.is_active ? adminUser : null
}

async function getSiteOrigin(): Promise<string> {
  try {
    const headerList = await headers()
    const host = headerList.get("x-forwarded-host") || headerList.get("host")
    const proto = headerList.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https")
    if (host) {
      return `${proto}://${host}`
    }
  } catch {
    // Fallback
  }
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

/**
 * Initiates a self-service password recovery flow for an administrator.
 * Employs strict anti-enumeration: always returns a neutral confirmation message.
 */
export async function requestAdminPasswordReset(
  emailInput: string
): Promise<{ success: boolean; message: string; error?: string }> {
  const email = emailInput?.trim().toLowerCase()
  if (!email || !email.includes("@")) {
    return {
      success: false,
      message: "Please provide a valid email address.",
      error: "Invalid email",
    }
  }

  // Rate limit: max 5 by IP and 3 by email per 15 minutes
  const headerList = await headers()
  const forwarded = headerList.get("x-forwarded-for")
  const clientIp = (forwarded ? forwarded.split(",")[0].trim() : headerList.get("x-real-ip")) || "127.0.0.1"

  const [ipLimit, emailLimit] = await Promise.all([
    checkRateLimit({
      identifier: `forgot-pw:ip:${clientIp}`,
      maxAttempts: 5,
      windowMinutes: 15,
    }),
    checkRateLimit({
      identifier: `forgot-pw:email:${email}`,
      maxAttempts: 3,
      windowMinutes: 15,
    }),
  ])

  if (!ipLimit.allowed || !emailLimit.allowed) {
    return {
      success: false,
      message: "Too many recovery attempts. Please wait 15 minutes before trying again.",
      error: "Rate limit exceeded",
    }
  }

  const genericSuccess = {
    success: true,
    message: "If an active administrative account is associated with this email, a recovery link has been dispatched.",
  }

  try {
    const supabaseAdmin = createServiceRoleClient()

    const { data: adminUser } = await supabaseAdmin
      .from("admin_users")
      .select("id, email, full_name, is_active")
      .eq("email", email)
      .single()

    // If account not found or deactivated, return generic message (anti-enumeration)
    if (!adminUser || !adminUser.is_active) {
      return genericSuccess
    }

    const origin = await getSiteOrigin()
    const redirectTo = `${origin}/admin/reset-password`

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: adminUser.email,
      options: { redirectTo },
    })

    if (linkError || !linkData?.properties?.action_link) {
      console.error("[requestAdminPasswordReset] Failed to generate link:", linkError)
      return genericSuccess
    }

    await sendAdminPasswordResetEmail({
      toEmail: adminUser.email,
      recipientName: adminUser.full_name || "Administrator",
      resetUrl: linkData.properties.action_link,
      requestedByAdminName: "Self-Service Recovery Portal",
    })

    await supabaseAdmin.from("activity_logs").insert({
      user_id: adminUser.id,
      action: "FORGOT_PASSWORD_REQUESTED",
      entity_type: "auth",
      new_data: { ip: clientIp, email },
    })

    return genericSuccess
  } catch (err) {
    console.error("[requestAdminPasswordReset Error]:", err)
    return genericSuccess
  }
}

