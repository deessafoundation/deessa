import { createServiceRoleClient } from "@/lib/supabase/service"

export type PaymentType = "donation" | "event" | "conference"

export interface UnifiedPaymentRecord {
  id: string
  type: PaymentType
  name: string
  email: string
  amount: number | null
  currency: string
  provider: string | null
  status: string
  created_at: string
  context: string
  event_id: string | null
  payment_id: string | null
  archived_at: string | null
  has_slip?: boolean
}

export interface PaymentStats {
  totalAmount: number
  totalCount: number
  byType: {
    donation: number
    event: number
    conference: number
  }
  byStatus: {
    paid: number
    pending: number
    failed: number
    refunded: number
    review: number
  }
  byProvider: Record<string, number>
}

export interface GetUnifiedPaymentsOptions {
  page?: number
  limit?: number
  type?: string
  status?: string
  provider?: string
  search?: string
  dateFrom?: string
  dateTo?: string
  showArchived?: boolean
}

export interface GetUnifiedPaymentsResult {
  payments: UnifiedPaymentRecord[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  stats: PaymentStats
}

export async function fetchUnifiedPayments(
  options: GetUnifiedPaymentsOptions = {}
): Promise<GetUnifiedPaymentsResult> {
  const {
    page = 0,
    limit = 25,
    type = "all",
    status = "all",
    provider = "all",
    search = "",
    dateFrom,
    dateTo,
    showArchived = false,
  } = options

  const supabase = createServiceRoleClient()
  const allRecords: UnifiedPaymentRecord[] = []

  // 1. Fetch Donations
  if (!type || type === "all" || type === "donation") {
    let query = supabase
      .from("donations")
      .select(`
        id,
        donor_name,
        donor_email,
        amount,
        currency,
        provider,
        payment_status,
        created_at,
        payment_id,
        archived_at,
        bank_proof_path
      `)
      .order("created_at", { ascending: false })
      .limit(500)

    if (!showArchived) {
      query = query.is("archived_at", null)
    }

    if (status && status !== "all") {
      const donorStatusMap: Record<string, string> = {
        paid: "completed",
        pending: "pending",
        failed: "failed",
        refunded: "refunded",
        review: "review",
      }
      query = query.eq("payment_status", donorStatusMap[status] || status)
    }

    if (provider && provider !== "all") {
      query = query.eq("provider", provider)
    }

    if (search.trim()) {
      query = query.or(`donor_name.ilike.%${search.trim()}%,donor_email.ilike.%${search.trim()}%`)
    }

    if (dateFrom) {
      query = query.gte("created_at", dateFrom)
    }
    if (dateTo) {
      query = query.lte("created_at", dateTo)
    }

    const { data: donations, error: donationsErr } = await query
    if (donationsErr) {
      console.error("[fetchUnifiedPayments] donations query error:", donationsErr)
    }

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
          has_slip: Boolean(d.bank_proof_path),
        })
      }
    }
  }

  // 2. Fetch Event Registrations
  if (!type || type === "all" || type === "event") {
    let query = supabase
      .from("event_registrations")
      .select(`
        id,
        full_name,
        email,
        payment_amount,
        payment_currency,
        payment_provider,
        payment_status,
        created_at,
        payment_id,
        archived_at,
        payment_screenshot_url,
        event:events(id, title)
      `)
      .order("created_at", { ascending: false })
      .limit(500)

    if (!showArchived) {
      query = query.is("archived_at", null)
    }

    if (status && status !== "all") {
      const eventStatusMap: Record<string, string> = {
        paid: "paid",
        pending: "unpaid",
        failed: "failed",
        refunded: "refunded",
      }
      if (eventStatusMap[status]) {
        query = query.eq("payment_status", eventStatusMap[status])
      }
    }

    if (provider && provider !== "all") {
      query = query.eq("payment_provider", provider)
    }

    if (search.trim()) {
      query = query.or(`full_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`)
    }

    if (dateFrom) {
      query = query.gte("created_at", dateFrom)
    }
    if (dateTo) {
      query = query.lte("created_at", dateTo)
    }

    const { data: eventRegs, error: eventsErr } = await query
    if (eventsErr) {
      console.error("[fetchUnifiedPayments] events query error:", eventsErr)
    }

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
          has_slip: Boolean(e.payment_screenshot_url),
        })
      }
    }
  }

  // 3. Fetch Conference Registrations
  if (!type || type === "all" || type === "conference") {
    let query = supabase
      .from("conference_registrations")
      .select(`
        id,
        full_name,
        email,
        payment_amount,
        payment_currency,
        payment_provider,
        payment_status,
        created_at,
        payment_id,
        archived_at
      `)
      .order("created_at", { ascending: false })
      .limit(500)

    if (!showArchived) {
      query = query.is("archived_at", null)
    }

    if (status && status !== "all") {
      const confStatusMap: Record<string, string> = {
        paid: "paid",
        pending: "unpaid",
        failed: "failed",
        refunded: "refunded",
      }
      if (confStatusMap[status]) {
        query = query.eq("payment_status", confStatusMap[status])
      }
    }

    if (provider && provider !== "all") {
      query = query.eq("payment_provider", provider)
    }

    if (search.trim()) {
      query = query.or(`full_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`)
    }

    if (dateFrom) {
      query = query.gte("created_at", dateFrom)
    }
    if (dateTo) {
      query = query.lte("created_at", dateTo)
    }

    const { data: confRegs, error: confsErr } = await query
    if (confsErr) {
      console.error("[fetchUnifiedPayments] conference query error:", confsErr)
    }

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
          has_slip: false,
        })
      }
    }
  }

  // 4. Sort chronologically (newest first)
  allRecords.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // 5. Compute global statistics across retrieved pool
  let totalAmount = 0
  const byType = { donation: 0, event: 0, conference: 0 }
  const byStatus = { paid: 0, pending: 0, failed: 0, refunded: 0, review: 0 }
  const byProvider: Record<string, number> = {}

  for (const r of allRecords) {
    // Type counters
    if (r.type in byType) {
      byType[r.type as keyof typeof byType]++
    }

    // Status counters (normalized)
    const norm = (r.status || "").toLowerCase()
    if (norm === "paid" || norm === "completed") {
      byStatus.paid++
      totalAmount += r.amount || 0
    } else if (norm === "pending" || norm === "unpaid") {
      byStatus.pending++
    } else if (norm === "failed") {
      byStatus.failed++
    } else if (norm === "refunded") {
      byStatus.refunded++
    } else if (norm === "review") {
      byStatus.review++
    }

    // Provider counters
    const p = (r.provider || "other").toLowerCase()
    byProvider[p] = (byProvider[p] || 0) + 1
  }

  // 6. Paginate
  const total = allRecords.length
  const from = page * limit
  const to = from + limit - 1
  const paginated = allRecords.slice(from, to + 1)

  return {
    payments: paginated,
    total,
    page,
    limit,
    hasMore: to < total - 1,
    stats: {
      totalAmount,
      totalCount: total,
      byType,
      byStatus,
      byProvider,
    },
  }
}
