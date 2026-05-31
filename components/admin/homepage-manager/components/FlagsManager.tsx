"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { HomepageFlags } from "@/lib/types/homepage-settings"

interface FlagsManagerProps {
  flags: HomepageFlags
  onChange: (flags: HomepageFlags) => void
}

export default function FlagsManager({ flags, onChange }: FlagsManagerProps) {
  const updateFlag = (updates: Partial<HomepageFlags>) => {
    onChange({ ...flags, ...updates })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>
            Toggle homepage features and behaviors on or off
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">Display Features</h3>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label className="font-medium">Accessibility Toolbar</Label>
                <p className="text-xs text-gray-500 mt-1">Show accessibility options on homepage</p>
              </div>
              <Switch
                checked={flags.showAccessibilityToolbar}
                onCheckedChange={(checked) => updateFlag({ showAccessibilityToolbar: checked })}
              />
            </div>

            {flags.showAccessibilityToolbar && (
              <div className="ml-4">
                <Label>Toolbar Position</Label>
                <Select
                  value={flags.accessibilityToolbarPosition}
                  onValueChange={(value: any) => updateFlag({ accessibilityToolbarPosition: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label className="font-medium">Partner Marquee</Label>
                <p className="text-xs text-gray-500 mt-1">Enable scrolling partner logos</p>
              </div>
              <Switch
                checked={flags.enableMarquee}
                onCheckedChange={(checked) => updateFlag({ enableMarquee: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label className="font-medium">Animations</Label>
                <p className="text-xs text-gray-500 mt-1">Enable page animations and transitions</p>
              </div>
              <Switch
                checked={flags.enableAnimations}
                onCheckedChange={(checked) => updateFlag({ enableAnimations: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label className="font-medium">Trust Badges</Label>
                <p className="text-xs text-gray-500 mt-1">Show trust badges in hero section</p>
              </div>
              <Switch
                checked={flags.showTrustBadges}
                onCheckedChange={(checked) => updateFlag({ showTrustBadges: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label className="font-medium">Trust Indicators</Label>
                <p className="text-xs text-gray-500 mt-1">Show trust indicators under hero</p>
              </div>
              <Switch
                checked={flags.showTrustIndicators}
                onCheckedChange={(checked) => updateFlag({ showTrustIndicators: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label className="font-medium">Scroll Progress Bar</Label>
                <p className="text-xs text-gray-500 mt-1">Show reading progress at top of page</p>
              </div>
              <Switch
                checked={flags.showScrollProgress}
                onCheckedChange={(checked) => updateFlag({ showScrollProgress: checked })}
              />
            </div>
          </div>

          {/* Content Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">Content Features</h3>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="font-medium">Featured Stories Mode</Label>
              <p className="text-xs text-gray-500 mt-1 mb-3">How to select featured stories</p>
              <Select
                value={flags.featuredStoriesMode}
                onValueChange={(value: any) => updateFlag({ featuredStoriesMode: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Selection</SelectItem>
                  <SelectItem value="auto-latest">Auto - Latest Stories</SelectItem>
                  <SelectItem value="auto-popular">Auto - Popular Stories</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-base">Active Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className={flags.showAccessibilityToolbar ? "text-green-600" : "text-gray-400"}>
                {flags.showAccessibilityToolbar ? "✓" : "○"}
              </span>
              <span>Accessibility Toolbar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={flags.enableMarquee ? "text-green-600" : "text-gray-400"}>
                {flags.enableMarquee ? "✓" : "○"}
              </span>
              <span>Marquee</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={flags.enableAnimations ? "text-green-600" : "text-gray-400"}>
                {flags.enableAnimations ? "✓" : "○"}
              </span>
              <span>Animations</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={flags.showTrustBadges ? "text-green-600" : "text-gray-400"}>
                {flags.showTrustBadges ? "✓" : "○"}
              </span>
              <span>Trust Badges</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={flags.showTrustIndicators ? "text-green-600" : "text-gray-400"}>
                {flags.showTrustIndicators ? "✓" : "○"}
              </span>
              <span>Trust Indicators</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={flags.showScrollProgress ? "text-green-600" : "text-gray-400"}>
                {flags.showScrollProgress ? "✓" : "○"}
              </span>
              <span>Scroll Progress</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
