import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { getCurrentAdmin } from '@/lib/actions/admin-auth'
import { logAdminActivity } from '@/lib/audit/audit-logger'

// GET - Fetch notifications for current user or all system notifications if SUPER_ADMIN
export async function GET(request: NextRequest) {
  try {
    const currentAdmin = await getCurrentAdmin()
    
    if (!currentAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const scope = searchParams.get('scope') || (currentAdmin.role === 'SUPER_ADMIN' ? 'all' : 'mine')

    const isSuperAdminAll = currentAdmin.role === 'SUPER_ADMIN' && scope === 'all'
    const supabase = isSuperAdminAll ? createServiceRoleClient() : await createClient()

    let query = supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!isSuperAdminAll) {
      query = query.eq('user_id', currentAdmin.user_id)
    }

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Error in GET /api/admin/notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new notification (admin only)
export async function POST(request: NextRequest) {
  try {
    const currentAdmin = await getCurrentAdmin()
    
    if (!currentAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only SUPER_ADMIN and ADMIN can create notifications
    if (!['SUPER_ADMIN', 'ADMIN'].includes(currentAdmin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { user_id, type, title, message, link, metadata } = body

    const targetUserId = user_id || currentAdmin.user_id

    if (!targetUserId || !type || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()
    const { data: notification, error } = await supabase
      .from('admin_notifications')
      .insert({
        user_id: targetUserId,
        type,
        title,
        message,
        link,
        metadata,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
    }

    void logAdminActivity({
      action: "ADMIN_NOTIFICATION_CREATED",
      domain: "SYSTEM",
      entityType: "admin_notifications",
      entityId: notification.id,
      description: `Created notification: ${title}`,
      actorId: currentAdmin.user_id,
      actorEmail: currentAdmin.email,
    })

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/admin/notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
