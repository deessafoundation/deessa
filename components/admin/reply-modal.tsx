"use client"

import React from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

type ReplyMode = 'generic' | 'custom'

interface Props {
  id: string
  to?: string | null
  toName?: string | null
  reportStatus?: string | null
  issueType?: string | null
  summary?: string | null
  mode?: ReplyMode
  triggerLabel?: string
}

function buildDefaults(mode: ReplyMode, params: { toName?: string | null; reportId: string; reportStatus?: string | null; issueType?: string | null; summary?: string | null }) {
  const recipient = params.toName || 'there'
  const shortId = params.reportId
  const status = params.reportStatus || 'open'
  const type = params.issueType || 'Support Request'
  const summary = params.summary || 'Your support request'

  // Format status with color indicator
  const statusDisplay = status === 'closed' ? '✅ Resolved' : status === 'in-progress' ? '⏳ In Progress' : '📋 Under Review'

  if (mode === 'generic') {
    // This is for when admin sends an update (typically when issue is resolved or needs follow-up)
    const isResolved = status === 'closed'
    
    return {
      subject: isResolved 
        ? `${type} Resolved — Ticket #${shortId.slice(0, 8)} | DEESSA Foundation`
        : `Update on Your ${type} — Ticket #${shortId.slice(0, 8)} | DEESSA Foundation`,
      message: isResolved 
        ? `Hello ${recipient},

Great news! We've resolved the issue you reported.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ISSUE RESOLVED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ticket ID: ${shortId}
Type: ${type}
Issue: ${summary}
Status: ✅ Resolved

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for bringing this to our attention. Your ${type.toLowerCase()} has been addressed and the fix is now live on our website.

We appreciate your help in making DEESSA Foundation better. If you notice the issue is still occurring or have any other concerns, please don't hesitate to reply to this email.

Best regards,
DEESSA Foundation Support Team

---
Your feedback helps us improve. Thank you for being part of our community!`
        : `Hello ${recipient},

We wanted to give you an update on your ${type.toLowerCase()}.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 STATUS UPDATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ticket ID: ${shortId}
Type: ${type}
Issue: ${summary}
Current Status: ${statusDisplay}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Our team is actively working on your ${type.toLowerCase()}. We're making progress and will keep you updated as we move forward.

If you have any additional information that might help us, or if you have questions, simply reply to this email.

Best regards,
DEESSA Foundation Support Team

---
We appreciate your patience as we work to address your concern.`,
    }
  }

  return {
    subject: `Re: Your ${type} — Ticket #${shortId.slice(0, 8)} | DEESSA Foundation`,
    message: `Hello ${recipient},

Thank you for reaching out to DEESSA Foundation. We've reviewed your ${type.toLowerCase()} and wanted to provide you with a personalized response.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 YOUR TICKET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ticket ID: ${shortId}
Type: ${type}
Issue: ${summary}
Status: ${statusDisplay}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Edit this section to add your personalized response. You can:
- Explain what you've done to fix the issue
- Ask for more information or clarification
- Provide a timeline for when the fix will be implemented
- Share any workarounds or temporary solutions
- Thank them for specific details they provided]

If you have any questions or need further assistance, please reply to this email and we'll be happy to help.

Best regards,
DEESSA Foundation Support Team

---
Ticket reference: ${shortId.slice(0, 8)}`,
  }
}

export default function ReplyModal({ id, to, toName, reportStatus, issueType, summary, mode = 'custom', triggerLabel }: Props) {
  const [open, setOpen] = React.useState(false)
  const defaults = React.useMemo(() => buildDefaults(mode, { toName, reportId: id, reportStatus, issueType, summary }), [mode, toName, id, reportStatus, issueType, summary])
  const [subject, setSubject] = React.useState(defaults.subject)
  const [message, setMessage] = React.useState(defaults.message)
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    setSubject(defaults.subject)
    setMessage(defaults.message)
  }, [defaults.subject, defaults.message])

  async function send() {
    if (!to) return alert('No recipient')
    setLoading(true)
    try {
      const payload: any = {
        to,
        toName: toName || undefined,
        subject,
        message,
        reportStatus: reportStatus || null,
      }
      const res = await fetch('/api/admin/support/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'send-reply', payload }),
      })
      if (!res.ok) throw new Error(await res.text())
      setOpen(false)
      router.refresh()
    } catch (err) {
      alert('Failed to send reply')
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={!to} variant={mode === 'generic' ? 'outline' : 'default'}>
          {triggerLabel || (mode === 'generic' ? 'Send Generic Reply' : 'Send Custom Reply')}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="text-left">
          <DialogTitle>{mode === 'generic' ? 'Generic Email Template' : 'Custom Email Reply'}</DialogTitle>
          <DialogDescription>
            {mode === 'generic'
              ? 'A branded support update with ticket details, type, summary, and status. You can still edit it before sending.'
              : 'Start with a ready-to-edit reply with full ticket context and tailor the message before sending.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-center">
            <label className="text-sm font-medium text-muted-foreground">Subject</label>
            <input className="w-full rounded-md border px-3 py-2 text-sm" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          <div className="grid gap-2 sm:grid-cols-[120px_1fr] sm:items-start">
            <label className="pt-2 text-sm font-medium text-muted-foreground">Message</label>
            <textarea className="min-h-[280px] w-full rounded-md border px-3 py-2 text-sm leading-6" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Sending to:</span> {toName || to}
            <br />
            <span className="font-medium text-foreground">Report ID:</span> {id}
            <br />
            <span className="font-medium text-foreground">Type:</span> {issueType || 'Support Request'}
            <br />
            <span className="font-medium text-foreground">Template:</span> {mode === 'generic' ? 'Generic update' : 'Custom reply'}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={send} disabled={loading}>{loading ? 'Sending...' : 'Send'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
