"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { HomepageMarqueeSettings } from "@/lib/types/homepage-settings"

interface MarqueeManagerProps {
  marquee: HomepageMarqueeSettings
  onChange: (marquee: HomepageMarqueeSettings) => void
}

export default function MarqueeManager({ marquee, onChange }: MarqueeManagerProps) {
  const updateMarquee = (updates: Partial<HomepageMarqueeSettings>) => {
    onChange({ ...marquee, ...updates })
  }

  const updateGroup = (index: number, field: string, value: any) => {
    const newGroups = [...marquee.grouping.groups]
    newGroups[index] = { ...newGroups[index], [field]: value }
    onChange({
      ...marquee,
      grouping: { ...marquee.grouping, groups: newGroups }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Marquee Settings</CardTitle>
          <CardDescription>
            Configure the partner logo marquee display and behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Marquee</Label>
              <Switch
                checked={marquee.enabled}
                onCheckedChange={(checked) => updateMarquee({ enabled: checked })}
              />
            </div>
            <div>
              <Label>Speed</Label>
              <Input
                type="number"
                value={marquee.speed}
                onChange={(e) => updateMarquee({ speed: parseInt(e.target.value) })}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Lower = slower, Higher = faster</p>
            </div>
            <div>
              <Label>Max Logo Height (px)</Label>
              <Input
                type="number"
                value={marquee.maxLogoHeight}
                onChange={(e) => updateMarquee({ maxLogoHeight: parseInt(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Spacing</Label>
              <Select
                value={marquee.spacing}
                onValueChange={(value: any) => updateMarquee({ spacing: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact ({marquee.spacingPresets.compact}px)</SelectItem>
                  <SelectItem value="comfortable">Comfortable ({marquee.spacingPresets.comfortable}px)</SelectItem>
                  <SelectItem value="spacious">Spacious ({marquee.spacingPresets.spacious}px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Pause on Hover</Label>
              <Switch
                checked={marquee.pauseOnHover}
                onCheckedChange={(checked) => updateMarquee({ pauseOnHover: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Repeat on Mobile</Label>
              <Switch
                checked={marquee.repeatOnMobile}
                onCheckedChange={(checked) => updateMarquee({ repeatOnMobile: checked })}
              />
            </div>
          </div>

          {/* Grouping Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sponsor Groups</CardTitle>
              <CardDescription>Configure sponsor/partner grouping</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <Label>Enable Grouping</Label>
                <Switch
                  checked={marquee.grouping.enabled}
                  onCheckedChange={(checked) => onChange({
                    ...marquee,
                    grouping: { ...marquee.grouping, enabled: checked }
                  })}
                />
              </div>

              {marquee.grouping.enabled && marquee.grouping.groups.map((group, index) => (
                <Card key={group.id}>
                  <CardContent className="pt-4 space-y-3">
                    <div>
                      <Label>Group Name</Label>
                      <Input
                        value={group.name}
                        onChange={(e) => updateGroup(index, 'name', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Visible</Label>
                      <Switch
                        checked={group.visible}
                        onCheckedChange={(checked) => updateGroup(index, 'visible', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>💡 Tip:</strong> The marquee displays partner logos in a continuous scrolling animation.
            Adjust speed and spacing for optimal visual effect.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
