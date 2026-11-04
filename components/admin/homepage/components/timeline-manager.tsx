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
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Clock,
  MapPin,
  GraduationCap,
  Stethoscope,
  Heart,
  Globe,
  BookOpen,
  Users,
  Star,
  Award,
  Building2,
  Leaf,
  Shield,
  type LucideIcon,
} from "lucide-react"
import type { HomepageTimelineSettings, TimelineMilestone } from "@/lib/types/homepage-settings"
import { ColorPicker } from "./color-picker"
import { cn } from "@/lib/utils"

interface TimelineManagerProps {
  timeline: HomepageTimelineSettings
  onChange: (timeline: HomepageTimelineSettings) => void
}

const TIMELINE_ICONS: Record<string, LucideIcon> = {
  MapPin,
  GraduationCap,
  Stethoscope,
  Heart,
  Globe,
  BookOpen,
  Users,
  Star,
  Award,
  Building2,
  Leaf,
  Shield,
}

const ICON_OPTIONS = [
  { value: "Star", label: "Star (Foundation Event)" },
  { value: "GraduationCap", label: "Graduation Cap (School/Education)" },
  { value: "Stethoscope", label: "Stethoscope (Health Program)" },
  { value: "Heart", label: "Heart (Community Outreach)" },
  { value: "Globe", label: "Globe (National Expansion)" },
  { value: "BookOpen", label: "Book (Research/Curriculum)" },
  { value: "Users", label: "Users (Volunteer Movement)" },
  { value: "Award", label: "Award (Honor/Recognition)" },
  { value: "Building2", label: "Building (Headquarters/Center)" },
  { value: "Leaf", label: "Leaf (Sustainability)" },
  { value: "Shield", label: "Shield (Advocacy/Rights)" },
  { value: "MapPin", label: "Map Pin (New District)" },
]

