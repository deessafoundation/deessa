import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { getCurrentAdmin } from "@/lib/actions/admin-auth"
import { logAdminActivity } from "@/lib/audit/audit-logger"

// POST /api/admin/notifications/batch
// Body: { action: "mark_read" | "mark_unread" | "delete", ids: string[] }
export async function POST(request: NextRequest) {
  try {
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, ids } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid or empty IDs array" }, { status: 400 })
    }

    // Safety limit
    if (ids.length > 500) {
      return NextResponse.json({ error: "Maximum batch limit is 500 items" }, { status: 400 })
    }

    const isSuperAdmin = currentAdmin.role === "SUPER_ADMIN"
    const supabase = createServiceRoleClient()

    if (action === "mark_read" || action === "mark_unread") {
      const isRead = action === "mark_read"
      const now = isRead ? new Date().toISOString() : null

      let query = supabase
        .from("admin_notifications")
        .update({ is_read: isRead, read_at: now })
        .in("id", ids)

      if (!isSuperAdmin) {
        query = query.eq("user_id", currentAdmin.user_id)
      }

      const { error } = await query

      if (error) {
        console.error(`Error in batch ${action}:`, error)
        return NextResponse.json({ error: `Failed to update notifications` }, { status: 500 })
      }

      void logAdminActivity({
        action: isRead ? "ADMIN_NOTIFICATIONS_BATCH_READ" : "ADMIN_NOTIFICATIONS_BATCH_UNREAD",
        domain: "SYSTEM",
        entityType: "admin_notifications",
        entityId: currentAdmin.user_id,
        description: `Marked ${ids.length} notifications as ${isRead ? 'read' : 'unread'}`,
        actorId: currentAdmin.user_id,
        actorEmail: currentAdmin.email,
        metadata: { count: ids.length, ids },
      })

      return NextResponse.json({ success: true, count: ids.length, action })
    } else if (action === "delete") {
      let query = supabase
        .from("admin_notifications")
        .delete()
        .in("id", ids)

      if (!isSuperAdmin) {
        query = query.eq("user_id", currentAdmin.user_id)
      }

      const { error } = await query

      if (error) {
        console.error("Error in batch delete:", error)
        return NextResponse.json({ error: "Failed to delete notifications" }, { status: 500 })
      }

      void logAdminActivity({
        action: "ADMIN_NOTIFICATIONS_BATCH_DELETED",
        domain: "SYSTEM",
        entityType: "admin_notifications",
        entityId: currentAdmin.user_id,
        description: `Deleted ${ids.length} notifications`,
        actorId: currentAdmin.user_id,
        actorEmail: currentAdmin.email,
        metadata: { count: ids.length, ids },
      })

      return NextResponse.json({ success: true, count: ids.length, action: "delete" })
    } else {
      return NextResponse.json(
        { error: "Invalid action. Supported: mark_read, mark_unread, delete" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error in POST /api/admin/notifications/batch:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
