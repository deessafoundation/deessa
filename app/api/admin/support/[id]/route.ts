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
    
    console.log('[DELETE] Starting deletion for ID:', id)
    
    // Check authentication and authorization
    const currentAdmin = await getCurrentAdmin()
    
    console.log('[DELETE] Current admin:', currentAdmin ? currentAdmin.email : 'none')
    
    if (!currentAdmin) {
      console.log('[DELETE] No admin found - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (!['SUPER_ADMIN', 'ADMIN'].includes(currentAdmin.role)) {
      console.log('[DELETE] User role not authorized:', currentAdmin.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use service role client to bypass RLS for admin operations
    const supabase = createServiceRoleClient()
    
    console.log('[DELETE] Fetching report with ID:', id)

    // Get the support report to check for screenshot
    const { data: report, error: fetchError } = await supabase
      .from('contact_submissions')
      .select('screenshot_path')
      .eq('id', id)
      .single()

    console.log('[DELETE] Fetch result:', { report, fetchError })

    if (fetchError) {
      console.log('[DELETE] Fetch error:', fetchError)
      return NextResponse.json({ error: 'Support report not found' }, { status: 404 })
    }

    // Delete screenshot from storage if exists
    if (report.screenshot_path) {
      console.log('[DELETE] Deleting screenshot:', report.screenshot_path)
      const { error: storageError } = await supabase.storage
        .from('support-screenshots')
        .remove([report.screenshot_path])

      if (storageError) {
        console.error('[DELETE] Error deleting screenshot:', storageError)
        // Continue with deletion even if screenshot deletion fails
      } else {
        console.log('[DELETE] Screenshot deleted successfully')
      }
    }

    // Delete all related actions first (foreign key constraint)
    console.log('[DELETE] Deleting related actions for report:', id)
    const { error: actionsError } = await supabase
      .from('support_admin_actions')
      .delete()
      .eq('report_id', id)

    if (actionsError) {
      console.error('[DELETE] Error deleting support actions:', actionsError)
      return NextResponse.json({ error: 'Failed to delete support actions' }, { status: 500 })
    }
    
    console.log('[DELETE] Related actions deleted successfully')

    // Delete the support report
    console.log('[DELETE] Deleting support report:', id)
    const { error: deleteError } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('[DELETE] Error deleting support report:', deleteError)
      return NextResponse.json({ error: 'Failed to delete support report' }, { status: 500 })
    }
    
    console.log('[DELETE] Support report deleted successfully')

    return NextResponse.json({ success: true, message: 'Support report deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/admin/support/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
