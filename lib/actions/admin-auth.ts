"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { checkRateLimit } from "@/lib/rate-limit"
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
    .select("id, role, is_active")
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

  // Validate target redirect against open redirects
  const target =
    rawRedirect && rawRedirect.startsWith("/admin") && !rawRedirect.startsWith("/admin/login")
      ? rawRedirect
      : "/admin"

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

export async function createAdminUser(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const password = formData.get("password") as string
  const fullName = (formData.get("fullName") as string)?.trim()
  const role = formData.get("role") as string

  if (!email || !password || !fullName || !role) {
    return { error: "All fields are required" }
  }

  const validRoles = ["SUPER_ADMIN", "ADMIN", "EDITOR", "FINANCE"]
  if (!validRoles.includes(role)) {
    return { error: "Invalid role specified" }
  }

  const supabase = await createClient()
  const supabaseAdmin = createServiceRoleClient()

  // Check if current user is super admin
  const currentAdmin = await getCurrentAdmin()
  if (!currentAdmin || currentAdmin.role !== "SUPER_ADMIN") {
    return { error: "Only super admins can create new admin users" }
  }

  // Create auth user (service role key required for admin API)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return { error: authError.message }
  }

  // Create admin user record
  const { error: adminError } = await supabase.from("admin_users").insert({
    user_id: authData.user.id,
    email,
    full_name: fullName,
    role,
    is_active: true,
  })

  if (adminError) {
    return { error: adminError.message }
  }

  // Log activity
  await supabase.from("activity_logs").insert({
    user_id: currentAdmin.id,
    action: "CREATE",
    entity_type: "admin_user",
    new_data: { email, full_name: fullName, role },
  })

  revalidatePath("/admin/users")
  return { success: true }
}
