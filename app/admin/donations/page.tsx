import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, ShieldCheck, FileText } from "lucide-react"
import { canViewFinance, type AdminRole } from "@/lib/types/admin"
import Link from "next/link"
import { DonationsDashboard } from "@/components/admin/donations/donations-table-client"

export const metadata: Metadata = {
  title: "Donations Ledger | Admin",
  description: "Track, inspect, and manage financial contributions and donor transactions.",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

const PAGE_SIZE = 25

async function checkFinancePermission() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role, is_active")
    .eq("user_id", user.id)
    .single()

  if (!adminUser || !adminUser.is_active) return false

  return canViewFinance(adminUser.role as AdminRole)
}

async function getDonations() {
  const supabase = await createClient()
  const { data, count } = await supabase
    .from("donations")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(0, PAGE_SIZE - 1)
  return { donations: data || [], total: count || 0 }
}

async function getDonationStats() {
  const supabase = await createClient()

  const { data: donations } = await supabase
    .from("donations")
    .select("amount, is_monthly, payment_status, currency")

  const totals =
    donations?.reduce((acc, d) => {
      if (d.payment_status === "completed") {
        const currency = d.currency || "NPR"
        acc[currency] = (acc[currency] || 0) + (d.amount || 0)
      }
      return acc
    }, {} as Record<string, number>) || {}

  const monthlyDonors =
    donations?.filter((d) => d.is_monthly && d.payment_status === "completed").length || 0
  const totalDonors =
    donations?.filter((d) => d.payment_status === "completed").length || 0
  const pendingCount =
    donations?.filter((d) => d.payment_status === "pending" || d.payment_status === "review").length || 0
  const failedCount =
    donations?.filter((d) => d.payment_status === "failed").length || 0

  return { totals, monthlyDonors, totalDonors, pendingCount, failedCount }
}

async function getReviewQueueCount() {
  const supabase = await createClient()
  const { count } = await supabase
    .from("donations")
    .select("id", { count: "exact", head: true })
    .eq("payment_status", "review")
  return count || 0
}

export default async function DonationsPage() {
  const hasAccess = await checkFinancePermission()
  if (!hasAccess) {
    redirect("/admin")
  }

  const [{ donations, total }, stats, reviewCount] = await Promise.all([
    getDonations(),
    getDonationStats(),
    getReviewQueueCount(),
  ])

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <FileText className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Donations</h1>
                <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5">
                  {total} records
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Audit, track, and manage verified donor contributions across all currencies.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 shadow-2xs">
            <Link href="/verify">
              <ShieldCheck className="size-4" />
              <span>Verify Receipt</span>
            </Link>
          </Button>

          <Button asChild size="sm" className="h-9 gap-1.5 shadow-2xs font-semibold">
            <Link href="/admin/donations/review">
              <span>Review Queue</span>
              {reviewCount > 0 ? (
                <span className="bg-amber-400 text-amber-950 font-bold px-1.5 py-0.2 rounded-full text-[11px]">
                  {reviewCount}
                </span>
              ) : (
                <ExternalLink className="size-3.5" />
              )}
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Main Dashboard (Stats Strip + Shimmer Scope Rail + Table / Bento) ── */}
      <DonationsDashboard
        initialDonations={donations}
        initialTotal={total}
        initialStats={stats}
        pageSize={PAGE_SIZE}
      />
    </div>
  )
}
