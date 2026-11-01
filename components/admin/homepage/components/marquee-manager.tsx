"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FancySelect } from "@/components/ui/fancy-select"
import { Switch } from "@/components/ui/switch"
import { SlidersHorizontal, Info, ShieldCheck, Zap } from "lucide-react"
import type { HomepageMarqueeSettings } from "@/lib/types/homepage-settings"

interface MarqueeManagerProps {
  marquee: HomepageMarqueeSettings
  onChange: (marquee: HomepageMarqueeSettings) => void
}

export default function MarqueeManager({ marquee, onChange }: MarqueeManagerProps) {
  const updateMarquee = (updates: Partial<HomepageMarqueeSettings>) => {
    onChange({ ...marquee, ...updates })
  }

  const updateGroup = (index: number, field: string, value: unknown) => {
    const newGroups = [...(marquee.grouping?.groups || [])]
    newGroups[index] = { ...newGroups[index], [field]: value }
    onChange({
      ...marquee,
      grouping: { ...marquee.grouping, groups: newGroups },
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            Partner & Institutional Logos Marquee
          </CardTitle>
          <CardDescription className="text-xs">
            Configure the infinite-scrolling partner logo strip displayed across the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Toggle Switch */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-muted/30">
            <div>
              <Label className="text-sm font-semibold">Enable Marquee on Homepage</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Toggle whether the scrolling partner logos ticker is rendered.
              </p>
            </div>
            <Switch
              checked={marquee.enabled}
              onCheckedChange={(checked) => updateMarquee({ enabled: checked })}
            />
          </div>

          {/* Marquee Configuration Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-medium">Scroll Speed (seconds per loop)</Label>
              <Input
                type="number"
                value={marquee.speed === 0 ? "0" : marquee.speed}
                onChange={(e) => {
                  const val = e.target.value === "" ? 25 : Number(e.target.value)
                  updateMarquee({ speed: isNaN(val) ? 25 : val })
                }}
                className="mt-1.5 h-9 font-mono tabular-nums text-sm"
              />
              <p className="text-[11px] text-muted-foreground mt-1">Lower = faster, Higher = gentler scroll</p>
            </div>

            <div>
              <Label className="text-xs font-medium">Max Logo Height (px)</Label>
              <Input
                type="number"
                value={marquee.maxLogoHeight === 0 ? "0" : marquee.maxLogoHeight}
                onChange={(e) => {
                  const val = e.target.value === "" ? 48 : Number(e.target.value)
                  updateMarquee({ maxLogoHeight: isNaN(val) ? 48 : val })
                }}
                className="mt-1.5 h-9 font-mono tabular-nums text-sm"
              />
              <p className="text-[11px] text-muted-foreground mt-1">Recommended: 36px to 56px</p>
            </div>

            <div>
              <Label className="text-xs font-medium">Item Gap Spacing</Label>
              <div className="mt-1.5">
                <FancySelect
                  value={marquee.spacing}
                  onValueChange={(value) => updateMarquee({ spacing: value as any })}
                  options={[
                    { value: "compact", label: `Compact (${marquee.spacingPresets?.compact || 32}px)` },
                    { value: "comfortable", label: `Comfortable (${marquee.spacingPresets?.comfortable || 48}px)` },
                    { value: "spacious", label: `Spacious (${marquee.spacingPresets?.spacious || 64}px)` },
                  ]}
                  size="sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/20">
              <div>
                <Label className="text-xs font-medium">Pause Animation on Hover</Label>
                <p className="text-[11px] text-muted-foreground">Allows users to easily inspect individual logos</p>
              </div>
              <Switch
                checked={marquee.pauseOnHover}
                onCheckedChange={(checked) => updateMarquee({ pauseOnHover: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-muted/20">
              <div>
                <Label className="text-xs font-medium">Duplicate Strip for Mobile</Label>
                <p className="text-[11px] text-muted-foreground">Ensures seamless looping on small viewports</p>
              </div>
              <Switch
                checked={marquee.repeatOnMobile}
                onCheckedChange={(checked) => updateMarquee({ repeatOnMobile: checked })}
              />
            </div>
          </div>

          {/* Partner Groups */}
          <Card className="border border-border/60 shadow-none">
            <CardHeader className="py-3 px-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Tiered Sponsor Groups</CardTitle>
                  <CardDescription className="text-xs">
                    Optionally segment partner logos into designated tiers (Institutional, Academic, Corporate).
                  </CardDescription>
                </div>
                <Switch
                  checked={marquee.grouping?.enabled || false}
                  onCheckedChange={(checked) =>
                    onChange({
                      ...marquee,
                      grouping: { ...marquee.grouping, enabled: checked },
                    })
                  }
                />
              </div>
            </CardHeader>
            {marquee.grouping?.enabled && (
              <CardContent className="p-4 space-y-3">
                {(marquee.grouping.groups || []).map((group, index) => (
                  <div key={group.id || index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex-1 max-w-sm mr-4">
                      <Label className="text-xs font-medium">Group Label</Label>
                      <Input
                        value={group.name}
                        onChange={(e) => updateGroup(index, "name", e.target.value)}
                        className="mt-1 h-8 text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Active</Label>
                      <Switch
                        checked={group.visible}
                        onCheckedChange={(checked) => updateGroup(index, "visible", checked)}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
