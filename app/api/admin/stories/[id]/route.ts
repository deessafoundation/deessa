import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { verifyAdminApiRequest } from "@/lib/supabase/admin-auth-guard"
import { logAdminActivity } from "@/lib/audit/audit-logger"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminApiRequest(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  if (!auth.success) return auth.response

  try {
    const body = await request.json()
    const { id } = await params

    const isPublished =
      typeof body.is_published === "boolean"
        ? body.is_published
        : typeof body.published === "boolean"
          ? body.published
          : undefined

    const isFeatured =
      typeof body.is_featured === "boolean"
        ? body.is_featured
        : typeof body.featured === "boolean"
          ? body.featured
          : undefined

    if (isPublished === undefined && isFeatured === undefined) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (isPublished !== undefined) updateData.is_published = isPublished
    if (isFeatured !== undefined) updateData.is_featured = isFeatured

    if (isPublished) {
      const { data: existing, error: existingError } = await auth.supabase
        .from("stories")
        .select("published_at")
        .eq("id", id)
        .single()

      if (existingError) {
        return NextResponse.json({ error: existingError.message }, { status: 500 })
      }

      if (!existing?.published_at) {
        updateData.published_at = new Date().toISOString()
      }
    }

    const { data, error } = await auth.supabase
      .from("stories")
      .update(updateData)
      .eq("id", id)
      .select("id, is_published, is_featured")
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAdminActivity({
      actorId: auth.adminUser.user_id,
      actorEmail: auth.adminUser.email,
      actorRole: auth.adminUser.role,
      action: "STORY_UPDATED",
      domain: "CONTENT",
      entityType: "stories",
      entityId: id,
      summary: `Admin updated story ${id} (published: ${data.is_published}, featured: ${data.is_featured})`,
      newData: data,
    })

    revalidatePath("/admin/stories")
    revalidatePath("/stories")

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminApiRequest(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params

    const { error } = await auth.supabase.from("stories").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAdminActivity({
      actorId: auth.adminUser.user_id,
      actorEmail: auth.adminUser.email,
      actorRole: auth.adminUser.role,
      action: "STORY_DELETED",
      domain: "CONTENT",
      entityType: "stories",
      entityId: id,
      summary: `Admin deleted story ${id}`,
      oldData: { id },
    })

    revalidatePath("/admin/stories")
    revalidatePath("/stories")

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
