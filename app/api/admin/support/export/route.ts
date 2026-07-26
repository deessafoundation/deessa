import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { getCurrentAdmin } from '@/lib/actions/admin-auth'

export async function GET(req: Request) {
  try {
    // This route reads contact submissions (name, email, phone, message) via the
    // service-role client, which bypasses RLS — it must gate on admin auth itself.
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin || !currentAdmin.is_active) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!['SUPER_ADMIN', 'ADMIN'].includes(currentAdmin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const supabase = createServiceRoleClient()
    const { data, error } = await supabase.from('contact_submissions').select('*').eq('id', id).single()
    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const json = JSON.stringify(data, null, 2)
    return new Response(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="support-${id}.json"`,
      },
    })
  } catch (err) {
    console.error('Export error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
