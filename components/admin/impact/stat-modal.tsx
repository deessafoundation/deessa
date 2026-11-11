"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Check,
  Sparkles,
  Home,
  BarChart3,
  Eye,
  EyeOff,
  Search,
} from "lucide-react"
import {
  STAT_ICONS,
  BRAND_COLORS,
  getColorTokens,
  getStatIcon,
} from "./stat-config"
import { saveImpactStatAction, type SaveImpactStatInput } from "@/lib/actions/admin-stats"
import type { ImpactStat } from "@/lib/types/admin"
import { notifications } from "@/lib/notifications"
import { cn } from "@/lib/utils"
import styles from "./stats.module.css"

interface StatModalProps {
  isOpen: boolean
  onClose: () => void
  statToEdit?: ImpactStat | null
  onSuccess: (stat: ImpactStat) => void
}

export function StatModal({ isOpen, onClose, statToEdit, onSuccess }: StatModalProps) {
  const isEditing = !!statToEdit

  // Form State
  const [label, setLabel] = useState("")
  const [value, setValue] = useState("")
  const [category, setCategory] = useState<"home" | "impact">("home")
  const [icon, setIcon] = useState("heart")
  const [color, setColor] = useState("#3FABDE")
  const [hasProgress, setHasProgress] = useState(false)
  const [progress, setProgress] = useState(75)
  const [isPublished, setIsPublished] = useState(true)
  const [sortOrder, setSortOrder] = useState<number>(0)

  // Icon search
  const [iconSearch, setIconSearch] = useState("")

  // Submission State
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Reset or initialize when modal opens or statToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (statToEdit) {
        setLabel(statToEdit.label || "")
        setValue(statToEdit.value || "")
        setCategory(statToEdit.category || "home")
        setIcon(statToEdit.icon || "heart")
        setColor(statToEdit.color || "#3FABDE")
        setHasProgress(statToEdit.progress !== null && statToEdit.progress !== undefined)
        setProgress(statToEdit.progress ?? 75)
        setIsPublished(statToEdit.is_published ?? true)
        setSortOrder(statToEdit.sort_order ?? 0)
      } else {
        setLabel("")
        setValue("")
        setCategory("home")
        setIcon("heart")
        setColor("#3FABDE")
        setHasProgress(false)
        setProgress(75)
        setIsPublished(true)
        setSortOrder(0)
      }
      setIconSearch("")
      setErrorMessage(null)
    }
  }, [isOpen, statToEdit])

  // Filtered icons
  const filteredIcons = STAT_ICONS.filter((item) =>
    item.label.toLowerCase().includes(iconSearch.toLowerCase()) ||
    item.key.toLowerCase().includes(iconSearch.toLowerCase())
  )

  const activeColorTokens = getColorTokens(color)
  const ActiveIconComponent = getStatIcon(icon)

  async function handleSave() {
    if (!label.trim()) {
      setErrorMessage("Please enter a statistic label (e.g. Lives Impacted).")
      return
    }
    if (!value.trim()) {
      setErrorMessage("Please enter a statistic value (e.g. 10,000+).")
      return
    }

    setIsSaving(true)
    setErrorMessage(null)

    try {
      const input: SaveImpactStatInput = {
        id: statToEdit?.id,
        label: label.trim(),
        value: value.trim(),
        category,
        icon: icon || null,
        color: color || null,
        progress: hasProgress ? progress : null,
        is_published: isPublished,
        sort_order: isEditing ? sortOrder : undefined,
      }

      const res = await saveImpactStatAction(input)

      if (!res.success || !res.data) {
        setErrorMessage(res.error || "Failed to save statistic.")
        setIsSaving(false)
        return
      }

      notifications.showSuccess(
        isEditing
          ? `Updated statistic "${res.data.label}"`
          : `Created statistic "${res.data.label}"`
      )

      onSuccess(res.data)
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred."
      setErrorMessage(msg)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                {isEditing ? "Edit Impact Statistic" : "Add Impact Statistic"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Configure key figures and milestones showcased on the homepage and impact page.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {errorMessage && (
            <div className="p-3 text-sm rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
              {errorMessage}
            </div>
          )}

          {/* Real-time Live Preview Card */}
          <div className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="size-3 text-primary" /> Live Card Preview
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[11px] font-medium gap-1",
                  isPublished
                    ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                    : "border-muted-foreground/30 text-muted-foreground bg-muted"
                )}
              >
                {isPublished ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                {isPublished ? "Published" : "Hidden"}
              </Badge>
            </div>

            <div className="p-5 rounded-xl border border-border/60 bg-card shadow-sm flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(styles.iconCanvas, "size-12 shrink-0 border")}
                    style={{
                      backgroundColor: activeColorTokens.bgTint,
                      borderColor: activeColorTokens.borderTint,
                    }}
                  >
                    <ActiveIconComponent
                      className="size-6 transition-all"
                      style={{ color: color }}
                    />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold tracking-tight tabular-nums" style={{ color }}>
                      {value || "10,000+"}
                    </h4>
                    <p className="text-sm font-medium text-foreground">
                      {label || "Lives Impacted Across Nepal"}
                    </p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    "text-[11px] shrink-0 font-medium",
                    category === "home" ? styles.badgeHome : styles.badgeImpact
                  )}
                >
                  {category === "home" ? (
                    <span className="flex items-center gap-1">
                      <Home className="size-3" /> Homepage
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <BarChart3 className="size-3" /> Impact Page
                    </span>
                  )}
                </Badge>
              </div>

              {hasProgress && (
                <div className="pt-2 border-t border-border/40 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground font-medium">
                    <span>Target Progress</span>
                    <span className="font-semibold text-foreground">{progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields: Value & Label */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stat-value" className="text-xs font-semibold">
                Metric Value <span className="text-destructive">*</span>
              </Label>
              <Input
                id="stat-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 10,000+ or 847+"
                className="font-medium text-base h-11"
              />
              <p className="text-[11px] text-muted-foreground">
                Display number or highlight (e.g. &quot;50+&quot;, &quot;25/77&quot;, &quot;10,000+&quot;).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stat-label" className="text-xs font-semibold">
                Statistic Label <span className="text-destructive">*</span>
              </Label>
              <Input
                id="stat-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Lives Impacted"
                className="font-medium h-11"
              />
              <p className="text-[11px] text-muted-foreground">
                Clear description of what this metric measures.
              </p>
            </div>
          </div>

          {/* Placement Scope / Category */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Target Placement / Scope</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategory("home")}
                className={cn(
                  "p-3 rounded-xl border text-left flex items-start gap-3 transition-all",
                  category === "home"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border/80 hover:bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "size-8 rounded-lg flex items-center justify-center shrink-0",
                    category === "home" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Home className="size-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs sm:text-sm">Homepage Hero & Strip</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Prominently displayed on home trust and metric rails.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCategory("impact")}
                className={cn(
                  "p-3 rounded-xl border text-left flex items-start gap-3 transition-all",
                  category === "impact"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border/80 hover:bg-muted/50"
                )}
              >
                <div
                  className={cn(
                    "size-8 rounded-lg flex items-center justify-center shrink-0",
                    category === "impact" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <BarChart3 className="size-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs sm:text-sm">Impact Breakdown Page</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Showcased in the dedicated /impact counters grid.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Brand Color Swatches */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Brand Accent Color</Label>
              <span className="text-xs font-medium text-muted-foreground">
                {activeColorTokens.name} ({color})
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {BRAND_COLORS.map((c) => {
                const isSelected = color.toLowerCase() === c.hex.toLowerCase()
                return (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.name}
                    onClick={() => setColor(c.hex)}
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
                      isSelected ? "ring-2 ring-foreground scale-110" : "hover:scale-105 opacity-90"
                    )}
                    style={{ backgroundColor: c.hex }}
                  >
                    {isSelected && <Check className="size-4 text-white drop-shadow" />}
                  </button>
                )
              })}

              <div className="flex items-center gap-1.5 ml-2 border border-border/80 rounded-lg px-2 py-1 bg-card">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="size-5 rounded cursor-pointer border-0 p-0 bg-transparent"
                  title="Pick custom color"
                />
                <span className="text-xs font-mono uppercase text-muted-foreground">{color}</span>
              </div>
            </div>
          </div>

          {/* Icon Picker */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-4">
              <Label className="text-xs font-semibold">Select Representative Icon</Label>
              <div className="relative w-44">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                <Input
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  placeholder="Search icons..."
                  className="h-7 text-xs pl-7"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-44 overflow-y-auto p-1.5 rounded-lg border border-border/60 bg-muted/20">
              {filteredIcons.map((item) => {
                const IconComponent = item.icon
                const isSelected = icon === item.key
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setIcon(item.key)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 p-2 rounded-lg border text-center transition-all",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-medium shadow-xs"
                        : "border-transparent hover:border-border hover:bg-card text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <IconComponent className="size-5" />
                    <span className="text-[10px] truncate w-full">{item.label.split("/")[0]}</span>
                  </button>
                )
              })}
              {filteredIcons.length === 0 && (
                <div className="col-span-full py-4 text-center text-xs text-muted-foreground">
                  No matching icons found.
                </div>
              )}
            </div>
          </div>

          {/* Milestone Progress Toggle & Slider */}
          <div className="rounded-xl border border-border/80 p-4 space-y-4 bg-card">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="progress-toggle" className="text-xs font-semibold cursor-pointer">
                  Track as Progress Milestone
                </Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Display a visual progress bar indicating advancement toward an organizational goal.
                </p>
              </div>
              <Switch
                id="progress-toggle"
                checked={hasProgress}
                onCheckedChange={setHasProgress}
              />
            </div>

            {hasProgress && (
              <div className="pt-2 border-t border-border/40 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">Progress Completion</span>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={progress}
                      onChange={(e) => setProgress(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                      className="h-7 w-16 text-center text-xs font-bold"
                    />
                    <span className="font-semibold">%</span>
                  </div>
                </div>

                <Slider
                  value={[progress]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(val) => setProgress(val[0])}
                  className="py-1"
                />
              </div>
            )}
          </div>

          {/* Visibility Switch */}
          <div className="rounded-xl border border-border/80 p-4 flex items-center justify-between bg-card">
            <div>
              <Label htmlFor="published-toggle" className="text-xs font-semibold cursor-pointer">
                Public Visibility Status
              </Label>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                When enabled, visitors will see this statistic live on the site.
              </p>
            </div>
            <Switch
              id="published-toggle"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border/60 bg-muted/20 shrink-0 flex flex-row items-center justify-end gap-2.5 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 sm:flex-none h-10 px-4 font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none h-10 px-5 sm:px-6 font-semibold"
          >
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Statistic"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
