import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { getCurrentAdmin } from '@/lib/actions/admin-auth'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Check authentication and authorization
    const currentAdmin = await getCurrentAdmin()

    if (!currentAdmin || !currentAdmin.is_active) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (!['SUPER_ADMIN', 'ADMIN'].includes(currentAdmin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use service role client to bypass RLS for admin operations
    const supabase = createServiceRoleClient()

    // Get the support report to check for screenshot
    const { data: report, error: fetchError } = await supabase
      .from('contact_submissions')
      .select('screenshot_path')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Support report not found' }, { status: 404 })
    }

    // Delete screenshot from storage if exists
    if (report.screenshot_path) {
      const { error: storageError } = await supabase.storage
        .from('support-screenshots')
        .remove([report.screenshot_path])

      if (storageError) {
        console.error('[DELETE] Error deleting screenshot:', storageError)
        // Continue with deletion even if screenshot deletion fails
      }
    }

    // Delete all related actions first (foreign key constraint)
    const { error: actionsError } = await supabase
      .from('support_admin_actions')
      .delete()
      .eq('report_id', id)

    if (actionsError) {
      console.error('[DELETE] Error deleting support actions:', actionsError)
      return NextResponse.json({ error: 'Failed to delete support actions' }, { status: 500 })
    }

    // Delete the support report
    const { error: deleteError } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('[DELETE] Error deleting support report:', deleteError)
      return NextResponse.json({ error: 'Failed to delete support report' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Support report deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/admin/support/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
