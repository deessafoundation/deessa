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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Send,
  Save,
  MailCheck,
  Smartphone,
  Monitor,
  Loader2,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { notifications } from "@/lib/notifications"
import {
  saveCampaignDraft,
  sendTestCampaignEmailAction,
  broadcastCampaignAction,
} from "@/lib/actions/admin-campaigns"
import type { NewsletterCampaign } from "@/lib/data/newsletter"
import { buildNewsletterEmailHtml } from "@/lib/email/templates/newsletter"
import styles from "./newsletter.module.css"

interface CampaignComposerDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  initialCampaign?: NewsletterCampaign | null
  activeSubscriberCount: number
  adminEmail: string
  onSaved?: () => void
}

export function CampaignComposerDialog({
  isOpen,
  onOpenChange,
  initialCampaign = null,
  activeSubscriberCount,
  adminEmail,
  onSaved,
}: CampaignComposerDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop")

  const [campaignId, setCampaignId] = useState<string | undefined>(initialCampaign?.id)
  const [title, setTitle] = useState<string>(initialCampaign?.title || "")
  const [subject, setSubject] = useState<string>(initialCampaign?.subject || "")
  const [previewText, setPreviewText] = useState<string>(initialCampaign?.preview_text || "")
  const [contentHtml, setContentHtml] = useState<string>(
    initialCampaign?.content_html ||
      `<p>We are delighted to share this month's updates from the ground at <strong>deessa Foundation</strong>.</p>\n\n<p>Thanks to the continuous dedication of our supporters, our community initiatives for autistic children and families in Nepal continue to make tangible impact.</p>\n\n<h2>Key Highlights This Month</h2>\n<ul>\n  <li>Expanded neurodiversity training workshops across local community centers.</li>\n  <li>Welcomed new changemaker voices in our community storytelling series.</li>\n  <li>Provided accessible family support resources for early intervention.</li>\n</ul>\n\n<p>Thank you for walking this path of acceptance and inclusive empowerment with us.</p>`
  )
  const [isPublic, setIsPublic] = useState<boolean>(initialCampaign ? initialCampaign.is_public : true)

  // Test send state
  const [testEmail, setTestEmail] = useState<string>(adminEmail)
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false)

  // Broadcast confirmation dialog state
  const [isConfirmBroadcastOpen, setIsConfirmBroadcastOpen] = useState<boolean>(false)
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false)

  const isAlreadySent = initialCampaign?.status === "sent"

  // Insert merge tag into content
  const handleInsertMergeTag = (tag: string) => {
    setContentHtml((prev) => `${prev} ${tag}`)
  }

  // Generate HTML preview for iframe
  const previewHtml = buildNewsletterEmailHtml({
    subscriberName: "Valued Supporter",
    subject: subject || "Community Bulletin Preview",
    previewText: previewText || "Monthly foundation insights and updates",
    contentHtml: contentHtml || "<p>Email content goes here...</p>",
    unsubscribeUrl: "https://deessafoundation.com/unsubscribe?token=preview-token",
    isTest: true,
  })

  // Save draft
  const handleSaveDraft = () => {
    if (!title.trim() || !subject.trim() || !contentHtml.trim()) {
      notifications.showError("Please fill in the title, subject line, and content")
      return
    }

    startTransition(async () => {
      const res = await saveCampaignDraft({
        id: campaignId,
        title,
        subject,
        previewText: previewText.trim() || undefined,
        contentHtml,
        isPublic,
      })

      if (res.success && res.campaign) {
        setCampaignId(res.campaign.id)
        notifications.showSuccess("Campaign draft saved successfully")
        if (onSaved) onSaved()
      } else {
        notifications.showError(res.error || "Failed to save campaign draft")
      }
    })
  }

  // Send test email
  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      notifications.showError("Please enter a valid test recipient email")
      return
    }

    if (!subject.trim() || !contentHtml.trim()) {
      notifications.showError("Please specify a subject and content before sending a test")
      return
    }

    setIsSendingTest(true)
    try {
      const res = await sendTestCampaignEmailAction({
        subject,
        previewText,
        contentHtml,
        testEmail,
      })

      if (res.success) {
        notifications.showSuccess(`Test preview email dispatched to ${testEmail}`)
      } else {
        notifications.showError(res.error || "Failed to send test email")
      }
    } catch {
      notifications.showError("Unexpected error sending test email")
    } finally {
      setIsSendingTest(false)
    }
  }

  // Broadcast to audience
  const handleBroadcast = async () => {
    // First save latest changes
    let targetCampaignId = campaignId

    if (!targetCampaignId) {
      const saveRes = await saveCampaignDraft({
        title,
        subject,
        previewText: previewText.trim() || undefined,
        contentHtml,
        isPublic,
      })
      if (!saveRes.success || !saveRes.campaign) {
        notifications.showError(saveRes.error || "Failed to save campaign before broadcast")
        return
      }
      targetCampaignId = saveRes.campaign.id
      setCampaignId(targetCampaignId)
    }

    setIsBroadcasting(true)
    try {
      const res = await broadcastCampaignAction(targetCampaignId)
      if (res.success) {
        notifications.showSuccess(
          `Broadcast completed: ${res.successCount} sent, ${res.failureCount} failed out of ${res.recipientsCount} subscribers.`
        )
        setIsConfirmBroadcastOpen(false)
        onOpenChange(false)
        if (onSaved) onSaved()
      } else {
        notifications.showError(res.error || "Broadcast error occurred")
      }
    } catch {
      notifications.showError("Unexpected broadcast failure")
    } finally {
      setIsBroadcasting(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border bg-muted/20">
            <DialogHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    {isAlreadySent ? "View Sent Broadcast" : campaignId ? "Edit Campaign Draft" : "Compose New Campaign"}
                    {isAlreadySent && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 font-semibold">
                        Sent on {new Date(initialCampaign.sent_at || initialCampaign.updated_at).toLocaleDateString()}
                      </span>
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Craft responsive, accessible newsletters with live device previews and throttled delivery.
                  </DialogDescription>
                </div>

                <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as "edit" | "preview")}>
                  <TabsList className="h-9">
                    <TabsTrigger value="edit" className="text-xs">
                      Compose
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="text-xs gap-1.5">
                      <Sparkles className="size-3.5" />
                      Live Preview
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </DialogHeader>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "edit" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="camp-title" className="text-xs font-semibold">
                      Internal Campaign Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="camp-title"
                      placeholder="e.g. November 2026 Community Bulletin"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={isPending || isAlreadySent}
                      className="h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="camp-subject" className="text-xs font-semibold">
                      Email Subject Line <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="camp-subject"
                      placeholder="e.g. Empowering Autistic Children: Stories & Updates"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      disabled={isPending || isAlreadySent}
                      className="h-10 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="camp-preheader" className="text-xs font-semibold">
                      Inbox Preheader / Preview Text
                    </Label>
                    <span className="text-[11px] text-muted-foreground">Appears next to the subject in Gmail & Apple Mail</span>
                  </div>
                  <Input
                    id="camp-preheader"
                    placeholder="e.g. Read how families and children joined our workshops this month..."
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    disabled={isPending || isAlreadySent}
                    className="h-9 text-xs"
                  />
                </div>

                {/* Content Editor */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label htmlFor="camp-content" className="text-xs font-semibold">
                      Email Article Body (HTML / Formatted Content) <span className="text-destructive">*</span>
                    </Label>
                    {!isAlreadySent && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-muted-foreground text-[11px]">Insert tag:</span>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleInsertMergeTag("{{name}}")}
                          className="h-6 px-2 text-[11px]"
                        >
                          {"{{name}}"}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleInsertMergeTag("{{current_year}}")}
                          className="h-6 px-2 text-[11px]"
                        >
                          {"{{current_year}}"}
                        </Button>
                      </div>
                    )}
                  </div>
                  <Textarea
                    id="camp-content"
                    placeholder="<p>Write your newsletter body with standard HTML paragraphs and headings...</p>"
                    value={contentHtml}
                    onChange={(e) => setContentHtml(e.target.value)}
                    rows={12}
                    disabled={isPending || isAlreadySent}
                    className="font-mono text-xs leading-relaxed resize-y"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <Checkbox
                    id="camp-public"
                    checked={isPublic}
                    onCheckedChange={(checked) => setIsPublic(Boolean(checked))}
                    disabled={isPending || isAlreadySent}
                  />
                  <Label htmlFor="camp-public" className="text-xs font-medium text-foreground cursor-pointer">
                    Publish to Public Newsletter Archive (<code className="text-xs">/newsletter-archive</code>) after sending
                  </Label>
                </div>

                {/* Pre-flight Test Email Section */}
                <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <MailCheck className="size-4 text-primary" />
                        Send Pre-Flight Test Email
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Verify typography, spacing, and formatting in your real email inbox before broadcasting.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        disabled={isSendingTest}
                        className="h-8 text-xs w-48 sm:w-56"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleSendTest}
                        disabled={isSendingTest}
                        className="h-8 text-xs gap-1.5 shrink-0"
                      >
                        {isSendingTest ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                        Send Test
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Live Preview Tab */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="text-xs text-muted-foreground">
                    Simulating view for: <strong className="text-foreground">Valued Supporter</strong>
                  </div>

                  <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                    <Button
                      type="button"
                      variant={previewDevice === "desktop" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewDevice("desktop")}
                      className="h-7 text-xs gap-1 px-2.5"
                    >
                      <Monitor className="size-3.5" />
                      Desktop (600px)
                    </Button>
                    <Button
                      type="button"
                      variant={previewDevice === "mobile" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPreviewDevice("mobile")}
                      className="h-7 text-xs gap-1 px-2.5"
                    >
                      <Smartphone className="size-3.5" />
                      Mobile (375px)
                    </Button>
                  </div>
                </div>

                <div className="py-2">
                  <div
                    className={
                      previewDevice === "mobile"
                        ? `${styles.previewFrame} ${styles.mobilePreview}`
                        : `${styles.previewFrame} ${styles.desktopPreview}`
                    }
                  >
                    <iframe
                      title="Newsletter Email Preview"
                      srcDoc={previewHtml}
                      className="w-full h-[520px] border-0 bg-white"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Info className="size-3.5 text-primary" />
              <span>
                Audience: <strong className="text-foreground font-semibold">{activeSubscriberCount}</strong> active recipients
              </span>
            </div>

            <DialogFooter className="flex flex-row items-center justify-end gap-2.5 sm:gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending || isBroadcasting}
                className="flex-1 sm:flex-none h-10"
              >
                Close
              </Button>

              {!isAlreadySent && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSaveDraft}
                    disabled={isPending || isBroadcasting}
                    className="flex-1 sm:flex-none h-10 gap-1.5"
                  >
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    Save Draft
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setIsConfirmBroadcastOpen(true)}
                    disabled={isPending || isBroadcasting || activeSubscriberCount === 0}
                    className="flex-1 sm:flex-none h-10 gap-2 bg-primary text-primary-foreground font-semibold"
                  >
                    {isBroadcasting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Broadcasting...
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        Broadcast Now
                      </>
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Safety Confirmation Dialog for Broadcasting */}
      <Dialog open={isConfirmBroadcastOpen} onOpenChange={setIsConfirmBroadcastOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-lg">Confirm Campaign Broadcast</DialogTitle>
                <DialogDescription className="text-xs">
                  This action will dispatch live emails to all active community members.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-3 text-sm text-muted-foreground">
            <p>
              You are about to broadcast <strong className="text-foreground">&quot;{subject}&quot;</strong> to{" "}
              <strong className="text-foreground">{activeSubscriberCount} active subscribers</strong>.
            </p>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-foreground font-medium">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                CAN-SPAM Compliant with 1-click unsubscribe
              </div>
              <div className="flex items-center gap-1.5 text-foreground font-medium">
                <CheckCircle2 className="size-3.5 text-emerald-600" />
                Throttled in safe batches (15 emails/chunk, 500ms delay)
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-2.5 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmBroadcastOpen(false)}
              disabled={isBroadcasting}
              className="flex-1 sm:flex-none h-10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleBroadcast}
              disabled={isBroadcasting}
              className="flex-1 sm:flex-none h-10 gap-2 bg-primary text-primary-foreground font-semibold"
            >
              {isBroadcasting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending Broadcast...
                </>
              ) : (
                "Yes, Send to Audience"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
