"use client"

import { useState, useTransition, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Send,
  Save,
  Smartphone,
  Monitor,
  Code,
  Sparkles,
  Layers,
  Image as ImageIcon,
  AlertCircle,
  Plus,
  Loader2,
  ShieldCheck,
  Check,
  LayoutGrid,
  Quote,
  Columns2,
  PenSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { notifications } from "@/lib/notifications"
import { FileUpload } from "@/components/admin/media/file-upload"
import {
  buildNewsletterEmailHtml,
} from "@/lib/email/templates/newsletter"
import {
  NEWSLETTER_PRESETS,
  type NewsletterTemplatePreset,
  generateHeroImageHtml,
  generateImageLeftTextRightHtml,
  generateTextLeftImageRightHtml,
  generateCtaButtonHtml,
  generateQuoteBoxHtml,
  generateStatsGridHtml,
} from "@/lib/email/templates/newsletter-presets"
import {
  saveCampaignDraft,
  sendTestCampaignEmailAction,
  broadcastCampaignAction,
} from "@/lib/actions/admin-campaigns"
import type { NewsletterCampaign } from "@/lib/data/newsletter"
import { NewsletterVisualEditor } from "./newsletter-visual-editor"

interface CampaignStudioProps {
  mode: "create" | "edit"
  campaign?: NewsletterCampaign | null
  activeSubscriberCount: number
  adminEmail: string
  initialData?: Partial<NewsletterCampaign>
}

export function CampaignStudio({
  mode,
  campaign,
  activeSubscriberCount,
  adminEmail,
  initialData,
}: CampaignStudioProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [isBroadcasting, setIsBroadcasting] = useState(false)

  // Core Form State
  const [title, setTitle] = useState(campaign?.title || initialData?.title || "")
  const [subject, setSubject] = useState(campaign?.subject || initialData?.subject || "")
  const [previewText, setPreviewText] = useState(
    campaign?.preview_text || initialData?.preview_text || ""
  )
  const [contentHtml, setContentHtml] = useState(
    campaign?.content_html ||
      initialData?.content_html ||
      NEWSLETTER_PRESETS[0].htmlContent
  )
  const [isPublic, setIsPublic] = useState(
    campaign ? campaign.is_public : initialData?.is_public ?? true
  )

  // Simulator Controls
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile" | "code">("desktop")
  const [previewRecipientName, setPreviewRecipientName] = useState("Sarah Jenkins")

  // Editorial View Mode (WYSIWYG visual default, or raw HTML code)
  const [editorMode, setEditorMode] = useState<"visual" | "code">("visual")
  const insertBlockFnRef = useRef<((html: string) => void) | null>(null)

  // Test Email State
  const [testEmailInput, setTestEmailInput] = useState(adminEmail || "")
  const [testEmailDialogOpen, setTestEmailDialogOpen] = useState(false)

  // Broadcast Confirmation Dialog State
  const [broadcastDialogOpen, setBroadcastDialogOpen] = useState(false)
  const [broadcastConfirmed, setBroadcastConfirmed] = useState(false)

  // Template Replacement Dialog
  const [pendingPreset, setPendingPreset] = useState<NewsletterTemplatePreset | null>(null)
  const [confirmPresetOpen, setConfirmPresetOpen] = useState(false)

  // Section Block Inserter State
  const [blockType, setBlockType] = useState<
    "hero_image" | "split_left" | "split_right" | "cta" | "quote" | "stats"
  >("hero_image")
  const [blockImageUrl, setBlockImageUrl] = useState("")
  const [blockHeadline, setBlockHeadline] = useState("")
  const [blockBody, setBlockBody] = useState("")
  const [blockButtonLabel, setBlockButtonLabel] = useState("Read More")
  const [blockButtonUrl, setBlockButtonUrl] = useState("https://deessafoundation.com")
  const [blockCaption, setBlockCaption] = useState("")
  const [blockQuote, setBlockQuote] = useState("")
  const [blockQuoteAuthor, setBlockQuoteAuthor] = useState("")
  const [blockStat1Value, setBlockStat1Value] = useState("100+")
  const [blockStat1Label, setBlockStat1Label] = useState("Children Supported")
  const [blockStat2Value, setBlockStat2Value] = useState("98%")
  const [blockStat2Label, setBlockStat2Label] = useState("Family Satisfaction")

  // Generate Email HTML for live simulation
  const simulatedHtml = useMemo(() => {
    return buildNewsletterEmailHtml({
      subscriberName: previewRecipientName,
      subject: subject || "Preview Subject Line",
      previewText: previewText || undefined,
      contentHtml: contentHtml || "<p>Start typing or select a template...</p>",
      unsubscribeUrl: "https://deessafoundation.com/unsubscribe?token=sample-preview-token",
      campaignId: campaign?.id,
      isTest: false,
    })
  }, [previewRecipientName, subject, previewText, contentHtml, campaign?.id])

  // Subject quality rating
  const subjectLength = subject.length
  const subjectScore = useMemo(() => {
    if (subjectLength === 0) return { label: "Empty", color: "text-muted-foreground" }
    if (subjectLength < 25) return { label: "Short (Good for quick reads)", color: "text-amber-600 dark:text-amber-400" }
    if (subjectLength <= 60) return { label: "Optimal (Fits all mobile inboxes)", color: "text-emerald-600 dark:text-emerald-400" }
    return { label: "Long (May truncate on phones)", color: "text-rose-600 dark:text-rose-400" }
  }, [subjectLength])

  // Insert Variable Token into Content
  const insertToken = (token: string) => {
    setContentHtml((prev) => prev + ` ${token} `)
    notifications.showSuccess(`Added token ${token}`)
  }

  // Insert Layout Block
  const handleInsertBlock = () => {
    let generatedBlock = ""
    if (blockType === "hero_image") {
      if (!blockImageUrl) {
        notifications.showError("Please upload or enter an image URL")
        return
      }
      generatedBlock = generateHeroImageHtml({
        imageUrl: blockImageUrl,
        caption: blockCaption || undefined,
        linkUrl: blockButtonUrl || undefined,
      })
    } else if (blockType === "split_left") {
      if (!blockImageUrl || !blockHeadline || !blockBody) {
        notifications.showError("Please provide an image, headline, and paragraph text")
        return
      }
      generatedBlock = generateImageLeftTextRightHtml({
        imageUrl: blockImageUrl,
        headline: blockHeadline,
        body: blockBody,
        buttonLabel: blockButtonLabel || undefined,
        buttonUrl: blockButtonUrl || undefined,
      })
    } else if (blockType === "split_right") {
      if (!blockImageUrl || !blockHeadline || !blockBody) {
        notifications.showError("Please provide an image, headline, and paragraph text")
        return
      }
      generatedBlock = generateTextLeftImageRightHtml({
        imageUrl: blockImageUrl,
        headline: blockHeadline,
        body: blockBody,
        buttonLabel: blockButtonLabel || undefined,
        buttonUrl: blockButtonUrl || undefined,
      })
    } else if (blockType === "cta") {
      if (!blockButtonLabel || !blockButtonUrl) {
        notifications.showError("Please provide button text and link URL")
        return
      }
      generatedBlock = generateCtaButtonHtml({
        label: blockButtonLabel,
        url: blockButtonUrl,
      })
    } else if (blockType === "quote") {
      if (!blockQuote) {
        notifications.showError("Please provide a quote statement")
        return
      }
      generatedBlock = generateQuoteBoxHtml({
        quote: blockQuote,
        author: blockQuoteAuthor || undefined,
      })
    } else if (blockType === "stats") {
      generatedBlock = generateStatsGridHtml({
        stat1Value: blockStat1Value,
        stat1Label: blockStat1Label,
        stat2Value: blockStat2Value,
        stat2Label: blockStat2Label,
      })
    }

    if (generatedBlock) {
      if (editorMode === "visual" && insertBlockFnRef.current) {
        insertBlockFnRef.current(generatedBlock)
      } else {
        setContentHtml((prev) => `${prev}\n\n${generatedBlock}`)
        notifications.showSuccess("Custom layout block inserted into campaign")
      }
    }
  }

  // Handle Preset Apply
  const handleSelectPreset = (preset: NewsletterTemplatePreset) => {
    if (contentHtml.trim().length > 50) {
      setPendingPreset(preset)
      setConfirmPresetOpen(true)
    } else {
      applyPresetDirectly(preset)
    }
  }

  const applyPresetDirectly = (preset: NewsletterTemplatePreset) => {
    setContentHtml(preset.htmlContent)
    if (!subject) setSubject(preset.defaultSubject)
    if (!previewText) setPreviewText(preset.defaultPreviewText)
    notifications.showSuccess(`Applied "${preset.name}" template`)
  }

  // Save Draft Action
  const handleSave = () => {
    if (!title.trim()) {
      notifications.showError("Please provide an internal campaign title")
      return
    }
    if (!subject.trim()) {
      notifications.showError("Please provide an email subject line")
      return
    }
    if (!contentHtml.trim()) {
      notifications.showError("Campaign content cannot be empty")
      return
    }

    startTransition(async () => {
      const res = await saveCampaignDraft({
        id: campaign?.id,
        title: title.trim(),
        subject: subject.trim(),
        previewText: previewText.trim() || null,
        contentHtml,
        isPublic,
      })

      if (res.success && res.campaign) {
        notifications.showSuccess(
          mode === "create" ? "Campaign draft created successfully!" : "Campaign changes saved"
        )
        if (mode === "create") {
          router.push(`/admin/newsletter/campaigns/${res.campaign.id}`)
        } else {
          router.refresh()
        }
      } else {
        notifications.showError(res.error || "Failed to save campaign")
      }
    })
  }

  // Send Internal Test Email
  const handleSendTestEmail = async () => {
    if (!testEmailInput || !testEmailInput.includes("@")) {
      notifications.showError("Please enter a valid test recipient email")
      return
    }
    if (!subject.trim()) {
      notifications.showError("Please provide a subject line before testing")
      return
    }

    setIsSendingTest(true)
    try {
      const res = await sendTestCampaignEmailAction({
        subject: subject.trim(),
        previewText: previewText.trim() || null,
        contentHtml,
        testEmail: testEmailInput.trim(),
      })

      if (res.success) {
        notifications.showSuccess(`Test preview dispatched to ${testEmailInput.trim()}`)
        setTestEmailDialogOpen(false)
      } else {
        notifications.showError(res.error || "Failed to dispatch test email")
      }
    } catch {
      notifications.showError("Unexpected error sending test email")
    } finally {
      setIsSendingTest(false)
    }
  }

  // Broadcast Live Campaign
  const handleBroadcast = async () => {
    if (!campaign?.id) {
      notifications.showError("Please save this campaign as a draft first before broadcasting.")
      return
    }
    if (activeSubscriberCount === 0) {
      notifications.showError("No active subscribers in directory to send to.")
      return
    }

    setIsBroadcasting(true)
    try {
      const res = await broadcastCampaignAction(campaign.id)
      if (res.success) {
        notifications.showSuccess(
          `Campaign broadcast dispatched to ${res.sentCount} active subscribers!`
        )
        setBroadcastDialogOpen(false)
        router.push("/admin/newsletter?tab=campaigns")
      } else {
        notifications.showError(res.error || "Failed to broadcast campaign")
      }
    } catch {
      notifications.showError("Unexpected error broadcasting campaign")
    } finally {
      setIsBroadcasting(false)
    }
  }

  const isSent = campaign?.status === "sent"
  const isSending = campaign?.status === "sending"

  return (
    <div className="flex flex-col min-h-screen bg-muted/10 pb-16">
      {/* ── 1. Top Navigation & Action Header ── */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-background/95 backdrop-blur-md border-b border-border/80 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/newsletter?tab=campaigns"
            className="inline-flex items-center justify-center size-9 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="Back to Campaigns"
          >
            <ArrowLeft className="size-4" />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-foreground truncate max-w-[200px] sm:max-w-md">
                {title.trim() ? title : "Untitled Campaign Draft"}
              </h1>
              {isSent ? (
                <Badge className="bg-green-50 text-green-700 border-green-200/90 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800/60 font-semibold text-[11px] px-2 py-0.5 gap-1.5 rounded-full shadow-2xs shadow-green-500/10 shrink-0">
                  <span className="flex size-3 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-2xs shadow-green-500/20">
                    <Check className="size-2 stroke-[3]" />
                  </span>
                  Broadcast Sent
                </Badge>
              ) : isSending ? (
                <Badge className="bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 text-xs shrink-0 gap-1">
                  <Loader2 className="size-3 animate-spin" />
                  Broadcasting...
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-700 dark:text-amber-400 bg-amber-50/60 dark:bg-amber-950/40 border-amber-200 text-xs shrink-0">
                  Draft Studio
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground truncate hidden sm:block">
              {campaign?.created_at
                ? `Created on ${new Date(campaign.created_at).toLocaleDateString()}`
                : "New Campaign Draft"}
              {" • "}Targeting {activeSubscriberCount.toLocaleString()} active subscribers
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTestEmailDialogOpen(true)}
            className="h-9 px-3 text-xs gap-1.5 font-medium"
          >
            <Send className="size-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Send Test</span>
          </Button>

          {!isSent && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isPending || isSending}
              className="h-9 px-3 text-xs gap-1.5 font-semibold"
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5 text-primary" />
              )}
              <span>{isPending ? "Saving..." : "Save Draft"}</span>
            </Button>
          )}

          {!isSent && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (!campaign?.id) {
                  handleSave()
                  notifications.showInfo("Please click Save Draft first to persist this campaign before broadcasting.")
                } else {
                  setBroadcastDialogOpen(true)
                }
              }}
              disabled={isPending || isSending}
              className="h-9 px-3.5 text-xs gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs active:scale-[0.98] transition-all"
            >
              <Send className="size-3.5" />
              <span>Broadcast Now</span>
            </Button>
          )}
        </div>
      </header>

      {/* ── 2. Studio Workspace (Two-Column Split) ── */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── LEFT PANE: Campaign Composer & Tools (7 cols) ── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Campaign Metadata & Subject Line */}
          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                <span>Campaign Metadata & Envelope</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Configure your subject, preview snippet, and public visibility.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="camp-title" className="text-xs font-semibold">
                  Campaign Internal Reference Name *
                </Label>
                <Input
                  id="camp-title"
                  placeholder="e.g. October 2026 Community Milestone & Story Digest"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSent || isSending}
                  className="h-9 text-xs"
                />
                <span className="text-[10px] text-muted-foreground">Only shown to admins in the dashboard list</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="camp-subject" className="text-xs font-semibold">
                    Email Subject Line *
                  </Label>
                  <span className={`text-[10px] font-medium ${subjectScore.color}`}>
                    {subjectLength} chars • {subjectScore.label}
                  </span>
                </div>
                <Input
                  id="camp-subject"
                  placeholder="e.g. ✨ Inspiring Breakthrough: How Aarav Found His Voice"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isSent || isSending}
                  className="h-9 text-xs"
                />
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-muted-foreground">Quick emoji:</span>
                  {["✨", "🌱", "🎟️", "❤️", "📢", "📅", "💡"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSubject((s) => s + emoji)}
                      disabled={isSent}
                      className="px-1.5 py-0.5 text-xs rounded hover:bg-muted border border-border/60 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="camp-preheader" className="text-xs font-semibold">
                  Inbox Preheader / Preview Snippet
                </Label>
                <Input
                  id="camp-preheader"
                  placeholder="e.g. Discover how our new sensory therapy space in Kathmandu is changing lives."
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  disabled={isSent || isSending}
                  className="h-9 text-xs"
                />
                <span className="text-[10px] text-muted-foreground">
                  The teaser sentence displayed directly next to the subject in Gmail and Apple Mail
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="space-y-0.5">
                  <Label htmlFor="camp-public-toggle" className="text-xs font-semibold cursor-pointer">
                    Publish to Public Newsletter Archive
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Makes this broadcast readable on <span className="font-mono">/newsletter-archive</span>
                  </p>
                </div>
                <Switch
                  id="camp-public-toggle"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  disabled={isSent || isSending}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Preset Template Chooser */}
          {!isSent && (
            <Card className="border-border/80 shadow-2xs">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                      <Sparkles className="size-4 text-amber-500" />
                      <span>Start from a Professional Template</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Select a pre-designed, email-safe newsletter preset to jumpstart your campaign.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {NEWSLETTER_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="text-left p-3 rounded-xl border border-border/70 bg-card hover:border-primary/50 hover:bg-muted/40 transition-all duration-150 group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                            {preset.name}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold shrink-0">
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-primary mt-2 flex items-center gap-1">
                        Use Template →
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card 3: Image & Layout Block Studio */}
          {!isSent && (
            <Card className="border-border/80 shadow-2xs">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <ImageIcon className="size-4 text-emerald-600" />
                  <span>Media & Layout Block Studio</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Upload images and insert email-safe split layouts (image left, image right, full banner, CTA buttons).
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-4">
                {/* Block Type Picker */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: "hero_image", label: "Full Banner", icon: ImageIcon },
                    { id: "split_left", label: "Image Left", icon: Columns2 },
                    { id: "split_right", label: "Image Right", icon: Columns2 },
                    { id: "cta", label: "CTA Button", icon: Send },
                    { id: "quote", label: "Quote Box", icon: Quote },
                    { id: "stats", label: "Stats Grid", icon: LayoutGrid },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBlockType(b.id as typeof blockType)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-semibold gap-1 transition-all ${
                        blockType === b.id
                          ? "border-primary bg-primary/10 text-primary shadow-2xs"
                          : "border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <b.icon className="size-4" />
                      <span>{b.label}</span>
                    </button>
                  ))}
                </div>

                {/* Dynamic Block Builder Inputs */}
                {(blockType === "hero_image" ||
                  blockType === "split_left" ||
                  blockType === "split_right") && (
                  <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold">Image Source</Label>
                      <FileUpload
                        bucket="story-images"
                        currentUrl={blockImageUrl}
                        onUpload={(url) => setBlockImageUrl(url)}
                        label="Upload Campaign Image (or paste URL below)"
                        maxSizeMB={5}
                      />
                      <Input
                        placeholder="https://images.unsplash.com/... (or paste external URL)"
                        value={blockImageUrl}
                        onChange={(e) => setBlockImageUrl(e.target.value)}
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    {blockType === "hero_image" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <Label className="text-[11px] font-semibold">Image Caption (Optional)</Label>
                          <Input
                            placeholder="e.g. Children engaged in painting workshop"
                            value={blockCaption}
                            onChange={(e) => setBlockCaption(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] font-semibold">Click Link (Optional)</Label>
                          <Input
                            placeholder="https://deessafoundation.com/..."
                            value={blockButtonUrl}
                            onChange={(e) => setBlockButtonUrl(e.target.value)}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5 pt-1">
                        <div className="space-y-1">
                          <Label className="text-[11px] font-semibold">Section Headline *</Label>
                          <Input
                            placeholder="e.g. Tactile Sensory Corner Launched in Pokhara"
                            value={blockHeadline}
                            onChange={(e) => setBlockHeadline(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px] font-semibold">Story / Section Body *</Label>
                          <Textarea
                            placeholder="Enter the section paragraph explaining the milestone or story..."
                            value={blockBody}
                            onChange={(e) => setBlockBody(e.target.value)}
                            rows={3}
                            className="text-xs leading-relaxed"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold">Button Label (Optional)</Label>
                            <Input
                              placeholder="e.g. Read Full Milestone"
                              value={blockButtonLabel}
                              onChange={(e) => setBlockButtonLabel(e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold">Button URL</Label>
                            <Input
                              placeholder="https://deessafoundation.com/..."
                              value={blockButtonUrl}
                              onChange={(e) => setBlockButtonUrl(e.target.value)}
                              className="h-8 text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      type="button"
                      size="sm"
                      onClick={handleInsertBlock}
                      className="w-full h-8 text-xs gap-1.5 font-semibold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                    >
                      <Plus className="size-3.5" />
                      <span>Insert This Section Block Into Campaign</span>
                    </Button>
                  </div>
                )}

                {blockType === "cta" && (
                  <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Button Label *</Label>
                        <Input
                          placeholder="e.g. Support Our Mission"
                          value={blockButtonLabel}
                          onChange={(e) => setBlockButtonLabel(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Target URL *</Label>
                        <Input
                          placeholder="https://deessafoundation.com/donate"
                          value={blockButtonUrl}
                          onChange={(e) => setBlockButtonUrl(e.target.value)}
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleInsertBlock}
                      className="w-full h-8 text-xs gap-1.5 font-semibold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                    >
                      <Plus className="size-3.5" />
                      <span>Insert Call-To-Action Button</span>
                    </Button>
                  </div>
                )}

                {blockType === "quote" && (
                  <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Quote Statement *</Label>
                      <Textarea
                        placeholder="&ldquo;The therapy sessions transformed how our family communicates...&rdquo;"
                        value={blockQuote}
                        onChange={(e) => setBlockQuote(e.target.value)}
                        rows={2}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Attribution / Author</Label>
                      <Input
                        placeholder="e.g. Maya Thapa, Mother of 6-year-old Kabir"
                        value={blockQuoteAuthor}
                        onChange={(e) => setBlockQuoteAuthor(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleInsertBlock}
                      className="w-full h-8 text-xs gap-1.5 font-semibold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                    >
                      <Plus className="size-3.5" />
                      <span>Insert Quote Box</span>
                    </Button>
                  </div>
                )}

                {blockType === "stats" && (
                  <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Stat 1 Value</Label>
                        <Input
                          value={blockStat1Value}
                          onChange={(e) => setBlockStat1Value(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Stat 1 Label</Label>
                        <Input
                          value={blockStat1Label}
                          onChange={(e) => setBlockStat1Label(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Stat 2 Value</Label>
                        <Input
                          value={blockStat2Value}
                          onChange={(e) => setBlockStat2Value(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Stat 2 Label</Label>
                        <Input
                          value={blockStat2Label}
                          onChange={(e) => setBlockStat2Label(e.target.value)}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleInsertBlock}
                      className="w-full h-8 text-xs gap-1.5 font-semibold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                    >
                      <Plus className="size-3.5" />
                      <span>Insert 2-Column Stats Grid</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Card 4: Editorial Body Editor */}
          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                    <PenSquare className="size-4 text-primary" />
                    <span>Editorial Content Studio</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Write visually with rich formatting tools, or toggle to HTML source view.
                  </CardDescription>
                </div>

                {/* Editor Mode Selector */}
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted border border-border/60 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditorMode("visual")}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      editorMode === "visual"
                        ? "bg-background text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <PenSquare className="size-3.5 text-primary" />
                    <span>Visual Editor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorMode("code")}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      editorMode === "code"
                        ? "bg-background text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Code className="size-3.5 text-muted-foreground" />
                    <span>HTML Code</span>
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5">
              {editorMode === "visual" ? (
                <NewsletterVisualEditor
                  content={contentHtml}
                  onChange={setContentHtml}
                  disabled={isSent || isSending}
                  onRegisterInsertBlock={(fn) => {
                    insertBlockFnRef.current = fn
                  }}
                />
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Direct HTML Code Editor</span>
                    {/* Variable Token Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-muted-foreground font-semibold">Tokens:</span>
                      {[
                        { token: "{{name}}", label: "Recipient Name" },
                        { token: "{{email}}", label: "Email" },
                        { token: "{{unsubscribe_url}}", label: "Unsubscribe URL" },
                      ].map((t) => (
                        <button
                          key={t.token}
                          type="button"
                          onClick={() => insertToken(t.token)}
                          disabled={isSent}
                          className="px-2 py-0.5 rounded-md bg-muted hover:bg-primary/10 text-foreground hover:text-primary font-mono text-[10px] border border-border/60 transition-colors"
                          title={t.label}
                        >
                          {t.token}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    id="camp-content"
                    value={contentHtml}
                    onChange={(e) => setContentHtml(e.target.value)}
                    disabled={isSent || isSending}
                    rows={18}
                    className="font-mono text-xs sm:text-sm leading-relaxed p-4 bg-background min-h-[350px]"
                    placeholder="Write your email body HTML here..."
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Tip: Code edits are bidirectional. When you switch back to Visual mode, your changes are parsed and rendered visually.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT PANE: Live Interactive Device Simulator (5 cols) ── */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20 self-start">
          <Card className="border-border/80 shadow-md overflow-hidden bg-card">
            {/* Simulator Toolbar */}
            <div className="p-3 bg-muted/40 border-b border-border/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant={deviceView === "desktop" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDeviceView("desktop")}
                  className="h-8 px-2.5 text-xs gap-1.5"
                >
                  <Monitor className="size-3.5" />
                  <span>Desktop (600px)</span>
                </Button>

                <Button
                  type="button"
                  variant={deviceView === "mobile" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDeviceView("mobile")}
                  className="h-8 px-2.5 text-xs gap-1.5"
                >
                  <Smartphone className="size-3.5" />
                  <span>Mobile (375px)</span>
                </Button>

                <Button
                  type="button"
                  variant={deviceView === "code" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDeviceView("code")}
                  className="h-8 px-2.5 text-xs gap-1.5"
                >
                  <Code className="size-3.5" />
                  <span>HTML</span>
                </Button>
              </div>

              <div className="flex items-center gap-1.5">
                <Select
                  value={previewRecipientName}
                  onValueChange={setPreviewRecipientName}
                >
                  <SelectTrigger className="h-7 text-[11px] px-2 w-[130px] border-border/60">
                    <SelectValue placeholder="Preview as" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sarah Jenkins">Sarah Jenkins</SelectItem>
                    <SelectItem value="Dr. Ram Shrestha">Dr. Ram Shrestha</SelectItem>
                    <SelectItem value="">(No Name / Fallback)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email Client Envelope Header */}
            <div className="px-4 py-3 border-b border-border/50 bg-background text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase w-12 shrink-0">Subject:</span>
                <span className="font-semibold text-foreground truncate">
                  {subject || "(No subject set)"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase w-12 shrink-0">From:</span>
                <span className="text-muted-foreground truncate">
                  deessa Foundation &lt;news@deessafoundation.com&gt;
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase w-12 shrink-0">To:</span>
                <span className="text-muted-foreground truncate">
                  {previewRecipientName || "Supporter"} &lt;subscriber@example.com&gt;
                </span>
              </div>
              {previewText && (
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase w-12 shrink-0">Snippet:</span>
                  <span className="text-[11px] text-muted-foreground/80 italic truncate">
                    {previewText}
                  </span>
                </div>
              )}
            </div>

            {/* Simulator Viewport Screen */}
            <div className="bg-slate-200 dark:bg-slate-900/80 p-3 sm:p-4 min-h-[520px] max-h-[680px] overflow-y-auto flex justify-center">
              {deviceView === "code" ? (
                <div className="w-full bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto select-all max-h-[640px]">
                  <pre>{simulatedHtml}</pre>
                </div>
              ) : (
                <div
                  className={`bg-white rounded-xl shadow-lg transition-all duration-200 overflow-hidden flex flex-col ${
                    deviceView === "mobile"
                      ? "w-[375px] max-w-full border-4 border-slate-700 rounded-3xl"
                      : "w-full max-w-[620px]"
                  }`}
                  style={{ minHeight: "560px" }}
                >
                  {deviceView === "mobile" && (
                    <div className="bg-slate-700 h-6 flex items-center justify-center shrink-0">
                      <div className="w-16 h-3 bg-slate-900 rounded-full" />
                    </div>
                  )}

                  <iframe
                    title="Live Newsletter Email Preview"
                    srcDoc={simulatedHtml}
                    className="w-full flex-1 border-0"
                    style={{ minHeight: "540px" }}
                    sandbox="allow-same-origin"
                  />
                </div>
              )}
            </div>

            {/* Pre-Flight Health Bar & Test Dispatcher Strip */}
            <div className="p-3 bg-muted/20 border-t border-border/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Estimated Audience:</span>
                <span className="font-bold text-foreground">
                  {activeSubscriberCount.toLocaleString()} active opt-ins
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Input
                  placeholder="test@example.com"
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSendTestEmail}
                  disabled={isSendingTest}
                  className="h-8 px-3 text-xs gap-1.5 shrink-0"
                >
                  {isSendingTest ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Send className="size-3" />
                  )}
                  <span>Send Test</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── 3. Test Email Dialog ── */}
      <Dialog open={testEmailDialogOpen} onOpenChange={setTestEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Send className="size-4 text-primary" />
              <span>Dispatch Test Campaign Email</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Send a rendered copy of this campaign directly to your inbox to check mobile display, dark mode rendering, and spam filters.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Test Recipient Email *</Label>
              <Input
                placeholder="your.email@example.com"
                value={testEmailInput}
                onChange={(e) => setTestEmailInput(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Test emails are prepended with an internal <strong className="text-foreground">[TEST BROADCAST]</strong> banner so team members know it is a draft preview.
            </p>
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setTestEmailDialogOpen(false)}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSendTestEmail}
              disabled={isSendingTest}
              className="h-9 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSendingTest ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                "Dispatch Test Email"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 4. Broadcast Confirmation Dialog ── */}
      <Dialog open={broadcastDialogOpen} onOpenChange={setBroadcastDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-primary">
              <ShieldCheck className="size-5 text-primary" />
              <span>Confirm Community Broadcast</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              You are about to broadcast this newsletter campaign to your entire active subscriber community.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Summary Box */}
            <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Subject:</span>
                <span className="font-bold text-foreground text-right">{subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Active Opt-In Recipients:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {activeSubscriberCount.toLocaleString()} subscribers
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Delivery Engine:</span>
                <span className="font-medium text-foreground">Chunked Throttling (15 msgs/batch)</span>
              </div>
            </div>

            {/* Safety Warning */}
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertCircle className="size-3.5 text-amber-600 shrink-0" />
                <span>Live broadcasts cannot be reversed</span>
              </p>
              <p className="text-[11px] leading-relaxed">
                Once confirmed, the dispatcher will send individual personalized emails containing unique 1-click unsubscribe links to every active subscriber.
              </p>
            </div>

            {/* Checkbox confirmation */}
            <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={broadcastConfirmed}
                onChange={(e) => setBroadcastConfirmed(e.target.checked)}
                className="mt-0.5 size-4 rounded border-border"
              />
              <span className="text-xs text-foreground font-medium leading-relaxed">
                I have reviewed the email preview and subject line, and I confirm sending this broadcast to all {activeSubscriberCount.toLocaleString()} members.
              </span>
            </label>
          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setBroadcastDialogOpen(false)}
              disabled={isBroadcasting}
              className="h-10 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleBroadcast}
              disabled={!broadcastConfirmed || isBroadcasting}
              className="h-10 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isBroadcasting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Broadcasting...
                </>
              ) : (
                `Confirm & Send to ${activeSubscriberCount.toLocaleString()} Members`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 5. Preset Replacement Confirmation Dialog ── */}
      <Dialog open={confirmPresetOpen} onOpenChange={setConfirmPresetOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Replace Current Content?</DialogTitle>
            <DialogDescription className="text-xs">
              Applying the &quot;{pendingPreset?.name}&quot; template will replace your current email body.
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Any custom paragraphs or images already entered in the editor will be overwritten with the new template layout.
          </p>
          <DialogFooter className="flex flex-row items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmPresetOpen(false)}
              className="h-9 text-xs"
            >
              Keep Current Content
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (pendingPreset) applyPresetDirectly(pendingPreset)
                setConfirmPresetOpen(false)
              }}
              className="h-9 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Replace with Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
