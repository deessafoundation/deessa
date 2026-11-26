"use client"

import { useState } from "react"
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
} from "lucide-react"
import { notifications } from "@/lib/notifications"
import type { ContactSubmission, AdminAssignee } from "@/lib/data/contacts"
import {
  updateContactStatus,
  assignContact,
  sendContactReply,
  archiveContact,
} from "@/lib/actions/admin-contacts"
import styles from "./contacts.module.css"

interface ContactDetailModalContentProps {
  contact: ContactSubmission
  assignees: AdminAssignee[]
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}

function ContactDetailModalContent({
  contact,
  assignees,
  onOpenChange,
  onUpdated,
}: ContactDetailModalContentProps) {
  const [status, setStatus] = useState<ContactSubmission["status"]>(contact.status || "open")
  const [assignee, setAssignee] = useState<string>(contact.assignee || "unassigned")
  const [notes, setNotes] = useState<string>(contact.internal_notes || "")
  const [replyContent, setReplyContent] = useState<string>("")
  const [markResolvedOnReply, setMarkResolvedOnReply] = useState<boolean>(true)

  const [isSaving, setIsSaving] = useState(false)
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [copiedContact, setCopiedContact] = useState(false)
  const [copiedMessage, setCopiedMessage] = useState(false)

  const handleCopyContact = () => {
    const text = `Name: ${contact.name}\nEmail: ${contact.email}\nPhone: ${contact.phone || "N/A"}\nSubject: ${contact.subject}`
    navigator.clipboard.writeText(text)
    setCopiedContact(true)
    notifications.showSuccess("Contact details copied to clipboard")
    setTimeout(() => setCopiedContact(false), 2000)
  }

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(contact.message)
    setCopiedMessage(true)
    notifications.showSuccess("Message body copied to clipboard")
    setTimeout(() => setCopiedMessage(false), 2000)
  }

  const handleSaveTriage = async () => {
    setIsSaving(true)
    try {
      // 1. Update status
      const statusRes = await updateContactStatus({
        id: contact.id,
        status,
        adminNotes: notes.trim(),
      })

      // 2. Update assignee if changed
      const assigneeTarget = assignee === "unassigned" ? null : assignee
      if (assigneeTarget !== contact.assignee) {
        await assignContact({
          id: contact.id,
          assigneeEmail: assigneeTarget,
        })
      }

      if (statusRes.success) {
        notifications.showSuccess(`Inquiry updated to ${status.toUpperCase()}`)
        onOpenChange(false)
        if (onUpdated) onUpdated()
      } else {
        notifications.showError(`Update failed: ${statusRes.error}`)
      }
    } catch (err) {
      notifications.showError(`Error saving triage: ${err instanceof Error ? err.message : "Unknown error"}`)
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
      const res = await sendContactReply({
        id: contact.id,
        replyContent: replyContent.trim(),
        markResolved: markResolvedOnReply,
      })

      if (res.success) {
        notifications.showSuccess(`Reply sent to ${contact.email}`)
        setReplyContent("")
        onOpenChange(false)
        if (onUpdated) onUpdated()
      } else {
        notifications.showError(`Failed to send reply: ${res.error}`)
      }
    } catch (err) {
      notifications.showError(`Error sending reply: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsSendingReply(false)
    }
  }

  const handleToggleArchive = async () => {
    try {
      const newArchived = !contact.archived
      const res = await archiveContact(contact.id, newArchived)
      if (res.success) {
        notifications.showSuccess(newArchived ? "Inquiry archived" : "Inquiry restored to active inbox")
        onOpenChange(false)
        if (onUpdated) onUpdated()
      } else {
        notifications.showError(`Archive failed: ${res.error}`)
      }
    } catch (err) {
      notifications.showError(`Error archiving: ${err instanceof Error ? err.message : "Unknown error"}`)
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

  return (
    <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
      {/* Header with robust truncation and min-w-0 */}
      <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-border/50 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8 sm:pr-6 min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="size-11 rounded-xl bg-primary/15 text-primary border border-primary/25 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
              {getInitials(contact.name)}
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground truncate block">
                {contact.name}
              </DialogTitle>
              <DialogDescription className="text-xs flex flex-wrap items-center gap-1.5 mt-0.5 min-w-0 text-muted-foreground">
                <span className="shrink-0">
                  Received{" "}
                  {new Date(contact.created_at).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="shrink-0">•</span>
                <span className="truncate block max-w-[180px] sm:max-w-xs">{contact.email}</span>
              </DialogDescription>
            </div>
          </div>

          <Badge
            variant="outline"
            className={`font-semibold text-xs px-2.5 py-0.5 capitalize self-start sm:self-center shrink-0 ${
              contact.status === "open"
                ? styles.badgeOpen
                : contact.status === "in_progress"
                ? styles.badgeInProgress
                : contact.status === "resolved"
                ? styles.badgeResolved
                : styles.badgeClosed
            }`}
          >
            {contact.status === "open" && <AlertCircle className="size-3 mr-1 inline" />}
            {contact.status === "in_progress" && <Clock className="size-3 mr-1 inline" />}
            {contact.status === "resolved" && <CheckCircle2 className="size-3 mr-1 inline" />}
            {contact.status === "closed" && <XCircle className="size-3 mr-1 inline" />}
            {contact.status.replace("_", " ")}
          </Badge>
        </div>
      </DialogHeader>

      {/* Scrollable Body */}
      <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
        {/* 1-Click Instant Communication Bar */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-background/60 border border-border/50">
          {contact.phone ? (
            <a
              href={`tel:${contact.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 font-medium transition-colors text-xs shrink-0"
            >
              <Phone className="size-3.5 shrink-0" />
              <span>Call: {contact.phone}</span>
            </a>
          ) : (
            <span className="text-[11px] text-muted-foreground px-2 py-1 italic shrink-0">
              No phone provided
            </span>
          )}

          <a
            href={`mailto:${contact.email}?subject=Re:%20${encodeURIComponent(contact.subject)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors text-xs min-w-0 max-w-[200px] sm:max-w-xs truncate"
          >
            <Mail className="size-3.5 shrink-0" />
            <span className="truncate">Email: {contact.email}</span>
          </a>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyContact}
            className="h-8 px-2.5 text-xs ml-auto shrink-0"
          >
            {copiedContact ? <Check className="size-3 mr-1 text-emerald-500" /> : <Copy className="size-3 mr-1" />}
            <span>{copiedContact ? "Copied" : "Copy Card"}</span>
          </Button>
        </div>

        {/* Subject & Submission Details */}
        <div className="p-3.5 rounded-lg border border-border/50 bg-muted/20 space-y-2 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
                Subject
              </span>
              <Badge variant="secondary" className="font-semibold text-xs truncate max-w-[220px] sm:max-w-md block">
                {contact.subject}
              </Badge>
            </div>

            {contact.last_reply_sent_at && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="size-3" />
                Replied on {new Date(contact.last_reply_sent_at).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Message Body */}
          <div className="space-y-1.5 pt-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">Original Inquiry</span>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-[11px] text-primary hover:underline flex items-center gap-1 shrink-0"
              >
                {copiedMessage ? <Check className="size-3" /> : <Copy className="size-3" />}
                <span>{copiedMessage ? "Copied" : "Copy text"}</span>
              </button>
            </div>
            <div className="p-3 rounded-lg border border-border/60 bg-background text-foreground text-xs leading-relaxed whitespace-pre-wrap break-words font-sans max-h-52 overflow-y-auto">
              {contact.message}
            </div>
          </div>

          {/* Technical Metadata if Support Report */}
          {(contact.issue_type || contact.page_url || contact.browser_info) && (
            <div className="pt-2 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {contact.issue_type && (
                <div>
                  <span className="text-muted-foreground">Issue Type:</span>{" "}
                  <span className="font-semibold text-foreground">{contact.issue_type}</span>
                </div>
              )}
              {contact.page_url && (
                <div className="truncate">
                  <span className="text-muted-foreground">Origin Page:</span>{" "}
                  <a
                    href={contact.page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {contact.page_url}
                  </a>
                </div>
              )}
            </div>
          )}
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

            <button
              type="button"
              onClick={handleToggleArchive}
              className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0"
            >
              <Archive className="size-3" />
              <span>{contact.archived ? "Restore to Active" : "Archive Inquiry"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Workflow Status</label>
              <Select value={status} onValueChange={(val: ContactSubmission["status"]) => setStatus(val)}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open (Needs Attention)</SelectItem>
                  <SelectItem value="in_progress">In Progress (Claimed)</SelectItem>
                  <SelectItem value="resolved">Resolved / Handled</SelectItem>
                  <SelectItem value="closed">Closed / Discarded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Assignee</label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Assign staff" />
                </SelectTrigger>
                <SelectContent className="max-w-[320px] sm:max-w-md">
                  <SelectItem value="unassigned">Unassigned (Pool)</SelectItem>
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
              Staff Collaboration & Follow-up Notes
            </label>
            <Textarea
              placeholder="Internal notes visible only to administrators (e.g. 'Phoned sender on Nov 9. Offered CSR brochure.')..."
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
                Direct Email Response Studio
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground truncate max-w-[200px] sm:max-w-xs block">
              To: <strong className="text-foreground">{contact.email}</strong>
            </span>
          </div>

          <Textarea
            placeholder={`Write your response to ${contact.name} here...`}
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
  )
}

interface ContactDetailSheetProps {
  contact: ContactSubmission | null
  assignees: AdminAssignee[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}

export function ContactDetailSheet({
  contact,
  assignees,
  open,
  onOpenChange,
  onUpdated,
}: ContactDetailSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {contact && (
        <ContactDetailModalContent
          key={contact.id}
          contact={contact}
          assignees={assignees}
          onOpenChange={onOpenChange}
          onUpdated={onUpdated}
        />
      )}
    </Dialog>
  )
}
