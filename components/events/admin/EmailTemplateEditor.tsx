"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TabsSwitcher } from "@/components/ui/tabs-switcher"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Loader2,
  Mail,
  RotateCcw,
  Info,
  Pencil,
  Plus,
  Trash2,
  ArrowLeft,
  Eye,
  Code,
  CheckCircle,
  Receipt,
  Clock,
  XCircle,
} from "lucide-react"
import { interpolateTemplate } from "@/lib/utils/template-interpolation"
import {
  upsertEmailTemplate,
  resetToDefaultTemplate,
  deleteEmailTemplate,
  seedMissingTemplates,
} from "@/lib/actions/events-module/event-email-templates"
import { notifications } from "@/lib/notifications"
import type {
  EventEmailTemplate,
  EmailTemplateType,
} from "@/lib/types/events-module"

interface EmailTemplateEditorProps {
  eventId: string
  templates: EventEmailTemplate[]
  onTemplatesChanged?: () => void
}

const STANDARD_TEMPLATE_TYPES: {
  value: EmailTemplateType
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { value: "confirmation", label: "Confirmation", description: "Sent when registration is confirmed", icon: CheckCircle },
  { value: "payment_receipt", label: "Payment Receipt", description: "Sent after successful payment", icon: Receipt },
  { value: "reminder", label: "Reminder", description: "Sent before the event date", icon: Clock },
  { value: "cancellation", label: "Cancellation", description: "Sent when registration is cancelled", icon: XCircle },
]

const AVAILABLE_VARIABLES = [
  { token: "{{full_name}}", description: "Registrant's full name" },
  { token: "{{email}}", description: "Registrant's email" },
  { token: "{{event_title}}", description: "Event title" },
  { token: "{{event_date}}", description: "Event date" },
  { token: "{{event_end_date}}", description: "Event end date (multi-day)" },
  { token: "{{event_location}}", description: "Event location" },
  { token: "{{venue_name}}", description: "Venue name" },
  { token: "{{contact_email}}", description: "Event contact email" },
  { token: "{{ticket_name}}", description: "Ticket type name" },
  { token: "{{ticket_price}}", description: "Ticket price" },
  { token: "{{registration_id}}", description: "Registration ID" },
  { token: "{{event_url}}", description: "Public event page URL" },
  { token: "{{site_url}}", description: "Site base URL (for logo links)" },
]

const SAMPLE_DATA: Record<string, string> = {
  full_name: "John Doe",
  email: "john.doe@example.com",
  event_title: "DEESSA Annual Conference 2026",
  event_date: "October 15-17, 2026",
  event_end_date: "October 17, 2026",
  event_location: "Kathmandu, Nepal",
  venue_name: "Hyatt Regency Kathmandu",
  contact_email: "events@deessa.org.np",
  ticket_name: "Early Bird",
  ticket_price: "NPR 5,000",
  registration_id: "DEESSA-2026-ABC123",
  event_url: "https://deessafoundation.com/events/annual-conference-2026",
  site_url: "https://deessafoundation.com",
}

