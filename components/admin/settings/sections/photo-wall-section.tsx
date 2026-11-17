"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ImageIcon,
  Save,
  RotateCcw,
  Loader2,
  Eye,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from "lucide-react"
import { FileUpload } from "@/components/admin/media/file-upload"
import PhotoWall from "@/components/photo-wall/photo-wall"
import { notifications } from "@/lib/notifications"
import { updateSiteSetting } from "@/lib/actions/admin-settings"

export interface PhotoWallPanel {
  src: string
  alt?: string
  title?: string
  label?: string
  tint?: string
  focalX?: number
  focalY?: number
  objectPosition?: string
}

interface PhotoWallSectionProps {
  initialPanels?: PhotoWallPanel[]
}

const DEFAULT_PANELS: PhotoWallPanel[] = Array.from({ length: 9 }).map(() => ({
  src: "",
  alt: "",
  title: "",
  label: "",
  tint: "",
}))

export function PhotoWallSection({ initialPanels }: PhotoWallSectionProps) {
  const router = useRouter()
  const baseline = Array.isArray(initialPanels) && initialPanels.length === 9 ? initialPanels : DEFAULT_PANELS
  const [panels, setPanels] = useState<PhotoWallPanel[]>(baseline)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewScale, setPreviewScale] = useState(1)

  const isDirty = JSON.stringify(panels) !== JSON.stringify(baseline)

  const updatePanel = (idx: number, patch: Partial<PhotoWallPanel>) => {
    setPanels((prev) => {
      const next = [...prev]
      next[idx] = { ...(next[idx] || {}), ...patch }
      return next
    })
  }

  const setPanelFocal = (idx: number, xPct: number, yPct: number) => {
    setPanels((prev) => {
      const next = [...prev]
      next[idx] = {
        ...(next[idx] || {}),
        focalX: xPct,
        focalY: yPct,
        objectPosition: `${xPct}% ${yPct}%`,
      }
      return next
    })
  }

  const clearPanelFocal = (idx: number) => {
    setPanels((prev) => {
      const next = [...prev]
      const item = { ...next[idx] }
      delete item.focalX
      delete item.focalY
      delete item.objectPosition
      next[idx] = item
      return next
    })
  }

  const handleReset = () => {
    setPanels(baseline)
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const result = await updateSiteSetting(
        "photo_wall_images",
        panels as unknown as Record<string, unknown>
      )

      if (result?.error) {
        notifications.showError({
          title: "Save Failed",
          description: result.error,
        })
      } else {
        notifications.showSuccess({
          title: "Photo Wall Saved",
          description: "All 9 Impact photo wall panels updated live across the site.",
        })
        router.refresh()
      }
    } catch (err) {
      notifications.showError({
        title: "Unexpected Error",
        description: err instanceof Error ? err.message : "Failed to save photo wall panels.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <Card className="border border-border/80 bg-gradient-to-r from-amber-500/5 via-amber-500/[0.02] to-transparent shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Impact Center Photo Wall (9 Slots)</h3>
                <p className="text-sm text-muted-foreground">
                  Curation panels featured on the public /impact page and live photography exhibitions.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(true)}
                className="h-9 gap-1.5"
              >
                <Eye className="h-4 w-4" />
                Live Demo Preview
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mini Horizontal Thumbnail Strip */}
      <Card className="border border-border/80 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Composite Sequence (Slots 1 to 9)
          </span>
          <Badge variant="outline" className="text-[10px]">
            {panels.filter((p) => Boolean(p.src)).length} of 9 Configured
          </Badge>
        </div>
        <div className="overflow-x-auto pb-2 flex gap-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {panels.map((p, idx) => (
            <div
              key={idx}
              className="h-32 w-20 shrink-0 rounded-lg overflow-hidden border border-border/70 bg-muted/30 relative flex flex-col justify-end p-1.5 group"
            >
              {p.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.src}
                  alt={p.alt || `Slot ${idx + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: p.objectPosition || "50% 50%" }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground">
                  Empty
                </div>
              )}
              <div className="relative z-10 bg-black/60 backdrop-blur-xs text-[9px] font-mono text-white px-1 py-0.5 rounded text-center">
                #{idx + 1}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 9 Slots Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {panels.map((panel, idx) => (
          <Card key={idx} className="border border-border/80 shadow-xs hover:shadow-sm transition-shadow">
            <CardHeader className="bg-muted/30 border-b p-3.5 flex flex-row items-center justify-between">
              <span className="font-bold text-sm">Panel Slot #{idx + 1}</span>
              {panel.src && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Ready
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <FileUpload
                bucket="photo-wall"
                currentUrl={panel.src}
                onUpload={(url) => updatePanel(idx, { src: url })}
                label={`Upload Image #${idx + 1}`}
                maxSizeMB={10}
              />

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Title Overlay</Label>
                <Input
                  placeholder="e.g. Free Eye Health Camp"
                  value={panel.title || ""}
                  onChange={(e) => updatePanel(idx, { title: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category Label</Label>
                <Input
                  placeholder="e.g. Healthcare Outreach"
                  value={panel.label || ""}
                  onChange={(e) => updatePanel(idx, { label: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Alt Description</Label>
                <Input
                  placeholder="Accessibility image description"
                  value={panel.alt || ""}
                  onChange={(e) => updatePanel(idx, { alt: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              {/* Focal Alignment Helpers */}
              <div className="pt-2 border-t flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">Focal Point:</span>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[10px] px-2"
                    onClick={() => setPanelFocal(idx, 50, 28)}
                  >
                    Face/Center
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[10px] px-2 text-muted-foreground"
                    onClick={() => clearPanelFocal(idx)}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Floating Action Bar */}
      <div className="flex items-center justify-between p-4 bg-card rounded-xl border shadow-sm sticky bottom-4 z-10">
        <div className="text-sm text-muted-foreground">
          {isDirty ? (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              You have unsaved changes across photo wall panels.
            </span>
          ) : (
            <span>All 9 photo wall panels are saved and synchronized.</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!isDirty || isSaving}
            className="h-10"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Discard
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="h-10 min-w-[160px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Photo Wall
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Live Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Photo Wall Component Simulator</span>
              <div className="flex items-center gap-1.5 mr-6">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-7 w-7"
                  onClick={() => setPreviewScale((s) => Math.max(0.5, +(s - 0.1).toFixed(2)))}
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs font-mono px-1">{Math.round(previewScale * 100)}%</span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-7 w-7"
                  onClick={() => setPreviewScale((s) => Math.min(1.5, +(s + 0.1).toFixed(2)))}
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => setPreviewScale(1)}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>
              Preview how the 9 photo panels animate and interact on the live impact page.
            </DialogDescription>
          </DialogHeader>

          <div
            className="p-4 bg-muted/20 rounded-xl overflow-hidden transition-transform duration-150 origin-top"
            style={{ transform: `scale(${previewScale})` }}
          >
            <PhotoWall />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
