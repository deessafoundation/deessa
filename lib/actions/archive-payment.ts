"use server"

import { createClient } from "@/lib/supabase/server"
import { canViewFinance, type AdminRole } from "@/lib/types/admin"

type PaymentType = "donation" | "event" | "conference"

async function requireFinanceAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single()

  if (!adminUser || !canViewFinance(adminUser.role as AdminRole)) return null
  return { supabase, admin: adminUser }
}

const tableMap: Record<PaymentType, string> = {
  donation: "donations",
  event: "event_registrations",
  conference: "conference_registrations",
}

export async function archivePayment(
  id: string,
  type: PaymentType
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await requireFinanceAdmin()
    if (!ctx) return { success: false, error: "Unauthorized" }

    const table = tableMap[type]
    const { error } = await ctx.supabase
      .from(table)
      .update({ archived_at: new Date().toISOString() })
      .eq("id", id)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }
}

export async function unarchivePayment(
  id: string,
  type: PaymentType
): Promise<{ success: boolean; error?: string }> {
  try {
    const ctx = await requireFinanceAdmin()
    if (!ctx) return { success: false, error: "Unauthorized" }

    const table = tableMap[type]
    const { error } = await ctx.supabase
      .from(table)
      .update({ archived_at: null })
      .eq("id", id)

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }
}

export async function bulkArchivePayments(
  items: { id: string; type: PaymentType }[]
): Promise<{ success: boolean; archived: number; error?: string }> {
  try {
    const ctx = await requireFinanceAdmin()
    if (!ctx) return { success: false, archived: 0, error: "Unauthorized" }

    const now = new Date().toISOString()
    let archived = 0

    // Group by type for batch updates
    const byType: Record<PaymentType, string[]> = { donation: [], event: [], conference: [] }
    for (const item of items) {
      byType[item.type].push(item.id)
    }

    for (const [type, ids] of Object.entries(byType) as [PaymentType, string[]][]) {
      if (ids.length === 0) continue
      const table = tableMap[type]
      const { error } = await ctx.supabase
        .from(table)
        .update({ archived_at: now })
        .in("id", ids)

      if (error) {
        return { success: false, archived, error: `Failed to archive ${type} records: ${error.message}` }
      }
      archived += ids.length
    }

    return { success: true, archived }
  } catch (err) {
    return {
      success: false,
      archived: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }
}
