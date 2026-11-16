import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { getCurrentAdmin } from '@/lib/actions/admin-auth'
import { logAdminActivity } from '@/lib/audit/audit-logger'

// PATCH - Mark notification as read or unread
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const currentAdmin = await getCurrentAdmin()
    
    if (!currentAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let isRead = true
    try {
      const body = await request.json()
      if (typeof body?.is_read === 'boolean') {
        isRead = body.is_read
      }
    } catch {
      // Default to true if no body provided
    }

    const isSuperAdmin = currentAdmin.role === 'SUPER_ADMIN'
    const serviceSupabase = createServiceRoleClient()
    
    let query = serviceSupabase
      .from('admin_notifications')
      .update({ 
        is_read: isRead, 
        read_at: isRead ? new Date().toISOString() : null,
      })
      .eq('id', id)

    if (!isSuperAdmin) {
      query = query.eq('user_id', currentAdmin.user_id)
    }

    const { error } = await query

    if (error) {
      console.error('Error updating notification read state:', error)
      return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
    }

    void logAdminActivity({
      action: isRead ? "ADMIN_NOTIFICATION_MARKED_READ" : "ADMIN_NOTIFICATION_MARKED_UNREAD",
      domain: "SYSTEM",
      entityType: "admin_notifications",
      entityId: id,
      description: `Marked notification ${id} as ${isRead ? 'read' : 'unread'}`,
      actorId: currentAdmin.user_id,
      actorEmail: currentAdmin.email,
    })

    return NextResponse.json({ success: true, is_read: isRead })
  } catch (error) {
    console.error('Error in PATCH /api/admin/notifications/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete notification
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const currentAdmin = await getCurrentAdmin()
    
    if (!currentAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isSuperAdmin = currentAdmin.role === 'SUPER_ADMIN'
    const serviceSupabase = createServiceRoleClient()
    
    let query = serviceSupabase
      .from('admin_notifications')
      .delete()
      .eq('id', id)

    if (!isSuperAdmin) {
      query = query.eq('user_id', currentAdmin.user_id)
    }

    const { error } = await query

    if (error) {
      console.error('Error deleting notification:', error)
      return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 })
    }

    void logAdminActivity({
      action: "ADMIN_NOTIFICATION_DELETED",
      domain: "SYSTEM",
      entityType: "admin_notifications",
      entityId: id,
      description: `Deleted notification ${id}`,
      actorId: currentAdmin.user_id,
      actorEmail: currentAdmin.email,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/notifications/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
