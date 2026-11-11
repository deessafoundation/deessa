"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Phone,
  Mail,
  Copy,
  Check,
  Clock,
  Send,
  UserCheck,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Archive,
  Bug,
  ExternalLink,
  Laptop,
  ImageIcon,
  Maximize2,
  Trash2,
  Download,
} from "lucide-react"
import { notifications } from "@/lib/notifications"
import type {
  SupportTicket,
  SupportAssignee,
} from "@/lib/data/support"
import {
  updateSupportStatus,
  assignSupportTicket,
  sendSupportReply,
  archiveSupportReport,
  deleteSupportReport,
  getSupportScreenshotUrlAction,
} from "@/lib/actions/admin-support"
import styles from "./support.module.css"

interface SupportDetailModalContentProps {
  ticket: SupportTicket
  initialScreenshotUrl?: string | null
  assignees: SupportAssignee[]
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}

function SupportDetailModalContent({
  ticket,
  initialScreenshotUrl = null,
  assignees,
  onOpenChange,
  onUpdated,
}: SupportDetailModalContentProps) {
  const [status, setStatus] = useState<SupportTicket["status"]>(ticket.status || "open")
  const [assignee, setAssignee] = useState<string>(ticket.assignee || "unassigned")
  const [notes, setNotes] = useState<string>(ticket.internal_notes || "")
  const [replyContent, setReplyContent] = useState<string>("")
  const [markResolvedOnReply, setMarkResolvedOnReply] = useState<boolean>(true)

  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(initialScreenshotUrl)
  const [isLoadingScreenshot, setIsLoadingScreenshot] = useState<boolean>(
    Boolean(ticket.screenshot_path && !initialScreenshotUrl)
  )
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const [isSaving, setIsSaving] = useState(false)
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [copiedContact, setCopiedContact] = useState(false)
  const [copiedMessage, setCopiedMessage] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedUA, setCopiedUA] = useState(false)

  // Fetch signed screenshot URL on-demand via server action if not preloaded
  useEffect(() => {
    let isMounted = true
    if (ticket.screenshot_path && !screenshotUrl) {
      getSupportScreenshotUrlAction(ticket.screenshot_path)
        .then((res) => {
          if (isMounted && res.success && res.signedUrl) {
            setScreenshotUrl(res.signedUrl)
          }
        })
        .catch((err) => {
          console.error("Failed to load signed screenshot URL:", err)
        })
        .finally(() => {
          if (isMounted) setIsLoadingScreenshot(false)
        })
    }
    return () => {
      isMounted = false
    }
  }, [ticket.screenshot_path, screenshotUrl])

  const handleCopyContact = () => {
    const text = `Reporter: ${ticket.name}\nEmail: ${ticket.email}\nPhone: ${ticket.phone || "N/A"}\nIssue: ${ticket.issue_type}\nPage: ${ticket.page_url || "N/A"}`
    navigator.clipboard.writeText(text)
    setCopiedContact(true)
    notifications.showSuccess("Reporter details copied to clipboard")
    setTimeout(() => setCopiedContact(false), 2000)
  }

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(ticket.message)
    setCopiedMessage(true)
    notifications.showSuccess("Report description copied to clipboard")
    setTimeout(() => setCopiedMessage(false), 2000)
  }

  const handleCopyUrl = () => {
    if (!ticket.page_url) return
    navigator.clipboard.writeText(ticket.page_url)
    setCopiedUrl(true)
    notifications.showSuccess("Origin page URL copied to clipboard")
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const handleCopyUA = () => {
    if (!ticket.browser_info) return
    navigator.clipboard.writeText(ticket.browser_info)
    setCopiedUA(true)
    notifications.showSuccess("Browser diagnostics copied to clipboard")
    setTimeout(() => setCopiedUA(false), 2000)
  }

  const handleSaveTriage = async () => {
    setIsSaving(true)
    try {
      // 1. Update status
      const statusRes = await updateSupportStatus({
        id: ticket.id,
        status,
        adminNotes: notes.trim(),
      })

      // 2. Update assignee if changed
      const assigneeTarget = assignee === "unassigned" ? null : assignee
      if (assigneeTarget !== ticket.assignee) {
        await assignSupportTicket({
          id: ticket.id,
          assigneeEmail: assigneeTarget,
        })
      }

      if (statusRes.success) {
        notifications.showSuccess(`Support report marked as ${status.toUpperCase()}`)
        onOpenChange(false)
        if (onUpdated) onUpdated()
      } else {
        notifications.showError(`Update failed: ${statusRes.error}`)
      }
    } catch (err) {
      notifications.showError(
        `Error saving triage: ${err instanceof Error ? err.message : "Unknown error"}`
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendOfficialReply = async () => {
    if (!replyContent.trim()) {
      notifications.showError("Please enter a reply message before sending.")
      return
    }

    setIsSendingReply(true)
    try {
      const res = await sendSupportReply({
        id: ticket.id,
        replyContent: replyContent.trim(),
        markResolved: markResolvedOnReply,
      })

      if (res.success) {
        notifications.showSuccess(`Support reply sent to ${ticket.email}`)
        setReplyContent("")
        onOpenChange(false)
        if (onUpdated) onUpdated()
      } else {
        notifications.showError(`Failed to send reply: ${res.error}`)
      }
    } catch (err) {
      notifications.showError(
        `Error sending reply: ${err instanceof Error ? err.message : "Unknown error"}`
      )
    } finally {
      setIsSendingReply(false)
    }
  }

  const handleToggleArchive = async () => {
    try {
      const newArchived = !ticket.archived
      const res = await archiveSupportReport(ticket.id, newArchived)
      if (res.success) {
        notifications.showSuccess(
          newArchived ? "Support report archived" : "Support report restored to active queue"
        )
        onOpenChange(false)
        if (onUpdated) onUpdated()
      } else {
        notifications.showError(`Archive failed: ${res.error}`)
      }
    } catch (err) {
      notifications.showError(
        `Error archiving report: ${err instanceof Error ? err.message : "Unknown error"}`
      )
    }
  }

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to permanently delete the support report from "${ticket.name}"?`
      )
    ) {
      return
    }

    try {
      const res = await deleteSupportReport(ticket.id)
      if (res.success) {
        notifications.showSuccess("Support report permanently deleted")
        onOpenChange(false)
        if (onUpdated) onUpdated()
      } else {
        notifications.showError(`Delete failed: ${res.error}`)
      }
    } catch (err) {
      notifications.showError(
        `Error deleting report: ${err instanceof Error ? err.message : "Unknown error"}`
      )
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  const getIssueBadgeClass = (type: string) => {
    const t = type.toLowerCase()
    if (t.includes("bug")) return styles.badgeBug
    if (t.includes("feature")) return styles.badgeFeature
    if (t.includes("accessibility")) return styles.badgeAccessibility
    return styles.badgeContent
  }

  return (
    <>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header with robust truncation and min-w-0 */}
        <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-border/50 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8 sm:pr-6 min-w-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="size-11 rounded-xl bg-primary/15 text-primary border border-primary/25 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                {getInitials(ticket.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base sm:text-lg font-bold text-foreground truncate block">
                    {ticket.name}
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className={`font-semibold text-[11px] px-2 py-0 shrink-0 ${getIssueBadgeClass(
                      ticket.issue_type
                    )}`}
                  >
                    <Bug className="size-3 mr-1 inline" />
                    {ticket.issue_type}
                  </Badge>
                </div>
                <DialogDescription className="text-xs flex flex-wrap items-center gap-1.5 mt-0.5 min-w-0 text-muted-foreground">
                  <span className="shrink-0">
                    Reported{" "}
                    {new Date(ticket.created_at).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="shrink-0">•</span>
                  <span className="truncate block max-w-[180px] sm:max-w-xs">{ticket.email}</span>
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className={`font-semibold text-xs px-2.5 py-0.5 capitalize self-start sm:self-center shrink-0 ${
                ticket.status === "open"
                  ? styles.badgeOpen
                  : ticket.status === "in_progress"
                  ? styles.badgeInProgress
                  : ticket.status === "resolved"
                  ? styles.badgeResolved
                  : styles.badgeClosed
              }`}
            >
              {ticket.status === "open" && <AlertCircle className="size-3 mr-1 inline" />}
              {ticket.status === "in_progress" && <Clock className="size-3 mr-1 inline" />}
              {ticket.status === "resolved" && <CheckCircle2 className="size-3 mr-1 inline" />}
              {ticket.status === "closed" && <XCircle className="size-3 mr-1 inline" />}
              {ticket.status.replace("_", " ")}
            </Badge>
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* 1-Click Instant Communication Bar */}
          <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-background/60 border border-border/50">
            {ticket.phone ? (
              <a
                href={`tel:${ticket.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 font-medium transition-colors text-xs shrink-0"
              >
                <Phone className="size-3.5 shrink-0" />
                <span>Call: {ticket.phone}</span>
              </a>
            ) : (
              <span className="text-[11px] text-muted-foreground px-2 py-1 italic shrink-0">
                No phone provided
              </span>
            )}

            <a
              href={`mailto:${ticket.email}?subject=Re:%20[${encodeURIComponent(
                ticket.issue_type
              )}]%20${encodeURIComponent(ticket.subject)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors text-xs min-w-0 max-w-[200px] sm:max-w-xs truncate"
            >
              <Mail className="size-3.5 shrink-0" />
              <span className="truncate">Email: {ticket.email}</span>
            </a>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyContact}
              className="h-8 px-2.5 text-xs ml-auto shrink-0"
            >
              {copiedContact ? (
                <Check className="size-3 mr-1 text-emerald-500" />
              ) : (
                <Copy className="size-3 mr-1" />
              )}
              <span>{copiedContact ? "Copied" : "Copy Card"}</span>
            </Button>
          </div>

          {/* Technical Diagnostics Box */}
          <div className="p-3.5 rounded-xl border border-sky-500/20 bg-sky-500/[0.03] space-y-2.5 min-w-0">
            <span className="text-[10px] uppercase font-bold text-sky-700 dark:text-sky-400 tracking-wider block">
              Technical Environment & Origin
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Origin Page URL */}
              <div className="p-2.5 rounded-lg bg-background/80 border border-border/60 min-w-0 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium">
                    <ExternalLink className="size-3 text-sky-500" /> Origin Page URL
                  </span>
                  {ticket.page_url && (
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="text-primary hover:underline flex items-center gap-0.5 text-[10px]"
                    >
                      {copiedUrl ? (
                        <Check className="size-2.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-2.5" />
                      )}
                      <span>{copiedUrl ? "Copied" : "Copy"}</span>
                    </button>
                  )}
                </div>
                {ticket.page_url ? (
                  <a
                    href={ticket.page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate block font-mono text-[11px]"
                  >
                    {ticket.page_url}
                  </a>
                ) : (
                  <span className="text-muted-foreground italic text-[11px]">Not provided</span>
                )}
              </div>

              {/* Browser / OS Diagnostics */}
              <div className="p-2.5 rounded-lg bg-background/80 border border-border/60 min-w-0 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium">
                    <Laptop className="size-3 text-sky-500" /> Client Environment
                  </span>
                  {ticket.browser_info && (
                    <button
                      type="button"
                      onClick={handleCopyUA}
                      className="text-primary hover:underline flex items-center gap-0.5 text-[10px]"
                    >
                      {copiedUA ? (
                        <Check className="size-2.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-2.5" />
                      )}
                      <span>{copiedUA ? "Copied" : "Copy"}</span>
                    </button>
                  )}
                </div>
                <p className="text-foreground truncate font-mono text-[11px]">
                  {ticket.browser_info || "No User-Agent captured"}
                </p>
              </div>
            </div>

            {/* Screenshot Thumbnail & Lightbox trigger */}
            {ticket.screenshot_path && (
              <div className="pt-1">
                <div className="flex items-center justify-between pb-1.5 text-[11px]">
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <ImageIcon className="size-3.5 text-sky-500" /> Attached User Screenshot
                  </span>
                  {screenshotUrl && (
                    <a
                      href={screenshotUrl}
                      download={ticket.screenshot_name || "support-screenshot.png"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Download className="size-3" /> Download Image
                    </a>
                  )}
                </div>

                {isLoadingScreenshot ? (
                  <div className="h-28 rounded-lg bg-muted/40 flex items-center justify-center text-xs text-muted-foreground">
                    <RefreshCw className="size-4 animate-spin mr-2" /> Loading secure image...
                  </div>
                ) : screenshotUrl ? (
                  <div
                    onClick={() => setIsLightboxOpen(true)}
                    className="relative group rounded-lg overflow-hidden border border-border/60 cursor-pointer max-h-44 bg-black/5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={screenshotUrl}
                      alt={ticket.screenshot_name || "Report screenshot"}
                      className="w-full object-contain max-h-44 group-hover:scale-[1.01] transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                      <Maximize2 className="size-4" /> Click to Expand Full Size
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border border-dashed text-muted-foreground text-center text-[11px]">
                    Screenshot file not available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Issue Summary & Detailed Description */}
          <div className="p-3.5 rounded-lg border border-border/50 bg-muted/20 space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
                  Subject
                </span>
                <span className="font-semibold text-xs text-foreground truncate max-w-[220px] sm:max-w-md block">
                  {ticket.subject}
                </span>
              </div>

              {ticket.last_reply_sent_at && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="size-3" />
                  Replied on {new Date(ticket.last_reply_sent_at).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Full Report Details */}
            <div className="space-y-1.5 pt-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Report Description
                </span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 shrink-0"
                >
                  {copiedMessage ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  <span>{copiedMessage ? "Copied" : "Copy text"}</span>
                </button>
              </div>
              <div className="p-3 rounded-lg border border-border/60 bg-background text-foreground text-xs leading-relaxed whitespace-pre-wrap break-words font-sans max-h-52 overflow-y-auto">
                {ticket.message}
              </div>
            </div>
          </div>

          {/* Staff CRM & Triage Studio */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/[0.02] space-y-3 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary shrink-0" />
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  Staff Triage & Assignment Studio
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleArchive}
                  className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0"
                >
                  <Archive className="size-3" />
                  <span>{ticket.archived ? "Restore Report" : "Archive Report"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-1 shrink-0"
                >
                  <Trash2 className="size-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Workflow Status
                </label>
                <Select
                  value={status}
                  onValueChange={(val: SupportTicket["status"]) => setStatus(val)}
                >
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open (Needs Investigation)</SelectItem>
                    <SelectItem value="in_progress">In Progress (Claimed / Fixing)</SelectItem>
                    <SelectItem value="resolved">Resolved / Fixed</SelectItem>
                    <SelectItem value="closed">Closed / Not a Bug</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Assignee</label>
                <Select value={assignee} onValueChange={setAssignee}>
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder="Assign developer / admin" />
                  </SelectTrigger>
                  <SelectContent className="max-w-[320px] sm:max-w-md">
                    <SelectItem value="unassigned">Unassigned (General Pool)</SelectItem>
                    {assignees.map((a) => (
                      <SelectItem key={a.id} value={a.email}>
                        <span className="truncate block max-w-[220px] sm:max-w-xs">
                          {a.full_name} ({a.email})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">
                Technical Team Collaboration Notes
              </label>
              <Textarea
                placeholder="Internal notes visible only to staff (e.g. 'Investigated in Chrome devtools. Patch deployed in PR #42.')..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs min-h-[65px] bg-background"
              />
            </div>
          </div>

          {/* Direct Email Reply Studio */}
          <div className="p-4 rounded-xl border border-border bg-card space-y-3 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <Send className="size-4 text-primary shrink-0" />
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  Direct Response to Reporter
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground truncate max-w-[200px] sm:max-w-xs block">
                To: <strong className="text-foreground">{ticket.email}</strong>
              </span>
            </div>

            <Textarea
              placeholder={`Write your response to ${ticket.name} regarding this report...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="text-xs min-h-[85px] bg-background w-full break-words"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <label className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={markResolvedOnReply}
                  onChange={(e) => setMarkResolvedOnReply(e.target.checked)}
                  className="size-3.5 rounded border-border text-primary focus:ring-primary"
                />
                <span>Automatically mark as &quot;Resolved&quot; upon sending reply</span>
              </label>

              <Button
                type="button"
                onClick={handleSendOfficialReply}
                disabled={isSendingReply || !replyContent.trim()}
                className="h-8 px-4 text-xs font-semibold gap-1.5"
              >
                {isSendingReply ? (
                  <>
                    <RefreshCw className="size-3 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="size-3" />
                    <span>Send Official Email Reply</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer with side-by-side mobile buttons */}
        <DialogFooter className="p-4 border-t border-border/50 bg-muted/20 flex flex-row items-center justify-end gap-2.5 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none h-10 px-4"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSaveTriage}
            disabled={isSaving}
            className="flex-1 sm:flex-none h-10 px-5 gap-2"
          >
            {isSaving ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <UserCheck className="size-3.5" />
                <span>Save Decision & Notes</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Full-Screen Lightbox Zoom Modal */}
      {screenshotUrl && (
        <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
          <DialogContent className="w-[95vw] max-w-5xl max-h-[92vh] flex flex-col p-4">
            <DialogHeader className="pb-2 border-b border-border/40 flex flex-row items-center justify-between">
              <DialogTitle className="text-sm font-semibold truncate">
                {ticket.screenshot_name || "Support Report Screenshot"}
              </DialogTitle>
              <a
                href={screenshotUrl}
                download={ticket.screenshot_name || "screenshot.png"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1 mr-6"
              >
                <Download className="size-3.5" /> Download
              </a>
            </DialogHeader>
            <div className="flex-1 overflow-auto flex items-center justify-center p-2 min-h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshotUrl}
                alt="Full resolution screenshot"
                className="max-w-full max-h-[75vh] object-contain rounded border border-border"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

interface SupportDetailSheetProps {
  ticket: SupportTicket | null
  screenshotUrl?: string | null
  assignees: SupportAssignee[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}

export function SupportDetailSheet({
  ticket,
  screenshotUrl,
  assignees,
  open,
  onOpenChange,
  onUpdated,
}: SupportDetailSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {ticket && (
        <SupportDetailModalContent
          key={ticket.id}
          ticket={ticket}
          initialScreenshotUrl={screenshotUrl}
          assignees={assignees}
          onOpenChange={onOpenChange}
          onUpdated={onUpdated}
        />
      )}
    </Dialog>
  )
}
