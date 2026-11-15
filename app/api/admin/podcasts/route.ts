import { NextRequest, NextResponse } from "next/server"
import { verifyAdminApiRequest } from "@/lib/supabase/admin-auth-guard"
import { logAdminActivity } from "@/lib/audit/audit-logger"

export async function GET(_request: NextRequest) {
  const auth = await verifyAdminApiRequest(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  if (!auth.success) return auth.response

  try {
    const { data, error } = await auth.supabase
      .from("podcasts")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminApiRequest(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  if (!auth.success) return auth.response

  try {
    const body = await request.json()
    const now = new Date().toISOString()

    const { data, error } = await auth.supabase
      .from("podcasts")
      .insert({
        ...body,
        created_at: now,
        updated_at: now,
        published_at: body.published ? now : null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAdminActivity({
      actorId: auth.adminUser.user_id,
      actorEmail: auth.adminUser.email,
      actorRole: auth.adminUser.role,
      action: "PODCAST_CREATED",
      domain: "CONTENT",
      entityType: "podcasts",
      entityId: data.id,
      summary: `Admin created podcast: "${data.title || "Untitled"}"`,
      newData: data,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
