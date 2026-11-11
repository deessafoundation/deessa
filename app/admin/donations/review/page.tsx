import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { canViewFinance, type AdminRole } from "@/lib/types/admin"
import { ReviewDashboardClient } from "@/components/admin/donations/review-dashboard-client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, ShieldAlert } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Review Queue | Admin",
  description: "Triage and resolve flagged donations, currency discrepancies, and unverified transactions.",
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

async function getReviewDonations() {
  const serviceSupabase = createServiceRoleClient()

  try {
    // Fetch donations in REVIEW status
    const { data: donations, error } = await serviceSupabase
      .from("donations")
      .select("*")
      .eq("payment_status", "review")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching review donations:", error)
      return []
    }

    if (!donations || donations.length === 0) {
      return []
    }

    const donationIds = donations.map((d) => d.id)
    const { data: events } = await serviceSupabase
      .from("payment_events")
      .select("*")
      .in("donation_id", donationIds)
      .order("created_at", { ascending: false })

    // Generate signed URLs for bank transfer deposit slips and attach payment events
    const donationsWithExtras = await Promise.all(
      donations.map(async (donation) => {
        let bankProofUrl: string | null = null
        if (donation.bank_proof_path) {
          try {
            const { data: signed } = await serviceSupabase
              .storage.from("bank-transfer-proofs")
              .createSignedUrl(donation.bank_proof_path, 60 * 60)
            bankProofUrl = signed?.signedUrl ?? null
          } catch (e) {
            console.warn("Failed to create signed URL for bank slip:", e)
          }
        }

        return {
          ...donation,
          bank_proof_url: bankProofUrl,
          payment_events: events?.filter((e) => e.donation_id === donation.id) || [],
        }
      })
    )

    return donationsWithExtras
  } catch (error) {
    console.error("Error in getReviewDonations:", error)
    return []
  }
}

export default async function ReviewDonationsPage() {
  const hasAccess = await checkFinancePermission()
  if (!hasAccess) {
    redirect("/admin")
  }

  const donations = await getReviewDonations()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-muted-foreground">
            <Link
              href="/admin/donations"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>Donations Ledger</span>
            </Link>
            <span>/</span>
            <span className="text-foreground">Review Queue</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Review Queue
                </h1>
                <Badge
                  variant="outline"
                  className="text-xs font-semibold px-2 py-0.5 border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10"
                >
                  {donations.length} awaiting triage
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Audit and resolve flagged donations, bank deposit slips, and gateway discrepancies.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 shadow-2xs font-medium text-xs">
            <Link href="/admin/donations/review/audit">
              <FileText className="size-3.5" />
              <span>Audit History</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Review Dashboard */}
      <ReviewDashboardClient donations={donations} />
    </div>
  )
}
