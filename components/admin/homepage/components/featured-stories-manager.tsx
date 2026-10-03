"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { FancySelect } from "@/components/ui/fancy-select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { HomepageFeaturedStoriesRules } from "@/lib/types/homepage-settings"

interface FeaturedStoriesManagerProps {
  featuredStoriesRules: HomepageFeaturedStoriesRules
  onChange: (rules: HomepageFeaturedStoriesRules) => void
}

export default function FeaturedStoriesManager({ featuredStoriesRules, onChange }: FeaturedStoriesManagerProps) {
  const updateMode = (mode: 'manual' | 'auto-latest' | 'auto-popular') => {
    onChange({ ...featuredStoriesRules, mode })
  }

  const updateAutoLatest = (field: string, value: any) => {
    onChange({
      ...featuredStoriesRules,
      autoLatest: { ...featuredStoriesRules.autoLatest, [field]: value }
    })
  }

  const updateDisplaySettings = (field: string, value: any) => {
    onChange({
      ...featuredStoriesRules,
      displaySettings: { ...featuredStoriesRules.displaySettings, [field]: value }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Featured Stories Rules</CardTitle>
          <CardDescription>
            Configure how featured stories are selected and displayed on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selection Mode */}
          <div>
            <Label>Selection Mode</Label>
            <FancySelect
              value={featuredStoriesRules.mode}
              onValueChange={(value) => updateMode(value as any)}
              options={[
                { value: "manual", label: "Manual Selection" },
                { value: "auto-latest", label: "Auto - Latest Stories" },
                { value: "auto-popular", label: "Auto - Popular Stories" },
              ]}
              size="sm"
            />
          </div>

          {/* Auto Latest Settings */}
          {featuredStoriesRules.mode === 'auto-latest' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Auto Latest Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Number of Stories</Label>
                  <Input
                    type="number"
                    value={featuredStoriesRules.autoLatest.count}
                    onChange={(e) => updateAutoLatest('count', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Exclude Older Than (days)</Label>
                  <Input
                    type="number"
                    value={featuredStoriesRules.autoLatest.excludeOlderThanDays}
                    onChange={(e) => updateAutoLatest('excludeOlderThanDays', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Show Date</Label>
                <Switch
                  checked={featuredStoriesRules.displaySettings.showDate}
                  onCheckedChange={(checked) => updateDisplaySettings('showDate', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Program</Label>
                <Switch
                  checked={featuredStoriesRules.displaySettings.showProgram}
                  onCheckedChange={(checked) => updateDisplaySettings('showProgram', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Show Excerpt</Label>
                <Switch
                  checked={featuredStoriesRules.displaySettings.showExcerpt}
                  onCheckedChange={(checked) => updateDisplaySettings('showExcerpt', checked)}
                />
              </div>
              <div>
                <Label>Excerpt Length</Label>
                <Input
                  type="number"
                  value={featuredStoriesRules.displaySettings.excerptLength}
                  onChange={(e) => updateDisplaySettings('excerptLength', parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
