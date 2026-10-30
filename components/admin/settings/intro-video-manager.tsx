"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Video,
  Laptop,
  Smartphone,
  Sparkles,
  Sliders,
  Loader2,
  CheckCircle2,
  Eye,
  RefreshCw,
} from "lucide-react"
import { FileUpload } from "@/components/admin/media/file-upload"
import { notifications } from "@/lib/notifications"
import { updateIntroVideoConfig } from "@/lib/actions/intro-video"
import {
  DEFAULT_INTRO_VIDEO_CONFIG,
  type IntroVideoConfig,
  type IntroVideoFrequency,
} from "@/lib/types/intro-video"

interface IntroVideoManagerProps {
  initialConfig?: IntroVideoConfig
}

export function IntroVideoManager({ initialConfig }: IntroVideoManagerProps) {
  const router = useRouter()
  const [config, setConfig] = useState<IntroVideoConfig>(
    initialConfig || DEFAULT_INTRO_VIDEO_CONFIG
  )
  const [isSaving, setIsSaving] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop")

  const handleSave = async () => {
    setIsSaving(true)
    const result = await updateIntroVideoConfig(config)
    setIsSaving(false)

    if (result.error) {
      notifications.showError({
        title: "Failed to update intro video",
        description: result.error,
      })
      return
    }

    notifications.showSuccess({
      title: "Intro Video settings saved",
      description: "Changes are now live on the public website.",
    })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* 1. Master Control Card */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600">
                <Video className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">Intro Video System</CardTitle>
                  <Badge variant={config.enabled ? "default" : "secondary"}>
                    {config.enabled ? "Live / Active" : "Disabled"}
                  </Badge>
                </div>
                <CardDescription className="text-sm mt-0.5">
                  Configure pre-paint intro video playback, desktop & mobile streams, and flying logo transitions.
                </CardDescription>
              </div>
            </div>

            {/* Quick Preview Simulator Dialog */}
            <div className="flex items-center gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    <span>Preview Simulator</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-6">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      Live Device Preview Simulator
                    </DialogTitle>
                    <DialogDescription>
                      Test how your video and poster framing scale across laptop and smartphone screens.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex items-center justify-center gap-3 py-2 border-b">
                    <Button
                      size="sm"
                      variant={previewDevice === "desktop" ? "default" : "outline"}
                      onClick={() => setPreviewDevice("desktop")}
                      className="gap-2"
                    >
                      <Laptop className="h-4 w-4" />
                      Laptop (16:9 Landscape)
                    </Button>
                    <Button
                      size="sm"
                      variant={previewDevice === "mobile" ? "default" : "outline"}
                      onClick={() => setPreviewDevice("mobile")}
                      className="gap-2"
                    >
                      <Smartphone className="h-4 w-4" />
                      Smartphone (9:16 Portrait)
                    </Button>
                  </div>

                  <div className="flex items-center justify-center p-4 bg-slate-950 rounded-xl min-h-[420px]">
                    {previewDevice === "desktop" ? (
                      <div className="w-full max-w-2xl aspect-video bg-black rounded-lg overflow-hidden border border-slate-800 relative shadow-2xl">
                        {config.media.desktopVideoUrl ? (
                          <video
                            src={config.media.desktopVideoUrl}
                            poster={config.media.desktopPosterUrl}
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2 text-sm">
                            <Laptop className="h-8 w-8" />
                            No desktop video configured
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-[280px] h-[500px] bg-black rounded-3xl overflow-hidden border-4 border-slate-700 relative shadow-2xl">
                        {config.media.mobileVideoUrl ||
                        (config.media.useDesktopFallbackOnMobile && config.media.desktopVideoUrl) ? (
                          <video
                            src={
                              config.media.mobileVideoUrl ||
                              config.media.desktopVideoUrl
                            }
                            poster={
                              config.media.mobilePosterUrl ||
                              config.media.desktopPosterUrl
                            }
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2 text-sm text-center px-4">
                            <Smartphone className="h-8 w-8" />
                            No mobile video configured
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                <span>Save Changes</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="flex items-start justify-between gap-4 rounded-xl border p-4 bg-muted/10">
            <div>
              <Label htmlFor="intro-enabled" className="text-base font-semibold">
                Enable Intro Video
              </Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                When enabled, visitors are greeted with the brand intro video before the website paints. When disabled, the gate script is completely removed and the site loads instantly.
              </p>
            </div>
            <Switch
              id="intro-enabled"
              checked={config.enabled}
              onCheckedChange={(checked) =>
                setConfig((prev) => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          <div className="flex items-start justify-between gap-4 rounded-xl border p-4 bg-muted/10">
            <div>
              <Label htmlFor="intro-hp-only" className="text-base font-semibold">
                Show Only on Homepage
              </Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                If enabled, visitors landing directly on secondary routes (like /events, /donate, or /podcasts) bypass the intro video immediately.
              </p>
            </div>
            <Switch
              id="intro-hp-only"
              checked={config.behavior.homepageOnly}
              onCheckedChange={(checked) =>
                setConfig((prev) => ({
                  ...prev,
                  behavior: { ...prev.behavior, homepageOnly: checked },
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Dual-Stream Media Sources: Laptop vs. Mobile */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Desktop / Laptop Video Stream */}
        <Card className="border-2 shadow-sm">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                <Laptop className="h-5 w-5" />
              </div>
              Desktop / Laptop Video (16:9)
            </CardTitle>
            <CardDescription>
              Widescreen video served to desktop monitors, laptops, and large tablets (≥ 768px).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label>Video File or Direct URL</Label>
              <FileUpload
                bucket="intro-videos"
                accept="video/mp4,video/webm"
                currentUrl={config.media.desktopVideoUrl}
                label="Upload 16:9 Video"
                maxSizeMB={150}
                onUpload={(url) =>
                  setConfig((prev) => ({
                    ...prev,
                    media: { ...prev.media, desktopVideoUrl: url },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Desktop Poster Thumbnail (Optional)</Label>
              <FileUpload
                bucket="intro-videos"
                accept="image/*"
                currentUrl={config.media.desktopPosterUrl}
                label="Upload Poster Image"
                maxSizeMB={5}
                onUpload={(url) =>
                  setConfig((prev) => ({
                    ...prev,
                    media: { ...prev.media, desktopPosterUrl: url },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Mobile Smartphone Video Stream */}
        <Card className="border-2 shadow-sm">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                <Smartphone className="h-5 w-5" />
              </div>
              Mobile Vertical Video (9:16)
            </CardTitle>
            <CardDescription>
              Vertical portrait video optimized for smartphones (&lt; 768px) with zero lateral cropping.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label>Mobile Video File or Direct URL</Label>
              <FileUpload
                bucket="intro-videos"
                accept="video/mp4,video/webm"
                currentUrl={config.media.mobileVideoUrl}
                label="Upload 9:16 Video"
                maxSizeMB={100}
                onUpload={(url) =>
                  setConfig((prev) => ({
                    ...prev,
                    media: { ...prev.media, mobileVideoUrl: url },
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Mobile Poster Thumbnail (Optional)</Label>
              <FileUpload
                bucket="intro-videos"
                accept="image/*"
                currentUrl={config.media.mobilePosterUrl}
                label="Upload Mobile Poster"
                maxSizeMB={5}
                onUpload={(url) =>
                  setConfig((prev) => ({
                    ...prev,
                    media: { ...prev.media, mobilePosterUrl: url },
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/10">
              <div className="space-y-0.5">
                <Label htmlFor="mobile-fallback" className="text-sm font-medium">
                  Desktop Fallback for Mobile
                </Label>
                <p className="text-xs text-muted-foreground">
                  If no vertical mobile video is uploaded, play the desktop video on phones.
                </p>
              </div>
              <Switch
                id="mobile-fallback"
                checked={config.media.useDesktopFallbackOnMobile}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({
                    ...prev,
                    media: {
                      ...prev.media,
                      useDesktopFallbackOnMobile: checked,
                    },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Outro & Signature Flying Logo Effect */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
              <Sparkles className="h-5 w-5" />
            </div>
            Flying Logo Outro Transition
          </CardTitle>
          <CardDescription>
            Signature visual handoff: as the video completes, the centered logo smoothly glides and docks into the navbar logo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-start justify-between gap-4 rounded-xl border p-4 bg-muted/10">
            <div>
              <Label htmlFor="flying-logo-switch" className="text-base font-semibold">
                Enable Flying Logo Outro
              </Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                If disabled, the video transitions into the site with a clean accessible crossfade instead of the flying motion.
              </p>
            </div>
            <Switch
              id="flying-logo-switch"
              checked={config.transition.enableLogoFlyTransition}
              onCheckedChange={(checked) =>
                setConfig((prev) => ({
                  ...prev,
                  transition: {
                    ...prev.transition,
                    enableLogoFlyTransition: checked,
                  },
                }))
              }
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Outro Logo Image (Optional)</Label>
              <FileUpload
                bucket="intro-videos"
                accept="image/*"
                currentUrl={config.transition.logoUrl}
                label="Custom Outro Logo"
                maxSizeMB={5}
                onUpload={(url) =>
                  setConfig((prev) => ({
                    ...prev,
                    transition: { ...prev.transition, logoUrl: url },
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Defaults to /logo.png if left unset. Should ideally match the header logo graphic.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fade-duration">Overlay Fade Duration (ms)</Label>
              <Input
                id="fade-duration"
                type="number"
                min={300}
                max={3000}
                step={100}
                value={config.transition.fadeDurationMs}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    transition: {
                      ...prev.transition,
                      fadeDurationMs: parseInt(e.target.value, 10) || 1000,
                    },
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Time taken for the black background overlay to smoothly reveal the website. Default: 1000ms.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Playback Rules, Frequency & Accessibility Controls */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600">
              <Sliders className="h-5 w-5" />
            </div>
            Display Rules & Playback Frequency
          </CardTitle>
          <CardDescription>
            Control how often visitors encounter the intro video and how controls are presented.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Frequency Rule</Label>
              <Select
                value={config.behavior.frequency}
                onValueChange={(val: IntroVideoFrequency) =>
                  setConfig((prev) => ({
                    ...prev,
                    behavior: { ...prev.behavior, frequency: val },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cooldown">Cooldown Interval (Recommended)</SelectItem>
                  <SelectItem value="session">Once per Browser Session</SelectItem>
                  <SelectItem value="every_visit">Every Visit / Page Load (Testing)</SelectItem>
                  <SelectItem value="once_ever">Once Ever (Until Storage Cleared)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.behavior.frequency === "cooldown" && (
              <div className="space-y-2">
                <Label htmlFor="cooldown-minutes">Cooldown Duration (Minutes)</Label>
                <Input
                  id="cooldown-minutes"
                  type="number"
                  min={1}
                  max={10080}
                  value={config.behavior.cooldownMinutes}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      behavior: {
                        ...prev.behavior,
                        cooldownMinutes: parseInt(e.target.value, 10) || 30,
                      },
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Time required before the intro video is shown again to the same visitor. Default: 30 minutes.
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/10">
              <div className="space-y-0.5">
                <Label htmlFor="allow-skip" className="text-sm font-semibold">
                  Allow Skip Button
                </Label>
                <p className="text-xs text-muted-foreground">
                  Displays an accessible skip button with keyboard Escape support.
                </p>
              </div>
              <Switch
                id="allow-skip"
                checked={config.behavior.allowSkip}
                onCheckedChange={(checked) =>
                  setConfig((prev) => ({
                    ...prev,
                    behavior: { ...prev.behavior, allowSkip: checked },
                  }))
                }
              />
            </div>

            {config.behavior.allowSkip && (
              <div className="space-y-2">
                <Label htmlFor="skip-delay">Skip Button Delay (Seconds)</Label>
                <Input
                  id="skip-delay"
                  type="number"
                  min={0}
                  max={15}
                  value={config.behavior.skipDelaySeconds}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      behavior: {
                        ...prev.behavior,
                        skipDelaySeconds: parseInt(e.target.value, 10) || 0,
                      },
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  0 seconds = button is visible immediately.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfig(DEFAULT_INTRO_VIDEO_CONFIG)}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset to Defaults
            </Button>

            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
