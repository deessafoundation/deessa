"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { FancySelect } from "@/components/ui/fancy-select"
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
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Target,
  Megaphone,
  BookOpen,
  FileText,
  Scale,
  GraduationCap,
  Stethoscope,
  Shield,
  Home as HomeIcon,
  Heart,
  Globe,
  Users,
  Award,
  Building2,
  Star,
  type LucideIcon,
} from "lucide-react"
import type { HomepageWhatWeDoSettings, WhatWeDoPillar } from "@/lib/types/homepage-settings"
import { cn } from "@/lib/utils"

interface WhatWeDoManagerProps {
  whatWeDo: HomepageWhatWeDoSettings
  onChange: (whatWeDo: HomepageWhatWeDoSettings) => void
}

const ICON_MAP: Record<string, LucideIcon> = {
  Megaphone,
  BookOpen,
  FileText,
  Scale,
  GraduationCap,
  Stethoscope,
  Shield,
  HomeIcon,
  Heart,
  Globe,
  Users,
  Award,
  Building2,
  Star,
}

const ICON_OPTIONS = [
  { value: "Megaphone", label: "Megaphone (Advocacy)" },
  { value: "BookOpen", label: "Open Book (Education)" },
  { value: "FileText", label: "Document (Research)" },
  { value: "Scale", label: "Scale (Justice/Rights)" },
  { value: "GraduationCap", label: "Graduation Cap (Training)" },
  { value: "Stethoscope", label: "Stethoscope (Health)" },
  { value: "Shield", label: "Shield (Protection)" },
  { value: "HomeIcon", label: "Home (Shelter/Inclusion)" },
  { value: "Heart", label: "Heart (Care & Compassion)" },
  { value: "Globe", label: "Globe (Global/Environment)" },
  { value: "Users", label: "Community / Users" },
  { value: "Award", label: "Award (Excellence)" },
  { value: "Building2", label: "Building (Infrastructure)" },
  { value: "Star", label: "Star (Special Program)" },
]

const COLOR_OPTIONS = [
  { value: "bg-blue-500", glow: "hover-glow-blue", label: "Royal Blue" },
  { value: "bg-emerald-500", glow: "hover-glow-green", label: "Emerald Green" },
  { value: "bg-amber-500", glow: "hover-glow-orange", label: "Warm Amber" },
  { value: "bg-purple-500", glow: "hover-glow-purple", label: "Violet Purple" },
]

