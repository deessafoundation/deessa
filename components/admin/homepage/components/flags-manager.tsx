"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { FancySelect } from "@/components/ui/fancy-select"
import { Switch } from "@/components/ui/switch"
import { Settings, CheckCircle2, Sliders, Eye } from "lucide-react"
import type { HomepageFlags } from "@/lib/types/homepage-settings"
import { cn } from "@/lib/utils"

interface FlagsManagerProps {
  flags: HomepageFlags
  onChange: (flags: HomepageFlags) => void
}

export default function FlagsManager({ flags, onChange }: FlagsManagerProps) {
  const updateFlag = (updates: Partial<HomepageFlags>) => {
    onChange({ ...flags, ...updates })
  }

  const featureList = [
    { key: "showAccessibilityToolbar", label: "Accessibility Toolbar", active: flags.showAccessibilityToolbar },
    { key: "enableMarquee", label: "Partner Logo Marquee", active: flags.enableMarquee },
    { key: "enableAnimations", label: "Page Animations & Motion", active: flags.enableAnimations },
    { key: "showTrustBadges", label: "Hero Trust Badges", active: flags.showTrustBadges },
    { key: "showTrustIndicators", label: "Trust Indicators Bar", active: flags.showTrustIndicators },
    { key: "showScrollProgress", label: "Reading Progress Bar", active: flags.showScrollProgress },
  ]

  return (
    <div className="space-y-6">
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            Homepage Feature Switches & Runtime Flags
          </CardTitle>
          <CardDescription className="text-xs">
            Instantly turn modular homepage features on or off without redeploying code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/20">
              <div>
                <Label className="text-xs font-semibold">Accessibility Toolbar</Label>
                <p className="text-[11px] text-muted-foreground">Show contrast and font controls</p>
              </div>
              <Switch
                checked={flags.showAccessibilityToolbar}
                onCheckedChange={(checked) => updateFlag({ showAccessibilityToolbar: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/20">
              <div>
                <Label className="text-xs font-semibold">Partner Logo Marquee</Label>
                <p className="text-[11px] text-muted-foreground">Scrolling sponsor strip</p>
              </div>
              <Switch
                checked={flags.enableMarquee}
                onCheckedChange={(checked) => updateFlag({ enableMarquee: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/20">
              <div>
                <Label className="text-xs font-semibold">Fluid Motion & Animations</Label>
                <p className="text-[11px] text-muted-foreground">Scroll reveals & micro-interactions</p>
              </div>
              <Switch
                checked={flags.enableAnimations}
                onCheckedChange={(checked) => updateFlag({ enableAnimations: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/20">
              <div>
                <Label className="text-xs font-semibold">Hero Trust Badges</Label>
                <p className="text-[11px] text-muted-foreground">Verification badges in hero</p>
              </div>
              <Switch
                checked={flags.showTrustBadges}
                onCheckedChange={(checked) => updateFlag({ showTrustBadges: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/20">
              <div>
                <Label className="text-xs font-semibold">Trust Indicators Bar</Label>
                <p className="text-[11px] text-muted-foreground">Credibility ribbon under hero</p>
              </div>
              <Switch
                checked={flags.showTrustIndicators}
                onCheckedChange={(checked) => updateFlag({ showTrustIndicators: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/20">
              <div>
                <Label className="text-xs font-semibold">Reading Scroll Progress</Label>
                <p className="text-[11px] text-muted-foreground">Top progress line as user scrolls</p>
              </div>
              <Switch
                checked={flags.showScrollProgress}
                onCheckedChange={(checked) => updateFlag({ showScrollProgress: checked })}
              />
            </div>
          </div>

          {flags.showAccessibilityToolbar && (
            <div className="p-4 rounded-xl border border-border/70 bg-card max-w-sm">
              <Label className="text-xs font-medium">Accessibility Toolbar Docking</Label>
              <div className="mt-1.5">
                <FancySelect
                  value={flags.accessibilityToolbarPosition}
                  onValueChange={(val) => updateFlag({ accessibilityToolbarPosition: val as any })}
                  options={[
                    { value: "top-left", label: "Top Left" },
                    { value: "top-right", label: "Top Right" },
                    { value: "bottom-left", label: "Bottom Left" },
                    { value: "bottom-right", label: "Bottom Right" },
                  ]}
                  size="sm"
                />
              </div>
            </div>
          )}

          {/* Status Summary */}
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Active Module Overview
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {featureList.map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      item.active ? "bg-emerald-500" : "bg-muted-foreground/40"
                    )}
                  />
                  <span className={item.active ? "text-foreground font-medium" : "text-muted-foreground"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
