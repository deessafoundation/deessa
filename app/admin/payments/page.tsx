import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Settings, CreditCard, Activity, ArrowUpRight } from "lucide-react"
import { canViewFinance, type AdminRole } from "@/lib/types/admin"
import Link from "next/link"
import { PaymentsDashboard } from "@/components/admin/payments/payments-table-client"
import { fetchUnifiedPayments } from "@/lib/data/payments"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Payments Ledger | Admin",
  description: "Unified multi-source financial clearinghouse across donations, events, and conferences",
}

const PAGE_SIZE = 25

async function checkFinancePermission() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .single()

  if (!adminUser) return false

  return canViewFinance(adminUser.role as AdminRole)
}

export default async function PaymentsPage() {
  const hasAccess = await checkFinancePermission()
  if (!hasAccess) {
    redirect("/admin")
  }

  // Server-side prefetch for zero-CLS instantaneous rendering
  const initialData = await fetchUnifiedPayments({
    page: 0,
    limit: PAGE_SIZE,
    type: "all",
    status: "all",
    provider: "all",
    showArchived: false,
  })

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-2xs">
            <CreditCard className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Master Payments Ledger
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 tabular-nums">
                {initialData.total} records
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Consolidated transactions across Donations, Events, and Conferences
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button asChild variant="outline" size="sm" className="h-9 font-medium shadow-2xs">
            <Link href="/admin/payments/monitoring" className="flex items-center gap-1.5">
              <Activity className="size-3.5 text-primary" />
              <span>Monitoring</span>
            </Link>
          </Button>

          <Button asChild size="sm" className="h-9 font-medium gap-1.5 shadow-2xs">
            <Link href="/admin/payments/operations">
              <Settings className="size-3.5" />
              <span>Operations Hub</span>
              <ArrowUpRight className="size-3 opacity-70" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Payments Dashboard (KPI Strip + Scope Tabs + Filters + Table & Bento Cards) ── */}
      <PaymentsDashboard
        initialPayments={initialData.payments}
        initialTotal={initialData.total}
        initialStats={initialData.stats}
        pageSize={PAGE_SIZE}
      />
    </div>
  )
}
