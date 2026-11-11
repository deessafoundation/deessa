import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { canViewFinance, type AdminRole } from "@/lib/types/admin"
import { ReviewAuditClient, type AuditEvent } from "@/components/admin/donations/review-audit-client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, History } from "lucide-react"

export const metadata: Metadata = {
  title: "Review Audit Trail | Admin",
  description: "View comprehensive audit trail and historical logs of all donation review actions.",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

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

async function getReviewAuditTrail(): Promise<AuditEvent[]> {
  const serviceSupabase = createServiceRoleClient()

  // Fetch payment events for review actions with joined donation record
  const { data: events, error } = await serviceSupabase
    .from("payment_events")
    .select(`
      *,
      donations (
        id,
        amount,
        currency,
        donor_name,
        donor_email,
        payment_status,
        provider,
        receipt_number
      )
    `)
    .in("event_type", ["review_approved", "review_rejected"])
    .order("created_at", { ascending: false })
    .limit(300)

  if (error) {
    console.error("Error fetching audit trail:", error.message || error)
    return []
  }

  return (events || []) as unknown as AuditEvent[]
}

export default async function ReviewAuditPage() {
  const hasAccess = await checkFinancePermission()
  if (!hasAccess) {
    redirect("/admin")
  }

  const auditEvents = await getReviewAuditTrail()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-muted-foreground">
            <Link
              href="/admin/donations"
              className="hover:text-foreground transition-colors"
            >
              Donations Ledger
            </Link>
            <span>/</span>
            <Link
              href="/admin/donations/review"
              className="hover:text-foreground transition-colors"
            >
              Review Queue
            </Link>
            <span>/</span>
            <span className="text-foreground">Audit Trail</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <History className="size-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Review Audit Trail
                </h1>
                <Badge
                  variant="outline"
                  className="text-xs font-semibold px-2 py-0.5 border-primary/30 text-primary bg-primary/10"
                >
                  {auditEvents.length} logged
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Immutable chronological log of all donation approvals, rejections, and administrative notes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 shadow-2xs font-medium text-xs">
            <Link href="/admin/donations/review">
              <ArrowLeft className="size-3.5" />
              <span>Review Queue</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Client Audit Dashboard */}
      <ReviewAuditClient events={auditEvents} />
    </div>
  )
}
