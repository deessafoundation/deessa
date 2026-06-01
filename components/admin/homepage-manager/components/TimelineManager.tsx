"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, GripVertical, Eye, EyeOff } from "lucide-react"
import type { HomepageTimelineSettings, TimelineMilestone } from "@/lib/types/homepage-settings"
import { ColorPicker } from "./ColorPicker"

interface TimelineManagerProps {
  timeline: HomepageTimelineSettings
  onChange: (timeline: HomepageTimelineSettings) => void
}

export default function TimelineManager({ timeline, onChange }: TimelineManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const updateTimeline = (updates: Partial<HomepageTimelineSettings>) => {
    onChange({ ...timeline, ...updates })
  }

  const updateMilestones = (newMilestones: TimelineMilestone[]) => {
    updateTimeline({ milestones: newMilestones })
  }

  // Helper function to parse color classes and convert to inline styles
  const parseColorToStyle = (colorClass: string, type: 'gradient' | 'solid') => {
    if (type === 'gradient') {
      // Parse gradient: from-[#color] to-[#color] or from-#color to-#color
      const fromMatch = colorClass.match(/#[0-9A-Fa-f]{3,6}/)
      const colors = colorClass.match(/#[0-9A-Fa-f]{3,6}/g)
      
      if (colors && colors.length >= 2) {
        return {
          background: `linear-gradient(to bottom right, ${colors[0]}, ${colors[1]})`
        }
      } else if (fromMatch) {
        // Single color gradient (fallback)
        return {
          background: fromMatch[0]
        }
      }
    } else {
      // Parse solid: bg-[#color] or bg-#color
      const match = colorClass.match(/#[0-9A-Fa-f]{3,6}/)
      if (match) {
        return {
          backgroundColor: match[0]
        }
      }
    }
    
    // Fallback to class-based styling
    return {}
  }

  const addMilestone = () => {
    const newMilestone: TimelineMilestone = {
      id: `milestone-${Date.now()}`,
      year: new Date().getFullYear().toString(),
      milestone: 'New Milestone',
      description: 'Add description here...',
      icon: 'Star',
      badgeClass: 'from-[#3FABDE] to-[#2E8BC0]',
      yearClass: 'bg-[#3FABDE]',
      order: timeline.milestones.length + 1,
      visible: true,
    }
    updateMilestones([...timeline.milestones, newMilestone])
  }

  const updateMilestone = (index: number, updates: Partial<TimelineMilestone>) => {
    const newMilestones = [...timeline.milestones]
    newMilestones[index] = { ...newMilestones[index], ...updates }
    updateMilestones(newMilestones)
  }

  const deleteMilestone = (index: number) => {
    const newMilestones = timeline.milestones.filter((_, i) => i !== index)
    updateMilestones(newMilestones)
  }

  const toggleVisibility = (index: number) => {
    updateMilestone(index, { visible: !timeline.milestones[index].visible })
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newMilestones = [...timeline.milestones]
    const draggedItem = newMilestones[draggedIndex]
    newMilestones.splice(draggedIndex, 1)
    newMilestones.splice(index, 0, draggedItem)

    // Update order
    newMilestones.forEach((item, i) => {
      item.order = i + 1
    })

    updateMilestones(newMilestones)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const iconOptions = [
    'MapPin', 'GraduationCap', 'Stethoscope', 'Heart', 'Globe', 'BookOpen',
    'Users', 'Star', 'Award', 'Building2', 'Leaf', 'Shield'
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Timeline Settings</CardTitle>
          <CardDescription>
            Manage the timeline section showing your organization's journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Section Headers */}
          <div className="space-y-4">
            <div>
              <Label>Section Title</Label>
              <Input
                value={timeline.title}
                onChange={(e) => updateTimeline({ title: e.target.value })}
                placeholder="Together, We Are Changing Lives"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Section Subtitle</Label>
              <Textarea
                value={timeline.subtitle}
                onChange={(e) => updateTimeline({ subtitle: e.target.value })}
                placeholder="Every year added a new layer of impact..."
                rows={2}
                className="mt-1"
              />
            </div>
          </div>

          {/* Add Milestone Button */}
          <Button onClick={addMilestone} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add New Milestone
          </Button>

          {/* Milestones List */}
          <div className="space-y-4">
            {timeline.milestones.map((milestone, index) => (
              <Card
                key={milestone.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`${!milestone.visible ? 'opacity-50' : ''} ${draggedIndex === index ? 'opacity-50' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                      <CardTitle className="text-base">{milestone.year} - {milestone.milestone}</CardTitle>
                      {!milestone.visible && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Hidden</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVisibility(index)}
                        title={milestone.visible ? 'Hide' : 'Show'}
                      >
                        {milestone.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMilestone(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Year and Milestone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Year</Label>
                      <Input
                        value={milestone.year}
                        onChange={(e) => updateMilestone(index, { year: e.target.value })}
                        placeholder="2024"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Milestone Title</Label>
                      <Input
                        value={milestone.milestone}
                        onChange={(e) => updateMilestone(index, { milestone: e.target.value })}
                        placeholder="Major achievement"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, { description: e.target.value })}
                      placeholder="Describe what happened this year..."
                      rows={2}
                      className="mt-1"
                    />
                  </div>

                  {/* Icon */}
                  <div>
                    <Label>Icon</Label>
                    <select
                      value={milestone.icon}
                      onChange={(e) => updateMilestone(index, { icon: e.target.value })}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {iconOptions.map((icon) => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Icon displayed with the milestone</p>
                  </div>

                  {/* Badge and Year Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <ColorPicker
                      label="Badge Gradient"
                      value={milestone.badgeClass}
                      onChange={(value) => updateMilestone(index, { badgeClass: value })}
                      type="gradient"
                      helpText="Icon badge background gradient"
                    />
                    <ColorPicker
                      label="Year Badge Color"
                      value={milestone.yearClass}
                      onChange={(value) => updateMilestone(index, { yearClass: value })}
                      type="solid"
                      helpText="Year badge background color"
                    />
                  </div>

                  {/* Preview */}
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg"
                        style={parseColorToStyle(milestone.badgeClass, 'gradient')}
                      >
                        <span className="text-xs font-bold">{milestone.icon.slice(0, 2)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span 
                            className="inline-flex items-center rounded-full text-white text-xs font-black px-3 py-1"
                            style={parseColorToStyle(milestone.yearClass, 'solid')}
                          >
                            {milestone.year}
                          </span>
                        </div>
                        <h4 className="text-lg font-black text-gray-800 mb-1">{milestone.milestone}</h4>
                        <p className="text-sm text-gray-600">{milestone.description}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {timeline.milestones.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No milestones added yet. Click "Add New Milestone" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>💡 Tips:</strong>
          </p>
          <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
            <li>Order milestones chronologically (earliest first)</li>
            <li>Use consistent color schemes for visual harmony</li>
            <li>Keep descriptions concise (1-2 sentences)</li>
            <li>Choose icons that represent the milestone type</li>
            <li>Recommended: 5-8 milestones for optimal display</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