export default function TimelineManager({ timeline, onChange }: TimelineManagerProps) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const updateTimeline = (updates: Partial<HomepageTimelineSettings>) => {
    onChange({ ...timeline, ...updates })
  }

  const updateMilestones = (newMilestones: TimelineMilestone[]) => {
    updateTimeline({ milestones: newMilestones })
  }

  const parseColorToStyle = (colorClass: string, type: "gradient" | "solid") => {
    if (type === "gradient") {
      const colors = colorClass.match(/#[0-9A-Fa-f]{3,6}/g)
      if (colors && colors.length >= 2) {
        return {
          background: `linear-gradient(to bottom right, ${colors[0]}, ${colors[1]})`,
        }
      } else if (colors && colors.length === 1) {
        return { background: colors[0] }
      }
    } else {
      const match = colorClass.match(/#[0-9A-Fa-f]{3,6}/)
      if (match) {
        return { backgroundColor: match[0] }
      }
    }
    return {}
  }

  const addMilestone = () => {
    const newMilestone: TimelineMilestone = {
      id: `milestone-${Date.now()}`,
      year: new Date().getFullYear().toString(),
      milestone: "Key Growth Milestone",
      description: "Describe the pivotal development achieved during this stage...",
      icon: "Star",
      badgeClass: "from-[#3FABDE] to-[#2E8BC0]",
      yearClass: "bg-[#3FABDE]",
      order: (timeline.milestones || []).length + 1,
      visible: true,
    }
    updateMilestones([...(timeline.milestones || []), newMilestone])
  }

  const updateMilestone = (index: number, updates: Partial<TimelineMilestone>) => {
    const newMilestones = [...(timeline.milestones || [])]
    newMilestones[index] = { ...newMilestones[index], ...updates }
    updateMilestones(newMilestones)
  }

  const confirmDelete = () => {
    if (deleteIndex === null) return
    const newMilestones = (timeline.milestones || []).filter((_, i) => i !== deleteIndex)
    updateMilestones(newMilestones)
    setDeleteIndex(null)
  }

  const toggleVisibility = (index: number) => {
    updateMilestone(index, { visible: !timeline.milestones[index].visible })
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newMilestones = [...(timeline.milestones || [])]
    ;[newMilestones[index - 1], newMilestones[index]] = [newMilestones[index], newMilestones[index - 1]]
    updateMilestones(newMilestones)
  }

  const moveDown = (index: number) => {
    if (index === (timeline.milestones || []).length - 1) return
    const newMilestones = [...(timeline.milestones || [])]
    ;[newMilestones[index], newMilestones[index + 1]] = [newMilestones[index + 1], newMilestones[index]]
    updateMilestones(newMilestones)
  }

  return (
    <div className="space-y-6">
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Milestone Timeline Settings
          </CardTitle>
          <CardDescription className="text-xs">
            The chronological story of growth, partnerships, and impact across the years.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium">Timeline Section Title</Label>
              <Input
                value={timeline.title}
                onChange={(e) => updateTimeline({ title: e.target.value })}
                placeholder="Together, We Are Changing Lives"
                className="mt-1.5 h-9 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Section Subtitle</Label>
              <Textarea
                value={timeline.subtitle}
                onChange={(e) => updateTimeline({ subtitle: e.target.value })}
                rows={1}
                placeholder="Every year marked a new chapter of grassroots impact..."
                className="mt-1.5 text-sm resize-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Timeline Milestones</h4>
            <p className="text-xs text-muted-foreground">Order earliest to latest.</p>
          </div>
          <Button onClick={addMilestone} size="sm" className="h-9 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Milestone
          </Button>
        </div>

        {(timeline.milestones || []).map((milestone, index) => {
          const MilestoneIcon = TIMELINE_ICONS[milestone.icon] || Star

          return (
            <Card
              key={milestone.id || index}
              className={cn(
                "border border-border/80 shadow-sm transition-all",
                !milestone.visible && "opacity-60 bg-muted/30"
              )}
            >
              <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-card border">
                    {milestone.year || "Year"}
                  </span>
                  <span className="text-sm font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                    {milestone.milestone || "Untitled Milestone"}
                  </span>
                  {!milestone.visible && (
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
                    aria-label="Move milestone earlier"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveDown(index)}
                    disabled={index === (timeline.milestones || []).length - 1}
                    className="h-8 w-8 p-0"
                    aria-label="Move milestone later"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleVisibility(index)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    aria-label={milestone.visible ? "Hide milestone" : "Show milestone"}
                  >
                    {milestone.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteIndex(index)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    aria-label="Delete milestone"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-medium">Year / Date Span</Label>
                    <Input
                      value={milestone.year}
                      onChange={(e) => updateMilestone(index, { year: e.target.value })}
                      placeholder="e.g. 2024"
                      className="mt-1.5 h-9 font-mono tabular-nums text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs font-medium">Milestone Headline</Label>
                    <Input
                      value={milestone.milestone}
                      onChange={(e) => updateMilestone(index, { milestone: e.target.value })}
                      placeholder="e.g. 100 Classrooms Equipped with Sensory Tech"
                      className="mt-1.5 h-9 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-medium">Narrative Summary</Label>
                  <Textarea
                    value={milestone.description}
                    onChange={(e) => updateMilestone(index, { description: e.target.value })}
                    rows={2}
                    placeholder="Context on partnerships, student beneficiaries, or operational expansion..."
                    className="mt-1.5 text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-medium">Milestone Icon</Label>
                    <div className="mt-1.5">
                      <FancySelect
                        value={milestone.icon}
                        onValueChange={(val) => updateMilestone(index, { icon: val })}
                        options={ICON_OPTIONS}
                        size="sm"
                      />
                    </div>
                  </div>

                  <div>
                    <ColorPicker
                      label="Icon Badge Gradient"
                      value={milestone.badgeClass}
                      onChange={(value) => updateMilestone(index, { badgeClass: value })}
                      type="gradient"
                      helpText="Pill background gradient"
                    />
                  </div>

                  <div>
                    <ColorPicker
                      label="Year Badge Color"
                      value={milestone.yearClass}
                      onChange={(value) => updateMilestone(index, { yearClass: value })}
                      type="solid"
                      helpText="Year pill accent color"
                    />
                  </div>
                </div>

                {/* Milestone Preview */}
                <div className="p-4 rounded-xl border border-border/60 bg-muted/20 flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                    style={parseColorToStyle(milestone.badgeClass, "gradient")}
                  >
                    <MilestoneIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="inline-flex items-center rounded-full text-white text-[10px] font-bold px-2 py-0.5 font-mono"
                        style={parseColorToStyle(milestone.yearClass, "solid")}
                      >
                        {milestone.year}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-foreground">{milestone.milestone}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{milestone.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {(timeline.milestones || []).length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-2xl bg-muted/20">
            <Clock className="w-10 h-10 mx-auto text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium text-foreground">No timeline milestones defined</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Add your foundation&apos;s growth journey across key operational years.
            </p>
            <Button onClick={addMilestone} size="sm" variant="outline">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add First Milestone
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Milestone?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &ldquo;{deleteIndex !== null ? timeline.milestones[deleteIndex]?.milestone : ""}&rdquo;?
              This milestone will no longer appear on the public homepage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Milestone
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
