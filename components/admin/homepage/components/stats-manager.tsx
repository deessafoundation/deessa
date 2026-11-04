"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, Trash2, ChevronUp, ChevronDown, Star, BarChart3, GripVertical } from "lucide-react"
import type { HomepageStatsSettings, HomepageStat } from "@/lib/types/homepage-settings"
import { cn } from "@/lib/utils"

interface StatsManagerProps {
  stats: HomepageStatsSettings
  onChange: (stats: HomepageStatsSettings) => void
}

export default function StatsManager({ stats, onChange }: StatsManagerProps) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const addStat = () => {
    const newStat: HomepageStat = {
      value: 0,
      suffix: "+",
      label: "New Stat",
      sublabel: "",
      order: stats.stats.length + 1,
      highlight: false,
    }
    onChange({ stats: [...stats.stats, newStat] })
  }

  const updateStat = (index: number, updates: Partial<HomepageStat>) => {
    const newStats = [...stats.stats]
    newStats[index] = { ...newStats[index], ...updates }
    onChange({ stats: newStats })
  }

  const confirmDelete = () => {
    if (deleteIndex === null) return
    const newStats = stats.stats.filter((_, i) => i !== deleteIndex)
    onChange({ stats: newStats })
    setDeleteIndex(null)
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newStats = [...stats.stats]
    ;[newStats[index - 1], newStats[index]] = [newStats[index], newStats[index - 1]]
    onChange({ stats: newStats })
  }

  const moveDown = (index: number) => {
    if (index === stats.stats.length - 1) return
    const newStats = [...stats.stats]
    ;[newStats[index], newStats[index + 1]] = [newStats[index + 1], newStats[index]]
    onChange({ stats: newStats })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border/70">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Homepage Impact Statistics
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Key metric counters displayed in two rows of 4 on the live website.
          </p>
        </div>
        <Button onClick={addStat} size="sm" className="h-9 self-start sm:self-auto text-xs font-medium">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Metric
        </Button>
      </div>

      <div className="space-y-4">
        {stats.stats.map((stat, index) => (
          <Card key={index} className="overflow-hidden border border-border/80 shadow-sm transition-all hover:border-border">
            <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-6 h-6 rounded-md bg-muted text-xs font-mono font-semibold text-muted-foreground">
                  #{index + 1}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {stat.label || "Untitled Metric"}
                </span>
                {stat.highlight && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/50">
                    Highlighted
                  </span>
                )}
              </div>

              {/* Card Actions: Reorder & Delete */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="h-8 w-8 p-0"
                  aria-label="Move stat up"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => moveDown(index)}
                  disabled={index === stats.stats.length - 1}
                  className="h-8 w-8 p-0"
                  aria-label="Move stat down"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteIndex(index)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  aria-label="Delete stat"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor={`stat-value-${index}`} className="text-xs font-medium">Numeric Value</Label>
                  <Input
                    id={`stat-value-${index}`}
                    type="number"
                    value={stat.value === 0 ? "0" : stat.value}
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : Number(e.target.value)
                      updateStat(index, { value: isNaN(val) ? 0 : val })
                    }}
                    className="mt-1.5 h-9 font-mono tabular-nums text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor={`stat-suffix-${index}`} className="text-xs font-medium">Suffix / Symbol</Label>
                  <Input
                    id={`stat-suffix-${index}`}
                    value={stat.suffix || ""}
                    onChange={(e) => updateStat(index, { suffix: e.target.value })}
                    placeholder="e.g. +, %, k"
                    className="mt-1.5 h-9 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor={`stat-label-${index}`} className="text-xs font-medium">Primary Label</Label>
                  <Input
                    id={`stat-label-${index}`}
                    value={stat.label}
                    onChange={(e) => updateStat(index, { label: e.target.value })}
                    placeholder="e.g. Children Reached"
                    className="mt-1.5 h-9 text-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <Label htmlFor={`stat-sublabel-${index}`} className="text-xs font-medium">Sublabel (optional)</Label>
                  <Input
                    id={`stat-sublabel-${index}`}
                    value={stat.sublabel || ""}
                    onChange={(e) => updateStat(index, { sublabel: e.target.value })}
                    placeholder="e.g. Across 12 rural districts in Nepal"
                    className="mt-1.5 h-9 text-sm"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant={stat.highlight ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateStat(index, { highlight: !stat.highlight })}
                    className="w-full h-9 text-xs"
                  >
                    <Star className={cn("w-3.5 h-3.5 mr-1.5", stat.highlight ? "fill-current" : "")} />
                    {stat.highlight ? "Featured Accent" : "Feature Stat"}
                  </Button>
                </div>
              </div>

              {/* Live Preview Pill */}
              <div className="rounded-xl border border-border/60 bg-muted/40 p-3 sm:p-4 text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono tabular-nums tracking-tight">
                  {(stat.value || 0).toLocaleString()}
                  <span className="text-primary ml-0.5">{stat.suffix}</span>
                </p>
                <p className="text-xs sm:text-sm font-semibold text-foreground mt-0.5">
                  {stat.label || "Metric Label"}
                </p>
                {stat.sublabel && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">{stat.sublabel}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {stats.stats.length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-2xl bg-muted/20">
            <BarChart3 className="w-10 h-10 mx-auto text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-foreground">No impact statistics defined</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Add metric numbers that highlight your organization&apos;s reach on the homepage.
            </p>
            <Button onClick={addStat} size="sm" variant="outline">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add First Metric
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Impact Metric?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &ldquo;{deleteIndex !== null ? stats.stats[deleteIndex]?.label : ""}&rdquo;?
              This stat will no longer appear on the public homepage once saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Metric
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
