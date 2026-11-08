import { NextRequest, NextResponse } from "next/server"
import { verifyAdminApiRequest } from "@/lib/supabase/admin-auth-guard"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminApiRequest(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  if (!auth.success) return auth.response

  try {
    const { id } = await params
    const supabase = auth.supabase

    const { data: categories, error } = await supabase
      .from("partner_categories")
      .select("*")
      .eq("context_type", "event")
      .eq("context_id", id)
      .order("display_order", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ categories: categories || [] })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
