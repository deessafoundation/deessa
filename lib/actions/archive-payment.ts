"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { logAdminActivity } from "@/lib/audit/audit-logger"

type PaymentType = "donation" | "event" | "conference"

/**
 * Authorization guard for financial archiving actions.
 * Requires ADMIN or SUPER_ADMIN role AND active account.
 * FINANCE role is intentionally excluded — archiving is a destructive mutation.
 */
async function requireFinancialAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const serviceSupabase = createServiceRoleClient()
  const { data: adminUser } = await serviceSupabase
    .from("admin_users")
    .select("role, is_active")
    .eq("user_id", user.id)
    .single()

  if (!adminUser || !adminUser.is_active) return null
  if (!["ADMIN", "SUPER_ADMIN"].includes(adminUser.role)) return null
  return { supabase, serviceSupabase, admin: adminUser }
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
    const ctx = await requireFinancialAdmin()
    if (!ctx) return { success: false, error: "Unauthorized" }

    const table = tableMap[type]
    const { error } = await ctx.serviceSupabase
      .from(table)
      .update({ archived_at: new Date().toISOString() })
      .eq("id", id)

    if (error) return { success: false, error: error.message }

    await logAdminActivity({
      action: "PAYMENT_ARCHIVED",
      domain: "TREASURY",
      entityType: table,
      entityId: id,
      summary: `Admin archived ${type} record ${id}`,
      newData: { archived_at: new Date().toISOString() },
    })

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
    const ctx = await requireFinancialAdmin()
    if (!ctx) return { success: false, error: "Unauthorized" }

    const table = tableMap[type]
    const { error } = await ctx.serviceSupabase
      .from(table)
      .update({ archived_at: null })
      .eq("id", id)

    if (error) return { success: false, error: error.message }

    await logAdminActivity({
      action: "PAYMENT_UNARCHIVED",
      domain: "TREASURY",
      entityType: table,
      entityId: id,
      summary: `Admin unarchived ${type} record ${id}`,
      newData: { archived_at: null },
    })

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
    const ctx = await requireFinancialAdmin()
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
      const { error } = await ctx.serviceSupabase
        .from(table)
        .update({ archived_at: now })
        .in("id", ids)

      if (error) {
        return { success: false, archived, error: `Failed to archive ${type} records: ${error.message}` }
      }
      archived += ids.length
    }

    await logAdminActivity({
      action: "PAYMENTS_BULK_ARCHIVED",
      domain: "TREASURY",
      entityType: "payment_batch",
      summary: `Admin bulk archived ${archived} payment records`,
      newData: { count: archived, itemsCount: items.length },
    })

    return { success: true, archived }
  } catch (err) {
    return {
      success: false,
      archived: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }
}
