"use client"

import { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Mail,
  Calendar,
  Clock,
  Send,
  XCircle,
  Copy,
  Trash2,
  ShieldCheck,
  Check,
  ExternalLink,
  Loader2,
  User,
  Sparkles,
} from "lucide-react"
import { notifications } from "@/lib/notifications"
import type { NewsletterSubscriber, SubscriberStatus } from "@/lib/data/newsletter"
import {
  updateSubscriberDetails,
  sendManualWelcomeEmail,
} from "@/lib/actions/admin-newsletter"
import { getAppBaseUrl } from "@/lib/utils"

interface SubscriberDetailSheetProps {
  subscriber: NewsletterSubscriber | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onDelete: (sub: NewsletterSubscriber) => void
  onUpdated?: () => void
}

interface ModalContentProps {
  subscriber: NewsletterSubscriber
  onOpenChange: (open: boolean) => void
  onDelete: (sub: NewsletterSubscriber) => void
  onUpdated?: () => void
}

function SubscriberDetailModalContent({
  subscriber,
  onOpenChange,
  onDelete,
  onUpdated,
}: ModalContentProps) {
  const [isPending, startTransition] = useTransition()
  const [isSendingWelcome, setIsSendingWelcome] = useState(false)

  // Form edit states
  const [name, setName] = useState(subscriber.name || "")
  const [status, setStatus] = useState<SubscriberStatus>(subscriber.status || "active")
  const [source, setSource] = useState(subscriber.source || "footer")

  // Copy feedback states
  const [copiedTokenUrl, setCopiedTokenUrl] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)

  const siteUrl = getAppBaseUrl()
  const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribe_token)}`

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(subscriber.email)
    setCopiedEmail(true)
    notifications.showSuccess("Email address copied to clipboard")
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  const handleCopyUnsubscribeUrl = () => {
    navigator.clipboard.writeText(unsubscribeUrl)
    setCopiedTokenUrl(true)
    notifications.showSuccess("Direct unsubscribe URL copied to clipboard")
    setTimeout(() => setCopiedTokenUrl(false), 2000)
  }

  const handleSendWelcomeNow = async () => {
    setIsSendingWelcome(true)
    try {
      const res = await sendManualWelcomeEmail(subscriber.id)
      if (res.success) {
        notifications.showSuccess(`Welcome email dispatched to ${subscriber.email}`)
      } else {
        notifications.showError(res.error || "Failed to dispatch welcome email")
      }
    } catch {
      notifications.showError("Unexpected error sending welcome email")
    } finally {
      setIsSendingWelcome(false)
    }
  }

  const handleSaveChanges = () => {
    startTransition(async () => {
      const res = await updateSubscriberDetails({
        id: subscriber.id,
        name: name.trim() || null,
        status,
        source,
      })

      if (res.success) {
        notifications.showSuccess("Subscriber dossier updated successfully")
        onOpenChange(false)
        if (onUpdated) onUpdated()
      } else {
        notifications.showError(res.error || "Failed to update subscriber")
      }
    })
  }

  const hasName = Boolean(name.trim().length > 0)

  const getInitials = () => {
    if (name.trim()) {
      return name
        .trim()
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    }
    return subscriber.email.charAt(0).toUpperCase()
  }

  return (
    <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border-border/80 shadow-2xl">
      {/* ── 1. Hero Header (with pr-14 for generous X close button clearance) ── */}
      <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-border/60 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pr-14 min-w-0">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <div className="size-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-base shadow-2xs shrink-0 select-none">
              {getInitials()}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground truncate block">
                  {hasName ? name : subscriber.email}
                </DialogTitle>

                {status === "active" ? (
                  <Badge className="bg-green-50 text-green-700 border-green-200/90 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800/60 font-semibold text-xs px-2.5 py-0.5 gap-1.5 rounded-full shrink-0 flex items-center shadow-2xs shadow-green-500/10">
                    <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xs shadow-green-500/30">
                      <Check className="size-2 stroke-[3]" />
                    </span>
                    Active Subscriber
                  </Badge>
                ) : status === "bounced" ? (
                  <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-semibold text-xs px-2.5 py-0.5 gap-1.5 rounded-full shrink-0 flex items-center">
                    <XCircle className="size-3" />
                    Bounced
                  </Badge>
                ) : (
                  <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-semibold text-xs px-2.5 py-0.5 gap-1.5 rounded-full shrink-0 flex items-center">
                    <XCircle className="size-3" />
                    Unsubscribed
                  </Badge>
                )}
              </div>

              <DialogDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-1.5 mt-1 min-w-0">
                {hasName && (
                  <>
                    <span className="truncate block font-mono text-foreground/80">{subscriber.email}</span>
                    <span>•</span>
                  </>
                )}
                <span>
                  Joined{" "}
                  {new Date(subscriber.subscribed_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span>•</span>
                <span className="capitalize">{subscriber.source.replace(/_/g, " ")} channel</span>
              </DialogDescription>
            </div>
          </div>
        </div>
      </DialogHeader>

      {/* ── 2. Scrollable Body ── */}
      <div className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 text-xs">
        {/* Quick Communication & Action Bar */}
        <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-background/80 border border-border/60 shadow-2xs">
          <a
            href={`mailto:${subscriber.email}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-colors text-xs shrink-0"
          >
            <Mail className="size-3.5 shrink-0" />
            <span>Compose Mail</span>
          </a>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyEmail}
            className="h-8 px-2.5 text-xs gap-1.5 shrink-0"
          >
            {copiedEmail ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
            <span>{copiedEmail ? "Email Copied" : "Copy Email"}</span>
          </Button>

          <a
            href={unsubscribeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-card hover:bg-muted font-medium transition-colors text-xs text-muted-foreground hover:text-foreground shrink-0"
          >
            <ExternalLink className="size-3.5 shrink-0" />
            <span>Test Unsubscribe Link</span>
          </a>

          {status === "active" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSendWelcomeNow}
              disabled={isSendingWelcome}
              className="h-8 px-2.5 text-xs ml-auto gap-1.5 text-primary hover:text-primary hover:bg-primary/5 border-primary/30 shrink-0"
            >
              {isSendingWelcome ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3 text-primary" />}
              <span>Dispatch Welcome Email</span>
            </Button>
          )}
        </div>

        {/* ── Dossier Metrics Bento Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Channel
            </span>
            <span className="font-bold text-foreground text-sm capitalize truncate block">
              {subscriber.source.replace(/_/g, " ")}
            </span>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Delivered
            </span>
            <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
              <Send className="size-3.5 text-primary" />
              {subscriber.emails_sent_count} {subscriber.emails_sent_count === 1 ? "email" : "emails"}
            </span>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Subscribed
            </span>
            <span className="font-bold text-foreground text-xs flex items-center gap-1 mt-0.5 truncate">
              <Calendar className="size-3.5 text-muted-foreground" />
              {new Date(subscriber.subscribed_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Last Emailed
            </span>
            <span className="font-bold text-foreground text-xs flex items-center gap-1 mt-0.5 truncate">
              <Clock className="size-3.5 text-muted-foreground" />
              {subscriber.last_emailed_at
                ? new Date(subscriber.last_emailed_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Never"}
            </span>
          </div>
        </div>

        {/* ── CAN-SPAM / GDPR Direct Token Strip ── */}
        <div className="rounded-xl border border-border/70 bg-muted/20 p-3.5 sm:p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <ShieldCheck className="size-4 text-primary" />
              <span>Compliance 1-Click Unsubscribe Token</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">Unique Cryptographic ID</span>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Every outgoing campaign embeds this subscriber-specific URL to provide compliant, one-click opt-out without password hurdles.
          </p>

          <div className="flex items-center gap-2">
            <div className="flex-1 font-mono text-[11px] text-muted-foreground bg-background px-3 py-2 rounded-lg border border-border/70 select-all truncate">
              {unsubscribeUrl}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyUnsubscribeUrl}
              className="h-8 px-2.5 text-xs gap-1.5 font-medium shrink-0"
            >
              {copiedTokenUrl ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
              {copiedTokenUrl ? "Copied" : "Copy Link"}
            </Button>
          </div>
        </div>

        {/* ── Subscriber Triage & Edit Studio ── */}
        <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3.5">
          <div className="flex items-center gap-1.5 pb-2 border-b border-border/50 text-xs font-bold text-foreground uppercase tracking-wider">
            <User className="size-3.5 text-primary" />
            <span>Subscriber Profile & Lifecycle</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="sub-name-edit" className="text-xs font-semibold">
                Subscriber Display Name
              </Label>
              <Input
                id="sub-name-edit"
                placeholder="e.g. Sarah Jenkins"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                className="h-9 text-xs"
              />
              <span className="text-[10px] text-muted-foreground">Used for campaign email greetings (e.g. &quot;Dear Sarah&quot;)</span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sub-status-edit" className="text-xs font-semibold">
                Subscription Status
              </Label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as SubscriberStatus)}
                disabled={isPending}
              >
                <SelectTrigger id="sub-status-edit" className="h-9 text-xs">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (Receives Broadcasts)</SelectItem>
                  <SelectItem value="unsubscribed">Unsubscribed (Opted Out)</SelectItem>
                  <SelectItem value="bounced">Bounced (Undeliverable)</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-[10px] text-muted-foreground">Only active subscribers receive future broadcasts</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sub-source-edit" className="text-xs font-semibold">
              Acquisition Channel Source
            </Label>
            <Select value={source} onValueChange={setSource} disabled={isPending}>
              <SelectTrigger id="sub-source-edit" className="h-9 text-xs">
                <SelectValue placeholder="Select Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="footer">Footer Newsletter Form</SelectItem>
                <SelectItem value="homepage_popup">Homepage Modal</SelectItem>
                <SelectItem value="event_registration">Event Registration</SelectItem>
                <SelectItem value="donation">Donation Form</SelectItem>
                <SelectItem value="manual_admin">Admin Manual Entry</SelectItem>
                <SelectItem value="import">CSV Contact Import</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── 3. Footer (Strictly conforming to user design rules) ── */}
      <div className="p-4 sm:p-5 border-t border-border/60 bg-muted/20">
        <DialogFooter className="flex flex-row items-center justify-end gap-2.5 sm:gap-3 w-full">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onOpenChange(false)
              onDelete(subscriber)
            }}
            disabled={isPending}
            className="h-10 text-xs gap-1.5 font-medium text-destructive hover:text-destructive hover:bg-destructive/10 mr-auto flex-1 sm:flex-none"
          >
            <Trash2 className="size-3.5" />
            Delete Subscriber
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="flex-1 sm:flex-none h-10 text-xs font-medium"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSaveChanges}
            disabled={isPending}
            className="flex-1 sm:flex-none h-10 gap-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  )
}

export function SubscriberDetailSheet({
  subscriber,
  isOpen,
  onOpenChange,
  onDelete,
  onUpdated,
}: SubscriberDetailSheetProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {subscriber && (
        <SubscriberDetailModalContent
          key={subscriber.id}
          subscriber={subscriber}
          onOpenChange={onOpenChange}
          onDelete={onDelete}
          onUpdated={onUpdated}
        />
      )}
    </Dialog>
  )
}