function VariablesCard() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="h-4 w-4" />
          Available Variables
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2">
          {AVAILABLE_VARIABLES.map((v) => (
            <div key={v.token} className="flex items-center gap-2 text-sm">
              <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">{v.token}</code>
              <span className="text-muted-foreground">{v.description}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Variables are replaced with actual values when the email is sent.
        </p>
      </CardContent>
    </Card>
  )
}

function InlinePreview({ subject, bodyHtml }: { subject: string; bodyHtml: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const interpolatedSubject = interpolateTemplate(subject, SAMPLE_DATA)
  const interpolatedHtml = interpolateTemplate(bodyHtml, SAMPLE_DATA)

  const setIframeRef = useCallback(
    (node: HTMLIFrameElement | null) => {
      ;(iframeRef as React.MutableRefObject<HTMLIFrameElement | null>).current = node
      if (node) {
        node.srcdoc = interpolatedHtml
      }
    },
    [interpolatedHtml]
  )

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-muted px-3 py-2 text-sm">
        <span className="text-muted-foreground">Subject: </span>
        <span className="font-medium">{interpolatedSubject}</span>
      </div>
      <div className="rounded-lg border overflow-hidden">
        <iframe ref={setIframeRef} title="Email Preview" className="w-full h-[550px]" sandbox="allow-same-origin" />
      </div>
      <p className="text-xs text-muted-foreground">
        Preview uses sample data. Actual emails will contain real registrant information.
      </p>
    </div>
  )
}

export function EmailTemplateEditor({ eventId, templates, onTemplatesChanged }: EmailTemplateEditorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<EmailTemplateType | "custom">("confirmation")
  const [previewTabs, setPreviewTabs] = useState<Set<string>>(new Set())
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null)
  const [showNewCustomForm, setShowNewCustomForm] = useState(false)
  const [customPreview, setCustomPreview] = useState(false)
  const [customPreviewHtml, setCustomPreviewHtml] = useState("")
  const [customPreviewSubject, setCustomPreviewSubject] = useState("")
  const [isSeeding, setIsSeeding] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<EventEmailTemplate | null>(null)
  const [previewingCustomId, setPreviewingCustomId] = useState<string | null>(null)

  const customTemplates = templates.filter((t) => t.template_type === "custom")
  const editingCustomTemplate = editingCustomId ? templates.find((t) => t.id === editingCustomId) : null
  const currentTemplate = templates.find((t) => t.template_type === activeTab && t.template_type !== "custom")

  function isPreviewing(tab: string) {
    return previewTabs.has(tab)
  }

  function togglePreview(tab: string) {
    setPreviewTabs((prev) => {
      const next = new Set(prev)
      if (next.has(tab)) next.delete(tab)
      else next.add(tab)
      return next
    })
  }

  async function handleSaveStandard(formData: FormData) {
    setIsLoading(true)
    const result = await upsertEmailTemplate({
      event_id: eventId,
      template_type: activeTab as EmailTemplateType,
      subject: formData.get("subject") as string,
      body_html: formData.get("body_html") as string,
      body_text: (formData.get("body_text") as string) || undefined,
    })
    if (result.error) {
      notifications.showError({ description: result.error })
    } else {
      notifications.showSuccess({ description: "Email template saved successfully." })
      onTemplatesChanged?.()
    }
    setIsLoading(false)
  }

  async function handleSaveCustom(formData: FormData) {
    setIsLoading(true)
    const label = (formData.get("label") as string) || "Untitled Template"
    const result = await upsertEmailTemplate({
      id: editingCustomId || undefined,
      event_id: eventId,
      template_type: "custom",
      label,
      subject: formData.get("subject") as string,
      body_html: formData.get("body_html") as string,
      body_text: (formData.get("body_text") as string) || undefined,
    })
    if (result.error) {
      notifications.showError({ description: result.error })
    } else {
      notifications.showSuccess({
        description: editingCustomId ? "Custom template updated." : "Custom template created.",
      })
      setEditingCustomId(null)
      setShowNewCustomForm(false)
      onTemplatesChanged?.()
    }
    setIsLoading(false)
  }

  async function handleReset() {
    if (activeTab === "custom") return
    setIsResetting(activeTab)
    const result = await resetToDefaultTemplate(eventId, activeTab as EmailTemplateType)
    if (result.error) {
      notifications.showError({ description: result.error })
    } else {
      notifications.showSuccess({ description: `Reset to default ${activeTab} template.` })
      onTemplatesChanged?.()
    }
    setIsResetting(null)
  }

  async function handleDelete(id: string) {
    setIsDeleting(id)
    const result = await deleteEmailTemplate(id, eventId)
    if (result.error) {
      notifications.showError({ description: result.error })
    } else {
      notifications.showSuccess({ description: "Custom template deleted." })
      if (editingCustomId === id) setEditingCustomId(null)
      onTemplatesChanged?.()
    }
    setIsDeleting(null)
  }

  function handleCustomPreview() {
    const subjectInput = document.getElementById("custom_subject") as HTMLInputElement | null
    const bodyInput = document.getElementById("custom_body_html") as HTMLTextAreaElement | null
    setCustomPreviewSubject(interpolateTemplate(subjectInput?.value || "", SAMPLE_DATA))
    setCustomPreviewHtml(interpolateTemplate(bodyInput?.value || "", SAMPLE_DATA))
    setCustomPreview(true)
  }

  async function handleSeedMissing() {
    setIsSeeding(true)
    const result = await seedMissingTemplates(eventId)
    if (result.error) {
      notifications.showError({ description: result.error })
    } else {
      const count = result.data?.inserted ?? 0
      notifications.showSuccess({
        description: count > 0
          ? `Added ${count} missing default template${count > 1 ? "s" : ""}.`
          : "All default templates already exist.",
      })
      onTemplatesChanged?.()
    }
    setIsSeeding(false)
  }

  const showCustomForm = editingCustomTemplate || showNewCustomForm
  const hasMissingDefaults = !templates.some((t) => t.template_type === "confirmation") ||
    !templates.some((t) => t.template_type === "payment_receipt") ||
    !templates.some((t) => t.template_type === "reminder") ||
    !templates.some((t) => t.template_type === "cancellation")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Email Templates</h2>
          <p className="text-sm text-muted-foreground">
            Customize the emails sent to registrants for this event. Templates use
            variables that get replaced with actual values when the email is sent.
          </p>
        </div>
        {hasMissingDefaults && (
          <Button variant="outline" size="sm" onClick={handleSeedMissing} disabled={isSeeding}>
            {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Add Missing Defaults
          </Button>
        )}
      </div>

      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-blue-900">About form fields in emails</p>
              <p className="text-blue-700">
                The variables above are automatically filled with data from the registration form.
                Custom form field IDs become available as <code className="px-1 py-0.5 bg-blue-100 rounded text-xs font-mono">{"{{field_id}}"}</code> variables.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <TabsSwitcher
        tabs={[
          ...STANDARD_TEMPLATE_TYPES.map((type) => ({
            label: type.label,
            id: type.value,
            icon: type.icon,
          })),
          { label: "Custom", id: "custom", icon: Pencil },
        ]}
        activeTab={activeTab}
        onTabChange={(v) => {
          setActiveTab(v as EmailTemplateType | "custom")
          setEditingCustomId(null)
          setShowNewCustomForm(false)
          setCustomPreview(false)
        }}
      />

      <div className="mt-4">
        {STANDARD_TEMPLATE_TYPES.map((type) => {
          if (activeTab !== type.value) return null
          const previewing = isPreviewing(type.value)
          return (
            <div key={type.value}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        {type.label} Email
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={previewing ? "default" : "outline"}
                        size="sm"
                        onClick={() => togglePreview(type.value)}
                      >
                        {previewing ? <Code className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                        {previewing ? "Edit" : "Preview"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleReset} disabled={isResetting === activeTab}>
                        {isResetting === activeTab ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {previewing ? (
                    <InlinePreview
                      subject={currentTemplate?.subject || ""}
                      bodyHtml={currentTemplate?.body_html || ""}
                    />
                  ) : (
                    <form action={handleSaveStandard} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject Line *</Label>
                        <Input id="subject" name="subject" defaultValue={currentTemplate?.subject || ""} placeholder="e.g. Registration Confirmed - {{event_title}}" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="body_html">HTML Body *</Label>
                        <Textarea id="body_html" name="body_html" defaultValue={currentTemplate?.body_html || ""} rows={16} className="font-mono text-sm" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="body_text">Plain Text Body</Label>
                        <Textarea id="body_text" name="body_text" defaultValue={currentTemplate?.body_text || ""} rows={6} placeholder="Plain text version for email clients that don't support HTML" />
                      </div>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Template
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
              <VariablesCard />
            </div>
          )
        })}

        {activeTab === "custom" && (
          <div>
            {showCustomForm ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingCustomId(null); setShowNewCustomForm(false); setCustomPreview(false) }} className="mr-1 h-8 w-8 p-0">
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        {editingCustomTemplate ? "Edit Custom Template" : "New Custom Template"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Create a custom email template for any purpose.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={customPreview ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (customPreview) {
                            setCustomPreview(false)
                          } else {
                            handleCustomPreview()
                          }
                        }}
                      >
                        {customPreview ? <Code className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                        {customPreview ? "Edit" : "Preview"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {customPreview ? (
                    <InlinePreview subject={customPreviewSubject} bodyHtml={customPreviewHtml} />
                  ) : (
                    <form action={handleSaveCustom} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="label">Template Name *</Label>
                        <Input id="label" name="label" defaultValue={editingCustomTemplate?.label || ""} placeholder="e.g. Welcome Email, Follow-up, Thank You" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="custom_subject">Subject Line *</Label>
                        <Input id="custom_subject" name="subject" defaultValue={editingCustomTemplate?.subject || ""} placeholder="e.g. Welcome to {{event_title}}!" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="custom_body_html">HTML Body *</Label>
                        <Textarea id="custom_body_html" name="body_html" defaultValue={editingCustomTemplate?.body_html || ""} rows={16} className="font-mono text-sm" placeholder="<h1>Welcome, {{full_name}}!</h1>" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="custom_body_text">Plain Text Body</Label>
                        <Textarea id="custom_body_text" name="body_text" defaultValue={editingCustomTemplate?.body_text || ""} rows={6} placeholder="Plain text version" />
                      </div>
                      <div className="flex gap-3">
                        <Button type="submit" disabled={isLoading}>
                          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {editingCustomTemplate ? "Update Template" : "Create Template"}
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => { setEditingCustomId(null); setShowNewCustomForm(false); setCustomPreview(false) }}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Pencil className="h-5 w-5" />
                        Custom Templates
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Create unlimited custom email templates for any purpose.
                      </p>
                    </div>
                    <Button size="sm" onClick={() => setShowNewCustomForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Custom Template
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {customTemplates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Pencil className="mx-auto h-8 w-8 mb-3 opacity-50" />
                      <p className="text-sm">No custom templates yet.</p>
                      <p className="text-xs mt-1">Click &quot;New Custom Template&quot; to create one.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customTemplates.map((tpl) => (
                        <div key={tpl.id} className="group flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{tpl.label || "Untitled Template"}</p>
                            <p className="text-sm text-muted-foreground truncate">{tpl.subject}</p>
                          </div>
                          <div className="flex items-center gap-1 ml-4 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant={previewingCustomId === tpl.id ? "default" : "ghost"}
                              size="icon"
                              className="h-8 w-8"
                              title={previewingCustomId === tpl.id ? "Close preview" : "Preview"}
                              onClick={() => setPreviewingCustomId(previewingCustomId === tpl.id ? null : tpl.id)}
                            >
                              {previewingCustomId === tpl.id ? <Code className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Edit"
                              onClick={() => setEditingCustomId(tpl.id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Delete"
                              onClick={() => setDeleteTarget(tpl)}
                              disabled={isDeleting === tpl.id}
                            >
                              {isDeleting === tpl.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-destructive" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Inline preview for custom template */}
            {previewingCustomId && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      {customTemplates.find((t) => t.id === previewingCustomId)?.label || "Template Preview"}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setPreviewingCustomId(null)}>
                      Cancel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <InlinePreview
                    subject={customTemplates.find((t) => t.id === previewingCustomId)?.subject || ""}
                    bodyHtml={customTemplates.find((t) => t.id === previewingCustomId)?.body_html || ""}
                  />
                </CardContent>
              </Card>
            )}

            <VariablesCard />
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-medium text-foreground">{deleteTarget?.label || "Untitled Template"}</span>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget?.id) handleDelete(deleteTarget.id)
                setDeleteTarget(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
