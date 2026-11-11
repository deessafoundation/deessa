import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { redirect } from "next/navigation"
import { LogsClient } from "./logs-client"
import { canViewFinance, type AdminRole } from "@/lib/types/admin"
import Link from "next/link"
import { ArrowLeft, ScrollText } from "lucide-react"

export const metadata = {
  title: "Payment Event Logs | Admin",
  description: "View and inspect gateway webhook event logs and raw telemetry",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

async function checkFinancePermission() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single()

  if (!adminUser || !canViewFinance(adminUser.role as AdminRole)) return null

  return adminUser.role
}

async function getPaymentLogs(filters?: {
  provider?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: string
}) {
  const serviceSupabase = createServiceRoleClient()
  const pageNum = Math.max(1, parseInt(filters?.page || "1", 10))
  const pageSize = 50
  const from = (pageNum - 1) * pageSize
  const to = from + pageSize - 1

  let query = serviceSupabase
    .from("payment_events")
    .select("*, donations(id, donor_name, donor_email, amount, currency)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  // Apply filters
  if (filters?.provider && filters.provider !== "all") {
    query = query.eq("provider", filters.provider)
  }

  if (filters?.dateFrom) {
    query = query.gte("created_at", filters.dateFrom)
  }

  if (filters?.dateTo) {
    query = query.lte("created_at", filters.dateTo)
  }

  const { data: logs, count, error } = await query

  if (error) {
    console.error("Error fetching logs:", error)
    return { logs: [], totalCount: 0, page: pageNum, pageSize }
  }

  // Apply search filter if needed
  let filteredLogs = logs || []
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase()
    filteredLogs = filteredLogs.filter(
      (log: any) =>
        log.event_id?.toLowerCase().includes(searchLower) ||
        log.donation_id?.toLowerCase().includes(searchLower) ||
        log.donations?.donor_name?.toLowerCase().includes(searchLower) ||
        log.donations?.donor_email?.toLowerCase().includes(searchLower)
    )
  }

  return {
    logs: filteredLogs,
    totalCount: count || filteredLogs.length,
    page: pageNum,
    pageSize,
  }
}

async function getLogStats() {
  const serviceSupabase = createServiceRoleClient()
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [total, last24hCount, last7dCount] = await Promise.all([
    serviceSupabase.from("payment_events").select("id", { count: "exact", head: true }),
    serviceSupabase.from("payment_events").select("id", { count: "exact", head: true }).gte("created_at", last24h),
    serviceSupabase.from("payment_events").select("id", { count: "exact", head: true }).gte("created_at", last7d),
  ])

  return {
    total: total.count || 0,
    last24h: last24hCount.count || 0,
    last7d: last7dCount.count || 0,
  }
}

export default async function PaymentLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ provider?: string; dateFrom?: string; dateTo?: string; search?: string; page?: string }>
}) {
  const role = await checkFinancePermission()
  if (!role) {
    redirect("/admin/login")
  }

  const params = await searchParams
  const { logs, totalCount, page, pageSize } = await getPaymentLogs(params)
  const stats = await getLogStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Link
              href="/admin/payments/operations"
              className="hover:text-foreground transition-colors flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="size-3.5" />
              <span>Operations Hub</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-foreground">Payment Event Logs</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xs">
              <ScrollText className="size-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Payment Event Logs
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Inspect raw webhook payloads, gateway callbacks, and transaction telemetry
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/payments"
            className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/40 transition-colors"
          >
            Ledger &rarr;
          </Link>
        </div>
      </div>

      <LogsClient
        logs={logs}
        stats={stats}
        pagination={{
          page,
          pageSize,
          totalCount,
        }}
        initialFilters={{
          provider: params.provider || "all",
          search: params.search || "",
          dateFrom: params.dateFrom || "",
          dateTo: params.dateTo || "",
        }}
      />
    </div>
  )
}
