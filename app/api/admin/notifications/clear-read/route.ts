import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { getCurrentAdmin } from '@/lib/actions/admin-auth'
import { logAdminActivity } from '@/lib/audit/audit-logger'

// DELETE - Clear all read notifications for current user
export async function DELETE() {
  try {
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceRoleClient()
    const { error } = await serviceSupabase
      .from('admin_notifications')
      .delete()
      .eq('user_id', currentAdmin.user_id)
      .eq('is_read', true)

    if (error) {
      console.error('Error clearing read notifications:', error)
      return NextResponse.json({ error: 'Failed to clear read notifications' }, { status: 500 })
    }

    void logAdminActivity({
      action: "ADMIN_NOTIFICATIONS_CLEARED_READ",
      domain: "SYSTEM",
      entityType: "admin_notifications",
      entityId: currentAdmin.user_id,
      description: "Cleared all read notifications",
      actorId: currentAdmin.user_id,
      actorEmail: currentAdmin.email,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/notifications/clear-read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
