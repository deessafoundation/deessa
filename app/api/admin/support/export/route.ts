import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

export async function GET(req: Request) {
  try {
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
