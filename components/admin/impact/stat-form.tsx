"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FancySelect } from "@/components/ui/fancy-select"
import { Loader2, AlertCircle, Home, BarChart3, Check } from "lucide-react"
import { createImpactStat, updateImpactStat } from "@/lib/actions/admin-stats"
import {
  STAT_ICONS,
  BRAND_COLORS,
  getColorTokens,
  getStatIcon,
} from "./stat-config"
import type { ImpactStat } from "@/lib/types/admin"
import { cn } from "@/lib/utils"
import styles from "./stats.module.css"

interface StatFormProps {
  stat?: ImpactStat
}

export function StatForm({ stat }: StatFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [label, setLabel] = useState(stat?.label || "")
  const [value, setValue] = useState(stat?.value || "")
  const [category, setCategory] = useState<string>(stat?.category || "home")
  const [icon, setIcon] = useState(stat?.icon || "heart")
  const [color, setColor] = useState(stat?.color || "#3FABDE")
  const [progress, setProgress] = useState<number | string>(stat?.progress ?? "")
  const router = useRouter()

  const IconComp = getStatIcon(icon)
  const colorTokens = getColorTokens(color)

  const iconSelectOptions = STAT_ICONS.map((i) => ({
    value: i.key,
    label: i.label,
  }))

  const colorSelectOptions = BRAND_COLORS.map((c) => ({
    value: c.hex,
    label: `${c.name} (${c.hex})`,
  }))

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    formData.set("label", label)
    formData.set("value", value)
    formData.set("category", category)
    formData.set("icon", icon)
    formData.set("color", color)

    const result = stat
      ? await updateImpactStat(stat.id, formData)
      : await createImpactStat(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      router.push("/admin/stats")
      router.refresh()
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="label">Label *</Label>
                  <Input
                    id="label"
                    name="label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g., Lives Impacted"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Value *</Label>
                  <Input
                    id="value"
                    name="value"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="e.g., 10,000+ or 847+"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Display Scope / Category *</Label>
                  <FancySelect
                    value={category}
                    onValueChange={setCategory}
                    placeholder="Select category"
                    options={[
                      { value: "home", label: "Homepage Hero & Trust Rail" },
                      { value: "impact", label: "Impact Breakdown Page" },
                    ]}
                    size="sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="progress">Progress Percentage (Optional 0-100)</Label>
                  <Input
                    id="progress"
                    name="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(e.target.value)}
                    placeholder="e.g., 85"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance & Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <FancySelect
                    value={icon}
                    onValueChange={setIcon}
                    placeholder="Select icon"
                    options={iconSelectOptions}
                    size="sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <FancySelect
                    value={color}
                    onValueChange={setColor}
                    placeholder="Select color"
                    options={colorSelectOptions}
                    size="sm"
                  />
                </div>
              </div>

              {/* Color swatches */}
              <div className="pt-2">
                <Label className="text-xs text-muted-foreground mb-2 block">Quick Color Swatches</Label>
                <div className="flex flex-wrap items-center gap-2">
                  {BRAND_COLORS.map((c) => {
                    const isSelected = color.toLowerCase() === c.hex.toLowerCase()
                    return (
                      <button
                        key={c.hex}
                        type="button"
                        title={c.name}
                        onClick={() => setColor(c.hex)}
                        className={cn(
                          "size-7 rounded-full flex items-center justify-center transition-all",
                          isSelected ? "ring-2 ring-foreground scale-110" : "hover:scale-105 opacity-90"
                        )}
                        style={{ backgroundColor: c.hex }}
                      >
                        {isSelected && <Check className="size-3.5 text-white drop-shadow" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublished">Show on Website</Label>
                <Switch
                  id="isPublished"
                  name="isPublished"
                  defaultChecked={stat?.is_published ?? true}
                  value="true"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                When enabled, this statistic will be visible to public visitors.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Card Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-5 rounded-xl border border-border/70 bg-card shadow-xs flex flex-col gap-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(styles.iconCanvas, "size-12 border")}
                      style={{
                        backgroundColor: colorTokens.bgTint,
                        borderColor: colorTokens.borderTint,
                      }}
                    >
                      <IconComp className="size-6" style={{ color }} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold tracking-tight tabular-nums" style={{ color }}>
                        {value || "10,000+"}
                      </h4>
                      <p className="text-sm font-medium text-foreground">
                        {label || "Lives Impacted"}
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

                {progress !== "" && !isNaN(Number(progress)) && (
                  <div className="pt-2 border-t border-border/40 space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground font-medium">
                      <span>Progress</span>
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
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 font-semibold" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {stat ? "Save Changes" : "Add Statistic"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
