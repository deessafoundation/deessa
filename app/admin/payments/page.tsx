import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Settings, CreditCard } from "lucide-react"
import { canViewFinance, type AdminRole } from "@/lib/types/admin"
import Link from "next/link"
import { PaymentsDashboard } from "@/components/admin/payments/payments-table-client"

export const metadata = {
  title: "Payments | Admin",
  description: "Unified payment records across all modules",
}

const PAGE_SIZE = 25

async function checkFinancePermission() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data: adminUser } = await supabase.from("admin_users").select("role").eq("user_id", user.id).single()

  if (!adminUser) return false

  return canViewFinance(adminUser.role as AdminRole)
}

export default async function PaymentsPage() {
  const hasAccess = await checkFinancePermission()
  if (!hasAccess) {
    redirect("/admin")
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
              <p className="text-sm text-muted-foreground">
                Unified view of all payments across donations, events, and conferences
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/payments/operations" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Operations
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Dashboard (stats + filters + table) ─────────────────────── */}
      <PaymentsDashboard
        initialPayments={[]}
        initialTotal={0}
        initialStats={{ totalAmount: 0, byType: {}, byStatus: {}, byProvider: {} }}
        pageSize={PAGE_SIZE}
      />
    </div>
  )
}
