import { NextRequest, NextResponse } from "next/server"
import { verifyAdminApiRequest } from "@/lib/supabase/admin-auth-guard"
import {
  fetchUnifiedPayments,
  type PaymentType,
  type UnifiedPaymentRecord as PaymentRecord,
} from "@/lib/data/payments"

export type { PaymentType, PaymentRecord }

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdminApiRequest(["SUPER_ADMIN", "ADMIN", "FINANCE"])
    if (!auth.success) return auth.response

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "0", 10)
    const limit = parseInt(searchParams.get("limit") || "25", 10)
    const type = searchParams.get("type") || "all"
    const status = searchParams.get("status") || "all"
    const provider = searchParams.get("provider") || "all"
    const search = searchParams.get("search") || ""
    const dateFrom = searchParams.get("dateFrom") || undefined
    const dateTo = searchParams.get("dateTo") || undefined
    const showArchived = searchParams.get("showArchived") === "true"

    const result = await fetchUnifiedPayments({
      page,
      limit,
      type,
      status,
      provider,
      search,
      dateFrom,
      dateTo,
      showArchived,
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error("Unified payments API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
