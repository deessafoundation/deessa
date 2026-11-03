"use server"

import { createServiceRoleClient } from "@/lib/supabase/service"
import { redirect } from "next/navigation"

export async function checkSetupRequired(): Promise<boolean> {
  try {
    const supabase = createServiceRoleClient()

    // Check if any admin users exist using service role to bypass RLS
    const { count, error } = await supabase
      .from("admin_users")
      .select("*", { count: "exact", head: true })

    if (error) {
      console.error("Error checking admin users:", error)
      return false
    }

    // Setup is required only if zero admin users exist
    return count === 0
  } catch (err) {
    console.error("checkSetupRequired unexpected error:", err)
    return false
  }
}

export async function setupFirstAdmin(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const password = formData.get("password") as string
  const fullName = (formData.get("fullName") as string)?.trim()
  const setupKey = (formData.get("setupKey") as string)?.trim()

  // Validate setup key strictly against environment variable
  const expectedKey = process.env.ADMIN_SETUP_KEY
  if (!expectedKey || expectedKey.length < 16) {
    return {
      error: "Admin onboarding is disabled. ADMIN_SETUP_KEY is not securely configured in server environment variables.",
    }
  }

  if (setupKey !== expectedKey) {
    return { error: "Invalid setup authorization key." }
  }

  if (!email || !password || !fullName) {
    return { error: "All fields are required." }
  }

  if (password.length < 12) {
    return { error: "Initial admin password must be at least 12 characters." }
  }

  const supabaseAdmin = createServiceRoleClient()

  // Double-check no admin exists (prevents race conditions)
  const { count } = await supabaseAdmin
    .from("admin_users")
    .select("*", { count: "exact", head: true })

  if (count && count > 0) {
    return { error: "Setup has already been completed. Please use the login page." }
  }

  // Create confirmed auth user directly via Admin API
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })

  if (authError || !authData?.user) {
    return { error: authError?.message || "Failed to create user account" }
  }

  // Create initial admin user record with SUPER_ADMIN role
  const { error: adminError } = await supabaseAdmin.from("admin_users").insert({
    user_id: authData.user.id,
    email,
    full_name: fullName,
    role: "SUPER_ADMIN",
    is_active: true,
  })

  if (adminError) {
    // Rollback auth user creation if table insert fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return { error: adminError.message }
  }

  // Log the setup activity
  await supabaseAdmin.from("activity_logs").insert({
    action: "CREATE",
    entity_type: "setup",
    new_data: { message: "Initial super admin setup completed", email },
  })

  redirect("/admin/login?setup=success")
}
