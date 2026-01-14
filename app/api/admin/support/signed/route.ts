import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const path = url.searchParams.get('path')
    if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 })

    const supabase = createServiceRoleClient()
    const { data } = await supabase.storage.from('support-screenshots').createSignedUrl(path, 60 * 60)
    return NextResponse.json({ url: data?.signedUrl || null })
  } catch (err) {
    console.error('Signed url error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
