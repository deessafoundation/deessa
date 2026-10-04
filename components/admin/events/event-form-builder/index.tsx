"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Undo2,
  Redo2,
  Save,
  FileText,
  Eye,
  Loader2,
  Sparkles,
} from "lucide-react"
import { FIELD_REGISTRY, type FieldProps } from "@/components/conference/fields"
import { FieldPalette } from "./field-palette"
import { FormCanvas } from "./form-canvas"
import { FormTemplateChooser } from "@/components/admin/conference/form-builder/form-template-chooser"
import { SchemaImportExport } from "./schema-import-export"
import { FieldPropertiesPanel } from "./field-properties-panel"
import { useBuilderState } from "./use-builder-state"
import { findField, findFieldStep } from "./builder-actions"
import type { FormSchema, FieldType } from "@/lib/types/conference-form-schema"
import { createFormSchema } from "@/lib/actions/events-module/event-form-schema"
import { notifications } from "@/lib/notifications"

interface EventFormBuilderProps {
  eventId: string
  initialSchema: FormSchema
  onSchemaSaved?: (schema: FormSchema) => void
}

export function EventFormBuilder({ eventId, initialSchema, onSchemaSaved }: EventFormBuilderProps) {
  const router = useRouter()
  const {
    schema,
    canUndo,
    canRedo,
    totalFields,
    addField,
    removeField,
    updateField,
    reorderFields,
    moveFieldToStep,
    duplicateField,
    addStep,
    removeStep,
    updateStep,
    reorderSteps,
    setSchema,
    undo,
    redo,
  } = useBuilderState(initialSchema)

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(
    new Set(initialSchema.steps.map((s) => s.id))
  )
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    initialSchema.steps[0]?.id ?? null
  )
  const [savingAction, setSavingAction] = useState<"draft" | "publish" | null>(null)
  const [view, setView] = useState<"builder" | "preview">("builder")
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [previewData, setPreviewData] = useState<Record<string, unknown>>({})
  const [previewErrors, setPreviewErrors] = useState<Record<string, string>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const lastSavedSchemaRef = useRef(initialSchema)

  // Track unsaved changes
  useEffect(() => {
    const changed = JSON.stringify(schema) !== JSON.stringify(lastSavedSchemaRef.current)
    setHasUnsavedChanges(changed)
  }, [schema])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't fire when typing in inputs
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return

      // Delete selected field
      if ((e.key === "Delete" || e.key === "Backspace") && selectedFieldId) {
        e.preventDefault()
        const step = findFieldStep(schema, selectedFieldId)
        if (step) {
          removeField(step.id, selectedFieldId)
          setSelectedFieldId(null)
        }
      }

      // Duplicate selected field (Ctrl+D)
      if ((e.metaKey || e.ctrlKey) && e.key === "d" && selectedFieldId) {
        e.preventDefault()
        const step = findFieldStep(schema, selectedFieldId)
        if (step) {
          duplicateField(step.id, selectedFieldId)
        }
      }

      // Escape to deselect
      if (e.key === "Escape") {
        setSelectedFieldId(null)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedFieldId, schema, removeField, duplicateField])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)
      const { active, over } = event
      if (!over || active.id === over.id) return

      const activeIdStr = active.id as string
      const overIdStr = over.id as string

      // Check if we're dragging a field
      const activeField = findField(schema, activeIdStr)
      if (activeField) {
        const activeStep = findFieldStep(schema, activeIdStr)
        if (!activeStep) return

        // Check if dropping on a step's field list area
        if (overIdStr.startsWith("step-fields-")) {
          const targetStepId = overIdStr.replace("step-fields-", "")
          if (targetStepId !== activeStep.id) {
            moveFieldToStep(activeStep.id, targetStepId, activeIdStr)
            return
          }
        }

        // Check if dropping on another field
        const overField = findField(schema, overIdStr)
        if (overField) {
          const overStep = findFieldStep(schema, overIdStr)
          if (!overStep) return

          if (activeStep.id === overStep.id) {
            // Same step — reorder
            const oldIndex = activeStep.fields.findIndex((f) => f.id === activeIdStr)
            const newIndex = overStep.fields.findIndex((f) => f.id === overIdStr)
            if (oldIndex !== newIndex) {
              reorderFields(activeStep.id, oldIndex, newIndex)
            }
          } else {
            // Different steps — move
            const newIndex = overStep.fields.findIndex((f) => f.id === overIdStr)
            moveFieldToStep(activeStep.id, overStep.id, activeIdStr, newIndex)
          }
          return
        }
      }

      // Check if we're dragging a step
      const activeStepIdx = schema.steps.findIndex((s) => s.id === activeIdStr)
      if (activeStepIdx !== -1) {
        const overStepIdx = schema.steps.findIndex((s) => s.id === overIdStr)
        if (overStepIdx !== -1 && activeStepIdx !== overStepIdx) {
          reorderSteps(activeStepIdx, overStepIdx)
        }
      }
    },
    [schema, reorderFields, moveFieldToStep, reorderSteps]
  )

  const toggleExpand = useCallback((stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(stepId)) {
        next.delete(stepId)
      } else {
        next.add(stepId)
      }
      return next
    })
  }, [])

  const handleAddField = useCallback(
    (type: FieldType) => {
      // Use selected step, or fall back to first step
      const targetStep =
        schema.steps.find((s) => s.id === selectedStepId) ||
        schema.steps[0]
      if (!targetStep) return
      addField(targetStep.id, type)
      // Expand the step if not already
      if (!expandedSteps.has(targetStep.id)) {
        toggleExpand(targetStep.id)
      }
    },
    [schema.steps, selectedStepId, expandedSteps, addField, toggleExpand]
  )

  const handleAddStep = useCallback(() => {
    addStep()
    // Auto-expand the new step
    const newStepId = schema.steps.length // approximate
    setTimeout(() => {
      setExpandedSteps((prev) => {
        const next = new Set(prev)
        // The new step will be the last one
        next.add(`step_${Date.now()}`)
        return next
      })
    }, 50)
  }, [addStep, schema.steps.length])

  // Auto-expand step when field is added
  const handleAddFieldWithExpand = useCallback(
    (type: FieldType) => {
      handleAddField(type)
    },
    [handleAddField]
  )

  async function handleSave(publish: boolean) {
    setSavingAction(publish ? "publish" : "draft")
    const result = await createFormSchema(eventId, schema, publish)
    if (result.error) {
      notifications.showError({ description: result.error })
    } else {
      lastSavedSchemaRef.current = schema
      setHasUnsavedChanges(false)
      onSchemaSaved?.(schema)
      notifications.showSuccess({
        title: publish ? "Form Published" : "Draft Saved",
        description: publish
          ? "Your form is now live for registrants."
          : "Changes saved as draft.",
      })
    }
    setSavingAction(null)
  }

  const selectedField = selectedFieldId ? findField(schema, selectedFieldId) ?? null : null
  const selectedFieldStep = selectedFieldId ? findFieldStep(schema, selectedFieldId) : null
  const allFields = schema.steps.flatMap((s) => s.fields)

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
      {/* Action bar */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            v{schema.version}
          </Badge>
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-600 border-amber-200">
              Unsaved
            </Badge>
          )}
          <span className="text-xs text-black/30">
            {schema.steps.length} step{schema.steps.length !== 1 ? "s" : ""} · {totalFields} field{totalFields !== 1 ? "s" : ""}
          </span>

          {/* View toggle */}
          <div className="flex gap-0.5 rounded-lg bg-gray-100 p-0.5 ml-2">
            <button
              onClick={() => setView("builder")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                view === "builder"
                  ? "bg-white text-black shadow-sm"
                  : "text-black/40 hover:text-black/70 hover:bg-white/60"
              }`}
            >
              Builder
            </button>
            <button
              onClick={() => setView("preview")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                view === "preview"
                  ? "bg-white text-black shadow-sm"
                  : "text-black/40 hover:text-black/70 hover:bg-white/60"
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex gap-1 mr-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="flex size-8 items-center justify-center rounded-lg bg-gray-100 text-black/50 hover:bg-gray-200 hover:text-black/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="size-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="flex size-8 items-center justify-center rounded-lg bg-gray-100 text-black/50 hover:bg-gray-200 hover:text-black/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 className="size-4" />
            </button>
          </div>

          {/* Templates */}
          <FormTemplateChooser
            eventId={eventId}
            currentSchema={schema}
            onApplyTemplate={(templateSchema) => {
              setSchema(templateSchema)
            }}
          />

          {/* Import/Export */}
          <SchemaImportExport
            schema={schema}
            onImport={(importedSchema) => {
              setSchema(importedSchema)
            }}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(false)}
            disabled={savingAction !== null}
            className="gap-2 hover:bg-gray-100 hover:text-black transition-colors"
          >
            {savingAction === "draft" ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            Save Draft
          </Button>
          <Button
            size="sm"
            onClick={() => handleSave(true)}
            disabled={savingAction !== null}
            className="gap-2 hover:opacity-90 transition-all"
          >
            {savingAction === "publish" ? <Loader2 className="size-3.5 animate-spin" /> : <FileText className="size-3.5" />}
            Publish
          </Button>
        </div>
      </div>

      {/* Main content */}
      {view === "builder" ? (
        <div className="flex-1 grid grid-cols-[220px_1fr_340px] gap-4 min-h-0 overflow-hidden">
          {/* Left: Field Palette */}
          <div className="overflow-y-auto pr-2 scrollbar-hide">
            <FieldPalette
              onAddField={handleAddFieldWithExpand}
              targetStepId={schema.steps[0]?.id || null}
            />
          </div>

          {/* Center: Form Canvas */}
          <div className="overflow-y-auto scrollbar-hide">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <FormCanvas
                steps={schema.steps}
                selectedFieldId={selectedFieldId}
                selectedStepId={selectedStepId}
                expandedSteps={expandedSteps}
                onSelectField={setSelectedFieldId}
                onSelectStep={setSelectedStepId}
                onUpdateStep={updateStep}
                onRemoveStep={removeStep}
                onRemoveField={(stepId, fieldId) => {
                  removeField(stepId, fieldId)
                  if (selectedFieldId === fieldId) setSelectedFieldId(null)
                }}
                onDuplicateField={duplicateField}
                onMoveFieldToStep={moveFieldToStep}
                onToggleExpand={toggleExpand}
                onAddStep={handleAddStep}
              />
              <DragOverlay>
                {activeId ? (
                  <div className="rounded-lg border border-primary bg-white px-3 py-2.5 shadow-lg opacity-90 text-sm font-medium">
                    {(() => {
                      const field = findField(schema, activeId)
                      return field?.label || "Dragging..."
                    })()}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>

          {/* Right: Field Properties */}
          <div className="overflow-y-auto pl-3 border-l border-gray-100 scrollbar-hide bg-gray-50/50 rounded-xl">
            <FieldPropertiesPanel
              field={selectedField}
              stepId={selectedFieldStep?.id || null}
              steps={schema.steps}
              allFields={allFields}
              onUpdate={updateField}
              onDelete={(stepId, fieldId) => {
                removeField(stepId, fieldId)
                setSelectedFieldId(null)
              }}
            />
          </div>
        </div>
      ) : (
        /* Preview mode */
        <div className="flex-1 overflow-y-auto">
          {/* Device toggle */}
          <div className="flex items-center justify-center gap-1 mb-4">
            {(["desktop", "tablet", "mobile"] as const).map((device) => (
              <button
                key={device}
                onClick={() => setPreviewDevice(device)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  previewDevice === device
                    ? "bg-gray-100 text-black shadow-sm"
                    : "text-black/40 hover:text-black/60"
                }`}
              >
                {device === "desktop" ? "Desktop" : device === "tablet" ? "Tablet" : "Mobile"}
              </button>
            ))}
          </div>

          <div className={`mx-auto py-8 transition-all ${
            previewDevice === "desktop" ? "max-w-2xl" :
            previewDevice === "tablet" ? "max-w-md" :
            "max-w-sm"
          }`}>
            <div className={`rounded-xl border border-gray-200 bg-white shadow-sm transition-all ${
              previewDevice === "mobile" ? "border-4 border-gray-300 rounded-3xl" : "p-8"
            }`}>
              <div className={previewDevice === "mobile" ? "p-4" : ""}>
              <h2 className="text-xl font-bold text-black mb-2">Form Preview</h2>
              <p className="text-sm text-black/40 mb-6">
                This is how registrants will see your form.
              </p>

              {schema.steps.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex size-14 items-center justify-center rounded-full bg-gray-100 mx-auto mb-4">
                    <FileText className="size-6 text-gray-400" />
                  </div>
                  <p className="text-base font-semibold text-black">No steps yet</p>
                  <p className="text-sm text-black/40 mt-1">Add steps and fields in the builder tab.</p>
                </div>
              ) : (
                <div className="space-y-8">
                {schema.steps.map((step, idx) => (
                  <div key={step.id}>
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                      <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-black">{step.label}</h3>
                        {step.description && (
                          <p className="text-xs text-black/40">{step.description}</p>
                        )}
                      </div>
                    </div>

                    {step.fields.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center">
                        <p className="text-xs text-black/30">No fields in this step</p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {step.fields.map((field) => {
                          const FieldComponent = FIELD_REGISTRY[field.type]
                          if (!FieldComponent) return null

                          const fieldProps: FieldProps = {
                            field,
                            value: previewData[field.id] ?? field.defaultValue ?? (
                              field.type === "checkbox" ? [] :
                              field.type === "toggle" ? false :
                              field.type === "rating" ? null :
                              field.type === "slider" ? (field.sliderConfig?.min ?? 0) :
                              field.type === "repeating" ? [] :
                              ""
                            ),
                            error: previewErrors[field.id],
                            onChange: (val) => setPreviewData((prev) => ({ ...prev, [field.id]: val })),
                            onBlur: () => {},
                          }

                          return (
                            <div key={field.id} className={field.width === "half" ? "md:col-span-1" : ""}>
                              <FieldComponent {...fieldProps} />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
