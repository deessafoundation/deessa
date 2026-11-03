import { NextResponse } from "next/server"
import { verifyAdminApiRequest } from "@/lib/supabase/admin-auth-guard"

export async function GET() {
  const auth = await verifyAdminApiRequest(["SUPER_ADMIN", "ADMIN", "EDITOR"])
  if (!auth.success) return auth.response

  try {
    const { data: events, error } = await auth.supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching events:", error)
      return NextResponse.json({ events: [] }, { status: 500 })
    }

    return NextResponse.json({ events: events || [] })
  } catch (error) {
    console.error("Error in events API:", error)
    return NextResponse.json({ events: [] }, { status: 500 })
  }
}
