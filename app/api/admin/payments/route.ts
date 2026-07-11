import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { canViewFinance, type AdminRole } from "@/lib/types/admin"

export type PaymentType = "donation" | "event" | "conference"
export type PaymentRecord = {
  id: string
  type: PaymentType
  name: string
  email: string
  amount: number | null
  currency: string
  provider: string | null
  status: string
  created_at: string
  context: string // event title, "General Donation", "Conference"
  event_id: string | null
  payment_id: string | null
  archived_at: string | null
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .single()

    if (!adminUser || !canViewFinance(adminUser.role as AdminRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "0", 10)
    const limit = parseInt(searchParams.get("limit") || "25", 10)
    const type = searchParams.get("type") // donation | event | conference | all
    const status = searchParams.get("status") // paid | pending | failed | refunded | all
    const provider = searchParams.get("provider") // stripe | khalti | esewa | all
    const search = searchParams.get("search") // name/email search
    const dateFrom = searchParams.get("dateFrom") // ISO date string
    const dateTo = searchParams.get("dateTo") // ISO date string
    const showArchived = searchParams.get("showArchived") === "true"

    const allRecords: PaymentRecord[] = []

    // ── Fetch donations ──────────────────────────────────────────────────────
    if (!type || type === "all" || type === "donation") {
      let donorQuery = supabase
        .from("donations")
        .select("id, donor_name, donor_email, amount, currency, provider, payment_status, created_at, payment_id, archived_at")
        .order("created_at", { ascending: false })
        .limit(500)

      if (!showArchived) {
        donorQuery = donorQuery.is("archived_at", null)
      }

      if (status && status !== "all") {
        // Donations: completed=paid, pending=pending, review=review
        // Events/Conferences: paid=paid, unpaid=pending
        const donorStatusMap: Record<string, string> = {
          paid: "completed",
          pending: "pending",
          failed: "failed",
          refunded: "refunded",
          review: "review",
        }
        donorQuery = donorQuery.eq("payment_status", donorStatusMap[status] || status)
      }
      if (provider && provider !== "all") {
        donorQuery = donorQuery.eq("provider", provider)
      }
      if (search) {
        donorQuery = donorQuery.or(`donor_name.ilike.%${search}%,donor_email.ilike.%${search}%`)
      }
      if (dateFrom) {
        donorQuery = donorQuery.gte("created_at", dateFrom)
      }
      if (dateTo) {
        donorQuery = donorQuery.lte("created_at", dateTo)
      }

      const { data: donations } = await donorQuery
      if (donations) {
        for (const d of donations) {
          allRecords.push({
            id: d.id,
            type: "donation",
            name: d.donor_name || "Unknown",
            email: d.donor_email || "",
            amount: d.amount,
            currency: d.currency || "NPR",
            provider: d.provider,
            status: d.payment_status || "pending",
            created_at: d.created_at,
            context: "General Donation",
            event_id: null,
            payment_id: d.payment_id,
            archived_at: d.archived_at || null,
          })
        }
      }
    }

    // ── Fetch event registrations ────────────────────────────────────────────
    if (!type || type === "all" || type === "event") {
      let eventQuery = supabase
        .from("event_registrations")
        .select(`
          id, full_name, email, payment_amount, payment_currency,
          payment_provider, payment_status, created_at, payment_id,
          archived_at,
          event:events(id, title)
        `)
        .order("created_at", { ascending: false })
        .limit(500)

      if (!showArchived) {
        eventQuery = eventQuery.is("archived_at", null)
      }

      if (status && status !== "all") {
        // Events use: paid, unpaid, failed, refunded
        const eventStatusMap: Record<string, string> = {
          paid: "paid",
          pending: "unpaid",
          failed: "failed",
          refunded: "refunded",
        }
        eventQuery = eventQuery.eq("payment_status", eventStatusMap[status] || status)
      }
      if (provider && provider !== "all") {
        eventQuery = eventQuery.eq("payment_provider", provider)
      }
      if (search) {
        eventQuery = eventQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      }
      if (dateFrom) {
        eventQuery = eventQuery.gte("created_at", dateFrom)
      }
      if (dateTo) {
        eventQuery = eventQuery.lte("created_at", dateTo)
      }

      const { data: eventRegs } = await eventQuery
      if (eventRegs) {
        for (const e of eventRegs) {
          const evt = (e as any).event as { id: string; title: string } | null
          allRecords.push({
            id: e.id,
            type: "event",
            name: e.full_name || "Unknown",
            email: e.email || "",
            amount: e.payment_amount,
            currency: e.payment_currency || "NPR",
            provider: e.payment_provider,
            status: e.payment_status || "unpaid",
            created_at: e.created_at,
            context: evt?.title || "Event",
            event_id: evt?.id || null,
            payment_id: e.payment_id,
            archived_at: (e as any).archived_at || null,
          })
        }
      }
    }

    // ── Fetch conference registrations ───────────────────────────────────────
    if (!type || type === "all" || type === "conference") {
      let confQuery = supabase
        .from("conference_registrations")
        .select(`
          id, full_name, email, payment_amount, payment_currency,
          payment_provider, payment_status, created_at, payment_id,
          archived_at
        `)
        .order("created_at", { ascending: false })
        .limit(500)

      if (!showArchived) {
        confQuery = confQuery.is("archived_at", null)
      }

      if (status && status !== "all") {
        // Conferences use same statuses as events: paid, unpaid, failed, refunded
        const confStatusMap: Record<string, string> = {
          paid: "paid",
          pending: "unpaid",
          failed: "failed",
          refunded: "refunded",
        }
        confQuery = confQuery.eq("payment_status", confStatusMap[status] || status)
      }
      if (provider && provider !== "all") {
        confQuery = confQuery.eq("payment_provider", provider)
      }
      if (search) {
        confQuery = confQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      }
      if (dateFrom) {
        confQuery = confQuery.gte("created_at", dateFrom)
      }
      if (dateTo) {
        confQuery = confQuery.lte("created_at", dateTo)
      }

      const { data: confRegs } = await confQuery
      if (confRegs) {
        for (const c of confRegs) {
          allRecords.push({
            id: c.id,
            type: "conference",
            name: c.full_name || "Unknown",
            email: c.email || "",
            amount: c.payment_amount,
            currency: c.payment_currency || "NPR",
            provider: c.payment_provider,
            status: c.payment_status || "unpaid",
            created_at: c.created_at,
            context: "Conference",
            event_id: null,
            payment_id: c.payment_id,
            archived_at: (c as any).archived_at || null,
          })
        }
      }
    }

    // ── Sort by date (newest first) ──────────────────────────────────────────
    allRecords.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // ── Compute stats ────────────────────────────────────────────────────────
    const totalAmount = allRecords
      .filter((r) => {
        const s = r.status.toLowerCase()
        return s === "paid" || s === "completed"
      })
      .reduce((sum, r) => sum + (r.amount || 0), 0)

    const byType: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    const byProvider: Record<string, number> = {}
    for (const r of allRecords) {
      byType[r.type] = (byType[r.type] || 0) + 1
      byStatus[r.status] = (byStatus[r.status] || 0) + 1
      if (r.provider) {
        byProvider[r.provider] = (byProvider[r.provider] || 0) + 1
      }
    }

    // ── Paginate ─────────────────────────────────────────────────────────────
    const total = allRecords.length
    const from = page * limit
    const to = from + limit - 1
    const paginated = allRecords.slice(from, to + 1)

    return NextResponse.json({
      payments: paginated,
      total,
      page,
      limit,
      hasMore: to < total - 1,
      stats: {
        totalAmount,
        byType,
        byStatus,
        byProvider,
      },
    })
  } catch (err) {
    console.error("Unified payments API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
