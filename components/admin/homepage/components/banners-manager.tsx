"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Trash2, ChevronUp, ChevronDown, Palette, Eye, EyeOff } from "lucide-react"
import type { HomepageBannersSettings, HomepageBanner } from "@/lib/types/homepage-settings"
import { cn } from "@/lib/utils"

interface BannersManagerProps {
  banners: HomepageBannersSettings
  onChange: (banners: HomepageBannersSettings) => void
}

const PRESET_BANNER_COLORS = [
  { name: "Iris Indigo", hex: "#8B8DD4" },
  { name: "Ocean Teal", hex: "#3FABDE" },
  { name: "Warm Amber", hex: "#F7931E" },
  { name: "Coral Rose", hex: "#E91E63" },
  { name: "Forest Green", hex: "#10B981" },
  { name: "Deep Charcoal", hex: "#334155" },
]

export default function BannersManager({ banners, onChange }: BannersManagerProps) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const addBanner = () => {
    const newBanner: HomepageBanner = {
      id: `banner-${Date.now()}`,
      type: "brush-quote",
      color: "#8B8DD4",
      headline: "Transforming communities together",
      body: "Every action counts towards inclusive growth for children and youth.",
      ctaLabel: null,
      ctaUrl: null,
      order: (banners.banners || []).length + 1,
      visible: true,
      animate: true,
      animationDuration: 1.2,
    }
    onChange({ banners: [...(banners.banners || []), newBanner] })
  }

  const updateBanner = (index: number, updates: Partial<HomepageBanner>) => {
    const newBanners = [...(banners.banners || [])]
    newBanners[index] = { ...newBanners[index], ...updates }
    onChange({ banners: newBanners })
  }

  const confirmDelete = () => {
    if (deleteIndex === null) return
    const newBanners = (banners.banners || []).filter((_, i) => i !== deleteIndex)
    onChange({ banners: newBanners })
    setDeleteIndex(null)
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newBanners = [...(banners.banners || [])]
    ;[newBanners[index - 1], newBanners[index]] = [newBanners[index], newBanners[index - 1]]
    onChange({ banners: newBanners })
  }

  const moveDown = (index: number) => {
    if (index === (banners.banners || []).length - 1) return
    const newBanners = [...(banners.banners || [])]
    ;[newBanners[index], newBanners[index + 1]] = [newBanners[index + 1], newBanners[index]]
    onChange({ banners: newBanners })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border/70">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            Brush-Stroke Quote Banners
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full-width textured quote banners breaking between homepage content sections.
          </p>
        </div>
        <Button onClick={addBanner} size="sm" className="h-9 self-start sm:self-auto text-xs font-medium">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Banner
        </Button>
      </div>

      <div className="space-y-4">
        {(banners.banners || []).map((banner, index) => (
          <Card
            key={banner.id || index}
            className={cn(
              "border border-border/80 shadow-sm transition-all",
              !banner.visible && "opacity-60 bg-muted/30"
            )}
          >
            <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-4 h-4 rounded-full border shadow-sm"
                  style={{ backgroundColor: banner.color }}
                />
                <span className="text-sm font-semibold text-foreground">
                  {banner.headline || `Banner #${index + 1}`}
                </span>
                {!banner.visible && (
                  <span className="ml-2 text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded">
                    Hidden
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="h-8 w-8 p-0"
                  aria-label="Move banner up"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveDown(index)}
                  disabled={index === (banners.banners || []).length - 1}
                  className="h-8 w-8 p-0"
                  aria-label="Move banner down"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateBanner(index, { visible: !banner.visible })}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  aria-label={banner.visible ? "Hide banner" : "Show banner"}
                >
                  {banner.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteIndex(index)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  aria-label="Delete banner"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-medium">Headline Quote</Label>
                  <Input
                    value={banner.headline}
                    onChange={(e) => updateBanner(index, { headline: e.target.value })}
                    placeholder="e.g. When we nurture empathy, we transform generations."
                    className="mt-1.5 h-9 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium">Secondary Narrative / Citation (optional)</Label>
                  <Textarea
                    value={banner.body || ""}
                    onChange={(e) => updateBanner(index, { body: e.target.value })}
                    rows={2}
                    placeholder="Short narrative or subtitle displayed under the quote..."
                    className="mt-1.5 text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium">Banner Accent Color</Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <input
                        type="color"
                        value={banner.color}
                        onChange={(e) => updateBanner(index, { color: e.target.value })}
                        className="w-9 h-9 p-0.5 rounded-lg border border-border cursor-pointer bg-card shrink-0"
                      />
                      <Input
                        value={banner.color}
                        onChange={(e) => updateBanner(index, { color: e.target.value })}
                        placeholder="#8B8DD4"
                        className="h-9 font-mono text-xs"
                      />
                    </div>
                    {/* Preset Swatches */}
                    <div className="flex items-center gap-1.5 mt-2">
                      {PRESET_BANNER_COLORS.map((swatch) => (
                        <button
                          key={swatch.hex}
                          type="button"
                          onClick={() => updateBanner(index, { color: swatch.hex })}
                          className="w-5 h-5 rounded-full border border-black/10 transition-transform hover:scale-110"
                          style={{ backgroundColor: swatch.hex }}
                          title={swatch.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Animation Duration (seconds)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={banner.animationDuration || 1.2}
                      onChange={(e) => {
                        const val = e.target.value === "" ? 1.2 : parseFloat(e.target.value)
                        updateBanner(index, { animationDuration: isNaN(val) ? 1.2 : val })
                      }}
                      className="mt-1.5 h-9 font-mono tabular-nums text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={banner.animate}
                      onCheckedChange={(checked) => updateBanner(index, { animate: checked })}
                    />
                    <Label className="text-xs font-medium">Enable Brushstroke Motion</Label>
                  </div>
                </div>

                {/* Banner Live Preview */}
                <div
                  className="p-5 sm:p-6 rounded-2xl text-white shadow-sm transition-all"
                  style={{ backgroundColor: banner.color }}
                >
                  <p className="text-lg sm:text-xl font-bold tracking-tight mb-1 leading-snug">
                    &ldquo;{banner.headline || "Quote headline goes here"}&rdquo;
                  </p>
                  {banner.body && (
                    <p className="text-xs sm:text-sm text-white/90 font-medium max-w-xl">
                      {banner.body}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(banners.banners || []).length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-2xl bg-muted/20">
            <Palette className="w-10 h-10 mx-auto text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-foreground">No quote banners created</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Add visual brush quote statement banners between homepage sections.
            </p>
            <Button onClick={addBanner} size="sm" variant="outline">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add First Banner
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quote Banner?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this quote banner?
              It will no longer appear on the public homepage upon saving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Banner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
