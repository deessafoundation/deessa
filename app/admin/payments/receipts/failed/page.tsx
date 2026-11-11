import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { redirect } from "next/navigation"
import { FailedReceiptsClient } from "./failed-receipts-client"
import { canViewFinance, type AdminRole } from "@/lib/types/admin"
import Link from "next/link"
import { ArrowLeft, FileX, RefreshCw } from "lucide-react"

export const metadata = {
  title: "Failed Receipts Dead-Letter Queue | Admin",
  description: "Inspect receipt PDF generation failures and retry dispatch",
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

export default async function FailedReceiptsPage() {
  const role = await checkFinancePermission()
  if (!role) {
    redirect("/admin/login")
  }

  const serviceSupabase = createServiceRoleClient()

  // Fetch unresolved receipt failures with donation details
  const { data: failures, error } = await serviceSupabase
    .from("receipt_failures")
    .select(
      `
      *,
      donations (
        id,
        amount,
        currency,
        donor_name,
        donor_email,
        created_at,
        payment_status
      )
    `
    )
    .is("resolved_at", null)
    .order("last_attempt_at", { ascending: false })

  if (error) {
    console.error("Error fetching receipt failures:", error)
  }

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
            <span className="font-semibold text-foreground">Failed Receipts DLQ</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shadow-2xs">
              <FileX className="size-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Failed Receipts Dead-Letter Queue
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Review automated PDF generation exceptions, inspect stack traces, and manually retry
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/payments/monitoring"
            className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/40 transition-colors"
          >
            Delivery Metrics &rarr;
          </Link>
        </div>
      </div>

      <FailedReceiptsClient failures={failures || []} />
    </div>
  )
}
