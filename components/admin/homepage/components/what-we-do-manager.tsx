"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Eye, EyeOff, GripVertical } from "lucide-react"
import type { HomepageWhatWeDoSettings, WhatWeDoPillar } from "@/lib/types/homepage-settings"

interface WhatWeDoManagerProps {
  whatWeDo: HomepageWhatWeDoSettings
  onChange: (whatWeDo: HomepageWhatWeDoSettings) => void
}

const ICON_OPTIONS = [
  "Megaphone", "BookOpen", "FileText", "Scale", "GraduationCap", "Stethoscope",
  "Shield", "HomeIcon", "Heart", "Globe", "Users", "Award", "Building2", "Star",
]

const COLOR_OPTIONS = [
  { value: "bg-blue-500", glow: "hover-glow-blue", label: "Blue" },
  { value: "bg-green-500", glow: "hover-glow-green", label: "Green" },
  { value: "bg-orange-500", glow: "hover-glow-orange", label: "Orange" },
  { value: "bg-purple-500", glow: "hover-glow-purple", label: "Purple" },
]

export default function WhatWeDoManager({ whatWeDo, onChange }: WhatWeDoManagerProps) {
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
      title: "New Pillar",
      description: "Describe this area of work...",
      color: "bg-blue-500",
      glowClass: "hover-glow-blue",
      statLabel: "Impact",
      statEnd: 100,
      order: whatWeDo.pillars.length + 1,
      visible: true,
    }
    updatePillars([...whatWeDo.pillars, newPillar])
  }

  const deletePillar = (index: number) => {
    updatePillars(whatWeDo.pillars.filter((_, i) => i !== index))
  }

  const toggleVisibility = (index: number) => {
    updatePillar(index, { visible: !whatWeDo.pillars[index].visible })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>What We Do Section</CardTitle>
          <CardDescription>
            The "Core Pillars" section on the homepage, showing the four areas of work.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Eyebrow Label</Label>
            <Input
              value={whatWeDo.eyebrow}
              onChange={(e) => update({ eyebrow: e.target.value })}
              placeholder="What We Do"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Section Title</Label>
            <Textarea
              value={whatWeDo.title}
              onChange={(e) => update({ title: e.target.value })}
              rows={2}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Section Subtitle</Label>
            <Textarea
              value={whatWeDo.subtitle}
              onChange={(e) => update({ subtitle: e.target.value })}
              rows={2}
              className="mt-1"
            />
          </div>

          <Button onClick={addPillar} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add New Pillar
          </Button>

          <div className="space-y-4">
            {whatWeDo.pillars.map((pillar, index) => (
              <Card key={pillar.id} className={!pillar.visible ? "opacity-50" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-5 h-5 text-gray-400" />
                      <CardTitle className="text-base">{pillar.title}</CardTitle>
                      {!pillar.visible && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Hidden</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVisibility(index)}
                        title={pillar.visible ? "Hide" : "Show"}
                      >
                        {pillar.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePillar(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={pillar.title}
                      onChange={(e) => updatePillar(index, { title: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={pillar.description}
                      onChange={(e) => updatePillar(index, { description: e.target.value })}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Icon</Label>
                      <select
                        value={pillar.icon}
                        onChange={(e) => updatePillar(index, { icon: e.target.value })}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {ICON_OPTIONS.map((icon) => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Color</Label>
                      <select
                        value={pillar.color}
                        onChange={(e) => {
                          const opt = COLOR_OPTIONS.find((c) => c.value === e.target.value)
                          updatePillar(index, { color: e.target.value, glowClass: opt?.glow || pillar.glowClass })
                        }}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {COLOR_OPTIONS.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Stat Number</Label>
                      <Input
                        type="number"
                        value={pillar.statEnd}
                        onChange={(e) => updatePillar(index, { statEnd: Number(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Stat Label</Label>
                      <Input
                        value={pillar.statLabel}
                        onChange={(e) => updatePillar(index, { statLabel: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {whatWeDo.pillars.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No pillars added yet. Click "Add New Pillar" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
