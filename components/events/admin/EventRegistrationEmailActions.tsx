"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Mail,
  Loader2,
  Send,
  Copy,
  Check,
  RefreshCw,
  Info,
  Bell,
  AlertTriangle,
  Pencil,
  FileText,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { notifications } from "@/lib/notifications"
import { sendEventRegistrationEmail } from "@/lib/actions/events-module/event-registration"
import { interpolateTemplate } from "@/lib/utils/template-interpolation"
import type { EventEmailTemplate } from "@/lib/types/events-module"

interface EventRegistrationEmailActionsProps {
  registrationId: string
  eventId: string
  eventTitle: string
  shortId?: string
  email?: string
  status?: string
  fullName?: string
}

const EMAIL_TEMPLATES = [
  {
    type: "confirmation" as const,
    label: "Send Confirmation",
    description: "Confirm registration and send details",
    icon: <Info className="size-4 shrink-0" />,
  },
  {
    type: "reminder" as const,
    label: "Send Reminder",
    description: "Upcoming event reminder",
    icon: <Bell className="size-4 shrink-0" />,
  },
  {
    type: "cancellation" as const,
    label: "Send Cancellation",
    description: "Cancellation notice",
    icon: <AlertTriangle className="size-4 shrink-0" />,
  },
]

export function EventRegistrationEmailActions({
  registrationId,
  eventId,
  eventTitle,
  shortId = "",
  email = "",
  status = "",
  fullName = "",
}: EventRegistrationEmailActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showCompose, setShowCompose] = useState(false)
  const [customSubject, setCustomSubject] = useState("")
  const [customBody, setCustomBody] = useState("")
  const [customTemplates, setCustomTemplates] = useState<EventEmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EventEmailTemplate | null>(null)

  useEffect(() => {
    fetch(`/api/admin/events/${eventId}/email-templates`)
      .then((r) => r.json())
      .then((json) => {
        const templates = json.templates || []
        setCustomTemplates(templates.filter((t: EventEmailTemplate) => t.template_type === "custom"))
      })
      .catch(() => {})
  }, [eventId])

  // Copy Registration ID
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortId)
      setCopied(true)
      notifications.showSuccess({ description: `${shortId} copied to clipboard.` })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      notifications.showError({ description: "Could not access clipboard." })
    }
  }

  // Send template email
  async function handleSendTemplate(
    type: "confirmation" | "reminder" | "cancellation"
  ) {
    setLoading(type)
    const result = await sendEventRegistrationEmail(registrationId, type)
    setLoading(null)

    if (result.error) {
      notifications.showError({ description: result.error })
    } else {
      notifications.showSuccess({ description: `${type} email sent to ${email}.` })
      window.dispatchEvent(new CustomEvent("email-sent"))
      router.refresh()
    }
  }

  // Send custom email
  async function handleSendCustom() {
    if (!customSubject || !customBody) return
    setLoading("custom")
    const result = await sendEventRegistrationEmail(
      registrationId,
      "custom",
      customSubject,
      customBody
    )
    setLoading(null)
    setShowCompose(false)
    setCustomSubject("")
    setCustomBody("")

    if (result.error) {
      notifications.showError({ description: result.error })
    } else {
      notifications.showSuccess({ description: `Custom email sent to ${email}.` })
      window.dispatchEvent(new CustomEvent("email-sent"))
      router.refresh()
    }
  }

  // Send a custom template (interpolate and send)
  async function handleSendCustomTemplate(template: EventEmailTemplate) {
    setLoading(`custom-${template.id}`)
    const vars = {
      full_name: fullName,
      email: email,
      event_title: eventTitle,
    }
    const subject = interpolateTemplate(template.subject || "", vars)
    const body = interpolateTemplate(template.body_html || "", vars)
    const result = await sendEventRegistrationEmail(registrationId, "custom", subject, body)
    setLoading(null)

    if (result.error) {
      notifications.showError({ description: result.error })
    } else {
      notifications.showSuccess({ description: `Email sent to ${email}.` })
      window.dispatchEvent(new CustomEvent("email-sent"))
      router.refresh()
    }
  }

  return (
    <>
      {/* Quick Actions */}
      <div className="flex flex-col gap-2">
        {/* Copy Registration ID */}
        {shortId && (
          <button
            onClick={handleCopy}
            className="group flex w-full items-center gap-3 rounded-xl border border-border/60 bg-muted/40 px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted hover:shadow-sm hover:border-border active:scale-[0.98]"
          >
            {copied ? (
              <Check className="size-4 shrink-0 text-green-600" />
            ) : (
              <Copy className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:scale-110 group-hover:text-foreground" />
            )}
            <span className="flex-1 text-left">{copied ? "Copied!" : "Copy Registration ID"}</span>
            <span className="font-mono text-xs text-muted-foreground">{shortId}</span>
          </button>
        )}

        {/* Re-send Confirmation Email — confirmed only */}
        {status === "confirmed" && (
          <button
            onClick={() => handleSendTemplate("confirmation")}
            disabled={loading !== null}
            className="group flex w-full items-center gap-3 rounded-xl border border-border/60 bg-muted/40 px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted hover:shadow-sm hover:border-border active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
          >
            {loading === "confirmation" ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
            ) : (
              <RefreshCw className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:rotate-180 group-hover:text-foreground" />
            )}
            Re-send Confirmation Email
          </button>
        )}

        {/* Compose Custom Email */}
        <button
          onClick={() => setShowCompose(true)}
          className="group flex w-full items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary transition-all duration-200 hover:bg-primary/10 hover:shadow-sm hover:border-primary/30 active:scale-[0.98]"
        >
          <Mail className="size-4 shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-3" />
          Compose Custom Email
        </button>
      </div>

      {/* Email Templates */}
      <div className="mt-4 border-t border-border pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Quick Templates
        </p>
        <div className="flex flex-col gap-2">
          {EMAIL_TEMPLATES.map(({ type, label, description, icon }) => (
            <button
              key={type}
              onClick={() => handleSendTemplate(type)}
              disabled={loading !== null}
              className="group flex w-full items-start gap-3 rounded-xl border border-border/60 bg-muted/40 px-4 py-3 text-left transition-all duration-200 hover:bg-muted hover:shadow-sm hover:border-border active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
            >
              <span className="mt-0.5 transition-transform duration-200 group-hover:scale-110">
                {loading === type ? (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                ) : (
                  icon
                )}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{label}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Templates */}
      {customTemplates.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Custom Templates
          </p>
          <div className="flex flex-col gap-2">
            {customTemplates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleSendCustomTemplate(tpl)}
                disabled={loading !== null}
                className="group flex w-full items-start gap-3 rounded-xl border border-border/60 bg-muted/40 px-4 py-3 text-left transition-all duration-200 hover:bg-muted hover:shadow-sm hover:border-border active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
              >
                <span className="mt-0.5 transition-transform duration-200 group-hover:scale-110">
                  {loading === `custom-${tpl.id}` ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  ) : (
                    <FileText className="size-4 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-foreground" />
                  )}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">{tpl.label || "Untitled Template"}</span>
                  <span className="text-xs text-muted-foreground truncate">{tpl.subject}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Compose Dialog */}
      <Dialog open={showCompose} onOpenChange={setShowCompose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Mail className="size-4 text-primary" />
              </div>
              Compose Email
            </DialogTitle>
            <DialogDescription>
              Send a custom message to <strong>{email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder={`Regarding your registration for ${eventTitle}`}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                placeholder="Type your message here..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompose(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendCustom}
              disabled={!customSubject || !customBody || loading === "custom"}
            >
              {loading === "custom" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
