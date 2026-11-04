"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { FancySelect } from "@/components/ui/fancy-select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Star, Sliders, BookOpen, Clock, Flame } from "lucide-react"
import type { HomepageFeaturedStoriesRules } from "@/lib/types/homepage-settings"

interface FeaturedStoriesManagerProps {
  featuredStoriesRules: HomepageFeaturedStoriesRules
  onChange: (rules: HomepageFeaturedStoriesRules) => void
}

export default function FeaturedStoriesManager({ featuredStoriesRules, onChange }: FeaturedStoriesManagerProps) {
  const updateMode = (mode: "manual" | "auto-latest" | "auto-popular") => {
    onChange({ ...featuredStoriesRules, mode })
  }

  const updateManualSelection = (field: string, value: unknown) => {
    onChange({
      ...featuredStoriesRules,
      manualSelection: {
        ...(featuredStoriesRules.manualSelection || { storyIds: [], maxCount: 3 }),
        [field]: value,
      },
    })
  }

  const updateAutoLatest = (field: string, value: unknown) => {
    onChange({
      ...featuredStoriesRules,
      autoLatest: {
        ...(featuredStoriesRules.autoLatest || { count: 3, filterByProgram: null, excludeOlderThanDays: 365 }),
        [field]: value,
      },
    })
  }

  const updateAutoPopular = (field: string, value: unknown) => {
    onChange({
      ...featuredStoriesRules,
      autoPopular: {
        ...(featuredStoriesRules.autoPopular || { count: 3, sortBy: "views", minViews: 100 }),
        [field]: value,
      },
    })
  }

  const updateDisplaySettings = (field: string, value: unknown) => {
    onChange({
      ...featuredStoriesRules,
      displaySettings: {
        ...featuredStoriesRules.displaySettings,
        [field]: value,
      },
    })
  }

  const manualStoryIdsString = (featuredStoriesRules.manualSelection?.storyIds || []).join(", ")

  return (
    <div className="space-y-6">
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            Featured Stories Curation
          </CardTitle>
          <CardDescription className="text-xs">
            Configure how impact narratives from changemakers and beneficiaries are surfaced on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mode Selector */}
          <div>
            <Label className="text-xs font-medium">Curating Mechanism</Label>
            <div className="mt-1.5 max-w-sm">
              <FancySelect
                value={featuredStoriesRules.mode || "auto-latest"}
                onValueChange={(value) => updateMode(value as "manual" | "auto-latest" | "auto-popular")}
                options={[
                  { value: "auto-latest", label: "Auto - Most Recent Stories" },
                  { value: "auto-popular", label: "Auto - Most Popular Stories" },
                  { value: "manual", label: "Manual - Curated Story IDs" },
                ]}
                size="sm"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Select how stories are dynamically queried for the homepage changemaker grid.
            </p>
          </div>

          {/* Manual Selection Settings */}
          {featuredStoriesRules.mode === "manual" && (
            <Card className="border border-border/70 bg-muted/20">
              <CardHeader className="py-3 px-4 border-b border-border/50">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Manual Stories Curation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label className="text-xs font-medium">Target Story IDs (comma separated)</Label>
                  <Input
                    value={manualStoryIdsString}
                    onChange={(e) => {
                      const ids = e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                      updateManualSelection("storyIds", ids)
                    }}
                    placeholder="e.g. story-uuid-1, story-uuid-2"
                    className="mt-1.5 h-9 font-mono text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Copy the story ID or slug from the Stories manager in the admin sidebar.
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-medium">Maximum Stories to Display</Label>
                  <Input
                    type="number"
                    value={featuredStoriesRules.manualSelection?.maxCount || 3}
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : Number(e.target.value)
                      updateManualSelection("maxCount", isNaN(val) ? 3 : val)
                    }}
                    className="mt-1.5 h-9 w-32 font-mono tabular-nums text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Auto Latest Settings */}
          {featuredStoriesRules.mode === "auto-latest" && (
            <Card className="border border-border/70 bg-muted/20">
              <CardHeader className="py-3 px-4 border-b border-border/50">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Latest Stories Dynamic Query
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium">Stories Count</Label>
                  <Input
                    type="number"
                    value={featuredStoriesRules.autoLatest?.count || 3}
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : Number(e.target.value)
                      updateAutoLatest("count", isNaN(val) ? 3 : val)
                    }}
                    className="mt-1.5 h-9 font-mono tabular-nums text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Exclude Stories Older Than (days)</Label>
                  <Input
                    type="number"
                    value={featuredStoriesRules.autoLatest?.excludeOlderThanDays || 365}
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : Number(e.target.value)
                      updateAutoLatest("excludeOlderThanDays", isNaN(val) ? 365 : val)
                    }}
                    className="mt-1.5 h-9 font-mono tabular-nums text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Auto Popular Settings */}
          {featuredStoriesRules.mode === "auto-popular" && (
            <Card className="border border-border/70 bg-muted/20">
              <CardHeader className="py-3 px-4 border-b border-border/50">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Flame className="w-4 h-4 text-primary" />
                  Popular Stories Query
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium">Stories Count</Label>
                  <Input
                    type="number"
                    value={featuredStoriesRules.autoPopular?.count || 3}
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : Number(e.target.value)
                      updateAutoPopular("count", isNaN(val) ? 3 : val)
                    }}
                    className="mt-1.5 h-9 font-mono tabular-nums text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Minimum Views Required</Label>
                  <Input
                    type="number"
                    value={featuredStoriesRules.autoPopular?.minViews || 100}
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : Number(e.target.value)
                      updateAutoPopular("minViews", isNaN(val) ? 100 : val)
                    }}
                    className="mt-1.5 h-9 font-mono tabular-nums text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Display Presentation Settings */}
          <Card className="border border-border/70 shadow-none">
            <CardHeader className="py-3 px-4 border-b border-border/50">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                Display Presentation & Card Elements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30">
                  <div>
                    <Label className="text-xs font-medium">Publish Date</Label>
                    <p className="text-[11px] text-muted-foreground">Show story timestamp</p>
                  </div>
                  <Switch
                    checked={featuredStoriesRules.displaySettings?.showDate ?? true}
                    onCheckedChange={(checked) => updateDisplaySettings("showDate", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30">
                  <div>
                    <Label className="text-xs font-medium">Associated Program</Label>
                    <p className="text-[11px] text-muted-foreground">Display program pill</p>
                  </div>
                  <Switch
                    checked={featuredStoriesRules.displaySettings?.showProgram ?? true}
                    onCheckedChange={(checked) => updateDisplaySettings("showProgram", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30">
                  <div>
                    <Label className="text-xs font-medium">Summary Excerpt</Label>
                    <p className="text-[11px] text-muted-foreground">Display preview text</p>
                  </div>
                  <Switch
                    checked={featuredStoriesRules.displaySettings?.showExcerpt ?? true}
                    onCheckedChange={(checked) => updateDisplaySettings("showExcerpt", checked)}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium">Excerpt Length (characters)</Label>
                <Input
                  type="number"
                  value={featuredStoriesRules.displaySettings?.excerptLength || 150}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : Number(e.target.value)
                    updateDisplaySettings("excerptLength", isNaN(val) ? 150 : val)
                  }}
                  className="mt-1.5 h-9 w-40 font-mono tabular-nums text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
