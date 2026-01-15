import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/actions/admin-auth'

// GET - Fetch notifications for current user
export async function GET(request: NextRequest) {
  try {
    const currentAdmin = await getCurrentAdmin()
    
    if (!currentAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    let query = supabase
      .from('admin_notifications')
      .select('*')
      .eq('user_id', currentAdmin.user_id)
      .order('created_at', { ascending: false })
      .limit(limit)

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

    if (!user_id || !type || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: notification, error } = await supabase
      .from('admin_notifications')
      .insert({
        user_id,
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

    return NextResponse.json({ notification })
  } catch (error) {
    console.error('Error in POST /api/admin/notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
