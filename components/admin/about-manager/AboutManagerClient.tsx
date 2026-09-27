"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { notifications } from "@/lib/notifications"
import { Save, RotateCcw, Eye, Users, Heart, Footprints, Plus, Trash2, Milestone } from "lucide-react"
import type { AboutPageSettings } from "@/lib/types/about-settings"

interface AboutManagerClientProps {
  initialSettings: AboutPageSettings
  userId: string
}

export default function AboutManagerClient({ initialSettings, userId }: AboutManagerClientProps) {
  const [settings, setSettings] = useState<AboutPageSettings>(initialSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const update = (updater: (prev: AboutPageSettings) => AboutPageSettings) => {
    setSettings(updater)
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    const loadingToast = notifications.showLoading({
      title: "Saving...",
      description: "Updating About page settings...",
      duration: 0,
    })
    try {
      const response = await fetch("/api/admin/about-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, userId }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to save settings")
      }
      notifications.dismiss()
      notifications.showSuccess({
        title: "✅ Saved successfully",
        description: "About page settings have been updated.",
        duration: 4000,
      })
      setHasChanges(false)
    } catch (error) {
      notifications.dismiss()
      notifications.showError({
        title: "❌ Save failed",
        description: error instanceof Error ? error.message : "Could not save About page settings.",
        duration: 5000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(initialSettings)
    setHasChanges(false)
    notifications.showInfo({
      title: "🔄 Changes discarded",
      description: "All unsaved changes have been reset to the last saved state.",
      duration: 3000,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">About Page Manager</h1>
              <p className="text-sm text-slate-600">
                Manage the "Who We Are" page — Hero, Intro, How We Do It, and Journey sections
              </p>
            </div>
            <div className="flex items-center gap-3">
              {hasChanges && (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mr-2 animate-pulse" />
                  Unsaved changes
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={handleReset} disabled={!hasChanges || isSaving} className="hidden sm:flex">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open("/about", "_blank")}>
                <Eye className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!hasChanges || isSaving} className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md">
                <Save className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save Changes"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Team members and partner logos are managed separately — see{" "}
              <a href="/admin/team" className="underline font-medium">Team</a> and{" "}
              <a href="/admin/partners" className="underline font-medium">Partners</a> in the sidebar.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="hero">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 gap-2 bg-transparent h-auto p-0 mb-6">
            <TabsTrigger value="hero" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Hero
            </TabsTrigger>
            <TabsTrigger value="intro" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Who We Are
            </TabsTrigger>
            <TabsTrigger value="howWeDoIt" className="flex items-center gap-2">
              <Footprints className="w-4 h-4" />
              How We Do It
            </TabsTrigger>
            <TabsTrigger value="journey" className="flex items-center gap-2">
              <Milestone className="w-4 h-4" />
              Our Journey
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hero" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>The full-bleed banner at the top of the About page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Badge Text</Label>
                  <Input
                    value={settings.hero.badge}
                    onChange={(e) => update((p) => ({ ...p, hero: { ...p.hero, badge: e.target.value } }))}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Headline Line 1</Label>
                    <Input
                      value={settings.hero.headlineLine1}
                      onChange={(e) => update((p) => ({ ...p, hero: { ...p.hero, headlineLine1: e.target.value } }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Headline Line 2</Label>
                    <Input
                      value={settings.hero.headlineLine2}
                      onChange={(e) => update((p) => ({ ...p, hero: { ...p.hero, headlineLine2: e.target.value } }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Textarea
                    value={settings.hero.subtitle}
                    onChange={(e) => update((p) => ({ ...p, hero: { ...p.hero, subtitle: e.target.value } }))}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primary Button Label</Label>
                    <Input
                      value={settings.hero.primaryCtaLabel}
                      onChange={(e) => update((p) => ({ ...p, hero: { ...p.hero, primaryCtaLabel: e.target.value } }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Primary Button Link</Label>
                    <Input
                      value={settings.hero.primaryCtaUrl}
                      onChange={(e) => update((p) => ({ ...p, hero: { ...p.hero, primaryCtaUrl: e.target.value } }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Secondary Button Label</Label>
                    <Input
                      value={settings.hero.secondaryCtaLabel}
                      onChange={(e) => update((p) => ({ ...p, hero: { ...p.hero, secondaryCtaLabel: e.target.value } }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Secondary Button Link</Label>
                    <Input
                      value={settings.hero.secondaryCtaUrl}
                      onChange={(e) => update((p) => ({ ...p, hero: { ...p.hero, secondaryCtaUrl: e.target.value } }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Trust Badges (comma-separated)</Label>
                  <Input
                    value={settings.hero.trustBadges.join(", ")}
                    onChange={(e) =>
                      update((p) => ({
                        ...p,
                        hero: { ...p.hero, trustBadges: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) },
                      }))
                    }
                    placeholder="Govt Registered, SWC Affiliated"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="intro" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Who We Are Section</CardTitle>
                <CardDescription>The intro block with photo, headline, and story paragraphs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Photo Badge Text</Label>
                    <Input
                      value={settings.intro.sinceBadge}
                      onChange={(e) => update((p) => ({ ...p, intro: { ...p.intro, sinceBadge: e.target.value } }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Eyebrow Label</Label>
                    <Input
                      value={settings.intro.label}
                      onChange={(e) => update((p) => ({ ...p, intro: { ...p.intro, label: e.target.value } }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Headline</Label>
                  <Textarea
                    value={settings.intro.headline}
                    onChange={(e) => update((p) => ({ ...p, intro: { ...p.intro, headline: e.target.value } }))}
                    rows={2}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Paragraphs</Label>
                  <div className="space-y-3 mt-1">
                    {settings.intro.paragraphs.map((para, i) => (
                      <div key={i} className="flex gap-2">
                        <Textarea
                          value={para}
                          onChange={(e) =>
                            update((p) => {
                              const paragraphs = [...p.intro.paragraphs]
                              paragraphs[i] = e.target.value
                              return { ...p, intro: { ...p.intro, paragraphs } }
                            })
                          }
                          rows={3}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            update((p) => ({
                              ...p,
                              intro: { ...p.intro, paragraphs: p.intro.paragraphs.filter((_, idx) => idx !== i) },
                            }))
                          }
                          className="text-red-600 hover:text-red-700 self-start"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => update((p) => ({ ...p, intro: { ...p.intro, paragraphs: [...p.intro.paragraphs, ""] } }))}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Paragraph
                  </Button>
                </div>
                <div>
                  <Label>Highlighted Quote</Label>
                  <Textarea
                    value={settings.intro.quote}
                    onChange={(e) => update((p) => ({ ...p, intro: { ...p.intro, quote: e.target.value } }))}
                    rows={2}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Flow Steps (comma-separated)</Label>
                  <Input
                    value={settings.intro.flowSteps.join(", ")}
                    onChange={(e) =>
                      update((p) => ({
                        ...p,
                        intro: { ...p.intro, flowSteps: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) },
                      }))
                    }
                    placeholder="Understood, Accepted, Valued, Thrive"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="howWeDoIt" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>How We Do It Section</CardTitle>
                <CardDescription>The 4-step process shown between "Who We Are" and "Our Journey".</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Section Title</Label>
                  <Textarea
                    value={settings.howWeDoIt.title}
                    onChange={(e) => update((p) => ({ ...p, howWeDoIt: { ...p.howWeDoIt, title: e.target.value } }))}
                    rows={2}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Section Subtitle</Label>
                  <Textarea
                    value={settings.howWeDoIt.subtitle}
                    onChange={(e) => update((p) => ({ ...p, howWeDoIt: { ...p.howWeDoIt, subtitle: e.target.value } }))}
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div className="space-y-4">
                  {settings.howWeDoIt.steps.map((step, i) => (
                    <Card key={step.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Step {i + 1}: {step.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={step.title}
                            onChange={(e) =>
                              update((p) => {
                                const steps = [...p.howWeDoIt.steps]
                                steps[i] = { ...steps[i], title: e.target.value }
                                return { ...p, howWeDoIt: { ...p.howWeDoIt, steps } }
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Body</Label>
                          <Textarea
                            value={step.body}
                            onChange={(e) =>
                              update((p) => {
                                const steps = [...p.howWeDoIt.steps]
                                steps[i] = { ...steps[i], body: e.target.value }
                                return { ...p, howWeDoIt: { ...p.howWeDoIt, steps } }
                              })
                            }
                            rows={2}
                            className="mt-1"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div>
                  <Label>Closing Line</Label>
                  <Textarea
                    value={settings.howWeDoIt.closingLine}
                    onChange={(e) => update((p) => ({ ...p, howWeDoIt: { ...p.howWeDoIt, closingLine: e.target.value } }))}
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="journey" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Our Journey</CardTitle>
                <CardDescription>Manage the milestones displayed on the About page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Eyebrow Label</Label>
                    <Input
                      value={settings.journey.label}
                      onChange={(e) => update((p) => ({ ...p, journey: { ...p.journey, label: e.target.value } }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={settings.journey.title}
                      onChange={(e) => update((p) => ({ ...p, journey: { ...p.journey, title: e.target.value } }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Section Subtitle</Label>
                  <Textarea
                    value={settings.journey.subtitle}
                    onChange={(e) => update((p) => ({ ...p, journey: { ...p.journey, subtitle: e.target.value } }))}
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div className="space-y-4">
                  {settings.journey.milestones.map((milestone, index) => (
                    <Card key={milestone.id} className="border-slate-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-4">
                          <CardTitle className="text-base">Milestone {index + 1}</CardTitle>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label={`Remove milestone ${index + 1}`}
                            className="text-red-600 hover:text-red-700"
                            onClick={() => update((p) => ({
                              ...p,
                              journey: { ...p.journey, milestones: p.journey.milestones.filter((_, itemIndex) => itemIndex !== index) },
                            }))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-[140px_1fr]">
                          <div>
                            <Label>Year</Label>
                            <Input
                              value={milestone.year}
                              onChange={(e) => update((p) => {
                                const milestones = [...p.journey.milestones]
                                milestones[index] = { ...milestones[index], year: e.target.value }
                                return { ...p, journey: { ...p.journey, milestones } }
                              })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Milestone Title</Label>
                            <Input
                              value={milestone.title}
                              onChange={(e) => update((p) => {
                                const milestones = [...p.journey.milestones]
                                milestones[index] = { ...milestones[index], title: e.target.value }
                                return { ...p, journey: { ...p, milestones } }
                              })}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={milestone.description}
                            onChange={(e) => update((p) => {
                              const milestones = [...p.journey.milestones]
                              milestones[index] = { ...milestones[index], description: e.target.value }
                              return { ...p, journey: { ...p.journey, milestones } }
                            })}
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label>Image URL</Label>
                            <Input
                              value={milestone.image || ""}
                              onChange={(e) => update((p) => {
                                const milestones = [...p.journey.milestones]
                                milestones[index] = { ...milestones[index], image: e.target.value }
                                return { ...p, journey: { ...p.journey, milestones } }
                              })}
                              placeholder="/about/journey/milestone.jpg"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Image Alt Text</Label>
                            <Input
                              value={milestone.imageAlt || ""}
                              onChange={(e) => update((p) => {
                                const milestones = [...p.journey.milestones]
                                milestones[index] = { ...milestones[index], imageAlt: e.target.value }
                                return { ...p, journey: { ...p.journey, milestones } }
                              })}
                              placeholder="Describe the image for accessibility"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Source URL</Label>
                          <Input
                            value={milestone.sourceUrl || ""}
                            onChange={(e) => update((p) => {
                              const milestones = [...p.journey.milestones]
                              milestones[index] = { ...milestones[index], sourceUrl: e.target.value }
                              return { ...p, journey: { ...p.journey, milestones } }
                            })}
                            placeholder="https://www.facebook.com/..."
                            className="mt-1"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => update((p) => ({
                    ...p,
                    journey: {
                      ...p.journey,
                      milestones: [
                        ...p.journey.milestones,
                        {
                          id: `journey-${Date.now()}`,
                          year: new Date().getFullYear().toString(),
                          title: "New milestone",
                          description: "Describe this milestone.",
                          image: "",
                          imageAlt: "",
                          sourceUrl: "",
                        },
                      ],
                    },
                  }))}
                >
                  <Plus className="mr-2 w-4 h-4" />
                  Add Milestone
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
