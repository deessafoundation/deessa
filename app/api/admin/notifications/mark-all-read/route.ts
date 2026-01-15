import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/actions/admin-auth'

// POST - Mark all notifications as read
export async function POST(request: NextRequest) {
  try {
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
      .eq('user_id', currentAdmin.user_id)
      .eq('is_read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in POST /api/admin/notifications/mark-all-read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
