"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FancySelect } from "@/components/ui/fancy-select"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, GripVertical } from "lucide-react"
import type { HomepageHeroCTAsSettings, HomepageHeroCTA } from "@/lib/types/homepage-settings"

interface HeroCTAsManagerProps {
  heroCTAs: HomepageHeroCTAsSettings
  onChange: (heroCTAs: HomepageHeroCTAsSettings) => void
}

export default function HeroCTAsManager({ heroCTAs, onChange }: HeroCTAsManagerProps) {
  const addCTA = () => {
    const newCTA: HomepageHeroCTA = {
      id: `cta-${Date.now()}`,
      label: "New Button",
      url: "/",
      variant: "primary",
      icon: "arrow-right",
      order: heroCTAs.ctas.length + 1,
      visible: true,
    }
    onChange({ ctas: [...heroCTAs.ctas, newCTA] })
  }

  const updateCTA = (index: number, updates: Partial<HomepageHeroCTA>) => {
    const newCTAs = [...heroCTAs.ctas]
    newCTAs[index] = { ...newCTAs[index], ...updates }
    onChange({ ctas: newCTAs })
  }

  const deleteCTA = (index: number) => {
    const newCTAs = heroCTAs.ctas.filter((_, i) => i !== index)
    onChange({ ctas: newCTAs })
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newCTAs = [...heroCTAs.ctas]
    ;[newCTAs[index - 1], newCTAs[index]] = [newCTAs[index], newCTAs[index - 1]]
    onChange({ ctas: newCTAs })
  }

  const moveDown = (index: number) => {
    if (index === heroCTAs.ctas.length - 1) return
    const newCTAs = [...heroCTAs.ctas]
    ;[newCTAs[index], newCTAs[index + 1]] = [newCTAs[index + 1], newCTAs[index]]
    onChange({ ctas: newCTAs })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero CTAs</CardTitle>
          <CardDescription>
            Manage call-to-action buttons displayed in the hero section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {heroCTAs.ctas.map((cta, index) => (
            <Card key={cta.id}>
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
                      disabled={index === heroCTAs.ctas.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      ↓
                    </Button>
                  </div>

                  {/* Form Fields */}
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Button Label</Label>
                        <Input
                          value={cta.label}
                          onChange={(e) => updateCTA(index, { label: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>URL</Label>
                        <Input
                          value={cta.url}
                          onChange={(e) => updateCTA(index, { url: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Variant</Label>
                        <FancySelect
                          value={cta.variant}
                          onValueChange={(value) => updateCTA(index, { variant: value as any })}
                          options={[
                            { value: "primary", label: "Primary" },
                            { value: "secondary", label: "Secondary" },
                            { value: "outline", label: "Outline" },
                          ]}
                          size="sm"
                        />
                      </div>
                      <div>
                        <Label>Icon</Label>
                        <Input
                          value={cta.icon || ""}
                          onChange={(e) => updateCTA(index, { icon: e.target.value })}
                          placeholder="e.g., heart, arrow-right"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Visible</Label>
                      <Switch
                        checked={cta.visible}
                        onCheckedChange={(checked) => updateCTA(index, { visible: checked })}
                      />
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">Preview:</p>
                      <Button
                        variant={cta.variant === "primary" ? "default" : cta.variant === "secondary" ? "secondary" : "outline"}
                        disabled
                      >
                        {cta.label}
                      </Button>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCTA(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button onClick={addCTA} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add CTA Button
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
