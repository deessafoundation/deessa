import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { getCurrentAdmin } from '@/lib/actions/admin-auth'

export async function GET(req: Request) {
  try {
    // Mints signed URLs for private support screenshots via the service-role
    // client, which bypasses RLS — it must gate on admin auth itself.
    const currentAdmin = await getCurrentAdmin()
    if (!currentAdmin || !currentAdmin.is_active) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!['SUPER_ADMIN', 'ADMIN'].includes(currentAdmin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const url = new URL(req.url)
    const path = url.searchParams.get('path')
    if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 })

    // Reject traversal segments and absolute paths so a caller cannot escape the bucket.
    if (path.includes('..') || path.startsWith('/')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()
    const { data } = await supabase.storage.from('support-screenshots').createSignedUrl(path, 60 * 60)
    return NextResponse.json({ url: data?.signedUrl || null })
  } catch (err) {
    console.error('Signed url error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
