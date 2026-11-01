"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FancySelect } from "@/components/ui/fancy-select"
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
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Target,
  ArrowRight,
  Heart,
  HandHeart,
  BookOpen,
  Info,
  Sparkles,
  Eye,
  EyeOff,
  type LucideIcon,
} from "lucide-react"
import type { HomepageHeroCTAsSettings, HomepageHeroCTA } from "@/lib/types/homepage-settings"
import { cn } from "@/lib/utils"

interface HeroCTAsManagerProps {
  heroCTAs: HomepageHeroCTAsSettings
  onChange: (heroCTAs: HomepageHeroCTAsSettings) => void
}

const CTA_ICONS: Record<string, LucideIcon> = {
  "arrow-right": ArrowRight,
  heart: Heart,
  "hand-heart": HandHeart,
  "book-open": BookOpen,
  info: Info,
  sparkles: Sparkles,
}

const CTA_ICON_OPTIONS = [
  { value: "arrow-right", label: "Arrow Right (Navigation)" },
  { value: "heart", label: "Heart (Donation)" },
  { value: "hand-heart", label: "Hand with Heart (Support)" },
  { value: "book-open", label: "Book Open (Learn)" },
  { value: "info", label: "Info (About)" },
  { value: "sparkles", label: "Sparkles (Impact)" },
]

export default function HeroCTAsManager({ heroCTAs, onChange }: HeroCTAsManagerProps) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const addCTA = () => {
    const newCTA: HomepageHeroCTA = {
      id: `cta-${Date.now()}`,
      label: "Support Our Mission",
      url: "/donate",
      variant: "primary",
      icon: "arrow-right",
      order: (heroCTAs.ctas || []).length + 1,
      visible: true,
    }
    onChange({ ctas: [...(heroCTAs.ctas || []), newCTA] })
  }

  const updateCTA = (index: number, updates: Partial<HomepageHeroCTA>) => {
    const newCTAs = [...(heroCTAs.ctas || [])]
    newCTAs[index] = { ...newCTAs[index], ...updates }
    onChange({ ctas: newCTAs })
  }

  const confirmDelete = () => {
    if (deleteIndex === null) return
    const newCTAs = (heroCTAs.ctas || []).filter((_, i) => i !== deleteIndex)
    onChange({ ctas: newCTAs })
    setDeleteIndex(null)
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newCTAs = [...(heroCTAs.ctas || [])]
    ;[newCTAs[index - 1], newCTAs[index]] = [newCTAs[index], newCTAs[index - 1]]
    onChange({ ctas: newCTAs })
  }

  const moveDown = (index: number) => {
    if (index === (heroCTAs.ctas || []).length - 1) return
    const newCTAs = [...(heroCTAs.ctas || [])]
    ;[newCTAs[index], newCTAs[index + 1]] = [newCTAs[index + 1], newCTAs[index]]
    onChange({ ctas: newCTAs })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border/70">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Hero Banner Action Buttons
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Primary conversion call-to-action buttons overlaid on the homepage hero area.
          </p>
        </div>
        <Button onClick={addCTA} size="sm" className="h-9 self-start sm:self-auto text-xs font-medium">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Button
        </Button>
      </div>

      <div className="space-y-4">
        {(heroCTAs.ctas || []).map((cta, index) => {
          const IconComp = cta.icon ? CTA_ICONS[cta.icon] : null

          return (
            <Card
              key={cta.id || index}
              className={cn(
                "border border-border/80 shadow-sm transition-all",
                !cta.visible && "opacity-60 bg-muted/30"
              )}
            >
              <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-muted text-xs font-mono font-semibold text-muted-foreground">
                    #{index + 1}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {cta.label || "Untitled Button"}
                  </span>
                  <span className="text-[10px] font-medium bg-muted px-2 py-0.5 rounded capitalize text-muted-foreground">
                    {cta.variant}
                  </span>
                  {!cta.visible && (
                    <span className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded">
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
                    aria-label="Move button up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveDown(index)}
                    disabled={index === (heroCTAs.ctas || []).length - 1}
                    className="h-8 w-8 p-0"
                    aria-label="Move button down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateCTA(index, { visible: !cta.visible })}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    aria-label={cta.visible ? "Hide button" : "Show button"}
                  >
                    {cta.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteIndex(index)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    aria-label="Delete button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <Label className="text-xs font-medium">Button Label</Label>
                    <Input
                      value={cta.label}
                      onChange={(e) => updateCTA(index, { label: e.target.value })}
                      placeholder="e.g. Donate Now"
                      className="mt-1.5 h-9 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs font-medium">Target URL</Label>
                    <Input
                      value={cta.url}
                      onChange={(e) => updateCTA(index, { url: e.target.value })}
                      placeholder="e.g. /donate"
                      className="mt-1.5 h-9 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Button Style Variant</Label>
                    <div className="mt-1.5">
                      <FancySelect
                        value={cta.variant}
                        onValueChange={(val) => updateCTA(index, { variant: val as any })}
                        options={[
                          { value: "primary", label: "Primary (Brand Solid)" },
                          { value: "secondary", label: "Secondary (Subtle Tint)" },
                          { value: "outline", label: "Outline (Ghost Border)" },
                        ]}
                        size="sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Trailing Icon</Label>
                    <div className="mt-1.5">
                      <FancySelect
                        value={cta.icon || "arrow-right"}
                        onValueChange={(val) => updateCTA(index, { icon: val })}
                        options={CTA_ICON_OPTIONS}
                        size="sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
                    <div>
                      <Label className="text-xs font-medium">Render on Hero</Label>
                      <p className="text-[11px] text-muted-foreground">Toggle button visibility on the live page</p>
                    </div>
                    <Switch
                      checked={cta.visible}
                      onCheckedChange={(checked) => updateCTA(index, { visible: checked })}
                    />
                  </div>
                </div>

                {/* Button Preview */}
                <div className="rounded-xl border border-border/60 bg-muted/30 p-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Button Visual Preview:</span>
                  <div
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all",
                      cta.variant === "primary" && "bg-primary text-primary-foreground",
                      cta.variant === "secondary" && "bg-secondary text-secondary-foreground",
                      cta.variant === "outline" && "border border-border bg-card text-foreground"
                    )}
                  >
                    <span>{cta.label || "Click here"}</span>
                    {IconComp && <IconComp className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {(heroCTAs.ctas || []).length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-2xl bg-muted/20">
            <Target className="w-10 h-10 mx-auto text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-foreground">No hero buttons defined</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Add direct conversion buttons over the homepage hero banner.
            </p>
            <Button onClick={addCTA} size="sm" variant="outline">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add First Button
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hero Button?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &ldquo;{deleteIndex !== null ? heroCTAs.ctas[deleteIndex]?.label : ""}&rdquo;?
              This CTA will disappear from the homepage hero upon saving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Button
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
