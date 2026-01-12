import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, ExternalLink, ImageIcon, MessageSquareText, Bug, CheckCircle2, Clock, XCircle, Settings } from "lucide-react"
import { redirect } from "next/navigation"
import { hasPermission, type AdminRole } from "@/lib/types/admin"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ShowArchivedButton from "@/components/admin/support/show-archived-button"

async function checkSupportPermission() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const { data: adminUser } = await supabase.from("admin_users").select("role").eq("user_id", user.id).single()

  if (!adminUser) return false

  return hasPermission(adminUser.role as AdminRole, "contacts")
}

async function getSupportReports(includeArchived: boolean = false) {
  const supabase = await createClient()
  
  let query = supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false })
  
  if (!includeArchived) {
    query = query.eq("archived", false)
  }
  
  const { data } = await query
  return data || []
}

async function getSignedScreenshotUrl(path: string) {
  const supabase = createServiceRoleClient()
  const { data } = await supabase.storage.from("support-screenshots").createSignedUrl(path, 60 * 60)
  return data?.signedUrl || null
}

export default async function SupportAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ showArchived?: string }>
}) {
  const hasAccess = await checkSupportPermission()
  if (!hasAccess) {
    redirect("/admin")
  }

  const params = await searchParams
  const showArchived = params.showArchived === 'true'
  const reports = (await getSupportReports(showArchived)).filter((report) => report.issue_type || report.screenshot_path || report.page_url)

  const reportsWithUrls = await Promise.all(
    reports.map(async (report) => ({
      ...report,
      screenshotUrl: report.screenshot_path ? await getSignedScreenshotUrl(report.screenshot_path) : null,
    }))
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Reports</h1>
          <p className="text-muted-foreground mt-1">Bug reports, feature requests, and feedback from visitors</p>
        </div>
        <div className="flex items-center gap-2">
          <ShowArchivedButton />
          <Button asChild variant="outline" size="sm" className="transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            <Link href="/admin/settings">
              <Settings className="h-4 w-4 mr-2" />
              Manage Support Settings
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reportsWithUrls.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              Closed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {reportsWithUrls.filter((report) => report.status === "closed").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Resolved tickets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {reportsWithUrls.filter((report) => report.status === "in-progress").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Being worked on</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Open
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {reportsWithUrls.filter((report) => !report.status || report.status === "open").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[200px]">Reporter</TableHead>
                <TableHead className="w-[180px]">Type & Status</TableHead>
                <TableHead>Issue Summary</TableHead>
                <TableHead className="w-[120px]">Screenshot</TableHead>
                <TableHead className="w-[140px]">Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportsWithUrls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Bug className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No support reports yet.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                reportsWithUrls.map((report) => {
                  // Fixed color scheme: green=open, yellow=in-progress, red=closed
                  const statusColor = 
                    report.status === 'closed' ? 'bg-red-50 text-red-700 border-red-200' :
                    report.status === 'in-progress' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    'bg-green-50 text-green-700 border-green-200' // open
                  
                  return (
                    <TableRow key={report.id} className="group cursor-pointer">
                      <TableCell>
                        <Link href={`/admin/support/${report.id}`} className="block">
                          <div className="space-y-1">
                            <div className="font-medium group-hover:text-primary transition-colors">{report.name}</div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MessageSquareText className="h-3 w-3" />
                              <span className="truncate">{report.email}</span>
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/support/${report.id}`} className="block">
                          <div className="space-y-2">
                            <Badge variant="secondary" className="gap-1 font-medium">
                              <Bug className="h-3 w-3" />
                              {report.issue_type || report.subject || 'Support'}
                            </Badge>
                            <div className="flex items-center gap-2">
                              <Badge className={`capitalize text-xs ${statusColor}`}>
                                {report.status || 'open'}
                              </Badge>
                              {report.archived && (
                                <Badge variant="outline" className="text-xs border-slate-300 bg-slate-50 text-slate-600">
                                  Archived
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/support/${report.id}`} className="block">
                          <div className="space-y-2">
                            <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                              {report.summary || report.message?.split('\n')[0] || 'No summary'}
                            </p>
                            {report.page_url && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <ExternalLink className="h-3 w-3" />
                                <span className="truncate max-w-[300px]">{report.page_url}</span>
                              </div>
                            )}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/support/${report.id}`} className="block">
                          {report.screenshotUrl ? (
                            <div className="flex items-center gap-1.5 text-sm">
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                              <span className="text-green-700 font-medium">Included</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-sm">
                              <div className="h-2 w-2 rounded-full bg-slate-300"></div>
                              <span className="text-muted-foreground">Not included</span>
                            </div>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/support/${report.id}`} className="block">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(report.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}