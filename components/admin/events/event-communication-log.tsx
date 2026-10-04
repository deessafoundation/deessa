"use client"

import { useState, useEffect, useCallback } from "react"
import { Mail, Loader2, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { EventRegistrationEmail } from "@/lib/types/events-module"
import { getRegistrationEmailLog } from "@/lib/actions/events-module/event-registration"

interface EventCommunicationLogProps {
  registrationId: string
  refreshKey?: number
}

const TEMPLATE_LABELS: Record<string, string> = {
  confirmation: "Confirmation",
  payment_receipt: "Payment Receipt",
  reminder: "Reminder",
  cancellation: "Cancellation",
  custom: "Custom",
}

const TEMPLATE_COLORS: Record<string, string> = {
  confirmation: "bg-green-100 text-green-700",
  payment_receipt: "bg-blue-100 text-blue-700",
  reminder: "bg-amber-100 text-amber-700",
  cancellation: "bg-red-100 text-red-700",
  custom: "bg-purple-100 text-purple-700",
}

export function EventCommunicationLog({
  registrationId,
  refreshKey,
}: EventCommunicationLogProps) {
  const [emails, setEmails] = useState<EventRegistrationEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchEmails = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await getRegistrationEmailLog(registrationId)
      setEmails(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [registrationId])

  useEffect(() => {
    fetchEmails()
  }, [fetchEmails, refreshKey])

  // Auto-refresh when emails are sent
  useEffect(() => {
    function handleEmailSent() {
      fetchEmails()
    }
    window.addEventListener("email-sent", handleEmailSent)
    return () => window.removeEventListener("email-sent", handleEmailSent)
  }, [fetchEmails])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {loading ? "Loading..." : `${emails.length} email${emails.length !== 1 ? "s" : ""} sent`}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchEmails}
          disabled={loading}
          className="h-7 px-2"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <Mail className="size-8 text-muted-foreground/40" />
          <p className="text-sm text-red-500">Failed to load email log</p>
          <Button variant="ghost" size="sm" onClick={fetchEmails}>
            Try again
          </Button>
        </div>
      ) : emails.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <Mail className="size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No emails sent yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {emails.map((email) => (
            <div
              key={email.id}
              className="rounded-lg border border-border p-3 space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium truncate">{email.subject}</p>
                <Badge
                  variant="secondary"
                  className={`text-[10px] shrink-0 ${TEMPLATE_COLORS[email.template_type || "custom"] || ""}`}
                >
                  {TEMPLATE_LABELS[email.template_type || "custom"] || email.template_type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Sent {new Date(email.created_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {email.sent_by && ` by ${email.sent_by}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
