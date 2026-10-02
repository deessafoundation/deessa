"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, ShieldAlert, Mail } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import SupportScreenshotModal from '@/components/admin/support/support-screenshot-modal'
import SupportActions from '@/components/admin/support/support-actions'
import InternalNoteModal from '@/components/admin/support/internal-note-modal'
import ReplyModal from './reply-modal'
import DeleteSupportButton from '@/components/admin/support/delete-support-button'
import { ActivityTimeline } from '@/components/admin/donations/activity-timeline'
import { notifications } from '@/lib/notifications'

export function SupportDetailClient({ report, screenshotUrl, actions, adminUsers = [] }: any) {
  const router = useRouter()
  const [archiveLoading, setArchiveLoading] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [localReviewed, setLocalReviewed] = React.useState(report.reviewed)
  const [localStatus, setLocalStatus] = React.useState(report.status || "open")

  // Extract formatted filename from screenshot path
  const getFormattedFilename = () => {
    if (!report.screenshot_path) return null
    // Extract filename from path: "uuid/formatted-name.png" -> "formatted-name.png"
    const parts = report.screenshot_path.split('/')
    return parts[parts.length - 1] || report.screenshot_name
  }

  const formattedFilename = getFormattedFilename()

  // Get assignee name from admin users list
  const getAssigneeName = () => {
    if (!report.assignee) return null
    const admin = adminUsers.find((a: any) => a.email === report.assignee)
    return admin?.full_name || report.assignee
  }

  const assigneeName = getAssigneeName()

  async function callAction(action: string, payload: any = {}) {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/support/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: report.id, action, payload }),
      })

      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()

      if (action === 'mark-reviewed') setLocalReviewed(true)
      if (action === 'change-status') setLocalStatus(payload.status)

      router.refresh()
      return data
    } catch (err) {
      console.error(err)
      alert('Action failed: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const resolveActorName = (value: string | null | undefined) => {
    if (!value) return 'Admin'
    const byEmail = adminUsers.find((admin: any) => admin.email === value)
    if (byEmail?.full_name) return byEmail.full_name
    const byUserId = adminUsers.find((admin: any) => admin.user_id === value)
    if (byUserId?.full_name) return byUserId.full_name
    return value
  }

  const parseInternalNotes = (notes: string | null | undefined) => {
    if (!notes) return []
    return notes
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^\[(.*?)\]\s*(.*?):\s*(.*)$/)
        if (match) {
          return { timestamp: match[1], author: resolveActorName(match[2]), text: match[3] }
        }
        return { timestamp: '', author: '', text: line }
      })
  }

  const formatNoteTime = (iso: string) => {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return iso
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const timelineEvents = (actions || []).map((a: any) => ({
    id: String(a.id),
    type: (a.action_type === 'send-reply' ? 'email' : a.action_type) as any,
    actor: resolveActorName(a.performed_by),
    timestamp: a.created_at,
    description: a.payload?.note || a.action_type,
    metadata: a.payload || undefined,
  }))

  const internalNoteActions = (actions || []).filter((a: any) => a.action_type === 'add-note' && a.payload?.note)
  const internalNoteItems = internalNoteActions.length
    ? internalNoteActions.map((a: any) => ({
        id: String(a.id),
        timestamp: formatNoteTime(a.created_at),
        author: resolveActorName(a.performed_by),
        text: a.payload.note,
      }))
    : parseInternalNotes(report.internal_notes)

  const getStatusBadgeClass = (status: string) => {
    if (status === 'closed') return 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200'
    if (status === 'in-progress') return 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200'
    return 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200' // open
  }

  const handleArchive = async () => {
    setArchiveLoading(true)
    try {
      const action = report.archived ? 'unarchive' : 'archive'
      const res = await fetch('/api/admin/support/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: report.id, action, payload: {} }),
      })
      if (!res.ok) throw new Error(await res.text())
      
      notifications.showSuccess({
        title: report.archived ? "Report unarchived" : "Report archived",
        description: report.archived 
          ? "The support report has been restored to the active list."
          : "The support report has been archived successfully.",
      })
      
      router.push('/admin/support')
      router.refresh()
    } catch (err) {
      console.error('Archive error:', err)
      notifications.showError({
        title: report.archived ? "Unarchive failed" : "Archive failed",
        description: `Failed to ${report.archived ? 'unarchive' : 'archive'} the support report. Please try again.`,
      })
    } finally {
      setArchiveLoading(false)
    }
  }

  return (
    <main className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg">{report.name}</CardTitle>
            <CardDescription className="mt-1">{report.email}</CardDescription>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <Badge className={`capitalize ${getStatusBadgeClass(report.status || 'open')}`}>{report.status || 'open'}</Badge>
              {assigneeName && (
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-100 flex items-center gap-1.5">
                  <span className="text-xs">👤</span>
                  <span className="font-medium">{assigneeName}</span>
                </Badge>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{new Date(report.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-2 sm:mt-0">
            <SupportActions 
              id={report.id} 
              reviewed={report.reviewed} 
              status={report.status} 
              assignee={report.assignee} 
              email={report.email}
              adminUsers={adminUsers}
            />
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6 lg:pt-6">
          <section>
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList className="w-fit">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent>
                      <h3 className="text-sm text-muted-foreground">Short Summary</h3>
                      <p className="mt-2">{(report.message || '').split('\n')[0]}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent>
                      <h3 className="text-sm text-muted-foreground">Context</h3>
                      <p className="mt-2 text-sm">
                        <strong className="block">Page URL:</strong>
                        {report.page_url ? (
                          <a
                            href={report.page_url}
                            target="_blank"
                            rel="noreferrer"
                            className="block break-all underline leading-relaxed"
                          >
                            {report.page_url}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Not provided</span>
                        )}
                      </p>
                      {report.browser_info && <p className="mt-3 text-xs text-muted-foreground">Browser: {report.browser_info}</p>}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent>
                      <h3 className="text-sm text-muted-foreground">Screenshot</h3>
                      <div className="mt-2">
                        {screenshotUrl ? (
                          <>
                            <img src={screenshotUrl} alt={formattedFilename || 'screenshot'} className="h-40 w-full rounded-md object-cover border border-primary/20" />
                            <div className="mt-3">
                              <SupportScreenshotModal url={screenshotUrl} alt={formattedFilename} filename={formattedFilename} trigger={
                                <button className="w-full rounded-md border border-primary px-3 py-2 text-sm bg-primary text-white hover:bg-primary/90 hover:shadow-lg transition cursor-pointer">View</button>
                              } />
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">No screenshot provided</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardContent>
                    <h3 className="text-sm text-muted-foreground">Full Details</h3>
                    <pre className="mt-2 whitespace-pre-wrap text-sm">{report.message}</pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>

          <section>
            <div className="space-y-4">
              <Card>
                <CardContent>
                  <h3 className="text-sm text-muted-foreground">Internal Notes</h3>
                  <div className="mt-2 space-y-3">
                    {internalNoteItems.length > 0 ? (
                      internalNoteItems.map((note: any, index: number) => (
                        <div key={note.id || `${note.timestamp}-${index}`} className="rounded-lg border bg-muted/30 p-3">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {note.timestamp && <span>{note.timestamp}</span>}
                            {note.author && <span className="font-medium text-foreground">{note.author}</span>}
                          </div>
                          <p className="mt-2 whitespace-pre-wrap text-sm">{note.text}</p>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No notes</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <h3 className="text-sm text-muted-foreground mb-4">Activity Timeline</h3>
                  <div className="relative flex flex-col gap-0">
                    {timelineEvents.map((event: any, i: number) => {
                      let icon = '📝'
                      let color = 'text-primary'
                      let label = event.description
                      
                      if (event.type === 'email' || event.type === 'send-reply') {
                        icon = '📧'
                        color = 'text-blue-600'
                        label = 'Email Sent'
                      } else if (event.type === 'change-status') {
                        if (event.metadata?.status === 'closed') {
                          icon = '✅'
                          color = 'text-green-600'
                          label = 'Status Changed to Closed'
                        } else if (event.metadata?.status === 'in-progress') {
                          icon = '⏳'
                          color = 'text-amber-600'
                          label = 'Status Changed to In Progress'
                        } else {
                          icon = '📂'
                          color = 'text-primary'
                          label = 'Status Changed to Open'
                        }
                      } else if (event.type === 'mark-reviewed') {
                        icon = '👁️'
                        color = 'text-purple-600'
                        label = 'Marked as Reviewed'
                      } else if (event.type === 'assign') {
                        icon = '👤'
                        color = 'text-indigo-600'
                        label = 'Assigned'
                      } else if (event.type === 'archive') {
                        icon = '📦'
                        color = 'text-slate-500'
                        label = 'Archived'
                      } else if (event.type === 'add-note') {
                        icon = '📝'
                        color = 'text-primary'
                        label = 'Note Added'
                      }

                      const hasDetails = event.metadata?.note || event.metadata?.message || event.metadata?.assignee

                      return (
                        <details key={event.id} className="group">
                          <summary className="flex gap-4 cursor-pointer list-none">
                            <div className="flex flex-col items-center">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-base group-open:ring-2 group-open:ring-primary/20 transition-all">
                                {icon}
                              </div>
                              {i < timelineEvents.length - 1 && (
                                <div className="w-px flex-1 bg-border my-1" />
                              )}
                            </div>
                            <div className="pb-5 pt-1 flex-1">
                              <p className={`text-sm font-medium ${color}`}>{label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {event.actor} — {new Date(event.timestamp).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              {hasDetails && (
                                <p className="text-xs text-primary mt-1 group-open:hidden">Click to view details</p>
                              )}
                            </div>
                          </summary>
                          {hasDetails && (
                            <div className="ml-12 -mt-3 mb-5 rounded-lg border bg-muted/30 p-3">
                              {event.metadata?.note && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground mb-1">Note:</p>
                                  <p className="text-sm whitespace-pre-wrap">{event.metadata.note}</p>
                                </div>
                              )}
                              {event.metadata?.message && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground mb-1">Message:</p>
                                  <p className="text-sm whitespace-pre-wrap">{event.metadata.message}</p>
                                </div>
                              )}
                              {event.metadata?.assignee && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground mb-1">Assigned to:</p>
                                  <p className="text-sm">{event.metadata.assignee}</p>
                                </div>
                              )}
                              {event.metadata?.subject && (
                                <div className="mt-2">
                                  <p className="text-xs font-semibold text-muted-foreground mb-1">Email Subject:</p>
                                  <p className="text-sm">{event.metadata.subject}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </details>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <Card className="lg:mt-20">
            <CardHeader className="border-b border-border px-6 py-4">
              <CardTitle className="text-base">Manage Support</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4 rounded-xl bg-muted/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Current Status</p>
                <Badge className={`capitalize ${getStatusBadgeClass(localStatus)}`}>{localStatus}</Badge>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="sm" 
                    variant={localReviewed ? "ghost" : "default"} 
                    disabled={loading || localReviewed} 
                    onClick={() => callAction("mark-reviewed")}
                    className="w-full"
                  >
                    {localReviewed ? "Reviewed" : "Mark as Reviewed"}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="w-full">
                        Status: {localStatus}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-full">
                      <DropdownMenuItem onClick={() => callAction('change-status', { status: 'open' })}>
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => callAction('change-status', { status: 'in-progress' })}>
                        In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => callAction('change-status', { status: 'closed' })}>
                        Closed
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <InternalNoteModal id={report.id} />
              </div>

              <div className="mt-6 space-y-3 border-t border-border pt-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Danger Zone</p>
                
                {report.archived ? (
                  <Button
                    variant="outline"
                    className="w-full border-green-300 text-green-700 hover:bg-green-50"
                    disabled={archiveLoading}
                    onClick={handleArchive}
                  >
                    <ShieldAlert className="h-4 w-4" />
                    {archiveLoading ? 'Unarchiving...' : 'Unarchive Report'}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                    disabled={archiveLoading}
                    onClick={handleArchive}
                  >
                    <ShieldAlert className="h-4 w-4" />
                    {archiveLoading ? 'Archiving...' : 'Archive Report'}
                  </Button>
                )}
                
                <DeleteSupportButton
                  reportId={report.id}
                  reportSummary={report.summary || `Report #${report.id.slice(0, 8)}`}
                  isArchived={report.archived || false}
                  onArchive={async () => {
                    await handleArchive()
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border px-6 py-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email Response
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Reply To</p>
                <p className="text-sm font-medium">{report.name}</p>
                <p className="text-xs text-muted-foreground">{report.email}</p>
              </div>

              <div className="grid gap-3">
                <ReplyModal
                  id={report.id}
                  to={report.email}
                  toName={report.name}
                  reportStatus={report.status}
                  issueType={report.issue_type}
                  summary={report.summary}
                  mode="generic"
                  triggerLabel="Send Generic Email"
                />
                <ReplyModal
                  id={report.id}
                  to={report.email}
                  toName={report.name}
                  reportStatus={report.status}
                  issueType={report.issue_type}
                  summary={report.summary}
                  mode="custom"
                  triggerLabel="Send Custom Reply"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

export default SupportDetailClient
