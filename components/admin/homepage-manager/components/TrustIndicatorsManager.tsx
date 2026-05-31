"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2 } from "lucide-react"
import type { HomepageTrustIndicators, TrustIndicator } from "@/lib/types/homepage-settings"

interface TrustIndicatorsManagerProps {
  trustIndicators: HomepageTrustIndicators
  onChange: (trustIndicators: HomepageTrustIndicators) => void
}

export default function TrustIndicatorsManager({ trustIndicators, onChange }: TrustIndicatorsManagerProps) {
  const addIndicator = () => {
    const newIndicator: TrustIndicator = {
      id: `indicator-${Date.now()}`,
      icon: "check",
      text: "New Indicator",
      subtext: "Description",
      order: trustIndicators.indicators.length + 1,
      visible: true,
    }
    onChange({
      ...trustIndicators,
      indicators: [...trustIndicators.indicators, newIndicator]
    })
  }

  const updateIndicator = (index: number, updates: Partial<TrustIndicator>) => {
    const newIndicators = [...trustIndicators.indicators]
    newIndicators[index] = { ...newIndicators[index], ...updates }
    onChange({ ...trustIndicators, indicators: newIndicators })
  }

  const deleteIndicator = (index: number) => {
    const newIndicators = trustIndicators.indicators.filter((_, i) => i !== index)
    onChange({ ...trustIndicators, indicators: newIndicators })
  }

  const updateMicroCopy = (field: keyof typeof trustIndicators.microCopy, value: string) => {
    onChange({
      ...trustIndicators,
      microCopy: { ...trustIndicators.microCopy, [field]: value }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Trust Indicators</CardTitle>
          <CardDescription>
            Manage trust badges and micro-copy displayed under the hero section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <Label className="font-medium">Enable Trust Indicators</Label>
            <Switch
              checked={trustIndicators.enabled}
              onCheckedChange={(checked) => onChange({ ...trustIndicators, enabled: checked })}
            />
          </div>

          {/* Indicators */}
          {trustIndicators.enabled && (
            <>
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Trust Badges</h3>
                {trustIndicators.indicators.map((indicator, index) => (
                  <Card key={indicator.id}>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Icon</Label>
                              <Input
                                value={indicator.icon}
                                onChange={(e) => updateIndicator(index, { icon: e.target.value })}
                                placeholder="e.g., shield-check"
                                className="mt-1"
                              />
                            </div>
                            <div className="flex items-end">
                              <div className="flex-1">
                                <Label>Visible</Label>
                                <div className="mt-1">
                                  <Switch
                                    checked={indicator.visible}
                                    onCheckedChange={(checked) => updateIndicator(index, { visible: checked })}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Label>Text</Label>
                            <Input
                              value={indicator.text}
                              onChange={(e) => updateIndicator(index, { text: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Subtext</Label>
                            <Input
                              value={indicator.subtext}
                              onChange={(e) => updateIndicator(index, { subtext: e.target.value })}
                              className="mt-1"
                            />
                          </div>

                          {/* Preview */}
                          <div className="p-3 bg-green-50 rounded-lg text-center">
                            <p className="font-bold text-gray-900">{indicator.text}</p>
                            <p className="text-xs text-gray-600">{indicator.subtext}</p>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteIndicator(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button onClick={addIndicator} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Trust Badge
                </Button>
              </div>

              {/* Micro-copy */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Micro-copy</CardTitle>
                  <CardDescription>Short text snippets displayed near trust indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Hero Subtext</Label>
                    <Input
                      value={trustIndicators.microCopy.heroSubtext}
                      onChange={(e) => updateMicroCopy('heroSubtext', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Trust Badge Text</Label>
                    <Input
                      value={trustIndicators.microCopy.trustBadgeText}
                      onChange={(e) => updateMicroCopy('trustBadgeText', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Impact Promise</Label>
                    <Input
                      value={trustIndicators.microCopy.impactPromise}
                      onChange={(e) => updateMicroCopy('impactPromise', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
