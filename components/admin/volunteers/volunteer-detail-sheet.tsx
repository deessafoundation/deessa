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
  Calendar,
  Briefcase,
  Clock,
  Heart,
  Sparkles,
  CheckCircle2,
  XCircle,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  Send,
} from "lucide-react"
import { notifications } from "@/lib/notifications"
import type { VolunteerApplication } from "@/lib/data/volunteers"
import { updateVolunteerApplication, sendCandidateNotification } from "@/lib/actions/admin-volunteers"
import styles from "./volunteers.module.css"

const PROGRAM_OPTIONS = [
  "General Volunteer Pool",
  "Education Programs",
  "Healthcare & Medical Camps",
  "Disaster Relief & Logistics",
  "Women Empowerment",
  "IT & Digital Communications",
  "Event Coordination",
]

interface VolunteerDetailModalContentProps {
  volunteer: VolunteerApplication
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}

function VolunteerDetailModalContent({
  volunteer,
  onOpenChange,
  onUpdated,
}: VolunteerDetailModalContentProps) {
  const [status, setStatus] = useState<VolunteerApplication["status"]>(volunteer.status || "pending")
  const [notes, setNotes] = useState(volunteer.admin_notes || "")
  const [assignedRole, setAssignedRole] = useState(
    volunteer.assigned_role || "General Volunteer Pool"
  )
  const [sendNotification, setSendNotification] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [copiedContact, setCopiedContact] = useState(false)

  const handleCopyContact = () => {
    const text = `Name: ${volunteer.full_name}\nEmail: ${volunteer.email}\nPhone: ${volunteer.phone}\nAvailability: ${volunteer.availability}`
    navigator.clipboard.writeText(text)
    setCopiedContact(true)
    notifications.showSuccess("Volunteer contact card copied to clipboard")
    setTimeout(() => setCopiedContact(false), 2000)
  }

  const handleSendDirectEmail = async () => {
    setIsSendingEmail(true)
    try {
      const res = await sendCandidateNotification(volunteer.id, notes.trim())
      if (res.success) {
        notifications.showSuccess(`Notification email dispatched to ${volunteer.email}`)
      } else {
        notifications.showWarning(res.message || "Failed to dispatch email (check Google credentials)")
      }
    } catch (err) {
      notifications.showError(`Error sending email: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleSaveDecision = async () => {
    setIsSaving(true)
    try {
      const res = await updateVolunteerApplication({
        id: volunteer.id,
        status,
        adminNotes: notes.trim(),
        assignedRole,
        sendNotification,
      })

      if (res.success) {
        notifications.showSuccess(
          `Application marked as ${status.toUpperCase()}${
            sendNotification ? " & email notice sent" : ""
          }`
        )
        onOpenChange(false)
        if (onUpdated) onUpdated()
      } else {
        notifications.showError(`Update failed: ${res.error}`)
      }
    } catch (err) {
      notifications.showError(`Error saving decision: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsSaving(false)
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
      {/* Header */}
      <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-border/50 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8 sm:pr-6 min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="size-11 rounded-xl bg-primary/15 text-primary border border-primary/25 flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
              {getInitials(volunteer.full_name)}
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground truncate block">
                {volunteer.full_name}
              </DialogTitle>
              <DialogDescription className="text-xs flex flex-wrap items-center gap-1.5 mt-0.5 min-w-0 text-muted-foreground">
                <span className="shrink-0">
                  Applied{" "}
                  {new Date(volunteer.applied_at).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="shrink-0">•</span>
                <span className="capitalize truncate block max-w-[180px] sm:max-w-xs">{volunteer.occupation || "Community Volunteer"}</span>
              </DialogDescription>
            </div>
          </div>

          <Badge
            variant="outline"
            className={`font-semibold text-xs px-2.5 py-0.5 capitalize self-start sm:self-center shrink-0 ${
              volunteer.status === "approved"
                ? styles.badgeApproved
                : volunteer.status === "rejected"
                ? styles.badgeRejected
                : styles.badgePending
            }`}
          >
            {volunteer.status === "approved" && <CheckCircle2 className="size-3 mr-1 inline" />}
            {volunteer.status === "rejected" && <XCircle className="size-3 mr-1 inline" />}
            {volunteer.status === "pending" && <Clock className="size-3 mr-1 inline" />}
            {volunteer.status}
          </Badge>
        </div>
      </DialogHeader>

      {/* Scrollable Content */}
      <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
        {/* 1-Click Instant Communication Bar */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-background/60 border border-border/50">
          <a
            href={`tel:${volunteer.phone}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 font-medium transition-colors text-xs shrink-0"
          >
            <Phone className="size-3.5 shrink-0" />
            <span>Call: {volunteer.phone}</span>
          </a>

          <a
            href={`mailto:${volunteer.email}?subject=Volunteer%20Application%20-%20Deesha%20Foundation`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors text-xs min-w-0 max-w-[200px] sm:max-w-xs truncate"
          >
            <Mail className="size-3.5 shrink-0" />
            <span className="truncate">Email: {volunteer.email}</span>
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

        {/* Quick Profile Bento Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-lg border border-border/40 bg-muted/20">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" /> Availability
            </span>
            <span className="font-semibold text-foreground mt-0.5 block truncate">{volunteer.availability}</span>
          </div>

          <div className="p-3 rounded-lg border border-border/40 bg-muted/20">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Briefcase className="size-3" /> Occupation
            </span>
            <span className="font-semibold text-foreground mt-0.5 block truncate">
              {volunteer.occupation || "Not Specified"}
            </span>
          </div>

          <div className="p-3 rounded-lg border border-border/40 bg-muted/20 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3" /> Applied On
            </span>
            <span className="font-semibold text-foreground mt-0.5 block truncate">
              {new Date(volunteer.applied_at).toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Skills Dossier */}
        <div className="space-y-2">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            <span>Declared Skills & Competencies</span>
          </span>
          <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-border/50 bg-background">
            {volunteer.skills && volunteer.skills.length > 0 ? (
              volunteer.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="font-medium text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
                >
                  {skill}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground italic text-xs">
                No specific skills declared by candidate
              </span>
            )}
          </div>
        </div>

        {/* Program Interests */}
        <div className="space-y-2">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <Heart className="size-3.5 text-rose-500" />
            <span>Causes & Community Interests</span>
          </span>
          <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-border/50 bg-background">
            {volunteer.interests && volunteer.interests.length > 0 ? (
              volunteer.interests.map((interest) => (
                <Badge
                  key={interest}
                  variant="outline"
                  className="font-medium text-xs bg-muted/40 text-foreground border-border/80"
                >
                  {interest}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground italic text-xs">
                No specific program interests listed
              </span>
            )}
          </div>
        </div>

        {/* Motivation Message / Bio */}
        {volunteer.message && (
          <div className="space-y-1.5">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <MessageSquare className="size-3.5 text-muted-foreground" />
              <span>Applicant Motivation Statement</span>
            </span>
            <div className="p-3.5 rounded-lg border border-border/50 bg-muted/30 italic text-foreground leading-relaxed text-xs break-words">
              &ldquo;{volunteer.message}&rdquo;
            </div>
          </div>
        )}

        {/* Admin Evaluation & Approval Studio */}
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/[0.02] space-y-3 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              <span className="font-semibold text-foreground text-xs uppercase tracking-wider">
                Staff Review & Assignment Studio
              </span>
            </div>

            {/* Direct email trigger */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSendDirectEmail}
              disabled={isSendingEmail}
              className="h-7 px-2.5 text-[11px] gap-1 text-primary border-primary/30 hover:bg-primary/5"
            >
              {isSendingEmail ? (
                <RefreshCw className="size-3 animate-spin" />
              ) : (
                <Send className="size-3" />
              )}
              <span>Email Candidate</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Decision Status</label>
              <Select value={status} onValueChange={(val: VolunteerApplication["status"]) => setStatus(val)}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="approved">Approve Application</SelectItem>
                  <SelectItem value="rejected">Reject Application</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">
                Assigned Department / Pool
              </label>
              <Select value={assignedRole} onValueChange={setAssignedRole}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAM_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              Staff Internal Review Notes
            </label>
            <Textarea
              placeholder="e.g. Conducted phone interview on Nov 8. Highly passionate about education. Assigned to mentor team."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs min-h-[75px] bg-background"
            />
          </div>

          {/* Email on save toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              id="sendNotification"
              type="checkbox"
              checked={sendNotification}
              onChange={(e) => setSendNotification(e.target.checked)}
              className="size-3.5 rounded border-border text-primary focus:ring-primary"
            />
            <label
              htmlFor="sendNotification"
              className="text-[11px] font-medium text-muted-foreground cursor-pointer select-none"
            >
              Send email notification to applicant upon saving (includes decision & notes)
            </label>
          </div>

          {volunteer.reviewed_at && (
            <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/40">
              <span>
                Last reviewed by:{" "}
                <span className="font-mono text-foreground">
                  {volunteer.reviewed_by || "Administrator"}
                </span>
              </span>
              <span>
                {new Date(volunteer.reviewed_at).toLocaleString([], {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </div>
          )}
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
          onClick={handleSaveDecision}
          disabled={isSaving}
          className="flex-1 sm:flex-none h-10 px-4"
        >
          {isSaving ? (
            <>
              <RefreshCw className="size-3.5 mr-1.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <UserCheck className="size-3.5 mr-1.5" />
              Save Decision
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

interface VolunteerDetailSheetProps {
  volunteer: VolunteerApplication | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}

export function VolunteerDetailSheet({
  volunteer,
  open,
  onOpenChange,
  onUpdated,
}: VolunteerDetailSheetProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {volunteer && (
        <VolunteerDetailModalContent
          key={volunteer.id}
          volunteer={volunteer}
          onOpenChange={onOpenChange}
          onUpdated={onUpdated}
        />
      )}
    </Dialog>
  )
}
