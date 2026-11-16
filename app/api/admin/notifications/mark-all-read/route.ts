import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { getCurrentAdmin } from '@/lib/actions/admin-auth'
import { logAdminActivity } from '@/lib/audit/audit-logger'

// POST - Mark all notifications as read
export async function POST() {
  try {
    const currentAdmin = await getCurrentAdmin()
    
    if (!currentAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceRoleClient()
    
    const { error } = await serviceSupabase
      .from('admin_notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('user_id', currentAdmin.user_id)
      .eq('is_read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
    }

    void logAdminActivity({
      action: "ADMIN_NOTIFICATIONS_MARKED_READ",
      domain: "SYSTEM",
      entityType: "admin_notifications",
      entityId: currentAdmin.user_id,
      description: "Marked all notifications as read",
      actorId: currentAdmin.user_id,
      actorEmail: currentAdmin.email,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/admin/notifications/mark-all-read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
