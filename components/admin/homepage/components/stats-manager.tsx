"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, GripVertical, Star } from "lucide-react"
import type { HomepageStatsSettings, HomepageStat } from "@/lib/types/homepage-settings"

interface StatsManagerProps {
  stats: HomepageStatsSettings
  onChange: (stats: HomepageStatsSettings) => void
}

export default function StatsManager({ stats, onChange }: StatsManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

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

  const deleteStat = (index: number) => {
    const newStats = stats.stats.filter((_, i) => i !== index)
    onChange({ stats: newStats })
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
      <Card>
        <CardHeader>
          <CardTitle>Stats Section</CardTitle>
          <CardDescription>
            Manage the statistics displayed on the homepage. These appear in two rows of 4 stats each.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.stats.map((stat, index) => (
              <Card key={index} className="relative">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Drag Handle */}
                    <div className="flex flex-col gap-1 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="h-6 w-6 p-0"
                      >
                        ↑
                      </Button>
                      <GripVertical className="w-5 h-5 text-gray-400" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveDown(index)}
                        disabled={index === stats.stats.length - 1}
                        className="h-6 w-6 p-0"
                      >
                        ↓
                      </Button>
                    </div>

                    {/* Form Fields */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`stat-value-${index}`}>Value</Label>
                        <Input
                          id={`stat-value-${index}`}
                          type="number"
                          value={stat.value}
                          onChange={(e) => updateStat(index, { value: parseInt(e.target.value) || 0 })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`stat-suffix-${index}`}>Suffix</Label>
                        <Input
                          id={`stat-suffix-${index}`}
                          value={stat.suffix || ""}
                          onChange={(e) => updateStat(index, { suffix: e.target.value })}
                          placeholder="e.g., +"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`stat-label-${index}`}>Label</Label>
                        <Input
                          id={`stat-label-${index}`}
                          value={stat.label}
                          onChange={(e) => updateStat(index, { label: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`stat-sublabel-${index}`}>Sublabel (optional)</Label>
                        <Input
                          id={`stat-sublabel-${index}`}
                          value={stat.sublabel || ""}
                          onChange={(e) => updateStat(index, { sublabel: e.target.value })}
                          placeholder="e.g., Across Nepal"
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <Button
                          variant={stat.highlight ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateStat(index, { highlight: !stat.highlight })}
                          className="flex-1"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          {stat.highlight ? "Highlighted" : "Highlight"}
                        </Button>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteStat(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Preview */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-blue-600">
                      {stat.value.toLocaleString()}{stat.suffix}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{stat.label}</p>
                    {stat.sublabel && (
                      <p className="text-xs text-gray-600">{stat.sublabel}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button onClick={addStat} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Stat
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>💡 Tip:</strong> Stats are displayed in two rows of 4. The first 4 stats appear in the top row,
            and the next 4 in the bottom row. Use the arrows to reorder them.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
