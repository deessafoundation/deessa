"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { getCurrentAdmin } from "./admin-auth"
import { revalidatePath } from "next/cache"

export async function updateAdminUser(userId: string, data: { role?: string; is_active?: boolean }) {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin || currentAdmin.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" }
  }

  // Cannot edit yourself
  if (userId === currentAdmin.id) {
    return { error: "Cannot edit your own account" }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("admin_users")
    .update({
      role: data.role,
      is_active: data.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function deleteAdminUser(userId: string) {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin || currentAdmin.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" }
  }

  // Cannot delete yourself
  if (userId === currentAdmin.id) {
    return { error: "Cannot delete your own account" }
  }

  const supabase = await createClient()

  // Get the user's auth ID first
  const { data: adminUser } = await supabase.from("admin_users").select("user_id").eq("id", userId).single()

  if (!adminUser) {
    return { error: "User not found" }
  }

  // Delete from admin_users table
  const { error } = await supabase.from("admin_users").delete().eq("id", userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function createAdminUser(data: {
  email: string
  password: string
  full_name: string
  role: string
}) {
  const currentAdmin = await getCurrentAdmin()

  if (!currentAdmin || currentAdmin.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" }
  }

  const supabase = await createClient()
  const supabaseAdmin = createServiceRoleClient()

  // Create auth user (service role key required for admin API)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: "Failed to create user" }
  }

  // Create admin user record
  const { error: insertError } = await supabase.from("admin_users").insert({
    user_id: authData.user.id,
    email: data.email,
    full_name: data.full_name,
    role: data.role,
    is_active: true,
  })

  if (insertError) {
    return { error: insertError.message }
  }

  revalidatePath("/admin/users")
  return { success: true }
}
