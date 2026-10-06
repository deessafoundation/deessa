"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FancySelect } from "@/components/ui/fancy-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Save,
  Loader2,
  Sparkles,
  CheckCircle2,
  Users,
  LayoutGrid,
} from "lucide-react"
import { FormSchema } from "@/lib/types/conference-form-schema"
import {
  getEventFormTemplates,
  saveEventFormAsTemplate,
  applyEventTemplateToEvent,
  getEventTemplateCategories,
  type EventFormTemplate,
} from "@/lib/actions/events-module/event-form-templates"
import { notifications } from "@/lib/notifications"

interface FormTemplateChooserProps {
  eventId: string
  currentSchema: FormSchema
  onApplyTemplate: (template: FormSchema) => void
}

export function FormTemplateChooser({
  eventId,
  currentSchema,
  onApplyTemplate,
}: FormTemplateChooserProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<EventFormTemplate[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedTemplate, setSelectedTemplate] = useState<EventFormTemplate | null>(null)

  const [savingTemplate, setSavingTemplate] = useState(false)
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [templateCategory, setTemplateCategory] = useState("")
  const [templateIsPublic, setTemplateIsPublic] = useState(false)

  useEffect(() => {
    if (open) {
      loadTemplates()
      loadCategories()
    }
  }, [open])

  const loadTemplates = async () => {
    setLoading(true)
    const result = await getEventFormTemplates()
    if (result.success) {
      setTemplates(result.data || [])
    } else {
      notifications.showError({ description: result.error || "Failed to load templates" })
    }
    setLoading(false)
  }

  const loadCategories = async () => {
    const result = await getEventTemplateCategories()
    if (result.success && result.data) {
      setCategories(result.data)
    }
  }

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return
    setLoading(true)

    const result = await applyEventTemplateToEvent({
      templateId: selectedTemplate.id,
      eventId,
      activate: false,
    })

    if (result.success) {
      onApplyTemplate(selectedTemplate.formConfig)
      notifications.showSuccess({
        title: "Template Applied",
        description: `"${selectedTemplate.name}" has been loaded into the builder.`,
      })
      setOpen(false)
      setSelectedTemplate(null)
    } else {
      notifications.showError({ description: result.error || "Failed to apply template" })
    }

    setLoading(false)
  }

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      notifications.showError({ description: "Please enter a template name" })
      return
    }

    setSavingTemplate(true)

    const result = await saveEventFormAsTemplate({
      name: templateName,
      description: templateDescription || undefined,
      category: templateCategory || undefined,
      isPublic: templateIsPublic,
      formConfig: currentSchema,
    })

    if (result.success) {
      notifications.showSuccess({
        title: "Template Saved",
        description: `"${templateName}" is now available for reuse.`,
      })
      setTemplateName("")
      setTemplateDescription("")
      setTemplateCategory("")
      setTemplateIsPublic(false)
      setLastSavedJson(JSON.stringify(currentSchema))
      loadTemplates()
    } else {
      notifications.showError({ description: result.error || "Failed to save template" })
    }

    setSavingTemplate(false)
  }

  const filteredTemplates =
    selectedCategory === "all"
      ? templates
      : templates.filter((t) => t.category === selectedCategory)

  const totalFields = currentSchema.steps.reduce((acc, step) => acc + step.fields.length, 0)

  // Category color map
  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    general: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" },
    conference: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
    workshop: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
    webinar: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200" },
    volunteer: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
    fundraiser: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
    community: { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-200" },
    feedback: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
    team: { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200" },
    partnership: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
    vip: { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-200" },
    youth: { bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-200" },
    health: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
    training: { bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-200" },
  }

  const getCategoryStyle = (category: string) => {
    return categoryColors[category] || categoryColors.general
  }

  // Track if schema has changed since last save
  const [lastSavedJson, setLastSavedJson] = useState(() => JSON.stringify(currentSchema))
  const hasChanges = useMemo(() => JSON.stringify(currentSchema) !== lastSavedJson, [currentSchema, lastSavedJson])

  // Update last saved after successful save
  useEffect(() => {
    if (!open) {
      setLastSavedJson(JSON.stringify(currentSchema))
    }
  }, [open, currentSchema])

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-black/50 hover:bg-primary/10 hover:text-primary hover:border-primary/20 border border-transparent transition-all"
            title="Form Templates"
          >
            <LayoutGrid className="size-3.5" />
            Templates
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-xl h-[75vh] flex flex-col overflow-hidden p-0 pb-4">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <DialogTitle className="text-lg">Form Templates</DialogTitle>
            <DialogDescription className="text-sm">
              Choose a template or save your current form for reuse.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="browse" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-2 h-10 bg-gray-100/80 p-0.5">
                <TabsTrigger
                  value="browse"
                  className="text-xs font-medium rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-gray-200/60 data-[state=active]:hover:bg-primary"
                >
                  Browse
                </TabsTrigger>
                <TabsTrigger
                  value="save"
                  className="text-xs font-medium rounded-lg transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-gray-200/60 data-[state=active]:hover:bg-primary"
                >
                  Save Current
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Browse Tab */}
            <TabsContent value="browse" className="px-6 mt-4 space-y-3 flex-1 flex flex-col overflow-hidden">
              <FancySelect
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                placeholder="All categories"
                options={[
                  { value: "all", label: "All categories" },
                  ...categories.map((cat) => ({ value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1) })),
                ]}
                size="sm"
              />

              <ScrollArea className="flex-1 min-h-0 -mx-1 px-1">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 rounded-xl border-2 border-gray-100 bg-gray-50/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded-md w-1/3 animate-pulse" />
                            <div className="h-3 bg-gray-100 rounded-md w-2/3 animate-pulse" />
                            <div className="flex gap-3 mt-2">
                              <div className="h-2.5 bg-gray-100 rounded w-12 animate-pulse" />
                              <div className="h-2.5 bg-gray-100 rounded w-16 animate-pulse" />
                            </div>
                          </div>
                          <div className="size-6 bg-gray-100 rounded-full animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-gray-100 mb-3">
                      <FileText className="size-5 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-black/60">No templates found</p>
                    <p className="text-xs text-black/30 mt-1">Save your current form as a template to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          selectedTemplate?.id === template.id
                            ? "border-primary bg-primary/[0.03] shadow-sm"
                            : "border-gray-200 hover:border-primary/30 hover:bg-primary/[0.02] bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <h4 className="text-sm font-semibold text-black truncate">{template.name}</h4>
                              {template.isPublic && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary shrink-0">
                                  <Users className="size-2.5" />
                                  Public
                                </span>
                              )}
                            </div>
                            {template.description && (
                              <p className="text-xs text-black/40 mb-2 line-clamp-2">{template.description}</p>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] text-black/30">{template.formConfig.steps.length} steps</span>
                              <span className="text-[10px] text-black/30">·</span>
                              <span className="text-[10px] text-black/30">{template.formConfig.steps.reduce((n, s) => n + s.fields.length, 0)} fields</span>
                              {template.category && (() => {
                                const style = getCategoryStyle(template.category)
                                return (
                                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${style.bg} ${style.text} ${style.border}`}>
                                    {template.category}
                                  </span>
                                )
                              })()}
                            </div>
                          </div>
                          {selectedTemplate?.id === template.id && (
                            <div className="flex size-6 items-center justify-center rounded-full bg-primary shrink-0">
                              <CheckCircle2 className="size-4 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="pt-3 pb-1">
                <Button
                  onClick={handleApplyTemplate}
                  disabled={!selectedTemplate || loading}
                  className="w-full gap-2"
                  size="sm"
                >
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  Apply Template
                </Button>
              </div>
            </TabsContent>

            {/* Save Tab */}
            <TabsContent value="save" className="flex-1 flex flex-col overflow-hidden px-6 mt-4">
              <div className="flex-1 space-y-4 overflow-y-auto -mx-1 px-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-black/50">Template Name *</Label>
                  <Input
                    placeholder="e.g., Workshop Registration"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-black/50">Description</Label>
                  <Textarea
                    placeholder="What is this template for?"
                    rows={2}
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    className="text-sm resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-black/50">Category</Label>
                  <Input
                    placeholder="e.g., workshop, seminar, networking"
                    value={templateCategory}
                    onChange={(e) => setTemplateCategory(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <input
                    type="checkbox"
                    id="template-public"
                    checked={templateIsPublic}
                    onChange={(e) => setTemplateIsPublic(e.target.checked)}
                    className="rounded size-4"
                  />
                  <Label htmlFor="template-public" className="text-xs text-black/60 cursor-pointer">
                    Make available to all admins
                  </Label>
                </div>

                <div className="p-3 rounded-lg bg-primary/[0.03] border border-primary/10">
                  <p className="text-[10px] font-semibold text-black/40 uppercase tracking-wider mb-1.5">Current Form</p>
                  <div className="flex gap-4 text-xs text-black/50">
                    <span>{currentSchema.steps.length} steps</span>
                    <span>{totalFields} fields</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 pb-1 space-y-2">
                {!hasChanges && (
                  <p className="text-[10px] text-black/30 text-center">
                    Make changes to your form first, then save as a template.
                  </p>
                )}
                <Button
                  onClick={handleSaveAsTemplate}
                  disabled={!templateName.trim() || savingTemplate || !hasChanges}
                  className="w-full gap-2"
                  size="sm"
                >
                  {savingTemplate ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save as Template
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}
