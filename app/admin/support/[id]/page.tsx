import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, ImageIcon } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import SupportScreenshotModal from "@/components/admin/support-screenshot-modal"
import SupportActions from "@/components/admin/support-actions"
import SupportDetailClient from "@/components/admin/support/support-detail-client"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata = { title: "Support Detail | Admin" }

interface Props {
  params: Promise<{ id: string }>
}

function formatTs(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

async function getReport(id: string) {
  const supabase = await createClient()
  const { data } = await supabase.from("contact_submissions").select("*").eq("id", id).single()
  return data || null
}

async function getSignedScreenshotUrl(path: string) {
  const supabase = createServiceRoleClient()
  const { data } = await supabase.storage.from("support-screenshots").createSignedUrl(path, 60 * 60)
  return data?.signedUrl || null
}

async function getAdminDirectory() {
  const supabase = createServiceRoleClient()
  const { data } = await supabase.from("admin_users").select("full_name, email, user_id")
  return data || []
}

async function getActions(id: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('support_admin_actions').select('*').eq('report_id', id).order('created_at', { ascending: false })
  return data || []
}

export default async function SupportReportDetail({ params }: Props) {
  const { id } = await params
  const report = await getReport(id)
  if (!report) notFound()

  const screenshotUrl = report.screenshot_path ? await getSignedScreenshotUrl(report.screenshot_path) : null
  const actions = await getActions(id)
  const adminUsers = await getAdminDirectory()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/support" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="size-4" />
          Support
        </Link>
      </div>

      <SupportDetailClient report={report} screenshotUrl={screenshotUrl} actions={actions} adminUsers={adminUsers} />
    </div>
  )
}
