import { NextResponse } from "next/server"
import { verifyAdminApiRequest } from "@/lib/supabase/admin-auth-guard"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminApiRequest(["SUPER_ADMIN", "ADMIN"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params
    const supabase = auth.supabase

    const { data } = await supabase
      .from("event_email_templates")
      .select("*")
      .eq("event_id", id)
      .order("template_type")

    return NextResponse.json({ templates: data || [] })
  } catch (error) {
    console.error("Error fetching email templates:", error)
    return NextResponse.json({ templates: [] })
  }
}
