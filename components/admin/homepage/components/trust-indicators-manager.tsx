"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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
  Shield,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Award,
  Heart,
  Users,
  Eye,
  EyeOff,
  type LucideIcon,
} from "lucide-react"
import type { HomepageTrustIndicators, TrustIndicator } from "@/lib/types/homepage-settings"
import { cn } from "@/lib/utils"

interface TrustIndicatorsManagerProps {
  trustIndicators: HomepageTrustIndicators
  onChange: (trustIndicators: HomepageTrustIndicators) => void
}

const TRUST_ICONS: Record<string, LucideIcon> = {
  "shield-check": ShieldCheck,
  check: CheckCircle2,
  lock: Lock,
  award: Award,
  heart: Heart,
  users: Users,
}

const TRUST_ICON_OPTIONS = [
  { value: "shield-check", label: "Shield Check (Verified NGO)" },
  { value: "check", label: "Check Circle (Certified)" },
  { value: "lock", label: "Lock (Secure & Encrypted)" },
  { value: "award", label: "Award (Gov Recognized)" },
  { value: "heart", label: "Heart (100% Transparent)" },
  { value: "users", label: "Users (Community Governed)" },
]

export default function TrustIndicatorsManager({ trustIndicators, onChange }: TrustIndicatorsManagerProps) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const addIndicator = () => {
    const newIndicator: TrustIndicator = {
      id: `indicator-${Date.now()}`,
      icon: "shield-check",
      text: "Government Registered",
      subtext: "SWC Reg #12345 • Nepal",
      order: (trustIndicators.indicators || []).length + 1,
      visible: true,
    }
    onChange({
      ...trustIndicators,
      indicators: [...(trustIndicators.indicators || []), newIndicator],
    })
  }

  const updateIndicator = (index: number, updates: Partial<TrustIndicator>) => {
    const newIndicators = [...(trustIndicators.indicators || [])]
    newIndicators[index] = { ...newIndicators[index], ...updates }
    onChange({ ...trustIndicators, indicators: newIndicators })
  }

  const confirmDelete = () => {
    if (deleteIndex === null) return
    const newIndicators = (trustIndicators.indicators || []).filter((_, i) => i !== deleteIndex)
    onChange({ ...trustIndicators, indicators: newIndicators })
    setDeleteIndex(null)
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newIndicators = [...(trustIndicators.indicators || [])]
    ;[newIndicators[index - 1], newIndicators[index]] = [newIndicators[index], newIndicators[index - 1]]
    onChange({ ...trustIndicators, indicators: newIndicators })
  }

  const moveDown = (index: number) => {
    if (index === (trustIndicators.indicators || []).length - 1) return
    const newIndicators = [...(trustIndicators.indicators || [])]
    ;[newIndicators[index], newIndicators[index + 1]] = [newIndicators[index + 1], newIndicators[index]]
    onChange({ ...trustIndicators, indicators: newIndicators })
  }

  const updateMicroCopy = (field: keyof typeof trustIndicators.microCopy, value: string) => {
    onChange({
      ...trustIndicators,
      microCopy: {
        ...(trustIndicators.microCopy || { heroSubtext: "", trustBadgeText: "", impactPromise: "" }),
        [field]: value,
      },
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Trust Indicators & Transparency Badges
          </CardTitle>
          <CardDescription className="text-xs">
            Manage legal compliance badges, registration numbers, and credibility indicators.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-muted/30">
            <div>
              <Label className="text-sm font-semibold">Enable Trust Indicators Bar</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Display the credibility strip under the hero section.
              </p>
            </div>
            <Switch
              checked={trustIndicators.enabled}
              onCheckedChange={(checked) => onChange({ ...trustIndicators, enabled: checked })}
            />
          </div>

          {trustIndicators.enabled && (
            <div className="space-y-6">
              {/* Badges List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">Credibility Badges</h4>
                  <Button onClick={addIndicator} size="sm" className="h-8 text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Badge
                  </Button>
                </div>

                {(trustIndicators.indicators || []).map((indicator, index) => {
                  const IconComp = TRUST_ICONS[indicator.icon] || ShieldCheck
                  return (
                    <Card
                      key={indicator.id || index}
                      className={cn(
                        "border border-border/80 shadow-sm transition-all",
                        !indicator.visible && "opacity-60 bg-muted/30"
                      )}
                    >
                      <CardHeader className="py-2.5 px-4 bg-muted/30 border-b border-border/50 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <IconComp className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold text-foreground">
                            {indicator.text || "Untitled Badge"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className="h-7 w-7 p-0"
                            aria-label="Move badge up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveDown(index)}
                            disabled={index === (trustIndicators.indicators || []).length - 1}
                            className="h-7 w-7 p-0"
                            aria-label="Move badge down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateIndicator(index, { visible: !indicator.visible })}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            aria-label={indicator.visible ? "Hide badge" : "Show badge"}
                          >
                            {indicator.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteIndex(index)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            aria-label="Delete badge"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs font-medium">Badge Icon</Label>
                            <div className="mt-1">
                              <FancySelect
                                value={indicator.icon}
                                onValueChange={(val) => updateIndicator(index, { icon: val })}
                                options={TRUST_ICON_OPTIONS}
                                size="sm"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Primary Badge Text</Label>
                            <Input
                              value={indicator.text}
                              onChange={(e) => updateIndicator(index, { text: e.target.value })}
                              placeholder="e.g. Registered NGO"
                              className="mt-1 h-9 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium">Subtext / Registration #</Label>
                            <Input
                              value={indicator.subtext}
                              onChange={(e) => updateIndicator(index, { subtext: e.target.value })}
                              placeholder="e.g. SWC Nepal #12345"
                              className="mt-1 h-9 text-xs"
                            />
                          </div>
                        </div>

                        {/* Live Badge Preview */}
                        <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border/60 bg-muted/20">
                          <div className="p-1 rounded bg-card border text-primary">
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-xs">
                            <span className="font-semibold text-foreground">{indicator.text || "Badge Title"}</span>
                            {indicator.subtext && (
                              <span className="text-muted-foreground ml-1.5">• {indicator.subtext}</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Supporting Micro-copy */}
              <Card className="border border-border/70 shadow-none">
                <CardHeader className="py-3 px-4 border-b border-border/50">
                  <CardTitle className="text-sm font-semibold">Supporting Micro-copy</CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-medium">Hero Subtext</Label>
                    <Input
                      value={trustIndicators.microCopy?.heroSubtext || ""}
                      onChange={(e) => updateMicroCopy("heroSubtext", e.target.value)}
                      placeholder="e.g. Trusted by 50+ Partners"
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Trust Badge Header</Label>
                    <Input
                      value={trustIndicators.microCopy?.trustBadgeText || ""}
                      onChange={(e) => updateMicroCopy("trustBadgeText", e.target.value)}
                      placeholder="e.g. 100% Tax Deductible"
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Impact Promise</Label>
                    <Input
                      value={trustIndicators.microCopy?.impactPromise || ""}
                      onChange={(e) => updateMicroCopy("impactPromise", e.target.value)}
                      placeholder="e.g. Audited Financial Statements"
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trust Badge?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &ldquo;{deleteIndex !== null ? trustIndicators.indicators[deleteIndex]?.text : ""}&rdquo;?
              This badge will no longer appear on the public homepage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Badge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
