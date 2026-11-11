"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Sliders,
  BookOpen,
  Megaphone,
  Tag,
  Bug,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { notifications } from "@/lib/notifications"
import { updateSiteSetting } from "@/lib/actions/admin-settings"
import { SITE_UI_FLAGS_KEY, type SiteUiFlags } from "@/lib/site-status/types"

interface FeaturesSectionProps {
  initialFlags?: Partial<SiteUiFlags>
  initialSupportEnabled?: boolean
}

interface FeatureToggleConfig {
  id: string
  title: string
  description: string
  icon: React.ElementType
  category: "visibility" | "ux" | "system"
  activeLabel: string
  inactiveLabel: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  warning?: string
}

export function FeaturesSection({ initialFlags, initialSupportEnabled = true }: FeaturesSectionProps) {
  const router = useRouter()

  const [flags, setFlags] = useState<SiteUiFlags>({
    devNotice: initialFlags?.devNotice ?? true,
    betaBadge: initialFlags?.betaBadge ?? true,
    storiesEnabled: initialFlags?.storiesEnabled ?? true,
  })
  const [supportEnabled, setSupportEnabled] = useState<boolean>(initialSupportEnabled)
  const [loadingKey, setLoadingKey] = useState<string | null>(null)

  const handleToggleFlag = async (key: keyof SiteUiFlags, newValue: boolean) => {
    const previous = { ...flags }
    const updated = { ...flags, [key]: newValue }
    setFlags(updated)
    setLoadingKey(key)

    const result = await updateSiteSetting(SITE_UI_FLAGS_KEY, updated)
    setLoadingKey(null)

    if (result?.error) {
      setFlags(previous)
      notifications.showError({
        title: "Update Failed",
        description: result.error,
      })
      return
    }

    notifications.showSuccess({
      title: "Flag Updated",
      description: `${key} has been ${newValue ? "enabled" : "disabled"}. Changes are live across the site.`,
    })
    router.refresh()
  }

  const handleToggleSupport = async (newValue: boolean) => {
    const previous = supportEnabled
    setSupportEnabled(newValue)
    setLoadingKey("support_enabled")

    const result = await updateSiteSetting("support_enabled", newValue as unknown as Record<string, unknown>)
    setLoadingKey(null)

    if (result?.error) {
      setSupportEnabled(previous)
      notifications.showError({
        title: "Update Failed",
        description: result.error,
      })
      return
    }

    notifications.showSuccess({
      title: "Support Desk Updated",
      description: `Public support and bug submission portal is now ${newValue ? "online" : "offline"}.`,
    })
    router.refresh()
  }

  const features: FeatureToggleConfig[] = [
    {
      id: "storiesEnabled",
      title: "Public Stories & Impact Center",
      description:
        "Controls public visibility of the /stories hub, impact report articles, and navbar links. When disabled, visitors are redirected to 404.",
      icon: BookOpen,
      category: "visibility",
      activeLabel: "Publicly visible at /stories",
      inactiveLabel: "Hidden from navigation and 404 on direct access",
    },
    {
      id: "support_enabled",
      title: "Public Support & Bug Reporting Portal",
      description:
        "Controls access to the /support public ticket desk and suggestion forms. Turn off if undergoing ticket backlog maintenance.",
      icon: Bug,
      category: "system",
      activeLabel: "Open for visitor submissions",
      inactiveLabel: "Disabled (displays friendly under-maintenance notice)",
    },
    {
      id: "devNotice",
      title: "Homepage Development Notice Modal",
      description:
        'Displays the "We\'re actively building" dialog with issue reporting shortcuts when visitors land on the homepage.',
      icon: Megaphone,
      category: "ux",
      activeLabel: "Modal dialog shown on homepage landing",
      inactiveLabel: "Silent landing — modal suppressed",
    },
    {
      id: "betaBadge",
      title: "Navbar Beta Status Indicator",
      description:
        'Renders the amber "Beta" status tag beside the foundation logo across desktop, mobile headers, and navigation drawers.',
      icon: Tag,
      category: "ux",
      activeLabel: 'Pill badge "Beta" visible in header',
      inactiveLabel: "Hidden — clean brand header",
    },
  ]

  const activeCount =
    (flags.storiesEnabled ? 1 : 0) +
    (supportEnabled ? 1 : 0) +
    (flags.devNotice ? 1 : 0) +
    (flags.betaBadge ? 1 : 0)

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <Card className="border border-border/80 bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
                <Sliders className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Feature Flags & Live Controls</h3>
                <p className="text-sm text-muted-foreground">
                  Toggle site-wide experimental features, public sections, and visitor notices with zero deployment delays.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Badge variant="outline" className="px-3 py-1 font-semibold bg-background/60">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                {activeCount} of {features.length} Features Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Cards Grid */}
      <div className="grid gap-4">
        {features.map((feature) => {
          const Icon = feature.icon
          const isEnabled =
            feature.id === "support_enabled" ? supportEnabled : flags[feature.id as keyof SiteUiFlags]
          const isLoading = loadingKey === feature.id

          return (
            <Card
              key={feature.id}
              className={`transition-all duration-200 border-2 ${
                isEnabled ? "border-primary/20 bg-card shadow-sm" : "border-border/60 bg-muted/20 opacity-90"
              }`}
            >
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 mt-0.5 transition-colors ${
                        isEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-semibold text-foreground text-base">{feature.title}</span>
                        <Badge
                          variant={isEnabled ? "default" : "secondary"}
                          className={`text-[11px] font-medium px-2 py-0.5 ${
                            isEnabled
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isEnabled ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                        {feature.description}
                      </p>
                      <p className="text-xs font-medium text-foreground/80 pt-1">
                        Status:{" "}
                        <span className={isEnabled ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
                          {isEnabled ? feature.activeLabel : feature.inactiveLabel}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center pl-12 sm:pl-0">
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    <Switch
                      checked={isEnabled}
                      disabled={isLoading}
                      onCheckedChange={(checked) => {
                        if (feature.id === "support_enabled") {
                          handleToggleSupport(checked)
                        } else {
                          handleToggleFlag(feature.id as keyof SiteUiFlags, checked)
                        }
                      }}
                      aria-label={`Toggle ${feature.title}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
        <span>
          Toggle actions apply instantaneously to public visitors and revalidate edge caches across all edge regions.
        </span>
      </div>
    </div>
  )
}
