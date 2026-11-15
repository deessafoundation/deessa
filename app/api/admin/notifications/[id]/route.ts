import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/actions/admin-auth'
import { logAdminActivity } from '@/lib/audit/audit-logger'

// PATCH - Mark notification as read
export async function PATCH(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const currentAdmin = await getCurrentAdmin()
    
    if (!currentAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    
    const { error } = await supabase
      .from('admin_notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', id)
      .eq('user_id', currentAdmin.user_id)

    if (error) {
      console.error('Error marking notification as read:', error)
      return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
    }

    void logAdminActivity({
      action: "ADMIN_NOTIFICATION_MARKED_READ",
      domain: "SYSTEM",
      entityType: "admin_notifications",
      entityId: id,
      description: `Marked notification ${id} as read`,
      actorId: currentAdmin.user_id,
      actorEmail: currentAdmin.email,
    })

    return NextResponse.json({ success: true })
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

    const supabase = await createClient()
    
    const { error } = await supabase
      .from('admin_notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', currentAdmin.user_id)

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
