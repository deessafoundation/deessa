"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, Megaphone, Tag } from "lucide-react"
import { notifications } from "@/lib/notifications"
import { updateSiteSetting } from "@/lib/actions/admin-settings"
import { SITE_UI_FLAGS_KEY, type SiteUiFlags } from "@/lib/site-status/types"

interface SiteStatusCardProps {
  /** Current values, loaded server-side from `site_settings.site_ui_flags`. */
  initialFlags?: Partial<SiteUiFlags>
}

/**
 * Admin → Site Settings → Site tab.
 * Toggles the homepage development notice popup and the navbar Beta badge.
 * Replaces the build-time `NEXT_PUBLIC_SITE_STATUS` env var.
 */
export function SiteStatusCard({ initialFlags }: SiteStatusCardProps) {
  const router = useRouter()
  const [flags, setFlags] = useState<SiteUiFlags>({
    devNotice: initialFlags?.devNotice ?? true,
    betaBadge: initialFlags?.betaBadge ?? true,
  })
  const [saving, setSaving] = useState<keyof SiteUiFlags | null>(null)

  const saveFlag = async (key: keyof SiteUiFlags, value: boolean) => {
    const previous = flags
    const next = { ...flags, [key]: value }
    setFlags(next)
    setSaving(key)

    const result = await updateSiteSetting(SITE_UI_FLAGS_KEY, {
      devNotice: next.devNotice,
      betaBadge: next.betaBadge,
    })

    setSaving(null)

    if (result?.error) {
      setFlags(previous)
      notifications.showError({
        title: "Update failed",
        description: result.error,
      })
      return
    }

    notifications.showSuccess({
      title: "Saved",
      description:
        key === "devNotice"
          ? `Development notice popup ${value ? "enabled" : "disabled"}.`
          : `Navbar Beta badge ${value ? "enabled" : "disabled"}.`,
    })
    router.refresh()
  }

  const rows: Array<{
    key: keyof SiteUiFlags
    icon: React.ReactNode
    label: string
    description: string
    enabledText: string
    disabledText: string
  }> = [
    {
      key: "devNotice",
      icon: <Megaphone className="h-5 w-5" aria-hidden="true" />,
      label: "Development notice popup",
      description: 'The "We\'re still building" dialog with Report an Issue / Continue Browsing on the homepage',
      enabledText: "Shown to visitors on the homepage",
      disabledText: "Hidden — visitors land straight on the homepage",
    },
    {
      key: "betaBadge",
      icon: <Tag className="h-5 w-5" aria-hidden="true" />,
      label: "Beta badge in navbar",
      description: 'The amber "Beta" pill in the header (desktop, mobile and menu drawer)',
      enabledText: "Visible in the navbar",
      disabledText: "Removed from the navbar",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" aria-hidden="true" />
          Site Status Indicators
        </CardTitle>
        <CardDescription>
          Show or hide the development notice popup and the Beta badge. Changes apply to the public site immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((row) => {
          const enabled = flags[row.key]
          const isSaving = saving === row.key
          return (
            <div key={row.key} className="flex items-start justify-between gap-4 rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-muted-foreground">{row.icon}</span>
                <div>
                  <Label htmlFor={`site-flag-${row.key}`} className="font-semibold">
                    {row.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">{row.description}</p>
                  <p className="text-sm mt-2 flex items-center gap-2">
                    {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                    <span className={enabled ? "text-green-600" : "text-muted-foreground"}>
                      {enabled ? row.enabledText : row.disabledText}
                    </span>
                  </p>
                </div>
              </div>
              <Switch
                id={`site-flag-${row.key}`}
                checked={enabled}
                disabled={isSaving}
                onCheckedChange={(checked) => saveFlag(row.key, checked)}
                aria-label={row.label}
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