export default function WhatWeDoManager({ whatWeDo, onChange }: WhatWeDoManagerProps) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const update = (updates: Partial<HomepageWhatWeDoSettings>) => {
    onChange({ ...whatWeDo, ...updates })
  }

  const updatePillars = (pillars: WhatWeDoPillar[]) => {
    update({ pillars })
  }

  const updatePillar = (index: number, updates: Partial<WhatWeDoPillar>) => {
    const pillars = [...whatWeDo.pillars]
    pillars[index] = { ...pillars[index], ...updates }
    updatePillars(pillars)
  }

  const addPillar = () => {
    const newPillar: WhatWeDoPillar = {
      id: `pillar-${Date.now()}`,
      icon: "Star",
      title: "New Impact Pillar",
      description: "Describe the objectives and community reach of this operational pillar...",
      color: "bg-blue-500",
      glowClass: "hover-glow-blue",
      statLabel: "Target Beneficiaries",
      statEnd: 500,
      order: whatWeDo.pillars.length + 1,
      visible: true,
    }
    updatePillars([...whatWeDo.pillars, newPillar])
  }

  const confirmDelete = () => {
    if (deleteIndex === null) return
    updatePillars(whatWeDo.pillars.filter((_, i) => i !== deleteIndex))
    setDeleteIndex(null)
  }

  const toggleVisibility = (index: number) => {
    updatePillar(index, { visible: !whatWeDo.pillars[index].visible })
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newPillars = [...whatWeDo.pillars]
    ;[newPillars[index - 1], newPillars[index]] = [newPillars[index], newPillars[index - 1]]
    updatePillars(newPillars)
  }

  const moveDown = (index: number) => {
    if (index === whatWeDo.pillars.length - 1) return
    const newPillars = [...whatWeDo.pillars]
    ;[newPillars[index], newPillars[index + 1]] = [newPillars[index + 1], newPillars[index]]
    updatePillars(newPillars)
  }

  return (
    <div className="space-y-6">
      {/* Section Header Configuration */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            What We Do (Core Pillars Section)
          </CardTitle>
          <CardDescription className="text-xs">
            The strategic pillars displayed prominently on the homepage to introduce key areas of operation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs font-medium">Eyebrow Badge</Label>
              <Input
                value={whatWeDo.eyebrow}
                onChange={(e) => update({ eyebrow: e.target.value })}
                placeholder="What We Do"
                className="mt-1.5 h-9 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-medium">Section Heading</Label>
              <Input
                value={whatWeDo.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Our Strategic Pillars"
                className="mt-1.5 h-9 text-sm"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium">Section Subtitle</Label>
            <Textarea
              value={whatWeDo.subtitle}
              onChange={(e) => update({ subtitle: e.target.value })}
              rows={2}
              placeholder="Contextual subtitle explaining your comprehensive approach..."
              className="mt-1.5 text-sm resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pillars List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Operational Pillars</h4>
            <p className="text-xs text-muted-foreground">Four pillars are displayed in the homepage grid.</p>
          </div>
          <Button onClick={addPillar} size="sm" className="h-9 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Pillar
          </Button>
        </div>

        {whatWeDo.pillars.map((pillar, index) => {
          const PillarIcon = ICON_MAP[pillar.icon] || Star
          return (
            <Card
              key={pillar.id || index}
              className={cn(
                "border border-border/80 shadow-sm transition-all",
                !pillar.visible && "opacity-60 bg-muted/30"
              )}
            >
              <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-card border text-primary">
                    <PillarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-foreground">
                      {pillar.title || "Untitled Pillar"}
                    </span>
                    {!pillar.visible && (
                      <span className="ml-2 text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="h-8 w-8 p-0"
                    aria-label="Move pillar up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveDown(index)}
                    disabled={index === whatWeDo.pillars.length - 1}
                    className="h-8 w-8 p-0"
                    aria-label="Move pillar down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleVisibility(index)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    aria-label={pillar.visible ? "Hide pillar" : "Show pillar"}
                  >
                    {pillar.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteIndex(index)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    aria-label="Delete pillar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <Label className="text-xs font-medium">Pillar Title</Label>
                    <Input
                      value={pillar.title}
                      onChange={(e) => updatePillar(index, { title: e.target.value })}
                      placeholder="e.g. Inclusive Education"
                      className="mt-1.5 h-9 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Icon Symbol</Label>
                    <div className="mt-1.5">
                      <FancySelect
                        value={pillar.icon}
                        onValueChange={(val) => updatePillar(index, { icon: val })}
                        options={ICON_OPTIONS}
                        size="sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium">Accent Color</Label>
                    <div className="mt-1.5">
                      <FancySelect
                        value={pillar.color}
                        onValueChange={(val) => {
                          const opt = COLOR_OPTIONS.find((c) => c.value === val)
                          updatePillar(index, { color: val, glowClass: opt?.glow || pillar.glowClass })
                        }}
                        options={COLOR_OPTIONS.map((c) => ({ value: c.value, label: c.label }))}
                        size="sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-4">
                    <Label className="text-xs font-medium">Pillar Narrative</Label>
                    <Textarea
                      value={pillar.description}
                      onChange={(e) => updatePillar(index, { description: e.target.value })}
                      rows={2}
                      placeholder="Describe what the foundation delivers under this pillar..."
                      className="mt-1.5 text-sm resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs font-medium">Impact Stat End Number</Label>
                    <Input
                      type="number"
                      value={pillar.statEnd === 0 ? "0" : pillar.statEnd}
                      onChange={(e) => {
                        const val = e.target.value === "" ? 0 : Number(e.target.value)
                        updatePillar(index, { statEnd: isNaN(val) ? 0 : val })
                      }}
                      className="mt-1.5 h-9 font-mono tabular-nums text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs font-medium">Impact Stat Description</Label>
                    <Input
                      value={pillar.statLabel}
                      onChange={(e) => updatePillar(index, { statLabel: e.target.value })}
                      placeholder="e.g. Children Enrolled"
                      className="mt-1.5 h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Live Pillar Card Preview */}
                <div className="rounded-xl border border-border/60 bg-muted/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-card border shadow-sm text-primary">
                      <PillarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{pillar.title || "Pillar Headline"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 max-w-md line-clamp-2">
                        {pillar.description || "Pillar summary text..."}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 border-t sm:border-t-0 sm:border-l border-border/60 pt-2 sm:pt-0 sm:pl-4">
                    <p className="text-xl font-extrabold text-foreground font-mono tabular-nums">
                      {(pillar.statEnd || 0).toLocaleString()}+
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground">{pillar.statLabel || "Metric"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {whatWeDo.pillars.length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-2xl bg-muted/20">
            <Target className="w-10 h-10 mx-auto text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-foreground">No pillars defined</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Add your foundation&apos;s key pillars to introduce core activities.
            </p>
            <Button onClick={addPillar} size="sm" variant="outline">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add First Pillar
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Impact Pillar?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &ldquo;{deleteIndex !== null ? whatWeDo.pillars[deleteIndex]?.title : ""}&rdquo;?
              This pillar will disappear from the homepage layout upon saving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Pillar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
