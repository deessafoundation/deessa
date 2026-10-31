"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Accessibility,
  Volume2,
  Type,
  Eye,
  Wrench,
  Sliders,
  Palette,
  Pause,
  BookOpen,
  MousePointer2,
  Move,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react"
import { notifications } from "@/lib/notifications"
import { updateAccessibilityConfig } from "@/lib/actions/accessibility-settings"
import {
  DEFAULT_ACCESSIBILITY_CONFIG,
  type AccessibilityConfig,
  type AccessibilityFeaturesConfig,
} from "@/lib/types/accessibility-settings"

interface AccessibilitySettingsManagerProps {
  initialConfig?: AccessibilityConfig
}

export function AccessibilitySettingsManager({
  initialConfig,
}: AccessibilitySettingsManagerProps) {
  const router = useRouter()
  const [config, setConfig] = useState<AccessibilityConfig>(
    initialConfig || DEFAULT_ACCESSIBILITY_CONFIG
  )
  const [isSaving, setIsSaving] = useState(false)

  const toggleFeature = (key: keyof AccessibilityFeaturesConfig, val: boolean) => {
    setConfig((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [key]: val,
      },
    }))
  }

  const activeFeatureCount = Object.values(config.features).filter(Boolean).length
  const totalFeatureCount = Object.keys(config.features).length

  const handleSave = async () => {
    setIsSaving(true)
    const result = await updateAccessibilityConfig(config)
    setIsSaving(false)

    if (result.error) {
      notifications.showError({
        title: "Failed to update accessibility settings",
        description: result.error,
      })
      return
    }

    notifications.showSuccess({
      title: "Accessibility settings saved",
      description: "Changes are now live across all public pages.",
    })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* 1. Master Toggle Card */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Accessibility className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">Accessibility System</CardTitle>
                  <Badge variant={config.enabled ? "default" : "secondary"}>
                    {config.enabled ? "Active on Site" : "Widget Hidden"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {activeFeatureCount} of {totalFeatureCount} Tools Active
                  </Badge>
                </div>
                <CardDescription className="text-sm mt-0.5">
                  Control the visibility of the floating accessibility widget button and enable/disable specific assistive tools.
                </CardDescription>
              </div>
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="gap-2 shrink-0">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>Save Changes</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="flex items-start justify-between gap-4 rounded-xl border p-4 bg-muted/10">
            <div>
              <Label htmlFor="master-a11y-switch" className="text-base font-semibold">
                Show Floating Accessibility Button
              </Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                When enabled, visitors see the floating ♿ button on all public pages to customize their reading experience. When disabled, the button, panel, and reading aids are completely hidden.
              </p>
            </div>
            <Switch
              id="master-a11y-switch"
              checked={config.enabled}
              onCheckedChange={(checked) =>
                setConfig((prev) => ({ ...prev, enabled: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Granular Features by Category */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Category: Audio & Speech */}
        <Card className="border-2 shadow-sm">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                <Volume2 className="h-5 w-5" />
              </div>
              Audio & Speech (TTS)
            </CardTitle>
            <CardDescription>
              Screen reader and text-to-speech tools for audio narration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-start justify-between gap-4 rounded-lg border p-3.5 bg-muted/5">
              <div className="space-y-0.5">
                <Label htmlFor="feat-tts" className="font-semibold text-sm">
                  Listen to this page (TTS)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Interactive audio narration player with playback controls, speed slider, and English/Nepali translation.
                </p>
              </div>
              <Switch
                id="feat-tts"
                checked={config.features.textToSpeech}
                onCheckedChange={(val) => toggleFeature("textToSpeech", val)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Category: Visuals & Contrast */}
        <Card className="border-2 shadow-sm">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
                <Eye className="h-5 w-5" />
              </div>
              Visuals, Contrast & Sensory
            </CardTitle>
            <CardDescription>
              Color themes, contrast modes, and neurodivergent-friendly visual settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-start justify-between gap-4 rounded-lg border p-3.5 bg-muted/5">
              <div className="space-y-0.5">
                <Label htmlFor="feat-contrast" className="font-semibold text-sm">
                  Contrast Modes
                </Label>
                <p className="text-xs text-muted-foreground">
                  Normal, High Contrast (enhanced black/white borders), and Inverted Contrast dark modes.
                </p>
              </div>
              <Switch
                id="feat-contrast"
                checked={config.features.contrastMode}
                onCheckedChange={(val) => toggleFeature("contrastMode", val)}
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-lg border p-3.5 bg-muted/5">
              <div className="space-y-0.5">
                <Label htmlFor="feat-sensory" className="font-semibold text-sm flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                  Sensory-Friendly Mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  Mutes bright saturation and removes overwhelming animations for neurodivergent visitors.
                </p>
              </div>
              <Switch
                id="feat-sensory"
                checked={config.features.sensoryFriendly}
                onCheckedChange={(val) => toggleFeature("sensoryFriendly", val)}
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-lg border p-3.5 bg-muted/5">
              <div className="space-y-0.5">
                <Label htmlFor="feat-motion" className="font-semibold text-sm flex items-center gap-1.5">
                  <Pause className="h-3.5 w-3.5 text-muted-foreground" />
                  Reduce Motion
                </Label>
                <p className="text-xs text-muted-foreground">
                  Disables UI animations, decorative transitions, and flying logo sequences.
                </p>
              </div>
              <Switch
                id="feat-motion"
                checked={config.features.reduceMotion}
                onCheckedChange={(val) => toggleFeature("reduceMotion", val)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Category: Typography & Sizing */}
        <Card className="border-2 shadow-sm">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600">
                <Type className="h-5 w-5" />
              </div>
              Typography & Text Sizing
            </CardTitle>
            <CardDescription>
              Font families, scaling, and spacing controls for readability.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-start justify-between gap-4 rounded-lg border p-3.5 bg-muted/5">
              <div className="space-y-0.5">
                <Label htmlFor="feat-font" className="font-semibold text-sm">
                  Font Style Switcher
                </Label>
                <p className="text-xs text-muted-foreground">
                  Allows visitors to switch between Dyslexia-friendly (OpenDyslexic), Friendly (Comic Neue), or Clean Sans-serif fonts.
                </p>
              </div>
              <Switch
                id="feat-font"
                checked={config.features.fontStyle}
                onCheckedChange={(val) => toggleFeature("fontStyle", val)}
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-lg border p-3.5 bg-muted/5">
              <div className="space-y-0.5">
                <Label htmlFor="feat-scaling" className="font-semibold text-sm">
                  Text Size Slider
                </Label>
                <p className="text-xs text-muted-foreground">
                  Interactive slider to adjust text scaling from 100% to 200% with immediate preview.
                </p>
              </div>
              <Switch
                id="feat-scaling"
                checked={config.features.textScaling}
                onCheckedChange={(val) => toggleFeature("textScaling", val)}
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-lg border p-3.5 bg-muted/5">
              <div className="space-y-0.5">
                <Label htmlFor="feat-spacing" className="font-semibold text-sm">
                  Spacing Controls
                </Label>
                <p className="text-xs text-muted-foreground">
                  Line height and character space sliders to optimize reading comfort.
                </p>
              </div>
              <Switch
                id="feat-spacing"
                checked={config.features.spacingControls}
                onCheckedChange={(val) => toggleFeature("spacingControls", val)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Category: Assistive Reading Tools */}
        <Card className="border-2 shadow-sm">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                <Wrench className="h-5 w-5" />
              </div>
              Assistive Reading Tools
            </CardTitle>
            <CardDescription>
              Interactive overlays and focus aids for reading comprehension.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-start justify-between gap-4 rounded-lg border p-3.5 bg-muted/5">
              <div className="space-y-0.5">
                <Label htmlFor="feat-reading-guide" className="font-semibold text-sm flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
                  Read Line & Reading Mask
                </Label>
                <p className="text-xs text-muted-foreground">
                  Highlighted reading guide ruler with customizable animal buddy stickers, and dimmed focus mask.
                </p>
              </div>
              <Switch
                id="feat-reading-guide"
                checked={config.features.readingGuide}
                onCheckedChange={(val) => toggleFeature("readingGuide", val)}
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-lg border p-3.5 bg-muted/5">
              <div className="space-y-0.5">
                <Label htmlFor="feat-dictionary" className="font-semibold text-sm flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                  Reading Dictionary
                </Label>
                <p className="text-xs text-muted-foreground">
                  Interactive dictionary popup for looking up word definitions on selection or hover.
                </p>
              </div>
              <Switch
                id="feat-dictionary"
                checked={config.features.readingDictionary}
                onCheckedChange={(val) => toggleFeature("readingDictionary", val)}
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-lg border p-3.5 bg-muted/5">
              <div className="space-y-0.5">
                <Label htmlFor="feat-big-cursor" className="font-semibold text-sm flex items-center gap-1.5">
                  <MousePointer2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Large Cursor
                </Label>
                <p className="text-xs text-muted-foreground">
                  Enlarges the mouse cursor for visitors with visual or motor impairments.
                </p>
              </div>
              <Switch
                id="feat-big-cursor"
                checked={config.features.bigCursor}
                onCheckedChange={(val) => toggleFeature("bigCursor", val)}
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-lg border p-3.5 bg-muted/5">
              <div className="space-y-0.5">
                <Label htmlFor="feat-position" className="font-semibold text-sm flex items-center gap-1.5">
                  <Move className="h-3.5 w-3.5 text-muted-foreground" />
                  Button Placement Control
                </Label>
                <p className="text-xs text-muted-foreground">
                  Allows visitors to choose which screen corner the ♿ button docks to.
                </p>
              </div>
              <Switch
                id="feat-position"
                checked={config.features.widgetPosition}
                onCheckedChange={(val) => toggleFeature("widgetPosition", val)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => setConfig(DEFAULT_ACCESSIBILITY_CONFIG)}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset All Tools to Defaults
        </Button>

        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Save Accessibility Configuration
        </Button>
      </div>
    </div>
  )
}
